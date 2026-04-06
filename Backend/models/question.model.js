const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // 1. Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    }, // e.g., "two-sum"
    description: {
      type: String,
      required: true,
    }, // Supports Markdown/HTML
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    yearAsked: {
      type: Number,
      default: new Date().getFullYear(), // Defaults to current year
    },
    opportunityType: {
      type: String,
      enum: ["Internship", "Placement"],
      default: "Internship",
      required: true,
    },
    timeEstimate: {
      type: String,
      default: "20 min",
    },
    // 2. Format Descriptions (What the user reads)
    inputFormat: {
      type: String,
      default:
        "The first line contains an integer T, the number of test cases.",
    },
    outputFormat: {
      type: String,
      default: "For each test case, print the answer in a new line.",
    },
    constraints: [
      { type: String }, // e.g. "1 <= T <= 100", "1 <= N <= 10^5"
    ],

    // 3. Execution Limits (Crucial for CP)
    timeLimit: {
      type: Number,
      default: 2,
    }, // in seconds (e.g., 2s)
    memoryLimit: {
      type: Number,
      default: 256,
    }, // in MB

    // 4. Test Cases - Single URL to Oracle storage
    // Oracle returns: [{ input, output, isPublic, explanation }, ...]
    testCasesUrl: {
      type: String,
      required: true,
    },

    // 5. Metadata
    tags: [{ type: String }], // e.g., "Arrays", "DP"
    companies: [{ type: String }],
    hints: [{ type: String }],
    solution: { type: String }, // Editorial
    // 6. Starter Code (Boilerplate)
    starterCode: [
      {
        language: { type: String, required: true }, // "cpp", "javascript"
        code: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
