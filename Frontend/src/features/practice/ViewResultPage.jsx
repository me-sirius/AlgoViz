import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MinusCircle,
  Trophy,
  Target,
  Clock,
  Share2,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Markdown Renderer with code highlighting and LaTeX
const MarkdownRenderer = ({ content, className = "" }) => (
  <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      components={{
        code: ({ node, inline, className, children, ...props }) => {
          if (inline) {
            return <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-amber-300" {...props}>{children}</code>;
          }
          return (
            <div className="rounded-lg overflow-hidden my-2 border border-white/10">
              <div className="bg-[#0d1117] p-3 overflow-x-auto">
                <code className={`${className} font-mono text-sm`} {...props}>{children}</code>
              </div>
            </div>
          );
        },
        p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-2">{children}</p>,
        strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const ViewResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'correct', 'incorrect', 'skipped'

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/mcq/result/${id}`, {
          // Attach your token logic here
        });
        if (data.success) setResult(data.data);
      } catch (error) {
        console.error("Error fetching result", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );

  if (!result) return <div className="text-white">Result not found.</div>;

  // --- DERIVED STATS ---
  const correctCount = result.answers.filter((a) => a.isCorrect).length;
  const incorrectCount = result.answers.filter(
    (a) => !a.isCorrect && a.userSelected !== -1
  ).length;
  const skippedCount = result.answers.filter(
    (a) => a.userSelected === -1 || a.userSelected === null || (Array.isArray(a.userSelected) && a.userSelected.length === 0)
  ).length;
  const accuracy = Math.round((correctCount / result.totalQuestions) * 100);
  const isPass = accuracy >= 70; // 70% passing criteria

  // Filter Logic
  const filteredQuestions = result.answers.filter((q) => {
    const isSkipped = q.userSelected === -1 || q.userSelected === null || (Array.isArray(q.userSelected) && q.userSelected.length === 0);
    if (filter === "correct") return q.isCorrect;
    if (filter === "incorrect") return !q.isCorrect && !isSkipped;
    if (filter === "skipped") return isSkipped;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 font-sans pb-20">
      {/* ... (Header and Summary Card logic is mostly fine, we just need to ensure result.answers usage is safe) ... */}

      {/* --- HEADER --- */}
      <div className="sticky top-0 z-40 bg-[#0a0e17]/80 backdrop-blur-md border-b border-[#333]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />{" "}
            <span className="font-bold">Back to Dashboard</span>
          </button>
          <h1 className="text-white font-bold hidden md:block">
            {result.category} Analysis
          </h1>
          <div className="w-8"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-10">
        {/* --- HERO SUMMARY CARD --- */}
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#333] rounded-3xl p-8 mb-10 relative overflow-hidden">
          {/* Background Glow */}
          <div
            className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none ${isPass ? "bg-green-500" : "bg-red-500"
              }`}
          ></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${isPass
                  ? "bg-green-900/20 text-green-400 border-green-500/30"
                  : "bg-red-900/20 text-red-400 border-red-500/30"
                  }`}
              >
                {isPass ? <CheckCircle size={14} /> : <XCircle size={14} />}{" "}
                {isPass ? "Passed" : "Needs Improvement"}
              </div>
              <h2 className="text-5xl font-bold text-white mb-2">
                {result.score}{" "}
                <span className="text-2xl text-gray-500">
                  / {result.totalQuestions}
                </span>
              </h2>
              <p className="text-gray-400">
                Score obtained in {result.category}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
              <div className="p-4 bg-[#21262d]/50 rounded-2xl border border-[#333] text-center">
                <div className="text-green-400 font-bold text-2xl mb-1">
                  {correctCount}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold">
                  Correct
                </div>
              </div>
              <div className="p-4 bg-[#21262d]/50 rounded-2xl border border-[#333] text-center">
                <div className="text-red-400 font-bold text-2xl mb-1">
                  {incorrectCount}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold">
                  Wrong
                </div>
              </div>
              <div className="p-4 bg-[#21262d]/50 rounded-2xl border border-[#333] text-center">
                <div className="text-gray-400 font-bold text-2xl mb-1">
                  {skippedCount}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold">
                  Skipped
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#333"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={isPass ? "#4ade80" : "#f87171"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - accuracy / 100)
                      }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-xl font-bold text-white">
                  {accuracy}%
                </div>
              </div>
              <p className="text-xs text-gray-500 font-bold mt-2 uppercase">
                Accuracy
              </p>
            </div>
          </div>
        </div>

        {/* --- FILTERS --- */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {["all", "correct", "incorrect", "skipped"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${filter === f
                ? "bg-white text-black"
                : "bg-[#161b22] text-gray-400 border border-[#333] hover:text-white"
                }`}
            >
              {f} Questions
            </button>
          ))}
        </div>

        {/* --- QUESTION LIST --- */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const isSkipped = q.userSelected === -1 || q.userSelected === null || (Array.isArray(q.userSelected) && q.userSelected.length === 0);
            return (
              <div
                key={idx}
                className={`bg-[#161b22] border rounded-2xl p-6 md:p-8 transition-all ${q.isCorrect ? "border-[#333]" : "border-red-900/30 bg-red-900/5"
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white leading-relaxed mb-2">
                    <span className="text-gray-500 mr-3">Q{idx + 1}.</span>
                  </h3>
                  <div className="mb-4">
                    <MarkdownRenderer content={q.questionText} />
                  </div>
                  {q.isCorrect ? (
                    <span className="shrink-0 px-3 py-1 bg-green-900/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 flex items-center gap-1">
                      <CheckCircle size={12} /> Correct
                    </span>
                  ) : isSkipped ? (
                    <span className="shrink-0 px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold rounded-lg border border-gray-600 flex items-center gap-1">
                      <MinusCircle size={12} /> Skipped
                    </span>
                  ) : (
                    <span className="shrink-0 px-3 py-1 bg-red-900/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 flex items-center gap-1">
                      <XCircle size={12} /> Incorrect
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {q.options.map((opt, i) => {
                    let style =
                      "border-[#333] bg-[#0d1117] text-gray-400 opacity-60"; // Default dimmed

                    // Normalize indices
                    const correctIndices = q.correctOptions?.length ? q.correctOptions : (q.correctOption !== undefined ? [q.correctOption] : []);
                    const userIndices = Array.isArray(q.userSelected) ? q.userSelected : (q.userSelected !== -1 && q.userSelected !== undefined ? [q.userSelected] : []);

                    // 1. If this is a CORRECT answer
                    if (correctIndices.includes(i)) {
                      style =
                        "border-green-500/50 bg-green-500/10 text-green-400 font-bold opacity-100";
                    }

                    // 2. If this is what User SELECTED (and it was wrong: either not in correct set)
                    // Note: If user selected it and it IS correct, case 1 covers it.
                    if (userIndices.includes(i) && !correctIndices.includes(i)) {
                      style =
                        "border-red-500/50 bg-red-500/10 text-red-400 font-bold opacity-100";
                    }

                    return (
                      <div
                        key={i}
                        className={`w-full text-left p-4 rounded-xl border flex items-center gap-3 ${style}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${correctIndices.includes(i)
                            ? "border-green-500"
                            : userIndices.includes(i)
                              ? "border-red-500"
                              : "border-gray-600"
                            }`}
                        >
                          {correctIndices.includes(i) && (
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          )}
                          {userIndices.includes(i) && !correctIndices.includes(i) && (
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <MarkdownRenderer content={opt} />
                        </div>
                      </div>
                    );
                  })}
                </div>


                {/* Explanation */}
                <div className="bg-[#0d1117] rounded-xl border border-l-4 border-[#333] border-l-purple-500 p-5">
                  <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Explanation
                  </h5>
                  <MarkdownRenderer content={q.explanation || "No explanation provided."} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewResultPage;
