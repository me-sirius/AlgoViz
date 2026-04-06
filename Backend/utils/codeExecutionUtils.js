const DELIMITER = "\n###TC_END###";

// Function to wrap user's C++ code
const transformCppCode = (userCode) => {
  // 1. Rename user's main() to user_solve()
  // Handles: "int main()", "int main (void)", "int main(int argc, char** argv)"
  let safeCode = userCode.replace(/int\s+main\s*\([^)]*\)/, "int user_solve()");

  // 2. Protect against accidental process termination
  // (Optional but good: replaces exit(0) with return 0 so the loop continues)
  safeCode = safeCode.replace(/exit\s*\(\s*0\s*\)/g, "return 0");

  // 3. Append the Driver (The Batch Loop)
  const driverCode = `

    // --- BATCH DRIVER ADDED BY SYSTEM ---
    #include <iostream>
    #include <vector>
    #include <string>

    int main() {
        // Optimize I/O operations
        std::ios_base::sync_with_stdio(false);
        std::cin.tie(NULL);

        int t;
        if (std::cin >> t) {
            while(t--) {
                user_solve();
                // Print delimiter after every test case
                std::cout << "\\n###TC_END###" << std::endl;
            }
        }
        return 0;
    }
  `;

  return safeCode + driverCode;
};

const transformPythonCode = (userCode) => {
  // 1. Indent user code to put it inside a function
  // We add 4 spaces to every line
  const indentedCode = userCode
    .split("\n")
    .map((line) => "    " + line)
    .join("\n");

  // 2. Protect against exit() which would kill the whole batch
  // Replace sys.exit() or exit() with return
  let safeCode = indentedCode.replace(/sys\.exit\(\s*0?\s*\)/g, "return");
  safeCode = safeCode.replace(/exit\(\s*0?\s*\)/g, "return");

  // 3. Append the Driver
  const driverCode = `
import sys

# --- USER CODE WRAPPED ---
def user_solve():
${safeCode}

# --- BATCH DRIVER ADDED BY SYSTEM ---
if __name__ == "__main__":
    # Optimize Input
    input = sys.stdin.readline
    
    try:
        # Read number of test cases
        first_line = input().strip()
        if first_line:
            t = int(first_line)
            while t > 0:
                user_solve()
                # Print delimiter
                print("\\n###TC_END###")
                t -= 1
    except Exception as e:
        # Optional: Print error if driver fails, or just let stderr handle it
        pass
`;

  return driverCode;
};

const transformJsCode = (userCode) => {
  // 1. Protect against process.exit()
  const safeCode = userCode.replace(/process\.exit\(\s*0?\s*\)/g, "return");

  // 2. The Driver + Wrapper
  // We define a global 'cursor' so each run of user_solve() picks up where the last left off.
  return `
// --- BATCH DRIVER PREAMBLE ---
const fs = require('fs');

// Read all input at once
const _input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
let _cursor = 0;

// Helper function users can use to read one token (word/number) at a time
function readline() {
    return _cursor < _input.length ? _input[_cursor++] : '';
}
// Alias for common patterns
const next = readline;
const print = console.log;

// --- USER CODE WRAPPED ---
function user_solve() {
    ${safeCode}
}

// --- DRIVER EXECUTION ---
function main() {
    // Read T (test cases count)
    const tStr = readline();
    if (!tStr) return;
    
    let t = parseInt(tStr);
    
    while(t--) {
        user_solve();
        console.log("\\n###TC_END###");
    }
}

main();
`;
};
// --- MAIN EXPORTED FUNCTIONS ---

/**
 * Transforms user code into a "Batch" executable if supported.
 */
exports.prepareCodeForBatch = (language, code) => {
  const lang = language.toLowerCase();

  if (lang === "cpp" || lang === "c++") {
    return transformCppCode(code);
  }

  // Future: Add Python/Java transformers here
  // if (lang === "python") return transformPythonCode(code);

  return code; // Return original if no batching supported
};

/**
 * Merges all test case inputs into one string.
 * Format:
 * [Count]
 * [Input 1]
 * [Input 2] ...
 */
exports.prepareBatchInput = (testCases) => {
  const count = testCases.length;
  const combinedInputs = testCases.map((tc) => tc.input.trim()).join("\n");
  return `${count}\n${combinedInputs}`;
};

/**
 * Splits the raw Piston output back into individual results.
 */
exports.parseBatchOutput = (rawStdout, expectedCount) => {
  if (!rawStdout) return [];
  const parts = rawStdout.split("###TC_END###");
  // Clean up whitespace and ensure we don't get empty trailing parts
  return parts.map((p) => p.trim()).filter((_, i) => i < expectedCount);
};

/**
 * Splits an array into chunks of the specified size.
 * @param {Array} arr - The array to split
 * @param {number} size - The size of each chunk
 * @returns {Array[]} - Array of chunks
 */
exports.chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};
