import React, { useState, useRef, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code, ChevronDown, BookOpen, Cpu, FileText, LogIn, UserPlus,
  User, LogOut, Home, Sun, Moon, Menu, X, Zap, Bell, Code2,
  CheckSquare, Target, Layers, Rocket, Crown, Users, GraduationCap,
  MessageSquareText, Trophy, ListChecks, Search
} from "lucide-react";
import { AuthContext } from "../core/context/UserContext";
import { useTheme } from "../core/context/ThemeContext";
import axios from "axios";
import LoginModal from "../features/auth/LoginModal";
import { toProxyUrl } from "../core/utils/urlHelpers";
import { openCommandPalette } from "../core/utils/commandPalette";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const NAV_MENU_OPEN_DELAY = 45;
const NAV_MENU_CLOSE_DELAY = 180;

const megaMenus = {
  practice: {
    label: "Practice",
    icon: Target,
    items: [
      { path: "/practice", icon: Code2, title: "Topic-wise Problems", description: "Master DSA concepts step by step" },
      { path: "/mcq", icon: CheckSquare, title: "MCQ Quiz", description: "Test your theoretical knowledge" },
      { path: "/leaderboard", icon: Trophy, title: "Leaderboard", description: "Compete globally in the AlgoViz Arena" },
      { path: "/mock-test", icon: ListChecks, title: "Mock Tests", description: "Simulate real interview conditions", isPremium: true },
    ],
  },
  interviews: {
    label: "Interviews",
    icon: Users,
    items: [
      { path: "/Interview-Experience", icon: MessageSquareText, title: "Interview Experiences", description: "Learn from others' journeys" },
      { path: "/Mock-Interview", icon: Rocket, title: "Mock Interviews", description: "Practice with real interviewers" },
    ],
  },
  resources: {
    label: "Resources",
    icon: BookOpen,
    items: [
      { path: "/algorithms", icon: Cpu, title: "Algorithms", description: "Visual algorithm explanations" },
      { path: "/blogs", icon: FileText, title: "Blogs", description: "In-depth technical articles" },
      { path: "/cheatsheet", icon: Code, title: "Cheat Sheet", description: "Quick reference guides" },
      {
        path: "/ide",
        icon: Code2,
        title: "Playground",
        description: "Instant coding sandbox",
        badge: "Free",
      },
      { path: "/tutorials", icon: GraduationCap, title: "Tutorials", description: "Step-by-step learning paths", disabled: true },
      { path: "/big-o-guide", icon: Zap, title: "Big O Guide", description: "Time & space complexity" },
    ],
  },
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [showMobileSearchPrompt, setShowMobileSearchPrompt] = useState(false);

  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const navRef = useRef(null);
  const userDropdownRef = useRef(null);
  const menuOpenTimeoutRef = useRef(null);
  const menuCloseTimeoutRef = useRef(null);
  const mobilePullStartYRef = useRef(null);
  const mobilePullArmedRef = useRef(false);
  const mobilePromptShownRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPullReleaseHint, setShowPullReleaseHint] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      const isMobile = window.innerWidth < 1024;
      const isLandingPage = location.pathname === "/";

      if (
        isMobile &&
        isLandingPage &&
        showMobileSearchPrompt &&
        scrollY > 80
      ) {
        setShowMobileSearchPrompt(false);
        mobilePromptShownRef.current = false;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, showMobileSearchPrompt]);

  useEffect(() => {
    const shouldTrackPullToSearch =
      location.pathname === "/" && window.innerWidth < 1024;
    if (!shouldTrackPullToSearch) return undefined;

    const ARM_DISTANCE = 70;
    const DISARM_DISTANCE = 40;

    const handleTouchStart = (event) => {
      if (window.scrollY > 30) {
        mobilePullStartYRef.current = null;
        mobilePullArmedRef.current = false;
        setShowPullReleaseHint(false);
        return;
      }

      mobilePullStartYRef.current = event.touches?.[0]?.clientY ?? null;
      mobilePullArmedRef.current = false;
      setShowPullReleaseHint(false);
    };

    const handleTouchMove = (event) => {
      if (mobilePullStartYRef.current === null) return;

      const currentY = event.touches?.[0]?.clientY;
      if (typeof currentY !== "number") return;

      if (window.scrollY > 30) {
        mobilePullStartYRef.current = null;
        mobilePullArmedRef.current = false;
        setShowPullReleaseHint(false);
        return;
      }

      const pullDistance = currentY - mobilePullStartYRef.current;

      if (pullDistance <= 0) {
        mobilePullArmedRef.current = false;
        setShowPullReleaseHint(false);
        return;
      }

      if (pullDistance >= ARM_DISTANCE) {
        mobilePullArmedRef.current = true;
        setShowPullReleaseHint(true);
      } else if (pullDistance <= DISARM_DISTANCE) {
        mobilePullArmedRef.current = false;
        setShowPullReleaseHint(false);
      }
    };

    const handleTouchEnd = () => {
      if (mobilePullArmedRef.current && !mobilePromptShownRef.current) {
        mobilePromptShownRef.current = true;
        setShowMobileSearchPrompt(true);
      }

      mobilePullStartYRef.current = null;
      mobilePullArmedRef.current = false;
      setShowPullReleaseHint(false);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  useEffect(
    () => () => {
      if (menuOpenTimeoutRef.current) {
        window.clearTimeout(menuOpenTimeoutRef.current);
      }

      if (menuCloseTimeoutRef.current) {
        window.clearTimeout(menuCloseTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated) return setNotificationCount(0);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) setNotificationCount(data.count > 0 ? data.count : 0);
      } catch (error) { setNotificationCount(0); }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatar]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setShowMobileSearchPrompt(false);
      setShowPullReleaseHint(false);
      mobilePullStartYRef.current = null;
      mobilePullArmedRef.current = false;
      mobilePromptShownRef.current = false;
      return;
    }

    setShowPullReleaseHint(false);
    mobilePullStartYRef.current = null;
    mobilePullArmedRef.current = false;
    mobilePromptShownRef.current = false;
  }, [location.pathname]);

  const clearMenuTimers = () => {
    if (menuOpenTimeoutRef.current) {
      window.clearTimeout(menuOpenTimeoutRef.current);
      menuOpenTimeoutRef.current = null;
    }

    if (menuCloseTimeoutRef.current) {
      window.clearTimeout(menuCloseTimeoutRef.current);
      menuCloseTimeoutRef.current = null;
    }
  };

  const handleNavigation = (path) => {
    clearMenuTimers();
    navigate(path);
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setMobileSubmenu(null);
  };

  const handleOpenCommandPalette = () => {
    setShowPullReleaseHint(false);
    setShowMobileSearchPrompt(false);
    openCommandPalette();
  };

  const shortcutLabel =
    typeof navigator !== "undefined" && /Mac/i.test(navigator.platform) ? "CMD+K" : "CTRL+K";

  const userFirstName = user?.name?.split(" ")[0] || "User";
  const userInitial = userFirstName.charAt(0).toUpperCase();
  const avatarUrl = user?.avatar && !avatarLoadFailed ? toProxyUrl(user.avatar) : null;

  const freePages = ["/", "/algorithms", "/cheatsheet", "/blogs", "/ide"];
  const shouldRequireAuthForItem = (item) => item && !freePages.includes(item.path);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleMenuEnter = (menuKey) => {
    if (menuCloseTimeoutRef.current) {
      window.clearTimeout(menuCloseTimeoutRef.current);
      menuCloseTimeoutRef.current = null;
    }

    if (menuOpenTimeoutRef.current) {
      window.clearTimeout(menuOpenTimeoutRef.current);
      menuOpenTimeoutRef.current = null;
    }

    if (activeMenu === menuKey) {
      return;
    }

    const delay = activeMenu ? 0 : NAV_MENU_OPEN_DELAY;
    menuOpenTimeoutRef.current = window.setTimeout(() => {
      setActiveMenu(menuKey);
      menuOpenTimeoutRef.current = null;
    }, delay);
  };

  const handleMenuLeave = () => {
    if (menuOpenTimeoutRef.current) {
      window.clearTimeout(menuOpenTimeoutRef.current);
      menuOpenTimeoutRef.current = null;
    }

    if (menuCloseTimeoutRef.current) {
      window.clearTimeout(menuCloseTimeoutRef.current);
    }

    menuCloseTimeoutRef.current = window.setTimeout(() => {
      setActiveMenu(null);
      menuCloseTimeoutRef.current = null;
    }, NAV_MENU_CLOSE_DELAY);
  };

  const MegaMenu = ({ menuKey, items }) => (
    <motion.div
      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
      className={`absolute top-full -mt-px left-1/2 -translate-x-1/2 w-[280px] p-0 border-none rounded-none shadow-2xl backdrop-blur-2xl ${theme === "dark" ? "bg-black/90" : "bg-white/95"}`}
      onMouseEnter={() => handleMenuEnter(menuKey)} onMouseLeave={handleMenuLeave}
    >
      <div className={`p-4 flex flex-col gap-1 border border-t-0 ${theme === "dark" ? "border-white/10" : "border-black/5"}`}>
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              if (item.disabled) return;
              if (!isAuthenticated && shouldRequireAuthForItem(item)) return setShowAuthModal(true);
              handleNavigation(item.path);
            }}
            disabled={item.disabled}
            className={`group flex items-center justify-between w-full px-4 py-3 rounded-none transition-all duration-200 cursor-pointer ${item.disabled ? "opacity-40 cursor-not-allowed" : ""} ${theme === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"}`}
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-mono text-sm tracking-tight uppercase flex items-center gap-2">
                {item.title}
                {item.badge && (
                  <span
                    className={`inline-flex items-center border px-1.5 py-[1px] text-[9px] font-mono uppercase tracking-[0.08em] ${
                      theme === "dark"
                        ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-300"
                        : "border-emerald-600/40 bg-emerald-500/10 text-emerald-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.isPremium && <Crown size={12} className="text-[#FF4500]" />}
              </span>
            </div>
            <item.icon size={16} className={`${theme === "dark" ? "text-white/50" : "text-black/50"} group-hover:text-current`} />
          </button>
        ))}
      </div>
    </motion.div>
  );

  const NavItem = ({ menuKey, menu }) => (
    <div className="relative h-full flex items-center" onMouseEnter={() => handleMenuEnter(menuKey)} onMouseLeave={handleMenuLeave}>
      <button className={`uppercase font-mono text-[13px] tracking-wide px-5 h-full transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeMenu === menuKey ? (theme === "dark" ? "text-white bg-white/10" : "text-black bg-black/5") : (theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}`}>
        {menu.label}
      </button>
      <AnimatePresence>{activeMenu === menuKey && <MegaMenu menuKey={menuKey} items={menu.items} />}</AnimatePresence>
    </div>
  );

  return (
    <>
      <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <nav ref={navRef} className={`fixed top-0 left-0 w-full z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${scrolled ? (theme === "dark" ? "bg-black/80 backdrop-blur-xl border-white/10" : "bg-white/80 backdrop-blur-xl border-black/5") : (theme === "dark" ? "bg-black border-transparent" : "bg-white border-transparent")}`}>
        <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex-1 flex items-center">
            <button onClick={() => navigate("/")} className="group cursor-pointer flex items-center gap-3">
              <div className={`w-8 h-8 rounded-none border flex items-center justify-center transition-transform duration-500 group-hover:rotate-90 ${theme === "dark" ? "border-white/20 text-white" : "border-black/20 text-black"}`}>
                <Code className="w-4 h-4" />
              </div>
              <span className={`font-mono font-bold tracking-tight uppercase text-lg ${theme === "dark" ? "text-white" : "text-black"}`}>
                AlgoViz.
              </span>
            </button>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex flex-1 justify-center h-full">
            <NavItem menuKey="practice" menu={megaMenus.practice} />
            <NavItem menuKey="interviews" menu={megaMenus.interviews} />
            <NavItem menuKey="resources" menu={megaMenus.resources} />
          </div>

          {/* RIGHT CTA / USER */}
          <div className="flex-1 flex justify-end items-center gap-1">
            <button
              onClick={handleOpenCommandPalette}
              className={`group relative hidden lg:flex h-10 w-10 rounded-none items-center justify-center border cursor-pointer transition-colors ${theme === "dark" ? "border-white/15 text-white/80 hover:text-white hover:bg-white/10" : "border-black/10 text-black/70 hover:text-black hover:bg-black/5"}`}
              aria-label="Open algorithm discovery"
            >
              <Search size={15} />
              <span
                className={`pointer-events-none absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap px-1.5 py-1 text-[10px] font-mono uppercase tracking-[0.1em] opacity-0 transition-opacity group-hover:opacity-100 ${theme === "dark" ? "bg-black border border-white/15 text-white" : "bg-white border border-black/15 text-black"}`}
              >
                {shortcutLabel}
              </span>
            </button>

            {/* Theme Toggle mapped as Brutalist block */}
            <button onClick={toggleTheme} className={`h-10 px-4 rounded-none flex items-center justify-center cursor-pointer transition-colors ${theme === "dark" ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5"}`}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {!isAuthenticated ? (
              <div className="hidden lg:flex items-center ml-2">
                <button onClick={() => navigate("/signin")} className={`font-mono text-[13px] uppercase tracking-wide whitespace-nowrap px-5 h-10 flex items-center cursor-pointer transition-colors ${theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"}`}>
                  Log In
                </button>
                <button onClick={() => navigate("/register")} className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-mono text-[13px] tracking-wide uppercase whitespace-nowrap px-6 h-10 flex items-center justify-between gap-4 cursor-pointer transition-colors border-none">
                  <span>Get Started</span>
                  <span className="opacity-70">| +</span>
                </button>
              </div>
            ) : (
              <div className="relative hidden lg:flex items-center ml-2" ref={userDropdownRef}>
                <button onClick={() => setShowUserDropdown(!showUserDropdown)} className={`h-10 px-4 rounded-none flex items-center gap-3 cursor-pointer transition-colors border ${theme === "dark" ? "border-white/20 hover:bg-white/10 text-white" : "border-black/10 hover:bg-black/5 text-black"}`}>
                  {notificationCount > 0 && !showUserDropdown && <div className="absolute top-1 right-2 w-2 h-2 bg-[#FF4500] rounded-full" />}
                  <div className={`w-7 h-7 rounded-full overflow-hidden border flex items-center justify-center ${theme === "dark" ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"}`}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${userFirstName} avatar`}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarLoadFailed(true)}
                      />
                    ) : (
                      <span className="font-mono text-[11px] uppercase">{userInitial}</span>
                    )}
                  </div>
                  <span className="font-mono text-[13px] uppercase">{userFirstName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showUserDropdown ? "rotate-180" : "opacity-50"}`} />
                </button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }} className={`absolute top-full right-0 mt-2 w-56 rounded-none border shadow-2xl backdrop-blur-2xl ${theme === "dark" ? "bg-black/95 border-white/20" : "bg-white/95 border-black/10"}`}>
                      <div className="p-4 flex flex-col gap-1">
                        <p className={`font-mono text-[10px] uppercase opacity-50 mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>{user?.email}</p>
                        <button onClick={() => { setShowUserDropdown(false); navigate("/user-profile"); }} className={`w-full text-left font-mono text-[13px] uppercase px-3 py-2 cursor-pointer transition-colors ${theme === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"}`}>Profile</button>
                        <button onClick={() => { setShowUserDropdown(false); navigate("/notification"); }} className={`w-full text-left font-mono text-[13px] uppercase px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${theme === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"}`}>
                          Notifications {notificationCount > 0 && <span className="text-[#FF4500] font-bold">{notificationCount}</span>}
                        </button>
                        {!user?.isPremium && (
                          <button onClick={() => { setShowUserDropdown(false); navigate("/premium"); }} className="w-full text-left font-mono text-[13px] uppercase px-3 py-2 cursor-pointer text-[#FF4500] hover:bg-[#FF4500]/10 transition-colors">Upgrade to Pro</button>
                        )}
                        <div className={`w-full h-px my-2 ${theme === "dark" ? "bg-white/10" : "bg-black/5"}`} />
                        <button onClick={handleLogout} className={`w-full text-left font-mono text-[13px] uppercase px-3 py-2 cursor-pointer transition-colors opacity-70 hover:opacity-100 hover:text-[#FF4500]`}>Sign Out</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => handleNavigation("/user-profile")}
                className={`lg:hidden h-7 w-7 ml-1 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer transition-colors ${theme === "dark" ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-black/10 bg-black/5 text-black hover:bg-black/10"}`}
                aria-label="Open profile"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${userFirstName} avatar`}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <span className="font-mono text-[10px] uppercase">{userInitial}</span>
                )}
              </button>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`lg:hidden h-10 px-4 ml-2 flex items-center justify-center cursor-pointer transition-colors ${theme === "dark" ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5"}`}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showPullReleaseHint && location.pathname === "/" && !isMobileMenuOpen && !showMobileSearchPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`lg:hidden absolute top-16 left-1/2 -translate-x-1/2 mt-2 w-fit max-w-[88vw] px-3 py-2 border backdrop-blur-md ${theme === "dark" ? "bg-black/90 border-white/15 text-white" : "bg-white/95 border-black/10 text-black"}`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.08em]">
                Release to open search
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMobileSearchPrompt && location.pathname === "/" && !isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`lg:hidden absolute top-16 left-1/2 -translate-x-1/2 mt-2 w-[min(92vw,420px)] border shadow-xl backdrop-blur-md ${theme === "dark" ? "bg-black/90 border-white/15" : "bg-white/95 border-black/10"}`}
            >
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <p className={`font-mono text-[11px] uppercase tracking-[0.08em] ${theme === "dark" ? "text-white/80" : "text-black/70"}`}>
                  Explore algorithms instantly?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenCommandPalette}
                    className={`font-mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 border cursor-pointer ${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-black/15 text-black hover:bg-black/5"}`}
                  >
                    Open Search
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileSearchPrompt(false);
                      mobilePromptShownRef.current = false;
                    }}
                    className={`font-mono text-[11px] uppercase tracking-[0.08em] px-2 py-1.5 cursor-pointer ${theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"}`}
                  >
                    Later
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE MENU FULLSCREEN */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-16 left-0 w-full h-[calc(100vh-64px)] overflow-y-auto border-t lg:hidden ${theme === "dark" ? "bg-black border-white/10" : "bg-white border-black/5"}`}>
              <div className="flex flex-col p-6 gap-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setMobileSubmenu(null);
                    handleOpenCommandPalette();
                  }}
                  className={`text-left font-mono text-xl uppercase tracking-widest py-4 border-b flex items-center gap-3 ${theme === "dark" ? "border-white/10 text-white" : "border-black/5 text-black"}`}
                >
                  <Search size={18} />
                  SEARCH
                </button>
                <button onClick={() => handleNavigation("/")} className={`text-left font-mono text-xl uppercase tracking-widest py-4 border-b ${theme === "dark" ? "border-white/10 text-white" : "border-black/5 text-black"}`}>HOME</button>
                {Object.entries(megaMenus).map(([key, menu]) => (
                  <div key={key} className={`py-4 border-b ${theme === "dark" ? "border-white/10" : "border-black/5"}`}>
                    <button onClick={() => setMobileSubmenu(mobileSubmenu === key ? null : key)} className={`w-full flex justify-between items-center font-mono text-xl uppercase tracking-widest cursor-pointer ${theme === "dark" ? "text-white" : "text-black"}`}>
                      {menu.label} <ChevronDown size={20} className={mobileSubmenu === key ? "rotate-180" : ""} />
                    </button>
                    <AnimatePresence>
                      {mobileSubmenu === key && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3 pt-4 pl-4">
                          {menu.items.map(item => (
                            <button key={item.path} onClick={() => { if (item.disabled) return; if (!isAuthenticated && shouldRequireAuthForItem(item)) { setShowAuthModal(true); setIsMobileMenuOpen(false); return; } handleNavigation(item.path); }} className={`text-left font-mono text-sm tracking-wide uppercase flex items-center gap-3 ${theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"}`}>
                              <item.icon size={16} />
                              <span>{item.title}</span>
                              {item.badge && (
                                <span
                                  className={`inline-flex items-center border px-1.5 py-[1px] text-[9px] font-mono uppercase tracking-[0.08em] ${
                                    theme === "dark"
                                      ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-300"
                                      : "border-emerald-600/40 bg-emerald-500/10 text-emerald-700"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="mt-8 flex flex-col gap-4">
                  {!isAuthenticated ? (
                    <>
                      <button onClick={() => handleNavigation("/signin")} className={`font-mono text-lg uppercase tracking-widest py-4 border cursor-pointer transition-colors ${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-black/20 text-black hover:bg-black/5"}`}>LOG IN</button>
                      <button onClick={() => handleNavigation("/register")} className="bg-[#FF4500] text-white font-mono text-lg uppercase py-4 tracking-widest cursor-pointer flex justify-center gap-4">GET STARTED <span className="opacity-70">|+</span></button>
                    </>
                  ) : (
                    <>
                      <div className={`p-4 border font-mono text-sm flex justify-between ${theme === "dark" ? "border-white/20 text-white" : "border-black/20 text-black"}`}>
                        <span>{user.email}</span>
                        {user.isPremium && <Crown size={16} className="text-[#FF4500]" />}
                      </div>
                      <button onClick={() => handleNavigation("/user-profile")} className={`font-mono text-lg uppercase text-left py-4 ${theme === "dark" ? "text-white/80" : "text-black/80"}`}>PROFILE</button>
                      <button onClick={() => handleNavigation("/notification")} className={`font-mono text-lg uppercase text-left py-4 flex justify-between ${theme === "dark" ? "text-white/80" : "text-black/80"}`}>NOTIFICATIONS {notificationCount > 0 && <span className="text-[#FF4500]">{notificationCount}</span>}</button>
                      <button onClick={handleLogout} className="font-mono text-lg uppercase text-left py-4 text-[#FF4500]">SIGN OUT</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
