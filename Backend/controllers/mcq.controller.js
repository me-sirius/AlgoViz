const MCQ = require("../models/mcq.model");
const TestResult = require("../models/testResult.model");
const User = require("../models/user.model");
// GET MCQs with filters
const connectDB = require("../db/db");
module.exports.getMCQs = async (req, res) => {
  try {
    // connectDB();
    const { category, type, opportunityType, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    console.log(
      "category:", category,
      "type:", type,
      "opportunityType:", opportunityType,
      "page:", pageNum,
      "limit:", limitNum
    );
    
    // Build query object
    let query = {};

    if (category) query.category = category;
    if (type) query.questionType = type; // "Practice" or "Real"
    // Support both old field (questionSource) and new field (opportunityType)
    if (opportunityType) {
      query.$or = [
        { opportunityType: opportunityType },
        { questionSource: opportunityType }
      ];
    }

    // Get total count for pagination
    const total = await MCQ.countDocuments(query);

    // Fetch questions with pagination (sorted by year asked, newest first)
    const questions = await MCQ.find(query)
      .sort({ yearAsked: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Get user's MCQ answer history if authenticated
    let mcqAnswerHistory = {};
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id).select("mcqAnswerHistory");
      if (user && user.mcqAnswerHistory) {
        // Convert Map to plain object
        mcqAnswerHistory = Object.fromEntries(user.mcqAnswerHistory);
      }
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total,
      data: questions,
      mcqAnswerHistory,
    });
  } catch (error) {
    console.error("Fetch MCQ Error:", error);
    res.status(500).json({ message: "Failed to fetch MCQs" });
  }
};

