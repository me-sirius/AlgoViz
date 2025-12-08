import React, { useState, useEffect, use } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  Trophy,
  Zap,
  CheckCircle2,
  Circle,
  Play,
  BarChart3,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Flame,
  Star,
  Home,
  Settings,
  Calendar,
  Users,
} from "lucide-react";
import Alert from "./Alert";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/UserContext";
import LoginModal from "./LoginModal";
// --- Mock Data Structure (Striver-style) ---
const INITIAL_COURSE_DATA = [
  {
    id: "basics",
    title: "Step 1: Programming Fundamentals",
    description: "Master syntax, loops, and basic problem-solving patterns",
    totalProblems: 8,
    solved: 3,
    icon: "📚",
    color: "from-blue-500 to-cyan-500",
    problems: [
      {
        id: "p1",
        title: "User Input / Output",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "15 min",
      },
      {
        id: "p2",
        title: "Data Types & Variables",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "20 min",
      },
      {
        id: "p3",
        title: "If-Else & Switch Statements",
        difficulty: "Easy",
        status: "unsolved",
        timeEstimate: "25 min",
      },
      {
        id: "p4",
        title: "While & For Loops",
        difficulty: "Easy",
        status: "unsolved",
        timeEstimate: "30 min",
      },
      {
        id: "p5",
        title: "Functions & Recursion Basics",
        difficulty: "Medium",
        status: "unsolved",
        timeEstimate: "40 min",
      },
    ],
  },
  {
    id: "arrays",
    title: "Step 2: Arrays & Strings",
    description: "Master array manipulation, searching, and string algorithms",
    totalProblems: 15,
    solved: 5,
    icon: "🧮",
    color: "from-purple-500 to-pink-500",
    problems: [
      {
        id: "a1",
        title: "Largest Element in Array",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "15 min",
      },
      {
        id: "a2",
        title: "Second Largest Element",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "20 min",
      },
      {
        id: "a3",
        title: "Check if Array is Sorted",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "15 min",
      },
      {
        id: "a4",
        title: "Remove Duplicates from Sorted Array",
        difficulty: "Medium",
        status: "solved",
        timeEstimate: "30 min",
      },
      {
        id: "a5",
        title: "Rotate Array by K Elements",
        difficulty: "Medium",
        status: "solved",
        timeEstimate: "35 min",
      },
      {
        id: "a6",
        title: "Maximum Subarray Sum (Kadane)",
        difficulty: "Medium",
        status: "unsolved",
        timeEstimate: "45 min",
      },
      {
        id: "a7",
        title: "Next Permutation",
        difficulty: "Medium",
        status: "unsolved",
        timeEstimate: "50 min",
      },
    ],
  },
  {
    id: "sorting",
    title: "Step 3: Sorting Techniques",
    description: "Understanding and implementing sorting algorithms",
    totalProblems: 10,
    solved: 2,
    icon: "📊",
    color: "from-orange-500 to-yellow-500",
    problems: [
      {
        id: "s1",
        title: "Selection Sort Implementation",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "25 min",
      },
      {
        id: "s2",
        title: "Bubble Sort Optimization",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "30 min",
      },
      {
        id: "s3",
        title: "Insertion Sort Analysis",
        difficulty: "Medium",
        status: "unsolved",
        timeEstimate: "35 min",
      },
      {
        id: "s4",
        title: "Merge Sort Implementation",
        difficulty: "Medium",
        status: "unsolved",
        timeEstimate: "45 min",
      },
      {
        id: "s5",
        title: "Quick Sort Partition",
        difficulty: "Hard",
        status: "unsolved",
        timeEstimate: "60 min",
      },
    ],
  },
  {
    id: "linkedlist",
    title: "Step 4: Linked Lists",
    description: "Master pointer manipulation and linked list operations",
    totalProblems: 12,
    solved: 1,
    icon: "🔗",
    color: "from-green-500 to-emerald-500",
    problems: [
      {
        id: "l1",
        title: "Reverse a Linked List",
        difficulty: "Easy",
        status: "solved",
        timeEstimate: "30 min",
      },
      {
        id: "l2",
        title: "Middle of Linked List",
        difficulty: "Easy",
        status: "unsolved",
        timeEstimate: "25 min",
      },
      {
        id: "l3",
        title: "Detect Cycle in Linked List",
        difficulty: "Medium",
        status: "unsolved",
        timeEstimate: "40 min",
      },
      {
        id: "l4",
        title: "Merge Two Sorted Lists",
        difficulty: "Medium",
        status: "unsolved",
        timeEstimate: "45 min",
      },
    ],
  },
];

