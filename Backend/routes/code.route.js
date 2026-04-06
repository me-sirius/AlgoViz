const express = require("express");
const router = express.Router();
const {
  runningCode,
  submitCode, // Make sure this matches controller export name
  getUserSubmissions, // <--- Import the new history function
  submitCodeInQueue,
  getSubmissionById,
  submitCodeStream, // SSE streaming endpoint
  submitCodeDistributed, // Distributed multi-instance endpoint
  getServerStatus, // Server status endpoint
} = require("../controllers/code.controller");
const { authUser } = require("../middlewares/auth");

// Run Code (Single Case)
router.post("/run-new", authUser, runningCode);

// Public Run Code (for /ide no-auth playground)
router.post("/run-public", runningCode);

// Submit Code (All Cases) - Single instance
router.post("/submit-code", authUser, submitCode);
// router.post("/submit-code", authUser, submitCodeInQueue);

// Submit Code with SSE Streaming (Real-time batch progress)
router.post("/submit-stream", authUser, submitCodeStream);

// Submit Code Distributed (Multi-instance with load balancing)
// Use this for high-concurrency scenarios
router.post("/submit-distributed", authUser, submitCodeDistributed);

// Get Server Status (Queue depth, healthy instances)
router.get("/server-status", getServerStatus);

// Get Submission History (New Route)
router.get("/submissions/:questionId", authUser, getUserSubmissions);
router.get("/submissionsDetail:submissionId", authUser, getSubmissionById);
module.exports = router;

