import React, { useState, useContext, useRef, memo, useEffect } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Github,
  Sparkles,
  Rocket,
  Trophy,
  Target,
  Zap,
  AlertTriangle,
  Brain,
  Users,
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../../core/context/UserContext";
import AuthExitModal from "./AuthExitModal";
import PasswordStrengthBar from "./PasswordStrengthBar";
import { useExitIntentGuard } from "./useExitIntentGuard";
import SecureStorage from "../../core/utils/secureStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// --- OTP Input Component ---
const OtpInput = memo(({ index, value, onChange, onKeyDown, inputRef }) => (
  <motion.input
    ref={inputRef}
    type="text"
    maxLength={1}
    value={value}
    onChange={(e) => onChange(index, e.target.value)}
    onKeyDown={(e) => onKeyDown(index, e)}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
    className="w-12 h-14 text-center bg-[var(--bg-tertiary)] border-2 border-[var(--border-default)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl text-[var(--text-primary)] text-xl font-bold focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-glow)]/20 outline-none transition-all"
    style={{ caretColor: "transparent" }}
    autoComplete="off"
  />
));

// --- Step Indicator Component ---
const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-3 mb-8">
    {[
      { step: 1, label: "Details" },
      { step: 2, label: "Verify" },
    ].map(({ step, label }, i) => (
      <React.Fragment key={step}>
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= step
              ? "bg-[var(--accent-primary)] text-[#001F26]"
              : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-default)]"
              }`}
          >
            {currentStep > step ? <CheckCircle size={16} /> : step}
          </div>
          <span
            className={`text-sm font-medium ${currentStep >= step ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
              }`}
          >
            {label}
          </span>
        </div>
        {i < 1 && (
          <div
            className={`w-12 h-0.5 rounded-full ${currentStep > 1 ? "bg-[var(--accent-primary)]" : "bg-[var(--border-default)]"
              }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// --- Main Component ---
