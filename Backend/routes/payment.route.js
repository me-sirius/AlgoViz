const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  allTransaction,
  createInterviewOrder,
  verifyInterviewPayment,
} = require("../controllers/payment.controller");
const { authUser } = require("../middlewares/auth");

// Subscription Payment Routes
router.post("/subscribe/create-order", authUser, createOrder);
router.post("/subscribe/verify-payment", authUser, verifyPayment);

// Interview Payment Routes
router.post("/interview/create-order", authUser, createInterviewOrder);
router.post("/interview/verify-payment", authUser, verifyInterviewPayment);

// Transaction History
router.get("/transactionHistory/:userId", authUser, allTransaction);

module.exports = router;

