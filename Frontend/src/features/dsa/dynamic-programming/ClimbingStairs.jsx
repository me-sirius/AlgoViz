import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipForward, SkipBack, RotateCcw,
    ArrowLeft, Code2, WrapText, X, Zap,
    TrendingUp, Footprints
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { climbingStairs as climbingStairsCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// CLIMBING STAIRS STEP GENERATOR (Iterative DP)
// ============================================================================

const generateClimbingStairsSteps = (n) => {
    const steps = [];
    const dp = new Array(n + 1).fill(0);

    // Initial state
    steps.push({
        dp: [...dp],
        currentStep: -1,
        activeSources: [],
        phase: 'start',
        formula: null,
        commentary: `Starting Climbing Stairs for n = ${n}. How many ways to reach the top?`,
        codeLine: 1,
        totalWays: 0
    });

    if (n === 0) {
        dp[0] = 1;
        steps.push({
            dp: [...dp],
            currentStep: 0,
            activeSources: [],
            phase: 'base_case',
            formula: 'DP[0] = 1',
            commentary: `Base case: There's 1 way to stay at ground (do nothing).`,
            codeLine: 2,
            totalWays: 1
        });
        return steps;
    }

    // Base case: Step 0
    dp[0] = 1;
    steps.push({
        dp: [...dp],
        currentStep: 0,
        activeSources: [],
        phase: 'base_case',
        formula: 'DP[0] = 1',
        commentary: `Base case: 1 way to be at ground level (starting point).`,
        codeLine: 2,
        totalWays: 1
    });

    // Base case: Step 1
    if (n >= 1) {
        dp[1] = 1;
        steps.push({
            dp: [...dp],
            currentStep: 1,
            activeSources: [],
            phase: 'base_case',
            formula: 'DP[1] = 1',
            commentary: `Base case: 1 way to reach step 1 (single 1-step jump).`,
            codeLine: 2,
            totalWays: 1
        });
    }

    // Iterative DP: For each step from 2 to n
    for (let i = 2; i <= n; i++) {
        // Show the sources being referenced
        steps.push({
            dp: [...dp],
            currentStep: i,
            activeSources: [i - 1, i - 2],
            phase: 'reference',
            formula: `DP[${i}] = DP[${i - 1}] + DP[${i - 2}]`,
            commentary: `To reach step ${i}: Come from step ${i - 1} (+1 jump) or step ${i - 2} (+2 jump).`,
            codeLine: 4,
            totalWays: dp[n] || 0,
            calculation: {
                left: dp[i - 1],
                right: dp[i - 2],
                result: null
            }
        });

        // Calculate and update
        dp[i] = dp[i - 1] + dp[i - 2];
        steps.push({
            dp: [...dp],
            currentStep: i,
            activeSources: [i - 1, i - 2],
            phase: 'calculate',
            formula: `DP[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
            commentary: `✓ Ways to step ${i}: ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]} ways!`,
            codeLine: 5,
            totalWays: dp[i],
            calculation: {
                left: dp[i - 1],
                right: dp[i - 2],
                result: dp[i]
            }
        });
    }

    // Final result
    steps.push({
        dp: [...dp],
        currentStep: n,
        activeSources: [],
        phase: 'complete',
        formula: `Answer = DP[${n}] = ${dp[n]}`,
        commentary: `🎉 There are ${dp[n]} distinct ways to climb ${n} stairs!`,
        codeLine: 6,
        totalWays: dp[n]
    });

    return steps;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard = ({ icon: Icon, value, label, color = "cyan" }) => {
    const colorMap = {
        cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
        amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
        green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
        purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    };

    return (
        <div className={`backdrop-blur-xl bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-3 min-w-[100px]`}>
            <div className="flex items-center gap-2">
                <Icon size={16} className="opacity-70" />
                <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-2xl font-black mt-1">{value}</div>
        </div>
    );
};

const StatusBadge = ({ children, color = "cyan" }) => {
    const colorMap = {
        cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        green: "bg-green-500/20 text-green-400 border-green-500/30",
        red: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorMap[color]}`}>
            {children}
        </span>
    );
};

