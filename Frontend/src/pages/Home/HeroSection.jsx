import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../core/context/ThemeContext';

/* ─────────────────────────────────────────────────────────
   Mini Algorithm Visualizations
   Tiny, self-contained SVG animations for the preview strip
   ───────────────────────────────────────────────────────── */

/** BFS Graph — nodes lighting up breadth-first */
const BFSMiniViz = ({ isDark }) => {
  const [step, setStep] = useState(0);
  const nodes = [
    { cx: 40, cy: 15 },
    { cx: 18, cy: 45 },
    { cx: 62, cy: 45 },
    { cx: 8, cy: 75 },
    { cx: 32, cy: 75 },
    { cx: 52, cy: 75 },
    { cx: 72, cy: 75 },
  ];
  const edges = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
  ];

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % 8), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 80 90" className="w-full h-full">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke={isDark ? 'rgba(76,215,246,0.15)' : 'rgba(0,141,165,0.15)'}
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i} cx={n.cx} cy={n.cy} r="5"
          fill={i < step
            ? (isDark ? '#4CD7F6' : '#008DA5')
            : (isDark ? '#23293C' : '#E2E8F0')}
          stroke={i < step
            ? (isDark ? '#4CD7F6' : '#008DA5')
            : (isDark ? '#45464D' : '#CBD5E1')}
          strokeWidth="1"
          style={{
            transition: 'fill 0.3s ease, stroke 0.3s ease',
            filter: i < step ? `drop-shadow(0 0 4px ${isDark ? 'rgba(76,215,246,0.4)' : 'rgba(0,141,165,0.3)'})` : 'none',
          }}
        />
      ))}
    </svg>
  );
};

/** Merge Sort — bars splitting and merging */
const MergeSortMiniViz = ({ isDark }) => {
  const [step, setStep] = useState(0);
  const barSets = [
    [45, 20, 65, 35, 55, 25],
    [20, 45, 65, 25, 35, 55],
    [20, 35, 45, 25, 55, 65],
    [20, 25, 35, 45, 55, 65],
  ];

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % 4), 900);
    return () => clearInterval(interval);
  }, []);

  const bars = barSets[step];
  return (
    <svg viewBox="0 0 80 90" className="w-full h-full">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={4 + i * 13} y={85 - h}
          width="9" height={h}
          rx="2"
          fill={isDark ? '#4CD7F6' : '#008DA5'}
          opacity={0.3 + (h / 65) * 0.7}
          style={{ transition: 'all 0.4s ease' }}
        />
      ))}
    </svg>
  );
};

