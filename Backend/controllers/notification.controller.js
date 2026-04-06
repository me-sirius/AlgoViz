const Notification = require("../models/notification.model");

// Get all notifications for the authenticated user
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Unread Count Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get unread count",
        });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark as read",
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Mark All Read Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark all as read",
        });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipient: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted",
        });
    } catch (error) {
        console.error("Delete Notification Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
};

// Create a notification (internal use - for other controllers to call)
const createNotification = async ({ recipient, type, category, title, message, actionLink }) => {
    try {
        const notification = await Notification.create({
            recipient,
            type: type || "INFO",
            category,
            title,
            message,
            actionLink: actionLink || "",
        });
        return notification;
    } catch (error) {
        console.error("Create Notification Error:", error);
        return null;
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
};
