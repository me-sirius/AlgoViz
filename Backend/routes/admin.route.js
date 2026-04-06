const express = require("express");
const router = express.Router();
const multer = require("multer");
const { adminAuth } = require("../middlewares/adminAuth"); // Import the file above

// Configure multer for image uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for question screenshots
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});
const {
  getPendingExperiences,
  updateExperienceStatus,
  getAllUserList,
  deleteUser,
  getSystemHealth,
  createQuestion,
  createMCQ,
  getStats,
  sendAdminNotification,
  updateUser,
  getPendingPayments,
  markAsPaid,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
  getPendingComments,
  approveComment,
  deleteCommentAsAdmin,
} = require("../controllers/admin.controller");
const {
  generateAutoTestCases,
} = require("../controllers/testCaseGenerator.controller");
const {
  getAllTickets,
  getOpenTickets,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
} = require("../controllers/contact.controller");
// router.get("/stats", adminAuth, getStats);
router.get("/pending-experiences", adminAuth, getPendingExperiences);
router.patch("/experience/:id/status", adminAuth, updateExperienceStatus);
router.get("/users", adminAuth, getAllUserList);
router.patch("/user/:id", adminAuth, updateUser);
router.delete("/user/:id", adminAuth, deleteUser);
router.get("/health", adminAuth, getSystemHealth);
router.post("/question", adminAuth, createQuestion);
router.get("/questions", adminAuth, getAllQuestions);
router.get("/question/:id", adminAuth, getQuestionById);
router.patch("/question/:id", adminAuth, updateQuestion);
router.delete("/question/:id", adminAuth, deleteQuestion);
router.get("/stats", adminAuth, getStats);
router.post("/mcq", adminAuth, createMCQ);
router.post("/generate-auto-cases", adminAuth, generateAutoTestCases);
// AI routes removed.
router.post("/send-notification", adminAuth, sendAdminNotification);

// Payment Management Routes
router.get("/pending-payments", adminAuth, getPendingPayments);
router.patch("/payment/:id/mark-paid", adminAuth, markAsPaid);

// 1. Fetch all tickets (sorted by newest)
// Matches frontend: axios.get(`${API_URL}/admin/contact/all`)
router.get("/contact/all", adminAuth, getAllTickets);

// 2. Fetch only open tickets (Optional utility)
router.get("/contact/open", adminAuth, getOpenTickets);

// 3. Reply to a ticket (Admin Chat)
// Matches frontend: axios.post(`${API_URL}/admin/contact/reply`)
router.post("/contact/reply", adminAuth, replyToTicket);

// 4. Update Ticket Status (Close/Re-open)
// Matches frontend: axios.patch(`${API_URL}/admin/contact/:id/status`)
router.patch("/contact/:id/status", adminAuth, updateTicketStatus);

// 5. Delete Ticket Permanently
// Matches frontend: axios.delete(`${API_URL}/admin/contact/:id`)
router.delete("/contact/:id", adminAuth, deleteTicket);

// --- Comment Approval Routes ---
router.get("/pending-comments", adminAuth, getPendingComments);
router.patch("/comment/:experienceId/:commentId/approve", adminAuth, approveComment);
router.delete("/comment/:experienceId/:commentId", adminAuth, deleteCommentAsAdmin);

module.exports = router;
