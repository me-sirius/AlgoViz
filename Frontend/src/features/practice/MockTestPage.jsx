import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Flag,
    Trash2,
    Shield,
    Trophy,
    Target,
    Zap,
    Monitor,
    Eye,
    EyeOff,
    ArrowLeft,
    User,
    RotateCcw,
    Send,
    Maximize,
    AlertOctagon,
} from "lucide-react";
import { useAuth } from "../../core/context/UserContext";

// ============================================================================
// STATIC MOCK QUESTIONS (30 Questions)
// ============================================================================
const MOCK_QUESTIONS = [
    // DSA Questions (10)
    {
        id: 1,
        category: "DSA",
        question: `What is the **time complexity** of the following function?\n\n\`\`\`cpp\nint mystery(int n) {\n    if (n <= 1) return 1;\n    return mystery(n-1) + mystery(n-1);\n}\n\`\`\``,
        options: ["O(n)", "O(n²)", "O(2ⁿ)", "O(log n)"],
        correctOption: 2,
        explanation: "Each call makes 2 recursive calls, creating a binary tree of depth n. Total calls = 2ⁿ.",
        difficulty: "Hard"
    },
    {
        id: 2,
        category: "DSA",
        question: `What will be the output?\n\n\`\`\`python\ndef func(lst):\n    return lst.append(4)\n\narr = [1, 2, 3]\nprint(func(arr), arr)\n\`\`\``,
        options: ["[1,2,3,4] [1,2,3,4]", "None [1,2,3,4]", "[1,2,3,4] [1,2,3]", "Error"],
        correctOption: 1,
        explanation: "list.append() modifies in-place and returns None. The original list is modified.",
        difficulty: "Medium"
    },
    {
        id: 3,
        category: "DSA",
        question: "Which data structure is most efficient for implementing **LRU Cache**?",
        options: ["Array + Binary Search", "HashMap + Doubly Linked List", "Binary Search Tree", "Stack + Queue"],
        correctOption: 1,
        explanation: "HashMap provides O(1) lookup, Doubly Linked List provides O(1) insertion/deletion for maintaining access order.",
        difficulty: "Medium"
    },
    {
        id: 4,
        category: "DSA",
        question: `What is the space complexity of this recursive Fibonacci?\n\n\`\`\`javascript\nfunction fib(n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}\n\`\`\``,
        options: ["O(1)", "O(n)", "O(2ⁿ)", "O(n²)"],
        correctOption: 1,
        explanation: "Space complexity is O(n) due to the maximum depth of the call stack, not the number of calls.",
        difficulty: "Medium"
    },
    {
        id: 5,
        category: "DSA",
        question: "In a **min-heap** with n elements, what is the time to find the **maximum** element?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctOption: 2,
        explanation: "Maximum element must be among the leaves (n/2 elements), requiring O(n) scan.",
        difficulty: "Hard"
    },
    {
        id: 6,
        category: "DSA",
        question: `What does this code print?\n\n\`\`\`java\nint[] arr = {1, 2, 3, 4, 5};\nint sum = 0;\nfor (int i = 0; i < arr.length; i += 2) {\n    sum += arr[i];\n}\nSystem.out.println(sum);\n\`\`\``,
        options: ["6", "9", "15", "10"],
        correctOption: 1,
        explanation: "Loop visits indices 0, 2, 4 → values 1, 3, 5 → sum = 9.",
        difficulty: "Easy"
    },
    {
        id: 7,
        category: "DSA",
        question: "Which sorting algorithm has the **best worst-case** time complexity?",
        options: ["QuickSort", "MergeSort", "BubbleSort", "InsertionSort"],
        correctOption: 1,
        explanation: "MergeSort guarantees O(n log n) in all cases. QuickSort is O(n²) worst case.",
        difficulty: "Easy"
    },
    {
        id: 8,
        category: "DSA",
        question: "What is the **amortized** time complexity of inserting n elements into a dynamic array?",
        options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
        correctOption: 2,
        explanation: "Despite occasional O(n) resizing, amortized cost per insertion is O(1), total O(n).",
        difficulty: "Medium"
    },
    {
        id: 9,
        category: "DSA",
        question: `What is the output?\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    int x = 5;\n    cout << x++ << ++x;\n    return 0;\n}\n\`\`\``,
        options: ["56", "57", "67", "Undefined behavior"],
        correctOption: 3,
        explanation: "Modifying a variable multiple times between sequence points is undefined behavior in C++.",
        difficulty: "Hard"
    },
    {
        id: 10,
        category: "DSA",
        question: "Which algorithm finds the **shortest path** in an unweighted graph?",
        options: ["DFS", "BFS", "Dijkstra's Algorithm", "Bellman-Ford"],
        correctOption: 1,
        explanation: "BFS explores level by level, guaranteeing shortest path in unweighted graphs.",
        difficulty: "Easy"
    },

    // SQL Questions (5)
    {
        id: 11,
        category: "SQL",
        question: `What does this query return?\n\n\`\`\`sql\nSELECT COUNT(*) FROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);\n\`\`\``,
        options: ["Number of employees with above-average salary", "Average salary", "Maximum salary", "Syntax error"],
        correctOption: 0,
        explanation: "Subquery calculates average, outer query counts employees earning more than that.",
        difficulty: "Medium"
    },
    {
        id: 12,
        category: "SQL",
        question: "What is the difference between **HAVING** and **WHERE** clauses?",
        options: [
            "HAVING filters before GROUP BY, WHERE after",
            "WHERE filters before GROUP BY, HAVING after",
            "They are interchangeable",
            "HAVING is used for JOINs only"
        ],
        correctOption: 1,
        explanation: "WHERE filters rows before grouping, HAVING filters groups after aggregation.",
        difficulty: "Easy"
    },
    {
        id: 13,
        category: "SQL",
        question: `Given:\n\`\`\`sql\nTable A: (1, 2, 3)\nTable B: (2, 3, 4)\n\`\`\`\nWhat does **A LEFT JOIN B** return (count)?`,
        options: ["2 rows", "3 rows", "4 rows", "6 rows"],
        correctOption: 1,
        explanation: "LEFT JOIN keeps all rows from A (3 rows), matching with B where possible.",
        difficulty: "Medium"
    },
    {
        id: 14,
        category: "SQL",
        question: "Which SQL statement is used to prevent **duplicate** rows in result?",
        options: ["UNIQUE", "DISTINCT", "DIFFERENT", "NO DUPLICATE"],
        correctOption: 1,
        explanation: "SELECT DISTINCT removes duplicate rows from the result set.",
        difficulty: "Easy"
    },
    {
        id: 15,
        category: "SQL",
        question: `What is the result?\n\n\`\`\`sql\nSELECT COALESCE(NULL, NULL, 'Hello', NULL, 'World');\n\`\`\``,
        options: ["NULL", "Hello", "World", "Error"],
        correctOption: 1,
        explanation: "COALESCE returns the first non-NULL value in the list.",
        difficulty: "Medium"
    },

    // Operating Systems (5)
    {
        id: 16,
        category: "Operating Systems",
        question: "Which scheduling algorithm can cause **starvation**?",
        options: ["Round Robin", "FCFS", "Shortest Job First", "None of these"],
        correctOption: 2,
        explanation: "SJF can starve long processes if short ones keep arriving.",
        difficulty: "Easy"
    },
    {
        id: 17,
        category: "Operating Systems",
        question: "What is a **race condition**?",
        options: [
            "When CPU runs too fast",
            "When two processes compete for the same resource with unpredictable outcome",
            "When memory overflows",
            "A type of scheduling algorithm"
        ],
        correctOption: 1,
        explanation: "Race conditions occur when multiple processes access shared data concurrently without proper synchronization.",
        difficulty: "Medium"
    },
    {
        id: 18,
        category: "Operating Systems",
        question: "In the context of deadlocks, what does **circular wait** mean?",
        options: [
            "Processes waiting in a round-robin fashion",
            "A cycle in the resource allocation graph",
            "CPU scheduling in circles",
            "Memory fragmentation"
        ],
        correctOption: 1,
        explanation: "Circular wait: P1 waits for P2, P2 waits for P3, ..., Pn waits for P1.",
        difficulty: "Medium"
    },
    {
        id: 19,
        category: "Operating Systems",
        question: "What is **thrashing** in virtual memory?",
        options: [
            "Fast context switching",
            "Excessive paging causing performance degradation",
            "Memory leak",
            "Disk fragmentation"
        ],
        correctOption: 1,
        explanation: "Thrashing occurs when a process spends more time swapping pages than executing.",
        difficulty: "Easy"
    },
    {
        id: 20,
        category: "Operating Systems",
        question: "Which memory allocation strategy is **fastest** but can lead to external fragmentation?",
        options: ["First Fit", "Best Fit", "Worst Fit", "Next Fit"],
        correctOption: 0,
        explanation: "First Fit is fastest (stops at first suitable block) but causes external fragmentation.",
        difficulty: "Medium"
    },

    // Computer Networks (5)
    {
        id: 21,
        category: "Computer Networks",
        question: "At which OSI layer does a **router** operate?",
        options: ["Layer 1 - Physical", "Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport"],
        correctOption: 2,
        explanation: "Routers work at the Network layer, making forwarding decisions based on IP addresses.",
        difficulty: "Easy"
    },
    {
        id: 22,
        category: "Computer Networks",
        question: "What is the main purpose of **ARP**?",
        options: [
            "Encrypt network traffic",
            "Map IP addresses to MAC addresses",
            "Route packets between networks",
            "Manage DNS queries"
        ],
        correctOption: 1,
        explanation: "ARP (Address Resolution Protocol) resolves IP addresses to physical MAC addresses.",
        difficulty: "Easy"
    },
    {
        id: 23,
        category: "Computer Networks",
        question: "In TCP, what is the **3-way handshake** sequence?",
        options: [
            "ACK → SYN → FIN",
            "SYN → SYN-ACK → ACK",
            "FIN → ACK → RST",
            "GET → POST → PUT"
        ],
        correctOption: 1,
        explanation: "TCP connection: Client sends SYN, Server replies SYN-ACK, Client sends ACK.",
        difficulty: "Medium"
    },
    {
        id: 24,
        category: "Computer Networks",
        question: "What is the **maximum** payload size (MTU) for standard Ethernet?",
        options: ["64 bytes", "576 bytes", "1500 bytes", "65535 bytes"],
        correctOption: 2,
        explanation: "Standard Ethernet MTU is 1500 bytes (excluding headers).",
        difficulty: "Medium"
    },
    {
        id: 25,
        category: "Computer Networks",
        question: "Which protocol provides **reliable** data delivery at the transport layer?",
        options: ["UDP", "TCP", "IP", "ICMP"],
        correctOption: 1,
        explanation: "TCP provides reliable, ordered, error-checked delivery. UDP is unreliable.",
        difficulty: "Easy"
    },

    // Aptitude (5)
    {
        id: 26,
        category: "Aptitude",
        question: "If a train travels 360 km in 4 hours, what is its speed in m/s?",
        options: ["25 m/s", "90 m/s", "100 m/s", "36 m/s"],
        correctOption: 0,
        explanation: "Speed = 360/4 = 90 km/h = 90 × (5/18) = 25 m/s",
        difficulty: "Easy"
    },
    {
        id: 27,
        category: "Aptitude",
        question: "A is twice as good a workman as B. Together they finish a work in 12 days. In how many days can A alone finish?",
        options: ["18 days", "24 days", "36 days", "8 days"],
        correctOption: 0,
        explanation: "If A's rate is 2x and B's is x, together 3x finishes in 12 days. A alone (2x) takes 18 days.",
        difficulty: "Medium"
    },
    {
        id: 28,
        category: "Aptitude",
        question: "What comes next: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "48"],
        correctOption: 1,
        explanation: "Pattern: n(n+1) → 1×2, 2×3, 3×4, 4×5, 5×6, 6×7 = 42",
        difficulty: "Medium"
    },
    {
        id: 29,
        category: "Aptitude",
        question: "If 20% of a number is 80, what is 40% of that number?",
        options: ["160", "200", "120", "80"],
        correctOption: 0,
        explanation: "20% = 80 → Number = 400. 40% of 400 = 160.",
        difficulty: "Easy"
    },
    {
        id: 30,
        category: "Aptitude",
        question: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'PRINTER' written?",
        options: ["QSHOUFS", "SFUOJSQ", "QSJOFSF", "SFUOQSJ"],
        correctOption: 0,
        explanation: "Each letter shifted: +1, -1, +1, -1... P→Q, R→S, I→H, N→O, T→U, E→F, R→S",
        difficulty: "Hard"
    }
];

