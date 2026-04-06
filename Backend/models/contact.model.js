const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["User", "Admin"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const contactSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true, // e.g., TKT-1001
    },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    subject: { type: String, default: "Support Request" },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    // The Conversation Array
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
