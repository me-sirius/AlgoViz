import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../core/context/ThemeContext";
import { useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const MainLayout = () => {
  const { theme } = useTheme();
  const location = useLocation();

  // Track page visits for analytics
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await axios.post(`${API_URL}/admin/track`, {
          page: location.pathname,
          referrer: document.referrer || "direct",
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break user experience
      }
    };
    trackVisit();
  }, [location.pathname]); // Track on every page change

  return (
    <div className="min-h-screen transition-colors duration-700 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;