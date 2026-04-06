const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster history lookup
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      // DEBIT = User paid money (e.g. Booking)
      // CREDIT = User received money (e.g. Refund or Wallet Topup)
      required: true,
    },
    category: {
      type: String,
      enum: [
        "PREMIUM_SUBSCRIPTION",
        "MOCK_INTERVIEW",
        "CREDIT_TOPUP",
        "REFUND",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true, // e.g. "Mock Interview with Ratan Kumar"
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING", "CANCELLED", "EXPIRED"],
      default: "PENDING",
    },
    // Useful for linking with Razorpay/Stripe later
    paymentId: {
      type: String,
      default: null,
    },
    // Optional: Link to specific entity if needed
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId, // Could be Interview ID or User ID
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// --- AUTO-DELETE LOGIC ---
// 1. 172800 seconds = 48 Hours (2 Days)
// 2. partialFilterExpression: ONLY delete if status is 'PENDING'
transactionSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 120,
    partialFilterExpression: { status: "PENDING" },
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
