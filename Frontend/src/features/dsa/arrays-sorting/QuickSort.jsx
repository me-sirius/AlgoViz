import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Code2,
  ArrowLeft, Shuffle, X, Eye, EyeOff, Zap,
  RefreshCw, Activity, Timer, Check, WrapText, Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../core/context/ThemeContext";
import { quickSort as quickSortCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// QUICK SORT STEP GENERATOR (Enhanced with Focus Mode tracking)
// ============================================================================

const generateAllSteps = (inputArray, direction = "asc") => {
  const arr = [...inputArray];
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const sorted = new Set();

  // Initial state
  steps.push({
    array: [...arr],
    pivot: -1,
    activeRange: [0, n - 1],
    scannerIndex: -1,      // i pointer
    partitionerIndex: -1,  // j pointer
    swapping: [],
    sorted: [],
    comparisons: 0,
    swaps: 0,
    codeLine: 1,
    commentary: "Starting Quick Sort. We'll partition the array around pivot elements.",
    phase: "start",
    sortedPercent: 0
  });

  const partition = (arr, low, high) => {
    const pivotValue = arr[high];
    let i = low - 1;

    // Show pivot selection
    steps.push({
      array: [...arr],
      pivot: high,
      activeRange: [low, high],
      scannerIndex: low,
      partitionerIndex: i,
      swapping: [],
      sorted: Array.from(sorted),
      comparisons,
      swaps,
      codeLine: 5,
      commentary: `Selecting pivot: ${pivotValue} at index ${high}. Partitioning range [${low}..${high}].`,
      phase: "pivot-select",
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    for (let j = low; j < high; j++) {
      comparisons++;
      const shouldSwap = direction === "asc" ? arr[j] < pivotValue : arr[j] > pivotValue;
      const comparison = direction === "asc" ? "<" : ">";

      // Scanning step - show j pointer moving
      steps.push({
        array: [...arr],
        pivot: high,
        activeRange: [low, high],
        scannerIndex: j,
        partitionerIndex: i,
        swapping: [],
        sorted: Array.from(sorted),
        comparisons,
        swaps,
        codeLine: 10,
        commentary: `Scanning: arr[${j}] = ${arr[j]} ${comparison} pivot (${pivotValue})? ${shouldSwap ? "Yes! Move to left partition." : "No, stays right."}`,
        phase: "scanning",
        sortedPercent: Math.round((sorted.size / n) * 100)
      });

      if (shouldSwap) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;

          steps.push({
            array: [...arr],
            pivot: high,
            activeRange: [low, high],
            scannerIndex: j,
            partitionerIndex: i,
            swapping: [i, j],
            sorted: Array.from(sorted),
            comparisons,
            swaps,
            codeLine: 12,
            commentary: `Swapping arr[${i}] ↔ arr[${j}]: ${arr[j]} ↔ ${arr[i]}`,
            phase: "swapping",
            sortedPercent: Math.round((sorted.size / n) * 100)
          });
        } else {
          // i === j, just increment partitioner
          steps.push({
            array: [...arr],
            pivot: high,
            activeRange: [low, high],
            scannerIndex: j,
            partitionerIndex: i,
            swapping: [],
            sorted: Array.from(sorted),
            comparisons,
            swaps,
            codeLine: 11,
            commentary: `Partitioner moves to index ${i}. Element ${arr[i]} is in correct partition.`,
            phase: "partition-move",
            sortedPercent: Math.round((sorted.size / n) * 100)
          });
        }
      }
    }

    // Place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    const pivotFinalPos = i + 1;

    steps.push({
      array: [...arr],
      pivot: pivotFinalPos,
      activeRange: [low, high],
      scannerIndex: -1,
      partitionerIndex: -1,
      swapping: [pivotFinalPos, high],
      sorted: Array.from(sorted),
      comparisons,
      swaps,
      codeLine: 16,
      commentary: `Placing pivot ${pivotValue} at final position ${pivotFinalPos}.`,
      phase: "pivot-place",
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    // Mark pivot as sorted
    sorted.add(pivotFinalPos);

    steps.push({
      array: [...arr],
      pivot: -1,
      activeRange: [low, high],
      scannerIndex: -1,
      partitionerIndex: -1,
      swapping: [],
      sorted: Array.from(sorted),
      comparisons,
      swaps,
      codeLine: 18,
      commentary: `✓ Pivot ${pivotValue} is now in its final sorted position at index ${pivotFinalPos}.`,
      phase: "partition-complete",
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    return pivotFinalPos;
  };

  const quickSortRecursive = (arr, low, high) => {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSortRecursive(arr, low, pi - 1);
      quickSortRecursive(arr, pi + 1, high);
    } else if (low === high && low >= 0 && low < n) {
      // Single element is sorted
      sorted.add(low);
      steps.push({
        array: [...arr],
        pivot: -1,
        activeRange: [low, high],
        scannerIndex: -1,
        partitionerIndex: -1,
        swapping: [],
        sorted: Array.from(sorted),
        comparisons,
        swaps,
        codeLine: 22,
        commentary: `Single element ${arr[low]} at index ${low} is automatically sorted.`,
        phase: "single-sorted",
        sortedPercent: Math.round((sorted.size / n) * 100)
      });
    }
  };

  quickSortRecursive(arr, 0, n - 1);

  // Final state
  steps.push({
    array: [...arr],
    pivot: -1,
    activeRange: [-1, -1],
    scannerIndex: -1,
    partitionerIndex: -1,
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    comparisons,
    swaps,
    codeLine: 26,
    commentary: `🎉 Sorting complete! ${comparisons} comparisons, ${swaps} swaps.`,
    phase: "complete",
    sortedPercent: 100
  });

  return steps;
};

// Array generators
const generateArray = (size, mode) => {
  switch (mode) {
    case "reverse":
      return Array.from({ length: size }, (_, i) => size - i);
    case "nearly":
      const nearly = Array.from({ length: size }, (_, i) => i + 1);
      for (let i = 0; i < Math.floor(size * 0.1); i++) {
        const a = Math.floor(Math.random() * size);
        const b = Math.floor(Math.random() * size);
        [nearly[a], nearly[b]] = [nearly[b], nearly[a]];
      }
      return nearly;
    case "random":
    default:
      return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
  }
};

// ============================================================================
// FOCUS MODE COMPONENTS
// ============================================================================

// Pointer Arrow Component
const PointerArrow = ({ position, label, color, barWidth, show, totalBars }) => {
  if (!show || position < 0) return null;

  // Calculate position: each bar slot is (barWidth + gap), gap is 4px (gap-1)
  // Position from center: offset from center bar = (position - (totalBars-1)/2)
  // Each slot width = barWidth + 4
  const centerOffset = (position - (totalBars - 1) / 2) * (barWidth + 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute flex flex-col items-center z-20"
      style={{
        left: `calc(50% + ${centerOffset}px)`,
        bottom: -60,
        transform: 'translateX(-50%)'
      }}
    >
      <motion.div
        className={`w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent`}
        style={{ borderBottomColor: color }}
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      <span
        className="text-xs font-bold mt-1 px-2 py-0.5 rounded whitespace-nowrap"
        style={{ backgroundColor: color, color: '#000' }}
      >
        {label}
      </span>
    </motion.div>
  );
};

// Pivot Badge Component
const PivotBadge = ({ show }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: 10 }}
      className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
    >
      <Crown size={16} className="text-purple-400" />
      <span className="text-[10px] font-black text-purple-300 bg-purple-500/30 px-2 py-0.5 rounded-full border border-purple-400/50">
        PIVOT
      </span>
    </motion.div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard = ({ icon: Icon, value, label, flash, color = "cyan" }) => {
  const colorMap = {
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
    red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
  };

  return (
    <motion.div
      animate={flash ? { scale: [1, 1.1, 1], backgroundColor: ["rgba(239,68,68,0.2)", "rgba(239,68,68,0.4)", "rgba(239,68,68,0.2)"] } : {}}
      transition={{ duration: 0.3 }}
      className={`backdrop-blur-xl bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-3 min-w-[100px]`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className="opacity-70" />
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </motion.div>
  );
};

const SortedProgress = ({ percent }) => (
  <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4 w-full flex items-center gap-4">
    <div className="flex items-center gap-2 shrink-0">
      <Check size={16} className="text-green-400 opacity-70" />
      <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Sorted</span>
    </div>
    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
    <span className="text-lg font-black text-green-400 shrink-0">{percent}%</span>
  </div>
);

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [wrapCode, setWrapCode] = useState(false);
  const panelRef = React.useRef(null);

  const languageLabels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const codeLines = quickSortCode[codeLanguage].split('\n');

  // Smart click-outside detection - excludes control bar and settings modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isOpen) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      const isButton = e.target.closest('button');
      const isInput = e.target.tagName === 'INPUT' || e.target.closest('input');
      const isControlBar = e.target.closest('[data-control-bar="true"]');
      const isSettingsModal = e.target.closest('[data-settings-modal="true"]');
      if (!isButton && !isInput && !isControlBar && !isSettingsModal) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
          className="fixed right-0 top-0 h-full z-50 backdrop-blur-2xl bg-black/80 border-l border-white/10 flex flex-col shadow-2xl"
          style={{ width: panelWidth }}
        >
          <div onMouseDown={handleMouseDown} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-purple-500/50 transition-colors" />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Quick Sort</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-purple-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {Object.keys(languageLabels).map(lang => (
                  <option key={lang} value={lang} className="bg-slate-900">{languageLabels[lang]}</option>
                ))}
              </select>
              <button
                onClick={() => setWrapCode(!wrapCode)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrapCode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-yellow-400 font-bold" : "text-white/30"}`}>{idx + 1}</span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-yellow-100" : "text-white/70"}`}>{line || " "}</pre>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SettingsModal = ({ isOpen, onClose, config, setConfig, onApply }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [customInputError, setCustomInputError] = useState("");

  useEffect(() => { setLocalConfig(config); }, [config, isOpen]);

  useEffect(() => {
    if (localConfig.mode === "custom" && localConfig.customInput) {
      const values = localConfig.customInput.split(",").map(s => s.trim()).filter(s => s !== "");
      if (values.length === 0) { setCustomInputError(""); return; }
      const validValues = values.filter(s => { const num = parseInt(s); return !isNaN(num) && num > 0 && num < 100; });
      const errors = [];
      if (validValues.length < values.length) errors.push("All values must be numbers between 1-99");
      if (validValues.length === values.length && validValues.length < 2) errors.push("Please enter at least 2 valid numbers");
      if (validValues.length === values.length && validValues.length > 75) errors.push(`Too many elements! Maximum 75 allowed (currently ${validValues.length})`);
      setCustomInputError(errors.length > 0 ? errors.map(e => `⚠️ ${e}`).join("\n") : "");
    } else { setCustomInputError(""); }
  }, [localConfig.customInput, localConfig.mode]);

  const modes = [
    { id: "random", label: "Random" },
    { id: "reverse", label: "Reverse Sorted" },
    { id: "nearly", label: "Nearly Sorted" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div data-settings-modal="true" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md backdrop-blur-2xl bg-black/80 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500"><Settings size={18} className="text-white" /></div>
                <h3 className="font-bold text-white text-lg">Configuration</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"><X size={20} className="text-white/70" /></button>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Input Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {modes.map(mode => (
                  <button key={mode.id} onClick={() => setLocalConfig(prev => ({ ...prev, mode: mode.id }))} className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer ${localConfig.mode === mode.id ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>{mode.label}</button>
                ))}
              </div>
            </div>
            {localConfig.mode === "custom" && (
              <div className="mb-5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Custom Array</label>
                <input type="text" value={localConfig.customInput} onChange={(e) => setLocalConfig(prev => ({ ...prev, customInput: e.target.value }))} placeholder="e.g., 64, 34, 25, 12, 22" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors" />
                {customInputError && <p className="text-xs text-red-400 mt-2 whitespace-pre-line">{customInputError}</p>}
              </div>
            )}
            {localConfig.mode !== "custom" && (
              <div className="mb-5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Array Size: {localConfig.size}</label>
                <input type="range" min="5" max="50" value={localConfig.size} onChange={(e) => setLocalConfig(prev => ({ ...prev, size: Number(e.target.value) }))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-500" />
                <div className="flex justify-between text-xs text-white/40 mt-1"><span>5</span><span>50</span></div>
              </div>
            )}
            <div className="mb-6">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">View Options</label>
              <button onClick={() => setLocalConfig(prev => ({ ...prev, showValues: !prev.showValues }))} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${localConfig.showValues ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-white/5 text-white/50"}`}>
                {localConfig.showValues ? <Eye size={16} /> : <EyeOff size={16} />} Show Values
              </button>
            </div>
            <button onClick={() => { onApply(localConfig); onClose(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer">Apply Changes</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuickSort = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [config, setConfig] = useState({ size: 15, mode: "random", customInput: "", showValues: true, direction: "asc" });
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() => Math.min(450, window.innerWidth * 1));
  const [swapFlash, setSwapFlash] = useState(false);

  const currentStep = steps[currentStepIndex] || {
    array: array, pivot: -1, activeRange: [0, array.length - 1], scannerIndex: -1, partitionerIndex: -1,
    swapping: [], sorted: [], comparisons: 0, swaps: 0, codeLine: 1, commentary: "Ready to start Quick Sort.", phase: "ready", sortedPercent: 0
  };

  const initializeSort = useCallback((cfg = config) => {
    let newArray;
    if (cfg.mode === "custom") {
      const values = cfg.customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0 && n < 100);
      newArray = values.length >= 2 ? values.slice(0, 75) : generateArray(cfg.size, "random");
    } else { newArray = generateArray(cfg.size, cfg.mode); }
    setArray(newArray);
    const allSteps = generateAllSteps(newArray, cfg.direction);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [config]);

  useEffect(() => { initializeSort(); }, []);
  const handleApplyConfig = (newConfig) => { setConfig(newConfig); initializeSort(newConfig); };
  const handlePlayPause = () => setPlaying(!playing);
  const handleStepForward = () => { if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1); };
  const handleStepBack = () => { if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1); };
  const handleReset = () => { setCurrentStepIndex(0); setPlaying(false); };
  const handleScrub = (e) => { setCurrentStepIndex(parseInt(e.target.value)); };

  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) { if (playing && currentStepIndex >= steps.length - 1) setPlaying(false); return; }
    const delay = Math.max(50, 600 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  useEffect(() => { if (currentStep.phase === "swapping" || currentStep.phase === "pivot-place") { setSwapFlash(true); setTimeout(() => setSwapFlash(false), 300); } }, [currentStepIndex]);

  // FOCUS MODE: Bar styling with dimming
  const getBarStyle = (index, value) => {
    const maxVal = Math.max(...currentStep.array);
    const height = (value / maxVal) * 100;
    const [low, high] = currentStep.activeRange;
    const isInActiveRange = index >= low && index <= high;
    const isComplete = currentStep.phase === "complete";

    let bgClass = "from-slate-400 to-slate-500"; // default unsorted
    let scale = 1;
    let glow = "";
    let animation = "";
    let opacity = isInActiveRange || isComplete ? 1 : 0.25; // FOCUS MODE dimming

    if (currentStep.sorted.includes(index)) {
      bgClass = "from-green-400 to-emerald-500";
      glow = "shadow-[0_0_20px_rgba(52,211,153,0.5)]";
      opacity = 1; // Always show sorted
    } else if (currentStep.swapping.includes(index)) {
      bgClass = "from-red-400 to-rose-500";
      scale = 1.08;
      animation = "animate-pulse";
    } else if (index === currentStep.pivot) {
      bgClass = "from-purple-400 to-violet-600";
      scale = 1.12;
      glow = "shadow-[0_0_30px_rgba(167,139,250,0.8)]";
    } else if (index === currentStep.scannerIndex) {
      bgClass = "from-yellow-300 to-amber-500";
      scale = 1.05;
    } else if (index === currentStep.partitionerIndex && currentStep.partitionerIndex >= 0) {
      bgClass = "from-orange-400 to-red-500";
      scale = 1.05;
    }

    return { height, bgClass, scale, glow, animation, opacity };
  };

  const displayArray = currentStep.array || array;
  // Use less padding on mobile, more on desktop
  const sidePadding = window.innerWidth < 640 ? 32 : window.innerWidth < 1024 ? 100 : 400;
  const availableWidth = window.innerWidth - sidePadding - (showCode ? panelWidth : 0);
  // Minimum bar width of 20px on mobile, 12px on desktop to maintain readability
  const minBarWidth = window.innerWidth < 640 ? 20 : 12;
  const barWidth = Math.max(minBarWidth, Math.min(60, availableWidth / displayArray.length));
  const opsPerSecond = Math.round(speed * 1.67);
  const gridLines = [25, 50, 75, 100];

  return (
    <div className="fixed inset-0 bg-[#0b0b0d] overflow-x-auto overflow-y-hidden flex">
      <motion.div
        layout
        className="relative flex-1 h-full"
        initial={false}
        animate={{ marginRight: showCode ? panelWidth : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute inset-0 flex flex-col pb-32 sm:pb-36 xl:pb-36 pt-42 sm:pt-42 xl:pt-28">
          {/* Grid Lines - Fixed, doesn't scroll */}
          <div className="absolute inset-0 flex flex-col justify-end pb-32 sm:pb-36 xl:pb-36 pt-42 sm:pt-42 xl:pt-28 px-2 sm:px-4 xl:px-8 pointer-events-none z-0">
            <div className="relative max-h-[55vh] h-full">
              <div className="absolute inset-0 bottom-24">
                {gridLines.map(percent => (
                  <div key={percent} className="absolute w-full border-t border-white/10" style={{ bottom: `${percent}%` }}>
                    <span className="absolute -right-2 -translate-y-1/2 text-[10px] text-white/20 font-mono bg-[#0b0b0d] px-1">{percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area - scrollable */}
          <div className="flex-1 flex items-end justify-center">
            <div className="w-full h-full max-h-[55vh] overflow-x-auto overflow-y-hidden px-2 sm:px-4 xl:px-8">
              {/* Bar Chart with Pointers - pb-20 creates room for pointers at -bottom-16 */}
              <div className="relative flex items-end justify-center gap-1 h-full pb-24 z-10 min-w-max px-4">
                {displayArray.map((value, index) => {
                  const { height, bgClass, scale, glow, animation, opacity } = getBarStyle(index, value);
                  return (
                    <motion.div
                      key={index}
                      layout
                      animate={{ opacity, scaleY: scale }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative flex flex-col items-center justify-end h-full flex-shrink-0"
                      style={{ width: barWidth, transformOrigin: 'bottom' }}
                    >
                      {/* Pivot Badge */}
                      <AnimatePresence>
                        {index === currentStep.pivot && <PivotBadge show={true} />}
                      </AnimatePresence>

                      <div
                        className={`w-full bg-gradient-to-t ${bgClass} rounded-t-lg ${glow} ${animation}`}
                        style={{ height: `${height}%`, minHeight: 4 }}
                      />
                      {config.showValues && (
                        <span className="text-[8px] sm:text-[10px] font-bold text-white/60 mt-1">{value}</span>
                      )}

                      {/* Pointer Indicators - render inside bar container for proper centering */}
                      {index === currentStep.scannerIndex && currentStep.scannerIndex >= 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
                        >
                          <motion.div
                            className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent"
                            style={{ borderBottomColor: '#facc15' }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                          />
                          <span className="text-xs font-bold mt-1 px-2 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: '#facc15', color: '#000' }}>
                            j (scan)
                          </span>
                        </motion.div>
                      )}
                      {index === currentStep.partitionerIndex && currentStep.partitionerIndex >= 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
                        >
                          <motion.div
                            className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent"
                            style={{ borderBottomColor: '#f97316' }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                          />
                          <span className="text-xs font-bold mt-1 px-2 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: '#f97316', color: '#000' }}>
                            i (part)
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING UI */}

        {/* BACK BUTTON - All screen sizes (floats separately) */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* MOBILE/TABLET: Header Bar (< 1024px) */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Main Row: Title + Badge + Metrics */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white">Quick Sort</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs font-bold border border-purple-500/30">Focus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Activity size={12} className="text-cyan-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-cyan-400">{currentStep.comparisons}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <RefreshCw size={12} className="text-red-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-red-400">{currentStep.swaps}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                <Check size={12} className="text-green-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-green-400">{currentStep.sortedPercent}%</span>
              </div>
            </div>
          </div>
          {/* Legend Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 px-4 py-2 border-t border-white/5 overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-purple-400 to-violet-600" /><span className="text-[10px] sm:text-xs font-semibold text-white/80">Pivot</span></div>
            <div className="flex items-center gap-2 flex-shrink-0"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500" /><span className="text-[10px] sm:text-xs font-semibold text-white/80">Scan</span></div>
            <div className="flex items-center gap-2 flex-shrink-0"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500" /><span className="text-[10px] sm:text-xs font-semibold text-white/80">Part</span></div>
            <div className="flex items-center gap-2 flex-shrink-0"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-red-400 to-rose-500" /><span className="text-[10px] sm:text-xs font-semibold text-white/80">Swap</span></div>
            <div className="flex items-center gap-2 flex-shrink-0"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" /><span className="text-[10px] sm:text-xs font-semibold text-white/80">Done</span></div>
          </div>
        </motion.div>

        {/* DESKTOP: LEGEND - Animated (≥ 1280px) - Centered at top */}
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
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-violet-600" /><span className="text-xs font-semibold text-white/80">Pivot</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500" /><span className="text-xs font-semibold text-white/80">Scanner (j)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500" /><span className="text-xs font-semibold text-white/80">Partition (i)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-rose-500" /><span className="text-xs font-semibold text-white/80">Swap</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" /><span className="text-xs font-semibold text-white/80">Sorted</span></div>
        </motion.div>

        {/* DESKTOP: HEADS-UP HEADER (≥ 1024px) */}
        <div className="hidden xl:block fixed top-6 left-20 z-40 backdrop-blur-xl bg-gray-900 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">Quick Sort</h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">Focus Mode</span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{currentStep.commentary}</p>
        </div>

        {/* DESKTOP: METRIC HUD - Animated (≥ 1024px) */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-3 max-w-md"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-start gap-3">
            <StatCard icon={Activity} value={currentStep.comparisons} label="Comparisons" color="cyan" />
            <StatCard icon={RefreshCw} value={currentStep.swaps} label="Swaps" flash={swapFlash} color="red" />
            <StatCard icon={Timer} value={`${opsPerSecond}/s`} label="Speed" color="amber" />
          </div>
          <SortedProgress percent={currentStep.sortedPercent} />
        </motion.div>

        {/* COMMAND CENTER - Animated */}
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
          <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[140px] xl:min-w-[200px] flex-shrink-0">
            <input type="range" min="0" max={Math.max(0, steps.length - 1)} value={currentStepIndex} onChange={handleScrub} className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500" />
            <span className="text-[10px] sm:text-[11px] xl:text-[12px] text-white font-medium translate-y-1">{currentStepIndex + 1}/{steps.length}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"><SkipBack size={18} className="text-white" /></button>
            <button onClick={handlePlayPause} className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer">{playing ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}</button>
            <button onClick={handleStepForward} disabled={currentStepIndex >= steps.length - 1} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"><SkipForward size={18} className="text-white" /></button>
            <button onClick={handleReset} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"><RotateCcw size={18} className="text-white" /></button>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            <input type="range" min="0.5" max="10" step="0.5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-amber-500" />
            <span className="text-xs font-bold text-white/60 w-8">{speed}x</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <button onClick={() => initializeSort()} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer" title="Shuffle"><Shuffle size={18} className="text-white" /></button>
          <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer" title="Settings"><Settings size={18} className="text-white" /></button>
          <button onClick={() => setShowCode(!showCode)} className={`p-2.5 rounded-xl transition-all cursor-pointer ${showCode ? 'bg-purple-500/30 border border-purple-500/50' : 'bg-white/5 hover:bg-white/10'}`} title="View Code"><Code2 size={18} className="text-white" /></button>
        </motion.div>
      </motion.div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} config={config} setConfig={setConfig} onApply={handleApplyConfig} />
      <CodePanel isOpen={showCode} onClose={() => setShowCode(false)} activeLine={currentStep.codeLine} panelWidth={panelWidth} setPanelWidth={setPanelWidth} />
    </div>
  );
};

export default QuickSort;