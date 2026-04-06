import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  Briefcase,
  ChevronDown,
  FileText,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Building2,
  MapPin,
  IndianRupee,
  GraduationCap,
  School,
  Bold,
  Italic,
  Code,
  List,
  Sparkles,
  Linkedin,
  Github,
  Link2,
  CalendarDays
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownEditor from "../../components/MarkdownEditor";

const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// Top 50+ Indian Engineering Colleges
const INDIAN_COLLEGES = [
  // IITs
  "IIT Kharagpur", "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT Indore", "IIT BHU Varanasi",
  "IIT Gandhinagar", "IIT Patna", "IIT Ropar", "IIT Bhubaneswar", "IIT Jodhpur",
  "IIT Mandi", "IIT Tirupati", "IIT Palakkad", "IIT Dharwad", "IIT Jammu",
  "IIT Goa", "IIT Bhilai", "IIT Dhanbad (ISM)",
  // NITs
  "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Rourkela",
  "NIT Allahabad", "NIT Kurukshetra", "NIT Durgapur", "NIT Jamshedpur", "NIT Silchar",
  "NIT Hamirpur", "NIT Surat", "NIT Nagpur", "NIT Patna", "NIT Jalandhar",
  "NIT Raipur", "NIT Agartala", "NIT Goa", "NIT Delhi", "NIT Meghalaya",
  "NIT Manipur", "NIT Mizoram", "NIT Arunachal Pradesh", "NIT Sikkim", "NIT Uttarakhand",
  // IIITs
  "IIIT Hyderabad", "IIIT Delhi", "IIIT Allahabad", "IIIT Bangalore", "IIIT Gwalior",
  "IIIT Jabalpur", "IIIT Kancheepuram", "IIIT Lucknow", "IIIT Kota", "IIIT Una",
  // BITS
  "BITS Pilani", "BITS Goa", "BITS Hyderabad",
  // Other Top Colleges
  "DTU Delhi", "NSUT Delhi", "IIITD Delhi", "VIT Vellore", "SRM Chennai",
  "Manipal Institute of Technology", "COEP Pune", "VJTI Mumbai", "ICT Mumbai",
  "Jadavpur University", "Anna University", "RVCE Bangalore", "PES University",
  "BMS College of Engineering", "MIT Manipal", "Thapar University",
  "LNMIIT Jaipur", "DA-IICT Gandhinagar", "IIITM Gwalior",
  "Other"
];

// Major Indian cities for location autocomplete
const INDIAN_CITIES = [
  "Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi", "Noida", "Gurgaon",
  "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Indore", "Chandigarh",
  "Thiruvananthapuram", "Kochi", "Coimbatore", "Lucknow", "Bhopal",
  "Nagpur", "Visakhapatnam", "Mysuru", "Mangalore", "Vadodara", "Surat",
  "Guwahati", "Bhubaneswar", "Patna", "Ranchi", "Dehradun", "Shimla",
  "Gandhinagar", "Raipur", "Kanpur", "Agra", "Varanasi", "Allahabad",
  "Jodhpur", "Udaipur", "Trivandrum", "Madurai", "Vijayawada",
  "Warangal", "Roorkee", "Kharagpur", "Pilani", "Manipal", "Vellore",
  "Remote", "Work From Home", "Other"
];

// --- Components ---

const SuccessModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-3xl font-serif text-white mb-3 tracking-tight">
          Story Submitted
        </h2>

        <p className="text-gray-400 mb-8 leading-relaxed text-sm">
          Your experience has been sent for review. Our team ensures quality and anonymity where needed.
          <br /><br />
          <span className="text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full">
            ~2-4 hours approval time
          </span>
        </p>

        <button
          onClick={() => (onClose ? onClose() : navigate("/Interview-Experience"))}
          className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all cursor-pointer"
        >
          Return to Experiences
        </button>
      </motion.div>
    </div>
  );
};

const TagPill = ({ text }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mr-2 mb-2">
    {text}
  </span>
);


