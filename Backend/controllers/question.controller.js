const Question = require("../models/question.model");
const connectDB = require("../db/db"); // Import your DB connection

// @desc    Create a new problem (Admin)
// @route   POST /api/questions
module.exports.createQuestion = async (req, res) => {
  try {
    //await connectDB(); // <--- Vercel Fix

    const {
      title,
      description,
      difficulty,
      constraints,
      examples,
      starterCode,
      testCases,
      tags,
      companies,
      hints,
      solution,
    } = req.body;

    // 1. Auto-generate slug if not provided (e.g., "Two Sum" -> "two-sum")
    const slug = req.body.slug
      ? req.body.slug
      : title
        .toLowerCase()
        .split(" ")
        .join("-")
        .replace(/[^\w-]/g, "");

    // 2. Check if slug exists
    const existingQuestion = await Question.findOne({ slug });
    if (existingQuestion) {
      return res
        .status(400)
        .json({ message: "Question with this title/slug already exists" });
    }

    // 3. Create the question
    const newQuestion = await Question.create({
      title,
      slug,
      description,
      difficulty,
      constraints, // Array of strings
      examples, // Array of objects
      starterCode, // Array of objects { language, code }
      testCases, // Hidden test cases
      tags,
      companies,
      hints,
      solution,
    });

    res.status(201).json({
      success: true,
      data: newQuestion,
    });
  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Get all questions (with filtering)
// @route   GET /api/questions
// Backend/controllers/question.controller.js

// Backend/controllers/question.controller.js

// @route   GET /api/questions
module.exports.getQuestions = async (req, res) => {
  try {
    //await connectDB();
    const { difficulty, tag, company } = req.query;

    let query = {};
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = { $in: [tag] };
    if (company) query.companies = { $in: [company] };

    // 🚀 FIX: Load only lightweight data for the list view
    const questions = await Question.find(query)
      .select("-testCases -starterCode -solution -hints -examples -constraints")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single question by ID (For Practice IDE)
// @route   GET /api/questions/id/:id
module.exports.getQuestionById = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;
    console.log("aaya hu mai mai ")
    // Fetch Full Question Data
    const question = await Question.findById(id).lean();

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Fetch test cases from Oracle and filter to show ONLY public ones
    if (question.testCasesUrl) {
      try {
        const axios = require("axios");
        const tcResponse = await axios.get(question.testCasesUrl, { timeout: 10000 });
        // Oracle returns: { success, data: { testCases: [...] } }
        const allTestCases = tcResponse.data?.data?.testCases || tcResponse.data || [];
        question.testCases = allTestCases.filter((tc) => tc.isPublic);
      } catch (fetchError) {
        console.error("Failed to fetch test cases from Oracle:", fetchError.message);
        question.testCases = []; // Return empty if fetch fails
      }
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Get Question By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single question by Slug (Legacy/Optional)
// @route   GET /api/questions/:slug
module.exports.getQuestionBySlug = async (req, res) => {
  try {
    //await connectDB();
    const { slug } = req.params;

    const question = await Question.findOne({ slug }).select("-testCases.output");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Get Question Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
module.exports.updateQuestion = async (req, res) => {
  try {
    //await connectDB(); // <--- Vercel Fix

    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Update Question Error:", error);
    res.status(500).json({ message: "Update failed: " + error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
module.exports.deleteQuestion = async (req, res) => {
  try {
    //await connectDB(); // <--- Vercel Fix

    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete Question Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
