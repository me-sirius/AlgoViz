const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const testController = require("../controllers/test.controller");

// Get test questions (public - no auth required to view)
router.get("/start", testController.getTestQuestions);

// Submit test (optional auth - saves result if logged in)
router.post("/submit", authUser, testController.submitTest);

// Get user's test history (auth required)
router.get("/results", authUser, testController.getTestResults);

// Get specific result details (auth required)
router.get("/results/:id", authUser, testController.getResultById);

module.exports = router;
