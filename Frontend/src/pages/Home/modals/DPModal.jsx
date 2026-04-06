import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Play, Activity, Zap, Layers, Grid3X3 } from 'lucide-react';
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
 * MemoizationGrid — Animated 2D grid that fills cell-by-cell in a wave pattern.
 */
const MemoizationGrid = () => {
  const rows = 4;
  const cols = 6;

  // Pre-generate stable random values
  const cellValues = useMemo(() =>
    Array.from({ length: rows * cols }, () => Math.floor(Math.random() * 99)),
  []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.12]">
      <div className="grid gap-[2px] p-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows * cols }, (_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const delay = (row + col) * 0.12;

          return (
            <motion.div
              key={i}
              className="w-7 h-7 lg:w-9 lg:h-9 rounded-[4px] border border-rose-500/20 flex items-center justify-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 0.3],
                scale: [0.5, 1, 1],
                backgroundColor: ['transparent', 'rgba(244, 63, 94, 0.3)', 'rgba(244, 63, 94, 0.05)'],
              }}
              transition={{
                duration: 2.5,
                delay,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <motion.span
                className="text-[8px] font-mono text-rose-300 font-bold"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 2 }}
              >
                {cellValues[i]}
              </motion.span>

              {/* Optimal path highlight — diagonal trace */}
              {row === col && row < Math.min(rows, cols) && (
                <motion.div
                  className="absolute inset-0 bg-rose-400/30 rounded-[4px]"
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 1.5, delay: row * 0.3 + 3, repeat: Infinity, repeatDelay: 5 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Diagonal scanning beam */}
      <motion.div
        animate={{ x: [-200, 400], y: [-200, 400] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute w-[300px] h-[1px] bg-gradient-to-r from-transparent via-rose-400 to-transparent rotate-45 opacity-40 blur-[1px]"
      />
    </div>
  );
};

/**
 * StateTransitionParticles — Floating particles representing state transitions.
 */
const StateTransitionParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      startX: 10 + (i % 4) * 25,
      startY: 15 + Math.floor(i / 4) * 60,
      endX: 10 + ((i + 2) % 4) * 25,
      endY: 15 + Math.floor((i + 2) / 4) * 60,
      duration: 3 + Math.random() * 2,
      delay: i * 0.5,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
          style={{ left: `${p.startX}%`, top: `${p.startY}%` }}
          animate={{
            left: [`${p.startX}%`, `${p.endX}%`, `${p.startX}%`],
            top: [`${p.startY}%`, `${p.endY}%`, `${p.startY}%`],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/**
 * DPModal — "Computation Matrix / State Table" theme.
 * Palette: Rose → Pink.
 * Hero: 2D memoization grid filling in waves, diagonal optimal path trace.
 * Grid: Matrix-style card layout.
 */
const DPModal = ({ isOpen, onClose, modalTopic }) => {
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
    heroBg: 'from-rose-500/10 via-transparent to-pink-600/5',
    iconGlow: 'from-rose-500/20 to-pink-600/20 ring-1 ring-rose-400/40 shadow-[0_0_40px_rgba(244,63,94,0.3)]',
    iconColor: 'text-rose-300 drop-shadow-[0_0_15px_rgba(251,113,133,0.8)]',
    buttonGradient: 'from-rose-400 via-pink-500 to-rose-400',
    activeGlow: 'bg-rose-500/20',
    comingSoonBg: 'bg-[#1a0810]/90 ring-rose-500/30',
  };

  const getBentoClass = (index) => {
    // Matrix-style tight layout
    const layouts = [
      "col-span-1 lg:col-span-2 row-span-2",
      "col-span-1 row-span-1",
      "col-span-1 row-span-1",
      "col-span-1 row-span-2",
      "col-span-1 lg:col-span-2 row-span-1",
      "col-span-1 row-span-1",
    ];
    return layouts[index % layouts.length];
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      ambientOrbs={['bg-rose-600/10', 'bg-pink-800/10']}
      comingSoonConfig={comingSoonConfig}
      showComingSoon={showComingSoon}
      onCloseComingSoon={() => setShowComingSoon(false)}
    >
      {/* ── HERO PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotateY: 8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex-none lg:w-[45%] relative rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-8 lg:p-12 ring-1 ring-white/10 bg-[#1a0810]/80 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-pink-600/5 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-pink-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Memoization grid animation */}
        <MemoizationGrid />
        <StateTransitionParticles />

        {/* Grid lines in background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(244,63,94,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244,63,94,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }} />

        {/* Telemetry labels */}
        <div className="absolute top-6 right-8 flex flex-col items-end gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-rose-400 tracking-[0.25em]">MEMO_REGION_LOCKED</span>
          <div className="w-16 h-[1px] bg-rose-400" />
        </div>
        <div className="absolute bottom-6 left-8 flex flex-col gap-1 z-20 opacity-30">
          <div className="w-16 h-[1px] bg-rose-400" />
          <span className="text-[10px] font-mono text-rose-400 tracking-[0.25em]">STATE_TRANSITION_OK</span>
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
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 ring-1 ring-rose-400/40 shadow-[0_0_40px_rgba(244,63,94,0.3)] flex items-center justify-center mb-10 backdrop-blur-xl"
          >
            {TopicIcon && <TopicIcon className="w-12 h-12 text-rose-300 drop-shadow-[0_0_15px_rgba(251,113,133,0.8)]" />}
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter mb-4 leading-[1.1]">
            {modalTopic.title}
          </h2>

          <div className="flex items-center gap-2 mb-6">
            <Grid3X3 className="w-4 h-4 text-rose-400 opacity-60" />
            <p className="text-lg lg:text-xl font-medium text-slate-400 max-w-md leading-relaxed">
              {modalTopic.description}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-[0.2em]">
            <Activity className="w-4 h-4 animate-pulse text-rose-300" />
            <span>State Table • {modalTopic.algorithms.length} Subproblems</span>
          </div>

          <motion.button
            whileHover={selectedAlgorithm ? { scale: 1.02, y: -2 } : { scale: 1 }}
            whileTap={selectedAlgorithm ? { scale: 0.98 } : { scale: 1 }}
            onClick={() => handleStartLearning(onClose)}
            disabled={!selectedAlgorithm}
            className={`relative w-full overflow-hidden rounded-[1.5rem] font-bold text-lg lg:text-xl p-[2px] transition-all duration-500 ${
              selectedAlgorithm
                ? 'shadow-[0_15px_50px_-10px_rgba(244,63,94,0.5)] cursor-pointer'
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {selectedAlgorithm && (
              <span className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 animate-gradient-xy" />
            )}
            <div className={`relative h-full w-full rounded-[1.4rem] py-6 flex items-center justify-center gap-3 transition-colors duration-300 ${
              selectedAlgorithm
                ? 'bg-[#0f172a] hover:bg-transparent text-white'
                : 'bg-white/[0.02] ring-1 ring-white/10 text-slate-500'
            }`}>
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-wide">
                {selectedAlgorithm ? (
                  <>
                    COMPUTE SOLUTION
                    <Zap className="w-5 h-5 ml-2 animate-pulse text-rose-300" />
                  </>
                ) : (
                  'SELECT SUBPROBLEM'
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
                  ? 'bg-rose-950/40 ring-1 ring-rose-400 shadow-[0_20px_50px_rgba(244,63,94,0.2)] z-20'
                  : 'bg-[#0f172a]/50 ring-1 ring-white/10 hover:ring-rose-400/30 hover:bg-[#1e293b]/60 hover:shadow-2xl z-10'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

              {/* Cascade fill animation on selection */}
              {selected && (
                <>
                  <motion.div layoutId="dpSelectionGlow" className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/20 blur-[60px] rounded-full pointer-events-none" />
                  <motion.div
                    className="absolute inset-0 rounded-[2rem] pointer-events-none"
                    initial={{ background: 'transparent' }}
                    animate={{
                      background: [
                        'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, transparent 50%)',
                        'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(244,63,94,0.05) 100%)',
                        'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, transparent 50%)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </>
              )}

              {/* Cell index label */}
              <div className="absolute top-3 right-4 text-[9px] font-mono text-rose-500/30 tracking-widest">
                dp[{index}]
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
                      className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ml-4 bg-rose-400 text-[#020617] shadow-[0_0_20px_rgba(251,113,133,0.6)]"
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

export default DPModal;
