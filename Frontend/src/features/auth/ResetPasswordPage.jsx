import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Alert from "../../components/Alert"; // Reuse your Alert component

const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const ResetPasswordPage = () => {
  const { token } = useParams(); // 1. Grab token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertConfig({
        isOpen: true,
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      // 2. Send token and new password to backend
      const response = await axios.put(
        `${VITE_API_BASE_URL}/users/reset-password/${token}`,
        {
          password: password,
        }
      );

      if (response.status === 200) {
        setAlertConfig({
          isOpen: true,
          message: "Password reset successful! Redirecting...",
          type: "success",
        });
        // 3. Redirect to Login after 2 seconds
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      setAlertConfig({
        isOpen: true,
        message:
          error.response?.data?.message ||
          "Something went wrong. Token might be expired.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ isOpen: false })}
      />

      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#333] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-gray-400 text-sm mt-2">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#252526] border border-[#333] rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#252526] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Resetting..."
            ) : (
              <>
                Reset Password <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
