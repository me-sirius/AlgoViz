const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const {
  createExperience,
  getAllExperiences,
  getExperienceById,
  getRelatedExperiences,
  getComments,
  addComment,
  deleteComment,
  getMentors,
  bookMockInterview,
  updateExperience,
  upvoteExperience,
  viewsExperience,
  bookmarkExperience,
  getBookmarkStatus,
  getBookmarkedExperiences,
  getUploadSignature,
  deleteResume,
  updateSessionLinks,
  reserveSlot,
  releaseSlot,
  cleanupExpiredBookings,
} = require("../controllers/interview.controller");

// --- Experience Routes ---
router.post("/experience", authUser, createExperience);
router.get("/experiences", getAllExperiences);
router.get("/experience/:id", getExperienceById);
router.get("/experience/:id/related", getRelatedExperiences);
router.put("/experience/:id", authUser, updateExperience);
router.put("/experience/:id/upvote", authUser, upvoteExperience);
router.put("/experience/:id/views", authUser, viewsExperience);
router.put("/experience/:id/bookmark", authUser, bookmarkExperience);
router.get("/experience/:id/bookmark-status", authUser, getBookmarkStatus);
router.get("/bookmarks", authUser, getBookmarkedExperiences);

// --- Comment Routes ---
router.get("/experience/:id/comments", getComments);
router.post("/experience/:id/comment", authUser, addComment);
router.delete(
  "/experience/:experienceId/comment/:commentId",
  authUser,
  deleteComment,
);

// --- Mock Interview Routes ---
router.get("/mentors", getMentors);
router.post("/book", authUser, bookMockInterview);

// --- NEW: Slot Reservation Routes (Improved Payment Flow) ---
router.post("/reserve-slot", authUser, reserveSlot);
router.post("/release-slot", authUser, releaseSlot);
router.post("/cleanup-expired", cleanupExpiredBookings); // Can be called manually or by cron

// Resume uploader in cloudinary
router.get("/signature", authUser, getUploadSignature); // Must be logged in!
router.post("/delete-temp", authUser, deleteResume);

// Add this route for the Mentor's "Save" button
router.put("/update-links", updateSessionLinks);
module.exports = router;
