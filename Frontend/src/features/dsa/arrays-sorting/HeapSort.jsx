import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Code2,
  ArrowLeft, Shuffle, X, Eye, EyeOff, Zap,
  RefreshCw, Activity, Timer, Check, WrapText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../core/context/ThemeContext";
import { heapSort as heapSortCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// HEAP SORT STEP GENERATOR (Enhanced with Dual View tracking)
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
    heapifyPath: [],        // Path being traversed in heapify
    comparingNodes: [],     // Nodes being compared
    swappingNodes: [],      // Nodes being swapped
    heapBoundary: n,        // Unsorted heap size
    rootHighlight: false,
    phase: "start",
    sorted: [],
    comparisons: 0,
    swaps: 0,
    codeLine: 1,
    commentary: "Starting Heap Sort. First, we'll build a Max Heap from the array.",
    sortedPercent: 0
  });

  const heapify = (arr, heapSize, i, phaseType) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    // Show heapify start
    steps.push({
      array: [...arr],
      heapifyPath: [i],
      comparingNodes: [],
      swappingNodes: [],
      heapBoundary: heapSize,
      rootHighlight: i === 0,
      phase: phaseType,
      sorted: Array.from(sorted),
      comparisons,
      swaps,
      codeLine: 1,
      commentary: `Heapifying node ${i} (value: ${arr[i]}). Checking children...`,
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    // Compare with left child
    if (left < heapSize) {
      comparisons++;
      const shouldUpdate = direction === "asc" ? arr[left] > arr[largest] : arr[left] < arr[largest];

      steps.push({
        array: [...arr],
        heapifyPath: [i, left],
        comparingNodes: [left, largest],
        swappingNodes: [],
        heapBoundary: heapSize,
        rootHighlight: false,
        phase: "compare",
        sorted: Array.from(sorted),
        comparisons,
        swaps,
        codeLine: 7,
        commentary: `Comparing left child (${arr[left]}) with node (${arr[largest]}). ${shouldUpdate ? "Left is larger!" : "Parent is larger."}`,
        sortedPercent: Math.round((sorted.size / n) * 100)
      });

      if (shouldUpdate) largest = left;
    }

    // Compare with right child
    if (right < heapSize) {
      comparisons++;
      const shouldUpdate = direction === "asc" ? arr[right] > arr[largest] : arr[right] < arr[largest];

      steps.push({
        array: [...arr],
        heapifyPath: [i, right],
        comparingNodes: [right, largest],
        swappingNodes: [],
        heapBoundary: heapSize,
        rootHighlight: false,
        phase: "compare",
        sorted: Array.from(sorted),
        comparisons,
        swaps,
        codeLine: 11,
        commentary: `Comparing right child (${arr[right]}) with current largest (${arr[largest]}). ${shouldUpdate ? "Right is larger!" : "Current is larger."}`,
        sortedPercent: Math.round((sorted.size / n) * 100)
      });

      if (shouldUpdate) largest = right;
    }

    // Swap if needed
    if (largest !== i) {
      swaps++;
      [arr[i], arr[largest]] = [arr[largest], arr[i]];

      steps.push({
        array: [...arr],
        heapifyPath: [i, largest],
        comparingNodes: [],
        swappingNodes: [i, largest],
        heapBoundary: heapSize,
        rootHighlight: false,
        phase: "swap",
        sorted: Array.from(sorted),
        comparisons,
        swaps,
        codeLine: 16,
        commentary: `Swapping ${arr[largest]} ↔ ${arr[i]} to maintain heap property.`,
        sortedPercent: Math.round((sorted.size / n) * 100)
      });

      // Recursively heapify
      heapify(arr, heapSize, largest, "heapify");
    }
  };

  // Phase 1: Build Max Heap
  steps.push({
    array: [...arr],
    heapifyPath: [],
    comparingNodes: [],
    swappingNodes: [],
    heapBoundary: n,
    rootHighlight: false,
    phase: "building",
    sorted: [],
    comparisons,
    swaps,
    codeLine: 3,
    commentary: "PHASE 1: Building Max Heap by heapifying from last non-leaf node upward.",
    sortedPercent: 0
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, "building");
  }

  // Max heap built
  steps.push({
    array: [...arr],
    heapifyPath: [],
    comparingNodes: [],
    swappingNodes: [],
    heapBoundary: n,
    rootHighlight: true,
    phase: "heap-built",
    sorted: [],
    comparisons,
    swaps,
    codeLine: 5,
    commentary: "✓ Max Heap built! Root contains the maximum element. Starting extraction phase.",
    sortedPercent: 0
  });

  // Phase 2: Extract elements
  for (let i = n - 1; i > 0; i--) {
    // Highlight root for extraction
    steps.push({
      array: [...arr],
      heapifyPath: [],
      comparingNodes: [],
      swappingNodes: [],
      heapBoundary: i + 1,
      rootHighlight: true,
      phase: "extracting",
      sorted: Array.from(sorted),
      comparisons,
      swaps,
      codeLine: 7,
      commentary: `PHASE 2: Extracting max ${arr[0]} from root. Moving to position ${i}.`,
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    // Swap root with last unsorted
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    sorted.add(i);

    steps.push({
      array: [...arr],
      heapifyPath: [],
      comparingNodes: [],
      swappingNodes: [0, i],
      heapBoundary: i,
      rootHighlight: false,
      phase: "swap",
      sorted: Array.from(sorted),
      comparisons,
      swaps,
      codeLine: 8,
      commentary: `Swapped! ${arr[i]} is now in its final sorted position.`,
      sortedPercent: Math.round((sorted.size / n) * 100)
    });

    // Heapify the reduced heap
    if (i > 1) {
      heapify(arr, i, 0, "extracting");
    }
  }

  // Mark first element as sorted
  sorted.add(0);

  // Final state
  steps.push({
    array: [...arr],
    heapifyPath: [],
    comparingNodes: [],
    swappingNodes: [],
    heapBoundary: 0,
    rootHighlight: false,
    phase: "complete",
    sorted: Array.from({ length: n }, (_, i) => i),
    comparisons,
    swaps,
    codeLine: 9,
    commentary: `🎉 Sorting complete! ${comparisons} comparisons, ${swaps} swaps.`,
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
// DUAL VIEW COMPONENTS
// ============================================================================

// Binary Tree Node Component
const TreeNode = ({ value, x, y, isRoot, isComparing, isSwapping, isSorted, isInHeap, isOnPath, nodeSize = 36 }) => {
  let bgClass = "from-cyan-500 to-blue-500"; // default unsorted
  let glow = "";
  let scale = 1;

  if (isSorted) {
    bgClass = "from-green-400 to-emerald-500";
    glow = "shadow-[0_0_15px_rgba(52,211,153,0.6)]";
  } else if (isSwapping) {
    bgClass = "from-red-400 to-rose-500";
    scale = 1.15;
    glow = "shadow-[0_0_20px_rgba(248,113,113,0.8)]";
  } else if (isRoot && isInHeap) {
    bgClass = "from-amber-400 to-orange-500";
    scale = 1.1;
    glow = "shadow-[0_0_20px_rgba(251,191,36,0.7)]";
  } else if (isComparing) {
    bgClass = "from-yellow-400 to-amber-500";
    scale = 1.1;
  } else if (isOnPath) {
    bgClass = "from-purple-400 to-violet-500";
  } else if (!isInHeap) {
    bgClass = "from-gray-500 to-gray-600";
  }

  return (
    <motion.div
      initial={false}
      animate={{
        scale,
        left: x - nodeSize / 2,
        top: y - nodeSize / 2
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`absolute flex items-center justify-center rounded-full bg-gradient-to-br ${bgClass} ${glow} font-bold text-white text-xs`}
      style={{
        width: nodeSize,
        height: nodeSize,
        opacity: isSorted || isInHeap ? 1 : 0.4
      }}
    >
      {value}
    </motion.div>
  );
};

// Tree Edge Component
const TreeEdge = ({ x1, y1, x2, y2, isActive, isSorted }) => {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isSorted ? "#4ade80" : isActive ? "#a855f7" : "#ffffff20"}
      strokeWidth={isActive ? 3 : 2}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

// Binary Tree View Component
const BinaryTreeView = ({ array, currentStep }) => {
  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 300 });
  const n = array.length;

  // Measure container using ResizeObserver for proper tracking
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver for container size changes (code panel open/close)
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate node positions based on measured dimensions
  const nodePositions = useMemo(() => {
    const positions = [];
    if (n === 0) return positions;

    const maxLevel = Math.floor(Math.log2(n)) + 1;
    const horizontalPadding = 40;
    const topPadding = 30;  // Reduced - container already has padding
    const bottomPadding = 20;
    const availableHeight = dimensions.height - topPadding - bottomPadding;
    const verticalSpacing = maxLevel > 1 ? availableHeight / (maxLevel - 1) : availableHeight;

    // Calculate minimum width based on last level node count
    const nodesInLastLevel = Math.pow(2, maxLevel - 1);
    const minNodeSpacing = 50; // Minimum spacing between nodes on last level
    const calculatedWidth = Math.max(dimensions.width, nodesInLastLevel * minNodeSpacing + horizontalPadding * 2);

    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const nodesInLevel = Math.pow(2, level);
      const posInLevel = i - (Math.pow(2, level) - 1);
      const levelWidth = calculatedWidth - horizontalPadding * 2;
      const spacing = levelWidth / nodesInLevel;

      positions.push({
        x: horizontalPadding + spacing * (posInLevel + 0.5),
        y: topPadding + (level * verticalSpacing)
      });
    }
    return positions;
  }, [n, dimensions.width, dimensions.height]);

  // Calculate minimum container width for proper scrolling
  const minContainerWidth = useMemo(() => {
    const maxLevel = Math.floor(Math.log2(n)) + 1;
    const nodesInLastLevel = Math.pow(2, maxLevel - 1);
    return nodesInLastLevel * 50 + 80; // 50px per node + padding
  }, [n]);

  // Generate edges
  const edges = useMemo(() => {
    const edgeList = [];
    for (let i = 0; i < n; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n) edgeList.push({ from: i, to: left });
      if (right < n) edgeList.push({ from: i, to: right });
    }
    return edgeList;
  }, [n]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-x-auto overflow-y-hidden">
      <div style={{ minWidth: minContainerWidth, width: '100%', height: '100%', position: 'relative' }}>
        {/* Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map(({ from, to }, idx) => {
            const isActive = currentStep.heapifyPath.includes(from) && currentStep.heapifyPath.includes(to);
            const isSorted = currentStep.sorted.includes(from) && currentStep.sorted.includes(to);
            return (
              <TreeEdge
                key={idx}
                x1={nodePositions[from]?.x || 0}
                y1={nodePositions[from]?.y || 0}
                x2={nodePositions[to]?.x || 0}
                y2={nodePositions[to]?.y || 0}
                isActive={isActive}
                isSorted={isSorted}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {array.map((value, index) => {
          const pos = nodePositions[index];
          if (!pos) return null;

          return (
            <TreeNode
              key={index}
              value={value}
              x={pos.x}
              y={pos.y}
              isRoot={index === 0 && currentStep.rootHighlight}
              isComparing={currentStep.comparingNodes.includes(index)}
              isSwapping={currentStep.swappingNodes.includes(index)}
              isSorted={currentStep.sorted.includes(index)}
              isInHeap={index < currentStep.heapBoundary}
              isOnPath={currentStep.heapifyPath.includes(index)}
            />
          );
        })}
      </div>
    </div>
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
      animate={flash ? { scale: [1, 1.1, 1] } : {}}
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
  const codeLines = heapSortCode[codeLanguage].split('\n');

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
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"><Code2 size={18} className="text-white" /></div><h3 className="font-bold text-white">Heap Sort</h3></div>
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
      if (validValues.length === values.length && validValues.length > 31) errors.push(`Tree view limited to 31 elements`);
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
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Custom Array (max 31 for tree)</label>
                <input type="text" value={localConfig.customInput} onChange={(e) => setLocalConfig(prev => ({ ...prev, customInput: e.target.value }))} placeholder="e.g., 64, 34, 25, 12, 22" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none" />
                {customInputError && <p className="text-xs text-red-400 mt-2 whitespace-pre-line">{customInputError}</p>}
              </div>
            )}
            {localConfig.mode !== "custom" && (
              <div className="mb-5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Array Size: {localConfig.size}</label>
                <input type="range" min="5" max="31" value={localConfig.size} onChange={(e) => setLocalConfig(prev => ({ ...prev, size: Number(e.target.value) }))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-500" />
                <div className="flex justify-between text-xs text-white/40 mt-1"><span>5</span><span>31 (tree limit)</span></div>
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

const HeapSort = () => {
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
    array: array, heapifyPath: [], comparingNodes: [], swappingNodes: [], heapBoundary: array.length,
    rootHighlight: false, phase: "ready", sorted: [], comparisons: 0, swaps: 0, codeLine: 1,
    commentary: "Ready to start Heap Sort.", sortedPercent: 0
  };

  const initializeSort = useCallback((cfg = config) => {
    let newArray;
    if (cfg.mode === "custom") {
      const values = cfg.customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0 && n < 100);
      newArray = values.length >= 2 ? values.slice(0, 31) : generateArray(Math.min(cfg.size, 31), "random");
    } else { newArray = generateArray(Math.min(cfg.size, 31), cfg.mode); }
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

  useEffect(() => { if (currentStep.phase === "swap") { setSwapFlash(true); setTimeout(() => setSwapFlash(false), 300); } }, [currentStepIndex]);

  // Bar styling
  const getBarStyle = (index, value) => {
    const maxVal = Math.max(...currentStep.array);
    const height = (value / maxVal) * 100;

    let bgClass = "from-slate-400 to-slate-500"; // default unsorted
    let glow = "";
    let scale = 1;

    if (currentStep.sorted.includes(index)) {
      bgClass = "from-green-400 to-emerald-500";
      glow = "shadow-[0_0_15px_rgba(52,211,153,0.5)]";
    } else if (currentStep.swappingNodes.includes(index)) {
      bgClass = "from-red-400 to-rose-500";
      scale = 1.1;
    } else if (index === 0 && currentStep.rootHighlight) {
      bgClass = "from-amber-400 to-orange-500";
      glow = "shadow-[0_0_20px_rgba(251,191,36,0.6)]";
    } else if (currentStep.comparingNodes.includes(index)) {
      bgClass = "from-yellow-400 to-amber-500";
    } else if (currentStep.heapifyPath.includes(index)) {
      bgClass = "from-purple-400 to-violet-500";
    } else if (index >= currentStep.heapBoundary) {
      // Already sorted (dimmed in heap view)
      bgClass = "from-gray-500 to-gray-600";
    }

    return { height, bgClass, glow, scale };
  };

  const displayArray = currentStep.array || array;
  // Use less padding on mobile, more on desktop
  const sidePadding = window.innerWidth < 640 ? 32 : window.innerWidth < 1024 ? 100 : 400;
  const availableWidth = window.innerWidth - sidePadding - (showCode ? panelWidth : 0);
  // Minimum bar width of 16px on mobile
  const minBarWidth = window.innerWidth < 640 ? 16 : 16;
  const barWidth = Math.max(minBarWidth, Math.min(40, availableWidth / displayArray.length));

  return (
    <div className="fixed inset-0 bg-[#0b0b0d] overflow-x-auto overflow-y-hidden flex">
      <motion.div
        layout
        className="relative flex-1 h-full"
        initial={false}
        animate={{ marginRight: showCode ? panelWidth : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >

        {/* DUAL VIEW LAYOUT - Adjusted for better spacing */}
        <div className="absolute inset-0 flex flex-col pt-16 sm:pt-16 xl:pt-20 pb-20 sm:pb-24 xl:pb-28 px-2 sm:px-4 xl:px-6 overflow-x-auto">

          {/* TOP 50%: Binary Tree View */}
          <div className="relative flex-1 min-h-0 border-b border-white/10">
            <div className="absolute top-1 md:top-2 left-1 md:left-2 z-10 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
              <span className="text-[10px] md:text-xs font-bold text-amber-400">TREE</span>
            </div>
            <div className="w-full h-full pt-8">
              <BinaryTreeView
                array={displayArray}
                currentStep={currentStep}
              />
            </div>
          </div>

          {/* BOTTOM 50%: Bar Chart View - More space for bars */}
          <div className="relative flex-1 min-h-0 pt-2">
            <div className="sticky top-2 left-2 z-20 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 w-fit ml-2 mb-2">
              <span className="text-xs font-bold text-cyan-400">ARRAY VIEW</span>
            </div>

            <div className="overflow-x-auto overflow-y-hidden h-[calc(100%-40px)]">
              <div
                className="flex items-end justify-center gap-0.5 h-full pb-8 px-4 min-w-max"
              >
                {displayArray.map((value, index) => {
                  const { height, bgClass, glow, scale } = getBarStyle(index, value);
                  return (
                    <motion.div
                      key={index}
                      layout
                      animate={{ scaleY: scale }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative flex flex-col items-center justify-end h-full flex-shrink-0"
                      style={{ width: barWidth, transformOrigin: 'bottom' }}
                    >
                      <div
                        className={`w-full bg-gradient-to-t ${bgClass} rounded-t-sm ${glow}`}
                        style={{ height: `${height}%`, minHeight: 4 }}
                      />
                      {config.showValues && (
                        <span className="text-[8px] sm:text-[10px] font-bold text-white/50 mt-1">{value}</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* FIXED HEADER BAR - Animated */}
        <motion.div
          className="fixed top-0 left-0 z-40 h-14 sm:h-14 xl:h-16 flex items-center justify-between px-3 sm:px-4 xl:px-6 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
            <button onClick={() => navigate("/")} className="p-2 sm:p-2 xl:p-2.5 rounded-lg xl:rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg xl:text-xl font-black text-white">Heap Sort</h1>
              <span className="hidden lg:inline px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold border border-amber-500/30">Dual View</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${currentStep.phase === "building" || currentStep.phase === "heapify"
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "bg-green-500/20 text-green-400 border-green-500/30"
                }`}>
                {currentStep.phase === "building" || currentStep.phase === "heap-built" ? "Build" : "Extract"}
              </span>
            </div>
          </div>

          {/* Center: Legend - hidden until large screens (1024px+) */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 xl:gap-4">
            <div className="flex items-center gap-3 xl:gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" /><span className="text-[10px] xl:text-xs font-semibold text-white/70">Root</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-gradient-to-br from-purple-400 to-violet-500" /><span className="text-[10px] xl:text-xs font-semibold text-white/70">Heapify</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500" /><span className="text-[10px] xl:text-xs font-semibold text-white/70">Compare</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-gradient-to-br from-red-400 to-rose-500" /><span className="text-[10px] xl:text-xs font-semibold text-white/70">Swap</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" /><span className="text-[10px] xl:text-xs font-semibold text-white/70">Sorted</span></div>
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 px-2 sm:px-2.5 xl:px-3 py-1 sm:py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Activity size={12} className="text-cyan-400 sm:w-3.5 sm:h-3.5" />
              <span className="text-xs sm:text-sm font-bold text-cyan-400">{currentStep.comparisons}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 px-2 sm:px-2.5 xl:px-3 py-1 sm:py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <RefreshCw size={12} className="text-red-400 sm:w-3.5 sm:h-3.5" />
              <span className="text-xs sm:text-sm font-bold text-red-400">{currentStep.swaps}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 px-2 sm:px-2.5 xl:px-3 py-1 sm:py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
              <Check size={12} className="text-green-400 sm:w-3.5 sm:h-3.5" />
              <span className="text-xs sm:text-sm font-bold text-green-400">{currentStep.sortedPercent}%</span>
            </div>
          </div>
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
          <div className="flex flex-col items-center gap-1 min-w-[100px] md:min-w-[200px] flex-shrink-0">
            <input type="range" min="0" max={Math.max(0, steps.length - 1)} value={currentStepIndex} onChange={(e) => setCurrentStepIndex(parseInt(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500" />
            <span className="text-[10px] md:text-[12px] text-white font-medium translate-y-1">{currentStepIndex + 1}/{steps.length}</span>
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

export default HeapSort;