// Code Panel Component
const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
    const [codeLanguage, setCodeLanguage] = useState("cpp");
    const [wrapCode, setWrapCode] = useState(false);
    const panelRef = useRef(null);

    const languageLabels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
    const codeLines = climbingStairsCode[codeLanguage].split('\n');

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && panelRef.current.contains(e.target)) return;
            const isButton = e.target.closest('button');
            const isInput = e.target.tagName === 'INPUT' || e.target.closest('input');
            const isControlBar = e.target.closest('[data-control-bar="true"]');
            if (!isButton && !isInput && !isControlBar) onClose();
        };

        if (isOpen) {
            const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 100);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = panelWidth;

        const handleMouseMove = (e) => {
            const delta = startX - e.clientX;
            const newWidth = Math.max(350, Math.min(700, startWidth + delta));
            setPanelWidth(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
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
                    <div onMouseDown={handleMouseDown} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-green-500/50 transition-colors" />
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                                    <Code2 size={18} className="text-white" />
                                </div>
                                <h3 className="font-bold text-white">Climbing Stairs</h3>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                                <X size={20} className="text-white/70" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={codeLanguage}
                                onChange={(e) => setCodeLanguage(e.target.value)}
                                className="flex-1 px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-green-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                {Object.keys(languageLabels).map(lang => (
                                    <option key={lang} value={lang} className="bg-slate-900">{languageLabels[lang]}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setWrapCode(!wrapCode)}
                                className={`p-2 rounded-lg transition-all cursor-pointer ${wrapCode ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
                                title={wrapCode ? "Unwrap Code" : "Wrap Code"}
                            >
                                <WrapText size={18} />
                            </button>
                        </div>
                    </div>

                    <div className={`flex-1 p-4 font-mono text-sm ${wrapCode ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
                        {codeLines.map((line, idx) => (
                            <motion.div
                                key={idx}
                                animate={idx + 1 === activeLine ? { backgroundColor: "rgba(34,197,94,0.2)" } : { backgroundColor: "transparent" }}
                                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${idx + 1 === activeLine ? "border-l-2 border-green-400" : ""}`}
                            >
                                <span className={`w-6 text-right text-xs flex-shrink-0 ${idx + 1 === activeLine ? "text-green-400 font-bold" : "text-white/30"}`}>
                                    {idx + 1}
                                </span>
                                <pre className={`flex-1 ${wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${idx + 1 === activeLine ? "text-green-100" : "text-white/70"}`}>
                                    {line || " "}
                                </pre>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// STAIRCASE VISUALIZATION COMPONENT
// ============================================================================

const StaircaseVisualization = ({ dp, currentStep, activeSources, phase, n, calculation, showCode, panelWidth }) => {
    const containerRef = useRef(null);

    // Responsive step sizing
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    const isTablet = screenWidth < 1024;

    // Calculate available space - account for code panel, header, and control dock
    const codeOffset = showCode ? panelWidth : 0;
    const availableWidth = screenWidth - codeOffset - (isMobile ? 30 : isTablet ? 60 : 160);
    const availableHeight = window.innerHeight - (isMobile ? 360 : isTablet ? 400 : 440);

    // For mobile with large n (>8), use horizontal scrolling mode
    const useScrollMode = isMobile && n > 8;

    // Scale the staircase to fit both width AND height
    const maxStepByWidth = useScrollMode
        ? 36  // Fixed size for scroll mode
        : availableWidth / (n + 1.5);
    const maxStepByHeight = availableHeight / ((n + 1) * 0.6);

    // Use the MORE RESTRICTIVE constraint to ensure it fits
    const baseStepSize = useScrollMode ? maxStepByWidth : Math.min(maxStepByWidth, maxStepByHeight);

    // Clamp step width to reasonable bounds
    const minStepWidth = isMobile ? 32 : 38;
    const maxStepWidth = isMobile ? 48 : isTablet ? 58 : 68;
    const stepWidth = Math.max(minStepWidth, Math.min(maxStepWidth, baseStepSize));
    const stepHeight = Math.round(stepWidth * 0.5);
    const stepDepth = Math.round(stepWidth * 0.2);

    const totalHeight = (n + 1) * (stepHeight + stepDepth / 2) + 100;
    const totalWidth = (n + 1) * stepWidth + 120; // Extra padding for stair 0 visibility

    // Offset for stair 0 visibility
    const offsetX = 60;
    const offsetY = 50;

    // On mobile with large n, don't center horizontally - allow scroll from left
    const needsScroll = isMobile && n > 7;

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-auto flex items-center ${needsScroll ? 'justify-start' : 'justify-center'}`}
        >
            <div
                className="relative"
                style={{
                    width: totalWidth,
                    height: totalHeight,
                    flexShrink: 0
                }}
            >
                {/* SVG for connection arcs */}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: totalWidth, height: totalHeight }}>
                    {/* Connection arcs when referencing sources */}
                    {activeSources.length === 2 && currentStep !== null && (
                        <>
                            {activeSources.map((source, idx) => {
                                const sourceX = source * stepWidth + stepWidth / 2 + offsetX;
                                const sourceY = totalHeight - offsetY - source * (stepHeight + stepDepth / 2) - stepHeight / 2;
                                const targetX = currentStep * stepWidth + stepWidth / 2 + offsetX;
                                const targetY = totalHeight - offsetY - currentStep * (stepHeight + stepDepth / 2) - stepHeight / 2;

                                const midX = (sourceX + targetX) / 2;
                                const curveOffset = idx === 0 ? -40 : -60;

                                return (
                                    <motion.path
                                        key={source}
                                        d={`M ${sourceX} ${sourceY} Q ${midX} ${Math.min(sourceY, targetY) + curveOffset} ${targetX} ${targetY}`}
                                        fill="none"
                                        stroke={idx === 0 ? "#f59e0b" : "#8b5cf6"}
                                        strokeWidth="3"
                                        strokeDasharray="8,4"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.8 }}
                                        transition={{ duration: 0.5, delay: idx * 0.2 }}
                                    />
                                );
                            })}
                        </>
                    )}
                </svg>

                {/* Staircase Steps */}
                {dp.map((ways, i) => {
                    const x = i * stepWidth + offsetX;
                    const y = totalHeight - offsetY - i * (stepHeight + stepDepth / 2) - stepHeight;

                    const isActive = currentStep === i;
                    const isSource = activeSources.includes(i);
                    const isCompleted = phase === 'complete' || (currentStep !== null && i < currentStep && phase !== 'reference');

                    let stepColor = 'from-slate-600 to-slate-700 border-slate-500';
                    let textColor = 'text-white/50';
                    let badgeColor = 'bg-slate-700/50 border-slate-500/50';

                    if (isActive && phase === 'calculate') {
                        stepColor = 'from-green-500 to-emerald-600 border-green-400';
                        textColor = 'text-green-100';
                        badgeColor = 'bg-green-500/30 border-green-400';
                    } else if (isActive) {
                        stepColor = 'from-cyan-500 to-blue-600 border-cyan-400';
                        textColor = 'text-cyan-100';
                        badgeColor = 'bg-cyan-500/30 border-cyan-400';
                    } else if (isSource && activeSources[0] === i) {
                        stepColor = 'from-amber-500 to-orange-600 border-amber-400';
                        textColor = 'text-amber-100';
                        badgeColor = 'bg-amber-500/30 border-amber-400';
                    } else if (isSource) {
                        stepColor = 'from-purple-500 to-violet-600 border-purple-400';
                        textColor = 'text-purple-100';
                        badgeColor = 'bg-purple-500/30 border-purple-400';
                    } else if (isCompleted && ways > 0) {
                        stepColor = 'from-emerald-600/80 to-green-700/80 border-emerald-500/50';
                        textColor = 'text-emerald-200';
                        badgeColor = 'bg-emerald-600/30 border-emerald-500/50';
                    }

                    return (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{ left: x, top: y }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: isActive ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                            {/* Step Platform */}
                            <motion.div
                                className={`relative w-[${stepWidth}px] h-[${stepHeight}px] bg-gradient-to-r ${stepColor} border-2 rounded-lg flex items-center justify-center shadow-lg`}
                                style={{ width: stepWidth, height: stepHeight }}
                                animate={{
                                    boxShadow: isActive
                                        ? '0 0 30px rgba(34, 211, 238, 0.5)'
                                        : isSource
                                            ? '0 0 20px rgba(245, 158, 11, 0.4)'
                                            : '0 4px 20px rgba(0,0,0,0.3)'
                                }}
                            >
                                {/* Step Number */}
                                <span className={`${isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base'} font-bold ${textColor}`}>{i}</span>

                                {/* Jump labels for sources - HIDE ON MOBILE to reduce clutter */}
                                {!isMobile && isSource && currentStep !== null && (
                                    <motion.div
                                        className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${activeSources[0] === i ? 'bg-amber-500 text-black' : 'bg-purple-500 text-white'}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {activeSources[0] === i ? '+1' : '+2'}
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Ways Badge - Only show when value is calculated, not on every step */}
                            {(ways > 0 || isActive) && (
                                <motion.div
                                    className={`absolute left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${badgeColor} backdrop-blur-sm`}
                                    style={{ top: isMobile ? -22 : -32 }}
                                    animate={{
                                        scale: isActive && phase === 'calculate' ? [1, 1.15, 1] : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold ${textColor}`}>
                                        {ways > 0 ? ways : '?'}
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Character/Avatar - moves with current step */}
                {currentStep !== null && currentStep >= 0 && (
                    <motion.div
                        className="absolute"
                        initial={{ scale: 0 }}
                        animate={{
                            scale: 1,
                            left: currentStep * stepWidth + stepWidth / 2 + offsetX - (isMobile ? 12 : 16),
                            top: totalHeight - offsetY - currentStep * (stepHeight + stepDepth / 2) + stepHeight - 16,
                            y: phase === 'complete' ? [0, -6, 0] : 0,
                        }}
                        transition={{
                            duration: 0.35,
                            type: "spring",
                            stiffness: 250,
                            damping: 22,
                            y: { repeat: phase === 'complete' ? Infinity : 0, duration: 0.5 }
                        }}
                    >
                        <motion.div
                            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white shadow-lg shadow-cyan-500/50 flex items-center justify-center`}
                            animate={{
                                boxShadow: phase === 'complete'
                                    ? ['0 0 20px rgba(34, 211, 238, 0.5)', '0 0 40px rgba(34, 211, 238, 0.8)', '0 0 20px rgba(34, 211, 238, 0.5)']
                                    : '0 0 20px rgba(34, 211, 238, 0.5)'
                            }}
                            transition={{ repeat: phase === 'complete' ? Infinity : 0, duration: 1 }}
                        >
                            <Footprints size={isMobile ? 14 : 18} className="text-white" />
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClimbingStairs = () => {
    const navigate = useNavigate();

    // Configuration
    const [n, setN] = useState(6);

    // Steps and playback
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    // UI state
    const [showCode, setShowCode] = useState(false);
    const [panelWidth, setPanelWidth] = useState(450);
    const [showSizeDropdown, setShowSizeDropdown] = useState(false);
    const sizeButtonRef = React.useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ bottom: 0, left: 0 });

    // Current step data
    const currentStep = steps[currentStepIndex] || {
        dp: new Array(n + 1).fill(0),
        currentStep: -1,
        activeSources: [],
        phase: 'idle',
        formula: null,
        commentary: 'Configure the number of stairs and press Play to start.',
        codeLine: 1,
        totalWays: 0
    };

    // Initialize/Reset
    const initializeVisualization = useCallback(() => {
        const newSteps = generateClimbingStairsSteps(n);
        setSteps(newSteps);
        setCurrentStepIndex(0);
        setPlaying(false);
    }, [n]);

    // Auto-regenerate when n changes
    useEffect(() => {
        initializeVisualization();
    }, [initializeVisualization]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showSizeDropdown && sizeButtonRef.current && !sizeButtonRef.current.contains(e.target)) {
                const dropdown = document.querySelector('[data-dropdown="size"]');
                if (!dropdown || !dropdown.contains(e.target)) {
                    setShowSizeDropdown(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSizeDropdown]);

    // Playback controls
    const handlePlayPause = () => setPlaying(!playing);
    const handleStepForward = () => {
        if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1);
    };
    const handleStepBack = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
    };
    const handleReset = () => {
        setCurrentStepIndex(0);
        setPlaying(false);
    };
    const handleScrub = (e) => {
        setCurrentStepIndex(parseInt(e.target.value));
    };

    // Animation loop
    useEffect(() => {
        if (!playing || currentStepIndex >= steps.length - 1) {
            if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
            return;
        }
        const delay = Math.max(100, 800 / speed);
        const timer = setTimeout(() => setCurrentStepIndex(prev => prev + 1), delay);
        return () => clearTimeout(timer);
    }, [playing, currentStepIndex, steps.length, speed]);

    const opsPerSecond = Math.round(speed * 1.25);

    return (
        <div className="fixed inset-0 bg-[#0b0b0d] overflow-hidden flex">
            {/* VISUALIZATION CANVAS */}
            <motion.div
                layout
                className="relative flex-1 h-full"
                initial={false}
                animate={{ marginRight: showCode ? panelWidth : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Main Content */}
                <div className="absolute inset-0 flex flex-col px-4 pt-28 sm:pt-32 xl:pt-24 pb-24 sm:pb-32">
                    {/* MOBILE/TABLET: LEGEND (visible on smaller screens) */}
                    <div className="xl:hidden flex justify-center flex-wrap gap-2 sm:gap-4 mt-4 mb-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
                            <span className="text-[9px] sm:text-xs text-white/60">i-1 (Yellow)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-purple-500 to-violet-600" />
                            <span className="text-[9px] sm:text-xs text-white/60">i-2 (Purple)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600" />
                            <span className="text-[9px] sm:text-xs text-white/60">Calculated</span>
                        </div>
                    </div>

                    {/* Staircase Visualization */}
                    <div className="flex-1 w-full overflow-auto">
                        <StaircaseVisualization
                            dp={currentStep.dp}
                            currentStep={currentStep.currentStep}
                            activeSources={currentStep.activeSources}
                            phase={currentStep.phase}
                            n={n}
                            calculation={currentStep.calculation}
                            showCode={showCode}
                            panelWidth={panelWidth}
                        />
                    </div>

                    {/* Commentary Box */}
                    <motion.div
                        className="mx-auto max-w-2xl backdrop-blur-xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-white/10 rounded-2xl p-4 mt-4"
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <p className="text-white/90 text-center font-medium">{currentStep.commentary}</p>
                    </motion.div>
                </div>

                {/* =============== FLOATING UI =============== */}

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate("/")}
                    className="fixed top-3 left-3 sm:top-4 sm:left-4 xl:top-6 xl:left-6 z-50 p-2 sm:p-2.5 xl:p-3 rounded-xl xl:rounded-2xl backdrop-blur-xl bg-black/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                    <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
                </button>

                {/* DESKTOP: Header with Commentary (≥ 1280px) */}
                <div className="hidden xl:block fixed top-6 left-24 z-40 backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 max-w-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-xl font-black text-white">Climbing Stairs</h1>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                            n = {n}
                        </span>
                    </div>
                    <p className="text-xs text-white/50 mb-2">Take 1 or 2 steps at a time. How many ways to reach step n?</p>
                    <p className="text-sm text-white/70 leading-relaxed">
                        {currentStep.commentary}
                    </p>
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
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-bold text-white">Climbing Stairs</h1>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                                    <span className="text-[10px] sm:text-xs font-bold text-cyan-400">n={n}</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30">
                                    <span className="text-[10px] sm:text-xs font-bold text-green-400">Ways: {currentStep.totalWays}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] sm:text-xs text-white/50">Take 1 or 2 steps at a time. How many ways to reach step n?</p>
                    </div>
                </motion.div>

                {/* DESKTOP: LEGEND/HUD */}
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
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
                        <span className="text-xs font-semibold text-white/80">i-1 (Yellow)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-violet-600" />
                        <span className="text-xs font-semibold text-white/80">i-2 (Purple)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600" />
                        <span className="text-xs font-semibold text-white/80">Calculated</span>
                    </div>
                </motion.div>

                {/* DESKTOP: MATH HUD (Top Right) */}
                <motion.div
                    className="hidden xl:flex fixed top-6 right-6 z-40 flex-col gap-3"
                    initial={{ right: 24 }}
                    animate={{ right: showCode ? panelWidth + 24 : 24 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Formula Display */}
                    <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Formula</div>
                        <div className="text-lg font-mono font-bold text-cyan-400">
                            DP[i] = DP[i-1] + DP[i-2]
                        </div>
                    </div>

                    {/* Current Calculation */}
                    {currentStep.formula && (
                        <motion.div
                            className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4"
                            key={currentStep.formula}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Current</div>
                            <div className="text-base font-mono font-bold text-white">{currentStep.formula}</div>
                        </motion.div>
                    )}

                    {/* Total Ways */}
                    <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 rounded-2xl p-4">
                        <div className="text-xs font-medium text-green-300/80 uppercase tracking-wider mb-1">Total Ways</div>
                        <div className="text-3xl font-black text-green-400">{currentStep.totalWays}</div>
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
                    {/* Timeline Scrubber */}
                    <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[120px] xl:min-w-[180px] px-2 py-1.5">
                        <input
                            type="range"
                            min="0"
                            max={Math.max(0, steps.length - 1)}
                            value={currentStepIndex}
                            onChange={handleScrub}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-green-500"
                        />
                        <span className="text-[10px] sm:text-[11px] xl:text-[12px] text-white font-medium translate-y-1">
                            {currentStepIndex + 1}/{steps.length}
                        </span>
                    </div>

                    <div className="w-px h-8 bg-white/10 flex-shrink-0" />

                    {/* Playback Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                            onClick={handleStepBack}
                            disabled={currentStepIndex <= 0}
                            className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                            onClick={handlePlayPause}
                            className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer"
                        >
                            {playing ? <Pause size={18} className="text-white sm:w-5 sm:h-5" /> : <Play size={18} className="text-white sm:w-5 sm:h-5" />}
                        </button>
                        <button
                            onClick={handleStepForward}
                            disabled={currentStepIndex >= steps.length - 1}
                            className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            <SkipForward size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                            onClick={handleReset}
                            className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                        >
                            <RotateCcw size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10 flex-shrink-0" />

                    {/* Speed Slider */}
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
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

                    <div className="hidden sm:block w-px h-8 bg-white/10 flex-shrink-0" />

                    {/* Stairs Size - Custom Dropdown */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <span className="text-[10px] sm:text-xs font-bold text-white/60">n:</span>
                        <button
                            ref={sizeButtonRef}
                            onClick={() => {
                                if (sizeButtonRef.current) {
                                    const rect = sizeButtonRef.current.getBoundingClientRect();
                                    setDropdownPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
                                }
                                setShowSizeDropdown(!showSizeDropdown);
                            }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-xs sm:text-sm font-bold hover:border-green-500/50 transition-colors cursor-pointer flex items-center gap-2"
                        >
                            <span>{n}</span>
                            <svg className={`w-3 h-3 transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 8l4 4 4-4" />
                            </svg>
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10 flex-shrink-0" />

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

            {/* Size Dropdown - Rendered outside control bar to avoid overflow clipping */}
            <AnimatePresence>
                {showSizeDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bg-slate-900 border border-white/20 rounded-xl overflow-hidden shadow-xl z-[200] w-16"
                        style={{ bottom: dropdownPosition.bottom, left: dropdownPosition.left }}
                        data-dropdown="size"
                    >
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(size => (
                            <button
                                key={size}
                                onClick={() => {
                                    setN(size);
                                    setShowSizeDropdown(false);
                                }}
                                className={`w-full px-4 py-2 text-sm font-bold text-left hover:bg-green-500/20 transition-colors cursor-pointer ${size === n ? 'bg-green-500/30 text-green-400' : 'text-white/80'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClimbingStairs;

