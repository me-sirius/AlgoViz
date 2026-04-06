import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  Zap,
  Database,
  List,
  TreePine,
  Hash,
  GitBranch,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Code2,
  Layers,
  ArrowUpDown,
  Target,
  Cpu,
  Binary,
  Grid3X3,
  Route,
  Shuffle,
  Filter,
  X,
  Star,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Info,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CircleDot,
  Boxes,
  Network,
  Workflow,
  Lightbulb,
  GraduationCap,
  Timer,
  Brain,
  Sparkles,
  ChevronUp,
  Menu,
  Home,
  ArrowLeft,
} from "lucide-react";

import { dataStructures } from "../../core/constants/dataStructuresData";
import { algorithms } from "../../core/constants/algorithmsData";

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

const themes = {
  dark: {
    name: "dark",
    bg: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
    cardBg: "bg-slate-800/60 backdrop-blur-xl",
    cardBorder: "border-slate-700/50",
    cardHover: "hover: border-cyan-500/30 hover:shadow-cyan-500/10",
    text: "text-white",
    textMuted: "text-slate-400",
    textSubtle: "text-slate-500",
    accent: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    accentBorder: "border-cyan-500/30",
    input: "bg-slate-800/80 border-slate-600/50 text-white placeholder-slate-500",
    inputFocus: "focus:border-cyan-500/50 focus:ring-cyan-500/20",
    button: "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 cursor-pointer",
    buttonActive: "bg-cyan-600/20 border-cyan-500/50 text-cyan-400 cursor-pointer",
    gradientText: "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent",
    sectionBg: "bg-slate-900/50 backdrop-blur-md",
    tagBg: "bg-slate-700/50",
    successBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    warningBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    errorBg: "bg-red-500/10 border-red-500/30 text-red-400",
    infoBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  },
  light: {
    name: "light",
    bg: "bg-gradient-to-br from-slate-100 via-white to-slate-100",
    cardBg: "bg-white/80 backdrop-blur-xl",
    cardBorder: "border-slate-200",
    cardHover: "hover:border-cyan-400 hover:shadow-cyan-200/50",
    text: "text-slate-900",
    textMuted: "text-slate-600",
    textSubtle: "text-slate-400",
    accent: "text-cyan-600",
    accentBg: "bg-cyan-50",
    accentBorder: "border-cyan-200",
    input: "bg-white border-slate-300 text-slate-900 placeholder-slate-400",
    inputFocus: "focus:border-cyan-500 focus:ring-cyan-500/30",
    button: "bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer",
    buttonActive: "bg-cyan-50 border-cyan-500 text-cyan-700 cursor-pointer",
    gradientText: "bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent",
    sectionBg: "bg-white/70 backdrop-blur-md",
    tagBg: "bg-slate-100",
    successBg: "bg-emerald-50 border-emerald-300 text-emerald-700",
    warningBg: "bg-amber-50 border-amber-300 text-amber-700",
    errorBg: "bg-red-50 border-red-300 text-red-700",
    infoBg: "bg-blue-50 border-blue-300 text-blue-700",
  },
};

// ============================================================================
// CATEGORIES CONFIGURATION
// ============================================================================

const categories = {
  dataStructures: [
    { id: "all", name: "All", icon: Database },
    { id: "linear", name: "Linear", icon: List },
    { id: "tree", name: "Tree", icon: TreePine },
    { id: "hash", name: "Hash", icon: Hash },
    { id: "graph", name: "Graph", icon: Network },
  ],
  algorithms: [
    { id: "all", name: "All", icon: Cpu },
    { id: "searching", name: "Searching", icon: Search },
    { id: "sorting", name: "Sorting", icon: ArrowUpDown },
    { id: "graph", name: "Graph", icon: Network },
    { id: "technique", name: "Techniques", icon: Lightbulb },
  ],
};

// ============================================================================
// COMPLEXITY CHART DATA
// ============================================================================