const ProgressBar = ({ value, max, colorClass, showLabel = true }) => {
  const percentage = Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Progress</span>
          <span className="font-medium text-gray-300">{percentage}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const CircularProgress = ({ percentage, size = 100, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
        <span className="text-xs text-gray-400">Done</span>
      </div>
    </div>
  );
};

const DifficultyBadge = ({ level, compact = false }) => {
  const styles = {
    Easy: "bg-green-500/10 text-green-400 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const icons = {
    Easy: "🟢",
    Medium: "🟡",
    Hard: "🔴",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${styles[level]}`}
    >
      {!compact && icons[level]}
      {level}
    </div>
  );
};

const LearningPathPage = () => {
  const [courseData, setCourseData] = useState(INITIAL_COURSE_DATA);
  const [expandedSections, setExpandedSections] = useState({ basics: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "error",
    customButtons: null,
  });
  const { isAuthenticated } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const handleBack = () => {
    setAlertConfig({
      isOpen: true,
      message: "Are you sure you want to leave? Your progress will be lost.",
      type: "warning",
      customButtons: (
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Leave
          </button>
          <button
            onClick={() =>
              setAlertConfig((prev) => ({ ...prev, isOpen: false }))
            }
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Stay
          </button>
        </div>
      ),
    });
  };
  const totalProblems = courseData.reduce(
    (acc, curr) => acc + curr.totalProblems,
    0
  );
  const totalSolved = courseData.reduce((acc, curr) => acc + curr.solved, 0);
  const totalPercentage = Math.round((totalSolved / totalProblems) * 100);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSolveClick = (problemId) => {
    console.log(`Navigating to IDE for problem: ${problemId}`);
    alert(
      `Opening IDE for ${problemId} - In a real app, this would navigate to the IDE page`
    );
  };

  // Filter problems based on search and difficulty
  const filteredData = courseData
    .map((section) => ({
      ...section,
      problems: section.problems.filter((problem) => {
        const matchesSearch = problem.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesDifficulty =
          filterDifficulty === "all" ||
          problem.difficulty.toLowerCase() === filterDifficulty;
        return matchesSearch && matchesDifficulty;
      }),
    }))
    .filter((section) => section.problems.length > 0);
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [isAuthenticated]);

  return (
    <>
      {showLoginModal ? (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0d1117] to-[#0a0e17] text-gray-100 font-sans">
          {/* Enhanced Navbar */}
          <nav className="sticky top-0 z-50 h-16 bg-gradient-to-r from-[#0a0e17]/90 to-[#0d1117]/90 backdrop-blur-xl border-b border-gray-800/30 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 px-3 py-2 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 transition-all duration-300"
              >
                <ArrowLeft
                  size={18}
                  className="text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all"
                />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                  Back
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Learning Path
                  </span>
                  <p className="text-xs text-gray-500">
                    Structured DSA Mastery
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-sm font-medium">
                      Streak: <span className="text-white">🔥 7 days</span>
                    </span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-sm">
                      <span className="text-gray-300">Level</span>{" "}
                      <span className="font-bold text-white">12</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-6xl mx-auto px-6 py-8">
            {/* Hero Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Master Data Structures & Algorithms
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Follow our structured path to become a problem-solving expert.
                Track progress, visualize concepts, and practice with
                interactive challenges.
              </p>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              {/* Main Progress Card */}
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-300">
                      Overall Progress
                    </h3>
                    <div className="p-2 bg-gray-800/50 rounded-lg">
                      <TrendingUp size={20} className="text-blue-400" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center mb-6">
                    <CircularProgress percentage={totalPercentage} size={120} />
                    <div className="mt-6 text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {totalSolved}
                        <span className="text-gray-500 text-lg">
                          /{totalProblems}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Problems Solved</p>
                    </div>
                  </div>
                  <ProgressBar
                    value={totalSolved}
                    max={totalProblems}
                    colorClass="bg-gradient-to-r from-blue-500 to-purple-500"
                    showLabel={false}
                  />
                </div>
              </div>

              {/* Difficulty Stats */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300">
                      Difficulty Distribution
                    </h3>
                    <p className="text-sm text-gray-500">
                      Problems solved by level
                    </p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                    <Target size={20} className="text-purple-400" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-green-400 font-medium">Easy</span>
                      </div>
                      <span className="text-gray-300 font-bold">6/45</span>
                    </div>
                    <ProgressBar value={6} max={45} colorClass="bg-green-500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-yellow-400 font-medium">
                          Medium
                        </span>
                      </div>
                      <span className="text-gray-300 font-bold">9/38</span>
                    </div>
                    <ProgressBar
                      value={9}
                      max={38}
                      colorClass="bg-yellow-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-red-400 font-medium">Hard</span>
                      </div>
                      <span className="text-gray-300 font-bold">2/17</span>
                    </div>
                    <ProgressBar value={2} max={17} colorClass="bg-red-500" />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300">
                      Quick Stats
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your learning metrics
                    </p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg">
                    <Zap size={20} className="text-cyan-400" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Clock size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">
                          Total Time Spent
                        </p>
                        <p className="font-bold">24h 30m</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Avg/Problem</p>
                      <p className="font-bold text-green-400">25m</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Sparkles size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Current Streak</p>
                        <p className="font-bold">7 Days</p>
                      </div>
                    </div>
                    <div className="text-xs px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                      🔥 Active
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Trophy size={18} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Accuracy Rate</p>
                        <p className="font-bold">78%</p>
                      </div>
                    </div>
                    <div className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                      ↑ 12%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Alert
              isOpen={alertConfig.isOpen}
              message={alertConfig.message}
              type={alertConfig.type}
              onClose={() =>
                setAlertConfig((prev) => ({ ...prev, isOpen: false }))
              }
              customButtons={alertConfig.customButtons}
            />
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                    <BookOpen size={20} className="text-blue-400" />
                  </div>
                  Course Modules
                </h2>
                <p className="text-gray-500 mt-1">
                  Complete {filteredData.length} modules to master DSA
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems..."
                    className="w-full bg-gray-900/50 border border-gray-800/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600 backdrop-blur-sm"
                  />
                </div>

                <div className="flex gap-2">
                  {["all", "easy", "medium", "hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setFilterDifficulty(diff)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filterDifficulty === diff
                          ? diff === "all"
                            ? "bg-blue-600 text-white shadow-lg"
                            : diff === "easy"
                            ? "bg-green-600 text-white shadow-lg"
                            : diff === "medium"
                            ? "bg-yellow-600 text-white shadow-lg"
                            : "bg-red-600 text-white shadow-lg"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Modules */}
            <div className="space-y-4">
              {filteredData.map((section) => (
                <div
                  key={section.id}
                  className="group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${section.color}`}
                      >
                        <span className="text-lg">{section.icon}</span>
                      </div>

                      <div className="text-left flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors">
                            {section.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-gray-800/50 rounded-md text-gray-400">
                              {section.solved}/{section.totalProblems} solved
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-md ${
                                section.solved === section.totalProblems
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {Math.round(
                                (section.solved / section.totalProblems) * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block w-48 ml-4">
                      <ProgressBar
                        value={section.solved}
                        max={section.totalProblems}
                        colorClass="bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>

                    <div className="ml-4 p-2 rounded-lg bg-gray-800/30 group-hover:bg-gray-700/50 transition-colors">
                      {expandedSections[section.id] ? (
                        <ChevronDown size={20} className="text-blue-400" />
                      ) : (
                        <ChevronRight
                          size={20}
                          className="text-gray-400 group-hover:text-white"
                        />
                      )}
                    </div>
                  </button>

                  {/* Problems List */}
                  {expandedSections[section.id] && (
                    <div className="border-t border-gray-800/50 bg-[#0a0e17]/20 animate-slideDown">
                      {section.problems.map((problem) => (
                        <div
                          key={problem.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] border-b border-gray-800/30 last:border-0 group/row transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <button className="transition-all hover:scale-110">
                                {problem.status === "solved" ? (
                                  <CheckCircle2
                                    size={22}
                                    className="text-green-500 drop-shadow-lg"
                                  />
                                ) : (
                                  <Circle
                                    size={22}
                                    className="text-gray-600 group-hover/row:text-blue-500"
                                  />
                                )}
                              </button>
                              {problem.status === "solved" && (
                                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/30"></div>
                              )}
                            </div>

                            <div>
                              <span
                                className="text-gray-300 font-medium group-hover/row:text-blue-400 transition-colors cursor-pointer block"
                                onClick={() => handleSolveClick(problem.id)}
                              >
                                {problem.title}
                              </span>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock size={12} />
                                  {problem.timeEstimate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <DifficultyBadge level={problem.difficulty} />

                            <button
                              onClick={() => handleSolveClick(problem.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600 hover:to-purple-600 text-gray-300 hover:text-white text-sm font-semibold rounded-lg border border-blue-500/30 hover:border-blue-500 transition-all duration-300 group/btn"
                            >
                              {problem.status === "solved" ? "Review" : "Solve"}
                              <Play
                                size={14}
                                className="group-hover/btn:translate-x-1 transition-transform"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-gray-800/50 rounded-2xl bg-gray-900/20">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                  <Search size={24} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  No problems found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
              </div>
            )}

            {/* Footer Stats */}
            <div className="mt-12 pt-8 border-t border-gray-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {totalProblems}
                  </div>
                  <div className="text-sm text-gray-500">Total Problems</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {totalSolved}
                  </div>
                  <div className="text-sm text-gray-500">Problems Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {filteredData.length}
                  </div>
                  <div className="text-sm text-gray-500">Active Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {totalPercentage}%
                  </div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default LearningPathPage;
