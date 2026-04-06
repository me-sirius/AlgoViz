import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Code2,
  ArrowLeft, Zap, Grid3X3, Target, Footprints, RotateCw, Eraser,
  Sparkles, ChevronDown, X, WrapText, Flag, MapPin, HelpCircle,
  ArrowRight, MousePointer, Move
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../core/context/ThemeContext";
import { mazeSolverDFS, mazeSolverBFS } from "../../../core/constants/codeExamples";

// ============================================================================
// GUIDED TOUR COMPONENT (Spotlight Style)
// ============================================================================

const tourSteps = [
  {
    target: 'tour-grid',
    title: 'The Maze Grid 🧭',
    description: 'This is your canvas! White cells are walls, dark cells are walkable. Click and drag to draw walls!',
    color: 'from-purple-500 to-pink-500'
  },
  {
    // Multi-target: highlight both start and end icons
    multiTarget: ['tour-start', 'tour-end'],
    title: 'Start & End Points 📍🚩',
    description: 'Green pin = start, Red flag = goal. Drag them anywhere on the grid to reposition!',
    color: 'from-green-500 to-emerald-500'
  },
  {
    target: 'tour-algorithm',
    title: 'Choose Your Algorithm 🔄',
    description: 'DFS explores deeply then backtracks. BFS finds the SHORTEST path by exploring layer-by-layer!',
    color: 'from-cyan-500 to-violet-500'
  },
  {
    target: 'tour-speed',
    title: 'Animation Speed ⚡',
    description: 'Control visualization speed. Left = slow-motion, right = turbo!',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    target: 'tour-size',
    title: 'Grid Size 📐',
    description: 'Change maze dimensions from Small (11×17) to XXL (31×51).',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    target: 'tour-generate',
    title: 'Generate Maze ✨',
    description: 'Auto-generate mazes with Recursive Division, Randomized DFS, or Random Walls.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    target: 'tour-solve',
    title: 'Solve It! 🎯',
    description: 'Watch the selected algorithm (DFS or BFS) find a path through the maze!',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    target: 'tour-code',
    title: 'View Code 💻',
    description: 'See the algorithm in C++, Python, or JavaScript with line highlighting!',
    color: 'from-violet-500 to-purple-500'
  },
  {
    target: 'tour-help',
    title: 'Need Help? 💡',
    description: 'Click here anytime to restart this tour. Now go solve some mazes! 🎉',
    color: 'from-purple-500 to-pink-500'
  }
];

