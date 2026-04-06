const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: String,
      default: "mock-test-1",
    },
    // MCQ Responses
    mcqResponses: [
      {
        questionId: { type: Number, required: true },
        questionText: { type: String },
        selectedOption: { type: Number }, // null if skipped
        correctOption: { type: Number },
        isCorrect: { type: Boolean },
        timeTaken: { type: Number }, // seconds spent
      },
    ],
    // DSA Responses
    dsaResponses: [
      {
        questionId: { type: Number, required: true },
        title: { type: String },
        code: { type: String },
        language: { type: String },
        testCasesPassed: { type: Number, default: 0 },
        totalTestCases: { type: Number },
        score: { type: Number, default: 0 },
      },
    ],
    // Scores
    mcqScore: { type: Number, default: 0 },
    dsaScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 50 },
    // Stats
    correctMCQs: { type: Number, default: 0 },
    wrongMCQs: { type: Number, default: 0 },
    skippedMCQs: { type: Number, default: 0 },
    // Time
    startTime: { type: Date },
    endTime: { type: Date },
    timeTaken: { type: Number },
    // Status
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Expired"],
      default: "In Progress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestResult", testResultSchema);
