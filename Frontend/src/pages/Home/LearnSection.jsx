import React, { useRef, useState, useEffect, useContext } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTheme } from '../../core/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../core/context/UserContext';
import axios from 'axios';
import {
  SiAtlassian,
  SiFlipkart,
  SiGoldmansachs,
  SiGoogle,
  SiUber,
} from 'react-icons/si';
import { BiLogoAdobe, BiLogoAmazon, BiLogoMicrosoft } from 'react-icons/bi';
import {
  Briefcase,
  MapPin,
  GraduationCap,
  ThumbsUp,
  Eye,
  Clock,
  Tag,
} from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN;

// Company logo URL helper
const COMPANY_DOMAINS = {
  Google: "google.com", Microsoft: "microsoft.com", Amazon: "amazon.com",
  Apple: "apple.com", Meta: "meta.com", Netflix: "netflix.com",
  Samsung: "samsung.com", Flipkart: "flipkart.com", Uber: "uber.com",
  Adobe: "adobe.com", Oracle: "oracle.com", Goldman: "goldmansachs.com",
  "D.E. Shaw": "deshaw.com", "DE Shaw": "deshaw.com",
};

const getCompanyLogoUrl = (companyName) => {
  if (!companyName || !LOGO_DEV_TOKEN) return null;
  const domain = COMPANY_DOMAINS[companyName];
  if (domain) return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`;
  const normalized = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  if (normalized) return `https://img.logo.dev/${normalized}.com?token=${LOGO_DEV_TOKEN}&size=128&format=png`;
  return null;
};

// Difficulty color helper
const getDifficultyColor = (difficulty, isDark) => {
  const colors = {
    Hard: isDark ? 'text-rose-400' : 'text-rose-600',
    Medium: isDark ? 'text-amber-400' : 'text-amber-600',
    Easy: isDark ? 'text-emerald-400' : 'text-emerald-600',
  };
  return colors[difficulty] || colors.Medium;
};

const getDifficultyBg = (difficulty, isDark) => {
  const colors = {
    Hard: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200',
    Medium: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200',
    Easy: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200',
  };
  return colors[difficulty] || colors.Medium;
};

