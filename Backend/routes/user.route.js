const express = require("express");
const router = express.Router();
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  getUserDetails,
  forgotPassword,
  resetPassword,
  googleLogin,
  updateUserProfile,
  deductBalance,
  getAllNotification,
  markAllNotificationsRead,
  markNotificationRead,
  countUnReadNotification,
  premiumCheck,
  rotateSession,
  refreshToken,
  getUnlockStatus,
  getInterviewHistory,
  getUpcomingInterviews,
  getInterviewById,
  redeemReward,
  getLeaderboard,
} = require("../controllers/user.controller");
const { authUser } = require("../middlewares/auth");
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/getUserDetail/:id", authUser, getUserDetails);
router.get("/premiumCheck", authUser, premiumCheck);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/google-auth", googleLogin);
router.put("/profile/:id", authUser, updateUserProfile);
router.post("/deduct-balance", authUser, deductBalance);
router.post("/redeem", authUser, redeemReward);
router.get("/notifications", authUser, getAllNotification);
router.patch("/notifications/read-all", authUser, markAllNotificationsRead);
router.patch("/notifications/read/:id", authUser, markNotificationRead);
router.get("/notifications/unread-count", authUser, countUnReadNotification);
router.post("/rotate-session", authUser, rotateSession);
router.post("/refresh-token", refreshToken); // No authUser - handles own validation
router.get("/unlock-status/:questionId", authUser, getUnlockStatus);
router.get("/history", authUser, getInterviewHistory);
router.get("/upcoming-interviews", authUser, getUpcomingInterviews);
router.get("/interview/:id", authUser, getInterviewById);
router.get("/leaderboard", getLeaderboard);
module.exports = router;

