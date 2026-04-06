import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipForward, SkipBack, RotateCcw,
    ArrowLeft, Zap, Settings, X, Code2, WrapText,
    HelpCircle, Network, TreeDeciduous, Target, TrendingUp,
    Shuffle, Grid, Circle, RefreshCw, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { kruskalMST as kruskalMSTCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// GRAPH GENERATORS
// ============================================================================

const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
    '#84cc16', '#10b981', '#0ea5e9', '#6366f1', '#d946ef'
];

const generateRandomGraph = (nodeCount = 6) => {
    const nodes = [];
    const edges = [];
    // Use viewBox coordinates (600x500) - centered at 300,250
    const centerX = 300;
    const centerY = 250;
    const radius = 150;

    // Place nodes in a rough circle with some randomness
    for (let i = 0; i < nodeCount; i++) {
        const angle = (2 * Math.PI * i) / nodeCount + (Math.random() - 0.5) * 0.3;
        const r = radius * (0.8 + Math.random() * 0.2);
        nodes.push({
            id: i,
            label: String.fromCharCode(65 + i),
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle),
            color: COLORS[i % COLORS.length]
        });
    }

    // Generate edges (ensure connected)
    const connected = new Set([0]);
    for (let i = 1; i < nodeCount; i++) {
        const from = Array.from(connected)[Math.floor(Math.random() * connected.size)];
        const weight = Math.floor(Math.random() * 15) + 1;
        edges.push({ from, to: i, weight, id: `${from}-${i}` });
        connected.add(i);
    }

    // Add some extra edges
    const extraEdges = Math.floor(nodeCount * 0.5);
    for (let i = 0; i < extraEdges; i++) {
        const from = Math.floor(Math.random() * nodeCount);
        let to = Math.floor(Math.random() * nodeCount);
        while (to === from || edges.some(e =>
            (e.from === from && e.to === to) || (e.from === to && e.to === from)
        )) {
            to = Math.floor(Math.random() * nodeCount);
        }
        const weight = Math.floor(Math.random() * 15) + 1;
        edges.push({ from, to, weight, id: `${from}-${to}` });
    }

    return { nodes, edges };
};

const generateGridGraph = (cols = 3, rows = 2) => {
    const nodes = [];
    const edges = [];
    // Center the grid in viewBox (600x500)
    const gapX = 120;
    const gapY = 100;
    const totalWidth = (cols - 1) * gapX;
    const totalHeight = (rows - 1) * gapY;
    const startX = (600 - totalWidth) / 2;
    const startY = (500 - totalHeight) / 2;

    let id = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            nodes.push({
                id,
                label: String.fromCharCode(65 + id),
                x: startX + c * gapX,
                y: startY + r * gapY,
                color: COLORS[id % COLORS.length]
            });
            id++;
        }
    }

    // Horizontal edges
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
            const from = r * cols + c;
            const to = r * cols + c + 1;
            edges.push({ from, to, weight: Math.floor(Math.random() * 10) + 1, id: `${from}-${to}` });
        }
    }

    // Vertical edges
    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols; c++) {
            const from = r * cols + c;
            const to = (r + 1) * cols + c;
            edges.push({ from, to, weight: Math.floor(Math.random() * 10) + 1, id: `${from}-${to}` });
        }
    }

    return { nodes, edges };
};

const generateCircularGraph = (nodeCount = 6) => {
    const nodes = [];
    const edges = [];
    // Use viewBox coordinates (600x500) - centered at 300,250
    const centerX = 300;
    const centerY = 250;
    const radius = 150;

    for (let i = 0; i < nodeCount; i++) {
        const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
        nodes.push({
            id: i,
            label: String.fromCharCode(65 + i),
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            color: COLORS[i % COLORS.length]
        });
    }

    // Ring edges
    for (let i = 0; i < nodeCount; i++) {
        edges.push({
            from: i,
            to: (i + 1) % nodeCount,
            weight: Math.floor(Math.random() * 10) + 1,
            id: `${i}-${(i + 1) % nodeCount}`
        });
    }

    // Some cross edges
    for (let i = 0; i < Math.floor(nodeCount / 2); i++) {
        const from = i;
        const to = (i + Math.floor(nodeCount / 2)) % nodeCount;
        edges.push({ from, to, weight: Math.floor(Math.random() * 15) + 1, id: `${from}-${to}` });
    }

    return { nodes, edges };
};

