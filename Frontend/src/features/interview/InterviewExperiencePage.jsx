import React, { useState, useContext, useEffect } from "react";
import { useTheme } from "../../core/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../core/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Plus,
  Briefcase,
  ThumbsUp,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  Eye,
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  GraduationCap,
  Tag,
} from "lucide-react";
import Alert from "../../components/Alert";
import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN;

// Company logo URL helper
const COMPANY_DOMAINS = {
  Google: "google.com", Microsoft: "microsoft.com", Amazon: "amazon.com",
  Apple: "apple.com", Meta: "meta.com", Netflix: "netflix.com",
  Samsung: "samsung.com", eBay: "ebay.com", Mastercard: "mastercard.com",
  Flipkart: "flipkart.com", Uber: "uber.com", Adobe: "adobe.com",
  Oracle: "oracle.com", Intel: "intel.com", IBM: "ibm.com",
  Cisco: "cisco.com", Infosys: "infosys.com", TCS: "tcs.com",
  Wipro: "wipro.com", Accenture: "accenture.com", Deloitte: "deloitte.com",
  Goldman: "goldmansachs.com", Morgan: "morganstanley.com", JPMorgan: "jpmorgan.com",
  PayPal: "paypal.com", Razorpay: "razorpay.com", Swiggy: "swiggy.com",
  Zomato: "zomato.com", PhonePe: "phonepe.com", Paytm: "paytm.com",
};

const getCompanyLogoUrl = (companyName) => {
  if (!companyName || !LOGO_DEV_TOKEN) return null;
  const domain = COMPANY_DOMAINS[companyName];
  if (domain) return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`;
  const normalized = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  if (normalized) return `https://img.logo.dev/${normalized}.com?token=${LOGO_DEV_TOKEN}&size=128&format=png`;
  return null;
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Filter Pill Component
const FilterPill = ({ active, onClick, children, count }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${active
        ? isDark ? "bg-white text-black shadow-lg shadow-white/20" : "bg-gray-900 text-white shadow-lg"
        : isDark ? "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 shadow-sm"
        }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={`ml-1.5 ${active ? isDark ? "text-gray-600" : "text-gray-400" : "text-gray-500"}`}>
          ({count})
        </span>
      )}
    </motion.button>
  );
};

// Company Avatar with Logo
const CompanyAvatar = ({ company, logoURL, verdict }) => {
  const [imgError, setImgError] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const logoSrc = logoURL || getCompanyLogoUrl(company);
  const showImage = logoSrc && !imgError;

  return (
    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xl shrink-0 overflow-hidden ${isDark ? "bg-[#1e1e22] border-white/10" : "bg-white border-gray-100"}`}>
      {showImage ? (
        <img
          src={logoSrc}
          alt={company}
          className="w-9 h-9 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`text-xl font-black ${verdict === "Selected" ? "text-emerald-400" : "text-rose-400"
          }`}>
          {company ? company[0].toUpperCase() : "?"}
        </span>
      )}
    </div>
  );
};

// Status Dot
const StatusDot = ({ verdict }) => (
  <div className={`w-2.5 h-2.5 rounded-full ${verdict === "Selected"
    ? "bg-emerald-400 shadow-lg shadow-emerald-400/50"
    : "bg-rose-400 shadow-lg shadow-rose-400/50"
    } animate-pulse`} />
);

// Difficulty Badge
const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Hard: "bg-red-500/10 text-red-400 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${styles[difficulty] || styles.Medium}`}>
      {difficulty}
    </span>
  );
};

