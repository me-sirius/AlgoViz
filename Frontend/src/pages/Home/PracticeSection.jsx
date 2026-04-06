import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../../core/context/ThemeContext';

const PracticeSection = ({ sectionRefs }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- Real Backend Data State ---
  const [dsaStats, setDsaStats] = useState({ easy: 128, medium: 312, hard: 60, total: '500+' });
  const [mcqStats, setMcqStats] = useState({ total: '1000+' });
  const [hoveredCompany, setHoveredCompany] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        // Fetch Questions to get counts
        const qRes = await axios.get(`${baseUrl}/api/questions`);
        if (qRes.data && qRes.data.success && isMounted) {
          const questions = qRes.data.data;
          const easy = questions.filter((q) => q.difficulty === 'Easy').length;
          const medium = questions.filter((q) => q.difficulty === 'Medium').length;
          const hard = questions.filter((q) => q.difficulty === 'Hard').length;
          setDsaStats({ easy, medium, hard, total: questions.length });
        }

        // Fetch MCQs to get total
        const mRes = await axios.get(`${baseUrl}/api/mcq?limit=1`);
        if (mRes.data && mRes.data.success && isMounted) {
          setMcqStats({ total: mRes.data.total || '1000+' });
        }
      } catch (err) {
        console.error('Failed to fetch practice stats', err);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll-linked transforms for the whole section wrapper
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const smoothY = useSpring(sectionY, { stiffness: 80, damping: 25 });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  // Upgraded base card styles with stronger depth in light mode
  const cardBase = `trinity-panel rounded-2xl relative transition-all duration-300 ${
    isDark
      ? 'bg-[var(--bg-elevated)] border-white/10 shadow-lg hover:-translate-y-1 hover:shadow-[0_12px_34px_rgba(76,215,246,0.12)] hover:border-[var(--accent-primary)]/45'
      : 'bg-gradient-to-b from-white to-slate-50 border-slate-300 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.34),0_4px_10px_-6px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.92)] hover:-translate-y-1 hover:shadow-[0_18px_34px_-14px_rgba(15,23,42,0.34),0_8px_18px_-8px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.96)] hover:border-slate-400'
  } overflow-hidden group flex flex-col`;

  const innerWell = isDark ? 'bg-[#0F172A]' : 'bg-slate-100';
  const headerBg = isDark ? 'bg-[var(--bg-highest)]' : 'bg-white';

  // Code editor lines for realism (formatted and indented consistently)
  const codeLines = [
    {
      num: 1,
      indent: 0,
      content: (
        <>
          <span style={{ color: 'var(--accent-primary)' }}>class</span>{' '}
          <span style={{ color: 'var(--accent-warning)' }}>Solution</span> {'{'}
        </>
      ),
    },
    {
      num: 2,
      indent: 0,
      content: <span style={{ color: 'var(--accent-primary)' }}>public:</span>,
    },
    {
      num: 3,
      indent: 1,
      content: (
        <>
          <span style={{ color: 'var(--accent-primary)' }}>int</span>{' '}
          <span style={{ color: 'var(--accent-secondary)' }}>maxArea</span>
          (vector&lt;<span style={{ color: 'var(--accent-primary)' }}>int</span>&gt;&amp; height) {'{'}
        </>
      ),
    },
    {
      num: 4,
      indent: 2,
      content: (
        <>
          <span style={{ color: 'var(--accent-primary)' }}>int</span> maxWater = <span className="text-emerald-500">0</span>;
        </>
      ),
    },
    {
      num: 5,
      indent: 2,
      content: (
        <>
          <span style={{ color: 'var(--accent-primary)' }}>int</span> left = <span className="text-emerald-500">0</span>;
        </>
      ),
    },
    {
      num: 6,
      indent: 2,
      content: (
        <>
          <span style={{ color: 'var(--accent-primary)' }}>int</span> right = <span style={{ color: 'var(--accent-secondary)' }}>static_cast</span>&lt;<span style={{ color: 'var(--accent-primary)' }}>int</span>&gt;(height.size()) - <span className="text-emerald-500">1</span>;
        </>
      ),
    },
    { num: 7, indent: 0, content: '' },
    {
      num: 8,
      indent: 2,
      content: (
        <>
          <span style={{ color: 'var(--accent-secondary)' }}>while</span> (left &lt; right) {'{'}
        </>
      ),
    },
    {
      num: 9,
      indent: 3,
      content: (
        <>
          <span style={{ color: 'var(--accent-primary)' }}>int</span> currentWater = min(height[left], height[right]) * (right - left);
        </>
      ),
    },
    {
      num: 10,
      indent: 3,
      content: <>maxWater = max(maxWater, currentWater);</>,
    },
    { num: 11, indent: 0, content: '' },
    {
      num: 12,
      indent: 3,
      content: (
        <>
          <span style={{ color: 'var(--accent-secondary)' }}>if</span> (height[left] &lt; height[right]) {'{'}
        </>
      ),
    },
    { num: 13, indent: 4, content: <>left++;</> },
    {
      num: 14,
      indent: 3,
      content: (
        <>
          {'} '}<span style={{ color: 'var(--accent-secondary)' }}>else</span> {'{'}
        </>
      ),
    },
    { num: 15, indent: 4, content: <>right--;</> },
    { num: 16, indent: 3, content: <>{'}'}</> },
    { num: 17, indent: 2, content: <>{'}'}</> },
    { num: 18, indent: 0, content: '' },
    {
      num: 19,
      indent: 2,
      content: (
        <>
          <span style={{ color: 'var(--accent-secondary)' }}>return</span> maxWater;
        </>
      ),
    },
    { num: 20, indent: 1, content: <>{'}'}</> },
    { num: 21, indent: 0, content: <>{'};'}</> },
  ];

  const companyLogos = [
    { name: 'Google', slug: 'google', color: '4285F4' },
    { name: 'Meta', slug: 'meta', color: '0668E1' },
    { name: 'NVIDIA', slug: 'nvidia', color: '76B900' },
    { name: 'Palantir', slug: 'palantir', color: '101113' },
    { name: 'Stripe', slug: 'stripe', color: '635BFF' },
    { name: 'Databricks', slug: 'databricks', color: 'FF3621' },
    { name: 'Apple', slug: 'apple', color: 'A2AAAD' },
  ];

  const getLogoColor = (company) => {
    if (isDark && company.slug === 'palantir') return 'E2E8F0';
    return company.color;
  };

  return (
    <section
      ref={(el) => {
        containerRef.current = el;
        if (sectionRefs) sectionRefs.current[2] = el;
      }}
      className="w-full relative py-24"
    >
      <motion.div className="max-w-[1440px] mx-auto px-6 lg:px-12 will-change-transform" style={{ y: smoothY, opacity: sectionOpacity }}>
        {/* Header Section */}
        <header className="mb-14 text-center lg:text-left flex flex-col lg:items-start items-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 shadow-sm ${
            isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
          }`}>
            <span className="font-code text-[11px] tracking-[0.2em] uppercase font-bold text-blue-500">// stage 02</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter mb-4 leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
            Practice Makes <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-text)' }}>Perfect.</span>
          </h2>
          <p className="font-body text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Master concepts with 500+ real-company problems and 1000+ MCQs. From arrays to dynamic programming.
          </p>
        </header>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {/* Cell A: IDE (Large) */}
          <motion.div variants={cardVariants} className={`md:col-span-8 h-[360px] lg:h-[340px] ${cardBase}`}>
            {/* IDE Header */}
            <div className={`px-4 py-2 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-slate-300'} ${headerBg}`}>
              <div className="flex items-center gap-4">
                <div className="flex gap-2 opacity-90">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="font-code text-xs tracking-wider uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Solution.cpp
                </span>
              </div>
              <span
                className={`font-code text-[10px] font-medium px-2 py-0.5 rounded border ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-slate-200'
                    : 'bg-slate-200/85 border-slate-300 text-slate-700'
                }`}
              >
                C++ 20
              </span>
            </div>

            {/* IDE Body with Line Numbers */}
            <div
              className={`px-4 py-3 font-code text-[12px] md:text-[13px] flex-grow overflow-y-auto overflow-x-auto overscroll-contain scroll-smooth focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${innerWell}`}
              tabIndex={0}
              aria-label="Code preview panel"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col min-w-max">
                {codeLines.map((line) => (
                  <div
                    key={line.num}
                    className={`flex gap-4 leading-relaxed px-2 py-0.5 rounded ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-200/85'
                    }`}
                  >
                    <span
                      className="select-none text-right w-6 text-xs mt-0.5"
                      style={{ color: isDark ? 'rgba(220,225,251,0.65)' : '#64748B' }}
                    >
                      {line.num}
                    </span>
                    <span
                      className="whitespace-pre"
                      style={{
                        color: isDark ? '#DCE1FB' : '#334155',
                        paddingLeft: `${line.indent * 14}px`,
                      }}
                    >
                      {line.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* IDE Footer */}
            <div className={`px-4 py-2 border-t flex justify-end items-center ${isDark ? 'border-white/5 bg-[var(--bg-highest)]' : 'border-slate-200 bg-white'}`}>
              <button
                className="font-display font-bold text-xs md:text-[13px] px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all hover:scale-105 shadow-md"
                style={{ background: 'var(--gradient-brand)', color: '#ffffff' }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                RUN &amp; SUBMIT
              </button>
            </div>
          </motion.div>

          {/* Cell B: Stats (Medium) */}
          <motion.div variants={cardVariants} className={`md:col-span-4 h-[360px] lg:h-[340px] p-6 flex flex-col justify-center items-center text-center ${cardBase}`}>
            <div className="font-code text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>DSA Problem Bank</div>
            <div className="text-6xl md:text-7xl font-display font-black text-transparent bg-clip-text drop-shadow-sm mb-1" style={{ backgroundImage: 'var(--gradient-text)' }}>{dsaStats.total}</div>
            <div className="font-body font-medium text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Curated Challenges</div>

            {/* Upgraded Badges instead of bare text */}
            <div className="flex w-full justify-between gap-2 px-1">
              <div className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-gradient-to-b from-emerald-100 to-emerald-50 border-emerald-200'}`}>
                <div className={`font-display font-bold text-lg mb-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{dsaStats.easy}</div>
                <div className={`font-code font-bold text-[10px] uppercase tracking-widest ${isDark ? 'text-emerald-300/90' : 'text-emerald-800'}`}>EASY</div>
              </div>
              <div className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/25' : 'bg-gradient-to-b from-amber-100 to-amber-50 border-amber-200'}`}>
                <div className={`font-display font-bold text-lg mb-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{dsaStats.medium}</div>
                <div className={`font-code font-bold text-[10px] uppercase tracking-widest ${isDark ? 'text-amber-300/90' : 'text-amber-800'}`}>MEDIUM</div>
              </div>
              <div className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border ${isDark ? 'bg-rose-500/10 border-rose-500/25' : 'bg-gradient-to-b from-rose-100 to-rose-50 border-rose-200'}`}>
                <div className={`font-display font-bold text-lg mb-0.5 ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>{dsaStats.hard}</div>
                <div className={`font-code font-bold text-[10px] uppercase tracking-widest ${isDark ? 'text-rose-300/90' : 'text-rose-800'}`}>HARD</div>
              </div>
            </div>
          </motion.div>

          {/* Cell C: MCQ (Medium) */}
          <motion.div variants={cardVariants} className={`md:col-span-5 p-7 flex flex-col justify-center items-center text-center ${cardBase}`}>
            <div className="font-code text-[11px] tracking-[0.2em] uppercase font-bold mb-4" style={{ color: 'var(--accent-primary)' }}>MCQ Practice</div>
            <div className="text-7xl md:text-8xl font-display font-black text-transparent bg-clip-text drop-shadow-sm mb-2" style={{ backgroundImage: 'var(--gradient-text)' }}>{mcqStats.total}</div>
            <div className="font-body font-medium text-sm md:text-base mb-8" style={{ color: 'var(--text-secondary)' }}>Core CS Concepts</div>

            <div className="grid grid-cols-2 gap-3 w-full px-2">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                </div>
                <div className="text-left flex flex-col">
                  <span className="font-code text-[16px] font-bold text-[var(--text-primary)]">DBMS</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                </div>
                <div className="text-left flex flex-col">
                  <span className="font-code text-[16px] font-bold text-[var(--text-primary)]">OS</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <div className="text-left flex flex-col">
                  <span className="font-code text-[16px] font-bold text-[var(--text-primary)]">NETWORKS</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <div className="text-left flex flex-col">
                  <span className="font-code text-[16px] font-bold text-[var(--text-primary)]">OOPS</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cell D: Leaderboard (Medium) */}
          <motion.div variants={cardVariants} className={`md:col-span-7 p-7 flex flex-col ${cardBase}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-code text-[11px] tracking-widest uppercase font-bold" style={{ color: 'var(--accent-primary)' }}>Global Rankings</span>
              <button className="opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              </button>
            </div>

            <div className="space-y-3 flex-grow flex flex-col justify-center">
              {/* Rank 1: Gold Treatment */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm font-black text-amber-500 w-6 text-center">🏆</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold bg-amber-500 text-white shadow-md">VX</div>
                  <span className="font-body text-sm font-bold" style={{ color: 'var(--text-primary)' }}>VORTEX_DEV</span>
                </div>
                <span className="font-code text-sm font-bold text-amber-600 dark:text-amber-400">14,920 pts</span>
              </div>

              <div className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm font-bold w-6 text-center opacity-65">02</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">NK</div>
                  <span className="font-body text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>NEO_KODER</span>
                </div>
                <span className="font-code text-sm" style={{ color: 'var(--text-secondary)' }}>13,440 pts</span>
              </div>

              <div className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm font-bold w-6 text-center opacity-65">03</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">LX</div>
                  <span className="font-body text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>LEX_VOID</span>
                </div>
                <span className="font-code text-sm" style={{ color: 'var(--text-secondary)' }}>12,100 pts</span>
              </div>
            </div>
          </motion.div>

          {/* Cell E: Company Tags (Full Width) */}
          <motion.div variants={cardVariants} className={`md:col-span-12 p-6 flex flex-col md:flex-row items-center gap-6 ${cardBase}`}>
            <div className="font-code text-[11px] tracking-widest uppercase font-bold whitespace-nowrap" style={{ color: 'var(--accent-primary)' }}>Target Companies</div>
            <div className={`h-px w-full md:w-8 md:h-8 md:w-px hidden md:block ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />
            <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full">
              {companyLogos.map((company) => (
                <div
                  key={company.slug}
                  className="group flex flex-col items-center justify-center gap-2 opacity-85 hover:opacity-100 transition-opacity duration-300"
                  onMouseEnter={() => setHoveredCompany(company.slug)}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <div className="relative h-6 w-6">
                    <img
                      src={`https://cdn.simpleicons.org/${company.slug}/${isDark ? 'ffffff' : '475569'}`}
                      alt={`${company.name} logo`}
                      className={`absolute inset-0 h-6 w-6 object-contain transition-all duration-300 ${
                        hoveredCompany === company.slug ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                      }`}
                    />
                    <img
                      src={`https://cdn.simpleicons.org/${company.slug}/${getLogoColor(company)}`}
                      alt={`${company.name} brand color logo`}
                      className={`absolute inset-0 h-6 w-6 object-contain transition-all duration-300 ${
                        hoveredCompany === company.slug ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                    />
                  </div>
                  <span
                    className="font-code text-[9px] font-bold tracking-wider uppercase hidden md:block transition-colors"
                    style={{
                      color: hoveredCompany === company.slug ? `#${getLogoColor(company)}` : 'var(--text-secondary)',
                    }}
                  >
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PracticeSection;
