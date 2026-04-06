import React, { useState, useEffect } from "react";
import {
  Shield,
  ChevronRight,
  LogOut,
  Building2,
  Calendar,
  Video,
  CheckCircle,
  Star,
  Wallet,
  Settings,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

// Custom Components
import LoginView from "./LoginView";
import SlotsTab from "./SlotsTab";
import SessionsTab from "./SessionsTab";
import FeedbackTab from "./FeedbackTab";
import HistoryTab from "./HistoryTab";
import ReviewsTab from "./ReviewsTab";
import PaymentsTab from "./PaymentsTab";
import SettingsPage from "./SettingsPage";
import { LoadingBar } from "./Common";

const MentorPortal = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("slots");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Auth State
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  // Data State
  const [mentorProfile, setMentorProfile] = useState({});
  const [schedule, setSchedule] = useState({});
  const [datesToRender, setDatesToRender] = useState([]);
  const [sessions, setSessions] = useState([]);

  // History Calendar State
  const [showHistoryCalendar, setShowHistoryCalendar] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  // Mock Data (Replace with API calls eventually)
  const [stats, setStats] = useState({
    completedSessions: 45,
    rating: 4.8,
    reviews: 120,
    earnings: {
      total: 1250,
      pending: 150,
      available: 1100,
    },
  });

  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "John D.",
      rating: 5,
      comment: "Excellent explanation of System Design!",
      date: "2 days ago",
    },
    {
      id: 2,
      user: "Sarah M.",
      rating: 4,
      comment: "Great code review, but connection was spotty.",
      date: "1 week ago",
    },
  ]);

  const [history, setHistory] = useState([
    {
      id: 101,
      transactionId: "TXN-8839",
      invoiceId: "INV-00123",
      user: "Mike Ross",
      topic: "DSA - Graphs",
      date: "Dec 18, 2025",
      status: "Completed",
      payout: 50,
    },
    {
      id: 102,
      transactionId: "TXN-8838",
      invoiceId: "INV-00122",
      user: "Rachel Zane",
      topic: "Frontend System Design",
      date: "Dec 15, 2025",
      status: "Completed",
      payout: 50,
    },
    {
      id: 103,
      transactionId: "TXN-8837",
      invoiceId: "INV-00121",
      user: "Harvey Specter",
      topic: "Backend Architecture",
      date: "Dec 12, 2025",
      status: "Processing",
      payout: 50,
    },
    {
      id: 104,
      transactionId: "TXN-8836",
      invoiceId: "INV-00120",
      user: "Louis Litt",
      topic: "System Design - Load Balancing",
      date: "Dec 10, 2025",
      status: "Completed",
      payout: 50,
    },
  ]);

  const TIME_SLOTS = [
    "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM",
    "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    setDatesToRender(days);

    const token = localStorage.getItem("mentorToken");
    if (token) {
      setIsAuthenticated(true);
      fetchMentorProfile(token);
    }
  }, []);

  // --- API ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setShake(false);

    try {
      const res = await axios.post(`${API_BASE_URL}/mentor/signin`, loginData);
      localStorage.setItem("mentorToken", res.data.token);
      localStorage.setItem("mentorId", res.data.mentor._id || res.data.mentor.id);

      setIsAuthenticated(true);
      // Set profile directly from login response to avoid extra call
      setMentorProfile(res.data.mentor);

      // Transform availability
      const scheduleMap = {};
      if (res.data.mentor.availability) {
        res.data.mentor.availability.forEach((day) => {
          const dateKey = new Date(day.date).toISOString().split("T")[0];
          scheduleMap[dateKey] = day.slots.map((s) => s.time);
        });
      }
      setSchedule(scheduleMap);

    } catch (err) {
      console.error(err);
      setAuthError("Invalid credentials or server error");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("mentorToken");
    localStorage.removeItem("mentorId");
  };

  const fetchMentorProfile = async (token) => {
    setLoading(true);
    try {
      // Endpoint uses token to identify user, no ID needed in URL
      const res = await axios.get(`${API_BASE_URL}/mentor/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMentorProfile(res.data.mentor);

      const scheduleMap = {};
      if (res.data.mentor.availability) {
        res.data.mentor.availability.forEach((day) => {
          const dateKey = new Date(day.date).toISOString().split("T")[0];
          scheduleMap[dateKey] = day.slots.map((s) => s.time);
        });
      }
      setSchedule(scheduleMap);

    } catch (err) {
      console.error("Failed to fetch profile", err);
      if (err.response && err.response.status === 401) {
        handleLogOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mentorToken");
      const res = await axios.get(`${API_BASE_URL}/mentor/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data.sessions);
    } catch (err) {
      console.error("Error fetching sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((activeTab === "sessions" || activeTab === "feedback") && isAuthenticated) {
      fetchSessions();
    }
  }, [activeTab, isAuthenticated]);


  const toggleSlot = (dateObj, time) => {
    const dateKey = dateObj.toISOString().split("T")[0]; // Use proper ISO format
    setSchedule((prev) => {
      const currentSlots = prev[dateKey] || [];
      if (currentSlots.includes(time)) {
        return { ...prev, [dateKey]: currentSlots.filter((t) => t !== time) };
      } else {
        return { ...prev, [dateKey]: [...currentSlots, time] };
      }
    });
  };

  const handleSaveSlots = async () => {
    try {
      const availabilityArray = Object.keys(schedule).map((date) => ({
        date: date,
        slots: schedule[date].map((time) => ({ time, isBooked: false })),
      }));

      const token = localStorage.getItem("mentorToken");
      await axios.put(
        `${API_BASE_URL}/mentor/availability`,
        { availability: availabilityArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Schedule updated successfully!");
    } catch (error) {
      console.error("Failed to save slots", error);
      alert("Failed to save. Please try again.");
    }
  };

  const formatDate = (date) => date.toISOString().split("T")[0];

  const handleUpdateLinks = async () => {
    // Stub for updating links
    console.log("Update links");
  }

  const handleUpdateProfile = async (updatedData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mentorToken");

      // Map frontend settings back to backend schema if needed
      // Backend expects: { name, headline, bio, expertise, socialLinks, payoutSettings, notifications, pricePerSession ... }

      const payload = {
        name: updatedData.displayName,
        headline: updatedData.headline,
        bio: updatedData.bio,
        expertise: updatedData.skills,
        pricePerSession: updatedData.hourlyRate,
        socialLinks: updatedData.socialLinks,
        payoutSettings: {
          method: updatedData.payoutMethod,
          stripeConnected: updatedData.stripeConnected,
          upiId: updatedData.upiId,
          bankAccountName: updatedData.bankDetails.accountName,
          bankAccountNumber: updatedData.bankDetails.accountNumber,
          bankIfsc: updatedData.bankDetails.ifsc
        },
        notifications: updatedData.notifications
      };

      const res = await axios.put(
        `${API_BASE_URL}/mentor/profile/update`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setMentorProfile(res.data.mentor);
      alert("Profile updated successfully!");

    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = async (sessionId) => {
    const token = localStorage.getItem("mentorToken");
    if (!token) return;
    const url = `${API_BASE_URL}/mentor/sessions/${sessionId}/resume?token=${encodeURIComponent(token)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // --- RENDER ---
  if (!isAuthenticated) return (
    <LoginView
      loginData={loginData}
      setLoginData={setLoginData}
      handleLogin={handleLogin}
      isLoading={authLoading}
      error={authError}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      shake={shake}
    />
  );

  const navItems = [
    { id: "slots", label: "Availability", icon: Calendar },
    { id: "sessions", label: "Sessions", icon: Video },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "history", label: "History", icon: CheckCircle },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "profile", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <LoadingBar isLoading={loading} />

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-[#080808]/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between sticky top-0 h-screen transition-all duration-300 hidden md:flex z-50 relative`}>

        {/* Toggle Button for CLOSED state only - Floating */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute -right-3 top-16 w-6 h-6 bg-[#0d0d0d] border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:border-emerald-500/50 transition-all cursor-pointer z-50 shadow-lg"
          >
            <ChevronRight size={12} />
          </button>
        )}

        <div className="p-4">
          <div className={`flex items-center gap-3 mb-8 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-emerald-500" />
              </div>
              {sidebarOpen && (
                <span className="font-semibold text-white text-lg truncate">Mentor<span className="text-zinc-500">Hub</span></span>
              )}
            </div>

            {/* Toggle Button for OPEN state only - In Flow */}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-700/50 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-lg transition-all cursor-pointer group relative ${sidebarOpen
                  ? 'gap-3 px-3 py-2.5 text-sm font-medium'
                  : 'justify-center w-10 h-10 mx-auto'
                  } ${activeTab === item.id
                    ? "bg-white/5 text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon size={20} className={activeTab === item.id ? "text-emerald-500" : ""} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {activeTab === item.id && sidebarOpen && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-500 rounded-r" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className={`p-4 border-t border-white/10 space-y-4 ${sidebarOpen ? '' : 'px-2'}`}>
          <button
            onClick={handleLogOut}
            className={`w-full flex items-center gap-3 text-sm font-medium text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all cursor-pointer ${sidebarOpen ? 'px-3 py-2.5' : 'p-3 justify-center'
              }`}
          >
            <LogOut size={sidebarOpen ? 18 : 20} />
            {sidebarOpen && "Sign Out"}
          </button>

          {sidebarOpen && (
            <div className="text-center pt-2">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Powered by</p>
              <p className="text-xs font-bold text-zinc-500">Algo<span className="text-emerald-500">Viz</span></p>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Dashboard</span>
              <ChevronRight size={14} className="text-zinc-600" />
              <span className={`capitalize ${activeTab === 'profile' ? 'text-zinc-500' : 'text-white font-medium'}`}>
                {activeTab}
              </span>
            </div>

            {/* Earnings and Ratings Removed as per user request */}

            <div className="flex items-center gap-3">
              {mentorProfile?.company && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg">
                  <Building2 size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-400 font-medium">{mentorProfile.company}</span>
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-sm font-bold">
                {mentorProfile.name?.[0] || "M"}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === "slots" && (
              <SlotsTab
                datesToRender={datesToRender}
                schedule={schedule}
                toggleSlot={toggleSlot}
                handleSaveSlots={handleSaveSlots}
                TIME_SLOTS={TIME_SLOTS}
                formatDate={formatDate}
              />
            )}

            {activeTab === "sessions" && (
              <SessionsTab
                sessions={sessions}
                loading={loading} // Use general loading state or strict session loading state
                onRefresh={fetchSessions}
                onViewResume={handleViewResume}
                onUpdateLinks={handleUpdateLinks}
              />
            )}

            {activeTab === "feedback" && (
              <FeedbackTab
                sessions={sessions}
                loading={loading}
                onRefresh={fetchSessions}
                API_BASE_URL={API_BASE_URL}
              />
            )}

            {activeTab === "history" && (
              <HistoryTab
                history={history}
                showHistoryCalendar={showHistoryCalendar}
                setShowHistoryCalendar={setShowHistoryCalendar}
                historyDate={historyDate}
                setHistoryDate={setHistoryDate}
                viewDate={viewDate}
                setViewDate={setViewDate}
              />
            )}

            {activeTab === "reviews" && (
              <ReviewsTab
                stats={stats}
                reviews={reviews}
              />
            )}

            {activeTab === "payments" && (
              <PaymentsTab
                stats={stats}
              />
            )}

            {activeTab === "profile" && (
              <SettingsPage
                mentorProfile={mentorProfile}
                onSave={handleUpdateProfile}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MentorPortal;
