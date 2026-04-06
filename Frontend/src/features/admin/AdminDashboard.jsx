import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  LogOut,
  Search,
  Check,
  X,
  Clock,
  Lock,
  ShieldCheck,
  Menu,
  ChevronDown,
  Briefcase,
  Activity,
  Database,
  Server,
  ChevronRight,
  Trash2,
  Edit2,
  Save,
  XCircle,
  Globe,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  DollarSign,
  Code,
  Shield,
  List,
  Bell,
  MessageSquare,
  Wallet,
  Bug,
  CheckCircle,
  CreditCard,
  Building2,
  Smartphone,
  PanelLeftClose,
  PanelLeft,
  FileQuestion,
  Image,
} from "lucide-react";

// Import standalone admin components
import AdminDashboardOverview from "./AdminDashboardOverview";
import AddQuestionForm from "./AddQuestionForm";
import AddMCQForm from "./AddMCQForm";
import ContactQueryList from "./AdminContactQuery";
import AdminNotificationPanel from "./AdminNotificationPanel";
import MediaLibrary from "./MediaLibrary";
import QuestionList from "./QuestionList";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- 1. LOCK SCREEN ---
const AdminLockScreen = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  const handleUnlock = (e) => {
    e.preventDefault();
    const TEAM_SECRET = "team_alpha_2025";

    if (passcode === TEAM_SECRET) {
      sessionStorage.setItem("admin_unlocked", "true");
      sessionStorage.setItem("admin_secret", passcode);
      onUnlock();
    } else {
      setError(true);
      toast.error("Access Denied");
      setPasscode("");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-[#333] p-6 md:p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#161b22] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#333]">
          <Lock size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          Restricted Access
        </h2>
        <p className="text-gray-500 mb-6 text-sm">Authorized personnel only.</p>
        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            autoFocus
            placeholder="Enter Access Key"
            className={`w-full bg-[#05070a] border ${
              error ? "border-red-500" : "border-[#333]"
            } rounded-xl px-4 py-3 text-white text-center tracking-widest outline-none focus:border-blue-500 transition-colors`}
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError(false);
            }}
          />
          <button className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
            <ShieldCheck size={18} /> Verify Identity
          </button>
        </form>
      </div>
    </div>
  );
};

