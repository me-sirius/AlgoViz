import React, { useState, useRef, useEffect, useContext } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import Confetti from "react-confetti";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm"; // For tables, strikethrough, etc.
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import styles for KaTeX
import {
  Play,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  Code2,
  X,
  Terminal,
  ArrowLeft,
  Lock,
  ListChecks,
  XCircle,
  FileText,
  Clock,
  CloudLightning,
  Type,
  Moon,
  Sun,
  Copy,
  Cpu,
  RefreshCw,
  AlignLeft,
  Eye,
  Pause,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Unlock,
  Maximize2,
  Layout,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  ArrowLeftRight
} from "lucide-react";
import Alert from "../../components/Alert";
import IDELayout from "./components/BrutalistIDELayout";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../core/context/UserContext";
import SecureStorage from "../../core/utils/secureStorage";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useClickOutside } from "../../core/hooks/useClickOutside";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTheme } from "../../core/context/ThemeContext";

const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// --- Default Language Configuration ---
const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    monacoLanguage: "javascript",
    defaultCode: `// Write your code here...`,
  },
  python: {
    name: "Python 3",
    monacoLanguage: "python",
    defaultCode: `# Write your code here...`,
  },
  cpp: {
    name: "C++",
    monacoLanguage: "cpp",
    defaultCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  },
  c: {
    name: "C",
    monacoLanguage: "c",
    defaultCode: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  },
};

