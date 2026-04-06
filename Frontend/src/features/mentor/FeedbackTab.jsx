import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Target,
  Send,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Code,
  FileText,
  Star,
  Award,
  MessageSquare,
  User,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import axios from "axios";

const FeedbackTab = ({ sessions, loading, onRefresh, API_BASE_URL }) => {
  // --- STATE ---
  const [selectedSession, setSelectedSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initial Form State
  const initialFormState = {
    overallScore: 75,
    summary: "",
    metrics: {
      communication: 7,
      problemSolving: 7,
      technicalKnowledge: 7,
      codeQuality: 7,
      systemDesign: 7,
      culturalFit: 7,
    },
    strengths: "",
    improvements: "",
    recommendation: "",
    privateNotes: "",
    codeNotes: "",
  };

  const [form, setForm] = useState(initialFormState);

  // Word count helper
  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // --- HANDLERS ---
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setForm(initialFormState);
    setError("");
    setSuccess("");
  };

  const handleResetForm = () => {
    setForm(initialFormState);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!selectedSession) return;

    const wordCount = getWordCount(form.summary);
    console.log(form);
    // Validation
    if (wordCount < 60) {
      setError(
        `Summary must be at least 60 words. Current: ${wordCount} words.`
      );
      return;
    }
    if (!form.recommendation) {
      setError("Please select a hiring recommendation.");
      return;
    }
    if (!form.strengths.trim()) {
      setError("Please describe the candidate's strengths.");
      return;
    }
    if (!form.improvements.trim()) {
      setError("Please describe areas for improvement.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("mentorToken");
      await axios.post(
        `${API_BASE_URL}/mentor/sessions/${selectedSession._id}/feedback`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(
        "Feedback submitted successfully! Interview marked as completed."
      );

      setTimeout(() => {
        setSelectedSession(null);
        setForm(initialFormState);
        setSuccess("");
        onRefresh();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatMetricName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getScoreColor = (score, max = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-emerald-600";
    if (score >= 60) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  // Filter sessions that haven't been given feedback yet
  const pendingSessions = sessions.filter(
    (s) => !s.mentorFeedback?.isSubmitted && s.status !== "Completed"
  );

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-emerald-400" size={24} />
            Interview Feedback
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Provide detailed and comprehensive feedback for completed interviews
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
        >
          Refresh List
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse" />
            <Loader2 className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
          </div>
          Loading pending sessions...
        </div>
      ) : pendingSessions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0d0d0d]">
          <CheckCircle2
            size={48}
            className="mx-auto mb-4 text-emerald-500/50"
          />
          <h3 className="text-white font-semibold mb-2">All Caught Up!</h3>
          <p className="text-zinc-500 text-sm">
            No interviews pending feedback. Great job!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- LEFT COLUMN: SESSION LIST --- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <ClipboardCheck size={16} />
                Pending Sessions
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {pendingSessions.length} pending
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {pendingSessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer group ${selectedSession?._id === session._id
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-[#0d0d0d] border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {session.studentId?.avatar ? (
                        <img
                          src={session.studentId.avatar}
                          alt={session.studentId.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                          {session.studentId?.name?.[0] || "S"}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-[#0d0d0d] flex items-center justify-center">
                        <Clock size={8} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">
                        {session.studentId?.name || "Student"}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate">
                        {session.topic || "Mock Interview"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600">
                        <Calendar size={10} />
                        <span>
                          {new Date(session.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>{session.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT COLUMN: FEEDBACK FORM --- */}
          <div className="lg:col-span-2">
            {!selectedSession ? (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-6">
                  <Target size={36} className="text-zinc-600" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Select a Session
                </h3>
                <p className="text-zinc-500 text-sm max-w-xs">
                  Choose an interview session from the left to provide detailed
                  feedback
                </p>
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {selectedSession.studentId?.avatar ? (
                        <img
                          src={selectedSession.studentId.avatar}
                          alt={selectedSession.studentId.name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xl">
                          {selectedSession.studentId?.name?.[0] || "S"}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {selectedSession.studentId?.name || "Student"}
                        </h3>
                        <p className="text-sm text-zinc-400 flex items-center gap-2">
                          <Sparkles size={12} className="text-amber-400" />
                          {selectedSession.topic}
                          <span className="text-zinc-600">•</span>
                          {selectedSession.timeSlot}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResetForm}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Clear Form
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-8 max-h-[700px] overflow-y-auto">
                  {/* 1. Overall Score */}
                  <div className="bg-[#111] rounded-xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getScoreGradient(
                            form.overallScore
                          )} flex items-center justify-center`}
                        >
                          <Award size={20} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">
                            Overall Score
                          </h4>
                          <p className="text-xs text-zinc-500">
                            Rate the overall performance
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-4xl font-bold ${getScoreColor(
                          form.overallScore
                        )}`}
                      >
                        {form.overallScore}
                        <span className="text-lg text-zinc-600">/100</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={form.overallScore}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          overallScore: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-600 mt-2">
                      <span>Needs Improvement</span>
                      <span>Average</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  {/* 2. Skill Metrics */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={16} className="text-amber-400" />
                      <h4 className="text-white font-semibold">
                        Skill Ratings
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(form.metrics).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-[#111] rounded-xl p-4 border border-white/5"
                        >
                          <label className="text-xs text-zinc-400 flex justify-between mb-2">
                            <span>{formatMetricName(key)}</span>
                            <span
                              className={`font-mono font-bold ${getScoreColor(
                                value,
                                10
                              )}`}
                            >
                              {value}/10
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={value}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                metrics: {
                                  ...form.metrics,
                                  [key]: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Strengths & Improvements */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <ThumbsUp size={14} className="text-emerald-400" />
                        Strengths *
                      </label>
                      <textarea
                        value={form.strengths}
                        onChange={(e) =>
                          setForm({ ...form, strengths: e.target.value })
                        }
                        placeholder="Describe the candidate's strengths...&#10;&#10;Example:&#10;The candidate demonstrated excellent problem-solving skills and communicated their thought process clearly throughout the interview."
                        rows={4}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors resize-none placeholder-zinc-600 text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <ThumbsDown size={14} className="text-amber-400" />
                        Areas to Improve *
                      </label>
                      <textarea
                        value={form.improvements}
                        onChange={(e) =>
                          setForm({ ...form, improvements: e.target.value })
                        }
                        placeholder="Describe areas where the candidate can improve...&#10;&#10;Example:&#10;The candidate could benefit from practicing edge case handling and improving their time management during the coding portion."
                        rows={4}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors resize-none placeholder-zinc-600 text-sm"
                      />
                    </div>
                  </div>

                  {/* 4. Detailed Summary */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-400" />
                        Detailed Summary *
                      </span>
                      <span
                        className={`text-xs font-mono ${getWordCount(form.summary) >= 60
                            ? "text-emerald-400"
                            : "text-amber-400"
                          }`}
                      >
                        {getWordCount(form.summary)}/60 words minimum
                      </span>
                    </label>
                    <textarea
                      value={form.summary}
                      onChange={(e) =>
                        setForm({ ...form, summary: e.target.value })
                      }
                      placeholder="Provide a comprehensive summary of the candidate's performance. Include:&#10;• How the interview started&#10;• Key discussion points&#10;• Technical abilities demonstrated&#10;• Communication style&#10;• Problem-solving approach&#10;• Overall impression and closing thoughts&#10;&#10;(Minimum 60 words required)"
                      rows={8}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors resize-none placeholder-zinc-600 text-sm"
                    />
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <AlertCircle size={12} />
                      Please describe the interview from start to end with at
                      least 60 words
                    </div>
                  </div>

                  {/* 5. Code / Notes */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Code size={14} className="text-purple-400" />
                      Code & Interview Notes
                      <span className="text-xs text-zinc-500 font-normal">
                        (Optional but recommended)
                      </span>
                    </label>
                    <textarea
                      value={form.codeNotes}
                      onChange={(e) =>
                        setForm({ ...form, codeNotes: e.target.value })
                      }
                      placeholder="Paste any code written during the interview, problem solutions, or important notes here...&#10;&#10;Example:&#10;// Problem: Two Sum&#10;function twoSum(nums, target) {&#10;  const map = new Map();&#10;  for (let i = 0; i < nums.length; i++) {&#10;    const complement = target - nums[i];&#10;    if (map.has(complement)) return [map.get(complement), i];&#10;    map.set(nums[i], i);&#10;  }&#10;}"
                      rows={10}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-colors resize-none placeholder-zinc-600 text-sm font-mono"
                    />
                  </div>

                  {/* 6. Recommendation */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Award size={14} className="text-cyan-400" />
                      Hire Recommendation *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        "Strong Hire",
                        "Hire",
                        "Lean Hire",
                        "Lean No Hire",
                        "No Hire",
                      ].map((rec) => (
                        <button
                          key={rec}
                          onClick={() =>
                            setForm({ ...form, recommendation: rec })
                          }
                          className={`p-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${form.recommendation === rec
                              ? rec.includes("No Hire")
                                ? "bg-red-500/20 border-red-500/50 text-red-400"
                                : rec === "Lean Hire"
                                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                  : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                              : "bg-[#111] border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                            }`}
                        >
                          {rec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. Private Notes */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      Private Notes
                      <span className="text-xs text-zinc-600">
                        (Not visible to candidate)
                      </span>
                    </label>
                    <textarea
                      value={form.privateNotes}
                      onChange={(e) =>
                        setForm({ ...form, privateNotes: e.target.value })
                      }
                      placeholder="Internal notes for your reference..."
                      rows={2}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-500/50 transition-colors resize-none placeholder-zinc-600 text-sm"
                    />
                  </div>

                  {/* --- ERROR / SUCCESS MESSAGES --- */}
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <CheckCircle2 size={16} />
                      {success}
                    </div>
                  )}

                  {/* --- SUBMIT BUTTON --- */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-600/50 disabled:to-emerald-500/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30 text-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Feedback & Complete Interview
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FeedbackTab;
