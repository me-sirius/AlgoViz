import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Settings, X, Code2, WrapText,
  HelpCircle, TrendingUp, Database, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fibonacci as fibonacciCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// FIBONACCI STEP GENERATOR (Top-Down with Memoization)
// ============================================================================

const generateFibonacciSteps = (n) => {
  const steps = [];
  const memo = new Array(n + 1).fill(null);
  const nodes = [];
  let nodeIdCounter = 0;
  let totalCalls = 0;
  let cacheHits = 0;

  const snapshot = (status, activeNodeId, currentN, result, commentary) => {
    steps.push({
      nodes: nodes.map(node => ({ ...node })),
      memo: [...memo],
      activeNodeId,
      status,
      currentN,
      result,
      totalCalls,
      cacheHits,
      savedCalls: Math.max(0, Math.pow(2, n + 1) - 1 - totalCalls),
      commentary,
      codeLine: getCodeLine(status)
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'call': return 2;
      case 'base': return 3;
      case 'cache_hit': return 4;
      case 'computing': return 6;
      case 'calculated': return 8;
      case 'complete': return 10;
      default: return 1;
    }
  };

  // Initial state
  snapshot('init', null, n, null, `Starting Fibonacci(${n}) calculation...`);

  const fib = (num, parentId = null, isLeft = true, depth = 0) => {
    totalCalls++;
    const nodeId = `node-${nodeIdCounter++}`;

    // Create node
    const node = {
      id: nodeId,
      n: num,
      result: null,
      status: 'spawning',
      parentId,
      isLeft,
      depth,
      x: 0,
      y: depth * 80
    };
    nodes.push(node);

    snapshot('call', nodeId, num, null, `Calling Fib(${num})...`);

    // Base cases
    if (num <= 1) {
      node.result = num;
      node.status = 'calculated';
      memo[num] = num;
      snapshot('base', nodeId, num, num, `Base case: Fib(${num}) = ${num}`);
      return num;
    }

    // Check cache
    if (memo[num] !== null) {
      cacheHits++;
      node.result = memo[num];
      node.status = 'cache_hit';
      snapshot('cache_hit', nodeId, num, memo[num], `🎯 Cache hit! Fib(${num}) = ${memo[num]} (already computed)`);
      return memo[num];
    }

    // Computing - need to recurse
    node.status = 'computing';
    snapshot('computing', nodeId, num, null, `Computing Fib(${num}) = Fib(${num - 1}) + Fib(${num - 2})...`);

    // Recurse left (n-1)
    const left = fib(num - 1, nodeId, true, depth + 1);

    // Recurse right (n-2)
    const right = fib(num - 2, nodeId, false, depth + 1);

    // Calculate result
    const result = left + right;
    node.result = result;
    node.status = 'calculated';
    memo[num] = result;

    snapshot('calculated', nodeId, num, result, `✓ Fib(${num}) = ${left} + ${right} = ${result}`);

    return result;
  };

  if (n >= 0) {
    const finalResult = fib(n, null, true, 0);
    snapshot('complete', null, n, finalResult, `🎉 Done! Fibonacci(${n}) = ${finalResult}`);
  }

  return steps;
};

// ============================================================================
// TREE NODE COMPONENT
// ============================================================================

const TreeNode = ({ node, isActive }) => {
  const getNodeStyle = () => {
    switch (node.status) {
      case 'spawning':
        return 'bg-slate-600 border-slate-500 text-slate-300';
      case 'computing':
        return 'bg-yellow-500/30 border-yellow-400 text-yellow-300 animate-pulse';
      case 'calculated':
        return 'bg-green-500/30 border-green-400 text-green-300';
      case 'cache_hit':
        return 'bg-amber-500/40 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/50';
      default:
        return 'bg-slate-700 border-slate-600 text-slate-400';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isActive ? 1.1 : 1,
        opacity: 1,
        boxShadow: isActive ? '0 0 20px rgba(139, 92, 246, 0.5)' : 'none'
      }}
      className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${getNodeStyle()} ${isActive ? 'ring-2 ring-purple-400' : ''}`}
    >
      <span className="text-[10px] sm:text-xs opacity-70">F({node.n})</span>
      {node.result !== null && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-sm sm:text-base font-black"
        >
          {node.result}
        </motion.span>
      )}
      {node.status === 'cache_hit' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: 2, duration: 0.3 }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center"
        >
          <Sparkles size={10} className="text-amber-900" />
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================================================
// CODE PANEL
// ============================================================================

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [language, setLanguage] = useState("cpp");
  const [wrap, setWrap] = useState(false);
  const panelRef = useRef(null);

  const labels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const lines = (fibonacciCode[language] || "").split('\n');

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
          <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-orange-500/50 transition-colors" />

          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                  <Code2 size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Fibonacci</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <button
                onClick={() => setWrap(!wrap)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
              >
                <WrapText size={16} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                animate={i + 1 === activeLine ? { backgroundColor: "rgba(249,115,22,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-orange-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-orange-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-orange-100" : "text-white/70"}`}>{line || " "}</pre>
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

const Fibonacci = () => {
  const navigate = useNavigate();

  // Configuration
  const [n, setN] = useState(5);

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
    const allSteps = generateFibonacciSteps(n);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [n]);

  useEffect(() => { initialize(); }, [initialize]);

  // Current step
  const currentStep = steps[currentStepIndex] || {
    nodes: [],
    memo: [],
    activeNodeId: null,
    status: 'init',
    currentN: n,
    result: null,
    totalCalls: 0,
    cacheHits: 0,
    savedCalls: 0,
    commentary: "Set N and press Play.",
    codeLine: 1
  };

  // Auto-play
  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) {
      if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
      return;
    }
    const delay = Math.max(50, 500 / speed);
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

  // Build tree structure for rendering
  const buildTreeLevels = (nodes) => {
    const levels = {};
    nodes.forEach(node => {
      if (!levels[node.depth]) levels[node.depth] = [];
      levels[node.depth].push(node);
    });
    return Object.values(levels);
  };

  const treeLevels = buildTreeLevels(currentStep.nodes);

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
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-slate-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Spawning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-orange-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Computing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Calculated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-yellow-300" />
              <span className="text-[9px] sm:text-xs text-white/60">Cache Hit</span>
            </div>
          </div>

          {/* TREE VISUALIZATION - Scrollable for large trees */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-full flex flex-col items-center justify-center gap-4 py-4">
              {/* TREE */}
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                {treeLevels.map((level, depth) => (
                  <div key={depth} className="flex items-center justify-center gap-1 sm:gap-2" style={{ minWidth: 'max-content' }}>
                    {level.map(node => (
                      <TreeNode
                        key={node.id}
                        node={node}
                        isActive={node.id === currentStep.activeNodeId}
                      />
                    ))}
                  </div>
                ))}

                {treeLevels.length === 0 && (
                  <div className="text-white/40 text-center py-8">
                    Press Play to visualize Fibonacci({n})
                  </div>
                )}
              </div>

              {/* MEMO TABLE */}
              {currentStep.memo.length > 0 && (
                <div className="backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-2xl p-3 sm:p-4 flex-shrink-0">
                  <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                    <Database size={14} />
                    <span>Memoization Table</span>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-center max-w-[90vw]">
                    {currentStep.memo.map((val, i) => (
                      <motion.div
                        key={i}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex flex-col items-center justify-center flex-shrink-0 ${val !== null
                          ? 'bg-green-500/20 border-green-500/40 text-green-400'
                          : 'bg-slate-700/50 border-slate-600 text-slate-500'
                          }`}
                        animate={val !== null && currentStep.currentN === i ? { scale: [1, 1.1, 1] } : {}}
                      >
                        <span className="text-[7px] sm:text-[9px] opacity-60">[{i}]</span>
                        <span className="font-bold text-[10px] sm:text-xs">{val !== null ? val : '-'}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COMMENTARY */}
          <motion.div
            className="mx-auto max-w-xl backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-2xl p-3 sm:p-4 flex-shrink-0 mx-4"
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
            <h1 className="text-xl font-black text-white">Fibonacci</h1>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">DP</span>
          </div>
          <p className="text-xs text-white/50 mb-2">Calculate Fib(n) with memoization.</p>
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
              <h1 className="text-sm sm:text-base font-bold text-white">Fibonacci</h1>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-orange-400">n = {n}</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-green-400">Hits: {currentStep.cacheHits}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/50">Calculate Fib(n) with memoization</p>
          </div>
        </motion.div>

        {/* DESKTOP: Efficiency HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
            <div>
              <div className="text-xs text-white/50 flex items-center gap-2">
                <TrendingUp size={12} />
                Function Calls
              </div>
              <div className="text-2xl font-black text-white">{currentStep.totalCalls}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-amber-400 flex items-center gap-1">
                  <Sparkles size={10} />
                  Cache Hits
                </div>
                <div className="text-lg font-bold text-amber-400">{currentStep.cacheHits}</div>
              </div>
              <div>
                <div className="text-xs text-green-400">Saved</div>
                <div className="text-lg font-bold text-green-400">{currentStep.savedCalls}</div>
              </div>
            </div>
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
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-xs font-semibold text-white/80">Spawning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold text-white/80">Computing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-white/80">Calculated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-300" />
            <span className="text-xs font-semibold text-white/80">Cache Hit</span>
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
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-orange-500"
            />
            <span className="text-[10px] sm:text-xs text-white font-medium">{currentStepIndex + 1}/{steps.length}</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer">
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
            <Zap size={12} className="text-orange-400 sm:w-3.5 sm:h-3.5" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-orange-500"
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
                setDropdownPos({ bottom: window.innerHeight - rect.top + 12, left: Math.max(10, rect.left - 80) });
              }
              setShowSettings(!showSettings);
            }}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Code2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </motion.div>
      </motion.div>

      {/* CODE PANEL */}
      <CodePanel
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        activeLine={currentStep.codeLine}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
      />

      {/* SETTINGS DROPDOWN */}
      <AnimatePresence>
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
                         w-[85vw] sm:w-56 
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         bottom-[120px] sm:bottom-auto"
              style={{
                ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { bottom: dropdownPos.bottom, left: dropdownPos.left } : {})
              }}
              data-dropdown="settings"
            >
              <div className="space-y-4">
                {/* N Slider */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">N Value</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={n}
                      onChange={(e) => setN(parseInt(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 accent-orange-500"
                    />
                    <span className="text-sm font-mono font-bold text-orange-400 w-6 text-right">{n}</span>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Presets</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10, 12, 15, 18, 20].map((val) => (
                      <button
                        key={val}
                        onClick={() => { setN(val); setShowSettings(false); }}
                        className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 text-xs text-white/80 hover:text-orange-300 transition-colors border border-transparent hover:border-orange-500/30"
                      >
                        n={val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HELP BUTTON */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 hover:bg-orange-500/30 transition-all cursor-pointer shadow-lg"
      >
        <HelpCircle size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* HELP MODAL */}
      <AnimatePresence>
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Fibonacci with Memoization</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h3 className="font-bold text-orange-400 mb-1">🎯 Goal</h3>
                  <p>Calculate Fibonacci(n) efficiently using memoization (caching).</p>
                </div>

                <div>
                  <h3 className="font-bold text-orange-400 mb-1">📝 Formula</h3>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs sm:text-sm">
                    Fib(n) = Fib(n-1) + Fib(n-2)<br />
                    Fib(0) = 0, Fib(1) = 1
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-orange-400 mb-1">🌳 Visual States</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-slate-500" />
                      <span>Spawning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500" />
                      <span>Computing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>Calculated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-400" />
                      <span>Cache Hit ⚡</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-orange-400 mb-1">⚡ Memoization</h3>
                  <p className="text-xs">When Fib(n) is already computed, we skip recursion and return the cached value instantly. This is shown as a <span className="text-amber-400 font-bold">gold "Cache Hit"</span>.</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h3 className="font-bold text-green-400 mb-1">💡 Efficiency</h3>
                  <p className="text-xs">Without memoization: O(2^n) calls</p>
                  <p className="text-xs">With memoization: O(n) calls</p>
                  <p className="text-xs mt-1">For n=10: ~2000 calls → 19 calls!</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fibonacci;