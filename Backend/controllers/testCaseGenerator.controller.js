const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // You might need: npm install uuid
const os = require("os");
const connectDB = require("../db/db");
// AI SDK removed as requested.

// generateTestCases removed as requested.
// generateAutoTestCases preserved below.
// --- HELPER: Random Input Generator ---
// localhost wala
// exports.generateAutoTestCases = async (req, res) => {
//   // 1. Receive BOTH scripts from frontend
//   const { inputGenerator, referenceSolution } = req.body;
//   console.log(
//     "Generate krane aaya hu please generate kr do",
//     inputGenerator,
//     referenceSolution
//   );
//   if (!inputGenerator || !referenceSolution) {
//     return res.status(400).json({
//       message:
//         "Both Input Generator and Reference Solution scripts are required.",
//     });
//   }

//   // 2. Setup Temp Directory
//   const tempDir = path.join(__dirname, "../temp_scripts");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

//   // Create unique filenames for this request
//   const uniqueId = uuidv4();
//   const genScriptPath = path.join(tempDir, `${uniqueId}_gen.js`);
//   const solScriptPath = path.join(tempDir, `${uniqueId}_sol.js`);

//   try {
//     // 3. Save both scripts to temporary files
//     fs.writeFileSync(genScriptPath, inputGenerator);
//     fs.writeFileSync(solScriptPath, referenceSolution);

//     const testCases = [];
//     const NUM_CASES = 10; // Generate 10 test cases

//     console.log(
//       `[Backend] Generating ${NUM_CASES} cases using custom scripts...`
//     );

//     // 4. Generate Cases in Parallel (Faster)
//     // We create an array of 10 promises and run them all at once
//     const promises = Array.from({ length: NUM_CASES }).map(async (_, index) => {
//       // Step A: Run Generator Script to get INPUT
//       const inputData = await new Promise((resolve, reject) => {
//         exec(
//           `node "${genScriptPath}"`,
//           { timeout: 2000 },
//           (err, stdout, stderr) => {
//             if (err)
//               reject(new Error(`Generator Error: ${stderr || err.message}`));
//             else resolve(stdout.trim());
//           }
//         );
//       });

//       // Step B: Run Solution Script to get OUTPUT (Feeding input via stdin)
//       const outputData = await new Promise((resolve, reject) => {
//         const child = exec(
//           `node "${solScriptPath}"`,
//           { timeout: 2000 },
//           (err, stdout, stderr) => {
//             if (err)
//               reject(new Error(`Solution Error: ${stderr || err.message}`));
//             else resolve(stdout.trim());
//           }
//         );

//         // Write the input string to the Solution's Standard Input
//         child.stdin.write(inputData);
//         child.stdin.end();
//       });

//       return {
//         input: inputData,
//         output: outputData,
//         isPublic: index < 2, // Mark first 2 as public examples
//         explanation: index < 2 ? "Generated Example" : "",
//       };
//     });

//     // Wait for all 10 cases to finish
//     const results = await Promise.all(promises);

//     // 5. Cleanup: Delete temp files
//     if (fs.existsSync(genScriptPath)) fs.unlinkSync(genScriptPath);
//     if (fs.existsSync(solScriptPath)) fs.unlinkSync(solScriptPath);

//     // 6. Respond
//     res.status(200).json({
//       success: true,
//       data: results,
//     });
//   } catch (error) {
//     console.error("Custom Gen Error:", error);
//     // Cleanup on error
//     if (fs.existsSync(genScriptPath)) fs.unlinkSync(genScriptPath);
//     if (fs.existsSync(solScriptPath)) fs.unlinkSync(solScriptPath);

