import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  CheckCircle2,
  Circle,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Clock,
  LayoutGrid,
  List,
  Target,
  Zap,
  Award,
  ArrowUpRight,
  Building2,
  BookOpen,
  Crown,
  Flame,
  Star,
  Activity,
  ArrowUpDown,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../core/context/UserContext";
import { useTheme } from "../../core/context/ThemeContext";
import LoginModal from "../auth/LoginModal";
import LoadingPage from "../../components/LoadingPage";

const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

const COMPANY_DOMAINS = {
  Google: "google.com",
  Microsoft: "microsoft.com",
  Amazon: "amazon.com",
  "Goldman Sachs": "goldmansachs.com",
  Uber: "uber.com",
  Salesforce: "salesforce.com",
  Apple: "apple.com",
  Meta: "meta.com",
  Facebook: "facebook.com",
  Netflix: "netflix.com",
  Adobe: "adobe.com",
  Oracle: "oracle.com",
  IBM: "ibm.com",
  Intel: "intel.com",
  Cisco: "cisco.com",
  VMware: "vmware.com",
  Qualcomm: "qualcomm.com",
  PayPal: "paypal.com",
  Stripe: "stripe.com",
  Shopify: "shopify.com",
  Atlassian: "atlassian.com",
  Zoom: "zoom.us",
  Slack: "slack.com",
  Twitter: "twitter.com",
  X: "x.com",
  LinkedIn: "linkedin.com",
  Airbnb: "airbnb.com",
  Lyft: "lyft.com",
  Pinterest: "pinterest.com",
  Reddit: "reddit.com",
  Dropbox: "dropbox.com",
  ServiceNow: "servicenow.com",
  Snowflake: "snowflake.com",
  Palantir: "palantir.com",
  "Morgan Stanley": "morganstanley.com",
  "JP Morgan": "jpmorgan.com",
  Citadel: "citadel.com",
  Walmart: "walmart.com",
  Tesla: "tesla.com",
  Nvidia: "nvidia.com",
  AMD: "amd.com",
  Samsung: "samsung.com",
  TCS: "tcs.com",
  Infosys: "infosys.com",
  Wipro: "wipro.com",
  Flipkart: "flipkart.com",
  Zomato: "zomato.com",
  Swiggy: "swiggy.in",
  PhonePe: "phonepe.com",
  Razorpay: "razorpay.com",
  CRED: "cred.club",
  "American Express": "americanexpress.com",
  Visa: "visa.com",
  Accenture: "accenture.com",
  Deloitte: "deloitte.com",
  Vishnu: "vishnu.edu.in",
};

const getLogoDevUrl = (companyName) => {
  const domain = COMPANY_DOMAINS[companyName];
  if (domain) {
    return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`;
  }
  const normalizedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  if (normalizedName && normalizedName !== "mustdo") {
    return `https://img.logo.dev/${normalizedName}.com?token=${LOGO_DEV_TOKEN}&size=128&format=png`;
  }
  return null;
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS with Manual Theme Support
// ═══════════════════════════════════════════════════════════════════════════════

const SkeletonRow = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgClass = isDark ? "bg-slate-700" : "bg-slate-200";

  return (
    <div className={`grid grid-cols-12 gap-4 items-center px-6 py-4 border-b animate-pulse ${isDark ? "border-slate-800" : "border-slate-100"}`}>
      <div className="col-span-1 flex justify-center">
        <div className={`w-5 h-5 rounded-full ${bgClass}`} />
      </div>
      <div className="col-span-6 md:col-span-5">
        <div className={`h-4 w-40 rounded mb-2 ${bgClass}`} />
        <div className="flex gap-2">
          <div className={`h-3 w-12 rounded ${bgClass}`} />
          <div className={`h-3 w-12 rounded ${bgClass}`} />
        </div>
      </div>
      <div className="col-span-3 md:col-span-2 hidden md:block">
        <div className={`h-6 w-16 rounded-full ${bgClass}`} />
      </div>
      <div className="col-span-2 hidden lg:block">
        <div className={`h-4 w-12 rounded ${bgClass}`} />
      </div>
      <div className="col-span-5 md:col-span-4 lg:col-span-2 flex justify-end">
        <div className={`h-8 w-20 rounded-lg ${bgClass}`} />
      </div>
    </div>
  );
};