// Experience Card (Redesigned)
const ExperienceCard = ({ data, onClick, index }) => {
  const author = data.userId || data.user || {};
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${isDark ? "bg-[#151517]" : "bg-white shadow-sm hover:shadow-md"} ${data.verdict === "Selected"
        ? isDark ? "border border-emerald-500/10 hover:border-emerald-500/30" : "border border-emerald-500/30 hover:border-emerald-500/50"
        : isDark ? "border border-rose-500/10 hover:border-rose-500/30" : "border border-rose-500/30 hover:border-rose-500/50"
        }`}
    >
      {/* Left Accent Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${data.verdict === "Selected"
        ? "bg-gradient-to-b from-emerald-400 to-teal-500"
        : "bg-gradient-to-b from-rose-400 to-red-500"
        }`} />

      <div className="p-6 pl-7">
        {/* Header */}
        <div className="flex items-start gap-4 mb-3">
          <CompanyAvatar company={data.company} logoURL={data.logoURL} verdict={data.verdict} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-lg truncate transition-colors ${isDark ? "text-white group-hover:text-cyan-400" : "text-gray-900 group-hover:text-cyan-600"}`}>
                {data.company}
              </h3>
              <StatusDot verdict={data.verdict} />
            </div>
            <p className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{data.role}</p>
          </div>
        </div>

        {/* Detail Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-md ${isDark ? "text-gray-500 bg-white/5" : "text-gray-600 bg-gray-100"}`}>
            {data.batch}
          </span>
          {data.experienceType && (
            <span className="text-xs text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md font-medium">
              {data.experienceType}
            </span>
          )}
          {data.location && data.location !== "Not Specified" && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={11} /> {data.location}
            </span>
          )}
        </div>

        {/* Department */}
        {data.department && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
            <GraduationCap size={12} className="shrink-0" />
            <span className="truncate">{data.department}</span>
          </div>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md">
              #{data.tags.join(", ")}
            </span>
          </div>
        )}

        {/* Author Row */}
        <div className={`flex items-center gap-3 mb-4 pb-4 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <img
            src={author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.name || 'default'}`}
            className={`w-8 h-8 rounded-full border ${isDark ? "bg-[#252834] border-white/10" : "bg-gray-100 border-gray-200"}`}
            alt="User"
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDark ? "text-gray-300" : "text-gray-900"}`}>
              {author.name || "Anonymous"}
            </p>
            <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-500"}`}>{author.college || "Student"}</p>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <ThumbsUp size={13} />
              {Array.isArray(data.upvotes) ? data.upvotes.length : data.upvoteCount || data.upvotes || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={13} />
              {data.viewCount || data.views?.length || data.views || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {new Date(data.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <DifficultyBadge difficulty={data.difficulty} />
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card (Compact)
const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

// Empty State
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-20"
  >
    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
      <Search size={32} className="text-gray-600" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No experiences found</h3>
    <p className="text-gray-500 max-w-sm mx-auto">
      Try adjusting your filters or search for a different company.
    </p>
  </motion.div>
);

// Loading State
const LoadingState = () => (
  <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full" />
        <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin relative z-10" />
      </div>
      <p className="text-gray-500 text-sm font-medium animate-pulse">Loading experiences...</p>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InterviewExperiencePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { setCurrentExperience } = useContext(AuthContext);
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Fetch Data
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get(`${VITE_API_BASE_URL}/interviews/experiences`);
        if (response.data.success) {
          setExperiences(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  // Filter Logic
  const filteredExp = experiences
    .filter((exp) => {
      const matchesSearch =
        exp.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeFilter === "all") return matchesSearch;
      if (activeFilter === "selected") return matchesSearch && exp.verdict === "Selected";
      if (activeFilter === "rejected") return matchesSearch && exp.verdict === "Rejected";
      return matchesSearch && exp.company?.toLowerCase() === activeFilter.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "popular") return (b.upvotes?.length || b.upvotes || 0) - (a.upvotes?.length || a.upvotes || 0);
      if (sortBy === "views") return (b.views?.length || b.views || 0) - (a.views?.length || a.views || 0);
      return 0;
    });

  // Stats
  const stats = {
    total: experiences.length,
    selected: experiences.filter((e) => e.verdict === "Selected").length,
    companies: [...new Set(experiences.map((e) => e.company))].length,
  };

  // Get unique companies for filters
  const uniqueCompanies = [...new Set(experiences.map((e) => e.company))].slice(0, 5);

  if (loading) return <LoadingState />;

  return (
    <div className={`min-h-screen font-sans relative overflow-hidden transition-colors duration-200 ${isDark ? "bg-[#0b0b0d] text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-cyan-500/5 via-purple-500/3 to-transparent blur-3xl pointer-events-none" />

      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ isOpen: false })}
      />

      {/* Hero Section */}
      <div className={`relative border-b pt-6 pb-8 transition-colors ${isDark ? "border-white/5" : "border-gray-200/50"}`}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Top Row: Back Button + Stats */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 transition-colors group cursor-pointer ${isDark ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              <div className={`p-2 rounded-xl border group-hover:border-opacity-100 transition-colors ${isDark ? "bg-white/5 border-white/10 group-hover:border-white/20" : "bg-white border-gray-200 shadow-sm"}`}>
                <ArrowLeft size={16} />
              </div>
              <span className="text-sm font-medium">Back</span>
            </motion.button>

            {/* Stats - Top Right */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/5 rounded-xl">
                <Briefcase size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-white">{stats.total}</span>
                <span className="text-xs text-gray-500">Stories</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/5 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-sm font-bold text-white">{stats.selected}</span>
                <span className="text-xs text-gray-500">Selected</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 border rounded-xl ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
                <Building2 size={16} className="text-purple-400" />
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.companies}</span>
                <span className="text-xs text-gray-500">Companies</span>
              </div>
            </div>
          </div>

          {/* Center Content: Title + Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400">Discovery Hub</span>
            </div>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              Interview Experiences
            </h1>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Authentic stories from seniors who cracked top companies
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-50" />
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={20} />
              <input
                type="text"
                placeholder="Search companies, roles, or people..."
                className={`w-full h-12 backdrop-blur-xl border rounded-2xl pl-14 pr-6 outline-none transition-all ${isDark ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Mobile Stats - Only show on small screens */}
          <div className="flex md:hidden items-center justify-center gap-4 mt-6 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Briefcase size={14} className="text-blue-400" />
              <span className="font-bold text-white">{stats.total}</span> Stories
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="font-bold text-white">{stats.selected}</span> Selected
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Building2 size={14} className="text-purple-400" />
              <span className="font-bold text-white">{stats.companies}</span> Companies
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter Pills + Sort */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Horizontal Scrollable Pills */}
          <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <FilterPill
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              >
                All
              </FilterPill>
              <FilterPill
                active={activeFilter === "selected"}
                onClick={() => setActiveFilter("selected")}
                count={stats.selected}
              >
                ✓ Selected
              </FilterPill>
              <FilterPill
                active={activeFilter === "rejected"}
                onClick={() => setActiveFilter("rejected")}
                count={stats.total - stats.selected}
              >
                ✗ Rejected
              </FilterPill>
              {uniqueCompanies.map((company) => (
                <FilterPill
                  key={company}
                  active={activeFilter === company.toLowerCase()}
                  onClick={() => setActiveFilter(company.toLowerCase())}
                >
                  {company}
                </FilterPill>
              ))}
            </div>
          </div>

          {/* Sort + Share Button */}
          <div className="flex gap-3 shrink-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`border rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium outline-none cursor-pointer appearance-none transition-colors ${isDark ? "bg-white/5 border-white/10 text-gray-400 focus:border-cyan-500/50 hover:bg-white/10" : "bg-white border-gray-200 text-gray-600 focus:border-cyan-500 hover:bg-gray-50 shadow-sm"}`}
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="views">Most Viewed</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/share-experience")}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-colors cursor-pointer ${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"}`}
            >
              <Plus size={18} />
              Share
            </motion.button>
          </div>
        </motion.div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Showing <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{filteredExp.length}</span> experiences
          </p>
          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Grid */}
        {filteredExp.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredExp.map((exp, index) => (
                <ExperienceCard
                  key={exp._id}
                  data={exp}
                  index={index}
                  onClick={() => {
                    localStorage.setItem("currentExperience", JSON.stringify(exp));
                    setCurrentExperience(exp);
                    navigate(`/experience/${exp._id}`);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default InterviewExperiencePage;
