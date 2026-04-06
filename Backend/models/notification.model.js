const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Optional sender (e.g., if an admin or another user triggered it)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // CHANGED: No more enums. You can type whatever you want here.
    // Examples: "STREAK", "SYSTEM", "PROMO", "HACKATHON"
    type: {
      type: String,
      required: true,
      default: "SYSTEM",
    },

    // CHANGED: Flexible visual styling.
    // You can pass "danger", "success", "purple-gradient", etc.
    variant: {
      type: String,
      default: "default",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Flexible data payload for frontend routing
    data: {
      url: { type: String, default: "" },
      entityId: { type: String }, // Optional ID (e.g. specific problem ID)
      entityType: { type: String }, // Optional context (e.g. "question")
      image: { type: String }, // Optional image URL for rich notifications
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // Keeping priority is useful for sorting, but let's make it flexible too
    priority: {
      type: String,
      default: "MEDIUM", // You can send "HIGH", "CRITICAL", etc.
    },
  },
  { timestamps: true }
);

// PERFORMANCE: Index for fetching notifications quickly
notificationSchema.index({ recipient: 1, isRead: 1 });

// CLEANUP: Auto-delete notifications older than 60 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5184000 });

module.exports = mongoose.model("Notification", notificationSchema);
