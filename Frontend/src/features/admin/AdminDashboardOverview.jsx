import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileCheck,
  Users,
  Clock,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Search,
  Linkedin,
  Github,
  LayoutGrid,
} from "lucide-react";

// --- Components ---

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-800/50 rounded ${className}`} />
);

const DeviceBar = ({ label, count, total, icon, color }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="group flex items-center gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
      <div
        className={`p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-white transition-colors`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-300 font-medium">{label}</span>
          <span className="text-gray-500 font-mono">
            {count?.toLocaleString()}{" "}
            <span className="text-gray-600">({percent}%)</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-1000 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const SourceBox = ({ label, count, icon: Icon, color }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-gray-600 transition-colors group">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg bg-opacity-10 ${color} text-${
          color.split("-")[1]
        }-400`}
      >
        <Icon size={18} />
      </div>
      <span className="text-sm text-gray-400 font-medium group-hover:text-gray-200 transition-colors">
        {label}
      </span>
    </div>
    <span className="text-lg font-bold text-white font-mono">
      {count?.toLocaleString()}
    </span>
  </div>
);

const StatCard = ({ icon: Icon, color, label, value, loading }) => (
  <div className="relative overflow-hidden bg-[#161b22] border border-[#30363d] p-6 rounded-2xl hover:border-gray-600 transition-all duration-300 group">
    <div
      className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color.replace(
        "bg-",
        "text-"
      )}`}
    >
      <Icon size={80} />
    </div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
          <Icon size={20} className={color.replace("bg-", "text-")} />
        </div>
        <span className="text-gray-400 text-sm font-semibold tracking-wide uppercase">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">
        {loading ? <Skeleton className="h-9 w-24" /> : value?.toLocaleString()}
      </div>
    </div>
  </div>
);

// --- Main Dashboard ---

const AdminDashboardOverview = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [stats, setStats] = useState({
    users: 0,
    experiences: 0,
    pending: 0,
    analytics: {
      totalVisits: 0,
      uniqueVisitors: 0,
      devices: { desktop: 0, mobile: 0, tablet: 0, other: 0 },
      sources: { direct: 0, google: 0, linkedin: 0, github: 0, other: 0 },
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const secret = sessionStorage.getItem("admin_secret");
        const { data } = await axios.get(`${API_URL}/admin/stats`, {
          headers: { "x-admin-secret": secret },
        });
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <LayoutGrid className="text-blue-500" size={28} />
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Dashboard Overview
        </h2>
      </div>

      {/* Top Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          loading={loading}
          icon={Users}
          color="bg-blue-500"
          label="Total Users"
          value={stats.users}
        />
        <StatCard
          loading={loading}
          icon={FileCheck}
          color="bg-emerald-500"
          label="Live Experiences"
          value={stats.experiences}
        />
        <StatCard
          loading={loading}
          icon={Clock}
          color="bg-amber-500"
          label="Pending Review"
          value={stats.pending}
        />

        {/* Special Traffic Card */}
        <div className="bg-gradient-to-br from-[#161b22] to-[#1c2128] border border-[#30363d] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Activity size={20} />
            </div>
            <span className="text-gray-400 text-sm font-semibold uppercase">
              Total Traffic
            </span>
          </div>

          <div className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">
              {loading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                stats.analytics.totalVisits?.toLocaleString()
              )}
            </div>
            <div className="text-xs text-purple-400 font-medium flex items-center gap-1">
              <Users size={12} />
              {stats.analytics.uniqueVisitors?.toLocaleString()} Unique Visitors
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl shadow-black/20">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Monitor size={16} /> Device Usage
          </h3>
          <div className="space-y-2">
            <DeviceBar
              label="Desktop"
              count={stats.analytics.devices.desktop}
              total={stats.analytics.totalVisits}
              icon={<Monitor size={18} />}
              color="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
            <DeviceBar
              label="Mobile"
              count={stats.analytics.devices.mobile}
              total={stats.analytics.totalVisits}
              icon={<Smartphone size={18} />}
              color="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
            <DeviceBar
              label="Tablet"
              count={stats.analytics.devices.tablet}
              total={stats.analytics.totalVisits}
              icon={<Tablet size={18} />}
              color="bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            />
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl shadow-black/20">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Globe size={16} /> Traffic Sources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SourceBox
              label="Direct"
              count={stats.analytics.sources.direct}
              icon={Globe}
              color="bg-gray-500"
            />
            <SourceBox
              label="Google"
              count={stats.analytics.sources.google}
              icon={Search}
              color="bg-blue-500"
            />
            <SourceBox
              label="LinkedIn"
              count={stats.analytics.sources.linkedin}
              icon={Linkedin}
              color="bg-blue-600"
            />
            <SourceBox
              label="GitHub"
              count={stats.analytics.sources.github}
              icon={Github}
              color="bg-gray-100 text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;