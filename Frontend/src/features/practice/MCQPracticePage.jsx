import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../core/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Database,
  Wifi,
  Cpu,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Loader2,
  Target,
  Trophy,
  Flame,
  Sparkles,
  Zap,
  BookOpen,
  Play,
  Code,
  FileCode,
  Brain,
  Calculator,
  Building2,
  Terminal,
  Crown,
  AlertTriangle,
  Award,
  Flag,
  Lock,
  Search,
  RotateCcw,
  XCircle,
} from "lucide-react";

// Import reusable components from MCQComponents
import {
  MarkdownRenderer,
  CompanyLogo,
  GlassCard,
  PremiumLock,
  OptionButton,
  ExplanationAccordion,
  StatsHUD,
} from "./MCQComponents";
import { useTheme } from "../../core/context/ThemeContext";

// ============================================================================
// CONFIG & CONSTANTS
// ============================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;
const FREE_PRACTICE_LIMIT = 5;

const CATEGORY_MAP = {
  os: "Operating Systems",
  dbms: "DBMS",
  cn: "Computer Networks",
  sys_design: "System Design",
  oops: "OOPs",
  sql: "SQL Practical",
  aptitude: "Aptitude",
  dsa: "DSA",
  code_output: "Code Output",
};

const CATEGORIES = [
  {
    id: "oops",
    name: "OOPs",
    icon: Code,
    gradient: "from-pink-500 to-rose-600",
    difficulty: "Easy",
    topics: ["Classes", "Inheritance", "Polymorphism"],
  },
  {
    id: "aptitude",
    name: "Aptitude",
    icon: Calculator,
    gradient: "from-amber-500 to-orange-600",
    difficulty: "Easy",
    topics: ["Quant", "Reasoning", "Verbal"],
  },
  {
    id: "os",
    name: "Operating Systems",
    icon: Cpu,
    gradient: "from-cyan-500 to-blue-600",
    difficulty: "Medium",
    topics: ["Processes", "Threads", "Memory"],
  },
  {
    id: "dbms",
    name: "DBMS",
    icon: Database,
    gradient: "from-purple-500 to-violet-600",
    difficulty: "Medium",
    topics: ["SQL", "Normalization", "ACID"],
  },
  {
    id: "cn",
    name: "Computer Networks",
    icon: Wifi,
    gradient: "from-emerald-500 to-teal-600",
    difficulty: "Medium",
    topics: ["OSI", "TCP/IP", "Routing"],
  },
  {
    id: "sql",
    name: "SQL Practical",
    icon: FileCode,
    gradient: "from-sky-500 to-blue-600",
    difficulty: "Medium",
    topics: ["Joins", "Subqueries", "Triggers"],
  },
  {
    id: "dsa",
    name: "DSA",
    icon: Brain,
    gradient: "from-indigo-500 to-purple-600",
    difficulty: "Hard",
    topics: ["Arrays", "Trees", "Graphs"],
  },
  {
    id: "sys_design",
    name: "System Design",
    icon: Server,
    gradient: "from-orange-500 to-red-600",
    difficulty: "Hard",
    topics: ["Scaling", "CAP", "Microservices"],
  },
  {
    id: "code_output",
    name: "Code Output",
    icon: Terminal,
    gradient: "from-rose-500 to-pink-600",
    difficulty: "Hard",
    topics: ["C++", "Java", "Python"],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Extracted Components
const StatCard = React.memo(({ icon: Icon, label, value, color, gradient }) => (
  <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
    {/* Background glow */}
    <div className={`absolute -top-10 -right-10 w-32 h-32 ${gradient || "bg-purple-500"} opacity-20 blur-3xl`} />

    <div className="relative flex items-center gap-4">
      <div className={`p-3.5 rounded-xl ${color} shadow-lg`}>
        <Icon size={26} className="drop-shadow-lg" />
      </div>
      <div>
        <div className="text-3xl font-black text-white tracking-tight">
          {value}
        </div>
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
          {label}
        </div>
      </div>
    </div>
  </div>
));

// Back button that appears on hover and stays visible for 2 seconds after mouse leaves
const BackButtonWithDelay = ({ onNavigate, isDark = true, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const hideTimeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Stay visible for 2 seconds after mouse leaves
  };

  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex items-center mb-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={{ x: 10, opacity: 0, scale: 0.8 }}
        animate={
          isVisible
            ? { x: -45, opacity: 1, scale: 1 }
            : { x: 10, opacity: 0, scale: 0.8 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("/");
          }}
          className={`w-10 h-10 rounded-full border transition-colors flex items-center justify-center cursor-pointer ${isDark
            ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
            : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
          title="Go Back"
        >
          <ArrowLeft size={20} />
        </button>
      </motion.div>
      {children}
    </div>
  );
};

const LandingView = React.memo(
  ({
    isPremium,
    solved,
    accuracy,
    streak,
    dailyCount,
    FREE_PRACTICE_LIMIT,
    onNavigate,
    setCurrentSection,
    fetchCompanyQuestions,
    handleStartPractice,
  }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Helper for Quick Access Topics
    const quickTopics = [
      {
        id: "dsa",
        name: "DSA",
        icon: Brain,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
      },
      {
        id: "sys_design",
        name: "System Design",
        icon: Server,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      },
      {
        id: "dbms",
        name: "DBMS",
        icon: Database,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      },
      {
        id: "code_output",
        name: "Output",
        icon: Terminal,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      },
    ];

    return (
      <div className="w-full max-w-7xl mx-auto pb-20">
        {/* HERO SECTION */}
        <div className="relative mb-12 mt-4 px-4 sm:px-0">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  Level Up Your Skills
                </span>
              </div>
              {/* Back Button Container - hidden by default, shows on hover, stays 2s after mouse leaves */}
              <BackButtonWithDelay onNavigate={onNavigate} isDark={isDark}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight cursor-default">
                  MCQ{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 dark:from-purple-400 dark:via-pink-400 dark:to-amber-400">
                    Mastery
                  </span>
                </h1>
              </BackButtonWithDelay>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-lg max-w-xl leading-relaxed"
              >
                Master computer science fundamentals with our curated collection
                of questions from top tech companies.
              </motion.p>
            </div>

            {/* Quick Trophy/Premium Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${isPremium ? "bg-gradient-to-br from-yellow-400 to-amber-600" : "bg-gray-100 dark:bg-white/10"}`}
              >
                {isPremium ? (
                  <Crown size={24} className="text-white" />
                ) : (
                  <Target size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Status
                </div>
                <div
                  className={`text-lg font-black ${isPremium ? "text-amber-500 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}
                >
                  {isPremium ? "Premium Pro" : "Free Plan"}
                </div>
              </div>
              {!isPremium && (
                <button
                  type="button"
                  onClick={() => onNavigate("/premium")}
                  className="ml-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  Upgrade
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* STATS STRIP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 px-2 sm:px-0"
        >
          {[
            {
              label: "Questions Solved",
              value: solved,
              icon: CheckCircle,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              label: "Accuracy",
              value: `${accuracy}%`,
              icon: Target,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
            {
              label: "Day Streak",
              value: streak,
              icon: Flame,
              color: "text-orange-400",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
            },
            {
              label: isPremium ? "Access Level" : "Daily Limit",
              value: isPremium
                ? "Unlimited"
                : `${dailyCount}/${FREE_PRACTICE_LIMIT}`,
              icon: isPremium ? Crown : Zap,
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-100 dark:bg-purple-500/10",
              border: "border-purple-200 dark:border-purple-500/20",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden p-4 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={16} className={stat.color} />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${stat.color} opacity-80`}
                  >
                    {stat.label}
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
              </div>
              {/* Decorative Icon */}
              <stat.icon
                className={`absolute -bottom-4 -right-4 w-24 h-24 ${stat.color} opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500`}
              />
            </div>
          ))}
        </motion.div>

        {/* MAIN VISUAL NAVIGATION */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-16 px-4 sm:px-0">
          {/* PRACTICE CARD */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setCurrentSection("practice")}
            className="relative group cursor-pointer"
          >
            <div className="relative h-full bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 overflow-hidden hover:border-purple-500/50 transition-colors duration-300 shadow-sm dark:shadow-none">
              {/* Bg Patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={28} className="text-white" />
                </div>

                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                  Practice Mode
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm">
                  Detailed topic-wise questions to build your foundation. Ideal
                  for mastering specific concepts.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-auto mb-8">
                  {["OS", "DBMS", "CN", "SQL"].map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {tag}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                  Start Practicing <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* REAL COMPANY CARD */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => {
              if (isPremium) {
                setCurrentSection("company");
                fetchCompanyQuestions(); // Ensure fetch starts
              } else {
                onNavigate("/premium");
              }
            }}
            className="relative group cursor-pointer"
          >
            <div className="relative h-full bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 overflow-hidden hover:border-amber-500/50 transition-colors duration-300 shadow-sm dark:shadow-none">
              {/* Bg Patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 dark:bg-amber-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Building2 size={28} className="text-white" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                    Company Mode
                  </h2>
                  {!isPremium && <Lock size={20} className="text-amber-500" />}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm">
                  Real interview questions asked in top tech companies like
                  Google, Amazon, and Microsoft.
                </p>

                <div className="flex -space-x-3 mb-8 mt-auto pl-2">
                  {["Google", "Amazon", "Microsoft"].map((c, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-white dark:bg-[#2a2a35] border-2 border-gray-100 dark:border-[#13131a] flex items-center justify-center overflow-hidden"
                      title={c}
                    >
                      <CompanyLogo company={c} />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2a2a35] border-2 border-white dark:border-[#13131a] flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                    +50
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 font-bold group-hover:translate-x-2 transition-transform ${isPremium ? "text-amber-400" : "text-gray-500"}`}
                >
                  {isPremium ? "Access Company Questions" : "Premium Only"}{" "}
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* QUICK ACCESS TOPICS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="px-4 sm:px-0"
        >
          <h3 className="text-lg font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest mb-6 border-b border-gray-200 dark:border-white/10 pb-2">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickTopics.map((topic, idx) => (
              <button
                type="button"
                key={topic.id}
                onClick={() => handleStartPractice(topic.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#202028] transition-all group text-center cursor-pointer shadow-sm dark:shadow-none`}
              >
                <div
                  className={`p-3 rounded-xl ${topic.bg} ${topic.color} group-hover:scale-110 transition-transform`}
                >
                  <topic.icon size={24} />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-purple-600 dark:group-hover:text-white transition-colors">
                  {topic.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  },
);

// ============================================================================
// RENDER: PRACTICE CATEGORY SELECTION
// ============================================================================
// ============================================================================
// EXTRACTED COMPONENT: PRACTICE CATEGORY VIEW
// ============================================================================
const PracticeCategoryView = React.memo(
  ({
    handleBackToLanding,
    handleStartPractice,
    isPremium,
    FREE_PRACTICE_LIMIT,
    navigate,
    CATEGORIES,
    CATEGORY_MAP,
    categoryCounts,
  }) => (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-radial from-purple-500/8 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-cyan-500/6 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0b0b0d]/95 backdrop-blur-md pt-8 pb-6 mb-6 border-b border-gray-200 dark:border-white/5 -mx-4 px-4 sm:mx-0 sm:px-0 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBackToLanding}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Practice Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Select a topic to start practicing
            </p>
          </div>
        </div>
      </div>

      {!isPremium && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-yellow-500" />
            <span className="text-sm text-yellow-400">
              Free: <span className="font-bold">{FREE_PRACTICE_LIMIT}</span>{" "}
              questions per session
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/premium")}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer"
          >
            Unlock Unlimited →
          </button>
        </div>
      )}

      {/* Category Grid - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {CATEGORIES.map((cat) => {
          // Get dynamic count from database
          const dbCategory = CATEGORY_MAP[cat.id];
          const questionCount = categoryCounts[dbCategory] || 0;

          return (
            <GlassCard
              key={cat.id}
              hover
              onClick={() =>
                questionCount > 0 ? handleStartPractice(cat.id) : null
              }
              className={`p-6 relative overflow-hidden group ${questionCount === 0 ? "opacity-50" : ""
                }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
              />
              <div className="relative z-10 -mx-1.5">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${cat.gradient}`}
                  >
                    <cat.icon size={28} className="text-white" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${cat.difficulty === "Easy"
                      ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : cat.difficulty === "Hard"
                        ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                        : "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                      }`}
                  >
                    {cat.difficulty}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  {cat.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cat.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-[5px] rounded-full bg-gray-100 dark:bg-white/10 text-xs text-gray-600 dark:text-gray-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {questionCount > 0
                      ? `${questionCount} questions`
                      : "Coming soon"}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-gray-500 group-hover:text-white transition-colors"
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  ),
);

// ============================================================================
// EXTRACTED COMPONENT: QUESTION VIEW
// ============================================================================
const QuestionView = React.memo(
  ({
    loading,
    isInitializing,
    questions,
    currentQuestionIndex,
    answeredQuestions,
    selectedAnswer,
    isChecked,
    markedQuestions,
    isCompany,
    activeCategory,
    CATEGORIES,
    isPremium,
    dailyCount,
    FREE_PRACTICE_LIMIT,
    handleBackToLanding,
    handleBackToCompany,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setIsChecked,
    setMarkedQuestions,
    handleCheckAnswer,
    handleNextQuestion,
    handleBackToPractice,
    mcqAnswerHistory,
    handleToggleMark,
    handleResetQuestion,
  }) => {
    // Show loading during fetch or initial page load
    if (loading || isInitializing) {
      return <QuestionSkeleton />;
    }

    if (questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <p className="text-gray-400 text-lg mb-4">No questions found.</p>
          <button
            type="button"
            onClick={isCompany ? handleBackToCompany : handleBackToLanding}
            className="px-6 py-3 bg-purple-500/20 text-purple-400 rounded-xl font-bold hover:bg-purple-500/30 cursor-pointer"
          >
            ← Go Back
          </button>
        </div>
      );
    }

    const currentQ = questions[currentQuestionIndex];
    const categoryInfo = CATEGORIES.find((c) => c.id === activeCategory);
    const answeredCount = Object.keys(answeredQuestions).length;
    const correctCountLocal = Object.values(answeredQuestions).filter(
      (a) => a.isCorrect,
    ).length;
    const wrongCount = answeredCount - correctCountLocal;

    // Navigate to specific question
    const goToQuestion = (idx) => {
      setCurrentQuestionIndex(idx);
      const answered = answeredQuestions[idx];
      if (answered) {
        setSelectedAnswer(answered.selectedAnswer);
        setIsChecked(true);
      } else {
        setSelectedAnswer(null);
        setIsChecked(false);
      }
    };

    // Toggle Marked Status - calls API handler
    const toggleMark = () => {
      if (handleToggleMark && currentQ?._id) {
        handleToggleMark(currentQ._id, currentQuestionIndex);
      } else {
        // Fallback to local-only toggle
        setMarkedQuestions((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(currentQuestionIndex)) {
            newSet.delete(currentQuestionIndex);
          } else {
            newSet.add(currentQuestionIndex);
          }
          return newSet;
        });
      }
    };

    // Check if question is marked (from persistent history or local state)
    const questionId = currentQ?._id;
    const persistentHistory = questionId
      ? mcqAnswerHistory?.[questionId]
      : null;
    const isMarked =
      persistentHistory?.isMarked || markedQuestions.has(currentQuestionIndex);

    return (
      <div className="h-[calc(100vh-56px)] flex gap-8 max-w-7xl mx-auto px-4 md:px-6 mt-10">
        {/* LEFT PANEL - Question Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* High Contrast Header */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/20 mb-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={isCompany ? handleBackToCompany : handleBackToPractice}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <ArrowLeft size={20} className="text-gray-500 dark:text-gray-300" />
              </button>
              <div className="flex items-center gap-2">
                {!isCompany && categoryInfo && (
                  <>
                    <categoryInfo.icon size={20} className="text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-gray-900 dark:text-white text-base tracking-wide">
                      {categoryInfo.name}
                    </span>
                  </>
                )}
                {isCompany && (
                  <span className="font-bold text-gray-900 dark:text-white text-base tracking-wide">
                    Company Archives
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mark for Review Button */}
              <button
                type="button"
                onClick={toggleMark}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isMarked
                  ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/10"
                  }`}
              >
                <Flag size={14} className={isMarked ? "fill-current" : ""} />
                {isMarked ? "Marked" : "Mark for Review"}
              </button>

              {(persistentHistory || answeredQuestions[currentQuestionIndex]) &&
                handleResetQuestion && (
                  <button
                    type="button"
                    onClick={() =>
                      currentQ?._id &&
                      handleResetQuestion(currentQ._id, currentQuestionIndex)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                    title="Reset this question"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                )}

              {!isPremium && (
                <span className="text-xs text-yellow-500/80 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {dailyCount}/{FREE_PRACTICE_LIMIT}
                </span>
              )}
              {currentQ?.difficulty && (
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${currentQ.difficulty === "Easy"
                    ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : currentQ.difficulty === "Hard"
                      ? "bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400"
                      : "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                >
                  {currentQ.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Question Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pb-6 pr-2">
            {/* Question Meta */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
                Question {currentQuestionIndex + 1}{" "}
                <span className="text-gray-400 dark:text-gray-600">/</span> {questions.length}
              </span>
              {isCompany && currentQ?.companies?.length > 0 && (
                <div className="flex gap-2">
                  {currentQ.companies.slice(0, 3).map((c, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/10 flex items-center gap-1.5"
                    >
                      <CompanyLogo company={c} size={14} />
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Question Text - Higher Contrast */}
            <div className="mb-8">
              {/* Render content blocks if available, otherwise fall back to legacy question field */}
              {currentQ.contentBlocks && currentQ.contentBlocks.length > 0 ? (
                <div className="space-y-4">
                  {currentQ.contentBlocks.map((block, idx) =>
                    block.type === "text" ? (
                      <MarkdownRenderer
                        key={idx}
                        content={block.content}
                        className="text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3"
                      >
                        <img
                          src={
                            // Fix broken raw URLs - convert /raw/upload/ to /image/upload/
                            block.content.includes("/raw/upload/")
                              ? block.content.replace(
                                "/raw/upload/",
                                "/image/upload/",
                              )
                              : block.content
                          }
                          alt={`Question diagram ${idx + 1}`}
                          className="max-w-full max-h-80 object-contain mx-auto rounded-lg"
                          onError={(e) => {
                            // If image fails, show error message
                            e.target.style.display = "none";
                            const errorDiv = document.createElement("div");
                            errorDiv.className =
                              "text-center py-6 text-gray-400";
                            errorDiv.innerHTML =
                              '<p class="text-sm">⚠️ Image could not be loaded</p>';
                            e.target.parentElement.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <MarkdownRenderer
                  content={currentQ.question}
                  className="text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200"
                />
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                // Determine if multi-select
                const correctIndices = currentQ.correctOptions?.length
                  ? currentQ.correctOptions
                  : currentQ.correctOption !== undefined
                    ? [currentQ.correctOption]
                    : [];
                const isMulti = correctIndices.length > 1;

                const handleOptionSelect = (index) => {
                  if (isMulti) {
                    let current = Array.isArray(selectedAnswer)
                      ? selectedAnswer
                      : selectedAnswer !== null
                        ? [selectedAnswer]
                        : [];
                    if (current.includes(index)) {
                      current = current.filter((i) => i !== index);
                    } else {
                      current = [...current, index];
                    }
                    // If empty, set null to disable check button
                    setSelectedAnswer(current.length > 0 ? current : null);
                  } else {
                    setSelectedAnswer(index);
                  }
                };

                const isSelected = Array.isArray(selectedAnswer)
                  ? selectedAnswer.includes(idx)
                  : selectedAnswer === idx;

                const isCorrectOption = correctIndices.includes(idx);

                return (
                  <OptionButton
                    key={idx}
                    option={opt}
                    index={idx}
                    isSelected={isSelected}
                    isCorrect={isChecked && isCorrectOption}
                    isWrong={isChecked && isSelected && !isCorrectOption}
                    isChecked={isChecked}
                    onSelect={handleOptionSelect}
                    disabled={isChecked}
                  />
                );
              })}
            </div>

            {/* Clear selection button */}
            {selectedAnswer !== null && !isChecked && (
              <div className="flex justify-end mt-2 mb-1">
                <button
                  type="button"
                  onClick={() => setSelectedAnswer(null)}
                  className="text-xs text-gray-500 hover:text-white transition-colors underline decoration-dotted cursor-pointer"
                >
                  Clear selection
                </button>
              </div>
            )}

            {/* Check Answer Button */}
            {!isChecked && (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className={`w-full mt-5 py-3.5 rounded-xl font-semibold transition-all ${selectedAnswer === null
                  ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20 cursor-pointer hover:shadow-purple-500/30"
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Zap size={18} />
                  Check Answer
                </span>
              </button>
            )}

            {/* Explanation */}
            <ExplanationAccordion
              isOpen={isChecked}
              isCorrect={(() => {
                // Use the same normalized logic as handleCheckAnswer
                const correctIndices = currentQ.correctOptions?.length
                  ? currentQ.correctOptions
                  : currentQ.correctOption !== undefined
                    ? [currentQ.correctOption]
                    : [];
                const userSelection = Array.isArray(selectedAnswer)
                  ? selectedAnswer
                  : selectedAnswer !== null
                    ? [selectedAnswer]
                    : [];
                return (
                  correctIndices.length === userSelection.length &&
                  [...correctIndices].sort().toString() ===
                  [...userSelection].sort().toString()
                );
              })()}
              explanation={currentQ.explanation}
            />

            {/* Navigation Buttons */}
            {isChecked && (
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    goToQuestion(Math.max(0, currentQuestionIndex - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${currentQuestionIndex === 0
                    ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer"
                    }`}
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white cursor-pointer"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      isCompany ? handleBackToCompany : handleBackToLanding
                    }
                    className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer"
                  >
                    <Trophy size={18} /> Complete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Compact Dashboard */}
        <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* Progress Stats - Improved Logic & Visuals */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#131416] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-xl dark:shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Progress
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                  {Math.round((answeredCount / questions.length) * 100)}%
                </span>
              </div>

              {/* Progress Bar - Shows % Answered */}
              <div className="relative h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden mb-5">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-center bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-white/5">
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
                    {answeredCount}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                    Answered
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
                <div className="flex-1">
                  <div className="text-lg font-bold text-emerald-400 mb-0.5">
                    {correctCountLocal}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                    Correct
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
                <div className="flex-1">
                  <div className="text-lg font-bold text-red-400 mb-0.5">
                    {wrongCount}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    Wrong
                  </div>
                </div>
              </div>
            </div>

            {/* Question Palette - High Contrast */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#131416] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-xl dark:shadow-black/20">
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                Question Palette
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {questions.map((q, idx) => {
                  const qId = q._id;
                  // Check persistent history first, then local session
                  const persistentHist = qId ? mcqAnswerHistory?.[qId] : null;
                  const sessionAnswer = answeredQuestions[idx];
                  const isCurrent = currentQuestionIndex === idx;
                  const isMarkedLocal =
                    persistentHist?.isMarked || markedQuestions.has(idx);

                  // Determine status: persistent history takes precedence
                  const isAnswered = persistentHist || sessionAnswer?.answered;
                  const isCorrectQ =
                    persistentHist?.isCorrect ?? sessionAnswer?.isCorrect;

                  let bgClass =
                    "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent";

                  if (isAnswered && isCorrectQ)
                    bgClass =
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                  else if (isAnswered && !isCorrectQ)
                    bgClass = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";

                  if (isCurrent)
                    bgClass =
                      "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/50 ring-1 ring-purple-500/50";

                  if (isMarkedLocal) {
                    // Add amber glow/border if marked
                    bgClass += isCurrent
                      ? " shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : " border-amber-500/40";
                  }

                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => goToQuestion(idx)}
                      className={`relative w-9 h-9 rounded-lg text-sm font-bold cursor-pointer transition-all ${bgClass}`}
                    >
                      {idx + 1}
                      {isMarkedLocal && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-[#0b0b0d] shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/5 flex items-center justify-center gap-4 text-[10px] text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500/15" />
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-red-500/15" />
                  <span>Wrong</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative w-2.5 h-2.5 rounded bg-gray-100 dark:bg-white/10 border border-amber-500/50">
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <span>Marked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  },
);

// ============================================================================
// RENDER: COMPANY QUESTIONS LIST VIEW - LEETCODE STYLE
// ============================================================================
// ============================================================================
// EXTRACTED COMPONENT: COMPANY LIST VIEW
// ============================================================================
const CompanyListView = React.memo(
  ({
    allCompanyQuestions,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setIsChecked,
    setActiveCategory,
    setCurrentSection,
    selectedCompanyFilters,
    selectedCategoryFilters,
    selectedYearFilter,
    selectedDifficultyFilter,
    handleBackToLanding,
    setSelectedCompanyFilters,
    setSelectedCategoryFilters,
    setSelectedYearFilter,
    setSelectedDifficultyFilter,
    availableYears,
    setShowCompanyFilters,
    showCompanyFilters,
    companySubTab,
    setCompanySubTab,
    fetchCompanyQuestions,
    setQuestions,
    mcqAnswerHistory,
    selectedStatusFilter,
    setSelectedStatusFilter,
    handleClearStatus,
  }) => {
    // Calculate company counts and topic counts from allCompanyQuestions
    // Calculate company counts and topic counts from allCompanyQuestions
    const companyCounts = {};
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const topicCounts = {};
    allCompanyQuestions.forEach((q) => {
      (q.companies || []).forEach((c) => {
        companyCounts[c] = (companyCounts[c] || 0) + 1;
      });
      if (q.category) {
        topicCounts[q.category] = (topicCounts[q.category] || 0) + 1;
      }
    });

    // Handle selecting a question directly
    const handleSelectQuestion = (questionIndex) => {
      setCurrentQuestionIndex(questionIndex);
      setSelectedAnswer(null);
      setIsChecked(false);
      setActiveCategory("company_all");
      setCurrentSection("company-questions");
    };

    // Apply filters to get filtered questions
    const getFilteredQuestions = () => {
      let filtered = [...allCompanyQuestions];
      if (selectedCompanyFilters.length > 0) {
        filtered = filtered.filter((q) =>
          q.companies?.some((c) => selectedCompanyFilters.includes(c)),
        );
      }
      if (selectedCategoryFilters.length > 0) {
        filtered = filtered.filter((q) =>
          selectedCategoryFilters.includes(q.category),
        );
      }
      if (selectedYearFilter) {
        filtered = filtered.filter(
          (q) => q.yearAsked === parseInt(selectedYearFilter),
        );
      }
      if (selectedDifficultyFilter) {
        filtered = filtered.filter(
          (q) => q.difficulty === selectedDifficultyFilter,
        );
      }
      // Status filter using mcqAnswerHistory
      if (selectedStatusFilter) {
        filtered = filtered.filter((q) => {
          const history = mcqAnswerHistory?.[q._id];
          if (selectedStatusFilter === "solved")
            return history?.isCorrect === true;
          if (selectedStatusFilter === "wrong")
            return history?.isCorrect === false;
          if (selectedStatusFilter === "marked")
            return history?.isMarked === true;
          if (selectedStatusFilter === "unattempted")
            return (
              !history || (history.isCorrect === undefined && !history.isMarked)
            );
          return true;
        });
      }
      return filtered;
    };

    const filteredQuestions = getFilteredQuestions();

    // Reset page when filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [
      selectedCompanyFilters,
      selectedCategoryFilters,
      selectedYearFilter,
      selectedDifficultyFilter,
      selectedStatusFilter,
    ]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    const paginatedQuestions = filteredQuestions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        // Scroll to top of list
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // Toggle filter chips
    const toggleCompanyFilter = (company) => {
      setSelectedCompanyFilters((prev) =>
        prev.includes(company)
          ? prev.filter((c) => c !== company)
          : [...prev, company],
      );
    };

    const toggleCategoryFilter = (category) => {
      setSelectedCategoryFilters((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category],
      );
    };

    const clearAllFilters = () => {
      setSelectedCompanyFilters([]);
      setSelectedCategoryFilters([]);
      setSelectedYearFilter("");
      setSelectedDifficultyFilter("");
      setSelectedStatusFilter("");
    };

    const activeFilterCount =
      selectedCompanyFilters.length +
      selectedCategoryFilters.length +
      (selectedYearFilter ? 1 : 0) +
      (selectedDifficultyFilter ? 1 : 0) +
      (selectedStatusFilter ? 1 : 0);

    return (
      <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] flex flex-col">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-radial from-blue-100 dark:from-blue-500/8 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-violet-100 dark:from-violet-500/6 via-transparent to-transparent blur-3xl" />
        </div>

        {/* Sticky Header Container */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0b0b0d]/65 backdrop-blur-md pt-6 pb-2 border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
          {/* Compact Header - Matching Practice Section */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBackToLanding}
              className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Real Company Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Actual interview questions from top companies
              </p>
            </div>

            {/* Tabs */}
            <div className="hidden md:flex p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              {[
                { id: "internships", label: "Internships", icon: BookOpen },
                { id: "placements", label: "Placements", icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCompanySubTab(tab.id);
                    fetchCompanyQuestions(
                      tab.id === "placements" ? "Placement" : "Internship",
                    );
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${companySubTab === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                    }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar - Compact */}
          <div className="flex items-center gap-6 py-2 px-4 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Object.keys(companyCounts).length}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-500 uppercase">
                  Companies
                </div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                <FileCode size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {allCompanyQuestions.length}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-500 uppercase">
                  Questions
                </div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-500/20">
                <Brain size={18} className="text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Object.keys(topicCounts).length}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-500 uppercase">Topics</div>
              </div>
            </div>
          </div>

          {/* New Unified Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
            {/* Left: Showing Text */}
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing{" "}
              <span className="text-white font-bold">
                {paginatedQuestions.length > 0
                  ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                  : 0}
                -
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredQuestions.length,
                )}
              </span>{" "}
              of{" "}
              <span className="text-white font-bold">
                {filteredQuestions.length}
              </span>{" "}
              questions
              {activeFilterCount > 0 && (
                <span className="text-gray-500 ml-1">
                  (filtered from {allCompanyQuestions.length})
                </span>
              )}
            </span>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Clear Status Button - Styled as Ghost/Danger */}
              {handleClearStatus && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={filteredQuestions.length === 0}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Reset progress for visible questions"
                >
                  <RotateCcw size={14} className={`transition-transform duration-500 ${showClearConfirm ? 'rotate-180' : 'group-hover:-rotate-180'}`} />
                  Clear Status
                </button>
              )}

              {/* Filter Button - Styled as Primary/Secondary */}
              <button
                onClick={() => setShowCompanyFilters(!showCompanyFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${showCompanyFilters || activeFilterCount > 0
                  ? "bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Target size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 -mr-1 rounded-full bg-purple-500 text-white text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronRight size={14} className={`transition-transform duration-300 ${showCompanyFilters ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex justify-center mb-4">
          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
            {[
              { id: "internships", label: "Internships", icon: BookOpen },
              { id: "placements", label: "Placements", icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCompanySubTab(tab.id);
                  fetchCompanyQuestions(
                    tab.id === "placements" ? "Placement" : "Internship",
                  );
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${companySubTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Panel - Collapsible with CSS transition */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showCompanyFilters
            ? "max-h-[500px] opacity-100 mb-6"
            : "max-h-0 opacity-0"
            }`}
        >
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filter Questions</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Company Filters */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Companies
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(companyCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 12)
                  .map(([company, count]) => (
                    <button
                      key={company}
                      onClick={() => toggleCompanyFilter(company)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${selectedCompanyFilters.includes(company)
                        ? "bg-blue-100 dark:bg-blue-500/30 border border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-300"
                        : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                    >
                      {company} <span className="text-gray-500">({count})</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Topic Filters */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Topics
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(topicCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([topic, count]) => (
                    <button
                      key={topic}
                      onClick={() => toggleCategoryFilter(topic)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${selectedCategoryFilters.includes(topic)
                        ? "bg-purple-100 dark:bg-purple-500/30 border border-purple-200 dark:border-purple-500/50 text-purple-600 dark:text-purple-300"
                        : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                    >
                      {topic} <span className="text-gray-500">({count})</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Difficulty, Year & Status Filters */}
            <div className="flex flex-wrap gap-6">
              {/* Difficulty */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Difficulty
                </div>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() =>
                        setSelectedDifficultyFilter(
                          selectedDifficultyFilter === diff ? "" : diff,
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedDifficultyFilter === diff
                        ? diff === "Easy"
                          ? "bg-emerald-100 dark:bg-emerald-500/30 border border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-300"
                          : diff === "Hard"
                            ? "bg-red-100 dark:bg-red-500/30 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-300"
                            : "bg-amber-100 dark:bg-amber-500/30 border border-amber-200 dark:border-amber-500/50 text-amber-600 dark:text-yellow-300"
                        : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              {availableYears.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Year
                  </div>
                  <select
                    value={selectedYearFilter}
                    onChange={(e) => setSelectedYearFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs cursor-pointer"
                  >
                    <option value="">All Years</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* STATUS Filter */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Status
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "solved", label: "✓ Solved", color: "emerald" },
                    { id: "wrong", label: "✗ Wrong", color: "red" },
                    { id: "marked", label: "★ Marked", color: "amber" },
                    { id: "unattempted", label: "○ New", color: "gray" },
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() =>
                        setSelectedStatusFilter(
                          selectedStatusFilter === status.id ? "" : status.id,
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedStatusFilter === status.id
                        ? {
                          emerald: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40",
                          red: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/40",
                          amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40",
                          gray: "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500/40",
                        }[status.color]
                        : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="flex-1">
          {/* Question List */}
          <div className="space-y-2">
            {paginatedQuestions.map((q, idx) => {
              // Calculate actual index for display
              const displayIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx;
              return (
                <motion.div
                  key={q._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <div
                    onClick={() => {
                      setQuestions(filteredQuestions);
                      handleSelectQuestion(idx);
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer group shadow-sm dark:shadow-none"
                  >
                    {/* Status Icon Column (Shifted Left) */}
                    <div className="w-6 shrink-0 flex items-center justify-center">
                      {(() => {
                        const history = mcqAnswerHistory?.[q._id];
                        const isSolved = history?.isCorrect === true;
                        const isWrong = history?.isCorrect === false;
                        const isMarkedQ = history?.isMarked;

                        if (isSolved)
                          return (
                            <CheckCircle
                              size={16}
                              className="text-emerald-500"
                            />
                          );
                        if (isWrong)
                          return <XCircle size={16} className="text-red-500" />;
                        if (isMarkedQ)
                          return (
                            <Flag
                              size={16}
                              className="text-amber-500 fill-amber-500/20"
                            />
                          );
                        return (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        );
                      })()}
                    </div>

                    {/* Question Number Box */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        {displayIdx + 1}
                      </span>
                    </div>

                    {/* Question Title & Tags */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                        {q.question?.substring(0, 100)}
                        {q.question?.length > 100 ? "..." : ""}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Topic */}
                        {q.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                            {q.category}
                          </span>
                        )}
                        {/* Companies with logos */}
                        {q.companies?.slice(0, 2).map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center gap-1"
                          >
                            <CompanyLogo company={c} size={12} />
                            {c}
                          </span>
                        ))}
                        {q.companies?.length > 2 && (
                          <span className="text-[10px] text-gray-500">
                            +{q.companies.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Year, Difficulty & Arrow - Fixed width container for alignment */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Year Asked - fixed width */}
                      <span className="text-xs text-gray-500 hidden sm:block w-10 text-right">
                        {q.yearAsked || ""}
                      </span>

                      {/* Difficulty Badge - fixed width */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold w-16 text-center ${q.difficulty === "Easy"
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : q.difficulty === "Hard"
                            ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                            : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                          }`}
                      >
                        {q.difficulty || "Medium"}
                      </span>

                      {/* Arrow */}
                      <ChevronRight
                        size={18}
                        className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredQuestions.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between mt-8 mb-12 px-4 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2)
                    pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === pageNum
                        ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === totalPages
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-20">
              <div className="p-6 rounded-3xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 inline-flex mb-6">
                <FileCode size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                No Questions Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                {activeFilterCount > 0
                  ? "No questions match your current filters. Try adjusting them."
                  : `No questions available for ${companySubTab}.`}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-sm hover:bg-purple-500/30 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
        {/* Custom Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl transform transition-all scale-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/10 text-red-500 dark:text-red-400">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Clear Status?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Are you sure you want to clear the progress for <span className="text-gray-900 dark:text-white font-bold">{
                      filteredQuestions.filter((q) => q._id && mcqAnswerHistory?.[q._id]).length
                    }</span> questions?
                    <br /><br />
                    This will reset your solved/wrong/marked status for these questions. This action simply cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const idsToClear = filteredQuestions
                      .filter((q) => q._id && mcqAnswerHistory?.[q._id])
                      .map((q) => q._id);

                    if (idsToClear.length > 0) {
                      handleClearStatus(idsToClear);
                    }
                    setShowClearConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 hover:text-red-700 dark:hover:text-red-300 font-bold transition-colors"
                >
                  Yes, Clear Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
// ============================================================================
// MAIN COMPONENT
// ============================================================================
const MCQPracticePage = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;

  // Navigation state - always start at landing
  const [currentSection, setCurrentSection] = useState("landing");
  const [activeCategory, setActiveCategory] = useState(null);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [isInitializing, setIsInitializing] = useState(false);
  const isInitialMount = React.useRef(true);
  const saveTimeoutRef = React.useRef(null);

  // Stats
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());

  // Company/Real Questions state
  const [companySubTab, setCompanySubTab] = useState("internships");
  const [companySolveMode, setCompanySolveMode] = useState(null);
  const [selectedRealCompany, setSelectedRealCompany] = useState(null);
  const [selectedRealTopic, setSelectedRealTopic] = useState(null);
  const [allCompanyQuestions, setAllCompanyQuestions] = useState([]);
  const [selectedCompanyFilters, setSelectedCompanyFilters] = useState([]);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([]);
  const [selectedYearFilter, setSelectedYearFilter] = useState("");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState("");
  const [showCompanyFilters, setShowCompanyFilters] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  // MCQ Answer History - persisted across sessions
  const [mcqAnswerHistory, setMcqAnswerHistory] = useState({});

  // Category question counts from database
  const [categoryCounts, setCategoryCounts] = useState({});

  // Mark initial mount as complete after first render
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // ============================================================================
  // URL SYNC - Update URL to show current location (replace mode, no history)
  // ============================================================================
  useEffect(() => {
    // Skip during initial mount
    if (isInitialMount.current) return;

    const params = new URLSearchParams();

    if (currentSection && currentSection !== "landing") {
      params.set("section", currentSection);
    }

    if (activeCategory) {
      params.set("category", activeCategory);
    }

    if (questions.length > 0) {
      params.set("q", currentQuestionIndex.toString());
    }

    if (
      currentSection === "company" ||
      currentSection === "company-questions"
    ) {
      params.set("type", companySubTab);
    }

    // Use replace: true so URL updates but browser back goes to previous page
    setSearchParams(params, { replace: true });
  }, [
    currentSection,
    activeCategory,
    currentQuestionIndex,
    companySubTab,
    questions.length,
    setSearchParams,
  ]);

  // ============================================================================
  // RESTORE STATE FROM URL ON MOUNT
  // ============================================================================

  // Fetch session progress from backend
  const fetchSessionProgress = useCallback(async (category, type) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await axios.get(`${API_URL}/mcq/session-progress`, {
        params: { category, type },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.data) {
        setAnsweredQuestions(data.data.answeredQuestions || {});
        if (data.data.lastQuestionIndex > 0) {
          setCurrentQuestionIndex(data.data.lastQuestionIndex);
        }
      }
    } catch (error) {
      console.error("Fetch Session Progress Error:", error);
    }
  }, []);

  // Save session progress to backend (debounced)
  const saveSessionProgress = useCallback(
    async (category, type, questionIndex, answered) => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !category) return;
        await axios.post(
          `${API_URL}/mcq/session-progress`,
          {
            category,
            type,
            lastQuestionIndex: questionIndex,
            answeredQuestions: answered,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (error) {
        console.error("Save Session Progress Error:", error);
      }
    },
    [],
  );

  // Fetch category counts from database
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/mcq`, {
        params: { type: "Practice" },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (data.success) {
        const counts = {};
        data.data.forEach((q) => {
          const cat = q.category;
          if (cat) counts[cat] = (counts[cat] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    } catch (error) {
      console.error("Fetch Category Counts Error:", error);
    }
  }, []);

  // Fetch counts when practice section is accessed
  useEffect(() => {
    if (currentSection === "practice" || currentSection === "landing") {
      fetchCategoryCounts();
    }
  }, [currentSection, fetchCategoryCounts]);

  // Save to backend whenever answeredQuestions changes (debounced)
  useEffect(() => {
    if (Object.keys(answeredQuestions).length === 0 || !activeCategory) return;

    // Debounce save to avoid too many API calls
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const type = currentSection.includes("company")
        ? companySubTab
        : "practice";
      saveSessionProgress(
        activeCategory,
        type,
        currentQuestionIndex,
        answeredQuestions,
      );
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    answeredQuestions,
    activeCategory,
    currentQuestionIndex,
    currentSection,
    companySubTab,
    saveSessionProgress,
  ]);

  // ============================================================================
  // API HANDLERS
  // ============================================================================
  const fetchPracticeQuestions = useCallback(async (category) => {
    setLoading(true);
    try {
      const dbCategory = CATEGORY_MAP[category];
      const { data } = await axios.get(`${API_URL}/mcq`, {
        params: { category: dbCategory, type: "Practice" },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (data.success) {
        // Shuffle questions using Fisher-Yates algorithm
        const shuffled = [...data.data];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setQuestions(shuffled);
        // Set MCQ answer history from response
        if (data.mcqAnswerHistory) {
          setMcqAnswerHistory(data.mcqAnswerHistory);
        }
        // Only reset to 0 if NOT initial mount (i.e., user changed category)
        if (!isInitialMount.current) {
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setIsChecked(false);
          setAnsweredQuestions({});
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyQuestions = useCallback(
    async (opportunityType = "Internship") => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/mcq`, {
          params: { type: "Real", opportunityType },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (data.success) {
          setAllCompanyQuestions(data.data);
          setQuestions(data.data);
          const companies = [
            ...new Set(data.data.flatMap((q) => q.companies || [])),
          ].filter(Boolean);
          const categories = [
            ...new Set(data.data.map((q) => q.category)),
          ].filter(Boolean);
          const years = [
            ...new Set(data.data.map((q) => q.yearAsked).filter(Boolean)),
          ].sort((a, b) => b - a);
          setAvailableCompanies(companies);
          setAvailableCategories(categories);
          setAvailableYears(years);
          setSelectedCompanyFilters([]);
          setSelectedCategoryFilters([]);
          setSelectedYearFilter("");
          setSelectedDifficultyFilter("");
          // Set MCQ answer history from response
          if (data.mcqAnswerHistory) {
            setMcqAnswerHistory(data.mcqAnswerHistory);
          }
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch company questions when entering company section
  useEffect(() => {
    if (currentSection === "company" && isPremium) {
      const source =
        companySubTab === "internships" ? "Internship" : "Placement";
      fetchCompanyQuestions(source);
    }
  }, [currentSection, companySubTab, isPremium, fetchCompanyQuestions]);

  // Apply filters
  useEffect(() => {
    if (allCompanyQuestions.length === 0) return;
    let filtered = [...allCompanyQuestions];
    if (selectedCompanyFilters.length > 0) {
      filtered = filtered.filter((q) =>
        q.companies?.some((c) => selectedCompanyFilters.includes(c)),
      );
    }
    if (selectedCategoryFilters.length > 0) {
      filtered = filtered.filter((q) =>
        selectedCategoryFilters.includes(q.category),
      );
    }
    if (selectedYearFilter) {
      filtered = filtered.filter(
        (q) => q.yearAsked === parseInt(selectedYearFilter),
      );
    }
    if (selectedDifficultyFilter) {
      filtered = filtered.filter(
        (q) => q.difficulty === selectedDifficultyFilter,
      );
    }
    setQuestions(filtered);
  }, [
    allCompanyQuestions,
    selectedCompanyFilters,
    selectedCategoryFilters,
    selectedYearFilter,
    selectedDifficultyFilter,
  ]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Fetch MCQ progress on mount
  const fetchMCQProgress = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await axios.get(`${API_URL}/mcq/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setStreak(data.data.currentStreak || 0);
        setSolved(data.data.totalSolved || 0);
        setCorrectCount(data.data.correctAnswers || 0);
        setDailyCount(data.data.dailyPracticeCount || 0);
      }
    } catch (error) {
      console.error("Fetch MCQ Progress Error:", error);
    }
  }, []);

  // Load progress on mount
  useEffect(() => {
    fetchMCQProgress();
  }, [fetchMCQProgress]);

  const handleStartPractice = useCallback(
    async (category) => {
      if (!isPremium && dailyCount >= FREE_PRACTICE_LIMIT) {
        navigate("/premium");
        return;
      }
      setActiveCategory(category);
      await fetchPracticeQuestions(category);
      fetchSessionProgress(category, "practice");
      setCurrentSection("practice");
    },
    [
      isPremium,
      dailyCount,
      FREE_PRACTICE_LIMIT,
      navigate,
      fetchPracticeQuestions,
      fetchSessionProgress,
    ],
  );

  const handleCheckAnswer = useCallback(async () => {
    if (selectedAnswer === null) return;
    setIsChecked(true);

    const currentQ = questions[currentQuestionIndex];

    // Normalize correct answers
    const correctIndices = currentQ.correctOptions?.length
      ? currentQ.correctOptions
      : currentQ.correctOption !== undefined
        ? [currentQ.correctOption]
        : [];

    // Normalize user selection
    const userSelection = Array.isArray(selectedAnswer)
      ? selectedAnswer
      : selectedAnswer !== null
        ? [selectedAnswer]
        : [];

    // Check correctness (exact match of sorted arrays)
    const isCorrect =
      correctIndices.length === userSelection.length &&
      [...correctIndices].sort().toString() ===
      [...userSelection].sort().toString();

    // Track this answer in answeredQuestions
    setAnsweredQuestions((prev) => ({
      ...prev,
      [currentQuestionIndex]: { answered: true, isCorrect, selectedAnswer },
    }));

    // Update local state immediately for UI
    setSolved((prev) => prev + 1);
    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    } else {
      setStreak(0);
    }
    if (!isPremium) setDailyCount((prev) => prev + 1);

    // Persist to backend
    try {
      const token = localStorage.getItem("token");
      if (token && currentQ._id) {
        await axios.post(
          `${API_URL}/mcq/submit-answer`,
          { mcqId: currentQ._id, selectedAnswer, isCorrect },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (error) {
      console.error("Submit Answer Error:", error);
    }
  }, [selectedAnswer, questions, currentQuestionIndex, isPremium]);

  const handleNextQuestion = useCallback(() => {
    if (!isPremium && dailyCount >= FREE_PRACTICE_LIMIT) {
      navigate("/premium");
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsChecked(false);
    }
  }, [
    isPremium,
    dailyCount,
    FREE_PRACTICE_LIMIT,
    navigate,
    currentQuestionIndex,
    questions.length,
  ]);

  const handleBackToLanding = useCallback(() => {
    setActiveCategory(null);
    setCurrentSection("landing");
    setCompanySolveMode(null);
    setCompanySubTab("internships");
    // Reset questions and related state to ensure fresh start
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setAnsweredQuestions({});
    fetchMCQProgress();
  }, [
    fetchMCQProgress,
    setActiveCategory,
    setCurrentSection,
    setCompanySolveMode,
    setCompanySubTab,
    setQuestions,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setIsChecked,
    setAnsweredQuestions,
  ]);

  // Go back to practice category selection (not landing)
  const handleBackToPractice = useCallback(() => {
    setActiveCategory(null);
    setCurrentSection("practice");
    // Reset questions and related state
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setAnsweredQuestions({});
  }, [
    setActiveCategory,
    setCurrentSection,
    setQuestions,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setIsChecked,
    setAnsweredQuestions,
  ]);

  // Go back to company questions list
  const handleBackToCompany = () => {
    setActiveCategory(null);
    setCurrentSection("company");
    // Reset questions and related state
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setAnsweredQuestions({});
  };

  // Toggle mark status and persist to backend
  const handleToggleMark = useCallback(
    async (mcqId, questionIndex) => {
      const currentMarked =
        markedQuestions.has(questionIndex) || mcqAnswerHistory[mcqId]?.isMarked;
      const newMarked = !currentMarked;

      // Update local state immediately
      setMarkedQuestions((prev) => {
        const newSet = new Set(prev);
        if (newMarked) {
          newSet.add(questionIndex);
        } else {
          newSet.delete(questionIndex);
        }
        return newSet;
      });

      // Update mcqAnswerHistory
      setMcqAnswerHistory((prev) => ({
        ...prev,
        [mcqId]: {
          ...(prev[mcqId] || {}),
          isMarked: newMarked,
        },
      }));

      // Persist to backend
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await axios.post(
            `${API_URL}/mcq/toggle-marked`,
            { mcqId, isMarked: newMarked },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
      } catch (error) {
        console.error("Toggle Marked Error:", error);
      }
    },
    [markedQuestions, mcqAnswerHistory],
  );

  // Reset a single question's history
  const handleResetQuestion = useCallback(
    async (mcqId, questionIndex) => {
      // Update local state immediately
      setAnsweredQuestions((prev) => {
        const newAnswered = { ...prev };
        delete newAnswered[questionIndex];
        return newAnswered;
      });

      setMarkedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });

      // Update mcqAnswerHistory
      setMcqAnswerHistory((prev) => {
        const newHistory = { ...prev };
        delete newHistory[mcqId];
        return newHistory;
      });

      // Reset checked state if currently viewing this question
      if (currentQuestionIndex === questionIndex) {
        setSelectedAnswer(null);
        setIsChecked(false);
      }

      // Persist to backend
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await axios.post(
            `${API_URL}/mcq/reset-mcq-history`,
            { mcqIds: [mcqId] },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
      } catch (error) {
        console.error("Reset MCQ History Error:", error);
      }
    },
    [currentQuestionIndex],
  );

  // Clear status for a list of questions
  const handleClearStatus = useCallback(async (questionIds) => {
    if (!questionIds || questionIds.length === 0) return;

    // Confirm with user
    if (!window.confirm(`Are you sure you want to clear the status for ${questionIds.length} questions? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.post(
        `${API_URL}/mcq/reset-mcq-history`,
        { mcqIds: questionIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        // Update local state - remove from mcqAnswerHistory
        setMcqAnswerHistory((prev) => {
          const next = { ...prev };
          questionIds.forEach((id) => delete next[id]);
          return next;
        });

        // Also clean up answeredQuestions if they match any
        // Note: answeredQuestions is keyed by index of current session "questions" array
        // It's safer to just let it be or clear it if we are resetting everything
        // But since we are in list view, answeredQuestions for session might not be populated or relevant

        // Refresh stats
        fetchMCQProgress();
        // Also refresh list if needed, but local state update should handle UI
      }
    } catch (error) {
      console.error("Clear Status Error:", error);
      alert("Failed to clear status. Please try again.");
    }
  }, [fetchMCQProgress]);

  const accuracy = solved > 0 ? Math.round((correctCount / solved) * 100) : 0;

  // Skeletons for Loading State
  const QuestionSkeleton = () => (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-120px)] p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="h-8 w-32 bg-white/10 rounded-lg" />
        <div className="h-32 w-full bg-white/5 rounded-2xl" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 hidden lg:block h-96 bg-white/5 rounded-2xl" />
    </div>
  );

  const DashboardSkeleton = () => (
    <div className="min-h-[calc(100vh-120px)] flex flex-col pt-12 max-w-7xl mx-auto animate-pulse">
      <div className="h-12 w-48 bg-white/10 rounded-xl mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );

  // ============================================================================

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Show loader during initial restore from URL
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] pt-8 px-4 sm:px-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // Check if in question view (needs full screen)
  const isQuestionMode =
    (currentSection === "practice" && questions.length > 0) ||
    currentSection === "company-questions";

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-[#0b0b0d] ${isQuestionMode
        ? "pt-4 pb-4 px-2 sm:px-4 lg:px-6"
        : (currentSection === "company" || (currentSection === "practice" && questions.length === 0))
          ? "pt-0 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12"
          : "pt-8 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12"
        }`}
    >
      {currentSection === "landing" && (
        <LandingView
          isPremium={isPremium}
          solved={solved}
          accuracy={accuracy}
          streak={streak}
          dailyCount={dailyCount}
          FREE_PRACTICE_LIMIT={FREE_PRACTICE_LIMIT}
          onNavigate={navigate}
          setCurrentSection={setCurrentSection}
          fetchCompanyQuestions={fetchCompanyQuestions}
          handleStartPractice={handleStartPractice}
        />
      )}
      {currentSection === "practice" && questions.length === 0 && (
        <PracticeCategoryView
          handleBackToLanding={handleBackToLanding}
          handleStartPractice={handleStartPractice}
          isPremium={isPremium}
          FREE_PRACTICE_LIMIT={FREE_PRACTICE_LIMIT}
          navigate={navigate}
          CATEGORIES={CATEGORIES}
          CATEGORY_MAP={CATEGORY_MAP}
          categoryCounts={categoryCounts}
        />
      )}
      {currentSection === "company" && (
        <CompanyListView
          allCompanyQuestions={allCompanyQuestions}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setSelectedAnswer={setSelectedAnswer}
          setIsChecked={setIsChecked}
          setActiveCategory={setActiveCategory}
          setCurrentSection={setCurrentSection}
          selectedCompanyFilters={selectedCompanyFilters}
          selectedCategoryFilters={selectedCategoryFilters}
          selectedYearFilter={selectedYearFilter}
          selectedDifficultyFilter={selectedDifficultyFilter}
          handleBackToLanding={handleBackToLanding}
          setSelectedCompanyFilters={setSelectedCompanyFilters}
          setSelectedCategoryFilters={setSelectedCategoryFilters}
          setSelectedYearFilter={setSelectedYearFilter}
          setSelectedDifficultyFilter={setSelectedDifficultyFilter}
          availableYears={availableYears}
          setShowCompanyFilters={setShowCompanyFilters}
          showCompanyFilters={showCompanyFilters}
          companySubTab={companySubTab}
          setCompanySubTab={setCompanySubTab}
          fetchCompanyQuestions={fetchCompanyQuestions}
          setQuestions={setQuestions}
          mcqAnswerHistory={mcqAnswerHistory}
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
          handleClearStatus={handleClearStatus}
        />
      )}
      {((currentSection === "practice" && questions.length > 0) ||
        currentSection === "company-questions") && (
          <QuestionView
            isCompany={currentSection === "company-questions"}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answeredQuestions={answeredQuestions}
            selectedAnswer={selectedAnswer}
            isChecked={isChecked}
            markedQuestions={markedQuestions}
            loading={loading}
            isInitializing={isInitializing}
            handleBackToLanding={handleBackToLanding}
            handleBackToCompany={handleBackToCompany}
            handleBackToPractice={handleBackToPractice}
            handleNextQuestion={handleNextQuestion}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setSelectedAnswer={setSelectedAnswer}
            setIsChecked={setIsChecked}
            setMarkedQuestions={setMarkedQuestions}
            handleCheckAnswer={handleCheckAnswer}
            isPremium={isPremium}
            dailyCount={dailyCount}
            FREE_PRACTICE_LIMIT={FREE_PRACTICE_LIMIT}
            activeCategory={activeCategory}
            CATEGORIES={CATEGORIES}
            mcqAnswerHistory={mcqAnswerHistory}
            handleToggleMark={handleToggleMark}
            handleResetQuestion={handleResetQuestion}
          />
        )}
    </div>
  );
};

export default MCQPracticePage;