// ============================================================================
// KRUSKAL STEP GENERATOR
// ============================================================================

const generateKruskalSteps = (nodes, edges) => {
    const steps = [];

    if (nodes.length === 0) {
        return [{ type: 'empty', description: 'Generate a graph to start' }];
    }

    const getCodeLine = (phase) => {
        switch (phase) {
            case 'init': return 1;
            case 'sorting': return 3;
            case 'scanning': return 6;
            case 'find': return 8;
            case 'cycle': return 10;
            case 'union': return 12;
            case 'complete': return 15;
            default: return 1;
        }
    };

    // DSU implementation
    const parent = {};
    const rank = {};
    const setColor = {};

    nodes.forEach(n => {
        parent[n.id] = n.id;
        rank[n.id] = 0;
        setColor[n.id] = n.color;
    });

    const find = (x) => {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    };

    const union = (x, y) => {
        const px = find(x);
        const py = find(y);
        if (px === py) return false;

        if (rank[px] < rank[py]) {
            parent[px] = py;
            // Merge colors - y's set absorbs x's
            const colorToChange = setColor[px];
            const newColor = setColor[py];
            Object.keys(setColor).forEach(k => {
                if (setColor[k] === colorToChange) setColor[k] = newColor;
            });
        } else if (rank[px] > rank[py]) {
            parent[py] = px;
            const colorToChange = setColor[py];
            const newColor = setColor[px];
            Object.keys(setColor).forEach(k => {
                if (setColor[k] === colorToChange) setColor[k] = newColor;
            });
        } else {
            parent[py] = px;
            rank[px]++;
            const colorToChange = setColor[py];
            const newColor = setColor[px];
            Object.keys(setColor).forEach(k => {
                if (setColor[k] === colorToChange) setColor[k] = newColor;
            });
        }
        return true;
    };

    // Sort edges
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

    // Initial step
    steps.push({
        type: 'init',
        description: `Initialize: ${nodes.length} nodes, each in its own set (unique color)`,
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e, status: 'pending' })),
        sortedEdges: sortedEdges.map(e => ({ ...e, status: 'pending' })),
        mstEdges: [],
        nodeColors: { ...setColor },
        currentEdgeIndex: -1,
        components: nodes.length,
        totalCost: 0,
        codeLine: getCodeLine('init')
    });

    // Sorting step
    steps.push({
        type: 'sorting',
        description: `Sorted ${edges.length} edges by weight (ascending)`,
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e, status: 'pending' })),
        sortedEdges: sortedEdges.map(e => ({ ...e, status: 'pending' })),
        mstEdges: [],
        nodeColors: { ...setColor },
        currentEdgeIndex: -1,
        components: nodes.length,
        totalCost: 0,
        codeLine: getCodeLine('sorting')
    });

    // Process edges
    const mstEdges = [];
    let totalCost = 0;
    let components = nodes.length;

    for (let i = 0; i < sortedEdges.length; i++) {
        const edge = sortedEdges[i];

        // Scanning step
        steps.push({
            type: 'scanning',
            description: `Checking edge ${nodes[edge.from].label}-${nodes[edge.to].label} (weight: ${edge.weight})`,
            nodes: nodes.map(n => ({ ...n })),
            edges: edges.map(e => ({
                ...e,
                status: mstEdges.some(m => m.id === e.id) ? 'mst' :
                    e.id === edge.id ? 'scanning' : 'pending'
            })),
            sortedEdges: sortedEdges.map((e, idx) => ({
                ...e,
                status: mstEdges.some(m => m.id === e.id) ? 'mst' :
                    idx < i ? 'rejected' :
                        idx === i ? 'scanning' : 'pending'
            })),
            mstEdges: [...mstEdges],
            nodeColors: { ...setColor },
            currentEdgeIndex: i,
            components,
            totalCost,
            codeLine: getCodeLine('scanning')
        });

        const rootFrom = find(edge.from);
        const rootTo = find(edge.to);

        if (rootFrom === rootTo) {
            // Cycle detected
            steps.push({
                type: 'cycle',
                description: `❌ Cycle! ${nodes[edge.from].label} and ${nodes[edge.to].label} are already connected (same color)`,
                nodes: nodes.map(n => ({ ...n })),
                edges: edges.map(e => ({
                    ...e,
                    status: mstEdges.some(m => m.id === e.id) ? 'mst' :
                        e.id === edge.id ? 'cycle' : 'pending'
                })),
                sortedEdges: sortedEdges.map((e, idx) => ({
                    ...e,
                    status: mstEdges.some(m => m.id === e.id) ? 'mst' :
                        idx <= i ? 'rejected' : 'pending'
                })),
                mstEdges: [...mstEdges],
                nodeColors: { ...setColor },
                currentEdgeIndex: i,
                components,
                totalCost,
                codeLine: getCodeLine('cycle')
            });
        } else {
            // Union sets
            union(edge.from, edge.to);
            mstEdges.push(edge);
            totalCost += edge.weight;
            components--;

            steps.push({
                type: 'union',
                description: `✓ Merged! ${nodes[edge.from].label}-${nodes[edge.to].label} added (Cost: +${edge.weight})`,
                nodes: nodes.map(n => ({ ...n })),
                edges: edges.map(e => ({
                    ...e,
                    status: mstEdges.some(m => m.id === e.id) ? 'mst' : 'pending'
                })),
                sortedEdges: sortedEdges.map((e, idx) => ({
                    ...e,
                    status: mstEdges.some(m => m.id === e.id) ? 'mst' :
                        idx < i ? 'rejected' : 'pending'
                })),
                mstEdges: [...mstEdges],
                nodeColors: { ...setColor },
                currentEdgeIndex: i,
                components,
                totalCost,
                codeLine: getCodeLine('union'),
                mergedNodes: [edge.from, edge.to]
            });

            // Check if MST complete
            if (mstEdges.length === nodes.length - 1) {
                break;
            }
        }
    }

    // Complete step
    steps.push({
        type: 'complete',
        description: `🎉 MST Complete! Total Cost: ${totalCost} (${mstEdges.length} edges)`,
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({
            ...e,
            status: mstEdges.some(m => m.id === e.id) ? 'mst' : 'rejected'
        })),
        sortedEdges: sortedEdges.map(e => ({
            ...e,
            status: mstEdges.some(m => m.id === e.id) ? 'mst' : 'rejected'
        })),
        mstEdges: [...mstEdges],
        nodeColors: { ...setColor },
        currentEdgeIndex: -1,
        components: 1,
        totalCost,
        codeLine: getCodeLine('complete')
    });

    return steps;
};

