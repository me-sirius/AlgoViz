const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
      ],
      default: "Pending",
    },
    passedTestCases: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    runtime: {
      type: String, // e.g., "54ms"
      default: "N/A",
    },
    memory: {
      type: String, // e.g., "14MB"
      default: "N/A",
    },
    timeComplexity: {
      type: String,
      default: "N/A",
    },
    spaceComplexity: {
      type: String,
      default: "N/A",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