module.exports.getRecentResults = async (req, res) => {
  try {
    // connectDB();
    const { category } = req.query;
    const userId = req.user._id;

    const results = await TestResult.find({ user: userId, category })
      .sort({ dateTaken: -1 }) // Newest first
      .limit(10); // Carousel limit

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports.getTestAnalysis = async (req, res) => {
  try {
    // connectDB();
    const result = await TestResult.findById(req.params.id);
    if (!result)
      return res.status(404).json({ success: false, message: "Not found" });

    // Security check: Ensure the user owns this result
    if (result.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get MCQ Progress for authenticated user
module.exports.getMCQProgress = async (req, res) => {
  try {
    // connectDB();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if daily reset is needed (new day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = user.mcqProgress?.lastDailyReset;

    if (!lastReset || new Date(lastReset) < today) {
      user.mcqProgress = {
        ...user.mcqProgress,
        dailyPracticeCount: 0,
        lastDailyReset: new Date(),
      };
      await user.save();
    }

    const progress = user.mcqProgress || {
      totalSolved: 0,
      correctAnswers: 0,
      currentStreak: 0,
      maxStreak: 0,
      dailyPracticeCount: 0,
    };

    const accuracy =
      progress.totalSolved > 0
        ? Math.round((progress.correctAnswers / progress.totalSolved) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...progress,
        accuracy,
        solvedCount: user.solvedMCQs?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get MCQ Progress Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Submit MCQ Answer and update progress
module.exports.submitMCQAnswer = async (req, res) => {
  try {
    // connectDB();
    console.log("MCQsubmit me aaya hu");
    const { mcqId, selectedAnswer, isCorrect } = req.body;

    if (!mcqId || selectedAnswer === undefined || isCorrect === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize mcqProgress if not exists
    if (!user.mcqProgress) {
      user.mcqProgress = {
        totalSolved: 0,
        correctAnswers: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastPracticeDate: null,
        dailyPracticeCount: 0,
        lastDailyReset: new Date(),
      };
    }

    // Check daily reset
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = user.mcqProgress.lastDailyReset;

    if (!lastReset || new Date(lastReset) < today) {
      user.mcqProgress.dailyPracticeCount = 0;
      user.mcqProgress.lastDailyReset = new Date();
    }

    // Update stats
    user.mcqProgress.totalSolved += 1;
    user.mcqProgress.dailyPracticeCount += 1;
    // lastPracticeDate update moved to after streak calculation to ensure accurate diff

    // Get existing entry to preserve flags (Mastery System)
    const existingEntry = user.mcqAnswerHistory.get(mcqId) || {};
    const hasPriorPoints = existingEntry.pointsAwarded || false;
    let pointsAwardedNow = 0;

    // Update mcqAnswerHistory
    const historyEntry = {
      isCorrect: isCorrect,
      isMarked: existingEntry.isMarked || false,
      selectedAnswer: selectedAnswer,
      answeredAt: new Date(),
      pointsAwarded: hasPriorPoints, // Default to existing status
    };

    if (isCorrect) {
      // Mastery Logic: Award points only if not previously earned
      if (!hasPriorPoints) {
        pointsAwardedNow = 10; // Mastery Bonus
        user.balance = (user.balance || 0) + pointsAwardedNow; // Add to wallet
        historyEntry.pointsAwarded = true;
      }

      user.mcqProgress.correctAnswers += 1;
      
      // Day Streak Logic
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const lastPractice = user.mcqProgress.lastPracticeDate ? new Date(user.mcqProgress.lastPracticeDate) : null;
      
      if (lastPractice) {
        lastPractice.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(todayDate - lastPractice);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.mcqProgress.currentStreak += 1;
        } else if (diffDays > 1) {
          user.mcqProgress.currentStreak = 1;
        }
        // If diffDays === 0, do nothing (already incremented for today)
      } else {
        user.mcqProgress.currentStreak = 1;
      }
      
      // Update last practice date after calculation
      user.mcqProgress.lastPracticeDate = new Date();

      // Update max streak if current is higher
      if (user.mcqProgress.currentStreak > user.mcqProgress.maxStreak) {
        user.mcqProgress.maxStreak = user.mcqProgress.currentStreak;
      }
    } 
    // Removed strict streak reset on wrong answer to support Day Streak logic

    user.mcqAnswerHistory.set(mcqId, historyEntry);

    // Add to solved MCQs if not already solved
    if (!user.solvedMCQs.includes(mcqId)) {
      user.solvedMCQs.push(mcqId);
    }

    await user.save();

    const accuracy =
      user.mcqProgress.totalSolved > 0
        ? Math.round(
          (user.mcqProgress.correctAnswers / user.mcqProgress.totalSolved) *
          100
        )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...user.mcqProgress.toObject(),
        accuracy,
        solvedCount: user.solvedMCQs.length,
        pointsAwarded: pointsAwardedNow,
        newBalance: user.balance,
      },
    });
  } catch (error) {
    console.error("Submit MCQ Answer Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get session progress for a category
module.exports.getSessionProgress = async (req, res) => {
  try {
    const { category, type } = req.query;
    const sessionKey = `${category}_${type || "practice"}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const session = user.mcqSessionProgress?.get(sessionKey);

    res.status(200).json({
      success: true,
      data: session
        ? {
          lastQuestionIndex: session.lastQuestionIndex || 0,
          answeredQuestions: session.answeredQuestions
            ? Object.fromEntries(session.answeredQuestions)
            : {},
        }
        : {
          lastQuestionIndex: 0,
          answeredQuestions: {},
        },
    });
  } catch (error) {
    console.error("Get Session Progress Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Save session progress for a category
module.exports.saveSessionProgress = async (req, res) => {
  try {
    const { category, type, lastQuestionIndex, answeredQuestions } = req.body;
    const sessionKey = `${category}_${type || "practice"}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize if not exists
    if (!user.mcqSessionProgress) {
      user.mcqSessionProgress = new Map();
    }

    // Save session data
    user.mcqSessionProgress.set(sessionKey, {
      lastQuestionIndex: lastQuestionIndex || 0,
      answeredQuestions: new Map(Object.entries(answeredQuestions || {})),
      updatedAt: new Date(),
    });

    await user.save();

    res.status(200).json({ success: true, message: "Session saved" });
  } catch (error) {
    console.error("Save Session Progress Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get recently visited MCQ categories
module.exports.getRecentlyVisited = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const recentlyVisited = user.mcqRecentlyVisited || [];
    
    // Sort by timestamp descending (most recent first)
    recentlyVisited.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: recentlyVisited.slice(0, 8), // Limit to 8 items
    });
  } catch (error) {
    console.error("Get Recently Visited Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Track a visit to an MCQ category
module.exports.trackRecentlyVisited = async (req, res) => {
  try {
    const { type, id, name } = req.body;

    if (!type || !id || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields: type, id, name" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize if not exists
    if (!user.mcqRecentlyVisited) {
      user.mcqRecentlyVisited = [];
    }

    // Remove existing entry with same type and id
    user.mcqRecentlyVisited = user.mcqRecentlyVisited.filter(
      (v) => !(v.type === type && v.id === id)
    );

    // Add new entry at the beginning
    user.mcqRecentlyVisited.unshift({
      type,
      id,
      name,
      timestamp: new Date(),
    });

    // Keep only last 8 entries
    user.mcqRecentlyVisited = user.mcqRecentlyVisited.slice(0, 8);

    await user.save();

    res.status(200).json({ success: true, message: "Visit tracked" });
  } catch (error) {
    console.error("Track Recently Visited Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reset session progress for a category
module.exports.resetSessionProgress = async (req, res) => {
  try {
    const { category, type } = req.body;
    
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });
    }

    const sessionKey = `${category}_${type || "practice"}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize if not exists
    if (!user.mcqSessionProgress) {
      user.mcqSessionProgress = new Map();
    }

    // Reset session data - clear answered questions and reset index to 0
    user.mcqSessionProgress.set(sessionKey, {
      lastQuestionIndex: 0,
      answeredQuestions: new Map(),
      updatedAt: new Date(),
    });

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Progress reset successfully" 
    });
  } catch (error) {
    console.error("Reset Session Progress Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Toggle marked status for an MCQ
module.exports.toggleMcqMarked = async (req, res) => {
  try {
    const { mcqId, isMarked } = req.body;

    if (!mcqId || isMarked === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields: mcqId, isMarked" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize if not exists
    if (!user.mcqAnswerHistory) {
      user.mcqAnswerHistory = new Map();
    }

    // Get existing entry or create new one
    const existingEntry = user.mcqAnswerHistory.get(mcqId) || {
      isCorrect: false,
      isMarked: false,
      answeredAt: null,
    };

    // Update the marked status
    user.mcqAnswerHistory.set(mcqId, {
      ...existingEntry,
      isMarked: isMarked,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: isMarked ? "Question marked for review" : "Question unmarked",
    });
  } catch (error) {
    console.error("Toggle MCQ Marked Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reset MCQ answer history for specific questions
module.exports.resetMcqHistory = async (req, res) => {
  try {
    const { mcqIds } = req.body;

    if (!mcqIds || !Array.isArray(mcqIds) || mcqIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: mcqIds (array)" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Soft Reset: Clear answer status but PRESERVE mastery points flag
    if (user.mcqAnswerHistory) {
      mcqIds.forEach((mcqId) => {
        if (user.mcqAnswerHistory.has(mcqId)) {
          const entry = user.mcqAnswerHistory.get(mcqId);
          user.mcqAnswerHistory.set(mcqId, {
            ...entry, // Keep isMarked
            isCorrect: false,
            selectedAnswer: null,
            answeredAt: null, // Marks as unanswered in UI
            pointsAwarded: true, // Forfeit points on reset (prevent farming)
          });
        }
      });
    }

    // Also remove from solvedMCQs array so it doesn't count as "Solved"
    if (user.solvedMCQs && user.solvedMCQs.length > 0) {
      user.solvedMCQs = user.solvedMCQs.filter(
        (id) => !mcqIds.includes(id.toString())
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Reset ${mcqIds.length} question(s) successfully`,
      resetCount: mcqIds.length,
    });
  } catch (error) {
    console.error("Reset MCQ History Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
