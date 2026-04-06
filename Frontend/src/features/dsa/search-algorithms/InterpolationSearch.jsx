import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Code2,
  ArrowLeft, Shuffle, X, Eye, EyeOff, Zap, Target, Activity,
  Crosshair, WrapText, AlertCircle, CheckCircle2, ChevronDown, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../core/context/ThemeContext";
import { interpolationSearch as interpolationSearchCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// INTERPOLATION SEARCH STEP GENERATOR
// ============================================================================

const generateInterpolationSearchSteps = (inputArray, target) => {
  const arr = [...inputArray].sort((a, b) => a - b);
  const n = arr.length;
  const steps = [];
  let comparisons = 0;
  let lo = 0;
  let hi = n - 1;

  // Initial state
  steps.push({
    array: [...arr],
    low: 0,
    high: n - 1,
    probeIndex: -1,
    foundIndex: -1,
    comparisons: 0,
    codeLine: 1,
    commentary: `Starting Interpolation Search. Target: ${target}. Predicting position based on value distribution.`,
    phase: "start",
    status: "Initializing Probe...",
    formula: "",
    prediction: null
  });

  // Check if target is in range
  if (target < arr[lo] || target > arr[hi]) {
    steps.push({
      array: [...arr],
      low: lo,
      high: hi,
      probeIndex: -1,
      foundIndex: -1,
      comparisons: 0,
      codeLine: 2,
      commentary: `Target ${target} is outside array range [${arr[lo]}, ${arr[hi]}]. Cannot find.`,
      phase: "not_found",
      status: "Out of Range",
      formula: "",
      prediction: null
    });
    return steps;
  }

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    // Handle edge case
    if (lo === hi) {
      comparisons++;
      if (arr[lo] === target) {
        steps.push({
          array: [...arr],
          low: lo,
          high: hi,
          probeIndex: lo,
          foundIndex: lo,
          comparisons,
          codeLine: 3,
          commentary: `🎯 Target ${target} found at index ${lo}!`,
          phase: "found",
          status: `Found at Index ${lo}!`,
          formula: `Single element check`,
          prediction: { percentage: 100, guessedIndex: lo }
        });
        return steps;
      } else {
        steps.push({
          array: [...arr],
          low: lo,
          high: hi,
          probeIndex: lo,
          foundIndex: -1,
          comparisons,
          codeLine: 10,
          commentary: `Target ${target} not found. Only element left is ${arr[lo]}.`,
          phase: "not_found",
          status: "Target Not Found",
          formula: "",
          prediction: null
        });
        return steps;
      }
    }

    // Calculate interpolated position
    const range = arr[hi] - arr[lo];
    const fraction = (target - arr[lo]) / range;
    const pos = lo + Math.floor(fraction * (hi - lo));
    const percentage = Math.round(fraction * 100);
    comparisons++;

    const formulaStr = `pos = ${lo} + ⌊(${target} - ${arr[lo]}) / (${arr[hi]} - ${arr[lo]}) × (${hi} - ${lo})⌋ = ${pos}`;

    steps.push({
      array: [...arr],
      low: lo,
      high: hi,
      probeIndex: pos,
      foundIndex: -1,
      comparisons,
      codeLine: 4,
      commentary: `Interpolating: Target is ~${percentage}% through the range. Probing index ${pos}: arr[${pos}] = ${arr[pos]}`,
      phase: "probing",
      status: `Probing Index ${pos}`,
      formula: formulaStr,
      prediction: { percentage, guessedIndex: pos }
    });

    if (arr[pos] === target) {
      steps.push({
        array: [...arr],
        low: lo,
        high: hi,
        probeIndex: pos,
        foundIndex: pos,
        comparisons,
        codeLine: 5,
        commentary: `🎯 DIRECT HIT! Target ${target} found at index ${pos} in just ${comparisons} comparison${comparisons > 1 ? 's' : ''}!`,
        phase: "found",
        status: `Found at Index ${pos}!`,
        formula: formulaStr,
        prediction: { percentage, guessedIndex: pos }
      });
      return steps;
    } else if (arr[pos] < target) {
      steps.push({
        array: [...arr],
        low: pos + 1,
        high: hi,
        probeIndex: -1,
        foundIndex: -1,
        comparisons,
        codeLine: 6,
        commentary: `arr[${pos}] = ${arr[pos]} < ${target}. Target is higher. Narrowing to [${pos + 1}, ${hi}].`,
        phase: "narrowing",
        status: `L = ${pos + 1}`,
        formula: `${arr[pos]} < ${target} → lo = ${pos + 1}`,
        prediction: null
      });
      lo = pos + 1;
    } else {
      steps.push({
        array: [...arr],
        low: lo,
        high: pos - 1,
        probeIndex: -1,
        foundIndex: -1,
        comparisons,
        codeLine: 7,
        commentary: `arr[${pos}] = ${arr[pos]} > ${target}. Target is lower. Narrowing to [${lo}, ${pos - 1}].`,
        phase: "narrowing",
        status: `H = ${pos - 1}`,
        formula: `${arr[pos]} > ${target} → hi = ${pos - 1}`,
        prediction: null
      });
      hi = pos - 1;
    }
  }

  // Not found
  steps.push({
    array: [...arr],
    low: lo,
    high: hi,
    probeIndex: -1,
    foundIndex: -1,
    comparisons,
    codeLine: 8,
    commentary: `Target ${target} not found after ${comparisons} comparisons.`,
    phase: "not_found",
    status: "Target Not Found",
    formula: "",
    prediction: null
  });

  return steps;
};

