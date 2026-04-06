const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    // --- 1. THE CANDIDATE (User) ---
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --- 2. THE INTERVIEWER (AI Persona or Human) ---
    // This allows you to say: "Interviewed by: Alex (Google AI)"
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer", // Points to a separate "Interviewer" collection
      required: true,
    },

    // --- 3. SESSION METADATA ---
    title: { type: String, required: true }, // e.g. "System Design: URL Shortener"
    topic: { type: String, required: true }, // e.g. "System Design"
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["In-Progress", "Completed", "Aborted"],
      default: "In-Progress",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // --- 4. THE COMPLETE RECORDING (Transcript) ---
    // Stores every message from "Intro" to "Conclusion"
    transcript: [
      {
        role: {
          type: String,
          enum: ["interviewer", "candidate", "system"],
          required: true,
        },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        // Optional: Store sentiment or specific feedback for this message
        metadata: { type: Object },
      },
    ],

    // --- 5. THE FINAL ARTIFACTS ---
    codeSnapshot: {
      language: { type: String, default: "javascript" },
      code: { type: String, default: "" },
      executionResult: { type: String }, // Output of their code
    },

    // --- 6. THE DEEP ANALYSIS (Feedback) ---
    feedback: {
      overallScore: { type: Number, min: 0, max: 100 },
      summary: String,

      // Detailed metrics
      metrics: {
        communication: { type: Number, min: 0, max: 10 },
        problemSolving: { type: Number, min: 0, max: 10 },
        codeQuality: { type: Number, min: 0, max: 10 },
        technicalKnowledge: { type: Number, min: 0, max: 10 },
      },

      // Chronological Feedback (Intro -> Conclusion)
      phaseBreakdown: {
        introduction: { type: String },
        problemAnalysis: { type: String },
        codingPhase: { type: String },
        testingPhase: { type: String },
        conclusion: { type: String },
      },

      strengths: [String],
      improvements: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
