import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Briefcase,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

// ============================================================================
// COMPONENT: FILTER PILL
// ============================================================================
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border cursor-pointer
      ${active
        ? "bg-white text-black border-white shadow-md shadow-white/10"
        : "bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white"
      }
    `}
  >
    {label}
  </button>
);

// ============================================================================
// COMPONENT: MENTOR CARD
// ============================================================================
const MentorCard = ({ mentor, onClick }) => {
  const companyColors = {
    Amazon: "from-orange-500/20 to-amber-500/5",
    Samsung: "from-blue-600/20 to-cyan-500/5",
    "D. E. Shaw": "from-emerald-600/20 to-teal-500/5",
    Mastercard: "from-red-600/20 to-orange-500/5",
    default: "from-purple-600/20 to-blue-500/5"
  };

  const companyDomains = {
    Amazon: "amazon.com",
    Samsung: "samsung.com",
    "D. E. Shaw": "deshaw.com",
    Mastercard: "mastercard.com",
    Google: "google.com"
  };

  const getCompanyDomain = (company) => {
    if (!company) return null;
    return companyDomains[company] || `${company.toLowerCase().replace(/\s/g, "")}.com`;
  };

  // Prefer Google's favicon service (very reliable), fallback to Clearbit.
  const getCompanyLogoUrl = (company) => {
    const domain = getCompanyDomain(company);
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  };

  const bgGradient = companyColors[mentor.company] || companyColors.default;
  const companyDomain = getCompanyDomain(mentor.company);
  const companyLogoUrl = getCompanyLogoUrl(mentor.company);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group relative bg-[#151517] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all cursor-pointer"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-4">
            <div className="relative">
              <img
                src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
                alt={mentor.name}
                className="w-18 h-18 rounded-2xl border-2 border-white/10 shadow-xl bg-[#252526] object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                {mentor.name}
              </h3>
              <p className="text-sm text-gray-400 font-medium mb-2">{mentor.role}</p>

              {/* Company with Logo */}
              <div className="flex items-center gap-2">
                <img
                  src={companyLogoUrl}
                  alt={mentor.company}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback && companyDomain) {
                      img.dataset.fallback = "1";
                      img.src = `https://logo.clearbit.com/${companyDomain}`;
                      return;
                    }
                    img.style.display = "none";
                  }}
                />
                <span className="text-lg font-bold text-white tracking-wide">
                  {mentor.company}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm font-bold mb-0.5">
              <Star size={12} fill="currentColor" /> {mentor.rating || 5.0}
            </div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Rating</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
            <div className="text-white text-sm font-bold mb-0.5">
              {mentor.sessionCount || mentor.sessions || 0}+
            </div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Sessions</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
            <div className="text-white text-sm font-bold mb-0.5">
              {mentor.yearsExperience || mentor.experience || "1+"}
            </div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Exp</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 h-[26px] overflow-hidden">
          {(mentor.expertise || mentor.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="relative h-12 overflow-hidden rounded-xl">
          {/* Default State */}
          <div className="absolute inset-0 flex items-center justify-between px-4 bg-white/5 border border-white/5 group-hover:-translate-y-full transition-transform duration-300">
            <span className="text-sm font-medium text-gray-400">Session Fee</span>
            <span className="text-lg font-bold text-white">₹{mentor.price || 500}</span>
          </div>

          {/* Hover State */}
          <button className="absolute inset-0 w-full h-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer">
            Book Session <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
const MockInterviewPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);

  const topCompanies = ["All", "Amazon", "Samsung", "D. E. Shaw", "Mastercard"];

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/mentor/all`);
        setMentors(res.data.mentors || []);
      } catch (err) {
        console.error("Failed to fetch mentors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(m => {
    const matchesCompany = selectedCompany === "All" || m.company === selectedCompany;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCompany && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium animate-pulse">Loading top mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-gray-100 font-sans selection:bg-cyan-500/30">

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-radial from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-16 relative">
        {/* Top Row: Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Center Content: Title */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider"
          >
            <Briefcase size={14} className="text-cyan-400" /> Premium Mentorship
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3"
          >
            Crack Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              Dream Company.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base text-gray-400 max-w-xl mx-auto"
          >
            Book 1:1 mock interviews with verified seniors who have cleared these interviews.
          </motion.p>
        </div>

        {/* COMMAND BAR (Search + Filter) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky top-20 z-40 mb-10"
        >
          <div className="bg-[#151517]/80 backdrop-blur-xl border border-white/10 p-2 pl-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-3 max-w-4xl mx-auto">
            <div className="flex-1 flex items-center gap-3 w-full">
              <Search size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-full h-10 text-base"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto max-w-full md:max-w-md pb-1 md:pb-0 hide-scrollbar px-1">
              {topCompanies.map(company => (
                <FilterPill
                  key={company}
                  label={company}
                  active={selectedCompany === company}
                  onClick={() => setSelectedCompany(company)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* MENTOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor._id || mentor.id}
                mentor={mentor}
                onClick={() => navigate(`/book-mock-interview/${mentor._id || mentor.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                <Search size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No mentors found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MockInterviewPage;
