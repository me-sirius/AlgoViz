import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
  AlertTriangle,
  Sparkles,
  Trophy,
  Target,
  Clock,
  Cpu,
  TrendingUp,
  Activity,
  HardDrive,
  Search,
  Database,
  Grid3X3,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "../../core/context/ThemeContext";

// ============================================================================
// IMMERSIVE 3D BACKGROUND WITH PERSPECTIVE GRID
// ============================================================================

const ImmersiveBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${isDark ? "bg-black" : "bg-slate-50"}`}>
      {isDark ? (
        <>
          {/* Deep black base */}
          <div className="absolute inset-0 bg-black" />

          {/* 3D Perspective Grid Floor */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[60vh]"
            style={{
              background: `
            linear-gradient(to top, rgba(0,212,255,0.08) 0%, transparent 100%)
          `,
              transform: "perspective(1000px) rotateX(60deg)",
              transformOrigin: "bottom center",
            }}
          >
            {/* Grid lines */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
              linear-gradient(to right, rgba(0,212,255,0.2) 1px, transparent 1px),
              linear-gradient(to top, rgba(0,212,255,0.2) 1px, transparent 1px)
            `,
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          {/* Vignette for depth - reduced */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)",
            }}
          />

          {/* Subtle noise */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </>
      ) : (
        <>
          {/* Light Mode Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.5
          }} />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-cyan-50/50" />
        </>
      )}
    </div>
  );
};

// ============================================================================
// 3D GLASS CARD WITH DEEP SHADOWS
// ============================================================================

const GlassCard = ({
  children,
  className = "",
  hover = true,
  glow = null,
  depth = "md",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const depthStyles = {
    dark: {
      sm: {
        shadow: "0 4px 20px rgba(0,0,0,0.5), 0 8px 40px rgba(0,0,0,0.3)",
        bg: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.25)"
      },
      md: {
        shadow:
          "0 8px 32px rgba(0,0,0,0.6), 0 16px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        bg: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.25)"
      },
      lg: {
        shadow:
          "0 12px 48px rgba(0,0,0,0.7), 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
        bg: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.25)"
      },
    },
    light: {
      sm: {
        shadow: "0 4px 20px rgba(0,0,0,0.05), 0 8px 20px rgba(0,0,0,0.05)",
        bg: "rgba(255,255,255,0.8)",
        border: "rgba(226, 232, 240, 0.8)"
      },
      md: {
        shadow:
          "0 8px 32px rgba(0,0,0,0.05), 0 16px 32px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)",
        bg: "rgba(255,255,255,0.9)",
        border: "rgba(226, 232, 240, 0.8)"
      },
      lg: {
        shadow:
          "0 12px 48px rgba(0,0,0,0.1), 0 24px 60px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
        bg: "rgba(255,255,255,0.95)",
        border: "rgba(226, 232, 240, 0.8)"
      },
    }
  };

  const currentMode = isDark ? 'dark' : 'light';
  const style = depthStyles[currentMode][depth];

  return (
    <motion.div
      className={`relative rounded-[32px] overflow-hidden ${className}`}
      whileHover={hover ? { scale: 1.02, y: -8, rotateX: 2 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        background: style.bg,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: `2px solid ${style.border}`,
        boxShadow: style.shadow,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glow effect */}
      {glow && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% -20%, ${glow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Top edge highlight - brighter */}
      <div
        className="absolute top-0 left-[5%] right-[5%] h-px"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
            : "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
        }}
      />

      {/* Inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 30%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 30%)",
        }}
      />

      {children}
    </motion.div>
  );
};

// ============================================================================
// GRADIENT TEXT - HIGHER CONTRAST
// ============================================================================

const GradientText = ({ children, className = "", intensity = "normal" }) => {
  const gradients = {
    normal: "linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%)",
    bright: "linear-gradient(135deg, #22d3ee 0%, #c084fc 50%, #f472b6 100%)",
    white: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
  };

  return (
    <span
      className={`bg-clip-text text-transparent inline-block ${className}`}
      style={{
        backgroundImage: gradients[intensity],
        filter:
          intensity === "bright"
            ? "drop-shadow(0 0 30px rgba(0,212,255,0.5))"
            : undefined,
        paddingLeft: "0.05em",
        paddingRight: "0.05em",
        marginLeft: "-0.05em",
        marginRight: "-0.05em",
      }}
    >
      {children}
    </span>
  );
};

// ============================================================================
// N VALUE SLIDER - 3D PREMIUM
// ============================================================================

const N_VALUES = [
  { value: 10, label: "10" },
  { value: 100, label: "100" },
  { value: 1000, label: "1K" },
  { value: 10000, label: "10K" },
  { value: 100000, label: "100K" },
  { value: 1000000, label: "1M" },
];

const PremiumSlider = ({ value, onChange, disabled }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentIndex = N_VALUES.findIndex((v) => v.value === value);
  const progress = (currentIndex / (N_VALUES.length - 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Value Display */}
      <div className="text-center px-4 overflow-visible">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-block overflow-visible"
          style={{ perspective: "1000px" }}
        >
          <span
            className="text-8xl md:text-9xl font-black tracking-tighter block leading-[1.3]"
            style={{
              background: isDark
                ? "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)"
                : "linear-gradient(180deg, #0f172a 0%, #334155 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: isDark
                ? "drop-shadow(0 0 60px rgba(0,212,255,0.4))"
                : "drop-shadow(0 0 30px rgba(0,212,255,0.2))",
              padding: "0.15em 0.1em",
            }}
          >
            {N_VALUES[currentIndex]?.label || value}
          </span>
        </motion.div>
        <p className={`text-sm uppercase tracking-[0.4em] mt-2 font-medium ${isDark ? "text-white/50" : "text-slate-500"}`}>
          Input Size (N)
        </p>
      </div>

      {/* Track - with 3D depth */}
      <div className="relative py-3">
        <div
          className="relative h-2 rounded-full"
          style={{
            background: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)",
            boxShadow: isDark
              ? "inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)"
              : "inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          {/* Progress fill with glow */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #00d4ff, #a855f7, #ec4899)",
              boxShadow:
                "0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(168,85,247,0.4)",
              width: `${progress}%`,
            }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Thumb indicator - positioned outside the track */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full z-10"
          style={{
            left: `calc(${progress}% - 12px)`,
            background: "linear-gradient(180deg, #ffffff 0%, #d0d0d0 100%)",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.5), 0 0 20px rgba(0,212,255,0.5), inset 0 1px 0 rgba(255,255,255,0.8)",
            border: "2px solid rgba(255,255,255,0.9)",
          }}
          layout
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      {/* Step Buttons - 3D */}
      <div className="flex justify-between gap-3">
        {N_VALUES.map((item) => {
          const isActive = item.value === value;
          return (
            <motion.button
              key={item.value}
              onClick={() => !disabled && onChange(item.value)}
              disabled={disabled}
              className={`flex-1 py-4 px-3 rounded-2xl text-sm font-bold transition-all ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                }`}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(168,85,247,0.25))"
                  : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)",
                border: isActive
                  ? "1px solid rgba(0,212,255,0.5)"
                  : isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid rgba(0,0,0,0.1)",
                color: isActive ? "#00d4ff" : isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                boxShadow: isActive
                  ? "0 4px 20px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 2px 10px rgba(0,0,0,0.05)",
              }}
              whileHover={!disabled ? { scale: 1.08, y: -4 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// RACE TRACK - 3D IMMERSIVE
// ============================================================================

const RaceTrack = ({
  label,
  complexity,
  progress,
  operations,
  isOptimized,
  isComplete,
  isStalled,
  estimatedTime,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const accentColor = isOptimized ? "#00d4ff" : "#ef4444";
  const gradient = isOptimized
    ? "linear-gradient(90deg, #00d4ff, #10b981)"
    : "linear-gradient(90deg, #ef4444, #f97316)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, rotateY: -5 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: isOptimized ? 0 : 0.15, type: "spring" }}
      className="relative"
      style={{ perspective: "1000px" }}
    >
      {/* Card container */}
      <div
        className="p-6 rounded-[28px]"
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${accentColor}15, rgba(255,255,255,0.03))`
            : `linear-gradient(135deg, ${accentColor}10, rgba(255,255,255,0.8))`,
          border: isDark ? `2px solid ${accentColor}40` : `1px solid ${accentColor}30`,
          boxShadow: isDark
            ? `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${accentColor}20`
            : `0 8px 20px rgba(0,0,0,0.05), inset 0 1px 0 ${accentColor}10`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                border: `2px solid ${accentColor}60`,
                boxShadow: `0 4px 20px ${accentColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
              animate={
                isComplete ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}
              }
            >
              {isOptimized ? (
                <Zap className="w-6 h-6" style={{ color: isDark ? accentColor : 'white' }} />
              ) : (
                <Cpu className="w-6 h-6" style={{ color: isDark ? accentColor : 'white' }} />
              )}
            </motion.div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{label}</h3>
              <p className={`text-base font-mono ${isDark ? "text-white/50" : "text-slate-500"}`}>{complexity}</p>
            </div>
          </div>

          {/* Status badges */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{
                  background: isOptimized
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(239,68,68,0.2)",
                  border: `1px solid ${isOptimized ? "#10b98150" : "#ef444450"}`,
                  boxShadow: `0 4px 20px ${isOptimized ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
              >
                <Trophy
                  className="w-4 h-4"
                  style={{ color: isOptimized ? "#10b981" : "#ef4444" }}
                />
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: isOptimized ? "#10b981" : "#ef4444" }}
                >
                  Done
                </span>
              </motion.div>
            )}
            {isStalled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, x: [0, -5, 5, -5, 5, 0] }}
                transition={{ x: { repeat: Infinity, duration: 0.4 } }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 border border-red-500/50"
                style={{ boxShadow: "0 0 30px rgba(239,68,68,0.4)" }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-bold uppercase tracking-wider text-red-400">
                  CPU Overload
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Track - 3D */}
        <div
          className="relative h-20 rounded-2xl overflow-hidden"
          style={{
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
            boxShadow:
              "inset 0 4px 12px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Progress glow */}
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${progress}%`,
              background: gradient,
              opacity: 0.25,
            }}
            layout
          />

          {/* Agent with trail */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `calc(${Math.min(progress, 92)}% - 28px)` }}
            layout
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            {/* Trail effect */}
            {progress > 5 && (
              <motion.div
                className="absolute right-full top-1/2 -translate-y-1/2 h-1 rounded-full"
                style={{
                  width: `${Math.min(progress * 2, 150)}px`,
                  background: `linear-gradient(to left, ${accentColor}, transparent)`,
                  opacity: 0.6,
                }}
              />
            )}

            {/* Agent body */}
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: gradient,
                boxShadow: `0 0 40px ${accentColor}80, 0 0 80px ${accentColor}40, 0 4px 20px rgba(0,0,0,0.1)`,
              }}
              animate={
                isStalled
                  ? { x: [-3, 3, -3, 3, 0], rotate: [-5, 5, -5, 5, 0] }
                  : {}
              }
              transition={isStalled ? { repeat: Infinity, duration: 0.15 } : {}}
            >
              {isOptimized ? (
                <Zap className="w-6 h-6 text-white" />
              ) : (
                <Cpu className="w-6 h-6 text-white" />
              )}
            </motion.div>

            {/* Completion burst */}
            {isComplete && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ background: accentColor }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.div>

          {/* Finish line */}
          <div
            className="absolute right-6 top-3 bottom-3 w-1 rounded-full"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
            }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isDark ? "text-white/40" : "text-slate-400"}`} />
              <span className={`text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>Ops:</span>
              <span
                className="font-mono font-bold text-base"
                style={{ color: accentColor }}
              >
                {operations >= 1e6
                  ? `${(operations / 1e6).toFixed(1)}M`
                  : operations.toLocaleString()}
              </span>
            </div>
            {estimatedTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400/60" />
                <span className={`text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>Est:</span>
                <span className="font-mono font-bold text-base text-red-400">
                  {estimatedTime}
                </span>
              </div>
            )}
          </div>
          <span className={`font-mono text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// INSIGHT CARDS - 3D BENTO
// ============================================================================

const InsightCard = ({
  title,
  value,
  subtitle,
  color,
  icon: Icon,
  delay = 0,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -8, rotateX: 5 }}
      className="p-6 rounded-[24px] cursor-default"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${color}15, rgba(255,255,255,0.03))`
          : `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.8))`,
        border: isDark ? `2px solid ${color}40` : `1px solid ${color}30`,
        boxShadow: isDark
          ? `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${color}20`
          : `0 8px 32px rgba(0,0,0,0.05), inset 0 1px 0 ${color}10`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${color}30`,
          border: `2px solid ${color}50`,
          boxShadow: `0 4px 15px ${color}40`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: isDark ? color : (color === '#ffffff' ? '#334155' : color) }} />
      </div>
      <div className="text-4xl font-black mb-1" style={{ color: isDark ? color : (color === '#ffffff' ? '#0f172a' : color) }}>
        {value}
      </div>
      <div className={`text-sm font-medium ${isDark ? "text-white/60" : "text-slate-600"}`}>{title}</div>
      {subtitle && <div className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>{subtitle}</div>}
    </motion.div>
  );
};

