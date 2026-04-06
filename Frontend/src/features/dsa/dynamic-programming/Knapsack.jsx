import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Settings, X, Code2, WrapText,
  HelpCircle, Gem, Coins, Crown, Package, Shuffle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { knapsack as knapsackCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// KNAPSACK STEP GENERATOR
// ============================================================================

const ITEM_ICONS = ['💎', '🪙', '👑', '📦', '💰', '🎁', '🏆', '💍'];

const generateKnapsackSteps = (items, capacity) => {
  const steps = [];
  const n = items.length;
  const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));

  const snapshot = (status, i, w, skipValue = null, takeValue = null, commentary = "") => {
    steps.push({
      dpTable: dp.map(row => [...row]),
      currentI: i,
      currentW: w,
      status,
      skipValue,
      takeValue,
      selectedItems: [],
      commentary,
      codeLine: getCodeLine(status)
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'init': return 1;
      case 'scan': return 3;
      case 'skip_only': return 5;
      case 'compare': return 7;
      case 'take': return 8;
      case 'skip': return 9;
      case 'backtrack': return 12;
      case 'complete': return 14;
      default: return 1;
    }
  };

  // Initial
  snapshot('init', -1, -1, null, null, `Knapsack: ${n} items, capacity ${capacity}kg`);

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 1; w <= capacity; w++) {
      snapshot('scan', i, w, null, null, `Checking item ${i} (${item.name}: w=${item.weight}, v=${item.value}) at capacity ${w}`);

      if (item.weight > w) {
        // Can't take - too heavy
        dp[i][w] = dp[i - 1][w];
        snapshot('skip_only', i, w, dp[i - 1][w], null, `Item ${i} too heavy (${item.weight} > ${w}). Skip. Value = ${dp[i][w]}`);
      } else {
        // Can take - compare
        const skipVal = dp[i - 1][w];
        const takeVal = item.value + dp[i - 1][w - item.weight];

        snapshot('compare', i, w, skipVal, takeVal, `Compare: Skip=${skipVal} vs Take=${item.value}+${dp[i - 1][w - item.weight]}=${takeVal}`);

        if (takeVal > skipVal) {
          dp[i][w] = takeVal;
          snapshot('take', i, w, skipVal, takeVal, `Take! ${takeVal} > ${skipVal}. Value = ${dp[i][w]}`);
        } else {
          dp[i][w] = skipVal;
          snapshot('skip', i, w, skipVal, takeVal, `Skip. ${skipVal} >= ${takeVal}. Value = ${dp[i][w]}`);
        }
      }
    }
  }

  // Backtrack to find selected items
  const selected = [];
  let w = capacity;
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(i - 1); // item index
      w -= items[i - 1].weight;
    }
  }
  selected.reverse();

  // Final step with selected items
  const finalStep = {
    dpTable: dp.map(row => [...row]),
    currentI: -1,
    currentW: -1,
    status: 'complete',
    skipValue: null,
    takeValue: null,
    selectedItems: selected,
    commentary: `✓ Max value: ${dp[n][capacity]}. Selected: ${selected.map(i => items[i].name).join(', ')}`,
    codeLine: 14
  };
  steps.push(finalStep);

  return steps;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ItemCard = ({ item, index, isSelected, isActive }) => {
  const icon = ITEM_ICONS[index % ITEM_ICONS.length];

  return (
    <motion.div
      className={`p-2 sm:p-3 rounded-xl border-2 transition-all ${isSelected
        ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/30'
        : isActive
          ? 'bg-purple-500/20 border-purple-400'
          : 'bg-slate-800/60 border-slate-600/50'
        }`}
      animate={{ scale: isActive ? 1.05 : 1 }}
    >
      <div className="text-xl sm:text-2xl mb-1">{icon}</div>
      <div className="text-[10px] sm:text-xs font-bold text-white/80 truncate">{item.name}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] sm:text-[10px] text-white/50">W:{item.weight}</span>
        <span className="text-[9px] sm:text-[10px] text-green-400">V:{item.value}</span>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-1 text-[9px] sm:text-[10px] text-amber-400 font-bold"
        >
          ✓ Selected
        </motion.div>
      )}
    </motion.div>
  );
};

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [language, setLanguage] = useState("cpp");
  const [wrap, setWrap] = useState(false);
  const panelRef = useRef(null);

  const labels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const lines = (knapsackCode[language] || "").split('\n');

  useEffect(() => {
    const handleClick = (e) => {
      if (!isOpen) return;
      if (panelRef.current?.contains(e.target)) return;
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('[data-control-bar]')) return;
      onClose();
    };
    if (isOpen) {
      const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
      return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
    }
  }, [isOpen, onClose]);

  const handleResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelWidth;
    const move = (e) => setPanelWidth(Math.max(350, Math.min(700, startW + startX - e.clientX)));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
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
          className="fixed right-0 top-0 h-full z-50 backdrop-blur-2xl bg-black/80 border-l border-white/10 flex flex-col shadow-2xl w-full sm:w-[85vw] md:w-[70vw] lg:w-[50vw]"
          style={{ maxWidth: panelWidth }}
        >
          <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-emerald-500/50 transition-colors" />

          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Code2 size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Knapsack</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <button
                onClick={() => setWrap(!wrap)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
              >
                <WrapText size={16} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                animate={i + 1 === activeLine ? { backgroundColor: "rgba(16,185,129,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-emerald-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-emerald-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-emerald-100" : "text-white/70"}`}>{line || " "}</pre>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Knapsack = () => {
  const navigate = useNavigate();

  // Configuration
  const [items, setItems] = useState([
    { name: 'Diamond', weight: 2, value: 10 },
    { name: 'Gold', weight: 3, value: 15 },
    { name: 'Crown', weight: 5, value: 40 }
  ]);
  const [capacity, setCapacity] = useState(7);

  // Playback
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);

  // UI
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const settingsRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ bottom: 0, left: 0 });

  // Initialize
  const initialize = useCallback(() => {
    const allSteps = generateKnapsackSteps(items, capacity);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [items, capacity]);

  useEffect(() => { initialize(); }, [initialize]);

  // Current step
  const currentStep = steps[currentStepIndex] || {
    dpTable: [],
    currentI: -1,
    currentW: -1,
    status: 'init',
    skipValue: null,
    takeValue: null,
    selectedItems: [],
    commentary: "Configure items and press Play.",
    codeLine: 1
  };

  // Auto-play
  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) {
      if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
      return;
    }
    const delay = Math.max(50, 600 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(i => i + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        const dropdown = document.querySelector('[data-dropdown="settings"]');
        if (!dropdown?.contains(e.target)) setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSettings]);

  // Handlers
  const handlePlayPause = () => setPlaying(!playing);
  const handleStepForward = () => currentStepIndex < steps.length - 1 && setCurrentStepIndex(i => i + 1);
  const handleStepBack = () => currentStepIndex > 0 && setCurrentStepIndex(i => i - 1);
  const handleReset = () => { setCurrentStepIndex(0); setPlaying(false); };
  const handleScrub = (e) => setCurrentStepIndex(parseInt(e.target.value));

  const handleRandomLoot = () => {
    const names = ['Ruby', 'Sapphire', 'Gold Bar', 'Silver', 'Pearl', 'Emerald'];
    const count = 3 + Math.floor(Math.random() * 3);
    const newItems = [];
    for (let i = 0; i < count; i++) {
      newItems.push({
        name: names[i % names.length],
        weight: 1 + Math.floor(Math.random() * 5),
        value: 5 + Math.floor(Math.random() * 45)
      });
    }
    setItems(newItems);
    setCapacity(5 + Math.floor(Math.random() * 10));
  };

  const dpTable = currentStep.dpTable || [];
  const maxValue = dpTable[items.length]?.[capacity] || 0;

  return (
    <div className="fixed inset-0 bg-[#0b0b0d] overflow-hidden flex">
      {/* MAIN VISUALIZATION AREA */}
      <motion.div
        layout
        className="relative flex-1 h-full"
        initial={false}
        animate={{ marginRight: showCode ? panelWidth : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* VISUALIZATION CONTENT */}
        <div className="absolute inset-0 flex flex-col pt-28 sm:pt-32 xl:pt-40 pb-28 sm:pb-32 overflow-auto">

          {/* MOBILE/TABLET: LEGEND */}
          <div className="xl:hidden flex justify-center flex-wrap gap-2 sm:gap-4 mt-6 mb-4 px-4 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-yellow-400" />
              <span className="text-[9px] sm:text-xs text-white/60">Scanning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Take</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Skip</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Source</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-purple-400" />
              <span className="text-[9px] sm:text-xs text-white/60">Selected</span>
            </div>
          </div>

          {/* MAIN CONTENT (Items + Table) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-full overflow-x-auto py-4">
              <div className="flex gap-4 sm:gap-6 justify-center min-w-max px-4">
                {/* ITEM SHOP (Left) */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {items.map((item, i) => (
                    <ItemCard
                      key={i}
                      item={item}
                      index={i}
                      isSelected={currentStep.selectedItems.includes(i)}
                      isActive={currentStep.currentI === i + 1}
                    />
                  ))}
                </div>

                {/* DP TABLE (Center) */}
                <div className="flex-shrink-0">
                  <table className="border-collapse min-w-max">
                    <thead>
                      <tr>
                        <th className="w-10 sm:w-12 h-8 sm:h-10 text-[10px] sm:text-xs text-white/40">Item\Cap</th>
                        {Array.from({ length: capacity + 1 }, (_, w) => (
                          <th
                            key={w}
                            className={`w-8 sm:w-10 h-8 sm:h-10 text-[10px] sm:text-xs font-bold ${w === currentStep.currentW ? 'text-yellow-400' : 'text-white/50'
                              }`}
                          >
                            {w}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dpTable.map((row, i) => (
                        <tr key={i}>
                          <td className={`w-10 sm:w-12 h-8 sm:h-10 text-[10px] sm:text-xs font-bold text-center ${i === currentStep.currentI ? 'text-yellow-400' : 'text-white/50'
                            }`}>
                            {i === 0 ? '∅' : items[i - 1]?.name?.charAt(0) || i}
                          </td>
                          {row.map((val, w) => {
                            const isCurrent = i === currentStep.currentI && w === currentStep.currentW;
                            const isSource = currentStep.status === 'compare' && (
                              (i === currentStep.currentI - 1 && w === currentStep.currentW) ||
                              (i === currentStep.currentI - 1 && w === currentStep.currentW - items[currentStep.currentI - 1]?.weight)
                            );

                            let bgColor = 'bg-slate-800/40';
                            let borderColor = 'border-slate-700/50';

                            if (isCurrent) {
                              borderColor = currentStep.status === 'take' ? 'border-green-400' : currentStep.status === 'skip' || currentStep.status === 'skip_only' ? 'border-red-400' : 'border-yellow-400';
                              bgColor = currentStep.status === 'take' ? 'bg-green-500/20' : currentStep.status === 'skip' || currentStep.status === 'skip_only' ? 'bg-red-500/10' : 'bg-yellow-500/20';
                            } else if (isSource) {
                              borderColor = 'border-blue-400';
                              bgColor = 'bg-blue-500/10';
                            }

                            return (
                              <td
                                key={w}
                                className={`w-8 sm:w-10 h-8 sm:h-10 text-center border ${borderColor} ${bgColor} transition-all`}
                              >
                                <span className={`text-[10px] sm:text-xs font-bold ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                                  {val}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* COMMENTARY (Bottom) */}
          <motion.div
            className="mx-auto max-w-xl backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-2xl p-3 sm:p-4 flex-shrink-0 mt-4 mx-4"
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/90 text-center text-sm sm:text-base font-medium">{currentStep.commentary}</p>
          </motion.div>
        </div>

        {/* =============== FLOATING UI =============== */}

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* DESKTOP: Header */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">0/1 Knapsack</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">DP</span>
          </div>
          <p className="text-xs text-white/50 mb-2">Maximize value within weight capacity.</p>
          <p className="text-sm text-white/70">{currentStep.commentary}</p>
        </div>

        {/* MOBILE/TABLET: Header Bar */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="px-3 sm:px-4 py-1.5 sm:py-2">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-sm sm:text-base font-bold text-white">Knapsack</h1>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-400">Cap: {capacity}kg</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400">Max: {maxValue}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/50">{items.length} items, maximize value</p>
          </div>
        </motion.div>

        {/* DESKTOP: Value HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4">
            <div className="text-xs text-white/50 mb-1">Max Value</div>
            <div className="text-3xl font-black text-amber-400">{maxValue}</div>
            <div className="text-xs text-white/40 mt-1">Capacity: {capacity}kg</div>
          </div>
        </motion.div>

        {/* DESKTOP: LEGEND (Floating, animated) */}
        <motion.div
          className="hidden xl:flex fixed top-24 z-40 backdrop-blur-xl bg-black/40 rounded-full px-6 py-2.5 items-center gap-6"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{
            left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
            x: '-50%',
            top: showCode ? 190 : 96
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-xs font-semibold text-white/80">Scanning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-white/80">Take</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-white/80">Skip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-white/80">Source</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-xs font-semibold text-white/80">Selected</span>
          </div>
        </motion.div>

        {/* CONTROL DOCK */}
        <motion.div
          data-control-bar="true"
          className="fixed bottom-3 sm:bottom-4 xl:bottom-6 z-50 backdrop-blur-2xl bg-gray-900 border border-white rounded-2xl xl:rounded-3xl p-2.5 sm:p-3 xl:p-4 flex items-center gap-2 sm:gap-3 xl:gap-4 shadow-2xl max-w-[95vw] overflow-x-auto"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{ left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`, x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Scrubber */}
          <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[160px] flex-shrink-0">
            <input
              type="range"
              min="0"
              max={Math.max(0, steps.length - 1)}
              value={currentStepIndex}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-emerald-500"
            />
            <span className="text-[10px] sm:text-xs text-white font-medium">{currentStepIndex + 1}/{steps.length}</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer">
              {playing ? <Pause size={18} className="text-white sm:w-5 sm:h-5" /> : <Play size={18} className="text-white sm:w-5 sm:h-5" />}
            </button>
            <button onClick={handleStepForward} disabled={currentStepIndex >= steps.length - 1} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipForward size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handleReset} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <RotateCcw size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Speed */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Zap size={12} className="text-emerald-400 sm:w-3.5 sm:h-3.5" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-emerald-500"
            />
            <span className="text-[10px] sm:text-xs font-bold text-white/60 w-6">{speed}x</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Settings */}
          <button
            ref={settingsRef}
            onClick={() => {
              if (settingsRef.current) {
                const rect = settingsRef.current.getBoundingClientRect();
                setDropdownPos({ bottom: window.innerHeight - rect.top + 12, left: Math.max(10, rect.left - 120) });
              }
              setShowSettings(!showSettings);
            }}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Code2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </motion.div>
      </motion.div >

      {/* CODE PANEL */}
      < CodePanel
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        activeLine={currentStep.codeLine}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
      />

      {/* SETTINGS DROPDOWN */}
      < AnimatePresence >
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 bg-black/50 z-[199]"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bg-slate-900 border border-white/20 rounded-2xl p-4 shadow-2xl z-[200] 
                         w-[90vw] sm:w-72 max-h-[60vh] overflow-y-auto
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         bottom-[120px] sm:bottom-auto"
              style={{
                ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { bottom: dropdownPos.bottom, left: dropdownPos.left } : {})
              }}
              data-dropdown="settings"
            >
              <div className="space-y-4">
                {/* Capacity */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Capacity (kg)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 accent-emerald-500"
                    />
                    <span className="text-sm font-mono font-bold text-emerald-400 w-6">{capacity}</span>
                  </div>
                </div>

                {/* Random Loot */}
                <button
                  onClick={handleRandomLoot}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                >
                  <Shuffle size={14} />
                  <span className="text-xs font-bold">Random Loot</span>
                </button>

                {/* Presets */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Presets</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {
                        setItems([
                          { name: 'Diamond', weight: 2, value: 10 },
                          { name: 'Gold', weight: 3, value: 15 },
                          { name: 'Crown', weight: 5, value: 40 }
                        ]);
                        setCapacity(7);
                        setShowSettings(false);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-xs text-white/80 hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-500/30 text-left"
                    >
                      Classic
                    </button>
                    <button
                      onClick={() => {
                        setItems([
                          { name: 'Ruby', weight: 1, value: 1 },
                          { name: 'Sapphire', weight: 3, value: 4 },
                          { name: 'Emerald', weight: 4, value: 5 },
                          { name: 'Pearl', weight: 5, value: 7 }
                        ]);
                        setCapacity(7);
                        setShowSettings(false);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-xs text-white/80 hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-500/30 text-left"
                    >
                      Gems
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >

      {/* HELP BUTTON */}
      < button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-lg"
      >
        <HelpCircle size={20} className="sm:w-6 sm:h-6" />
      </button >

      {/* HELP MODAL */}
      < AnimatePresence >
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">0/1 Knapsack</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h3 className="font-bold text-emerald-400 mb-1">🎯 Goal</h3>
                  <p>Maximize <strong>total value</strong> without exceeding <strong>weight capacity</strong>.</p>
                </div>

                <div>
                  <h3 className="font-bold text-emerald-400 mb-1">📝 Formula</h3>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs">
                    <p>if weight[i] &gt; w:</p>
                    <p className="ml-4">dp[i][w] = dp[i-1][w] // skip</p>
                    <p>else:</p>
                    <p className="ml-4">dp[i][w] = max(</p>
                    <p className="ml-8">dp[i-1][w], // skip</p>
                    <p className="ml-8">value[i] + dp[i-1][w-weight[i]] // take</p>
                    <p className="ml-4">)</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-emerald-400 mb-1">🎨 Visual Guide</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500" />
                      <span>Scanning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>Take item</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span>Skip item</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-400" />
                      <span>Selected</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <h3 className="font-bold text-amber-400 mb-1">💡 Example</h3>
                  <p className="text-xs">Items: Diamond(w:2,v:10), Gold(w:3,v:15), Crown(w:5,v:40)</p>
                  <p className="text-xs">Capacity: 7kg</p>
                  <p className="text-xs mt-1">Best: Diamond + Crown = 50 value</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </div >
  );
};

export default Knapsack;