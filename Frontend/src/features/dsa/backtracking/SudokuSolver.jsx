import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Grid3X3, X, Code2, WrapText, RotateCw, RefreshCw, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sudokuSolver as sudokuCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// SUDOKU GENERATOR & SOLVER
// ============================================================================

// Check if placing num at (row, col) is valid
const isValid = (board, row, col, num) => {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c].value === num) return { valid: false, conflictCell: { row, col: c }, type: 'row' };
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col].value === num) return { valid: false, conflictCell: { row: r, col }, type: 'col' };
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c].value === num) return { valid: false, conflictCell: { row: r, col: c }, type: 'box' };
    }
  }
  return { valid: true, conflictCell: null, type: null };
};

// Fill diagonal 3x3 boxes (they are independent)
const fillDiagonalBoxes = (board) => {
  for (let box = 0; box < 3; box++) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    let idx = 0;
    const startRow = box * 3;
    const startCol = box * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        board[r][c] = { value: nums[idx++], isFixed: true, status: 'idle' };
      }
    }
  }
};

// Solve the board (used for generation)
const solveBoard = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          const check = isValid(board, row, col, num);
          if (check.valid) {
            board[row][col] = { value: num, isFixed: true, status: 'idle' };
            if (solveBoard(board)) return true;
            board[row][col] = { value: 0, isFixed: false, status: 'idle' };
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Generate a Sudoku puzzle
const generateSudoku = (difficulty = 'medium') => {
  const removeCounts = { easy: 30, medium: 45, hard: 55 };
  const removeCount = removeCounts[difficulty];

  // Create empty board
  const board = Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({ value: 0, isFixed: false, status: 'idle' }))
  );

  // Fill diagonal boxes
  fillDiagonalBoxes(board);

  // Solve the rest
  solveBoard(board);

  // Store solution
  const solution = board.map(row => row.map(cell => ({ ...cell })));

  // Remove digits
  let removed = 0;
  const positions = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push({ r, c });
    }
  }
  positions.sort(() => Math.random() - 0.5);

  for (const { r, c } of positions) {
    if (removed >= removeCount) break;
    if (board[r][c].value !== 0) {
      board[r][c] = { value: 0, isFixed: false, status: 'idle' };
      removed++;
    }
  }

  // Mark remaining as fixed clues
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== 0) {
        board[r][c].isFixed = true;
      }
    }
  }

  return { board, solution };
};

