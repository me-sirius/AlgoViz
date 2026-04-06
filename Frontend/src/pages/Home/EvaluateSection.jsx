import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTheme } from '../../core/context/ThemeContext';
import { useNavigate } from 'react-router-dom';

/* 
 * Toggle this constant to switch between "Coming Soon" and "Live" modes.
 * Live mode enables the true CTA to take a test.
 */
const MOCK_TEST_LIVE = false;

const EvaluateSection = ({ sectionRefs }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const INITIAL_TIMER_SECONDS = 1 * 60 * 60 + 29 * 60 + 59;
  const [remainingSeconds, setRemainingSeconds] = useState(INITIAL_TIMER_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEditorHovered, setIsEditorHovered] = useState(false);

  useEffect(() => {
    if (!isTimerRunning) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isTimerRunning]);

  const startTimer = () => {
    if (remainingSeconds > 0) {
      setIsTimerRunning(true);
    }
  };

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Scroll animations for the entire section
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
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } 
    },
  };

  // The glassmorphic "browser" window
  const mockupContainerStyle = `relative w-full rounded-2xl md:rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 ${
    isDark 
      ? 'bg-[#11151C] border-[#2A2F38] shadow-[0_24px_68px_-22px_rgba(0,0,0,0.85)] hover:border-[#3B4250] hover:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)]' 
      : 'bg-white border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:border-slate-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.14)]'
  }`;

  const headerBg = isDark ? 'bg-[#171B22]' : 'bg-slate-50';
  const editorBg = isDark ? 'bg-[#0F1117]' : 'bg-white';
  const problemBg = isDark ? 'bg-[#181C23]' : 'bg-slate-50';
  const codeTextColor = isDark ? '#D4D4D4' : '#334155';
  const codeCommentColor = isDark ? '#6A9955' : '#64748B';
  const gutterTextColor = isDark ? '#6B7280' : '#64748B';
  const keywordColor = isDark ? '#C586C0' : '#7C3AED';
  const typeColor = isDark ? '#4FC1FF' : '#0369A1';
  const symbolColor = isDark ? '#D4D4D4' : '#334155';
  const stringColor = isDark ? '#CE9178' : '#B45309';

  const editorLines = [
    {
      indent: 0,
      content: (
        <>
          <span style={{ color: keywordColor }}>class</span>{' '}
          <span style={{ color: typeColor }}>Codec</span>{' '}
          <span style={{ color: symbolColor }}>{'{'}</span>
        </>
      ),
    },
    {
      indent: 0,
      content: <span style={{ color: keywordColor }}>public:</span>,
    },
    { indent: 0, content: '' },
    {
      indent: 1,
      content: <span style={{ color: codeCommentColor }}>{'// Encodes a tree to a single string.'}</span>,
    },
    {
      indent: 1,
      content: <>string serialize(TreeNode* root) {'{'}</>,
    },
    {
      indent: 2,
      content: (
        <>
          <span style={{ color: keywordColor }}>if</span> (!root) <span style={{ color: keywordColor }}>return</span>{' '}
          <span style={{ color: stringColor }}>"null,"</span>;
        </>
      ),
    },
    {
      indent: 2,
      content: (
        <>
          <span style={{ color: keywordColor }}>return</span> to_string(root-&gt;val) + <span style={{ color: stringColor }}>","</span> +
        </>
      ),
    },
    {
      indent: 3,
      content: <>serialize(root-&gt;left) +</>,
    },
    {
      indent: 3,
      content: <>serialize(root-&gt;right);</>,
    },
    { indent: 1, content: <>{'}'}</> },
    { indent: 0, content: '' },
    {
      indent: 1,
      content: <span style={{ color: codeCommentColor }}>{'// Decodes your encoded data to tree.'}</span>,
    },
    {
      indent: 1,
      content: <>TreeNode* deserialize(string data) {'{'}</>,
    },
    {
      indent: 2,
      revealOnHover: true,
      content: <span style={{ color: codeCommentColor }} className="italic">{'// Type your optimal solution here...'}</span>,
    },
    {
      indent: 2,
      content: (
        <span
          className="inline-block w-[2px] h-[18px] align-[-3px] animate-pulse"
          style={{ backgroundColor: codeTextColor }}
        />
      ),
    },
    { indent: 1, content: <>{'}'}</> },
    { indent: 0, content: <>{'};'}</> },
  ];

  return (
    <section 
      ref={(el) => { 
        containerRef.current = el;
        if (sectionRefs) sectionRefs.current[3] = el; 
      }} 
      className="w-full relative py-24 md:py-32 overflow-hidden" 
    >
      <motion.div 
        className="max-w-[1440px] mx-auto px-6 lg:px-12 will-change-transform"
        style={{ y: smoothY, opacity: sectionOpacity }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.header variants={itemVariants} className="mb-16 text-center flex flex-col items-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 shadow-sm ${
            isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <span className="font-code text-[11px] tracking-[0.2em] uppercase font-bold text-indigo-500">
              // stage 03
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter mb-4 leading-[1.1]"
              style={{ color: 'var(--text-primary)' }}>
            Test Yourself Under <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-text)' }}>Real Conditions.</span>
          </h2>
          <p className="font-body text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Same time limits. Same restrictions. Same pressure. A 1:1 simulation of real placement OAs.
          </p>
        </motion.header>

        {/* The OA Simulation Mockup */}
        <motion.div variants={itemVariants} className="max-w-5xl mx-auto w-full mb-12 relative group">
          {/* Subtle glow behind the mockup */}
          <div className="absolute -inset-1 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition overflow-hidden" style={{ background: 'var(--gradient-brand)', pointerEvents: 'none', zIndex: -1 }}></div>
          
          <div className={mockupContainerStyle} onMouseEnter={startTimer} onTouchStart={startTimer}>
            {/* Mockup Header */}
            <div className={`h-10 border-b flex items-center justify-between px-4 ${headerBg} ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-code text-[10px] tracking-widest uppercase font-bold px-2 py-1 rounded flex items-center gap-2 ${
                  isTimerRunning ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {formatTimer(remainingSeconds)}
                </span>
                <span className="hidden sm:inline font-code text-xs font-semibold" style={{ color: isDark ? '#9CA3AF' : 'var(--text-secondary)' }}>AlgoViz OA Environment</span>
              </div>
              <div className="hidden sm:block w-16"></div> {/* Spacer for centering header text */}
            </div>

            {/* Mockup Body: Split Pane */}
            <div className="flex flex-col md:flex-row h-auto md:h-[500px]">
              {/* Left Pane: Problem Description */}
                <div className={`w-full md:w-5/12 border-b md:border-b-0 md:border-r p-4 sm:p-6 overflow-y-auto relative max-h-[260px] sm:max-h-[300px] md:max-h-none ${problemBg} ${isDark ? 'border-[#2A2F38]' : 'border-slate-200'}`}>
                {/* Fade out bottom text */}
                  <div className={`hidden md:block absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t ${isDark ? 'from-[#181C23]' : 'from-slate-50'} to-transparent z-10`}></div>
                
                <h3 className="font-display font-bold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>1. Serialize and Deserialize Binary Tree</h3>
                <div className="flex gap-2 mb-6">
                  <span className="text-[10px] font-code font-bold uppercase tracking-widest px-2 py-1 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">Hard</span>
                  <span className={`text-[10px] font-code font-bold uppercase tracking-widest px-2 py-1 rounded ${isDark ? 'bg-[#252A33] text-slate-200 border border-[#323844]' : 'bg-slate-300/70 text-slate-700'}`}>Google</span>
                  <span className={`text-[10px] font-code font-bold uppercase tracking-widest px-2 py-1 rounded ${isDark ? 'bg-[#252A33] text-slate-200 border border-[#323844]' : 'bg-slate-300/70 text-slate-700'}`}>Binary Tree</span>
                </div>
                
                <div className="font-body text-sm space-y-4" style={{ color: 'var(--text-secondary)' }}>
                  <p>Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work...</p>
                    <pre className={`p-3 rounded-lg font-code text-[11px] ${isDark ? 'bg-[#11151C] border border-[#2A2F38]' : 'bg-white border border-slate-200'}`}>
                      <code className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>Input: root = [1,2,3,null,null,4,5]<br/>Output: [1,2,3,null,null,4,5]</code>
                  </pre>
                  <p>Constraints:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[13px]">
                    <li>The number of nodes in the tree is in the range [0, 10^4]</li>
                    <li>-1000 &lt;= Node.val &lt;= 1000</li>
                  </ul>
                </div>
              </div>

              {/* Right Pane: Code Editor */}
              <div className={`w-full md:w-7/12 flex flex-col h-[360px] sm:h-[410px] md:h-auto ${editorBg}`}>
                <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-code text-[11px] px-3 py-1 rounded font-semibold ${isDark ? 'text-slate-100 bg-[#20242C] border border-[#313742]' : 'text-slate-700 bg-slate-100 border border-slate-200'}`}>C++ 20</span>
                    <span className={`font-code text-[11px] px-2.5 py-1 rounded ${isDark ? 'text-slate-300 bg-[#171B22] border border-[#2A2F38]' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
                      main.cpp
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`font-code text-[10px] uppercase tracking-widest px-3 py-1 rounded border ${
                        isDark
                          ? 'text-slate-200 border-[#3A414D] bg-[#20242C]'
                          : 'text-slate-700 border-slate-300 bg-white'
                      }`}
                    >
                      Run
                    </button>
                    <button
                      type="button"
                      className={`font-code text-[10px] uppercase tracking-widest px-3 py-1 rounded border ${
                        isDark
                          ? 'text-black border-orange-400 bg-orange-400 hover:bg-orange-300'
                          : 'text-white border-orange-500 bg-orange-500 hover:bg-orange-400'
                      }`}
                    >
                      Submit
                    </button>
                  </div>
                </div>
                <div className="relative flex-grow overflow-hidden">
                  <div className={`absolute inset-y-0 left-0 w-[47px] border-r ${isDark ? 'bg-[#161A22] border-[#2B303B]' : 'bg-slate-100/85 border-slate-200'}`} />

                  <div
                    className="relative z-10 h-full overflow-hidden font-code text-[12px] leading-5 sm:text-[13px] md:text-[14px] md:leading-6"
                    onMouseEnter={() => {
                      setIsEditorHovered(true);
                      startTimer();
                    }}
                    onMouseLeave={() => setIsEditorHovered(false)}
                  >
                    <div className="w-full py-1.5">
                      {editorLines.map((line, idx) => (
                        <div
                          key={`editor-line-${idx + 1}`}
                          className={`grid grid-cols-[52px_minmax(0,1fr)] items-center h-5 ${
                            idx === 14
                              ? (isDark ? 'bg-[#1B2130]/70' : 'bg-amber-50/80')
                              : (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-100/70')
                          }`}
                        >
                          <span className={`pr-3 text-right select-none text-[11px] tabular-nums leading-5 ${idx === 14 ? 'font-semibold' : ''}`} style={{ color: gutterTextColor }}>
                            {idx + 1}
                          </span>
                          <span
                            className={`whitespace-pre transition-opacity duration-300 ${line.revealOnHover ? (isEditorHovered ? 'opacity-95' : 'opacity-0') : 'opacity-100'}`}
                            style={{
                              color: codeTextColor,
                              paddingLeft: `${line.indent * 12}px`,
                            }}
                          >
                            {line.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`px-4 py-1.5 border-t flex items-center justify-between font-code text-[10px] ${isDark ? 'border-[#2B303B] bg-[#141820] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <span>Ln 15, Col 5</span>
                  <span>Spaces: 2   UTF-8   C++20</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action and Features Area */}
        <motion.div variants={itemVariants} className="max-w-5xl mx-auto flex flex-col items-center px-2 sm:px-0">
          
          {/* Feature Pills */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-stretch sm:items-center gap-3 sm:gap-4 mb-10 w-full max-w-[320px] sm:max-w-none">
            <div className={`w-full sm:w-auto px-5 py-3 rounded-xl border flex items-center justify-center sm:justify-start gap-3 shadow-sm ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-slate-200'}`}>
              <span className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span className="font-code text-xs font-bold text-center sm:text-left" style={{ color: 'var(--text-primary)' }}>Real OA Problems</span>
            </div>
            <div className={`w-full sm:w-auto px-5 py-3 rounded-xl border flex items-center justify-center sm:justify-start gap-3 shadow-sm ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-slate-200'}`}>
              <span className="text-amber-500 bg-amber-500/10 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span className="font-code text-xs font-bold text-center sm:text-left" style={{ color: 'var(--text-primary)' }}>Strict Timed Environment</span>
            </div>
            <div className={`w-full sm:w-auto px-5 py-3 rounded-xl border flex items-center justify-center sm:justify-start gap-3 shadow-sm ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-slate-200'}`}>
              <span className="text-purple-500 bg-purple-500/10 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </span>
              <span className="font-code text-xs font-bold text-center sm:text-left" style={{ color: 'var(--text-primary)' }}>Comparative Analytics</span>
            </div>
          </div>

          {/* Call to Action Container */}
          <div className="flex flex-col items-center">
            {MOCK_TEST_LIVE ? (
              <button 
                onClick={() => navigate('/mock-test')} // Assuming route exists or will be added
                className="group relative px-8 py-4 font-display font-bold rounded-xl overflow-hidden shadow-[0_0_20px_rgba(76,215,246,0.2)] hover:shadow-[0_0_40px_rgba(76,215,246,0.4)] transition-all transform hover:-translate-y-1"
                style={{ background: 'var(--gradient-brand)', color: '#ffffff' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <div className="relative flex items-center gap-3">
                  <span className="text-lg">Take a Mock Test</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full max-w-[320px] sm:max-w-none">
                <span className="font-code text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-2"
                      style={{ 
                        borderColor: isDark ? 'rgba(255,255,255,0.24)' : 'rgba(15,23,42,0.18)',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                        color: 'var(--text-primary)'
                      }}>
                  🚀 Launching Soon
                </span>
                
                <div className={`w-full p-1 sm:pl-4 rounded-xl flex items-center justify-center sm:justify-between shadow-lg border ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-slate-200'}`}>
                  <span className="opacity-80 text-sm font-body mx-2 hidden sm:block delay-75 transition-opacity hover:opacity-100 cursor-text" style={{ color: 'var(--text-secondary)' }}>
                    Enter email for early access
                  </span>
                  <button className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-display font-bold text-sm bg-[var(--text-primary)] text-[var(--bg-primary)] hover:scale-105 transition-transform shadow-md sm:ml-auto">
                    Notify Me
                  </button>
                </div>
              </div>
            )}
          </div>

        </motion.div>
      </motion.div>
    </section>
  );
};

export default EvaluateSection;
