const mongoose = require("mongoose");

const BugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["ui", "functional", "performance", "content", "other"], // Restricts values to these
      default: "other",
    },
    description: {
      type: String,
      required: true,
    },
    // Meta Data (Context)
    pageUrl: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String, // Stores browser/device info
    },
    // Optional: If you want to link it to a registered user
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Admin Management Fields
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    adminNotes: {
      type: String, // For you to write notes on how you fixed it
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Bug", BugSchema);
