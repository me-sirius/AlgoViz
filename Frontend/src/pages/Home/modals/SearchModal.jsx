import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Play, Activity, Zap, Crosshair, Target } from 'lucide-react';
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
 * RadarSweepAnimation — Rotating radar with sonar rings and blip dots.
 */
const RadarSweepAnimation = () => {
  const blips = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      angle: (i * 90 + 20) * (Math.PI / 180),
      dist: 25 + Math.random() * 55,
      delay: 0.5 + Math.random() * 2,
    })), []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
      <div className="relative w-72 h-72">
        {/* Concentric rings */}
        {[1, 2, 3, 4].map(ring => (
          <div
            key={ring}
            className="absolute rounded-full border border-amber-500/20"
            style={{
              width: `${ring * 25}%`,
              height: `${ring * 25}%`,
              left: `${50 - ring * 12.5}%`,
              top: `${50 - ring * 12.5}%`,
            }}
          />
        ))}

        {/* Crosshair lines */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-500/10" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-500/10" />

        {/* Rotating sweep line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{ transformOrigin: 'center center' }}
        >
          <div
            className="absolute left-1/2 top-1/2 origin-left h-[1px]"
            style={{
              width: '50%',
              background: 'linear-gradient(90deg, rgba(245,158,11,0.8), transparent)',
              boxShadow: '0 0 12px rgba(245,158,11,0.5)',
            }}
          />
          {/* Sweep trail / cone */}
          <div
            className="absolute left-1/2 top-1/2 origin-left"
            style={{
              width: '50%',
              height: '40px',
              marginTop: '-20px',
              background: 'linear-gradient(90deg, rgba(245,158,11,0.15), transparent)',
              clipPath: 'polygon(0 50%, 100% 0%, 100% 100%)',
            }}
          />
        </motion.div>

        {/* Sonar pulses */}
        {[0, 1].map(i => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute rounded-full border border-amber-400/30"
            style={{
              width: '100%', height: '100%',
              left: 0, top: 0,
            }}
            initial={{ scale: 0.1, opacity: 0.6 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{
              duration: 3,
              delay: i * 1,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Target blips */}
        {blips.map(blip => {
          const x = 50 + Math.cos(blip.angle) * blip.dist;
          const y = 50 + Math.sin(blip.angle) * blip.dist;
          return (
            <motion.div
              key={blip.id}
              className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]"
              style={{ left: `${x}%`, top: `${y}%`, marginLeft: -4, marginTop: -4 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.5],
              }}
              transition={{
                duration: 4,
                delay: blip.delay,
                repeat: Infinity,
              }}
            />
          );
        })}

        {/* Center dot */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
          style={{ left: 'calc(50% - 6px)', top: 'calc(50% - 6px)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

/**
 * SearchModal — "Radar / Target Acquisition" theme.
 * Palette: Amber → Orange.
 * Hero: Radar sweep with sonar blips and concentric rings.
 * Grid: Linear cards representing a narrowing search space.
 */
const SearchModal = ({ isOpen, onClose, modalTopic }) => {
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
    heroBg: 'from-amber-500/10 via-transparent to-orange-600/5',
    iconGlow: 'from-amber-500/20 to-orange-600/20 ring-1 ring-amber-400/40 shadow-[0_0_40px_rgba(245,158,11,0.3)]',
    iconColor: 'text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]',
    buttonGradient: 'from-amber-400 via-orange-500 to-amber-400',
    activeGlow: 'bg-amber-500/20',
    comingSoonBg: 'bg-[#1c1205]/90 ring-amber-500/30',
  };

  const getBentoClass = (index) => {
    const layouts = [
      "col-span-1 lg:col-span-2 row-span-2",
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
      ambientOrbs={['bg-amber-600/10', 'bg-orange-800/10']}
      comingSoonConfig={comingSoonConfig}
      showComingSoon={showComingSoon}
      onCloseComingSoon={() => setShowComingSoon(false)}
    >
      {/* ── HERO PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotateY: 8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex-none lg:w-[45%] relative rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-8 lg:p-12 ring-1 ring-white/10 bg-[#1c1205]/80 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-600/5 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Radar animation */}
        <RadarSweepAnimation />

        {/* Scanning scanline */}
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.5)] opacity-30 pointer-events-none"
        />

        {/* Telemetry */}
        <div className="absolute top-6 left-8 flex flex-col gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-amber-500 tracking-[0.25em]">TARGET_ID: 0x4B3A</span>
          <span className="text-[10px] font-mono text-amber-500 tracking-[0.25em]">SCANNING...</span>
        </div>
        <div className="absolute bottom-6 right-8 flex flex-col items-end gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-amber-500 tracking-[0.25em]">MATCH: 99.4%</span>
          <span className="text-[10px] font-mono text-amber-500 tracking-[0.25em]">SONAR_ACTIVE</span>
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
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 ring-1 ring-amber-400/40 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-center mb-10 backdrop-blur-xl"
          >
            {TopicIcon && <TopicIcon className="w-12 h-12 text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]" />}
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter mb-4 leading-[1.1]">
            {modalTopic.title}
          </h2>

          <div className="flex items-center gap-2 mb-6">
            <Crosshair className="w-4 h-4 text-amber-400 opacity-60" />
            <p className="text-lg lg:text-xl font-medium text-slate-400 max-w-md leading-relaxed">
              {modalTopic.description}
            </p>
          </div>

          {/* Target acquired indicator */}
          <AnimatePresence>
            {selectedAlgorithm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 ring-1 ring-amber-400/30 w-fit"
              >
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-mono text-amber-300 tracking-wider">TARGET ACQUIRED</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 mt-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-[0.2em]">
            <Activity className="w-4 h-4 animate-pulse text-amber-300" />
            <span>Search Space • {modalTopic.algorithms.length} Algorithms</span>
          </div>

          <motion.button
            whileHover={selectedAlgorithm ? { scale: 1.02, y: -2 } : { scale: 1 }}
            whileTap={selectedAlgorithm ? { scale: 0.98 } : { scale: 1 }}
            onClick={() => handleStartLearning(onClose)}
            disabled={!selectedAlgorithm}
            className={`relative w-full overflow-hidden rounded-[1.5rem] font-bold text-lg lg:text-xl p-[2px] transition-all duration-500 ${selectedAlgorithm
              ? 'shadow-[0_15px_50px_-10px_rgba(245,158,11,0.5)] cursor-pointer'
              : 'opacity-70 cursor-not-allowed'
              }`}
          >
            {selectedAlgorithm && (
              <span className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-gradient-xy" />
            )}
            <div className={`relative h-full w-full rounded-[1.4rem] py-6 flex items-center justify-center gap-3 transition-colors duration-300 ${selectedAlgorithm
              ? 'bg-[#0f172a] hover:bg-transparent text-white'
              : 'bg-white/[0.02] ring-1 ring-white/10 text-slate-500'
              }`}>
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-wide">
                {selectedAlgorithm ? (
                  <>
                    LOCK ON TARGET
                    <Zap className="w-5 h-5 ml-2 animate-pulse text-amber-300" />
                  </>
                ) : (
                  'AWAITING TARGET'
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
              className={`relative cursor-pointer rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 ${bentoClass} ${selected
                ? 'bg-amber-950/40 ring-1 ring-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.2)] z-20'
                : 'bg-[#0f172a]/50 ring-1 ring-white/10 hover:ring-amber-400/30 hover:bg-[#1e293b]/60 hover:shadow-2xl z-10'
                }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

              {selected && (
                <motion.div layoutId="searchSelectionGlow" className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none" />
              )}

              {/* Search index */}
              <div className="absolute top-3 right-4 text-[9px] font-mono text-amber-500/30 tracking-widest">
                idx[{index}]
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
                      className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ml-4 bg-amber-400 text-[#020617] shadow-[0_0_20px_rgba(252,211,77,0.6)]"
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

export default SearchModal;