// Shared code renderer to normalize inline code (strips wrapping backticks) and block code
const createCodeRenderer = (isDarkMode) => ({ node, className, children, ...props }) => {
  const text = Array.isArray(children)
    ? children.map((c) => String(c)).join("")
    : String(children || "");

  const isBlockCode = (className && className.includes("language-")) || text.includes("\n");

  if (!isBlockCode) {
    const cleaned = text.trim().replace(/^`+|`+$/g, "");
    return (
      <code
        className={`px-1.5 py-0.5 font-mono text-xs before:content-none after:content-none ${isDarkMode ? "bg-[#1a1a1a] text-orange-300 border border-[rgba(255,255,255,0.08)]" : "bg-slate-200 text-orange-700"}`}
        style={{ display: "inline" }}
        {...props}
      >
        {cleaned}
      </code>
    );
  }

  return (
    <pre className={`p-3 overflow-x-auto text-sm my-4 border ${isDarkMode ? "bg-[#0a0a0a] border-[rgba(255,255,255,0.08)]" : "bg-slate-100 border-slate-200"}`}>
      <code className={className} {...props}>
        {text}
      </code>
    </pre>
  );
};
// --- REVISED: EDITORIAL COMPONENT ---
const EditorialItem = ({ title, type, cost, content, isCode = false, isUnlocked, onUnlock, loading, isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`mb-4 border overflow-hidden group transition-colors ${isDarkMode ? "border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] hover:border-[rgba(255,255,255,0.15)]" : "border-slate-200 bg-white hover:border-orange-500/30"}`}>
      {/* Header Row */}
      <div className={`flex items-center justify-between p-4 border-b border-transparent transition-colors ${isDarkMode ? "bg-[#111111] group-hover:border-[rgba(255,255,255,0.08)]" : "bg-slate-50 group-hover:border-slate-200"}`}>
        <div className="flex items-center gap-3">
          {type === "solution" ? (
            <FileText size={18} className="text-blue-400" />
          ) : (
            <Lightbulb size={18} className="text-amber-400" />
          )}
          <span className={`font-mono text-sm tracking-wide uppercase font-bold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{title}</span>
        </div>

        {isUnlocked ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer"
              title={isVisible ? "Hide Content" : "Show Content"}
            >
              {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            {isCode && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  alert("Copied directly to clipboard!");
                }}
                className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                title="Copy Code"
              >
                <Copy size={14} />
              </button>
            )}
            <span className="text-xs font-bold text-green-500 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded">
              <Unlock size={12} /> Unlocked
            </span>
          </div>
        ) : (
          <button
            onClick={() => onUnlock(type, cost)}
            disabled={loading}
            className="text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1.5 rounded transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {loading ? (
              "..."
            ) : (
              <>
                <Lock size={12} /> Unlock ({cost} Pts)
              </>
            )}
          </button>
        )}
      </div>

      {/* Content Area (Only visible if unlocked AND visible) */}
      {isUnlocked && isVisible && (
        <div className={`p-4 border-t ${isDarkMode ? "border-slate-800 bg-[#201f1f]" : "border-slate-200 bg-slate-50"}`}>
          {isCode ? (
            <div className="relative">
              <pre className={`text-sm font-mono p-3 overflow-x-auto border ${isDarkMode ? "text-cyan-100 bg-[#0e0e0e] border-slate-800/50" : "text-slate-800 bg-white border-slate-200"}`}>
                <code>{content || "// No code available"}</code>
              </pre>
            </div>
          ) : (
            <div className={`text-sm leading-relaxed font-mono ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code: createCodeRenderer(isDarkMode),
                  pre: ({ children }) => <>{children}</>,
                  blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 pl-4 py-1 my-4 italic rounded-r ${isDarkMode ? "border-slate-700 text-slate-400 bg-slate-900/30" : "border-slate-300 text-slate-500 bg-slate-50"}`} {...props} />,
                }}
              >
                {content || "No content available."}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EditorialSection = ({ question, updateUser, user, isDarkMode, isSolved = false }) => {
  const navigate = useNavigate();
  const [curBalance, setCurBalance] = useState(user?.balance || -1);
  const [confirmingUnlock, setConfirmingUnlock] = useState(null); // { type, cost } or null

  // Dynamically initialize unlock state based on available hints
  // If problem is solved, all items are automatically unlocked
  const [unlockedState, setUnlockedState] = useState(() => {
    if (isSolved) {
      // Auto-unlock everything for solved problems
      const autoUnlocked = { solution: true };
      (question.hints || []).forEach((_, idx) => {
        autoUnlocked[`hint${idx}`] = true;
      });
      return autoUnlocked;
    }

    const saved = localStorage.getItem(`unlocks_${question._id || question.id}`);
    if (saved) return JSON.parse(saved);

    // Initialize unlock state for all hints dynamically
    const initialState = { solution: false };
    (question.hints || []).forEach((_, idx) => {
      initialState[`hint${idx}`] = false;
    });
    return initialState;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      `unlocks_${question._id || question.id}`,
      JSON.stringify(unlockedState)
    );
  }, [unlockedState, question._id, question.id]);

  // Update unlock state when isSolved changes
  useEffect(() => {
    if (isSolved) {
      const autoUnlocked = { solution: true };
      (question.hints || []).forEach((_, idx) => {
        autoUnlocked[`hint${idx}`] = true;
      });
      setUnlockedState(autoUnlocked);
    }
  }, [isSolved, question.hints]);

  const handleUnlockRequest = (type, cost) => {
    if (loading) return;

    // If solved or premium, unlock for free
    if (isSolved || user.isPremium) {
      setUnlockedState((prev) => ({ ...prev, [type]: true }));
      return;
    }
    if (user.balance < cost) {
      setConfirmingUnlock({ type: 'insufficient', cost });
      return;
    }
    // Show confirmation
    setConfirmingUnlock({ type, cost });
  };

  const handleConfirmUnlock = async () => {
    if (!confirmingUnlock || confirmingUnlock.type === 'insufficient') return;

    const { type, cost } = confirmingUnlock;
    setConfirmingUnlock(null);
    setLoading(true);

    try {
      const res = await axios.post(
        `${VITE_API_BASE_URL}/users/deduct-balance`,
        {
          amount: cost,
          itemId: type,  // e.g., "hint0", "hint1", "solution"
          questionId: question._id || question.id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(res.data);
      if (res.data.success) {
        setUnlockedState((prev) => ({ ...prev, [type]: true }));
        updateUser({ ...user, balance: res.data.balance });
        setCurBalance(res.data.balance);
      } else {
        alert(res.data.message || "Failed to unlock, your balance is unchanged.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate hint costs (10 for first, 15 for second, 20 for third, etc.)
  const getHintCost = (index) => 10 + (index * 5);

  const hints = question.hints || [];

  return (
    <div className="animate-fadeIn pb-10">
      {/* Balance Bar */}
      <div className="flex justify-between items-center mb-8 px-1">
        <h3 className={`text-lg font-black font-mono tracking-wide flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
          <BookOpen size={18} className="text-blue-500" /> Hints & Solution
        </h3>
        <div className={`px-4 py-1.5 rounded-full border text-xs font-mono shadow-lg flex items-center gap-2 ${isDarkMode ? "bg-[#0e0e0e] border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
          <span className="tracking-wider">Credits:</span>
          <span className="text-amber-400 font-bold">{curBalance}</span>
        </div>
      </div>

      {/* Dynamic Hints */}
      {hints.length > 0 ? (
        hints.map((hint, index) => (
          <EditorialItem
            key={index}
            title={`Hint ${index + 1}`}
            type={`hint${index}`}
            cost={getHintCost(index)}
            content={hint}
            isUnlocked={unlockedState[`hint${index}`]}
            onUnlock={handleUnlockRequest}
            loading={loading}
            isDarkMode={isDarkMode}
          />
        ))
      ) : (
        <div className={`text-sm italic mb-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
          No hints available for this problem.
        </div>
      )}

      <EditorialItem
        title="Full Solution (C++)"
        type="solution"
        cost={50}
        content={question.solution}
        isCode={true}
        isUnlocked={unlockedState['solution']}
        onUnlock={handleUnlockRequest}
        loading={loading}
        isDarkMode={isDarkMode}
      />

      {/* Unlock Confirmation Modal */}
      {confirmingUnlock && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
          <div className={`p-6 rounded-2xl border max-w-sm w-full mx-4 shadow-2xl ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            {confirmingUnlock.type === 'insufficient' ? (
              <>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Insufficient Credits</h3>
                <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  You need {confirmingUnlock.cost} credits but only have {curBalance}. Upgrade to Premium for unlimited access!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingUnlock(null)}
                    className={`flex-1 py-2 px-4 font-medium transition-colors ${isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setConfirmingUnlock(null); navigate('/premium'); }}
                    className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                  >
                    Go Premium
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Unlock Content?</h3>
                <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  This will deduct <span className="font-bold text-amber-400">{confirmingUnlock.cost} credits</span> from your balance.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingUnlock(null)}
                    className={`flex-1 py-2 px-4 font-medium transition-colors ${isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUnlock}
                    className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                  >
                    Unlock
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
// --- Settings Dropdown Component (Replaced Modal) ---
const SettingsDropdown = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  theme,
  setTheme,
  showLineNumbers,
  setShowLineNumbers,
  tabSize,
  setTabSize,
  minimap,
  setMinimap,
  wordWrap,
  setWordWrap,
  settingsButtonRef,
  isDarkMode
}) => {
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, onClose, [settingsButtonRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full mt-2 -right-1 z-50 w-64 border shadow-[4px_4px_0px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden ${isDarkMode ? "bg-[#201f1f] border-[rgba(255,255,255,0.10)]" : "bg-white border-slate-200"}`}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className={`flex items-center gap-2 border-b pb-2 ${isDarkMode ? "text-[#f97316] border-[rgba(255,255,255,0.10)]" : "text-orange-600 border-slate-200"}`}>
          <Settings size={16} />
          <span className="text-xs font-bold font-mono tracking-widest uppercase">Editor Config</span>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className={isDarkMode ? "text-slate-500" : "text-slate-400"} size={14} />
            <span className={`font-bold text-xs font-mono ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>FONT SIZE</span>
          </div>
          <div className={`flex gap-1 p-1 border ${isDarkMode ? "bg-[#0e0e0e] border-[rgba(255,255,255,0.10)]" : "bg-slate-50 border-slate-200"}`}>
            {[14, 16, 18].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-1.5 text-[10px] font-mono font-bold transition-all cursor-pointer ${fontSize === size
                  ? "bg-[#f97316]/20 text-[#f97316]"
                  : "text-slate-500 hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
                  }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>


        {/* Line Numbers */}
        <div className={`flex items-center justify-between pt-2 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <AlignLeft className={isDarkMode ? "text-slate-500" : "text-slate-400"} size={14} />
            <span className={`font-bold text-xs font-mono ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>LINE NUMBERS</span>
          </div>
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`w-10 h-5 transition-colors cursor-pointer relative ${showLineNumbers
              ? "bg-[#f97316]"
              : isDarkMode ? "bg-[#353534]" : "bg-slate-300"
              }`}
          >
            <div
              className={`absolute top-1 w-3 h-3 bg-white transition-all ${showLineNumbers ? "left-6" : "left-1"
                }`}
            />
          </button>
        </div>

        {/* Tab Size */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <Code2 className={isDarkMode ? "text-slate-500" : "text-slate-400"} size={14} />
            <span className={`font-bold text-xs font-mono ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>TAB SIZE</span>
          </div>
          <div className={`flex gap-1 p-1 border ${isDarkMode ? "bg-[#0e0e0e] border-[rgba(255,255,255,0.10)]" : "bg-slate-50 border-slate-200"}`}>
            {[2, 4].map((size) => (
              <button
                key={size}
                onClick={() => setTabSize(size)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${tabSize === size
                  ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 hover:scale-105 active:scale-95"
                  }`}
              >
                {size} spaces
              </button>
            ))}
          </div>
        </div>

        {/* Word Wrap */}
        <div className={`flex items-center justify-between pt-2 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <AlignLeft className={isDarkMode ? "text-slate-500" : "text-slate-400"} size={14} />
            <span className={`font-bold text-xs font-mono ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>WORD WRAP</span>
          </div>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`w-10 h-5 transition-colors relative cursor-pointer ${wordWrap
              ? "bg-[#f97316]"
              : isDarkMode ? "bg-[#353534]" : "bg-slate-300"
              }`}
          >
            <div
              className={`absolute top-1 w-3 h-3 bg-white transition-all ${wordWrap ? "left-6" : "left-1"
                }`}
            />
          </button>
        </div>

        {/* Minimap */}
        <div className={`flex items-center justify-between pt-2 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <Maximize2 className={isDarkMode ? "text-slate-500" : "text-slate-400"} size={14} />
            <span className={`font-bold text-xs font-mono ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>MINIMAP</span>
          </div>
          <button
            onClick={() => setMinimap(!minimap)}
            className={`w-10 h-5 transition-colors relative cursor-pointer ${minimap
              ? "bg-[#f97316]"
              : isDarkMode ? "bg-[#353534]" : "bg-slate-300"
              }`}
          >
            <div
              className={`absolute top-1 w-3 h-3 bg-white transition-all ${minimap ? "left-6" : "left-1"
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmissionModal = ({ isOpen, onClose, submission, theme, fontSize, isDarkMode }) => {
  if (!isOpen || !submission) return null;

  const getMonacoLang = (langStr) => {
    const normalized = langStr?.toLowerCase() || "javascript";
    if (normalized.includes("python")) return "python";
    if (normalized.includes("c++") || normalized.includes("cpp")) return "cpp";
    return normalized;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center animate-in fade-in zoom-in duration-200">
      <div className={`border w-[800px] h-[600px] flex flex-col shadow-2xl overflow-hidden relative ${isDarkMode ? "bg-[#111111] border-[rgba(255,255,255,0.08)]" : "bg-white border-slate-200"}`}>
        {/* Header */}
        <div className={`h-14 border-b flex justify-between items-center px-6 relative z-20 ${isDarkMode ? "bg-[#0a0a0a] border-[rgba(255,255,255,0.08)]" : "bg-slate-50 border-slate-200"}`}>
          <div>
            <div
              className={`font-bold font-mono text-lg flex items-center gap-2 ${submission.status === "Accepted"
                ? "text-emerald-400"
                : "text-red-400"
                }`}
            >
              {submission.status === "Accepted" ? (
                <CheckCircle size={18} />
              ) : (
                <XCircle size={18} />
              )}
              {submission.status.toUpperCase()}
            </div>
            <div className="text-[10px] text-slate-500 flex gap-3 mt-1 font-mono uppercase tracking-wider">
              <span>{new Date(submission.createdAt).toLocaleString()}</span>
              <span>•</span>
              <span className="capitalize text-slate-400">{submission.language}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 transition-colors cursor-pointer ${isDarkMode ? "hover:bg-slate-800 text-slate-500 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-800"}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Read-Only Editor */}
        <div className={`flex-1 relative ${isDarkMode ? "bg-[#111111]" : "bg-white"}`}>
          <Editor
            height="100%"
            theme={theme}
            language={getMonacoLang(submission.language)}
            value={submission.code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: fontSize,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Footer Info */}
        <div className={`h-12 border-t flex items-center px-6 justify-between z-20 ${isDarkMode ? "border-[rgba(255,255,255,0.08)] bg-[#0a0a0a]" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex gap-4 text-xs font-mono">
            <span className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> PASSED:{" "}
              <span className="text-white font-bold">
                {submission.passedTestCases}/{submission.totalTestCases}
              </span>
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(submission.code);
              alert("Code copied to clipboard!");
            }}
            className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 px-3 py-1.5 border border-cyan-500/20 hover:border-cyan-500/50 cursor-pointer"
          >
            <Copy size={12} /> COPY SOURCE
          </button>
        </div>
      </div>
    </div>
  );
};
// --- MAIN IDE PAGE ---
const IDEPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // --- Theme from global context ---
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const themeStyles = {
    bg: isDarkMode ? "bg-[#131313] text-[#e5e2e1]" : "bg-slate-50 text-slate-800",
    panelBg: isDarkMode ? "bg-[#201f1f]" : "bg-white",
    border: isDarkMode ? "border-[rgba(255,255,255,0.10)]" : "border-slate-200",
    text: isDarkMode ? "text-[#e5e2e1]" : "text-slate-800",
    textHead: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-[#c8c6c5]" : "text-slate-500",
    cardBg: isDarkMode ? "bg-[#0e0e0e]" : "bg-slate-50",
    cardBorder: isDarkMode ? "border-[rgba(255,255,255,0.10)]" : "border-slate-200",
    inputBg: isDarkMode ? "bg-[#0e0e0e]" : "bg-white",
  };

  // --- Context ---
  const {
    currentQuestion,
    setCurrentQuestion,
    setUser,
    user,
    markQuestionAsSolved,
    updateUser,
  } = useContext(AuthContext) || {};

  // --- State ---
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);
  const [currentLang, setCurrentLang] = useState("cpp");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // Code Map State
  const [codeMap, setCodeMap] = useState({
    javascript: LANGUAGE_CONFIG.javascript.defaultCode,
    python: LANGUAGE_CONFIG.python.defaultCode,
    cpp: LANGUAGE_CONFIG.cpp.defaultCode,
    c: LANGUAGE_CONFIG.c.defaultCode,
  });
  const [isTestActive, setIsTestActive] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Layout UI State
  const [activeLeftTab, setActiveLeftTab] = useState("Description");
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcase");
  // const [consoleHeight, setConsoleHeight] = useState(250); // Removed, handled by react-resizable-panels

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasSuccessfulRun, setHasSuccessfulRun] = useState(false); // Only show explanation after successful run

  // Result State
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Submissions History State
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  // Settings & Alerts
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "error",
    customButtons: null,
  });

  // Editor Config
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState(isDarkMode ? "algoviz-dark" : "light");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [tabSize, setTabSize] = useState(4);
  const [minimap, setMinimap] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ line: 1, column: 1 });

  // Sync editor theme with app theme
  useEffect(() => {
    setEditorTheme(isDarkMode ? "algoviz-dark" : "light");
  }, [isDarkMode]);

  // --- MONACO THEME INIT ---
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("algoviz-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "8be9fd" },
      ],
      colors: {
        "editor.background": "#201f1f",
        "editor.foreground": "#e5e2e1",
        "editor.lineHighlightBackground": "#2a2a2a",
        "editorCursor.foreground": "#f97316",
        "editorWhitespace.foreground": "#353534",
        "editorIndentGuide.background": "#2a2a2a",
        "editorIndentGuide.activeBackground": "#353534",
      },
    });
  };
  const settingsButtonRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const leftPanelRef = useRef(null);

  // Layout presets - load from localStorage
  const [currentLayout, setCurrentLayout] = useState(() => {
    const saved = localStorage.getItem('ide-layout');
    return saved || 'balanced';
  });
  const [panelsSwapped, setPanelsSwapped] = useState(() => {
    return localStorage.getItem('ide-panels-swapped') === 'true';
  });
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // --- DRAG AND DROP LAYOUT STATE ---
  const [slots, setSlots] = useState({
    slotA: 'left',
    slotB: 'editor',
    slotC: 'console'
  });

  // Load drag layout
  useEffect(() => {
    const savedSlots = localStorage.getItem("ideDragLayout");
    if (savedSlots) {
      try {
        setSlots(JSON.parse(savedSlots));
      } catch (e) { console.error("Failed to parse drag layout", e); }
    }
  }, []);

  // Save drag layout
  useEffect(() => {
    localStorage.setItem("ideDragLayout", JSON.stringify(slots));
  }, [slots]);

  // Save layout preferences to localStorage
  useEffect(() => {
    localStorage.setItem('ide-layout', currentLayout);
  }, [currentLayout]);

  useEffect(() => {
    localStorage.setItem('ide-panels-swapped', panelsSwapped.toString());
  }, [panelsSwapped]);

  const applyLayout = (layout) => {
    setCurrentLayout(layout);
    if (leftPanelRef.current) {
      switch (layout) {
        case 'balanced':
          leftPanelRef.current.resize(40);
          break;
        case 'code-focus':
          leftPanelRef.current.resize(25);
          break;
        case 'problem-focus':
          leftPanelRef.current.resize(55);
          break;
      }
    }
  };

  useClickOutside(languageDropdownRef, () => setIsDropdownOpen(false), [settingsButtonRef]);

  // const isDragging = useRef(false); // Removed, handled by react-resizable-panels
  useEffect(() => {
    // if (!isTestActive) return;
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter = Run Code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isRunning && !isSubmitting) {
          handleRunCode();
        }
      }
      // Ctrl/Cmd + Shift + Enter = Submit Code
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning && !isSubmitting) {
          handleSubmitCode();
        }
      }
      // Ctrl/Cmd + K = Show Shortcuts Modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isSubmitting]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  useEffect(() => {
    setTimeElapsed(0);
    setIsTimerRunning(false);
  }, [id]);
  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeQuestion = async () => {
      // Helper to check if question has ALL required fields
      // List API only returns description, NOT testCases/hints - so we must check for testCases
      const isCompleteQuestion = (q) => q && q.description && q.testCases && q.testCases.length > 0;

      // 1. Check context first - but only if it has complete data
      if (currentQuestion && (currentQuestion.id === id || currentQuestion._id === id) && isCompleteQuestion(currentQuestion)) {
        loadStarterCode(currentQuestion);
        return;
      }

      // 2. Try localStorage - but only if it has complete data
      const storedQ = JSON.parse(localStorage.getItem("currentQuestion"));
      if (storedQ && (storedQ.id === id || storedQ._id === id) && isCompleteQuestion(storedQ)) {
        setCurrentQuestion(storedQ);
        loadStarterCode(storedQ);
        return;
      }

      // 3. Fetch from API (when data is missing or incomplete)
      try {
        const response = await axios.get(`${VITE_API_BASE_URL}/questions/id/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data?.data) {
          const fetchedQuestion = response.data.data;
          setCurrentQuestion(fetchedQuestion);
          localStorage.setItem("currentQuestion", JSON.stringify(fetchedQuestion));
          loadStarterCode(fetchedQuestion);
        }
      } catch (error) {
        console.error("Failed to fetch question:", error);
        // Navigate back to practice page if question not found
        navigate("/practice");
      }
    };

    const loadStarterCode = (q) => {
      const newCodeMap = { ...LANGUAGE_CONFIG };
      Object.keys(newCodeMap).forEach(key => {
        newCodeMap[key] = LANGUAGE_CONFIG[key].defaultCode;
      });

      // If the question has specific starter code in DB, use it
      if (q.starterCode && Array.isArray(q.starterCode)) {
        q.starterCode.forEach((starter) => {
          const langKey = starter.language.toLowerCase();
          if (newCodeMap[langKey] !== undefined) {
            newCodeMap[langKey] = starter.code;
          }
        });
      }

      setCodeMap(newCodeMap);
      setRunResult(null);
      setSubmissionResult(null);
      setActiveConsoleTab("testcase");
      setHasSuccessfulRun(false);
      setShowExplanation(false);
    };

    if (id) {
      initializeQuestion();
    }
  }, [id]); // Depend on ID to reload if route changes

  // --- FETCH SUBMISSIONS ---
  const fetchSubmissions = async (isFetch = false) => {
    // Ensure we have a valid Question ID
    // console.log("submissions : ", submissions);
    if (submissions.length !== 0 && !isFetch) return;
    const qId = currentQuestion?.id || currentQuestion?._id;
    if (!qId) return;
    const cacheKey = `submissions_${qId}`;
    try {
      setLoadingSubmissions(true);
      const res = await axios.get(
        `${VITE_API_BASE_URL}/code/submissions/${qId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const newData = res.data.data || [];
      setSubmissions(newData);

      // 3. SAVE TO CACHE
      SecureStorage.setItem(cacheKey, newData);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Fetch when tab changes to "Submissions"
  useEffect(() => {
    if (activeLeftTab === "Submissions") {
      fetchSubmissions();
    }
  }, [activeLeftTab]);

  // --- HANDLERS ---
  // Removed manual resize handlers, now handled by react-resizable-panels
  // const startResize = (e) => {
  //   e.preventDefault();
  //   isDragging.current = true;
  //   document.addEventListener("mousemove", handleMouseMove);
  //   document.addEventListener("mouseup", stopResize);
  // };

  // const handleMouseMove = (e) => {
  //   if (!isDragging.current) return;
  //   const newHeight = window.innerHeight - e.clientY;
  //   if (newHeight > 50 && newHeight < window.innerHeight * 0.8) {
  //     setConsoleHeight(newHeight);
  //   }
  // };

  // const stopResize = () => {
  //   isDragging.current = false;
  //   document.removeEventListener("mousemove", handleMouseMove);
  //   document.removeEventListener("mouseup", stopResize);
  // };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setIsConsoleOpen(true);
    setActiveConsoleTab("result");
    setRunResult(null);
    setSubmissionResult(null);
    setShowConfetti(false);

    const sourceCode = codeMap[currentLang];
    const allTestCases = currentQuestion?.testCases || [];
    const publicTestCases = allTestCases.filter(tc => tc.isPublic);

    if (publicTestCases.length === 0) {
      setRunResult({
        status: "Error",
        output: "No public test cases available",
        isError: true,
      });
      setIsRunning(false);
      return;
    }

    try {
      // Run test cases sequentially to avoid rate limiting
      const results = [];
      for (let index = 0; index < publicTestCases.length; index++) {
        const testCase = publicTestCases[index];
        try {
          const response = await axios.post(
            `${VITE_API_BASE_URL}/code/run-new`,
            {
              code: sourceCode,
              language: currentLang,
              stdin: testCase.input,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const data = response.data;
          let status = "Error";
          let actualOutput = "";

          if (data.run) {
            status = data.run.code === 0 ? "Accepted" : "Runtime Error";
            actualOutput = data.run.stdout || data.run.stderr || "No Output.";
          } else if (data.output !== undefined) {
            status = data.status || "Accepted";
            actualOutput = data.output || "No Output.";
          }

          // Compare output
          if (status === "Accepted") {
            if (actualOutput.trim() !== testCase.output.trim()) {
              status = "Wrong Answer";
            }
          }

          results.push({
            caseIndex: index + 1,
            status,
            input: testCase.input,
            output: actualOutput,
            expected: testCase.output,
            isError: status === "Runtime Error" || status === "Error",
          });
        } catch (error) {
          results.push({
            caseIndex: index + 1,
            status: "Error",
            input: testCase.input,
            output: error.response?.data?.message || "Execution Failed",
            expected: testCase.output,
            isError: true,
          });
        }

        // 500ms delay between requests to avoid rate limiting
        if (index < publicTestCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Calculate overall status
      const passedCount = results.filter(r => r.status === "Accepted").length;
      const totalCount = results.length;
      let overallStatus = passedCount === totalCount ? "Accepted" : "Wrong Answer";

      // Check for any runtime errors
      if (results.some(r => r.status === "Runtime Error" || r.status === "Error")) {
        overallStatus = results.find(r => r.status === "Runtime Error")?.status || "Error";
      }

      setRunResult({
        status: overallStatus,
        passedCount,
        totalCount,
        details: results,
        isMultiCase: true,
        isError: overallStatus === "Runtime Error" || overallStatus === "Error",
      });

      // Enable explanation visibility after successful run
      if (overallStatus === "Accepted") {
        setHasSuccessfulRun(true);
      }
    } catch (error) {
      console.log("error : ", error);
      setRunResult({
        status: "Error",
        output: error.response?.data?.message || "Execution Failed",
        isError: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setIsConsoleOpen(true);
    setActiveConsoleTab("result");
    setRunResult(null);
    setSubmissionResult(null);
    setShowConfetti(false);

    const sourceCode = codeMap[currentLang];
    const qId = currentQuestion?.id || currentQuestion?._id;

    try {
      const response = await axios.post(
        `${VITE_API_BASE_URL}/code/submit-code`,
        {
          code: sourceCode,
          language: currentLang,
          questionId: qId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 120000, // 2 minute timeout for submission
        }
      );

      const result = response.data;
      console.log("Backend Result:", result); // Check if result.streak has a value here!

      const submissionData = {
        status: result.message,
        passedCount: result.passed,
        totalCount: result.total,
        details: result.results || [],
        streak: result.streak, // Backend sends this
        timeComplexity: result.timeComplexity,
        spaceComplexity: result.spaceComplexity,
      };

      setSubmissionResult(submissionData);
      setActiveLeftTab("Submissions");
      // --- 🚀 FIX STARTS HERE ---
      if (result.message === "Accepted") {
        // 1. Calculate new solved list (Handle duplicates)
        const currentSolved = user?.questionsSolved || [];
        // Ensure we don't add the same ID twice
        const newSolvedList = currentSolved.includes(qId)
          ? currentSolved
          : [...currentSolved, qId];

        // 2. Prepare the FULL updated user object
        // We update Credits, Streak, AND Solved Questions
        const updatedUser = {
          ...user,
          credits: result.remainingCredits, // Backend sends updated credits
          streak: result.streak, // Backend sends updated streak
          questionsSolved: newSolvedList,
        };

        // 3. Update Context & Storage using the Helper
        // (This assumes you extracted { updateUser } from useAuth())
        if (typeof updateUser === "function") {
          updateUser(updatedUser);
        } else {
          // Fallback if updateUser isn't available
          setUser(updatedUser);
          SecureStorage.setItem("user_cache", updatedUser);
        }

        // 4. UI Feedback
        setShowConfetti(true);
        if (activeLeftTab === "Submissions") {
          fetchSubmissions();
        }
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setIsTimerRunning(false);
      // --- 🚀 FIX ENDS HERE ---
    } catch (error) {
      console.error("Submit Error:", error);
      setSubmissionResult({
        status: "Error",
        error: error.response?.data?.message || "Submission failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setAlertConfig({
      isOpen: true,
      message: "Are you sure you want to leave?",
      type: "warning",
      customButtons: (
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => navigate("/practice")}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Leave
          </button>
          <button
            onClick={() =>
              setAlertConfig((prev) => ({ ...prev, isOpen: false }))
            }
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Stay
          </button>
        </div>
      ),
    });
  };

  // --- RENDER HELPERS ---

  const renderConsoleContent = () => {
    if (activeConsoleTab === "testcase") {
      // Filter ONLY public test cases for the tabs
      const publicCases =
        currentQuestion.testCases?.filter((tc) => tc.isPublic) || [];

      if (publicCases.length === 0) {
        return (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No public test cases available.
          </div>
        );
      }

      return (
        <div className={`h-full flex flex-col ${themeStyles.panelBg}`}>
          {/* Test Case Navigation (Tabs) */}
          <div className={`flex items-center gap-1 border-b px-2 pt-2 shrink-0 ${themeStyles.border} ${themeStyles.bg}`}>
            {/* Dynamic Test Case Tabs */}
            {publicCases.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestCaseId(idx)}
                className={`relative px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all border-t-2 border-x rounded-t-lg -mb-[1px] cursor-pointer ${activeTestCaseId === idx
                  ? `${isDarkMode ? "bg-[#201f1f] border-slate-800 border-b-[#201f1f] text-cyan-400" : "bg-white border-slate-200 border-b-white text-cyan-600"}`
                  : "border-transparent text-slate-500 hover:text-slate-400 hover:bg-slate-800/10"
                  }`}
              >
                CASE {idx + 1}
              </button>
            ))}
          </div>

          {/* Active Test Case Details */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                  Input
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(publicCases[activeTestCaseId]?.input)}
                  className="text-slate-600 hover:text-white transition-colors cursor-pointer"
                  title="Copy Input"
                >
                  <Copy size={12} />
                </button>
              </div>
              <div className={`p-4 border transition-colors group ${isDarkMode ? "bg-[#0e0e0e] border-slate-800/50 hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}>
                <pre className={`font-mono text-sm whitespace-pre-wrap leading-relaxed ${isDarkMode ? "text-cyan-100" : "text-cyan-700"}`}>
                  {publicCases[activeTestCaseId]?.input}
                </pre>
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono mb-2">
                Expected Output
              </div>
              <div className={`p-4 border transition-colors ${isDarkMode ? "bg-[#0e0e0e] border-slate-800/50 hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}>
                <pre className={`font-mono text-sm whitespace-pre-wrap leading-relaxed ${isDarkMode ? "text-emerald-100" : "text-emerald-700"}`}>
                  {publicCases[activeTestCaseId]?.output}
                </pre>
              </div>
            </div>

            {/* Only show explanation after successful run */}
            {hasSuccessfulRun && publicCases[activeTestCaseId]?.explanation && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                    Explanation
                  </div>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-500 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {showExplanation ? (
                      <>
                        <EyeOff size={12} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={12} /> Reveal
                      </>
                    )}
                  </button>
                </div>

                {showExplanation && (
                  <div className={`text-sm leading-relaxed font-mono pl-3 border-l-2 italic ${isDarkMode ? "text-slate-400 border-slate-800" : "text-slate-700 border-slate-300"}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code: createCodeRenderer(isDarkMode),
                        pre: ({ children }) => <>{children}</>,
                        blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 pl-4 py-1 my-4 italic rounded-r ${isDarkMode ? "border-slate-700 text-slate-400 bg-slate-900/30" : "border-slate-300 text-slate-500 bg-slate-50"}`} {...props} />,
                      }}
                    >
                      {publicCases[activeTestCaseId]?.explanation}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeConsoleTab === "result") {
      if (isRunning || isSubmitting) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium">
              {isSubmitting ? "Judging..." : "Running Code..."}
            </p>
          </div>
        );
      }

      if (!runResult && !submissionResult) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <Code2 size={48} className="opacity-20" />
            <p className="text-sm">Run code to see results</p>
          </div>
        );
      }

      // Run Result (Multi-Case Support)
      if (runResult) {
        // Multi-case result display
        if (runResult.isMultiCase && runResult.details) {
          return (
            <div className="space-y-4 animate-fadeIn p-4 h-full overflow-y-auto">
              {/* Overall Status */}
              <div className={`p-4 border ${runResult.status === "Accepted"
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
                }`}>
                <div className="flex items-center gap-2 text-xl font-bold font-mono tracking-tight mb-2">
                  {runResult.status === "Accepted" ? (
                    <CheckCircle size={24} className="text-emerald-500" />
                  ) : (
                    <XCircle size={24} className="text-red-500" />
                  )}
                  <span className={runResult.status === "Accepted" ? "text-emerald-500" : "text-red-500"}>
                    {runResult.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-mono text-slate-400">
                  Passed: <span className={`font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {runResult.passedCount} / {runResult.totalCount}
                  </span> public test cases
                </div>
              </div>

              {/* Test Case Breakdown */}
              <div className="space-y-3">
                <div className="text-xs text-gray-500 uppercase font-bold">Test Case Results</div>
                {runResult.details.map((tc, i) => (
                  <details key={i} className={`border ${tc.status === "Accepted"
                    ? "border-emerald-800/50 bg-emerald-900/10"
                    : "border-red-800/50 bg-red-900/10"
                    }`}>
                    <summary className="flex items-center gap-2 p-3 cursor-pointer select-none">
                      <div className={`w-2 h-2 rounded-full ${tc.status === "Accepted" ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className={`text-sm font-bold font-mono ${tc.status === "Accepted" ? "text-emerald-400" : "text-red-400"}`}>
                        CASE {tc.caseIndex}: {tc.status.toUpperCase()}
                      </span>
                    </summary>
                    <div className="p-3 pt-0 space-y-3 border-t border-slate-800/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Input</div>
                          <div className={`p-2 border font-mono text-xs whitespace-pre-wrap ${isDarkMode ? "bg-[#0e0e0e] border-slate-800/50 text-cyan-100" : "bg-slate-50 border-slate-200 text-cyan-700"}`}>
                            {tc.input}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Your Output</div>
                          <div className={`p-2 border font-mono text-xs whitespace-pre-wrap ${isDarkMode
                            ? `bg-[#0e0e0e] border-slate-800/50 ${tc.status === "Accepted" ? "text-emerald-100" : "text-red-300"}`
                            : `bg-slate-50 border-slate-200 ${tc.status === "Accepted" ? "text-emerald-700" : "text-red-600"}`
                            }`}>
                            {tc.output}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Expected</div>
                        <div className={`p-2 border font-mono text-xs whitespace-pre-wrap ${isDarkMode ? "bg-[#0e0e0e] border-slate-800/50 text-emerald-100" : "bg-slate-50 border-slate-200 text-emerald-700"}`}>
                          {tc.expected}
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          );
        }

        // Legacy single-case fallback (for backwards compatibility)
        return (
          <div className="space-y-4 animate-fadeIn p-4 h-full overflow-y-auto">
            <div
              className={`flex items-center gap-2 text-lg font-bold font-mono tracking-wide ${runResult.status === "Accepted"
                ? "text-emerald-400"
                : "text-red-400"
                }`}
            >
              {runResult.status === "Accepted" ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              {runResult.status.toUpperCase()}
            </div>

            {!runResult.isError ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Input</div>
                  <div className={`p-3 border font-mono text-sm whitespace-pre-wrap ${isDarkMode ? "bg-[#0e0e0e] border-slate-800/50 text-cyan-100" : "bg-slate-50 border-slate-200 text-cyan-700"}`}>
                    {runResult.input}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">
                    Your Output
                  </div>
                  <div
                    className={`p-3 border font-mono text-sm whitespace-pre-wrap ${isDarkMode
                      ? `bg-[#0e0e0e] border-slate-800/50 ${runResult.status === "Accepted" ? "text-emerald-100" : "text-red-300"}`
                      : `bg-slate-50 border-slate-200 ${runResult.status === "Accepted" ? "text-emerald-700" : "text-red-600"}`
                      }`}
                  >
                    {runResult.output}
                  </div>
                </div>
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">
                    Expected
                  </div>
                  <div className={`p-3 border font-mono text-sm whitespace-pre-wrap ${isDarkMode ? "bg-[#0e0e0e] border-slate-800/50 text-emerald-100" : "bg-slate-50 border-slate-200 text-emerald-700"}`}>
                    {runResult.expected}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 font-mono text-sm whitespace-pre-wrap border ${isDarkMode ? "bg-red-900/10 border-red-500/20 text-red-200" : "bg-red-50 border-red-200 text-red-700"}`}>
                {runResult.output}
              </div>
            )}
          </div>
        );
      }

      // Submission Result
      if (submissionResult) {
        return (
          <div className="space-y-6 animate-fadeIn p-4 h-full overflow-y-auto">
            {submissionResult.status === "Error" ? (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle /> {submissionResult.error}
              </div>
            ) : (
              <>
                <div
                  className={`p-4 border ${submissionResult.status === "Accepted"
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                    }`}
                >
                  <div className="flex items-center gap-2 text-2xl font-bold mb-2 font-mono tracking-tight">
                    <span
                      className={
                        submissionResult.status === "Accepted"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }
                    >
                      {submissionResult.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm font-mono">
                    <div className="text-slate-400">
                      Passed:{" "}
                      <span className={`font-bold ml-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {submissionResult.passedCount} / {submissionResult.totalCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-500 uppercase font-bold">
                    Test Case Breakdown
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {submissionResult.details?.map((res, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-mono border ${res.status === "Passed" || res.status === "Accepted"
                          ? "border-emerald-800 bg-emerald-900/20 text-emerald-400"
                          : "border-red-800 bg-red-900/20 text-red-400"
                          }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${res.status === "Passed" || res.status === "Accepted"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                            }`}
                        />
                        CASE {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      }
    }
  };



  if (!currentQuestion)
    return (
      <div className={`h-screen flex items-center justify-center transition-colors ${isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-slate-50 text-slate-800"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading Problem Environment...</p>
        </div>
      </div>
    );

  /* --- DRAGGABLE HEADER & CONTENT EXTRACTION --- */
  const leftHeader = (
    <div className={`flex h-12 px-4 items-center gap-6 shrink-0 border-b ${themeStyles.border} ${isDarkMode ? "bg-[#0e0e0e]" : "bg-slate-100"}`}>
      <button
        onClick={() => setActiveLeftTab("Description")}
        className={`relative h-full flex items-center gap-2 text-xs font-mono font-bold tracking-wider transition-all border-b-2 cursor-pointer ${activeLeftTab === "Description"
          ? "border-orange-500 text-orange-400"
          : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
      >
        <Layout size={14} /> DESCRIPTION
      </button>

      <button
        onClick={() => setActiveLeftTab("Submissions")}
        className={`relative h-full flex items-center gap-2 text-xs font-mono font-bold tracking-wider transition-all border-b-2 cursor-pointer ${activeLeftTab === "Submissions"
          ? "border-orange-500 text-orange-400"
          : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
      >
        <Clock size={14} /> HISTORY
      </button>

      <button
        onClick={() => setActiveLeftTab("Editorial")}
        className={`relative h-full flex items-center gap-2 text-xs font-mono font-bold tracking-wider transition-all border-b-2 cursor-pointer ${activeLeftTab === "Editorial"
          ? "border-amber-500 text-amber-400"
          : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
      >
        <BookOpen size={14} /> EDITORIAL
      </button>
    </div>
  );



  const editorHeader = (
    <div className={`h-12 flex items-center justify-between px-4 shrink-0 transition-colors ${isDarkMode ? "bg-[#0e0e0e] border-[rgba(255,255,255,0.10)]" : "bg-slate-100 border-slate-200"} ${themeStyles.border} border-b`}>
      <div className="relative" ref={languageDropdownRef}>
        <button
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            setShowSettings(false);
          }}
          className="flex items-center gap-2 text-xs font-mono font-medium text-orange-400 bg-orange-500/10 px-3 py-1.5 border border-orange-500/20 hover:bg-orange-500/20 transition-all cursor-pointer"
        >
          <Code2 size={14} />
          {LANGUAGE_CONFIG[currentLang].name} <ChevronDown size={14} />
        </button>
        {/* Language Dropdown */}
        {isDropdownOpen && (
          <div className={`absolute top-full mt-2 left-0 w-40 border shadow-xl py-1 z-50 ${isDarkMode ? "bg-[#0a0a0a] border-[rgba(255,255,255,0.08)]" : "bg-white border-slate-200"}`}>
            {Object.keys(LANGUAGE_CONFIG).map((langKey) => (
              <button
                key={langKey}
                onClick={() => {
                  setCurrentLang(langKey);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-mono transition-colors cursor-pointer ${currentLang === langKey
                  ? `${isDarkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}`
                  : `${isDarkMode ? "text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`
                  }`}
              >
                {LANGUAGE_CONFIG[langKey].name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* EDITOR SETTINGS */}
      <div className="relative" ref={settingsButtonRef}>
        <button
          onClick={() => {
            setShowSettings(!showSettings);
            setIsDropdownOpen(false);
          }}
          className={`p-1.5 transition-all cursor-pointer ${showSettings ? "bg-orange-500/20 text-orange-400" : "text-slate-400 hover:text-orange-400 hover:bg-[#1a1a1a]"
            }`}
          title="Editor Settings"
        >
          <Settings size={18} />
        </button>
        <SettingsDropdown
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          theme={editorTheme}
          setTheme={setEditorTheme}
          showLineNumbers={showLineNumbers}
          setShowLineNumbers={setShowLineNumbers}
          tabSize={tabSize}
          setTabSize={setTabSize}
          minimap={minimap}
          setMinimap={setMinimap}
          wordWrap={wordWrap}
          setWordWrap={setWordWrap}
          settingsButtonRef={settingsButtonRef}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );

  const editorPanelContent = (
    <>
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          beforeMount={handleEditorWillMount}
          theme={editorTheme}
          language={LANGUAGE_CONFIG[currentLang].monacoLanguage}
          value={codeMap[currentLang]}
          onChange={(val) =>
            setCodeMap((p) => ({ ...p, [currentLang]: val }))
          }
          options={{
            minimap: { enabled: minimap },
            fontSize,
            lineNumbers: showLineNumbers ? "on" : "off",
            wordWrap: wordWrap ? "on" : "off",
            tabSize,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10 },
            fontFamily: "JetBrains Mono, monospace"
          }}
          onMount={(editor, monaco) => {
            editor.onDidChangeCursorPosition((e) => {
              setEditorPosition({ line: e.position.lineNumber, column: e.position.column });
            });

            // Add keyboard shortcuts that work inside editor
            editor.addAction({
              id: 'run-code',
              label: 'Run Code',
              keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
              run: () => {
                if (!isRunning && !isSubmitting) handleRunCode();
              }
            });

            editor.addAction({
              id: 'submit-code',
              label: 'Submit Code',
              keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
              run: () => {
                if (!isRunning && !isSubmitting) handleSubmitCode();
              }
            });

            editor.addAction({
              id: 'show-shortcuts',
              label: 'Show Shortcuts',
              keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
              run: () => {
                setShowShortcutsModal(prev => !prev);
              }
            });
          }}
        />
      </div>
      {/* --- EDITOR STATUS BAR --- */}
      <div className={`h-6 flex items-center justify-between px-4 text-[10px] font-mono border-t shrink-0 ${isDarkMode ? "bg-[#0e0e0e] border-[rgba(255,255,255,0.10)] text-[#c8c6c5]" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Ln {editorPosition.line}, Col {editorPosition.column}
          </span>
          <span className={`px-1.5 py-0.5 rounded ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}>
            {LANGUAGE_CONFIG[currentLang]?.name || currentLang}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>{(codeMap[currentLang]?.length || 0).toLocaleString()} chars</span>
          <span>UTF-8</span>
        </div>
      </div>
    </>
  );


  const consoleHeader = (
    <div className={`h-10 flex items-center justify-between px-2 shrink-0 select-none border-b ${isDarkMode ? "bg-[#0e0e0e] border-[rgba(255,255,255,0.10)]" : "bg-slate-100 border-slate-200"}`}>
      <div className="flex items-center h-full">
        <button
          className={`px-3 mr-2 hover:scale-110 active:scale-90 transition-transform cursor-pointer ${themeStyles.textMuted} hover:text-cyan-400`}
          title="Console"
        >
          <Terminal size={16} />
        </button>

        <button
          onClick={() => {
            setIsConsoleOpen(true);
            setActiveConsoleTab("testcase");
          }}
          className={`h-full px-4 text-xs font-mono font-bold tracking-wide flex items-center gap-2 border-b-2 transition-all hover:bg-slate-800/10 cursor-pointer ${activeConsoleTab === "testcase"
            ? `border-cyan-500 ${isDarkMode ? "text-white bg-slate-800/20" : "text-slate-900 bg-white"}`
            : `border-transparent text-slate-500 ${isDarkMode ? "hover:text-slate-400 hover:bg-slate-800/10" : "hover:text-cyan-600 hover:bg-cyan-50"}`
            }`}
        >
          <ListChecks size={14} className={activeConsoleTab === "testcase" ? "text-cyan-400" : ""} /> TEST CASES
        </button>
        <button
          onClick={() => {
            setIsConsoleOpen(true);
            setActiveConsoleTab("result");
          }}
          className={`h-full px-4 text-xs font-mono font-bold tracking-wide flex items-center gap-2 border-b-2 transition-all hover:bg-slate-800/10 cursor-pointer ${activeConsoleTab === "result"
            ? `border-emerald-500 ${isDarkMode ? "text-white bg-slate-800/20" : "text-slate-900 bg-white"}`
            : `border-transparent text-slate-500 ${isDarkMode ? "hover:text-slate-400 hover:bg-slate-800/10" : "hover:text-emerald-600 hover:bg-emerald-50"}`
            }`}
        >
          <Terminal size={14} className={activeConsoleTab === "result" ? "text-emerald-400" : ""} /> OUTPUT LOG
        </button>
      </div>
    </div>
  );

  const consolePanelContent = (
    <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 ${themeStyles.panelBg}`}>
      {renderConsoleContent()}
    </div>
  );

  const leftPanelContent = (
    <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 transition-colors ${themeStyles.panelBg}`}>
      {activeLeftTab === "Description" && (
        <div className="animate-fadeIn pb-10">
          <h1 className={`text-2xl font-black mb-3 tracking-tight font-mono ${themeStyles.textHead}`}>
            {currentQuestion.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${currentQuestion.difficulty === "Hard"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : currentQuestion.difficulty === "Medium"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}
            >
              {currentQuestion.difficulty}
            </span>

            <div className={`h-4 w-[1px] ${isDarkMode ? "bg-slate-800" : "bg-slate-300"}`} />

            <div className={`flex items-center gap-4 text-[10px] font-mono tracking-wider ${themeStyles.textMuted}`}>
              <span className="flex items-center gap-1.5" title="Time Limit">
                <Clock size={12} className={themeStyles.textMuted} /> {currentQuestion.timeLimit || 2}s
              </span>
              <span className="flex items-center gap-1.5" title="Memory Limit">
                <Cpu size={12} className={themeStyles.textMuted} /> {currentQuestion.memoryLimit || 256}MB
              </span>
            </div>

            {currentQuestion.tags?.length > 0 && (
              <>
                <div className={`h-4 w-[1px] ${isDarkMode ? "bg-slate-800" : "bg-slate-300"}`} />
                <div className="flex gap-2">
                  {currentQuestion.tags.map((tag, i) => (
                    <span key={i} className={`text-[10px] cursor-pointer transition-colors ${isDarkMode ? "text-slate-500 hover:text-cyan-400" : "text-slate-400 hover:text-cyan-600"}`}>
                      #{tag.toLowerCase()}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Markdown Content */}
          <div className={`prose prose-sm max-w-none ${isDarkMode ? "prose-invert text-slate-300" : "text-slate-600 prose-headings:text-slate-900 prose-p:text-slate-600 prose-code:text-slate-800"}`}>
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code: createCodeRenderer(isDarkMode),
                pre: ({ children }) => <>{children}</>,
                blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 pl-4 py-1 my-4 italic rounded-r ${isDarkMode ? "border-slate-700 text-slate-400 bg-slate-900/30" : "border-slate-300 text-slate-500 bg-slate-50"}`} {...props} />,
              }}
            >
              {currentQuestion.description}
            </ReactMarkdown>
          </div>

          {/* Examples */}
          {currentQuestion.testCases
            ?.filter((tc) => tc.isPublic)
            .map((example, index) => (
              <div key={index} className={`mt-8 p-4 border relative group transition-colors ${themeStyles.cardBg} ${themeStyles.cardBorder}`}>
                <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl transition-colors ${isDarkMode ? "bg-slate-800 group-hover:bg-cyan-500/50" : "bg-slate-200 group-hover:bg-cyan-500/50"}`} />

                <h3 className={`text-xs font-bold mb-4 font-mono tracking-wider uppercase ${themeStyles.textHead}`}>
                  Example {index + 1}
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Input</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(example.input)}
                        className={`transition-colors hover:scale-110 active:scale-90 cursor-pointer ${isDarkMode ? "text-slate-600 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <div className={`p-3 text-sm font-mono border ${isDarkMode ? "bg-[#201f1f] text-cyan-100 border-slate-800/50" : "bg-white text-cyan-700 border-slate-200"}`}>
                      {example.input}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Expected Output</span>
                    <div className={`p-3 text-sm font-mono border ${isDarkMode ? "bg-[#201f1f] text-emerald-100 border-slate-800/50" : "bg-white text-emerald-700 border-slate-200"}`}>
                      {example.output}
                    </div>
                  </div>

                  {example.explanation && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Explanation</span>
                      <div className={`text-sm leading-relaxed italic border-l-2 pl-3 ${isDarkMode ? "text-slate-400 border-slate-700" : "text-slate-600 border-slate-300"}`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkMath, remarkGfm]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            code: createCodeRenderer(isDarkMode),
                            pre: ({ children }) => <>{children}</>,
                            blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 pl-4 py-1 my-4 italic rounded-r ${isDarkMode ? "border-slate-700 text-slate-400 bg-slate-900/30" : "border-slate-300 text-slate-500 bg-slate-50"}`} {...props} />,
                          }}
                        >
                          {example.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Constraints */}
          {currentQuestion.constraints && currentQuestion.constraints.length > 0 && (
            <div className={`mt-8 p-4 border ${isDarkMode ? "bg-red-900/5 border-red-500/10" : "bg-red-50 border-red-100"}`}>
              <h3 className="text-xs font-bold text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider font-mono">
                <AlertCircle size={14} /> Constraints
              </h3>
              <ul className={`list-disc list-outside pl-5 space-y-2 ${themeStyles.text}`}>
                {currentQuestion.constraints.flatMap(c => c.split('\n')).filter(line => line.trim() !== "").map((c, i) => (
                  <li key={i} className="text-xs pl-1">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code: createCodeRenderer(isDarkMode),
                        pre: ({ children }) => <>{children}</>,
                        p: ({ node, ...props }) => <span {...props} />, // Render paragraphs as spans to avoid block margins inside li
                      }}
                    >
                      {c}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SUBMISSIONS TAB CONTENT */}
      {activeLeftTab === "Submissions" && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold font-mono ${themeStyles.textHead}`}>MISSION HISTORY</h2>
            <button
              onClick={() => fetchSubmissions(true)}
              disabled={loadingSubmissions}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <RefreshCw className={loadingSubmissions ? "animate-spin" : ""} size={14} />
            </button>
          </div>
          {loadingSubmissions ? (
            <div className={`text-center py-10 font-mono text-sm animate-pulse ${themeStyles.textMuted}`}>Loading intel...</div>
          ) : submissions.length === 0 ? (
            <div className={`text-center py-10 border font-mono text-sm ${themeStyles.cardBg} ${themeStyles.border} ${themeStyles.textMuted}`}>
              NO SUBMISSION HISTORY FOUND
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => (
                <div key={sub._id} className={`p-4 border flex justify-between items-center transition-colors group ${themeStyles.cardBg} ${themeStyles.border} ${isDarkMode ? "hover:bg-slate-900" : "hover:bg-slate-100"}`}>
                  <div>
                    <div className={`font-bold font-mono text-sm ${sub.status === "Accepted" ? "text-emerald-500" : "text-red-500"}`}>{sub.status.toUpperCase()}</div>
                    <div className={`text-[10px] font-mono mt-0.5 ${themeStyles.textMuted}`}>{new Date(sub.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <div className="flex items-center justify-between text-[10px]"><span className={`font-mono uppercase ${themeStyles.textMuted}`}>Time:</span><span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${isDarkMode ? "text-slate-300 bg-slate-800/50 border-slate-700" : "text-slate-700 bg-slate-200 border-slate-300"}`}>{sub.timeComplexity || "N/A"}</span></div>
                    <div className="flex items-center justify-between text-[10px]"><span className={`font-mono uppercase ${themeStyles.textMuted}`}>Space:</span><span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${isDarkMode ? "text-slate-300 bg-slate-800/50 border-slate-700" : "text-slate-700 bg-slate-200 border-slate-300"}`}>{sub.spaceComplexity || "N/A"}</span></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setViewingSubmission(sub)} className={`p-2 transition-all border hover:scale-110 active:scale-95 cursor-pointer ${isDarkMode ? "bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 border-slate-700" : "bg-white text-slate-500 hover:text-cyan-600 hover:bg-slate-50 border-slate-200"}`}><Eye size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDITORIAL TAB */}
      {activeLeftTab === "Editorial" && (
        <EditorialSection
          question={currentQuestion}
          updateUser={setUser}
          user={user}
          isDarkMode={isDarkMode}
          isSolved={user?.questionsSolved?.some(
            (qId) => qId === currentQuestion._id || qId === currentQuestion.id
          )}
        />
      )}
    </div>
  );



  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`h-screen w-full flex flex-col font-sans overflow-hidden transition-colors ${themeStyles.bg} ${themeStyles.text}`}>
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}


        <SubmissionModal
          isOpen={!!viewingSubmission}
          onClose={() => setViewingSubmission(null)}
          submission={viewingSubmission}
          theme={editorTheme}
          fontSize={fontSize}
          isDarkMode={isDarkMode}
        />
        <Alert
          isOpen={alertConfig.isOpen}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
          customButtons={alertConfig.customButtons}
        />


        {/* --- NAVBAR --- */}
        <nav className={`h-14 border-b px-4 flex justify-between items-center shrink-0 z-50 relative transition-colors ${isDarkMode ? "bg-[#0e0e0e] border-[rgba(255,255,255,0.10)]" : "bg-white border-slate-200"}`}>
          {/* Left: Back Button & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className={`p-2 transition-all border cursor-pointer ${isDarkMode
                ? "bg-[#201f1f] hover:bg-[#2a2a2a] text-slate-400 hover:text-white border-[rgba(255,255,255,0.10)]"
                : "bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200"
                }`}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-sm truncate max-w-[200px] sm:max-w-md font-mono tracking-wide uppercase ${isDarkMode ? "text-[#e5e2e1]" : "text-slate-800"}`}>
                {currentQuestion.title}
              </span>
              {currentQuestion.difficulty && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest border ${
                  currentQuestion.difficulty === "Easy"
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : currentQuestion.difficulty === "Medium"
                    ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                    : "text-red-400 border-red-500/30 bg-red-500/10"
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Center: Timer (simple, inline) */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-3 py-1.5 border ${isDarkMode ? "bg-[#201f1f] border-[rgba(255,255,255,0.10)]" : "bg-slate-50 border-slate-200"}`}>
            <Clock
              size={14}
              className={isTimerRunning ? "text-orange-400 animate-pulse" : "text-slate-600"}
            />
            <span
              className={`text-sm font-mono font-bold tracking-wider w-12 text-center ${isTimerRunning ? "text-[#ffb690]" : "text-slate-500"}`}
            >
              {formatTime(timeElapsed)}
            </span>
            <div className={`w-px h-4 ${isDarkMode ? "bg-[rgba(255,255,255,0.10)]" : "bg-slate-300"}`} />
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-1 transition-all cursor-pointer ${isTimerRunning ? "text-amber-400 hover:bg-[#2a2a2a]" : "text-emerald-400 hover:bg-[#2a2a2a]"}`}
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimeElapsed(0);
              }}
              className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Right: Run & Submit */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              title="Run Code (Ctrl+Enter)"
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono tracking-widest uppercase transition-all disabled:opacity-50 border cursor-pointer ${isDarkMode
                ? "bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.20)]"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                }`}
            >
              <Play size={14} className={isRunning ? "hidden" : "block"} />
              {isRunning ? "COMPILING..." : "RUN CODE"}
            </button>

            <button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              title="Submit Code (Ctrl+Shift+Enter)"
              className="flex items-center gap-2 px-6 py-2 bg-[#f97316] hover:bg-[#ffb690] text-black font-bold font-mono tracking-widest uppercase transition-all disabled:opacity-50 border-none text-xs cursor-pointer"
            >
              <CloudLightning
                size={14}
                className={isSubmitting ? "hidden" : "block"}
              />
              {isSubmitting ? "JUDGING..." : "SUBMIT"}
            </button>
          </div>
        </nav>

        {/* --- MAIN SPLIT LAYOUT (Using Draggable IDELayout) --- */}
        <div className={`flex-1 overflow-hidden relative ${isDarkMode ? "bg-[#131313]" : "bg-slate-100"}`}>
          <IDELayout
            leftHeader={leftHeader}
            leftPanelContent={leftPanelContent}
            editorHeader={editorHeader}
            editorPanelContent={editorPanelContent}
            consoleHeader={consoleHeader}
            consolePanelContent={consolePanelContent}
            isConsoleOpen={isConsoleOpen}
            setIsConsoleOpen={setIsConsoleOpen}
            isDarkMode={isDarkMode}
            themeStyles={themeStyles}
            slots={slots}
            onSlotsChange={setSlots}
            leftPanelRef={leftPanelRef}
          />
        </div>


      </div>
    </DndProvider>
  );
};

export default IDEPage;
