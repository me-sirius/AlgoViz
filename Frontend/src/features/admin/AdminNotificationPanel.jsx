import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Send,
  Mail,
  Bell,
  Zap,
  AlertTriangle,
  Info,
  CheckCircle,
  Users,
  User,
  Loader2, // Import Loader2 for the spinner
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AdminNotificationPanel = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetUserId: "ALL",
    title: "",
    message: "",
    type: "SYSTEM",
    sendViaEmail: false,
  });

  const templates = [
    {
      id: 1,
      label: "Streak Danger",
      icon: <AlertTriangle className="text-orange-500" size={18} />,
      data: {
        title: "⚠️ Your Streak is at Risk!",
        message:
          "You haven't solved a problem yet today. Solve one now to keep your streak alive!",
        type: "STREAK_WARNING",
      },
    },
    {
      id: 2,
      label: "Contest Alert",
      icon: <Zap className="text-yellow-500" size={18} />,
      data: {
        title: "🏆 Weekly Contest Starting",
        message:
          "The weekly coding contest starts in 1 hour. Get ready to compete!",
        type: "INFO",
      },
    },
    {
      id: 3,
      label: "System Maintenance",
      icon: <Info className="text-blue-500" size={18} />,
      data: {
        title: "System Update",
        message:
          "We are pushing a new update tonight. Expected downtime: 15 mins.",
        type: "SYSTEM",
      },
    },
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message)
      return toast.error("Please fill all fields");

    setLoading(true);
    const secret = sessionStorage.getItem("admin_secret");

    // We create the promise here to pass it to toast.promise
    const requestPromise = axios.post(
      `${API_URL}/admin/send-notification`,
      formData,
      { headers: { "x-admin-secret": secret } }
    );

    try {
      // toast.promise handles the Loading -> Success/Error transition automatically
      await toast.promise(requestPromise, {
        loading: "Broadcasting notification... 📡",
        success: "Notification sent successfully! 🚀",
        error: "Failed to send notification ❌",
      });

      // Clear form only on success
      setFormData((prev) => ({ ...prev, title: "", message: "" }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (templateData) => {
    if (loading) return; // Prevent changing template while sending
    setFormData((prev) => ({ ...prev, ...templateData }));
    toast("Template applied", { icon: "📝" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* LEFT COLUMN: COMPOSE FORM */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="text-blue-500" /> Notification Center
          </h2>
        </div>

        <div className="bg-[#161b22] border border-[#333] rounded-xl p-6 md:p-8 relative overflow-hidden">
          {/* --- LOADING OVERLAY --- */}
          {/* This covers the form while sending */}
          {loading && (
            <div className="absolute inset-0 bg-[#161b22]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all duration-300">
              <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
              <p className="text-white font-bold text-lg animate-pulse">
                Broadcasting to Users...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Please wait, do not close this page.
              </p>
            </div>
          )}

          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

          <form onSubmit={handleSend} className="space-y-6 relative z-10">
            {/* Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Target Audience
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setFormData({ ...formData, targetUserId: "ALL" })
                    }
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      formData.targetUserId === "ALL"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-[#0d1117] text-gray-400 border-[#333] hover:border-gray-500"
                    }`}
                  >
                    <Users size={16} /> All Users
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setFormData({ ...formData, targetUserId: "" })
                    }
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      formData.targetUserId !== "ALL"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-[#0d1117] text-gray-400 border-[#333] hover:border-gray-500"
                    }`}
                  >
                    <User size={16} /> Specific User
                  </button>
                </div>
              </div>

              {formData.targetUserId !== "ALL" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User ID
                  </label>
                  <input
                    type="text"
                    disabled={loading}
                    placeholder="Enter User _id"
                    value={formData.targetUserId}
                    onChange={(e) =>
                      setFormData({ ...formData, targetUserId: e.target.value })
                    }
                    className="w-full bg-[#0d1117] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Title & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Notification Title
                </label>
                <input
                  type="text"
                  disabled={loading}
                  placeholder="e.g. System Update"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-[#0d1117] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors font-bold disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Type
                </label>
                <select
                  disabled={loading}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full bg-[#0d1117] border border-[#333] rounded-lg px-4 py-2.5 text-gray-300 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="SYSTEM">System</option>
                  <option value="INFO">Info</option>
                  <option value="STREAK_WARNING">Warning</option>
                  <option value="SUCCESS">Success</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Message Content
              </label>
              <textarea
                disabled={loading}
                rows={5}
                placeholder="Write your message here..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg px-4 py-3 text-gray-300 outline-none focus:border-blue-500 transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {/* Delivery Options & Action */}
            <div className="pt-4 border-t border-[#333] flex flex-col md:flex-row items-center justify-between gap-4">
              <label
                className={`flex items-center gap-3 cursor-pointer group ${
                  loading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    formData.sendViaEmail ? "bg-green-500" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      formData.sendViaEmail ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.sendViaEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, sendViaEmail: e.target.checked })
                  }
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                  <Mail size={16} /> Also send via Email
                </span>
              </label>

              <button
                disabled={loading}
                className={`w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait cursor-pointer`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Blast
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: QUICK ACTIONS / TEMPLATES */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Zap size={18} /> Quick Templates
        </h3>

        <div className="space-y-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template.data)}
              disabled={loading}
              className={`w-full text-left bg-[#161b22] border border-[#333] hover:border-blue-500/50 p-4 rounded-xl group transition-all duration-300 relative overflow-hidden cursor-pointer ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#333] group-hover:border-gray-500 transition-colors">
                  {template.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">
                    {template.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {template.data.title}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-[#0d1117]/50 border border-dashed border-[#333] p-5 rounded-xl">
          <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" /> System Status
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            The notification service is currently <strong>active</strong>. "Send
            to All" operations are processed in batches of 100 to prevent
            database locks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;