// Generate solving steps
const generateSolveSteps = (initialBoard) => {
  const steps = [];
  const board = initialBoard.map(row => row.map(cell => ({ ...cell })));
  let backtracks = 0;

  const countEmpty = (b) => b.flat().filter(c => c.value === 0).length;

  const snapshot = (status, currentCell = null, conflictCell = null, scanType = null, tryValue = null, commentary = "") => {
    const emptyCells = countEmpty(board);
    steps.push({
      board: board.map(row => row.map(cell => ({ ...cell }))),
      currentCell,
      conflictCell,
      scanType,
      tryValue,
      status,
      emptyCells,
      backtracks,
      commentary
    });
  };

  // Initial state
  snapshot('idle', null, null, null, null, `Starting Sudoku solver. ${countEmpty(board)} empty cells to fill.`);

  const solve = () => {
    // Find first empty cell
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col].value === 0) {
          for (let num = 1; num <= 9; num++) {
            // Snapshot: Scanning
            snapshot('scanning', { row, col }, null, 'all', num, `Trying ${num} at (${row + 1}, ${col + 1})...`);

            const check = isValid(board, row, col, num);

            if (check.valid) {
              // Place the number
              board[row][col] = { value: num, isFixed: false, status: 'placed' };
              snapshot('placing', { row, col }, null, null, num, `✓ Placed ${num} at (${row + 1}, ${col + 1})`);

              if (solve()) return true;

              // Backtrack
              board[row][col] = { value: 0, isFixed: false, status: 'idle' };
              backtracks++;
              snapshot('backtracking', { row, col }, null, null, num, `↩ Backtrack from (${row + 1}, ${col + 1}). ${num} didn't work.`);
            } else {
              // Conflict found
              snapshot('conflict', { row, col }, check.conflictCell, check.type, num, `✗ Conflict! ${num} exists in ${check.type}.`);
            }
          }
          return false;
        }
      }
    }
    // Solved!
    snapshot('solved', null, null, null, null, `🎉 Sudoku solved! Total backtracks: ${backtracks}`);
    return true;
  };

  solve();
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
    idle: { text: 'Ready', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    scanning: { text: 'Scanning', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    placing: { text: 'Placing', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    conflict: { text: 'Conflict!', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    backtracking: { text: 'Backtracking', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    solved: { text: '✓ Solved!', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  };

  const config = statusConfig[status] || statusConfig.idle;

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

const CodePanel = ({ isOpen, onClose, panelWidth, setPanelWidth }) => {
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [wrapCode, setWrapCode] = useState(false);
  const panelRef = React.useRef(null);

  const languageLabels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const codeLines = (sudokuCode[codeLanguage] || "").split('\n');

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
                <h3 className="font-bold text-white">Sudoku Solver</h3>
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
              <div
                key={idx}
                className="flex items-start gap-3 px-3 py-1 rounded-lg"
              >
                <span className="w-6 text-right text-xs flex-shrink-0 text-white/30">{idx + 1}</span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} text-white/70`}>{line || " "}</pre>
              </div>
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

// Difficulty color scheme
const getDifficultyColor = (diff) => {
  switch (diff) {
    case 'easy': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', hover: 'hover:bg-green-500/20' };
    case 'medium': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', hover: 'hover:bg-amber-500/20' };
    case 'hard': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', hover: 'hover:bg-red-500/20' };
    default: return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', hover: 'hover:bg-cyan-500/20' };
  }
};

const SudokuSolver = () => {
  const navigate = useNavigate();

  // State
  const [difficulty, setDifficulty] = useState('medium');
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const difficultyButtonRef = React.useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ bottom: 0, left: 0 });

  // Current step data
  const currentStep = steps[currentStepIndex] || {
    board: Array(9).fill(null).map(() => Array(9).fill({ value: 0, isFixed: false, status: 'idle' })),
    currentCell: null,
    conflictCell: null,
    scanType: null,
    tryValue: null,
    status: 'idle',
    emptyCells: 81,
    backtracks: 0,
    commentary: "Select difficulty and click Play to start."
  };

  // Initialize
  const initialize = useCallback(() => {
    const { board } = generateSudoku(difficulty);
    const allSteps = generateSolveSteps(board);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [difficulty]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDifficultyDropdown && difficultyButtonRef.current && !difficultyButtonRef.current.contains(e.target)) {
        const dropdown = document.querySelector('[data-dropdown="difficulty"]');
        if (!dropdown || !dropdown.contains(e.target)) {
          setShowDifficultyDropdown(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDifficultyDropdown]);

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
  const handleNewPuzzle = () => {
    initialize();
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
    const delay = Math.max(10, 500 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  // Calculate cell size - responsive
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobile = screenWidth < 640;
  const isTablet = screenWidth < 1024;

  const availableSize = Math.min(
    (typeof window !== 'undefined' ? window.innerHeight : 800) - (isMobile ? 280 : isTablet ? 320 : 380),
    screenWidth - (showCode ? panelWidth : 0) - (isMobile ? 32 : isTablet ? 60 : 150)
  );
  const cellSize = Math.min(isMobile ? 36 : isTablet ? 44 : 50, Math.floor(availableSize / 9));

  // Cell styling
  const getCellStyle = (cell, row, col) => {
    const { currentCell, conflictCell, scanType } = currentStep;
    const isCurrent = currentCell && currentCell.row === row && currentCell.col === col;
    const isConflict = conflictCell && conflictCell.row === row && conflictCell.col === col;

    // Scanning highlights
    const isInScanRow = scanType && currentCell && currentCell.row === row;
    const isInScanCol = scanType && currentCell && currentCell.col === col;
    const boxRow = currentCell ? Math.floor(currentCell.row / 3) * 3 : -1;
    const boxCol = currentCell ? Math.floor(currentCell.col / 3) * 3 : -1;
    const isInScanBox = scanType === 'all' && row >= boxRow && row < boxRow + 3 && col >= boxCol && col < boxCol + 3;

    let baseClasses = 'transition-all duration-150 ';

    if (isCurrent) {
      baseClasses += 'ring-2 ring-cyan-400 ring-inset bg-cyan-500/30 ';
    } else if (isConflict) {
      baseClasses += 'bg-red-500/50 animate-pulse ';
    } else if (isInScanRow || isInScanCol || isInScanBox) {
      baseClasses += 'bg-yellow-500/10 ';
    } else if (cell.isFixed) {
      baseClasses += 'bg-slate-700/80 ';
    } else {
      baseClasses += 'bg-slate-800/60 ';
    }

    return baseClasses;
  };

  // Border styling for 3x3 subgrids
  const getBorderStyle = (row, col) => {
    let classes = 'border-slate-600/50 ';
    if ((col + 1) % 3 === 0 && col < 8) classes += 'border-r-2 border-r-cyan-500/40 ';
    else classes += 'border-r ';
    if ((row + 1) % 3 === 0 && row < 8) classes += 'border-b-2 border-b-cyan-500/40 ';
    else classes += 'border-b ';
    if (col === 0) classes += 'border-l ';
    if (row === 0) classes += 'border-t ';
    return classes;
  };

  const opsPerSecond = Math.round(speed * 2);

  return (
    <div className="fixed inset-0 bg-[#0b0b0d] overflow-hidden flex">
      <motion.div
        layout
        className="relative flex-1 h-full"
        initial={false}
        animate={{ marginRight: showCode ? panelWidth : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute inset-0 flex items-center justify-center pt-32 pb-36">
          <motion.div
            className="border-2 border-cyan-500/50 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep.board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => (
                  <motion.div
                    key={`${rowIdx}-${colIdx}`}
                    className={`flex items-center justify-center ${getCellStyle(cell, rowIdx, colIdx)} ${getBorderStyle(rowIdx, colIdx)}`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell.value !== 0 && (
                      <motion.span
                        key={`${rowIdx}-${colIdx}-${cell.value}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`font-bold ${cell.isFixed
                          ? 'text-white text-lg sm:text-xl'
                          : 'text-cyan-400 text-base sm:text-lg'
                          }`}
                      >
                        {cell.value}
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white">Sudoku</h1>
              <span className={`px-2 py-0.5 rounded-full ${getDifficultyColor(difficulty).bg} ${getDifficultyColor(difficulty).text} text-[10px] sm:text-xs font-bold border ${getDifficultyColor(difficulty).border} capitalize`}>
                {difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Grid3X3 size={12} className="text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">{currentStep.emptyCells}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <RotateCw size={12} className="text-red-400" />
                <span className="text-xs font-bold text-red-400">{currentStep.backtracks}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-black text-white">Sudoku Solver</h1>
            <span className={`px-2 py-0.5 rounded-full ${getDifficultyColor(difficulty).bg} ${getDifficultyColor(difficulty).text} text-xs font-bold border ${getDifficultyColor(difficulty).border} capitalize`}>
              {difficulty}
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {currentStep.commentary}
          </p>
        </div>

        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-3"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <StatusBadge status={currentStep.status} />
          <div className="flex items-start gap-2">
            <StatCard icon={Grid3X3} value={currentStep.emptyCells} label="Empty" color="cyan" />
            <StatCard icon={RotateCw} value={currentStep.backtracks} label="Backtracks" color="red" />
            <StatCard icon={Zap} value={`${opsPerSecond}/s`} label="Speed" color="amber" />
          </div>
          {currentStep.currentCell && (
            <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl px-4 py-2">
              <span className="text-xs text-white/60">Current: </span>
              <span className="text-sm font-bold text-cyan-400">
                R{currentStep.currentCell.row + 1}, C{currentStep.currentCell.col + 1}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          data-control-bar="true"
          className="fixed bottom-3 sm:bottom-4 xl:bottom-6 z-50 backdrop-blur-2xl bg-gray-900 border border-white rounded-2xl xl:rounded-3xl p-2.5 sm:p-3 xl:p-4 flex items-center gap-2 sm:gap-3 xl:gap-4 shadow-2xl max-w-[95vw] overflow-x-auto"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{ left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`, x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[180px] flex-shrink-0">
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

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipBack size={16} className="text-white" />
            </button>
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer">
              {playing ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" />}
            </button>
            <button onClick={handleStepForward} disabled={currentStepIndex >= steps.length - 1} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipForward size={16} className="text-white" />
            </button>
            <button onClick={handleReset} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <RotateCcw size={16} className="text-white" />
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <Zap size={14} className="text-amber-400" />
            <input type="range" min="0.5" max="50" step="0.5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-16 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500" />
            <span className="text-xs font-bold text-white/60 w-10">{speed}x</span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/10 flex-shrink-0" />

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              ref={difficultyButtonRef}
              onClick={() => {
                if (difficultyButtonRef.current) {
                  const rect = difficultyButtonRef.current.getBoundingClientRect();
                  setDropdownPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
                }
                setShowDifficultyDropdown(!showDifficultyDropdown);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ${getDifficultyColor(difficulty).bg} border ${getDifficultyColor(difficulty).border} ${getDifficultyColor(difficulty).text} text-xs sm:text-sm font-bold hover:opacity-80 transition-colors cursor-pointer flex items-center gap-2 capitalize`}
            >
              <span>{difficulty}</span>
              <ChevronDown size={14} className={`transition-transform ${showDifficultyDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <button onClick={handleNewPuzzle} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0" title="New Puzzle">
            <RefreshCw size={16} className="text-white" />
          </button>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          <button onClick={() => setShowCode(!showCode)} className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
            <Code2 size={16} />
          </button>
        </motion.div>
      </motion.div>

      <CodePanel isOpen={showCode} onClose={() => setShowCode(false)} panelWidth={panelWidth} setPanelWidth={setPanelWidth} />

      {/* Difficulty Dropdown - Rendered outside control bar to avoid overflow clipping */}
      <AnimatePresence>
        {showDifficultyDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-slate-900 border border-white/20 rounded-xl overflow-hidden shadow-xl z-[200] min-w-[100px]"
            style={{ bottom: dropdownPosition.bottom, left: dropdownPosition.left }}
            data-dropdown="difficulty"
          >
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); setShowDifficultyDropdown(false); }}
                className={`w-full px-4 py-2.5 text-sm font-bold text-left transition-colors cursor-pointer capitalize flex items-center gap-2 ${d === difficulty ? `${getDifficultyColor(d).bg} ${getDifficultyColor(d).text}` : `text-white/80 ${getDifficultyColor(d).hover}`}`}
              >
                <span className={`w-2 h-2 rounded-full ${d === 'easy' ? 'bg-green-400' : d === 'medium' ? 'bg-amber-400' : 'bg-red-400'}`} />
                {d}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SudokuSolver;