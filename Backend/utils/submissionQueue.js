const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

// Redis connection (localhost on Oracle instance)
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

// Create submission queue
const submissionQueue = new Queue('code-submissions', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2, // Retry once on failure
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 3600, // Remove after 1 hour
    },
    removeOnFail: {
      count: 100,
      age: 3600,
    },
  },
});

// Track active jobs for load management
let activeJobCount = 0;
const MAX_CONCURRENT_JOBS = 15; // 3 per instance × 5 instances

/**
 * Add a submission job to the queue
 * @returns {Object} { jobId, position, estimatedWait }
 */
async function addSubmissionJob(jobData) {
  const job = await submissionQueue.add('submit-code', jobData, {
    priority: 1, // Higher priority = runs first
  });

  const waiting = await submissionQueue.getWaitingCount();
  const estimatedWait = Math.ceil((waiting * 3) / MAX_CONCURRENT_JOBS); // ~3s per batch of 15

  console.log(`[Queue] Added job ${job.id}, position: ${waiting + 1}, estimated wait: ${estimatedWait}s`);

  return {
    jobId: job.id,
    position: waiting + 1,
    estimatedWait,
  };
}

/**
 * Get job status and results
 */
async function getJobStatus(jobId) {
  const job = await submissionQueue.getJob(jobId);
  if (!job) {
    return { error: 'Job not found' };
  }

  const state = await job.getState();
  
  if (state === 'completed') {
    return {
      status: 'completed',
      result: job.returnvalue,
    };
  } else if (state === 'failed') {
    return {
      status: 'failed',
      error: job.failedReason,
    };
  } else if (state === 'active') {
    return {
      status: 'active',
      message: 'Job is currently executing...',
    };
  } else {
    const waiting = await submissionQueue.getWaitingCount();
    return {
      status: 'waiting',
      position: waiting,
      message: 'Job is waiting in queue...',
    };
  }
}

/**
 * Get overall queue statistics
 */
async function getQueueStats() {
  const waiting = await submissionQueue.getWaitingCount();
  const active = await submissionQueue.getActiveCount();
  const estimatedWaitSeconds = Math.ceil((waiting * 3) / MAX_CONCURRENT_JOBS);

  return {
    waiting,
    active,
    completed: await submissionQueue.getCompletedCount(),
    failed: await submissionQueue.getFailedCount(),
    healthyInstances: 5, // Hardcoded for now
    maxConcurrency: MAX_CONCURRENT_JOBS,
    estimatedWaitSeconds,
    isBusy: active >= MAX_CONCURRENT_JOBS,
  };
}

/**
 * Check if system is busy (should queue new requests)
 * Optimized: only checks active count (not waiting) for faster response
 */
async function shouldQueue() {
  const active = await submissionQueue.getActiveCount();
  const isBusy = active >= MAX_CONCURRENT_JOBS;
  
  console.log(`[Queue] Active: ${active}/${MAX_CONCURRENT_JOBS}, Should queue: ${isBusy}`);
  return isBusy;
}

/**
 * Process a submission job
 * This is called by the worker when a job is ready to execute
 */
async function processSubmissionJob(job) {
  activeJobCount++;
  console.log(`[Queue] Processing job ${job.id}, active jobs: ${activeJobCount}`);

  try {
    const { executeSubmission } = job.data;
    
    // Execute the submission (function passed from controller)
    const result = await executeSubmission();
    
    activeJobCount--;
    console.log(`[Queue] Job ${job.id} completed, active jobs: ${activeJobCount}`);
    
    return result;
  } catch (error) {
    activeJobCount--;
    console.error(`[Queue] Job ${job.id} failed:`, error.message);
    throw error;
  }
}

// Create worker to process jobs
const worker = new Worker('code-submissions', processSubmissionJob, {
  connection: redisConnection,
  concurrency: MAX_CONCURRENT_JOBS, // Process up to 15 jobs concurrently
  limiter: {
    max: 20, // Max 20 jobs per...
    duration: 1000, // ...1 second (rate limiting)
  },
});

worker.on('completed', (job) => {
  console.log(`[Queue] ✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Queue] ❌ Job ${job.id} failed:`, err.message);
});

// Export functions
module.exports = {
  addSubmissionJob,
  getJobStatus,
  getQueueStats,
  shouldQueue,
  activeJobCount: () => activeJobCount,
};
