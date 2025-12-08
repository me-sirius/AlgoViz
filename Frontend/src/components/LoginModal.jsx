import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LogIn, X, UserPlus } from "lucide-react";

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* 1. Backdrop (Click to close) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* 2. Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            {/* <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:bg-white/10 hover:text-white transition-all z-10"
            >
              <X size={20} />
            </button> */}

            {/* Header / Icon Area */}
            <div className="flex flex-col items-center justify-center p-8 pb-6 bg-gradient-to-b from-blue-500/10 to-transparent">
              <div className="w-20 h-20 bg-[#0a0e17] rounded-full flex items-center justify-center mb-6 ring-4 ring-white/5 shadow-xl shadow-blue-500/10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white text-center">
                Access Restricted
              </h3>
              <p className="text-gray-400 text-sm text-center mt-2 leading-relaxed">
                Join the{" "}
                <span className="text-blue-400 font-medium">AlgoViz</span>{" "}
                community to create blogs, comment, and track your progress.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-2 space-y-3">
              <button
                onClick={() => navigate("/signin")}
                className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
                Sign In to Continue
              </button>

              <button
                onClick={() => navigate("/register")}
                className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus size={18} />
                Create New Account
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/20 text-center border-t border-white/5">
              <button
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Continue as Guest (Read Only)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