// ============================================================================
// CODE PANEL COMPONENT
// ============================================================================

const CodePanel = ({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }) => {
    const [language, setLanguage] = useState("cpp");
    const [wrap, setWrap] = useState(false);
    const panelRef = useRef(null);

    const labels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
    const lines = (kruskalMSTCode[language] || "").split('\n');

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
                    <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-emerald-500/50 transition-colors" />

                    <div className="p-4 border-b border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                                    <Code2 size={16} className="text-white" />
                                </div>
                                <h3 className="font-bold text-white">Kruskal's MST</h3>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                                <X size={18} className="text-white/70" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
                            >
                                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
                            </select>
                            <button
                                onClick={() => setWrap(!wrap)}
                                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
                            >
                                <WrapText size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
                        {lines.map((line, i) => (
                            <motion.div
                                key={i}
                                animate={i + 1 === activeLine ? { backgroundColor: "rgba(16,185,129,0.2)" } : { backgroundColor: "transparent" }}
                                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-emerald-400" : ""}`}
                            >
                                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-emerald-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-emerald-100" : "text-white/70"}`}>{line || " "}</pre>
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

const KruskalMST = () => {
    const navigate = useNavigate();

    // Graph state
    const [graphType, setGraphType] = useState('random');
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    // Visualization state
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(2);

    // UI state
    const [showCode, setShowCode] = useState(false);
    const [panelWidth, setPanelWidth] = useState(450);
    const [showSettings, setShowSettings] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showEdgeList, setShowEdgeList] = useState(false); // Mobile toggle
    const [showLeftPanel, setShowLeftPanel] = useState(false); // Desktop panel visibility
    const [draggingNode, setDraggingNode] = useState(null); // Drag state
    // Canvas panning
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);
    const settingsRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ bottom: 0, left: 0 });

    // Generate graph
    const generateGraph = useCallback((type = graphType) => {
        let graph;
        switch (type) {
            case 'grid':
                graph = generateGridGraph(3, 2);
                break;
            case 'circular':
                graph = generateCircularGraph(6);
                break;
            default:
                graph = generateRandomGraph(6);
        }
        setNodes(graph.nodes);
        setEdges(graph.edges);
        const allSteps = generateKruskalSteps(graph.nodes, graph.edges);
        setSteps(allSteps);
        setCurrentStepIndex(0);
        setPlaying(false);
    }, [graphType]);

    useEffect(() => { generateGraph(); }, []);

    // Current step
    const currentStep = steps[currentStepIndex] || {
        nodes: [],
        edges: [],
        sortedEdges: [],
        mstEdges: [],
        nodeColors: {},
        components: nodes.length,
        totalCost: 0,
        description: 'Generate a graph to start',
        codeLine: 1
    };

    // Auto-play
    useEffect(() => {
        if (!playing || currentStepIndex >= steps.length - 1) {
            if (playing && currentStepIndex >= steps.length - 1) setPlaying(false);
            return;
        }
        const delay = Math.max(100, 800 / speed);
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
    const handleNewGraph = () => { generateGraph(graphType); setShowSettings(false); };

    const handleGraphTypeChange = (type) => {
        setGraphType(type);
        generateGraph(type);
        setShowSettings(false);
    };

    // Node dragging handlers
    const handleNodeMouseDown = (e, nodeId) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingNode(nodeId);
        setPlaying(false);
    };

    const handleMouseMove = (e) => {
        // Canvas panning
        if (isPanning && svgRef.current) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            const svg = svgRef.current;
            const rect = svg.getBoundingClientRect();
            const scaleX = 600 / rect.width;
            const scaleY = 500 / rect.height;
            setPanOffset(prev => ({
                x: Math.max(-200, Math.min(200, prev.x - dx * scaleX)),
                y: Math.max(-200, Math.min(200, prev.y - dy * scaleY))
            }));
            setPanStart({ x: e.clientX, y: e.clientY });
            return;
        }
        // Node dragging
        if (draggingNode === null || !svgRef.current) return;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: Math.max(30, Math.min(570, svgP.x)), y: Math.max(30, Math.min(470, svgP.y)) } : n));
    };

    const handleMouseUp = () => { setDraggingNode(null); setIsPanning(false); };

    // Canvas panning start
    const handleCanvasMouseDown = (e) => {
        if (e.target === svgRef.current) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    // Reset pan
    const resetPan = () => setPanOffset({ x: 0, y: 0 });

    // Touch handlers for mobile
    const handleTouchStart = (e, nodeId) => {
        e.preventDefault();
        setDraggingNode(nodeId);
        setPlaying(false);
    };

    const handleTouchMove = (e) => {
        if (draggingNode === null || !svgRef.current) return;
        const touch = e.touches[0];
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = touch.clientX;
        pt.y = touch.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: Math.max(30, Math.min(570, svgP.x)), y: Math.max(30, Math.min(470, svgP.y)) } : n));
    };

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
                <div className="absolute inset-0 flex flex-col xl:flex-row pt-28 sm:pt-32 xl:pt-40 pb-28 sm:pb-32">

                    {/* MOBILE/TABLET: LEGEND */}
                    <div className="xl:hidden flex justify-center flex-wrap gap-2 sm:gap-4 mt-2 mb-2 flex-shrink-0">
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
                            <span className="text-[9px] sm:text-xs text-white/60">MST</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                            <span className="text-[9px] sm:text-xs text-white/60">Cycle</span>
                        </div>
                    </div>

                    {/* GRAPH CANVAS */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <svg
                            ref={svgRef}
                            viewBox={`${panOffset.x} ${panOffset.y} 600 500`}
                            className="w-full h-full cursor-grab active:cursor-grabbing"
                            preserveAspectRatio="xMidYMid meet"
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                        >
                            {/* Edges */}
                            {currentStep.edges?.map((edge) => {
                                const fromNode = nodes.find(n => n.id === edge.from);
                                const toNode = nodes.find(n => n.id === edge.to);
                                if (!fromNode || !toNode) return null;

                                let strokeColor = 'rgba(255,255,255,0.2)';
                                let strokeWidth = 2;
                                let strokeDasharray = '';
                                let animate = false;

                                if (edge.status === 'mst') {
                                    strokeColor = '#22c55e';
                                    strokeWidth = 4;
                                } else if (edge.status === 'scanning') {
                                    strokeColor = '#eab308';
                                    strokeWidth = 3;
                                    animate = true;
                                } else if (edge.status === 'cycle') {
                                    strokeColor = '#ef4444';
                                    strokeWidth = 3;
                                    strokeDasharray = '8,4';
                                }

                                const midX = (fromNode.x + toNode.x) / 2;
                                const midY = (fromNode.y + toNode.y) / 2;

                                return (
                                    <g key={edge.id}>
                                        <motion.line
                                            x1={fromNode.x}
                                            y1={fromNode.y}
                                            x2={toNode.x}
                                            y2={toNode.y}
                                            stroke={strokeColor}
                                            strokeWidth={strokeWidth}
                                            strokeDasharray={strokeDasharray}
                                            initial={false}
                                            animate={animate ? { opacity: [1, 0.5, 1] } : {}}
                                            transition={animate ? { repeat: Infinity, duration: 0.5 } : {}}
                                        />
                                        <rect
                                            x={midX - 12}
                                            y={midY - 10}
                                            width={24}
                                            height={20}
                                            rx={4}
                                            fill={edge.status === 'mst' ? '#22c55e' : 'rgba(0,0,0,0.7)'}
                                        />
                                        <text
                                            x={midX}
                                            y={midY + 5}
                                            textAnchor="middle"
                                            className="text-xs font-bold fill-white"
                                        >
                                            {edge.weight}
                                        </text>
                                    </g>
                                );
                            })}


                            {/* Nodes */}
                            {nodes.map((node) => {
                                const isMerging = currentStep.mergedNodes?.includes(node.id);
                                // Check if node is connected to MST (has at least one MST edge)
                                const isInMST = currentStep.edges?.some(e =>
                                    e.status === 'mst' && (e.from === node.id || e.to === node.id)
                                );

                                let fillColor = 'rgba(50,50,60,0.8)';
                                let strokeColor = 'rgba(255,255,255,0.3)';

                                if (isInMST) {
                                    fillColor = '#06b6d4'; // Cyan to match PrimMST
                                    strokeColor = '#ffffff';
                                }

                                return (
                                    <g
                                        key={node.id}
                                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                        onTouchStart={(e) => handleTouchStart(e, node.id)}
                                        style={{ cursor: 'grab' }}
                                    >
                                        <motion.circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={24}
                                            fill={fillColor}
                                            stroke={strokeColor}
                                            strokeWidth={2}
                                            initial={false}
                                            animate={isMerging ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        <text
                                            x={node.x}
                                            y={node.y + 5}
                                            textAnchor="middle"
                                            className="text-sm font-bold fill-white"
                                        >
                                            {node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Reset View button */}
                        {(panOffset.x !== 0 || panOffset.y !== 0) && (
                            <button
                                onClick={resetPan}
                                className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-emerald-500/80 text-white text-xs font-medium hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
                            >
                                <RotateCcw size={12} />
                                Reset View
                            </button>
                        )}
                    </div>

                    {/* MOBILE TOGGLE BUTTON for Edge List */}
                    <button
                        onClick={() => setShowEdgeList(true)}
                        className="xl:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40 p-2 rounded-l-xl bg-emerald-500 text-white shadow-lg"
                    >
                        <Menu size={20} />
                    </button>

                    {/* DESKTOP: Show panel button when hidden */}
                    {!showLeftPanel && (
                        <button
                            onClick={() => setShowLeftPanel(true)}
                            className="hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-xl bg-emerald-500 text-white shadow-lg items-center gap-1.5 text-xs"
                        >
                            <Menu size={16} />
                            Edges
                        </button>
                    )}

                    {/* BACKDROP for click-outside-to-close */}
                    {showEdgeList && (
                        <div
                            className="xl:hidden fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowEdgeList(false)}
                        />
                    )}

                    {/* EDGE LIST PANEL - Canvas height only */}
                    <div className={`${showEdgeList ? 'fixed top-28 bottom-28 right-0 z-50' : 'hidden'} ${showLeftPanel ? 'xl:relative xl:block' : 'xl:hidden'} w-64 xl:w-64 backdrop-blur-xl bg-black/90 xl:bg-black/40 border-l border-white/10 overflow-hidden rounded-l-xl xl:rounded-none flex flex-col`}>
                        {/* Panel Header with close button */}
                        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/50">
                            <div className="text-lg text-white/70 flex items-center gap-2">
                                <TreeDeciduous size={20} />
                                Sorted Edges
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setShowLeftPanel(false)} className="hidden xl:block p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20" title="Hide panel">
                                    <X size={14} />
                                </button>
                                <button onClick={() => setShowEdgeList(false)} className="xl:hidden p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                            {currentStep.sortedEdges?.map((edge, idx) => {
                                let bgColor = 'bg-slate-800/50';
                                let borderColor = 'border-white/10';
                                let textColor = 'text-white/70';

                                if (edge.status === 'mst') {
                                    bgColor = 'bg-green-500/20';
                                    borderColor = 'border-green-500/50';
                                    textColor = 'text-green-400';
                                } else if (edge.status === 'scanning') {
                                    bgColor = 'bg-yellow-500/20';
                                    borderColor = 'border-yellow-500/50';
                                    textColor = 'text-yellow-400';
                                } else if (edge.status === 'rejected') {
                                    bgColor = 'bg-slate-900/50';
                                    borderColor = 'border-white/5';
                                    textColor = 'text-white/30 line-through';
                                }

                                return (
                                    <motion.div
                                        key={edge.id}
                                        initial={false}
                                        animate={currentStep.currentEdgeIndex === idx ? { scale: 1.02 } : { scale: 1 }}
                                        className={`px-3 py-2 rounded-lg border ${bgColor} ${borderColor}`}
                                    >
                                        <div className={`text-sm font-medium ${textColor}`}>
                                            {nodes[edge.from]?.label} — {nodes[edge.to]?.label}
                                        </div>
                                        <div className={`text-xs ${textColor}`}>
                                            Weight: {edge.weight}
                                        </div>
                                        {edge.status === 'mst' && (
                                            <span className="text-[10px] text-green-400">✓ In MST</span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
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
                        <h1 className="text-xl font-black text-white">Kruskal's MST</h1>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">Greedy</span>
                    </div>
                    <p className="text-xs text-white/50 mb-2">Minimum Spanning Tree via Union-Find</p>
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
                            <h1 className="text-sm sm:text-base font-bold text-white">Kruskal's MST</h1>
                            <div className="flex items-center gap-1.5">
                                <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400">Cost: {currentStep.totalCost || 0}</span>
                                </div>
                                <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30">
                                    <span className="text-[10px] sm:text-xs font-bold text-amber-400">Islands: {currentStep.components || nodes.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* DESKTOP: Connectivity HUD */}
                <motion.div
                    className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
                    initial={{ right: 20 }}
                    animate={{ right: showCode ? panelWidth + 50 : 90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl px-4 py-2 space-y-3">
                        <div>
                            <div className="text-xs text-white/50 flex items-center gap-2">
                                <TrendingUp size={12} />
                                Total Cost
                            </div>
                            <div className="text-2xl font-black text-emerald-400">{currentStep.totalCost || 0}</div>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <div className="text-xs text-amber-400 flex items-center gap-1">
                                    <Network size={10} />
                                    Islands
                                </div>
                                <div className="text-lg font-bold text-amber-400">{currentStep.components || nodes.length}</div>
                            </div>
                            <div>
                                <div className="text-xs text-white/50">MST Edges</div>
                                <div className="text-lg font-bold text-white/60">{currentStep.mstEdges?.length || 0}/{nodes.length - 1}</div>
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
                        <span className="text-xs font-semibold text-white/80">In MST</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-xs font-semibold text-white/80">Cycle</span>
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
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-emerald-500"
                        />
                        <span className="text-[10px] sm:text-xs text-white font-medium">{currentStepIndex + 1}/{steps.length}</span>
                    </div>

                    <div className="w-px h-8 bg-white/10 flex-shrink-0" />

                    {/* Playback */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
                            <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer">
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
                        <Zap size={12} className="text-emerald-400 sm:w-3.5 sm:h-3.5" />
                        <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.5"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-emerald-500"
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
                        className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
                    >
                        <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>

                    {/* Code Toggle */}
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                         w-[85vw] sm:w-64 
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         bottom-[120px] sm:bottom-auto"
                            style={{
                                ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { bottom: dropdownPos.bottom, left: dropdownPos.left } : {})
                            }}
                            data-dropdown="settings"
                        >
                            <div className="space-y-4">
                                {/* Graph Type */}
                                <div>
                                    <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Graph Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { type: 'random', icon: Shuffle, label: 'Random' },
                                            { type: 'grid', icon: Grid, label: 'Grid' },
                                            { type: 'circular', icon: Circle, label: 'Circle' }
                                        ].map(({ type, icon: Icon, label }) => (
                                            <button
                                                key={type}
                                                onClick={() => handleGraphTypeChange(type)}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${graphType === type
                                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                    }`}
                                            >
                                                <Icon size={16} />
                                                <span className="text-[10px]">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* New Graph Button */}
                                <button
                                    onClick={handleNewGraph}
                                    className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={14} />
                                    New Graph
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* HELP BUTTON */}
            <button
                onClick={() => setShowHelp(true)}
                className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-lg"
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
                                <h2 className="text-lg sm:text-xl font-bold text-white">Kruskal's MST</h2>
                                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                                    <X size={20} className="text-white/60" />
                                </button>
                            </div>

                            <div className="space-y-4 text-sm text-white/80">
                                <div>
                                    <h3 className="font-bold text-emerald-400 mb-1">🎯 Goal</h3>
                                    <p>Connect all nodes with minimum total edge weight (MST).</p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-emerald-400 mb-1">📝 Greedy Strategy</h3>
                                    <div className="bg-black/40 rounded-lg p-3 font-mono text-xs sm:text-sm">
                                        1. Sort edges by weight<br />
                                        2. Pick cheapest edge<br />
                                        3. If cycle → Skip<br />
                                        4. Else → Add to MST
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-emerald-400 mb-1">🌳 Visual States</h3>
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
                                            <span>In MST ✓</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-red-500" />
                                            <span>Cycle ✗</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                                    <h3 className="font-bold text-emerald-400 mb-1">💡 Color = Set</h3>
                                    <p className="text-xs">Nodes with the same color are in the same connected component. When edges merge sets, colors ripple through!</p>
                                </div>

                                <div className="text-xs text-white/50">
                                    Time: O(E log E) | Space: O(V)
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COMMENTARY */}
            <motion.div
                className="fixed bottom-24 sm:bottom-32 z-40 backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-2xl p-3 sm:p-4 max-w-md"
                initial={{ left: 'calc(50%)', x: '-50%' }}
                animate={{
                    left: `calc(50% - ${showCode ? panelWidth / 2 : 0}px)`,
                    x: '-50%'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                key={currentStepIndex}
            >
                <p className="text-white/90 text-center text-sm sm:text-base font-medium">{currentStep.description}</p>
            </motion.div>
        </div>
    );
};

export default KruskalMST;