/** Binary Tree — nodes in a tree structure */
const TreeMiniViz = ({ isDark }) => {
  const [active, setActive] = useState(0);
  const nodes = [
    { cx: 40, cy: 14 },
    { cx: 20, cy: 38 },
    { cx: 60, cy: 38 },
    { cx: 10, cy: 62 },
    { cx: 30, cy: 62 },
    { cx: 50, cy: 62 },
    { cx: 70, cy: 62 },
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
  // In-order traversal: 3, 1, 4, 0, 5, 2, 6
  const order = [3, 1, 4, 0, 5, 2, 6];

  useEffect(() => {
    const interval = setInterval(() => setActive((s) => (s + 1) % 8), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke={isDark ? 'rgba(208,188,255,0.15)' : 'rgba(87,27,193,0.12)'}
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => {
        const isActive = order.indexOf(i) < active;
        return (
          <circle
            key={i} cx={n.cx} cy={n.cy} r="5"
            fill={isActive
              ? (isDark ? '#D0BCFF' : '#571BC1')
              : (isDark ? '#23293C' : '#E2E8F0')}
            stroke={isActive
              ? (isDark ? '#D0BCFF' : '#571BC1')
              : (isDark ? '#45464D' : '#CBD5E1')}
            strokeWidth="1"
            style={{
              transition: 'fill 0.3s ease, stroke 0.3s ease',
              filter: isActive ? `drop-shadow(0 0 3px ${isDark ? 'rgba(208,188,255,0.4)' : 'rgba(87,27,193,0.3)'})` : 'none',
            }}
          />
        );
      })}
    </svg>
  );
};

/** Knapsack DP — grid cells filling bottom-up */
const KnapsackMiniViz = ({ isDark }) => {
  const [step, setStep] = useState(0);
  const rows = 4;
  const cols = 5;

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % (rows * cols + 1)), 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 80 70" className="w-full h-full">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const idx = r * cols + c;
          const isFilled = idx < step;
          return (
            <rect
              key={`${r}-${c}`}
              x={4 + c * 15} y={4 + r * 16}
              width="12" height="13"
              rx="2"
              fill={isFilled
                ? (isDark ? 'rgba(76,215,246,0.35)' : 'rgba(0,141,165,0.25)')
                : (isDark ? 'rgba(35,41,60,0.6)' : 'rgba(241,245,249,0.8)')}
              stroke={isDark ? 'rgba(69,70,77,0.15)' : 'rgba(15,23,42,0.06)'}
              strokeWidth="0.5"
              style={{ transition: 'fill 0.2s ease' }}
            />
          );
        })
      )}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────
   HeroSection
   Center-stage, Apple-keynote-style hero.
   Aspirational headline, single CTA, mini visualization strip.
   ───────────────────────────────────────────────────────── */

