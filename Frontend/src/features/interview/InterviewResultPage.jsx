import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Code,
  MessageSquare,
  BarChart2,
  Share2,
  Download,
  Layers,
  Clock,
  User,
  Bot,
  Award,
  Zap,
  Check,
} from "lucide-react";

// ============ ANIMATED RADIAL PROGRESS COMPONENT ============
const ScoreRing = ({ score, size = 200, strokeWidth = 12 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Muted gradient colors based on score
  const getGradientId = () => {
    if (score >= 80) return "greenGradient";
    if (score >= 60) return "amberGradient";
    return "coralGradient";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          {/* Muted, softer gradients */}
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="coralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${getGradientId()})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
      </svg>

      {/* Center Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-6xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-1">
          Overall Score
        </span>
      </div>
    </div>
  );
};

// ============ CAPSULE PROGRESS BAR COMPONENT ============
const CapsuleProgress = ({ label, score, maxScore = 10, delay = 0 }) => {
  const percentage = (score / maxScore) * 100;

  // Muted color based on score
  const getColor = () => {
    if (score >= 9) return "#059669"; // emerald-600
    if (score >= 7) return "#0891b2"; // cyan-600
    if (score >= 5) return "#d97706"; // amber-600
    return "#dc2626"; // red-600
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400 capitalize">
          {label.replace(/([A-Z])/g, " $1").trim()}
        </span>
        <span className="text-gray-200 font-semibold">{score}/{maxScore}</span>
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

// ============ FLOATING TAB COMPONENT ============
const FloatingTabs = ({ tabs, activeTab, setActiveTab }) => {
  const [tabDimensions, setTabDimensions] = useState({});
  const tabRefs = useRef({});

  useEffect(() => {
    const dims = {};
    Object.keys(tabRefs.current).forEach((key) => {
      if (tabRefs.current[key]) {
        dims[key] = {
          width: tabRefs.current[key].offsetWidth,
          left: tabRefs.current[key].offsetLeft,
        };
      }
    });
    setTabDimensions(dims);
  }, [tabs]);

  return (
    <div className="relative inline-flex bg-white/5 rounded-full p-1.5 border border-white/10">
      {/* Sliding Background Pill */}
      <motion.div
        className="absolute top-1.5 bottom-1.5 bg-white/10 rounded-full"
        initial={false}
        animate={{
          width: tabDimensions[activeTab]?.width || 0,
          left: (tabDimensions[activeTab]?.left || 0) + 6,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[tab.id] = el)}
          onClick={() => setActiveTab(tab.id)}
          className={`relative z-10 px-5 py-2.5 flex items-center gap-2 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer hover:bg-white/5 ${activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ============ PHASE TIMELINE COMPONENT ============
const PhaseTimeline = ({ phases }) => {
  const phaseEntries = Object.entries(phases);

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700" />

      <div className="space-y-6">
        {phaseEntries.map(([phase, feedback], idx) => (
          <motion.div
            key={idx}
            className="relative flex gap-5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.4 }}
          >
            {/* Numbered Node */}
            <div className="relative z-10 w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-semibold text-lg shrink-0 border border-gray-600">
              {idx + 1}
            </div>

            {/* Card */}
            <div className="flex-1 p-5 rounded-2xl bg-[#0f1419] border border-gray-800 hover:border-gray-700 transition-colors">
              <h4 className="text-lg font-semibold text-white capitalize mb-2">
                {phase.replace(/([A-Z])/g, " $1").trim()}
              </h4>
              <p className="text-gray-400 leading-relaxed">{feedback}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
const InterviewResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [shareTooltip, setShareTooltip] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // --- MOCK DATA (Matches your new 'Interview' Schema) ---
  const data = {
    _id: "65a123...",
    title: "System Design: URL Shortener",
    date: "Dec 18, 2025",
    duration: "45 mins",
    status: "Completed",

    codeSnapshot: {
      language: "javascript",
      code: `function shortenURL(originalUrl) {\n  const id = generateUniqueId();\n  database.save(id, originalUrl);\n  return "https://short.ly/" + id;\n}`,
    },

    transcript: [
      {
        role: "interviewer",
        content: "Hello! Let's design a URL shortener like Bit.ly.",
        timestamp: "10:00 AM",
      },
      {
        role: "candidate",
        content: "Sure. I'll start by clarifying the requirements.",
        timestamp: "10:01 AM",
      },
      {
        role: "interviewer",
        content: "Good start. What are the read/write ratios?",
        timestamp: "10:02 AM",
      },
    ],

    feedback: {
      overallScore: 85,
      summary:
        "Excellent approach to the system design. You handled the database schema well but missed caching strategies initially.",

      metrics: {
        communication: 9,
        problemSolving: 8,
        codeQuality: 7,
        technicalKnowledge: 9,
        systemDesign: 8,
        culturalFit: 9,
        optimization: 6,
        timeManagement: 8,
        requirementGathering: 10,
        debugging: 7,
      },

      strengths: [
        "Asked excellent clarifying questions (Read/Write ratio)",
        "Chose the correct Database (NoSQL) for the use case",
        "Clear communication throughout the session",
      ],
      improvements: [
        "Forgot to mention Redis/Caching layer initially",
        "Estimations for storage were slightly off",
      ],

      phaseBreakdown: {
        introduction:
          "Strong start. You introduced yourself confidently and set a professional tone.",
        problemAnalysis:
          "You effectively gathered requirements but spent a bit too long on non-functional requirements.",
        codingPhase:
          "Your pseudo-code was clean, but you hesitated when choosing the hashing algorithm.",
        testingPhase:
          "You missed testing for hash collisions, which is a critical edge case.",
        conclusion:
          "Great wrap-up. You summarized your design trade-offs effectively.",
      },
    },
  };

  // Get grade based on score
  const getGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  // ============ SHARE FUNCTIONALITY ============
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `Interview Result: ${data.title}`,
      text: `Check out my interview performance! Score: ${data.feedback.overallScore}/100`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // ============ PDF GENERATION ============
  const generatePDF = () => {
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      const addWrappedText = (text, x, y, maxWidth, lineHeight = 6) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * lineHeight;
      };

      // ===== HEADER =====
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Interview Performance Report", margin, 25);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })}`, margin, 38);

      yPos = 60;

      // ===== INTERVIEW DETAILS =====
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(data.title, margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Duration: ${data.duration}  •  Date: ${data.date}  •  Status: ${data.status}`, margin, yPos);
      yPos += 15;

      // ===== SCORE SECTION =====
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, "F");

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.feedback.overallScore}`, margin + 15, yPos + 23);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Overall Score", margin + 15, yPos + 30);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(getGrade(data.feedback.overallScore), margin + 70, yPos + 23);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Grade", margin + 70, yPos + 30);

      yPos += 50;

      // ===== EXECUTIVE SUMMARY =====
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      yPos = addWrappedText(data.feedback.summary, margin, yPos, pageWidth - 2 * margin);
      yPos += 10;

      // ===== SKILL BREAKDOWN =====
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Skill Breakdown", margin, yPos);
      yPos += 10;

      const metrics = Object.entries(data.feedback.metrics);
      const colWidth = (pageWidth - 2 * margin) / 2;

      metrics.forEach(([key, score], idx) => {
        const col = idx % 2;
        const xPos = margin + col * colWidth;

        if (col === 0 && idx > 0) yPos += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        const label = key.replace(/([A-Z])/g, " $1").trim();
        doc.text(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${score}/10`, xPos, yPos);
      });

      yPos += 18;

      // ===== STRENGTHS =====
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("✓ Strengths", margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      data.feedback.strengths.forEach((s) => {
        yPos = addWrappedText(`• ${s}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
        yPos += 2;
      });

      yPos += 8;

      // ===== IMPROVEMENTS =====
      doc.setTextColor(217, 119, 6);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("△ Areas to Improve", margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      data.feedback.improvements.forEach((s) => {
        yPos = addWrappedText(`• ${s}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
        yPos += 2;
      });

      yPos += 12;

      // ===== PHASE BREAKDOWN =====
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Phase Breakdown", margin, yPos);
      yPos += 10;

      Object.entries(data.feedback.phaseBreakdown).forEach(([phase, feedback], idx) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        const phaseLabel = phase.replace(/([A-Z])/g, " $1").trim();
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`${idx + 1}. ${phaseLabel.charAt(0).toUpperCase() + phaseLabel.slice(1)}`, margin, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        yPos = addWrappedText(feedback, margin + 5, yPos, pageWidth - 2 * margin - 5);
        yPos += 8;
      });

      // ===== CODE SNAPSHOT =====
      doc.addPage();
      yPos = 20;

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Code Snapshot", margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Language: ${data.codeSnapshot.language}`, margin, yPos);
      yPos += 8;

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 2, 2, "F");

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const codeLines = data.codeSnapshot.code.split("\n");
      codeLines.forEach((line, idx) => {
        doc.text(line, margin + 5, yPos + 8 + idx * 6);
      });

      yPos += 55;

      // ===== TRANSCRIPT =====
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Interview Transcript", margin, yPos);
      yPos += 10;

      data.transcript.forEach((msg) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        const isAi = msg.role === "interviewer";
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(isAi ? 107 : 8, isAi ? 114 : 145, isAi ? 128 : 178);
        doc.text(isAi ? "Interviewer (AI)" : "You (Candidate)", margin, yPos);
        doc.setTextColor(148, 163, 184);
        doc.text(msg.timestamp, margin + 50, yPos);
        yPos += 5;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        yPos = addWrappedText(msg.content, margin, yPos, pageWidth - 2 * margin);
        yPos += 8;
      });

      // ===== FOOTER =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${i} of ${pageCount}  •  AlgoViz Interview Platform`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      const fileName = `Interview_Report_${data.title.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "phases", label: "Phase Breakdown", icon: Layers },
    { id: "code", label: "Code Snapshot", icon: Code },
    { id: "transcript", label: "Transcript", icon: MessageSquare },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 font-sans">
      {/* ============ STICKY HEADER ============ */}
      <header className="sticky top-0 z-50 bg-[#0a0e17]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/user-profile?tab=history")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium">Back to History</span>
          </button>

          <div className="flex gap-2">
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl text-gray-400 transition-all duration-200 border border-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-800 hover:text-white hover:border-gray-600 hover:scale-105 active:scale-95"
                title="Share"
              >
                {shareTooltip ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                <span className="text-sm font-medium hidden sm:inline">Share</span>
              </button>
              {shareTooltip && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-gray-700">
                  Link copied!
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="p-2.5 rounded-xl text-gray-400 transition-all duration-200 border border-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-800 hover:text-white hover:border-gray-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Download PDF Report"
            >
              {isGeneratingPDF ? (
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={18} />
              )}
              <span className="text-sm font-medium hidden sm:inline">
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ============ HERO SCORE SECTION ============ */}
        <motion.section
          className="relative rounded-3xl p-10 mb-10 bg-[#0f1419] border border-gray-800 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle Background Glow */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(5, 150, 105, 0.2) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left: Title & Meta */}
            <div className="text-center lg:text-left">
              <motion.h1
                className="text-3xl font-bold text-white mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {data.title}
              </motion.h1>
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {data.duration}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span>{data.date}</span>
              </motion.div>
            </div>

            {/* Center: Score Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <ScoreRing score={data.feedback.overallScore} size={200} strokeWidth={12} />
            </motion.div>

            {/* Right: Badges */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Grade Badge */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-800/50 border border-gray-700">
                <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center">
                  <Award size={22} className="text-gray-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {getGrade(data.feedback.overallScore)}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Grade
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/50">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{data.status}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Status
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ============ FLOATING TAB NAVIGATION ============ */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <FloatingTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>

        {/* ============ CONTENT GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (2/3 - Content) */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* --- OVERVIEW TAB --- */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Executive Summary */}
                  <motion.div
                    variants={itemVariants}
                    className="p-6 rounded-2xl bg-[#0f1419] border border-gray-800"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart2 className="text-gray-500" size={20} />
                      Executive Summary
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-lg">
                      {data.feedback.summary}
                    </p>
                  </motion.div>

                  {/* Strengths & Improvements Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <motion.div
                      variants={itemVariants}
                      className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-800/30"
                    >
                      <h4 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle size={18} />
                        Strengths
                      </h4>
                      <ul className="space-y-3">
                        {data.feedback.strengths.map((s, i) => (
                          <motion.li
                            key={i}
                            className="text-gray-300 text-sm flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            {s}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Improvements */}
                    <motion.div
                      variants={itemVariants}
                      className="p-6 rounded-2xl bg-amber-900/10 border border-amber-800/30"
                    >
                      <h4 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                        <XCircle size={18} />
                        Areas to Improve
                      </h4>
                      <ul className="space-y-3">
                        {data.feedback.improvements.map((s, i) => (
                          <motion.li
                            key={i}
                            className="text-gray-300 text-sm flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            {s}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* --- PHASES TAB --- */}
              {activeTab === "phases" && (
                <motion.div
                  key="phases"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <PhaseTimeline phases={data.feedback.phaseBreakdown} />
                </motion.div>
              )}

              {/* --- CODE TAB --- */}
              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl bg-[#0f1419] border border-gray-800"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Code className="text-gray-500" size={20} />
                      Final Code Snapshot
                    </h3>
                    <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700">
                      {data.codeSnapshot.language}
                    </span>
                  </div>
                  <div className="p-5 rounded-xl bg-black/40 font-mono text-sm text-gray-300 overflow-x-auto border border-gray-800">
                    <pre>{data.codeSnapshot.code}</pre>
                  </div>
                </motion.div>
              )}

              {/* --- TRANSCRIPT TAB --- */}
              {activeTab === "transcript" && (
                <motion.div
                  key="transcript"
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header */}
                  <div className="p-4 rounded-xl bg-[#0f1419] border border-gray-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                      Interview Log • Session ID: {data._id}
                    </span>
                  </div>

                  {/* Messages */}
                  {data.transcript.map((msg, idx) => {
                    const isAi = msg.role === "interviewer";
                    return (
                      <motion.div
                        key={idx}
                        className={`flex gap-4 ${isAi ? "" : "flex-row-reverse"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAi ? "bg-gray-700" : "bg-cyan-800"
                            }`}
                        >
                          {isAi ? (
                            <Bot size={18} className="text-gray-300" />
                          ) : (
                            <User size={18} className="text-cyan-300" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl border ${isAi
                            ? "rounded-tl-sm bg-[#0f1419] border-gray-800"
                            : "rounded-tr-sm bg-cyan-900/20 border-cyan-800/30"
                            }`}
                        >
                          <div
                            className={`text-xs font-semibold mb-2 ${isAi ? "text-gray-500" : "text-cyan-400"
                              }`}
                          >
                            {isAi ? "Interviewer (AI)" : "You (Candidate)"}
                          </div>
                          <p
                            className={`text-gray-300 leading-relaxed ${isAi ? "font-mono text-sm" : "text-sm"
                              }`}
                          >
                            {msg.content}
                          </p>
                          <div className="text-[10px] text-gray-600 mt-2 font-mono">
                            {msg.timestamp}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN (1/3 - Sticky Skill Radar) */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-24 p-6 rounded-2xl bg-[#0f1419] border border-gray-800"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <BarChart2 className="text-gray-500" />
                Skill Breakdown
              </h4>

              <div className="space-y-5">
                {Object.entries(data.feedback.metrics).map(([key, score], idx) => (
                  <CapsuleProgress
                    key={key}
                    label={key}
                    score={score}
                    delay={0.8 + idx * 0.05}
                  />
                ))}
              </div>

              {/* Insight Footer */}
              <motion.div
                className="mt-8 pt-6 border-t border-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  💡 <span className="text-gray-400 font-medium">Pro Tip:</span> Your strong{" "}
                  <span className="text-gray-300 font-medium">Communication</span> score
                  helps balance technical areas.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultPage;
