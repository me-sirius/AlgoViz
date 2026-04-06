const express = require("express");
const router = express.Router();
const {
  createBugReport,
  getAllBugs,
  getOpenBugs,
  resolveBug,
} = require("../controllers/bug.controller");
const { authUser } = require("../middlewares/auth");
const { adminAuth } = require("../middlewares/adminAuth"); // Import the file above

// Import your auth middleware if you want to track WHO reported it
// const { protect, admin } = require("../middlewares/authMiddleware");

// Route to submit a bug (Public or Protected based on your need)
// If you want it public (even visitors can report):
router.post("/create", authUser, createBugReport);

// If you want to force login first:
// router.post("/", protect, createBugReport);

// Route to view all bugs (For Admin Dashboard)
// router.get("/", protect, admin, getAllBugs);
// For now, keeping it simple:
router.get("/", adminAuth, getAllBugs);
router.get("/open", adminAuth, getOpenBugs);
router.patch("/resolve/:id", adminAuth, resolveBug);
module.exports = router;