const HeroSection = ({ scrollToTopics, sectionRefs }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const heroRef = useRef(null);

  // ── Scroll-Linked Cinematic Transforms ──
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Hero content shrinks and fades as you scroll away
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const smoothScale = useSpring(heroScale, { stiffness: 100, damping: 30 });
  const smoothOpacity = useSpring(heroOpacity, { stiffness: 100, damping: 30 });

  // Background glows parallax at different rate
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const gradientWordStyle = (gradient) => ({
    backgroundImage: gradient,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    display: 'inline-block',
  });

  // Staggered entrance variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const miniCardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const visualizations = [
    { id: 'bfs', label: 'BFS', Viz: BFSMiniViz },
    { id: 'merge-sort', label: 'Merge Sort', Viz: MergeSortMiniViz },
    { id: 'bst', label: 'Binary Tree', Viz: TreeMiniViz },
    { id: 'knapsack', label: 'Knapsack', Viz: KnapsackMiniViz },
  ];

  return (
    <header
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Background Treatment (parallaxes at different rate) ── */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        {/* Radial gradient glow — top center */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 700px 500px at 50% 15%, rgba(76,215,246,0.06), transparent 70%)'
              : 'radial-gradient(ellipse 700px 500px at 50% 15%, rgba(0,141,165,0.04), transparent 70%)',
          }}
        />
        {/* Secondary subtle glow — bottom left (emerald tint, dark only) */}
        {isDark && (
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 400px 300px at 25% 70%, rgba(184,255,187,0.025), transparent 60%)',
            }}
          />
        )}
      </motion.div>
      {/* Digital grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: isDark ? 0.4 : 0.15,
        }}
      />

      {/* ── Hero Content (scroll-linked scale + fade) ── */}
      <motion.div
        ref={(el) => {
          if (sectionRefs) sectionRefs.current[0] = el;
        }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto will-change-transform"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          scale: smoothScale,
          opacity: smoothOpacity,
        }}
      >
        {/* Micro-label pill */}
        <motion.div variants={itemVariants}>
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-code text-[11px] uppercase tracking-[0.08em] ${
              isDark
                ? 'text-[var(--accent-primary)]'
                : 'text-[var(--accent-primary)]'
            }`}
            style={{
              background: isDark ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-inner)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                backgroundColor: isDark ? '#50FA7B' : '#10B981',
                boxShadow: `0 0 6px ${isDark ? 'rgba(80,250,123,0.4)' : 'rgba(16,185,129,0.3)'}`,
              }}
            />
            Your Complete Interview Prep Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="font-display font-bold leading-[1.05] tracking-tight mt-8"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}
        >
          <span className={isDark ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}>
            From Zero to{' '}
          </span>
          <span
            className="text-gradient-cyan"
            style={gradientWordStyle(
              isDark
                ? 'linear-gradient(135deg, #4CD7F6, #008DA5)'
                : 'linear-gradient(135deg, #008DA5, #006172)'
            )}
          >
            Offer.
          </span>
          <br />
          <span className={isDark ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}>
            One{' '}
          </span>
          <span
            className="text-gradient-emerald"
            style={gradientWordStyle(
              isDark
                ? 'linear-gradient(135deg, #b8ffbb, #42ef72)'
                : 'linear-gradient(135deg, #10B981, #059669)'
            )}
          >
            Platform.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="max-w-xl text-lg leading-relaxed mt-8"
          style={{ color: isDark ? 'var(--text-secondary)' : 'var(--text-secondary)' }}
        >
          35+ interactive visualizations
          <span style={{ color: 'var(--accent-primary)', margin: '0 8px' }}>·</span>
          500+ practice problems
          <span style={{ color: 'var(--accent-primary)', margin: '0 8px' }}>·</span>
          Real OA mock tests
          <span style={{ color: 'var(--accent-primary)', margin: '0 8px' }}>·</span>
          Interview experiences
        </motion.p>

        {/* CTA — Power Cell Button */}
        <motion.div variants={itemVariants} className="mt-10">
          <motion.button
            onClick={() => navigate('/practice')}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97, y: 1 }}
            className="relative flex items-center gap-2.5 px-10 py-4 rounded-xl font-semibold text-base cursor-pointer transition-shadow duration-300"
            style={{
              background: 'var(--gradient-brand)',
              color: isDark ? '#001F26' : '#FFFFFF',
              boxShadow: isDark
                ? '0 0 20px rgba(76,215,246,0.2), inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px -2px rgba(7,13,31,0.5)'
                : '0 0 20px rgba(0,141,165,0.15), inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px -2px rgba(15,23,42,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 0 35px rgba(76,215,246,0.35), inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 24px -4px rgba(7,13,31,0.6)'
                : '0 0 35px rgba(0,141,165,0.25), inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 24px -4px rgba(15,23,42,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 0 20px rgba(76,215,246,0.2), inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px -2px rgba(7,13,31,0.5)'
                : '0 0 20px rgba(0,141,165,0.15), inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px -2px rgba(15,23,42,0.1)';
            }}
            id="hero-cta-get-started"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Mini Visualization Strip */}
        <motion.div
          className="flex flex-wrap justify-center gap-5 mt-20"
          variants={containerVariants}
        >
          {visualizations.map(({ id, label, Viz }) => (
            <motion.div
              key={id}
              variants={miniCardVariants}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className="w-[120px] h-[90px] sm:w-[140px] sm:h-[100px] rounded-xl p-2 relative overflow-hidden transition-all duration-300"
                style={{
                  background: isDark ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border-default)',
                  boxShadow: `var(--shadow-inner), var(--shadow-sm)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `var(--shadow-inner), var(--shadow-md), 0 0 20px var(--accent-glow)`;
                  e.currentTarget.style.borderColor = isDark ? 'rgba(76,215,246,0.15)' : 'rgba(0,141,165,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `var(--shadow-inner), var(--shadow-sm)`;
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <Viz isDark={isDark} />
              </div>
              <span
                className="font-code text-[10px] uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom terminal line — subtle, ambient */}
      <div
        className="absolute bottom-6 left-0 right-0 text-center font-code text-[10px] uppercase tracking-[0.15em] z-10"
        style={{ color: isDark ? 'rgba(114,130,153,0.88)' : 'rgba(51,65,85,0.78)' }}
      >
        Scroll to explore
      </div>
    </header>
  );
};

export default HeroSection;
