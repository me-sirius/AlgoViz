import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Target, X, Code2, WrapText,
  RotateCw, Sparkles, Settings, Search, Grid3X3, Shuffle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { wordSearch as wordSearchCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// WORD SEARCH STEP GENERATOR
// ============================================================================

const generateWordSearchSteps = (grid, word) => {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  let backtracks = 0;
  let found = false;

  // Direction vectors: Up, Right, Down, Left
  const dr = [-1, 0, 1, 0];
  const dc = [0, 1, 0, -1];

  // Helper: Create snapshot
  const snapshot = (status, currentPos, pathStack, charIndex, commentary = "", candidatePos = null) => {
    const gridState = grid.map((row, r) =>
      row.map((char, c) => {
        let cellStatus = 'idle';
        const isInPath = pathStack.some(([pr, pc]) => pr === r && pc === c);
        const isCandidate = candidatePos && candidatePos[0] === r && candidatePos[1] === c;
        const isCurrent = currentPos && currentPos[0] === r && currentPos[1] === c;

        if (isInPath) {
          cellStatus = 'matched';
        } else if (isCurrent) {
          cellStatus = 'current';
        } else if (isCandidate) {
          cellStatus = 'candidate';
        } else if (visited[r][c]) {
          cellStatus = 'visited';
        }

        return {
          char,
          row: r,
          col: c,
          status: cellStatus
        };
      })
    );

    steps.push({
      gridState,
      pathStack: [...pathStack],
      charIndex,
      currentPos,
      candidatePos,
      status,
      backtracks,
      found,
      word,
      commentary,
      codeLine: getCodeLine(status)
    });
  };

  const getCodeLine = (status) => {
    switch (status) {
      case 'starting': return 1;
      case 'checking': return 3;
      case 'matched': return 5;
      case 'exploring': return 6;
      case 'backtracking': return 8;
      case 'found': return 2;
      case 'not_found': return 9;
      default: return 1;
    }
  };

  // Initial state
  snapshot('starting', null, [], 0, `Starting Word Search for "${word}". Scanning grid for '${word[0]}'...`);

  // DFS function
  const dfs = (r, c, index, pathStack) => {
    // Base case: found the word
    if (index === word.length) {
      found = true;
      snapshot('found', [r, c], pathStack, index, `🎉 Found "${word}"! Path complete with ${pathStack.length} characters.`);
      return true;
    }

    // Bounds and validity check
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (visited[r][c]) return false;
    if (grid[r][c] !== word[index]) return false;

    // Match found for current character
    visited[r][c] = true;
    pathStack.push([r, c]);

    snapshot('matched', [r, c], pathStack, index + 1,
      `✓ Matched '${word[index]}' at (${r}, ${c}). Progress: ${index + 1}/${word.length}`);

    // Try all 4 directions
    for (let i = 0; i < 4; i++) {
      const newR = r + dr[i];
      const newC = c + dc[i];

      // Show candidate check
      if (newR >= 0 && newR < rows && newC >= 0 && newC < cols && !visited[newR][newC]) {
        const dirNames = ['Up', 'Right', 'Down', 'Left'];
        snapshot('exploring', [r, c], pathStack, index + 1,
          `Checking ${dirNames[i]} neighbor (${newR}, ${newC}): '${grid[newR][newC]}'`, [newR, newC]);
      }

      if (dfs(newR, newC, index + 1, pathStack)) {
        return true;
      }
    }

    // Backtrack
    visited[r][c] = false;
    pathStack.pop();
    backtracks++;

    snapshot('backtracking', [r, c], pathStack, index,
      `↩ Dead end at (${r}, ${c}). Backtracking... (${backtracks} total)`);

    return false;
  };

  // Try starting from each cell
  for (let r = 0; r < rows && !found; r++) {
    for (let c = 0; c < cols && !found; c++) {
      if (grid[r][c] === word[0]) {
        snapshot('checking', [r, c], [], 0,
          `Found starting character '${word[0]}' at (${r}, ${c}). Beginning DFS...`);

        if (dfs(r, c, 0, [])) {
          break;
        }
      }
    }
  }

  if (!found) {
    snapshot('not_found', null, [], 0, `😞 Word "${word}" not found in the grid.`);
  }

  return steps;
};

// ============================================================================
// GRID GENERATOR
// ============================================================================

const generateGrid = (rows, cols, word, embedWord = true) => {
  const grid = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
  );

  if (embedWord && word.length > 0) {
    // Place the word randomly in the grid
    const maxAttempts = 100;
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      // Random starting position
      const startR = Math.floor(Math.random() * rows);
      const startC = Math.floor(Math.random() * cols);

      // Try to place word with snake-like path
      const path = [];
      const tempVisited = Array(rows).fill(null).map(() => Array(cols).fill(false));

      const placeWord = (r, c, index) => {
        if (index === word.length) return true;
        if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
        if (tempVisited[r][c]) return false;

        tempVisited[r][c] = true;
        path.push([r, c]);

        // Shuffle directions for randomness
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        const shuffled = directions.sort(() => Math.random() - 0.5);

        for (const [dr, dc] of shuffled) {
          if (placeWord(r + dr, c + dc, index + 1)) {
            return true;
          }
        }

        // Backtrack
        tempVisited[r][c] = false;
        path.pop();
        return false;
      };

      if (placeWord(startR, startC, 0)) {
        // Place the word in the grid
        for (let i = 0; i < path.length; i++) {
          const [r, c] = path[i];
          grid[r][c] = word[i].toUpperCase();
        }
        placed = true;
      }
    }

    // Fallback: place word in a straight line if snake fails
    if (!placed) {
      const dir = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      if (dir === 'horizontal' && cols >= word.length) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * (cols - word.length + 1));
        for (let i = 0; i < word.length; i++) {
          grid[r][c + i] = word[i].toUpperCase();
        }
      } else if (dir === 'vertical' && rows >= word.length) {
        const r = Math.floor(Math.random() * (rows - word.length + 1));
        const c = Math.floor(Math.random() * cols);
        for (let i = 0; i < word.length; i++) {
          grid[r + i][c] = word[i].toUpperCase();
        }
      }
    }
  }

  return grid;
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
    starting: { text: 'Scanning...', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    checking: { text: 'Checking', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    matched: { text: 'Matched!', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    exploring: { text: 'Exploring', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    backtracking: { text: 'Backtracking', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    found: { text: '✓ Found!', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    not_found: { text: 'Not Found', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const config = statusConfig[status] || statusConfig.starting;

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

const TargetWordDisplay = ({ word, matchedCount, found }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {word.split('').map((char, idx) => {
        const isMatched = idx < matchedCount;
        const isFound = found && idx < matchedCount;

        return (
          <motion.div
            key={idx}
            className={`relative w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-black text-xl sm:text-2xl transition-all duration-300
              ${isFound
                ? 'bg-gradient-to-br from-emerald-500/40 to-green-500/40 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30'
                : isMatched
                  ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/50 border-slate-600/50 text-white/40'
              }`}
            animate={isFound ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            {char.toUpperCase()}
            {isMatched && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                  boxShadow: isFound
                    ? ['0 0 20px rgba(16, 185, 129, 0.5)', '0 0 40px rgba(16, 185, 129, 0.3)', '0 0 20px rgba(16, 185, 129, 0.5)']
                    : ['0 0 15px rgba(245, 158, 11, 0.4)', '0 0 25px rgba(245, 158, 11, 0.2)', '0 0 15px rgba(245, 158, 11, 0.4)']
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const LetterTile = ({ char, row, col, status, found, delay }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'matched':
        return found
          ? 'bg-gradient-to-br from-emerald-500/40 to-green-500/40 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50'
          : 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border-amber-400 text-amber-300 ring-2 ring-amber-400/50';
      case 'current':
        return 'bg-gradient-to-br from-cyan-500/40 to-blue-500/40 border-cyan-400 text-cyan-300 ring-4 ring-cyan-400/30';
      case 'candidate':
        return 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border-blue-400 text-blue-300';
      case 'visited':
        return 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400/60 opacity-60';
      default:
        return 'bg-slate-800/50 border-slate-600/30 text-white/70 hover:bg-slate-700/50';
    }
  };

  return (
    <motion.div
      className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl border flex items-center justify-center font-bold text-sm sm:text-base md:text-lg transition-all duration-200 ${getStatusStyles()}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{ delay: delay * 0.01 }}
    >
      {char}
      {status === 'current' && (
        <motion.div
          className="absolute inset-0 border-2 border-cyan-400 rounded-lg sm:rounded-xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
      {status === 'candidate' && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400 rounded-lg sm:rounded-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}
      {found && status === 'matched' && (
        <motion.div
          className="absolute inset-0 rounded-lg sm:rounded-xl bg-emerald-400/20"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 0.6, delay: delay * 0.05 }}
        />
      )}
    </motion.div>
  );
};

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [wrapCode, setWrapCode] = useState(false);
  const panelRef = useRef(null);

  const languageLabels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const codeLines = wordSearchCode[codeLanguage].split('\n');

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
          <div onMouseDown={handleMouseDown} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-amber-500/50 transition-colors" />
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Word Search Algorithm</h3>
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
                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(245, 158, 11, 0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-amber-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-amber-400 font-bold" : "text-white/30"}`}>{idx + 1}</span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-amber-100" : "text-white/70"}`}>{line || " "}</pre>
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

const WordSearch = () => {
  const navigate = useNavigate();

  // State
  const [gridSize, setGridSize] = useState(8);
  const [targetWord, setTargetWord] = useState("ALGORITHM");
  const [inputWord, setInputWord] = useState("ALGORITHM");
  const [grid, setGrid] = useState(() => generateGrid(8, 8, "ALGORITHM", true));
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [showCode, setShowCode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450);

  // Current step data
  const currentStep = steps[currentStepIndex] || {
    gridState: grid.map((row, r) => row.map((char, c) => ({ char, row: r, col: c, status: 'idle' }))),
    pathStack: [],
    charIndex: 0,
    currentPos: null,
    candidatePos: null,
    status: 'starting',
    backtracks: 0,
    found: false,
    word: targetWord,
    commentary: "Configure the target word and click Play to start the hunt!",
    codeLine: 1
  };

  // Initialize
  const initialize = useCallback(() => {
    const newGrid = generateGrid(gridSize, gridSize, targetWord.toUpperCase(), true);
    setGrid(newGrid);
    const allSteps = generateWordSearchSteps(newGrid, targetWord.toUpperCase());
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [gridSize, targetWord]);

  useEffect(() => {
    initialize();
  }, []);

  // Apply changes
  const handleApplyChanges = () => {
    const word = inputWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length === 0) {
      alert("Please enter a valid word (letters only)");
      return;
    }
    if (word.length > gridSize * 2) {
      alert(`Word too long for grid size. Max length: ${gridSize * 2}`);
      return;
    }

    setTargetWord(word);
    const newGrid = generateGrid(gridSize, gridSize, word, true);
    setGrid(newGrid);
    const allSteps = generateWordSearchSteps(newGrid, word);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  };

  // Embed word (guaranteed solution)
  const handleEmbedWord = () => {
    const word = inputWord.toUpperCase().replace(/[^A-Z]/g, '') || targetWord;
    setTargetWord(word);
    const newGrid = generateGrid(gridSize, gridSize, word, true);
    setGrid(newGrid);
    const allSteps = generateWordSearchSteps(newGrid, word);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  };

  // Random noise (likely to fail)
  const handleRandomNoise = () => {
    const word = inputWord.toUpperCase().replace(/[^A-Z]/g, '') || targetWord;
    setTargetWord(word);
    const newGrid = generateGrid(gridSize, gridSize, word, false);
    setGrid(newGrid);
    const allSteps = generateWordSearchSteps(newGrid, word);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  };

  // Grid size change
  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
    const word = targetWord || "REACT";
    const newGrid = generateGrid(newSize, newSize, word, true);
    setGrid(newGrid);
    const allSteps = generateWordSearchSteps(newGrid, word);
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
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-44 sm:pt-40 xl:pt-62 pb-28 sm:pb-36">
          {/* Target Word Display */}
          <motion.div
            className="mb-6 sm:mb-8 backdrop-blur-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-3xl p-4 sm:p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-3">
              <div className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider">Target Word</div>
            </div>
            <TargetWordDisplay
              word={currentStep.word}
              matchedCount={currentStep.charIndex}
              found={currentStep.found}
            />
          </motion.div>

          {/* Letter Grid */}
          <div
            className="grid gap-1 sm:gap-1.5 md:gap-2"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {currentStep.gridState.map((row, r) =>
              row.map((cell, c) => (
                <LetterTile
                  key={`${r}-${c}`}
                  char={cell.char}
                  row={r}
                  col={c}
                  status={cell.status}
                  found={currentStep.found}
                  delay={r * gridSize + c}
                />
              ))
            )}
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
              <h1 className="text-base sm:text-lg font-bold text-white">Word Search</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold border border-amber-500/30">
                Backtracking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Search size={12} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{currentStep.charIndex}/{currentStep.word.length}</span>
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
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] text-white/60">Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[10px] text-white/60">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[10px] text-white/60">Candidate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <span className="text-[10px] text-white/60">Dead End</span>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP HEADER */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-black text-white">Word Search</h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
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
            <StatCard icon={Search} value={`${currentStep.charIndex}/${currentStep.word.length}`} label="Progress" color="amber" />
            <StatCard icon={Target} value={currentStep.pathStack.length} label="Path" color="green" />
            <StatCard icon={RotateCw} value={currentStep.backtracks} label="Backtracks" color="red" />
            <StatCard icon={Zap} value={`${opsPerSecond}/s`} label="Speed" color="cyan" />
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
            <Sparkles size={16} className="text-amber-400" />
            Configuration
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Target Word</label>
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none uppercase"
                placeholder="REACT"
              />
            </div>

            <div>
              <label className="text-xs text-white/60 mb-1 block">Grid Size: {gridSize}x{gridSize}</label>
              <input
                type="range"
                min="6"
                max="12"
                value={gridSize}
                onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/20 accent-amber-500"
              />
            </div>

            <button
              onClick={handleEmbedWord}
              className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Grid3X3 size={16} />
              Embed Word
            </button>

            <button
              onClick={handleRandomNoise}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Shuffle size={16} />
              Random Noise
            </button>
          </div>
        </motion.div>

        {/* LEGEND - Desktop only */}
        <motion.div
          className="hidden xl:flex fixed top-24 z-40 backdrop-blur-xl bg-black/40 border border-white rounded-full px-6 py-2.5 items-center gap-6"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{
            left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
            x: '-50%',
            top: showCode ? 190 : 96
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-xs font-semibold text-white/80">Matched</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-400" />
            <span className="text-xs font-semibold text-white/80">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-400" />
            <span className="text-xs font-semibold text-white/80">Candidate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-400/60" />
            <span className="text-xs font-semibold text-white/80">Dead End</span>
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
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-amber-500"
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
              className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer"
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

          {/* Speed Slider */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Zap size={14} className="text-amber-400" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-amber-500"
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
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showCode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
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
                  <Sparkles size={18} className="text-amber-400" />
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
                  <label className="text-sm text-white/60 mb-1.5 block">Target Word</label>
                  <input
                    type="text"
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500 focus:outline-none uppercase"
                    placeholder="REACT"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Grid Size: {gridSize}x{gridSize}</label>
                  <input
                    type="range"
                    min="6"
                    max="12"
                    value={gridSize}
                    onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/20 accent-amber-500"
                  />
                </div>

                <button
                  onClick={() => { handleEmbedWord(); setShowSettings(false); }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Grid3X3 size={16} />
                  Embed Word
                </button>

                <button
                  onClick={() => { handleRandomNoise(); setShowSettings(false); }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shuffle size={16} />
                  Random Noise
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

export default WordSearch;
