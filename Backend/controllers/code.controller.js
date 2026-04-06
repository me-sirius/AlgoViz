const axios = require("axios");
const Question = require("../models/question.model");
const Submission = require("../models/submission.model");
const User = require("../models/user.model");
const connectDB = require("../db/db");
const { createSingleSubmission, createRunnerSubmission, checkJudge0Health } = require("../utils/judge0.helper");

// NOTE: executionQueue requires Redis - commented out since we use simple Promise.all for parallel execution
// If you need BullMQ queue features, uncomment and ensure Redis is running
// const {
//   addSubmissionJobs,
//   getQueueStats,
//   registerSSEClient,
//   notifyClient,
//   waitForJobs,
//   executeOnInstance,
// } = require("../utils/executionQueue");

// NOTE: instanceManager is not needed - using simple hardcoded HF_INSTANCES array instead
// const {
//   getLeastLoadedInstance,
//   getInstanceStats,
//   markUnhealthy,
//   incrementJobs,
//   decrementJobs,
// } = require("../utils/instanceManager");
// 1. Import New Google GenAI SDK
const { GoogleGenAI } = require("@google/genai");

// Initialize Google AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =============================================================================
// --- YOUR HUGGING FACE CODE EXECUTION ENGINE ---
// =============================================================================
const CODE_ENGINE_URL =
  process.env.CODE_ENGINE_URL || "https://ratankumar10-code-execution.hf.space";
const CODE_ENGINE_API_KEY = process.env.CODE_ENGINE_API_KEY || "";

// Language mapping for your engine
const LANGUAGE_MAP = {
  javascript: "javascript",
  js: "javascript",
  python: "python",
  py: "python",
  "c++": "cpp",
  cpp: "cpp",
  c: "c",
};

/**
 * Execute single code snippet (for "Run Code" button)
 * Uses: POST /api/execute
 * Response format from engine: { success, data: { verdict, output, error, executionTime, memoryUsed } }
 */
