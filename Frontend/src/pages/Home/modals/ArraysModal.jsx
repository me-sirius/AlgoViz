import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Play, Activity, Zap, ArrowRightLeft, Binary } from 'lucide-react';
import { useTheme } from '../../../core/context/ThemeContext';
import useModalLogic from './useModalLogic';
import ModalShell from './ModalShell';

/**
 * getDifficultyColor — Consistent difficulty badge styling.
 */
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30';
    case 'medium': return 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30';
    case 'hard': return 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30';
    default: return 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30';
  }
};

/**
 * SortingBarsAnimation — Animated hero visual: bars continuously swapping like a sort.
 */
const SortingBarsAnimation = () => {
  const bars = [35, 65, 25, 80, 50, 70, 40, 90, 30, 60];

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-16 pb-12 pt-24 pointer-events-none opacity-[0.15]">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: [`${height}%`, `${bars[(i + 3) % bars.length]}%`, `${height}%`],
            opacity: 1,
          }}
          transition={{
            height: { duration: 3, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5, delay: i * 0.05 },
          }}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500/80 to-cyan-300/40 relative"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          {/* Comparison flash — only first 3 bars to reduce repaints */}
          {i < 3 && <motion.div
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-400/20"
          />}
        </motion.div>
      ))}

      {/* Horizontal scan line */}
      <motion.div
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.6)]"
      />
    </div>
  );
};

/**
 * DataStreamBorder — Animated border effect for selected cards.
 */
const DataStreamBorder = () => (
  <motion.div
    className="absolute inset-0 rounded-[2rem] pointer-events-none"
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)',
      backgroundSize: '200% 100%',
    }}
    animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  />
);

/**
 * ArraysModal — "Memory Buffer / Data Pipeline" theme.
 * Palette: Cyan → Blue.
 * Hero: Sorting bars animation with memory hex labels.
 * Grid: Algorithm cards arranged in a bento grid with data-stream effects.
 */
const ArraysModal = ({ isOpen, onClose, modalTopic }) => {
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
    heroBg: 'from-cyan-500/10 via-transparent to-blue-600/5',
    iconGlow: 'from-cyan-500/20 to-blue-600/20 ring-1 ring-cyan-400/40 shadow-[0_0_40px_rgba(6,182,212,0.3)]',
    iconColor: 'text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
    buttonGradient: 'from-cyan-400 via-blue-500 to-cyan-400',
    activeGlow: 'bg-cyan-500/20',
    comingSoonBg: 'bg-[#080d1e]/90 ring-cyan-500/30',
  };

  const getBentoClass = (index) => {
    const layouts = [
      "col-span-1 lg:col-span-2 row-span-2",
      "col-span-1 row-span-1",
      "col-span-1 row-span-1",
      "col-span-1 lg:col-span-2 row-span-1",
      "col-span-1 row-span-2",
      "col-span-1 row-span-1",
    ];
    return layouts[index % layouts.length];
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      ambientOrbs={['bg-cyan-600/10', 'bg-blue-800/10']}
      comingSoonConfig={comingSoonConfig}
      showComingSoon={showComingSoon}
      onCloseComingSoon={() => setShowComingSoon(false)}
    >
      {/* ── HERO PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotateY: 8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex-none lg:w-[45%] relative rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-8 lg:p-12 ring-1 ring-white/10 bg-[#080d1e]/80 shadow-2xl"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/5 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Animated sorting bars background */}
        <SortingBarsAnimation />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(34,211,238,0.8) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        {/* Memory address markers */}
        <div className="absolute top-6 left-8 flex items-center gap-3 z-20 opacity-30">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono text-cyan-400 tracking-[0.25em]">0x00FF:BUFFER_INIT</span>
        </div>
        <div className="absolute bottom-6 right-8 flex items-center gap-3 z-20 opacity-30">
          <span className="text-[10px] font-mono text-cyan-400 tracking-[0.25em]">MEM_ALLOCATED</span>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
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
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-1 ring-cyan-400/40 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex items-center justify-center mb-10 backdrop-blur-xl"
          >
            {TopicIcon && <TopicIcon className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />}
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter mb-4 leading-[1.1]">
            {modalTopic.title}
          </h2>

          {/* Typing effect subtitle */}
          <div className="flex items-center gap-2 mb-6">
            <Binary className="w-4 h-4 text-cyan-400 opacity-60" />
            <p className="text-lg lg:text-xl font-medium text-slate-400 max-w-md leading-relaxed font-mono">
              <span className="text-cyan-400/60">&gt; </span>{modalTopic.description}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="relative z-10 mt-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-[0.2em]">
            <Activity className="w-4 h-4 animate-pulse text-cyan-300" />
            <span>Pipeline Active • {modalTopic.algorithms.length} Modules Loaded</span>
          </div>

          <motion.button
            whileHover={selectedAlgorithm ? { scale: 1.02, y: -2 } : { scale: 1 }}
            whileTap={selectedAlgorithm ? { scale: 0.98 } : { scale: 1 }}
            onClick={() => handleStartLearning(onClose)}
            disabled={!selectedAlgorithm}
            className={`relative w-full overflow-hidden rounded-[1.5rem] font-bold text-lg lg:text-xl p-[2px] transition-all duration-500 ${
              selectedAlgorithm
                ? 'shadow-[0_15px_50px_-10px_rgba(6,182,212,0.5)] cursor-pointer'
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {selectedAlgorithm && (
              <span className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-gradient-xy" />
            )}
            <div className={`relative h-full w-full rounded-[1.4rem] py-6 flex items-center justify-center gap-3 transition-colors duration-300 ${
              selectedAlgorithm
                ? 'bg-[#0f172a] hover:bg-transparent text-white'
                : 'bg-white/[0.02] ring-1 ring-white/10 text-slate-500'
            }`}>
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-wide font-mono">
                {selectedAlgorithm ? (
                  <>
                    <ArrowRightLeft className="w-5 h-5 text-cyan-300" />
                    EXECUTE SORT
                    <Zap className="w-5 h-5 ml-2 animate-pulse text-cyan-300" />
                  </>
                ) : (
                  'SELECT MODULE'
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
                  ? 'bg-cyan-950/40 ring-1 ring-cyan-400 shadow-[0_20px_50px_rgba(6,182,212,0.2)] z-20'
                  : 'bg-[#0f172a]/50 ring-1 ring-white/10 hover:ring-cyan-400/30 hover:bg-[#1e293b]/60 hover:shadow-2xl z-10'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Shimmer overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

              {/* Data stream border for selected */}
              {selected && <DataStreamBorder />}

              {/* Selection glow */}
              {selected && (
                <motion.div layoutId="arraySelectionGlow" className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none" />
              )}

              {/* Memory address label */}
              <div className="absolute top-3 right-4 text-[9px] font-mono text-cyan-500/30 tracking-widest">
                0x{(index * 16 + 255).toString(16).toUpperCase().padStart(4, '0')}
              </div>

              {/* Card content */}
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
                      className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ml-4 bg-cyan-400 text-[#020617] shadow-[0_0_20px_rgba(34,211,238,0.6)]"
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

export default ArraysModal;
