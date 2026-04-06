import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls, useAnimation } from "framer-motion";
import { Bug, X, Send, AlertCircle, ChevronDown, Sparkles } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BugReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "ui",
    description: "",
  });

  // Drag and snap state
  const [corner, setCorner] = useState("bottom-right");
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const buttonRef = useRef(null);

  // Calculate coordinates for a specific corner
  const getSnapCoords = (targetCorner) => {
    if (typeof window === "undefined") return { x: 0, y: 0 };

    const padding = 24;
    const size = 48; // Button size
    const { innerWidth, innerHeight } = window;

    switch (targetCorner) {
      case "top-left": return { x: padding, y: padding };
      case "top-right": return { x: innerWidth - size - padding, y: padding };
      case "bottom-left": return { x: padding, y: innerHeight - size - padding };
      case "bottom-right":
      default:
        return { x: innerWidth - size - padding, y: innerHeight - size - padding };
    }
  };

  // Track if this is the first render
  const isInitialMount = useRef(true);

  // Update coords on resize
  useEffect(() => {
    const handleResize = () => {
      const newCoords = getSnapCoords(corner);
      
      if (isInitialMount.current) {
        // On first mount, set position instantly without animation
        controls.set({
          x: newCoords.x,
          y: newCoords.y,
        });
        isInitialMount.current = false;
      } else {
        // On subsequent updates (resize, corner change), animate smoothly
        controls.start({
          x: newCoords.x,
          y: newCoords.y,
          transition: { type: "spring", stiffness: 300, damping: 28 }
        });
      }
    };

    // Initial set
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [corner, controls]);

  // Rage click detection
  const clickTimestamps = useRef([]);
  const [isRageMode, setIsRageMode] = useState(false);

  // Auto-capture page URL
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => {
    setPageUrl(window.location.href);
  }, [isOpen]);

  // Detect if user is on Mac for displaying correct shortcut
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Keyboard shortcut: Ctrl+Shift+B (Windows/Linux) or Cmd+Shift+B (Mac)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const modifierKey = e.ctrlKey || e.metaKey;
      if (modifierKey && e.shiftKey && (e.key === "B" || e.key === "b")) {
        e.preventDefault();
        setIsOpen(true);
        toast("🐛 Quick Report Mode!", { icon: "⌨️", duration: 2000 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Rage click detection
  useEffect(() => {
    const handleRageClick = () => {
      const now = Date.now();
      clickTimestamps.current.push(now);
      clickTimestamps.current = clickTimestamps.current.filter(t => now - t < 2000);

      if (clickTimestamps.current.length >= 5 && !isOpen) {
        setIsRageMode(true);
        setIsOpen(true);
        toast("😤 Frustrated? Let us know what's wrong!", {
          icon: "🐛",
          duration: 3000,
          style: { background: "#1a1a2e", color: "#fff" }
        });
        clickTimestamps.current = [];
      }
    };
    window.addEventListener("click", handleRageClick);
    return () => window.removeEventListener("click", handleRageClick);
  }, [isOpen]);

  const categories = [
    { value: "ui", label: "🎨 UI Issue" },
    { value: "functional", label: "⚙️ Functional Bug" },
    { value: "performance", label: "🚀 Performance Issue" },
    { value: "content", label: "📝 Content Error" },
    { value: "other", label: "❓ Other" },
  ];

  // Snap to nearest corner on drag end
  const handleDragEnd = (event, info) => {
    setIsDragging(false);

    if (!buttonRef.current) return;

    const { innerWidth, innerHeight } = window;

    // Get current position of the button center
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const midX = innerWidth / 2;
    const midY = innerHeight / 2;

    let newCorner;
    if (centerX < midX && centerY < midY) newCorner = "top-left";
    else if (centerX >= midX && centerY < midY) newCorner = "top-right";
    else if (centerX < midX && centerY >= midY) newCorner = "bottom-left";
    else newCorner = "bottom-right";

    setCorner(newCorner);

    const snapCoords = getSnapCoords(newCorner);
    controls.start({
      x: snapCoords.x,
      y: snapCoords.y,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 300, damping: 28 }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to report a bug");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/bug/create`,
        {
          title: formData.title,
          category: formData.category,
          description: formData.description,
          pageUrl,
          userAgent: navigator.userAgent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setShowSuccess(true);
        setIsRageMode(false);

        setTimeout(() => {
          setFormData({ title: "", category: "ui", description: "" });
          setIsOpen(false);
          setShowSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Bug report error:", error);
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confetti particles
  const ConfettiExplosion = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][i % 6],
            left: '50%',
            top: '50%',
          }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            scale: [0, 1, 0],
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );


  return (
    <>
      {/* Constraints container for drag */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* Floating Bug Button - Smaller and Draggable */}
      {/* Floating Bug Button - Draggable with snap */}
      <motion.button
        ref={buttonRef}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => !isDragging && setIsOpen(true)}
        initial={false}
        animate={controls}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 50 }}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden group pointer-events-auto"
        title={`Report a Bug (${isMac ? "⌘" : "Ctrl"}+Shift+B) • Drag to reposition`}
      >
        {/* Pulse Ring */}
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(239, 68, 68, 0.4)",
              "0 0 0 12px rgba(239, 68, 68, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <Bug size={20} className="relative z-10" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => !showSuccess && setIsOpen(false)}
          >
            {/* Success Celebration View */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-50"
                >
                  <ConfettiExplosion />
                  <motion.div
                    className="text-center"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Bug Squashed!</h2>
                    <p className="text-gray-400 text-sm">Thanks for helping us improve!</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{
                opacity: showSuccess ? 0 : 1,
                scale: 1,
                y: 0
              }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Rage Mode Banner */}
              <AnimatePresence>
                {isRageMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-center"
                  >
                    <span className="text-white text-xs font-medium flex items-center justify-center gap-2">
                      <Sparkles size={14} />
                      We noticed you might be frustrated!
                      <Sparkles size={14} />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-orange-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Bug size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Report a Bug</h2>
                    <p className="text-xs text-gray-500">Help us improve</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all appearance-none cursor-pointer pr-8"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-[#0d1117]">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What happened? What did you expect?"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all resize-none"
                  />
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle size={12} />
                  <span>Page URL & browser info included automatically</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Report
                    </>
                  )}
                </button>

                {/* Shortcut hint */}
                <p className="text-center text-xs text-gray-600">
                  <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">{isMac ? "⌘" : "Ctrl"}</kbd> + <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">Shift</kbd> + <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">B</kbd>
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BugReportWidget;