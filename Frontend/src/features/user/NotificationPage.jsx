import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Trash2,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Info,
  MessageSquare,
  Zap,
  MailOpen,
  Loader2,
  Coffee,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Mock notifications for testing (used when API returns empty)
const MOCK_NOTIFICATIONS = [
  {
    _id: "mock-1",
    type: "SUCCESS",
    category: "PAYMENT",
    title: "Payment Successful",
    message: "Your Mock Interview with Ratan Kumar is confirmed for tomorrow at 10 AM.",
    createdAt: new Date().toISOString(),
    isRead: false,
    actionLink: "/interviews",
  },
  {
    _id: "mock-2",
    type: "WARNING",
    category: "STREAK",
    title: "Streak at Risk!",
    message: "You haven't solved a problem today. Solve one now to keep your 7-day streak alive.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: false,
    actionLink: "/dashboard",
  },
  {
    _id: "mock-3",
    type: "INFO",
    category: "SYSTEM",
    title: "New Questions Added",
    message: "We've added 5 new Google OA questions to the 'Must Do' bucket.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    isRead: true,
    actionLink: "/dashboard",
  },
  {
    _id: "mock-4",
    type: "INFO",
    category: "SOCIAL",
    title: "New Comment",
    message: "Ankit Singh replied to your Interview Experience.",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    isRead: true,
    actionLink: "/experience/1",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const groupNotificationsByDate = (notifications) => {
  const groups = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  notifications.forEach((n) => {
    const date = new Date(n.createdAt);
    if (date >= today) {
      groups.Today.push(n);
    } else if (date >= yesterday) {
      groups.Yesterday.push(n);
    } else if (date >= lastWeek) {
      groups["Last 7 Days"].push(n);
    } else {
      groups.Older.push(n);
    }
  });

  return groups;
};

const getRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Filter Tab Component
const FilterTab = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${active
      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
      : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
      }`}
  >
    {children}
    {count > 0 && (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${active ? "bg-cyan-500/30 text-cyan-300" : "bg-white/10 text-gray-400"
        }`}>
        {count}
      </span>
    )}
  </button>
);

// Section Header Component
const SectionHeader = ({ title }) => (
  <div className="sticky top-20 z-10 py-3 mb-2">
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        {title}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  </div>
);

// Icon Container with category-specific styling
const IconBox = ({ category, type }) => {
  const configs = {
    PAYMENT: { icon: CreditCard, bg: "bg-emerald-500/20", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
    STREAK: { icon: Zap, bg: "bg-amber-500/20", color: "text-amber-400", glow: "shadow-amber-500/20" },
    SOCIAL: { icon: MessageSquare, bg: "bg-blue-500/20", color: "text-blue-400", glow: "shadow-blue-500/20" },
    SYSTEM: { icon: Info, bg: "bg-violet-500/20", color: "text-violet-400", glow: "shadow-violet-500/20" },
    INTERVIEW: { icon: Sparkles, bg: "bg-purple-500/20", color: "text-purple-400", glow: "shadow-purple-500/20" },
  };

  const typeConfigs = {
    WARNING: { icon: AlertTriangle, bg: "bg-red-500/20", color: "text-red-400", glow: "shadow-red-500/20", pulse: true },
    SUCCESS: { icon: CheckCircle2, bg: "bg-emerald-500/20", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
  };

  const config = configs[category] || typeConfigs[type] || { icon: Bell, bg: "bg-gray-500/20", color: "text-gray-400", glow: "" };
  const IconComponent = config.icon;

  return (
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.bg} shadow-lg ${config.glow} ${config.pulse ? "animate-pulse" : ""}`}>
      <IconComponent size={22} className={config.color} />
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification, onDelete, onClick, index }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsExiting(true);
    setTimeout(() => onDelete(notification._id, e), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isExiting ? { opacity: 0, x: 100, height: 0, marginBottom: 0 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onClick(notification)}
      className={`group relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${notification.isRead
        ? "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]"
        : "bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/40"
        }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Unread Glow Effect */}
      {!notification.isRead && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-50" />
      )}

      <div className="relative p-5 flex gap-4">
        {/* Icon */}
        <IconBox category={notification.category} type={notification.type} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold truncate ${notification.isRead ? "text-gray-300" : "text-white"}`}>
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {getRelativeTime(notification.createdAt)}
              </span>
              {/* Unread Indicator */}
              {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
            {notification.message}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="absolute bottom-4 right-4 p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ filter }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-20"
  >
    <div className="relative inline-flex mb-6">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
        {filter === "unread" ? (
          <Coffee size={40} className="text-cyan-400" />
        ) : (
          <Bell size={40} className="text-gray-500" />
        )}
      </div>
      {filter === "unread" && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center">
          <CheckCircle2 size={16} className="text-emerald-400" />
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">
      {filter === "unread" ? "All caught up!" : "No notifications yet"}
    </h3>
    <p className="text-gray-500 max-w-sm mx-auto">
      {filter === "unread"
        ? "Grab a coffee ☕ — you've read everything."
        : "When something happens, you'll see it here."}
    </p>
  </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  // Derived State
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayedNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);
  const groupedNotifications = groupNotificationsByDate(displayedNotifications);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success && data.data.length > 0) {
          setNotifications(data.data);
          setUsingMockData(false);
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
          setUsingMockData(true);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications(MOCK_NOTIFICATIONS);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // --- Handlers ---
  const markAsRead = async (id) => {
    if (usingMockData) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllRead = async () => {
    if (usingMockData) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    if (usingMockData) {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleCardClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.actionLink) navigate(n.actionLink);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans pb-20 pt-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-purple-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-1">
                Notifications
              </h1>
              <p className="text-gray-500 text-sm">
                {usingMockData ? "Showing demo data" : `${notifications.length} total`}
              </p>
            </div>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={markAllRead}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                <MailOpen size={16} className="text-cyan-400" />
                Mark all read
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          <FilterTab
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={notifications.length}
          >
            All
          </FilterTab>
          <FilterTab
            active={filter === "unread"}
            onClick={() => setFilter("unread")}
            count={unreadCount}
          >
            Unread
          </FilterTab>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-cyan-400 animate-spin" />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          /* Grouped Notification List */
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedNotifications).map(([group, items]) => {
                if (items.length === 0) return null;
                return (
                  <motion.div
                    key={group}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <SectionHeader title={group} />
                    <div className="space-y-3">
                      {items.map((notification, index) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onDelete={deleteNotification}
                          onClick={handleCardClick}
                          index={index}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