// --- 2. SYSTEM HEALTH MODAL ---
const SystemHealthModal = ({ onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const secret = sessionStorage.getItem("admin_secret");
        const { data } = await axios.get(`${API_URL}/admin/health`, {
          headers: { "x-admin-secret": secret },
        });
        setMetrics(data.data);
      } catch (error) {
        // toast.error("Failed to check system health");
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#333] w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
        <div className="p-6 border-b border-[#333] flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-green-500 animate-pulse" /> System Status
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#333] rounded-full text-gray-400 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500 animate-pulse">
              Running diagnostics...
            </div>
          ) : (
            <>
              {/* Metrics UI (Simplified for brevity) */}
              <div className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#333] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <Database size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-300">Database</div>
                    <div className="text-xs text-gray-500">MongoDB Atlas</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">
                    {metrics?.database?.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {metrics?.database?.latency} latency
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-center">
                <span className="text-green-500 text-sm font-bold">
                  ✅ All Systems Operational
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 4. VERIFICATION QUEUE ---
const ExperienceQueue = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const secret = sessionStorage.getItem("admin_secret");
        const { data } = await axios.get(
          `${API_URL}/admin/pending-experiences`,
          {
            headers: { "x-admin-secret": secret },
          }
        );
        setPendingList(data.data || []);
      } catch (error) {
        console.error("Fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleAction = async (id, status, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to ${status}?`)) return;

    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.patch(
        `${API_URL}/admin/experience/${id}/status`,
        { status },
        { headers: { "x-admin-secret": secret } }
      );
      toast.success(`${status} successfully`);
      setPendingList((prev) => prev.filter((i) => i._id !== id));
      setExpandedId(null);
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="text-gray-500 p-4">Loading queue...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-xl font-bold text-white">Verification Queue</h2>
      <div className="space-y-4">
        {pendingList.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#333] rounded-2xl text-gray-500 bg-[#161b22]/50">
            <ShieldCheck className="mx-auto mb-3 opacity-50" size={48} />
            You're all caught up! No pending submissions.
          </div>
        ) : (
          pendingList.map((item) => {
            const isExpanded = expandedId === item._id;
            return (
              <div
                key={item._id}
                className={`bg-[#161b22] border transition-all duration-300 rounded-xl overflow-hidden ${
                  isExpanded
                    ? "border-blue-500/50 shadow-lg shadow-blue-900/10"
                    : "border-[#333]"
                }`}
              >
                <div
                  onClick={() => toggleExpand(item._id)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1c2128] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">
                        {item.company}
                      </h3>
                      <span className="px-2 py-0.5 bg-[#0d1117] border border-[#333] text-gray-400 text-xs rounded uppercase font-bold tracking-wide">
                        {item.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {item.userId?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                    <span className="text-xs text-blue-400 font-medium md:hidden">
                      Tap to review
                    </span>
                    <div
                      className={`p-2 rounded-full bg-[#0d1117] text-gray-400 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-[#333] bg-[#0d1117]/50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-5 md:p-6 space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#333] pb-2">
                          Interview Rounds
                        </h4>
                        {item.rounds?.map((round, idx) => (
                          <div
                            key={idx}
                            className="bg-[#161b22] p-4 rounded-xl border border-[#333]"
                          >
                            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                              {round.description}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={(e) => handleAction(item._id, "Rejected", e)}
                          className="flex-1 py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <X size={18} /> REJECT
                        </button>
                        <button
                          onClick={(e) => handleAction(item._id, "Approved", e)}
                          className="flex-1 py-3.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check size={18} /> APPROVE
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- 5. USER MANAGEMENT (WITH FULL EDITING) ---
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);

  // EDITING STATES
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const secret = sessionStorage.getItem("admin_secret");
        const { data } = await axios.get(`${API_URL}/admin/users`, {
          headers: { "x-admin-secret": secret },
        });
        setUsers(data.data || []);
      } catch (err) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`⚠️ DANGER: Delete user "${name}"?`)) return;
    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.delete(`${API_URL}/admin/user/${id}`, {
        headers: { "x-admin-secret": secret },
      });
      toast.success("User removed");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const toggleRow = (user) => {
    if (editingId === user._id) return;
    setExpandedUserId(expandedUserId === user._id ? null : user._id);
  };

  const handleEditClick = (user, e) => {
    e.stopPropagation();
    setEditingId(user._id);
    setExpandedUserId(user._id);
    setEditFormData(JSON.parse(JSON.stringify(user)));
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditFormData({});
  };

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (section) {
      setEditFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: val },
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSave = async (id, e) => {
    e.stopPropagation();
    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.patch(`${API_URL}/admin/user/${id}`, editFormData, {
        headers: { "x-admin-secret": secret },
      });
      toast.success("User updated");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...editFormData } : u))
      );
      setEditingId(null);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // Helper for Input Fields
  const Field = ({
    label,
    value,
    onChange,
    isEditing,
    name,
    type = "text",
    readOnly = false,
    icon,
  }) => (
    <div>
      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
        {icon} {label}
      </label>
      {isEditing && !readOnly ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full bg-[#05070a] border border-[#333] rounded px-2 py-1.5 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors"
        />
      ) : (
        <div className="text-sm text-white font-medium truncate h-[34px] flex items-center">
          {value || <span className="text-gray-600">-</span>}
        </div>
      )}
    </div>
  );

  if (loading) return <div className="text-gray-500">Loading users...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-bold text-white">Registered Users</h2>
        <span className="text-xs text-gray-500 bg-[#161b22] px-3 py-1 rounded-full border border-[#333]">
          {users.length} Accounts
        </span>
      </div>
      <div className="bg-[#161b22] border border-[#333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0d1117] text-gray-400 text-xs uppercase border-b border-[#333]">
                <th className="p-4 font-semibold">Profile</th>
                <th className="p-4 font-semibold">Stats</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333] text-sm text-gray-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isExpanded = expandedUserId === u._id;
                  const isEditing = editingId === u._id;
                  const data = isEditing ? editFormData : u;

                  return (
                    <React.Fragment key={u._id}>
                      <tr
                        onClick={() => toggleRow(u)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? "bg-[#1c2128]" : "hover:bg-[#1c2128]"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-white shrink-0 border border-blue-500/30 overflow-hidden">
                              {data.avatar ? (
                                <img
                                  src={data.avatar}
                                  alt="av"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                data.name?.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                {data.name}
                                {data.isPremium && (
                                  <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 rounded border border-yellow-500/30">
                                    PRO
                                  </span>
                                )}
                                {data.mentorProfile?.isMentor && (
                                  <span className="text-[10px] bg-purple-500/20 text-purple-500 px-1.5 rounded border border-purple-500/30">
                                    MENTOR
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {data.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-4 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-white">
                                {data.credits}
                              </div>
                              <div className="text-gray-500">Credits</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-400">
                                ₹{data.Balance}
                              </div>
                              <div className="text-gray-500">Bal</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-blue-400">
                                {data.streak}
                              </div>
                              <div className="text-gray-500">Streak</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded w-fit ${
                                data.isVerified
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {data.isVerified ? "Verified" : "Unverified"}
                            </span>
                            <span className="text-[10px] text-gray-500 capitalize">
                              {data.authMethod} Auth
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={(e) => handleSave(u._id, e)}
                                  className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors cursor-pointer"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => handleEditClick(u, e)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            <div
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            >
                              <ChevronDown
                                size={16}
                                className="text-gray-500"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="4" className="bg-[#0d1117]/50 p-0">
                            <div
                              className="p-6 border-t border-[#333] animate-in slide-in-from-top-2 cursor-default"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2 mb-4 flex items-center gap-2">
                                    <Briefcase size={14} /> Personal
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <Field
                                      label="Full Name"
                                      name="name"
                                      value={data.name}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                    />
                                    <Field
                                      label="Location"
                                      name="location"
                                      value={data.location}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      icon={<MapPin size={12} />}
                                    />
                                    <Field
                                      label="Username"
                                      name="username"
                                      value={data.username || ""}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                    />
                                    <Field
                                      label="Member Since"
                                      value={new Date(
                                        data.memberSince || data.createdAt
                                      ).toLocaleDateString()}
                                      readOnly
                                      icon={<Calendar size={12} />}
                                    />
                                  </div>
                                  <div className="mt-4">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                                      Bio
                                    </label>
                                    {isEditing ? (
                                      <textarea
                                        name="bio"
                                        value={data.bio}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#05070a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-blue-500"
                                        rows={3}
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-400 bg-[#161b22] p-3 rounded border border-[#333]">
                                        {data.bio || "No bio"}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2 mb-4 flex items-center gap-2">
                                    <Globe size={14} /> Social & Skills
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <Field
                                      label="GitHub"
                                      name="github"
                                      value={data.github}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      icon={<Github size={12} />}
                                    />
                                    <Field
                                      label="LinkedIn"
                                      name="linkedin"
                                      value={data.linkedin}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      icon={<Linkedin size={12} />}
                                    />
                                    <Field
                                      label="Website"
                                      name="website"
                                      value={data.website}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      icon={<ExternalLink size={12} />}
                                    />
                                    <Field
                                      label="Twitter"
                                      name="twitter"
                                      value={data.twitter}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      icon={<Twitter size={12} />}
                                    />
                                  </div>
                                  <div className="mt-4">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                                      Skills
                                    </label>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={data.skills?.join(", ")}
                                        onChange={(e) =>
                                          setEditFormData({
                                            ...data,
                                            skills: e.target.value
                                              .split(",")
                                              .map((s) => s.trim()),
                                          })
                                        }
                                        className="w-full bg-[#05070a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-blue-500"
                                      />
                                    ) : (
                                      <div className="flex flex-wrap gap-2">
                                        {data.skills?.map((s, i) => (
                                          <span
                                            key={i}
                                            className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20"
                                          >
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                <div className="bg-[#161b22] p-4 rounded-xl border border-[#333]">
                                  <h4 className="text-xs font-bold text-green-400 uppercase mb-4 flex items-center gap-2">
                                    <DollarSign size={14} /> Economy
                                  </h4>
                                  <div className="space-y-3">
                                    <Field
                                      label="Credits"
                                      name="credits"
                                      value={data.credits}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      type="number"
                                    />
                                    <Field
                                      label="Wallet Balance (₹)"
                                      name="Balance"
                                      value={data.Balance}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      type="number"
                                    />
                                    <div className="flex items-center justify-between pt-2">
                                      <span className="text-sm text-gray-400">
                                        Premium User
                                      </span>
                                      {isEditing ? (
                                        <input
                                          type="checkbox"
                                          name="isPremium"
                                          checked={data.isPremium}
                                          onChange={handleInputChange}
                                          className="accent-blue-500 w-4 h-4"
                                        />
                                      ) : (
                                        <span
                                          className={
                                            data.isPremium
                                              ? "text-yellow-500 font-bold"
                                              : "text-gray-600"
                                          }
                                        >
                                          {data.isPremium ? "YES" : "NO"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-[#161b22] p-4 rounded-xl border border-[#333]">
                                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-4 flex items-center gap-2">
                                    <Code size={14} /> Dev Stats
                                  </h4>
                                  <div className="space-y-3">
                                    <Field
                                      label="Streak (Days)"
                                      name="streak"
                                      value={data.streak}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                      type="number"
                                    />
                                    <Field
                                      label="Questions Solved"
                                      value={data.questionsSolved?.length || 0}
                                      readOnly
                                    />
                                    <Field
                                      label="Default Lang"
                                      name="defaultLanguage"
                                      value={data.defaultLanguage}
                                      onChange={handleInputChange}
                                      isEditing={isEditing}
                                    />
                                  </div>
                                </div>
                                <div className="bg-[#161b22] p-4 rounded-xl border border-[#333]">
                                  <h4 className="text-xs font-bold text-red-400 uppercase mb-4 flex items-center gap-2">
                                    <Shield size={14} /> Admin Zone
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-400">
                                        Verified
                                      </span>
                                      {isEditing ? (
                                        <input
                                          type="checkbox"
                                          name="isVerified"
                                          checked={data.isVerified}
                                          onChange={handleInputChange}
                                          className="accent-blue-500 w-4 h-4"
                                        />
                                      ) : (
                                        <span
                                          className={
                                            data.isVerified
                                              ? "text-green-500"
                                              : "text-red-500"
                                          }
                                        >
                                          {data.isVerified ? "YES" : "NO"}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) =>
                                        handleDelete(u._id, u.name, e)
                                      }
                                      className="w-full mt-2 py-2 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 border border-red-500/20 rounded transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 size={14} /> DELETE USER
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {(data.mentorProfile?.isMentor || isEditing) && (
                                <div className="border-t border-[#333] pt-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                      <Briefcase size={14} /> Mentor Profile
                                    </h4>
                                    {isEditing && (
                                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={data.mentorProfile?.isMentor}
                                          onChange={(e) =>
                                            setEditFormData((prev) => ({
                                              ...prev,
                                              mentorProfile: {
                                                ...prev.mentorProfile,
                                                isMentor: e.target.checked,
                                              },
                                            }))
                                          }
                                        />{" "}
                                        Enable Mentor
                                      </label>
                                    )}
                                  </div>
                                  {data.mentorProfile?.isMentor && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#161b22] p-4 rounded-xl border border-[#333]">
                                      <Field
                                        label="Company"
                                        name="company"
                                        value={data.mentorProfile?.company}
                                        onChange={(e) =>
                                          handleInputChange(e, "mentorProfile")
                                        }
                                        isEditing={isEditing}
                                      />
                                      <Field
                                        label="Role"
                                        name="role"
                                        value={data.mentorProfile?.role}
                                        onChange={(e) =>
                                          handleInputChange(e, "mentorProfile")
                                        }
                                        isEditing={isEditing}
                                      />
                                      <Field
                                        label="Price (₹)"
                                        name="price"
                                        value={data.mentorProfile?.price}
                                        onChange={(e) =>
                                          handleInputChange(e, "mentorProfile")
                                        }
                                        isEditing={isEditing}
                                        type="number"
                                      />
                                      <Field
                                        label="Experience"
                                        name="experience"
                                        value={data.mentorProfile?.experience}
                                        onChange={(e) =>
                                          handleInputChange(e, "mentorProfile")
                                        }
                                        isEditing={isEditing}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- PAYMENT QUEUE ---
const PaymentQueue = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchPayments = async () => {
    try {
      const secret = sessionStorage.getItem("admin_secret");
      const { data } = await axios.get(`${API_URL}/admin/pending-payments`, {
        headers: { "x-admin-secret": secret },
      });
      setPayments(data.data || []);
    } catch (error) {
      console.error("Fetch payments error", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleMarkPaid = async (id, mentorName) => {
    if (!window.confirm(`Mark payment to ${mentorName} as completed?`)) return;

    setProcessingId(id);
    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.patch(
        `${API_URL}/admin/payment/${id}/mark-paid`,
        { paymentNote: `Paid on ${new Date().toLocaleDateString()}` },
        { headers: { "x-admin-secret": secret } }
      );
      toast.success("Marked as paid");
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Failed to update payment");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Calculate total pending amount
  const totalPending = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading)
    return <div className="text-gray-500 p-4">Loading payments...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="text-emerald-500" />
          Pending Payments
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 bg-[#161b22] px-3 py-1 rounded-full border border-[#333]">
            {payments.length} Pending
          </span>
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
            <span className="text-emerald-400 font-bold text-lg">
              ₹{totalPending.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 ml-2">Total</span>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#333] rounded-2xl text-gray-500 bg-[#161b22]/50">
          <CheckCircle className="mx-auto mb-3 text-emerald-500" size={48} />
          <h3 className="text-white font-bold mb-1">All Caught Up!</h3>
          No pending payments to process.
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((item) => {
            const mentor = item.mentorId || {};
            const student = item.studentId || {};
            const payout = mentor.payoutSettings || {};
            const isExpanded = expandedId === item._id;

            return (
              <div
                key={item._id}
                className={`bg-[#161b22] border transition-all duration-300 rounded-xl overflow-hidden ${
                  isExpanded
                    ? "border-emerald-500/50 shadow-lg shadow-emerald-900/10"
                    : "border-[#333]"
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(item._id)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1c2128] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold">
                      {mentor.name?.[0] || "M"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {mentor.name || "Mentor"}
                        <span className="text-xs bg-[#0d1117] border border-[#333] text-gray-400 px-2 py-0.5 rounded">
                          {mentor.company || "N/A"}
                        </span>
                      </h3>
                      <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                        <span>Student: {student.name || "N/A"}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.date).toLocaleDateString()} @{" "}
                          {item.timeSlot}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400">
                        ₹{item.amount}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">
                        Session Fee
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full bg-[#0d1117] text-gray-400 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#333] bg-[#0d1117]/50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-5 md:p-6 space-y-6">
                      {/* Payment Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mentor Info */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#333] pb-2">
                            Mentor Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Email</span>
                              <span className="text-white">
                                {mentor.email || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Role</span>
                              <span className="text-white">
                                {mentor.role || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Session Rate
                              </span>
                              <span className="text-emerald-400 font-bold">
                                ₹{mentor.pricePerSession || item.amount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Payout Info */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#333] pb-2 flex items-center gap-2">
                            <CreditCard size={14} />
                            Payout Details
                          </h4>
                          <div className="bg-[#161b22] p-4 rounded-xl border border-[#333]">
                            {payout.method === "upi" ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                  <Smartphone size={16} />
                                  UPI Payment
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      UPI ID
                                    </span>
                                    <span className="text-white font-mono bg-[#0d1117] px-2 py-0.5 rounded">
                                      {payout.upiId || "Not Set"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Mobile
                                    </span>
                                    <span className="text-white">
                                      {payout.upiMobile || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : payout.method === "bank" ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-blue-400 font-bold">
                                  <Building2 size={16} />
                                  Bank Transfer
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Account Name
                                    </span>
                                    <span className="text-white">
                                      {payout.bankAccountName || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Account No
                                    </span>
                                    <span className="text-white font-mono">
                                      {payout.bankAccountNumber
                                        ? `****${payout.bankAccountNumber.slice(-4)}`
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">IFSC</span>
                                    <span className="text-white font-mono">
                                      {payout.bankIfsc || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <XCircle className="mx-auto mb-2" size={24} />
                                No payout method configured
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Session Info */}
                      <div className="bg-[#161b22] p-4 rounded-xl border border-[#333]">
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">
                          Session Info
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Topic</div>
                            <div className="text-white font-medium">
                              {item.topic}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="text-white font-medium">
                              {new Date(item.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Time</div>
                            <div className="text-white font-medium">
                              {item.timeSlot}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Feedback</div>
                            <div className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle size={12} /> Submitted
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkPaid(item._id, mentor.name);
                          }}
                          disabled={processingId === item._id}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {processingId === item._id ? (
                            <Clock className="animate-spin" size={18} />
                          ) : (
                            <Check size={18} />
                          )}
                          Mark as Paid
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ----Issue Tracker---- */

const BugList = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBug, setExpandedBug] = useState(null);

  // Fetch Bugs on Load
  const fetchBugs = async () => {
    try {
      console.log("fetching me aaya hu");
      const secret = sessionStorage.getItem("admin_secret"); // Or however you store admin auth
      const res = await axios.get(`${API_URL}/bug/open`, {
        headers: { "x-admin-secret": secret },
      });
      console.log("response : ", res.data);
      setBugs(res.data.data);
    } catch (error) {
      console.error("Failed to load bugs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  // Function to Mark as Resolved
  const handleResolve = async (id, e) => {
    e.stopPropagation(); // Prevent card expansion
    if (!confirm("Mark this issue as Resolved?")) return;
    try {
      // You need to add this PATCH route to your backend (see below)
      const secret = sessionStorage.getItem("admin_secret"); // Or however you
      console.log("secret", secret);
      await axios.patch(
        `${API_URL}/bug/resolve/${id}`,
        {},
        {
          headers: { "x-admin-secret": secret },
        }
      );
      // Remove from UI immediately
      setBugs(bugs.filter((b) => b._id !== id));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="text-gray-500">Loading issues...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Bug className="text-indigo-500" /> Issue Tracker
        <span className="text-sm font-normal text-gray-500 bg-[#1e1e1e] px-3 py-1 rounded-full border border-[#333]">
          {bugs.length} Open
        </span>
      </h2>

      {bugs.length === 0 ? (
        <div className="text-center py-20 bg-[#161b22] border border-[#333] rounded-2xl">
          <CheckCircle
            size={48}
            className="mx-auto text-green-500 mb-4 opacity-50"
          />
          <h3 className="text-xl font-bold text-gray-300">All Clear!</h3>
          <p className="text-gray-500">No open bugs found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bugs.map((bug) => (
            <div
              key={bug._id}
              onClick={() =>
                setExpandedBug(expandedBug === bug._id ? null : bug._id)
              }
              className={`bg-[#161b22] border border-[#333] rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-500/50 ${
                expandedBug === bug._id ? "ring-1 ring-indigo-500" : ""
              }`}
            >
              {/* Header Row */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        bug.category === "ui"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : bug.category === "functional"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {bug.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(bug.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-200 text-lg">
                    {bug.title}
                  </h3>
                </div>

                <button
                  onClick={(e) => handleResolve(bug._id, e)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-600 hover:border-green-500 hover:bg-green-500/10 transition-all active:scale-95 cursor-pointer"
                  title="Close this issue"
                >
                  {/* Icon turns green on hover */}
                  <CheckCircle
                    size={16}
                    className="text-gray-400 group-hover:text-green-500 transition-colors"
                  />
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">
                    Mark Resolved
                  </span>
                </button>
              </div>

              {/* Expanded Details */}
              {expandedBug === bug._id && (
                <div className="mt-4 pt-4 border-t border-[#333] text-sm animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-gray-500 font-bold text-xs uppercase mb-2">
                        Description
                      </h4>
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0d1117] p-3 rounded-lg border border-[#333]">
                        {bug.description}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-gray-500 font-bold text-xs uppercase mb-2">
                          Context
                        </h4>
                        <a
                          href={bug.pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-indigo-400 hover:underline bg-[#0d1117] p-2 rounded border border-[#333]"
                        >
                          <ExternalLink size={14} /> {bug.pageUrl}
                        </a>
                      </div>
                      <div>
                        <h4 className="text-gray-500 font-bold text-xs uppercase mb-2">
                          System Info
                        </h4>
                        <div className="bg-[#0d1117] p-2 rounded border border-[#333] text-xs text-gray-400 font-mono break-all">
                          {bug.userAgent}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD SHELL ---
const AdminDashboard = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHealth, setShowHealth] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_unlocked") === "true")
      setIsVerified(true);
  }, []);

  if (!isVerified)
    return <AdminLockScreen onUnlock={() => setIsVerified(true)} />;

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "verify", label: "Verifications", icon: FileCheck },
    { id: "users", label: "Users", icon: Users },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "questions", label: "Questions", icon: FileQuestion },
    { id: "add-question", label: "Add Problem", icon: Code },
    { id: "add-mcq", label: "Add MCQ", icon: List },
    { id: "media", label: "Media Library", icon: Image },
    { id: "bugs", label: "Issue Tracker", icon: Bug },
    { id: "contact", label: "Contact Queries", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleLogout = () => {
    setIsVerified(false);
    sessionStorage.removeItem("admin_unlocked");
    sessionStorage.removeItem("admin_secret");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0a0e17] text-gray-200 font-sans flex animate-in fade-in duration-500">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-[#0d1117] border-b border-[#333] z-30 px-4 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 font-bold text-white">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Admin
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-300 hover:bg-[#1e1e1e] rounded-lg cursor-pointer"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 bg-[#0d1117] border-r border-[#333] z-50 transform transition-all duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${sidebarCollapsed ? "md:w-16" : "md:w-64"}`}
      >
        {/* Header with title and collapse toggle */}
        <div
          className={`h-16 border-b border-[#333] hidden md:flex items-center shrink-0 ${sidebarCollapsed ? "px-2 justify-center" : "px-6 justify-between"}`}
        >
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span> Admin
              Panel
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2 text-gray-400 hover:text-white hover:bg-[#161b22] rounded-lg transition-colors cursor-pointer ${sidebarCollapsed ? "mx-auto" : ""}`}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeft size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        </div>
        <div className="md:hidden p-4 border-b border-[#333] flex justify-between items-center">
          <h2 className="font-bold text-white">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 p-2 space-y-1 mt-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1e1e1e] text-white border border-[#333]"
                    : "text-gray-400 hover:text-white hover:bg-[#161b22]"
                } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  size={sidebarCollapsed ? 22 : 18}
                  className={isActive ? "text-blue-500" : "text-gray-500"}
                />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </div>
        {!sidebarCollapsed && (
          <div className="px-4 pb-2">
            <button
              onClick={() => {
                setShowHealth(true);
                setSidebarOpen(false);
              }}
              className="w-full bg-[#161b22] border border-[#333] hover:border-green-500/50 p-3 rounded-xl flex items-center justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <Server
                    size={18}
                    className="text-gray-400 group-hover:text-green-400 transition-colors"
                  />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-400 group-hover:text-white">
                    System Status
                  </div>
                  <div className="text-[10px] text-green-500 font-medium">
                    ● Operational
                  </div>
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-600 group-hover:text-white"
              />
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="px-2 pb-2">
            <button
              onClick={() => {
                setShowHealth(true);
                setSidebarOpen(false);
              }}
              className="w-full bg-[#161b22] border border-[#333] hover:border-green-500/50 p-2 rounded-xl flex items-center justify-center group transition-all cursor-pointer"
              title="System Status"
            >
              <div className="relative">
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <Server
                  size={22}
                  className="text-gray-400 group-hover:text-green-400 transition-colors"
                />
              </div>
            </button>
          </div>
        )}
        <div
          className={`p-2 border-t border-[#333] ${sidebarCollapsed ? "flex justify-center" : ""}`}
        >
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium cursor-pointer ${sidebarCollapsed ? "justify-center w-full px-2" : "w-full"}`}
            title={sidebarCollapsed ? "Lock Console" : undefined}
          >
            <LogOut size={sidebarCollapsed ? 22 : 18} />
            {!sidebarCollapsed && "Lock Console"}
          </button>
        </div>
      </div>

      {/* DESKTOP TOP BAR */}
      <div
        className={`hidden md:flex fixed top-0 right-0 z-20 bg-[#0a0e17] border-b border-[#333] h-16 px-6 justify-between items-center transition-all duration-300 ${
          sidebarCollapsed ? "left-16" : "left-64"
        }`}
      >
        <h2 className="text-xl text-gray-400 font-light">
          Welcome, <span className="text-white font-bold">Admin</span>
        </h2>
        <div className="flex items-center bg-[#161b22] border border-[#333] rounded-lg px-4 py-2 w-64">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-white w-full"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div
        className={`flex-1 p-4 pt-20 md:p-8 md:pt-24 w-full overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {activeTab === "overview" && <AdminDashboardOverview />}
          {activeTab === "verify" && <ExperienceQueue />}
          {activeTab === "users" && <UserList />}
          {activeTab === "payments" && <PaymentQueue />}
          {activeTab === "questions" && <QuestionList />}
          {activeTab === "add-question" && <AddQuestionForm />}
          {activeTab === "add-mcq" && <AddMCQForm />}
          {activeTab === "media" && <MediaLibrary />}
          {activeTab === "bugs" && <BugList />}
          {activeTab === "contact" && <ContactQueryList />}
          {activeTab === "notifications" && <AdminNotificationPanel />}
        </div>
      </div>

      {showHealth && <SystemHealthModal onClose={() => setShowHealth(false)} />}
    </div>
  );
};

export default AdminDashboard;
