/**
 * Execution Queue - BullMQ-based job queue for distributed code execution
 * Handles job queuing, processing, and status tracking
 */

const { Queue, Worker, QueueEvents } = require("bullmq");
const axios = require("axios");
const {
  getNextInstance,
  getLeastLoadedInstance,
  markUnhealthy,
  markHealthy,
  incrementJobs,
  decrementJobs,
  getInstanceStats,
} = require("./instanceManager");

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

// Create the execution queue
const executionQueue = new Queue("code-execution", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,
  },
});

// Queue events for real-time monitoring
const queueEvents = new QueueEvents("code-execution", {
  connection: redisConnection,
});

// In-memory SSE clients map (jobId -> response object)
const sseClients = new Map();

/**
 * Execute code on a specific HuggingFace instance
 */
const executeOnInstance = async (instance, jobData) => {
  const { language, code, input, timeLimit, memoryLimit } = jobData;

  const payload = {
    language,
    code,
    input: input || "",
    time_limit: timeLimit || 5,
    memory_limit: memoryLimit || 128,
  };

  try {
    incrementJobs(instance.name);

    const response = await axios.post(`${instance.url}/api/execute`, payload, {
      timeout: (timeLimit + 10) * 1000, // Extra buffer for network
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.CODE_ENGINE_API_KEY || "",
      },
    });

    decrementJobs(instance.name);
    markHealthy(instance.name);

    return {
      success: true,
      instanceUsed: instance.name,
      ...response.data,
    };
  } catch (error) {
    decrementJobs(instance.name);

    // Mark unhealthy on connection errors (not on code execution errors)
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.response?.status >= 500) {
      markUnhealthy(instance.name);
    }

    throw error;
  }
};

/**
 * Process a single test case job
 */
const processJob = async (job) => {
  const { testCaseIndex, totalCases, submissionId } = job.data;
  
  console.log(`[Queue] Processing job ${job.id} (TC ${testCaseIndex + 1}/${totalCases})`);

  // Select instance (prefer least loaded for better distribution)
  const instance = getLeastLoadedInstance();

  try {
    const result = await executeOnInstance(instance, job.data);

    // Notify SSE client if connected
    notifyClient(submissionId, {
      type: "progress",
      testCase: testCaseIndex + 1,
      total: totalCases,
      status: result.status || "completed",
      instanceUsed: instance.name,
    });

    return result;
  } catch (error) {
    console.error(`[Queue] Job ${job.id} failed on ${instance.name}:`, error.message);

    // Try on another instance if available
    const altInstance = getNextInstance();
    if (altInstance.name !== instance.name) {
      console.log(`[Queue] Retrying on ${altInstance.name}...`);
      return executeOnInstance(altInstance, job.data);
    }

    throw error;
  }
};

// Create worker with controlled concurrency
// 3 concurrent jobs per instance × 5 instances = 15 total
const worker = new Worker("code-execution", processJob, {
  connection: redisConnection,
  concurrency: 15,
  limiter: {
    max: 20, // Max 20 jobs per second
    duration: 1000,
  },
});

// Worker event handlers
worker.on("completed", (job, result) => {
  console.log(`[Queue] Job ${job.id} completed on ${result?.instanceUsed || "unknown"}`);
});

worker.on("failed", (job, error) => {
  console.error(`[Queue] Job ${job.id} failed:`, error.message);

  // Notify SSE client of failure
  if (job?.data?.submissionId) {
    notifyClient(job.data.submissionId, {
      type: "error",
      testCase: job.data.testCaseIndex + 1,
      message: error.message,
    });
  }
});

worker.on("error", (error) => {
  console.error("[Queue] Worker error:", error);
});

/**
 * Add a code execution job to the queue
 */
const addExecutionJob = async (jobData) => {
  const job = await executionQueue.add("execute", jobData, {
    priority: jobData.priority || 1,
  });

  console.log(`[Queue] Added job ${job.id} for TC ${jobData.testCaseIndex + 1}`);
  return job;
};

/**
 * Add multiple test case jobs for a submission
 * Returns array of job promises
 */
const addSubmissionJobs = async (submissionData) => {
  const { code, language, testCases, timeLimit, memoryLimit, submissionId, userId } = submissionData;

  const jobs = testCases.map((tc, index) =>
    addExecutionJob({
      code,
      language,
      input: tc.input,
      expectedOutput: tc.output,
      timeLimit,
      memoryLimit,
      submissionId,
      userId,
      testCaseIndex: index,
      totalCases: testCases.length,
    })
  );

  return Promise.all(jobs);
};

/**
 * Get current queue statistics
 */
const getQueueStats = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    executionQueue.getWaitingCount(),
    executionQueue.getActiveCount(),
    executionQueue.getCompletedCount(),
    executionQueue.getFailedCount(),
  ]);

  const instanceStats = getInstanceStats();

  // Estimate wait time: (waiting jobs / healthy instances) * avg execution time
  const avgExecutionTime = 2; // seconds
  const estimatedWait = instanceStats.healthyInstances > 0
    ? Math.ceil((waiting / instanceStats.healthyInstances) * avgExecutionTime)
    : waiting * avgExecutionTime;

  return {
    waiting,
    active,
    completed,
    failed,
    estimatedWaitSeconds: estimatedWait,
    ...instanceStats,
  };
};

/**
 * Register SSE client for real-time updates
 */
const registerSSEClient = (submissionId, res) => {
  sseClients.set(submissionId, res);
  
  // Clean up on connection close
  res.on("close", () => {
    sseClients.delete(submissionId);
  });
};

/**
 * Notify SSE client with update
 */
const notifyClient = (submissionId, data) => {
  const client = sseClients.get(submissionId);
  if (client && !client.writableEnded) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

/**
 * Wait for all jobs with given IDs to complete
 */
const waitForJobs = async (jobIds, timeout = 60000) => {
  const startTime = Date.now();
  const results = new Map();

  return new Promise((resolve, reject) => {
    const checkComplete = async () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error("Job timeout exceeded"));
        return;
      }

      try {
        for (const jobId of jobIds) {
          if (!results.has(jobId)) {
            const job = await executionQueue.getJob(jobId);
            if (job) {
              const state = await job.getState();
              if (state === "completed") {
                results.set(jobId, await job.returnvalue);
              } else if (state === "failed") {
                results.set(jobId, { error: "Job failed", failed: true });
              }
            }
          }
        }

        if (results.size === jobIds.length) {
          resolve(results);
        } else {
          setTimeout(checkComplete, 500);
        }
      } catch (error) {
        reject(error);
      }
    };

    checkComplete();
  });
};

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  console.log("[Queue] Shutting down...");
  await worker.close();
  await executionQueue.close();
  await queueEvents.close();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

module.exports = {
  executionQueue,
  addExecutionJob,
  addSubmissionJobs,
  getQueueStats,
  registerSSEClient,
  notifyClient,
  waitForJobs,
  executeOnInstance,
};