const LearnSection = ({ sectionRefs }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { setCurrentExperience } = useContext(AuthContext);

  // Fetch real experience data
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        // Fetch all experiences (high limit to ensure we get Gaurav Kumar's)
        const response = await axios.get(`${VITE_API_BASE_URL}/interviews/experiences?limit=100`);
        if (response.data.success && response.data.data.length > 0) {
          // Find Gaurav Kumar's D.E. Shaw experience specifically
          const gauravExp = response.data.data.find(
            (exp) => {
              // Normalize: strip dots, spaces, special chars for robust matching
              const normalizedCompany = (exp.company || '').toLowerCase().replace(/[.\s&,]/g, '');
              const companyMatch = normalizedCompany.includes('deshaw');
              const authorName = exp.userId?.name || exp.user?.name || '';
              const nameMatch = authorName.toLowerCase().includes('gaurav');
              return companyMatch && nameMatch;
            }
          );
          if (gauravExp) {
            setExperience(gauravExp);
          } else {
            // Fallback: try just D.E. Shaw (any variant)
            const deshawExp = response.data.data.find(
              (exp) => (exp.company || '').toLowerCase().replace(/[.\s&,]/g, '').includes('deshaw')
            );
            setExperience(deshawExp || response.data.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching experience for landing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperience();
  }, []);

  // Scroll animations for the section
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], [80, 0]);
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

  // Companies for the right-side grid
  const companies = [
    { name: 'Google', Icon: SiGoogle, brandColor: '#4285F4' },
    { name: 'Amazon', Icon: BiLogoAmazon, brandColor: '#FF9900' },
    { name: 'Microsoft', Icon: BiLogoMicrosoft, brandColor: '#5E5E5E', darkColor: '#E2E8F0' },
    { name: 'Atlassian', Icon: SiAtlassian, brandColor: '#0052CC' },
    { name: 'Goldman Sachs', Icon: SiGoldmansachs, brandColor: '#38529A', darkColor: '#C7D6FF' },
    { name: 'Uber', Icon: SiUber, brandColor: '#000000', darkColor: '#FFFFFF' },
    { name: 'Adobe', Icon: BiLogoAdobe, brandColor: '#FF0000' },
    { name: 'Flipkart', Icon: SiFlipkart, brandColor: '#2874F0' },
  ];

  // Extract data from the fetched experience — NO anonymous fallbacks
  // Debug log to see what the API returned
  if (experience) {
    console.log('[LearnSection] Fetched experience:', JSON.stringify(experience, null, 2));
  }

  const author = experience?.userId || experience?.user || {};
  const authorName = author?.name || '';
  const authorCollege = author?.college || '';
  const authorAvatar = author?.avatar || (authorName ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}` : '');
  const companyName = experience?.company || '';
  const role = experience?.role || '';
  const verdict = experience?.verdict || '';
  const difficulty = experience?.difficulty || '';
  const batch = experience?.batch || '';
  const experienceType = experience?.experienceType || '';
  const location = experience?.location;
  const department = experience?.department;
  const tags = experience?.tags || [];
  const roundCount = experience?.rounds?.length || 0;
  const upvoteCount = Array.isArray(experience?.upvotes) ? experience.upvotes.length : experience?.upvoteCount || 0;
  const viewCount = experience?.viewCount || experience?.viewedBy?.length || 0;
  const createdAt = experience?.createdAt;
  const companyLogoUrl = experience?.logoURL || getCompanyLogoUrl(companyName);


  // Get first round description as snippet
  const snippet = experience?.rounds?.[0]?.description
    ? experience.rounds[0].description.replace(/^#+\s*/gm, '').replace(/[*_`]/g, '').substring(0, 200) + '...'
    : 'Loading interview experience...';

  const handleCardClick = () => {
    if (experience) {
      localStorage.setItem("currentExperience", JSON.stringify(experience));
      setCurrentExperience(experience);
      navigate(`/experience/${experience._id}`);
    } else {
      navigate('/interview-experience');
    }
  };

  return (
    <section 
      ref={(el) => { 
        containerRef.current = el;
        if (sectionRefs) sectionRefs.current[4] = el; 
      }} 
      className="w-full relative py-20 md:py-32 overflow-hidden"
    >
      {/* Background warm glow */}
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'opacity-0' : 'opacity-10'}`}
           style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(236,72,153,0.3) 100%)' }}>
      </div>

      <motion.div 
        className="max-w-[1440px] mx-auto px-6 lg:px-12 will-change-transform relative z-10"
        style={{ y: smoothY, opacity: sectionOpacity }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.header variants={itemVariants} className="mb-16 md:mb-20 text-center flex flex-col items-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 shadow-sm ${
            isDark ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-fuchsia-50/80 border-fuchsia-100'
          }`}>
            <span className="font-code text-[11px] tracking-[0.2em] uppercase font-bold text-fuchsia-500">
              // stage 04
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter mb-4 leading-[1.1]"
              style={{ color: 'var(--text-primary)' }}>
            Learn From Those <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500">Who Made It.</span>
          </h2>
          <p className="font-body text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Read through 99+ verified, real on-campus and off-campus interview experiences to know exactly what to study.
          </p>
        </motion.header>

        {/* Main Content Split */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch mb-16">
          
          {/* Left Side: The Experience Card — Now fetched from real data */}
          <motion.div variants={itemVariants} className="flex-1 w-full lg:w-1/2 relative group">
            {/* Inner Glow offset */}
            <div className="absolute -inset-2 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" 
                 style={{ background: 'linear-gradient(to right, rgba(168,85,247,0.5), rgba(236,72,153,0.5))', zIndex: -1 }}></div>
            
            <div 
              onClick={handleCardClick}
              className={`h-full p-8 rounded-[1.5rem] border shadow-2xl transition-all flex flex-col cursor-pointer ${
                isDark 
                  ? 'bg-gradient-to-br from-[#12101F] to-[#0A0B14] border-white/5 hover:border-purple-500/30 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]' 
                  : 'bg-gradient-to-br from-white to-purple-50/30 border-slate-200 hover:border-purple-300 shadow-[0_20px_40px_-15px_rgba(100,50,200,0.1)]'
              }`}
            >
              {loading ? (
                /* Skeleton Loading State */
                <div className="animate-pulse flex flex-col gap-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                      <div>
                        <div className={`h-5 w-32 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'} mb-2`}></div>
                        <div className={`h-3 w-20 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                      </div>
                    </div>
                    <div className={`h-6 w-20 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                  </div>
                  <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                  <div className="space-y-3 flex-grow">
                    <div className={`h-4 w-full rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                    <div className={`h-4 w-5/6 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                    <div className={`h-4 w-4/6 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header of card */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {/* Company Logo */}
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-lg overflow-hidden shrink-0 ${
                        isDark ? 'bg-[#1e1e22] border-white/10' : 'bg-white border-slate-200'
                      }`}>
                        {companyLogoUrl && !logoError ? (
                          <img
                            src={companyLogoUrl}
                            alt={companyName}
                            className="w-9 h-9 object-contain"
                            onError={() => setLogoError(true)}
                          />
                        ) : (
                          <span className={`text-xl font-black ${
                            verdict === 'Selected' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {companyName?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
                          {companyName}
                        </h3>
                        <p className="font-code text-xs opacity-85" style={{ color: 'var(--text-secondary)' }}>
                          {role}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`font-code text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        verdict === 'Selected'
                          ? isDark ? 'bg-green-500/40 text-green-300' : 'bg-green-200 text-green-600'
                          : isDark ? 'bg-rose-500/40 text-rose-300' : 'bg-rose-200 text-rose-600'
                      }`}>
                        {verdict}
                      </span>
                      <span className={`font-code text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
                        getDifficultyBg(difficulty, isDark)
                      } ${getDifficultyColor(difficulty, isDark)}`}>
                        {difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info Row */}
                  <div className={`flex flex-wrap items-center gap-3 mb-5 pb-5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${
                      isDark ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-gray-600'
                    }`}>
                      <GraduationCap size={12} className="shrink-0" />
                      {batch}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${
                      isDark ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {experienceType}
                    </span>
                    {location && location !== 'Not Specified' && (
                      <span className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <MapPin size={11} /> {location}
                      </span>
                    )}
                    {department && (
                      <span className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Briefcase size={11} /> {department}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${
                      isDark ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-50 text-cyan-600'
                    }`}>
                      {roundCount} Rounds
                    </span>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isDark ? 'bg-fuchsia-500/10 text-fuchsia-300' : 'bg-fuchsia-50 text-fuchsia-600'
                        }`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Snippet */}
                  <div className="relative font-body text-[15px] leading-relaxed italic flex-grow" style={{ color: 'var(--text-secondary)' }}>
                    <span className={`text-6xl absolute -top-6 -left-4 font-serif opacity-20 ${isDark ? 'text-fuchsia-400' : 'text-fuchsia-300'}`}>"</span>
                    {snippet}
                  </div>

                  {/* Footer of card */}
                  <div className={`mt-6 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    {/* Author row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className={`w-8 h-8 rounded-full border ${isDark ? 'bg-[#252834] border-white/10' : 'bg-gray-100 border-gray-200'}`}
                        />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {authorName}
                          </p>
                          <p className="text-[11px] opacity-75" style={{ color: 'var(--text-secondary)' }}>
                            {authorCollege}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-4 text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} /> {upvoteCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {viewCount}
                        </span>
                        {createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className={`w-full py-3 rounded-lg font-display text-sm font-bold flex justify-center items-center gap-2 transition-all ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}>
                      Read Full Experience
                      <svg className="w-4 h-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Right Side: Featured Companies Grid */}
          <motion.div variants={itemVariants} className="flex-1 w-full lg:w-1/2 flex flex-col justify-center">
            <h3 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Target Top Tech</h3>
            <p className="font-body mb-8" style={{ color: 'var(--text-secondary)' }}>
              Filter authentic experiences by company to perfectly prepare for upcoming drives.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {companies.map((company) => {
                const Icon = company.Icon;
                const logoColor = isDark && company.darkColor ? company.darkColor : company.brandColor;

                return (
                <div key={company.name} className={`group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isDark 
                    ? 'bg-[var(--bg-elevated)] border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 hover:-translate-y-1' 
                    : 'bg-white border-slate-200 hover:border-purple-400/40 hover:bg-purple-50 hover:-translate-y-1 hover:shadow-lg'
                }`}>
                  <div className="w-10 h-10 mb-3 opacity-95 transition-all duration-300 group-hover:opacity-100 flex items-center justify-center">
                    <Icon
                      className="w-9 h-9 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: logoColor }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="font-code text-[10px] font-bold tracking-widest uppercase opacity-90 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-primary)' }}>
                    {company.name}
                  </span>
                </div>
              )})}
              
              {/* "+ More" tile */}
              <div className={`group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed transition-all duration-300 cursor-pointer ${
                isDark 
                  ? 'bg-transparent border-white/20 hover:border-white/50 hover:bg-white/5' 
                  : 'bg-transparent border-slate-300 hover:border-slate-500 hover:bg-slate-50'
              }`}>
                <span className="font-display text-2xl font-bold opacity-90 group-hover:opacity-100" style={{ color: 'var(--text-primary)' }}>99+</span>
                <span className="font-code text-[9px] font-bold tracking-widest uppercase opacity-75 group-hover:opacity-100 mt-1" style={{ color: 'var(--text-primary)' }}>
                  Experiences
                </span>
              </div>
            </div>
          </motion.div>
          
        </div>

        {/* Explore All CTA */}
        <motion.div variants={itemVariants} className="flex justify-center mt-6">
          <button 
            onClick={() => navigate('/interview-experience')}
            className={`px-8 py-4 rounded-xl font-display font-bold shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-3 ${
              isDark 
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                : 'bg-[var(--text-primary)] text-[var(--bg-secondary)] shadow-slate-300/50'
            }`}
          >
            Browse All Experiences
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default LearnSection;
