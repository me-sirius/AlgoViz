import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Code2,
  ArrowLeft, Shuffle, X, Eye, EyeOff, Zap, Target, Activity,
  Rabbit, WrapText, AlertCircle, CheckCircle2, ChevronDown, FastForward
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../core/context/ThemeContext";
import { exponentialSearch as exponentialSearchCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// EXPONENTIAL SEARCH STEP GENERATOR
// ============================================================================

const generateExponentialSearchSteps = (inputArray, target) => {
  const arr = [...inputArray].sort((a, b) => a - b);
  const n = arr.length;
  const steps = [];
  let comparisons = 0;

  // Initial state
  steps.push({
    array: [...arr],
    phase: "start",
    jumpIndex: -1,
    jumpHistory: [],
    low: -1,
    high: -1,
    mid: -1,
    foundIndex: -1,
    comparisons: 0,
    codeLine: 1,
    commentary: `Starting Exponential Search. Target: ${target}. First, we'll gallop to find the range.`,
    status: "Initializing Gallop...",
    boundRange: null
  });

  // Check arr[0]
  comparisons++;
  if (arr[0] === target) {
    steps.push({
      array: [...arr],
      phase: "found",
      jumpIndex: 0,
      jumpHistory: [0],
      low: 0,
      high: 0,
      mid: -1,
      foundIndex: 0,
      comparisons,
      codeLine: 2,
      commentary: `🎯 Target ${target} found at index 0!`,
      status: "Found at Index 0!",
      boundRange: null
    });
    return steps;
  }

  // Phase 1: Galloping - exponential jumps
  let i = 1;
  const jumpHistory = [0];

  while (i < n && arr[i] <= target) {
    comparisons++;
    jumpHistory.push(i);

    steps.push({
      array: [...arr],
      phase: "galloping",
      jumpIndex: i,
      jumpHistory: [...jumpHistory],
      low: -1,
      high: -1,
      mid: -1,
      foundIndex: -1,
      comparisons,
      codeLine: 3,
      commentary: `Galloping! Checking index ${i}: arr[${i}] = ${arr[i]} ${arr[i] <= target ? '≤' : '>'} ${target}. ${arr[i] <= target ? 'Continue jumping...' : 'Stop!'}`,
      status: `Jump to Index ${i}`,
      boundRange: null
    });

    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        phase: "found",
        jumpIndex: i,
        jumpHistory: [...jumpHistory],
        low: -1,
        high: -1,
        mid: -1,
        foundIndex: i,
        comparisons,
        codeLine: 3,
        commentary: `🎯 Target ${target} found at index ${i} during gallop!`,
        status: `Found at Index ${i}!`,
        boundRange: null
      });
      return steps;
    }

    i *= 2;
  }

  // Overshoot - show the bound
  const lo = Math.floor(i / 2);
  const hi = Math.min(i, n - 1);

  if (i < n) {
    jumpHistory.push(i);
    comparisons++;
  }

  steps.push({
    array: [...arr],
    phase: "bound_found",
    jumpIndex: Math.min(i, n - 1),
    jumpHistory: [...jumpHistory],
    low: lo,
    high: hi,
    mid: -1,
    foundIndex: -1,
    comparisons,
    codeLine: 4,
    commentary: `Range locked! arr[${Math.min(i, n - 1)}] ${i < n ? `= ${arr[Math.min(i, n - 1)]} > ${target}` : 'exceeds array'}. Binary Search in range [${lo}, ${hi}].`,
    status: `Range: [${lo}, ${hi}]`,
    boundRange: [lo, hi]
  });

  // Phase 2: Binary Search
  let left = lo;
  let right = hi;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      array: [...arr],
      phase: "binary_search",
      jumpIndex: -1,
      jumpHistory: [...jumpHistory],
      low: left,
      high: right,
      mid: mid,
      foundIndex: -1,
      comparisons,
      codeLine: 6,
      commentary: `Binary Search: mid = floor((${left} + ${right}) / 2) = ${mid}. arr[${mid}] = ${arr[mid]}`,
      status: `Checking Index ${mid}`,
      boundRange: [lo, hi]
    });

    if (arr[mid] === target) {
      steps.push({
        array: [...arr],
        phase: "found",
        jumpIndex: -1,
        jumpHistory: [...jumpHistory],
        low: left,
        high: right,
        mid: mid,
        foundIndex: mid,
        comparisons,
        codeLine: 7,
        commentary: `🎯 Target ${target} found at index ${mid}!`,
        status: `Found at Index ${mid}!`,
        boundRange: [lo, hi]
      });
      return steps;
    } else if (arr[mid] < target) {
      steps.push({
        array: [...arr],
        phase: "binary_search",
        jumpIndex: -1,
        jumpHistory: [...jumpHistory],
        low: mid + 1,
        high: right,
        mid: -1,
        foundIndex: -1,
        comparisons,
        codeLine: 8,
        commentary: `arr[${mid}] = ${arr[mid]} < ${target}. Move left pointer to ${mid + 1}.`,
        status: `L = ${mid + 1}`,
        boundRange: [lo, hi]
      });
      left = mid + 1;
    } else {
      steps.push({
        array: [...arr],
        phase: "binary_search",
        jumpIndex: -1,
        jumpHistory: [...jumpHistory],
        low: left,
        high: mid - 1,
        mid: -1,
        foundIndex: -1,
        comparisons,
        codeLine: 9,
        commentary: `arr[${mid}] = ${arr[mid]} > ${target}. Move right pointer to ${mid - 1}.`,
        status: `H = ${mid - 1}`,
        boundRange: [lo, hi]
      });
      right = mid - 1;
    }
  }

  // Not found
  steps.push({
    array: [...arr],
    phase: "not_found",
    jumpIndex: -1,
    jumpHistory: [...jumpHistory],
    low: left,
    high: right,
    mid: -1,
    foundIndex: -1,
    comparisons,
    codeLine: 10,
    commentary: `Target ${target} not found after ${comparisons} comparisons.`,
    status: "Target Not Found",
    boundRange: [lo, hi]
  });

  return steps;
};

