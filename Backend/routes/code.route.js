const express = require("express");
const router = express.Router();
const axios = require("axios");
const SPHERE_ENDPOINT = process.env.SPHERE_ENDPOINT; // e.g., 'https://<your-id>.compilers.sphere-engine.com/api/v4'
const SPHERE_TOKEN = process.env.SPHERE_TOKEN;
const LANGUAGE_MAP = {
  javascript: 56, // Node.js
  python: 116, // Python 3
  cpp: 1, // C++ (gcc)
  java: 10, // Java
};

router.post("/run", async (req, res) => {
  const { code, language } = req.body;
  const compilerId = LANGUAGE_MAP[language] || 56; // Default to Node.js
  console.log("Received code execution request:", { language, compilerId });
  try {
    // --- STEP 1: SUBMIT CODE ---
    // Docs: Screenshot 2 (Creating a submission)
    const submissionPayload = {
      compilerId: compilerId,
      source: code,
      input: "", // Add custom input here if needed
    };
    console.log("Submitting code to Sphere Engine:", submissionPayload);
    const submitResponse = await axios.post(
      `${SPHERE_ENDPOINT}/submissions?access_token=${SPHERE_TOKEN}`,
      submissionPayload
    );
    console.log("Submission Response:", submitResponse.data);
    const submissionId = submitResponse.data.id;
    console.log("Submission ID:", submissionId);
    // --- STEP 2: POLL FOR STATUS ---
    // Docs: Screenshot 3 (Checking the result)
    let resultData = null;
    let attempts = 0;

    while (attempts < 10) {
      // Wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await axios.get(
        `${SPHERE_ENDPOINT}/submissions/${submissionId}?access_token=${SPHERE_TOKEN}`
      );

      // Check if execution is finished
      if (statusResponse.data.executing === false) {
        resultData = statusResponse.data;
        break;
      }
      attempts++;
    }

    if (!resultData) {
      return res
        .status(500)
        .json({ error: "Timeout: Code took too long to run." });
    }

    // --- STEP 3: FETCH THE OUTPUT STREAM ---
    // Screenshot 3 shows the output is a URI inside "streams.output.uri"
    let finalOutput = "";

    // Check for Standard Output (stdout)
    if (resultData.result.streams.output) {
      const outputUri = resultData.result.streams.output.uri;
      const outputReq = await axios.get(outputUri);
      finalOutput = outputReq.data;
    }
    // Check for Errors (stderr)
    else if (resultData.result.streams.error) {
      const errorUri = resultData.result.streams.error.uri;
      const errorReq = await axios.get(errorUri);
      finalOutput = "Error:\n" + errorReq.data;
    }
    // Check for Compilation Errors (cmpinfo)
    else if (resultData.result.streams.cmpinfo) {
      const cmpUri = resultData.result.streams.cmpinfo.uri;
      const cmpReq = await axios.get(cmpUri);
      finalOutput = "Compilation Error:\n" + cmpReq.data;
    }

    // Return the final text to your Frontend
    res.json({
      output: finalOutput,
      status: resultData.result.status.name,
      memory: resultData.result.memory,
      time: resultData.result.time,
    });
  } catch (error) {
    console.error(
      "Sphere Engine Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Execution Failed", details: error.message });
  }
});
module.exports = router;