const executeOnEngine = async (
  language,
  code,
  input,
  timeLimit = 5,
  memoryLimit = 128,
) => {
  const mappedLang =
    LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

  const headers = { "Content-Type": "application/json" };
  if (CODE_ENGINE_API_KEY) {
    headers["x-api-key"] = CODE_ENGINE_API_KEY;
  }

  console.log("[Code Engine] Executing single code...");
  console.log("[Code Engine] Request:", {
    url: `${CODE_ENGINE_URL}/api/execute`,
    language: mappedLang,
    codeLength: code?.length,
    inputLength: input?.length,
    timeLimit: Math.min(timeLimit, 10),
    memoryLimit: Math.min(memoryLimit, 256),
  });

  try {
    const response = await axios.post(
      `${CODE_ENGINE_URL}/api/execute`,
      {
        language: mappedLang,
        code: code,
        input: input || "",
        timeLimit: Math.min(timeLimit, 10),
        memoryLimit: Math.min(memoryLimit, 256),
      },
      {
        headers,
        timeout: 60000,
      },
    );

    // Map response from your engine format
    const { success, data } = response.data;

    if (!success) {
      return {
        status: "error",
        output: "",
        error: data?.error || "Execution failed",
        time: 0,
        memory: 0,
      };
    }

    // Map verdict to status
    let status = "success";
    if (data.verdict === "TLE") status = "time_limit_exceeded";
    else if (data.verdict === "MLE") status = "memory_limit_exceeded";
    else if (data.verdict === "RE") status = "runtime_error";
    else if (data.verdict === "CE") status = "compilation_error";
    else if (data.verdict === "OK") status = "success";

    return {
      status,
      output: data.output || "",
      error: data.error || "",
      time: data.executionTime || 0,
      memory: (data.memoryUsed / 1024).toFixed(2), // Convert KB to MB
    };
  } catch (error) {
    console.error("[Code Engine] Execute error:", error.message);
    console.error("[Code Engine] Error details:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error; // Re-throw to be caught by caller
  }
};

/**
 * 5 HuggingFace instances for distributed execution
 * Simple approach: TC 0-2 → instance[0], TC 3-5 → instance[1], etc.
 */
const HF_INSTANCES = [
  "https://ratankumar10-code-execution.hf.space",
  "https://ratan1729-code-execution.hf.space",
  "https://ratan1870-code-execution.hf.space",
  "https://anupkr913563-code-execution.hf.space",
  "https://anupkr9135-code-execution.hf.space",
];

/**
 * Execute code on a specific instance by index
 * Simple distribution: 3 test cases per instance
 */
const executeOnInstance = async (
  instanceIndex,
  language,
  code,
  input,
  timeLimit = 5,
  memoryLimit = 128,
) => {
  const instanceUrl = HF_INSTANCES[instanceIndex % HF_INSTANCES.length];
  const mappedLang = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

  const headers = { "Content-Type": "application/json" };
  if (CODE_ENGINE_API_KEY) {
    headers["x-api-key"] = CODE_ENGINE_API_KEY;
  }

  console.log(`[Instance ${instanceIndex}] Executing on: ${instanceUrl}`);

  try {
    const response = await axios.post(
      `${instanceUrl}/api/execute`,
      {
        language: mappedLang,
        code: code,
        input: input || "",
        timeLimit: Math.min(timeLimit, 10),
        memoryLimit: Math.min(memoryLimit, 256),
      },
      {
        headers,
        timeout: 60000,
      },
    );

    const { success, data } = response.data;

    if (!success) {
      return {
        status: "error",
        output: "",
        error: data?.error || "Execution failed",
        time: 0,
        memory: 0,
        instanceUsed: `instance${instanceIndex}`,
      };
    }

    let status = "success";
    if (data.verdict === "TLE") status = "time_limit_exceeded";
    else if (data.verdict === "MLE") status = "memory_limit_exceeded";
    else if (data.verdict === "RE") status = "runtime_error";
    else if (data.verdict === "CE") status = "compilation_error";
    else if (data.verdict === "OK") status = "success";

    return {
      status,
      output: data.output || "",
      error: data.error || "",
      time: data.executionTime || 0,
      memory: (data.memoryUsed / 1024).toFixed(2),
      instanceUsed: `instance${instanceIndex}`,
    };
  } catch (error) {
    console.error(`[Instance ${instanceIndex}] Error:`, error.message);
    throw error;
  }
};

/**
 * Execute code with multiple test cases (for "Submit" button)
 * Uses: POST /api/batch-judge
 * KEY FEATURE: Compiles ONCE, runs all test cases
 *
 * Engine expects: { submissions: [{ language, code, testCases: [{input, expectedOutput}] }] }
 * Engine returns: { success, data: { results: [{ overallVerdict, results: [{verdict, ...}] }] } }
 */
const executeOnEngineBatch = async (
  language,
  code,
  testCases,
  timeLimit = 5,
  memoryLimit = 128,
) => {
  const mappedLang =
    LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

  const headers = { "Content-Type": "application/json" };
  if (CODE_ENGINE_API_KEY) {
    headers["x-api-key"] = CODE_ENGINE_API_KEY;
  }

  console.log(
    `[Code Engine] Batch judge: ${testCases.length} test cases (compile once)`,
  );

  // Format for YOUR engine: submissions array with testCases inside
  const response = await axios.post(
    `${CODE_ENGINE_URL}/api/batch-judge`,
    {
      submissions: [
        {
          language: mappedLang,
          code: code,
          testCases: testCases.map((tc) => ({
            input: tc.input || "",
            expectedOutput: tc.output || tc.expectedOutput || "",
          })),
          timeLimit: Math.min(timeLimit, 10),
          memoryLimit: Math.min(memoryLimit, 256),
        },
      ],
    },
    {
      headers,
      timeout: 120000,
    },
  );

  // DEBUG: Log full response
  console.log(
    "[Code Engine] Raw response:",
    JSON.stringify(response.data, null, 2).substring(0, 1000),
  );

  // Map response from your engine
  const { success, data } = response.data;

  if (!success) {
    return {
      compilationError: data?.error || null,
      results: testCases.map((tc, idx) => ({
        testCase: idx + 1,
        passed: false,
        status: "error",
        actualOutput: "",
        expectedOutput: tc.output || tc.expectedOutput || "",
        time: 0,
        memory: 0,
        error: data?.error || "Execution failed",
      })),
    };
  }

  // Your engine returns: data.results[0] for first submission
  const submissionResult = data.results?.[0];

  if (!submissionResult) {
    return {
      compilationError: null,
      results: testCases.map((tc, idx) => ({
        testCase: idx + 1,
        passed: false,
        status: "error",
        actualOutput: "",
        expectedOutput: tc.output || tc.expectedOutput || "",
        time: 0,
        memory: 0,
        error: "No results returned from engine",
      })),
    };
  }

  // Check for compilation error
  if (submissionResult.overallVerdict === "CE") {
    return {
      compilationError:
        submissionResult.compilationError || "Compilation Error",
      results: testCases.map((tc, idx) => ({
        testCase: idx + 1,
        passed: false,
        status: "compilation_error",
        actualOutput: "",
        expectedOutput: tc.output || tc.expectedOutput || "",
        time: 0,
        memory: 0,
        error: submissionResult.compilationError || "Compilation Error",
      })),
    };
  }

  // Map individual test case results
  const results = (submissionResult.results || []).map((r, idx) => {
    let status = "success";
    if (r.verdict === "TLE") status = "time_limit_exceeded";
    else if (r.verdict === "MLE") status = "memory_limit_exceeded";
    else if (r.verdict === "RE") status = "runtime_error";
    else if (r.verdict === "AC") status = "success";
    else if (r.verdict === "WA") status = "wrong_answer";
    else if (r.verdict === "CE") status = "compilation_error";

    const passed = r.verdict === "AC";

    return {
      testCase: idx + 1,
      passed,
      status,
      actualOutput: r.actualOutput || r.output || "",
      expectedOutput: r.expectedOutput || testCases[idx]?.output || "",
      time: r.executionTime || 0,
      memory: ((r.memoryUsed || 0) / 1024).toFixed(2),
      error: r.error || "",
    };
  });

  return {
    compilationError: null,
    overallVerdict: submissionResult.overallVerdict,
    totalPassed: submissionResult.passed || 0,
    totalFailed: submissionResult.failed || 0,
    results,
  };
};

// Fallback to Hugging Face (backup)
const HUGGINGFACE_API = "https://ratan1729-code-runner-api.hf.space/execute";

const executeOnHuggingFace = async (language, code, input) => {
  const payload = {
    language: language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase(),
    code: code,
    input: input || "",
  };

  console.log("[HF Fallback] Executing code...");
  const response = await axios.post(HUGGINGFACE_API, payload, {
    timeout: 30000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
};

// =============================================================================
// --- PISTON API (Commented - keeping as backup) ---
// =============================================================================
// const PISTON_API = "https://emkc.org/api/v2/piston/execute";
const PISTON_LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  "c++": { language: "c++", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
  go: { language: "go", version: "1.16.2" },
};

// --- OLD Piston Helper (Commented) ---
// const executeOnPiston = async (language, code, input, timeLimit, memoryLimitMB) => {
//   const languageConfig = PISTON_LANGUAGE_MAP[language] || PISTON_LANGUAGE_MAP["javascript"];
//   const memoryLimitBytes = memoryLimitMB * 1024 * 1024;
//   const payload = {
//     language: languageConfig.language,
//     version: languageConfig.version,
//     files: [{ content: code }],
//     stdin: input || "",
//     run_timeout: timeLimit,
//     run_memory_limit: memoryLimitBytes,
//   };
//   const response = await axios.post(PISTON_API, payload);
//   return response.data;
// };

// --- Helper: Determine Verdict with Enhanced Logic ---
/**
 * Determines the accurate verdict based on execution results
 * @param {Object} run - Piston execution result
 * @param {number} timeLimit - Time limit in milliseconds
 * @param {number} executionTime - Actual execution time (optional)
 * @returns {string} - Verdict: "Time Limit Exceeded", "Memory Limit Exceeded", or "Runtime Error"
 */
const determineVerdict = (run, timeLimit, executionTime = null) => {
  // If exit code is 0, no error occurred
  console.log(
    "run : ",
    run,
    " timeLimit : ",
    timeLimit,
    " executionTime : ",
    executionTime,
  );
  if (run.code === 0 && !run.signal) {
    return null; // No error, proceed to check output correctness
  }

  const signal = run.signal || "";
  const stderr = (run.stderr || "").toLowerCase();
  const actualTime = executionTime || 0;

  // --- PRIORITY 1: SIGTERM (Always TLE) ---
  if (signal === "SIGTERM") {
    return "Time Limit Exceeded";
  }

  // --- PRIORITY 2: SIGKILL (Could be TLE or MLE) ---
  if (signal === "SIGKILL") {
    // Check actual execution time (if process ran close to time limit, it's TLE)
    if (actualTime > 0 && actualTime >= timeLimit * 0.9) {
      return "Time Limit Exceeded";
    }

    // Check stderr for memory-related errors
    if (
      stderr.includes("memory") ||
      stderr.includes("allocation") ||
      stderr.includes("out of memory") ||
      stderr.includes("cannot allocate") ||
      stderr.includes("bad_alloc") ||
      stderr.includes("malloc") ||
      stderr.includes("heap-buffer-overflow") ||
      stderr.includes("heap-use-after-free") ||
      stderr.includes("oom") || // Out of Memory
      stderr.includes("enomem")
    ) {
      return "Memory Limit Exceeded";
    }

    // Check for actual runtime errors (array bounds, null pointer, etc.)
    if (
      stderr.includes("runtime error") ||
      stderr.includes("index out of") ||
      stderr.includes("bounds") ||
      stderr.includes("null pointer") ||
      stderr.includes("division by zero") ||
      stderr.includes("illegal instruction")
    ) {
      return "Runtime Error";
    }

    // Default: SIGKILL is most commonly memory-related
    // (In batch execution, having partial output is normal and doesn't indicate RE)
    return "Memory Limit Exceeded";
  }

  // --- PRIORITY 3: SIGSEGV (Segmentation Fault - Could be MLE or RE) ---
  if (signal === "SIGSEGV") {
    // Check if it's memory-related
    if (
      stderr.includes("memory") ||
      stderr.includes("allocation") ||
      stderr.includes("heap") ||
      stderr.includes("stack overflow") ||
      stderr.includes("stack smashing")
    ) {
      return "Memory Limit Exceeded";
    }

    // Otherwise, it's a genuine segmentation fault (bad pointer, array out of bounds)
    return "Runtime Error";
  }

  // --- PRIORITY 4: SIGABRT (Abort signal) ---
  if (signal === "SIGABRT") {
    // Check for memory issues
    if (
      stderr.includes("memory") ||
      stderr.includes("allocation") ||
      stderr.includes("bad_alloc")
    ) {
      return "Memory Limit Exceeded";
    }
    return "Runtime Error";
  }

  // --- PRIORITY 5: Other Signals ---
  if (signal) {
    // SIGXFSZ, SIGFPE, etc. are runtime errors
    return "Runtime Error";
  }

  // --- PRIORITY 6: Non-zero exit code without signal ---
  if (run.code !== 0) {
    // Parse stderr for specific error types
    if (
      stderr.includes("timeout") ||
      stderr.includes("time limit") ||
      stderr.includes("timed out")
    ) {
      return "Time Limit Exceeded";
    }

    if (
      stderr.includes("memory") ||
      stderr.includes("allocation") ||
      stderr.includes("out of memory")
    ) {
      return "Memory Limit Exceeded";
    }

    // Default: Non-zero exit code is a runtime error
    return "Runtime Error";
  }

  // If we reach here, something unexpected happened
  return "Runtime Error";
};

// 1. RUN CODE (Single Test Case) - Using Judge0
module.exports.runningCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    console.log("[Run] Executing on Judge0...");

    const result = await createSingleSubmission(language, code, stdin);

    // DEBUG: Log Judge0 response
    console.log("[Run] Judge0 result:", JSON.stringify(result, null, 2));

    // Handle different statuses from Judge0
    if (result.status === "time_limit_exceeded") {
      return res.json({
        output: `Time Limit Exceeded (${result.time}ms)`,
        status: "Error",
        time: result.time,
        memory: result.memory,
      });
    }

    if (result.status === "compilation_error") {
      return res.json({
        output: result.error || "Compilation Error",
        status: "Compilation Error",
        time: 0,
        memory: 0,
      });
    }

    if (result.status === "runtime_error" || result.status === "internal_error" || result.status === "error") {
      return res.json({
        output: result.error || "Runtime Error",
        status: "Error",
        time: result.time,
        memory: result.memory,
      });
    }

    // Success
    res.json({
      output: result.output || "",
      status: "Accepted",
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    console.error("[Run] Error:", error.message);
    res.status(500).json({ error: "Execution Failed", details: error.message });
  }
};
const MAX_CODE_SIZE = 500 * 1024; // 500KB max code size
const MAX_TEST_CASES = 15; // Limit test cases to avoid 413 payload error

// Import queue functions
const { shouldQueue, addSubmissionJob } = require("../utils/submissionQueue");

/**
 * Core submission execution logic (extracted for reuse in queue worker)
 * Uses Judge0 runner submission: compile once, run all test cases
 */
async function executeSubmission(userId, questionId, code, language) {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  // Fetch test cases from Oracle storage
  let allTestCases = [];
  try {
    console.log(`[Submit] Fetching test cases from Oracle: ${question.testCasesUrl}`);
    const tcResponse = await axios.get(question.testCasesUrl, { timeout: 10000 });
    // Oracle returns: { success, data: { testCases: [...] } }
    allTestCases = tcResponse.data?.data?.testCases || tcResponse.data || [];
    console.log(`[Submit] Fetched ${allTestCases.length} test cases from Oracle`);
  } catch (fetchError) {
    console.error(`[Submit] Failed to fetch test cases from Oracle:`, fetchError.message);
    throw new Error("Failed to fetch test cases from storage");
  }

  // Limit test cases
  const testCases = allTestCases.slice(0, MAX_TEST_CASES);
  const totalCases = testCases.length;
  console.log(`[Submit] Using ${totalCases}/${allTestCases.length} test cases (MAX: ${MAX_TEST_CASES})`);

  // Convert timeLimit: if stored in ms (> 100), convert to seconds; otherwise use directly
  const rawTimeLimit = question.timeLimit || 2000;
  const timeLimit = rawTimeLimit > 100 ? rawTimeLimit / 1000 : Math.max(rawTimeLimit, 2);
  const memoryLimit = (question.memoryLimit || 128) * 1024; // Convert MB to KB for Judge0

  // Execute ALL test cases on Judge0 (compile once, run all)
  console.log(`[Submit] Running ${totalCases} test cases on Judge0...`);
  const judge0Result = await createRunnerSubmission(
    language, code, testCases, timeLimit, memoryLimit
  );

  // Process results
  let allResults = [];
  let passedCount = 0;
  let finalStatus = "Accepted";
  let totalTime = 0;
  let maxMemory = 0;

  // Handle compilation error
  if (judge0Result.compilationError) {
    finalStatus = "Compilation Error";
    allResults = testCases.map((tc) => ({
      status: "Compilation Error",
      input: tc.input || "",
      expected: tc.output || tc.expectedOutput || "",
      actual: "",
      time: 0,
      memory: 0,
      error: judge0Result.compilationError,
    }));
  } else {
    // Map Judge0 runner results to AlgoViz format
    for (let i = 0; i < (judge0Result.results || []).length; i++) {
      const r = judge0Result.results[i];
      const tc = testCases[i] || {};

      let status = "Failed";
      let passed = false;

      if (r.verdict === "AC") { status = "Passed"; passed = true; }
      else if (r.verdict === "WA") { status = "Failed"; }
      else if (r.verdict === "TLE") { status = "Time Limit Exceeded"; }
      else if (r.verdict === "RE") { status = "Runtime Error"; }
      else if (r.verdict === "CE") { status = "Compilation Error"; }
      else { status = "Failed"; }

      if (passed) {
        passedCount++;
      } else if (finalStatus === "Accepted") {
        if (status === "Failed") finalStatus = "Wrong Answer";
        else finalStatus = status;
      }

      const tcTime = r.time || 0;
      const tcMemory = r.memory || 0;
      totalTime += tcTime;
      if (tcMemory > maxMemory) maxMemory = tcMemory;

      allResults.push({
        status,
        input: tc.input || "",
        expected: r.expected || tc.output || "",
        actual: r.output || "",
        time: tcTime,
        memory: tcMemory,
        error: r.error || null,
      });
    }
  }

  // Check if all passed
  if (passedCount === totalCases && totalCases > 0) {
    finalStatus = "Accepted";
  }

  console.log(
    `[Submit] Complete: ${passedCount}/${totalCases} passed, Status: ${finalStatus}`,
  );

  // 3. Save Submission
  const submission = await Submission.create({
    userId,
    questionId,
    code,
    language,
    status: finalStatus,
    passedTestCases: passedCount,
    totalTestCases: totalCases,
    executionTime: totalTime,
    memoryUsed: maxMemory,
    timeComplexity: "Calculating...",
    spaceComplexity: "Calculating...",
  });

  // 4. Update User Stats
  const user = await User.findById(userId);
  const updateQuery = { $inc: { credits: -1 } };
  if (finalStatus === "Accepted") {
    updateQuery.$addToSet = { questionsSolved: questionId };

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const lastDate = user.lastSubmittedDate
      ? new Date(user.lastSubmittedDate)
      : null;
    let newStreak = user.streak || 0;

    if (lastDate) {
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1;
      else if (diffDays === 0 && newStreak === 0) newStreak = 1;
    } else {
      newStreak = 1;
    }

    const existingMax = user.maxStreak || user.streak || 0;
    const newMaxStreak = Math.max(existingMax, newStreak);

    updateQuery.$set = {
      lastSubmittedDate: now,
      streak: newStreak,
      maxStreak: newMaxStreak,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
    new: true,
  });

  // Return the processed results
  return {
    finalStatus,
    passedCount,
    totalCases,
    totalTime,
    maxMemory,
    allResults,
    submissionId: submission._id,
    remainingCredits: updatedUser.credits,
    streak: updatedUser.streak || 0,
    maxStreak: updatedUser.maxStreak || 0,
  };
}


module.exports.submitCode = async (req, res) => {
  try {
    console.log("[Submit] New submission request received");
    const { code, language, questionId } = req.body;

    // 1. Auth & Validation
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.credits <= 0 && !user.isPremium) {
      return res.status(403).json({ message: "Insufficient Credits" });
    }

    if (code.length > MAX_CODE_SIZE) {
      return res.status(400).json({
        message: `Code too large (${(code.length / 1024).toFixed(1)}KB). Max: 500KB`,
      });
    }

    // 2. INTELLIGENT ROUTING: Check if system is busy
    // TEMPORARILY DISABLED FOR DEVELOPMENT - uncomment for production
    // if (await shouldQueue()) {
    //   console.log("[Submit] System busy (≥15 active jobs), queueing request...");
    //   
    //   // Add to queue
    //   const { jobId, position, estimatedWait } = await addSubmissionJob({
    //     userId,
    //     questionId,
    //     code,
    //     language,
    //     executeSubmission: async () => {
    //       return await executeSubmission(userId, questionId, code, language);
    //     },
    //   });
    //
    //   // Return queue info for frontend to poll
    //   return res.status(202).json({
    //     success: true,
    //     queued: true,
    //     jobId,
    //     position,
    //     estimatedWait,
    //     message: `Your request is in queue (position ${position}). Estimated wait: ${estimatedWait}s`,
    //   });
    // }

    // 3. DIRECT EXECUTION: Execute immediately (queue disabled for dev)
    console.log("[Submit] Executing directly...");
    const result = await executeSubmission(userId, questionId, code, language);

    // Return direct execution results
    return res.status(201).json({
      success: true,
      queued: false,
      message: result.finalStatus,
      status: result.finalStatus,
      submissionId: result.submissionId,
      passed: result.passedCount,
      total: result.totalCases,
      remainingCredits: result.remainingCredits,
      streak: result.streak,
      maxStreak: result.maxStreak,
      results: result.allResults,
      executionTime: result.totalTime,
      memoryUsed: result.maxMemory,
    });

  } catch (error) {
    console.error("[Submit] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message
      });
    }
  }
};