const GuidedTour = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRects, setTargetRects] = useState([]);
  const [tooltipStyle, setTooltipStyle] = useState({});

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isOpen) return;

    const calculatePosition = () => {
      // Get all targets (single or multi)
      const targets = step.multiTarget || [step.target];
      const rects = [];
      let needsScroll = false;

      for (const t of targets) {
        const el = document.querySelector(`[data-tour="${t}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();

          // Check if element is in control bar and not fully visible
          const controlBar = el.closest('[data-control-bar="true"]');
          if (controlBar) {
            const isVisible = rect.left >= 0 && rect.right <= window.innerWidth;
            if (!isVisible) {
              needsScroll = true;
              el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
          }

          rects.push(rect);
        }
      }

      if (rects.length === 0) return;

      // If we scrolled, recalculate after scroll completes
      if (needsScroll) {
        setTimeout(() => {
          const newRects = [];
          for (const t of targets) {
            const el = document.querySelector(`[data-tour="${t}"]`);
            if (el) newRects.push(el.getBoundingClientRect());
          }
          if (newRects.length > 0) {
            setTargetRects(newRects);
            updateTooltipPosition(newRects);
          }
        }, 350);
      } else {
        setTargetRects(rects);
        updateTooltipPosition(rects);
      }
    };

    const updateTooltipPosition = (rects) => {
      if (rects.length === 0) return;

      // Calculate bounding box of all targets for tooltip positioning
      const minLeft = Math.min(...rects.map(r => r.left));
      const maxRight = Math.max(...rects.map(r => r.right));
      const minTop = Math.min(...rects.map(r => r.top));
      const maxBottom = Math.max(...rects.map(r => r.bottom));

      const boundingRect = {
        left: minLeft,
        right: maxRight,
        top: minTop,
        bottom: maxBottom,
        width: maxRight - minLeft,
        height: maxBottom - minTop
      };

      const tooltipW = 320;
      const tooltipH = 220;
      const gap = 40;
      const pad = 12;

      const sTop = minTop - pad;
      const sBottom = maxBottom + pad;
      const sLeft = minLeft - pad;
      const sRight = maxRight + pad;

      const isControlBar = maxBottom > window.innerHeight - 150;
      const fixedControlBarY = window.innerHeight - 150 - tooltipH - gap;

      const tryPosition = (pos) => {
        let t, l;
        const centerX = (minLeft + maxRight) / 2;

        switch (pos) {
          case 'above':
            t = isControlBar ? fixedControlBarY : (sTop - tooltipH - gap);
            l = centerX - tooltipW / 2;
            break;
          case 'below':
            t = sBottom + gap;
            l = centerX - tooltipW / 2;
            break;
          case 'right':
            t = isControlBar ? fixedControlBarY : ((minTop + maxBottom) / 2 - tooltipH / 2);
            l = sRight + gap;
            break;
          case 'left':
            t = isControlBar ? fixedControlBarY : ((minTop + maxBottom) / 2 - tooltipH / 2);
            l = sLeft - tooltipW - gap;
            break;
        }

        l = Math.max(16, Math.min(l, window.innerWidth - tooltipW - 16));
        t = Math.max(16, Math.min(t, window.innerHeight - tooltipH - 16));

        const overlaps = !(
          l + tooltipW < sLeft || l > sRight ||
          t + tooltipH < sTop || t > sBottom
        );

        return { top: t, left: l, valid: !overlaps };
      };

      for (const pos of ['above', 'below', 'right', 'left']) {
        const result = tryPosition(pos);
        if (result.valid) {
          setTooltipStyle({ top: result.top, left: result.left, width: tooltipW });
          return;
        }
      }

      const centerX = (minLeft + maxRight) / 2;
      const centerY = (minTop + maxBottom) / 2;
      setTooltipStyle({
        top: centerY < window.innerHeight / 2 ? window.innerHeight - tooltipH - 32 : 32,
        left: centerX < window.innerWidth / 2 ? window.innerWidth - tooltipW - 32 : 32,
        width: tooltipW
      });
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isOpen, currentStep, step]);

  const handleNext = () => isLastStep ? onComplete() : setCurrentStep(p => p + 1);
  const handlePrev = () => !isFirstStep && setCurrentStep(p => p - 1);
  const handleSkip = () => onComplete();

  if (!isOpen || targetRects.length === 0) return null;

  const pad = 16;
  const spotlights = targetRects.map(rect => ({
    x: rect.left - pad,
    y: rect.top - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    rx: 12
  }));

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Overlay with multiple spotlight cutouts */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlights.map((spot, idx) => (
              <rect
                key={idx}
                x={spot.x}
                y={spot.y}
                width={spot.width}
                height={spot.height}
                rx={spot.rx}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.85)"
          mask="url(#spotlight-mask)"
          onClick={handleSkip}
        />
      </svg>

      {/* Spotlight borders/glow effects for each target */}
      {spotlights.map((spot, idx) => (
        <motion.div
          key={idx}
          className="absolute border-2 border-white/50 rounded-xl pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            left: spot.x,
            top: spot.y,
            width: spot.width,
            height: spot.height
          }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            boxShadow: '0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(147,51,234,0.3)'
          }}
        />
      ))}

      {/* Tooltip */}
      <motion.div
        key={currentStep}
        className="absolute pointer-events-auto"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={tooltipStyle}
      >
        <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-2xl p-5 shadow-2xl">
          {/* Progress indicator */}
          <div className="flex items-center gap-1 mb-4">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentStep
                  ? `flex-1 bg-gradient-to-r ${step.color}`
                  : idx < currentStep
                    ? 'w-4 bg-white/50'
                    : 'w-4 bg-white/20'
                  }`}
              />
            ))}
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">{step.description}</p>

          {/* Step counter */}
          <div className="text-xs text-white/40 mb-4">
            Step {currentStep + 1} of {tourSteps.length}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 px-4 py-2 rounded-lg bg-gradient-to-r ${step.color} text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1`}
            >
              {isLastStep ? "Let's Go!" : "Next"}
              {!isLastStep && <ArrowRight size={16} />}
            </button>
          </div>

          {/* Skip link */}
          <button
            onClick={handleSkip}
            className="w-full mt-2 py-1 text-white/40 hover:text-white/70 text-xs font-medium transition-colors cursor-pointer"
          >
            Skip tour
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MAZE SOLVER CODE - Use imported code from codeExamples.js
// ============================================================================

const mazeSolverCode = {
  dfs: mazeSolverDFS,
  bfs: mazeSolverBFS
};

// ============================================================================
// MAZE GENERATION ALGORITHMS
// ============================================================================

// Create empty grid
const createEmptyGrid = (rows, cols) => {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isWall: false,
        isStart: r === 0 && c === 0,
        isEnd: r === rows - 1 && c === cols - 1,
        status: 'unvisited'
      });
    }
    grid.push(row);
  }
  return grid;
};

// Random walls (simple)
const generateRandomWalls = (rows, cols, density = 0.3) => {
  const grid = createEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 0 && c === 0) || (r === rows - 1 && c === cols - 1)) continue;
      if (Math.random() < density) {
        grid[r][c].isWall = true;
      }
    }
  }
  return grid;
};

// Recursive Division Maze
const generateRecursiveDivision = (rows, cols) => {
  // Start with all walls
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isWall: r % 2 === 0 || c % 2 === 0, // Grid pattern
        isStart: r === 0 && c === 0,
        isEnd: r === rows - 1 && c === cols - 1,
        status: 'unvisited'
      });
    }
    grid.push(row);
  }

  // Ensure start and end are open
  grid[0][0].isWall = false;
  grid[0][1].isWall = false;
  grid[1][0].isWall = false;
  grid[rows - 1][cols - 1].isWall = false;
  grid[rows - 1][cols - 2].isWall = false;
  grid[rows - 2][cols - 1].isWall = false;

  const divide = (startRow, endRow, startCol, endCol, horizontal) => {
    if (endRow - startRow < 2 || endCol - startCol < 2) return;

    if (horizontal) {
      // Build horizontal wall
      const wallRow = startRow + 2 * Math.floor(Math.random() * Math.floor((endRow - startRow) / 2)) + 1;
      const passage = startCol + 2 * Math.floor(Math.random() * Math.floor((endCol - startCol + 1) / 2));

      for (let c = startCol; c <= endCol; c++) {
        if (c !== passage && wallRow < rows) {
          grid[wallRow][c].isWall = true;
        }
      }

      divide(startRow, wallRow - 1, startCol, endCol, !horizontal);
      divide(wallRow + 1, endRow, startCol, endCol, !horizontal);
    } else {
      // Build vertical wall
      const wallCol = startCol + 2 * Math.floor(Math.random() * Math.floor((endCol - startCol) / 2)) + 1;
      const passage = startRow + 2 * Math.floor(Math.random() * Math.floor((endRow - startRow + 1) / 2));

      for (let r = startRow; r <= endRow; r++) {
        if (r !== passage && wallCol < cols) {
          grid[r][wallCol].isWall = true;
        }
      }

      divide(startRow, endRow, startCol, wallCol - 1, !horizontal);
      divide(startRow, endRow, wallCol + 1, endCol, !horizontal);
    }
  };

  divide(1, rows - 2, 1, cols - 2, Math.random() > 0.5);

  return grid;
};

// Randomized DFS Maze (Backtracking maze generation)
const generateRandomizedDFS = (rows, cols) => {
  // Start with all walls
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isWall: true,
        isStart: r === 0 && c === 0,
        isEnd: r === rows - 1 && c === cols - 1,
        status: 'unvisited'
      });
    }
    grid.push(row);
  }

  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const stack = [[1, 1]]; // Start from (1,1)

  // Carve out starting position
  if (rows > 1 && cols > 1) {
    grid[1][1].isWall = false;
    visited[1][1] = true;
  }

  const directions = [[-2, 0], [0, 2], [2, 0], [0, -2]];

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];

    // Shuffle directions
    const shuffled = [...directions].sort(() => Math.random() - 0.5);
    let found = false;

    for (const [dr, dc] of shuffled) {
      const newR = r + dr;
      const newC = c + dc;

      if (newR > 0 && newR < rows - 1 && newC > 0 && newC < cols - 1 && !visited[newR][newC]) {
        visited[newR][newC] = true;
        grid[newR][newC].isWall = false;
        grid[r + dr / 2][c + dc / 2].isWall = false; // Remove wall between
        stack.push([newR, newC]);
        found = true;
        break;
      }
    }

    if (!found) {
      stack.pop();
    }
  }

  // Ensure start and end are accessible
  grid[0][0].isWall = false;
  grid[0][1].isWall = false;
  grid[1][0].isWall = false;
  grid[rows - 1][cols - 1].isWall = false;
  grid[rows - 1][cols - 2].isWall = false;
  grid[rows - 2][cols - 1].isWall = false;

  return grid;
};

// ============================================================================
// MAZE SOLVING - DFS STEP GENERATOR
// ============================================================================

const generateDFSSteps = (inputGrid) => {
  const rows = inputGrid.length;
  const cols = inputGrid[0].length;
  const steps = [];
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const path = [];
  let backtracks = 0;
  let stepsTaken = 0;

  // Find start and end positions
  let startPos = [0, 0];
  let endPos = [rows - 1, cols - 1];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (inputGrid[r][c].isStart) startPos = [r, c];
      if (inputGrid[r][c].isEnd) endPos = [r, c];
    }
  }

  // Clone grid for each step
  const cloneGrid = (grid, updates = {}) => {
    return grid.map((row, r) => row.map((cell, c) => {
      const key = `${r}-${c}`;
      return {
        ...cell,
        status: updates[key] || cell.status
      };
    }));
  };

  const getGridStatus = () => {
    const statuses = {};
    for (const [r, c] of path) {
      statuses[`${r}-${c}`] = 'visited';
    }
    return statuses;
  };

  // Initial step
  steps.push({
    grid: cloneGrid(inputGrid),
    currentPos: null,
    status: 'idle',
    commentary: 'Starting DFS solver. Will explore deeply, backtracking when stuck.',
    codeLine: 20,
    stats: { stepsTaken: 0, backtracks: 0, pathLength: 0 },
    path: []
  });

  const dr = [-1, 0, 1, 0]; // Top, Right, Bottom, Left
  const dc = [0, 1, 0, -1];

  const solve = (r, c) => {
    // Check bounds and walls
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (inputGrid[r][c].isWall || visited[r][c]) return false;

    stepsTaken++;
    visited[r][c] = true;
    path.push([r, c]);

    // Record visiting step
    const currentStatuses = getGridStatus();
    currentStatuses[`${r}-${c}`] = 'visiting';

    steps.push({
      grid: cloneGrid(inputGrid, currentStatuses),
      currentPos: [r, c],
      status: 'exploring',
      commentary: `Exploring cell (${r}, ${c}). Marking as visited.`,
      codeLine: 28,
      stats: { stepsTaken, backtracks, pathLength: path.length },
      path: [...path]
    });

    // Check if reached end
    if (r === endPos[0] && c === endPos[1]) {
      // Mark solution path
      const solutionStatuses = {};
      for (const [pr, pc] of path) {
        solutionStatuses[`${pr}-${pc}`] = 'path';
      }

      steps.push({
        grid: cloneGrid(inputGrid, solutionStatuses),
        currentPos: [r, c],
        status: 'found',
        commentary: `🎉 Destination reached! Path found with length ${path.length}.`,
        codeLine: 24,
        stats: { stepsTaken, backtracks, pathLength: path.length },
        path: [...path]
      });
      return true;
    }

    // Try all 4 directions
    for (let i = 0; i < 4; i++) {
      const newR = r + dr[i];
      const newC = c + dc[i];

      if (solve(newR, newC)) {
        return true;
      }
    }

    // Backtrack
    backtracks++;
    path.pop();

    const backtrackStatuses = getGridStatus();
    backtrackStatuses[`${r}-${c}`] = 'backtracked';

    steps.push({
      grid: cloneGrid(inputGrid, backtrackStatuses),
      currentPos: path.length > 0 ? path[path.length - 1] : null,
      status: 'backtracking',
      commentary: `Dead end at (${r}, ${c}). Backtracking...`,
      codeLine: 44,
      stats: { stepsTaken, backtracks, pathLength: path.length },
      path: [...path]
    });

    return false;
  };

  // Start solving from the start position
  const found = solve(startPos[0], startPos[1]);

  if (!found) {
    steps.push({
      grid: cloneGrid(inputGrid, getGridStatus()),
      currentPos: null,
      status: 'not_found',
      commentary: 'No path exists from Start to End. The maze is unsolvable.',
      codeLine: 45,
      stats: { stepsTaken, backtracks, pathLength: 0 },
      path: []
    });
  }

  return steps;
};

// ============================================================================
// MAZE SOLVING - BFS STEP GENERATOR (Shortest Path)
// ============================================================================

const generateBFSSteps = (inputGrid) => {
  const rows = inputGrid.length;
  const cols = inputGrid[0].length;
  const steps = [];
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const parent = new Map(); // To reconstruct shortest path
  const queue = [];
  let stepsTaken = 0;
  let maxQueueSize = 0;

  // Find start and end positions
  let startPos = [0, 0];
  let endPos = [rows - 1, cols - 1];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (inputGrid[r][c].isStart) startPos = [r, c];
      if (inputGrid[r][c].isEnd) endPos = [r, c];
    }
  }

  // Clone grid for each step
  const cloneGrid = (grid, updates = {}) => {
    return grid.map((row, r) => row.map((cell, c) => {
      const key = `${r}-${c}`;
      return {
        ...cell,
        status: updates[key] || cell.status
      };
    }));
  };

  // Get current grid status with visited nodes
  const getGridStatus = (visitedSet, queueSet, currentPos) => {
    const statuses = {};
    for (const key of visitedSet) {
      statuses[key] = 'bfs-visited';
    }
    for (const key of queueSet) {
      statuses[key] = 'bfs-queued';
    }
    if (currentPos) {
      statuses[`${currentPos[0]}-${currentPos[1]}`] = 'visiting';
    }
    return statuses;
  };

  // Initial step
  steps.push({
    grid: cloneGrid(inputGrid),
    currentPos: null,
    status: 'idle',
    commentary: 'Starting BFS solver. Will explore layer by layer to find shortest path.',
    codeLine: 14,
    stats: { stepsTaken: 0, maxQueue: 0, pathLength: 0 },
    path: []
  });

  const dr = [-1, 0, 1, 0];
  const dc = [0, 1, 0, -1];

  // Initialize BFS
  queue.push(startPos);
  visited[startPos[0]][startPos[1]] = true;
  const visitedSet = new Set([`${startPos[0]}-${startPos[1]}`]);
  const queueSet = new Set([`${startPos[0]}-${startPos[1]}`]);
  maxQueueSize = 1;

  let found = false;

  while (queue.length > 0 && !found) {
    const [r, c] = queue.shift();
    queueSet.delete(`${r}-${c}`);
    stepsTaken++;

    // Record visiting step
    steps.push({
      grid: cloneGrid(inputGrid, getGridStatus(visitedSet, queueSet, [r, c])),
      currentPos: [r, c],
      status: 'exploring',
      commentary: `Processing cell (${r}, ${c}). Queue size: ${queue.length}`,
      codeLine: 19,
      stats: { stepsTaken, maxQueue: maxQueueSize, pathLength: 0 },
      path: []
    });

    // Check if reached end
    if (r === endPos[0] && c === endPos[1]) {
      // Reconstruct shortest path using parent map
      const path = [];
      let curr = `${r}-${c}`;
      while (curr) {
        const [cr, cc] = curr.split('-').map(Number);
        path.push([cr, cc]);
        curr = parent.get(curr);
      }
      path.reverse();

      // Mark solution path
      const solutionStatuses = {};
      for (const key of visitedSet) {
        solutionStatuses[key] = 'bfs-visited';
      }
      for (const [pr, pc] of path) {
        solutionStatuses[`${pr}-${pc}`] = 'path';
      }

      steps.push({
        grid: cloneGrid(inputGrid, solutionStatuses),
        currentPos: [r, c],
        status: 'found',
        commentary: `🎉 Shortest path found! Length: ${path.length} (BFS guarantees shortest path)`,
        codeLine: 24,
        stats: { stepsTaken, maxQueue: maxQueueSize, pathLength: path.length },
        path: path
      });
      found = true;
      break;
    }

    // Explore all 4 neighbors
    for (let i = 0; i < 4; i++) {
      const newR = r + dr[i];
      const newC = c + dc[i];
      const newKey = `${newR}-${newC}`;

      if (newR >= 0 && newR < rows &&
        newC >= 0 && newC < cols &&
        !inputGrid[newR][newC].isWall &&
        !visited[newR][newC]) {

        visited[newR][newC] = true;
        visitedSet.add(newKey);
        queueSet.add(newKey);
        parent.set(newKey, `${r}-${c}`);
        queue.push([newR, newC]);
        maxQueueSize = Math.max(maxQueueSize, queue.length);
      }
    }
  }

  if (!found) {
    steps.push({
      grid: cloneGrid(inputGrid, getGridStatus(visitedSet, new Set(), null)),
      currentPos: null,
      status: 'not_found',
      commentary: 'No path exists from Start to End. The maze is unsolvable.',
      codeLine: 49,
      stats: { stepsTaken, maxQueue: maxQueueSize, pathLength: 0 },
      path: []
    });
  }

  return steps;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard = ({ icon: Icon, value, label, color = "cyan" }) => {
  const colorMap = {
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
    red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
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
    exploring: { text: 'Exploring', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    backtracking: { text: 'Backtracking', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    found: { text: 'Path Found!', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    not_found: { text: 'No Path', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  };

  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${config.color}`}>
      {config.text}
    </div>
  );
};

