/**
 * Judge0 Helper Module for AlgoViz
 *
 * Provides two modes of execution:
 * 1. Single submission (Run Code button) — direct Judge0 submission
 * 2. Multi-test-case submission (Submit button) — compile-once runner script
 *
 * All requests authenticated via X-Auth-Token header.
 */

const axios = require("axios");
const archiver = require("archiver");
const { Readable } = require("stream");

// =============================================================================
// Configuration
// =============================================================================
const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || "";

// Judge0 Language IDs
const LANGUAGE_IDS = {
  c: 50, // C (GCC 9.2.0)
  cpp: 54, // C++ (GCC 9.2.0)
  "c++": 54,
  python: 71, // Python 3 (3.8.1)
  py: 71,
  javascript: 63, // JavaScript (Node.js 12.14.0)
  js: 63,
  java: 62, // Java (OpenJDK 13.0.1)
  bash: 46, // Bash (5.0.0)
};

// Judge0 Status IDs → AlgoViz verdicts
const STATUS_MAP = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error (SIGSEGV)",
  8: "Runtime Error (SIGXFSZ)",
  9: "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)",
  11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)",
  13: "Internal Error",
  14: "Exec Format Error",
};

// Compile commands for each language
const COMPILE_COMMANDS = {
  c: "gcc -O2 -o solution solution.c",
  cpp: "g++ -O2 -o solution solution.cpp",
  "c++": "g++ -O2 -o solution solution.cpp",
  java: "javac Solution.java",
  python: null, // interpreted
  py: null,
  javascript: null,
  js: null,
};

// Run commands for each language
const RUN_COMMANDS = {
  c: "./solution",
  cpp: "./solution",
  "c++": "./solution",
  java: "java Solution",
  python: "python3 solution.py",
  py: "python3 solution.py",
  javascript: "node solution.js",
  js: "node solution.js",
};

// Source file names for each language
const SOURCE_FILES = {
  c: "solution.c",
  cpp: "solution.cpp",
  "c++": "solution.cpp",
  java: "Solution.java",
  python: "solution.py",
  py: "solution.py",
  javascript: "solution.js",
  js: "solution.js",
};

// =============================================================================
// HTTP Helper
// =============================================================================
function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_AUTH_TOKEN) {
    headers["X-Auth-Token"] = JUDGE0_AUTH_TOKEN;
  }
  return headers;
}

// =============================================================================
// 1. Single Submission (Run Code button)
// =============================================================================
/**
 * Create a single Judge0 submission for the "Run Code" button.
 * Submits directly in the user's language, waits for result.
 *
 * @param {string} language - Language name (c, cpp, python, javascript)
 * @param {string} code - User's source code
 * @param {string} stdin - Input for the program
 * @param {number} timeLimit - CPU time limit in seconds
 * @param {number} memoryLimit - Memory limit in KB
 * @returns {Object} { status, output, error, time, memory }
 */
async function createSingleSubmission(
  language,
  code,
  stdin,
  timeLimit = 5,
  memoryLimit = 256000,
) {
  const langKey = language.toLowerCase();
  const languageId = LANGUAGE_IDS[langKey];

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  console.log(`[Judge0] Single submission: lang=${langKey} (id=${languageId})`);

  const response = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id: languageId,
      stdin: stdin || "",
      cpu_time_limit: Math.min(timeLimit, 15),
      memory_limit: Math.min(memoryLimit, 512000),
    },
    {
      headers: getHeaders(),
      timeout: 60000,
    },
  );

  const result = response.data;

  return {
    status: mapStatusToVerdict(result.status?.id),
    output: result.stdout || "",
    error: result.stderr || result.compile_output || "",
    time: parseFloat(result.time || 0) * 1000, // Convert to ms
    memory: ((result.memory || 0) / 1024).toFixed(2), // Convert KB to MB
  };
}

// =============================================================================
// 2. Multi-Test-Case Submission (Submit button) — Compile Once, Run All
// =============================================================================
/**
 * Create a runner-script-based submission that compiles user code ONCE
 * and loops through all test cases.
 *
 * Architecture:
 *   1. Pack user code + test case files into a tar.gz (additional_files)
 *   2. Generate a Bash runner script that: compile → loop → compare → output JSON
 *   3. Send as a single Bash submission to Judge0
 *   4. Parse the JSON output for per-test-case results
 *
 * @param {string} language - User's language
 * @param {string} userCode - User's source code
 * @param {Array} testCases - [{input, output}] from Oracle storage
 * @param {number} timeLimit - Per-test-case time limit in seconds
 * @param {number} memoryLimit - Memory limit in KB
 * @returns {Object} { compilationError, results: [{verdict, time, output, expected, error}] }
 */
