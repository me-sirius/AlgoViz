const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require("../controllers/notification.controller");

// All routes require authentication
router.use(authUser);

// GET /notifications - Get all notifications for user
router.get("/", getNotifications);

// GET /notifications/unread-count - Get unread count
router.get("/unread-count", getUnreadCount);

// PATCH /notifications/read-all - Mark all as read
router.patch("/read-all", markAllAsRead);

// PATCH /notifications/:id/read - Mark single as read
router.patch("/:id/read", markAsRead);

// DELETE /notifications/:id - Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
