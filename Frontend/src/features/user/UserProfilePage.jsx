import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../core/context/UserContext";
import { useTheme } from "../../core/context/ThemeContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Settings, CreditCard, Lock, Video, History, Receipt,
  Camera, Github, Linkedin, Globe, Save, LogOut, Code2, MapPin,
  ArrowLeft, Mail, Crown, Zap, Infinity, CheckCircle, Menu, X,
  ChevronRight, Calendar, ExternalLink, Loader2
} from "lucide-react";
import Alert from "../../components/Alert";
import SecureStorage from "../../core/utils/secureStorage";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const SKILL_TAGS = ["C++", "Java", "Python", "JavaScript", "React", "Node.js", "System Design"];

// --- MOCK DATA ---
const MOCK_INTERVIEWS = [
  { id: 1, mentorName: "Alex Chen", mentorCompany: "Google", date: "2025-12-20", time: "10:00 AM", status: "Scheduled", meetLink: "#", topic: "System Design - Scalability" },
  { id: 2, mentorName: "Sarah Jones", mentorCompany: "Netflix", date: "2025-12-18", time: "2:00 PM", status: "Completed", meetLink: "#", topic: "Frontend - React Performance" },
];

const MOCK_INTERVIEW_HISTORY = [
  { id: "1", title: "Frontend System Design", date: "Dec 18, 2025", duration: "45 min", score: 92, status: "Passed", type: "System Design" },
  { id: "2", title: "DSA - Graph Algorithms", date: "Dec 15, 2025", duration: "60 min", score: 65, status: "Needs Improvement", type: "DSA" },
];

const MOCK_TRANSACTIONS = [
  { _id: "tx_101", description: "Placement Pass (Premium)", category: "SUBSCRIPTION", date: "2024-03-10", amount: 50, currency: "INR", type: "DEBIT", status: "SUCCESS" },
  { _id: "tx_102", description: "Mock Interview: Amazon SDE", category: "MOCK_INTERVIEW", date: "2024-03-05", amount: 100, currency: "INR", type: "DEBIT", status: "SUCCESS" },
];

// --- UTILS ---
const getStatusColor = (status, isDark) => {
  const base = isDark ? "bg-opacity-10 border-opacity-20" : "bg-opacity-20 border-opacity-30";
  switch (status) {
    case "Scheduled": return `bg-blue-500/10 text-blue-500 border-blue-500/20 ${(isDark ? "text-blue-400" : "text-blue-600")}`;
    case "Completed": case "Passed": case "SUCCESS": return `bg-emerald-500/10 text-emerald-500 border-emerald-500/20 ${(isDark ? "text-emerald-400" : "text-emerald-600")}`;
    case "Cancelled": case "Failed": return `bg-red-500/10 text-red-500 border-red-500/20 ${(isDark ? "text-red-400" : "text-red-600")}`;
    default: return `bg-amber-500/10 text-amber-500 border-amber-500/20 ${(isDark ? "text-amber-400" : "text-amber-600")}`;
  }
};

// --- SUB-COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, id, activeTab, setActiveTab, isDark }) => {
  const isActive = activeTab === id;
  const activeClass = isDark
    ? "bg-[#1C1C1E] text-white border-l-2 border-cyan-500"
    : "bg-slate-100 text-slate-900 border-l-2 border-cyan-600";

  const inactiveClass = isDark
    ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-r-md transition-all text-sm font-medium cursor-pointer ${isActive ? activeClass : inactiveClass}`}
    >
      <Icon size={16} className={isActive ? (isDark ? "text-cyan-400" : "text-cyan-600") : "opacity-70"} />
      {label}
    </button>
  );
};

const SectionHeader = ({ title, description, action, isDark }) => (
  <div className={`flex items-center justify-between border-b pb-5 mb-8 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
    <div>
      <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{description}</p>
    </div>
    {action}
  </div>
);

const InputGroup = ({ label, children, isDark }) => (
  <div className="space-y-1.5">
    <label className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{label}</label>
    {children}
  </div>
);

