import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Settings, X, Code2, WrapText,
  HelpCircle, Calendar, CheckCircle2, XCircle, Shuffle,
  Target, TrendingUp, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { activitySelection as activitySelectionCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// ACTIVITY SELECTION STEP GENERATOR (Greedy Algorithm)
// ============================================================================

const generateActivitySteps = (activities) => {
  const steps = [];

  if (activities.length === 0) {
    return [{
      type: 'empty',
      description: 'No activities to schedule',
      activities: [],
      selectedActivities: [],
      currentIndex: -1,
      lastEndTime: 0,
      scannerPosition: 0,
      phase: 'complete',
      codeLine: null
    }];
  }

  const getCodeLine = (phase) => {
    switch (phase) {
      case 'unsorted': return 1;
      case 'sorting': return 3;
      case 'selecting': return 6;
      case 'checking': return 9;
      case 'selected': return 10;
      case 'rejected': return 12;
      case 'complete': return 15;
      default: return 1;
    }
  };

  // Initial state - unsorted
  steps.push({
    type: 'initial',
    description: 'Starting with unsorted activities',
    activities: activities.map((a, i) => ({ ...a, originalIndex: i, status: 'unsorted' })),
    selectedActivities: [],
    currentIndex: -1,
    lastEndTime: 0,
    scannerPosition: 0,
    phase: 'unsorted',
    codeLine: getCodeLine('unsorted')
  });

  // Sort by end time
  const sortedActivities = [...activities]
    .map((a, i) => ({ ...a, originalIndex: i, status: 'pending' }))
    .sort((a, b) => a.end - b.end);

  steps.push({
    type: 'sorting',
    description: 'Sorting activities by END TIME (Greedy Choice)',
    activities: sortedActivities,
    selectedActivities: [],
    currentIndex: -1,
    lastEndTime: 0,
    scannerPosition: 0,
    phase: 'sorting',
    codeLine: getCodeLine('sorting')
  });

  // Always select the first activity
  const selected = [];
  const firstActivity = { ...sortedActivities[0], status: 'selected' };
  selected.push(firstActivity);

  const afterFirst = sortedActivities.map((a, i) =>
    i === 0 ? { ...a, status: 'selected' } : a
  );

  steps.push({
    type: 'select_first',
    description: `Selected Activity ${firstActivity.id}: (${firstActivity.start}-${firstActivity.end}) - First sorted activity`,
    activities: afterFirst,
    selectedActivities: [...selected],
    currentIndex: 0,
    lastEndTime: firstActivity.end,
    scannerPosition: firstActivity.end,
    phase: 'selecting',
    codeLine: getCodeLine('selecting')
  });

  // Process remaining activities
  let lastEndTime = firstActivity.end;

  for (let i = 1; i < sortedActivities.length; i++) {
    const activity = sortedActivities[i];

    // Scanning step
    steps.push({
      type: 'scanning',
      description: `Checking Activity ${activity.id}: Start=${activity.start}, End=${activity.end}`,
      activities: sortedActivities.map((a, idx) => ({
        ...a,
        status: idx < i
          ? (selected.some(s => s.originalIndex === a.originalIndex) ? 'selected' : 'rejected')
          : idx === i ? 'checking' : 'pending'
      })),
      selectedActivities: [...selected],
      currentIndex: i,
      lastEndTime,
      scannerPosition: activity.start,
      phase: 'checking',
      codeLine: getCodeLine('checking')
    });

    if (activity.start >= lastEndTime) {
      // Can select this activity
      const selectedActivity = { ...activity, status: 'selected' };
      selected.push(selectedActivity);
      lastEndTime = activity.end;

      steps.push({
        type: 'select',
        description: `✓ Selected Activity ${activity.id}: Start (${activity.start}) ≥ Last End (${lastEndTime - (activity.end - activity.start)})`,
        activities: sortedActivities.map((a, idx) => ({
          ...a,
          status: idx <= i
            ? (selected.some(s => s.originalIndex === a.originalIndex) ? 'selected' : 'rejected')
            : 'pending'
        })),
        selectedActivities: [...selected],
        currentIndex: i,
        lastEndTime,
        scannerPosition: activity.end,
        phase: 'selected',
        codeLine: getCodeLine('selected')
      });
    } else {
      // Conflict - reject
      steps.push({
        type: 'reject',
        description: `✗ Rejected Activity ${activity.id}: Start (${activity.start}) < Last End (${lastEndTime}) - Conflict!`,
        activities: sortedActivities.map((a, idx) => ({
          ...a,
          status: idx < i
            ? (selected.some(s => s.originalIndex === a.originalIndex) ? 'selected' : 'rejected')
            : idx === i ? 'rejected' : 'pending'
        })),
        selectedActivities: [...selected],
        currentIndex: i,
        lastEndTime,
        scannerPosition: activity.start,
        phase: 'rejected',
        codeLine: getCodeLine('rejected')
      });
    }
  }

  // Final step
  const totalTime = 24;
  const utilizedTime = selected.reduce((sum, a) => sum + (a.end - a.start), 0);
  const utilization = Math.round((utilizedTime / totalTime) * 100);

  steps.push({
    type: 'complete',
    description: `🎉 Complete! Selected ${selected.length} activities. Utilization: ${utilization}%`,
    activities: sortedActivities.map(a => ({
      ...a,
      status: selected.some(s => s.originalIndex === a.originalIndex) ? 'selected' : 'rejected'
    })),
    selectedActivities: [...selected],
    currentIndex: -1,
    lastEndTime,
    scannerPosition: 24,
    phase: 'complete',
    codeLine: getCodeLine('complete'),
    utilization
  });

  return steps;
};

// ============================================================================
// ACTIVITY BAR COMPONENT
// ============================================================================

const ActivityBar = ({ activity, isInSchedule, totalTime = 24 }) => {
  const left = (activity.start / totalTime) * 100;
  const width = ((activity.end - activity.start) / totalTime) * 100;

  const getStatusStyles = () => {
    switch (activity.status) {
      case 'selected':
        return 'bg-green-500/30 border-green-400 text-green-300 shadow-lg shadow-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/50 text-red-300 opacity-40';
      case 'checking':
        return 'bg-yellow-500/30 border-yellow-400 text-yellow-300 animate-pulse shadow-lg shadow-yellow-500/30';
      case 'unsorted':
        return 'bg-purple-500/30 border-purple-400 text-purple-300';
      default:
        return 'bg-slate-600/50 border-slate-500 text-slate-300';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: activity.status === 'checking' ? 1.05 : 1
      }}
      className={`absolute h-8 sm:h-10 rounded-lg border-2 flex items-center justify-center px-1 sm:px-2 overflow-hidden ${getStatusStyles()}`}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 4)}%`,
        minWidth: '40px'
      }}
    >
      <span className="text-[10px] sm:text-xs font-bold truncate">
        {activity.id}
      </span>

      {activity.status === 'rejected' && (
        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-red-400/70" />
      )}

      {activity.status === 'selected' && (
        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-green-400" />
      )}
    </motion.div>
  );
};

// ============================================================================
// CODE PANEL COMPONENT
// ============================================================================

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
  const [language, setLanguage] = useState("cpp");
  const [wrap, setWrap] = useState(false);
  const panelRef = useRef(null);

  const labels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
  const lines = (activitySelectionCode[language] || "").split('\n');

  useEffect(() => {
    const handleClick = (e) => {
      if (!isOpen) return;
      if (panelRef.current?.contains(e.target)) return;
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('[data-control-bar]')) return;
      onClose();
    };
    if (isOpen) {
      const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
      return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
    }
  }, [isOpen, onClose]);

  const handleResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelWidth;
    const move = (e) => setPanelWidth(Math.max(350, Math.min(700, startW + startX - e.clientX)));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full z-50 backdrop-blur-2xl bg-black/80 border-l border-white/10 flex flex-col shadow-2xl w-full sm:w-[85vw] md:w-[70vw] lg:w-[50vw]"
          style={{ maxWidth: panelWidth }}
        >
          <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-green-500/50 transition-colors" />

          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <Code2 size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Activity Selection</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-green-500 focus:outline-none cursor-pointer"
              >
                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <button
                onClick={() => setWrap(!wrap)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
              >
                <WrapText size={16} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                animate={i + 1 === activeLine ? { backgroundColor: "rgba(34,197,94,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-green-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-green-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-green-100" : "text-white/70"}`}>{line || " "}</pre>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ActivitySelection = () => {
  const navigate = useNavigate();

  // Default activities
  const defaultActivities = [
    { id: 'A', start: 1, end: 4 },
    { id: 'B', start: 3, end: 5 },
    { id: 'C', start: 0, end: 6 },
    { id: 'D', start: 5, end: 7 },
    { id: 'E', start: 3, end: 9 },
    { id: 'F', start: 5, end: 9 },
    { id: 'G', start: 6, end: 10 },
    { id: 'H', start: 8, end: 11 },
    { id: 'I', start: 8, end: 12 },
    { id: 'J', start: 12, end: 14 },
    { id: 'K', start: 2, end: 13 }
  ];

  // State
  const [activities, setActivities] = useState(defaultActivities);
  const [inputText, setInputText] = useState('(1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11), (8,12), (12,14), (2,13)');
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [showCode, setShowCode] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const settingsRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ bottom: 0, left: 0 });

  // Initialize
  const initialize = useCallback(() => {
    const allSteps = generateActivitySteps(activities);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [activities]);

  useEffect(() => { initialize(); }, [initialize]);

  // Current step
  const currentStep = steps[currentStepIndex] || {
    activities: activities.map(a => ({ ...a, status: 'pending' })),
    selectedActivities: [],
    scannerPosition: 0,
    lastEndTime: 0,
    description: 'Set activities and press Play',
    phase: 'ready',
    codeLine: 1
  };

  // Auto-play
  useEffect(() => {
    if (!playing || currentStepIndex >= steps.length - 1) {
      if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
      return;
    }
    const delay = Math.max(50, 500 / speed);
    const timer = setTimeout(() => setCurrentStepIndex(i => i + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, currentStepIndex, steps.length, speed]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        const dropdown = document.querySelector('[data-dropdown="settings"]');
        if (!dropdown?.contains(e.target)) setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSettings]);

  // Handlers
  const handlePlayPause = () => setPlaying(!playing);
  const handleStepForward = () => currentStepIndex < steps.length - 1 && setCurrentStepIndex(i => i + 1);
  const handleStepBack = () => currentStepIndex > 0 && setCurrentStepIndex(i => i - 1);
  const handleReset = () => { setCurrentStepIndex(0); setPlaying(false); };
  const handleScrub = (e) => setCurrentStepIndex(parseInt(e.target.value));

  // Parse input
  const parseAndStart = () => {
    try {
      const parsed = inputText
        .replace(/\s/g, '')
        .match(/\((\d+),(\d+)\)/g)
        ?.map((match, i) => {
          const [, start, end] = match.match(/\((\d+),(\d+)\)/);
          return {
            id: String.fromCharCode(65 + i),
            start: parseInt(start),
            end: parseInt(end)
          };
        }) || [];

      if (parsed.length > 0) {
        setActivities(parsed);
      }
    } catch (e) {
      console.error('Parse error:', e);
    }
    setShowSettings(false);
  };

  // Generate random
  const generateRandom = () => {
    const count = Math.floor(Math.random() * 6) + 6;
    const randomActivities = [];

    for (let i = 0; i < count; i++) {
      const start = Math.floor(Math.random() * 20);
      const duration = Math.floor(Math.random() * 5) + 2;
      const end = Math.min(start + duration, 24);

      if (end > start) {
        randomActivities.push({
          id: String.fromCharCode(65 + i),
          start,
          end
        });
      }
    }

    const inputStr = randomActivities.map(a => `(${a.start},${a.end})`).join(', ');
    setInputText(inputStr);
    setActivities(randomActivities);
    setShowSettings(false);
  };

  // Stats
  const selectedCount = currentStep.selectedActivities?.length || 0;
  const totalTime = 24;
  const utilizedTime = currentStep.selectedActivities?.reduce((sum, a) => sum + (a.end - a.start), 0) || 0;
  const utilization = Math.round((utilizedTime / totalTime) * 100);

  return (
    <div className="fixed inset-0 bg-[#0b0b0d] overflow-hidden flex">
      {/* MAIN VISUALIZATION AREA */}
      <motion.div
        layout
        className="relative flex-1 h-full"
        initial={false}
        animate={{ marginRight: showCode ? panelWidth : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* VISUALIZATION CONTENT */}
        <div className="absolute inset-0 flex flex-col pt-28 sm:pt-32 xl:pt-40 pb-28 sm:pb-32 overflow-auto px-4">

          {/* MOBILE/TABLET: LEGEND */}
          <div className="xl:hidden flex justify-center flex-wrap gap-2 sm:gap-4 mt-2 mt-6 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Checking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Rejected</span>
            </div>
          </div>

          {/* TIMELINE VISUALIZATION */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6">

            {/* Time Axis */}
            <div className="w-full max-w-4xl">
              <div className="flex justify-between text-xs text-white/50 mb-2 px-2">
                {[0, 4, 8, 12, 16, 20, 24].map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="h-1 bg-white/10 rounded-full relative">
                {/* Scanner Line */}
                {currentStep.phase !== 'ready' && currentStep.phase !== 'complete' && (
                  <motion.div
                    className="absolute -top-3 w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-transparent"
                    style={{ left: `${(currentStep.scannerPosition / 24) * 100}%` }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
                {/* Last End Time Marker */}
                {currentStep.lastEndTime > 0 && (
                  <motion.div
                    className="absolute -top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"
                    style={{ left: `${(currentStep.lastEndTime / 24) * 100}%`, transform: 'translateX(-50%)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </div>

            {/* Activity Pool */}
            <div className="w-full max-w-4xl">
              <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                <Clock size={12} />
                <span>Activity Pool (sorted by End Time)</span>
              </div>
              <div className="relative h-48 sm:h-64 bg-slate-800/30 rounded-2xl border border-white/5 overflow-hidden">
                <AnimatePresence>
                  {currentStep.activities?.map((activity, idx) => (
                    <div
                      key={activity.originalIndex ?? idx}
                      className="absolute w-full h-8 sm:h-10"
                      style={{ top: `${idx * 20 + 8}px` }}
                    >
                      <ActivityBar activity={activity} totalTime={24} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Selected Schedule */}
            <div className="w-full max-w-4xl">
              <div className="text-xs text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle2 size={12} />
                <span>My Schedule (Selected Activities)</span>
              </div>
              <div className="relative h-16 bg-green-900/20 rounded-2xl border border-green-500/30 overflow-hidden">
                <AnimatePresence>
                  {currentStep.selectedActivities?.map((activity, idx) => (
                    <div key={activity.originalIndex ?? idx} className="absolute w-full h-10 top-3">
                      <ActivityBar activity={activity} isInSchedule totalTime={24} />
                    </div>
                  ))}
                </AnimatePresence>
                {currentStep.selectedActivities?.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
                    Selected activities appear here
                  </div>
                )}
              </div>
            </div>

            {/* Commentary */}
            <motion.div
              className="max-w-xl backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-2xl p-3 sm:p-4"
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-white/90 text-center text-sm sm:text-base font-medium">{currentStep.description}</p>
            </motion.div>
          </div>
        </div>

        {/* =============== FLOATING UI =============== */}

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        {/* DESKTOP: Header */}
        <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-black text-white">Activity Selection</h1>
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">Greedy</span>
          </div>
          <p className="text-xs text-white/50 mb-2">Select maximum non-overlapping activities</p>
          <p className="text-sm text-white/70">{currentStep.description}</p>
        </div>

        {/* MOBILE/TABLET: Header Bar */}
        <motion.div
          className="xl:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
          initial={{ right: 0 }}
          animate={{ right: showCode ? panelWidth : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="px-3 sm:px-4 py-1.5 sm:py-2">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-sm sm:text-base font-bold text-white">Activity Selection</h1>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-green-400">Selected: {selectedCount}</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-400">{utilization}%</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/50">Select max non-overlapping</p>
          </div>
        </motion.div>

        {/* DESKTOP: Efficiency HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
            <div>
              <div className="text-xs text-white/50 flex items-center gap-2">
                <Target size={12} />
                Selected Activities
              </div>
              <div className="text-2xl font-black text-green-400">{selectedCount}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-cyan-400 flex items-center gap-1">
                  <TrendingUp size={10} />
                  Utilization
                </div>
                <div className="text-lg font-bold text-cyan-400">{utilization}%</div>
              </div>
              <div>
                <div className="text-xs text-white/50">Total</div>
                <div className="text-lg font-bold text-white/60">{activities.length}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP: LEGEND */}
        <motion.div
          className="hidden xl:flex fixed top-24 z-40 backdrop-blur-xl bg-black/40 rounded-full px-6 py-2.5 items-center gap-6"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{
            left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
            x: '-50%',
            top: showCode ? 190 : 96
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-xs font-semibold text-white/80">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-white/80">Checking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-white/80">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-white/80">Rejected</span>
          </div>
        </motion.div>

        {/* CONTROL DOCK */}
        <motion.div
          data-control-bar="true"
          className="fixed bottom-3 sm:bottom-4 xl:bottom-6 z-50 backdrop-blur-2xl bg-gray-900 border border-white rounded-2xl xl:rounded-3xl p-2.5 sm:p-3 xl:p-4 flex items-center gap-2 sm:gap-3 xl:gap-4 shadow-2xl max-w-[95vw] overflow-x-auto"
          initial={{ left: 'calc(50%)', x: '-50%' }}
          animate={{ left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`, x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Scrubber */}
          <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[160px] flex-shrink-0">
            <input
              type="range"
              min="0"
              max={Math.max(0, steps.length - 1)}
              value={currentStepIndex}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-green-500"
            />
            <span className="text-[10px] sm:text-xs text-white font-medium">{currentStepIndex + 1}/{steps.length}</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer">
              {playing ? <Pause size={18} className="text-white sm:w-5 sm:h-5" /> : <Play size={18} className="text-white sm:w-5 sm:h-5" />}
            </button>
            <button onClick={handleStepForward} disabled={currentStepIndex >= steps.length - 1} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipForward size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handleReset} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <RotateCcw size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Speed */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Zap size={12} className="text-green-400 sm:w-3.5 sm:h-3.5" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-green-500"
            />
            <span className="text-[10px] sm:text-xs font-bold text-white/60 w-6">{speed}x</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Settings */}
          <button
            ref={settingsRef}
            onClick={() => {
              if (settingsRef.current) {
                const rect = settingsRef.current.getBoundingClientRect();
                setDropdownPos({ bottom: window.innerHeight - rect.top + 12, left: Math.max(10, rect.left - 80) });
              }
              setShowSettings(!showSettings);
            }}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Code2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </motion.div>
      </motion.div>

      {/* CODE PANEL */}
      <CodePanel
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        activeLine={currentStep.codeLine}
        panelWidth={panelWidth}
        setPanelWidth={setPanelWidth}
      />

      {/* SETTINGS DROPDOWN */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 bg-black/50 z-[199]"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bg-slate-900 border border-white/20 rounded-2xl p-4 shadow-2xl z-[200] 
                         w-[85vw] sm:w-72 
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         bottom-[120px] sm:bottom-auto"
              style={{
                ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { bottom: dropdownPos.bottom, left: dropdownPos.left } : {})
              }}
              data-dropdown="settings"
            >
              <div className="space-y-4">
                {/* Input */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Activity Pairs (start, end)</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="(1,4), (3,5), (0,6)..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-green-500 focus:outline-none resize-none h-20"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={parseAndStart}
                    className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Apply
                  </button>
                  <button
                    onClick={generateRandom}
                    className="flex-1 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all flex items-center justify-center gap-1"
                  >
                    <Shuffle size={14} />
                    Random
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HELP BUTTON */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 transition-all cursor-pointer shadow-lg"
      >
        <HelpCircle size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* HELP MODAL */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Activity Selection</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h3 className="font-bold text-green-400 mb-1">🎯 Goal</h3>
                  <p>Select the maximum number of non-overlapping activities/meetings.</p>
                </div>

                <div>
                  <h3 className="font-bold text-green-400 mb-1">📝 Greedy Strategy</h3>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs sm:text-sm">
                    1. Sort by END TIME<br />
                    2. Always pick earliest ending<br />
                    3. Skip if overlaps with last selected
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-green-400 mb-1">🌳 Visual States</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-slate-500" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500" />
                      <span>Checking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>Selected ✓</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span>Rejected ✗</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h3 className="font-bold text-green-400 mb-1">💡 Why End Time?</h3>
                  <p className="text-xs">Picking the activity that ends earliest leaves maximum time for remaining activities - that's the greedy insight!</p>
                </div>

                <div className="text-xs text-white/50">
                  Time: O(n log n) | Space: O(n)
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivitySelection;
