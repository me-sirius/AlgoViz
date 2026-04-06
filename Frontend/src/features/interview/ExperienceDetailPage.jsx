import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Share2,
  Building2,
  Sparkles,
  Eye,
  Linkedin,
  Github,
  ChevronRight,
  Home,
  Clock,
  BookOpen,
  MessageCircle,
  Send,
  Bookmark,
  Layers,
} from "lucide-react";
import { AuthContext } from "../../core/context/UserContext";
import axios from "axios";
import LoginModal from "../auth/LoginModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN;

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

// Company Logo (Header)
const CompanyLogo = ({ company, logoURL, verdict }) => {
  const [imgError, setImgError] = useState(false);
  const logoSrc = logoURL || getCompanyLogoUrl(company);
  const showImage = logoSrc && !imgError;

  return (
    <div className="w-16 h-16 rounded-2xl bg-[#1e1e22] border border-white/10 flex items-center justify-center shadow-xl shrink-0 overflow-hidden">
      {showImage ? (
        <img
          src={logoSrc}
          alt={company}
          className="w-12 h-12 rounded-xl object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`text-2xl font-black ${verdict === "Selected" ? "text-emerald-400" : "text-rose-400"
          }`}>
          {company?.[0] || "?"}
        </span>
      )}
    </div>
  );
};

// Breadcrumb Navigation
const Breadcrumbs = ({ company, role }) => (
  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
    <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
      <Home size={14} /> Home
    </span>
    <ChevronRight size={14} />
    <span className="hover:text-white cursor-pointer transition-colors">{company}</span>
    <ChevronRight size={14} />
    <span className="text-gray-400">{role}</span>
  </div>
);

// Verdict Badge
const VerdictBadge = ({ verdict }) => (
  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${verdict === "Selected"
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
    }`}>
    {verdict === "Selected" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
    {verdict}
  </div>
);

// Stat Row Item
const StatRow = ({ label, value, valueClass = "text-white" }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/15 last:border-0">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className={`font-semibold text-sm ${valueClass}`}>{value}</span>
  </div>
);

// Difficulty Badge
const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Hard: "bg-red-500/10 text-red-400",
    Medium: "bg-amber-500/10 text-amber-400",
    Easy: "bg-emerald-500/10 text-emerald-400",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[difficulty] || styles.Medium}`}>
      {difficulty}
    </span>
  );
};

// Timeline Node (for Interview Rounds)
const TimelineNode = ({ round, index, isLast }) => (
  <div className="relative flex gap-6">
    {/* Vertical Line */}
    {!isLast && (
      <div className="absolute left-[19px] top-12 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 to-transparent" />
    )}

    {/* Node Circle */}
    <div className="relative z-10 shrink-0">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
        {index + 1}
      </div>
    </div>

    {/* Content */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-1 pb-8"
    >
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
        <h3 className="text-lg font-bold text-white mb-3">{round.roundName.replace(/^#+\s*/, '')}</h3>
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
          prose-h3:text-base prose-h3:text-cyan-300
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-strong:text-white prose-strong:font-semibold
          prose-em:text-gray-300 prose-em:italic
          prose-code:bg-white/10 prose-code:text-cyan-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-[#1a1a2e] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
          prose-ul:text-gray-300 prose-ol:text-gray-300
          prose-li:marker:text-cyan-500 prose-li:my-1
          prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-cyan-500/30 prose-blockquote:text-gray-400 prose-blockquote:italic
          prose-hr:border-white/10
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
            {round.description}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  </div>
);

// Author Card
const AuthorCard = ({ user, createdAt }) => (
  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4">Posted by</p>
    <div className="flex items-center gap-4 mb-4">
      <img
        src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
        alt={user?.name}
        className="w-14 h-14 rounded-full border-2 border-white/10"
      />
      <div>
        <h3 className="font-bold text-white">{user?.name || "Anonymous"}</h3>
        <p className="text-sm text-gray-500">{user?.college || "Student"}</p>
      </div>
    </div>
    <p className="text-xs text-gray-500">
      {new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })}
    </p>
  </div>
);

// Social Connect Buttons
const SocialButtons = ({ socials }) => (
  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4">Connect</p>
    <div className="flex gap-2">
      <a
        href={socials?.linkedin || "#"}
        target="_blank"
        rel="noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0077b5]/10 text-[#0077b5] border border-[#0077b5]/20 rounded-xl hover:bg-[#0077b5]/20 transition-colors text-sm font-medium cursor-pointer"
      >
        <Linkedin size={16} /> LinkedIn
      </a>
      <a
        href={socials?.github || "#"}
        target="_blank"
        rel="noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium cursor-pointer"
      >
        <Github size={16} /> GitHub
      </a>
    </div>
  </div>
);

// Loading State
const LoadingState = () => (
  <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full" />
        <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin relative z-10" />
      </div>
      <p className="text-gray-500 text-sm font-medium animate-pulse">Loading experience...</p>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Estimate read time from all round descriptions
const getReadTime = (rounds) => {
  if (!rounds || rounds.length === 0) return 1;
  const totalWords = rounds.reduce((sum, r) => sum + (r.description || "").split(/\s+/).length, 0);
  return Math.max(1, Math.ceil(totalWords / 200));
};

const ExperienceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [voteCount, setVoteCount] = useState();
  const { currentExperience, setCurrentExperience } = useContext(AuthContext);
  const [views, setViews] = useState();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // EFFECT 1: Restore from LocalStorage on mount/refresh
  useEffect(() => {
    if (currentExperience && currentExperience._id === id) {
      return;
    }
    const stored = localStorage.getItem("currentExperience");
    if (stored) {
      const parsedData = JSON.parse(stored);
      if (parsedData._id === id) {
        setCurrentExperience(parsedData);
      }
    }
  }, [id]);

  // EFFECT 2: Sync UI with Context
  useEffect(() => {
    if (currentExperience && currentExperience._id === id) {
      setData(currentExperience);
      setVoteCount(currentExperience.upvotes?.length || 0);
      const userId = localStorage.getItem("userId");
      setUpvoted(currentExperience.upvotes?.includes(userId));
      setLoading(false);
    }
  }, [currentExperience, id]);

  // Upvote Handler
  const handleUpvoted = async () => {
    try {
      setUpvoted(!upvoted);
      setVoteCount((cnt) => (upvoted ? cnt - 1 : cnt + 1));

      const response = await axios.put(
        `${VITE_API_BASE_URL}/interviews/experience/${data._id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.status === 200) {
        const isUpvotedNow = response.data.isUpvoted;
        const userId = localStorage.getItem("userId");
        setUpvoted(isUpvotedNow);

        setCurrentExperience((prev) => {
          let updatedUpvotesArray = [...(prev.upvotes || [])];
          if (isUpvotedNow) {
            if (!updatedUpvotesArray.includes(userId)) {
              updatedUpvotesArray.push(userId);
            }
          } else {
            updatedUpvotesArray = updatedUpvotesArray.filter((uid) => uid !== userId);
          }
          const newExperienceData = { ...prev, upvotes: updatedUpvotesArray };
          localStorage.setItem("currentExperience", JSON.stringify(newExperienceData));
          return newExperienceData;
        });
      }
    } catch (error) {
      console.error("Upvote failed:", error);
      setUpvoted(!upvoted);
    }
  };

  // View Count Update
  useEffect(() => {
    let isMounted = true;
    const viewUpdate = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `${VITE_API_BASE_URL}/interviews/experience/${id}/views`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (isMounted) setViews(response.data.views);
      } catch (error) {
        console.error("Failed to update view", error);
      }
    };
    viewUpdate();
    return () => { isMounted = false; };
  }, [id]);

  // Fetch Comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${VITE_API_BASE_URL}/interviews/experience/${id}/comments`
        );
        if (response.data.success) {
          setComments(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };
    fetchComments();
  }, [id]);

  // Submit Comment
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const response = await axios.post(
        `${VITE_API_BASE_URL}/interviews/experience/${id}/comment`,
        { text: commentText.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (response.data.success) {
        setCommentText("");
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 4000);
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Auth Check
  if (!localStorage.getItem("token")) {
    return <LoginModal isOpen={true} onClose={() => { }} />;
  }

  if (loading) return <LoadingState />;
  if (!data) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-white flex items-center justify-center">
        Experience not found
      </div>
    );
  }

  const author = data.userId || data.user || {};

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-gray-100 font-sans pb-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-purple-500/5 via-cyan-500/3 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative border-b border-white/10 pt-6 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Breadcrumbs */}
          <Breadcrumbs company={data.company} role={data.role} />

          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 items-start justify-between"
          >
            <div className="flex gap-5">
              {/* Company Logo */}
              <CompanyLogo company={data.company} logoURL={data.logoURL} verdict={data.verdict} />
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                  {data.company} Interview
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={15} className="text-cyan-400" /> {data.role}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={15} className="text-purple-400" /> {data.batch}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-rose-400" /> {data.location}
                  </span>
                </div>
              </div>
            </div>
            <VerdictBadge verdict={data.verdict} />
          </motion.div>
        </div>
      </div>

      {/* Main Content: Two Column Layout */}
      <div className="relative max-w-6xl mx-auto px-0 mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-24">

        {/* Left Column: Content */}
        <div className="space-y-10">
          {/* Interview Rounds Timeline */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Briefcase size={18} className="text-white" />
              </div>
              Interview Rounds
            </h2>
            <div className="space-y-0">
              {data.rounds?.map((round, idx) => (
                <TimelineNode
                  key={idx}
                  round={round}
                  index={idx}
                  isLast={idx === data.rounds.length - 1}
                />
              ))}
            </div>
          </motion.section>

          {/* Tips Section */}
          {data.tips && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="fill-amber-400" /> Tips for Juniors
              </h3>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-amber-300 prose-headings:font-bold
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-strong:text-amber-200 prose-strong:font-semibold
                prose-em:text-gray-300
                prose-code:bg-white/10 prose-code:text-amber-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:marker:text-amber-500
                prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {data.tips}
                </ReactMarkdown>
              </div>
            </motion.section>
          )}
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="lg:sticky lg:top-24 space-y-5 h-fit">
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4">
              Quick Stats
            </h3>
            {data.experienceType && (
              <StatRow
                label="Type"
                value={
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300">
                    {data.experienceType}
                  </span>
                }
              />
            )}
            <StatRow label="Difficulty" value={<DifficultyBadge difficulty={data.difficulty} />} />
            <StatRow
              label="Package"
              value={
                <span className="font-mono">
                  {data.experienceType === "Internship"
                    ? (data.internship?.stipend || "Hidden")
                    : (data.placement?.ctc || data.ctc || "Hidden")}
                </span>
              }
              valueClass={((data.experienceType === "Internship" ? data.internship?.stipend : data.placement?.ctc) || data.ctc) && ((data.experienceType === "Internship" ? data.internship?.stipend : data.placement?.ctc) || data.ctc) !== "Hidden" ? "text-emerald-400" : "text-gray-500 line-through"}
            />
            <StatRow
              label="Views"
              value={
                <span className="flex items-center gap-1.5">
                  <Eye size={14} className="text-cyan-400" /> {views || 0}
                </span>
              }
            />
            <StatRow
              label="Upvotes"
              value={
                <span className="flex items-center gap-1.5">
                  <ThumbsUp size={14} className="text-blue-400" /> {voteCount || 0}
                </span>
              }
            />
            <StatRow
              label="Read Time"
              value={
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-400" /> {getReadTime(data.rounds)} min
                </span>
              }
            />
            <StatRow
              label="Rounds"
              value={
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-purple-400" /> {data.rounds?.length || 0}
                </span>
              }
            />

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 text-xs rounded-lg font-semibold">
                    #{data.tags.join(", ")}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleUpvoted}
                className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm cursor-pointer ${upvoted
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/15"
                  }`}
              >
                <ThumbsUp size={15} className={upvoted ? "fill-current" : ""} />
                {upvoted ? "Upvoted" : "Upvote"}
              </motion.button>
              <button className="py-2.5 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 flex items-center justify-center gap-2 transition-all border border-white/15 text-sm cursor-pointer">
                <Bookmark size={15} /> Save
              </button>
            </div>
            <button className="w-full mt-3 py-2.5 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 flex items-center justify-center gap-2 transition-all border border-white/15 text-sm cursor-pointer">
              <Share2 size={15} /> Share
            </button>
          </motion.div>

          {/* Author Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AuthorCard user={author} createdAt={data.createdAt} />
          </motion.div>

          {/* Social Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SocialButtons socials={author.socials} />
          </motion.div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* COMMENTS SECTION */}
      {/* ================================================================ */}
      <div className="relative max-w-6xl mx-auto px-6 mt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            Discussion
            {comments.length > 0 && (
              <span className="text-sm font-medium text-gray-500 ml-1">({comments.length})</span>
            )}
          </h2>

          {/* Comment Input */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex gap-4">
              <img
                src={localStorage.getItem("avatar") || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`}
                className="w-10 h-10 rounded-full bg-[#252834] border border-white/10 shrink-0"
                alt="You"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts or ask a question..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none min-h-[80px]"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-600">Comments are reviewed before publishing</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || commentSubmitting}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${commentText.trim()
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                      : "bg-white/5 text-gray-600 cursor-not-allowed"
                      }`}
                  >
                    <Send size={14} />
                    {commentSubmitting ? "Posting..." : "Post"}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {commentSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"
                >
                  <CheckCircle2 size={16} />
                  Your comment has been submitted and is pending approval.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, idx) => (
                <motion.div
                  key={comment._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex gap-4">
                    <img
                      src={comment.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId?.name || 'anon'}`}
                      className="w-10 h-10 rounded-full bg-[#252834] border border-white/10 shrink-0"
                      alt={comment.userId?.name || "User"}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-white text-sm">
                          {comment.userId?.name || "Anonymous"}
                        </h4>
                        <span className="text-xs text-gray-600">
                          {comment.userId?.college || ""}
                        </span>
                        <span className="text-xs text-gray-600 ml-auto shrink-0">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExperienceDetailPage;
