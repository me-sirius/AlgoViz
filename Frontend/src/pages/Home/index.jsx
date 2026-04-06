import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useTheme } from '../../core/context/ThemeContext';
import { AuthContext } from '../../core/context/UserContext';
import InitialLoader from '../../components/InitialLoader';
import Lenis from '@studio-freight/lenis';
import { ArrowUp } from 'lucide-react';

// Section components
import HeroSection from './HeroSection';
import UnderstandSection from './UnderstandSection';
import PracticeSection from './PracticeSection';
import AlgorithmModal from './AlgorithmModal';
import EvaluateSection from './EvaluateSection';
import LearnSection from './LearnSection';
import GuidedSection from './GuidedSection';
import Footer from './Footer';

/* ─────────────────────────────────────────────────────────
   Journey Progress Indicator
   A vertical line + stage dots tracking scroll through sections
   ───────────────────────────────────────────────────────── */
const JourneyProgress = ({ activeStage, isDark }) => {
  const stages = [
    { label: '01', name: 'Understand', id: 'understand' },
    { label: '02', name: 'Practice', id: 'practice' },
    { label: '03', name: 'Evaluate', id: 'evaluate' },
    { label: '04', name: 'Learn', id: 'learn' },
    { label: '05', name: 'Guided', id: 'guided' },
  ];

  // If no stage is active (e.g. at Hero), target is 0.
  // Otherwise, calculate the percentage of the line to fill.
  const targetPercent = activeStage === null ? 0 : (activeStage / (stages.length - 1)) * 100;
  
  const smoothPercent = useSpring(targetPercent, { stiffness: 90, damping: 20 });
  const lineHeight = useTransform(smoothPercent, v => `${v}%`);

  const handleDotClick = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { duration: 1.2, offset: -60 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center"
      style={{ height: '300px' }}
    >
      {/* Background track */}
      <div className="absolute inset-0 w-[2px] left-1/2 -translate-x-1/2 rounded-full"
        style={{ background: isDark ? 'rgba(114,130,153,0.32)' : 'rgba(15,23,42,0.16)' }}
      />
      {/* Active fill line */}
      <motion.div
        className="absolute top-0 w-[2px] left-1/2 -translate-x-1/2 rounded-full"
        style={{
          height: lineHeight,
          background: 'var(--gradient-brand)',
          boxShadow: '0 0 10px var(--accent-glow)',
        }}
      />
      
      {/* Stage dots */}
      {stages.map((stage, i) => {
        const isActiveOrPassed = activeStage !== null && activeStage >= i;
        const isCurrentlyActive = activeStage === i;
        
        return (
          <motion.div
            key={i}
            className="absolute flex items-center justify-end gap-3 right-0 group cursor-pointer"
            style={{
              top: `${(i / (stages.length - 1)) * 100}%`,
              transform: 'translateY(-50%)'
            }}
            onClick={() => handleDotClick(stage.id)}
          >
            <span className={`font-code text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
              isCurrentlyActive 
                ? 'opacity-100 font-bold translate-x-0' 
                : 'opacity-0 translate-x-2 group-hover:opacity-85 group-hover:translate-x-0'
            }`}
              style={{ color: isCurrentlyActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              {stage.name}
            </span>
            <div
              className={`w-3 h-3 rounded-full border transition-all duration-500 scale-100 group-hover:scale-125`}
              style={{
                borderColor: isActiveOrPassed ? 'var(--accent-primary)' : (isDark ? 'rgba(255,255,255,0.38)' : 'rgba(15,23,42,0.24)'),
                background: isCurrentlyActive ? 'var(--accent-primary)' : (isDark ? 'var(--bg-primary)' : 'var(--bg-primary)'),
                boxShadow: isCurrentlyActive ? '0 0 12px var(--accent-glow)' : 'none'
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   ScrollSection Wrapper
   Wraps each section in scroll-linked transform logic:
   - Parallax Y offset
   - Scale down as you leave
   - Opacity fade at edges
   ───────────────────────────────────────────────────────── */
const ScrollSection = ({
  children,
  id,
  parallaxIntensity = 0,
  scaleOnExit = false,
  stageIndex = null,
  onInView = null,
  disableOpacityFade = false,
}) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Track if this massive section is roughly in the center of the viewport
  const isInView = useInView(sectionRef, { margin: "-40% 0px -40% 0px" });

  useEffect(() => {
    if (isInView && onInView && stageIndex !== null) {
      onInView(stageIndex);
    }
  }, [isInView, stageIndex, onInView]);

  // Parallax — subtle vertical offset tied to scroll
  const y = useTransform(scrollYProgress, [0, 1], [parallaxIntensity, -parallaxIntensity]);

  // Always create transforms, then decide whether to use them.
  // This keeps hook order stable across prop/theme changes.
  const scaleTransform = useTransform(scrollYProgress, [0.5, 1], [1, 0.96]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0.4, 1, 1, 0.6]);

  // Scale — section subtly shrinks as you scroll past
  const scale = scaleOnExit ? scaleTransform : 1;

  // Opacity — fade at very top and bottom edges
  const opacity = disableOpacityFade ? 1 : opacityTransform;

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.section
      ref={sectionRef}
      className="relative will-change-transform"
      style={{
        y: smoothY,
        scale,
        opacity,
      }}
      id={id}
    >
      {children}
    </motion.section>
  );
};

/* ─────────────────────────────────────────────────────────
   Section Transition Connector
   A visual "breath" between sections — gradient fade + divider
   ───────────────────────────────────────────────────────── */
const SectionTransition = ({ isDark, fromColor, toColor }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const lineWidth = useTransform(scrollYProgress, [0.3, 0.7], ['0%', '40%']);
  const lineOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

  if (isDark) {
    return <div ref={ref} className="h-24" aria-hidden="true" />;
  }

  return (
    <div ref={ref} className="relative h-32 flex items-center justify-center overflow-hidden">
      {/* Gradient breath */}
      <div className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent, ${isDark ? 'rgba(76,215,246,0.02)' : 'rgba(0,141,165,0.01)'}, transparent)`,
        }}
      />
      {/* Expanding center line */}
      <motion.div
        className="h-[1px] rounded-full"
        style={{
          width: lineWidth,
          opacity: lineOpacity,
          background: 'var(--gradient-brand)',
          boxShadow: '0 0 12px var(--accent-glow)',
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   LandingPage — Scroll-Driven Storytelling Engine
   ───────────────────────────────────────────────────────── */
const LandingPage = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = React.useContext(AuthContext);
  const isDark = theme === 'dark';

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState(null);

  // Scroll state
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [scrollHover, setScrollHover] = useState(false);

  // Refs
  const topicsRef = useRef(null);
  const sectionRefs = useRef([]);
  const containerRef = useRef(null);

  // Active stage tracking for Scrollytelling JourneyProgress
  const [activeStage, setActiveStage] = useState(null);

  // Overall page scroll progress
  const { scrollYProgress } = useScroll();

  // ── Lenis smooth scroll ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Expose lenis for scroll-to functionality
    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // ── Scroll handlers ──
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Body scroll lock when modal open ──
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = 'unset';
      if (window.__lenis) window.__lenis.start();
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (window.__lenis) window.__lenis.start();
    };
  }, [isModalOpen]);

  // ── ESC to close modal ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen]);

  // ── Handlers ──
  const scrollToTopics = () => {
    topicsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openModal = (topic) => {
    setModalTopic(topic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTopic(null);
  };

  return (
    <>
      <InitialLoader />
      <div
        ref={containerRef}
        className={`min-h-screen relative overflow-x-clip transition-colors duration-500 ${
          isDark
            ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
            : 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
        }`}
      >
        {/* Journey Progress Indicator (right side) */}
        <JourneyProgress activeStage={activeStage} isDark={isDark} />

        {/* ── HERO (no parallax wrapper — it handles its own motion) ── */}
        <ScrollSection
          id="hero"
          parallaxIntensity={40}
          scaleOnExit={true}
          stageIndex={null}
          onInView={() => setActiveStage(null)}
          disableOpacityFade={isDark}
        >
          <HeroSection
            scrollToTopics={scrollToTopics}
            sectionRefs={sectionRefs}
          />
        </ScrollSection>

        {/* ── Transition breath ── */}
        <SectionTransition isDark={isDark} />

        {/* ── STAGE 01: UNDERSTAND ── */}
        <ScrollSection
          id="understand"
          parallaxIntensity={30}
          stageIndex={0}
          onInView={setActiveStage}
          disableOpacityFade={isDark}
        >
          <UnderstandSection
            topicsRef={topicsRef}
            sectionRefs={sectionRefs}
            openModal={openModal}
          />
        </ScrollSection>

        {/* ── Transition breath ── */}
        <SectionTransition isDark={isDark} />

        {/* ── STAGE 02: PRACTICE ── */}
        <ScrollSection
          id="practice"
          parallaxIntensity={25}
          stageIndex={1}
          onInView={setActiveStage}
          disableOpacityFade={isDark}
        >
          <PracticeSection sectionRefs={sectionRefs} />
        </ScrollSection>

        {/* ── Transition breath ── */}
        <SectionTransition isDark={isDark} />

        {/* ── STAGE 03: EVALUATE ── */}
        <ScrollSection
          id="evaluate"
          parallaxIntensity={20}
          stageIndex={2}
          onInView={setActiveStage}
          disableOpacityFade={isDark}
        >
          <EvaluateSection sectionRefs={sectionRefs} />
        </ScrollSection>

        {/* ── Transition breath ── */}
        <SectionTransition isDark={isDark} />

        {/* ── STAGE 04: LEARN ── */}
        <ScrollSection
          id="learn"
          parallaxIntensity={15}
          stageIndex={3}
          onInView={setActiveStage}
          disableOpacityFade={isDark}
        >
          <LearnSection sectionRefs={sectionRefs} />
        </ScrollSection>

        {/* ── Transition breath ── */}
        <SectionTransition isDark={isDark} />

        {/* ── STAGE 05: GUIDED ── */}
        <ScrollSection
          id="guided"
          parallaxIntensity={10}
          stageIndex={4}
          onInView={setActiveStage}
          disableOpacityFade={isDark}
        >
          <GuidedSection sectionRefs={sectionRefs} />
        </ScrollSection>

        <Footer />

        {/* Algorithm Topic Modal */}
        <AlgorithmModal
          isOpen={isModalOpen}
          onClose={closeModal}
          modalTopic={modalTopic}
        />

        {/* Scroll-to-top button */}
        {showScrollToTop && (
          <>
            <div
              className="hidden md:block fixed left-0 top-0 h-screen w-20 z-40"
              onMouseEnter={() => setScrollHover(true)}
              onMouseLeave={() => setScrollHover(false)}
              style={{ pointerEvents: 'auto' }}
            />
            <div className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 z-41">
              <button
                onClick={() => { scrollToTop(); setScrollHover(false); }}
                onMouseEnter={() => setScrollHover(true)}
                onMouseLeave={() => setScrollHover(false)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                  transition-all duration-300 cursor-pointer
                  ${scrollHover ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                  text-white shadow-xl hover:scale-110 active:scale-95`}
                style={{
                  background: 'var(--gradient-brand)',
                  pointerEvents: scrollHover ? 'auto' : 'none',
                }}
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-6 h-6 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider">Top</span>
              </button>
            </div>

            <button
              onClick={scrollToTop}
              className="md:hidden fixed bottom-5 right-5 z-41 flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-xl active:scale-95"
              style={{ background: 'var(--gradient-brand)' }}
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default LandingPage;
