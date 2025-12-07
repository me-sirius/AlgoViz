const express = require("express");
const router = express.Router();
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  getUserDetails,
  forgotPassword,
  getResetPassword,
  googleLogin,
} = require("../controllers/user.controller");
const { authUser } = require("../middlewares/auth");
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/getUserDetail/:id", authUser, getUserDetails);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", getResetPassword);
router.post("/google-auth", googleLogin);
module.exports = router;
