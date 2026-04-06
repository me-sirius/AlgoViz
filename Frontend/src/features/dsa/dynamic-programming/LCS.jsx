import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Settings, X, Code2, WrapText,
  HelpCircle, Dna
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { lcs as lcsCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// LCS STEP GENERATOR
// ============================================================================

const generateLCSSteps = (str1, str2) => {
  const steps = [];
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  const snapshot = (status, i, j, isMatch, lcsLength, lcsString, commentary) => {
    steps.push({
      dpTable: dp.map(row => [...row]),
      i,
      j,
      status,
      isMatch,
      lcsLength,
      lcsString,
      matchI: isMatch ? i : -1,
      matchJ: isMatch ? j : -1,
      commentary,
      codeLine: getCodeLine(status),
      str1,
      str2
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'init': return 1;
      case 'scan': return 3;
      case 'match': return 5;
      case 'mismatch': return 7;
      case 'backtrack': return 10;
      case 'complete': return 12;
      default: return 1;
    }
  };

  // Initial
  snapshot('init', -1, -1, false, 0, '', `Finding LCS of "${str1}" and "${str2}"`);

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = str1[i - 1];
      const char2 = str2[j - 1];

      if (char1 === char2) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        snapshot('match', i, j, true, dp[i][j], '', `Match! '${char1}' = '${char2}'. LCS length = ${dp[i][j]}`);
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        const from = dp[i - 1][j] >= dp[i][j - 1] ? 'top' : 'left';
        snapshot('mismatch', i, j, false, dp[i][j], '', `No match '${char1}' ≠ '${char2}'. Take max from ${from}. LCS = ${dp[i][j]}`);
      }
    }
  }

  // Backtrack to find LCS string
  let lcsStr = '';
  let i = m, j = n;
  const path = [];

  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcsStr = str1[i - 1] + lcsStr;
      path.push({ i, j, char: str1[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  // Final step
  snapshot('complete', -1, -1, false, dp[m][n], lcsStr, `✓ LCS = "${lcsStr}" (length ${dp[m][n]})`);

  return steps;
};

// ============================================================================
// CODE PANEL
// ============================================================================

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [language, setLanguage] = useState("cpp");
  const [wrap, setWrap] = useState(false);
  const panelRef = useRef(null);

  const labels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const lines = (lcsCode[language] || "").split('\n');

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
          <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-cyan-500/50 transition-colors" />

          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Code2 size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-white">LCS</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <button
                onClick={() => setWrap(!wrap)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
              >
                <WrapText size={16} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                animate={i + 1 === activeLine ? { backgroundColor: "rgba(6,182,212,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-cyan-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-cyan-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-cyan-100" : "text-white/70"}`}>{line || " "}</pre>
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

const LCS = () => {
  const navigate = useNavigate();

  // Configuration
  const [str1, setStr1] = useState("STONE");
  const [str2, setStr2] = useState("LONGEST");

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
    const allSteps = generateLCSSteps(str1.toUpperCase(), str2.toUpperCase());
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [str1, str2]);

  useEffect(() => { initialize(); }, [initialize]);

  // Current step
  const currentStep = steps[currentStepIndex] || {
    dpTable: [],
    i: -1,
    j: -1,
    status: 'init',
    isMatch: false,
    lcsLength: 0,
    lcsString: '',
    commentary: "Enter strings and press Play.",
    codeLine: 1,
    str1: "",
    str2: ""
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

  const s1 = currentStep.str1 || str1.toUpperCase();
  const s2 = currentStep.str2 || str2.toUpperCase();
  const dpTable = currentStep.dpTable || [];

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
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-cyan-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Match (↖)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-slate-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Mismatch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-pink-500" />
              <span className="text-[9px] sm:text-xs text-white/60">LCS Path</span>
            </div>
          </div>

          {/* MAIN CONTENT - String Stage + DP Grid */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* STRING STAGE */}
            <div className="w-full overflow-x-auto">
              <div className="flex justify-center items-center gap-4 sm:gap-8 min-w-max px-4">
                <div className="flex gap-1">
                  {s1.split('').map((char, i) => (
                    <motion.div
                      key={i}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${currentStep.isMatch && currentStep.i === i + 1
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800/60 border-slate-600 text-white/80'
                        }`}
                      animate={currentStep.i === i + 1 ? { scale: 1.1 } : { scale: 1 }}
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>
                <span className="text-white/40 text-lg">↔</span>
                <div className="flex gap-1">
                  {s2.split('').map((char, j) => (
                    <motion.div
                      key={j}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${currentStep.isMatch && currentStep.j === j + 1
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800/60 border-slate-600 text-white/80'
                        }`}
                      animate={currentStep.j === j + 1 ? { scale: 1.1 } : { scale: 1 }}
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* DP GRID */}
            <div className="w-full overflow-x-auto py-4">
              <div className="flex justify-center min-w-max px-4">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="w-8 sm:w-10 h-8 sm:h-10"></th>
                      <th className="w-8 sm:w-10 h-8 sm:h-10 text-xs sm:text-sm text-white/50 font-normal">""</th>
                      {s2.split('').map((char, j) => (
                        <th
                          key={j}
                          className={`w-8 sm:w-10 h-8 sm:h-10 text-xs sm:text-sm font-bold ${currentStep.j === j + 1 ? 'text-cyan-400' : 'text-white/50'
                            }`}
                        >
                          {char}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dpTable.map((row, i) => (
                      <tr key={i}>
                        <td className={`w-8 sm:w-10 h-8 sm:h-10 text-xs sm:text-sm font-bold text-center ${currentStep.i === i ? 'text-cyan-400' : 'text-white/50'
                          }`}>
                          {i === 0 ? '""' : s1[i - 1]}
                        </td>
                        {row.map((val, j) => {
                          const isCurrent = i === currentStep.i && j === currentStep.j;
                          const isMatch = isCurrent && currentStep.isMatch;

                          let bgColor = 'bg-slate-800/40';
                          let borderColor = 'border-slate-700/50';

                          if (isCurrent) {
                            borderColor = isMatch ? 'border-cyan-400' : 'border-yellow-400';
                            bgColor = isMatch ? 'bg-cyan-500/20' : 'bg-yellow-500/10';
                          }

                          return (
                            <td
                              key={j}
                              className={`w-8 sm:w-10 h-8 sm:h-10 text-center border ${borderColor} ${bgColor} transition-all relative`}
                            >
                              <span className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                                {val}
                              </span>
                              {isMatch && i > 0 && j > 0 && (
                                <span className="absolute top-0 left-0.5 text-[8px] sm:text-[10px] text-cyan-400">↖</span>
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

          {/* LCS RESULT */}
          {currentStep.lcsString && (
            <div className="flex justify-center mb-3 flex-shrink-0 px-4">
              <div className="backdrop-blur-xl bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-2">
                <span className="text-xs text-white/50 mr-2">LCS:</span>
                <span className="text-lg font-bold text-cyan-400">{currentStep.lcsString}</span>
                <span className="text-xs text-white/50 ml-2">(length {currentStep.lcsString.length})</span>
              </div>
            </div>
          )}

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
            <h1 className="text-xl font-black text-white">Longest Common Subsequence</h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">DP</span>
          </div>
          <p className="text-xs text-white/50 mb-2">Find the longest sequence in both strings.</p>
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
              <h1 className="text-sm sm:text-base font-bold text-white">LCS</h1>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-400">
                    {currentStep.lcsString ? `"${currentStep.lcsString}"` : `Length: ${currentStep.lcsLength}`}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/50">"{s1}" vs "{s2}"</p>
          </div>
        </motion.div>

        {/* DESKTOP: LCS HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4">
            <div className="text-xs text-white/50 mb-1">LCS Length</div>
            <div className="text-3xl font-black text-cyan-400">{currentStep.lcsLength}</div>
            {currentStep.lcsString && (
              <div className="text-sm text-white/70 mt-2">"{currentStep.lcsString}"</div>
            )}
          </div>
          {currentStep.i > 0 && currentStep.j > 0 && (
            <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-xs text-white/70">
                '{s1[currentStep.i - 1]}' vs '{s2[currentStep.j - 1]}'
              </span>
            </div>
          )}
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
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-xs font-semibold text-white/80">Match (↖)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-xs font-semibold text-white/80">Mismatch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-xs font-semibold text-white/80">LCS Path</span>
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
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500"
            />
            <span className="text-[10px] sm:text-xs text-white font-medium">{currentStepIndex + 1}/{steps.length}</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer">
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
            <Zap size={12} className="text-cyan-400 sm:w-3.5 sm:h-3.5" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500"
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
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                         w-[85vw] sm:w-72 
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         bottom-[120px] sm:bottom-auto"
              style={{
                ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { bottom: dropdownPos.bottom, left: dropdownPos.left } : {})
              }}
              data-dropdown="settings"
            >
              <div className="space-y-4">
                {/* String 1 */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">String 1</label>
                  <input
                    type="text"
                    value={str1}
                    onChange={(e) => setStr1(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono focus:border-cyan-500 focus:outline-none"
                    placeholder="STONE"
                  />
                </div>

                {/* String 2 */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">String 2</label>
                  <input
                    type="text"
                    value={str2}
                    onChange={(e) => setStr2(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono focus:border-cyan-500 focus:outline-none"
                    placeholder="LONGEST"
                  />
                </div>

                {/* Presets */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Simple", s1: "ACE", s2: "ABCDE" },
                      { name: "DNA", s1: "AGGTAB", s2: "GXTXAYB" },
                      { name: "Words", s1: "STONE", s2: "LONGEST" },
                      { name: "Short", s1: "ABCDGH", s2: "AEDFHR" }
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => { setStr1(p.s1); setStr2(p.s2); setShowSettings(false); }}
                        className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-xs text-white/80 hover:text-cyan-300 transition-colors text-left border border-transparent hover:border-cyan-500/30"
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
      </AnimatePresence>

      {/* HELP BUTTON */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-lg"
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Longest Common Subsequence</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h3 className="font-bold text-cyan-400 mb-1">🎯 Goal</h3>
                  <p>Find the <strong>longest sequence</strong> that appears in both strings in the same relative order.</p>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-1">📝 Formula</h3>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs sm:text-sm">
                    <p>if A[i] == B[j]:</p>
                    <p className="ml-4">dp[i][j] = dp[i-1][j-1] + 1</p>
                    <p>else:</p>
                    <p className="ml-4">dp[i][j] = max(dp[i-1][j], dp[i][j-1])</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-1">🎨 Visual Guide</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">↖</span>
                      <span>Match (+1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500" />
                      <span>Scanning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-cyan-500" />
                      <span>Match found</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-pink-500" />
                      <span>LCS path</span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <h3 className="font-bold text-cyan-400 mb-1">💡 Example</h3>
                  <p className="text-xs">"STONE" vs "LONGEST"</p>
                  <p className="text-xs mt-1">LCS = "ONE" (length 3)</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LCS;