// ============================================================================
// CONSTANTS
// ============================================================================
const TEST_DURATION = 30 * 60; // 30 minutes in seconds
const MAX_WARNINGS = 3;
const POINTS_CORRECT = 4;
const POINTS_WRONG = -1;

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// Markdown Renderer with Code Highlighting and LaTeX
const MarkdownRenderer = ({ content, className = "" }) => (
    <div className={`prose prose-invert max-w-none ${className}`}>
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline && match) {
                        return (
                            <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg !bg-black/40 !my-4"
                                {...props}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        );
                    }
                    return <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-amber-300" {...props}>{children}</code>;
                },
                p: ({ children }) => <p className="text-gray-200 leading-relaxed mb-4 text-lg">{children}</p>,
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
            }}
        >
            {content}
        </ReactMarkdown>
    </div>
);

// Warning Toast
const WarningToast = ({ warnings, maxWarnings, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500/20 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 max-w-md shadow-2xl shadow-red-500/20"
    >
        <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/20">
                <AlertOctagon size={28} className="text-red-500" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-red-400 mb-1">Warning {warnings}/{maxWarnings}</h3>
                <p className="text-gray-300 text-sm mb-3">
                    Tab switching detected! Return to the test immediately.
                </p>
                <p className="text-red-400 text-xs font-medium">
                    {maxWarnings - warnings} warning(s) remaining before auto-submission.
                </p>
            </div>
        </div>
        <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-white"
        >
            <XCircle size={20} />
        </button>
    </motion.div>
);

// Question Palette
const QuestionPalette = ({ questions, currentIndex, answers, reviewSet, onNavigate }) => {
    const getStatus = (idx) => {
        if (reviewSet.has(idx)) return "marked";
        if (answers[idx] !== undefined) return "answered";
        return "notVisited";
    };

    const statusStyles = {
        notVisited: "bg-white/5 border-white/10 text-gray-500",
        answered: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
        marked: "bg-purple-500/20 border-purple-500/40 text-purple-400",
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Target size={14} /> Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-1.5">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => onNavigate(idx)}
                        className={`w-9 h-9 rounded-lg border font-bold text-xs transition-all cursor-pointer ${statusStyles[getStatus(idx)]} ${currentIndex === idx ? "ring-2 ring-white ring-offset-1 ring-offset-[#0b0b0d]" : ""
                            }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                    <span className="text-gray-400">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/40" />
                    <span className="text-gray-400">Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                    <span className="text-gray-400">Not Visited</span>
                </div>
            </div>
        </div>
    );
};

// Timer Component
const Timer = ({ timeLeft, isUrgent }) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-2xl font-bold ${isUrgent ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-white/5 text-white"
            }`}>
            <Clock size={20} className={isUrgent ? "text-red-500" : "text-gray-400"} />
            {formatTime(timeLeft)}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

const MockTestPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useAuth();

    // PHASE 1: Add a "Coming Soon" Overlay
    // This will overlay ONLY the content, but keep logic for "background viewing" if needed later.
    // For now we wrap the whole return output.

    // Check premium status from user context (works for direct URL access)
    // Navigation state is optional override for testing purposes
    const isPremium = location.state?.isPremium !== undefined
        ? location.state.isPremium
        : (user?.isPremium || false);

    // Phase: 'lobby' | 'active' | 'result'
    const [phase, setPhase] = useState("lobby");

    // Test State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [reviewSet, setReviewSet] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
    const [startTime, setStartTime] = useState(null);

    // Proctoring
    const [warnings, setWarnings] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [submitReason, setSubmitReason] = useState(null); // 'completed' | 'timeout' | 'disqualified'

    // Checkbox
    const [agreed, setAgreed] = useState(false);

    // Current Question
    const currentQ = MOCK_QUESTIONS[currentIndex];
    const isUrgent = timeLeft < 300; // < 5 minutes

    // Stats
    const answeredCount = Object.keys(answers).length;
    const markedCount = reviewSet.size;

    // ============================================================================
    // AUTH & PREMIUM CHECK
    // ============================================================================
    useEffect(() => {
        // Wait for auth to finish loading
        if (isLoading) return;

        // If not authenticated, redirect to sign in
        if (!isAuthenticated) {
            navigate("/signin", { replace: true });
            return;
        }
        // If not premium (check user context), redirect to premium page
        const userIsPremium = location.state?.isPremium !== undefined
            ? location.state.isPremium
            : (user?.isPremium || false);
        if (!userIsPremium) {
            navigate("/premium", { replace: true });
        }
    }, [isLoading, isAuthenticated, user, location.state, navigate]);

    // ============================================================================
    // PROCTORING: Tab Switch Detection
    // ============================================================================
    useEffect(() => {
        if (phase !== "active") return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarnings(prev => {
                    const newCount = prev + 1;
                    setShowWarning(true);
                    return newCount;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [phase]);

    // Auto-submit on 3 warnings
    useEffect(() => {
        if (warnings >= MAX_WARNINGS && phase === "active") {
            handleSubmit("disqualified");
        }
    }, [warnings, phase]);

    // ============================================================================
    // TIMER
    // ============================================================================
    useEffect(() => {
        if (phase !== "active") return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit("timeout");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase]);

    // ============================================================================
    // HANDLERS (defined before early returns but after hooks)
    // ============================================================================
    const enterFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
        } catch (err) {
            console.log("Fullscreen not supported or denied");
        }
    };

    const handleStart = () => {
        enterFullscreen();
        setPhase("active");
        setStartTime(Date.now());
    };

    const handleSelectAnswer = (optionIndex) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    };

    const handleClearResponse = () => {
        setAnswers(prev => {
            const updated = { ...prev };
            delete updated[currentIndex];
            return updated;
        });
    };

    const handleMarkForReview = () => {
        setReviewSet(prev => {
            const updated = new Set(prev);
            if (updated.has(currentIndex)) {
                updated.delete(currentIndex);
            } else {
                updated.add(currentIndex);
            }
            return updated;
        });
    };

    const handleNavigate = (idx) => {
        if (idx >= 0 && idx < MOCK_QUESTIONS.length) {
            setCurrentIndex(idx);
        }
    };

    const handleSubmit = useCallback(async (reason = "completed") => {
        // Calculate results for saving
        let correct = 0;
        let wrong = 0;
        const answersArray = MOCK_QUESTIONS.map((q, idx) => {
            const userSelected = answers[idx] ?? -1;
            const isCorrect = userSelected === q.correctOption;
            if (userSelected === -1 || userSelected === undefined) {
                // skipped
            } else if (isCorrect) {
                correct++;
            } else {
                wrong++;
            }
            return {
                questionId: q.id,
                questionText: q.question,
                options: q.options,
                userSelected: userSelected,
                correctOption: q.correctOption,
                explanation: q.explanation,
                isCorrect: isCorrect && userSelected !== -1,
            };
        });

        const score = (correct * POINTS_CORRECT) + (wrong * POINTS_WRONG);

        // Save to backend
        console.log("Attempting to save test result...", { score, totalQuestions: MOCK_QUESTIONS.length, answersCount: answersArray.length });
        try {
            const response = await axios.post(`${API_URL}/mcq/result`, {
                category: "Mock Test",
                score,
                totalQuestions: MOCK_QUESTIONS.length,
                answers: answersArray,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            console.log("Test result saved successfully:", response.data);
        } catch (error) {
            console.error("Failed to save test result:", error.response?.data || error.message);
        }

        setSubmitReason(reason);
        setPhase("result");

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
    }, [answers]);

    // ============================================================================
    // CALCULATE RESULTS
    // ============================================================================
    const calculateResults = () => {
        let correct = 0;
        let wrong = 0;
        let unattempted = 0;

        MOCK_QUESTIONS.forEach((q, idx) => {
            if (answers[idx] === undefined) {
                unattempted++;
            } else if (answers[idx] === q.correctOption) {
                correct++;
            } else {
                wrong++;
            }
        });

        const score = (correct * POINTS_CORRECT) + (wrong * POINTS_WRONG);
        const maxScore = MOCK_QUESTIONS.length * POINTS_CORRECT;
        const accuracy = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0;
        const timeTaken = TEST_DURATION - timeLeft;
        const avgTimePerQ = answeredCount > 0 ? Math.round(timeTaken / answeredCount) : 0;

        return { correct, wrong, unattempted, score, maxScore, accuracy, timeTaken, avgTimePerQ };
    };

    // ============================================================================
    // EARLY RETURNS (after all hooks)
    // ============================================================================

    // Show loading while auth is initializing
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authorized (redirect happens via useEffect)
    if (!isAuthenticated || !isPremium) {
        return (
            <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Redirecting...</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER: INSTRUCTION LOBBY
    // ============================================================================
    if (phase === "lobby") {
        return (
            <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-[#0b0b0d] border border-white/10 p-8 rounded-2xl max-w-md text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                                <Zap size={32} className="text-purple-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3">Coming Soon</h2>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                We're upgrading this to a <span className="text-purple-400 font-semibold">full-fledged Mock Test</span> experience, including DSA problems & real-time analytics!
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full"
                >
                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/mcq")}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back to MCQ Practice</span>
                    </button>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 mb-4">
                                <Shield size={40} className="text-purple-400" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2">Full Stack Assessment</h1>
                            <p className="text-gray-400">Mock Test #1</p>
                        </div>

                        {/* Test Parameters */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-2xl font-black text-white">30</div>
                                <div className="text-xs text-gray-500 uppercase">Questions</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-2xl font-black text-white">30</div>
                                <div className="text-xs text-gray-500 uppercase">Minutes</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-2xl font-black text-emerald-400">+4/-1</div>
                                <div className="text-xs text-gray-500 uppercase">Marking</div>
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} /> Strict Rules
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    { icon: Maximize, text: "The test will run in Fullscreen mode." },
                                    { icon: EyeOff, text: "Switching tabs or minimizing will trigger a warning." },
                                    { icon: AlertOctagon, text: "3 Warnings = Immediate Disqualification & Auto-Submit." },
                                    { icon: RotateCcw, text: "Do not reload or close the page during the test." },
                                ].map((rule, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-gray-300">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 shrink-0">
                                            <rule.icon size={16} className="text-red-400" />
                                        </div>
                                        <span className="text-sm">{rule.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Agreement */}
                        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-2 border-white/20 bg-transparent checked:bg-purple-500 checked:border-purple-500 cursor-pointer"
                            />
                            <span className="text-sm text-gray-400 group-hover:text-gray-300">
                                I understand and agree to the test rules. I will not switch tabs or attempt any unfair means.
                            </span>
                        </label>

                        {/* Start Button */}
                        <button
                            onClick={handleStart}
                            disabled={!agreed}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${agreed
                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25 cursor-pointer hover:shadow-xl"
                                : "bg-white/5 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <Zap size={20} />
                            Start Test
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ============================================================================
    // RENDER: ACTIVE TEST
    // ============================================================================
    if (phase === "active") {
        return (
            <div className="min-h-screen bg-[#0b0b0d] flex flex-col">
                {/* Warning Toast */}
                <AnimatePresence>
                    {showWarning && (
                        <WarningToast
                            warnings={warnings}
                            maxWarnings={MAX_WARNINGS}
                            onClose={() => setShowWarning(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="sticky top-0 z-40 bg-[#0b0b0d]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Target size={18} className="text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-300">Section 1: CS Fundamentals</span>
                        </div>

                        <Timer timeLeft={timeLeft} isUrgent={isUrgent} />

                        <button
                            onClick={() => handleSubmit("completed")}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 cursor-pointer flex items-center gap-2"
                        >
                            <Send size={16} />
                            Finish Test
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Question Area - 70% */}
                        <div className="flex-1 lg:w-[70%]">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
                                {/* Question Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-bold">
                                            Question {currentIndex + 1} / {MOCK_QUESTIONS.length}
                                        </span>
                                        <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400">
                                            {currentQ.category}
                                        </span>
                                        <span className={`px-2 py-1 rounded-lg text-xs ${currentQ.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400" :
                                            currentQ.difficulty === "Hard" ? "bg-red-500/20 text-red-400" :
                                                "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {currentQ.difficulty}
                                        </span>
                                    </div>
                                    {reviewSet.has(currentIndex) && (
                                        <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center gap-1">
                                            <Flag size={12} /> Marked
                                        </span>
                                    )}
                                </div>

                                {/* Question */}
                                <div className="mb-8">
                                    <MarkdownRenderer content={currentQ.question} />
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    {currentQ.options.map((opt, idx) => {
                                        const isSelected = answers[currentIndex] === idx;
                                        const letters = ["A", "B", "C", "D"];

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectAnswer(idx)}
                                                className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                                                    ? "border-purple-500 bg-purple-500/10"
                                                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${isSelected ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"
                                                    }`}>
                                                    {letters[idx]}
                                                </div>
                                                <span className={`flex-1 text-left font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                                                    {opt}
                                                </span>
                                                {isSelected && <CheckCircle size={20} className="text-purple-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-white/10">
                                    <button
                                        onClick={() => handleNavigate(currentIndex - 1)}
                                        disabled={currentIndex === 0}
                                        className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 ${currentIndex === 0
                                            ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                            : "bg-white/5 text-white hover:bg-white/10 cursor-pointer"
                                            }`}
                                    >
                                        <ChevronLeft size={18} /> Previous
                                    </button>

                                    <button
                                        onClick={handleMarkForReview}
                                        className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer ${reviewSet.has(currentIndex)
                                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                            : "bg-white/5 text-white hover:bg-white/10"
                                            }`}
                                    >
                                        <Flag size={16} /> {reviewSet.has(currentIndex) ? "Unmark" : "Mark for Review"}
                                    </button>

                                    <button
                                        onClick={handleClearResponse}
                                        disabled={answers[currentIndex] === undefined}
                                        className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 ${answers[currentIndex] === undefined
                                            ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                            : "bg-white/5 text-white hover:bg-white/10 cursor-pointer"
                                            }`}
                                    >
                                        <Trash2 size={16} /> Clear
                                    </button>

                                    <button
                                        onClick={() => handleNavigate(currentIndex + 1)}
                                        disabled={currentIndex === MOCK_QUESTIONS.length - 1}
                                        className={`ml-auto px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 ${currentIndex === MOCK_QUESTIONS.length - 1
                                            ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-purple-500 to-violet-600 text-white cursor-pointer"
                                            }`}
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - 30% */}
                        <div className="lg:w-[30%] space-y-4">
                            {/* User Info */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{user?.name || "Candidate"}</div>
                                        <div className="text-xs text-gray-500">{user?.email || "candidate@test.com"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="text-lg font-bold text-emerald-400">{answeredCount}</div>
                                        <div className="text-xs text-gray-500">Answered</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <div className="text-lg font-bold text-purple-400">{markedCount}</div>
                                        <div className="text-xs text-gray-500">Marked</div>
                                    </div>
                                </div>
                                {warnings > 0 && (
                                    <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                                        <div className="text-sm font-bold text-red-400">⚠️ Warnings: {warnings}/{MAX_WARNINGS}</div>
                                    </div>
                                )}
                            </div>

                            {/* Question Palette */}
                            <QuestionPalette
                                questions={MOCK_QUESTIONS}
                                currentIndex={currentIndex}
                                answers={answers}
                                reviewSet={reviewSet}
                                onNavigate={handleNavigate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER: RESULT ANALYSIS
    // ============================================================================
    if (phase === "result") {
        const results = calculateResults();
        const scorePercentage = Math.max(0, Math.round((results.score / results.maxScore) * 100));

        return (
            <div className="min-h-screen bg-[#0b0b0d] p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className={`inline-flex p-4 rounded-2xl mb-4 ${submitReason === "disqualified"
                            ? "bg-red-500/20 border border-red-500/30"
                            : "bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30"
                            }`}>
                            {submitReason === "disqualified" ? (
                                <AlertOctagon size={40} className="text-red-500" />
                            ) : (
                                <Trophy size={40} className="text-yellow-400" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">
                            {submitReason === "disqualified" ? "Test Terminated" : "Test Complete!"}
                        </h1>
                        <p className={`text-lg ${submitReason === "disqualified" ? "text-red-400" : "text-gray-400"}`}>
                            {submitReason === "disqualified" && "Disqualified: Multiple tab switches detected."}
                            {submitReason === "timeout" && "Time's up! Your answers have been submitted."}
                            {submitReason === "completed" && "Great job completing the test!"}
                        </p>
                    </div>

                    {/* Score Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                        {/* Main Score */}
                        <div className="text-center mb-8">
                            <div className="relative inline-flex">
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke={scorePercentage >= 60 ? "#10b981" : scorePercentage >= 40 ? "#f59e0b" : "#ef4444"}
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * scorePercentage) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white">{results.score}</span>
                                    <span className="text-sm text-gray-400">/ {results.maxScore}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="text-2xl font-bold text-emerald-400">{results.correct}</div>
                                <div className="text-xs text-gray-500">Correct</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <div className="text-2xl font-bold text-red-400">{results.wrong}</div>
                                <div className="text-xs text-gray-500">Wrong</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gray-500/10 border border-gray-500/20">
                                <div className="text-2xl font-bold text-gray-400">{results.unattempted}</div>
                                <div className="text-xs text-gray-500">Skipped</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <div className="text-2xl font-bold text-purple-400">{results.accuracy}%</div>
                                <div className="text-xs text-gray-500">Accuracy</div>
                            </div>
                        </div>
                    </div>

                    {/* Question Review */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 mb-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Eye size={20} /> Question Review
                        </h2>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {MOCK_QUESTIONS.map((q, idx) => {
                                const userAnswer = answers[idx];
                                const isCorrect = userAnswer === q.correctOption;
                                const isAttempted = userAnswer !== undefined;

                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border ${!isAttempted
                                            ? "bg-gray-500/5 border-gray-500/20"
                                            : isCorrect
                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                : "bg-red-500/5 border-red-500/20"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-gray-400">Q{idx + 1}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-500">{q.category}</span>
                                                    {isAttempted ? (
                                                        isCorrect ? (
                                                            <CheckCircle size={16} className="text-emerald-500" />
                                                        ) : (
                                                            <XCircle size={16} className="text-red-500" />
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-gray-500">Skipped</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-300 line-clamp-2">{q.question.split('\n')[0]}</p>
                                                {isAttempted && !isCorrect && (
                                                    <div className="mt-2 text-xs">
                                                        <span className="text-red-400">Your answer: {q.options[userAnswer]}</span>
                                                        <span className="text-gray-500 mx-2">|</span>
                                                        <span className="text-emerald-400">Correct: {q.options[q.correctOption]}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-lg font-bold ${!isAttempted ? "text-gray-500" : isCorrect ? "text-emerald-400" : "text-red-400"
                                                }`}>
                                                {!isAttempted ? "0" : isCorrect ? `+${POINTS_CORRECT}` : POINTS_WRONG}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Exit Button */}
                    <div className="text-center">
                        <button
                            onClick={() => navigate("/mcq")}
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl font-bold text-white cursor-pointer hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                        >
                            Back to Practice
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default MockTestPage;
