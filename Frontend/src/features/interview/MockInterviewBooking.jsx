import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Star,
  Clock,
  Video,
  ShieldCheck,
  Award,
  Zap,
  MessageSquare,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
  CreditCard,
  Lock,
  FileUp,
  X,
  Upload,
  FileText,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// HELPER: GENERATE REALISTIC AVAILABILITY
// ============================================================================
const generateAvailabilityMap = () => {
  const availability = {};
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateKey = date.toISOString().split("T")[0]; // "2025-12-20"
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Weekends = Many slots, Weekdays = Evenings only
    const slots = isWeekend
      ? ["10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "6:00 PM"]
      : ["6:00 PM", "7:00 PM", "8:00 PM"];

    availability[dateKey] = slots;
  }
  return availability;
};

// ============================================================================
// COMPONENT: MOCK INTERVIEW BOOKING
// ============================================================================
const MockInterviewBooking = () => {
  const { id } = useParams();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- CALENDAR STATE ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Format: "YYYY-MM-DD"
  const [selectedSlot, setSelectedSlot] = useState(null);

  // --- RESUME STATE ---
  const fileInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchMentorDetail = async () => {
      try {
        setLoading(true);
        // Fetch specific mentor by ID (Public Route)
        const res = await axios.get(`${API_BASE_URL}/mentor/profile/${id}`);
        const data = res.data.mentor;
        console.log("data : ", data);

        // --- DATA TRANSFORMATION ---
        const availabilityMap = {};
        if (data.availability && Array.isArray(data.availability)) {
          data.availability.forEach((day) => {
            const dateKey = new Date(day.date).toISOString().split("T")[0];
            const activeSlots = day.slots
              .filter((s) => !s.isBooked)
              .map((s) => s.time);

            if (activeSlots.length > 0) {
              availabilityMap[dateKey] = activeSlots;
            }
          });
        }

        const formattedMentor = {
          ...data,
          availability: availabilityMap,
          // Fallback or additional mock reviews
          reviews: data.reviews && data.reviews.length > 0 ? data.reviews : [
            {
              id: 101,
              user: "Arjun Mehta",
              rating: 5,
              date: "2 days ago",
              comment: "Absolutely game-changing session. Ratan pinpointed my weak spots in DP immediately. Highly recommend!"
            },
            {
              id: 102,
              user: "Sara Khan",
              rating: 5,
              date: "1 week ago",
              comment: "The mock interview felt cleaner and more professional than my actual Google interview. Great feedback."
            },
            {
              id: 103,
              user: "David Chen",
              rating: 4,
              date: "2 weeks ago",
              comment: "Very knowledgeable mentor. Helped me structure my system design answers much better."
            }
          ]
        };
        setMentor(formattedMentor);

        // Auto Select Date Logic
        const todayKey = new Date().toISOString().split("T")[0];
        if (availabilityMap[todayKey]) {
          setSelectedDate(todayKey);
        } else {
          const availableDates = Object.keys(availabilityMap).sort();
          if (availableDates.length > 0) {
            setSelectedDate(availableDates[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching mentor details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMentorDetail();
    }
  }, [id]);

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const formatDateKey = (date) => date.toISOString().split("T")[0];

  // --- RESUME FILE HANDLING ---
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Only PDF, DOC, DOCX allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 5MB.";
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setResumeError(error);
      return;
    }

    setResumeFile(file);
    setResumeError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setResumeError(error);
      return;
    }

    setResumeFile(file);
    setResumeError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = () => {
    setResumeFile(null);
    setResumeError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedSlot) return;
    if (!resumeFile) {
      setResumeError("Please upload your resume before booking.");
      return;
    }

    // TODO: In production, upload resume first then proceed
    alert(
      `Redirecting to Payment...\n\nDate: ${selectedDate}\nTime: ${selectedSlot}\nResume: ${resumeFile.name}\nAmount: ₹${(
        mentor.price * 1.18
      ).toFixed(0)}`
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );

  const gstAmount = mentor.price * 0.18;
  const totalAmount = mentor.price + gstAmount;
  const calendarDays = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-gray-100 font-sans pb-20 selection:bg-cyan-500/30">

      {/* Background Glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      {/* HEADER NAV */}
      <div className="fixed top-0 w-full z-50 bg-[#0b0b0d]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold cursor-pointer"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck size={14} className="text-emerald-500" /> Verified Mentor
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 relative">

        {/* ======================= */}
        {/* LEFT COLUMN: PROFILE    */}
        {/* ======================= */}
        <div className="space-y-12">

          {/* HERO PROFILE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-8 items-start"
          >
            <div className="relative shrink-0">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-32 h-32 rounded-3xl border-2 border-white/10 shadow-2xl bg-[#161b22] object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-[#0b0b0d] p-1.5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-xl text-xs font-bold border border-yellow-400/20">
                  {mentor.rating}
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-black text-white mb-2">{mentor.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-lg text-gray-400 mb-6">
                <span className="flex items-center gap-2">
                  <Briefcase size={16} /> {mentor.role}
                </span>
                <span className="text-gray-600">•</span>

                {/* Responsive Company Name/Logo */}
                <div className="h-6 flex items-center">
                  {/* Mobile: Logo */}
                  <img
                    src={`https://logo.clearbit.com/${mentor.company.toLowerCase().replace(/\s/g, "")}.com`}
                    alt={mentor.company}
                    className="h-6 w-auto object-contain md:hidden"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {/* Desktop: Text */}
                  <span className="hidden md:block text-white font-bold">{mentor.company}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(mentor.expertise || mentor.tags || []).map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ABOUT SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Info size={16} />
              </div>
              About Me
            </h3>
            <p className="text-gray-300 leading-loose text-lg font-light">
              {mentor.about}
            </p>
          </motion.section>

          {/* STATS SECTION */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-[#151517] border border-white/5 text-center">
              <div className="text-3xl font-black text-white mb-1">{mentor.rating}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#151517] border border-white/5 text-center">
              <div className="text-3xl font-black text-white mb-1">{mentor.sessions}+</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sessions</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#151517] border border-white/5 text-center">
              <div className="text-3xl font-black text-white mb-1">{mentor.experience}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience</div>
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <MessageSquare size={16} />
              </div>
              Student Reviews
            </h3>
            <div className="space-y-4">
              {mentor.reviews?.map((review) => (
                <div key={review.id} className="bg-[#151517] border border-white/5 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {review.user[0]}
                      </div>
                      <span className="font-bold text-white text-sm">{review.user}</span>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-700" : ""} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ============================== */}
        {/* RIGHT COLUMN: BOOKING CONSOLE  */}
        {/* ============================== */}
        <div className="relative">
          <div className="sticky top-28">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#151517]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* 1. HEADER */}
              <div className="p-6 border-b border-white/5 bg-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarIcon size={18} className="text-cyan-400" />
                  Book a Session
                </h3>
              </div>

              {/* 2. CALENDAR */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-bold text-white text-sm">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d}>{d}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, idx) => {
                    if (!date) return <div key={idx} />;
                    const dateKey = formatDateKey(date);
                    const isAvailable = mentor.availability && mentor.availability[dateKey];
                    const isSelected = selectedDate === dateKey;
                    const isPast = date < new Date().setHours(0, 0, 0, 0);

                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable || isPast}
                        onClick={() => { setSelectedDate(dateKey); setSelectedSlot(null); }}
                        className={`
                                aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all relative
                                ${isSelected ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 cursor-pointer"
                            : isAvailable ? "bg-white/5 text-gray-200 hover:bg-white/10 border border-white/5 cursor-pointer"
                              : "text-gray-700 cursor-not-allowed"}
                              `}
                      >
                        {date.getDate()}
                        {isAvailable && !isSelected && (
                          <div className="absolute bottom-1 w-1 h-1 bg-cyan-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. SLOTS */}
              <div className="px-6 pb-6">
                <div className="text-xs font-bold text-gray-500 uppercase mb-3">Available Slots</div>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedDate && mentor?.availability?.[selectedDate] ? (
                    mentor.availability[selectedDate].map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${selectedSlot === slot
                          ? "bg-white text-black border-white"
                          : "bg-[#0b0b0d] text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                          }`}
                      >
                        {slot}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4 text-xs text-gray-600 italic">
                      Select a date to view slots
                    </div>
                  )}
                </div>
              </div>

              {/* 4. RESUME UPLOAD */}
              <div className="px-6 pb-6">
                <div className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <FileUp size={14} />
                  Upload Resume/CV
                  <span className="text-red-400">*</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Dropzone or File Preview */}
                {!resumeFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                      ${isDragging
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 hover:border-white/30 hover:bg-white/5"
                      }
                    `}
                  >
                    <Upload size={24} className={`mx-auto mb-2 ${isDragging ? "text-cyan-400" : "text-gray-600"}`} />
                    <p className="text-sm text-gray-400 mb-1">
                      {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      PDF, DOC, DOCX • Max 5MB
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{resumeFile.name}</p>
                      <p className="text-[10px] text-gray-500">{formatFileSize(resumeFile.size)}</p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={16} className="text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {resumeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 mt-3 text-xs text-red-400"
                    >
                      <AlertCircle size={14} />
                      {resumeError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[10px] text-gray-600 mt-3">
                  Your resume helps the interviewer prepare and provide better feedback.
                </p>
              </div>

              {/* 5. PAYMENT SUMMARY */}
              <div className="bg-[#0b0b0d] p-6 border-t border-white/5">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Session Fee</span>
                    <span className="text-white font-medium">₹{mentor.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (18%)</span>
                    <span className="text-white font-medium">₹{gstAmount.toFixed(0)}</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 font-bold">Total</span>
                    <span className="text-2xl font-black text-white">₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedSlot || !resumeFile}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedDate && selectedSlot && resumeFile
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {selectedDate && selectedSlot && resumeFile ? (
                    <>Pay Securely <CreditCard size={16} /></>
                  ) : !resumeFile ? (
                    "Upload Resume First"
                  ) : (
                    "Select Slot"
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-gray-600 uppercase font-bold tracking-wider">
                  <Lock size={10} /> Secure SSL Payment
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MockInterviewBooking;