// --- BACKGROUND AI HELPER ---
const analyzeComplexityBackground = async (code, language, submissionId) => {
  try {
    console.log("Analyzing C++ Complexity...");

    const prompt = `
          Analyze the following ${language} code.
          Identify the Time Complexity and Space Complexity in Big O notation.
          Return ONLY a JSON object in this format (no markdown):
          { "timeComplexity": "O(...)", "spaceComplexity": "O(...)" }
          Code: ${code}
    `;

    // 1. Call AI (Using your preferred model/syntax)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    // 2. Parse the Response safely
    // (Handling cases where .text might be a function or property depending on SDK version)
    const textVal =
      typeof response.text === "function"
        ? response.text()
        : response.text || "{}";
    const jsonString = textVal.replace(/```json|```/g, "").trim();
    const complexityData = JSON.parse(jsonString);

    // 3. UPDATE THE DATABASE (The missing part)
    await Submission.findByIdAndUpdate(submissionId, {
      timeComplexity: complexityData.timeComplexity || "N/A",
      spaceComplexity: complexityData.spaceComplexity || "N/A",
    });

    console.log(`[AI] Complexity updated for submission ${submissionId}`);
  } catch (aiError) {
    console.error("Gemini Analysis Failed:", aiError.message);
    await Submission.findByIdAndUpdate(submissionId, {
      timeComplexity: "N/A",
      spaceComplexity: "N/A",
    });
  }
};

