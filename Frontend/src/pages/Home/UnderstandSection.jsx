import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTheme } from '../../core/context/ThemeContext';
import { topics } from '../../core/constants/algorithms';

/* ─────────────────────────────────────────────────────────
   Spotlight Algorithm Visualizations
   Self-contained SVG animations for the spotlight area
   ───────────────────────────────────────────────────────── */

/** BFS Graph — breadth-first traversal visualization */
const BFSSpotlight = ({ isDark }) => {
  const [step, setStep] = React.useState(0);

  const nodes = [
    { cx: 200, cy: 50, id: 'A' },
    { cx: 100, cy: 140, id: 'B' },
    { cx: 300, cy: 140, id: 'C' },
    { cx: 50, cy: 240, id: 'D' },
    { cx: 150, cy: 240, id: 'E' },
    { cx: 250, cy: 240, id: 'F' },
    { cx: 350, cy: 240, id: 'G' },
    { cx: 200, cy: 320, id: 'H' },
  ];
  const edges = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [5, 7], [4, 7],
  ];

  React.useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % 10), 700);
    return () => clearInterval(interval);
  }, []);

  const accentColor = isDark ? '#4CD7F6' : '#008DA5';
  const processingColor = '#D4A76A';
  const baseColor = isDark ? '#23293C' : '#E2E8F0';
  const baseBorder = isDark ? '#45464D' : '#CBD5E1';

  return (
    <svg viewBox="0 0 400 370" className="w-full h-full" style={{ maxHeight: '360px' }}>
      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke={isDark ? 'rgba(76,215,246,0.12)' : 'rgba(0,141,165,0.1)'}
          strokeWidth="1.5"
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => {
        const isVisited = i < step;
        const isProcessing = i === step;
        const fill = isProcessing ? processingColor : isVisited ? accentColor : baseColor;
        const stroke = isProcessing ? processingColor : isVisited ? accentColor : baseBorder;
        return (
          <g key={i}>
            {/* Glow ring on processing node */}
            {isProcessing && (
              <circle cx={n.cx} cy={n.cy} r="22" fill="none"
                stroke={processingColor} strokeWidth="1" opacity="0.3"
              >
                <animate attributeName="r" from="18" to="28" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Glow behind visited */}
            {isVisited && (
              <circle cx={n.cx} cy={n.cy} r="14" fill={accentColor} opacity="0.08"
                style={{ filter: 'blur(6px)' }}
              />
            )}
            {/* Node circle */}
            <circle
              cx={n.cx} cy={n.cy} r="14" fill={fill} stroke={stroke}
              strokeWidth="1.5"
              style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
            />
            {/* Node label */}
            <text x={n.cx} y={n.cy + 4}
              textAnchor="middle"
              fontSize="10"
              fontFamily="'IBM Plex Mono', monospace"
              fontWeight="600"
              fill={isVisited || isProcessing ? (isDark ? '#0C1324' : '#FFFFFF') : (isDark ? '#728299' : '#64748B')}
              style={{ transition: 'fill 0.3s ease' }}
            >
              {n.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Merge Sort — bar chart splitting and merging */
const MergeSortSpotlight = ({ isDark }) => {
  const [phase, setPhase] = React.useState(0);
  const accentColor = isDark ? '#4CD7F6' : '#008DA5';

  const barSets = [
    [180, 80, 260, 140, 220, 100, 300, 60],  // unsorted
    [80, 180, 140, 260, 100, 220, 60, 300],   // after first pass
    [80, 140, 180, 260, 60, 100, 220, 300],   // after second pass
    [60, 80, 100, 140, 180, 220, 260, 300],   // sorted
  ];

  React.useEffect(() => {
    const interval = setInterval(() => setPhase((p) => (p + 1) % 4), 1200);
    return () => clearInterval(interval);
  }, []);

  const bars = barSets[phase];
  const maxH = 300;

  return (
    <svg viewBox="0 0 400 370" className="w-full h-full" style={{ maxHeight: '360px' }}>
      {bars.map((h, i) => {
        const barWidth = 32;
        const gap = 12;
        const totalWidth = bars.length * barWidth + (bars.length - 1) * gap;
        const startX = (400 - totalWidth) / 2;
        const x = startX + i * (barWidth + gap);
        const y = 350 - h;
        const ratio = h / maxH;

        return (
          <g key={i}>
            {/* Bar glow */}
            <rect x={x - 2} y={y - 2} width={barWidth + 4} height={h + 4} rx="6"
              fill={accentColor} opacity={0.06} style={{ filter: 'blur(4px)' }}
            />
            {/* Bar */}
            <rect x={x} y={y} width={barWidth} height={h} rx="4"
              fill={accentColor}
              opacity={0.25 + ratio * 0.65}
              style={{ transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
            />
            {/* Value label */}
            <text x={x + barWidth / 2} y={y - 8}
              textAnchor="middle" fontSize="9"
              fontFamily="'IBM Plex Mono', monospace"
              fill={isDark ? '#728299' : '#64748B'}
            >
              {h}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Binary Tree — in-order traversal */
const BSTSpotlight = ({ isDark }) => {
  const [step, setStep] = React.useState(0);
  const accentColor = isDark ? '#D0BCFF' : '#571BC1';

  const nodes = [
    { cx: 200, cy: 50, val: 50 },
    { cx: 110, cy: 130, val: 30 },
    { cx: 290, cy: 130, val: 70 },
    { cx: 65, cy: 210, val: 20 },
    { cx: 155, cy: 210, val: 40 },
    { cx: 245, cy: 210, val: 60 },
    { cx: 335, cy: 210, val: 80 },
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
  const inOrder = [3, 1, 4, 0, 5, 2, 6]; // in-order traversal indices

  React.useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % 9), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" style={{ maxHeight: '360px' }}>
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke={isDark ? 'rgba(208,188,255,0.12)' : 'rgba(87,27,193,0.1)'}
          strokeWidth="1.5"
        />
      ))}
      {nodes.map((n, i) => {
        const orderIdx = inOrder.indexOf(i);
        const isVisited = orderIdx < step;
        const isProcessing = orderIdx === step;
        const processingColor = '#D4A76A';
        const fill = isProcessing ? processingColor : isVisited ? accentColor : (isDark ? '#23293C' : '#E2E8F0');

        return (
          <g key={i}>
            {isProcessing && (
              <circle cx={n.cx} cy={n.cy} r="24" fill="none" stroke={processingColor} strokeWidth="1" opacity="0.3">
                <animate attributeName="r" from="20" to="30" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            {isVisited && (
              <circle cx={n.cx} cy={n.cy} r="16" fill={accentColor} opacity="0.08" style={{ filter: 'blur(6px)' }} />
            )}
            <circle cx={n.cx} cy={n.cy} r="16" fill={fill}
              stroke={isProcessing ? processingColor : isVisited ? accentColor : (isDark ? '#45464D' : '#CBD5E1')}
              strokeWidth="1.5"
              style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
            />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle" fontSize="11"
              fontFamily="'IBM Plex Mono', monospace" fontWeight="600"
              fill={isVisited || isProcessing ? (isDark ? '#0C1324' : '#FFFFFF') : (isDark ? '#728299' : '#64748B')}
              style={{ transition: 'fill 0.3s ease' }}
            >
              {n.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Knapsack DP — cells filling bottom-up */
const KnapsackSpotlight = ({ isDark }) => {
  const [step, setStep] = React.useState(0);
  const rows = 5;
  const cols = 8;
  const accentColor = isDark ? '#4CD7F6' : '#008DA5';

  React.useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % (rows * cols + 3)), 150);
    return () => clearInterval(interval);
  }, []);

  // Values to display in cells (simplified knapsack)
  const dpValues = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 0, 3, 4, 4, 7, 7, 7],
    [0, 0, 3, 4, 5, 7, 8, 9],
    [0, 0, 3, 4, 5, 7, 8, 9],
  ];

  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" style={{ maxHeight: '360px' }}>
      {/* Column headers */}
      {Array.from({ length: cols }).map((_, c) => (
        <text key={`ch-${c}`} x={60 + c * 42 + 16} y={30}
          textAnchor="middle" fontSize="10"
          fontFamily="'IBM Plex Mono', monospace"
          fill={isDark ? '#52526A' : '#94A3B8'}
        >
          W={c}
        </text>
      ))}
      {/* Row headers */}
      {Array.from({ length: rows }).map((_, r) => (
        <text key={`rh-${r}`} x={30} y={55 + r * 46 + 18}
          textAnchor="middle" fontSize="10"
          fontFamily="'IBM Plex Mono', monospace"
          fill={isDark ? '#52526A' : '#94A3B8'}
        >
          {r}
        </text>
      ))}
      {/* Cells */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const idx = r * cols + c;
          const isFilled = idx < step;
          const isActive = idx === step - 1;
          const val = dpValues[r]?.[c] ?? 0;

          return (
            <g key={`${r}-${c}`}>
              <rect
                x={60 + c * 42} y={42 + r * 46}
                width="36" height="36" rx="4"
                fill={isFilled
                  ? (val > 0
                    ? (isDark ? `rgba(76,215,246,${0.1 + (val / 9) * 0.35})` : `rgba(0,141,165,${0.08 + (val / 9) * 0.25})`)
                    : (isDark ? 'rgba(35,41,60,0.6)' : 'rgba(241,245,249,0.8)'))
                  : (isDark ? 'rgba(20,27,44,0.4)' : 'rgba(248,250,252,0.6)')}
                stroke={isActive
                  ? accentColor
                  : (isDark ? 'rgba(69,70,77,0.15)' : 'rgba(15,23,42,0.06)')}
                strokeWidth={isActive ? '2' : '0.5'}
                style={{ transition: 'fill 0.2s ease, stroke 0.2s ease' }}
              />
              {isFilled && (
                <text
                  x={60 + c * 42 + 18} y={42 + r * 46 + 22}
                  textAnchor="middle" fontSize="11"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight="500"
                  fill={val > 0 ? accentColor : (isDark ? '#45464D' : '#CBD5E1')}
                  style={{ transition: 'fill 0.2s ease' }}
                >
                  {val}
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────
   Algorithm Spotlight Data
   ───────────────────────────────────────────────────────── */
const spotlightAlgorithms = [
  { id: 'bfs', label: 'BFS', fullName: 'BFS — Breadth First Search', Viz: BFSSpotlight },
  { id: 'merge-sort', label: 'Merge Sort', fullName: 'Merge Sort — Divide & Conquer', Viz: MergeSortSpotlight },
  { id: 'bst', label: 'Binary Tree', fullName: 'BST — In-Order Traversal', Viz: BSTSpotlight },
  { id: 'knapsack', label: 'Knapsack', fullName: 'Knapsack — Dynamic Programming', Viz: KnapsackSpotlight },
];

const algorithmDescriptions = [
  {
    title: "Breadth-First Search",
    desc: "Level-by-level traversal using a queue. Fundamental for unweighted shortest paths and graph connectivity.",
  },
  {
    title: "Merge Sort",
    desc: "Divide & Conquer approach that recursively splits arrays into identical halves and gracefully merges them back in order.",
  },
  {
    title: "BST In-Order",
    desc: "Traverse left, process root, traverse right. Guarantees keys are visited in perfect ascending sorted order.",
  },
  {
    title: "0/1 Knapsack",
    desc: "A core dynamic programming problem. Fills a table bottom-up to maximize value without exceeding capacity limits.",
  }
];

/* ─────────────────────────────────────────────────────────
   Difficulty map for category cards
   ───────────────────────────────────────────────────────── */
const difficultyMap = {
  arrays: { dots: ['#4CD7F6', '#D4A76A'], label: 'Easy - Medium' },
  trees: { dots: ['#4CD7F6', '#D4A76A'], label: 'Easy - Medium' },
  dynamic: { dots: ['#ffb4ab'], label: 'Advanced' },
  searching: { dots: ['#4CD7F6', '#D4A76A'], label: 'Easy - Medium' },
  greedy: { dots: ['#D4A76A', '#ffb4ab'], label: 'Medium - Hard' },
  backtracking: { dots: ['#D4A76A', '#ffb4ab'], label: 'Medium - Hard' },
};

/* ─────────────────────────────────────────────────────────
   UnderstandSection
   Stage 01: "See How Algorithms Actually Work"
   Part A: Spotlight Visualizer with tab switcher
   Part B: Algorithm Category Grid (opens modals)
   ───────────────────────────────────────────────────────── */
const UnderstandSection = ({ topicsRef, sectionRefs, openModal }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeAlgo, setActiveAlgo] = useState(0);
  const waypointRefs = useRef([]);

  useEffect(() => {
    let rafId = null;

    const updateActiveFromViewport = () => {
      rafId = null;
      if (!waypointRefs.current.length) return;

      const viewportCenter = window.innerHeight * 0.5;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      waypointRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height * 0.5;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveAlgo((prev) => (prev === closestIndex ? prev : closestIndex));
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateActiveFromViewport);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // ── Scroll-Linked Spotlight Reveal ──
  const spotlightRef = useRef(null);
  const { scrollYProgress: spotlightProgress } = useScroll({
    target: spotlightRef,
    offset: ['start end', 'center center'],
  });
  // Spotlight scales up and rotates into view
  const spotlightScale = useTransform(spotlightProgress, [0, 1], [0.92, 1]);
  const spotlightY = useTransform(spotlightProgress, [0, 1], [60, 0]);
  const spotlightOpacity = useTransform(spotlightProgress, [0, 0.4], [0, 1]);
  const smoothSpotlightScale = useSpring(spotlightScale, { stiffness: 80, damping: 25 });
  const smoothSpotlightY = useSpring(spotlightY, { stiffness: 80, damping: 25 });

  // ── Scroll-Linked Grid Reveal ──
  const gridRef = useRef(null);
  const { scrollYProgress: gridProgress } = useScroll({
    target: gridRef,
    offset: ['start end', 'center center'],
  });
  const gridY = useTransform(gridProgress, [0, 1], [80, 0]);
  const gridOpacity = useTransform(gridProgress, [0, 0.3], [0, 1]);
  const smoothGridY = useSpring(gridY, { stiffness: 80, damping: 25 });

  // Stagger reveal variants
  const sectionVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  };

  const ActiveViz = spotlightAlgorithms[activeAlgo].Viz;

  return (
    <section ref={topicsRef} className="w-full relative">

      {/* ── PART A: Immersive Fullscreen Scrollytelling ── */}
      <div className="relative w-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        
        {/* Pinned Background Layer */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-0">
          <div className="absolute inset-0 w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAlgo}
                initial={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full flex items-center justify-center"
              >
                {/* Scale the visualizer to feel expansive and cinematic */}
                <div className="w-[140%] h-[140%] sm:w-[120%] sm:h-[120%] lg:w-[100%] lg:h-[100%] max-w-[1400px] flex items-center justify-center opacity-80 sm:opacity-90 xl:opacity-100 mix-blend-screen pointer-events-none">
                   <ActiveViz isDark={isDark} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Edge gradients to ensure cinematic framing and text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t pointer-events-none z-10" style={{ backgroundImage: isDark ? 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)' : 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.8) 40%, transparent 100%)' }}></div>
          <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b pointer-events-none z-10" style={{ backgroundImage: isDark ? 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)' : 'linear-gradient(to bottom, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)' }}></div>
        </div>

        {/* Scrolling Waypoints Layer */}
        <div className="relative z-10 w-full">
          {/* Header block: Rests at the top of the container, pulling up over the pinned visualizer */}
          <div className="h-[80vh] w-full pointer-events-none flex flex-col pt-32 px-6 lg:px-20 max-w-7xl mx-auto" style={{ marginTop: '-100vh' }}>
            <motion.div
              ref={(el) => { if (sectionRefs) sectionRefs.current[1] = el; }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionVariants}
              className="flex flex-col lg:items-start items-center text-center lg:text-left drop-shadow-2xl z-20 pointer-events-auto"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 shadow-lg backdrop-blur-md ${
                isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
              }`}>
                <span className="font-code text-[11px] tracking-[0.2em] uppercase font-bold text-cyan-500">
                  // stage 01
                </span>
              </div>
              <h2 className="font-display text-4xl mb-4 md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] drop-shadow-xl"
                  style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                See How Algorithms <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #4CD7F6, #D4A76A)' }}>Actually Work.</span>
              </h2>
            </motion.div>
          </div>

          {/* Sequential Scroll Waypoints */}
          {spotlightAlgorithms.map((algo, i) => (
            <div
              key={algo.id}
              ref={(el) => {
                waypointRefs.current[i] = el;
              }}
              className="transition-all duration-500 ease-out"
              style={{ opacity: activeAlgo === i ? 1 : 0.28, transform: activeAlgo === i ? 'scale(1)' : 'scale(0.97)' }}
            >
              <div className="h-[100vh] md:h-[120vh] w-full flex items-center md:items-end justify-start pb-24 md:pb-40 px-6 lg:px-20 max-w-7xl mx-auto z-20 pointer-events-auto">
                {/* Minimalist Text Overlay (Joby setup) */}
                <div className={`max-w-xl lg:max-w-3xl pl-6 md:pl-10 border-l-2 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeAlgo === i ? 'opacity-100 translate-y-0 scale-100 blur-none' : 'opacity-0 translate-y-16 scale-95 blur-sm'
                  }`} 
                  style={{ 
                    borderColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
                    textShadow: isDark ? '0 4px 24px rgba(0,0,0,0.8)' : '0 4px 24px rgba(255,255,255,0.8)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                     <span className="font-code text-cyan-500 font-bold tracking-[0.2em] text-sm lg:text-base">0{i + 1}</span>
                    <span className="font-code text-xs lg:text-sm uppercase tracking-[0.2em]" style={{ color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(15,23,42,0.8)' }}>
                       {algo.fullName}
                     </span>
                  </div>
                  <h3 className="text-4xl md:text-5xl lg:text-7xl font-display font-semibold tracking-tight mb-6 leading-tight drop-shadow-2xl" 
                      style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                    {algorithmDescriptions[i].title}
                  </h3>
                  <p className="text-xl md:text-2xl lg:text-3xl font-body leading-snug lg:leading-normal drop-shadow-xl" 
                     style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)' }}>
                    {algorithmDescriptions[i].desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="h-[20vh] w-full" /> {/* Bottom padding after waypoints */}
        </div>
      </div>

      {/* ── PART B: Algorithm Category Grid — normal flow after scrollytelling ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-20 pt-32 pb-24 relative z-20">
        <motion.div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24 will-change-transform"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionVariants}
          style={{
            y: smoothGridY,
            opacity: gridOpacity,
          }}
        >
          {topics.map((topic) => {
            const IconComponent = topic.IconComponent;
            const difficulty = difficultyMap[topic.id] || { dots: ['#4CD7F6'], label: 'Easy' };

            return (
              <motion.div
                key={topic.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="relative rounded-xl p-6 flex flex-col gap-4 cursor-pointer group transition-colors duration-300"
                style={{
                  background: isDark ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                  border: isDark ? '1px solid rgba(114,130,153,0.24)' : '1px solid rgba(15,23,42,0.12)',
                  boxShadow: `var(--shadow-inner), 0 8px 32px rgba(0,0,0,${isDark ? '0.25' : '0.06'})`,
                }}
                onClick={() => openModal(topic)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${topic.title}`}
                onKeyDown={(e) => { if (e.key === 'Enter') openModal(topic); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `var(--shadow-inner), var(--shadow-md), 0 0 25px var(--accent-glow)`;
                  e.currentTarget.style.borderColor = isDark ? 'rgba(76,215,246,0.32)' : 'rgba(0,141,165,0.24)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `var(--shadow-inner), 0 8px 32px rgba(0,0,0,${isDark ? '0.25' : '0.06'})`;
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Top row: Icon well + Algorithm count */}
                <div className="flex justify-between items-start">
                  {/* Recessed icon well */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: isDark ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                      boxShadow: `inset 0 2px 4px rgba(0,0,0,${isDark ? '0.3' : '0.08'})`,
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <IconComponent
                      className="w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-300"
                      style={{ color: 'var(--accent-primary)' }}
                    />
                  </div>
                  {/* Algorithm count badge */}
                  <span
                    className="font-code text-[10px] uppercase tracking-[0.06em] px-2 py-1 rounded"
                    style={{
                      color: 'var(--text-secondary)',
                      background: isDark ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {topic.algorithms?.length ?? 0} algorithms
                  </span>
                </div>
                {/* Title */}
                <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>
                  {topic.title}
                </h3>

                {/* Difficulty row */}
                <div className="flex items-center gap-2">
                  {difficulty.dots.map((color, i) => (
                    <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                  <span className="font-code text-[10px] uppercase tracking-[0.04em]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {difficulty.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {topic.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default UnderstandSection;
