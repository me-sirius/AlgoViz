import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  User,
  X,
  ArrowLeft,
  Search,
  PenTool,
  Home,
  Code,
  ArrowUpDown
} from "lucide-react";
import Alert from "../../components/Alert";
import axios from "axios";
import { AuthContext } from "../../core/context/UserContext";
import { useTheme } from "../../core/context/ThemeContext";
import LoginModal from "../auth/LoginModal";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// --- 1. CONSTANTS & UTILS ---

const trendingTags = [
  "Algorithm", "Data Structure", "Interview", "Dynamic Programming", "Graph", "Tips", "System Design", "Career"
];

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Reading time estimator
const calculateReadTime = (text) => {
  const wordsPerMinute = 200;
  const count = text?.split(/\s+/).length || 0;
  const time = Math.ceil(count / wordsPerMinute);
  return `${time} min read`;
};

const getBlogId = (blog) => blog?._id || blog?.id;

// Helper to get author name - handles both populated object and plain string
const getAuthorName = (author) => {
  if (!author) return "Anonymous";
  if (typeof author === 'object') return author.name || author.email || "Anonymous";
  return author; // If it's already a string (shouldn't happen with populate, but fallback)
};

const stripHtml = (html) => {
  if (typeof window === "undefined" || !html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return (temp.textContent || temp.innerText || "").replace(/\s+/g, ' ').trim();
};

// --- 2. SKELETON LOADER (Medium Style) ---
const BlogSkeleton = ({ theme }) => (
  <div className={`py-8 border-b animate-pulse ${theme === 'dark' ? 'border-white/20' : 'border-gray-100'}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
      <div className={`h-3 w-32 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
    </div>
    <div className="space-y-3 mb-4">
      <div className={`h-8 w-3/4 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
      <div className={`h-4 w-full rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`} />
      <div className={`h-4 w-2/3 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`} />
    </div>
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <div className={`h-5 w-16 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`} />
        <div className={`h-5 w-12 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`} />
      </div>
      <div className={`h-4 w-4 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`} />
    </div>
  </div>
);

const UserAvatar = ({ src, alt, fallback, className, borderClass }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className={`${className} bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold border ${borderClass}`}>
        {fallback?.[0]?.toUpperCase() || "U"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className={`${className} object-cover border ${borderClass}`}
    />
  );
};

// --- 3. MAIN COMPONENT ---

import CKEditorRichText from '../../components/CKEditorRichText';
import DOMPurify from 'dompurify';

const BlogPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // 'light' or 'dark'

  // State
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "", type: "error" });
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  // Login modal with context-specific messages
  const [loginModalConfig, setLoginModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    context: "default"
  });
  const [viewMode, setViewMode] = useState("feed"); // 'feed' | 'read' | 'create'
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [feedFilter, setFeedFilter] = useState("all"); // 'all' | 'my'
  const [sortOption, setSortOption] = useState("recent"); // 'recent' | 'liked' | 'popular'
  const [editingBlog, setEditingBlog] = useState(null);
  const [newBlog, setNewBlog] = useState({ title: "", content: "", tags: "" });

  // Comments State (Local simulation for now)
  const [comments, setComments] = useState({}); // { blogId: [ { user, text, date } ] }
  const [newComment, setNewComment] = useState("");

  const { isAuthenticated, user } = useContext(AuthContext);

  // Styles based on theme
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-[#020617]' : 'bg-white';
  const textClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const titleClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-white/20' : 'border-gray-200'; // Increased contrast
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-500';
  const glassClass = isDark ? 'bg-[#020617]/90 backdrop-blur-md' : 'bg-white/90 backdrop-blur-md';
  const inputBg = isDark ? 'bg-white/10' : 'bg-gray-100';


  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/blogs`);
        const data = await response.json();
        if (data.success) {
          setBlogs(data.blogs);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // --- ACTIONS ---

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const handleCreateBlog = async () => {
    try {
      const response = await axios.post(`${API}/blogs/create`, {
        title: newBlog.title,
        content: newBlog.content, // Save HTML directly
        tags: newBlog.tags.split(",").map((t) => t.trim()).filter(Boolean),
        author: localStorage.getItem("userId"),
      });
      if (response.status === 201) {
        setAlertConfig({ isOpen: true, message: "Published successfully!", type: "success" });
        setBlogs([response.data.blog, ...blogs]);
        setNewBlog({ title: "", content: "", tags: "" });
        setViewMode("feed");
      }
    } catch (error) {
      setAlertConfig({ isOpen: true, message: "Failed to publish", type: "error" });
    }
  };

  const handleUpdateBlog = async () => {
    if (!editingBlog) return;

    setBlogs(blogs.map((b) => getBlogId(b) === getBlogId(editingBlog) ? {
      ...b,
      title: newBlog.title,
      content: newBlog.content, // Save HTML directly
      tags: newBlog.tags.split(",").map((t) => t.trim()).filter(Boolean),
    } : b));
    setAlertConfig({ isOpen: true, message: "Changes saved.", type: "success" });
    setNewBlog({ title: "", content: "", tags: "" });
    setEditingBlog(null);
    setViewMode("feed");
  };

  const handleDeleteBlog = (blogId) => {
    setAlertConfig({
      isOpen: true,
      message: "Delete this story?",
      type: "warning",
      customButtons: (
        <div className="flex gap-4 justify-center">
          <button onClick={() => { setBlogs(blogs.filter((b) => getBlogId(b) !== blogId)); closeAlert(); }} className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 cursor-pointer">Delete</button>
          <button onClick={closeAlert} className={`px-6 py-2 border ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-100'} rounded-full text-sm font-medium cursor-pointer`}>Cancel</button>
        </div>
      ),
    });
  };

  const handleLike = (blogId) => {
    if (!isAuthenticated) {
      setLoginModalConfig({
        isOpen: true,
        title: "Like this story?",
        message: "Sign in to show appreciation for the author's work.",
        context: "like"
      });
      return;
    }
    setBlogs(blogs.map((b) => getBlogId(b) === blogId ? { ...b, likes: b.liked ? b.likes - 1 : b.likes + 1, liked: !b.liked } : b));
  };

  const handleBookmark = (blogId) => {
    if (!isAuthenticated) {
      setLoginModalConfig({
        isOpen: true,
        title: "Save for later?",
        message: "Sign in to bookmark stories and access them anytime.",
        context: "bookmark"
      });
      return;
    }
    setBlogs(blogs.map((b) => getBlogId(b) === blogId ? { ...b, bookmarked: !b.bookmarked } : b));
  };

  const handleShare = (blogId) => {
    navigator.clipboard.writeText(`${window.location.origin}/blogs/${blogId}`);
    setAlertConfig({ isOpen: true, message: "Link copied to clipboard", type: "success" });
  };

  const handlePostComment = (blogId) => {
    if (!isAuthenticated) {
      setLoginModalConfig({
        isOpen: true,
        title: "Join the conversation",
        message: "Sign in to share your thoughts and engage with the community.",
        context: "comment"
      });
      return;
    }
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: localStorage.getItem("userName") || "You",
      text: newComment,
      date: new Date().toISOString()
    };

    setComments({
      ...comments,
      [blogId]: [...(comments[blogId] || []), comment]
    });

    // Update local blog comment count
    setBlogs(blogs.map(b => getBlogId(b) === blogId ? { ...b, comments: (b.comments || 0) + 1 } : b));

    setNewComment("");
  };

  const openReadMode = (blog) => {
    // If not authenticated, prompt sign-in instead of showing full article
    if (!isAuthenticated) {
      setLoginModalConfig({
        isOpen: true,
        title: "Continue reading?",
        message: "Sign in to read the full article and unlock all features.",
        context: "read"
      });
      return;
    }

    setSelectedBlog(blog);
    setViewMode("read");
    setBlogs(blogs.map((b) => getBlogId(b) === getBlogId(blog) ? { ...b, views: (b.views || 0) + 1 } : b));
  };

  const openCreateMode = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      // Content is now stored as HTML, load directly
      setNewBlog({ title: blog.title, content: blog.content || "", tags: blog.tags?.join(", ") || "" });
    } else {
      setEditingBlog(null);
      setNewBlog({ title: "", content: "", tags: "" });
    }
    setViewMode("create");
  };

  // Filter Logic
  const userId = localStorage.getItem("userId");

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = !searchQuery || blog.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !activeTag || blog.tags?.some((t) => t.toLowerCase().includes(activeTag.toLowerCase()));

    if (feedFilter === "my") {
      return matchesSearch && matchesTag && (blog.author?._id === userId || blog.author === userId);
    }
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (sortOption === "liked") {
      return (b.likes || 0) - (a.likes || 0);
    }
    if (sortOption === "popular") {
      return (b.comments || 0) - (a.comments || 0);
    }
    // "recent" is default
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });


  // --- RENDERERS ---

  // 1. ZEN EDITOR — Premium Immersive Design
  const editorWordCount = newBlog.content ? stripHtml(newBlog.content).split(/\s+/).filter(Boolean).length : 0;
  const editorReadTime = Math.max(1, Math.ceil(editorWordCount / 200));

  const renderEditor = () => (
    <div className={`fixed inset-0 z-50 overflow-y-auto font-sans selection:bg-purple-500/30 ${isDark ? 'bg-[#070b14]' : 'bg-gradient-to-b from-gray-50 to-white'}`}>

      {/* ── Animated Background Blobs ── */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-cyan-500/[0.03] blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>
      )}

      <div className="max-w-4xl mx-auto min-h-screen flex flex-col relative z-10">

        {/* ── Glassmorphism Header ── */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`py-4 px-6 flex justify-between items-center sticky top-0 z-20 transition-colors duration-300
            ${isDark
              ? 'bg-[#070b14]/80 backdrop-blur-xl border-b border-white/[0.12]'
              : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/60'
            }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("feed")}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer
                ${isDark
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
            >
              <ArrowLeft size={18} />
            </button>
            <div className={`h-5 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${newBlog.title.trim() || newBlog.content.trim() ? 'bg-amber-400 animate-pulse' : isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {editingBlog ? 'Editing' : 'Draft'}
                <span className="hidden sm:inline"> — <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>{localStorage.getItem("userName") || "Private"}</span></span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNewBlog({ title: "", content: "", tags: "" });
                setEditingBlog(null);
                setViewMode("feed");
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer
                ${isDark
                  ? 'text-gray-400 hover:text-white hover:bg-white/10 border border-white/[0.12]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              Discard
            </button>
            <button
              onClick={editingBlog ? handleUpdateBlog : handleCreateBlog}
              disabled={!newBlog.title.trim() || !newBlog.content.trim()}
              className="px-5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
            >
              {editingBlog ? '✓ Update' : '🚀 Publish'}
            </button>
          </div>
        </motion.div>

        {/* ── Content Area ── */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="flex-1 px-6 md:px-4 py-10"
        >
          {/* Title Input */}
          <input
            type="text"
            value={newBlog.title}
            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
            placeholder="Title"
            required
            className={`w-full bg-transparent text-4xl md:text-5xl font-serif font-bold outline-none border-none p-0 mb-2 leading-tight transition-colors
              ${isDark
                ? 'text-white placeholder:text-gray-600'
                : 'text-gray-900 placeholder:text-gray-300'
              }`}
          />

          {/* Subtle Divider */}
          <div className={`w-16 h-0.5 mb-8 rounded-full ${isDark ? 'bg-gradient-to-r from-indigo-500/50 to-transparent' : 'bg-gradient-to-r from-blue-400/40 to-transparent'}`} />

          {/* CKEditor 5 WYSIWYG Editor */}
          <CKEditorRichText
            content={newBlog.content}
            onChange={(html) => setNewBlog({ ...newBlog, content: html })}
            isDark={isDark}
            placeholder="Tell your story..."
          />

          {/* ── Tags Section ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <label className={`text-xs font-semibold uppercase tracking-wider mb-3 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={newBlog.tags}
              onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
              placeholder="e.g. Algorithm, Interview, Dynamic Programming"
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200
                ${isDark
                  ? 'bg-white/[0.04] border border-white/[0.08] text-gray-300 placeholder:text-gray-600 focus:border-indigo-500/40 focus:bg-white/[0.06]'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white'
                }`}
            />
            {/* Tag Pills Preview */}
            {newBlog.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {newBlog.tags.split(',').map((tag, i) => {
                  const trimmed = tag.trim();
                  if (!trimmed) return null;
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                        ${isDark
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}
                    >
                      {trimmed}
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* ── Bottom Status Bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`sticky bottom-0 px-6 py-3 flex items-center justify-between text-xs
            ${isDark
              ? 'bg-[#070b14]/90 backdrop-blur-md border-t border-white/[0.10] text-gray-600'
              : 'bg-white/90 backdrop-blur-md border-t border-gray-200/60 text-gray-400'
            }`}
        >
          <div className="flex items-center gap-4">
            <span>{editorWordCount} {editorWordCount === 1 ? 'word' : 'words'}</span>
            <span className={`${isDark ? 'text-white/10' : 'text-gray-300'}`}>·</span>
            <span>{editorReadTime} min read</span>
          </div>
          <span className={`${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
            {newBlog.title.trim() && newBlog.content.trim() ? '✓ Ready to publish' : 'Add title & content to publish'}
          </span>
        </motion.div>
      </div>
    </div>
  );

  // 2. READER VIEW
  const renderReader = () => {
    const currentBlog = blogs.find((b) => getBlogId(b) === getBlogId(selectedBlog)) || selectedBlog;
    if (!currentBlog) return null;
    const blogComments = comments[getBlogId(currentBlog)] || [];

    return (
      <div className={`fixed inset-0 z-50 ${bgClass} overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 font-sans selection:bg-purple-500/30`}>
        {/* Navbar */}
        <div className={`sticky top-0 z-20 ${glassClass} border-b ${borderClass} py-3 px-6 flex justify-between items-center max-w-[100vw]`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode("feed")} className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-full ${secondaryText} hover:${titleClass} transition-colors cursor-pointer`}>
              <ArrowLeft size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {(currentBlog.author?._id === userId || currentBlog.author === userId) && (
              <button onClick={() => openCreateMode(currentBlog)} className={`${secondaryText} hover:${titleClass} text-sm hover:underline cursor-pointer`}>Edit Story</button>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {localStorage.getItem("userName")?.[0]}
            </div>
          </div>
        </div>

        <article className="max-w-[680px] mx-auto px-6 py-16">
          {/* Title */}
          <h1 className={`text-4xl md:text-5xl font-bold ${titleClass} font-serif leading-tight mb-8`}>
            {currentBlog.title}
          </h1>

          {/* Author Meta */}
          <div className="flex items-center gap-4 mb-10">
            <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center`}>
              <User size={24} className={secondaryText} />
            </div>
            <div>
              <p className={`${titleClass} font-medium`}>{getAuthorName(currentBlog.author)}</p>
              <p className={`${secondaryText} text-sm`}>
                {getRelativeTime(currentBlog.date || currentBlog.createdAt)} · {calculateReadTime(currentBlog.content)}
              </p>
            </div>
          </div>

          {/* Content - Rendered HTML */}
          <div
            className={`prose ${isDark ? 'prose-invert' : ''} prose-lg max-w-none break-words [&_img]:max-w-full [&_img]:h-auto [&_iframe]:max-w-full`}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '18px',
              lineHeight: '1.8',
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentBlog.content || '') }}
          />

          {/* Tags Footer */}
          <div className={`mt-16 pt-8 border-t ${borderClass}`}>
            <div className="flex flex-wrap gap-2 mb-8">
              {currentBlog.tags?.map(tag => (
                <span key={tag} className={`px-3 py-1 ${isDark ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-black'} rounded-full text-sm cursor-pointer transition-colors`}>
                  {tag}
                </span>
              ))}
            </div>

            <div className={`flex items-center justify-between ${secondaryText}`}>
              <div className="flex items-center gap-6">
                <button onClick={() => handleLike(getBlogId(currentBlog))} className={`flex items-center gap-2 transition-colors cursor-pointer ${currentBlog.liked ? "text-red-500" : `hover:${titleClass}`}`}>
                  <Heart size={20} className={currentBlog.liked ? "fill-current" : ""} />
                  <span>{currentBlog.likes || 0}</span>
                </button>
                <button className={`flex items-center gap-2 hover:${titleClass} transition-colors cursor-pointer`}>
                  <MessageCircle size={20} />
                  <span>{currentBlog.comments || 0}</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleShare(getBlogId(currentBlog))} className={`hover:${titleClass} transition-colors cursor-pointer`}>
                  <Share2 size={20} />
                </button>
                <button onClick={() => handleBookmark(getBlogId(currentBlog))} className={`hover:${titleClass} transition-colors cursor-pointer`}>
                  <Bookmark size={20} className={currentBlog.bookmarked ? "fill-current" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className={`mt-12 pt-8 border-t ${borderClass}`}>
            <h3 className={`text-xl font-bold font-serif ${titleClass} mb-6`}>Responses ({blogComments.length})</h3>

            {/* Input */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-50'} mb-8`}>
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold`}>
                  {localStorage.getItem("userName")?.[0] || "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    className={`w-full bg-transparent outline-none ${textClass} placeholder-gray-400 resize-none min-h-[60px]`}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handlePostComment(getBlogId(currentBlog))}
                      disabled={!newComment.trim()}
                      className="px-4 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-6">
              {blogComments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-xs font-bold ${secondaryText}`}>
                    {comment.user[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${titleClass}`}>{comment.user}</span>
                      <span className={`text-xs ${secondaryText}`}>{getRelativeTime(comment.date)}</span>
                    </div>
                    <p className={`text-sm ${textClass}`}>{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </article>
      </div>
    )
  };

  // --- 4. MAIN LAYOUT (FEED) ---

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} font-sans selection:bg-purple-500/30 transition-colors duration-300`}>

      {/* Modals & Overlays */}
      <LoginModal
        isOpen={loginModalConfig.isOpen}
        onClose={() => setLoginModalConfig({ ...loginModalConfig, isOpen: false })}
        title={loginModalConfig.title}
        message={loginModalConfig.message}
        context={loginModalConfig.context}
      />
      {viewMode === "create" && renderEditor()}
      <AnimatePresence>
        {viewMode === "read" && renderReader()}
      </AnimatePresence>
      <Alert isOpen={alertConfig.isOpen} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} customButtons={alertConfig.customButtons} />

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-30 ${glassClass} border-b ${borderClass} px-4 h-16 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="cursor-pointer group flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-all duration-300 ${isDark ? "bg-white/10 group-hover:bg-white/20" : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20"}`}>
                <Code className={`w-6 h-6 group-hover:rotate-12 transition-transform duration-300 ${isDark ? "text-white" : "text-blue-600"}`} />
              </div>
            </Link>
            <span className={`font-serif font-bold text-xl ${titleClass} tracking-tight hidden sm:block`}>AlgoViz Blog</span>

            {/* Search */}
            <div className={`ml-4 pl-4 border-l ${borderClass} hidden md:block`}>
              <div className="relative group">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${secondaryText} group-focus-within:${titleClass} transition-colors`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`${inputBg} rounded-full pl-9 pr-4 py-1.5 text-sm ${titleClass} placeholder-gray-500 outline-none w-64 transition-all focus:ring-1 focus:ring-white/20`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className={`hidden lg:flex items-center gap-2 ${secondaryText} hover:${titleClass} transition-colors text-sm font-medium mr-2 cursor-pointer`}>
              <Home size={18} />
              Home
            </Link>

            <button
              onClick={() => isAuthenticated ? openCreateMode() : setLoginModalConfig({
                isOpen: true,
                title: "Start writing?",
                message: "Sign in to share your knowledge with the AlgoViz community.",
                context: "default"
              })}
              className={`hidden sm:flex items-center gap-2 ${secondaryText} hover:${titleClass} transition-colors text-sm font-medium mr-2 cursor-pointer`}
            >
              <PenTool size={16} />
              Write
            </button>
            {isAuthenticated ? (
              <UserAvatar
                src={user?.avatar}
                alt={user?.name || "User"}
                fallback={user?.name || localStorage.getItem("userName") || "User"}
                className="w-9 h-9 rounded-full"
                borderClass={borderClass}
              />
            ) : (
              <button onClick={() => setLoginModalConfig({
                isOpen: true,
                title: "Welcome to AlgoViz Blog",
                message: "Sign in to read articles, save stories, and join the community.",
                context: "default"
              })} className={`px-4 py-1.5 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} rounded-full text-sm font-medium transition-colors cursor-pointer`}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* LEFT: FEED (8 cols ~ 66%) */}
        <main className="lg:col-span-8 space-y-8">

          {/* Feeds Toggle */}
          <div className={`flex items-center gap-6 border-b ${borderClass} pb-4 mb-8`}>
            <button
              onClick={() => setFeedFilter("all")}
              className={`pb-4 -mb-4 text-sm font-medium transition-colors cursor-pointer ${feedFilter === "all" ? `${titleClass} border-b-2 ${isDark ? 'border-white' : 'border-black'}` : `${secondaryText} hover:${titleClass}`}`}
            >
              For you
            </button>
            <button
              onClick={() => setFeedFilter("my")}
              className={`pb-4 -mb-4 text-sm font-medium transition-colors cursor-pointer ${feedFilter === "my" ? `${titleClass} border-b-2 ${isDark ? 'border-white' : 'border-black'}` : `${secondaryText} hover:${titleClass}`}`}
            >
              My Stories
            </button>
            {
              activeTag && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${secondaryText} uppercase`}>Filtered by:</span>
                  <span className={`px-2 py-1 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} rounded text-xs font-bold flex items-center gap-1`}>
                    {activeTag}
                    <X size={12} className="cursor-pointer" onClick={() => setActiveTag(null)} />
                  </span>
                </div>
              )
            }

            {/* Sort Dropdown */}
            <div className="ml-auto relative group z-10">
              <button className={`flex items-center gap-2 text-sm font-medium ${secondaryText} hover:${titleClass} transition-colors cursor-pointer py-2`}>
                <ArrowUpDown size={14} />
                <span className="hidden sm:inline">Sort: {sortOption === 'recent' ? 'Most Recent' : sortOption === 'liked' ? 'Most Liked' : 'Most Discussed'}</span>
              </button>

              {/* Dropdown Menu - using pt-2 inside wrapper to maintain hover */}
              <div className="absolute left-1 top-full pt-1 hidden group-hover:block">
                <div className={`w-35 rounded-xl shadow-xl border ${borderClass} ${isDark ? 'bg-[#0f172a]' : 'bg-white'} overflow-hidden`}>
                  <button
                    onClick={() => setSortOption("recent")}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${sortOption === 'recent' ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black') : `${secondaryText} hover:${titleClass} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}`}
                  >
                    Most Recent
                  </button>
                  <button
                    onClick={() => setSortOption("liked")}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${sortOption === 'liked' ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black') : `${secondaryText} hover:${titleClass} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}`}
                  >
                    Most Liked
                  </button>
                  <button
                    onClick={() => setSortOption("popular")}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${sortOption === 'popular' ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black') : `${secondaryText} hover:${titleClass} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}`}
                  >
                    Most Discussed
                  </button>
                </div>
              </div>
            </div>
          </div >

          {
            loading ? (
              <>
                <BlogSkeleton theme={theme} />
                <BlogSkeleton theme={theme} />
                <BlogSkeleton theme={theme} />
              </>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-20">
                <p className={`${secondaryText} mb-4`}>
                  {feedFilter === "my" ? "You haven't written any stories yet." : "No stories found matching your criteria."}
                </p>
                <button onClick={() => openCreateMode()} className={`${titleClass} underline cursor-pointer hover:no-underline`}>
                  Start writing
                </button>
              </div>
            ) : (
              filteredBlogs.map(blog => (
                <article key={getBlogId(blog)} className={`group py-8 border-b ${borderClass} last:border-0`}>
                  <div className="flex gap-6 justify-between items-start">
                    <div className="flex-1">
                      {/* Meta Top */}
                      <div className={`flex items-center gap-2 mb-2 text-xs ${secondaryText}`}>
                        <div className={`w-5 h-5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center`}>
                          <User size={12} className={secondaryText} />
                        </div>
                        <span className={`${textClass} font-medium`}>{getAuthorName(blog.author)}</span>
                        <span>·</span>
                        <span>{getRelativeTime(blog.date || blog.createdAt)}</span>
                      </div>

                      {/* Title & Excerpt */}
                      <Link
                        to="#"
                        onClick={(e) => { e.preventDefault(); openReadMode(blog); }}
                        className="block cursor-pointer"
                      >
                        <h2 className={`text-xl md:text-2xl font-bold ${titleClass} font-serif mb-2 leading-tight group-hover:${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors`}>
                          {blog.title}
                        </h2>
                        <p className={`text-sm ${secondaryText} line-clamp-2 md:line-clamp-3 font-serif leading-relaxed mb-4`}>
                          {stripHtml(blog.content)}
                        </p>
                      </Link>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 ${isDark ? 'bg-white/10' : 'bg-gray-100'} rounded text-[10px] ${secondaryText} uppercase tracking-wide font-medium`}>
                            {blog.tags?.[0] || "General"}
                          </span>
                          <span className={`text-xs ${secondaryText}`}>
                            {calculateReadTime(blog.content)}
                          </span>
                        </div>
                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleBookmark(getBlogId(blog))} className={`${secondaryText} hover:${titleClass} cursor-pointer`}>
                            <Bookmark size={18} className={blog.bookmarked ? "fill-current" : ""} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Optional Right Thumbnail place - Text Only for now */}
                  </div>
                </article>
              ))
            )}
        </main>

        {/* RIGHT: SIDEBAR (4 cols ~ 33%) */}
        <aside className={`hidden lg:block lg:col-span-4 pl-10 border-l ${borderClass}`}>
          <div className="sticky top-24 space-y-10">

            {/* Discover */}
            <div>
              <h3 className={`text-xs font-bold ${titleClass} uppercase tracking-wider mb-6`}>Discover more</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`px-3 py-2 rounded-full border text-sm transition-all cursor-pointer ${activeTag === tag ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : `${borderClass} ${secondaryText} hover:border-gray-400 hover:${titleClass}`}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Meta Links */}
            <div className={`pt-8 border-t ${borderClass} text-xs ${secondaryText} leading-relaxed`}>
              <p className="mb-4">
                AlgoViz is a community of builders and learners. Share your knowledge with the world.
              </p>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogPage;
