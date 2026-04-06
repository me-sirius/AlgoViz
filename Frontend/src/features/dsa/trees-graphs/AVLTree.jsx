import React, { useState, useEffect, useRef } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Settings,
  BarChart3,
  Code2,
  Activity,
  Target,
  Clock,
  Maximize2,
  ArrowLeft,
  ArrowLeftRight,
  AlertTriangle,
  Sparkles,
  Plus,
  GitBranch,
  Rewind,
  Zap,
  ChevronDown,
  Info,
  Layers,
  XIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import cytoscape from "../../../core/utils/cytoscapeSetup.js";
import Alert from "../../../components/Alert.jsx";
import BasicCodeDisplay from "../../../components/BasicCodeDisplay.jsx";
import { useTheme } from "../../../core/context/ThemeContext";
import { avlTree as avlTreeCode } from "../../../core/constants/codeExamples.js";

// AVL Tree Node class
class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
  }
}

// AVL Tree class with visualization support
class AVLTreeClass {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  rotateLeft(y) {
    const x = y.right;
    const T2 = x.left;
    x.left = y;
    y.right = T2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  rotateRight(x) {
    const y = x.left;
    const T2 = y.right;
    y.right = x;
    x.left = T2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  insert(node, value, steps) {
    if (!node) {
      const newNode = new AVLNode(value);
      steps.push({
        type: "insert",
        value,
        description: `Created new node with value ${value}`,
        tree: this.cloneTree(this.root),
        highlighting: [value],
        action: "create",
        lineNumber: 27,
      });
      return newNode;
    }

    if (value < node.value) {
      steps.push({
        type: "insert",
        value,
        description: `${value} < ${node.value}, going left`,
        tree: this.cloneTree(this.root),
        highlighting: [node.value],
        action: "compare",
        lineNumber: 29,
      });
      node.left = this.insert(node.left, value, steps);
    } else if (value > node.value) {
      steps.push({
        type: "insert",
        value,
        description: `${value} > ${node.value}, going right`,
        tree: this.cloneTree(this.root),
        highlighting: [node.value],
        action: "compare",
        lineNumber: 31,
      });
      node.right = this.insert(node.right, value, steps);
    } else {
      return node;
    }

    this.updateHeight(node);
    const balance = this.getBalance(node);

    steps.push({
      type: "insert",
      value,
      description: `Node ${node.value}: height=${node.height}, balance=${balance}`,
      tree: this.cloneTree(this.root),
      highlighting: [node.value],
      action: "balance_check",
      lineNumber: 36,
    });

    // Left-Left Case
    if (balance > 1 && value < node.left.value) {
      steps.push({
        type: "insert",
        value,
        description: `Left-Left imbalance at ${node.value}, performing right rotation`,
        tree: this.cloneTree(this.root),
        highlighting: [node.value],
        action: "rotate_right",
        lineNumber: 39,
      });
      return this.rotateRight(node);
    }

    // Right-Right Case
    if (balance < -1 && value > node.right.value) {
      steps.push({
        type: "insert",
        value,
        description: `Right-Right imbalance at ${node.value}, performing left rotation`,
        tree: this.cloneTree(this.root),
        highlighting: [node.value],
        action: "rotate_left",
        lineNumber: 43,
      });
      return this.rotateLeft(node);
    }

    // Left-Right Case
    if (balance > 1 && value > node.left.value) {
      steps.push({
        type: "insert",
        value,
        description: `Left-Right imbalance at ${node.value}, performing left-right rotation`,
        tree: this.cloneTree(this.root),
        highlighting: [node.value],
        action: "rotate_left_right",
        lineNumber: 47,
      });
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right-Left Case
    if (balance < -1 && value < node.right.value) {
      steps.push({
        type: "insert",
        value,
        description: `Right-Left imbalance at ${node.value}, performing right-left rotation`,
        tree: this.cloneTree(this.root),
        highlighting: [node.value],
        action: "rotate_right_left",
        lineNumber: 52,
      });
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  insertValue(value) {
    const steps = [];
    steps.push({
      type: "insert",
      value,
      description: `Starting insertion of ${value}`,
      tree: this.cloneTree(this.root),
      highlighting: [],
      action: "start",
      lineNumber: 26,
    });

    this.root = this.insert(this.root, value, steps);

    steps.push({
      type: "insert",
      value,
      description: `Successfully inserted ${value}`,
      tree: this.cloneTree(this.root),
      highlighting: [value],
      action: "complete",
      lineNumber: 55,
    });

    return steps;
  }

  cloneTree(node) {
    if (!node) return null;
    const cloned = new AVLNode(node.value);
    cloned.height = node.height;
    cloned.left = this.cloneTree(node.left);
    cloned.right = this.cloneTree(node.right);
    return cloned;
  }

  calculatePositions(node, x = 0, y = 50, level = 0, offset = 180) {
    if (!node) return;

    node.x = x;
    node.y = y;

    const nextOffset = offset / 1.8;
    if (node.left) {
      this.calculatePositions(node.left, x - offset, y + 100, level + 1, nextOffset);
    }
    if (node.right) {
      this.calculatePositions(node.right, x + offset, y + 100, level + 1, nextOffset);
    }
  }
}

const AVLTree = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Cytoscape refs
  const cyRef = useRef(null);
  const mobileCyRef = useRef(null);
  const cyInstance = useRef(null);

  // Tree state
  const [avlTree] = useState(() => new AVLTreeClass());
  const [insertValue, setInsertValue] = useState("");
  const [deleteValue, setDeleteValue] = useState(""); // Placeholder for future delete

  // Visual options
  const [showNodeDetails, setShowNodeDetails] = useState(true);

  // Quick Insert - dynamic values that regenerate
  const generateQuickValues = () => {
    const values = [];
    while (values.length < 6) {
      const num = Math.floor(Math.random() * 90) + 10; // 10-99
      if (!values.includes(num)) values.push(num);
    }
    return values.sort((a, b) => a - b);
  };
  const [quickInsertValues, setQuickInsertValues] = useState(() => generateQuickValues());
  const [insertedValues, setInsertedValues] = useState(new Set());

  const handleQuickInsert = (value) => {
    if (playing) return;

    const newSteps = avlTree.insertValue(value);
    const startingIndex = steps.length;

    setSteps(prev => [...prev, ...newSteps]);
    setCurrentStep(startingIndex);
    setStarted(true);
    setPlaying(true);

    // Track inserted value
    const newInserted = new Set(insertedValues);
    newInserted.add(value);
    setInsertedValues(newInserted);

    // Regenerate if all values used
    if (newInserted.size >= quickInsertValues.length) {
      setTimeout(() => {
        setQuickInsertValues(generateQuickValues());
        setInsertedValues(new Set());
      }, 500);
    }
  };

  // Animation state
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [speed, setSpeed] = useState(800);

  // UI state
  const [activeRightTab, setActiveRightTab] = useState("stats");
  const [currentHighlightedLine, setCurrentHighlightedLine] = useState(null);
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [mobileAccordions, setMobileAccordions] = useState({
    settings: false,
    stats: true,
    info: false,
    complexity: false,
  });

  // Track viewport for Cytoscape container switching
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        // Destroy existing instance so it recreates for new container
        if (cyInstance.current) {
          cyInstance.current.destroy();
          cyInstance.current = null;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "error",
    customButtons: null,
  });

  const handleBack = () => {
    setAlertConfig({
      isOpen: true,
      message: "Are you sure you want to leave? Your progress will be lost.",
      type: "warning",
      customButtons: (
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:scale-105 shadow-lg transition-all duration-300"
          >
            Leave
          </button>
          <button
            onClick={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:scale-105 shadow-lg transition-all duration-300"
          >
            Stay
          </button>
        </div>
      ),
    });
  };

  const runSequence = (sequence) => {
    handleReset();
    setTimeout(() => {
      avlTree.root = null;
      let allSteps = [];

      sequence.forEach(val => {
        const newSteps = avlTree.insertValue(val);
        allSteps = [...allSteps, ...newSteps];
      });

      setSteps(allSteps);
      setCurrentStep(0);
      setStarted(true);
      setPlaying(true);
    }, 50);
  };

  const handleInsert = () => {
    const value = parseInt(insertValue);
    if (isNaN(value)) return;

    const newSteps = avlTree.insertValue(value);

    // Append new steps to existing history
    // Capture the starting index for the new animation
    const startingIndex = steps.length;

    setSteps(prev => [...prev, ...newSteps]);
    setCurrentStep(startingIndex);
    setStarted(true);
    setPlaying(true);
    setInsertValue("");
  };

  const handleReset = () => {
    avlTree.root = null;
    setSteps([]);
    setCurrentStep(0);
    setPlaying(false);
    setStarted(false);
    setCurrentHighlightedLine(null);
    // Reset quick insert tracking
    setInsertedValues(new Set());
    setQuickInsertValues(generateQuickValues());
    if (cyInstance.current) {
      cyInstance.current.destroy();
      cyInstance.current = null;
    }
  };

  // Helper: Get In-Order Traversal
  const getInOrder = (node) => {
    const result = [];
    const traverse = (n) => {
      if (!n) return;
      traverse(n.left);
      result.push(n.value);
      traverse(n.right);
    };
    traverse(node);
    return result;
  };

  // Auto-play effect
  useEffect(() => {
    let interval;
    if (playing && started) {
      // Check if animation is complete
      if (currentStep >= steps.length - 1) {
        setPlaying(false);
      } else {
        interval = setInterval(() => {
          setCurrentStep((prev) => prev + 1);
        }, speed);
      }
    }
    return () => clearInterval(interval);
  }, [playing, started, currentStep, steps.length, speed]);

  // Update highlighted line based on current step
  useEffect(() => {
    if (steps[currentStep]?.lineNumber) {
      setCurrentHighlightedLine(steps[currentStep].lineNumber);
    }
  }, [currentStep, steps]);

  const currentStepData = steps[currentStep] || {
    tree: avlTree.root,
    highlighting: [],
    description: "AVL Tree - Ready to Insert",
    action: "ready",
  };

  // Calculate positions for current tree
  useEffect(() => {
    if (currentStepData.tree) {
      avlTree.calculatePositions(currentStepData.tree);
    }
  }, [currentStepData.tree, avlTree]);

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    return Math.round(((currentStep + 1) / steps.length) * 100);
  };

  // --- CYTOSCAPE LOGIC ---

  // Generate Cytoscape elements from tree
  const generateElements = (root) => {
    // If no root, return empty arrays (clears graph)
    if (!root) return [];

    const elements = [];
    const traverse = (node) => {
      // Determine node classes
      const isHighlighted = currentStepData.highlighting.includes(node.value);
      const balance = avlTree.getBalance(node);
      const isUnbalanced = Math.abs(balance) > 1;

      const classes = [];
      if (isHighlighted) classes.push("highlighted");
      if (isUnbalanced) classes.push("unbalanced");

      // Label with details if enabled
      let label = node.value.toString();
      if (showNodeDetails) {
        label += `\n(h:${node.height}, b:${balance})`;
      }

      // Add Node
      elements.push({
        data: {
          id: node.value.toString(),
          label: label,
          balance: balance,
          height: node.height
        },
        position: { x: node.x, y: node.y },
        classes: classes.join(" ")
      });

      // Add Edges
      if (node.left) {
        elements.push({
          data: { source: node.value.toString(), target: node.left.value.toString() },
          classes: "left-edge"
        });
        traverse(node.left);
      }
      if (node.right) {
        elements.push({
          data: { source: node.value.toString(), target: node.right.value.toString() },
          classes: "right-edge"
        });
        traverse(node.right);
      }
    };

    traverse(root);
    return elements;
  };

  // Initialize/Update Cytoscape
  useEffect(() => {
    const container = isMobile ? mobileCyRef.current : cyRef.current;
    if (!container) return;

    // Helper to get fresh style sheet based on current theme
    const getStylesheet = () => [
      {
        selector: "node",
        style: {
          "background-color": theme === "dark" ? "#1e293b" : "#ffffff",
          "border-color": theme === "dark" ? "#94a3b8" : "#64748b",
          "border-width": 2,
          label: "data(label)",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
          "font-weight": "bold",
          "text-valign": "center",
          "text-halign": "center",
          width: showNodeDetails ? 60 : 45,
          height: showNodeDetails ? 60 : 45,
          "font-size": showNodeDetails ? 11 : 14,
          "text-wrap": "wrap",
          "text-max-width": 80,
          "transition-property": "background-color, border-color, width, height",
          "transition-duration": "300ms"
        }
      },
      {
        selector: "node.highlighted",
        style: {
          "background-color": "#eab308",
          "border-color": "#facc15",
          color: "#ffffff"
        }
      },
      {
        selector: "node.unbalanced",
        style: {
          "background-color": "#ef4444",
          "border-color": "#f87171",
          color: "#ffffff",
          shape: "diamond",
          width: 70,
          height: 70
        }
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": theme === "dark" ? "#475569" : "#cbd5e1",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier"
        }
      },
      {
        selector: ".left-edge",
        style: {
          "line-color": "#3b82f6",
          "target-arrow-color": "#3b82f6"
        }
      },
      {
        selector: ".right-edge",
        style: {
          "line-color": "#a855f7",
          "target-arrow-color": "#a855f7"
        }
      }
    ];

    const elements = generateElements(currentStepData.tree);

    if (cyInstance.current) {
      // Robust Update
      cyInstance.current.batch(() => {
        cyInstance.current.elements().remove();
        if (elements.length > 0) {
          cyInstance.current.add(elements);
        }
      });
      cyInstance.current.style(getStylesheet());
      if (elements.length > 0) {
        cyInstance.current.layout({ name: 'preset', animate: false }).run();
        cyInstance.current.fit(undefined, 50);
      }
    } else {
      // Create new instance
      cyInstance.current = cytoscape({
        container: container,
        elements: elements,
        style: getStylesheet(),
        layout: { name: "preset" },
        minZoom: 0.5,
        maxZoom: 2.0,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        wheelSensitivity: 0.3
      });
      cyInstance.current.fit(undefined, 50);
    }
  }, [currentStepData, theme, steps, showNodeDetails, isMobile]);

  const mobileStats = [
    {
      value: currentStepData.tree ? avlTree.getHeight(currentStepData.tree) : 0,
      label: "Height",
      colorClass: theme === "dark" ? "text-cyan-400" : "text-cyan-600",
    },
    {
      value: currentStepData.tree ? avlTree.getBalance(currentStepData.tree) : 0,
      label: "Balance",
      colorClass: theme === "dark" ? "text-purple-400" : "text-purple-600",
    },
    {
      value: steps.length,
      label: "Steps",
      colorClass: theme === "dark" ? "text-amber-400" : "text-amber-600",
    },
    {
      value: `${getProgressPercentage()}%`,
      label: "Progress",
      colorClass: theme === "dark" ? "text-green-400" : "text-green-600",
    },
  ];

  // Custom inline components
  const TabButton = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all duration-300 ${activeTab === id
        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105"
        : theme === "dark"
          ? "bg-white/5 text-slate-300 hover:bg-white/10"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const StatCard = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
      green: theme === "dark" ? "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400" : "from-green-50 to-emerald-50 border-green-200 text-green-600",
      cyan: theme === "dark" ? "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400" : "from-cyan-50 to-blue-50 border-cyan-200 text-cyan-600",
      amber: theme === "dark" ? "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400" : "from-amber-50 to-yellow-50 border-amber-200 text-amber-600",
      red: theme === "dark" ? "from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400" : "from-red-50 to-pink-50 border-red-200 text-red-600",
      purple: theme === "dark" ? "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400" : "from-purple-50 to-fuchsia-50 border-purple-200 text-purple-600",
    };

    return (
      <div className={`rounded-xl p-4 border bg-gradient-to-br ${colorClasses[color] || colorClasses.cyan}`}>
        <div className="flex items-center justify-between">
          <Icon size={20} className="opacity-70" />
          <div className="text-right">
            <div className="text-2xl font-black">{value}</div>
            <div className={`text-xs font-bold uppercase ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
              {label}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ControlButton = ({ onClick, disabled, icon: Icon, label, variant = "primary" }) => {
    const variantClasses = {
      success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
      primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
      danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 ${disabled
          ? theme === "dark"
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          : `${variantClasses[variant]} cursor-pointer hover:scale-105`
          }`}
      >
        <Icon size={16} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${theme === "dark" ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className={`flex-shrink-0 z-40 border-b backdrop-blur-xl ${theme === "dark" ? "bg-slate-900/80 border-white/10" : "bg-white/80 border-gray-200"}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleBack}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg`}>
                <GitBranch size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black">AVL Tree</h1>
                <p className={`text-xs sm:text-sm font-semibold ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                  Self-balancing BST • O(log n)
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCodeDrawer(true)}
            className="lg:hidden p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
          >
            <Code2 size={18} />
          </button>
        </div>

        {/* Mobile Stats Bar */}
        <div className="lg:hidden px-4 pb-3">
          <div className="grid grid-cols-4 gap-2">
            {mobileStats.map((stat, idx) => (
              <div key={idx} className={`text-center rounded-lg p-2 ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`}>
                <div className={`text-lg font-black ${stat.colorClass}`}>{stat.value}</div>
                <div className={`text-[10px] font-bold uppercase ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop 3-Panel Layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Configuration */}
          <Panel defaultSize={22} minSize={18} maxSize={35}>
            <div className={`h-full border-r flex flex-col ${theme === "dark" ? "bg-slate-900/50 backdrop-blur-xl border-white/10" : "bg-white border-gray-200"}`}>
              <div className={`p-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  <Settings size={16} />
                  Configuration
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* View Options */}
                <div>
                  <h3 className={`text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                    View Options
                  </h3>
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <span className={`text-sm font-semibold ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                      Node Details (H/B)
                    </span>
                    <button
                      onClick={() => setShowNodeDetails(!showNodeDetails)}
                      className={`w-12 h-6 rounded-full transition-colors duration-300 relative cursor-pointer ${showNodeDetails ? "bg-cyan-500" : "bg-gray-400"}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showNodeDetails ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>

                {/* Insert Value */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                    Insert Value
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={insertValue}
                      onChange={(e) => setInsertValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                      placeholder="Number..."
                      className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 focus:ring-2 ${theme === "dark" ? "bg-white/10 border border-white/20 text-white focus:ring-cyan-500/40 focus:border-cyan-500" : "bg-gray-100 border border-gray-200 text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"}`}
                    />
                    <button
                      onClick={handleInsert}
                      disabled={!insertValue || playing}
                      className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${!insertValue || playing ? (theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed") : "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 text-white shadow-lg"}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Quick Insert */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                    Quick Insert
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickInsertValues.map((value) => {
                      const isUsed = insertedValues.has(value);
                      return (
                        <button
                          key={value}
                          onClick={() => handleQuickInsert(value)}
                          disabled={playing || isUsed}
                          className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isUsed
                            ? (theme === "dark" ? "bg-green-500/20 text-green-400 cursor-default" : "bg-green-100 text-green-600 cursor-default")
                            : playing
                              ? (theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed")
                              : (theme === "dark" ? "bg-white/5 text-slate-200 hover:bg-white/10 hover:scale-105 cursor-pointer" : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 cursor-pointer")
                            }`}
                        >
                          {isUsed ? `✓ ${value}` : value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Example Cases */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                    Example Sequences
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => runSequence([30, 20, 10])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                      LL (30,20,10)
                    </button>
                    <button onClick={() => runSequence([10, 20, 30])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                      RR (10,20,30)
                    </button>
                    <button onClick={() => runSequence([30, 10, 20])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                      LR (30,10,20)
                    </button>
                    <button onClick={() => runSequence([10, 30, 20])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                      RL (10,30,20)
                    </button>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className={`pt-4 border-t ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                  <h3 className={`text-xs font-bold mb-3 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    <Play size={14} />
                    Playback Controls
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <ControlButton
                      onClick={() => {
                        if (!steps.length) return;
                        setStarted(true);
                        setPlaying(!playing);
                      }}
                      disabled={steps.length === 0}
                      icon={playing ? Pause : Play}
                      label={playing ? "Pause" : "Play"}
                      variant="success"
                    />
                    <ControlButton
                      onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
                      disabled={currentStep >= steps.length - 1}
                      icon={SkipForward}
                      label="Step"
                      variant="primary"
                    />
                    <ControlButton
                      onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                      disabled={currentStep <= 0}
                      icon={Rewind}
                      label="Back"
                      variant="primary"
                    />
                    <ControlButton
                      onClick={handleReset}
                      icon={RotateCcw}
                      label="Reset"
                      variant="danger"
                    />
                  </div>

                  {/* Speed Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className={`text-xs font-bold ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                        Speed
                      </label>
                      <span className={`text-xs font-bold ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
                        {speed}ms
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={2000}
                      step={100}
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 backdrop-blur-sm border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <h4 className={`text-xs font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Legend
                  </h4>
                  <div className="space-y-2">
                    {[
                      { color: "bg-gray-500", label: "Balanced Node" },
                      { color: "bg-red-500", label: "Unbalanced (♦)" },
                      { color: "bg-yellow-500", label: "Processing" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${item.color} rounded-full shadow-md`}></div>
                        <span className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle
            className={`w-0.5 transition-all duration-200 cursor-col-resize flex items-center justify-center group relative ${theme === "dark" ? "bg-white/10 hover:bg-cyan-500/70 hover:w-2" : "bg-gray-300 hover:bg-cyan-500 hover:w-2"}`}
          >
            <div className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-cyan-500"}`}>
              <ArrowLeftRight size={14} className={theme === "dark" ? "text-cyan-400" : "text-cyan-600"} />
            </div>
          </PanelResizeHandle>

          {/* Center Panel - Visualization */}
          <Panel minSize={40} maxSize={70}>
            <div className="h-full flex flex-col p-4">
              {/* Canvas Controls Bar */}
              <div className={`mb-4 p-3 rounded-xl border ${theme === "dark" ? "bg-slate-800/50 backdrop-blur-sm border-white/10" : "bg-white/80 border-gray-200"}`}>
                <div className="flex items-center justify-between gap-4">
                  {/* Progress Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Activity className={`w-5 h-5 flex-shrink-0 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                        Step {currentStep + 1} of {steps.length || 1}
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}>
                        <div
                          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Action */}
                  {steps[currentStep] && (
                    <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${theme === "dark" ? "bg-cyan-500/10 border-cyan-500/30" : "bg-cyan-50 border-cyan-200"}`}>
                      <Zap className={`w-4 h-4 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} />
                      <span className={`text-sm font-bold truncate max-w-xs ${theme === "dark" ? "text-cyan-400" : "text-cyan-700"}`}>
                        {currentStepData.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cytoscape Visualization */}
              <div className="flex-1 overflow-hidden relative flex flex-col rounded-2xl border-2 border-gray-200 bg-white shadow-lg">
                <div className="flex-1 relative">
                  <div
                    ref={cyRef}
                    className={`absolute inset-0 w-full h-full bg-transparent border-0 shadow-none`}
                  />
                  {!currentStepData.tree && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className={`text-lg font-medium ${theme === "dark" ? "text-slate-500" : "text-gray-400"}`}>
                        Tree is empty - Insert values to start!
                      </p>
                    </div>
                  )}
                </div>

                {/* In-Order Traversal Display */}
                <div className={`flex-shrink-0 p-3 rounded-b-2xl border-x border-b ${theme === "dark" ? "bg-slate-900/80 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                      In-Order Traversal (Sorted)
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {currentStepData.tree ? getInOrder(currentStepData.tree).map((val, idx) => (
                      <div key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${currentStepData.highlighting.includes(val)
                        ? (theme === "dark" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" : "bg-yellow-100 text-yellow-700 border border-yellow-300")
                        : (theme === "dark" ? "bg-white/5 text-slate-300" : "bg-white text-gray-700 border border-gray-200")
                        }`}>
                        {val}
                      </div>
                    )) : (
                      <span className="text-xs italic text-gray-500">Empty</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle
            className={`w-0.5 transition-all duration-200 cursor-col-resize flex items-center justify-center group relative ${theme === "dark" ? "bg-white/10 hover:bg-cyan-500/70 hover:w-2" : "bg-gray-300 hover:bg-cyan-500 hover:w-2"}`}
          >
            <div className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-cyan-500"}`}>
              <ArrowLeftRight size={14} className={theme === "dark" ? "text-cyan-400" : "text-cyan-600"} />
            </div>
          </PanelResizeHandle>

          {/* Right Panel - Stats & Code */}
          <Panel defaultSize={26} minSize={20} maxSize={40}>
            <div className={`h-full border-l flex flex-col ${theme === "dark" ? "bg-slate-900/50 backdrop-blur-xl border-white/10" : "bg-white/80 border-gray-200"}`}>
              {/* Tab Navigation */}
              <div className={`p-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                <div className="grid grid-cols-2 gap-2">
                  <TabButton id="stats" icon={BarChart3} label="Stats" activeTab={activeRightTab} setActiveTab={setActiveRightTab} />
                  <TabButton id="algorithm" icon={Code2} label="Code" activeTab={activeRightTab} setActiveTab={setActiveRightTab} />
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {activeRightTab === "stats" && (
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        icon={Target}
                        value={currentStepData.tree ? avlTree.getHeight(currentStepData.tree) : 0}
                        label="Height"
                        color="cyan"
                      />
                      <StatCard
                        icon={Activity}
                        value={currentStepData.tree ? avlTree.getBalance(currentStepData.tree) : 0}
                        label="Balance"
                        color="purple"
                      />
                      <StatCard
                        icon={Maximize2}
                        value={steps.length}
                        label="Steps"
                        color="amber"
                      />
                      <StatCard
                        icon={Clock}
                        value={`${getProgressPercentage()}%`}
                        label="Progress"
                        color="green"
                      />
                    </div>

                    {/* Node Balance Info */}
                    <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 backdrop-blur-sm border-white/10" : "bg-gray-50 border-gray-200"}`}>
                      <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        <Info size={16} />
                        Current Action
                      </h3>
                      <div className={`text-sm font-semibold mb-2 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
                        {currentStepData.action.replace(/_/g, " ")}
                      </div>
                      <p className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                        {currentStepData.description}
                      </p>
                    </div>

                    {/* AVL Tree Info */}
                    <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20" : "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200"}`}>
                      <h4 className={`text-sm font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Complexity
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={`font-semibold ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                            Time:
                          </span>
                          <span className={`font-mono font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                            O(log n)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-semibold ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                            Space:
                          </span>
                          <span className={`font-mono font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                            O(n)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rotation Types */}
                    <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20" : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"}`}>
                      <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        <Layers size={16} />
                        Rotation Types
                      </h4>
                      <div className={`space-y-2 text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                        <div className="flex justify-between">
                          <span className="font-semibold">Left-Left:</span>
                          <span className={theme === "dark" ? "text-yellow-400" : "text-yellow-600"}>Right rotation</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Right-Right:</span>
                          <span className={theme === "dark" ? "text-yellow-400" : "text-yellow-600"}>Left rotation</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Left-Right:</span>
                          <span className={theme === "dark" ? "text-yellow-400" : "text-yellow-600"}>Left then Right</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Right-Left:</span>
                          <span className={theme === "dark" ? "text-yellow-400" : "text-yellow-600"}>Right then Left</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRightTab === "algorithm" && (
                  <div className="flex-1 overflow-hidden p-4 flex flex-col">
                    <div className={`flex-1 rounded-xl border overflow-hidden flex flex-col ${theme === "dark" ? "bg-slate-800/50 backdrop-blur-sm border-white/10" : "bg-white border-gray-200"}`}>
                      <div className={`flex-shrink-0 flex items-center gap-2 p-3 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                        <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-cyan-500/20" : "bg-cyan-100"}`}>
                          <Code2 size={16} className={theme === "dark" ? "text-cyan-400" : "text-cyan-600"} />
                        </div>
                        <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          AVL Tree Implementation
                        </h3>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <BasicCodeDisplay
                          cppCode={avlTreeCode.cpp}
                          pythonCode={avlTreeCode.python}
                          jsCode={avlTreeCode.javascript}
                          highlightedLine={currentHighlightedLine}
                          className="h-full"
                          theme={theme}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Visualization */}
        <div className={`rounded-2xl p-4 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
          <h3 className={`font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            AVL Tree Visualization
          </h3>
          <p className={`text-sm mb-4 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
            {currentStepData.description}
          </p>

          <div className="relative w-full h-[400px] rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-lg">
            <div
              ref={mobileCyRef}
              className={`absolute inset-0 w-full h-full bg-transparent`}
            />
            {!currentStepData.tree && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-gray-400"}`}>
                  Tree is empty - Insert values to start!
                </p>
              </div>
            )}
          </div>

          {started && steps.length > 0 && (
            <div className="mt-4">
              <div className={`flex justify-between text-sm mb-2 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                <span>Progress</span>
                <span>{currentStep + 1} / {steps.length}</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}>
                <div
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls - Mobile */}
        <div className={`rounded-xl p-3 border flex gap-2 ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
          <ControlButton
            onClick={() => {
              if (!steps.length) return;
              setStarted(true);
              setPlaying(!playing);
            }}
            disabled={steps.length === 0}
            icon={playing ? Pause : Play}
            label={playing ? "Pause" : "Play"}
            variant="success"
          />
          <ControlButton
            onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
            disabled={currentStep <= 0}
            icon={Rewind}
            label="Back"
            variant="primary"
          />
          <ControlButton
            onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
            disabled={currentStep >= steps.length - 1}
            icon={SkipForward}
            label="Step"
            variant="primary"
          />
          <ControlButton
            onClick={handleReset}
            icon={RotateCcw}
            label="Reset"
            variant="danger"
          />
        </div>

        {/* Settings Accordion */}
        <div className={`border rounded-xl overflow-hidden ${theme === "dark" ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
          <button
            onClick={() => setMobileAccordions((prev) => ({ ...prev, settings: !prev.settings }))}
            className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            <span className="flex items-center gap-2">
              <Settings size={16} />
              Configuration
            </span>
            <ChevronDown className={`transition-transform ${mobileAccordions.settings ? "rotate-180" : ""}`} size={18} />
          </button>
          {mobileAccordions.settings && (
            <div className="p-4 pt-0 space-y-4">
              {/* View Options - Mobile */}
              <div className={`flex items-center justify-between p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                  Node Details (H/B)
                </span>
                <button
                  onClick={() => setShowNodeDetails(!showNodeDetails)}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 relative cursor-pointer ${showNodeDetails ? "bg-cyan-500" : "bg-gray-400"}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showNodeDetails ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                  Insert Value
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    placeholder="Enter number..."
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 focus:ring-2 ${theme === "dark" ? "bg-white/10 border border-white/20 text-white" : "bg-gray-100 border border-gray-200 text-gray-900"}`}
                  />
                  <button
                    onClick={handleInsert}
                    disabled={!insertValue || playing}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${!insertValue || playing ? (theme === "dark" ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400") : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"}`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {quickInsertValues.map((value) => {
                  const isUsed = insertedValues.has(value);
                  return (
                    <button
                      key={value}
                      onClick={() => handleQuickInsert(value)}
                      disabled={playing || isUsed}
                      className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isUsed
                        ? (theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600")
                        : playing
                          ? (theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed")
                          : (theme === "dark" ? "bg-white/5 text-slate-200 hover:bg-white/10 cursor-pointer" : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer")
                        }`}
                    >
                      {isUsed ? `✓ ${value}` : value}
                    </button>
                  );
                })}
              </div>

              {/* Example Sequences - Mobile */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                  Example Sequences
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => runSequence([30, 20, 10])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                    LL (30,20,10)
                  </button>
                  <button onClick={() => runSequence([10, 20, 30])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                    RR (10,20,30)
                  </button>
                  <button onClick={() => runSequence([30, 10, 20])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                    LR (30,10,20)
                  </button>
                  <button onClick={() => runSequence([10, 30, 20])} disabled={playing} className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                    RL (10,30,20)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-bold ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                    Speed
                  </label>
                  <span className={`text-sm font-bold ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
                    {speed}ms
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Accordion */}
        <div className={`border rounded-xl overflow-hidden ${theme === "dark" ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
          <button
            onClick={() => setMobileAccordions((prev) => ({ ...prev, stats: !prev.stats }))}
            className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={16} />
              Statistics
            </span>
            <ChevronDown className={`transition-transform ${mobileAccordions.stats ? "rotate-180" : ""}`} size={18} />
          </button>
          {mobileAccordions.stats && (
            <div className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Target}
                  value={currentStepData.tree ? avlTree.getHeight(currentStepData.tree) : 0}
                  label="Height"
                  color="cyan"
                />
                <StatCard
                  icon={Activity}
                  value={currentStepData.tree ? avlTree.getBalance(currentStepData.tree) : 0}
                  label="Balance"
                  color="purple"
                />
              </div>

              <div className={`rounded-xl p-3 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <h4 className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Legend</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { color: "bg-yellow-500", label: "Current" },
                    { color: "bg-blue-500", label: "Left" },
                    { color: "bg-purple-500", label: "Right" },
                    { color: "bg-red-500", label: "Unbalanced" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-xl p-3 border ${theme === "dark" ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20" : "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200"}`}>
                <h4 className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Complexity
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className={theme === "dark" ? "text-slate-300" : "text-gray-700"}>Time:</span>
                    <span className={`font-mono font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                      O(log n)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === "dark" ? "text-slate-300" : "text-gray-700"}>Space:</span>
                    <span className={`font-mono font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                      O(n)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Code Drawer */}
      {showCodeDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCodeDrawer(false)} />
          <div className={`mt-auto rounded-t-2xl shadow-2xl border-t-4 ${theme === "dark" ? "bg-slate-900 border-cyan-500" : "bg-white border-cyan-400"}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>AVL Tree Code</h3>
              <button
                onClick={() => setShowCodeDrawer(false)}
                className={`p-2 rounded-xl ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
              >
                <XIcon size={18} className={theme === "dark" ? "text-white" : "text-gray-900"} />
              </button>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <BasicCodeDisplay
                cppCode={avlTreeCode.cpp}
                pythonCode={avlTreeCode.python}
                jsCode={avlTreeCode.javascript}
                highlightedLine={currentHighlightedLine}
                className="min-h-[300px]"
                theme={theme}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alert Component */}
      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        customButtons={alertConfig.customButtons}
      />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.6)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(6, 182, 212, 0.7)' : 'rgba(6, 182, 212, 0.8)'};
        }
      `}</style>
    </div>
  );
};

export default AVLTree;
