import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Code2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  ArrowLeft,
  Filter,
  X,
  Terminal,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./LoadingPage";
import Alert from "./Alert";

const AlgorithmsPage = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const navigate = useNavigate();

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
        // Fallback Mock Data if DB is empty for demo
        setAlgorithms(MOCK_DATA);
      }
    } catch (error) {
      console.error("Error fetching algorithms:", error);
      setAlgorithms(MOCK_DATA); // Fallback
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Data ---
  // Extract unique categories from data
  const categories = [
    "All",
    ...new Set(algorithms.map((item) => item.category)),
  ];

  const filteredAlgorithms = algorithms.filter((algo) => {
    const matchesSearch = algo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || algo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 font-sans selection:bg-blue-500/30 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0e17]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Algorithm Library
              </h1>
              <p className="hidden md:block text-xs text-gray-400">
                Master Data Structures & Logic
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
          >
            <Plus size={18} />
            <span className="hidden md:inline font-medium">Contribute</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar (Categories) */}
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-[#1e1e1e]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${
                    selectedCategory === cat
                      ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{cat}</span>
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
              className="w-full bg-[#1e1e1e]/60 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Algorithm List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAlgorithms.map((algo) => (
                <motion.div
                  key={algo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#1e1e1e]/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                >
                  {/* Card Header (Click to Expand) */}
                  <div
                    onClick={() =>
                      setExpandedAlgo(expandedAlgo === algo.id ? null : algo.id)
                    }
                    className="p-6 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-gradient-to-br ${getGradient(
                          algo.category
                        )} shadow-lg`}
                      >
                        <Code2 size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                          {algo.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                            {algo.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border ${getDifficultyColor(
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
                        className={`text-gray-500 transition-transform duration-300 ${
                          expandedAlgo === algo.id ? "rotate-180" : ""
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
                        className="border-t border-white/5 bg-[#000000]/20"
                      >
                        <div className="p-6 space-y-6">
                          {/* Description */}
                          <div className="text-gray-300 text-sm leading-relaxed">
                            {algo.description}
                          </div>

                          {/* Code Block */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-semibold">
                              <span className="flex items-center gap-2">
                                <Terminal size={14} /> Implementation / Pseudo
                                Code
                              </span>
                              <button className="hover:text-white transition-colors">
                                Copy
                              </button>
                            </div>
                            <div className="bg-[#0d1117] rounded-lg p-4 border border-white/5 overflow-x-auto font-mono text-sm text-blue-300 shadow-inner">
                              <pre>{algo.code}</pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAlgorithms.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="text-gray-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  No algorithms found
                </h3>
                <p className="text-gray-500 mt-2">Try adding one yourself!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* --- ADD ALGORITHM MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1e1e1e] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white">
                Contribute Algorithm
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleAddAlgorithm}
              className="p-6 space-y-5 overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Algorithm Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dijkstra's Algorithm"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    value={newAlgo.title}
                    onChange={(e) =>
                      setNewAlgo({ ...newAlgo, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Category
                  </label>
                  <select
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Difficulty
                  </label>
                  <select
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
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
                  <label className="text-sm font-medium text-gray-400">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O(n log n)"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                    value={newAlgo.timeComplexity}
                    onChange={(e) =>
                      setNewAlgo({ ...newAlgo, timeComplexity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O(1)"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief explanation of how it works..."
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
                  value={newAlgo.description}
                  onChange={(e) =>
                    setNewAlgo({ ...newAlgo, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  Code / Pseudocode
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="function algorithm() { ... }"
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-3 text-blue-300 font-mono text-sm focus:border-blue-500 outline-none resize-none"
                  value={newAlgo.code}
                  onChange={(e) =>
                    setNewAlgo({ ...newAlgo, code: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg transition-all"
                >
                  Submit
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
const getDifficultyColor = (level) => {
  switch (level) {
    case "Easy":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "Medium":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "Hard":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

const getGradient = (category) => {
  // Random visual flair based on category string
  if (category === "Graph") return "from-purple-500 to-pink-600";
  if (category === "Sorting") return "from-blue-500 to-cyan-600";
  if (category === "DP") return "from-orange-500 to-red-600";
  return "from-blue-600 to-indigo-600";
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