const CompanyLogo = ({ companyName, size = 32 }) => {
  const [error, setError] = useState(false);
  const { theme } = useTheme();
  const url = getLogoDevUrl(companyName);

  if (!url || error) {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        className={`rounded-lg flex items-center justify-center font-bold text-slate-500 uppercase ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}
      >
        {companyName.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={companyName}
      onError={() => setError(true)}
      style={{ width: size, height: size }}
      className={`rounded-lg object-contain bg-white p-0.5 shadow-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
    />
  );
};

const MetricCard = ({ label, value, subValue, icon: Icon, trend }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`border rounded-xl p-5 shadow-sm flex flex-col justify-between min-w-[200px] h-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
          <Icon className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          {value}
        </h3>
        <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {label} {subValue && <span className="text-slate-400 ml-1">{subValue}</span>}
        </p>
      </div>
    </div>
  );
};

const SkillRadar = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`border rounded-xl p-4 shadow-sm h-[240px] w-full flex flex-col ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          <Activity className="w-4 h-4 text-blue-500" />
          Skill Analysis
        </h4>
      </div>
      <div className="flex-1 -ml-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skill"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="#3b82f6"
              fillOpacity={0.2}
              isAnimationActive={true}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CompanyCard = ({ item, isActive, onClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const progress = item.totalProblems > 0 ? (item.solved / item.totalProblems) * 100 : 0;
  const isComplete = progress === 100 && item.totalProblems > 0;

  // Dynamic styles based on active and theme
  let containerClasses = "";
  if (isActive) {
    containerClasses = isDark
      ? "bg-white text-slate-900 shadow-lg border-white"
      : "bg-slate-900 border-slate-900 text-white shadow-lg";
  } else {
    containerClasses = isDark
      ? "bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700"
      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-700";
  }

  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 min-w-[120px] w-[120px] h-[140px] border cursor-pointer ${containerClasses}`}
    >
      {isComplete && (
        <div className="absolute -top-3 z-10">
          <Crown className="w-6 h-6 text-amber-400 drop-shadow-md fill-amber-400" />
        </div>
      )}

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${isActive ? 'bg-white/10' : (isDark ? 'bg-slate-800' : 'bg-slate-50')}`}>
        {item.id === 'all' ? (
          <Building2 className={`w-6 h-6 ${isActive ? (isDark ? 'text-slate-900' : 'text-white') : (isDark ? 'text-slate-400' : 'text-slate-500')}`} />
        ) : (
          <CompanyLogo companyName={item.title} size={32} />
        )}
      </div>

      <div className="text-center w-full">
        <h4 className={`text-xs font-semibold mb-2 line-clamp-1`}>
          {item.title}
        </h4>

        <div className="w-full h-1 bg-slate-200/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-blue-400' : 'bg-blue-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-[10px] mt-1 block font-mono ${isActive ? "opacity-70" : "opacity-50"}`}>
          {item.solved}/{item.totalProblems}
        </span>
      </div>
    </button>
  );
};

const DifficultyBadge = ({ difficulty }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const config = {
    Easy: {
      light: "text-emerald-600 bg-emerald-50 border-emerald-100",
      dark: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
      dot: "bg-emerald-500"
    },
    Medium: {
      light: "text-amber-600 bg-amber-50 border-amber-100",
      dark: "text-amber-400 bg-amber-900/30 border-amber-800",
      dot: "bg-amber-500"
    },
    Hard: {
      light: "text-rose-600 bg-rose-50 border-rose-100",
      dark: "text-rose-400 bg-rose-900/30 border-rose-800",
      dot: "bg-rose-500"
    },
  };
  const themeConfig = config[difficulty] || config.Easy;
  const classes = isDark ? themeConfig.dark : themeConfig.light;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${themeConfig.dot}`} />
      {difficulty}
    </span>
  );
};

// Back button that appears on hover and stays visible for 2 seconds after mouse leaves
const BackButtonWithDelay = ({ navigate, isDark = true, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Stay visible for 2 seconds after mouse leaves
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex items-center mb-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={{ x: 10, opacity: 0, scale: 0.8 }}
        animate={isVisible
          ? { x: -45, opacity: 1, scale: 1 }
          : { x: 10, opacity: 0, scale: 0.8 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/");
          }}
          className={`w-10 h-10 rounded-full border transition-colors flex items-center justify-center cursor-pointer ${isDark
            ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
            : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
          title="Go Back"
        >
          <ArrowLeft size={20} />
        </button>
      </motion.div>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const DSAPractice = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setCurrentQuestion } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- State ---
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [totalProblems, setTotalProblem] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Navigation State
  const [viewMode, setViewMode] = useState("company");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [topicData, setTopicData] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) setShowLoginModal(true);
    else setShowLoginModal(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${VITE_API_BASE_URL}/questions`);
        const allQuestions = response.data.data || [];
        setTotalProblem(allQuestions.length);
        setQuestions(allQuestions);

        const fetchingSolvedIds = user?.questionsSolved || [];

        const processQuestion = (q) => {
          const isSolved = fetchingSolvedIds.some((solvedId) => {
            const sId = typeof solvedId === 'object' ? solvedId._id : solvedId;
            return String(sId) === String(q._id);
          });
          return {
            id: q._id,
            slug: q.slug,
            title: q.title,
            difficulty: q.difficulty,
            timeEstimate: q.timeEstimate || "20 min",
            status: isSolved ? "solved" : "unsolved",
            opportunityType: q.opportunityType || "Internship",
            tags: q.tags || [],
          };
        };

        const companyMap = {};
        allQuestions.forEach((q) => {
          const companies = q.companies && q.companies.length > 0 ? q.companies : ["Must Do"];
          companies.forEach((companyName) => {
            if (!companyMap[companyName]) companyMap[companyName] = [];
            companyMap[companyName].push(processQuestion(q));
          });
        });

        const transformedCompanyData = Object.keys(companyMap)
          .sort((a, b) => (a === "Must Do" ? 1 : b === "Must Do" ? -1 : a.localeCompare(b)))
          .map((name) => ({
            id: name,
            title: name,
            totalProblems: companyMap[name].length,
            solved: companyMap[name].filter(p => p.status === "solved").length,
            problems: companyMap[name],
          }));

        const topicMap = {};
        allQuestions.forEach((q) => {
          const topics = q.tags && q.tags.length > 0 ? q.tags : ["General"];
          topics.forEach((topicName) => {
            if (!topicMap[topicName]) topicMap[topicName] = [];
            if (!topicMap[topicName].some(p => p.id === q._id)) {
              topicMap[topicName].push(processQuestion(q));
            }
          });
        });

        const transformedTopicData = Object.keys(topicMap).map((name) => ({
          id: name,
          title: name,
          totalProblems: topicMap[name].length,
          solved: topicMap[name].filter(p => p.status === "solved").length,
          problems: topicMap[name],
        }));

        const allUniqueProblems = allQuestions.map(processQuestion);
        const allSolvedCount = allUniqueProblems.filter(p => p.status === 'solved').length;

        const allEntry = (title) => ({
          id: "all",
          title: title,
          totalProblems: allUniqueProblems.length,
          solved: allSolvedCount,
          problems: allUniqueProblems
        });

        setCourseData([allEntry("All Companies"), ...transformedCompanyData]);
        setTopicData([allEntry("All Topics"), ...transformedTopicData]);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  const currentCategoryList = viewMode === "company" ? (courseData.length ? courseData : []) : (courseData.length ? (courseData.id === 'all' && topicData.length ? topicData : topicData) : []);
  const safeCategoryList = viewMode === "company" ? courseData : topicData;


  const currentMissions = useMemo(() => {
    const category = safeCategoryList.find((c) => c.id === selectedCategoryId);
    if (!category) return [];

    let filtered = category.problems.filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = filterDifficulty === "all" || problem.difficulty.toLowerCase() === filterDifficulty;
      const matchesStatus = filterStatus === "all" || problem.status === filterStatus;
      const matchesType = typeFilter === "all" || problem.opportunityType?.toLowerCase() === typeFilter;
      return matchesSearch && matchesDifficulty && matchesStatus && matchesType;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'difficulty') {
          const diffMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          aValue = diffMap[aValue] || 0;
          bValue = diffMap[bValue] || 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [safeCategoryList, selectedCategoryId, searchQuery, filterDifficulty, filterStatus, typeFilter, sortConfig]);

  const stats = useMemo(() => {
    const totalSolved = user?.questionsSolved?.length || 0;
    const progress = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

    const categories = { Arrays: 0, DP: 0, Trees: 0, Graphs: 0, Strings: 0 };
    const solvedCounts = { Arrays: 0, DP: 0, Trees: 0, Graphs: 0, Strings: 0 };

    questions.forEach(q => {
      const isSolved = user?.questionsSolved?.some(s => {
        const sId = typeof s === 'object' ? s._id : s;
        return String(sId) === String(q._id);
      });
      (q.tags || []).forEach(tag => {
        const t = tag.toLowerCase();
        if (t.includes('array')) { categories.Arrays++; if (isSolved) solvedCounts.Arrays++; }
        if (t.includes('dp') || t.includes('dynamic')) { categories.DP++; if (isSolved) solvedCounts.DP++; }
        if (t.includes('tree')) { categories.Trees++; if (isSolved) solvedCounts.Trees++; }
        if (t.includes('graph')) { categories.Graphs++; if (isSolved) solvedCounts.Graphs++; }
        if (t.includes('string')) { categories.Strings++; if (isSolved) solvedCounts.Strings++; }
      });
    });

    const radarData = Object.keys(categories).map(key => ({
      skill: key,
      value: categories[key] ? Math.round((solvedCounts[key] / categories[key]) * 100) : 0,
      fullMark: 100
    }));

    return { totalSolved, progress, streak: user?.streak || 0, radarData };
  }, [user, totalProblems, questions]);

  const handleSolveClick = (problem) => {
    // Find the FULL question from the original questions array (has all fields like description, testCases, etc.)
    const fullQuestion = questions.find(q => q._id === problem.id) || problem;
    setCurrentQuestion(fullQuestion);
    localStorage.setItem("currentQuestion", JSON.stringify(fullQuestion));
    navigate(`/solve/${problem.id}`);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (showLoginModal) return <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />;

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-200 ${isDark ? "bg-[#0f172a] text-white" : "bg-slate-50 text-slate-900"}`}>

      {/* HEADER */}
      <header className={`border-b pt-8 pb-8 px-6 lg:px-12 transition-colors duration-200 ${isDark ? "bg-[#1e293b] border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2 flex flex-col justify-between">
              <div className="mb-6 relative">
                {/* Back Button Container - hidden by default, shows on hover, stays 2s after mouse leaves */}
                <BackButtonWithDelay navigate={navigate} isDark={isDark}>
                  <h1 className={`text-2xl font-bold flex items-center gap-2 cursor-default ${isDark ? "text-white" : "text-slate-900"}`}>
                    Practice Dashboard
                  </h1>
                </BackButtonWithDelay>
                <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Track your progress and master detailed algorithmic challenges.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <MetricCard
                  label="Total Solved"
                  value={stats.totalSolved}
                  subValue={`/ ${totalProblems}`}
                  icon={Target}
                />
                <MetricCard
                  label="Day Streak"
                  value={stats.streak}
                  icon={Flame}
                  trend={stats.streak > 0 ? "Active" : null}
                />
                <div className="hidden sm:block">
                  <MetricCard
                    label="Total Progress"
                    value={`${stats.progress}%`}
                    icon={TrendingUp}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <SkillRadar data={stats.radarData} />
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <div className={`sticky top-0 z-30 backdrop-blur-md border-b shadow-sm transition-all duration-200 ${isDark ? "bg-[#0f172a]/95 border-slate-800" : "bg-white/90 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className={`flex p-1 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
              <button
                onClick={() => setViewMode('company')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${viewMode === 'company' ? (isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") : "text-slate-500"}`}
              >
                Companies
              </button>
              <button
                onClick={() => setViewMode('topic')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${viewMode === 'topic' ? (isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") : "text-slate-500"}`}
              >
                Topics
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="flex overflow-x-auto gap-3 py-2 scrollbar-hide pb-4">
              {safeCategoryList.map((item) => (
                <CompanyCard
                  key={item.id}
                  item={item}
                  isActive={selectedCategoryId === item.id}
                  onClick={() => setSelectedCategoryId(item.id)}
                />
              ))}
            </div>
            <div className={`absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l to-transparent pointer-events-none ${isDark ? "from-[#0f172a]" : "from-white"}`} />
          </div>
        </div>
      </div>

      {/* DATA GRID */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className={`rounded-2xl border overflow-hidden min-h-[400px] ${isDark ? "bg-[#1e293b] border-slate-800" : "bg-white border-slate-200"}`}>
          {/* Header */}
          <div className={`grid grid-cols-12 gap-4 px-6 py-4 border-b text-xs font-semibold uppercase tracking-wider ${isDark ? "border-slate-800 bg-slate-900/50 text-slate-500" : "border-slate-200 bg-slate-50/50 text-slate-500"}`}>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-6 md:col-span-5">Problem</div>
            <button
              onClick={() => handleSort('difficulty')}
              className={`col-span-3 md:col-span-2 hidden md:flex items-center gap-1 cursor-pointer ${isDark ? "hover:text-slate-300" : "hover:text-slate-800"}`}
            >
              Difficulty
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <div className="col-span-2 hidden lg:block">Time Est.</div>
            <div className="col-span-5 md:col-span-4 lg:col-span-2 text-right">Action</div>
          </div>

          {/* Body */}
          <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
            {loading ? (
              // SKELETON LOADING STATE
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : currentMissions.length > 0 ? (
              currentMissions.map((problem) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors duration-200 ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}
                >
                  <div className="col-span-1 flex justify-center">
                    {problem.status === 'solved' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                    )}
                  </div>

                  <div className="col-span-6 md:col-span-5">
                    <h3 className={`text-base font-medium mb-1 transition-colors ${problem.status === 'solved' ? (isDark ? 'text-slate-200' : 'text-slate-800') : (isDark ? 'text-white group-hover:text-blue-400' : "text-slate-900 group-hover:text-blue-600")}`}>
                      {problem.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.slice(0, 3).map(tag => (
                        <span key={tag} className={`px-2 py-0.5 text-xs rounded-md ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-2 hidden md:flex items-center">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>

                  <div className="col-span-2 hidden lg:flex items-center text-slate-500 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {problem.timeEstimate}
                  </div>

                  <div className="col-span-5 md:col-span-4 lg:col-span-2 flex justify-end">
                    <button
                      onClick={() => handleSolveClick(problem)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${problem.status === 'solved'
                        ? (isDark ? "text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/30" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100")
                        : (isDark ? "text-slate-300 hover:text-blue-400 hover:bg-blue-900/20" : "text-slate-600 hover:text-blue-600 hover:bg-blue-50")
                        }`}
                    >
                      <span>{problem.status === 'solved' ? 'Review' : 'Solve'}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className={`font-medium mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>No problems found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DSAPractice;
