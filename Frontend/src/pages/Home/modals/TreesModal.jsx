import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Play, Activity, Zap, GitBranch } from 'lucide-react';
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
 * NeuralTreeAnimation — Growing tree/graph that pulses like a neural network.
 */
const NeuralTreeAnimation = () => {
  const nodes = [
    { cx: 100, cy: 40, r: 5, delay: 0 },     // root
    { cx: 55, cy: 85, r: 4, delay: 0.4 },     // L1
    { cx: 145, cy: 85, r: 4, delay: 0.6 },    // R1
    { cx: 30, cy: 130, r: 3, delay: 0.8 },    // L2-L
    { cx: 75, cy: 130, r: 3, delay: 1.0 },    // L2-R
    { cx: 125, cy: 130, r: 3, delay: 1.2 },   // R2-L
    { cx: 170, cy: 130, r: 3, delay: 1.4 },   // R2-R
  ];

  const edges = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
      <svg viewBox="0 0 200 170" className="w-full h-full max-w-[400px] max-h-[340px]">
        <defs>
          <linearGradient id="treeEdgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 1)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </linearGradient>
          <filter id="treeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges with growing animation */}
        {edges.map(([from, to], i) => (
          <motion.line
            key={`edge-${i}`}
            x1={nodes[from].cx} y1={nodes[from].cy}
            x2={nodes[to].cx} y2={nodes[to].cy}
            stroke="rgba(16, 185, 129, 0.5)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: nodes[to].delay, repeat: Infinity, repeatDelay: 4 }}
          />
        ))}

        {/* Synapse particles traveling along edges */}
        {edges.map(([from, to], i) => (
          <motion.circle
            key={`particle-${i}`}
            r="2"
            fill="#34d399"
            filter="url(#treeGlow)"
            animate={{
              cx: [nodes[from].cx, nodes[to].cx],
              cy: [nodes[from].cy, nodes[to].cy],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.2,
              delay: nodes[to].delay + 0.5,
              repeat: Infinity,
              repeatDelay: 3.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <React.Fragment key={`node-${i}`}>
            {/* Pulse ring */}
            <motion.circle
              cx={node.cx} cy={node.cy}
              r={node.r * 3}
              fill="none"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeWidth="0.5"
              animate={{ r: [node.r * 1.5, node.r * 3, node.r * 1.5], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, delay: node.delay, repeat: Infinity }}
            />
            {/* Core */}
            <motion.circle
              cx={node.cx} cy={node.cy}
              r={node.r}
              fill="#34d399"
              filter="url(#treeGlow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                r: [node.r, node.r * 1.3, node.r],
              }}
              transition={{
                scale: { duration: 0.5, delay: node.delay },
                opacity: { duration: 0.5, delay: node.delay },
                r: { duration: 2, delay: node.delay + 1, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
};

/**
 * Floating synapse particles background
 */
const SynapseParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 4 + Math.random() * 4,
      delay: i * 0.3,
      size: 1.5 + Math.random() * 2,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            x: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80],
            y: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
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
 * TreesModal — "Neural Network / Organic Growth" theme.
 * Palette: Emerald → Teal.
 * Hero: SVG tree with growing branches, synapse particles.
 * Grid: Staggered tree-level layout with connecting SVG lines.
 */
const TreesModal = ({ isOpen, onClose, modalTopic }) => {
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
    heroBg: 'from-emerald-500/10 via-transparent to-teal-600/5',
    iconGlow: 'from-emerald-500/20 to-teal-600/20 ring-1 ring-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    iconColor: 'text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]',
    buttonGradient: 'from-emerald-400 via-teal-500 to-emerald-400',
    activeGlow: 'bg-emerald-500/20',
    comingSoonBg: 'bg-[#061811]/90 ring-emerald-500/30',
  };

  const getBentoClass = (index) => {
    // Tree-like staggered layout
    const layouts = [
      "col-span-1 lg:col-span-3 row-span-1",  // root - full width
      "col-span-1 row-span-2",                  // branch
      "col-span-1 lg:col-span-2 row-span-1",   // branch
      "col-span-1 row-span-1",                  // leaf
      "col-span-1 lg:col-span-2 row-span-2",   // large branch
      "col-span-1 row-span-1",                  // leaf
      "col-span-1 row-span-1",                  // leaf
      "col-span-1 lg:col-span-2 row-span-1",   // branch
    ];
    return layouts[index % layouts.length];
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      ambientOrbs={['bg-emerald-600/10', 'bg-teal-800/10']}
      comingSoonConfig={comingSoonConfig}
      showComingSoon={showComingSoon}
      onCloseComingSoon={() => setShowComingSoon(false)}
    >
      {/* ── HERO PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotateY: 8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex-none lg:w-[45%] relative rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-8 lg:p-12 ring-1 ring-white/10 bg-[#061811]/80 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-600/5 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Neural tree illustration */}
        <NeuralTreeAnimation />
        <SynapseParticles />

        {/* Network grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Telemetry labels */}
        <div className="absolute top-6 left-8 flex flex-col gap-1 z-20 opacity-30">
          <div className="w-12 h-[1px] bg-emerald-400" />
          <span className="text-[10px] font-mono text-emerald-400 tracking-[0.25em]">GRAPH_NODES_ACTIVE</span>
        </div>
        <div className="absolute bottom-6 right-8 flex flex-col items-end gap-1 z-20 opacity-30">
          <span className="text-[10px] font-mono text-emerald-400 tracking-[0.25em]">SYNAPSE_STABLE</span>
          <div className="w-12 h-[1px] bg-emerald-400" />
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
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 ring-1 ring-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center mb-10 backdrop-blur-xl"
          >
            {TopicIcon && <TopicIcon className="w-12 h-12 text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />}
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter mb-4 leading-[1.1]">
            {modalTopic.title}
          </h2>

          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="w-4 h-4 text-emerald-400 opacity-60" />
            <p className="text-lg lg:text-xl font-medium text-slate-400 max-w-md leading-relaxed">
              {modalTopic.description}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-[0.2em]">
            <Activity className="w-4 h-4 animate-pulse text-emerald-300" />
            <span>Neural Map • {modalTopic.algorithms.length} Nodes Connected</span>
          </div>

          <motion.button
            whileHover={selectedAlgorithm ? { scale: 1.02, y: -2 } : { scale: 1 }}
            whileTap={selectedAlgorithm ? { scale: 0.98 } : { scale: 1 }}
            onClick={() => handleStartLearning(onClose)}
            disabled={!selectedAlgorithm}
            className={`relative w-full overflow-hidden rounded-[1.5rem] font-bold text-lg lg:text-xl p-[2px] transition-all duration-500 ${
              selectedAlgorithm
                ? 'shadow-[0_15px_50px_-10px_rgba(16,185,129,0.5)] cursor-pointer'
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {selectedAlgorithm && (
              <span className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 animate-gradient-xy" />
            )}
            <div className={`relative h-full w-full rounded-[1.4rem] py-6 flex items-center justify-center gap-3 transition-colors duration-300 ${
              selectedAlgorithm
                ? 'bg-[#0f172a] hover:bg-transparent text-white'
                : 'bg-white/[0.02] ring-1 ring-white/10 text-slate-500'
            }`}>
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-wide">
                {selectedAlgorithm ? (
                  <>
                    TRAVERSE PATH
                    <Zap className="w-5 h-5 ml-2 animate-pulse text-emerald-300" />
                  </>
                ) : (
                  'SELECT NODE'
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
                  ? 'bg-emerald-950/40 ring-1 ring-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.2)] z-20'
                  : 'bg-[#0f172a]/50 ring-1 ring-white/10 hover:ring-emerald-400/30 hover:bg-[#1e293b]/60 hover:shadow-2xl z-10'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

              {/* Branch connector for trees */}
              <div className="absolute top-0 left-8 w-px h-4 bg-gradient-to-b from-emerald-400/30 to-transparent" />

              {selected && (
                <motion.div layoutId="treeSelectionGlow" className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
              )}

              {/* Node depth indicator */}
              <div className="absolute top-3 right-4 text-[9px] font-mono text-emerald-500/30 tracking-widest">
                depth:{index}
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
                      className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ml-4 bg-emerald-400 text-[#020617] shadow-[0_0_20px_rgba(52,211,153,0.6)]"
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

export default TreesModal;
