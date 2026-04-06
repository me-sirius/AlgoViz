import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Settings, X, Code2, WrapText,
  Coins, Target, HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { coinChange as coinChangeCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// COIN CHANGE STEP GENERATOR
// ============================================================================

const generateCoinChangeSteps = (coins, amount) => {
  const steps = [];
  const INF = Infinity;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;

  const snapshot = (status, currentAmount = -1, currentCoin = null, lookbackIndex = -1, comparison = null, commentary = "") => {
    steps.push({
      dp: [...dp],
      currentAmount,
      currentCoin,
      lookbackIndex,
      comparison,
      status,
      commentary,
      codeLine: getCodeLine(status)
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'init': return 2;
      case 'scanning': return 4;
      case 'checking': return 6;
      case 'update': return 7;
      case 'reject': return 7;
      case 'complete': return 10;
      default: return 1;
    }
  };

  // Step 0: Initialization
  snapshot('init', -1, null, -1, null, `Initialize: dp[0] = 0, all others = ∞`);

  // Main Loop
  for (let i = 1; i <= amount; i++) {
    snapshot('scanning', i, null, -1, null, `Processing amount ${i}...`);

    for (const coin of coins) {
      if (i >= coin) {
        const lookback = i - coin;
        const prevVal = dp[lookback];
        const currentVal = dp[i];
        const candidate = prevVal === INF ? INF : prevVal + 1;

        snapshot(
          'checking',
          i,
          coin,
          lookback,
          {
            current: currentVal,
            candidate,
            formula: `min(${currentVal === INF ? '∞' : currentVal}, ${prevVal === INF ? '∞' : prevVal} + 1)`
          },
          `Using coin ${coin}: Check dp[${lookback}] = ${prevVal === INF ? '∞' : prevVal}`
        );

        if (candidate < currentVal) {
          dp[i] = candidate;
          snapshot(
            'update',
            i,
            coin,
            lookback,
            { current: currentVal, candidate, result: 'improved' },
            `✓ Improved! dp[${i}] = ${candidate} (was ${currentVal === INF ? '∞' : currentVal})`
          );
        } else {
          snapshot(
            'reject',
            i,
            coin,
            lookback,
            { current: currentVal, candidate, result: 'rejected' },
            `✗ No improvement: ${candidate === INF ? '∞' : candidate} ≥ ${currentVal === INF ? '∞' : currentVal}`
          );
        }
      }
    }
  }

  // Complete
  snapshot(
    'complete',
    amount,
    null,
    -1,
    null,
    dp[amount] === INF
      ? `No solution! Cannot form amount ${amount} with given coins.`
      : `🎉 Done! Minimum coins for ${amount}: ${dp[amount]}`
  );

  return steps;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard = ({ icon: Icon, value, label, color = "purple" }) => {
  const colors = {
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
  };

  return (
    <div className={`backdrop-blur-xl bg-gradient-to-br ${colors[color]} border rounded-2xl p-3 min-w-[90px]`}>
      <div className="flex items-center gap-1.5">
        <Icon size={14} className="opacity-70" />
        <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-black mt-0.5">{value}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    init: { text: 'Initialize', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    scanning: { text: 'Scanning', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    checking: { text: 'Checking', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    update: { text: 'Improved!', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    reject: { text: 'No Change', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
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
  const lines = (coinChangeCode[language] || "").split('\n');

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
          <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-purple-500/50 transition-colors" />

          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
                  <Code2 size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-white text-sm">Coin Change</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <button
                onClick={() => setWrap(!wrap)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
              >
                <WrapText size={16} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                animate={i + 1 === activeLine ? { backgroundColor: "rgba(168,85,247,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-purple-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-purple-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-purple-100" : "text-white/70"}`}>{line || " "}</pre>
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

const CoinChange = () => {
  const navigate = useNavigate();

  // Configuration
  const [amount, setAmount] = useState(11);
  const [coinsInput, setCoinsInput] = useState("1, 2, 5");
  const [coins, setCoins] = useState([1, 2, 5]);

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

  // Parse coins input
  useEffect(() => {
    const parsed = coinsInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0).sort((a, b) => a - b);
    if (parsed.length > 0) setCoins(parsed);
  }, [coinsInput]);

  // Initialize
  const initialize = useCallback(() => {
    const allSteps = generateCoinChangeSteps(coins, amount);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [coins, amount]);

  useEffect(() => { initialize(); }, [initialize]);

  // Current step
  const currentStep = steps[currentStepIndex] || {
    dp: new Array(amount + 1).fill(Infinity),
    currentAmount: -1,
    currentCoin: null,
    lookbackIndex: -1,
    comparison: null,
    status: 'init',
    commentary: "Configure and press Play.",
    codeLine: 1
  };

  // Auto-play
  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) {
      if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
      return;
    }
    const delay = Math.max(50, 800 / speed);
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

  const minCoins = currentStep.dp[amount];
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const isMobile = screenWidth < 640;

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

          {/* MOBILE/TABLET: LEGEND (visible on smaller screens) */}
          <div className="xl:hidden flex justify-center flex-wrap gap-2 sm:gap-4 mt-6 mb-4 px-4 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-purple-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Lookback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Improved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Rejected</span>
            </div>
          </div>

          {/* MAIN CONTENT - Coin Palette + DP Array (Centered) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* COIN PALETTE */}
            <div className="flex justify-center gap-2 sm:gap-3 flex-shrink-0">
              {coins.map((coin, i) => {
                const isActive = currentStep.currentCoin === coin;
                return (
                  <motion.div
                    key={i}
                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${isActive
                      ? 'bg-gradient-to-br from-yellow-300 to-amber-500 border-yellow-200 text-amber-900 shadow-lg shadow-amber-500/50'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500 text-white/80'
                      }`}
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {coin}
                  </motion.div>
                );
              })}
            </div>

            {/* DP ARRAY */}
            <div className="w-full overflow-x-auto py-4">
              <div className="flex gap-1 justify-center min-w-max px-4">
                {currentStep.dp.map((val, i) => {
                  const isCurrent = i === currentStep.currentAmount;
                  const isLookback = i === currentStep.lookbackIndex;
                  const isImproved = isCurrent && currentStep.status === 'update';
                  const isRejected = isCurrent && currentStep.status === 'reject';

                  let borderColor = 'border-slate-600';
                  let bgColor = 'bg-slate-800/50';
                  let textColor = val === Infinity ? 'text-slate-500' : 'text-white';

                  if (isCurrent) {
                    borderColor = isImproved ? 'border-green-500' : isRejected ? 'border-red-500' : 'border-purple-500';
                    bgColor = isImproved ? 'bg-green-500/20' : isRejected ? 'bg-red-500/20' : 'bg-purple-500/20';
                  } else if (isLookback) {
                    borderColor = 'border-blue-500';
                    bgColor = 'bg-blue-500/20';
                  }

                  return (
                    <motion.div
                      key={i}
                      className={`flex flex-col items-center justify-center w-9 sm:w-11 h-12 sm:h-16 rounded-lg border-2 ${borderColor} ${bgColor} transition-all flex-shrink-0`}
                      animate={{ scale: isCurrent ? 1.05 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-[8px] sm:text-[10px] text-white/40">{i}</span>
                      <span className={`text-xs sm:text-base font-bold ${textColor}`}>
                        {val === Infinity ? '∞' : val}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* LOOKBACK CONNECTOR */}
            {currentStep.lookbackIndex >= 0 && currentStep.currentAmount >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-medium"
              >
                dp[{currentStep.currentAmount}] ← dp[{currentStep.lookbackIndex}] + 1
              </motion.div>
            )}
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
        <button
          onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* DESKTOP: Header */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white"> Coin Change </h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">DP</span>
          </div>
          <p className="text-xs text-white/50 mb-2"> Find minimum coins to make the target amount.</p>
          <p className="text-sm text-white/70"> {currentStep.commentary}</p>
        </div>

        {/* MOBILE / TABLET: Header Bar */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="px-3 sm:px-4 py-1.5 sm:py-2">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-sm sm:text-base font-bold text-white">Coin Change</h1>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400">Target: {amount}</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-green-400">Min: {minCoins === Infinity ? '-' : minCoins}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/50">Find minimum coins to make the target amount.</p>
          </div>
        </motion.div>

        {/* DESKTOP: Stats HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <StatusBadge status={currentStep.status} />
          <div className="flex gap-2">
            <StatCard icon={Target} value={amount} label="Target" color="amber" />
            <StatCard icon={Coins} value={minCoins === Infinity ? '-' : minCoins} label="Min" color="green" />
          </div>
        </motion.div>

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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-white/80">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-white/80">Lookback</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-white/80">Improved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-white/80">Rejected</span>
          </div>
        </motion.div>

        {/* CONTROL DOCK */}
        <motion.div
          className="fixed bottom-3 sm:bottom-4 xl:bottom-6 z-50 backdrop-blur-2xl bg-gray-900 border border-white rounded-2xl xl:rounded-3xl p-2.5 sm:p-3 xl:p-4 flex items-center gap-2 sm:gap-3 xl:gap-4 shadow-2xl max-w-[95vw] overflow-x-auto"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{ left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`, x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Scrubber */}
          <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[160px] flex-shrink-0">
            <input
              type="range"
              name="0"
              value={Math.max(0, steps.length - 1)}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-purple-500"
            />
            <span className="text-[10px] sm:text-xs text-white font-medium"> {currentStepIndex + 1}/{steps.length}</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer">
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
            <Zap size={12} className="text-purple-400 sm:w-3.5 sm:h-3.5" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-purple-500"
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
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}

          >
            <Code2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button >
        </motion.div >
      </motion.div>

      {/* CODE PANEL */}
      < CodePanel
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        activeLine={currentStep.codeLine}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
      />

      {/* SETTINGS DROPDOWN - centered modal on mobile */}
      < AnimatePresence >
        {showSettings && (
          <>
            {/* Backdrop for mobile */}
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
                         w-[85vw] sm:w-64 
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         bottom-[120px] sm:bottom-auto"
              style={{
                ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { bottom: dropdownPos.bottom, left: dropdownPos.left } : {})
              }}
              data-dropdown="settings"
            >
              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Target Amount</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 accent-purple-500"
                    />
                    <span className="text-sm font-mono font-bold text-purple-400 w-6 text-right">{amount}</span>
                  </div>
                </div>

                {/* Coins */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Coins</label>
                  <input
                    type="text"
                    value={coinsInput}
                    onChange={(e) => setCoinsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono focus:border-purple-500 focus:outline-none"
                    placeholder="1, 2, 5"
                  />
                </div>

                {/* Presets */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Classic", coins: "1, 2, 5", amt: 11 },
                      { name: "US Coins", coins: "1, 5, 10, 25", amt: 15 },
                      { name: "Fibonacci", coins: "1, 2, 3, 5, 8", amt: 13 },
                      { name: "Primes", coins: "2, 3, 5, 7", amt: 10 }
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => { setCoinsInput(p.coins); setAmount(p.amt); setShowSettings(false); }}
                        className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-xs text-white/80 hover:text-purple-300 transition-colors text-left border border-transparent hover:border-purple-500/30"
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

      {/* HELP BUTTON - BOTTOM RIGHT */}
      < button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30 transition-all cursor-pointer shadow-lg"
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Coin Change Problem</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h3 className="font-bold text-purple-400 mb-1">🎯 Goal</h3>
                  <p>Find the <strong>minimum number of coins</strong> needed to make a target amount.</p>
                </div>

                <div>
                  <h3 className="font-bold text-purple-400 mb-1">📝 Formula</h3>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs sm:text-sm">
                    dp[i] = min(dp[i], dp[i - coin] + 1)
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-purple-400 mb-1">🔄 How it Works</h3>
                  <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
                    <li>Initialize dp[0] = 0 (0 coins needed for amount 0)</li>
                    <li>Set all other dp values to ∞ (infinity)</li>
                    <li>For each amount from 1 to target:</li>
                    <li className="ml-4">Try each coin that fits (coin ≤ amount)</li>
                    <li className="ml-4">Check if using this coin gives fewer coins</li>
                    <li className="ml-4">Update dp[i] if we found a better solution</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-bold text-purple-400 mb-1">🎨 Color Legend</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span>Current index</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span>Lookback (i - coin)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>Value improved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span>No improvement</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <h3 className="font-bold text-amber-400 mb-1">💡 Example</h3>
                  <p className="text-xs">Coins: [1, 2, 5], Target: 11</p>
                  <p className="text-xs">Answer: 3 coins (5 + 5 + 1)</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </div >
  );
};

export default CoinChange;