//     res.status(500).json({
//       message: "Generation Failed",
//       error: error.message,
//     });
//   }
// };
exports.generateAutoTestCases = async (req, res) => {
  const { inputGenerator, referenceSolution } = req.body;

  if (!inputGenerator || !referenceSolution) {
    return res.status(400).json({ message: "Both scripts are required." });
  }

  // Use system temp directory - /tmp on Vercel
  const tempDir = os.tmpdir();
  const uniqueId = uuidv4();
  const genScriptPath = path.join(tempDir, `${uniqueId}_gen.js`);
  const solScriptPath = path.join(tempDir, `${uniqueId}_sol.js`);

  try {
    // Write scripts to temp
    fs.writeFileSync(genScriptPath, inputGenerator);
    fs.writeFileSync(solScriptPath, referenceSolution);

    const NUM_CASES = 30; // Keep low to avoid MongoDB 16MB document limit
    console.log(`[TestGen] Generating ${NUM_CASES} cases...`);

    const results = [];
    let failedCases = 0;

    // Generate cases sequentially (more reliable)
    for (let i = 0; i < NUM_CASES; i++) {
      try {
        // Step 1: Run generator to get input
        const inputData = await new Promise((resolve, reject) => {
          exec(`node "${genScriptPath}"`, { timeout: 5000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
              console.error(`[Case ${i + 1}] Gen Error:`, stderr || err.message);
              reject(new Error(stderr || err.message));
            } else {
              resolve(stdout.trim());
            }
          });
        });

        // Step 2: Write input to temp file
        const inputFile = path.join(tempDir, `${uniqueId}_input_${i}.txt`);
        fs.writeFileSync(inputFile, inputData);

        // Step 3: Run solution with input file redirect
        const outputData = await new Promise((resolve, reject) => {
          const cmd = process.platform === 'win32'
            ? `type "${inputFile}" | node "${solScriptPath}"`
            : `cat "${inputFile}" | node "${solScriptPath}"`;

          exec(cmd, { timeout: 10000, shell: true, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
            // Cleanup input file
            try { fs.unlinkSync(inputFile); } catch (e) { }

            if (err) {
              console.error(`[Case ${i + 1}] Sol Error:`, stderr || err.message);
              reject(new Error(stderr || err.message));
            } else {
              resolve(stdout.trim());
            }
          });
        });

        results.push({
          input: inputData,
          output: outputData,
          isPublic: false, // ALL generated cases are hidden - public ones come from image extraction
          explanation: "",
        });

        console.log(`[Case ${i + 1}] ✓ Generated`);

      } catch (caseError) {
        failedCases++;
        console.error(`[Case ${i + 1}] ✗ Failed:`, caseError.message);
        // Continue with next case
      }
    }

    // Cleanup script files
    try { fs.unlinkSync(genScriptPath); } catch (e) { }
    try { fs.unlinkSync(solScriptPath); } catch (e) { }

    if (results.length === 0) {
      return res.status(500).json({
        success: false,
        message: "All test cases failed. Check your scripts for errors."
      });
    }

    console.log(`[TestGen] Done: ${results.length}/${NUM_CASES} successful`);

    // Split into public (for UI display) and hidden (stored but not rendered)
    const publicCases = results.filter(tc => tc.isPublic);
    const hiddenCases = results.filter(tc => !tc.isPublic);

    res.status(200).json({
      success: true,
      publicCases,      // These will be displayed in frontend UI
      hiddenCases,      // These won't be rendered (prevents browser freeze)
      summary: {
        total: results.length,
        public: publicCases.length,
        hidden: hiddenCases.length
      },
      failed: failedCases
    });

  } catch (error) {
    console.error("[TestGen] Fatal Error:", error);
    // Cleanup
    try { fs.unlinkSync(genScriptPath); } catch (e) { }
    try { fs.unlinkSync(solScriptPath); } catch (e) { }

    res.status(500).json({
      success: false,
      message: "Generation Failed",
      error: error.message,
    });
  }
};
// console.log(
//     "Generate krane aaya hu please generate kr do",
//     inputGenerator,
//     referenceSolution
//   );
