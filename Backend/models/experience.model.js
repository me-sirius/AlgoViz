const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    // --- Author Info ---
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model (Name, Avatar, College)
      required: true,
    },

    // --- Job Details ---
    company: {
      type: String,
      required: true,
      trim: true,
      index: true, // Speeds up search
    },
    logoURL: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
    },
    department: {
      type: String,
    },
    degreeType: {
      type: String,
      enum: ["B.Tech", "M.Tech", "Dual Degree"],
    },
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
    github: {
      type: String,
      trim: true,
      default: "",
    },
    batch: {
      type: String, // e.g., "2024"
      required: true,
    },
    location: {
      type: String, // e.g., "Bangalore"
      trim: true,
      default: "Not Specified",
    },
    experienceType: {
      type: String,
      enum: ["Internship", "Placement"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending", // <--- HIDDEN BY DEFAULT
      index: true,
    },
    internship: {
      roleType: { type: String }, // e.g. "Summer Intern", "6-Month"
      stipend: { type: String, trim: true, default: "Hidden" },
    },

    placement: {
      roleType: { type: String }, // e.g. "FTE", "On-Campus"
      ctc: { type: String, trim: true, default: "Hidden" },
    },
    // --- Interview Outcome ---
    verdict: {
      type: String,
      enum: ["Selected", "Rejected", "Pending"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // --- Content ---
    rounds: [
      {
        roundName: { type: String, required: true }, // e.g. "Round 1: OA"
        description: { type: String, required: true }, // The actual story
      },
    ],
    tips: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ], // ["SDE", "On-Campus"]

    // --- Stats & Engagement ---
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Keeping comments simple for now.
    // In a massive app, this would be a separate collection.
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        isApproved: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Status
    isFeatured: {
      type: Boolean,
      default: false, // Use this to pin top experiences on the page
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Important: Sends virtuals to frontend
    toObject: { virtuals: true },
  },
);

// --- VIRTUALS (Calculated Fields) ---

// Frontend expects 'upvoteCount', 'commentCount' numbers
experienceSchema.virtual("upvoteCount").get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

experienceSchema.virtual("commentCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

experienceSchema.virtual("viewCount").get(function () {
  return this.viewedBy ? this.viewedBy.length : 0;
});

// --- MIDDLEWARE ---

// Clean tags before saving (e.g. " SDE " -> "sde")
experienceSchema.pre("save", function (next) {
  if (this.isModified("tags") && this.tags) {
    this.tags = this.tags.map((t) => t.trim()).filter((t) => t.length > 0);
  }
  next();
});

module.exports = mongoose.model("Experience", experienceSchema);