// Generate uniform array (linear distribution)
const generateUniformArray = (size, step = 10) => {
  const start = Math.floor(Math.random() * 20) + 1;
  return Array.from({ length: size }, (_, i) => start + i * step);
};

// Generate random sorted array
const generateRandomSortedArray = (size) => {
  const values = new Set();
  while (values.size < size) {
    values.add(Math.floor(Math.random() * 200) + 1);
  }
  return Array.from(values).sort((a, b) => a - b);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Prediction HUD Component
const PredictionHUD = ({ prediction, probeIndex, comparisons, phase, array }) => {
  const getPhaseColor = () => {
    switch (phase) {
      case "found": return "text-pink-400";
      case "not_found": return "text-red-400";
      case "probing": return "text-purple-400";
      default: return "text-fuchsia-400";
    }
  };

  return (
    <div className="backdrop-blur-xl bg-black/60 border border-purple-500/30 rounded-2xl p-4 min-w-[240px] shadow-[0_0_30px_rgba(168,85,247,0.15)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <Sparkles size={16} className="text-purple-400" />
        </div>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Prediction HUD</span>
      </div>

      {/* Prediction */}
      {prediction && (
        <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Predicted Position</span>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${getPhaseColor()}`}>Index {prediction.guessedIndex}</span>
            <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
              ~{prediction.percentage}%
            </span>
          </div>
        </div>
      )}

      {/* Probe Value */}
      {probeIndex >= 0 && array && (
        <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Probe Value</span>
          <span className="text-lg font-black text-pink-400">{array[probeIndex]}</span>
        </div>
      )}

      {/* Comparisons */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-xs text-white/50 uppercase tracking-wider">Comparisons</span>
        <span className="text-lg font-black text-cyan-400">{comparisons}</span>
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
      ? "bg-pink-500/20 border-pink-500/40 text-pink-400"
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

  const codeLines = interpolationSearchCode[codeLanguage].split('\n');
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
            className="hidden xl:block absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-purple-500/50 transition-colors"
          />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Interpolation Search</h3>
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
                className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-purple-500 focus:outline-none transition-colors cursor-pointer appearance-none"
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
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
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
                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(168,85,247,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-purple-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-purple-400 font-bold" : "text-white/30"}`}>
                  {idx + 1}
                </span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-purple-100" : "text-white/70"}`}>
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

  const generators = [
    { id: "uniform", label: "Uniform (Best)", description: "Linear distribution - ideal for interpolation" },
    { id: "random", label: "Random", description: "Shows performance degradation" },
  ];

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
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Settings size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">Configuration</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} className="text-white/70" />
              </button>
            </div>

            {/* Generator Mode */}
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Data Distribution</label>
              <div className="space-y-2">
                {generators.map(gen => (
                  <button
                    key={gen.id}
                    onClick={() => setLocalConfig(prev => ({ ...prev, mode: gen.id }))}
                    className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer ${localConfig.mode === gen.id
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                  >
                    <span className={`font-semibold text-sm ${localConfig.mode === gen.id ? 'text-purple-400' : 'text-white/70'}`}>
                      {gen.label}
                    </span>
                    <p className="text-xs text-white/40 mt-0.5">{gen.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Array Size */}
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                Array Size: {localConfig.size}
              </label>
              <input
                type="range"
                min="10"
                max="40"
                value={localConfig.size}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, size: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-purple-500 bg-white/10"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>10</span>
                <span>40</span>
              </div>
            </div>

            {/* Target Value */}
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Target Value</label>
              <input
                type="number"
                min="1"
                max="500"
                value={localConfig.target}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, target: Number(e.target.value) }))}
                placeholder="Enter target to find"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* View Options */}
            <div className="mb-6">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">View Options</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, showValues: !prev.showValues }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${localConfig.showValues ? "bg-purple-500/20 text-purple-400 border border-purple-500/40" : "bg-white/5 text-white/50"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer"
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

const InterpolationSearch = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Configuration
  const [config, setConfig] = useState({
    size: 20,
    mode: "uniform",
    showValues: true,
    target: 150
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
    low: 0,
    high: array.length - 1,
    probeIndex: -1,
    foundIndex: -1,
    comparisons: 0,
    codeLine: 1,
    commentary: "Configure and generate an array to begin.",
    phase: "start",
    status: "Ready",
    formula: "",
    prediction: null
  };

  // Initialize
  const initializeSearch = useCallback((cfg) => {
    const cfgToUse = cfg || config;
    const newArray = cfgToUse.mode === "uniform"
      ? generateUniformArray(cfgToUse.size)
      : generateRandomSortedArray(cfgToUse.size);
    setArray(newArray);
    const allSteps = generateInterpolationSearchSteps(newArray, cfgToUse.target);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
    setToast(null);
  }, [config]);

  useEffect(() => {
    initializeSearch();
  }, []);

  // Apply config - only regenerate array if array-related settings changed
  const handleApplyConfig = (newConfig) => {
    const arraySettingsChanged =
      newConfig.size !== config.size ||
      newConfig.mode !== config.mode;

    setConfig(newConfig);

    if (arraySettingsChanged) {
      // Array settings changed, regenerate everything
      initializeSearch(newConfig);
    } else {
      // Only target or view options changed, keep existing array and regenerate steps
      const allSteps = generateInterpolationSearchSteps(array, newConfig.target);
      setSteps(allSteps);
      setCurrentStepIndex(0);
      setPlaying(false);
      setToast(null);
    }
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
    const delay = Math.max(150, 1000 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  // Show toast on completion
  useEffect(() => {
    if (currentStep.phase === "found") {
      setToast({ message: `Found in ${currentStep.comparisons} step${currentStep.comparisons > 1 ? 's' : ''}!`, type: "success" });
    } else if (currentStep.phase === "not_found") {
      setToast({ message: "Target not found", type: "error" });
    }
  }, [currentStep.phase, currentStep.comparisons]);

  // Bar styling
  const getBarStyle = (index, value) => {
    const maxVal = Math.max(...currentStep.array);
    const height = (value / maxVal) * 100;

    const isInRange = index >= currentStep.low && index <= currentStep.high;
    const isFound = currentStep.foundIndex === index;
    const isProbe = currentStep.probeIndex === index;
    const isLow = index === currentStep.low;
    const isHigh = index === currentStep.high;

    let bgClass = "from-slate-400 to-slate-500";
    let opacity = 1;
    let scale = 1;
    let glow = "";

    if (isFound) {
      bgClass = "from-pink-400 to-fuchsia-500";
      opacity = 1;
      scale = 1.1;
      glow = "shadow-[0_0_30px_rgba(236,72,153,0.6)]";
    } else if (isProbe && currentStep.phase === "probing") {
      bgClass = "from-purple-400 to-pink-500";
      opacity = 1;
      scale = 1.1;
      glow = "shadow-[0_0_25px_rgba(168,85,247,0.6)]";
    } else if (isInRange) {
      bgClass = "from-indigo-400 to-purple-500";
      opacity = 1;
    } else {
      opacity = 0.15;
    }

    return { height, bgClass, opacity, scale, glow, isLow, isHigh, isProbe };
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
            <div className="w-full h-[50vh] overflow-x-auto px-2 sm:px-4">
              {/* Bars container */}
              <div className="flex items-end justify-center gap-0.5 sm:gap-1 h-full relative min-w-max px-4">
                {displayArray.map((value, index) => {
                  const { height, bgClass, opacity, scale, glow, isLow, isHigh, isProbe } = getBarStyle(index, value);

                  return (
                    <motion.div
                      key={index}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative flex flex-col items-center justify-end h-full flex-shrink-0"
                      style={{ width: barWidth }}
                    >
                      {/* Pointer Arrows */}
                      <AnimatePresence>
                        {isLow && currentStep.phase !== "start" && (
                          <motion.div
                            key="low"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-14 flex flex-col items-center z-20"
                          >
                            <ChevronDown size={20} className="text-indigo-400" />
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">L</span>
                          </motion.div>
                        )}
                        {isHigh && currentStep.phase !== "start" && (
                          <motion.div
                            key="high"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-14 flex flex-col items-center z-20"
                          >
                            <ChevronDown size={20} className="text-violet-400" />
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/40 text-violet-400">H</span>
                          </motion.div>
                        )}
                        {/* Probe laser indicator */}
                        {isProbe && currentStep.phase === "probing" && (
                          <>
                            <motion.div
                              key="probe-laser"
                              initial={{ scaleY: 0, opacity: 0 }}
                              animate={{ scaleY: 1, opacity: 1 }}
                              exit={{ scaleY: 0, opacity: 0 }}
                              className="absolute -top-4 w-0.5 bg-gradient-to-b from-purple-400 via-pink-400 to-transparent z-30"
                              style={{ height: '60px', originY: 1 }}
                            />
                            <motion.div
                              key="probe"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="absolute -top-16 flex flex-col items-center z-30"
                            >
                              <Crosshair size={24} className="text-purple-400" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>

                      {/* Bar - scales from bottom so it doesn't overtake values */}
                      <motion.div
                        animate={{ scaleY: scale, scaleX: scale }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`w-full bg-gradient-to-t ${bgClass} rounded-t-lg ${glow}`}
                        style={{ height: `${height}%`, minHeight: 4, transformOrigin: 'bottom' }}
                      />

                      {/* Value Label - slanted on small screens */}
                      {config.showValues && (
                        <motion.span
                          animate={{ opacity }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="text-[7px] sm:text-[10px] font-bold text-white/60 mt-2 sm:rotate-0 origin-top-left"
                          style={{ transform: window.innerWidth < 640 ? 'rotate(-45deg)' : 'none' }}
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
              <h1 className="text-sm sm:text-base font-bold text-white">Interpolation Search</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs font-bold border border-purple-500/30">O(log log n)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Target size={12} className="text-purple-400" />
                <span className="text-xs sm:text-sm font-bold text-purple-400">{config.target}</span>
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
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Probe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Range</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Found</span>
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
            <Crosshair size={14} className="text-purple-400" />
            <span className="text-xs font-semibold text-white/80">Probe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
            <span className="text-xs font-semibold text-white/80">Active Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20" />
            <span className="text-xs font-semibold text-white/80">Eliminated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500" />
            <span className="text-xs font-semibold text-white/80">Found</span>
          </div>
        </motion.div>

        {/* DESKTOP: HEADS-UP HEADER */}
        <div className="hidden xl:block fixed top-6 left-20 z-40 backdrop-blur-xl bg-gray-900 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">Interpolation Search</h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
              O(log log n)
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {currentStep.commentary}
          </p>
          {currentStep.formula && (
            <p className="text-xs text-purple-400/80 font-mono mt-2 bg-purple-500/10 px-2 py-1 rounded-lg">
              {currentStep.formula}
            </p>
          )}
        </div>

        {/* DESKTOP: PREDICTION HUD */}
        <motion.div
          className="hidden xl:block fixed top-6 z-40"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <PredictionHUD
            prediction={currentStep.prediction}
            probeIndex={currentStep.probeIndex}
            comparisons={currentStep.comparisons}
            phase={currentStep.phase}
            array={currentStep.array}
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
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-purple-500"
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
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer"
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
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showCode ? 'bg-purple-500/30 border border-purple-500/50' : 'bg-white/5 hover:bg-white/10'}`}
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
    </div>
  );
};

export default InterpolationSearch;