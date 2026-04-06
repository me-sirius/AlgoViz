const express = require("express");
const router = express.Router();
const {
  login,
  updateAvailability,
  getMentorProfile,
  getUpcomingSessions,
  getAllMentors,
  getSessionResume,
  testConnection,
  submitFeedback,
  getSessionsPendingFeedback,
  updateProfile,
  getUploadSignature,
  getMentorProfileById,
  submitSessionFeedback,
} = require("../controllers/mentor.controller");
const { mentorAuth } = require("../middlewares/mentorAuth");

router.post("/signin", login);
router.put("/availability", mentorAuth, updateAvailability);
// router.get("/profile/:id", getMentorProfile);
router.get("/sessions", mentorAuth, getUpcomingSessions);
router.get(
  "/sessions/pending-feedback",
  mentorAuth,
  getSessionsPendingFeedback
);

router.get("/sessions/:interviewId/resume", mentorAuth, getSessionResume);
router.get("/all", getAllMentors);
router.get("/test-connection", testConnection);
router.put("/profile/update", mentorAuth, updateProfile);
router.get("/upload/signature", mentorAuth, getUploadSignature);
router.put("/profile/update", mentorAuth, updateProfile);
router.get("/profile", mentorAuth, getMentorProfile);
router.get("/specificProfile/:id", getMentorProfileById);
router.post("/sessions/:sessionId/feedback", mentorAuth, submitSessionFeedback);
module.exports = router;