export default function UserSignUp() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, setToken } = useContext(AuthContext);

  // States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef([]);
  const [otpError, setOtpError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    github: false,
  });
  const [passwordValidation, setPasswordValidation] = useState({
    hasLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [redirectProgress, setRedirectProgress] = useState(0);

  const isDirty =
    Object.values(formData).some((v) => Boolean(v)) ||
    otp.some((d) => Boolean(d)) ||
    showOtpInput;

  useExitIntentGuard({
    enabled: isDirty && !showExitModal,
    onAttemptExit: () => setShowExitModal(true),
  });

  // Window size for confetti
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Google OAuth
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: "auth-code",
    scope: "email profile",
  });

  // Countdown Timer
  useEffect(() => {
    let timer;
    if (showOtpInput && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showOtpInput, countdown]);

  const checkPasswordStrength = (password, confirmPassword) => {
    setPasswordValidation({
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
      passwordsMatch: password === confirmPassword && password !== "",
    });
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

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

        // Update context state
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        setModal({
          open: true,
          success: true,
          message: `Welcome to the squad, ${userData.name || "Coder"}! 🚀`,
        });

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

  const handleGoogleSignup = () => {
    googleLogin();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "password" || name === "confirmPassword") {
        checkPasswordStrength(
          name === "password" ? value : newData.password,
          name === "confirmPassword" ? value : newData.confirmPassword
        );
      }
      return newData;
    });
  };

  const handleBackToSocial = () => {
    setShowEmailForm(false);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");

    if (!isPasswordValid) {
      setModal({
        open: true,
        success: false,
        message: "Please ensure all password requirements are met.",
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setModal({
        open: true,
        success: false,
        message: "Passwords do not match.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/users/send-otp`, {
        email: formData.email,
        name: formData.name,
      });

      if (response.status === 200) {
        setOtpSent(true);
        setShowOtpInput(true);
        setCountdown(30);
        setCanResend(false);
        setTimeout(() => {
          if (otpInputs.current[0]) {
            otpInputs.current[0].focus();
          }
        }, 300);
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to send OTP");
      setModal({
        open: true,
        success: false,
        message: error.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const char = value.slice(-1);
    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = char;
      if (char && index < 5) {
        setTimeout(() => {
          otpInputs.current[index + 1]?.focus();
        }, 0);
      }
      return newOtp;
    });
  };

  const handleOtpKeyDown = (index, e) => {
    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        setOtp((prev) => {
          const newOtp = [...prev];
          if (!newOtp[index] && index > 0) {
            newOtp[index - 1] = "";
            setTimeout(() => {
              otpInputs.current[index - 1]?.focus();
            }, 0);
          } else {
            newOtp[index] = "";
          }
          return newOtp;
        });
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (index > 0) otpInputs.current[index - 1]?.focus();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (index < 5) otpInputs.current[index + 1]?.focus();
        break;
    }
  };

  const handleOtpSubmit = async () => {
    setLoading(true);
    setOtpError("");
    const otpString = otp.join("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-otp`, {
        email: formData.email,
        otp: otpString,
        name: formData.name,
        password: formData.password,
      });

      if (response.status === 201) {
        const userData = response.data.user;
        const authToken = response.data.token;

        // Store in localStorage for persistence
        localStorage.setItem("token", authToken);
        localStorage.setItem("userId", userData._id);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("lastActivityTime", Date.now().toString());

        // Store in SecureStorage for cache
        SecureStorage.setItem("user_cache", userData);

        // Update context state
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        setModal({
          open: true,
          success: true,
          message: `Welcome to the squad, ${formData.name}! 🚀`,
        });

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
      setOtpError(error.response?.data?.message || "Invalid OTP");
      setModal({
        open: true,
        success: false,
        message: error.response?.data?.message || "Failed to verify OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setCanResend(false);
      setCountdown(30);
      await axios.post(`${API_BASE_URL}/users/send-otp`, {
        email: formData.email,
        name: formData.name,
      });
      setOtpError("");
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const closeModal = () => {
    setModal({ open: false, success: false, message: "" });
  };

  const handleBack = () => {
    setShowExitModal(true);
  };

  // Determine current step
  const currentStep = showOtpInput ? 2 : 1;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex font-sans">
      <AuthExitModal
        isOpen={showExitModal}
        variant="signup"
        tone="playful"
        onStay={() => setShowExitModal(false)}
        onLeave={() => navigate("/")}
      />

      {/* LEFT PANEL - "The Ascent" Journey Visualization (Desktop Only) */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 relative overflow-hidden border-r-2 border-cyan-500/40"
      >
        {/* Matrix-Style Dark Background */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {/* Matrix Code Rain Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {[...Array(20)].map((_, i) => {
            const chars = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]<>/=+*&%$#@!?;:₹";
            const charArray = chars.split("");
            return (
              <motion.div
                key={i}
                className="absolute text-sm font-mono"
                style={{
                  left: `${(i / 20) * 100}%`,
                  top: 0,
                }}
                initial={{ y: -500 }}
                animate={{ y: "100vh" }}
                transition={{
                  duration: 6 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "linear",
                }}
              >
                {[...Array(20)].map((_, j) => (
                  <div
                    key={j}
                    style={{
                      color: j === 0 ? "#4ade80" : j < 3 ? "rgba(74, 222, 128, 0.8)" : j < 6 ? "rgba(34, 197, 94, 0.5)" : "rgba(34, 197, 94, 0.2)",
                      textShadow: j === 0 ? "0 0 20px #4ade80, 0 0 40px #22c55e" : "none",
                      lineHeight: "1.2",
                    }}
                  >
                    {charArray[Math.floor(Math.random() * charArray.length)]}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>

        {/* Gradient Overlay for Readability - Reduced opacity to show code rain */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Subtle Green Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">

          {/* Social Proof Pill - "FOMO" Element */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-8 left-8"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 bg-cyan-500/10 backdrop-blur-md border-2 border-cyan-500/30 rounded-full shadow-lg shadow-cyan-500/10">
              {/* Terminal Icon */}
              <div className="flex items-center gap-1 font-mono text-cyan-400 text-sm">
                <span className="text-cyan-500">$</span>
                <span className="animate-pulse">_</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-cyan-400 font-mono">50+ devs online</span>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-black text-white tracking-tight mb-4 leading-tight font-mono">
              Enter The
              <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                Matrix.
              </span>
            </h1>
            <p className="text-cyan-400/80 text-lg max-w-sm mx-auto font-mono">
              {">"} 10,000+ developers leveling up their code
            </p>
          </motion.div>

          {/* Journey Cards - "Direction Board" Style */}
          <div className="relative w-full max-w-md">
            {/* Left Vertical Thread */}
            <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent" />

            {/* Right Vertical Thread */}
            <div className="absolute right-0 top-8 bottom-8 w-0.5 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent" />

            {/* Circuit Loop Particles - Traveling around the full path */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`circuit-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/60 z-20"
                style={{ left: 0, top: 50 }}
                animate={{
                  // Path: top-left → bottom-left → bottom-right → top-right → top-left
                  left: [0, 0, "100%", "100%", 0],
                  top: [50, 280, 280, 50, 50],
                  // Hide when passing through card areas (roughly 60-100, 140-180, 220-260)
                  opacity: [1, 0.3, 1, 0.3, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 1.3,
                  times: [0, 0.25, 0.5, 0.75, 1],
                }}
              />
            ))}

            {/* Card 1 - Learn Algorithms */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{
                y: [0, -8, 0],
                opacity: 1,
              }}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.5, delay: 0.5 },
              }}
              className="relative mb-6 px-6"
            >
              {/* Left Thread Connector */}
              <div className="absolute left-0 top-1/2 w-6 h-0.5 bg-cyan-500/40" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/60 border border-cyan-400/80" />

              {/* Right Thread Connector */}
              <div className="absolute right-0 top-1/2 w-6 h-0.5 bg-cyan-500/40" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/60 border border-cyan-400/80" />


              <div className="relative bg-black/90 backdrop-blur-xl border-2 border-green-500/40 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm font-mono">Learn Algorithms</p>
                  <p className="text-cyan-400/80 text-xs font-mono">{"// Build foundation"}</p>
                </div>
                <div className="ml-auto text-white/40 text-lg font-mono">01</div>
              </div>
            </motion.div>

            {/* Card 2 - Mock Interviews */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{
                y: [0, -10, 0],
                opacity: 1,
              }}
              transition={{
                y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                opacity: { duration: 0.5, delay: 0.7 },
              }}
              className="relative mb-6 px-6"
            >
              {/* Left Thread Connector */}
              <div className="absolute left-0 top-1/2 w-6 h-0.5 bg-cyan-500/40" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/60 border border-cyan-400/80" />

              {/* Right Thread Connector */}
              <div className="absolute right-0 top-1/2 w-6 h-0.5 bg-cyan-500/40" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/60 border border-cyan-400/80" />


              <div className="relative bg-black/90 backdrop-blur-xl border-2 border-green-500/40 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm font-mono">Mock Interviews</p>
                  <p className="text-cyan-400/80 text-xs font-mono">{"// Test skills"}</p>
                </div>
                <div className="ml-auto text-white/40 text-lg font-mono">02</div>
              </div>
            </motion.div>

            {/* Card 3 - Get Hired */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{
                y: [0, -12, 0],
                opacity: 1,
              }}
              transition={{
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
                opacity: { duration: 0.5, delay: 0.9 },
              }}
              className="relative px-6"
            >
              {/* Left Thread Connector */}
              <div className="absolute left-0 top-1/2 w-6 h-0.5 bg-cyan-500/40" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/60 border border-cyan-400/80" />

              {/* Right Thread Connector */}
              <div className="absolute right-0 top-1/2 w-6 h-0.5 bg-cyan-500/40" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/60 border border-cyan-400/80" />

              <div className="relative bg-black/90 backdrop-blur-xl border-2 border-green-500/40 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                  <Trophy size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm font-mono">Get Hired</p>
                  <p className="text-cyan-400/80 text-xs font-mono">{"// Mission complete"}</p>
                </div>
                <div className="ml-auto text-white/40 text-lg font-mono">03</div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Stats - Terminal Style */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex items-center gap-6 font-mono"
          >
            <div className="text-center px-4 py-2 bg-black/60 border-2 border-green-500/30 rounded-lg">
              <p className="text-xl font-bold text-white">500+</p>
              <p className="text-[10px] text-cyan-400/80 uppercase">Problems</p>
            </div>
            <div className="text-center px-4 py-2 bg-black/60 border-2 border-green-500/30 rounded-lg">
              <p className="text-xl font-bold text-white">10K+</p>
              <p className="text-[10px] text-cyan-400/80 uppercase">Users</p>
            </div>
            <div className="text-center px-4 py-2 bg-black/60 border-2 border-green-500/30 rounded-lg">
              <p className="text-xl font-bold text-white">95%</p>
              <p className="text-[10px] text-cyan-400/80 uppercase">Success</p>
            </div>
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
          {/* Step Indicator */}
          {showEmailForm && <StepIndicator currentStep={currentStep} />}

          <AnimatePresence mode="wait">
            {/* STEP 1: Social Login Options */}
            {!showEmailForm && !showOtpInput && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="mb-10 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                    Create Account
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Join AlgoViz and start your learning journey
                  </p>
                </div>

                {/* Social Buttons */}
                <div className="space-y-4">
                  <motion.button
                    onClick={handleGoogleSignup}
                    disabled={socialLoading.google || socialLoading.github}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-default)] border-t-[var(--specular-highlight)] rounded-xl hover:bg-[var(--bg-elevated)] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 cursor-pointer text-[var(--text-primary)]"
                  >
                    {socialLoading.google ? (
                      <Loader2 className="animate-spin w-5 h-5 text-[var(--text-secondary)]" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium">
                          Continue with Google
                        </span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    disabled={socialLoading.google || socialLoading.github}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-default)] border-t-[var(--specular-highlight)] rounded-xl hover:bg-[var(--bg-elevated)] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 cursor-pointer text-[var(--text-primary)]"
                  >
                    <Github size={20} className="text-[var(--text-primary)]" />
                    <span className="font-medium">
                      Continue with GitHub
                    </span>
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="my-8 flex items-center">
                  <div className="flex-1 border-t border-[var(--border-default)]"></div>
                  <span className="px-4 text-[var(--text-muted)] text-sm">or</span>
                  <div className="flex-1 border-t border-[var(--border-default)]"></div>
                </div>

                {/* Email Option */}
                <motion.button
                  onClick={() => setShowEmailForm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[image:var(--gradient-brand)] text-[#001F26] border-t border-[var(--specular-highlight)] font-bold rounded-xl hover:shadow-[var(--shadow-glow)] hover:brightness-110 transition-all cursor-pointer"
                >
                  <Mail size={18} />
                  <span>Continue with Email</span>
                </motion.button>

                {/* Sign In Link */}
                <div className="mt-8 text-center">
                  <p className="text-[var(--text-secondary)]">
                    Already have an account?{" "}
                    <NavLink
                      to="/signin"
                      className="text-[var(--accent-primary)] hover:brightness-110 font-bold transition-all"
                    >
                      Sign In
                    </NavLink>
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Email Form */}
            {showEmailForm && !showOtpInput && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back Button */}
                <button
                  onClick={handleBackToSocial}
                  className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  <span>Back to options</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                  <h2 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
                    Create Account
                  </h2>
                  <p className="text-[var(--text-secondary)]">Fill in your details to get started</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="relative group">
                    <User
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${formData.name ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                        } group-focus-within:text-[var(--accent-primary)] z-10`}
                      size={18}
                    />
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_var(--accent-glow),inset_0_2px_4px_rgba(0,0,0,0.3)] outline-none transition-all font-body"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${formData.email ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                        } group-focus-within:text-[var(--accent-primary)] z-10`}
                      size={18}
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_var(--accent-glow),inset_0_2px_4px_rgba(0,0,0,0.3)] outline-none transition-all font-body"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <Lock
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${formData.password ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                        } group-focus-within:text-[var(--accent-primary)] z-10`}
                      size={18}
                    />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
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

                  {/* Password Strength Bar */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <PasswordStrengthBar validation={passwordValidation} />
                    </motion.div>
                  )}

                  {/* Confirm Password */}
                  <div className="relative group">
                    <Lock
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${formData.confirmPassword ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                        } group-focus-within:text-[var(--accent-primary)] z-10`}
                      size={18}
                    />
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_var(--accent-glow),inset_0_2px_4px_rgba(0,0,0,0.3)] outline-none transition-all font-body"
                    />
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle size={16} className="text-[#5CB8A5]" />
                          <span className="text-[#5CB8A5] text-sm">Passwords match</span>
                        </>
                      ) : (
                        <span className="text-[var(--accent-danger)] text-sm">Passwords do not match</span>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={
                      loading ||
                      !isPasswordValid ||
                      formData.password !== formData.confirmPassword ||
                      !formData.name ||
                      !formData.email
                    }
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-[image:var(--gradient-brand)] text-[#001F26] font-bold flex items-center justify-center gap-2 border border-transparent border-t-[var(--specular-highlight)] hover:shadow-[var(--shadow-glow)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        <span>Create Account</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: OTP Verification */}
            {showOtpInput && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Back Button */}
                <button
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp(["", "", "", "", "", ""]);
                    setOtpError("");
                  }}
                  className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  <span>Back to form</span>
                </button>

                {/* Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-[image:var(--gradient-brand)] border border-[var(--specular-highlight)] shadow-[var(--shadow-glow)] flex items-center justify-center"
                >
                  <Mail size={28} className="text-[#001F26]" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Verify Your Email
                </h2>
                <p className="text-[var(--text-secondary)] mb-8">
                  We've sent a 6-digit code to<br />
                  <span className="text-[var(--text-primary)] font-medium">{formData.email}</span>
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, index) => (
                    <OtpInput
                      key={index}
                      index={index}
                      value={digit}
                      onChange={handleOtpChange}
                      onKeyDown={handleOtpKeyDown}
                      inputRef={(el) => (otpInputs.current[index] = el)}
                    />
                  ))}
                </div>

                {/* Error */}
                {otpError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[var(--accent-danger)] text-sm mb-4"
                  >
                    {otpError}
                  </motion.p>
                )}

                {/* Resend Timer */}
                <div className="mb-6">
                  {countdown > 0 ? (
                    <p className="text-[var(--text-muted)] text-sm">
                      Resend code in{" "}
                      <span className="text-[var(--accent-primary)]">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-[var(--accent-primary)] hover:brightness-110 text-sm transition-all cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Verify Button */}
                <motion.button
                  onClick={handleOtpSubmit}
                  disabled={loading || otp.join("").length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-[image:var(--gradient-brand)] text-[#001F26] font-bold flex items-center justify-center gap-2 hover:shadow-[var(--shadow-glow)] hover:brightness-110 border border-transparent border-t-[var(--specular-highlight)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Verify Email</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>


      {/* Confetti - Only on success */}
      {modal.open && modal.success && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#06b6d4"]}
        />
      )}

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
                  {/* Success State - Celebration */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                      <Rocket size={48} className="text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      You're In! 🎉
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-400 mb-6"
                    >
                      {modal.message}
                    </motion.p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${redirectProgress}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-sm mt-3">
                      Preparing your dashboard...
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
