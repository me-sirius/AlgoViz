import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Target, X, Code2, WrapText,
  RotateCw, Plus, Minus, TrendingUp, Sparkles, AlertTriangle, Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subsetSum as subsetSumCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// SUBSET SUM STEP GENERATOR
// ============================================================================

const generateSubsetSumSteps = (arr, target) => {
  const steps = [];
  const currentSubset = [];
  let backtracks = 0;
  let solutionFound = false;

  // Helper: Create snapshot
  const snapshot = (status, activeIndex = null, currentSum = 0, decision = null, commentary = "") => {
    const arrayState = arr.map((num, idx) => {
      let itemStatus = 'pending';

      if (currentSubset.includes(idx)) {
        itemStatus = 'included';
      } else if (idx < activeIndex) {
        itemStatus = 'excluded';
      } else if (idx === activeIndex) {
        itemStatus = 'active';
      }

      return {
        value: num,
        index: idx,
        status: itemStatus
      };
    });

    steps.push({
      arrayState,
      currentSubset: [...currentSubset],
      currentSum,
      activeIndex,
      status,
      decision,
      backtracks,
      target,
      remaining: target - currentSum,
      solutionFound,
      commentary,
      codeLine: getCodeLine(status)
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'checking': return 5;
      case 'success': return 6;
      case 'overflow': return 7;
      case 'including': return 8;
      case 'excluding': return 10;
      case 'backtracking': return 12;
      case 'found': return 6;
      default: return 1;
    }
  };

  // Initial state
  snapshot('searching', 0, 0, null, `Starting Subset Sum. Target: ${target}`);

  // Backtracking solve
  const solve = (index, currentSum) => {
    // Base case: found solution
    if (currentSum === target) {
      solutionFound = true;
      snapshot('found', index, currentSum, 'success', `🎉 Found it! Sum = ${currentSum}. Subset: [${currentSubset.map(i => arr[i]).join(', ')}]`);
      return true;
    }

    // Base case: reached end or overflow
    if (index >= arr.length || currentSum > target) {
      if (currentSum > target) {
        snapshot('overflow', index, currentSum, null, `❌ Overflow! ${currentSum} > ${target}. Must backtrack.`);
      }
      return false;
    }

    // Show decision point
    snapshot('checking', index, currentSum, null, `At arr[${index}] = ${arr[index]}. Current sum: ${currentSum}. Try including?`);

    // Decision 1: Include current element
    currentSubset.push(index);
    const newSum = currentSum + arr[index];

    snapshot('including', index, newSum, 'include', `✓ Include ${arr[index]}. New sum: ${newSum}. Remaining: ${target - newSum}`);

    if (solve(index + 1, newSum)) {
      return true;
    }

    // Backtrack: Remove element
    currentSubset.pop();
    backtracks++;
    snapshot('backtracking', index, currentSum, 'backtrack', `↩ Backtrack from ${arr[index]}. Removing from subset.`);

    // Decision 2: Exclude current element
    snapshot('excluding', index, currentSum, 'exclude', `Skip ${arr[index]}. Keep sum at ${currentSum}.`);

    if (solve(index + 1, currentSum)) {
      return true;
    }

    return false;
  };

  solve(0, 0);

  if (!solutionFound) {
    snapshot('failed', arr.length, 0, null, `😞 No subset adds up to ${target}.`);
  }

  return steps;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard = ({ icon: Icon, value, label, color = "cyan" }) => {
  const colorMap = {
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
  };

  return (
    <div className={`backdrop-blur-xl bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-3 min-w-[110px]`}>
      <div className="flex items-center gap-2">
        <Icon size={16} className="opacity-70" />
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    searching: { text: 'Searching', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    checking: { text: 'Checking', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    including: { text: 'Including', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    excluding: { text: 'Excluding', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    overflow: { text: 'Overflow!', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    backtracking: { text: 'Backtracking', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    found: { text: '✓ Found!', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    failed: { text: 'No Solution', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const config = statusConfig[status] || statusConfig.searching;

  return (
    <motion.div
      key={status}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-4 py-2 rounded-full border ${config.color} font-bold text-sm backdrop-blur-xl`}
    >
      {config.text}
    </motion.div>
  );
};

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [wrapCode, setWrapCode] = useState(false);
  const panelRef = React.useRef(null);

  const languageLabels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const codeLines = subsetSumCode[codeLanguage].split('\n');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isOpen) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      const isButton = e.target.closest('button');
      const isInput = e.target.tagName === 'INPUT' || e.target.closest('input');
      const isControlBar = e.target.closest('[data-control-bar="true"]');
      if (!isButton && !isInput && !isControlBar) onClose();
    };

    if (isOpen) {
      const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 100);
      return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClickOutside); };
    }
  }, [isOpen, onClose]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    const handleMouseMove = (e) => {
      const delta = startX - e.clientX;
      const newWidth = Math.max(350, Math.min(700, startWidth + delta));
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
          className="fixed right-0 top-0 h-full z-50 backdrop-blur-2xl bg-black/80 border-l border-white/10 flex flex-col shadow-2xl w-full sm:w-[85vw] md:w-[70vw] lg:w-[50vw]"
          style={{ maxWidth: panelWidth }}
        >
          <div onMouseDown={handleMouseDown} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-cyan-500/50 transition-colors" />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Subset Sum Algorithm</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-cyan-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {Object.keys(languageLabels).map(lang => (
                  <option key={lang} value={lang} className="bg-slate-900">{languageLabels[lang]}</option>
                ))}
              </select>
              <button
                onClick={() => setWrapCode(!wrapCode)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrapCode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(6,182,212,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-cyan-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-cyan-400 font-bold" : "text-white/30"}`}>{idx + 1}</span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-cyan-100" : "text-white/70"}`}>{line || " "}</pre>
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

const SubsetSum = () => {
  const navigate = useNavigate();

  // State
  const [arr, setArr] = useState([5, 10, 12, 13, 15, 18]);
  const [target, setTarget] = useState(30);
  const [inputArr, setInputArr] = useState("5, 10, 12, 13, 15, 18");
  const [inputTarget, setInputTarget] = useState("30");
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [showCode, setShowCode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450);

  // Current step data
  const currentStep = steps[currentStepIndex] || {
    arrayState: arr.map((val, idx) => ({ value: val, index: idx, status: 'pending' })),
    currentSubset: [],
    currentSum: 0,
    activeIndex: null,
    status: 'searching',
    decision: null,
    backtracks: 0,
    target: target,
    remaining: target,
    solutionFound: false,
    commentary: "Configure input and click Play to start.",
    codeLine: 1
  };

  // Initialize
  const initialize = useCallback(() => {
    const allSteps = generateSubsetSumSteps(arr, target);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [arr, target]);

  useEffect(() => {
    if (steps.length === 0 || arr.length > 0) {
      initialize();
    }
  }, []);

  // Apply changes
  const handleApplyChanges = () => {
    try {
      const newArr = inputArr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const newTarget = parseInt(inputTarget);

      if (newArr.length === 0 || isNaN(newTarget)) {
        alert("Please enter valid numbers");
        return;
      }

      setArr(newArr);
      setTarget(newTarget);

      const allSteps = generateSubsetSumSteps(newArr, newTarget);
      setSteps(allSteps);
      setCurrentStepIndex(0);
      setPlaying(false);
    } catch (error) {
      alert("Invalid input format");
    }
  };

  // Auto-generate solvable instance
  const handleAutoGenerate = () => {
    const size = 6 + Math.floor(Math.random() * 3); // 6-8 elements
    const newArr = [];

    for (let i = 0; i < size; i++) {
      newArr.push(5 + Math.floor(Math.random() * 15));
    }

    // Create a guaranteed solution
    const subsetSize = 2 + Math.floor(Math.random() * 3);
    const subset = [];
    for (let i = 0; i < subsetSize; i++) {
      subset.push(newArr[Math.floor(Math.random() * newArr.length)]);
    }
    const newTarget = subset.reduce((a, b) => a + b, 0);

    setArr(newArr);
    setTarget(newTarget);
    setInputArr(newArr.join(', '));
    setInputTarget(newTarget.toString());

    const allSteps = generateSubsetSumSteps(newArr, newTarget);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
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
  };
  const handleScrub = (e) => {
    setCurrentStepIndex(parseInt(e.target.value));
  };

  // Animation loop
  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) {
      if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
      return;
    }
    const delay = Math.max(50, 800 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  const opsPerSecond = Math.round(speed * 1.25);

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
        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-44 sm:pt-40 xl:pt-32 pb-28 sm:pb-36">
          {/* Target Gauge */}
          <motion.div
            className="mb-8 backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-3xl p-4 sm:p-6 min-w-[280px] max-w-[90vw] sm:min-w-[320px]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-3">
              <div className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider mb-2">Target Sum</div>
              <div className="text-4xl sm:text-5xl font-black text-cyan-400">{currentStep.target}</div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-black/30 rounded-full overflow-hidden mb-3">
              <motion.div
                className={`absolute inset-y-0 left-0 ${currentStep.currentSum === currentStep.target
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                  : currentStep.currentSum > currentStep.target
                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (currentStep.currentSum / currentStep.target) * 100)}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="text-white/80">
                Current: <span className="font-bold text-cyan-400">{currentStep.currentSum}</span>
              </div>
              <div className="text-white/80">
                Remaining: <span className={`font-bold ${currentStep.remaining >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {currentStep.remaining}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Array Display */}
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl">
            {currentStep.arrayState.map((item, idx) => {
              const isIncluded = currentStep.currentSubset.includes(idx);
              const isActive = idx === currentStep.activeIndex;
              const isExcluded = item.status === 'excluded';

              let bgClass = 'bg-slate-800/50 border-slate-600/30';
              let textClass = 'text-white/70';
              let iconElement = null;

              if (isIncluded) {
                bgClass = 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-500/50';
                textClass = 'text-green-400';
                iconElement = <Plus size={16} className="text-green-400" />;
              } else if (isActive) {
                bgClass = 'bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-yellow-500/50 ring-4 ring-yellow-500/30';
                textClass = 'text-yellow-400';
              } else if (isExcluded) {
                bgClass = 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 opacity-50';
                textClass = 'text-red-400/70';
                iconElement = <Minus size={16} className="text-red-400/70" />;
              }

              return (
                <motion.div
                  key={idx}
                  className={`relative backdrop-blur-xl ${bgClass} border rounded-2xl p-4 min-w-[80px] flex flex-col items-center justify-center transition-all duration-300`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {iconElement && (
                    <div className="absolute -top-2 -right-2 bg-black/80 rounded-full p-1">
                      {iconElement}
                    </div>
                  )}

                  <div className={`text-3xl font-black ${textClass}`}>
                    {item.value}
                  </div>

                  <div className="text-xs text-white/40 mt-1">
                    [{idx}]
                  </div>

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 border-2 border-yellow-400 rounded-2xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  )}
                </motion.div>
              );
            })}
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

        {/* MOBILE HEADER BAR */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white">Subset Sum</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] sm:text-xs font-bold border border-cyan-500/30">
                Backtracking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Target size={12} className="text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">{currentStep.target}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                <TrendingUp size={12} className="text-green-400" />
                <span className="text-xs font-bold text-green-400">{currentStep.currentSum}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <RotateCw size={12} className="text-red-400" />
                <span className="text-xs font-bold text-red-400">{currentStep.backtracks}</span>
              </div>
            </div>
          </div>
          {/* Commentary */}
          <div className="px-4 py-2 border-t border-white/5">
            <p className="text-xs text-white/70 line-clamp-2">{currentStep.commentary}</p>
          </div>
          {/* Mobile Legend */}
          <div className="px-4 py-2 border-t border-white/5 flex items-center justify-around">
            <div className="flex items-center gap-1.5">
              <Plus size={12} className="text-green-400" />
              <span className="text-[10px] text-white/60">Include</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] text-white/60">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus size={12} className="text-red-400" />
              <span className="text-[10px] text-white/60">Exclude</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-[10px] text-white/60">Pending</span>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP HEADER */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-black text-white">Subset Sum</h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
              Backtracking
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{currentStep.commentary}</p>
        </div>

        {/* DESKTOP STATS HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-3"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <StatusBadge status={currentStep.status} />
          <div className="flex items-start gap-2">
            <StatCard icon={Target} value={currentStep.target} label="Target" color="cyan" />
            <StatCard icon={TrendingUp} value={currentStep.currentSum} label="Sum" color="green" />
            <StatCard icon={RotateCw} value={currentStep.backtracks} label="Backtracks" color="red" />
            <StatCard icon={Zap} value={`${opsPerSecond}/s`} label="Speed" color="amber" />
          </div>
        </motion.div>

        {/* CONFIG PANEL - Desktop only */}
        <motion.div
          className="hidden xl:block fixed top-44 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 w-64"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            Configuration
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Target Value</label>
              <input
                type="text"
                value={inputTarget}
                onChange={(e) => setInputTarget(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                placeholder="30"
              />
            </div>

            <div>
              <label className="text-xs text-white/60 mb-1 block">Input Array (comma-separated)</label>
              <input
                type="text"
                value={inputArr}
                onChange={(e) => setInputArr(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                placeholder="5, 10, 12, 13"
              />
            </div>

            <button
              onClick={handleApplyChanges}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Apply Changes
            </button>

            <button
              onClick={handleAutoGenerate}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Auto-Generate
            </button>
          </div>
        </motion.div>

        {/* LEGEND - Desktop only (inline) */}
        <motion.div
          className="hidden xl:flex fixed top-24 z-40 backdrop-blur-xl bg-black/40 border border-white rounded-full px-6 py-2.5 items-center gap-6"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{ left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`, x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <Plus size={14} className="text-green-400" />
            <span className="text-xs font-semibold text-white/80">Included</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-xs font-semibold text-white/80">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus size={14} className="text-red-400" />
            <span className="text-xs font-semibold text-white/80">Excluded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-xs font-semibold text-white/80">Pending</span>
          </div>
        </motion.div>

        {/* CONTROL DOCK */}
        <motion.div
          data-control-bar="true"
          className="fixed bottom-3 sm:bottom-4 xl:bottom-6 z-50 backdrop-blur-2xl bg-gray-900 border border-white rounded-2xl xl:rounded-3xl p-2.5 sm:p-3 xl:p-4 flex items-center gap-2 sm:gap-3 xl:gap-4 shadow-2xl max-w-[95vw] overflow-x-auto"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{ left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`, x: '-50%' }}
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
        >
          {/* Timeline Scrubber */}
          <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[180px]">
            <input
              type="range"
              min="0"
              max={Math.max(0, steps.length - 1)}
              value={currentStepIndex}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500"
            />
            <span className="text-[10px] sm:text-[11px] xl:text-[12px] text-white font-medium">
              {currentStepIndex + 1}/{steps.length}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleStepBack}
              disabled={currentStepIndex <= 0}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer"
            >
              {playing ? <Pause size={18} className="text-white sm:w-5 sm:h-5" /> : <Play size={18} className="text-white sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={handleStepForward}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <SkipForward size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <RotateCcw size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Speed Slider - Visible on all screens */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Zap size={14} className="text-cyan-400" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500"
            />
            <span className="text-[10px] sm:text-xs font-bold text-white/60">{speed}x</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Settings Button - Mobile/Tablet only */}
          <button
            onClick={() => setShowSettings(true)}
            className="xl:hidden p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <Settings size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showCode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          >
            <Code2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </motion.div>
      </motion.div>

      {/* SETTINGS MODAL - Mobile/Tablet */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="xl:hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/20 rounded-2xl p-5 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  Configuration
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={20} className="text-white/70" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Target Value</label>
                  <input
                    type="text"
                    value={inputTarget}
                    onChange={(e) => setInputTarget(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Input Array (comma-separated)</label>
                  <input
                    type="text"
                    value={inputArr}
                    onChange={(e) => setInputArr(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="5, 10, 12, 13"
                  />
                </div>

                <button
                  onClick={() => { handleApplyChanges(); setShowSettings(false); }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  Apply Changes
                </button>

                <button
                  onClick={() => { handleAutoGenerate(); setShowSettings(false); }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Auto-Generate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CODE PANEL */}
      <CodePanel
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        activeLine={currentStep.codeLine}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
      />
    </div>
  );
};

export default SubsetSum;