// ============================================================================
// VERDICT - HIGH CONTRAST
// ============================================================================

const Verdict = ({ n }) => {
  const getVerdict = () => {
    if (n <= 100) {
      return {
        status: "OPTIMAL",
        message: "Both algorithms perform efficiently at this scale",
        color: "#10b981",
      };
    } else if (n <= 10000) {
      return {
        status: "CAUTION",
        message: "Performance gap is becoming significant",
        color: "#f59e0b",
      };
    } else {
      return {
        status: "CRITICAL",
        message: "Brute force is computationally infeasible",
        color: "#ef4444",
      };
    }
  };

  const verdict = getVerdict();

  return (
    <motion.div
      key={verdict.status}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex items-center gap-5 p-6 rounded-2xl"
      style={{
        background: `${verdict.color}18`,
        border: `2px solid ${verdict.color}50`,
        boxShadow: `0 8px 32px ${verdict.color}25, inset 0 1px 0 ${verdict.color}15`,
      }}
    >
      <motion.div
        className="w-4 h-4 rounded-full"
        style={{
          background: verdict.color,
          boxShadow: `0 0 20px ${verdict.color}, 0 0 40px ${verdict.color}80`,
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div>
        <div
          className="text-base font-black uppercase tracking-wider"
          style={{ color: verdict.color }}
        >
          {verdict.status}
        </div>
        <div className="text-white/60 text-sm">{verdict.message}</div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// THE GREAT RACE - MAIN MODULE
// ============================================================================

const TheGreatRace = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [n, setN] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [optimizedProgress, setOptimizedProgress] = useState(0);
  const [bruteProgress, setBruteProgress] = useState(0);
  const [optimizedComplete, setOptimizedComplete] = useState(false);
  const [bruteComplete, setBruteComplete] = useState(false);
  const [bruteStalled, setBruteStalled] = useState(false);

  const optimizedRef = useRef(null);
  const bruteRef = useRef(null);

  const optimizedOps = Math.ceil(Math.log2(n));
  const bruteOps = n * n;
  const optimizedDuration = 0.3;
  const bruteDuration = n <= 100 ? 1 : n <= 1000 ? 3 : n <= 10000 ? 8 : 999;

  const formatTime = () => {
    const ops = n * n;
    const seconds = ops / 1e9;
    if (seconds < 1) return "< 1s";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)}d`;
    return `${Math.round(seconds / 31536000)}y`;
  };

  const reset = useCallback(() => {
    if (optimizedRef.current) cancelAnimationFrame(optimizedRef.current);
    if (bruteRef.current) cancelAnimationFrame(bruteRef.current);
    setIsRunning(false);
    setOptimizedProgress(0);
    setBruteProgress(0);
    setOptimizedComplete(false);
    setBruteComplete(false);
    setBruteStalled(false);
  }, []);

  const startRace = useCallback(() => {
    reset();
    setIsRunning(true);

    const optStart = performance.now();
    const animateOpt = (time) => {
      const elapsed = time - optStart;
      const progress = Math.min(
        (elapsed / (optimizedDuration * 1000)) * 100,
        100,
      );
      setOptimizedProgress(progress);
      if (progress < 100) {
        optimizedRef.current = requestAnimationFrame(animateOpt);
      } else {
        setOptimizedComplete(true);
      }
    };
    optimizedRef.current = requestAnimationFrame(animateOpt);

    const bruteStart = performance.now();
    const animateBrute = (time) => {
      const elapsed = time - bruteStart;
      if (bruteDuration > 100) {
        const stallProgress = Math.min((elapsed / 3000) * 5, 5);
        setBruteProgress(stallProgress);
        if (elapsed > 2000) setBruteStalled(true);
        if (elapsed < 8000)
          bruteRef.current = requestAnimationFrame(animateBrute);
      } else {
        const progress = Math.min(
          (elapsed / (bruteDuration * 1000)) * 100,
          100,
        );
        setBruteProgress(progress);
        if (progress < 100) {
          bruteRef.current = requestAnimationFrame(animateBrute);
        } else {
          setBruteComplete(true);
        }
      }
    };
    bruteRef.current = requestAnimationFrame(animateBrute);
  }, [optimizedDuration, bruteDuration, reset]);

  useEffect(() => reset(), [n, reset]);
  useEffect(
    () => () => {
      if (optimizedRef.current) cancelAnimationFrame(optimizedRef.current);
      if (bruteRef.current) cancelAnimationFrame(bruteRef.current);
    },
    [],
  );

  const efficiencyGap = Math.round(bruteOps / Math.max(optimizedOps, 1));

  return (
    <section className="py-20 md:py-32">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20 overflow-visible px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8"
          style={{
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.3)",
            boxShadow: "0 4px 20px rgba(0,212,255,0.2)",
          }}
        >
          <Target className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-sm font-bold tracking-wider">
            MODULE 01
          </span>
        </motion.div>

        <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.3] py-2 px-4">
          <span className={isDark ? "text-white" : "text-slate-900"}>The Great </span>
          <GradientText intensity="bright">Race</GradientText>
        </h2>

        <p className={`text-xl max-w-xl mx-auto leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
          Witness algorithm efficiency at scale.
          <br />
          <span className={`font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>
            Drag. Watch. Understand.
          </span>
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Slider Card */}
        <GlassCard
          className="p-6 md:p-8"
          hover={false}
          depth="lg"
          glow="rgba(0,212,255,0.3)"
        >
          <PremiumSlider value={n} onChange={setN} disabled={isRunning} />
        </GlassCard>

        {/* Race Tracks */}
        <div className="space-y-6">
          <RaceTrack
            label="Binary Search"
            complexity="O(log n)"
            progress={optimizedProgress}
            operations={optimizedOps}
            isOptimized={true}
            isComplete={optimizedComplete}
            isStalled={false}
          />
          <RaceTrack
            label="Brute Force"
            complexity="O(n²)"
            progress={bruteProgress}
            operations={bruteOps}
            isOptimized={false}
            isComplete={bruteComplete}
            isStalled={bruteStalled}
            estimatedTime={n >= 10000 ? formatTime() : null}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-5">
          <motion.button
            onClick={startRace}
            disabled={isRunning}
            className={`flex items-center gap-3 px-8 py-2 rounded-2xl text-lg font-bold ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            style={{
              background: isRunning
                ? "rgba(255,255,255,0.05)"
                : "linear-gradient(135deg, #00d4ff, #a855f7)",
              color: "white",
              boxShadow: isRunning
                ? "none"
                : "0 8px 40px rgba(0,212,255,0.4), 0 4px 20px rgba(168,85,247,0.3)",
            }}
            whileHover={!isRunning ? { scale: 1.05, y: -4 } : {}}
            whileTap={!isRunning ? { scale: 0.98 } : {}}
          >
            <Play className="w-6 h-6" />
            {isRunning ? "Racing..." : "Start Race"}
          </motion.button>

          <motion.button
            onClick={reset}
            className="flex items-center gap-3 px-8 py-2 rounded-2xl text-lg font-medium cursor-pointer"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              border: isDark ? "2px solid rgba(255,255,255,0.25)" : "2px solid rgba(0,0,0,0.1)",
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
              boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.05)",
            }}
            whileHover={{ scale: 1.05, borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </motion.button>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <InsightCard
            title="Optimized Ops"
            value={optimizedOps}
            color="#00d4ff"
            icon={Zap}
            delay={0.1}
          />
          <InsightCard
            title="Brute Force Ops"
            value={
              bruteOps >= 1e6
                ? `${(bruteOps / 1e6).toFixed(0)}M`
                : bruteOps.toLocaleString()
            }
            color="#ef4444"
            icon={Cpu}
            delay={0.15}
          />
          <InsightCard
            title="Efficiency Gap"
            value={`${efficiencyGap >= 1e6 ? `${(efficiencyGap / 1e6).toFixed(0)}M` : efficiencyGap.toLocaleString()}x`}
            subtitle="faster"
            color="#a855f7"
            icon={TrendingUp}
            delay={0.2}
          />
          <InsightCard
            title="Time Saved"
            value={n >= 10000 ? formatTime() : "~0s"}
            subtitle="at 1B ops/sec"
            color="#10b981"
            icon={Clock}
            delay={0.25}
          />
        </div>

        {/* Verdict */}
        <Verdict n={n} />

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-12"
        >
          <blockquote className={`text-3xl md:text-4xl font-light leading-relaxed tracking-tight ${isDark ? "text-white/90" : "text-slate-800"}`}>
            "Code isn't just about{" "}
            <span className="font-bold text-cyan-400">working</span>—
            <br />
            it's about{" "}
            <span className="font-bold text-emerald-400">scaling</span>."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// MODULE 2: THE RAM VISUALIZER
// ============================================================================

// Mini sparkline component for metric cards
const MiniSparkline = ({ data, color, height = 30 }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data, 1);
  const width = 80;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      className="absolute bottom-2 right-2 opacity-30"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const TheRamVisualizer = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const GRID_SIZE = 100;
  const [grid, setGrid] = useState(
    Array(GRID_SIZE)
      .fill(null)
      .map(() => ({ occupied: false, scanning: false, trail: 0 })),
  );
  const [operations, setOperations] = useState(0);
  const [memoryUsed, setMemoryUsed] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentOp, setCurrentOp] = useState(null);
  const [operationsHistory, setOperationsHistory] = useState([0]);
  const [memoryHistory, setMemoryHistory] = useState([0]);
  const [isStressed, setIsStressed] = useState(false);
  const animationRef = useRef(null);
  const trailRef = useRef(null);

  // Check for stress state (memory > 90%)
  useEffect(() => {
    const memoryPercent = (memoryUsed / GRID_SIZE) * 100;
    if (memoryPercent >= 90 && !isStressed) {
      setIsStressed(true);
    } else if (memoryPercent < 90 && isStressed) {
      setIsStressed(false);
    }
  }, [memoryUsed, isStressed]);

  // Trail fade effect
  useEffect(() => {
    if (isAnimating) {
      trailRef.current = setInterval(() => {
        setGrid((prev) =>
          prev.map((cell) => ({
            ...cell,
            trail: cell.trail > 0 ? cell.trail - 1 : 0,
          })),
        );
      }, 100);
    }
    return () => {
      if (trailRef.current) clearInterval(trailRef.current);
    };
  }, [isAnimating]);

  const resetGrid = useCallback(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    if (trailRef.current) clearInterval(trailRef.current);
    setGrid(
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({ occupied: false, scanning: false, trail: 0 })),
    );
    setOperations(0);
    setMemoryUsed(0);
    setIsAnimating(false);
    setShowResult(false);
    setCurrentOp(null);
    setOperationsHistory([0]);
    setMemoryHistory([0]);
    setIsStressed(false);
  }, []);

  const runLinearSearch = useCallback(() => {
    if (isAnimating) return;
    resetGrid();
    setIsAnimating(true);
    setCurrentOp("search");
    const cellsToVisit = Array.from({ length: 25 }, () =>
      Math.floor(Math.random() * GRID_SIZE),
    );
    let step = 0;
    let prevCell = -1;
    animationRef.current = setInterval(() => {
      if (step >= cellsToVisit.length) {
        clearInterval(animationRef.current);
        setIsAnimating(false);
        setGrid((prev) => prev.map((cell) => ({ ...cell, scanning: false })));
        setShowResult(true);
        return;
      }
      const currentCell = cellsToVisit[step];
      setGrid((prev) =>
        prev.map((cell, i) => ({
          ...cell,
          scanning: i === currentCell,
          trail: i === prevCell ? 5 : cell.trail > 0 ? cell.trail : 0, // Ghost trail
        })),
      );
      setOperations((prev) => {
        const newVal = prev + 1;
        setOperationsHistory((h) => [...h.slice(-19), newVal]);
        return newVal;
      });
      prevCell = currentCell;
      step++;
    }, 60);
  }, [isAnimating, resetGrid]);

  const runCreateArray = useCallback(() => {
    if (isAnimating) return;
    resetGrid();
    setIsAnimating(true);
    setCurrentOp("array");
    let step = 0;
    const cellsToFill = 25;
    animationRef.current = setInterval(() => {
      if (step >= cellsToFill) {
        clearInterval(animationRef.current);
        setIsAnimating(false);
        setGrid((prev) => prev.map((cell) => ({ ...cell, scanning: false })));
        setShowResult(true);
        return;
      }
      setGrid((prev) =>
        prev.map((cell, i) => ({
          occupied: i <= step ? true : cell.occupied,
          scanning: i === step,
          trail: i === step - 1 ? 5 : cell.trail > 0 ? cell.trail : 0,
        })),
      );
      setOperations((prev) => {
        const newVal = prev + 1;
        setOperationsHistory((h) => [...h.slice(-19), newVal]);
        return newVal;
      });
      setMemoryUsed((prev) => {
        const newVal = prev + 1;
        setMemoryHistory((h) => [...h.slice(-19), newVal]);
        return newVal;
      });
      step++;
    }, 60);
  }, [isAnimating, resetGrid]);

  const runMatrixFill = useCallback(() => {
    if (isAnimating) return;
    resetGrid();
    setIsAnimating(true);
    setCurrentOp("matrix");
    let step = 0;
    animationRef.current = setInterval(() => {
      if (step >= GRID_SIZE) {
        clearInterval(animationRef.current);
        setIsAnimating(false);
        setGrid((prev) => prev.map((cell) => ({ ...cell, scanning: false })));
        setShowResult(true);
        return;
      }
      setGrid((prev) =>
        prev.map((cell, i) => ({
          occupied: i <= step ? true : cell.occupied,
          scanning: i === step,
          trail: i === step - 1 ? 5 : cell.trail > 0 ? cell.trail : 0,
        })),
      );
      setOperations((prev) => {
        const newVal = prev + 1;
        setOperationsHistory((h) => [...h.slice(-19), newVal]);
        return newVal;
      });
      setMemoryUsed((prev) => {
        const newVal = prev + 1;
        setMemoryHistory((h) => [...h.slice(-19), newVal]);
        return newVal;
      });
      step++;
    }, 18);
  }, [isAnimating, resetGrid]);

  useEffect(
    () => () => {
      if (animationRef.current) clearInterval(animationRef.current);
      if (trailRef.current) clearInterval(trailRef.current);
    },
    [],
  );

  const operationData = {
    search: {
      title: "Linear Search",
      complexity: "O(N) Time, O(1) Space",
      color: "#00d4ff",
      explanation:
        "The scanner visits each cell but stores nothing permanently. Only one pointer variable is needed regardless of input size.",
      code: "for (i = 0; i < n; i++)\n  if (arr[i] === target)\n    return i;",
    },
    array: {
      title: "Create Array",
      complexity: "O(N) Time, O(N) Space",
      color: "#a855f7",
      explanation:
        "Each element processed requires permanent storage. Memory usage grows linearly with input size.",
      code: "int[] arr = new int[n];\nfor (i = 0; i < n; i++)\n  arr[i] = i * 2;",
    },
    matrix: {
      title: "Matrix Fill",
      complexity: "O(N²) Time, O(N²) Space",
      color: "#f97316",
      explanation:
        "A 2D matrix requires N×N operations AND N×N memory cells. Quadratic growth becomes dangerous at scale!",
      code: "int[][] m = new int[n][n];\nfor (i = 0; i < n; i++)\n  for (j = 0; j < n; j++)\n    m[i][j] = val;",
    },
  };

  const current = currentOp ? operationData[currentOp] : null;
  const memoryPercent = (memoryUsed / GRID_SIZE) * 100;

  return (
    <section className="py-20 md:py-28">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14 px-4 overflow-visible"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-6"
          style={{
            background: "rgba(168,85,247,0.15)",
            border: "2px solid rgba(168,85,247,0.4)",
            boxShadow: "0 4px 20px rgba(168,85,247,0.2)",
          }}
        >
          <HardDrive className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm font-bold tracking-wider">
            MODULE 02
          </span>
        </motion.div>

        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.2] py-2">
          <span className={isDark ? "text-white" : "text-slate-900"}>Space </span>
          <GradientText intensity="bright">Complexity</GradientText>
        </h2>

        <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
          Time ={" "}
          <span className="text-cyan-400 font-semibold">
            how many operations
          </span>
          . Space ={" "}
          <span className="text-purple-400 font-semibold">how much memory</span>
          .
          <br />
          <span className={isDark ? "text-white/70" : "text-slate-700"}>Watch them diverge.</span>
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Control Panel */}
        <GlassCard
          className="p-5"
          hover={false}
          depth="lg"
          glow="rgba(168,85,247,0.15)"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {[
              {
                key: "search",
                label: "Linear Search",
                icon: Search,
                color: "#00d4ff",
                action: runLinearSearch,
              },
              {
                key: "array",
                label: "Create Array",
                icon: Database,
                color: "#a855f7",
                action: runCreateArray,
              },
              {
                key: "matrix",
                label: "Fill Matrix",
                icon: Grid3X3,
                color: "#f97316",
                action: runMatrixFill,
              },
            ].map((btn) => (
              <motion.button
                key={btn.key}
                onClick={btn.action}
                disabled={isAnimating}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-base font-bold ${isAnimating
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
                  } ${currentOp === btn.key ? "ring-2 ring-white/30" : ""}`}
                style={{
                  background: `linear-gradient(135deg, ${btn.color}20, ${btn.color}10)`,
                  border: `2px solid ${btn.color}50`,
                  boxShadow:
                    currentOp === btn.key
                      ? `0 0 25px ${btn.color}40`
                      : `0 4px 15px ${btn.color}15`,
                }}
                whileHover={!isAnimating ? { scale: 1.05, y: -2 } : {}}
                whileTap={!isAnimating ? { scale: 0.95 } : {}}
              >
                <btn.icon className="w-5 h-5" style={{ color: btn.color }} />
                <span style={{ color: btn.color }}>{btn.label}</span>
              </motion.button>
            ))}
            <motion.button
              onClick={resetGrid}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                border: isDark ? "2px solid rgba(255,255,255,0.2)" : "2px solid rgba(0,0,0,0.1)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className={`w-4 h-4 ${isDark ? "text-white/60" : "text-slate-600"}`} />
              <span className={isDark ? "text-white/60" : "text-slate-600"}>Reset</span>
            </motion.button>
          </div>
        </GlassCard>

        {/* Main Visualization Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Memory Grid with Stress Shake */}
          <motion.div
            animate={isStressed ? { x: [0, -3, 3, -3, 3, 0] } : {}}
            transition={{
              duration: 0.4,
              repeat: isStressed ? Infinity : 0,
              repeatDelay: 0.5,
            }}
          >
            <GlassCard
              className="p-6"
              hover={false}
              depth="lg"
              glow={isStressed ? "rgba(239,68,68,0.3)" : "rgba(168,85,247,0.1)"}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300"
                  style={{
                    background: isStressed
                      ? "rgba(239,68,68,0.3)"
                      : "rgba(168,85,247,0.2)",
                    borderColor: isStressed
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(168,85,247,0.3)",
                  }}
                >
                  <HardDrive
                    className={`w-5 h-5 ${isStressed ? "text-red-400" : "text-purple-400"}`}
                  />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  RAM Visualization
                </h3>
                <span
                  className={`text-sm ml-auto ${isStressed ? "text-red-400 font-bold" : "text-white/30"}`}
                >
                  {isStressed && "⚠ "}
                  {memoryUsed}/100 blocks
                </span>
              </div>

              <div
                className="p-4 rounded-xl mx-auto transition-all duration-300"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: `2px solid ${isStressed ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                  maxWidth: "380px",
                  boxShadow: isStressed
                    ? "0 0 30px rgba(239,68,68,0.2)"
                    : "none",
                }}
              >
                <div className="grid grid-cols-10 gap-[3px]">
                  {grid.map((cell, index) => (
                    <motion.div
                      key={index}
                      className="aspect-square rounded-sm"
                      style={{
                        background: cell.occupied
                          ? "linear-gradient(135deg, #a855f7, #ec4899)"
                          : cell.scanning
                            ? "#00d4ff"
                            : cell.trail > 0
                              ? `rgba(0, 212, 255, ${cell.trail * 0.15})` // Ghost trail fading
                              : isDark ? "rgba(30,41,59,0.9)" : "rgba(226, 232, 240, 0.8)",
                        border: cell.scanning
                          ? "2px solid #00d4ff"
                          : cell.occupied
                            ? "1px solid rgba(168,85,247,0.6)"
                            : cell.trail > 0
                              ? `1px solid rgba(0, 212, 255, ${cell.trail * 0.1})`
                              : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.5)",
                        boxShadow: cell.scanning
                          ? "0 0 15px rgba(0,212,255,0.9)"
                          : cell.trail > 0
                            ? `0 0 ${cell.trail * 2}px rgba(0,212,255,${cell.trail * 0.1})`
                            : cell.occupied
                              ? "0 0 8px rgba(168,85,247,0.5)"
                              : "none",
                      }}
                      animate={{ scale: cell.scanning ? 1.2 : 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                  <span className="text-white/50">Scanning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    }}
                  />
                  <span className="text-white/50">Allocated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ background: "rgba(0, 212, 255, 0.3)" }}
                  />
                  <span className="text-white/50">Trail</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right: Metrics + Info */}
          <div className="space-y-4">
            {/* Metrics with Sparklines */}
            <div className="grid grid-cols-2 gap-4">
              <GlassCard
                className="p-5 relative overflow-hidden"
                hover={false}
                glow="rgba(0,212,255,0.1)"
              >
                <MiniSparkline data={operationsHistory} color="#00d4ff" />
                <div className={`flex items-center gap-2 text-sm mb-2 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Operations</span>
                </div>
                <motion.div
                  key={operations}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-black text-cyan-400"
                >
                  {operations}
                </motion.div>
                <div className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                  Time Complexity
                </div>
              </GlassCard>

              <GlassCard
                className="p-5 relative overflow-hidden transition-all duration-300"
                hover={false}
                glow={
                  isStressed ? "rgba(239,68,68,0.2)" : "rgba(168,85,247,0.1)"
                }
              >
                <MiniSparkline
                  data={memoryHistory}
                  color={isStressed ? "#ef4444" : "#a855f7"}
                />
                <div className={`flex items-center gap-2 text-sm mb-2 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                  <HardDrive
                    className={`w-4 h-4 ${isStressed ? "text-red-400" : "text-purple-400"}`}
                  />
                  <span>Memory Blocks</span>
                </div>
                <motion.div
                  key={memoryUsed}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className={`text-4xl font-black ${isStressed ? "text-red-400" : "text-purple-400"}`}
                >
                  {memoryUsed}
                </motion.div>
                <div className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                  Space Complexity{" "}
                  {isStressed && <span className="text-red-400">⚠</span>}
                </div>
                {/* Memory Bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${isDark ? "bg-black/40" : "bg-black/10"}`}>
                  <motion.div
                    className="h-full"
                    style={{
                      background: isStressed
                        ? "linear-gradient(90deg, #ef4444, #f97316)"
                        : "linear-gradient(90deg, #a855f7, #ec4899)",
                      width: `${memoryPercent}%`,
                    }}
                    layout
                  />
                </div>
              </GlassCard>
            </div>

            {/* Result/Explanation Panel */}
            <GlassCard
              className="p-5 min-h-[200px]"
              hover={false}
              glow={current ? `${current.color}10` : "transparent"}
            >
              <AnimatePresence mode="wait">
                {showResult && current ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4
                        className="text-lg font-bold"
                        style={{ color: current.color }}
                      >
                        {current.title}
                      </h4>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-mono"
                        style={{
                          background: `${current.color}20`,
                          color: current.color,
                        }}
                      >
                        {current.complexity}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-white/70" : "text-slate-600"}`}>
                      {current.explanation}
                    </p>
                    <div className={`rounded-lg p-3 border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-100 border-slate-200"}`}>
                      <pre className={`text-xs font-mono overflow-x-auto whitespace-pre-wrap ${isDark ? "text-white/60" : "text-slate-500"}`}>
                        {current.code}
                      </pre>
                    </div>
                  </motion.div>
                ) : isAnimating && current ? (
                  <motion.div
                    key="running"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-8"
                  >
                    <Activity
                      className={`w-8 h-8 mb-3 ${isStressed ? "text-red-400" : "text-cyan-400"} animate-pulse`}
                    />
                    <p className={`font-medium ${isDark ? "text-white/60" : "text-slate-600"}`}>
                      Running {current.title}...
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                      {isStressed
                        ? "⚠ Memory filling up fast!"
                        : "Watch the counters!"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-8"
                  >
                    <Target className={`w-10 h-10 mb-4 ${isDark ? "text-white/20" : "text-slate-300"}`} />
                    <p className={`text-center ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      Select an operation above
                      <br />
                      <span className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>
                        to visualize time vs space complexity
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </div>
        </div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-6"
        >
          <div
            className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "2px solid rgba(255,255,255,0.1)",
            }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <p className="text-white/70 text-sm md:text-base">
              <span className="text-cyan-400 font-semibold">Time</span> = steps
              taken.
              <span className="text-purple-400 font-semibold ml-4">
                Space
              </span>{" "}
              = memory used.
              <span className="text-white/50 ml-4">
                They grow independently!
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// ============================================================================
// MODULE 3: THE COMPLEXITY ZOO
// ============================================================================

// Generate data points for N=1 to N=20
const generateComplexityData = () => {
  const data = [];
  for (let n = 1; n <= 20; n++) {
    data.push({
      n,
      constant: 1,
      logarithmic: Math.log2(n),
      linear: n,
      quadratic: n * n,
      exponential: Math.pow(2, n),
    });
  }
  return data;
};

const COMPLEXITY_CONFIGS = [
  {
    key: "constant",
    label: "O(1)",
    name: "Instant",
    color: "#ffffff",
    rating: "Perfect",
    dashed: true,
  },
  {
    key: "logarithmic",
    label: "O(log N)",
    name: "Excellent",
    color: "#10b981",
    rating: "Excellent",
    glowing: true,
  },
  {
    key: "linear",
    label: "O(N)",
    name: "Fair",
    color: "#06b6d4",
    rating: "Fair",
  },
  {
    key: "quadratic",
    label: "O(N²)",
    name: "Caution",
    color: "#f97316",
    rating: "Caution",
    thick: true,
  },
  {
    key: "exponential",
    label: "O(2^N)",
    name: "Danger",
    color: "#dc2626",
    rating: "Danger",
    isDangerous: true,
    pulsating: true,
  },
];

// Custom HUD Tooltip
const TacticalTooltip = ({ active, payload, label, activeComplexities }) => {
  if (!active || !payload || !payload.length) return null;

  const activeConfigs = COMPLEXITY_CONFIGS.filter((c) =>
    activeComplexities.includes(c.key),
  );

  // Get values for comparison
  const values = {};
  payload.forEach((p) => {
    if (activeComplexities.includes(p.dataKey)) {
      values[p.dataKey] = p.value;
    }
  });

  // Calculate comparison (if we have both linear and quadratic)
  let comparison = null;
  if (values.linear && values.quadratic && values.linear > 0) {
    const ratio = Math.round(values.quadratic / values.linear);
    if (ratio > 1) {
      comparison = `O(N²) is ${ratio}x slower than O(N)`;
    }
  } else if (values.linear && values.exponential && values.linear > 0) {
    const ratio = Math.round(values.exponential / values.linear);
    if (ratio > 1) {
      comparison = `O(2^N) is ${ratio.toLocaleString()}x slower than O(N)`;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-lg backdrop-blur-md min-w-[200px]"
      style={{
        background: "rgba(0,0,0,0.85)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <div className="text-white/40 text-xs font-mono mb-3 pb-2 border-b border-white/10">
        INPUT SIZE (N): <span className="text-white font-bold">{label}</span>
      </div>
      <div className="space-y-2">
        {activeConfigs.map((config) => {
          const dataPoint = payload.find((p) => p.dataKey === config.key);
          if (!dataPoint) return null;
          const value = dataPoint.value;
          const displayValue =
            value > 999999
              ? "OFF CHART"
              : value > 999
                ? `${(value / 1000).toFixed(1)}K`
                : Math.round(value).toLocaleString();
          return (
            <div
              key={config.key}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: config.color,
                    boxShadow: config.glowing
                      ? `0 0 6px ${config.color}`
                      : "none",
                  }}
                />
                <span className="text-white/70 text-sm font-mono">
                  {config.label}
                </span>
              </div>
              <span
                className="font-mono font-bold text-sm tabular-nums"
                style={{ color: value > 999999 ? "#ef4444" : config.color }}
              >
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
      {comparison && (
        <div className="mt-3 pt-2 border-t border-white/10">
          <p className="text-orange-400/80 text-xs font-mono">{comparison}</p>
        </div>
      )}
    </motion.div>
  );
};

const TheComplexityZoo = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeComplexities, setActiveComplexities] = useState([
    "constant",
    "logarithmic",
    "linear",
  ]);
  const [showDangerWarning, setShowDangerWarning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const data = useMemo(() => generateComplexityData(), []);

  const hasDangerous = activeComplexities.includes("exponential");

  // Cap Y-axis value - anything above goes "off chart"
  const maxY = hasDangerous ? 100 : 100;

  const toggleComplexity = (key) => {
    const config = COMPLEXITY_CONFIGS.find((c) => c.key === key);

    if (activeComplexities.includes(key)) {
      setActiveComplexities((prev) => prev.filter((k) => k !== key));
      if (key === "exponential") {
        setShowDangerWarning(false);
      }
    } else {
      setActiveComplexities((prev) => [...prev, key]);
      if (config?.isDangerous) {
        setIsShaking(true);
        setShowDangerWarning(true);
        setTimeout(() => setIsShaking(false), 600);
      }
    }
  };

  return (
    <section className="py-20 md:py-28">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-6"
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "2px solid rgba(16,185,129,0.4)",
            boxShadow: "0 4px 20px rgba(16,185,129,0.2)",
          }}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-bold tracking-wider">
            MODULE 03
          </span>
        </motion.div>

        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.2] py-2">
          <span className={isDark ? "text-white" : "text-slate-900"}>The Complexity </span>
          <GradientText intensity="bright">Zoo</GradientText>
        </h2>

        <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
          A{" "}
          <span className="text-emerald-400 font-semibold">
            tactical display
          </span>{" "}
          of algorithm growth rates.
          <br />
          <span className={isDark ? "text-white/70" : "text-slate-700"}>
            Toggle curves. Watch the chaos unfold.
          </span>
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {/* Control Deck - Filter Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {COMPLEXITY_CONFIGS.map((config) => {
            const isActive = activeComplexities.includes(config.key);
            const isDanger = config.isDangerous && isActive;
            return (
              <motion.button
                key={config.key}
                onClick={() => toggleComplexity(config.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all cursor-pointer"
                style={{
                  background: isActive
                    ? `${config.color}15`
                    : isDark ? "rgba(30,41,59,0.8)" : "rgba(241, 245, 249, 0.8)",
                  border: `1px solid ${isActive ? `${config.color}60` : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  boxShadow: isActive
                    ? `0 0 20px ${config.color}30, inset 0 0 20px ${config.color}10`
                    : "none",
                }}
                animate={
                  isDanger
                    ? {
                      boxShadow: [
                        `0 0 20px ${config.color}30`,
                        `0 0 40px ${config.color}60`,
                        `0 0 20px ${config.color}30`,
                      ],
                    }
                    : {}
                }
                transition={isDanger ? { duration: 1, repeat: Infinity } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: isActive
                      ? config.color
                      : "rgba(255,255,255,0.2)",
                    boxShadow:
                      isActive && config.glowing
                        ? `0 0 8px ${config.color}`
                        : "none",
                  }}
                />
                <span
                  style={{
                    color: isActive ? config.color : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                  }}
                >
                  {config.label}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: isActive ? `${config.color}20` : "transparent",
                    color: isActive ? config.color : isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                  }}
                >
                  {config.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Danger Warning Banner */}
        <AnimatePresence>
          {showDangerWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg mx-auto"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(220,38,38,0.1), rgba(220,38,38,0.2), rgba(220,38,38,0.1))",
                  border: "1px solid rgba(220,38,38,0.4)",
                }}
              >
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-red-400 text-sm font-mono">
                  ⚠️ EXPONENTIAL GROWTH DETECTED. SYSTEM MAY HANG.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Tactical Display */}
        <motion.div
          animate={isShaking ? { x: [0, -4, 4, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <div
            className="rounded-xl p-6 relative transition-all duration-500"
            style={{
              background: isDark ? "rgba(15,23,42,0.5)" : "rgba(255,255,255,0.5)",
              border: `2px solid ${hasDangerous ? "rgba(220,38,38,0.4)" : isDark ? "rgba(30,41,59,1)" : "rgba(226, 232, 240, 1)"}`,
              boxShadow: hasDangerous
                ? "0 0 40px rgba(220,38,38,0.15), inset 0 0 60px rgba(220,38,38,0.05)"
                : "0 4px 30px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: hasDangerous ? "#dc2626" : "#10b981" }}
                />
                <span className="text-white/40 text-xs font-mono tracking-wider uppercase">
                  Growth Rate Analysis
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/30 text-xs font-mono">
                <span>X: Input Size (N)</span>
                <span>Y: Operations</span>
              </div>
            </div>

            {/* Chart Container */}
            <div
              className="rounded-lg relative overflow-hidden"
              style={{
                background: isDark ? "rgba(15,23,42,0.8)" : "rgba(240, 249, 255, 0.5)",
              }}
            >
              {/* Technical grid background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(${isDark ? "rgba(30,41,59,0.5)" : "rgba(148,163,184,0.2)"} 1px, transparent 1px),
                    linear-gradient(90deg, ${isDark ? "rgba(30,41,59,0.5)" : "rgba(148,163,184,0.2)"} 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                }}
              />

              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={data}
                  margin={{ top: 30, right: 40, left: 20, bottom: 30 }}
                >
                  {/* Grid */}
                  <defs>
                    <filter id="glow-emerald">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="glow-red">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <XAxis
                    dataKey="n"
                    stroke="transparent"
                    tick={{
                      fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(100,116,139,0.8)",
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickLine={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                    axisLine={false}
                    tickCount={10}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{
                      fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(100,116,139,0.8)",
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    tickLine={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                    axisLine={false}
                    domain={[0, maxY]}
                    tickFormatter={(val) =>
                      val > 999 ? `${(val / 1000).toFixed(0)}K` : val
                    }
                  />
                  <Tooltip
                    content={
                      <TacticalTooltip
                        activeComplexities={activeComplexities}
                      />
                    }
                    cursor={{
                      stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                      strokeDasharray: "4 4",
                    }}
                  />
                  <ReferenceLine
                    y={maxY}
                    stroke="rgba(239,68,68,0.3)"
                    strokeDasharray="3 3"
                  />

                  {COMPLEXITY_CONFIGS.map((config) => {
                    const isActive = activeComplexities.includes(config.key);
                    if (!isActive) return null;

                    return (
                      <Line
                        key={config.key}
                        type="monotone"
                        dataKey={config.key}
                        stroke={config.color}
                        strokeWidth={config.thick ? 3 : 2}
                        strokeDasharray={config.dashed ? "8 4" : "0"}
                        dot={false}
                        activeDot={{
                          r: 5,
                          fill: config.color,
                          stroke: "#0f172a",
                          strokeWidth: 2,
                        }}
                        isAnimationActive={true}
                        animationDuration={800}
                        style={{
                          filter: config.glowing
                            ? "url(#glow-emerald)"
                            : config.pulsating
                              ? "url(#glow-red)"
                              : "none",
                        }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Footer Legend */}
            <div className={`flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
              {COMPLEXITY_CONFIGS.map((config) => {
                const isActive = activeComplexities.includes(config.key);
                return (
                  <div
                    key={config.key}
                    className={`flex items-center gap-2 text-xs font-mono transition-opacity ${isActive ? "opacity-100" : "opacity-30"
                      }`}
                  >
                    <div
                      className="w-4 h-0.5"
                      style={{
                        background: config.color,
                        boxShadow:
                          isActive && config.glowing
                            ? `0 0 6px ${config.color}`
                            : "none",
                      }}
                    />
                    <span style={{ color: config.color }}>{config.label}</span>
                    <span className={isDark ? "text-white/30" : "text-slate-400"}>{config.rating}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-4"
        >
          <div
            className="inline-flex items-center gap-4 px-5 py-3 rounded-lg"
            style={{
              background: isDark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.6)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <p className={`text-sm font-mono ${isDark ? "text-white/60" : "text-slate-600"}`}>
              <span className="text-emerald-400">O(log N)</span> = gold standard
              <span className={`mx-3 ${isDark ? "text-white/20" : "text-slate-300"}`}>|</span>
              <span className="text-orange-400">O(N²)</span> = avoid if possible
              <span className={`mx-3 ${isDark ? "text-white/20" : "text-slate-300"}`}>|</span>
              <span className="text-red-400">O(2^N)</span> = run away!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// MODULE 4: THE X-RAY LAB
// ============================================================================

const TheXRayLab = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeExperiment, setActiveExperiment] = useState(null); // 'access' | 'insert' | 'delete'
  const [isAnimating, setIsAnimating] = useState(false);
  const [arrayData, setArrayData] = useState([1, 2, 3, 4, 5, 6]);
  const [listData, setListData] = useState([1, 2, 3, 4, 5, 6]);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [travelerPos, setTravelerPos] = useState(-1);
  const [listHeadInsert, setListHeadInsert] = useState(false);

  // Experiment 1: Access Index 4
  const runAccessExperiment = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveExperiment("access");
    setHighlightIndex(null);
    setTravelerPos(-1);
    setListHeadInsert(false);

    // Array: Instant Access
    setTimeout(() => setHighlightIndex(4), 200);

    // List: Sequential Access
    for (let i = 0; i <= 4; i++) {
      await new Promise((r) => setTimeout(r, 600)); // Slow steps
      setTravelerPos(i);
    }

    setTimeout(() => setIsAnimating(false), 3500);
  };

  // Experiment 2: Insert at Head
  const runInsertExperiment = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveExperiment("insert");
    setHighlightIndex(null);
    setTravelerPos(-1);
    setListHeadInsert(false);

    // Array: Shift Animation (Simulated by key changes)
    await new Promise((r) => setTimeout(r, 200));
    setArrayData((prev) => [0, ...prev]); // Add new element

    // List: Instant Head Insert
    setListHeadInsert(true); // Trigger fade in
    setTimeout(() => {
      setListData((prev) => [0, ...prev]);
      setListHeadInsert(false);
    }, 600);

    setTimeout(() => {
      setIsAnimating(false);
      // Reset for next run
      setTimeout(() => {
        setArrayData([1, 2, 3, 4, 5, 6]);
        setListData([1, 2, 3, 4, 5, 6]);
      }, 2000);
    }, 1500);
  };

  return (
    <section className="py-20 md:py-28 relative">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border backdrop-blur-sm ${isDark ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-white/50"}`}
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span className="text-sky-400 text-xs font-mono tracking-widest uppercase">
              Structure Analysis
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            <span className={isDark ? "text-white" : "text-slate-900"}>The </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              X-Ray Lab
            </span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            See beneath the abstraction.{" "}
            <span className="text-sky-400">Arrays</span> are rigid blocks.{" "}
            <span className="text-indigo-400">Linked Lists</span> are scattered
            chains.
          </p>
        </div>

        {/* Experiment Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={runAccessExperiment}
            disabled={isAnimating}
            className={`px-6 py-3 rounded-lg font-mono text-sm border transition-all ${activeExperiment === "access"
              ? "bg-green-500/10 border-green-500/50 text-green-400"
              : isDark ? "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500" : "bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
          >
            EXPERIMENT A: ACCESS INDEX 4
          </button>
          <button
            onClick={runInsertExperiment}
            disabled={isAnimating}
            className={`px-6 py-3 rounded-lg font-mono text-sm border transition-all ${activeExperiment === "insert"
              ? "bg-red-500/10 border-red-500/50 text-red-400"
              : isDark ? "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500" : "bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
          >
            EXPERIMENT B: INSERT AT HEAD
          </button>
        </div>

        {/* The Lab Interface */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Chamber: The Array */}
          <div className={`md:col-span-2 border rounded-2xl p-8 relative overflow-hidden transition-colors ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white/40 border-slate-200"}`}>
            <div className={`absolute top-4 left-4 text-xs font-mono uppercase tracking-widest border px-2 py-1 rounded ${isDark ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-200"}`}>
              Subject 01: Contiguous Block
            </div>
            <div className="mt-12 flex justify-center items-center min-h-[120px]">
              <div className={`flex border-2 rounded-lg overflow-hidden relative ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
                <AnimatePresence mode="popLayout">
                  {arrayData.map((val, idx) => (
                    <motion.div
                      key={`${val}-${idx}`} // Unstable key to force re-render on shift for visual effect
                      layout
                      initial={
                        activeExperiment === "insert" && idx === 0
                          ? { width: 0, opacity: 0 }
                          : {}
                      }
                      animate={{
                        width: 60,
                        opacity: 1,
                        backgroundColor:
                          activeExperiment === "access" &&
                            idx === highlightIndex
                            ? "rgba(34, 197, 94, 0.2)" // Green highlight
                            : activeExperiment === "insert"
                              ? "rgba(239, 68, 68, 0.1)" // Red stress
                              : "transparent",
                      }}
                      className={`w-[60px] h-[60px] border-r last:border-r-0 flex items-center justify-center relative font-mono text-xl ${isDark ? "border-slate-700" : "border-slate-200"}`}
                    >
                      <span
                        className={
                          activeExperiment === "access" &&
                            idx === highlightIndex
                            ? "text-green-400 font-bold"
                            : isDark ? "text-slate-300" : "text-slate-600"
                        }
                      >
                        {activeExperiment === "insert" && idx === 0
                          ? "NEW"
                          : val}
                      </span>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-mono">
                        0x{idx.toString(16).padStart(2, "0").toUpperCase()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Array Feedback */}
            <div className="mt-4 text-center h-8">
              {activeExperiment === "access" && highlightIndex === 4 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 font-mono text-sm"
                >
                  ✓ O(1) Instant Math Access (Base + 4)
                </motion.span>
              )}
              {activeExperiment === "insert" && arrayData.length > 6 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 font-mono text-sm"
                >
                  ⚠ O(N) Heavy Operation! Shifting required.
                </motion.span>
              )}
            </div>
          </div>

          {/* Bottom Chamber: The Linked List */}
          <div className={`md:col-span-2 border rounded-2xl p-8 relative overflow-hidden transition-colors ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white/40 border-slate-200"}`}>
            <div className={`absolute top-4 left-4 text-xs font-mono uppercase tracking-widest border px-2 py-1 rounded ${isDark ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-200"}`}>
              Subject 02: Pointer Chain
            </div>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-2 min-h-[120px]">
              <AnimatePresence mode="popLayout">
                {listData.map((val, idx) => (
                  <motion.div
                    key={val}
                    layout
                    initial={
                      activeExperiment === "insert" && idx === 0
                        ? { opacity: 0, scale: 0.5, x: -20 }
                        : {}
                    }
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    {/* Node */}
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono text-lg z-10 relative 
                                            ${idx === travelerPos
                            ? "border-green-400 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                            : activeExperiment ===
                              "insert" && idx === 0
                              ? "border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] bg-slate-900"
                              : isDark ? "border-indigo-500/30 text-indigo-300 bg-slate-900" : "border-indigo-500/30 text-indigo-500 bg-white"
                          }
                                        `}
                      >
                        {activeExperiment === "insert" && idx === 0
                          ? "NEW"
                          : val}
                      </div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-mono whitespace-nowrap">
                        {/* Random addresses for realism */}
                        0x
                        {((val * 99) % 255)
                          .toString(16)
                          .padStart(2, "0")
                          .toUpperCase()}
                      </div>

                      {/* Traveler Dot */}
                      {activeExperiment === "access" && idx === travelerPos && (
                        <motion.div
                          layoutId="traveler"
                          className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full"
                        />
                      )}
                    </div>
                    {/* Pointer Arrow */}
                    {idx < listData.length - 1 && (
                      <ArrowRight className={`w-5 h-5 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* List Feedback */}
            <div className="mt-4 text-center h-8">
              {activeExperiment === "access" && travelerPos === 4 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 font-mono text-sm"
                >
                  ⚠ O(N) Slow... Must traverse links.
                </motion.span>
              )}
              {activeExperiment === "insert" && listData.length > 6 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 font-mono text-sm"
                >
                  ✓ O(1) Fast! Just update one pointer.
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// MODULE 5: THE ALGORITHM ARENA
// ============================================================================

const TheAlgorithmArena = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [gameStatus, setGameStatus] = useState("idle"); // 'idle', 'fighting', 'finished'
  const [bubbleData, setBubbleData] = useState([]);
  const [quickData, setQuickData] = useState([]);
  const [stats, setStats] = useState({
    bubble: { comps: 0, swaps: 0, finished: false },
    quick: { comps: 0, swaps: 0, finished: false },
  });

  // Refs for async control
  const isRunning = useRef(false);
  const bubbleArrayRef = useRef([]);
  const quickArrayRef = useRef([]);

  // Generate random data
  const generateData = useCallback(() => {
    const arr = Array.from(
      { length: 30 },
      () => Math.floor(Math.random() * 90) + 10,
    );
    setBubbleData([...arr]);
    setQuickData([...arr]);
    setStats({
      bubble: { comps: 0, swaps: 0, finished: false },
      quick: { comps: 0, swaps: 0, finished: false },
    });
    bubbleArrayRef.current = [...arr];
    quickArrayRef.current = [...arr];
    setGameStatus("idle");
  }, []);

  useEffect(() => {
    generateData();
    return () => {
      isRunning.current = false;
    };
  }, [generateData]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- BUBBLE SORT (The Tank) ---
  const runBubbleSort = async () => {
    const arr = [...bubbleArrayRef.current];
    const n = arr.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isRunning.current) return;

        // Compare
        setStats((prev) => ({
          ...prev,
          bubble: { ...prev.bubble, comps: prev.bubble.comps + 1 },
        }));

        if (arr[j] > arr[j + 1]) {
          // Swap
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          setStats((prev) => ({
            ...prev,
            bubble: { ...prev.bubble, swaps: prev.bubble.swaps + 1 },
          }));
          // Update Ref and State
          bubbleArrayRef.current = [...arr];
          setBubbleData([...arr]);

          await sleep(50); // Delay
        } else {
          await sleep(50);
        }
      }
    }

    setStats((prev) => ({
      ...prev,
      bubble: { ...prev.bubble, finished: true },
    }));
  };

  // --- QUICK SORT (The Assassin) ---
  const runQuickSort = async (arr, low, high) => {
    if (low < high && isRunning.current) {
      const pi = await partition(arr, low, high);
      await Promise.all([
        runQuickSort(arr, low, pi - 1),
        runQuickSort(arr, pi + 1, high),
      ]);
    } else if (low >= high && isRunning.current) {
      // Mark as 'finished' logic is tricky with recursion concurrency.
      // We'll rely on the top-level caller to mark finished?
      // Or just let it finish naturally.
    }
  };

  const partition = async (arr, low, high) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
      if (!isRunning.current) return;

      setStats((prev) => ({
        ...prev,
        quick: { ...prev.quick, comps: prev.quick.comps + 1 },
      }));

      if (arr[j] < pivot) {
        i++;
        // Swap
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setStats((prev) => ({
          ...prev,
          quick: { ...prev.quick, swaps: prev.quick.swaps + 1 },
        }));
        quickArrayRef.current = [...arr];
        setQuickData([...arr]);
        await sleep(50);
      } else {
        // await sleep(20); // Quick sort is faster!
      }
    }
    // Swap pivot
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setStats((prev) => ({
      ...prev,
      quick: { ...prev.quick, swaps: prev.quick.swaps + 1 },
    }));
    quickArrayRef.current = [...arr];
    setQuickData([...arr]);
    await sleep(50);
    return i + 1;
  };

  const startFight = async () => {
    if (gameStatus === "fighting") return;

    // Reset
    if (gameStatus === "finished") {
      generateData();
      await sleep(500);
    }

    isRunning.current = true;
    setGameStatus("fighting");

    // Race!
    const bubblePromise = runBubbleSort();
    const quickPromise = runQuickSort(
      quickArrayRef.current,
      0,
      quickArrayRef.current.length - 1,
    ).then(() => {
      setStats((prev) => ({
        ...prev,
        quick: { ...prev.quick, finished: true },
      }));
    });

    // Wait for both? Or just let them run.
    await Promise.all([bubblePromise, quickPromise]);
    setGameStatus("finished");
    isRunning.current = false;
  };

  const stopFight = () => {
    isRunning.current = false;
    setGameStatus("idle");
    generateData();
  };

  return (
    <section className="py-20 md:py-28 relative">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(20, 184, 166, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-cyan-800 bg-cyan-950/30 backdrop-blur-sm"
          >
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs font-mono tracking-widest uppercase">
              Final Showdown
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">
            Algorithm <span className="text-cyan-500">Arena</span>
          </h2>
          <div className={`flex justify-center gap-8 mb-8 text-sm font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <div className="flex flex-col items-center">
              <span className={`text-xs uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                Bubble Sort
              </span>
              <span className="text-red-400 font-bold text-lg">O(N²)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-px h-full ${isDark ? "bg-slate-800" : "bg-slate-300"}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-xs uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                Quick Sort
              </span>
              <span className="text-green-400 font-bold text-lg">
                O(N log N)
              </span>
            </div>
          </div>

          <button
            onClick={gameStatus === "fighting" ? stopFight : startFight}
            className={`px-12 py-4 rounded-xl font-black tracking-widest text-lg transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)] ${gameStatus === "fighting"
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-900/20"
              : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20 hover:scale-105"
              }`}
          >
            {gameStatus === "fighting"
              ? "ABORT BATTLE"
              : gameStatus === "finished"
                ? "REMATCH"
                : "START FIGHT"}
          </button>
        </div>

        {/* The Arena */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Arena 1: Bubble Sort */}
          <div
            className={`relative p-8 rounded-3xl border transition-all duration-500 ${stats.bubble.finished
              ? "border-green-500/50 bg-green-950/10"
              : isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/50"
              }`}
          >
            <div className={`flex justify-between items-end mb-6 border-b pb-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <div>
                <h3 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                  Bubble Sort
                </h3>
                <div className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>THE TANK</div>
              </div>
              <div className={`text-right font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <div>
                  COMPS:{" "}
                  <span className={isDark ? "text-white" : "text-slate-900"}>{stats.bubble.comps}</span>
                </div>
                <div>
                  SWAPS:{" "}
                  <span className={isDark ? "text-white" : "text-slate-900"}>{stats.bubble.swaps}</span>
                </div>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-[2px]">
              {bubbleData.map((val, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm transition-all duration-75 ${stats.bubble.finished
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    : "bg-cyan-600"
                    }`}
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>

            {stats.bubble.finished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
              >
                <div className="bg-slate-800 border border-slate-600 px-6 py-3 rounded-xl text-slate-400 font-black tracking-widest transform rotate-12">
                  FINISHED
                </div>
              </motion.div>
            )}
          </div>

          {/* Arena 2: Quick Sort */}
          <div
            className={`relative p-8 rounded-3xl border transition-all duration-500 ${stats.quick.finished
              ? "border-yellow-500/50 bg-yellow-950/10 shadow-[0_0_50px_rgba(234,179,8,0.1)]"
              : isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/50"
              }`}
          >
            <div className={`flex justify-between items-end mb-6 border-b pb-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <div>
                <h3 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                  Quick Sort
                </h3>
                <div className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  THE ASSASSIN
                </div>
              </div>
              <div className={`text-right font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <div>
                  COMPS: <span className={isDark ? "text-white" : "text-slate-900"}>{stats.quick.comps}</span>
                </div>
                <div>
                  SWAPS: <span className={isDark ? "text-white" : "text-slate-900"}>{stats.quick.swaps}</span>
                </div>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-[2px]">
              {quickData.map((val, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm transition-all duration-75 ${stats.quick.finished
                    ? "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                    : "bg-purple-500"
                    }`}
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>

            {stats.quick.finished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-yellow-500 text-black px-8 py-4 rounded-xl font-black text-2xl tracking-tighter shadow-xl transform -rotate-6 border-4 border-yellow-200">
                  VICTORY!
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

const BigOGuide = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDark ? "bg-black text-white" : "bg-slate-50 text-slate-900"}`}>
      <ImmersiveBackground />

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
        style={{
          background: isDark ? "rgba(0,0,0,0.7)" : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: isDark ? "2px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-5">
              <motion.button
                onClick={() => navigate("/")}
                className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  border: isDark ? "2px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
                whileHover={{ scale: 1.1, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className={`w-5 h-5 ${isDark ? "text-white/70" : "text-slate-700"}`} />
              </motion.button>
              <h1 className="text-xl font-bold">
                <GradientText>Big O Guide</GradientText>
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <span
                className="px-5 py-2.5 rounded-full text-sm font-bold"
                style={{
                  background: "rgba(0,212,255,0.15)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  color: "#00d4ff",
                  boxShadow: "0 4px 15px rgba(0,212,255,0.2)",
                }}
              >
                The Race
              </span>
              <span
                className={`px-5 py-2.5 rounded-full text-sm ${isDark ? "text-white/40" : "text-slate-500"}`}
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)",
                  border: isDark ? "2px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
                }}
              >
                + 4 more
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 pt-28 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center pt-8 pb-24 overflow-visible"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-10"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)",
                border: isDark ? "2px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className={`text-sm font-medium ${isDark ? "text-white/60" : "text-slate-600"}`}>
                Interactive Learning
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 leading-[1.3] py-4 px-4">
              <span className={isDark ? "text-white" : "text-slate-900"}>The </span>
              <GradientText intensity="bright">Big O</GradientText>
              <br />
              <span className={isDark ? "text-white" : "text-slate-900"}>Guide</span>
            </h1>

            <p className={`text-2xl md:text-3xl max-w-3xl mx-auto leading-relaxed font-light ${isDark ? "text-white/50" : "text-slate-500"}`}>
              Master complexity through{" "}
              <span className={`font-medium ${isDark ? "text-white/80" : "text-slate-700"}`}>
                immersive visualization
              </span>
              .
            </p>
          </motion.div>

          <TheGreatRace />

          <TheRamVisualizer />

          <TheComplexityZoo />

          <TheXRayLab />

          <TheAlgorithmArena />
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-10 px-6"
        style={{ borderTop: isDark ? "2px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className={`text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
            Built for developers who want to understand the "why."
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BigOGuide;
