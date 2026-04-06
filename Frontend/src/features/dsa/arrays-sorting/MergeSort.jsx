import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Code2,
  ArrowLeft, Shuffle, X, Eye, EyeOff, Zap,
  RefreshCw, Activity, Timer, Check, WrapText, ArrowDown, ArrowUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../core/context/ThemeContext";
import { mergeSort as mergeSortCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// MERGE SORT STEP GENERATOR (Enhanced with Lift & Drop tracking)
// ============================================================================

// Recursion depth colors
const DEPTH_COLORS = [
  { from: "from-cyan-400", to: "to-blue-500", bg: "#22d3ee" },
  { from: "from-indigo-400", to: "to-violet-500", bg: "#818cf8" },
  { from: "from-pink-400", to: "to-rose-500", bg: "#f472b6" },
  { from: "from-amber-400", to: "to-orange-500", bg: "#fbbf24" },
  { from: "from-teal-400", to: "to-emerald-500", bg: "#2dd4bf" },
];

const generateAllSteps = (inputArray, direction = "asc") => {
  const arr = [...inputArray];
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let merges = 0;
  const sorted = new Set();

  // Initial state
  steps.push({
    array: [...arr],
    auxiliaryArray: [],
    auxiliaryIndices: [],
    leftRange: [],
    rightRange: [],
    merging: [],
    bracketRange: [],
    recursionDepth: 0,
    phase: "start",
    sorted: [],
    comparisons: 0,
    merges: 0,
    codeLine: 1,
    commentary: "Starting Merge Sort. We'll divide the array recursively, then merge sorted subarrays.",
    sortedPercent: 0
  });

  const merge = (arr, left, mid, right, depth) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    // Show descending to auxiliary (preparing to merge)
    steps.push({
      array: [...arr],
      auxiliaryArray: [],
      auxiliaryIndices: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      leftRange: [left, mid],
      rightRange: [mid + 1, right],
      merging: [],
      bracketRange: [left, right],
      recursionDepth: depth,
      phase: "descending",
      sorted: Array.from(sorted),
      comparisons,
      merges,
      codeLine: 6,
      commentary: `↓ Descending to merge: Left [${left}..${mid}] and Right [${mid + 1}..${right}]`,
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    let i = 0, j = 0, k = left;
    const auxiliaryArray = [];
    const mergedIndices = [];

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      const takeLeft = direction === "asc" ? leftArr[i] <= rightArr[j] : leftArr[i] >= rightArr[j];

      if (takeLeft) {
        auxiliaryArray.push(leftArr[i]);
        arr[k] = leftArr[i];
        i++;
      } else {
        auxiliaryArray.push(rightArr[j]);
        arr[k] = rightArr[j];
        j++;
      }
      mergedIndices.push(k);
      merges++;
      k++;

      // Show merging in auxiliary layer
      steps.push({
        array: [...arr],
        auxiliaryArray: [...auxiliaryArray],
        auxiliaryIndices: mergedIndices.slice(),
        leftRange: [left, mid],
        rightRange: [mid + 1, right],
        merging: [k - 1],
        bracketRange: [left, right],
        recursionDepth: depth,
        phase: "merging",
        sorted: Array.from(sorted),
        comparisons,
        merges,
        codeLine: 10,
        commentary: `Comparing: Placed ${arr[k - 1]} at position ${k - 1} in merged array.`,
        sortedPercent: Math.round((sorted.size / n) * 100)
      });
    }

    // Copy remaining from left
    while (i < leftArr.length) {
      auxiliaryArray.push(leftArr[i]);
      arr[k] = leftArr[i];
      mergedIndices.push(k);
      merges++;
      i++;
      k++;
    }

    // Copy remaining from right
    while (j < rightArr.length) {
      auxiliaryArray.push(rightArr[j]);
      arr[k] = rightArr[j];
      mergedIndices.push(k);
      merges++;
      j++;
      k++;
    }

    // Show ascending back (merge complete)
    steps.push({
      array: [...arr],
      auxiliaryArray: [...auxiliaryArray],
      auxiliaryIndices: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      leftRange: [],
      rightRange: [],
      merging: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      bracketRange: [left, right],
      recursionDepth: depth,
      phase: "ascending",
      sorted: Array.from(sorted),
      comparisons,
      merges,
      codeLine: 22,
      commentary: `↑ Ascending! Merge complete for range [${left}..${right}]. Elements in sorted order.`,
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    // Mark as merged (but not necessarily fully sorted yet)
    if (left === 0 && right === n - 1) {
      for (let idx = left; idx <= right; idx++) sorted.add(idx);
    }
  };

  const mergeSort = (arr, left, right, depth = 0) => {
    if (left < right) {
      const mid = Math.floor(left + (right - left) / 2);

      // Show divide step
      steps.push({
        array: [...arr],
        auxiliaryArray: [],
        auxiliaryIndices: [],
        leftRange: [left, mid],
        rightRange: [mid + 1, right],
        merging: [],
        bracketRange: [left, right],
        recursionDepth: depth,
        phase: "divide",
        sorted: Array.from(sorted),
        comparisons,
        merges,
        codeLine: 3,
        commentary: `Dividing at mid=${mid}. Left: [${left}..${mid}], Right: [${mid + 1}..${right}] (depth ${depth})`,
        sortedPercent: Math.round((sorted.size / n) * 100)
      });

      mergeSort(arr, left, mid, depth + 1);
      mergeSort(arr, mid + 1, right, depth + 1);
      merge(arr, left, mid, right, depth);
    } else if (left === right) {
      steps.push({
        array: [...arr],
        auxiliaryArray: [],
        auxiliaryIndices: [],
        leftRange: [],
        rightRange: [],
        merging: [left],
        bracketRange: [left, left],
        recursionDepth: depth,
        phase: "single",
        sorted: Array.from(sorted),
        comparisons,
        merges,
        codeLine: 4,
        commentary: `Single element [${arr[left]}] at index ${left} - base case reached.`,
        sortedPercent: Math.round((sorted.size / n) * 100)
      });
    }
  };

  mergeSort(arr, 0, n - 1, 0);

  // Final state
  steps.push({
    array: [...arr],
    auxiliaryArray: [],
    auxiliaryIndices: [],
    leftRange: [],
    rightRange: [],
    merging: [],
    bracketRange: [],
    recursionDepth: 0,
    phase: "complete",
    sorted: Array.from({ length: n }, (_, i) => i),
    comparisons,
    merges,
    codeLine: 25,
    commentary: `🎉 Sorting complete! ${comparisons} comparisons, ${merges} merge operations.`,
    sortedPercent: 100
  });

  return steps;
};

// Array generators
const generateArray = (size, mode) => {
  switch (mode) {
    case "reverse": return Array.from({ length: size }, (_, i) => size - i);
    case "nearly":
      const nearly = Array.from({ length: size }, (_, i) => i + 1);
      for (let i = 0; i < Math.floor(size * 0.1); i++) {
        const a = Math.floor(Math.random() * size);
        const b = Math.floor(Math.random() * size);
        [nearly[a], nearly[b]] = [nearly[b], nearly[a]];
      }
      return nearly;
    default: return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
  }
};

// ============================================================================
// LIFT & DROP COMPONENTS
// ============================================================================

// Bracket Indicator Component
const BracketIndicator = ({ left, right, barWidth, totalBars }) => {
  if (left < 0 || right < 0 || left > right) return null;

  const leftPos = left * (barWidth + 4);
  const rightPos = (right + 1) * (barWidth + 4) - 4;
  const width = rightPos - leftPos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute -top-8 flex items-end"
      style={{ left: `calc(50% - ${(totalBars / 2) * (barWidth + 4)}px + ${leftPos}px)` }}
    >
      <div
        className="border-t-2 border-l-2 border-r-2 border-purple-400/70 rounded-t-lg"
        style={{ width, height: 16 }}
      />
      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        [{left}..{right}]
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
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
  };

  return (
    <motion.div
      animate={flash ? { scale: [1, 1.1, 1], backgroundColor: ["rgba(147,51,234,0.2)", "rgba(147,51,234,0.4)", "rgba(147,51,234,0.2)"] } : {}}
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
      <motion.div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.3 }} />
    </div>
    <span className="text-lg font-black text-green-400 shrink-0">{percent}%</span>
  </div>
);

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [wrapCode, setWrapCode] = useState(false);
  const panelRef = React.useRef(null);
  const languageLabels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const codeLines = mergeSortCode[codeLanguage].split('\n');

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
    const handleMouseMove = (e) => { const maxWidth = Math.min(700, window.innerWidth * 0.8); setPanelWidth(Math.max(350, Math.min(maxWidth, startWidth + startX - e.clientX))); };
    const handleMouseUp = () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div ref={panelRef} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full z-50 backdrop-blur-2xl bg-black/80 border-l border-white/10 flex flex-col shadow-2xl" style={{ width: panelWidth }}>
          <div onMouseDown={handleMouseDown} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-purple-500/50 transition-colors" />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"><Code2 size={18} className="text-white" /></div><h3 className="font-bold text-white">Merge Sort</h3></div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"><X size={20} className="text-white/70" /></button>
            </div>
            <div className="flex items-center gap-2">
              <select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)} className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-purple-500 focus:outline-none cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                {Object.keys(languageLabels).map(lang => (<option key={lang} value={lang} className="bg-slate-900">{languageLabels[lang]}</option>))}
              </select>
              <button onClick={() => setWrapCode(!wrapCode)} className={`p-2 rounded-lg transition-all cursor-pointer ${wrapCode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}><WrapText size={18} /></button>
            </div>
          </div>
          <div className={`flex-1 p-4 font-mono text-sm ${wrapCode ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {codeLines.map((line, idx) => (
              <motion.div key={idx} animate={idx + 1 === activeLine ? { backgroundColor: "rgba(234,179,8,0.2)" } : { backgroundColor: "transparent" }} className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-yellow-400" : ""}`}>
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

const SettingsModal = ({ isOpen, onClose, config, onApply }) => {
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
      if (validValues.length === values.length && validValues.length > 75) errors.push(`Too many elements! Maximum 75 allowed`);
      setCustomInputError(errors.length > 0 ? errors.map(e => `⚠️ ${e}`).join("\n") : "");
    } else { setCustomInputError(""); }
  }, [localConfig.customInput, localConfig.mode]);

  const modes = [{ id: "random", label: "Random" }, { id: "reverse", label: "Reverse Sorted" }, { id: "nearly", label: "Nearly Sorted" }, { id: "custom", label: "Custom" }];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div data-settings-modal="true" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md backdrop-blur-2xl bg-black/80 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500"><Settings size={18} className="text-white" /></div><h3 className="font-bold text-white text-lg">Configuration</h3></div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"><X size={20} className="text-white/70" /></button>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Input Mode</label>
              <div className="grid grid-cols-2 gap-2">{modes.map(mode => (<button key={mode.id} onClick={() => setLocalConfig(prev => ({ ...prev, mode: mode.id }))} className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer ${localConfig.mode === mode.id ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>{mode.label}</button>))}</div>
            </div>
            {localConfig.mode === "custom" && (
              <div className="mb-5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Custom Array</label>
                <input type="text" value={localConfig.customInput} onChange={(e) => setLocalConfig(prev => ({ ...prev, customInput: e.target.value }))} placeholder="e.g., 64, 34, 25, 12, 22" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none" />
                {customInputError && <p className="text-xs text-red-400 mt-2 whitespace-pre-line">{customInputError}</p>}
              </div>
            )}
            {localConfig.mode !== "custom" && (
              <div className="mb-5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Array Size: {localConfig.size}</label>
                <input type="range" min="5" max="50" value={localConfig.size} onChange={(e) => setLocalConfig(prev => ({ ...prev, size: Number(e.target.value) }))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-500" />
              </div>
            )}
            <div className="mb-6">
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

const MergeSort = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [config, setConfig] = useState({ size: 12, mode: "random", customInput: "", showValues: true, direction: "asc" });
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() => Math.min(450, window.innerWidth * 1));
  const [mergeFlash, setMergeFlash] = useState(false);

  const currentStep = steps[currentStepIndex] || {
    array: array, auxiliaryArray: [], auxiliaryIndices: [], leftRange: [], rightRange: [], merging: [],
    bracketRange: [], recursionDepth: 0, phase: "ready", sorted: [], comparisons: 0, merges: 0, codeLine: 1,
    commentary: "Ready to start Merge Sort.", sortedPercent: 0
  };

  const initializeSort = useCallback((cfg = config) => {
    let newArray;
    if (cfg.mode === "custom") {
      const values = cfg.customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0 && n < 100);
      newArray = values.length >= 2 ? values.slice(0, 75) : generateArray(cfg.size, "random");
    } else { newArray = generateArray(cfg.size, cfg.mode); }
    setArray(newArray);
    setSteps(generateAllSteps(newArray, cfg.direction));
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [config]);

  useEffect(() => { initializeSort(); }, []);
  const handleApplyConfig = (newConfig) => { setConfig(newConfig); initializeSort(newConfig); };

  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) { if (playing && currentStepIndex >= steps.length - 1) setPlaying(false); return; }
    const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), Math.max(50, 600 / speed));
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  useEffect(() => { if (currentStep.phase === "ascending") { setMergeFlash(true); setTimeout(() => setMergeFlash(false), 300); } }, [currentStepIndex]);

  // LIFT & DROP: Bar styling with Y-axis animation
  const getBarStyle = (index, value) => {
    const maxVal = Math.max(...currentStep.array);
    const height = (value / maxVal) * 100;

    // Start with gray/slate as the default color for all bars
    let bgClass = "from-slate-400 to-slate-500";
    let scale = 1;
    let glow = "";
    let yOffset = 0;
    let animation = "";

    // Lift & Drop Y-offset based on phase
    if (currentStep.phase === "descending" && currentStep.auxiliaryIndices.includes(index)) {
      yOffset = 40;
    } else if (currentStep.phase === "merging" && currentStep.auxiliaryIndices.includes(index)) {
      yOffset = 40;
    } else if (currentStep.phase === "ascending" && currentStep.merging.includes(index)) {
      yOffset = 0;
      animation = "animate-pulse";
      glow = "shadow-[0_0_20px_rgba(74,222,128,0.6)]";
    }

    // Color priority: Sorted > Merging > Active Left Range > Active Right Range > Default Gray
    if (currentStep.sorted.includes(index)) {
      // Final sorted elements - green
      bgClass = "from-green-400 to-emerald-500";
      glow = "shadow-[0_0_20px_rgba(52,211,153,0.5)]";
    } else if (currentStep.merging.includes(index)) {
      // Currently being merged - purple
      bgClass = "from-purple-400 to-violet-500";
      scale = 1.05;
      if (currentStep.phase === "ascending") {
        glow = "shadow-[0_0_20px_rgba(74,222,128,0.6)]";
        animation = "animate-pulse";
      }
    } else if (currentStep.leftRange.length === 2 && index >= currentStep.leftRange[0] && index <= currentStep.leftRange[1]) {
      // Left subarray - cyan/blue
      bgClass = "from-cyan-400 to-blue-500";
    } else if (currentStep.rightRange.length === 2 && index >= currentStep.rightRange[0] && index <= currentStep.rightRange[1]) {
      // Right subarray - pink/rose
      bgClass = "from-pink-400 to-rose-500";
    }
    // Else: stays gray (default unsorted)

    return { height, bgClass, scale, glow, yOffset, animation };
  };

  const displayArray = currentStep.array || array;
  // Use less padding on mobile, more on desktop
  const sidePadding = window.innerWidth < 640 ? 32 : window.innerWidth < 1024 ? 100 : 400;
  const availableWidth = window.innerWidth - sidePadding - (showCode ? panelWidth : 0);
  // Minimum bar width of 20px on mobile, 12px on desktop to maintain readability
  const minBarWidth = window.innerWidth < 640 ? 20 : 12;
  const barWidth = Math.max(minBarWidth, Math.min(60, availableWidth / displayArray.length));
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
              {/* Bar Chart with Lift & Drop */}
              <div className="relative flex items-end justify-center gap-1 h-full pb-24 z-10 min-w-max px-4">
                {/* Bracket Indicator */}
                <AnimatePresence>
                  {currentStep.bracketRange.length === 2 && (
                    <BracketIndicator
                      left={currentStep.bracketRange[0]}
                      right={currentStep.bracketRange[1]}
                      barWidth={barWidth}
                      totalBars={displayArray.length}
                    />
                  )}
                </AnimatePresence>

                {displayArray.map((value, index) => {
                  const { height, bgClass, scale, glow, yOffset, animation } = getBarStyle(index, value);
                  return (
                    <motion.div
                      key={index}
                      layout
                      animate={{ y: yOffset }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative flex flex-col items-center justify-end h-full flex-shrink-0"
                      style={{ width: barWidth }}
                    >
                      <motion.div
                        animate={{ scaleY: scale, scaleX: scale }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-full bg-gradient-to-t ${bgClass} rounded-t-lg ${glow} ${animation}`}
                        style={{ height: `${height}%`, minHeight: 4, transformOrigin: 'bottom' }}
                        layout
                      />
                      {config.showValues && (
                        <span className="text-[8px] sm:text-[10px] font-bold text-white/60 mt-1">{value}</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Phase Indicator - Fixed outside scrollable area */}
          {(currentStep.phase === "descending" || currentStep.phase === "ascending") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40"
            >
              {currentStep.phase === "descending" ? (
                <><ArrowDown size={16} className="text-purple-400" /><span className="text-sm font-bold text-purple-300">Descending to Merge</span></>
              ) : (
                <><ArrowUp size={16} className="text-green-400" /><span className="text-sm font-bold text-green-300">Ascending - Merge Complete!</span></>
              )}
            </motion.div>
          )}
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
              <h1 className="text-base sm:text-lg font-bold text-white">Merge Sort</h1>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] sm:text-xs font-bold border border-pink-500/30">L&D</span>
              {currentStep.recursionDepth > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs font-bold border border-indigo-500/30">
                  D{currentStep.recursionDepth}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Activity size={12} className="text-cyan-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-cyan-400">{currentStep.comparisons}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <RefreshCw size={12} className="text-purple-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-purple-400">{currentStep.merges}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                <Check size={12} className="text-green-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-green-400">{currentStep.sortedPercent}%</span>
              </div>
            </div>
          </div>
          {/* Legend Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 py-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Left</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-pink-400 to-rose-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Right</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-purple-400 to-violet-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Merge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Done</span>
            </div>
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
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" /><span className="text-xs font-semibold text-white/80">Left</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-rose-500" /><span className="text-xs font-semibold text-white/80">Right</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-violet-500" /><span className="text-xs font-semibold text-white/80">Merging</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" /><span className="text-xs font-semibold text-white/80">Sorted</span></div>
        </motion.div>

        {/* DESKTOP: HEADS-UP HEADER (≥ 1024px) */}
        <div className="hidden xl:block fixed top-6 left-20 z-40 backdrop-blur-xl bg-gray-900 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">Merge Sort</h1>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold border border-pink-500/30">Lift & Drop</span>
            {currentStep.recursionDepth > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                Depth {currentStep.recursionDepth}
              </span>
            )}
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
            <StatCard icon={RefreshCw} value={currentStep.merges} label="Merges" flash={mergeFlash} color="purple" />
            <StatCard icon={Timer} value={`${Math.round(speed * 1.67)}/s`} label="Speed" color="amber" />
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
            <input type="range" min="0" max={Math.max(0, steps.length - 1)} value={currentStepIndex} onChange={(e) => setCurrentStepIndex(parseInt(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500" />
            <span className="text-[10px] sm:text-[11px] xl:text-[12px] text-white font-medium translate-y-1">{currentStepIndex + 1}/{steps.length}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2">
            <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(prev => prev - 1)} disabled={currentStepIndex <= 0} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"><SkipBack size={18} className="text-white" /></button>
            <button onClick={() => setPlaying(!playing)} className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer">{playing ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}</button>
            <button onClick={() => currentStepIndex < steps.length - 1 && setCurrentStepIndex(prev => prev + 1)} disabled={currentStepIndex >= steps.length - 1} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"><SkipForward size={18} className="text-white" /></button>
            <button onClick={() => { setCurrentStepIndex(0); setPlaying(false); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"><RotateCcw size={18} className="text-white" /></button>
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

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} config={config} onApply={handleApplyConfig} />
      <CodePanel isOpen={showCode} onClose={() => setShowCode(false)} activeLine={currentStep.codeLine} panelWidth={panelWidth} setPanelWidth={setPanelWidth} />
    </div>
  );
};

export default MergeSort;