const MinimalInput = ({ size = "md", className = "", isDark, ...props }) => {
  const bgClass = isDark ? "bg-[#0B0C10] text-slate-200 border-white/10 focus:border-cyan-500 placeholder:text-slate-700" : "bg-white text-slate-900 border-slate-200 focus:border-cyan-600 placeholder:text-slate-400";
  return (
    <input
      {...props}
      className={`w-full border-b px-0 py-2.5 text-sm focus:outline-none focus:bg-transparent transition-all ${bgClass} ${className}`}
    />
  );
};

const UserProfilePage = () => {
  const { user, setUser, setIsAuthenticated } = useContext(AuthContext);
  const { theme, isDark } = useTheme(); // Theme Hook
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ name: "", email: "", avatar: "", bio: "", location: "", website: "", github: "", linkedin: "", skills: [] });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUserId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${VITE_API_BASE_URL}/users/getUserDetail/${storedUserId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 200) {
          setUser(response.data);
          setIsAuthenticated(true);
          const d = response.data;
          setFormData({
            name: d.name || "", email: d.email || "", avatar: d.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            bio: d.bio || "", location: d.location || "", website: d.website || "", github: d.github || "", linkedin: d.linkedin || "", skills: d.skills || [],
          });
          setLoading(false);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          SecureStorage.removeItem("user_cache");
          setIsAuthenticated(false);
          setUser(null);
          navigate("/signin");
        }
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [setUser, setIsAuthenticated, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(`${VITE_API_BASE_URL}/users/profile/${user?._id}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (response.status === 200) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        SecureStorage.setItem("user_cache", updatedUser);
        setAlertConfig({ isOpen: true, message: "Settings saved successfully", type: "success" });
      }
    } catch (error) {
      setAlertConfig({ isOpen: true, message: "Failed to save settings", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, avatar: URL.createObjectURL(file) });
  };

  const handlePasswordReset = async () => {
    try {
      await axios.post(`${VITE_API_BASE_URL}/users/forgot-password`, { email: formData.email }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setAlertConfig({ isOpen: true, message: "Reset link sent to your email", type: "success" });
    } catch {
      setAlertConfig({ isOpen: true, message: "Error sending reset link", type: "error" });
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`} />
    </div>
  );

  // --- STYLES ---
  const BG_MAIN = isDark ? "bg-[#020617]" : "bg-slate-50";
  const BG_SIDEBAR = isDark ? "bg-[#020204]" : "bg-white";
  const BG_CONTENT = isDark ? "bg-[#0B0C10]" : "bg-slate-50";
  const TEXT_PRIMARY = isDark ? "text-slate-200" : "text-slate-900";
  const TEXT_SECONDARY = isDark ? "text-slate-400" : "text-slate-500";
  const BORDER = isDark ? "border-white/10" : "border-slate-200";
  const CARD_BG = isDark ? "bg-[#1C1C1E] border-white/5" : "bg-white border-slate-200";

  return (
    <div className={`min-h-screen font-sans flex overflow-hidden transition-colors duration-300 ${BG_MAIN} ${TEXT_PRIMARY}`}>
      <Alert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} />

      {/* --- SIDEBAR --- */}
      <aside className={`fixed lg:relative z-50 h-screen w-64 ${BG_SIDEBAR} border-r ${BORDER} flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className={`h-16 flex items-center px-6 border-b ${BORDER}`}>
          <button onClick={() => navigate('/')} className={`flex items-center gap-2 cursor-pointer group transition-colors ${TEXT_SECONDARY} hover:${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className={`p-1.5 rounded-md transition-colors ${isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
              <ArrowLeft size={14} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">Back to App</span>
          </button>
        </div>

        {/* Branding/User Mini */}
        <div className="px-6 py-6 pb-2">
          <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
          {/* Account Group */}
          <div className="space-y-1">
            <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Account</div>
            <SidebarItem icon={User} label="Profile" id="profile" activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
            <SidebarItem icon={Settings} label="Preferences" id="preferences" activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
            <SidebarItem icon={CreditCard} label="Billing" id="billing" activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
            <SidebarItem icon={Lock} label="Security" id="security" activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
          </div>

          {/* Workplace Group */}
          <div className="space-y-1">
            <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Workplace</div>
            <SidebarItem icon={Video} label="Interviews" id="interviews" activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
            <SidebarItem icon={History} label="History" id="history" activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
            <SidebarItem icon={Receipt} label="Invoices" id="transactions" activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${BORDER}`}>
          <button
            onClick={() => { setUser(null); setIsAuthenticated(false); localStorage.clear(); navigate('/'); }}
            className="flex items-center gap-3 w-full px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-md transition-all text-sm font-medium cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- CONTENT AREA --- */}
      <main className={`flex-1 ${BG_CONTENT} relative flex flex-col h-screen overflow-hidden`}>
        {/* Top Bar (Mobile Only) */}
        <div className={`lg:hidden h-16 ${BG_SIDEBAR} border-b ${BORDER} flex items-center px-4 justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 cursor-pointer"><Menu size={20} /></button>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto px-6 py-10 lg:px-12 lg:py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="pb-20"
              >

                {/* === PROFILE TAB === */}
                {activeTab === "profile" && (
                  <>
                    <SectionHeader
                      title="Public Profile"
                      description="Manage your public-facing information."
                      isDark={isDark}
                      action={
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`px-5 py-2 text-xs uppercase font-bold tracking-wide rounded transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer ${isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                          {isSaving && <Loader2 size={12} className="animate-spin" />}
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      }
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                      {/* Left Column (Forms) */}
                      <div className="lg:col-span-2 space-y-10">
                        {/* Basic Info */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Display Name" isDark={isDark}>
                              <MinimalInput name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" isDark={isDark} />
                            </InputGroup>
                            <InputGroup label="Email" isDark={isDark}>
                              <MinimalInput value={formData.email} disabled className="opacity-50 cursor-not-allowed" isDark={isDark} />
                            </InputGroup>
                          </div>

                          <InputGroup label="Bio" isDark={isDark}>
                            <textarea
                              name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell us about yourself..."
                              className={`w-full border-b px-0 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed ${isDark ? "bg-[#0B0C10] border-white/10 text-slate-200 placeholder:text-slate-700" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"}`}
                            />
                          </InputGroup>
                        </div>

                        {/* Details */}
                        <div className="space-y-6 pt-2">
                          <h3 className={`text-sm font-medium pb-2 border-b ${isDark ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`}>Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Location" isDark={isDark}>
                              <div className="relative">
                                <MapPin size={14} className="absolute left-0 top-3 text-slate-500" />
                                <MinimalInput name="location" value={formData.location} onChange={handleChange} className="pl-6" placeholder="City" isDark={isDark} />
                              </div>
                            </InputGroup>
                            <InputGroup label="Website" isDark={isDark}>
                              <div className="relative">
                                <Globe size={14} className="absolute left-0 top-3 text-slate-500" />
                                <MinimalInput name="website" value={formData.website} onChange={handleChange} className="pl-6" placeholder="https://" isDark={isDark} />
                              </div>
                            </InputGroup>
                          </div>
                        </div>

                        {/* Socials */}
                        <div className="space-y-6 pt-2">
                          <h3 className={`text-sm font-medium pb-2 border-b ${isDark ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`}>Social Profiles</h3>
                          <div className="space-y-5">
                            <div className="flex items-center gap-4">
                              <Github size={18} className="text-slate-500 shrink-0" />
                              <MinimalInput name="github" value={formData.github} onChange={handleChange} placeholder="GitHub username" isDark={isDark} />
                            </div>
                            <div className="flex items-center gap-4">
                              <Linkedin size={18} className="text-slate-500 shrink-0" />
                              <MinimalInput name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" isDark={isDark} />
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-6 pt-2">
                          <h3 className={`text-sm font-medium pb-2 border-b ${isDark ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`}>Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {SKILL_TAGS.map(skill => (
                              <button
                                key={skill}
                                onClick={() => setFormData({ ...formData, skills: formData.skills.includes(skill) ? formData.skills.filter(s => s !== skill) : [...formData.skills, skill] })}
                                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${formData.skills.includes(skill)
                                  ? (isDark ? "bg-cyan-950/30 border-cyan-500/50 text-cyan-400" : "bg-cyan-50 border-cyan-300 text-cyan-700")
                                  : (isDark ? "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10" : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50")
                                  }`}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column (Avatar & Stats) */}
                      <div className={`lg:border-l lg:pl-12 flex flex-col items-center lg:items-start ${isDark ? 'lg:border-white/5' : 'lg:border-slate-200'}`}>
                        <div className="relative group cursor-pointer mb-8" onClick={() => fileInputRef.current?.click()}>
                          <div className={`w-40 h-40 rounded-full border overflow-hidden relative shadow-2xl ${isDark ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-slate-200'}`}>
                            <img src={formData.avatar} className="w-full h-full object-cover opacity-90 group-hover:opacity-50 transition-opacity duration-300" alt="Avatar" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                              <Camera size={24} className={isDark ? "text-white" : "text-slate-900"} />
                              <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isDark ? "text-white" : "text-slate-900"}`}>Change</span>
                            </div>
                          </div>
                          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>

                        <div className="w-full space-y-6 max-w-xs">
                          <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                            <span className="text-sm text-slate-500">Member Since</span>
                            <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}</span>
                          </div>

                          <div className="space-y-4 pt-2">
                            <div className={`border p-4 rounded-lg ${CARD_BG}`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Plan</span>
                                {user?.isPremium && <Crown size={12} className="text-amber-500" />}
                              </div>
                              <div className={`text-lg font-bold ${user?.isPremium ? 'text-amber-400' : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                                {user?.isPremium ? 'Premium Pro' : 'Free Tier'}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className={`border p-3 rounded-lg text-center ${CARD_BG}`}>
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Credits</div>
                                <div className={`text-lg font-mono font-bold flex justify-center items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {user?.isPremium ? <Infinity size={18} /> : user?.balance || 0}
                                </div>
                              </div>
                              <div className={`border p-3 rounded-lg text-center ${CARD_BG}`}>
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Runs</div>
                                <div className={`text-lg font-mono font-bold flex justify-center items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {user?.isPremium ? <Infinity size={18} /> : `${user?.credits || 0}/3`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* === BILLING TAB === */}
                {activeTab === "billing" && (
                  <div className="max-w-3xl">
                    <SectionHeader title="Billing & Usage" description="Manage usage limits and subscription." isDark={isDark} />

                    {/* Plan Card (Horizontal) */}
                    <div className={`border rounded-lg p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 ${CARD_BG}`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded flex items-center justify-center border ${user?.isPremium ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : (isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-500')}`}>
                          <Crown size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Plan</div>
                          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.isPremium ? "Premium Pro" : "Hobby Tier"}</div>
                        </div>
                      </div>
                      {!user?.isPremium && (
                        <button onClick={() => navigate('/premium')} className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-bold rounded shadow-lg shadow-orange-900/20 transition-all cursor-pointer">
                          Upgrade to Pro
                        </button>
                      )}
                    </div>

                    {/* Usage Bars */}
                    <div className="space-y-8">
                      <h3 className={`text-sm font-medium border-b pb-2 ${isDark ? 'text-white border-white/5' : 'text-slate-900 border-slate-200'}`}>Usage Limits</h3>

                      {/* Runs */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-2">
                          <span className="text-slate-400">Daily Code Runs</span>
                          <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.isPremium ? "Unlimited" : `${user?.credits || 0} / 3`}</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                          <div
                            className={`h-full ${user?.isPremium ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                            style={{ width: user?.isPremium ? '100%' : `${((user?.credits || 0) / 3) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">Resets every 24 hours.</p>
                      </div>

                      {/* Credits */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-2">
                          <span className="text-slate-400">Wallet Balance</span>
                          <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.balance || 0} pts</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                          <div className="h-full bg-indigo-500 w-full opacity-30" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* === INTERVIEWS TAB === */}
                {activeTab === "interviews" && (
                  <div>
                    <SectionHeader title="Interviews" description="Manage your sessions." isDark={isDark} action={
                      <button className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded border transition-colors cursor-pointer ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'}`}>+ Book New</button>
                    } />

                    <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-white/5 bg-[#1C1C1E]/50' : 'border-slate-200 bg-white'}`}>
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className={`border-b text-xs font-bold text-slate-500 uppercase tracking-wider ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Topic</th>
                            <th className="px-6 py-4 font-bold">Mentor</th>
                            <th className="px-6 py-4 font-bold">Date</th>
                            <th className="px-6 py-4 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                          {MOCK_INTERVIEWS.length > 0 ? MOCK_INTERVIEWS.map(item => (
                            <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(item.status, isDark)}`}>
                                  {item.status}
                                </div>
                              </td>
                              <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.topic}</td>
                              <td className="px-6 py-4 text-slate-400">
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>{item.mentorName[0]}</div>
                                  {item.mentorName}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.date}</td>
                              <td className="px-6 py-4 text-right">
                                {item.status === "Scheduled" ? (
                                  <a href={item.meetLink} className="text-cyan-500 hover:text-cyan-600 text-xs font-bold uppercase tracking-wide cursor-pointer">Join Room</a>
                                ) : (
                                  <span className="text-slate-400 text-xs">--</span>
                                )}
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No interviews found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* === HISTORY TAB === */}
                {activeTab === "history" && (
                  <div>
                    <SectionHeader title="History" description="Past performance data." isDark={isDark} />

                    <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-white/5 bg-[#1C1C1E]/50' : 'border-slate-200 bg-white'}`}>
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className={`border-b text-xs font-bold text-slate-500 uppercase tracking-wider ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                            <th className="px-6 py-4 font-bold w-12"></th>
                            <th className="px-6 py-4 font-bold">Session</th>
                            <th className="px-6 py-4 font-bold">Score</th>
                            <th className="px-6 py-4 font-bold">Date</th>
                            <th className="px-6 py-4 font-bold text-right">Report</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                          {MOCK_INTERVIEW_HISTORY.map(item => (
                            <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                              <td className="px-6 py-4">
                                <div className={`w-2 h-2 rounded-full mx-auto ${item.status === "Passed" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-500"}`} />
                              </td>
                              <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.title}</td>
                              <td className={`px-6 py-4 font-mono font-bold ${item.score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{item.score}/100</td>
                              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.date}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => navigate(`/interview-result/${item.id}`)} className={`p-2 rounded transition-colors cursor-pointer ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'}`}>
                                  <ExternalLink size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* === TRANSACTIONS TAB === */}
                {activeTab === "transactions" && (
                  <div>
                    <SectionHeader title="Transactions" description="Invoice history." isDark={isDark} />

                    <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-white/5 bg-[#1C1C1E]/50' : 'border-slate-200 bg-white'}`}>
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className={`border-b text-xs font-bold text-slate-500 uppercase tracking-wider ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                            <th className="px-6 py-4 font-bold">Description</th>
                            <th className="px-6 py-4 font-bold">Date</th>
                            <th className="px-6 py-4 font-bold text-right">Amount</th>
                            <th className="px-6 py-4 font-bold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                          {MOCK_TRANSACTIONS.map(tx => (
                            <tr key={tx._id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                              <td className="px-6 py-4">
                                <div className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{tx.description}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tx._id}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tx.date}</td>
                              <td className={`px-6 py-4 text-right font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₹{tx.amount}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{tx.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* === SECURITY TAB === */}
                {activeTab === "security" && (
                  <div className="max-w-2xl">
                    <SectionHeader title="Security" description="Manage credentials and access." isDark={isDark} />

                    <div className="space-y-6">
                      <div className={`border p-6 rounded-lg flex items-center justify-between ${CARD_BG}`}>
                        <div>
                          <div className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Email Address</div>
                          <div className="text-sm text-slate-500">{formData.email}</div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded">
                          <CheckCircle size={12} /> Verified
                        </div>
                      </div>

                      <div className={`pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                        <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Password</h3>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">Last changed 3 months ago</div>
                          <button onClick={handlePasswordReset} className={`px-4 py-2 border rounded transition-colors text-sm font-medium cursor-pointer ${isDark ? 'border-white/10 hover:border-white/20 text-slate-300 hover:text-white' : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'}`}>
                            Reset Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
