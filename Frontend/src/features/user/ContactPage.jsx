import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Star,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Sparkles,
  Bug,
  CreditCard,
  Lightbulb,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import Alert from "../../components/Alert";
import { useNavigate } from "react-router-dom";

// Category options with icons and colors
const categoryOptions = [
  { value: "general", label: "General", icon: <HelpCircle size={16} />, color: "text-blue-400" },
  { value: "technical", label: "Technical", icon: <Lightbulb size={16} />, color: "text-purple-400" },
  { value: "billing", label: "Billing", icon: <CreditCard size={16} />, color: "text-green-400" },
  { value: "bug", label: "Bug Report", icon: <Bug size={16} />, color: "text-red-400" },
];

// Mock previous queries data
const previousQueriesData = [
  {
    id: 1,
    subject: "Login Issue",
    message: "Cannot access my account after password reset",
    status: "resolved",
    date: "2025-06-28",
    response: "Issue resolved. Password reset link was sent to your email.",
  },
  {
    id: 2,
    subject: "Feature Request",
    message: "Would love to see dark mode option",
    status: "in-progress",
    date: "2025-06-25",
    response: "Thanks for the suggestion! We're working on it.",
  },
  {
    id: 3,
    subject: "Bug Report",
    message: "Page not loading on mobile browser",
    status: "pending",
    date: "2025-06-20",
    response: "",
  },
];

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState("feedback");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    rating: 0,
    category: "general",
  });
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "error",
  });
  const [previousQueries] = useState(previousQueriesData);

  const handleBack = () => {
    setAlertConfig({
      isOpen: true,
      message: "Are you sure you want to leave? Your progress will be lost.",
      type: "warning",
      customButtons: (
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
          >
            Leave
          </button>
          <button
            onClick={closeAlert}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl transition-all duration-300 hover:bg-white/20 cursor-pointer"
          >
            Stay
          </button>
        </div>
      ),
    });
  };

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, isOpen: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          rating: 0,
          category: "general",
        });
      }, 3000);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "resolved":
        return { icon: <CheckCircle size={14} />, color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Resolved" };
      case "in-progress":
        return { icon: <Clock size={14} />, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Open" };
      case "pending":
        return { icon: <AlertCircle size={14} />, color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Pending" };
      default:
        return { icon: <MessageCircle size={14} />, color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "Unknown" };
    }
  };

  const tabs = [
    { id: "feedback", label: "Give Feedback", icon: <Star size={16} /> },
    { id: "support", label: "Raise Ticket", icon: <MessageCircle size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0b0b0d]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Help Center</h1>
            <p className="text-xs text-gray-500">AlgoViz Support</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Premium Support</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-2">
            How can we{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              help you?
            </span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Feedback, Bug Reports, or Account Issues—we're here for you.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Interaction Console (60%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#121214] rounded-2xl border border-white/5 overflow-hidden">
              {/* Pill Tabs */}
              <div className="p-4 border-b border-white/5">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all cursor-pointer ${activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* Success State */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-12 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <CheckCircle size={40} className="text-green-400" />
                      </motion.div>
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                    <p className="text-gray-400">
                      Your {activeTab === "feedback" ? "feedback" : "support request"} has been submitted successfully.
                    </p>
                  </motion.div>
                ) : (
                  /* Form */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: activeTab === "feedback" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === "feedback" ? 20 : -20 }}
                    className="p-6 space-y-6"
                  >
                    {/* Rating (Feedback only) */}
                    {activeTab === "feedback" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Rate Your Experience
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              onClick={() => handleRatingClick(star)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="cursor-pointer"
                            >
                              <Star
                                size={36}
                                className={`transition-all ${star <= formData.rating
                                    ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                    : "text-gray-600 hover:text-yellow-400/50"
                                  }`}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Name & Email */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <User size={14} className="inline mr-2" />
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Mail size={14} className="inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Category & Subject (Support only) */}
                    {activeTab === "support" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Category
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {categoryOptions.map((cat) => (
                              <button
                                key={cat.value}
                                onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${formData.category === cat.value
                                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                                  }`}
                              >
                                <span className={cat.color}>{cat.icon}</span>
                                <span className="text-sm font-medium">{cat.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Subject
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Brief description"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Subject (Feedback only) */}
                    {activeTab === "feedback" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What's this about?"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {activeTab === "feedback" ? "Share Your Experience" : "Describe Your Issue"}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder={
                          activeTab === "feedback"
                            ? "Tell us about your experience..."
                            : "Please describe your issue in detail..."
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      <Send size={18} />
                      {activeTab === "feedback" ? "Submit Feedback" : "Submit Ticket"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Status Hub (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Your Activity */}
            <div className="bg-[#0f0f11] rounded-2xl border border-white/5 p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-purple-400" />
                Your Activity
              </h3>
              <div className="space-y-3">
                {previousQueries.map((query) => {
                  const status = getStatusConfig(query.status);
                  const isExpanded = expandedQuery === query.id;
                  return (
                    <motion.div
                      key={query.id}
                      layout
                      className="bg-white/5 rounded-xl border border-white/5 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedQuery(isExpanded ? null : query.id)}
                        className="w-full p-4 flex items-start justify-between text-left cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{query.subject}</h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{query.message}</p>
                          <p className="text-xs text-gray-600 mt-1">{query.date}</p>
                        </div>
                        {query.response && (
                          <div className="ml-2">
                            {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                          </div>
                        )}
                      </button>
                      <AnimatePresence>
                        {isExpanded && query.response && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                          >
                            <div className="p-4 bg-blue-500/5">
                              <p className="text-xs text-gray-400">
                                <span className="text-blue-400 font-medium">Admin Response:</span>{" "}
                                {query.response}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Direct Reach */}
            <div className="bg-[#0f0f11] rounded-2xl border border-white/5 p-5">
              <h3 className="text-lg font-bold mb-4">Direct Reach</h3>
              <div className="space-y-3">
                {/* Email */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyToClipboard("help.algoviz@gmail.com", "email")}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium group-hover:text-blue-400 transition-colors">Email Us</p>
                    <p className="text-xs text-gray-500">help.algoviz@gmail.com</p>
                  </div>
                  {copiedField === "email" ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-gray-500 group-hover:text-blue-400" />
                  )}
                </motion.button>

                {/* Phone */}
                <motion.a
                  href="tel:+91 7643070223"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium group-hover:text-green-400 transition-colors">Call Us</p>
                    <p className="text-xs text-gray-500">+91 7643070223</p>
                  </div>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        customButtons={alertConfig.customButtons}
      />
    </div>
  );
}
