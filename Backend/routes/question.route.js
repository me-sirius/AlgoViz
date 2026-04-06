const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestionBySlug,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/question.controller");
const { authUser } = require("../middlewares/auth");
// Public Routes
router.get("/", getQuestions); // Get list
router.get("/id/:id", authUser, getQuestionById); // Get specific problem by ID (NEW)
router.get("/:slug", authUser, getQuestionBySlug); // Get specific problem by Slug (Keep for backward compat or direct links)

// Admin Routes (You should add your auth/admin middleware here!)
router.post("/", createQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

module.exports = router;