// Guidelines Modal Component
const GuidelinesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const guidelines = [
    {
      title: "Be Truthful & Accurate",
      description: "Share only your genuine experience. Do not fabricate rounds, questions, or outcomes. Misleading information harms other candidates.",
      icon: "⚖️"
    },
    {
      title: "Respect Confidentiality",
      description: "Do not disclose proprietary information, NDA-protected content, or exact coding questions if prohibited by the company's hiring policy.",
      icon: "🔒"
    },
    {
      title: "No Personal Attacks",
      description: "Avoid naming or targeting individual interviewers, recruiters, or employees. Focus on the process, not the people.",
      icon: "🚫"
    },
    {
      title: "Use Proper Formatting",
      description: "Structure your experience with clear round titles and descriptions. Use Markdown for code snippets, bold text, and lists to improve readability.",
      icon: "📝"
    },
    {
      title: "Be Detailed & Helpful",
      description: "Mention topics asked (e.g., 'DP on Trees', 'System Design — URL Shortener'), difficulty level, and your approach. Vague posts are not useful.",
      icon: "🎯"
    },
    {
      title: "Mention Preparation Resources",
      description: "If specific resources (books, courses, problem sets) helped you, share them in your tips. This adds immense value for future candidates.",
      icon: "📚"
    },
    {
      title: "No Spam or Self-Promotion",
      description: "Do not use this platform to advertise paid courses, referral links, YouTube channels, or any commercial content.",
      icon: "🚷"
    },
    {
      title: "Submissions Are Reviewed",
      description: "All experiences go through a manual review before publishing. Low-effort, inappropriate, or policy-violating submissions will be rejected.",
      icon: "👁️"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1A1A1A] border border-white/10 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Submission Guidelines</h2>
            <p className="text-xs text-gray-400 mt-1">Please read carefully before submitting</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {guidelines.map((g, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
              <div className="text-2xl shrink-0 mt-0.5">{g.icon}</div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">{g.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{g.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all cursor-pointer text-sm"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
};


const ShareExperiencePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Placement"); // Placement | Internship
  const [showModal, setShowModal] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    college: "",
    customCollege: "",
    department: "",
    degreeType: "",
    batch: new Date().getFullYear().toString(),
    location: "",
    verdict: "Selected",
    difficulty: "Medium",
    ctc: "",
    stipend: "",
    roleType: "",
    rounds: [{ roundName: "", description: "" }],
    tips: "",
    tags: "",
    linkedin: "",
    github: "",
  });

  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const collegeDropdownRef = React.useRef(null);

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = React.useRef(null);
  const filteredCities = INDIAN_CITIES.filter(city =>
    city.toLowerCase().includes(formData.location.toLowerCase())
  );

  const filteredColleges = INDIAN_COLLEGES.filter(college =>
    college.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  // Close college dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target)) {
        setShowCollegeDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...formData.rounds];
    newRounds[index][field] = value;
    setFormData({ ...formData, rounds: newRounds });
  };

  const addRound = () => {
    setFormData({
      ...formData,
      rounds: [...formData.rounds, { roundName: "", description: "" }],
    });
  };

  const removeRound = (index) => {
    if (formData.rounds.length === 1) return;
    setFormData({
      ...formData,
      rounds: formData.rounds.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }
      const payload = {
        ...formData,
        experienceType: activeTab,
      };
      const response = await axios.post(
        `${VITE_API_BASE_URL}/interviews/experience`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201) {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Submission Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render the appropriate pills for tags
  const renderTags = () => {
    if (!formData.tags) return null;
    return formData.tags.split(",").map((tag, i) => {
      const trimmed = tag.trim();
      if (!trimmed) return null;
      return <TagPill key={i} text={trimmed} />;
    });
  };

  return (
    <>
      <SuccessModal isOpen={showModal} onClose={() => navigate("/Interview-Experience")} />
      <GuidelinesModal isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} />

      <div className="flex flex-col md:flex-row min-h-screen bg-[#121212] text-gray-100 font-sans selection:bg-blue-500/30">

        {/* --- LEFT SIDEBAR (Guide & Context) --- */}
        <div className="hidden md:flex w-[26%] bg-[#121212] border-r border-[#ffffff10] flex-col sticky top-0 h-screen overflow-y-auto">
          {/* Header */}
          <div className="p-8 pb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group cursor-pointer"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-4xl font-serif text-white leading-tight mb-2">
              Share Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Story
              </span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Your insights help thousands of students crack their dream roles. Be detailed, be honest.
            </p>
          </div>

          {/* Type Selector */}
          <div className="px-8 py-4">
            <div className="bg-[#1E1E1E] p-1 rounded-xl border border-white/10 flex gap-1">
              <button
                onClick={() => setActiveTab("Placement")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "Placement"
                  ? "bg-[#2A2A2A] text-white shadow-sm ring-1 ring-white/10"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
              >
                <Briefcase size={16} /> Placement
              </button>
              <button
                onClick={() => setActiveTab("Internship")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "Internship"
                  ? "bg-[#2A2A2A] text-white shadow-sm ring-1 ring-white/10"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
              >
                <FileText size={16} /> Internship
              </button>
            </div>
          </div>

          {/* Tips Section */}
          <div className="flex-1 px-8 pt-4 pb-8 space-y-6 opacity-80">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <span className="text-blue-400 font-serif font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Be Specific</h4>
                  <p className="text-xs text-gray-400 mt-1">Don't just say "DSA questions". Mention the topics like "DP on Trees" or "Sliding Window".</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <span className="text-purple-400 font-serif font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Verdict Matters</h4>
                  <p className="text-xs text-gray-400 mt-1">Found a role challenging? Mark it as 'Hard'. It sets the right expectation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/10 text-xs text-gray-500">
            © AlgoViz Community •{" "}
            <button
              type="button"
              onClick={() => setShowGuidelines(true)}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer transition-colors"
            >
              Guidelines
            </button>
          </div>

        </div>

        {/* --- RIGHT CANVAS (Writing Form) --- */}
        <div className="flex-1 h-screen overflow-y-auto bg-[#121212] relative">
          {/* Mobile Header */}
          <div className="md:hidden p-6 border-b border-white/10 flex items-center gap-4 bg-[#121212] sticky top-0 z-30">
            <button onClick={() => window.history.back()} className="cursor-pointer">
              <ArrowLeft className="text-gray-400" />
            </button>
            <h1 className="text-lg font-bold text-white">Share Experience</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 md:p-12 pb-20 space-y-12">

            {/* BLOCK 1: THE METADATA */}
            <section className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-white flex items-center gap-2">
                  <Building2 className="text-blue-500" size={20} />
                  Company & Role
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Company</label>
                  <input
                    required
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Google, Amazon"
                    className="w-full bg-[#1E1E1E] border-0 ring-1 ring-white/10 rounded-xl px-5 py-3 text-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Role</label>
                  <input
                    required
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. SDE-1"
                    className="w-full bg-[#1E1E1E] border-0 ring-1 ring-white/10 rounded-xl px-5 py-3 text-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Location, Job Type, Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Location with autocomplete */}
                <div className="space-y-3" ref={locationDropdownRef}>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      name="location"
                      value={formData.location}
                      onChange={(e) => {
                        handleChange(e);
                        setShowLocationDropdown(true);
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="City"
                      autoComplete="off"
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all"
                    />
                    {showLocationDropdown && formData.location && filteredCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto bg-[#1E1E1E] border border-white/20 rounded-xl shadow-2xl">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, location: city });
                              setShowLocationDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${formData.location === city
                              ? "bg-blue-500/10 text-blue-400"
                              : "text-gray-300 hover:bg-white/5"
                              }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Job Type</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      name="roleType"
                      value={formData.roleType}
                      onChange={handleChange}
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-10 text-white focus:ring-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-[#1E1E1E] text-gray-400">--Select--</option>
                      <option value="On-Campus" className="bg-[#1E1E1E] text-white">On-Campus</option>
                      <option value="Off-Campus" className="bg-[#1E1E1E] text-white">Off-Campus</option>
                      <option value="PPO" className="bg-[#1E1E1E] text-white">PPO</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Year</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      placeholder="e.g. 2026"
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: CTC/Stipend + Degree Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">
                    {activeTab === "Placement" ? "CTC" : "Stipend"}
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      name={activeTab === "Placement" ? "ctc" : "stipend"}
                      value={activeTab === "Placement" ? formData.ctc : formData.stipend}
                      onChange={handleChange}
                      placeholder={activeTab === "Placement" ? "e.g. 24 LPA" : "e.g. 50k/mo"}
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Degree Type */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Degree Type</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      name="degreeType"
                      value={formData.degreeType}
                      onChange={handleChange}
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-10 text-white focus:ring-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-[#1E1E1E] text-gray-400">--Select--</option>
                      <option value="B.Tech" className="bg-[#1E1E1E] text-white">B.Tech</option>
                      <option value="M.Tech" className="bg-[#1E1E1E] text-white">M.Tech</option>
                      <option value="Dual Degree" className="bg-[#1E1E1E] text-white">Dual Degree</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              {/* Row 4: College + Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* College Dropdown with Search */}
                <div className="space-y-3" ref={collegeDropdownRef}>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">College / University</label>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                    <input
                      type="text"
                      value={formData.college === "Other" ? "Other" : collegeSearch || formData.college}
                      onChange={(e) => {
                        if (formData.college !== "Other") {
                          setCollegeSearch(e.target.value);
                          setShowCollegeDropdown(true);
                        }
                      }}
                      onFocus={() => setShowCollegeDropdown(true)}
                      placeholder="Search or select college"
                      readOnly={formData.college === "Other"}
                      className={`w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all ${formData.college === "Other" ? "cursor-default" : ""}`}
                    />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />

                    {/* Dropdown */}
                    {showCollegeDropdown && (
                      <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-[#1E1E1E] border border-white/20 rounded-xl shadow-2xl">
                        {filteredColleges.length > 0 ? (
                          filteredColleges.map((college) => {
                            const isEnabled = college === "IIT Kharagpur" || college === "Other";
                            return (
                              <button
                                key={college}
                                type="button"
                                disabled={!isEnabled}
                                onClick={() => {
                                  if (isEnabled) {
                                    setFormData({ ...formData, college, customCollege: "" });
                                    setCollegeSearch("");
                                    setShowCollegeDropdown(false);
                                  }
                                }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${!isEnabled
                                  ? "text-gray-600 cursor-not-allowed"
                                  : formData.college === college
                                    ? "bg-blue-500/10 text-blue-400 cursor-pointer hover:bg-white/5"
                                    : "text-gray-300 cursor-pointer hover:bg-white/5"
                                  }`}
                              >
                                {college}
                                {!isEnabled && <span className="ml-2 text-xs text-gray-500">(Coming soon)</span>}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">No matches found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.college === "Other" && (
                    <input
                      type="text"
                      value={formData.customCollege}
                      onChange={(e) => setFormData({ ...formData, customCollege: e.target.value })}
                      placeholder="Enter your college name"
                      autoFocus
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all mt-2"
                    />
                  )}
                </div>

                {/* Department Input */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Department / Branch</label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science, ECE"
                    className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>

              </div>
            </section>

            <hr className="border-white/5 border-dashed" />

            {/* BLOCK 2: THE VERDICT */}
            <section className="space-y-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={20} />
                The Outcome
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'verdict', value: 'Selected' } })}
                  className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${formData.verdict === 'Selected'
                    ? 'bg-green-900/20 border-green-500/50 ring-1 ring-green-500'
                    : 'bg-[#1E1E1E] border-white/10 hover:border-white/10'
                    }`}
                >
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.verdict === 'Selected' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                      }`}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${formData.verdict === 'Selected' ? 'text-green-100' : 'text-gray-300'}`}>Offer Received</h3>
                      <p className="text-xs text-gray-400 mt-1">Made it through!</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'verdict', value: 'Rejected' } })}
                  className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${formData.verdict === 'Rejected'
                    ? 'bg-red-900/20 border-red-500/50 ring-1 ring-red-500'
                    : 'bg-[#1E1E1E] border-white/10 hover:border-white/10'
                    }`}
                >
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.verdict === 'Rejected' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                      }`}>
                      <XCircle size={20} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${formData.verdict === 'Rejected' ? 'text-red-100' : 'text-gray-300'}`}>Not Selected</h3>
                      <p className="text-xs text-gray-400 mt-1">Better luck next time.</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Difficulty Dropdown as a pill selector nearby */}
              <div className="flex items-center gap-4 mt-6 p-4 bg-[#1E1E1E] rounded-xl border border-white/5">
                <span className="text-sm text-gray-400 font-medium">Difficulty Level:</span>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'difficulty', value: level } })}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${formData.difficulty === level
                        ? level === 'Easy' ? 'bg-green-500 text-black' : level === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <hr className="border-white/5 border-dashed" />

            {/* BLOCK 3: THE NARRATIVE (ROUNDS) */}
            <section className="space-y-8">
              <div className="flex justify-between items-end">
                <h2 className="text-xl font-medium text-white flex items-center gap-2">
                  <FileText className="text-purple-500" size={20} />
                  Interview Rounds
                </h2>
              </div>

              <div className="relative pl-14 md:pl-16 border-l border-white/10 space-y-8">
                <AnimatePresence>
                  {formData.rounds.map((round, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="relative"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[calc(3.5rem_+_5px)] md:-left-[calc(3rem_+_5px)] top-4 w-10 h-10 bg-[#1E1E1E] border border-white/20 rounded-full flex items-center justify-center text-sm font-bold text-gray-300 z-10">
                        {index + 1}
                      </div>

                      <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                          <input
                            placeholder="Round Title (e.g. DSA Round 1)"
                            value={round.roundName}
                            onChange={(e) => handleRoundChange(index, "roundName", e.target.value)}
                            className="bg-transparent text-lg font-semibold text-white placeholder-gray-500 outline-none w-full mr-4"
                          />
                          {formData.rounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRound(index)}
                              className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>

                        {/* Description with Markdown Editor */}
                        <MarkdownEditor
                          value={round.description}
                          onChange={(e) => handleRoundChange(index, "description", e.target.value)}
                          placeholder="Describe this round in detail. What questions were asked? How did you approach them?"
                          rows={5}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add Round Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={addRound}
                    className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all w-full md:w-auto cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={16} />
                    </div>
                    <span className="font-medium text-sm">Add Another Round</span>
                  </button>
                </div>
              </div>
            </section>

            <hr className="border-white/5 border-dashed" />

            {/* BLOCK 4: TIPS & TAGS */}
            <section className="space-y-8">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <Lightbulb className="text-yellow-500" size={20} />
                Final Thoughts
              </h2>

              {/* Tips with Markdown Editor */}
              <MarkdownEditor
                label="Tips for Future Candidates"
                value={formData.tips}
                onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                placeholder="Share your top 3 tips for future candidates..."
                rows={4}
              />

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Tags (Comma Separated)</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. React, Dynamic Programming, System Design"
                  className="w-full bg-[#1E1E1E] border-0 ring-1 ring-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                />
                <div className="flex flex-wrap mt-2">
                  {renderTags()}
                </div>
              </div>
            </section>

            <hr className="border-white/5 border-dashed" />

            {/* BLOCK 5: SOCIAL CONNECT */}
            <section className="space-y-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <Link2 className="text-cyan-500" size={20} />
                Connect With You
              </h2>
              <p className="text-sm text-gray-400 -mt-3">Optional — help readers reach out for more details.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/your-username"
                      className="w-full h-12 bg-[#1E1E1E] ring-1 ring-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-500 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Action */}
            <div className="mt-10 pt-6 border-t border-white/10 flex justify-end items-center gap-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/Interview-Experience")}
                className="px-6 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Publishing..." : "Publish Story"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ShareExperiencePage;
