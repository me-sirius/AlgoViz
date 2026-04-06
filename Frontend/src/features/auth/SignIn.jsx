import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Code2,
  Sparkles,
  Terminal,
  Zap,
  Github,
  CheckCircle,
  User,
  AlertTriangle,
} from "lucide-react";
import { AuthContext } from "../../core/context/UserContext";
import { useGoogleLogin } from "@react-oauth/google";
import AuthExitModal from "./AuthExitModal";
import { useExitIntentGuard } from "./useExitIntentGuard";
import SecureStorage from "../../core/utils/secureStorage";

export default function UserSignIn() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    github: false,
  });
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });
  const [showExitModal, setShowExitModal] = useState(false);
  const [formError, setFormError] = useState(false);
  const [userName, setUserName] = useState("");
  const [redirectProgress, setRedirectProgress] = useState(0);
  const { setToken, setUser, setIsAuthenticated } = useContext(AuthContext);

  const isDirty = Boolean(
    credentials.email || credentials.password || forgotPasswordEmail
  );

  useExitIntentGuard({
    enabled: isDirty && !showExitModal,
    onAttemptExit: () => setShowExitModal(true),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setFormError(false);
  };

  const handleBack = () => {
    setShowExitModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/login`,
        credentials
      );
      if (response.status === 200) {
        const userData = response.data.user;
        const authToken = response.data.token;

        // Store in localStorage for persistence
        localStorage.setItem("token", authToken);
        localStorage.setItem("userId", userData._id);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("lastActivityTime", Date.now().toString());

        // Store in SecureStorage for cache
        SecureStorage.setItem("user_cache", userData);

        setUserName(userData.name || "Coder");
        setModal({
          open: true,
          success: true,
          message: "Welcome back! Redirecting to Home Page...",
        });

        // Update context state - set token first to trigger any dependent effects
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        // Animate progress bar over 2 seconds
        setRedirectProgress(0);
        const startTime = Date.now();
        const duration = 2000;
        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / duration) * 100, 100);
          setRedirectProgress(progress);
          if (elapsed < duration) {
            requestAnimationFrame(animateProgress);
          } else {
            navigate("/");
          }
        };
        requestAnimationFrame(animateProgress);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setModal({ open: true, success: false, message: msg });
      setFormError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/forgot-password`,
        { email: forgotPasswordEmail }
      );
      if (response.status === 200) {
        setModal({
          open: true,
          success: true,
          message: "Check your inbox! We've sent a password reset link.",
        });
        setTimeout(() => {
          setModal({ open: false, success: false, message: "" });
          setShowForgotPassword(false);
          setForgotPasswordEmail("");
        }, 3000);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";
      setModal({ open: true, success: false, message: msg });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: "auth-code",
    scope: "email profile",
  });

  async function handleGoogleSuccess(codeResponse) {
    setSocialLoading((prev) => ({ ...prev, google: true }));

    try {
      const response = await axios.post(`${API_BASE_URL}/users/google-auth`, {
        code: codeResponse.code,
      });

      if (response.data.token) {
        const userData = response.data.user;
        const authToken = response.data.token;

        // Store in localStorage for persistence
        localStorage.setItem("token", authToken);
        localStorage.setItem("userId", userData.id || userData._id);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("lastActivityTime", Date.now().toString());

        // Store in SecureStorage for cache
        SecureStorage.setItem("user_cache", userData);

        setUserName(userData.name || "Coder");
        setModal({
          open: true,
          success: true,
          message: "Google signin successful! Redirecting...",
        });

        // Update context state - set token first to trigger any dependent effects
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        // Animate progress bar over 2 seconds
        setRedirectProgress(0);
        const startTime = Date.now();
        const duration = 2000;
        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / duration) * 100, 100);
          setRedirectProgress(progress);
          if (elapsed < duration) {
            requestAnimationFrame(animateProgress);
          } else {
            navigate("/");
          }
        };
        requestAnimationFrame(animateProgress);
      }
    } catch (error) {
      console.error("Google OAuth Error:", error);
      setModal({
        open: true,
        success: false,
        message:
          error.response?.data?.message ||
          "Google signup failed. Please try again.",
      });
    } finally {
      setSocialLoading((prev) => ({ ...prev, google: false }));
    }
  }

  function handleGoogleError(error) {
    console.error("Google OAuth Error:", error);
    setModal({
      open: true,
      success: false,
      message: "Google signup was cancelled or failed. Please try again.",
    });
  }

  const handleGoogleSignIn = () => {
    googleLogin();
  };

  const closeModal = () =>
    setModal({ open: false, success: false, message: "" });

  // Code snippet for left panel
  const codeSnippet = `function solve(nums) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex font-sans">
      <AuthExitModal
        isOpen={showExitModal}
        variant="signin"
        tone="playful"
        onStay={() => setShowExitModal(false)}
        onLeave={() => navigate("/")}
      />

      {/* LEFT PANEL - "The Vision" (Desktop Only) */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 relative overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--accent-glow)]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--accent-glow)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Headline */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-glow)]/10 border border-[var(--border-default)] mb-6 shadow-sm">
              <Sparkles size={16} className="text-[var(--accent-primary)]" />
              <span className="text-sm font-semibold text-[var(--accent-primary)]">Premium Portal</span>
            </div>
            <h1 className="text-5xl font-black text-[var(--text-primary)] mb-4 leading-tight font-display">
              Welcome Back,<br />
              <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
                Coder.
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-sm">
              Join 10,000+ developers acing their dream interviews.
            </p>
          </motion.div>

          {/* Floating Code Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-[var(--accent-glow)]/20 rounded-3xl blur-xl" />

            {/* Card */}
            <div className="relative bg-[var(--bg-glass)] border border-[var(--border-default)] border-t-[var(--specular-highlight)] rounded-2xl p-6 backdrop-blur-[24px] max-w-md shadow-[var(--shadow-lg)]">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border-default)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-[#5CB8A5]/80" />
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-code">
                  <Terminal size={14} />
                  <span>solution.js</span>
                </div>
              </div>

              {/* Code */}
              <pre className="text-sm font-code">
                <code className="text-[var(--text-secondary)]">
                  {codeSnippet.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-[var(--text-muted)] opacity-50 mr-4 select-none">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-8 mt-12"
          >
            {[
              { label: "Problems", value: "500+" },
              { label: "Companies", value: "50+" },
              { label: "Users", value: "10K+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT PANEL - "The Interface" (Form) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative"
      >
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 z-50 p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white group cursor-pointer"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
        </button>

        {/* Form Container */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!showForgotPassword ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                    Sign In
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Continue your learning journey with AlgoViz
                  </p>
                </div>

                {/* Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  animate={formError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {/* Email Input */}
                  <div className="relative group">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${credentials.email ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                        } group-focus-within:text-[var(--accent-primary)] z-10`}
                      size={18}
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_var(--accent-glow),inset_0_2px_4px_rgba(0,0,0,0.3)] outline-none transition-all font-body"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <Lock
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${credentials.password ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                        } group-focus-within:text-[var(--accent-primary)] z-10`}
                      size={18}
                    />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl pl-12 pr-12 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_var(--accent-glow),inset_0_2px_4px_rgba(0,0,0,0.3)] outline-none transition-all font-body"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer z-10"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right mt-[-8px]">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[var(--accent-primary)] hover:brightness-110 text-sm transition-all cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-[image:var(--gradient-brand)] text-[#001F26] font-bold flex items-center justify-center gap-2 border border-transparent border-t-[var(--specular-highlight)] hover:shadow-[var(--shadow-glow)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        <span>Sign In</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>

                {/* Divider */}
                <div className="my-8 flex items-center">
                  <div className="flex-1 border-t border-[var(--border-default)]"></div>
                  <span className="px-4 text-[var(--text-muted)] text-sm">or continue with</span>
                  <div className="flex-1 border-t border-[var(--border-default)]"></div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={handleGoogleSignIn}
                    disabled={socialLoading.google || socialLoading.github}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 py-3.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] border-t-[var(--specular-highlight)] rounded-xl hover:bg-[var(--bg-elevated)] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 cursor-pointer text-[var(--text-primary)]"
                  >
                    {socialLoading.google ? (
                      <Loader2 className="animate-spin w-5 h-5 text-[var(--text-secondary)]" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span className="font-medium">Google</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    disabled={socialLoading.google || socialLoading.github}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 py-3.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] border-t-[var(--specular-highlight)] rounded-xl hover:bg-[var(--bg-elevated)] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 cursor-pointer text-[var(--text-primary)]"
                  >
                    <Github size={20} className="text-[var(--text-primary)]" />
                    <span className="font-medium">GitHub</span>
                  </motion.button>
                </div>

                {/* Sign Up Link */}
                <div className="mt-8 text-center">
                  <p className="text-[var(--text-secondary)]">
                    Don't have an account?{" "}
                    <NavLink
                      to="/register"
                      className="text-[var(--accent-primary)] hover:brightness-110 font-bold transition-all"
                    >
                      Sign Up
                    </NavLink>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back to Sign In */}
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="flex items-center gap-2 text-[var(--accent-primary)] hover:brightness-110 transition-all mb-8 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Sign In</span>
                </button>

                {/* Header */}
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                    Reset Password
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  {/* Email Input */}
                  <div className="relative group">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${forgotPasswordEmail ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                        } group-focus-within:text-[var(--accent-primary)] z-10`}
                      size={18}
                    />
                    <input
                      name="forgotPasswordEmail"
                      type="email"
                      required
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_var(--accent-glow),inset_0_2px_4px_rgba(0,0,0,0.3)] outline-none transition-all font-body"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-[image:var(--gradient-brand)] text-[#001F26] font-bold flex items-center justify-center gap-2 border border-transparent border-t-[var(--specular-highlight)] hover:shadow-[var(--shadow-glow)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Success/Error Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-[var(--bg-elevated)] rounded-2xl shadow-[var(--shadow-lg)] w-full max-w-md p-8 border ${modal.success ? "border-[#5CB8A5]/30 border-t-[rgba(92,184,165,0.6)]" : "border-[var(--accent-danger)]/30 border-t-[rgba(212,106,106,0.6)]"}`}
            >
              {modal.success ? (
                <>
                  {/* Success State - Welcome Card */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25"
                    >
                      <CheckCircle size={40} className="text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Welcome Back, {userName}!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {modal.message}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${redirectProgress}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-sm mt-3">
                      Redirecting you to dashboard...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Error State */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center"
                    >
                      <AlertTriangle size={40} className="text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Oops!
                    </h3>
                    <p className="text-gray-400 mb-6 px-2">
                      {modal.message}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      className="w-full py-3 rounded-xl bg-[image:var(--gradient-brand)] text-[#001F26] border-t border-[var(--specular-highlight)] font-bold hover:shadow-[var(--shadow-glow)] transition-all cursor-pointer"
                    >
                      Try Again
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
