import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Settings, X, Code2, WrapText,
  Type, HelpCircle, ArrowUpLeft, ArrowUp, ArrowLeftIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { editDistance as editDistanceCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// EDIT DISTANCE STEP GENERATOR
// ============================================================================

const generateEditDistanceSteps = (word1, word2) => {
  const steps = [];
  const m = word1.length;
  const n = word2.length;

  // Initialize DP table
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  const operations = Array(m + 1).fill(null).map(() => Array(n + 1).fill(null));

  const snapshot = (status, i, j, operation = null, commentary = "") => {
    steps.push({
      dpTable: dp.map(row => [...row]),
      operations: operations.map(row => [...row]),
      i,
      j,
      operation,
      currentCost: dp[m]?.[n] || dp[i]?.[j] || 0,
      status,
      commentary,
      codeLine: getCodeLine(status),
      word1,
      word2
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'init': return 2;
      case 'base_row': return 3;
      case 'base_col': return 4;
      case 'match': return 7;
      case 'replace': return 9;
      case 'insert': return 10;
      case 'delete': return 11;
      case 'complete': return 14;
      default: return 1;
    }
  };

  // Initial state
  snapshot('init', -1, -1, null, `Initialize DP table for "${word1}" → "${word2}"`);

  // Fill base cases - row 0
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
    operations[0][j] = j === 0 ? null : 'insert';
    snapshot('base_row', 0, j, 'insert', `Base case: dp[0][${j}] = ${j} (insert ${j} chars)`);
  }

  // Fill base cases - column 0
  for (let i = 1; i <= m; i++) {
    dp[i][0] = i;
    operations[i][0] = 'delete';
    snapshot('base_col', i, 0, 'delete', `Base case: dp[${i}][0] = ${i} (delete ${i} chars)`);
  }

  // Fill the rest of the table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = word1[i - 1];
      const char2 = word2[j - 1];

      if (char1 === char2) {
        // Match - no operation needed
        dp[i][j] = dp[i - 1][j - 1];
        operations[i][j] = 'match';
        snapshot('match', i, j, 'match', `Match! '${char1}' = '${char2}'. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}`);
      } else {
        // Find minimum of three operations
        const replaceCost = dp[i - 1][j - 1] + 1;
        const insertCost = dp[i][j - 1] + 1;
        const deleteCost = dp[i - 1][j] + 1;

        const minCost = Math.min(replaceCost, insertCost, deleteCost);
        dp[i][j] = minCost;

        if (minCost === replaceCost) {
          operations[i][j] = 'replace';
          snapshot('replace', i, j, 'replace', `Replace '${char1}' with '${char2}'. dp[${i}][${j}] = ${minCost}`);
        } else if (minCost === insertCost) {
          operations[i][j] = 'insert';
          snapshot('insert', i, j, 'insert', `Insert '${char2}'. dp[${i}][${j}] = ${minCost}`);
        } else {
          operations[i][j] = 'delete';
          snapshot('delete', i, j, 'delete', `Delete '${char1}'. dp[${i}][${j}] = ${minCost}`);
        }
      }
    }
  }

  // Complete
  snapshot('complete', m, n, null, `Done! Minimum edit distance: ${dp[m][n]}`);

  return steps;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatusBadge = ({ status }) => {
  const config = {
    init: { text: 'Initialize', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    base_row: { text: 'Base Row', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    base_col: { text: 'Base Col', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    match: { text: 'Match ✓', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    replace: { text: 'Replace', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    insert: { text: 'Insert', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    delete: { text: 'Delete', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    complete: { text: '✓ Done', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  }[status] || { text: 'Ready', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };

  return (
    <motion.div
      key={status}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-3 py-1.5 rounded-full border ${config.color} font-bold text-xs backdrop-blur-xl`}
    >
      {config.text}
    </motion.div>
  );
};

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [language, setLanguage] = useState("cpp");
  const [wrap, setWrap] = useState(false);
  const panelRef = useRef(null);

  const labels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const lines = (editDistanceCode[language] || "").split('\n');

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
          <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-blue-500/50 transition-colors" />

          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Code2 size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Edit Distance</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <button
                onClick={() => setWrap(!wrap)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
              >
                <WrapText size={16} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                animate={i + 1 === activeLine ? { backgroundColor: "rgba(59,130,246,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-blue-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-blue-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-blue-100" : "text-white/70"}`}>{line || " "}</pre>
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

const EditDistance = () => {
  const navigate = useNavigate();

  // Configuration
  const [word1, setWord1] = useState("HORSE");
  const [word2, setWord2] = useState("ROS");

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
    const allSteps = generateEditDistanceSteps(word1.toUpperCase(), word2.toUpperCase());
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [word1, word2]);

  useEffect(() => { initialize(); }, [initialize]);

  // Current step
  const currentStep = steps[currentStepIndex] || {
    dpTable: [],
    operations: [],
    i: -1,
    j: -1,
    operation: null,
    currentCost: 0,
    status: 'init',
    commentary: "Enter words and press Play.",
    codeLine: 1,
    word1: "",
    word2: ""
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

  const w1 = currentStep.word1 || word1.toUpperCase();
  const w2 = currentStep.word2 || word2.toUpperCase();
  const dpTable = currentStep.dpTable || [];
  const ops = currentStep.operations || [];
  const finalCost = dpTable[w1.length]?.[w2.length] || 0;

  // Get operation arrow
  const getOperationArrow = (op) => {
    switch (op) {
      case 'match': return { icon: '↖', color: 'text-green-400' };
      case 'replace': return { icon: '↖', color: 'text-blue-400' };
      case 'insert': return { icon: '←', color: 'text-purple-400' };
      case 'delete': return { icon: '↑', color: 'text-red-400' };
      default: return { icon: '', color: '' };
    }
  };

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
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Replace</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-purple-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Insert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Delete</span>
            </div>
          </div>

          {/* MAIN CONTENT - Transformation Stage + DP Table (Centered) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* TRANSFORMATION STAGE */}
            <div className="flex justify-center items-center gap-4 sm:gap-8 flex-shrink-0">
              <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-white/10">
                <span className="text-xs text-white/50 block mb-1">From</span>
                <span className="text-lg sm:text-xl font-bold text-white">{w1}</span>
              </div>
              <span className="text-2xl text-white/40">→</span>
              <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-white/10">
                <span className="text-xs text-white/50 block mb-1">To</span>
                <span className="text-lg sm:text-xl font-bold text-cyan-400">{w2}</span>
              </div>
            </div>

            {/* DP TABLE */}
            <div className="w-full overflow-x-auto py-4">
              <div className="flex justify-center min-w-max px-4">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="w-8 sm:w-10 h-8 sm:h-10"></th>
                      <th className="w-8 sm:w-10 h-8 sm:h-10 text-xs sm:text-sm text-white/50 font-normal">""</th>
                      {w2.split('').map((char, j) => (
                        <th key={j} className="w-8 sm:w-10 h-8 sm:h-10 text-xs sm:text-sm text-cyan-400 font-bold">{char}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dpTable.map((row, i) => (
                      <tr key={i}>
                        <td className="w-8 sm:w-10 h-8 sm:h-10 text-xs sm:text-sm text-white/50 font-bold text-center">
                          {i === 0 ? '""' : w1[i - 1]}
                        </td>
                        {row.map((val, j) => {
                          const isCurrent = i === currentStep.i && j === currentStep.j;
                          const op = ops[i]?.[j];
                          const arrow = getOperationArrow(op);

                          let bgColor = 'bg-slate-800/40';
                          let borderColor = 'border-slate-700/50';

                          if (isCurrent) {
                            borderColor = 'border-yellow-400';
                            bgColor = 'bg-yellow-500/20';
                          } else if (op === 'match') {
                            bgColor = 'bg-green-500/10';
                          } else if (op === 'replace') {
                            bgColor = 'bg-blue-500/10';
                          } else if (op === 'insert') {
                            bgColor = 'bg-purple-500/10';
                          } else if (op === 'delete') {
                            bgColor = 'bg-red-500/10';
                          }

                          return (
                            <td
                              key={j}
                              className={`w-8 sm:w-10 h-8 sm:h-10 text-center border ${borderColor} ${bgColor} relative transition-all`}
                            >
                              <span className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-yellow-400' : 'text-white'}`}>
                                {val}
                              </span>
                              {arrow.icon && i > 0 && j > 0 && (
                                <span className={`absolute top-0 left-0.5 text-[8px] sm:text-[10px] ${arrow.color}`}>
                                  {arrow.icon}
                                </span>
                              )}
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

          {/* COMMENTARY */}
          <motion.div
            className="mx-auto max-w-xl backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-2xl p-3 sm:p-4 mt-4 flex-shrink-0"
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/90 text-center text-sm sm:text-base font-medium">{currentStep.commentary}</p>
          </motion.div>
        </div>

        {/* =============== FLOATING UI =============== */}

        {/* BACK BUTTON */}
        <button onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* DESKTOP: Header */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">Edit Distance</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">DP</span>
          </div>
          <p className="text-xs text-white/50 mb-2">Transform one word into another with minimum operations.</p>
          <p className="text-sm text-white/70">{currentStep.commentary}</p>
        </div>

        {/* MOBILE / TABLET: Header Bar */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="px-3 sm:px-4 py-1.5 sm:py-2" >
            <div className="flex items-center justify-between mb-1" >
              <h1 className="text-sm sm:text-base font-bold text-white" > Edit Distance</h1 >
              <div className="flex items-center gap-1.5" >
                <StatusBadge status={currentStep.status} />
                <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30" >
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-400" > Cost: {finalCost}</span >
                </div >
              </div >
            </div >
            <div className="text-[10px] sm:text-xs text-white/50" > Transform "{w1}" → "{w2}"</div >
          </div >
        </motion.div >

        {/* DESKTOP: Stats HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >

          <StatusBadge status={currentStep.status} />
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-3 " >
            <div className="text-xs text-white/50 mb-1" > Edit Distance</div >
            <div className="text-3xl font-black text-cyan-400" > {finalCost}</div >
          </div >

          {currentStep.i >= 0 && currentStep.j >= 0 && (
            <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl px-3 py-2" >
              <span className="text-xs text-white/70" >
                dp[{currentStep.i}][{currentStep.j}]
              </span >
              <div className="text-3xl font-black text-cyan-400" > {currentStep.val}</div >
            </div>
          )}
        </motion.div >

        {/* DESKTOP: LEGEND(Floating, animated) */}
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

          <div className="flex items-center gap-2" >
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-white/80" > Match</span >
          </div >
          <div className="flex items-center gap-2" >
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-white/80" > Replace</span >
          </div >
          <div className="flex items-center gap-2" >
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-white/80" > Insert</span >
          </div >
          <div className="flex items-center gap-2" >
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-white/80" > Delete</span >
          </div >
        </motion.div >

        {/* CONTROL DOCK */}
        <motion.div
          data-control-bar="true"
          className="fixed bottom-3 sm:bottom-4 xl:bottom-6 z-50 backdrop-blur-2xl bg-gray-900 border border-white rounded-2xl xl:rounded-3xl p-2.5 sm:p-3 xl:p-4 flex items-center gap-2 sm:gap-3 xl:gap-4 shadow-2xl max-w-[95vw] overflow-x-auto"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{ left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`, x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >

          {/* Scrubber */}
          <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[160px] flex-shrink-0" >
            <input
              type="range"
              min="0"
              max={Math.max(0, steps.length - 1)}
              value={currentStepIndex}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-blue-500"
            />
            <span className="text-[10px] sm:text-xs text-white font-medium" > {currentStepIndex + 1}/{steps.length} </span >
          </div >

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" >
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed" >
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button >
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer" >
              {playing ? <Pause size={18} className="text-white sm:w-5 sm:h-5" /> : <Play size={18} className="text-white sm:w-5 sm:h-5" />}
            </button >
            <button onClick={handleStepForward} disabled={currentStepIndex >= steps.length - 1} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed" >
              <SkipForward size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button >
            <button onClick={handleReset} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer" >
              <RotateCcw size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button >
          </div >

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Speed */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0" >
            <span size={12} className="text-blue-400 sm:w-3.5 sm:h-3.5" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-blue-500" />
            <span className="text-[10px] sm:text-xs font-bold text-white/60 w-6" > {speed}x</span >
          </div >

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Settings */}
          <button
            ref={settingsRef}
            onClick={() => {
              if (settingsRef.current) {
                const rect = settingsRef.current.getBoundingClientRect();
                setDropdownPos({ bottom: window.innerHeight - rect.top + 12, left: Math.max(10, rect.left - 120) });

                setShowSettings(!showSettings);
              }
            }}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                         w-[85vw] sm:w-72 
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         bottom-[120px] sm:bottom-auto"
              style={{
                ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { bottom: dropdownPos.bottom, left: dropdownPos.left } : {})
              }}
              data-dropdown="settings"
            >
              <div className="space-y-4">
                {/* Word 1 */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Word 1 (From)</label>
                  <input
                    type="text"
                    value={word1}
                    onChange={(e) => setWord1(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="HORSE"
                  />
                </div>

                {/* Word 2 */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Word 2 (To)</label>
                  <input
                    type="text"
                    value={word2}
                    onChange={(e) => setWord2(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="ROS"
                  />
                </div>

                {/* Presets */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Classic", w1: "HORSE", w2: "ROS" },
                      { name: "Days", w1: "Saturday", w2: "Sunday" },
                      { name: "Words", w1: "intention", w2: "execution" },
                      { name: "Simple", w1: "abc", w2: "axc" }
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => { setWord1(p.w1); setWord2(p.w2); setShowSettings(false); }}
                        className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-xs text-white/80 hover:text-blue-300 transition-colors text-left border border-transparent hover:border-blue-500/30"
                      >
                        {p.name}
                      </button>
                    ))}
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
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition-all cursor-pointer shadow-lg"
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Edit Distance</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h3 className="font-bold text-blue-400 mb-1">🎯 Goal</h3>
                  <p>Find the <strong>minimum number of operations</strong> to transform Word1 into Word2.</p>
                </div>

                <div>
                  <h3 className="font-bold text-blue-400 mb-1">🔧 Operations</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    <li><span className="text-purple-400">Insert</span> - Add a character</li>
                    <li><span className="text-red-400">Delete</span> - Remove a character</li>
                    <li><span className="text-blue-400">Replace</span> - Change a character</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-blue-400 mb-1">📝 Formula</h3>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs sm:text-sm">
                    <p>if chars match: dp[i][j] = dp[i-1][j-1]</p>
                    <p>else: dp[i][j] = 1 + min(</p>
                    <p className="ml-4">dp[i-1][j-1], // replace</p>
                    <p className="ml-4">dp[i][j-1],   // insert</p>
                    <p className="ml-4">dp[i-1][j]    // delete</p>
                    <p>)</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-blue-400 mb-1">🎨 Grid Legend</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">↖</span>
                      <span>Match (no cost)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">↖</span>
                      <span>Replace (+1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">←</span>
                      <span>Insert (+1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">↑</span>
                      <span>Delete (+1)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <h3 className="font-bold text-cyan-400 mb-1">💡 Example</h3>
                  <p className="text-xs">HORSE → ROS</p>
                  <p className="text-xs">Answer: 3 (replace H→R, delete R, delete E)</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </div >
  );
};

export default EditDistance;