// Code Panel
const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth, algorithm = 'dfs' }) => {
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [wrapCode, setWrapCode] = useState(false);
  const panelRef = useRef(null);

  const languageLabels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const codeLines = mazeSolverCode[algorithm][codeLanguage].split('\n');

  useEffect(() => {
    const handleClickOutside = (e) => {
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
                <div className={`p-2 rounded-xl bg-gradient-to-br ${algorithm === 'bfs' ? 'from-violet-500 to-fuchsia-500' : 'from-emerald-500 to-teal-500'}`}>
                  <Code2 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white">
                  {algorithm === 'bfs' ? 'BFS Shortest Path' : 'DFS Backtracking'}
                </h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={20} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {Object.keys(languageLabels).map(lang => (
                  <option key={lang} value={lang} className="bg-slate-900">{languageLabels[lang]}</option>
                ))}
              </select>
              <button
                onClick={() => setWrapCode(!wrapCode)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrapCode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(16,185,129,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-emerald-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-emerald-400 font-bold" : "text-white/30"}`}>
                  {idx + 1}
                </span>
                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-emerald-100" : "text-white/70"}`}>
                  {line || " "}
                </pre>
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

const MazeSolver = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Grid settings
  const [gridSize, setGridSize] = useState({ rows: 21, cols: 31 });
  const [grid, setGrid] = useState(() => createEmptyGrid(21, 31));

  // Solving state
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);

  // UI state
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState(null); // 'wall' or 'clear'
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [draggingNode, setDraggingNode] = useState(null); // 'start' or 'end'
  const [showTutorial, setShowTutorial] = useState(false);
  const [algorithm, setAlgorithm] = useState('dfs'); // 'dfs' or 'bfs'
  const sizeButtonRef = React.useRef(null);
  const generateButtonRef = React.useRef(null);
  const [sizeDropdownPosition, setSizeDropdownPosition] = useState({ bottom: 0, left: 0 });
  const [generateDropdownPosition, setGenerateDropdownPosition] = useState({ bottom: 0, left: 0 });

  // Always start tour on first load
  useEffect(() => {
    setShowTutorial(true);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSizeMenu && sizeButtonRef.current && !sizeButtonRef.current.contains(e.target)) {
        const dropdown = document.querySelector('[data-dropdown="size"]');
        if (!dropdown || !dropdown.contains(e.target)) {
          setShowSizeMenu(false);
        }
      }
      if (showGenerateMenu && generateButtonRef.current && !generateButtonRef.current.contains(e.target)) {
        const dropdown = document.querySelector('[data-dropdown="generate"]');
        if (!dropdown || !dropdown.contains(e.target)) {
          setShowGenerateMenu(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSizeMenu, showGenerateMenu]);

  // Set responsive grid size based on screen width
  useEffect(() => {
    const width = window.innerWidth;
    let newRows, newCols;
    if (width < 640) {
      // Mobile: Small
      newRows = 11;
      newCols = 17;
    } else if (width < 1024) {
      // Tablet: Medium
      newRows = 15;
      newCols = 23;
    } else {
      // Desktop: Large
      newRows = 21;
      newCols = 31;
    }
    setGridSize({ rows: newRows, cols: newCols });
    setGrid(createEmptyGrid(newRows, newCols));
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  // Current step data
  const currentStep = steps[currentStepIndex] || {
    grid: grid,
    currentPos: null,
    status: 'idle',
    commentary: 'Generate a maze and click Solve to begin.',
    codeLine: null,
    stats: { stepsTaken: 0, backtracks: 0, pathLength: 0 },
    path: []
  };

  const displayGrid = currentStep.grid || grid;

  // Handle maze generation
  const handleGenerate = (type) => {
    setShowGenerateMenu(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setPlaying(false);

    let newGrid;
    switch (type) {
      case 'recursive':
        newGrid = generateRecursiveDivision(gridSize.rows, gridSize.cols);
        break;
      case 'dfs':
        newGrid = generateRandomizedDFS(gridSize.rows, gridSize.cols);
        break;
      case 'random':
        newGrid = generateRandomWalls(gridSize.rows, gridSize.cols, 0.3);
        break;
      case 'empty':
      default:
        newGrid = createEmptyGrid(gridSize.rows, gridSize.cols);
        break;
    }
    setGrid(newGrid);
  };

  // Handle solve
  const handleSolve = () => {
    const solvingSteps = algorithm === 'bfs'
      ? generateBFSSteps(grid)
      : generateDFSSteps(grid);
    setSteps(solvingSteps);
    setCurrentStepIndex(0);
    setPlaying(true);
  };

  // Handle algorithm switch
  const handleAlgorithmChange = (newAlgo) => {
    if (newAlgo === algorithm) return;
    setAlgorithm(newAlgo);
    setSteps([]);
    setCurrentStepIndex(0);
    setPlaying(false);
  };

  // Handle reset
  const handleReset = () => {
    setSteps([]);
    setCurrentStepIndex(0);
    setPlaying(false);
  };

  // Handle clear walls
  const handleClearWalls = () => {
    setGrid(createEmptyGrid(gridSize.rows, gridSize.cols));
    setSteps([]);
    setCurrentStepIndex(0);
    setPlaying(false);
  };

  // Handle grid size change
  const handleGridSizeChange = (rows, cols) => {
    setShowSizeMenu(false);
    setGridSize({ rows, cols });
    setGrid(createEmptyGrid(rows, cols));
    setSteps([]);
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
  const handleScrub = (e) => setCurrentStepIndex(parseInt(e.target.value));

  // Animation loop
  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) {
      if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
      return;
    }
    const delay = Math.max(20, 400 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  // Wall drawing and node dragging handlers
  const handleCellMouseDown = (r, c) => {
    if (steps.length > 0) return; // Disable during solving

    // Check if clicking on start or end node
    if (grid[r][c].isStart) {
      setDraggingNode('start');
      return;
    }
    if (grid[r][c].isEnd) {
      setDraggingNode('end');
      return;
    }

    setIsDrawing(true);
    const newDrawMode = grid[r][c].isWall ? 'clear' : 'wall';
    setDrawMode(newDrawMode);

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      newGrid[r][c].isWall = newDrawMode === 'wall';
      return newGrid;
    });
  };

  const handleCellMouseEnter = (r, c) => {
    if (steps.length > 0) return;

    // Handle dragging start/end nodes
    if (draggingNode) {
      // Don't allow placing on walls or on the other special node
      if (grid[r][c].isWall) return;
      if (draggingNode === 'start' && grid[r][c].isEnd) return;
      if (draggingNode === 'end' && grid[r][c].isStart) return;

      setGrid(prev => {
        const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
        // Clear old position
        for (let i = 0; i < newGrid.length; i++) {
          for (let j = 0; j < newGrid[i].length; j++) {
            if (draggingNode === 'start') {
              newGrid[i][j].isStart = false;
            } else {
              newGrid[i][j].isEnd = false;
            }
          }
        }
        // Set new position
        if (draggingNode === 'start') {
          newGrid[r][c].isStart = true;
        } else {
          newGrid[r][c].isEnd = true;
        }
        newGrid[r][c].isWall = false; // Ensure it's not a wall
        return newGrid;
      });
      return;
    }

    // Handle wall drawing
    if (!isDrawing) return;
    if (grid[r][c].isStart || grid[r][c].isEnd) return;

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      newGrid[r][c].isWall = drawMode === 'wall';
      return newGrid;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDrawMode(null);
    setDraggingNode(null);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Cell styling
  const getCellStyle = (cell) => {
    const { row, col, isWall, isStart, isEnd, status } = cell;
    const isCurrentPos = currentStep.currentPos &&
      currentStep.currentPos[0] === row &&
      currentStep.currentPos[1] === col;

    if (isWall) {
      return 'bg-white border-white/80';
    }

    if (isStart) {
      return 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-400 animate-pulse';
    }

    if (isEnd) {
      return 'bg-gradient-to-br from-red-400 to-rose-500 border-red-400';
    }

    if (isCurrentPos) {
      return 'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-300 shadow-lg shadow-yellow-500/50';
    }

    switch (status) {
      case 'path':
        return 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-400 shadow-lg shadow-green-500/30';
      case 'visiting':
        return 'bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-400';
      case 'visited':
        return 'bg-gradient-to-br from-cyan-500/50 to-blue-500/40 border-cyan-500/50';
      case 'backtracked':
        return 'bg-gradient-to-br from-red-500/30 to-rose-500/20 border-red-500/30';
      // BFS-specific states
      case 'bfs-visited':
        return 'bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30 border-violet-500/50';
      case 'bfs-queued':
        return 'bg-gradient-to-br from-cyan-400/60 to-sky-500/50 border-cyan-400/60';
      default:
        return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  // Calculate cell size
  const cellSize = Math.min(
    Math.floor((window.innerWidth - (showCode ? panelWidth : 0) - 100) / gridSize.cols),
    Math.floor((window.innerHeight - 280) / gridSize.rows),
    24
  );

  const opsPerSecond = Math.round(speed * 2.5);

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
        {/* Grid Container */}
        <div className="absolute inset-0 flex items-center justify-center pt-60 pb-32">
          <div
            data-tour="tour-grid"
            className="border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-black/30 backdrop-blur-sm"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize.cols}, ${cellSize}px)`,
              gap: '1px'
            }}
          >
            {displayGrid.map((row, r) =>
              row.map((cell, c) => (
                <motion.div
                  key={`${r}-${c}`}
                  className={`rounded-sm border transition-all duration-150 cursor-pointer ${getCellStyle(cell)}`}
                  style={{ width: cellSize, height: cellSize }}
                  onMouseDown={() => handleCellMouseDown(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  whileHover={steps.length === 0 ? { scale: 1.1 } : {}}
                >
                  {cell.isStart && (
                    <motion.div
                      data-tour="tour-start"
                      className="w-full h-full flex items-center justify-center"
                      initial={{ scale: 1 }}
                      animate={currentStep.status === 'exploring' && currentStep.stats.stepsTaken === 1
                        ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
                        : { scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className="relative"
                        style={{
                          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 4px rgba(34, 197, 94, 0.5))',
                          transform: 'perspective(100px) rotateX(10deg)'
                        }}
                      >
                        <MapPin
                          size={cellSize * 0.7}
                          className="text-white"
                          style={{
                            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))',
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full"
                          style={{ clipPath: 'polygon(30% 0%, 70% 0%, 60% 50%, 40% 50%)' }}
                        />
                      </div>
                    </motion.div>
                  )}
                  {cell.isEnd && (
                    <motion.div
                      data-tour="tour-end"
                      className="w-full h-full flex items-center justify-center"
                      initial={{ scale: 1 }}
                      animate={currentStep.status === 'found'
                        ? { scale: [1, 1.4, 1.2, 1.3, 1], rotate: [0, 15, -15, 10, 0] }
                        : { scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <div
                        className="relative"
                        style={{
                          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 4px rgba(239, 68, 68, 0.5))',
                          transform: 'perspective(100px) rotateX(10deg)'
                        }}
                      >
                        <Flag
                          size={cellSize * 0.7}
                          className="text-white"
                          style={{
                            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))',
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"
                          style={{ clipPath: 'polygon(20% 0%, 80% 20%, 80% 40%, 20% 30%)' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
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
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Row 1: Title + Badge + Compact Stats */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white">Maze Solver</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs font-bold border border-purple-500/30">
                {algorithm.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Footprints size={12} className="text-cyan-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-cyan-400">{currentStep.stats.stepsTaken}</span>
              </div>
              {algorithm === 'dfs' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                  <RotateCw size={12} className="text-red-400 sm:w-3.5 sm:h-3.5" />
                  <span className="text-xs sm:text-sm font-bold text-red-400">{currentStep.stats.backtracks || 0}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <Grid3X3 size={12} className="text-purple-400 sm:w-3.5 sm:h-3.5" />
                  <span className="text-xs sm:text-sm font-bold text-purple-400">{currentStep.stats.maxQueue || 0}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                <Target size={12} className="text-green-400 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm font-bold text-green-400">{currentStep.stats.pathLength}</span>
              </div>
            </div>
          </div>
          {/* Row 2: Legend */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 py-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gradient-to-br from-cyan-400 to-blue-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Exploring</span>
            </div>
            {algorithm === 'dfs' ? (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gradient-to-br from-red-500/50 to-rose-500/30" />
                <span className="text-[10px] sm:text-xs font-semibold text-white/80">Backtracked</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30" />
                <span className="text-[10px] sm:text-xs font-semibold text-white/80">Visited</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gradient-to-br from-green-400 to-emerald-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Solution</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-white" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/80">Wall</span>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP: Header with Commentary (≥ 1280px) */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-lg">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-black text-white">Maze Solver</h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
              {algorithm === 'bfs' ? 'BFS' : 'DFS'}
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
            <StatCard icon={Footprints} value={currentStep.stats.stepsTaken} label="Steps" color="cyan" />
            {algorithm === 'dfs' ? (
              <StatCard icon={RotateCw} value={currentStep.stats.backtracks || 0} label="Backtracks" color="red" />
            ) : (
              <StatCard icon={Grid3X3} value={currentStep.stats.maxQueue || 0} label="Max Queue" color="purple" />
            )}
            <StatCard icon={Target} value={currentStep.stats.pathLength} label="Path" color="green" />
          </div>
        </motion.div>

        {/* DESKTOP: Legend (≥ 1280px) - Centered */}
        <motion.div
          className="hidden xl:flex fixed top-24 z-40 backdrop-blur-xl bg-black/40 border border-white rounded-full px-6 py-2.5 items-center gap-6"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{
            left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
            x: '-50%',
            top: showCode ? 180 : 96
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-cyan-400 to-blue-500" />
            <span className="text-xs font-semibold text-white/80">Exploring</span>
          </div>
          {algorithm === 'dfs' ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-red-500/50 to-rose-500/30" />
              <span className="text-xs font-semibold text-white/80">Backtracked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30" />
              <span className="text-xs font-semibold text-white/80">Visited</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-green-400 to-emerald-500" />
            <span className="text-xs font-semibold text-white/80">Solution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-white" />
            <span className="text-xs font-semibold text-white/80">Wall</span>
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
          {/* Timeline Scrubber (only when steps exist) */}
          {steps.length > 0 && (
            <>
              <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[140px] xl:min-w-[180px] flex-shrink-0">
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, steps.length - 1)}
                  value={currentStepIndex}
                  onChange={handleScrub}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-emerald-500"
                />
                <span className="text-[10px] sm:text-[11px] xl:text-[12px] text-white font-medium">
                  {currentStepIndex + 1}/{steps.length}
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
            </>
          )}

          {/* Playback Controls */}
          {steps.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStepBack}
                  disabled={currentStepIndex <= 0}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <SkipBack size={18} className="text-white" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {playing ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                </button>
                <button
                  onClick={handleStepForward}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <SkipForward size={18} className="text-white" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw size={18} className="text-white" />
                </button>
              </div>
              <div className="w-px h-8 bg-white/10" />
            </>
          )}

          {/* Speed Slider */}
          <div data-tour="tour-speed" className="flex items-center gap-2">
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

          <div className="w-px h-8 bg-white/10" />

          {/* Algorithm Toggle */}
          <div data-tour="tour-algorithm" className="flex items-center bg-white/5 rounded-xl p-1">
            <button
              onClick={() => handleAlgorithmChange('dfs')}
              disabled={steps.length > 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${algorithm === 'dfs'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              DFS
            </button>
            <button
              onClick={() => handleAlgorithmChange('bfs')}
              disabled={steps.length > 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${algorithm === 'bfs'
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              BFS
            </button>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Grid Size Dropdown */}
          <div>
            <button
              ref={sizeButtonRef}
              data-tour="tour-size"
              onClick={() => {
                if (sizeButtonRef.current) {
                  const rect = sizeButtonRef.current.getBoundingClientRect();
                  setSizeDropdownPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
                }
                setShowSizeMenu(!showSizeMenu);
                setShowGenerateMenu(false);
              }}
              disabled={steps.length > 0}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Grid3X3 size={16} className="text-white" />
              <span className="text-sm font-medium text-white hidden sm:inline">{gridSize.rows}×{gridSize.cols}</span>
              <ChevronDown size={14} className="text-white" />
            </button>
          </div>

          {/* Generate Dropdown */}
          <div>
            <button
              ref={generateButtonRef}
              data-tour="tour-generate"
              onClick={() => {
                if (generateButtonRef.current) {
                  const rect = generateButtonRef.current.getBoundingClientRect();
                  setGenerateDropdownPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
                }
                setShowGenerateMenu(!showGenerateMenu);
                setShowSizeMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer"
            >
              <Sparkles size={16} className="text-white" />
              <span className="text-sm font-bold text-white hidden sm:inline">Generate</span>
              <ChevronDown size={14} className="text-white" />
            </button>
          </div>

          {/* Solve Button */}
          <button
            data-tour="tour-solve"
            onClick={handleSolve}
            disabled={steps.length > 0}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Play size={16} className="text-white" />
            <span className="text-sm font-bold text-white hidden sm:inline">Solve</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClearWalls}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title="Clear Walls"
          >
            <Eraser size={18} className="text-white" />
          </button>

          <div className="w-px h-8 bg-white/10" />

          {/* Code Button */}
          <button
            data-tour="tour-code"
            onClick={() => setShowCode(!showCode)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showCode ? 'bg-emerald-500/30 border border-emerald-500/50' : 'bg-white/5 hover:bg-white/10'}`}
            title="View Code"
          >
            <Code2 size={18} className="text-white" />
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
        algorithm={algorithm}
      />

      {/* HELP BUTTON */}
      <button
        data-tour="tour-help"
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-24 sm:bottom-4 right-3 sm:right-4 xl:bottom-6 xl:right-6 z-40 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all cursor-pointer group"
        title="Show Tutorial"
      >
        <HelpCircle size={18} className="text-purple-400 group-hover:text-purple-300 sm:w-5 sm:h-5" />
      </button>

      {/* GUIDED TOUR */}
      <GuidedTour
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
      />

      {/* Size Dropdown - Rendered outside control bar */}
      <AnimatePresence>
        {showSizeMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
            className="fixed backdrop-blur-xl bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[140px] z-[200]"
            style={{ bottom: sizeDropdownPosition.bottom, left: sizeDropdownPosition.left }}
            data-dropdown="size"
          >
            {[
              { rows: 11, cols: 17, label: 'Small (11×17)' },
              { rows: 15, cols: 23, label: 'Medium (15×23)' },
              { rows: 21, cols: 31, label: 'Large (21×31)' },
              { rows: 27, cols: 41, label: 'XL (27×41)' },
              { rows: 31, cols: 51, label: 'XXL (31×51)' },
            ].map(size => (
              <button
                key={size.label}
                onClick={() => handleGridSizeChange(size.rows, size.cols)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left cursor-pointer ${gridSize.rows === size.rows && gridSize.cols === size.cols ? 'bg-emerald-500/20 text-emerald-400' : 'text-white'}`}
              >
                <span className="text-sm font-medium">{size.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Dropdown - Rendered outside control bar */}
      <AnimatePresence>
        {showGenerateMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
            className="fixed backdrop-blur-xl bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[180px] z-[200]"
            style={{ bottom: generateDropdownPosition.bottom, left: generateDropdownPosition.left }}
            data-dropdown="generate"
          >
            {[
              { id: 'recursive', label: 'Recursive Division', icon: Grid3X3 },
              { id: 'dfs', label: 'Randomized DFS', icon: Sparkles },
              { id: 'random', label: 'Random Walls', icon: Sparkles },
              { id: 'empty', label: 'Empty Grid', icon: Eraser },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleGenerate(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <item.icon size={16} className="text-white/60" />
                <span className="text-sm font-medium text-white">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MazeSolver;