async function createRunnerSubmission(
  language,
  userCode,
  testCases,
  timeLimit = 5,
  memoryLimit = 256000,
) {
  const langKey = language.toLowerCase();
  const compileCmd = COMPILE_COMMANDS[langKey];
  const runCmd = RUN_COMMANDS[langKey];
  const sourceFile = SOURCE_FILES[langKey];

  if (!runCmd || !sourceFile) {
    throw new Error(`Unsupported language for runner: ${language}`);
  }

  const numTests = testCases.length;
  console.log(`[Judge0] Runner submission: lang=${langKey}, tests=${numTests}`);

  // 1. Create the tar.gz archive with user code + test case files
  const archiveBase64 = await createArchive(userCode, sourceFile, testCases);

  // 2. Generate the Bash runner script
  const runnerScript = generateRunnerScript(
    langKey,
    compileCmd,
    runCmd,
    sourceFile,
    numTests,
    timeLimit,
  );

  // 3. Submit to Judge0 as a Bash script with additional_files
  // Wall time needs to be generous: compile time + (numTests * timeLimit) + overhead
  const totalWallTime = Math.min(numTests * timeLimit + 30, 120);

  const response = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: runnerScript,
      language_id: 46, // Bash
      additional_files: archiveBase64,
      cpu_time_limit: totalWallTime,
      wall_time_limit: totalWallTime + 10,
      memory_limit: Math.min(memoryLimit, 512000),
      max_file_size: 4096,
    },
    {
      headers: getHeaders(),
      timeout: 180000, // 3 min max wait
    },
  );

  const result = response.data;

  // 4. Check for Judge0-level errors (sandbox crash, etc.)
  if (result.status?.id >= 6 && result.status?.id !== 6) {
    // Not a user compilation error — it's a sandbox/system error
    if (result.status?.id === 6) {
      return {
        compilationError: result.compile_output || "Compilation Error",
        results: testCases.map((tc, idx) => ({
          testCase: idx + 1,
          verdict: "CE",
          passed: false,
          output: "",
          expected: tc.output || "",
          time: 0,
          memory: 0,
          error: result.compile_output || "Compilation Error",
        })),
      };
    }
  }

  // 5. Parse the JSON output from the runner script
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";

  console.log(`[Judge0] Runner stdout length: ${stdout.length}`);
  console.log(`[Judge0] Runner stderr: ${stderr.substring(0, 200)}`);

  try {
    const parsed = JSON.parse(stdout.trim());

    // Handle compilation error from runner script
    if (parsed.status === "CE") {
      return {
        compilationError: parsed.error || "Compilation Error",
        results: testCases.map((tc, idx) => ({
          testCase: idx + 1,
          verdict: "CE",
          passed: false,
          output: "",
          expected: tc.output || "",
          time: 0,
          memory: 0,
          error: parsed.error || "Compilation Error",
        })),
      };
    }

    // Map results array
    const results = (parsed.results || []).map((r, idx) => {
      const tc = testCases[idx] || {};
      return {
        testCase: idx + 1,
        verdict: r.verdict || "RE",
        passed: r.verdict === "AC",
        output: r.output || "",
        expected: r.expected || tc.output || "",
        time: r.time || 0,
        memory: r.memory || 0,
        error: r.error || "",
      };
    });

    return {
      compilationError: null,
      results,
    };
  } catch (parseError) {
    console.error(
      `[Judge0] Failed to parse runner output:`,
      parseError.message,
    );
    console.error(`[Judge0] Raw stdout:`, stdout.substring(0, 500));

    // If Judge0 returned a non-Accepted status, that's the real error
    if (result.status?.id === 5) {
      return {
        compilationError: null,
        results: testCases.map((tc, idx) => ({
          testCase: idx + 1,
          verdict: "TLE",
          passed: false,
          output: "",
          expected: tc.output || "",
          time: 0,
          memory: 0,
          error: "Time Limit Exceeded (overall)",
        })),
      };
    }

    return {
      compilationError: null,
      results: testCases.map((tc, idx) => ({
        testCase: idx + 1,
        verdict: "RE",
        passed: false,
        output: "",
        expected: tc.output || "",
        time: 0,
        memory: 0,
        error: `Runner script error: ${stderr.substring(0, 200) || stdout.substring(0, 200) || "Unknown error"}`,
      })),
    };
  }
}

