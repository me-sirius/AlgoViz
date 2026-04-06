const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Mock Assessment",
    },
    description: {
      type: String,
      default: "Test your skills with 30 MCQs and 2 DSA problems",
    },
    duration: {
      type: Number,
      default: 90, // in minutes
    },
    totalMCQs: {
      type: Number,
      default: 30,
    },
    totalDSA: {
      type: Number,
      default: 2,
    },
    mcqMarks: {
      type: Number,
      default: 1, // marks per MCQ
    },
    dsaMarks: {
      type: Number,
      default: 10, // marks per DSA
    },
    negativeMarking: {
      type: Number,
      default: 0.25, // negative marks per wrong MCQ
    },
    company: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Mixed",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
