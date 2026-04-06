import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Crown, X, Code2, WrapText, RotateCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { nQueens as nQueensCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// N-QUEENS STEP GENERATOR
// ============================================================================

const generateNQueensSteps = (n) => {
  const steps = [];
  const board = Array(n).fill(null).map(() => Array(n).fill(null));
  const queens = []; // Array of {row, col}
  let backtracks = 0;

  // Helper: Create board snapshot
  const snapshot = (status, currentCell = null, conflictQueen = null, attackPath = [], commentary = "") => {
    const boardState = board.map((row, r) =>
      row.map((_, c) => {
        const hasQueen = queens.some(q => q.row === r && q.col === c);
        const isChecking = currentCell && currentCell.row === r && currentCell.col === c;
        const isConflict = status === 'conflict' && isChecking;
        const isAttacking = conflictQueen && conflictQueen.row === r && conflictQueen.col === c;
        const isAttackPath = attackPath.some(p => p.row === r && p.col === c);

        let cellStatus = 'idle';
        if (hasQueen) cellStatus = 'safe';
        if (isChecking && status === 'checking') cellStatus = 'checking';
        if (isConflict) cellStatus = 'conflict';
        if (isAttacking) cellStatus = 'attacking';
        if (isAttackPath && !hasQueen && !isChecking) cellStatus = 'attackPath';

        return {
          row: r,
          col: c,
          hasQueen,
          status: cellStatus,
          isLight: (r + c) % 2 === 0
        };
      })
    );

    steps.push({
      board: boardState,
      queensPlaced: [...queens],
      currentCell,
      conflictQueen,
      attackPath,
      status,
      backtracks,
      queensCount: queens.length,
      n,
      commentary,
      codeLine: getCodeLine(status)
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'searching': return 2;
      case 'checking': return 5;
      case 'placing': return 8;
      case 'conflict': return 6;
      case 'backtracking': return 12;
      case 'solved': return 15;
      default: return 1;
    }
  };

  // Check if position is safe
  const isSafe = (row, col) => {
    for (const q of queens) {
      // Same column
      if (q.col === col) return { safe: false, attacker: q, type: 'column' };
      // Same diagonal
      if (Math.abs(q.row - row) === Math.abs(q.col - col)) {
        return { safe: false, attacker: q, type: 'diagonal' };
      }
    }
    return { safe: true, attacker: null, type: null };
  };

  // Generate attack path between two cells
  const getAttackPath = (from, to, type) => {
    const path = [];
    if (type === 'column') {
      const minRow = Math.min(from.row, to.row);
      const maxRow = Math.max(from.row, to.row);
      for (let r = minRow + 1; r < maxRow; r++) {
        path.push({ row: r, col: from.col });
      }
    } else if (type === 'diagonal') {
      const rowDir = to.row > from.row ? 1 : -1;
      const colDir = to.col > from.col ? 1 : -1;
      let r = from.row + rowDir;
      let c = from.col + colDir;
      while (r !== to.row && c !== to.col) {
        path.push({ row: r, col: c });
        r += rowDir;
        c += colDir;
      }
    }
    return path;
  };

  // Initial state
  snapshot('searching', null, null, [], `Starting N-Queens for N=${n}. Let's place ${n} queens!`);

  // Backtracking solve
  const solve = (row) => {
    if (row === n) {
      snapshot('solved', null, null, [], `🎉 Solution found! All ${n} queens placed safely.`);
      return true;
    }

    for (let col = 0; col < n; col++) {
      const currentCell = { row, col };

      // Show checking
      snapshot('checking', currentCell, null, [], `Checking position (${row}, ${col})...`);

      const result = isSafe(row, col);

      if (result.safe) {
        // Place queen
        queens.push({ row, col });
        board[row][col] = 'Q';
        snapshot('placing', currentCell, null, [], `✓ Safe! Placing queen at (${row}, ${col}). Queens: ${queens.length}/${n}`);

        if (solve(row + 1)) {
          return true;
        }

        // Backtrack
        queens.pop();
        board[row][col] = null;
        backtracks++;
        snapshot('backtracking', currentCell, null, [], `↩ Backtracking from (${row}, ${col}). Dead end found.`);
      } else {
        // Show conflict
        const attackPath = getAttackPath(result.attacker, currentCell, result.type);
        const conflictType = result.type === 'column' ? 'same column' : 'diagonal';
        snapshot(
          'conflict',
          currentCell,
          result.attacker,
          attackPath,
          `✗ Conflict! Queen at (${result.attacker.row}, ${result.attacker.col}) attacks via ${conflictType}.`
        );
      }
    }

    return false;
  };

  solve(0);

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
  };

  return (
    <div className={`backdrop-blur-xl bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-3 min-w-[100px]`}>
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
    placing: { text: 'Placing', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    conflict: { text: 'Conflict!', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    backtracking: { text: 'Backtracking', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    solved: { text: '✓ Solved!', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
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
  const codeLines = nQueensCode[codeLanguage].split('\n');

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
          <div onMouseDown={handleMouseDown} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-purple-500/50 transition-colors" />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500">
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">N-Queens Algorithm</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-amber-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {Object.keys(languageLabels).map(lang => (
                  <option key={lang} value={lang} className="bg-slate-900">{languageLabels[lang]}</option>
                ))}
              </select>
              <button
                onClick={() => setWrapCode(!wrapCode)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrapCode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(234,179,8,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-yellow-400" : ""}`}
              >
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NQueens = () => {
  const navigate = useNavigate();

  // State
  const [n, setN] = useState(8);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const sizeButtonRef = React.useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ bottom: 0, left: 0 });

  // Current step data
  const currentStep = steps[currentStepIndex] || {
    board: [],
    queensPlaced: [],
    currentCell: null,
    conflictQueen: null,
    attackPath: [],
    status: 'searching',
    backtracks: 0,
    queensCount: 0,
    n: n,
    commentary: "Configure board size and click Play to start.",
    codeLine: 1
  };

  // Initialize
  const initialize = useCallback(() => {
    const allSteps = generateNQueensSteps(n);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [n]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSizeDropdown && sizeButtonRef.current && !sizeButtonRef.current.contains(e.target)) {
        const dropdown = document.querySelector('[data-dropdown="size"]');
        if (!dropdown || !dropdown.contains(e.target)) {
          setShowSizeDropdown(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSizeDropdown]);

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

  // Calculate cell size - responsive for mobile/tablet/desktop
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 640;      // sm breakpoint
  const isTablet = screenWidth < 1024;     // lg breakpoint

  const availableSize = Math.min(
    window.innerHeight - (isMobile ? 280 : isTablet ? 320 : 400),
    window.innerWidth - (showCode ? panelWidth : 0) - (isMobile ? 32 : isTablet ? 60 : 150)
  );
  const maxCellSize = isMobile ? 40 : isTablet ? 60 : 65;
  const cellSize = Math.min(maxCellSize, Math.floor(availableSize / n));

  // Cell styling
  const getCellStyle = (cell) => {
    const baseLight = 'bg-amber-100/90';
    const baseDark = 'bg-amber-900/60';
    const base = cell.isLight ? baseLight : baseDark;

    switch (cell.status) {
      case 'checking':
        return `${base} ring-4 ring-yellow-400 ring-inset`;
      case 'conflict':
        return 'bg-red-500/70 ring-4 ring-red-400 ring-inset animate-pulse';
      case 'attacking':
        return 'bg-purple-500/70 ring-4 ring-purple-400 ring-inset';
      case 'attackPath':
        return 'bg-red-400/40';
      default:
        return base;
    }
  };

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
        {/* Chessboard Container */}
        <div className="absolute inset-0 flex items-center justify-center pt-70 pb-36">
          <motion.div
            className="border-4 border-amber-700/50 rounded-lg overflow-hidden shadow-2xl"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${n}, ${cellSize}px)`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep.board.flat().map((cell, idx) => (
              <motion.div
                key={`${cell.row}-${cell.col}`}
                className={`relative flex items-center justify-center transition-colors duration-200 ${getCellStyle(cell)}`}
                style={{ width: cellSize, height: cellSize }}
              >
                {/* Queen */}
                <AnimatePresence>
                  {cell.hasQueen && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      className="absolute"
                    >
                      <Crown
                        size={cellSize * 0.6}
                        className={`${cell.status === 'attacking' ? 'text-purple-300' : 'text-green-400'} drop-shadow-lg`}
                        style={{
                          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5)) ${cell.status === 'attacking' ? 'drop-shadow(0 0 10px rgba(168,85,247,0.8))' : 'drop-shadow(0 0 8px rgba(74,222,128,0.6))'}`
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Conflict indicator */}
                {cell.status === 'conflict' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute text-3xl"
                  >
                    ✗
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* =============== FLOATING UI =============== */}

        {/* BACK BUTTON - All screen sizes */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* MOBILE/TABLET: Compact Header Bar (< 1280px) */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Row 1: Title + Badge + Compact Stats */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white">N-Queens</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold border border-amber-500/30">
                N={n}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Crown size={12} className="text-green-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-amber-400">{currentStep.queensCount}/{n}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <RotateCw size={12} className="text-red-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-red-400">{currentStep.backtracks}</span>
              </div>
            </div>
          </div>
          {/* Row 2: Legend */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 py-6 border-t border-white/40">
            <div className="flex items-center gap-1.5">
              <Crown size={12} className="text-green-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Queen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400 ring-1 ring-yellow-300" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Checking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Conflict</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Attacker</span>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP: Header with Commentary (≥ 1280px) */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-black text-white">N-Queens</h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              N = {n}
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {currentStep.commentary}
          </p>
        </div>

        {/* DESKTOP: Stats HUD (≥ 1280px) */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-3"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <StatusBadge status={currentStep.status} />
          </div>
          <div className="flex items-start gap-2">
            <StatCard icon={Crown} value={`${currentStep.queensCount}/${n}`} label="Queens" color="green" />
            <StatCard icon={RotateCw} value={currentStep.backtracks} label="Backtracks" color="red" />
            <StatCard icon={Zap} value={`${opsPerSecond}/s`} label="Speed" color="cyan" />
          </div>
        </motion.div>

        {/* LEGEND */}
        <motion.div
          className="hidden xl:flex fixed top-28 z-40 backdrop-blur-xl bg-black/40 border border-white rounded-full px-6 py-2.5 items-center gap-6"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{
            left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
            x: '-50%',
            top: showCode ? 180 : 96
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-green-400" />
            <span className="text-xs font-semibold text-white/80">Queen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-300" />
            <span className="text-xs font-semibold text-white/80">Checking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-white/80">Conflict</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-white/80">Attacker</span>
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
          {/* Timeline Scrubber */}
          <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[180px] flex-shrink-0">
            <input
              type="range"
              min="0"
              max={Math.max(0, steps.length - 1)}
              value={currentStepIndex}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-amber-500"
            />
            <span className="text-[10px] sm:text-[11px] xl:text-[12px] text-white font-medium">
              {currentStepIndex + 1}/{steps.length}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleStepBack}
              disabled={currentStepIndex <= 0}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer"
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

          {/* Speed Slider - Hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <Zap size={14} className="text-amber-400" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-16 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-amber-500"
            />
            <span className="text-xs font-bold text-white/60 w-8">{speed}x</span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Board Size - Custom Dropdown */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-bold text-white/60">N:</span>
            <button
              ref={sizeButtonRef}
              onClick={() => {
                if (sizeButtonRef.current) {
                  const rect = sizeButtonRef.current.getBoundingClientRect();
                  setDropdownPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
                }
                setShowSizeDropdown(!showSizeDropdown);
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-xs sm:text-sm font-bold hover:border-amber-500/50 transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>{n}</span>
              <svg className={`w-3 h-3 transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 8l4 4 4-4" />
              </svg>
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
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

      {/* Size Dropdown - Rendered outside control bar to avoid overflow clipping */}
      <AnimatePresence>
        {showSizeDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-slate-900 border border-white/20 rounded-xl overflow-hidden shadow-xl z-[200] w-16"
            style={{ bottom: dropdownPosition.bottom, left: dropdownPosition.left }}
            data-dropdown="size"
          >
            {[4, 5, 6, 7, 8, 9, 10].map(size => (
              <button
                key={size}
                onClick={() => {
                  setN(size);
                  setShowSizeDropdown(false);
                }}
                className={`w-full px-4 py-2 text-sm font-bold text-left hover:bg-amber-500/20 transition-colors cursor-pointer ${size === n ? 'bg-amber-500/30 text-amber-400' : 'text-white/80'}`}
              >
                {size}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NQueens;