import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Play, Activity, Zap, RotateCcw, Waypoints } from 'lucide-react';
import { useTheme } from '../../../core/context/ThemeContext';
import useModalLogic from './useModalLogic';
import ModalShell from './ModalShell';

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30';
    case 'medium': return 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30';
    case 'hard': return 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30';
    default: return 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30';
  }
};

/**
 * MazeExplorationAnimation — Animated maze where a dot explores paths,
 * hits dead ends (red), backtracks, and finds the golden exit path.
 */
const MazeExplorationAnimation = () => {
  // Define maze paths as SVG path data
  const failPaths = [
    "M 30 140 L 30 100 L 60 100 L 60 70",          // dead end 1
    "M 30 140 L 30 100 L 60 100 L 60 130 L 90 130", // dead end 2
    "M 30 140 L 70 140 L 70 160 L 100 160",          // dead end 3
  ];

  const successPath = "M 30 140 L 30 100 L 60 100 L 90 100 L 120 100 L 120 60 L 160 60 L 160 30";

  // Maze grid lines (background)
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (Math.random() > 0.55) {
          lines.push({ x: 20 + i * 22, y: 20 + j * 22, w: 22, h: 0, id: `h-${i}-${j}` });
        }
        if (Math.random() > 0.55) {
          lines.push({ x: 20 + i * 22, y: 20 + j * 22, w: 0, h: 22, id: `v-${i}-${j}` });
        }
      }
    }
    return lines;
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.18]">
      <svg viewBox="0 0 200 200" className="w-full h-full max-w-[400px] max-h-[400px]">
        <defs>
          <filter id="mazeGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background maze lines */}
        {gridLines.map(line => (
          <line
            key={line.id}
            x1={line.x} y1={line.y}
            x2={line.x + line.w} y2={line.y + line.h}
            stroke="rgba(129, 140, 248, 0.15)"
            strokeWidth="0.5"
          />
        ))}

        {/* Failed paths (ghost trails) — appear then fade */}
        {failPaths.map((d, i) => (
          <React.Fragment key={`fail-${i}`}>
            <motion.path
              d={d}
              stroke="rgba(248, 113, 113, 0.6)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 0.8, 0] }}
              transition={{
                duration: 2.5,
                delay: i * 1.5,
                repeat: Infinity,
                repeatDelay: 8,
              }}
            />
            {/* Dead end X marker */}
            <motion.g
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, delay: i * 1.5 + 1.5, repeat: Infinity, repeatDelay: 9 }}
            >
              <motion.line
                x1={parseInt(d.split(' ').pop()) - 4}
                y1={parseInt(d.split(' ')[d.split(' ').length - 1]) - 4}
                x2={parseInt(d.split(' ').pop()) + 4}
                y2={parseInt(d.split(' ')[d.split(' ').length - 1]) + 4}
                stroke="rgba(248, 113, 113, 0.8)"
                strokeWidth="1.5"
              />
            </motion.g>
          </React.Fragment>
        ))}

        {/* Golden solution path */}
        <motion.path
          d={successPath}
          stroke="rgba(250, 204, 21, 0.9)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          filter="url(#mazeGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1], opacity: [0, 1] }}
          transition={{
            duration: 3,
            delay: 5,
            repeat: Infinity,
            repeatDelay: 7,
          }}
        />

        {/* Explorer dot */}
        <motion.circle
          r="4"
          fill="#818cf8"
          filter="url(#mazeGlow)"
          animate={{
            cx: [30, 30, 60, 60, 30, 30, 60, 60, 60, 30, 70, 70, 100, 30, 30, 60, 90, 120, 120, 160, 160],
            cy: [140, 100, 100, 70, 100, 100, 100, 130, 130, 100, 140, 160, 160, 140, 100, 100, 100, 100, 60, 60, 30],
            opacity: [1, 1, 1, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Start marker */}
        <circle cx="30" cy="140" r="3" fill="none" stroke="rgba(129,140,248,0.5)" strokeWidth="1" />
        <circle cx="30" cy="140" r="1.5" fill="rgba(129,140,248,0.8)" />

        {/* End/exit marker */}
        <motion.circle
          cx="160" cy="30" r="4"
          fill="rgba(250, 204, 21, 0.3)"
          stroke="rgba(250, 204, 21, 0.7)"
          strokeWidth="1"
          animate={{ r: [4, 6, 4], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};

/**
 * RecursionDepthCounter — Animated counter showing stack depth.
 */
const RecursionDepthCounter = () => (
  <motion.div
    className="absolute top-16 right-12 text-right pointer-events-none"
  >
    <motion.div
      className="text-[10px] font-mono text-indigo-400/20 tracking-[0.3em]"
      animate={{ opacity: [0.15, 0.35, 0.15] }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      RECURSION_DEPTH
    </motion.div>
    <motion.div
      className="text-2xl font-mono font-black text-indigo-400/20"
      animate={{
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{ duration: 8, repeat: Infinity }}
    >
      <motion.span
        animate={{
          text: ['0x01', '0x02', '0x03', '0x04', '0x05', '0x04', '0x03', '0x02', '0x06', '0x07'],
        }}
        transition={{ duration: 12, repeat: Infinity }}
      >
        0x07
      </motion.span>
    </motion.div>
  </motion.div>
);

/**
 * BacktrackingModal — "Maze / Decision Tree with Dead Ends" theme.
 * Palette: Indigo → Violet.
 * Hero: Animated maze exploration with dead ends, backtracking, golden exit path.
 * Grid: Decision-tree pattern with pruned/unpruned indicators.
 */
const BacktrackingModal = ({ isOpen, onClose, modalTopic }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    selectedAlgorithm,
    showComingSoon,
    setShowComingSoon,
    handleCardClick,
    handleStartLearning,
    isSelected,
  } = useModalLogic(isOpen, modalTopic);

  if (!isOpen || !modalTopic) return null;

  const TopicIcon = modalTopic.IconComponent || modalTopic.icon;

  const comingSoonConfig = {
    heroBg: 'from-indigo-500/10 via-transparent to-violet-600/5',
    iconGlow: 'from-indigo-500/20 to-violet-600/20 ring-1 ring-indigo-400/40 shadow-[0_0_40px_rgba(99,102,241,0.3)]',
    iconColor: 'text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.8)]',
    buttonGradient: 'from-indigo-400 via-violet-500 to-indigo-400',
    activeGlow: 'bg-indigo-500/20',
    comingSoonBg: 'bg-[#0b0c1c]/90 ring-indigo-500/30',
  };

  const getBentoClass = (index) => {
    // Decision-tree-like layout
    const layouts = [
      "col-span-1 lg:col-span-2 row-span-2",  // root decision
      "col-span-1 row-span-1",                  // branch
      "col-span-1 row-span-2",                  // deep path
      "col-span-1 lg:col-span-2 row-span-1",   // wide branch
      "col-span-1 row-span-1",                  // leaf
    ];
    return layouts[index % layouts.length];
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      ambientOrbs={['bg-indigo-600/10', 'bg-violet-800/10']}
      comingSoonConfig={comingSoonConfig}
      showComingSoon={showComingSoon}
      onCloseComingSoon={() => setShowComingSoon(false)}
    >
      {/* ── HERO PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotateY: 8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex-none lg:w-[45%] relative rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-8 lg:p-12 ring-1 ring-white/10 bg-[#0b0c1c]/80 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-600/5 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Maze exploration animation */}
        <MazeExplorationAnimation />
        <RecursionDepthCounter />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(129,140,248,0.6) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        {/* Telemetry */}
        <div className="absolute top-6 left-8 flex flex-col gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-indigo-400 tracking-[0.25em]">STATE_SPACE_EXPLORING</span>
          <div className="w-12 h-[1px] bg-indigo-400" />
        </div>
        <div className="absolute bottom-6 right-8 flex flex-col items-end gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-indigo-400 tracking-[0.25em]">PRUNING_BRANCHES...</span>
          <span className="text-[10px] font-mono text-indigo-400 tracking-[0.25em]">STACK_DEPTH: 0x07</span>
        </div>

        {/* Close button */}
        <div className="absolute top-0 right-0 p-8 z-50">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] ring-1 ring-white/10 text-white transition-all backdrop-blur-xl"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="relative z-10 pt-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.3 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 ring-1 ring-indigo-400/40 shadow-[0_0_40px_rgba(99,102,241,0.3)] flex items-center justify-center mb-10 backdrop-blur-xl"
          >
            {TopicIcon && <TopicIcon className="w-12 h-12 text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.8)]" />}
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter mb-4 leading-[1.1]">
            {modalTopic.title}
          </h2>

          <div className="flex items-center gap-2 mb-6">
            <Waypoints className="w-4 h-4 text-indigo-400 opacity-60" />
            <p className="text-lg lg:text-xl font-medium text-slate-400 max-w-md leading-relaxed">
              {modalTopic.description}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-[0.2em]">
            <Activity className="w-4 h-4 animate-pulse text-indigo-300" />
            <span>Decision Tree • {modalTopic.algorithms.length} Branches</span>
          </div>

          <motion.button
            whileHover={selectedAlgorithm ? { scale: 1.02, y: -2 } : { scale: 1 }}
            whileTap={selectedAlgorithm ? { scale: 0.98 } : { scale: 1 }}
            onClick={() => handleStartLearning(onClose)}
            disabled={!selectedAlgorithm}
            className={`relative w-full overflow-hidden rounded-[1.5rem] font-bold text-lg lg:text-xl p-[2px] transition-all duration-500 ${
              selectedAlgorithm
                ? 'shadow-[0_15px_50px_-10px_rgba(99,102,241,0.5)] cursor-pointer'
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {selectedAlgorithm && (
              <span className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-indigo-400 via-violet-500 to-indigo-400 animate-gradient-xy" />
            )}
            <div className={`relative h-full w-full rounded-[1.4rem] py-6 flex items-center justify-center gap-3 transition-colors duration-300 ${
              selectedAlgorithm
                ? 'bg-[#0f172a] hover:bg-transparent text-white'
                : 'bg-white/[0.02] ring-1 ring-white/10 text-slate-500'
            }`}>
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-wide">
                {selectedAlgorithm ? (
                  <>
                    <RotateCcw className="w-5 h-5 text-indigo-300" />
                    EXPLORE PATH
                    <Zap className="w-5 h-5 ml-2 animate-pulse text-indigo-300" />
                  </>
                ) : (
                  'SELECT BRANCH'
                )}
              </span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* ── ALGORITHM GRID ── */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 auto-rows-[160px] overflow-y-auto no-scrollbar pt-6 pb-12 px-2 pr-4">
        {modalTopic.algorithms.map((algorithm, index) => {
          const selected = isSelected(algorithm);
          const bentoClass = getBentoClass(index);

          return (
            <motion.div
              key={algorithm.id || algorithm.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(algorithm, onClose)}
              className={`relative cursor-pointer rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 ${bentoClass} ${
                selected
                  ? 'bg-indigo-950/40 ring-1 ring-indigo-400 shadow-[0_20px_50px_rgba(99,102,241,0.2)] z-20'
                  : 'bg-[#0f172a]/50 ring-1 ring-white/10 hover:ring-indigo-400/30 hover:bg-[#1e293b]/60 hover:shadow-2xl z-10'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

              {selected && (
                <>
                  <motion.div layoutId="btSelectionGlow" className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
                  {/* Golden solution path indicator */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </>
              )}

              {/* Pruned branch ghost overlay for unselected */}
              {!selected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-[0.04] transition-opacity duration-300">
                  <X className="w-20 h-20 text-white" strokeWidth={0.5} />
                </div>
              )}

              {/* Recursion level */}
              <div className="absolute top-3 right-4 text-[9px] font-mono text-indigo-500/30 tracking-widest">
                lvl:{index}
              </div>

              <div className="relative z-10 flex justify-between items-start">
                <h3 className={`text-xl xl:text-2xl font-black tracking-tight leading-tight ${selected ? 'text-white' : 'text-slate-300'}`}>
                  {algorithm.name}
                </h3>
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -90 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0, rotate: 90 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ml-4 bg-indigo-400 text-[#020617] shadow-[0_0_20px_rgba(165,180,252,0.6)]"
                    >
                      <Play className="w-4 h-4 fill-current ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-3 mt-8">
                <span className={`px-4 py-2 rounded-xl text-[11px] xl:text-xs font-bold uppercase tracking-[0.15em] backdrop-blur-md ${getDifficultyColor(algorithm.difficulty)}`}>
                  {algorithm.difficulty}
                </span>
                <div className="flex items-center gap-2 text-[11px] xl:text-xs font-mono font-medium text-slate-300 px-4 py-2 rounded-xl bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {algorithm.time}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ModalShell>
  );
};

export default BacktrackingModal;