const complexityOrder = [
  { notation: "O(1)", name: "Constant", color: "emerald", rank: 1 },
  { notation: "O(log n)", name: "Logarithmic", color: "green", rank: 2 },
  { notation: "O(n)", name: "Linear", color: "yellow", rank: 3 },
  { notation: "O(n log n)", name: "Linearithmic", color: "orange", rank: 4 },
  { notation: "O(n²)", name: "Quadratic", color: "red", rank: 5 },
  { notation: "O(2^n)", name: "Exponential", color: "rose", rank: 6 },
  { notation: "O(n! )", name: "Factorial", color: "pink", rank: 7 },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

import { useTheme } from "../../core/context/ThemeContext";

const CheatSheet = () => {
  const navigate = useNavigate();

  // Theme State
  const { theme: globalTheme, toggleTheme } = useTheme();
  const isDarkMode = globalTheme === "dark";
  const theme = isDarkMode ? themes.dark : themes.light;

  // Navigation State
  const [activeTab, setActiveTab] = useState("dataStructures");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [showQuickReference, setShowQuickReference] = useState(false);
  const [selectedCodeLang, setSelectedCodeLang] = useState("cpp");
  const [copiedCode, setCopiedCode] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Refs
  const contentRef = useRef(null);

  // Get current data based on active tab
  const currentData = activeTab === "dataStructures" ? dataStructures : algorithms;
  const currentCategories = activeTab === "dataStructures"
    ? categories.dataStructures
    : categories.algorithms;

  // Filter data
  const filteredData = useMemo(() => {
    return currentData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.useCases && item.useCases.some(uc =>
          uc.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (item.interviewQuestions && item.interviewQuestions.some(q =>
          q.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [currentData, searchTerm, selectedCategory]);

  // Toggle expansion
  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Toggle bookmark
  const toggleBookmark = (id) => {
    const newBookmarked = new Set(bookmarkedItems);
    if (newBookmarked.has(id)) {
      newBookmarked.delete(id);
    } else {
      newBookmarked.add(id);
    }
    setBookmarkedItems(newBookmarked);
  };

  // Copy code
  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Get complexity color
  const getComplexityColor = (complexity) => {
    if (!complexity) return theme.textMuted;
    const comp = complexity.toLowerCase();
    if (comp.includes("1)")) return "text-emerald-400";
    if (comp.includes("log n)")) return "text-green-400";
    if (comp.includes("n log n")) return "text-orange-400";
    if (comp.includes("n²") || comp.includes("n^2")) return "text-red-400";
    if (comp.includes("2^n") || comp.includes("n!")) return "text-rose-400";
    if (comp.includes("n)")) return "text-yellow-400";
    return theme.textMuted;
  };

  const getComplexityBg = (complexity) => {
    if (!complexity) return theme.tagBg;
    const comp = complexity.toLowerCase();
    if (comp.includes("1)")) return "bg-emerald-500/20 border-emerald-500/30";
    if (comp.includes("log n)")) return "bg-green-500/20 border-green-500/30";
    if (comp.includes("n log n")) return "bg-orange-500/20 border-orange-500/30";
    if (comp.includes("n²") || comp.includes("n^2")) return "bg-red-500/20 border-red-500/30";
    if (comp.includes("2^n") || comp.includes("n!")) return "bg-rose-500/20 border-rose-500/30";
    if (comp.includes("n)")) return "bg-yellow-500/20 border-yellow-500/30";
    return theme.tagBg;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "Medium": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "Hard": return "text-red-400 bg-red-500/20 border-red-500/30";
      default: return theme.tagBg;
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.sectionBg} border-b ${theme.cardBorder}`}>
        <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className={`p-2 rounded-xl ${theme.accentBg} ${theme.accentBorder} border hover:scale-110 transition-transform duration-200 cursor-pointer`}
                title="Back to Home"
              >
                <ArrowLeft className={theme.accent} size={24} />
              </button>
              <div className={`p-2 rounded-xl ${theme.accentBg} ${theme.accentBorder} border`}>
                <GraduationCap className={theme.accent} size={24} />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme.gradientText}`}>
                  DSA Cheat Sheet
                </h1>
                <p className={`text-xs ${theme.textMuted} hidden sm:block`}>
                  Your last-minute study companion
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Quick Reference Toggle */}
              <button
                onClick={() => setShowQuickReference(!showQuickReference)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${showQuickReference ? theme.buttonActive : theme.button
                  } border ${showQuickReference ? theme.accentBorder : 'border-transparent'}`}
              >
                <Timer size={18} />
                <span className="text-sm font-medium">Quick Ref</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-300 ${theme.button} hover:scale-105`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`md:hidden p-2 rounded-xl ${theme.button}`}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={`md:hidden ${theme.cardBg} border-t ${theme.cardBorder} p-4`}>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowQuickReference(!showQuickReference);
                  setShowMobileMenu(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl ${theme.button}`}
              >
                <Timer size={18} />
                <span>Quick Reference</span>
              </button>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl ${theme.button}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Quick Reference Panel */}
      {showQuickReference && (
        <div className={`${theme.sectionBg} border-b ${theme.cardBorder} py-6`}>
          <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${theme.text} flex items-center gap-2`}>
                <Sparkles className={theme.accent} size={20} />
                Quick Reference - Big O Complexity
              </h2>
              <button
                onClick={() => setShowQuickReference(false)}
                className={`p-2 rounded-lg ${theme.button}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Complexity Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {complexityOrder.map((comp) => (
                <div
                  key={comp.notation}
                  className={`p-3 rounded-xl border ${theme.cardBorder} ${theme.cardBg} text-center`}
                >
                  <div className={`text-lg font-bold text-${comp.color}-400`}>
                    {comp.notation}
                  </div>
                  <div className={`text-xs ${theme.textMuted}`}>{comp.name}</div>
                </div>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${theme.infoBg} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} />
                  <span className="font-semibold text-sm">Array vs Linked List</span>
                </div>
                <p className="text-xs opacity-80">
                  Array: O(1) access, O(n) insert.  Linked List: O(n) access, O(1) insert at known position.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme.successBg} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} />
                  <span className="font-semibold text-sm">BFS vs DFS</span>
                </div>
                <p className="text-xs opacity-80">
                  BFS: Shortest path (unweighted), level order.  DFS: Cycle detection, topological sort.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme.warningBg} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} />
                  <span className="font-semibold text-sm">Hash Table vs BST</span>
                </div>
                <p className="text-xs opacity-80">
                  Hash:  O(1) lookup, no order. BST: O(log n) lookup, ordered traversal, range queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("dataStructures"); setSelectedCategory("all"); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${activeTab === "dataStructures"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                : `${theme.button}`
                }`}
            >
              <Database size={18} />
              Data Structures
            </button>
            <button
              onClick={() => navigate("/algorithms")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${theme.button}`}
            >
              <Cpu size={18} />
              Algorithms
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 sm:ml-auto">
            <div className={`text-sm ${theme.textMuted}`}>
              Showing <span className={theme.accent}>{filteredData.length}</span> of {currentData.length}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-4 mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`} size={20} />
              <input
                type="text"
                placeholder="Search by name, description, or interview questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 ${theme.input} ${theme.inputFocus} border rounded-xl transition-all duration-200`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${theme.textMuted} hover: ${theme.text} cursor-pointer`}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {currentCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${selectedCategory === category.id
                      ? `${theme.buttonActive} border`
                      : `${theme.button} border border-transparent`
                      }`}
                  >
                    <IconComponent size={16} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div ref={contentRef} className="space-y-4">
          {activeTab === "algorithms" ? (
            <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6 flex items-center justify-between`}>
              <div>
                <h2 className={`text-xl font-bold ${theme.text}`}>Algorithms Reference</h2>
                <p className={`text-sm ${theme.textMuted} mt-2`}>The full algorithms reference has been moved to the dedicated Algorithms page for a focused view.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/algorithms')} className={`px-4 py-2 rounded-xl ${theme.buttonActive}`}>Open Algorithms Page</button>
                <button onClick={() => setActiveTab('dataStructures')} className={`px-4 py-2 rounded-xl ${theme.button}`}>Back to Cheat Sheet</button>
              </div>
            </div>
          ) : (
            filteredData.map((item) => {
              const IconComponent = item.icon;
              const isExpanded = expandedItems.has(item.id);
              const isBookmarked = bookmarkedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`${theme.cardBg} ${theme.cardBorder} ${theme.cardHover} border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl`}
                >
                  {/* Card Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.accentBorder} border flex-shrink-0`}>
                          <IconComponent className={theme.accent} size={24} />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h3 className={`text-lg font-bold ${theme.text}`}>{item.name}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                          </div>
                          <p className={`text-sm ${theme.textMuted} line-clamp-2`}>{item.description}</p>

                          {/* Quick Complexity Preview */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.timeComplexity && (
                              <>
                                {typeof item.timeComplexity === 'object' && item.timeComplexity.avg ? (
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${getComplexityBg(item.timeComplexity.avg)}`}>
                                    <span className={theme.textMuted}>Time: </span>
                                    <span className={getComplexityColor(item.timeComplexity.avg)}>{item.timeComplexity.avg}</span>
                                  </span>
                                ) : Object.entries(item.timeComplexity).slice(0, 2).map(([key, val]) => (
                                  <span key={key} className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${getComplexityBg(typeof val === 'object' ? val.avg : val)}`}>
                                    <span className={theme.textMuted}>{key}: </span>
                                    <span className={getComplexityColor(typeof val === 'object' ? val.avg : val)}>
                                      {typeof val === 'object' ? val.avg : val}
                                    </span>
                                  </span>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(item.id);
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${isBookmarked
                            ? 'text-yellow-400 bg-yellow-500/20'
                            : `${theme.textMuted} hover: ${theme.text} ${theme.button}`
                            }`}
                        >
                          {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                        </button>
                        <div className={`p-2 rounded-lg ${theme.button}`}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className={`border-t ${theme.cardBorder} p-5 space-y-6`}>
                      {/* Detailed Description */}
                      {item.detailedDescription && (
                        <div>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-2 flex items-center gap-2`}>
                            <Info size={16} className={theme.accent} />
                            Overview
                          </h4>
                          <p className={`text-sm ${theme.textMuted} leading-relaxed`}>
                            {item.detailedDescription}
                          </p>
                        </div>
                      )}

                      {/* Time & Space Complexity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Time Complexity */}
                        <div className={`p-4 rounded-xl ${theme.sectionBg} border ${theme.cardBorder}`}>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                            <Clock size={16} className={theme.accent} />
                            Time Complexity
                          </h4>
                          <div className="space-y-2">
                            {typeof item.timeComplexity === 'object' &&
                              Object.entries(item.timeComplexity).map(([op, complexity]) => (
                                <div key={op} className="flex justify-between items-center">
                                  <span className={`text-sm capitalize ${theme.textMuted}`}>{op}:</span>
                                  <span className={`font-mono text-sm px-2 py-0.5 rounded ${getComplexityBg(typeof complexity === 'object' ? complexity.avg : complexity)}`}>
                                    <span className={getComplexityColor(typeof complexity === 'object' ? complexity.avg : complexity)}>
                                      {typeof complexity === 'object' ? `${complexity.avg} / ${complexity.worst}` : complexity}
                                    </span>
                                  </span>
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        {/* Space Complexity */}
                        <div className={`p-4 rounded-xl ${theme.sectionBg} border ${theme.cardBorder}`}>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                            <Database size={16} className={theme.accent} />
                            Space Complexity
                          </h4>
                          {typeof item.spaceComplexity === 'object' ? (
                            <div className="space-y-2">
                              {Object.entries(item.spaceComplexity).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center">
                                  <span className={`text-sm capitalize ${theme.textMuted}`}>{key}:</span>
                                  <span className={`font-mono text-sm px-2 py-0.5 rounded ${getComplexityBg(val)}`}>
                                    <span className={getComplexityColor(val)}>{val}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className={`font-mono text-lg ${getComplexityColor(item.spaceComplexity)}`}>
                              {item.spaceComplexity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Operations (for Data Structures) */}
                      {item.operations && (
                        <div>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                            <Zap size={16} className={theme.accent} />
                            Key Operations
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {item.operations.map((op, idx) => (
                              <div key={idx} className={`p-3 rounded-xl ${theme.sectionBg} border ${theme.cardBorder}`}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`text-sm font-medium ${theme.text}`}>{op.name}</span>
                                  <span className={`font-mono text-xs ${getComplexityColor(op.complexity)}`}>
                                    {op.complexity}
                                  </span>
                                </div>
                                {op.code && (
                                  <code className={`text-xs ${theme.textMuted} font-mono`}>{op.code}</code>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Steps (for Algorithms) */}
                      {item.steps && (
                        <div>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                            <Workflow size={16} className={theme.accent} />
                            Algorithm Steps
                          </h4>
                          <div className={`p-4 rounded-xl ${theme.sectionBg} border ${theme.cardBorder}`}>
                            <ol className="space-y-2">
                              {item.steps.map((step, idx) => (
                                <li key={idx} className={`text-sm ${theme.textMuted} flex gap-3`}>
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.accentBg} ${theme.accent} flex items-center justify-center text-xs font-bold`}>
                                    {idx + 1}
                                  </span>
                                  <span className="pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* Use Cases & Pros/Cons */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Use Cases */}
                        {item.useCases && (
                          <div className={`p-4 rounded-xl ${theme.sectionBg} border ${theme.cardBorder}`}>
                            <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                              <Target size={16} className={theme.accent} />
                              Use Cases
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {item.useCases.map((useCase, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2.5 py-1.5 ${theme.tagBg} ${theme.textMuted} text-xs rounded-lg border ${theme.cardBorder}`}
                                >
                                  {useCase}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pros */}
                        {item.pros && (
                          <div className={`p-4 rounded-xl ${theme.successBg} border`}>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Check size={16} />
                              Pros
                            </h4>
                            <ul className="space-y-1.5">
                              {item.pros.map((pro, idx) => (
                                <li key={idx} className="text-xs flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0"></span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Cons */}
                        {item.cons && (
                          <div className={`p-4 rounded-xl ${theme.errorBg} border`}>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <X size={16} />
                              Cons
                            </h4>
                            <ul className="space-y-1.5">
                              {item.cons.map((con, idx) => (
                                <li key={idx} className="text-xs flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0"></span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Variations / Patterns */}
                      {(item.variations || item.patterns) && (
                        <div>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                            <Layers size={16} className={theme.accent} />
                            {item.variations ? "Variations" : "Patterns"}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(item.variations || item.patterns).map((v, idx) => (
                              <div key={idx} className={`p-3 rounded-xl ${theme.sectionBg} border ${theme.cardBorder}`}>
                                <div className={`text-sm font-medium ${theme.text} mb-1`}>{v.name}</div>
                                <div className={`text-xs ${theme.textMuted}`}>{v.desc || v.examples}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Code Example */}
                      {item.codeExample && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`text-sm font-semibold ${theme.text} flex items-center gap-2`}>
                              <Code2 size={16} className={theme.accent} />
                              Code Example
                            </h4>
                            <div className="flex items-center gap-2">
                              {/* Language Selector */}
                              <div className="flex gap-1">
                                {Object.keys(item.codeExample).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => setSelectedCodeLang(lang)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${selectedCodeLang === lang
                                      ? `${theme.buttonActive} border ${theme.accentBorder}`
                                      : `${theme.button} border border-transparent`
                                      }`}
                                  >
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                  </button>
                                ))}
                              </div>
                              {/* Copy Button */}
                              <button
                                onClick={() => copyCode(item.codeExample[selectedCodeLang] || Object.values(item.codeExample)[0], item.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${theme.button}`}
                              >
                                {copiedCode === item.id ? (
                                  <>
                                    <Check size={14} className="text-emerald-400" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className={`relative rounded-xl overflow-hidden border ${theme.cardBorder}`}>
                            <pre className={`p-4 overflow-x-auto text-sm ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <code className={`${theme.text} font-mono text-xs leading-relaxed`}>
                                {item.codeExample[selectedCodeLang] || Object.values(item.codeExample)[0]}
                              </code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Interview Questions */}
                      {item.interviewQuestions && (
                        <div>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                            <Brain size={16} className={theme.accent} />
                            Common Interview Questions
                          </h4>
                          <div className="grid grid-cols-1 sm: grid-cols-2 lg:grid-cols-3 gap-2">
                            {item.interviewQuestions.map((q, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl ${theme.sectionBg} border ${theme.cardBorder} flex items-center gap-2`}
                              >
                                <span className={`w-5 h-5 rounded-full ${theme.accentBg} ${theme.accent} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                                  {idx + 1}
                                </span>
                                <span className={`text-sm ${theme.textMuted}`}>{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {item.tips && (
                        <div className={`p-4 rounded-xl ${theme.infoBg} border`}>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb size={16} />
                            Pro Tips
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.tips.map((tip, idx) => (
                              <li key={idx} className="text-xs flex items-start gap-2">
                                <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Related Structures */}
                      {item.relatedStructures && (
                        <div>
                          <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                            <Share2 size={16} className={theme.accent} />
                            Related Structures
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.relatedStructures.map((rel, idx) => (
                              <span
                                key={idx}
                                className={`px-3 py-1.5 ${theme.accentBg} ${theme.accent} text-xs rounded-lg border ${theme.accentBorder} font-medium`}
                              >
                                {rel}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Empty State */}
          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <div className={`${theme.textMuted} mb-4`}>
                <Search className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>
                No results found
              </h3>
              <p className={`${theme.textMuted} mb-4`}>
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className={`px-4 py-2 rounded-xl ${theme.button}`}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary Cards */}
        <div className="mt-12 grid grid-cols-1 md: grid-cols-3 gap-6">
          <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30`}>
                <BookOpen className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className={`font-bold ${theme.text}`}>Study Strategy</h3>
                <p className={`text-xs ${theme.textMuted}`}>For last-minute prep</p>
              </div>
            </div>
            <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-emerald-400 mt-0.5" />
                Focus on understanding patterns, not memorizing code
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-emerald-400 mt-0.5" />
                Know time/space complexity of common operations
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-emerald-400 mt-0.5" />
                Practice explaining your approach out loud
              </li>
            </ul>
          </div>

          <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-purple-500/20 border border-purple-500/30`}>
                <Brain className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className={`font-bold ${theme.text}`}>Problem Solving</h3>
                <p className={`text-xs ${theme.textMuted}`}>When stuck on a problem</p>
              </div>
            </div>
            <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-purple-400 mt-0.5" />
                Identify the data structure that fits the constraints
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-purple-400 mt-0.5" />
                Consider brute force first, then optimize
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-purple-400 mt-0.5" />
                Look for patterns:  sliding window, two pointers, DP
              </li>
            </ul>
          </div>

          <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30`}>
                <Zap className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className={`font-bold ${theme.text}`}>Quick Reminders</h3>
                <p className={`text-xs ${theme.textMuted}`}>Key insights</p>
              </div>
            </div>
            <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-cyan-400 mt-0.5" />
                HashMap for O(1) lookup, sacrificing order
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-cyan-400 mt-0.5" />
                Heap for finding k-th largest/smallest efficiently
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-cyan-400 mt-0.5" />
                Stack for matching problems, Queue for BFS
              </li>
            </ul>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className={`mt-8 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6`}>
          <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}>
            <Sparkles className={theme.accent} size={20} />
            Complexity Cheat Sheet
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${theme.cardBorder}`}>
                  <th className={`text-left py-3 px-4 font-semibold ${theme.text}`}>Data Structure</th>
                  <th className={`text-center py-3 px-4 font-semibold ${theme.text}`}>Access</th>
                  <th className={`text-center py-3 px-4 font-semibold ${theme.text}`}>Search</th>
                  <th className={`text-center py-3 px-4 font-semibold ${theme.text}`}>Insert</th>
                  <th className={`text-center py-3 px-4 font-semibold ${theme.text}`}>Delete</th>
                  <th className={`text-center py-3 px-4 font-semibold ${theme.text}`}>Space</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Array", access: "O(1)", search: "O(n)", insert: "O(n)", delete: "O(n)", space: "O(n)" },
                  { name: "Linked List", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)" },
                  { name: "Stack", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)" },
                  { name: "Queue", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)" },
                  { name: "Deque", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)" },
                  { name: "Hash Table", access: "O(1)", search: "O(1)*", insert: "O(1)*", delete: "O(1)*", space: "O(n)" },
                  { name: "Binary Tree", access: "O(n)", search: "O(n)", insert: "O(n)", delete: "O(n)", space: "O(n)" },
                  { name: "BST", access: "O(log n)*", search: "O(log n)*", insert: "O(log n)*", delete: "O(log n)*", space: "O(n)" },
                  { name: "AVL/Red-Black", access: "O(log n)", search: "O(log n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)" },
                  { name: "Heap", access: "O(1)", search: "O(n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)" },
                  { name: "Trie", access: "O(m)", search: "O(m)", insert: "O(m)", delete: "O(m)", space: "O(n×m)" },
                  { name: "Graph (Adj List)", access: "O(1)", search: "O(V+E)", insert: "O(1)", delete: "O(E)", space: "O(V+E)" },
                  { name: "Graph (Adj Matrix)", access: "O(1)", search: "O(V²)", insert: "O(1)", delete: "O(1)", space: "O(V²)" },
                  { name: "Disjoint Set", access: "N/A", search: "O(α(n))", insert: "O(α(n))", delete: "N/A", space: "O(n)" },
                  { name: "Segment Tree", access: "O(log n)", search: "O(log n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)" },
                  { name: "Fenwick Tree", access: "O(log n)", search: "O(log n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)" },
                ].map((row, idx) => (
                  <tr key={idx} className={`border-b ${theme.cardBorder} hover:${theme.sectionBg}`}>
                    <td className={`py-3 px-4 font-medium ${theme.text}`}>{row.name}</td>
                    <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.access)}`}>{row.access}</td>
                    <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.search)}`}>{row.search}</td>
                    <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.insert)}`}>{row.insert}</td>
                    <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.delete)}`}>{row.delete}</td>
                    <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.space)}`}>{row.space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`mt-3 text-xs ${theme.textMuted}`}>
            * Average case. Worst case may differ (e.g., BST degrades to O(n) when unbalanced, Hash Table O(n) with collisions).
            <br />
            <span className="opacity-70">m = string/key length, V = vertices, E = edges, α(n) = inverse Ackermann function (nearly constant).</span>
          </p>
        </div>


      </main>

      {/* Footer */}
      <footer className={`${theme.sectionBg} border-t ${theme.cardBorder} py-8 mt-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className={`${theme.textSubtle} text-xs mt-2`}>
              Bookmark this page for quick reference during your preparation!
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 right-6 p-3 rounded-xl ${theme.cardBg} ${theme.cardBorder} border shadow-lg transition-all duration-300 hover:scale-110 z-40 cursor-pointer`}
        >
          <ChevronUp size={24} className={theme.accent} />
        </button>
      )}
    </div>
  );
};

export default CheatSheet;