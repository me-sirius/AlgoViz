const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    // Array of strings: ["RAM", "ROM", "Cache", "HDD"]
    options: [
      {
        type: String,
        required: true,
      },
    ],
    questionType: {
      type: String,
      enum: ["Practice", "Real"], // Restrict to these two values
      default: "Practice",
    },
    opportunityType: {
      type: String,
      enum: ["Internship", "Placement"],
      default: "Internship",
      required: true,
    },
    yearAsked: {
      type: Number,
      default: new Date().getFullYear(), // Defaults to current year
    },
    // We store the Index of the correct answer (0, 1, 2, or 3)
    correctOption: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 0 && v < this.options.length;
        },
        message: "Correct option index must be valid.",
      },
    },
    category: {
      type: String,
      required: true,
      default: "Core CS", // e.g., "OS", "DBMS", "CN", "Aptitude"
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    companies: [{ type: String }],
    explanation: {
      type: String,
      default: "", // Why is this option correct?
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MCQ", mcqSchema);
