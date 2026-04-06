import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Play, Activity, Zap, TrendingUp, Award } from 'lucide-react';
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
 * OptimizationBarsAnimation — Animated bar chart where a greedy pointer
 * snaps between bars, with pulse effects on the "chosen" ones.
 */
const OptimizationBarsAnimation = () => {
  const bars = [
    { h: 30, chosen: false },
    { h: 55, chosen: false },
    { h: 88, chosen: true },
    { h: 38, chosen: false },
    { h: 72, chosen: true },
    { h: 65, chosen: true },
    { h: 48, chosen: false },
    { h: 80, chosen: true },
  ];

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-12 pb-16 pt-28 pointer-events-none opacity-[0.12]">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="flex-1 relative rounded-t-sm"
          initial={{ height: 0 }}
          animate={{ height: `${bar.h}%` }}
          transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
          style={{
            background: bar.chosen
              ? 'linear-gradient(to top, rgba(217,70,239,0.6), rgba(192,38,211,0.3))'
              : 'linear-gradient(to top, rgba(217,70,239,0.15), rgba(192,38,211,0.05))',
          }}
        >
          {/* Top glint */}
          <div className={`absolute inset-x-0 top-0 h-[2px] ${
            bar.chosen
              ? 'bg-fuchsia-300 shadow-[0_0_10px_rgba(240,171,252,0.8)]'
              : 'bg-fuchsia-500/30'
          }`} />

          {/* "Chosen" marker */}
          {bar.chosen && (
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-fuchsia-400"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  '0 0 4px rgba(240,171,252,0.4)',
                  '0 0 12px rgba(240,171,252,0.8)',
                  '0 0 4px rgba(240,171,252,0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          )}
        </motion.div>
      ))}

      {/* Greedy selection pointer — bouncing arrow */}
      <motion.div
        className="absolute bottom-8 w-6 h-6"
        animate={{
          left: ['12%', '35%', '52%', '68%', '85%', '68%', '52%', '35%', '12%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-fuchsia-400 mx-auto" />
        <div className="w-[1px] h-3 bg-fuchsia-400/50 mx-auto" />
      </motion.div>

      {/* Progress percentage counter */}
      <motion.div
        className="absolute top-16 right-12 text-right"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <motion.span
          className="text-2xl font-mono font-black text-fuchsia-400/30"
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          94.7%
        </motion.span>
        <div className="text-[8px] font-mono text-fuchsia-400/20 tracking-[0.25em]">OPTIMALITY</div>
      </motion.div>
    </div>
  );
};

/**
 * GreedyModal — "Resource Optimization / Peak Detection" theme.
 * Palette: Fuchsia → Purple.
 * Hero: Animated bar chart with greedy selection pointer and pulse peaks.
 * Grid: Cards with weight/value indicators.
 */
const GreedyModal = ({ isOpen, onClose, modalTopic }) => {
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
    heroBg: 'from-fuchsia-500/10 via-transparent to-purple-600/5',
    iconGlow: 'from-fuchsia-500/20 to-purple-600/20 ring-1 ring-fuchsia-400/40 shadow-[0_0_40px_rgba(217,70,239,0.3)]',
    iconColor: 'text-fuchsia-300 drop-shadow-[0_0_15px_rgba(240,171,252,0.8)]',
    buttonGradient: 'from-fuchsia-400 via-purple-500 to-fuchsia-400',
    activeGlow: 'bg-fuchsia-500/20',
    comingSoonBg: 'bg-[#180a1c]/90 ring-fuchsia-500/30',
  };

  const getBentoClass = (index) => {
    const layouts = [
      "col-span-1 lg:col-span-2 row-span-1",
      "col-span-1 row-span-2",
      "col-span-1 row-span-1",
      "col-span-1 lg:col-span-2 row-span-2",
      "col-span-1 row-span-1",
    ];
    return layouts[index % layouts.length];
  };

  // Simulate weight/value for greedy feel
  const getWeightValue = (index) => {
    const weights = ['3.2', '7.1', '4.8', '9.5', '6.3'];
    return weights[index % weights.length];
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      ambientOrbs={['bg-fuchsia-600/10', 'bg-purple-800/10']}
      comingSoonConfig={comingSoonConfig}
      showComingSoon={showComingSoon}
      onCloseComingSoon={() => setShowComingSoon(false)}
    >
      {/* ── HERO PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotateY: 8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex-none lg:w-[45%] relative rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-8 lg:p-12 ring-1 ring-white/10 bg-[#180a1c]/80 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-purple-600/5 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Optimization bars animation */}
        <OptimizationBarsAnimation />

        {/* Diagonal grid */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(217,70,239,0.5) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(217,70,239,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} />

        {/* Telemetry */}
        <div className="absolute top-6 left-8 flex flex-col gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-fuchsia-400 tracking-[0.25em]">LOCAL_PEAK_DETECTION</span>
          <div className="w-16 h-[1px] bg-fuchsia-400" />
        </div>
        <div className="absolute bottom-6 right-8 flex flex-col items-end gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-fuchsia-400 tracking-[0.25em]">RESOURCE_POOL: 100%</span>
          <span className="text-[10px] font-mono text-fuchsia-400 tracking-[0.25em]">GREEDY_CHOICE_OK</span>
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
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 ring-1 ring-fuchsia-400/40 shadow-[0_0_40px_rgba(217,70,239,0.3)] flex items-center justify-center mb-10 backdrop-blur-xl"
          >
            {TopicIcon && <TopicIcon className="w-12 h-12 text-fuchsia-300 drop-shadow-[0_0_15px_rgba(240,171,252,0.8)]" />}
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter mb-4 leading-[1.1]">
            {modalTopic.title}
          </h2>

          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-fuchsia-400 opacity-60" />
            <p className="text-lg lg:text-xl font-medium text-slate-400 max-w-md leading-relaxed">
              {modalTopic.description}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-[0.2em]">
            <Activity className="w-4 h-4 animate-pulse text-fuchsia-300" />
            <span>Optimizer • {modalTopic.algorithms.length} Strategies</span>
          </div>

          <motion.button
            whileHover={selectedAlgorithm ? { scale: 1.02, y: -2 } : { scale: 1 }}
            whileTap={selectedAlgorithm ? { scale: 0.98 } : { scale: 1 }}
            onClick={() => handleStartLearning(onClose)}
            disabled={!selectedAlgorithm}
            className={`relative w-full overflow-hidden rounded-[1.5rem] font-bold text-lg lg:text-xl p-[2px] transition-all duration-500 ${
              selectedAlgorithm
                ? 'shadow-[0_15px_50px_-10px_rgba(217,70,239,0.5)] cursor-pointer'
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {selectedAlgorithm && (
              <span className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-fuchsia-400 via-purple-500 to-fuchsia-400 animate-gradient-xy" />
            )}
            <div className={`relative h-full w-full rounded-[1.4rem] py-6 flex items-center justify-center gap-3 transition-colors duration-300 ${
              selectedAlgorithm
                ? 'bg-[#0f172a] hover:bg-transparent text-white'
                : 'bg-white/[0.02] ring-1 ring-white/10 text-slate-500'
            }`}>
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-wide">
                {selectedAlgorithm ? (
                  <>
                    MAXIMIZE OUTPUT
                    <Zap className="w-5 h-5 ml-2 animate-pulse text-fuchsia-300" />
                  </>
                ) : (
                  'SELECT STRATEGY'
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
                  ? 'bg-fuchsia-950/40 ring-1 ring-fuchsia-400 shadow-[0_20px_50px_rgba(217,70,239,0.2)] z-20'
                  : 'bg-[#0f172a]/50 ring-1 ring-white/10 hover:ring-fuchsia-400/30 hover:bg-[#1e293b]/60 hover:shadow-2xl z-10'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

              {selected && (
                <>
                  <motion.div layoutId="greedySelectionGlow" className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-500/20 blur-[60px] rounded-full pointer-events-none" />
                  {/* Optimal pick stamp */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: -12 }}
                    className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-lg bg-fuchsia-500/20 ring-1 ring-fuchsia-400/50 z-30"
                  >
                    <Award className="w-3 h-3 text-fuchsia-300" />
                    <span className="text-[9px] font-mono text-fuchsia-300 font-bold tracking-wider">OPTIMAL</span>
                  </motion.div>
                </>
              )}

              {/* Weight indicator */}
              <div className="absolute top-3 right-4 text-[9px] font-mono text-fuchsia-500/30 tracking-widest">
                {!selected && `w:${getWeightValue(index)}`}
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
                      className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ml-4 bg-fuchsia-400 text-[#020617] shadow-[0_0_20px_rgba(240,171,252,0.6)]"
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

export default GreedyModal;