// Generate sorted array
const generateSortedArray = (size) => {
  const values = new Set();
  while (values.size < size) {
    values.add(Math.floor(Math.random() * 99) + 1);
  }
  return Array.from(values).sort((a, b) => a - b);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Range HUD Component
const RangeHUD = ({ phase, jumpIndex, boundRange, comparisons }) => {
  const getPhaseLabel = () => {
    switch (phase) {
      case "galloping": return "Phase 1: Bounding";
      case "bound_found": return "Range Locked!";
      case "binary_search": return "Phase 2: Binary Search";
      case "found": return "Target Acquired!";
      case "not_found": return "Search Complete";
      default: return "Initializing...";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "galloping": return "text-orange-400";
      case "bound_found": return "text-amber-400";
      case "binary_search": return "text-green-400";
      case "found": return "text-emerald-400";
      case "not_found": return "text-red-400";
      default: return "text-cyan-400";
    }
  };

  return (
    <div className="backdrop-blur-xl bg-black/60 border border-orange-500/30 rounded-2xl p-4 min-w-[240px] shadow-[0_0_30px_rgba(249,115,22,0.15)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30">
          <Rabbit size={16} className="text-orange-400" />
        </div>
        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Range HUD</span>
      </div>

      {/* Phase */}
      <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Phase</span>
        <span className={`text-sm font-bold ${getPhaseColor()}`}>{getPhaseLabel()}</span>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {phase === "galloping" && jumpIndex >= 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 uppercase tracking-wider">Current Jump</span>
            <span className="text-lg font-black text-orange-400">Index {jumpIndex}</span>
          </div>
        )}
        {boundRange && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 uppercase tracking-wider">Found Range</span>
            <span className="text-lg font-black text-amber-400">[{boundRange[0]}, {boundRange[1]}]</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-white/50 uppercase tracking-wider">Comparisons</span>
          <span className="text-lg font-black text-cyan-400">{comparisons}</span>
        </div>
      </div>
    </div>
  );
};

// Toast Notification
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -50, scale: 0.9 }}
    className={`fixed top-44 sm:bottom-32 sm:top-auto xl:bottom-28 left-1/2 -translate-x-1/2 z-[60] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-2 sm:gap-3 max-w-[calc(100vw-2rem)] sm:max-w-[80vw] xl:max-w-md ${type === "success"
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
      : "bg-red-500/20 border-red-500/40 text-red-400"
      }`}
  >
    {type === "success" ? <CheckCircle2 size={18} className="flex-shrink-0" /> : <AlertCircle size={18} className="flex-shrink-0" />}
    <span className="font-bold text-sm sm:text-base truncate">{message}</span>
    <button
      onClick={onClose}
      className="ml-1 sm:ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
    >
      <X size={16} />
    </button>
  </motion.div>
);

