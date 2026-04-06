import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../core/context/ThemeContext";
import {
  Search,
  Plus,
  Code2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  ArrowLeft,
  X,
  Terminal,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Alert from "../../components/Alert";
import { algorithms as algorithmsData } from "../../core/constants/algorithmsData";
import { algorithmComparisonTables } from "../../core/constants/algorithmComparisonTables";

const AlgorithmsPage = () => {
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // --- State ---
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedAlgo, setExpandedAlgo] = useState(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlgo, setNewAlgo] = useState({
    title: "",
    category: "Array", // Default
    difficulty: "Medium",
    timeComplexity: "",
    spaceComplexity: "",
    description: "",
    code: "",
  });

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  // --- Fetch Data ---
  useEffect(() => {
    fetchAlgorithms();
  }, []);

  const fetchAlgorithms = async () => {
    try {
      // Replace with your actual endpoint
      const response = await axios.get(`${API_BASE_URL}/code/algorithms`);
      if (response.data.success) {
        setAlgorithms(response.data.algorithms);
      } else {
        // Fallback to extracted local data or demo mock
        const normalized = algorithmsData.map(normalizeAlgorithm);
        setAlgorithms(normalized.length ? normalized : MOCK_DATA);
      }
    } catch (error) {
      console.error("Error fetching algorithms:", error);
      const normalized = algorithmsData.map(normalizeAlgorithm);
      setAlgorithms(normalized.length ? normalized : MOCK_DATA); // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Normalize external data shape (from src/data/algorithmsData.js) to the shape used by this page
  const normalizeAlgorithm = (item) => {
    return {
      id: item.id || item.name || Date.now(),
      title: item.name || item.title || "Untitled",
      icon: item.icon || Code2,
      category:
        (item.category &&
          (typeof item.category === "string"
            ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
            : item.category)) ||
        "Other",
      difficulty: item.difficulty || "Medium",
      timeComplexity:
        (item.timeComplexity &&
          (typeof item.timeComplexity === "string"
            ? item.timeComplexity
            : item.timeComplexity.avg || item.timeComplexity.best || "")) ||
        "",
      spaceComplexity:
        (item.spaceComplexity &&
          (typeof item.spaceComplexity === "string"
            ? item.spaceComplexity
            : item.spaceComplexity.auxiliary ||
            item.spaceComplexity.iterative ||
            item.spaceComplexity.recursive ||
            item.spaceComplexity.queue ||
            item.spaceComplexity.inPlace ||
            item.spaceComplexity.typical ||
            item.spaceComplexity["dist + heap"] ||
            Object.values(item.spaceComplexity)[0] || "")) ||
        "",
      description: item.description || item.detailedDescription || "",
      detailedDescription: item.detailedDescription || "",
      steps: item.steps || [],
      prerequisites: item.prerequisites || [],
      tips: item.tips || [],
      variations: item.variations || [],
      interviewQuestions: item.interviewQuestions || [],
      codeExamples: item.codeExample || null,
      code:
        (item.codeExample && (item.codeExample.javascript || item.codeExample.js)) ||
        item.code ||
        "// No implementation available",
    };
  };

  // --- Derived Data ---
  // Extract unique categories from data
  const categories = [
    "All",
    ...new Set(algorithms.map((item) => item.category)),
  ];

  const categoryCounts = algorithms.reduce((acc, algo) => {
    const cat = algo.category;
    acc[cat] = (acc[cat] || 0) + 1;
    acc["All"] = (acc["All"] || 0) + 1;
    return acc;
  }, { "All": 0 });

  const filteredAlgorithms = algorithms.filter((algo) => {
    const matchesSearch = algo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || algo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Ordering rule:
  // - In "All": group by category order (same as sidebar), then by difficulty.
  // - In a specific category: sort by difficulty.
  // Note: this does not mutate the source data.
  const categoryOrder = useMemo(
    () => categories.filter((c) => c !== "All"),
    [categories]
  );

  const sortedAlgorithms = useMemo(() => {
    const difficultyRank = (difficulty) => {
      switch (difficulty) {
        case "Easy":
          return 0;
        case "Medium":
          return 1;
        case "Hard":
          return 2;
        default:
          return 99;
      }
    };

    const categoryRank = (category) => {
      const idx = categoryOrder.indexOf(category);
      return idx === -1 ? categoryOrder.length + 99 : idx;
    };

    return filteredAlgorithms
      .map((algo, originalIndex) => ({ algo, originalIndex }))
      .sort((a, b) => {
        if (selectedCategory === "All") {
          const byCategory = categoryRank(a.algo.category) - categoryRank(b.algo.category);
          if (byCategory !== 0) return byCategory;
        }

        const byDifficulty =
          difficultyRank(a.algo.difficulty) - difficultyRank(b.algo.difficulty);
        if (byDifficulty !== 0) return byDifficulty;

        const byTitle = (a.algo.title || "").localeCompare(b.algo.title || "");
        if (byTitle !== 0) return byTitle;

        return a.originalIndex - b.originalIndex;
      })
      .map(({ algo }) => algo);
  }, [filteredAlgorithms, selectedCategory, categoryOrder]);

  // --- Handlers ---
  const handleAddAlgorithm = async (e) => {
    e.preventDefault();
    try {
      // Replace with your create endpoint
      const response = await axios.post(`${API_BASE_URL}/code/create`, newAlgo);

      if (response.status === 201 || response.data.success) {
        setAlgorithms([
          response.data.algorithm || { ...newAlgo, id: Date.now() },
          ...algorithms,
        ]);
        setShowAddModal(false);
        setNewAlgo({
          title: "",
          category: "Array",
          difficulty: "Medium",
          timeComplexity: "",
          spaceComplexity: "",
          description: "",
          code: "",
        });
        setAlertConfig({
          isOpen: true,
          message: "Algorithm added successfully!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error adding algorithm", error);
      // Demo fallback
      setAlgorithms([{ ...newAlgo, id: Date.now() }, ...algorithms]);
      setShowAddModal(false);
      setAlertConfig({
        isOpen: true,
        message: "Added (Demo Mode)",
        type: "success",
      });
    }
  };

  const closeAlert = () =>
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));

  // --- Render ---
  if (loading) return <LoadingPage />;

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-200 ${isDark ? "bg-[#0b0b0d] text-gray-100" : "bg-gray-50 text-gray-900"}`}>

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 ${isDark ? "bg-[#0a0e17]/80 border-white/5" : "bg-white/80 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${isDark ? "hover:bg-white/5 text-gray-300 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"}`}
              title="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Algorithm Library
              </h1>
              <p className={`hidden md:block text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Master Data Structures & Logic
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Add a new algorithm"
          >
            <Plus size={18} />
            <span className="hidden md:inline font-medium">Contribute</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar (Categories) - Sticky */}
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <div className={`lg:sticky lg:top-24 backdrop-blur-md border rounded-2xl p-6 transition-colors duration-200 ${isDark ? "bg-[#1e1e1e]/60 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group cursor-pointer ${selectedCategory === cat
                    ? isDark ? "bg-blue-600/20 text-blue-400 border border-blue-600/30" : "bg-blue-50 text-blue-600 border border-blue-200"
                    : isDark ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  title={`Filter by ${cat} algorithms`}
                >
                  <span>
                    {cat}
                    <span className="ml-2 opacity-50 text-xs">({categoryCounts[cat] || 0})</span>
                  </span>
                  {selectedCategory === cat && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search algorithms (e.g. 'Binary Search', 'DFS')..."
              className={`w-full rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 transition-all ${isDark ? "bg-[#1e1e1e]/60 border border-white/10 text-gray-200 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder-gray-600" : "bg-white border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 placeholder-gray-400 shadow-sm"}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Per-category comparison table (shown only when a single category is selected) */}
          {selectedCategory !== "All" && (() => {
            const comparisonKey = selectedCategory
              .toLowerCase()
              .replace(/\s+/g, "-");
            const rows = algorithmComparisonTables[comparisonKey] || [];
            if (!rows.length) return null;
            return (
              <div className={`border rounded-2xl p-6 ${isDark ? "bg-[#1e1e1e]/60 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  <span className={`px-2 py-1 rounded-lg text-xs uppercase tracking-wide ${isDark ? "bg-white/5 border border-white/10 text-gray-300" : "bg-gray-100 border border-gray-200 text-gray-600"}`}>
                    {formatCategoryTitle(comparisonKey)}
                  </span>
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Comparison</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className={`border-b ${isDark ? "border-white/10 text-gray-300" : "border-gray-200 text-gray-600"}`}>
                        <th className="py-3 px-4 font-semibold">Algorithm</th>
                        <th className="py-3 px-4 font-semibold text-center">Best</th>
                        <th className="py-3 px-4 font-semibold text-center">Average</th>
                        <th className="py-3 px-4 font-semibold text-center">Worst</th>
                        <th className="py-3 px-4 font-semibold text-center">Space</th>
                        <th className="py-3 px-4 font-semibold text-center">Stable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={idx} className={`border-b transition-colors ${isDark ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}>
                          <td className={`py-3 px-4 font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>{row.name}</td>
                          <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.best)}`}>
                            {row.best || ""}
                          </td>
                          <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.avg)}`}>
                            {row.avg || ""}
                          </td>
                          <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.worst)}`}>
                            {row.worst || ""}
                          </td>
                          <td className={`py-3 px-4 text-center font-mono ${getComplexityColor(row.space)}`}>
                            {row.space || ""}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-300">{row.stable || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Algorithm List */}
          <div className="space-y-4">
            <AnimatePresence>
              {sortedAlgorithms.map((algo) => (
                <motion.div
                  key={algo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`border rounded-xl overflow-hidden transition-colors ${isDark ? "bg-[#141417] border-white/6" : "bg-white border-gray-200 shadow-sm hover:shadow-md"}`}
                >
                  {/* Card Header (Click to Expand) */}
                  <div
                    onClick={() =>
                      setExpandedAlgo(expandedAlgo === algo.id ? null : algo.id)
                    }
                    className="p-6 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                        <algo.icon size={24} className={isDark ? "text-white" : "text-gray-700"} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold transition-colors ${isDark ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"}`}>
                          {algo.title}
                        </h3>
                        <div className={`flex items-center gap-3 text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          <span className={`px-2 py-0.5 rounded-full border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
                            {algo.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border ${getDifficultyColor(
                              isDark,
                              algo.difficulty
                            )}`}
                          >
                            {algo.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {algo.timeComplexity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Database size={12} /> {algo.spaceComplexity}
                        </span>
                      </div>
                      <ChevronDown
                        className={`text-gray-500 transition-transform duration-300 ${expandedAlgo === algo.id ? "rotate-180" : ""
                          }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedAlgo === algo.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`border-t ${isDark ? "border-white/5 bg-[#000000]/20" : "border-gray-200 bg-gray-50/50"}`}
                      >
                        <div className="p-6 space-y-6">
                          {/* Description */}
                          <div className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {algo.description}
                          </div>

                          {algo.detailedDescription && (
                            <div className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              {algo.detailedDescription}
                            </div>
                          )}

                          {algo.prerequisites && algo.prerequisites.length > 0 && (
                            <div>
                              <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-900"}`}>Prerequisites</h4>
                              <div className="flex flex-wrap gap-2">
                                {algo.prerequisites.map((p, i) => (
                                  <span key={i} className={`px-3 py-1 rounded-full text-xs border ${isDark ? "bg-white/5 border-white/6 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>{p}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {algo.steps && algo.steps.length > 0 && (
                            <div>
                              <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-900"}`}>Steps</h4>
                              <ol className={`list-decimal pl-6 space-y-1 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {algo.steps.map((s, idx) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Code Block */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-semibold">
                              <span className="flex items-center gap-2">
                                <Terminal size={14} /> Implementation / Pseudo
                                Code
                              </span>
                              <button
                                className="hover:text-white transition-colors cursor-pointer"
                                title="Copy code to clipboard"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(algo.code);
                                }}
                              >
                                Copy
                              </button>
                            </div>
                            <div className={`rounded-lg p-4 border overflow-x-auto font-mono text-sm shadow-inner ${isDark ? "bg-[#0d1117] border-white/5 text-blue-300" : "bg-gray-50 border-gray-200 text-blue-700"}`}>
                              <pre>{algo.code}</pre>
                            </div>
                          </div>

                          {algo.tips && algo.tips.length > 0 && (
                            <div>
                              <h4 className={`text-sm font-semibold mt-4 mb-2 ${isDark ? "text-gray-300" : "text-gray-900"}`}>Pro Tips</h4>
                              <ul className={`list-disc pl-6 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {algo.tips.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {algo.variations && algo.variations.length > 0 && (
                            <div>
                              <h4 className={`text-sm font-semibold mt-4 mb-2 ${isDark ? "text-gray-300" : "text-gray-900"}`}>Variations</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {algo.variations.map((v, i) => (
                                  <div key={i} className={`p-3 rounded-md border text-sm ${isDark ? "bg-white/2 border-white/6 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
                                    <div className="font-medium">{v.name}</div>
                                    {v.desc && <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{v.desc}</div>}
                                    {v.examples && <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{v.examples}</div>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {sortedAlgorithms.length === 0 && (
              <div className="text-center py-20">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                  <Cpu className={isDark ? "text-gray-600" : "text-gray-400"} size={32} />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  No algorithms found
                </h3>
                <p className={`mt-2 ${isDark ? "text-gray-500" : "text-gray-600"}`}>Try adding one yourself!</p>
              </div>
            )}
          </div>

        </section>
      </main>

      {/* --- ADD ALGORITHM MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0f0f11] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Contribute Algorithm
                </h2>
                <p className="text-xs text-gray-500 mt-1">Share your knowledge with the community</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleAddAlgorithm}
              className="p-6 space-y-6 overflow-y-auto custom-scrollbar"
            >
              {/* Name & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Algorithm Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Binary Search"
                    className="w-full bg-[#1a1a1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    value={newAlgo.title}
                    onChange={(e) =>
                      setNewAlgo({ ...newAlgo, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Category *
                  </label>
                  <select
                    className="w-full bg-[#1a1a1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    value={newAlgo.category}
                    onChange={(e) =>
                      setNewAlgo({ ...newAlgo, category: e.target.value })
                    }
                  >
                    <option value="Array">Array</option>
                    <option value="String">String</option>
                    <option value="Sorting">Sorting</option>
                    <option value="Searching">Searching</option>
                    <option value="Graph">Graph</option>
                    <option value="DP">Dynamic Programming</option>
                    <option value="Tree">Tree</option>
                  </select>
                </div>
              </div>

              {/* Difficulty & Complexities Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Difficulty *
                  </label>
                  <select
                    className="w-full bg-[#1a1a1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    value={newAlgo.difficulty}
                    onChange={(e) =>
                      setNewAlgo({ ...newAlgo, difficulty: e.target.value })
                    }
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O(n log n)"
                    className="w-full bg-[#1a1a1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    value={newAlgo.timeComplexity}
                    onChange={(e) =>
                      setNewAlgo({ ...newAlgo, timeComplexity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O(1)"
                    className="w-full bg-[#1a1a1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    value={newAlgo.spaceComplexity}
                    onChange={(e) =>
                      setNewAlgo({
                        ...newAlgo,
                        spaceComplexity: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief explanation of how the algorithm works..."
                  className="w-full bg-[#1a1a1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-none transition-all"
                  value={newAlgo.description}
                  onChange={(e) =>
                    setNewAlgo({ ...newAlgo, description: e.target.value })
                  }
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Implementation / Pseudocode *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="function algorithm() {&#10;  // Your implementation here&#10;}"
                  className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-3 text-sm text-blue-300 placeholder-gray-700 font-mono focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-none transition-all"
                  value={newAlgo.code}
                  onChange={(e) =>
                    setNewAlgo({ ...newAlgo, code: e.target.value })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Cancel and close"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm cursor-pointer"
                  title="Submit your algorithm contribution"
                >
                  Submit Algorithm
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </div>
  );
};

// --- Helpers ---
const getDifficultyColor = (isDark, level) => {
  // Use a neutral, low-contrast style for all difficulty badges
  return isDark ? "bg-white/5 text-gray-200 border-white/10" : "bg-gray-100 text-gray-700 border-gray-200";
};

const getGradient = (category) => {
  // Simplified neutral color token — kept for backward compatibility
  return "bg-gray-700";
};

const formatCategoryTitle = (cat) => {
  if (!cat) return "";
  const title = cat.replace(/-/g, " ");
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const getComplexityColor = (complexity) => {
  if (!complexity || complexity === "_") return "text-gray-500";
  const comp = complexity.toLowerCase();

  // Exponential and factorial - worst complexity
  if (comp.includes("2^n") || comp.includes("n!") || comp.includes("exponential")) return "text-rose-400";

  // Cubic and higher polynomials
  if (comp.includes("n³") || comp.includes("n^3") || comp.includes("v³")) return "text-red-500";

  // Quadratic
  if (comp.includes("n²") || comp.includes("n^2") || comp.includes("v²") || comp.includes("n*m")) return "text-orange-400";

  // Linearithmic
  if (comp.includes("n log n") || comp.includes("e log")) return "text-yellow-400";

  // Linear
  if (comp.includes("v + e") || comp.includes("ve") || (comp.includes("n)") && !comp.includes("log"))) return "text-blue-400";

  // Logarithmic
  if (comp.includes("log")) return "text-green-400";

  // Constant
  if (comp.includes("1)")) return "text-emerald-400";

  return "text-gray-400";
};

// --- Mock Data for Demo ---
const MOCK_DATA = [
  {
    id: 1,
    title: "Bubble Sort",
    category: "Sorting",
    difficulty: "Easy",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description:
      "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    code: `function bubbleSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}`,
  },
  {
    id: 2,
    title: "Binary Search",
    category: "Searching",
    difficulty: "Easy",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    description:
      "Search a sorted array by repeatedly dividing the search interval in half.",
    code: `function binarySearch(arr, x) {\n  let start = 0, end = arr.length - 1;\n  while (start <= end) {\n    let mid = Math.floor((start + end) / 2);\n    if (arr[mid] === x) return true;\n    else if (arr[mid] < x) start = mid + 1;\n    else end = mid - 1;\n  }\n  return false;\n}`,
  },
  {
    id: 3,
    title: "Depth First Search (DFS)",
    category: "Graph",
    difficulty: "Medium",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    description:
      "Traverse a graph structure starting from a root node and exploring as far as possible along each branch before backtracking.",
    code: `function dfs(graph, start, visited = new Set()) {\n  console.log(start);\n  visited.add(start);\n  for (const neighbor of graph[start]) {\n    if (!visited.has(neighbor)) {\n      dfs(graph, neighbor, visited);\n    }\n  }\n}`,
  },
];

export default AlgorithmsPage;