// =============================================================================
// Helper: Create tar.gz archive with user code + test cases
// =============================================================================
async function createArchive(userCode, sourceFile, testCases) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver("zip");

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString("base64"));
    });
    archive.on("error", reject);

    // Add user's source code
    archive.append(userCode, { name: sourceFile });

    // Add test case files
    testCases.forEach((tc, i) => {
      archive.append(tc.input || "", { name: `tests/input_${i}.txt` });
      archive.append(tc.output || tc.expectedOutput || "", {
        name: `tests/expected_${i}.txt`,
      });
    });

    archive.finalize();
  });
}

// =============================================================================
// Helper: Generate Bash runner script
// =============================================================================
function generateRunnerScript(
  langKey,
  compileCmd,
  runCmd,
  sourceFile,
  numTests,
  timeLimit,
) {
  const needsCompile = compileCmd !== null;

  let script = `#!/bin/bash
set -e

# Move to working directory (Judge0 extracts additional_files here)
cd /box

`;

  // Compilation step (only for compiled languages)
  if (needsCompile) {
    script += `# ===================== COMPILE =====================
${compileCmd} 2>compile_err.txt
if [ $? -ne 0 ]; then
  compile_err=$(cat compile_err.txt | head -10 | tr '"' "'" | tr '\\n' ' ')
  echo '{"status":"CE","error":"'"$compile_err"'"}'
  exit 0
fi

`;
  }

  // Test case execution loop
  script += `# ===================== RUN TEST CASES =====================
NUM_TESTS=${numTests}
TIME_LIMIT=${timeLimit}
RESULTS=""

for i in $(seq 0 $((NUM_TESTS-1))); do
  input_file="tests/input_\${i}.txt"
  expected_file="tests/expected_\${i}.txt"
  output_file="output_\${i}.txt"
  err_file="err_\${i}.txt"
  
  # Get start time in milliseconds
  start_ms=$(($(date +%s%N)/1000000))
  
  # Run with timeout
  timeout \${TIME_LIMIT}s ${runCmd} < "$input_file" > "$output_file" 2>"$err_file"
  exit_code=$?
  
  # Get end time
  end_ms=$(($(date +%s%N)/1000000))
  time_ms=$((end_ms - start_ms))
  
  # Read outputs (truncate to prevent huge JSON)
  actual=$(head -c 10000 "$output_file" 2>/dev/null | tr '"' "'" | tr '\\\\' '/' || echo "")
  expected=$(head -c 10000 "$expected_file" 2>/dev/null | tr '"' "'" | tr '\\\\' '/' || echo "")
  error=$(head -c 1000 "$err_file" 2>/dev/null | tr '"' "'" | tr '\\n' ' ' | tr '\\\\' '/' || echo "")
  
  # Trim trailing whitespace/newlines for comparison
  actual_trimmed=$(echo "$actual" | sed 's/[[:space:]]*$//')
  expected_trimmed=$(echo "$expected" | sed 's/[[:space:]]*$//')
  
  # Determine verdict
  if [ $exit_code -eq 124 ]; then
    verdict="TLE"
  elif [ $exit_code -ne 0 ]; then
    verdict="RE"
  elif [ "$actual_trimmed" = "$expected_trimmed" ]; then
    verdict="AC"
  else
    verdict="WA"
  fi
  
  # Build JSON entry
  entry='{"verdict":"'"$verdict"'","time":'"$time_ms"',"output":"'"$actual_trimmed"'","expected":"'"$expected_trimmed"'","error":"'"$error"'"}'
  
  if [ $i -eq 0 ]; then
    RESULTS="$entry"
  else
    RESULTS="$RESULTS,$entry"
  fi
done

# Output final JSON
echo '{"status":"OK","results":['"$RESULTS"']}'
`;

  return script;
}

// =============================================================================
// Helper: Map Judge0 status ID to AlgoViz verdict string
// =============================================================================
function mapStatusToVerdict(statusId) {
  switch (statusId) {
    case 3:
      return "success";
    case 4:
      return "wrong_answer";
    case 5:
      return "time_limit_exceeded";
    case 6:
      return "compilation_error";
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return "runtime_error";
    case 13:
    case 14:
      return "internal_error";
    default:
      return "error";
  }
}

// =============================================================================
// Health check
// =============================================================================
async function checkJudge0Health() {
  try {
    const response = await axios.get(`${JUDGE0_URL}/about`, {
      headers: getHeaders(),
      timeout: 5000,
    });
    return { healthy: true, version: response.data?.version };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

// =============================================================================
// Exports
// =============================================================================
module.exports = {
  createSingleSubmission,
  createRunnerSubmission,
  checkJudge0Health,
  LANGUAGE_IDS,
  JUDGE0_URL,
};