// Code Panel
const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [wrapCode, setWrapCode] = useState(false);

  const languageLabels = {
    cpp: "C++",
    python: "Python",
    javascript: "JavaScript"
  };

  const codeLines = exponentialSearchCode[codeLanguage].split('\n');
  const panelRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      const isButton = e.target.closest('button');
      const isInput = e.target.tagName === 'INPUT' || e.target.closest('input');
      const isControlBar = e.target.closest('[data-control-bar="true"]');
      const isSettingsModal = e.target.closest('[data-settings-modal="true"]');
      if (!isButton && !isInput && !isControlBar && !isSettingsModal) {
        onClose();
      }
    };

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (e) => {
      const delta = startX - e.clientX;
      const maxWidth = Math.min(700, window.innerWidth * 0.8);
      const newWidth = Math.max(350, Math.min(maxWidth, startWidth + delta));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full z-50 backdrop-blur-2xl bg-black/80 border-l border-white/10 flex flex-col shadow-2xl w-full sm:w-[85vw] xl:w-auto"
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1280 ? panelWidth : undefined }}
        >
          <div
            onMouseDown={handleMouseDown}
            className="hidden xl:block absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-orange-500/50 transition-colors"
          />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Exponential Search</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} className="text-white/70" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-orange-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {Object.keys(languageLabels).map(lang => (
                  <option key={lang} value={lang} className="bg-slate-900">
                    {languageLabels[lang]}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setWrapCode(!wrapCode)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrapCode
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                  }`}
                title={wrapCode ? "Unwrap Code" : "Wrap Code"}
              >
                <WrapText size={18} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrapCode ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {codeLines.map((line, idx) => (
              <motion.div
                key={idx}
                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(234,179,8,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-yellow-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-yellow-400 font-bold" : "text-white/30"}`}>
                  {idx + 1}
                </span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-yellow-100" : "text-white/70"}`}>
                  {line || " "}
                </pre>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Settings Modal
const SettingsModal = ({ isOpen, onClose, config, setConfig, onApply }) => {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            data-settings-modal="true"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md backdrop-blur-2xl bg-black/80 border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                  <Settings size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">Configuration</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} className="text-white/70" />
              </button>
            </div>

            {/* Array Size */}
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                Array Size: {localConfig.size}
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={localConfig.size}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, size: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500 bg-white/10"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>10</span>
                <span>50</span>
              </div>
            </div>

            {/* Target Value */}
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Target Value</label>
              <input
                type="number"
                min="1"
                max="99"
                value={localConfig.target}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, target: Number(e.target.value) }))}
                placeholder="Enter target to find"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* View Options */}
            <div className="mb-6">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">View Options</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, showValues: !prev.showValues }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${localConfig.showValues ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "bg-white/5 text-white/50"
                    }`}
                >
                  {localConfig.showValues ? <Eye size={16} /> : <EyeOff size={16} />}
                  Show Values
                </button>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => { onApply(localConfig); onClose(); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer"
            >
              Apply Changes
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ExponentialSearch = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Configuration
  const [config, setConfig] = useState({
    size: 20,
    showValues: true,
    target: 42
  });

  // Array and steps
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Playback
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() => Math.min(450, window.innerWidth * 1));
  const [toast, setToast] = useState(null);

  // Current step data
  const currentStep = steps[currentStepIndex] || {
    array: array,
    phase: "start",
    jumpIndex: -1,
    jumpHistory: [],
    low: -1,
    high: -1,
    mid: -1,
    foundIndex: -1,
    comparisons: 0,
    codeLine: 1,
    commentary: "Configure and generate an array to begin.",
    status: "Ready",
    boundRange: null
  };

  // Initialize
  const initializeSearch = useCallback((cfg = config) => {
    const newArray = generateSortedArray(cfg.size);
    setArray(newArray);
    const allSteps = generateExponentialSearchSteps(newArray, cfg.target);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
    setToast(null);
  }, [config]);

  useEffect(() => {
    initializeSearch();
  }, []);

  // Apply config
  const handleApplyConfig = (newConfig) => {
    setConfig(newConfig);
    initializeSearch(newConfig);
  };

  // Playback controls
  const handlePlayPause = () => setPlaying(!playing);
  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };
  const handleStepBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };
  const handleReset = () => {
    setCurrentStepIndex(0);
    setPlaying(false);
    setToast(null);
  };
  const handleScrub = (e) => {
    const value = parseInt(e.target.value);
    setCurrentStepIndex(value);
  };

  // Animation loop
  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) {
      if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
      return;
    }
    const delay = Math.max(100, 800 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  // Show toast on completion
  useEffect(() => {
    if (currentStep.phase === "found") {
      setToast({ message: `Target found at index ${currentStep.foundIndex}!`, type: "success" });
    } else if (currentStep.phase === "not_found") {
      setToast({ message: "Target not found", type: "error" });
    }
  }, [currentStep.phase, currentStep.foundIndex]);

  // Bar styling
  const getBarStyle = (index, value) => {
    const maxVal = Math.max(...currentStep.array);
    const height = (value / maxVal) * 100;

    const isJumpHistory = currentStep.jumpHistory.includes(index);
    const isCurrentJump = currentStep.jumpIndex === index;
    const isInBinaryRange = currentStep.boundRange &&
      index >= currentStep.boundRange[0] && index <= currentStep.boundRange[1];
    const isFound = currentStep.foundIndex === index;
    const isMid = currentStep.mid === index;
    const isLow = currentStep.low === index && currentStep.phase === "binary_search";
    const isHigh = currentStep.high === index && currentStep.phase === "binary_search";

    let bgClass = "from-slate-400 to-slate-500";
    let opacity = 1;
    let scale = 1;
    let glow = "";

    if (isFound) {
      bgClass = "from-emerald-400 to-green-500";
      opacity = 1;
      scale = 1.1;
      glow = "shadow-[0_0_30px_rgba(52,211,153,0.6)]";
    } else if (isCurrentJump && currentStep.phase === "galloping") {
      bgClass = "from-orange-400 to-amber-500";
      opacity = 1;
      scale = 1.1;
      glow = "shadow-[0_0_25px_rgba(249,115,22,0.6)]";
    } else if (isMid && currentStep.phase === "binary_search") {
      bgClass = "from-yellow-400 to-amber-500";
      opacity = 1;
      scale = 1.05;
      glow = "shadow-[0_0_20px_rgba(234,179,8,0.5)]";
    } else if (isJumpHistory && currentStep.phase === "galloping") {
      bgClass = "from-orange-300/50 to-amber-400/50";
      opacity = 0.5;
    } else if (isInBinaryRange) {
      bgClass = "from-green-400 to-emerald-500";
      opacity = 1;
    } else if (currentStep.boundRange) {
      opacity = 0.15;
    } else {
      bgClass = "from-slate-400 to-slate-500";
      opacity = 0.6;
    }

    return { height, bgClass, opacity, scale, glow, isLow, isHigh, isMid };
  };

  const displayArray = currentStep.array || array;
  // Calculate available width considering code panel and margins (matching BubbleSort)
  const availableWidth = window.innerWidth - 400 - (showCode ? panelWidth : 0);
  const barWidth = Math.max(12, Math.min(60, availableWidth / displayArray.length));

  return (
    <div className="fixed inset-0 bg-[#0b0b0d] overflow-hidden flex">
      {/* VISUALIZATION CANVAS */}
      <motion.div
        layout
        className="relative flex-1 h-full"
        initial={false}
        animate={{ marginRight: showCode ? panelWidth : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute inset-0 flex flex-col pt-24 sm:pt-30 pb-40 sm:pb-60 overflow-auto">
          {/* Main content area */}
          <div className="flex-1 flex items-end justify-center">
            {/* Scrollable wrapper */}
            <div className="w-full h-[50vh] overflow-x-auto px-2 sm:px-4 xl:px-8">
              {/* Bars container */}
              <div className="flex items-end justify-center gap-0.5 sm:gap-1 h-full relative min-w-max px-4">
                {displayArray.map((value, index) => {
                  const { height, bgClass, opacity, scale, glow, isLow, isHigh, isMid } = getBarStyle(index, value);

                  return (
                    <motion.div
                      key={index}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative flex flex-col items-center justify-end h-full flex-shrink-0"
                      style={{ width: barWidth }}
                    >
                      {/* Pointer Arrows for Binary Search phase */}
                      <AnimatePresence>
                        {isLow && (
                          <motion.div
                            key="low"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-14 flex flex-col items-center z-20"
                          >
                            <ChevronDown size={20} className="text-green-400" />
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-green-500/20 border border-green-500/40 text-green-400">L</span>
                          </motion.div>
                        )}
                        {isHigh && (
                          <motion.div
                            key="high"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-14 flex flex-col items-center z-20"
                          >
                            <ChevronDown size={20} className="text-red-400" />
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400">H</span>
                          </motion.div>
                        )}
                        {isMid && currentStep.phase === "binary_search" && (
                          <motion.div
                            key="mid"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-14 flex flex-col items-center z-30"
                          >
                            <ChevronDown size={20} className="text-yellow-400" />
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">M</span>
                          </motion.div>
                        )}
                        {/* Jumper indicator for galloping phase */}
                        {currentStep.jumpIndex === index && currentStep.phase === "galloping" && (
                          <motion.div
                            key="jumper"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute -top-10 flex flex-col items-center z-30"
                          >
                            <Rabbit size={24} className="text-orange-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bar */}
                      <motion.div
                        animate={{ scaleY: scale, scaleX: scale }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`w-full bg-gradient-to-t ${bgClass} rounded-t-lg ${glow}`}
                        style={{ height: `${height}%`, minHeight: 4 }}
                      />

                      {/* Value Label */}
                      {config.showValues && (
                        <motion.span
                          animate={{ opacity }}
                          className="text-[8px] sm:text-[9px] font-bold text-white/60 mt-2"
                        >
                          {value}
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =============== FLOATING UI =============== */}

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* MOBILE/TABLET: Header Bar */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white">Exponential Search</h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] sm:text-xs font-bold border border-orange-500/30">O(log n)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <Target size={12} className="text-orange-400" />
                <span className="text-xs sm:text-sm font-bold text-orange-400">{config.target}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Activity size={12} className="text-cyan-400" />
                <span className="text-xs sm:text-sm font-bold text-cyan-400">{currentStep.comparisons}</span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 px-4 py-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Gallop</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Range</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Mid</span>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP: Legend */}
        <motion.div
          className="hidden xl:flex fixed top-24 z-40 backdrop-blur-xl bg-black/40 border border-white rounded-full px-6 py-2.5 items-center gap-6"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{
            left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
            x: '-50%',
            top: showCode ? 180 : 96
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <Rabbit size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-white/80">Galloping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-300/50 to-amber-400/50" />
            <span className="text-xs font-semibold text-white/80">Jump Trail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" />
            <span className="text-xs font-semibold text-white/80">Binary Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500" />
            <span className="text-xs font-semibold text-white/80">Found</span>
          </div>
        </motion.div>

        {/* DESKTOP: HEADS-UP HEADER */}
        <div className="hidden xl:block fixed top-6 left-20 z-40 backdrop-blur-xl bg-gray-900 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">Exponential Search</h1>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
              O(log n)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              Medium
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {currentStep.commentary}
          </p>
        </div>

        {/* DESKTOP: RANGE HUD */}
        <motion.div
          className="hidden xl:block fixed top-6 z-40"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <RangeHUD
            phase={currentStep.phase}
            jumpIndex={currentStep.jumpIndex}
            boundRange={currentStep.boundRange}
            comparisons={currentStep.comparisons}
          />
        </motion.div>

        {/* COMMAND CENTER */}
        <motion.div
          data-control-bar="true"
          className="fixed bottom-3 sm:bottom-4 xl:bottom-6 z-50 backdrop-blur-2xl bg-gray-900 border border-white rounded-2xl xl:rounded-3xl p-2.5 sm:p-3 xl:p-4 flex items-center gap-2 sm:gap-3 xl:gap-4 shadow-2xl max-w-[95vw] overflow-x-auto"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{
            left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
            x: '-50%'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Timeline Scrubber */}
          <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[140px] xl:min-w-[200px] flex-shrink-0">
            <input
              type="range"
              min="0"
              max={Math.max(0, steps.length - 1)}
              value={currentStepIndex}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-orange-500"
            />
            <span className="text-[10px] sm:text-[11px] xl:text-[12px] text-white font-medium translate-y-1">
              {currentStepIndex + 1}/{steps.length}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStepBack}
              disabled={currentStepIndex <= 0}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <SkipBack size={18} className="text-white" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer"
            >
              {playing ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
            </button>
            <button
              onClick={handleStepForward}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <SkipForward size={18} className="text-white" />
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <RotateCcw size={18} className="text-white" />
            </button>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Speed Slider */}
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-amber-500"
            />
            <span className="text-xs font-bold text-white/60 w-8">{speed}x</span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Utility Buttons */}
          <button
            onClick={() => initializeSearch()}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title="Generate New Array"
          >
            <Shuffle size={18} className="text-white" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title="Settings"
          >
            <Settings size={18} className="text-white" />
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showCode ? 'bg-orange-500/30 border border-orange-500/50' : 'bg-white/5 hover:bg-white/10'}`}
            title="View Code"
          >
            <Code2 size={18} className="text-white" />
          </button>
        </motion.div>
      </motion.div>

      {/* =============== MODALS & PANELS =============== */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        setConfig={setConfig}
        onApply={handleApplyConfig}
      />

      <CodePanel
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        activeLine={currentStep.codeLine}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
      />

      {/* Toast - hidden when code panel is open */}
      <AnimatePresence>
        {toast && !showCode && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div >
  );
};

export default ExponentialSearch;