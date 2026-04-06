import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTheme } from '../../core/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Star, Target, Users, Calendar } from 'lucide-react';

/* --- Mentor Card Component --- */
const MentorCard = ({ mentor, index, isDark, isActive = false }) => {
  // Stagger the floating animation slightly based on index
  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      rotate: [0, index === 0 ? -1 : 1, 0],
      transition: {
        duration: 4 + index,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.5
      }
    }
  };

  return (
    <motion.div
      variants={floatVariants}
      animate="animate"
      className={`relative p-6 rounded-2xl border backdrop-blur-md shadow-2xl transition-colors mx-auto ${
        isDark 
          ? 'bg-gradient-to-br from-[#1A1A24]/90 to-[#0A0B14]/90 border-amber-500/20 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.15)] hover:border-amber-500/50' 
          : 'bg-gradient-to-br from-white/90 to-amber-50/90 border-amber-200 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.2)] hover:border-amber-400'
      }`}
      style={{
        width: 'min(280px, 82vw)',
        zIndex: 3 - index,
        boxShadow: isActive
          ? (isDark
            ? '0 18px 60px -20px rgba(245,158,11,0.45)'
            : '0 18px 50px -20px rgba(245,158,11,0.35)')
          : undefined,
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar Placeholder */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${
          isDark ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-amber-100 text-amber-700 border border-amber-200'
        }`}>
          {mentor.initial}
        </div>
        <div>
          <h4 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
            {mentor.name}
          </h4>
          <p className="font-code text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {mentor.role} @ <span className="font-bold text-amber-500">{mentor.company}</span>
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm mb-4">
        <div className="flex items-center gap-1.5 font-bold text-amber-500">
          <Star className="w-4 h-4 fill-amber-500" />
          {mentor.rating} <span className="font-code text-[10px] font-normal opacity-80 ml-0.5 mt-0.5" style={{ color: 'var(--text-primary)' }}>({mentor.reviews})</span>
        </div>
        <div className={`font-code text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${
          isDark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
        }`}>
          Top Rated
        </div>
      </div>

      <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <button className={`w-full py-2.5 rounded-lg font-code text-[11px] font-bold tracking-wider uppercase transition-colors ${
          isDark ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
        }`}>
          View Profile
        </button>
      </div>
    </motion.div>
  );
};


const GuidedSection = ({ sectionRefs }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [activeMentor, setActiveMentor] = useState(null);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const smoothY = useSpring(sectionY, { stiffness: 80, damping: 25 });
  const isSpread = activeMentor !== null;

  const desktopCollapsed = [
    { x: -120, y: -90, rotate: -5, scale: 1, z: 30 },
    { x: 0, y: 0, rotate: 0, scale: 1, z: 40 },
    { x: 120, y: 90, rotate: 5, scale: 1, z: 20 },
  ];

  const desktopSpread = [
    { x: -230, y: -145, rotate: -8, scale: 1, z: 40 },
    { x: 0, y: 0, rotate: 0, scale: 1, z: 50 },
    { x: 230, y: 145, rotate: 8, scale: 1, z: 30 },
  ];

  const handleCardTap = (idx) => {
    setActiveMentor((prev) => (prev === idx ? null : idx));
  };

  const mentors = [
    { initial: 'S', name: 'Software Eng.', role: 'SDE II', company: 'Amazon', rating: '5.0', reviews: '142' },
    { initial: 'R', name: 'Senior Dev', role: 'SWE', company: 'Google', rating: '4.9', reviews: '89' },
    { initial: 'A', name: 'Tech Lead', role: 'SDE III', company: 'Microsoft', rating: '4.9', reviews: '210' },
  ];

  const features = [
    { icon: <Target className="w-5 h-5" />, title: 'Targeted Prep', desc: 'Company-specific interview patterns.' },
    { icon: <Users className="w-5 h-5" />, title: 'Real Feedback', desc: '1:1 actionable review of your code.' },
  ];

  return (
    <section 
      ref={(el) => { 
        containerRef.current = el;
        if (sectionRefs) sectionRefs.current[5] = el; 
      }} 
      className="w-full relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background Ambient Glows */}
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[140px] pointer-events-none ${isDark ? 'opacity-0' : 'opacity-[0.15]'}`}
           style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.8) 0%, rgba(202,138,4,0.3) 100%)' }}>
      </div>

      {/* Grid Pattern Background for a technical feel */}
       <div className={`absolute inset-0 pointer-events-none ${isDark ? 'opacity-0 grid-overlay-dark' : 'opacity-20 grid-overlay-light'}`}
           style={{
             backgroundImage: `radial-gradient(${isDark ? 'var(--text-secondary)' : 'var(--text-secondary)'} 1px, transparent 1px)`,
             backgroundSize: '32px 32px',
             maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
             WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
           }}
      />

      <motion.div 
        className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10"
        style={{ y: smoothY, opacity: sectionOpacity }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Side: Copy & CTA */}
          <div className="flex-1 text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 shadow-sm ${
              isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="font-code text-[11px] tracking-[0.2em] uppercase font-bold text-amber-500">
                // stage 05
              </span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter mb-4 leading-[1.1]"
                style={{ color: 'var(--text-primary)' }}>
              Don't Walk <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Alone.</span>
            </h2>
            
            <p className="font-body text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8" 
               style={{ color: 'var(--text-secondary)' }}>
              Stop guessing if you are ready. Get directly mentored, review your resume, and take highly standardized mock interviews with engineers actively working at top tech companies.
            </p>

            {/* Micro Features */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6 lg:gap-8 mb-10">
              {features.map((feat, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {feat.icon}
                  </div>
                  <h5 className="font-display font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{feat.title}</h5>
                  <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/mentor')}
                className="px-8 py-4 rounded-xl font-display font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg w-full sm:w-auto text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Calendar className="w-5 h-5" />
                Book 1:1 Session
              </button>
              
              <button 
                onClick={() => navigate('/mock-test')}
                className={`px-8 py-4 rounded-xl font-display font-bold flex items-center justify-center gap-3 transition-all hover:-translate-y-1 w-full sm:w-auto border ${
                  isDark 
                    ? 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white' 
                    : 'border-slate-300 hover:border-slate-400 bg-transparent text-slate-800'
                }`}
              >
                Mock Interviews
              </button>
            </div>
          </div>

          {/* Right Side: Floating Mentor Cards */}
          <div className="flex-1 relative w-full h-auto lg:h-[500px] flex items-center justify-center perspective-1000 mt-10 lg:mt-0">
            {/* Center glow behind cards */}
            <div className="absolute inset-0 bg-amber-500/5 blur-[80px] rounded-full" />

            {/* Mobile / Tablet Stack */}
            <div
              className="relative w-full max-w-[360px] flex flex-col items-center py-4 lg:hidden"
              onMouseLeave={() => setActiveMentor(null)}
            >
              {mentors.map((mentor, idx) => (
                <motion.div
                  key={`mobile-${idx}`}
                  className="relative w-full"
                  style={{ zIndex: isSpread ? 30 - idx : 10 - idx }}
                  animate={{
                    marginTop: idx === 0 ? 0 : (isSpread ? 16 : -88),
                    x: isSpread ? (idx - 1) * 8 : 0,
                    rotate: isSpread ? (idx - 1) * 1.5 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  onHoverStart={() => setActiveMentor(idx)}
                  onTap={() => handleCardTap(idx)}
                  onClick={() => handleCardTap(idx)}
                >
                  <MentorCard mentor={mentor} index={idx} isDark={isDark} isActive={activeMentor === idx} />
                </motion.div>
              ))}
            </div>

            {/* Desktop Stack */}
            <div
              className="relative hidden lg:block w-full max-w-[620px] h-full"
              onMouseLeave={() => setActiveMentor(null)}
            >
              {mentors.map((mentor, idx) => {
                const target = isSpread ? desktopSpread[idx] : desktopCollapsed[idx];

                return (
                  <motion.div
                    key={`desktop-${idx}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ zIndex: target.z }}
                    animate={{
                      x: target.x,
                      y: target.y,
                      rotate: target.rotate,
                      scale: target.scale,
                    }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                    onHoverStart={() => setActiveMentor(idx)}
                    onTap={() => handleCardTap(idx)}
                    onClick={() => handleCardTap(idx)}
                  >
                    <MentorCard mentor={mentor} index={idx} isDark={isDark} isActive={activeMentor === idx} />
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default GuidedSection;