// 3. GET USER SUBMISSIONS (For History Tab)
module.exports.getUserSubmissions = async (req, res) => {
  try {
    //await connectDB();
    const userId = req.user._id;
    const { questionId } = req.params;

    const submissions = await Submission.find({ userId, questionId })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20);

    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error("Get Submissions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// get submission by id
module.exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: "Not Found" });
    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.submitCodeInQueue = async (req, res) => {
  console.log("submitinfjnbierg");
  let startTime = Date.now(),
    endTime = 0; // For logging total time
  try {
    //await connectDB();
    const { code, language, questionId } = req.body;

    // ==========================================================
    // 1. AUTH & VALIDATION CHECKS
    // ==========================================================
    const userId = req.user ? req.user._id : null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.credits <= 0 && !user.isPremium) {
      return res.status(403).json({ message: "Insufficient Credits." });
    }

    if (!questionId || !code) {
      return res.status(400).json({ message: "Question ID and Code required" });
    }

    const question = await Question.findById(questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    // ==========================================================
    // 2. CONFIGURATION & LIMITS
    // ==========================================================
    const dbTimeLimit = question.timeLimit || 2000;
    const isCompiled = ["c++", "cpp", "c", "java", "go", "rust"].includes(
      language.toLowerCase(),
    );

    const overheadBuffer = isCompiled ? 2500 : 1000;
    const effectiveTimeLimit = dbTimeLimit + overheadBuffer;
    const memoryLimit = question.memoryLimit || 512;

    // Fetch test cases from Oracle storage
    let testCases = [];
    try {
      console.log(`[SubmitParallel] Fetching test cases from Oracle: ${question.testCasesUrl}`);
      const tcResponse = await axios.get(question.testCasesUrl, { timeout: 10000 });
      // Oracle returns: { success, data: { testCases: [...] } }
      testCases = tcResponse.data?.data?.testCases || tcResponse.data || [];
      console.log(`[SubmitParallel] Fetched ${testCases.length} test cases from Oracle`);
    } catch (fetchError) {
      console.error(`[SubmitParallel] Failed to fetch test cases:`, fetchError.message);
      return res.status(500).json({ message: "Failed to fetch test cases from storage" });
    }

    // ==========================================================
    // 3. 🚀 OPTIMIZED PIPELINE EXECUTION
    // ==========================================================

    // --- TRACK A: Start AI Analysis (Background) ---
    const complexityPromise = (async () => {
      if (!process.env.GEMINI_API_KEY)
        return { timeComplexity: "N/A", spaceComplexity: "N/A" };
      try {
        const prompt = `
          Analyze the following ${language} code. 
          Identify the Time Complexity and Space Complexity in Big O notation.
          Return ONLY a JSON object in this format (no markdown):
          { "timeComplexity": "O(...)", "spaceComplexity": "O(...)" }
          Code: ${code}
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const text = response.text || "{}";
        const jsonString = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonString);
      } catch (error) {
        console.error("Gemini Analysis Failed:", error.message);
        return { timeComplexity: "N/A", spaceComplexity: "N/A" };
      }
    })();

    // --- TRACK B: Run Test Cases (Queue Based) ---

    // We map the test cases to Queue Promises
    const testPromises = testCases.map((testCase) => {
      console.log("Added");
      return pistonQueue.add(
        language,
        code,
        testCase.input,
        effectiveTimeLimit,
        memoryLimit,
      );
    });

    // Wait for all requests to finish (Success or Fail)
    // The Queue will ensure they run sequentially with the some time-gap in between.
    const resultsRaw = await Promise.allSettled(testPromises);
    console.log("resukts", resultsRaw);
    // ==========================================================
    // 4. AGGREGATE RESULTS
    // ==========================================================
    let passedCount = 0;
    let results = [];
    let finalStatus = "Pending";

    resultsRaw.forEach((res, index) => {
      const testCase = testCases[index];

      if (res.status === "rejected") {
        results.push({
          status: "Runtime Error",
          input: testCase.input,
          error: "Execution Engine Failed (API Error)",
        });
        if (
          finalStatus !== "Time Limit Exceeded" &&
          finalStatus !== "Memory Limit Exceeded"
        )
          finalStatus = "Runtime Error";
      } else {
        const { run } = res.value; // Access the resolved value from Queue

        const actualOutput = (run.stdout || "").trim();
        const expectedOutput = (testCase.output || "").trim();
        const errorOutput = run.stderr || "";

        // Use the comprehensive verdict determination function
        const verdict = determineVerdict(run, effectiveTimeLimit);

        if (verdict) {
          // Error occurred - TLE, MLE, or RE
          results.push({
            status: verdict,
            input: testCase.input,
            error:
              errorOutput || `Process terminated with signal: ${run.signal}`,
          });

          // Priority: TLE > MLE > RE (Keep the most severe error)
          if (verdict === "Time Limit Exceeded") {
            finalStatus = "Time Limit Exceeded";
          } else if (
            verdict === "Memory Limit Exceeded" &&
            finalStatus !== "Time Limit Exceeded"
          ) {
            finalStatus = "Memory Limit Exceeded";
          } else if (
            finalStatus !== "Time Limit Exceeded" &&
            finalStatus !== "Memory Limit Exceeded"
          ) {
            finalStatus = "Runtime Error";
          }
        } else if (actualOutput !== expectedOutput) {
          // Wrong answer
          results.push({
            status: "Failed",
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            error: errorOutput,
          });
          if (finalStatus === "Accepted" || finalStatus === "Pending")
            finalStatus = "Wrong Answer";
        } else {
          // Correct answer
          passedCount++;
          results.push({ status: "Passed", input: testCase.input });
        }
      }
    });
    console.log(finalStatus);
    if (finalStatus === "Pending") {
      finalStatus =
        passedCount === testCases.length ? "Accepted" : "Wrong Answer";
    }

    // ==========================================================
    // 5. FETCH AI RESULT & SAVE
    // ==========================================================
    let complexityData = { timeComplexity: "N/A", spaceComplexity: "N/A" };
    if (
      finalStatus !== "Runtime Error" &&
      finalStatus !== "Time Limit Exceeded" &&
      finalStatus !== "Memory Limit Exceeded"
    ) {
      try {
        complexityData = await complexityPromise;
      } catch (e) {
        console.log("AI Silent Fail");
      }
    }
    const { timeComplexity, spaceComplexity } = complexityData;

    const submission = await Submission.create({
      questionId,
      userId,
      code,
      language,
      status: finalStatus,
      passedTestCases: passedCount,
      totalTestCases: testCases.length,
      timeComplexity,
      spaceComplexity,
    });

    const updateQuery = { $inc: { credits: -1 } };

    if (finalStatus === "Accepted") {
      updateQuery.$addToSet = { questionsSolved: questionId };
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const lastDate = user.lastSubmittedDate
        ? new Date(user.lastSubmittedDate)
        : null;
      let newStreak = user.streak || 0;

      if (!lastDate) {
        newStreak = 1;
      } else {
        const last = new Date(lastDate);
        last.setHours(0, 0, 0, 0);

        const diffTime = today - last;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        } else if (diffDays === 0 && newStreak === 0) {
          newStreak = 1;
        }
      }

      // Update maxStreak if current streak exceeds it
      // Also initialize maxStreak from current streak for existing users
      const existingMax = user.maxStreak || user.streak || 0;
      const newMaxStreak = Math.max(existingMax, newStreak);

      updateQuery.$set = {
        lastSubmittedDate: now,
        streak: newStreak,
        maxStreak: newMaxStreak,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
      new: true,
    });

    endTime = Date.now();
    console.log(
      `Total Processing Time using submitCodeInQueue: ${(endTime - startTime) / 1000
      } seconds`,
    );
    return res.status(201).json({
      success: true,
      message: finalStatus,
      submissionId: submission._id,
      passed: passedCount,
      total: testCases.length,
      remainingCredits: updatedUser.credits,
      streak: updatedUser.streak || 0,
      maxStreak: updatedUser.maxStreak || 0,
      results: results,
      timeComplexity,
      spaceComplexity,
    });
  } catch (error) {
    endTime = Date.now();
    console.log(
      `Total Processing Time using submitCodeInQueue: ${(endTime - startTime) / 1000
      } seconds`,
    );
    console.error("Submit Code Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during submission" });
  }
};

// Testing to reduce time
// Function to wrap user's C++ code
// const transformCppCode = (userCode) => {
//   // 1. Rename user's main() to user_solve()
//   // Handles: "int main()", "int main (void)", "int main(int argc, char** argv)"
//   let safeCode = userCode.replace(/int\s+main\s*\([^)]*\)/, "int user_solve()");

//   // 2. Protect against accidental process termination
//   // (Optional but good: replaces exit(0) with return 0 so the loop continues)
//   safeCode = safeCode.replace(/exit\s*\(\s*0\s*\)/g, "return 0");

//   // 3. Append the Driver (The Batch Loop)
//   const driverCode = `

//     // --- BATCH DRIVER ADDED BY SYSTEM ---
//     #include <iostream>
//     #include <vector>
//     #include <string>

//     int main() {
//         // Optimize I/O operations
//         std::ios_base::sync_with_stdio(false);
//         std::cin.tie(NULL);

//         int t;
//         if (std::cin >> t) {
//             while(t--) {
//                 user_solve();
//                 // Print delimiter after every test case
//                 std::cout << "\\n###TC_END###" << std::endl;
//             }
//         }
//         return 0;
//     }
//   `;

//   return safeCode + driverCode;
// };

// module.exports.submitCode = async (req, res) => {
//   try {
//     console.log("aaya hu submit hone ");
//     //await connectDB();
//     const { code, language, questionId } = req.body;

//     // 1. Auth & Credits Check
//     const userId = req.user ? req.user._id : null;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.credits <= 0 && !user.isPremium) {
//       return res.status(403).json({ message: "Insufficient Credits." });
//     }

//     // 2. Fetch Question
//     const question = await Question.findById(questionId);
//     if (!question)
//       return res.status(404).json({ message: "Question not found" });

//     const testCases = question.testCases || [];
//     if (testCases.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "No test cases configured for this question" });
//     }
//     console.log("testcase : ", testCases);
//     // --- BATCH PREPARATION ---
//     let finalCode = code;
//     let finalInput = "";

//     // Only apply Batching optimization for C++ currently
//     if (language.toLowerCase() === "cpp" || language.toLowerCase() === "c++") {
//       // A. Transform Code
//       finalCode = transformCppCode(code);

//       // B. Combine Inputs: First line is "Count", then all inputs follow
//       const inputBody = testCases.map((tc) => tc.input.trim()).join("\n");
//       finalInput = `${testCases.length}\n${inputBody}`;
//     } else {
//       // Fallback for other languages (Not implemented in this snippet)
//       return res
//         .status(400)
//         .json({ message: "Batch execution currently optimized for C++ only." });
//     }

//     // 3. Execution Limits
//     // Allow enough time for ALL cases + compilation overhead
//     // e.g. 25 cases * 1s limit = 25s? No, usually 5s total is plenty for batching.
//     const timeLimitPerCase = (question.timeLimit || 2) * 1000;
//     const totalTimeLimit = Math.min(15000, timeLimitPerCase * testCases.length); // Cap at 15s
//     const memoryLimit = question.memoryLimit || 512;

//     // 4. Run Code (SINGLE API CALL)
//     const result = await executeOnPiston(
//       language,
//       finalCode,
//       finalInput,
//       totalTimeLimit,
//       memoryLimit
//     );
//     const { run } = result;

//     // --- RESULT PARSING ---
//     let finalStatus = "Accepted";
//     let passedCount = 0;
//     let results = [];

//     // A. Check for Compilation Error / Timeout / Crash
//     if (run.code !== 0 && !run.stdout) {
//       let status = "Runtime Error";
//       let errorMsg = run.stderr || "Unknown Error";

//       if (run.signal === "SIGKILL" || run.signal === "SIGTERM") {
//         status = "Time Limit Exceeded";
//         errorMsg = "Execution timed out (Loop too slow).";
//       } else if ((run.stderr || "").includes("error:")) {
//         status = "Compilation Error";
//       }

//       // Deduct credit for attempted run
//       await User.findByIdAndUpdate(userId, { $inc: { credits: -1 } });

//       return res.status(200).json({
//         success: true,
//         message: status,
//         passed: 0,
//         total: testCases.length,
//         error: errorMsg,
//         results: [],
//       });
//     }

//     // B. Split the Batch Output
//     const rawOutputs = (run.stdout || "").split("###TC_END###");
//     // Clean up array (remove empty trailing parts)
//     const actualOutputs = rawOutputs
//       .map((s) => s.trim())
//       .filter((_, i) => i < testCases.length);

//     // C. Grading Loop
//     testCases.forEach((testCase, index) => {
//       const expected = (testCase.output || "").trim();
//       // If actualOutputs[index] is missing, code likely crashed earlier
//       const actual =
//         actualOutputs[index] !== undefined ? actualOutputs[index] : "";

//       if (actual === expected) {
//         passedCount++;
//         results.push({
//           status: "Passed",
//           input: testCase.input,
//         });
//       } else {
//         if (finalStatus === "Accepted") finalStatus = "Wrong Answer";

//         results.push({
//           status: "Failed",
//           input: testCase.input,
//           expected: expected,
//           actual:
//             actual ||
//             (index >= actualOutputs.length
//               ? "No Output (Possible Crash)"
//               : actual),
//         });
//       }
//     });

//     // If outputs are fewer than test cases, it means Runtime Error occurred mid-way
//     if (actualOutputs.length < testCases.length) {
//       finalStatus = "Runtime Error";
//     }

//     // 5. Save Submission
//     const submission = await Submission.create({
//       questionId,
//       userId,
//       code,
//       language,
//       status: finalStatus,
//       passedTestCases: passedCount,
//       totalTestCases: testCases.length,
//       timeComplexity: "N/A", // Re-add Gemini AI call here if needed
//       spaceComplexity: "N/A",
//     });

//     // 6. Update User Stats
//     const updateQuery = { $inc: { credits: -1 } };
//     if (finalStatus === "Accepted") {
//       updateQuery.$addToSet = { questionsSolved: questionId };
//       updateQuery.$set = { lastSubmittedDate: new Date() };
//       updateQuery.$inc.streak = 1; // Basic streak logic
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
//       new: true,
//     });
//     console.log(finalStatus);
//     // 7. Response
//     return res.status(201).json({
//       success: true,
//       message: finalStatus,
//       submissionId: submission._id,
//       passed: passedCount,
//       total: testCases.length,
//       remainingCredits: updatedUser.credits,
//       streak: updatedUser.streak || 0,
//       results: results,
//     });
//   } catch (error) {
//     console.error("Submit Code Error:", error);
//     return res.status(500).json({ message: "Server error during submission" });
//   }
// };

// =============================================================================
// SSE STREAMING SUBMIT - Using YOUR Code Engine (Compile Once, Run All!)
// SSE = Server-Sent Events (one-way server → client streaming)
// =============================================================================
module.exports.submitCodeStream = async (req, res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  // Helper to send SSE event
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { code, language, questionId } = req.body;
    console.log("[SSE Submit] Starting streaming submission...");

    // 1. Auth & Validation
    const userId = req.user?._id;
    if (!userId) {
      sendEvent({ type: "error", message: "Unauthorized" });
      return res.end();
    }

    const user = await User.findById(userId);
    if (!user) {
      sendEvent({ type: "error", message: "User not found" });
      return res.end();
    }

    if (user.credits <= 0 && !user.isPremium) {
      sendEvent({ type: "error", message: "Insufficient Credits" });
      return res.end();
    }

    if (code.length > MAX_CODE_SIZE) {
      sendEvent({ type: "error", message: `Code too large. Max: 500KB` });
      return res.end();
    }

    const question = await Question.findById(questionId);
    if (!question) {
      sendEvent({ type: "error", message: "Question not found" });
      return res.end();
    }

    // Fetch test cases from Oracle storage
    let allTestCases = [];
    try {
      console.log(`[SSE] Fetching test cases from Oracle: ${question.testCasesUrl}`);
      const tcResponse = await axios.get(question.testCasesUrl, { timeout: 10000 });
      // Oracle returns: { success, data: { testCases: [...] } }
      allTestCases = tcResponse.data?.data?.testCases || tcResponse.data || [];
      console.log(`[SSE] Fetched ${allTestCases.length} test cases from Oracle`);
    } catch (fetchError) {
      console.error(`[SSE] Failed to fetch test cases:`, fetchError.message);
      sendEvent({ type: "error", message: "Failed to fetch test cases from storage" });
      return res.end();
    }

    // Limit test cases to MAX_TEST_CASES to avoid 413 payload error
    const testCases = allTestCases.slice(0, MAX_TEST_CASES);
    const totalCases = testCases.length;
    // Convert timeLimit: if stored in ms (> 100), convert to seconds; otherwise use directly
    // Also ensure minimum of 2 seconds
    const rawTimeLimit = question.timeLimit || 2000;
    const timeLimit = rawTimeLimit > 100 ? rawTimeLimit / 1000 : Math.max(rawTimeLimit, 2);
    const memoryLimit = question.memoryLimit || 128;

    // 2. Send queue status first (for UI feedback)
    sendEvent({
      type: "queued",
      message: "Your request is in queue. Processing will start shortly...",
      position: 1, // Can be dynamic based on actual queue
    });

    // Small delay to show queue message
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Send initial info - Single batch (compile once!)
    sendEvent({
      type: "init",
      totalBatches: 1,
      totalCases,
      totalAvailable: allTestCases.length,
      message:
        totalCases < allTestCases.length
          ? `Running ${totalCases} of ${allTestCases.length} test cases...`
          : "Compiling code and running all test cases...",
    });

    // 4. Send compilation start
    sendEvent({
      type: "compiling",
      message: "Compiling your code...",
    });

    // 5. Execute each test case ONE BY ONE using /api/execute
    let allResults = [];
    let passedCount = 0;
    let finalStatus = "Accepted";
    let totalTime = 0;
    let maxMemory = 0;
    let compilationChecked = false;

    console.log(`[SSE Submit] Running ${totalCases} test cases one-by-one...`);

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      console.log(`[SSE Submit] Running test case ${i + 1}/${totalCases}...`);

      try {
        const result = await executeOnEngine(
          language,
          code,
          tc.input,
          timeLimit,
          memoryLimit,
        );

        // Send compiled event after first successful execution
        if (!compilationChecked) {
          compilationChecked = true;
          if (result.status === "compilation_error") {
            sendEvent({
              type: "compilation_error",
              message: "Compilation Error",
              error: result.error,
            });
            finalStatus = "Compilation Error";
            // Fill remaining results with CE
            for (let j = i; j < testCases.length; j++) {
              allResults.push({
                status: "Compilation Error",
                input: testCases[j].input,
                expected: testCases[j].output,
                actual: "",
                time: 0,
                memory: 0,
                error: result.error,
              });
              sendEvent({
                type: "test_result",
                testCase: j + 1,
                totalCases,
                status: "Compilation Error",
                time: 0,
                memory: 0,
                passed: false,
              });
            }
            break; // Stop on CE
          } else {
            sendEvent({
              type: "compiled",
              message: "Compilation successful! Running test cases...",
            });
          }
        }

        const actualOutput = (result.output || "").trim();
        const expectedOutput = (tc.output || "").trim();
        const tcTime = result.time || 0;
        const tcMemory = parseFloat(result.memory) || 0;

        totalTime += tcTime;
        if (tcMemory > maxMemory) maxMemory = tcMemory;

        // Determine verdict
        let status = "Failed";
        let passed = false;

        if (result.status === "runtime_error") {
          status = "Runtime Error";
          if (finalStatus === "Accepted") finalStatus = "Runtime Error";
        } else if (result.status === "time_limit_exceeded") {
          status = "Time Limit Exceeded";
          if (finalStatus === "Accepted") finalStatus = "Time Limit Exceeded";
        } else if (result.status === "memory_limit_exceeded") {
          status = "Memory Limit Exceeded";
          if (finalStatus === "Accepted") finalStatus = "Memory Limit Exceeded";
        } else if (actualOutput === expectedOutput) {
          status = "Passed";
          passed = true;
          passedCount++;
        } else {
          status = "Failed";
          if (finalStatus === "Accepted") finalStatus = "Wrong Answer";
        }

        allResults.push({
          status,
          input: tc.input,
          expected: expectedOutput,
          actual: actualOutput,
          time: tcTime,
          memory: tcMemory,
          error: result.error || null,
        });

        // Stream progress for each test case
        sendEvent({
          type: "test_result",
          testCase: i + 1,
          totalCases,
          status,
          time: tcTime,
          memory: tcMemory,
          passed,
        });

      } catch (tcError) {
        console.error(`[SSE Submit] TC ${i + 1} error:`, tcError.message);

        allResults.push({
          status: "Runtime Error",
          input: tc.input,
          expected: tc.output,
          actual: "",
          time: 0,
          memory: 0,
          error: tcError.message,
        });

        sendEvent({
          type: "test_result",
          testCase: i + 1,
          totalCases,
          status: "Runtime Error",
          time: 0,
          memory: 0,
          passed: false,
        });

        if (finalStatus === "Accepted") finalStatus = "Runtime Error";
      }
    }

    // Check if all passed
    if (passedCount === totalCases) {
      finalStatus = "Accepted";
    }

    console.log(
      `[SSE Submit] Complete: ${passedCount}/${totalCases} passed, Status: ${finalStatus}`,
    );

    // 5. Save Submission
    const submission = await Submission.create({
      userId,
      questionId,
      code,
      language,
      status: finalStatus,
      passedTestCases: passedCount,
      totalTestCases: totalCases,
      executionTime: totalTime,
      memoryUsed: maxMemory,
      timeComplexity: "Calculating...",
      spaceComplexity: "Calculating...",
    });

    // 6. Update User Stats
    const updateQuery = {
      $inc: { credits: -1 },
      $addToSet: { questionsAttempted: questionId },
    };

    if (finalStatus === "Accepted") {
      updateQuery.$addToSet.questionsSolved = questionId;

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const lastDate = user.lastSubmittedDate
        ? new Date(user.lastSubmittedDate)
        : null;
      let newStreak = user.streak || 0;

      if (!lastDate) {
        newStreak = 1;
      } else {
        const last = new Date(lastDate);
        last.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((today - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
        else if (diffDays === 0 && newStreak === 0) newStreak = 1;
      }

      const existingMax = user.maxStreak || user.streak || 0;
      const newMaxStreak = Math.max(existingMax, newStreak);

      updateQuery.$set = {
        lastSubmittedDate: now,
        streak: newStreak,
        maxStreak: newMaxStreak,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
      new: true,
    });

    // 7. Send final done event
    sendEvent({
      type: "done",
      success: true,
      message: finalStatus,
      submissionId: submission._id,
      passed: passedCount,
      total: totalCases,
      remainingCredits: updatedUser.credits,
      streak: updatedUser.streak || 0,
      maxStreak: updatedUser.maxStreak || 0,
      results: allResults,
      executionTime: totalTime,
      memoryUsed: maxMemory,
    });

    // 8. Background AI Analysis
    if (finalStatus === "Accepted" && process.env.GEMINI_API_KEY) {
      analyzeComplexityBackground(code, language, submission._id);
    }

    res.end();
  } catch (error) {
    console.error("[SSE Submit] Error:", error);
    try {
      sendEvent({ type: "error", message: "Server Error" });
    } catch (e) { }
    res.end();
  }
};

// =============================================================================
// DISTRIBUTED QUEUE-BASED SUBMIT - Uses multiple HF instances with load balancing
// Features:
// - 5 HuggingFace instances with round-robin / least-loaded selection
// - Queue-based processing for high concurrency
// - "Server busy" messaging with queue position
// - SSE real-time updates
// =============================================================================
module.exports.submitCodeDistributed = async (req, res) => {
  // Set SSE headers for real-time updates
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    const { code, language, questionId } = req.body;
    console.log("[Distributed Submit] Starting distributed submission...");

    // 1. Auth & Validation
    const userId = req.user?._id;
    if (!userId) {
      sendEvent({ type: "error", message: "Unauthorized" });
      return res.end();
    }

    const user = await User.findById(userId);
    if (!user) {
      sendEvent({ type: "error", message: "User not found" });
      return res.end();
    }

    if (user.credits <= 0 && !user.isPremium) {
      sendEvent({ type: "error", message: "Insufficient Credits" });
      return res.end();
    }

    const MAX_CODE_SIZE = 500 * 1024;
    if (code.length > MAX_CODE_SIZE) {
      sendEvent({ type: "error", message: `Code too large. Max: 500KB` });
      return res.end();
    }

    const question = await Question.findById(questionId);
    if (!question) {
      sendEvent({ type: "error", message: "Question not found" });
      return res.end();
    }

    // 2. Check queue status and notify if busy
    const queueStats = await getQueueStats();
    sendEvent({
      type: "queue_status",
      waiting: queueStats.waiting,
      active: queueStats.active,
      healthyInstances: queueStats.healthyInstances,
      estimatedWait: queueStats.estimatedWaitSeconds,
    });

    if (queueStats.waiting > 50) {
      sendEvent({
        type: "queued",
        position: queueStats.waiting + 1,
        message: "Servers are busy. Your request is queued and will be processed soon.",
        estimatedWait: queueStats.estimatedWaitSeconds,
      });
    }

    // 3. Fetch and prepare test cases from Oracle
    const MAX_TEST_CASES = 15;
    let allTestCases = [];
    try {
      console.log(`[Queue] Fetching test cases from Oracle: ${question.testCasesUrl}`);
      const tcResponse = await axios.get(question.testCasesUrl, { timeout: 10000 });
      // Oracle returns: { success, data: { testCases: [...] } }
      allTestCases = tcResponse.data?.data?.testCases || tcResponse.data || [];
      console.log(`[Queue] Fetched ${allTestCases.length} test cases from Oracle`);
    } catch (fetchError) {
      console.error(`[Queue] Failed to fetch test cases:`, fetchError.message);
      sendEvent({ type: "error", message: "Failed to fetch test cases from storage" });
      return res.end();
    }
    const testCases = allTestCases.slice(0, MAX_TEST_CASES);
    const totalCases = testCases.length;

    sendEvent({
      type: "start",
      total: totalCases,
      message: `Running ${totalCases} test cases across ${queueStats.healthyInstances} instances...`,
    });

    // Convert time limit
    const rawTimeLimit = question.timeLimit || 2000;
    const timeLimit = rawTimeLimit > 100 ? rawTimeLimit / 1000 : Math.max(rawTimeLimit, 2);
    const memoryLimit = question.memoryLimit || 128;

    // Generate unique submission ID for SSE tracking
    const submissionId = `sub_${Date.now()}_${userId}`;

    // 4. Execute test cases in parallel across instances
    let allResults = [];
    let passedCount = 0;
    let finalStatus = "Accepted";
    let totalTime = 0;
    let maxMemory = 0;

    // Distribute test cases across healthy instances
    const instanceStats = getInstanceStats();
    const healthyCount = instanceStats.healthyInstances;

    // Execute in parallel batches (one batch per healthy instance)
    const batchSize = Math.ceil(testCases.length / Math.max(healthyCount, 1));
    const batches = [];
    for (let i = 0; i < testCases.length; i += batchSize) {
      batches.push(testCases.slice(i, i + batchSize));
    }

    console.log(`[Distributed Submit] Split ${totalCases} TCs into ${batches.length} batches`);

    // Process all batches in parallel
    const batchPromises = batches.map(async (batch, batchIndex) => {
      const instance = getLeastLoadedInstance();
      const batchResults = [];

      for (let i = 0; i < batch.length; i++) {
        const tc = batch[i];
        const globalIndex = batchIndex * batchSize + i;

        try {
          incrementJobs(instance.name);

          const result = await executeOnInstance(instance, {
            language,
            code,
            input: tc.input,
            timeLimit,
            memoryLimit,
          });

          decrementJobs(instance.name);

          // Send progress update
          sendEvent({
            type: "progress",
            testCase: globalIndex + 1,
            total: totalCases,
            status: result.status || "completed",
            instanceUsed: instance.name,
          });

          batchResults.push({
            index: globalIndex,
            tc,
            result,
            instanceUsed: instance.name,
          });
        } catch (error) {
          decrementJobs(instance.name);

          sendEvent({
            type: "progress",
            testCase: globalIndex + 1,
            total: totalCases,
            status: "error",
            instanceUsed: instance.name,
          });

          batchResults.push({
            index: globalIndex,
            tc,
            error: error.message,
            instanceUsed: instance.name,
          });
        }
      }

      return batchResults;
    });

    // Wait for all batches to complete
    const batchResultsArrays = await Promise.all(batchPromises);
    const flatResults = batchResultsArrays.flat().sort((a, b) => a.index - b.index);

    // 5. Process results
    for (const item of flatResults) {
      const { tc, result, error } = item;

      if (error) {
        allResults.push({
          status: "Runtime Error",
          input: tc.input,
          expected: tc.output,
          actual: "",
          time: 0,
          memory: 0,
          error,
        });
        if (finalStatus === "Accepted") finalStatus = "Runtime Error";
        continue;
      }

      const actualOutput = (result.output || "").trim();
      const expectedOutput = (tc.output || "").trim();
      const tcTime = result.time || 0;
      const tcMemory = parseFloat(result.memory) || 0;

      totalTime += tcTime;
      if (tcMemory > maxMemory) maxMemory = tcMemory;

      let status = "Failed";
      if (result.status === "compilation_error") {
        status = "Compilation Error";
        if (finalStatus === "Accepted") finalStatus = "Compilation Error";
      } else if (result.status === "runtime_error") {
        status = "Runtime Error";
        if (finalStatus === "Accepted") finalStatus = "Runtime Error";
      } else if (result.status === "time_limit_exceeded") {
        status = "Time Limit Exceeded";
        if (finalStatus === "Accepted") finalStatus = "Time Limit Exceeded";
      } else if (result.status === "memory_limit_exceeded") {
        status = "Memory Limit Exceeded";
        if (finalStatus === "Accepted") finalStatus = "Memory Limit Exceeded";
      } else if (actualOutput === expectedOutput) {
        status = "Passed";
        passedCount++;
      } else {
        status = "Failed";
        if (finalStatus === "Accepted") finalStatus = "Wrong Answer";
      }

      allResults.push({
        status,
        input: tc.input,
        expected: expectedOutput,
        actual: actualOutput,
        time: tcTime,
        memory: tcMemory,
        error: result.error || null,
      });
    }

    if (passedCount === totalCases) {
      finalStatus = "Accepted";
    }

    console.log(
      `[Distributed Submit] Complete: ${passedCount}/${totalCases} passed, Status: ${finalStatus}`
    );

    // 6. Save Submission
    const submission = await Submission.create({
      userId,
      questionId,
      code,
      language,
      status: finalStatus,
      passedTestCases: passedCount,
      totalTestCases: totalCases,
      executionTime: totalTime,
      memoryUsed: maxMemory,
      timeComplexity: "Calculating...",
      spaceComplexity: "Calculating...",
    });

    // 7. Update User Stats
    const updateQuery = { $inc: { credits: -1 } };
    if (finalStatus === "Accepted") {
      updateQuery.$addToSet = { questionsSolved: questionId };

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const lastDate = user.lastSubmittedDate ? new Date(user.lastSubmittedDate) : null;
      let newStreak = user.streak || 0;

      if (!lastDate) {
        newStreak = 1;
      } else {
        const last = new Date(lastDate);
        last.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((today - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
        else if (diffDays === 0 && newStreak === 0) newStreak = 1;
      }

      const existingMax = user.maxStreak || user.streak || 0;
      const newMaxStreak = Math.max(existingMax, newStreak);

      updateQuery.$set = {
        lastSubmittedDate: now,
        streak: newStreak,
        maxStreak: newMaxStreak,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, { new: true });

    // 8. Send final done event
    sendEvent({
      type: "done",
      success: true,
      message: finalStatus,
      submissionId: submission._id,
      passed: passedCount,
      total: totalCases,
      remainingCredits: updatedUser.credits,
      streak: updatedUser.streak || 0,
      maxStreak: updatedUser.maxStreak || 0,
      results: allResults,
      executionTime: totalTime,
      memoryUsed: maxMemory,
      instancesUsed: queueStats.healthyInstances,
    });

    // 9. Background AI Analysis
    if (finalStatus === "Accepted" && process.env.GEMINI_API_KEY) {
      analyzeComplexityBackground(code, language, submission._id);
    }

    res.end();
  } catch (error) {
    console.error("[Distributed Submit] Error:", error);
    try {
      sendEvent({ type: "error", message: "Server Error" });
    } catch (e) { }
    res.end();
  }
};

// =============================================================================
// GET QUEUE STATUS - For frontend to check server load
// =============================================================================
module.exports.getServerStatus = async (req, res) => {
  try {
    const queueStats = await getQueueStats();
    const instanceStats = getInstanceStats();

    res.json({
      success: true,
      queue: {
        waiting: queueStats.waiting,
        active: queueStats.active,
        estimatedWait: queueStats.estimatedWaitSeconds,
      },
      instances: {
        healthy: instanceStats.healthyInstances,
        total: instanceStats.totalInstances,
        activeJobs: instanceStats.activeJobs,
        isBusy: instanceStats.isBusy,
      },
      message: instanceStats.isBusy
        ? "Servers are busy. Requests will be queued."
        : "Servers are available.",
    });
  } catch (error) {
    console.error("[Server Status] Error:", error);
    res.status(500).json({ success: false, message: "Error getting status" });
  }
};
