const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // --- Basic Info ---
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // Not required for Google Auth users
    },
    memberSince: {
      type: String,
      default: new Date().toISOString(),
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },

    // --- Social Links ---
    website: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },

    // --- Skills & Preferences ---
    skills: [{ type: String }],
    defaultLanguage: { type: String, default: "cpp" },
    theme: { type: String, default: "vs-dark" },

    // --- Security & Verification ---
    isVerified: {
      type: Boolean,
      default: false,
    },
    authMethod: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    premiumExpiryDate: {
      type: Date, // Stores full date + time + seconds
      default: null,
    },
    otp: { type: String, default: null },
    otpExpiry: { type: Date },

    // --- Password Reset Fields ---
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpire: {
      type: Date,
      default: undefined,
    },
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
    questionsSolved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    // Questions user has submitted at least once (even if failed)
    questionsAttempted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    streak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
    lastSubmittedDate: {
      type: Date,
      default: Date.now,
    },
    // --- Monetization & Credits ---
    credits: {
      type: Number,
      default: 3,
    },
    freeInterviews: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 200,
    },
    lastDailyRefill: {
      type: Date,
      default: Date.now,
    },
    currentSessionToken: {
      type: String,
      default: null,
    },
    currentSessionId: { type: String, default: null },
    lastRotationTime: { type: Date, default: Date.now },
    solvedMCQs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MCQ",
      },
    ],
    // MCQ Practice Progress
    mcqProgress: {
      totalSolved: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      maxStreak: { type: Number, default: 0 },
      lastPracticeDate: { type: Date, default: null },
      dailyPracticeCount: { type: Number, default: 0 },
      lastDailyReset: { type: Date, default: null },
    },
    // MCQ Session Progress - per category (for cross-device sync)
    mcqSessionProgress: {
      type: Map,
      of: {
        lastQuestionIndex: { type: Number, default: 0 },
        answeredQuestions: { type: Map, of: mongoose.Schema.Types.Mixed },
        updatedAt: { type: Date, default: Date.now },
      },
      default: {},
    },
    // MCQ Answer History - stores correct/wrong/marked status per question
    mcqAnswerHistory: {
      type: Map,
      of: {
        isCorrect: { type: Boolean, default: false },
        isMarked: { type: Boolean, default: false },
        selectedAnswer: { type: Number, default: null },
        answeredAt: { type: Date, default: Date.now },
        pointsAwarded: { type: Boolean, default: false }, // Tracks if mastery points were given
      },
      default: {},
    },
    googleId: { type: String },
    upvotedExperiences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
      },
    ],
    bookmarkedExperiences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
      },
    ],
    unlockedContent: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        unlockedItems: [{ type: String }], // e.g., ["hint1", "solution"]
      },
    ],
    upcomingInterviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
      },
    ],
    // MCQ Recently Visited - for cross-device sync
    mcqRecentlyVisited: [
      {
        type: { type: String, enum: ["practice", "company"] },
        id: { type: String },
        name: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

userSchema.methods.generateAuthToken = function (sessionId) {
  const token = jwt.sign(
    { id: this._id, sessionId: sessionId },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    },
  );
  return token;
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  console.log("Comparing passwords:", enteredPassword, this.password);
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("Password match result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// Generate 6-digit OTP
userSchema.methods.generateOTP = function () {
  console.log("generate krne aaya hu");
  const otp = crypto.randomInt(100000, 999999).toString();
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }

  if (Date.now() > this.otpExpiry) {
    return false; // OTP expired
  }

  return this.otp === enteredOTP;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
