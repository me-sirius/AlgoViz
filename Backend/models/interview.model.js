const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    // --- Participants ---
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },

    // --- Session Details ---
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    duration: { type: Number, default: 45 },
    topic: { type: String, default: "General Mock Interview" },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed", "Cancelled", "PENDING_PAYMENT"],
      default: "Pending",
    },
    paymentExpiryTime: { type: Date }, // For PENDING_PAYMENT status (15 min window)

    // --- Logistics ---
    meetingLink: { type: String, default: "" },
    googleDocLink: { type: String, default: "https://docs.new" },

    // --- Payment & Resume ---
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    amount: { type: Number, required: true },
    resume: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },

    // =======================================================
    // 1. MENTOR FEEDBACK (Evaluation of the Student)
    // =======================================================
    mentorFeedback: {
      isSubmitted: { type: Boolean, default: false },
      submittedAt: { type: Date },

      overallScore: { type: Number, min: 0, max: 100 },
      summary: { type: String, trim: true },

      metrics: {
        communication: { type: Number, min: 0, max: 10 },
        problemSolving: { type: Number, min: 0, max: 10 },
        technicalKnowledge: { type: Number, min: 0, max: 10 },
        codeQuality: { type: Number, min: 0, max: 10 },
        systemDesign: { type: Number, min: 0, max: 10 },
        culturalFit: { type: Number, min: 0, max: 10 },
      },

      strengths: { type: String, trim: true },
      improvements: { type: String, trim: true },

      recommendation: {
        type: String,
        enum: ["Strong Hire", "Hire", "Lean Hire", "Lean No Hire", "No Hire"],
      },

      privateNotes: { type: String, trim: true },

      // Code and notes from the interview session (mentor pastes here)
      codeNotes: { type: String, trim: true },
    },

    // =======================================================
    // 2. STUDENT FEEDBACK (Review of the Mentor)
    // =======================================================
    studentFeedback: {
      isSubmitted: { type: Boolean, default: false },
      submittedAt: { type: Date },

      rating: { type: Number, min: 1, max: 5 }, // 1 to 5 Stars
      comment: { type: String, trim: true }, // "Great mentor, very helpful!"
    },

    // =======================================================
    // 3. PAYMENT STATUS (Admin tracks mentor payments)
    // =======================================================
    mentorPaid: { type: Boolean, default: false },
    mentorPaidAt: { type: Date },
    paymentNote: { type: String, trim: true },
  },
  { timestamps: true }
);

interviewSchema.index({ studentId: 1, status: 1 });
interviewSchema.index({ mentorId: 1, status: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
