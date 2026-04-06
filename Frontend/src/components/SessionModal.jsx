import React from "react";
import { Lock, LogIn, UserX } from "lucide-react";

const SessionModal = ({ isOpen, type, onLogin, onLogout }) => {
  if (!isOpen) return null;

  const isMultipleLogin = type === "multiple_login";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#161b22] border border-gray-700 w-full max-w-md p-6 rounded-2xl shadow-2xl transform scale-100 transition-all">
        {/* Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">
            {isMultipleLogin
              ? "Account Logged in Elsewhere"
              : "Session Expired"}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {isMultipleLogin
              ? "For your security, we've ended this session because a new login was detected on another device or browser."
              : "Your secure session has timed out due to inactivity. Please log in again to continue."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Log In Again
          </button>

          <button
            onClick={onLogout}
            className="w-full py-3 px-4 bg-transparent hover:bg-white/5 text-gray-400 font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            <UserX size={16} />
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
