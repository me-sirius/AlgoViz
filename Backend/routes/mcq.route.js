const express = require("express");
const router = express.Router();
const { getMCQs, getTestAnalysis, getMCQProgress, submitMCQAnswer, getSessionProgress, saveSessionProgress, getRecentlyVisited, trackRecentlyVisited, resetSessionProgress, toggleMcqMarked, resetMcqHistory } = require("../controllers/mcq.controller");
const { authUser } = require("../middlewares/auth");

// Public routes
router.get("/", authUser, getMCQs);
router.get("/result/:id", authUser, getTestAnalysis);

// Progress tracking routes
router.get("/progress", authUser, getMCQProgress);
router.post("/submit-answer", authUser, submitMCQAnswer);
router.post("/toggle-marked", authUser, toggleMcqMarked);

// Session progress routes (cross-device sync)
router.get("/session-progress", authUser, getSessionProgress);
router.post("/session-progress", authUser, saveSessionProgress);
router.post("/session-progress/reset", authUser, resetSessionProgress);
router.post("/reset-mcq-history", authUser, resetMcqHistory);

// Recently visited routes (cross-device sync)
router.get("/recently-visited", authUser, getRecentlyVisited);
router.post("/recently-visited", authUser, trackRecentlyVisited);

module.exports = router;

