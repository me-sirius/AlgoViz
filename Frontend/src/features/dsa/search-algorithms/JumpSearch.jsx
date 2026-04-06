import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Code2,
  ArrowLeft, Shuffle, X, Eye, EyeOff, Zap, Target, Activity,
  Footprints, WrapText, AlertCircle, CheckCircle2, ChevronDown, GripVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../core/context/ThemeContext";
import { jumpSearch as jumpSearchCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// JUMP SEARCH STEP GENERATOR
// ============================================================================

const generateJumpSearchSteps = (inputArray, target, customBlockSize = null) => {
  const arr = [...inputArray].sort((a, b) => a - b);
  const n = arr.length;
  const steps = [];
  let comparisons = 0;

  const optimalBlockSize = Math.floor(Math.sqrt(n));
  const blockSize = customBlockSize || optimalBlockSize;
  const isOptimal = blockSize === optimalBlockSize;

  // Initial state
  steps.push({
    array: [...arr],
    phase: "start",
    currentIndex: -1,
    jumpHistory: [],
    blockStart: -1,
    blockEnd: -1,
    foundIndex: -1,
    comparisons: 0,
    codeLine: 1,
    commentary: `Starting Jump Search. Block size m = ${blockSize}${isOptimal ? ' (√n optimal)' : ' (custom)'}. Target: ${target}`,
    status: "Initializing...",
    blockSize,
    isOptimal
  });

  let prev = 0;
  let step = blockSize;
  const jumpHistory = [0];

  // Phase 1: Jumping
  while (step < n && arr[Math.min(step, n) - 1] < target) {
    comparisons++;
    const jumpTo = Math.min(step, n) - 1;

    steps.push({
      array: [...arr],
      phase: "jumping",
      currentIndex: jumpTo,
      jumpFrom: prev,
      jumpTo: jumpTo,
      jumpHistory: [...jumpHistory, jumpTo],
      blockStart: -1,
      blockEnd: -1,
      foundIndex: -1,
      comparisons,
      codeLine: 3,
      commentary: `🐸 JUMP! Index ${prev} → ${jumpTo}. arr[${jumpTo}] = ${arr[jumpTo]} < ${target}. Keep jumping!`,
      status: `Leaping to Index ${jumpTo}`,
      blockSize,
      isOptimal
    });

    jumpHistory.push(jumpTo);
    prev = step;
    step += blockSize;

    if (prev >= n) {
      steps.push({
        array: [...arr],
        phase: "not_found",
        currentIndex: -1,
        jumpHistory: [...jumpHistory],
        blockStart: -1,
        blockEnd: -1,
        foundIndex: -1,
        comparisons,
        codeLine: 5,
        commentary: `Jumped beyond array bounds. Target ${target} not found.`,
        status: "Target Not Found",
        blockSize,
        isOptimal
      });
      return steps;
    }
  }

  // Overshot - found the block
  const blockStart = prev;
  const blockEnd = Math.min(step, n) - 1;

  // Check if we're at the end
  if (step >= n) {
    comparisons++;
    if (arr[Math.min(step, n) - 1] < target) {
      steps.push({
        array: [...arr],
        phase: "not_found",
        currentIndex: -1,
        jumpHistory: [...jumpHistory],
        blockStart: -1,
        blockEnd: -1,
        foundIndex: -1,
        comparisons,
        codeLine: 5,
        commentary: `Target ${target} is larger than all elements. Not found.`,
        status: "Target Not Found",
        blockSize,
        isOptimal
      });
      return steps;
    }
  }

  steps.push({
    array: [...arr],
    phase: "block_found",
    currentIndex: blockEnd,
    jumpHistory: [...jumpHistory],
    blockStart,
    blockEnd,
    foundIndex: -1,
    comparisons,
    codeLine: 4,
    commentary: `Overshot! arr[${blockEnd}] = ${arr[blockEnd]} ≥ ${target}. Target is in block [${blockStart}, ${blockEnd}]. Switching to linear scan...`,
    status: `Block [${blockStart}...${blockEnd}]`,
    blockSize,
    isOptimal
  });

  // Phase 2: Linear search within block
  let linearIndex = blockStart;

  while (linearIndex <= blockEnd && arr[linearIndex] < target) {
    comparisons++;

    steps.push({
      array: [...arr],
      phase: "walking",
      currentIndex: linearIndex,
      jumpHistory: [...jumpHistory],
      blockStart,
      blockEnd,
      foundIndex: -1,
      comparisons,
      codeLine: 6,
      commentary: `Walking... Index ${linearIndex}: arr[${linearIndex}] = ${arr[linearIndex]} < ${target}. Step forward.`,
      status: `Scanning Index ${linearIndex}`,
      blockSize,
      isOptimal
    });

    linearIndex++;

    if (linearIndex > blockEnd) {
      steps.push({
        array: [...arr],
        phase: "not_found",
        currentIndex: -1,
        jumpHistory: [...jumpHistory],
        blockStart,
        blockEnd,
        foundIndex: -1,
        comparisons,
        codeLine: 7,
        commentary: `Reached end of block. Target ${target} not found.`,
        status: "Target Not Found",
        blockSize,
        isOptimal
      });
      return steps;
    }
  }

  // Check for match
  comparisons++;
  if (arr[linearIndex] === target) {
    steps.push({
      array: [...arr],
      phase: "found",
      currentIndex: linearIndex,
      jumpHistory: [...jumpHistory],
      blockStart,
      blockEnd,
      foundIndex: linearIndex,
      comparisons,
      codeLine: 8,
      commentary: `🎯 Found! Target ${target} at index ${linearIndex}. Total comparisons: ${comparisons}`,
      status: `Found at Index ${linearIndex}!`,
      blockSize,
      isOptimal
    });
  } else {
    steps.push({
      array: [...arr],
      phase: "not_found",
      currentIndex: linearIndex,
      jumpHistory: [...jumpHistory],
      blockStart,
      blockEnd,
      foundIndex: -1,
      comparisons,
      codeLine: 8,
      commentary: `arr[${linearIndex}] = ${arr[linearIndex]} ≠ ${target}. Target not found.`,
      status: "Target Not Found",
      blockSize,
      isOptimal
    });
  }

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

// Frog Icon Component
const FrogIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 3C7.03 3 3 7.03 3 12C3 14.66 4.11 17.03 5.91 18.66L5 22L8.34 21.09C9.44 21.67 10.68 22 12 22C16.97 22 21 17.97 21 13C21 11.68 20.67 10.44 20.09 9.34L22 6L18.66 5.91C17.03 4.11 14.66 3 12 3M12 5C13.99 5 15.74 5.79 17.05 7.04L16.27 7.82C15.22 6.93 13.66 6.5 12 6.5C10.34 6.5 8.78 6.93 7.73 7.82L6.95 7.04C8.26 5.79 10.01 5 12 5M8 11C8.83 11 9.5 11.67 9.5 12.5S8.83 14 8 14 6.5 13.33 6.5 12.5 7.17 11 8 11M16 11C16.83 11 17.5 11.67 17.5 12.5S16.83 14 16 14 14.5 13.33 14.5 12.5 15.17 11 16 11M12 14C13.5 14 14.87 14.68 15.5 15.5C15.5 15.5 14.46 17 12 17S8.5 15.5 8.5 15.5C9.13 14.68 10.5 14 12 14Z" />
  </svg>
);

// Draggable Leap HUD Component
const LeapHUD = ({ phase, blockSize, isOptimal, blockStart, blockEnd, currentIndex, comparisons, jumpHistory, position, onDrag }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const hudRef = useRef(null);

  const getPhaseLabel = () => {
    switch (phase) {
      case "jumping": return "Phase 1: Jumping";
      case "block_found": return "Block Located!";
      case "walking": return "Phase 2: Walking";
      case "found": return "Target Acquired!";
      case "not_found": return "Search Complete";
      default: return "Initializing...";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "jumping": return "text-green-400";
      case "block_found": return "text-amber-400";
      case "walking": return "text-blue-400";
      case "found": return "text-emerald-400";
      case "not_found": return "text-red-400";
      default: return "text-lime-400";
    }
  };

  const handleMouseDown = (e) => {
    if (!hudRef.current) return;
    setIsDragging(true);
    const rect = hudRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 260, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 300, e.clientY - dragOffset.y));
      onDrag({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onDrag]);

  return (
    <div
      ref={hudRef}
      className={`backdrop-blur-xl bg-black/60 border border-lime-500/30 rounded-2xl p-4 min-w-[240px] shadow-[0_0_30px_rgba(132,204,22,0.15)] ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center gap-2 mb-3 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <GripVertical size={14} className="text-white/40" />
        </div>
        <div className="p-2 rounded-xl bg-gradient-to-br from-lime-500/20 to-green-500/20 border border-lime-500/30">
          <Footprints size={16} className="text-lime-400" />
        </div>
        <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">Leap HUD</span>
      </div>

      {/* Phase */}
      <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Phase</span>
        <span className={`text-sm font-bold ${getPhaseColor()}`}>{getPhaseLabel()}</span>
      </div>

      {/* Block Size */}
      <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Block Size</span>
        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-lime-400">m = {blockSize}</span>
          {isOptimal && (
            <span className="text-[10px] text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
              √n optimal
            </span>
          )}
        </div>
      </div>

      {/* Jump Path */}
      {jumpHistory && jumpHistory.length > 1 && (
        <div className="mb-3">
          <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Jump Path</span>
          <span className="text-xs font-mono text-green-400">
            {jumpHistory.slice(0, 6).join(' → ')}{jumpHistory.length > 6 ? '...' : ''}
          </span>
        </div>
      )}

      {/* Current Block */}
      {blockStart >= 0 && (
        <div className="mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Search Block</span>
          <span className="text-sm font-bold text-blue-400">[{blockStart} ... {blockEnd}]</span>
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
      ? "bg-lime-500/20 border-lime-500/40 text-lime-400"
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

  const codeLines = jumpSearchCode[codeLanguage].split('\n');
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
            className="hidden xl:block absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-lime-500/50 transition-colors"
          />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-lime-500 to-green-500">
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Jump Search</h3>
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
                className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-lime-500 focus:outline-none transition-colors cursor-pointer appearance-none"
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
                  ? 'bg-lime-500/20 text-lime-400 border border-lime-500/40'
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
                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(132,204,22,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-lime-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-lime-400 font-bold" : "text-white/30"}`}>
                  {idx + 1}
                </span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-lime-100" : "text-white/70"}`}>
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

  const optimalBlockSize = Math.floor(Math.sqrt(localConfig.size));

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
                <div className="p-2 rounded-xl bg-gradient-to-br from-lime-500 to-green-500">
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
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-lime-500 bg-white/10"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>10</span>
                <span>50</span>
              </div>
            </div>

            {/* Block Size Override */}
            <div className="mb-5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                Block Size (m): {localConfig.blockSize || optimalBlockSize}
                {(!localConfig.blockSize || localConfig.blockSize === optimalBlockSize) && (
                  <span className="ml-2 text-green-400">(√n optimal)</span>
                )}
              </label>
              <input
                type="range"
                min="2"
                max="15"
                value={localConfig.blockSize || optimalBlockSize}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, blockSize: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-lime-500 bg-white/10"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>2 (slow)</span>
                <span>15 (fast jumps)</span>
              </div>
              <button
                onClick={() => setLocalConfig(prev => ({ ...prev, blockSize: null }))}
                className="mt-2 text-xs text-lime-400 hover:underline cursor-pointer"
              >
                Reset to optimal (√{localConfig.size} = {Math.floor(Math.sqrt(localConfig.size))})
              </button>
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
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-lime-500 focus:outline-none transition-colors"
              />
            </div>

            {/* View Options */}
            <div className="mb-6">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">View Options</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, showValues: !prev.showValues }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${localConfig.showValues ? "bg-lime-500/20 text-lime-400 border border-lime-500/40" : "bg-white/5 text-white/50"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold shadow-lg hover:shadow-lime-500/25 transition-all cursor-pointer"
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

const JumpSearch = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const containerRef = useRef(null);

  // Configuration
  const [config, setConfig] = useState({
    size: 25,
    showValues: true,
    target: 42,
    blockSize: null // null = use optimal
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
  const [hudPosition, setHudPosition] = useState({ x: 80, y: 160 });

  // Current step data
  const currentStep = steps[currentStepIndex] || {
    array: array,
    phase: "start",
    currentIndex: -1,
    jumpHistory: [],
    blockStart: -1,
    blockEnd: -1,
    foundIndex: -1,
    comparisons: 0,
    codeLine: 1,
    commentary: "Configure and generate an array to begin.",
    status: "Ready",
    blockSize: Math.floor(Math.sqrt(array.length)),
    isOptimal: true
  };

  // Initialize
  const initializeSearch = useCallback((cfg = config) => {
    const newArray = generateSortedArray(cfg.size);
    setArray(newArray);
    const blockSize = cfg.blockSize || Math.floor(Math.sqrt(cfg.size));
    const allSteps = generateJumpSearchSteps(newArray, cfg.target, cfg.blockSize);
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
    const delay = Math.max(100, 700 / speed);
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

    const isJumpHistory = currentStep.jumpHistory && currentStep.jumpHistory.includes(index);
    const isCurrentIndex = currentStep.currentIndex === index;
    const isInBlock = currentStep.blockStart >= 0 &&
      index >= currentStep.blockStart && index <= currentStep.blockEnd;
    const isFound = currentStep.foundIndex === index;
    const isWalking = currentStep.phase === "walking";

    let bgClass = "from-slate-400 to-slate-500";
    let opacity = 1;
    let scale = 1;
    let glow = "";

    if (isFound) {
      bgClass = "from-lime-400 to-green-500";
      opacity = 1;
      scale = 1.1;
      glow = "shadow-[0_0_30px_rgba(132,204,22,0.6)]";
    } else if (isCurrentIndex && currentStep.phase === "jumping") {
      bgClass = "from-green-400 to-lime-500";
      opacity = 1;
      scale = 1.1;
      glow = "shadow-[0_0_25px_rgba(34,197,94,0.6)]";
    } else if (isCurrentIndex && isWalking) {
      bgClass = "from-blue-400 to-cyan-500";
      opacity = 1;
      scale = 1.05;
      glow = "shadow-[0_0_20px_rgba(59,130,246,0.5)]";
    } else if (isInBlock) {
      bgClass = "from-blue-400/70 to-cyan-500/70";
      opacity = 0.8;
    } else if (isJumpHistory) {
      bgClass = "from-green-300/40 to-lime-400/40";
      opacity = 0.5;
    } else {
      opacity = 0.25;
    }

    return { height, bgClass, opacity, scale, glow };
  };

  const displayArray = currentStep.array || array;
  // Calculate available width considering code panel and margins (matching BubbleSort)
  const availableWidth = window.innerWidth - 400 - (showCode ? panelWidth : 0);
  const barWidth = Math.max(12, Math.min(60, availableWidth / displayArray.length));

  // Calculate arc for jump animation
  const getJumpArc = () => {
    if (currentStep.phase !== "jumping" || !currentStep.jumpFrom === undefined) return null;
    return {
      from: currentStep.jumpFrom || 0,
      to: currentStep.jumpTo || currentStep.currentIndex
    };
  };

  const jumpArc = getJumpArc();

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
        <div ref={containerRef} className="absolute inset-0 flex flex-col pt-28 sm:pt-40 pb-40 sm:pb-60 overflow-auto">
          {/* SVG Jump Arc Overlay */}
          {jumpArc && (
            <svg className="absolute inset-0 pointer-events-none z-30" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                d={`M ${50 + jumpArc.from * (barWidth + 4)} 60% Q ${50 + (jumpArc.from + jumpArc.to) / 2 * (barWidth + 4)} 30%, ${50 + jumpArc.to * (barWidth + 4)} 60%`}
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="8 4"
              />
            </svg>
          )}

          {/* Main content area */}
          <div className="flex-1 flex items-end justify-center">
            {/* Scrollable wrapper */}
            <div className="w-full h-[50vh] overflow-x-auto px-2 sm:px-4 xl:px-8">
              {/* Bars container */}
              <div className="flex items-end justify-center gap-0.5 sm:gap-1 h-full relative min-w-max px-4">
                {displayArray.map((value, index) => {
                  const { height, bgClass, opacity, scale, glow } = getBarStyle(index, value);
                  const isCurrentIndex = currentStep.currentIndex === index;

                  return (
                    <motion.div
                      key={index}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative flex flex-col items-center justify-end h-full flex-shrink-0"
                      style={{ width: barWidth }}
                    >
                      {/* Frog Indicator */}
                      <AnimatePresence>
                        {isCurrentIndex && (currentStep.phase === "jumping" || currentStep.phase === "block_found") && (
                          <motion.div
                            key="frog"
                            initial={{ opacity: 0, y: -30, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="absolute -top-12 flex flex-col items-center z-30"
                          >
                            <span className="text-2xl">🐸</span>
                          </motion.div>
                        )}
                        {isCurrentIndex && currentStep.phase === "walking" && (
                          <motion.div
                            key="walking"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute -top-10 flex flex-col items-center z-30"
                          >
                            <ChevronDown size={24} className="text-blue-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bar - animates height for highlight effect */}
                      <motion.div
                        animate={{
                          scaleY: scale,
                          scaleX: scale
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`w-full bg-gradient-to-t ${bgClass} rounded-t-lg ${glow}`}
                        style={{ height: `${height}%`, minHeight: 4 }}
                      />

                      {/* Value Label - moves with bar */}
                      {config.showValues && (
                        <motion.span
                          animate={{
                            opacity,
                            y: (scale - 1) * 30  // push down when bar scales up
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="text-[8px] sm:text-[10px] font-bold text-white/60 mt-2 sm:mt-2"
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
              <h1 className="text-base sm:text-lg font-bold text-white">Jump Search</h1>
              <span className="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-400 text-[10px] sm:text-xs font-bold border border-lime-500/30">O(√n)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-lime-500/10 border border-lime-500/30">
                <Target size={12} className="text-lime-400" />
                <span className="text-xs sm:text-sm font-bold text-lime-400">{config.target}</span>
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
              <span className="text-sm">🐸</span>
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Jumping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Walking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-lime-400 to-green-500" />
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
            <span className="text-lg">🐸</span>
            <span className="text-xs font-semibold text-white/80">Jumping Phase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-300/40 to-lime-400/40" />
            <span className="text-xs font-semibold text-white/80">Jump Trail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />
            <span className="text-xs font-semibold text-white/80">Walking Phase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-lime-400 to-green-500" />
            <span className="text-xs font-semibold text-white/80">Found</span>
          </div>
        </motion.div>

        {/* DESKTOP: HEADS-UP HEADER */}
        <div className="hidden xl:block fixed top-6 left-20 z-40 backdrop-blur-xl bg-gray-900 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">Jump Search</h1>
            <span className="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-400 text-xs font-bold border border-lime-500/30">
              O(√n)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
              Easy
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {currentStep.commentary}
          </p>
        </div>

        {/* DESKTOP: LEAP HUD (Draggable) */}
        <div
          className="hidden xl:block fixed z-40"
          style={{ left: hudPosition.x, top: hudPosition.y }}
        >
          <LeapHUD
            phase={currentStep.phase}
            blockSize={currentStep.blockSize}
            isOptimal={currentStep.isOptimal}
            blockStart={currentStep.blockStart}
            blockEnd={currentStep.blockEnd}
            currentIndex={currentStep.currentIndex}
            comparisons={currentStep.comparisons}
            jumpHistory={currentStep.jumpHistory}
            position={hudPosition}
            onDrag={setHudPosition}
          />
        </div>

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
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-lime-500"
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
              className="p-3 rounded-xl bg-gradient-to-r from-lime-500 to-green-500 hover:shadow-lg hover:shadow-lime-500/25 transition-all cursor-pointer"
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
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showCode ? 'bg-lime-500/30 border border-lime-500/50' : 'bg-white/5 hover:bg-white/10'}`}
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

export default JumpSearch;