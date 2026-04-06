import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipForward, SkipBack, RotateCcw,
    ArrowLeft, Zap, Settings, X, Code2, WrapText,
    HelpCircle, Network, TreeDeciduous, Target, TrendingUp,
    Shuffle, Link, Search, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { unionFind as unionFindCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'
];

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const DEFAULT_PAN = { x: 0, y: -100 };

// ============================================================================
// UNION-FIND DATA STRUCTURE
// ============================================================================

class UnionFindDS {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = Array(n).fill(0);
        this.size = Array(n).fill(1);
    }

    find(x, withCompression = true) {
        const path = [];
        let current = x;
        while (this.parent[current] !== current) {
            path.push(current);
            current = this.parent[current];
        }
        const root = current;
        if (withCompression) {
            for (const node of path) {
                this.parent[node] = root;
            }
        }
        return { root, path };
    }

    union(x, y) {
        const { root: rootX } = this.find(x, false);
        const { root: rootY } = this.find(y, false);
        if (rootX === rootY) return { success: false, rootX, rootY };
        let newRoot, attached;
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
            this.size[rootY] += this.size[rootX];
            newRoot = rootY; attached = rootX;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
            this.size[rootX] += this.size[rootY];
            newRoot = rootX; attached = rootY;
        } else {
            this.parent[rootY] = rootX;
            this.size[rootX] += this.size[rootY];
            this.rank[rootX]++;
            newRoot = rootX; attached = rootY;
        }
        return { success: true, rootX, rootY, newRoot, attached };
    }

    getNumSets() {
        let count = 0;
        for (let i = 0; i < this.parent.length; i++) {
            if (this.parent[i] === i) count++;
        }
        return count;
    }

    getLargestSetSize() {
        let maxSize = 0;
        for (let i = 0; i < this.parent.length; i++) {
            if (this.parent[i] === i) {
                maxSize = Math.max(maxSize, this.size[i]);
            }
        }
        return maxSize;
    }

    clone() {
        const newUF = new UnionFindDS(this.parent.length);
        newUF.parent = [...this.parent];
        newUF.rank = [...this.rank];
        newUF.size = [...this.size];
        return newUF;
    }
}

// ============================================================================
// STEP GENERATOR
// ============================================================================

const generateSteps = (n, mode = 'random') => {
    const uf = new UnionFindDS(n);
    const steps = [];

    // Initial step
    steps.push({
        type: 'init',
        description: `Initialize ${n} elements, each in its own set`,
        parent: [...uf.parent],
        rank: [...uf.rank],
        numSets: n,
        largestSize: 1,
        highlightPath: [],
        animatingNodes: [],
        codeLine: 1
    });

    // Generate operations
    let operations = [];
    if (mode === 'demo' && n === 8) {
        operations = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [4, 6], [0, 4]];
    } else {
        // Random operations
        const possibleOps = [];
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                possibleOps.push([i, j]);
            }
        }
        // Shuffle and pick subset
        for (let i = possibleOps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleOps[i], possibleOps[j]] = [possibleOps[j], possibleOps[i]];
        }
        operations = possibleOps.slice(0, Math.min(possibleOps.length, Math.floor(n * 1.5)));
    }

    for (const [x, y] of operations) {
        if (x >= n || y >= n) continue;

        // Find roots
        const { root: rootX, path: pathX } = uf.find(x, false);
        const { root: rootY, path: pathY } = uf.find(y, false);

        steps.push({
            type: 'find',
            description: `Find roots: Find(${x}) = ${rootX}, Find(${y}) = ${rootY}`,
            parent: [...uf.parent],
            rank: [...uf.rank],
            numSets: uf.getNumSets(),
            largestSize: uf.getLargestSetSize(),
            highlightPath: [...pathX, rootX, rootY, ...pathY.reverse()],
            animatingNodes: [],
            codeLine: 3
        });

        if (rootX === rootY) {
            steps.push({
                type: 'same_set',
                description: `${x} and ${y} are already in the same set (root = ${rootX})`,
                parent: [...uf.parent],
                rank: [...uf.rank],
                numSets: uf.getNumSets(),
                largestSize: uf.getLargestSetSize(),
                highlightPath: [x, rootX, y],
                animatingNodes: [],
                codeLine: 10
            });
        } else {
            const result = uf.union(x, y);

            steps.push({
                type: 'union',
                description: `Union(${x}, ${y}): Attach ${result.attached} under ${result.newRoot}`,
                parent: [...uf.parent],
                rank: [...uf.rank],
                numSets: uf.getNumSets(),
                largestSize: uf.getLargestSetSize(),
                highlightPath: [],
                animatingNodes: [result.attached],
                codeLine: 12
            });
        }
    }

    // Demo find with path compression
    if (n >= 7) {
        const { root, path } = uf.find(7, false);
        steps.push({
            type: 'find_path',
            description: `Find(7): Tracing path to root ${root}`,
            parent: [...uf.parent],
            rank: [...uf.rank],
            numSets: uf.getNumSets(),
            largestSize: uf.getLargestSetSize(),
            highlightPath: [7, ...path.reverse()],
            animatingNodes: [],
            codeLine: 5
        });

        uf.find(7, true); // Actually compress

        steps.push({
            type: 'compress',
            description: `Path Compression: All nodes now point directly to root ${root}`,
            parent: [...uf.parent],
            rank: [...uf.rank],
            numSets: uf.getNumSets(),
            largestSize: uf.getLargestSetSize(),
            highlightPath: [],
            animatingNodes: path,
            codeLine: 6
        });
    }

    steps.push({
        type: 'complete',
        description: 'Union-Find operations complete!',
        parent: [...uf.parent],
        rank: [...uf.rank],
        numSets: uf.getNumSets(),
        largestSize: uf.getLargestSetSize(),
        highlightPath: [],
        animatingNodes: [],
        codeLine: 15
    });

    return steps;
};

// ============================================================================
// LAYOUT HELPER
// ============================================================================

const calculateNodePositions = (parent, n) => {
    const positions = [];
    const nodesByRoot = {};

    // Group by root
    for (let i = 0; i < n; i++) {
        let root = i;
        while (parent[root] !== root) root = parent[root];
        if (!nodesByRoot[root]) nodesByRoot[root] = [];
        nodesByRoot[root].push(i);
    }

    const roots = Object.keys(nodesByRoot).map(Number);

    // Dynamic size calculation (matching the component logic)
    const baseSpacing = CANVAS_WIDTH / (n + 1);
    const nodeRadius = Math.max(16, Math.min(24, baseSpacing / 2 - 4));
    const nodeDiameter = nodeRadius * 2;
    const padding = 10; // Horizontal padding between nodes

    // Calculate required width for each tree
    const treeWidths = {};
    let totalWidth = 0;

    roots.forEach(root => {
        const setNodes = nodesByRoot[root];

        // Build hierarchy for this tree to find max width
        const children = {};
        for (let i = 0; i < n; i++) children[i] = [];
        for (const node of setNodes) {
            if (parent[node] !== node) children[parent[node]].push(node);
        }

        const levels = { [root]: 0 };
        const queue = [root];
        const nodesByLevel = {};
        let maxLevel = 0;

        while (queue.length > 0) {
            const curr = queue.shift();
            const level = levels[curr];
            if (!nodesByLevel[level]) nodesByLevel[level] = [];
            nodesByLevel[level].push(curr);
            maxLevel = Math.max(maxLevel, level);

            for (const child of children[curr]) {
                levels[child] = level + 1;
                queue.push(child);
            }
        }

        // Tree width is max nodes at any level * (diameter + padding)
        let maxNodesInLevel = 0;
        Object.values(nodesByLevel).forEach(nodes => {
            maxNodesInLevel = Math.max(maxNodesInLevel, nodes.length);
        });

        // Min width is the diameter (for single node)
        const width = Math.max(nodeDiameter + padding, maxNodesInLevel * (nodeDiameter + padding));
        treeWidths[root] = { width, nodesByLevel, maxLevel, levels };
        totalWidth += width;
    });

    // Start positioning
    // Center the whole group in canvas. If totalWidth > CANVAS_WIDTH, it starts negative (pan required)
    let currentX = (CANVAS_WIDTH - totalWidth) / 2;

    roots.forEach(root => {
        const { width, nodesByLevel, maxLevel } = treeWidths[root];
        const treeCenterX = currentX + width / 2;
        const levelHeight = 70;

        // Position nodes
        for (let level = 0; level <= maxLevel; level++) {
            const nodes = nodesByLevel[level] || [];
            if (nodes.length === 0) continue;

            const totalLevelWidth = nodes.length * (nodeDiameter + padding) - padding;
            const startLevelX = treeCenterX - totalLevelWidth / 2;

            nodes.forEach((node, idx) => {
                positions[node] = {
                    x: startLevelX + idx * (nodeDiameter + padding) + nodeRadius, // center of node
                    y: 50 + level * levelHeight
                };
            });
        }
        currentX += width;
    });

    return positions;
};

const getSetColor = (node, parent, colors) => {
    let root = node;
    while (parent[root] !== root) root = parent[root];
    return colors[root % colors.length];
};

// ============================================================================
// CODE PANEL COMPONENT
// ============================================================================

const CodePanel = React.forwardRef(({ isOpen, onClose, activeLine, panelWidth, setPanelWidth }, ref) => {
    const [language, setLanguage] = useState("cpp");
    const [wrap, setWrap] = useState(false);

    const labels = { cpp: "C++", python: "Python", javascript: "JavaScript" };
    const code = unionFindCode?.[language] || "// Code not available";
    const lines = code.split('\n');

    const handleResize = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = panelWidth;
        const move = (ev) => setPanelWidth(Math.max(350, Math.min(700, startW + startX - ev.clientX)));
        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={ref}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-full z-50 backdrop-blur-2xl bg-black/80 border-l border-white/10 flex flex-col shadow-2xl"
                    style={{ width: panelWidth }}
                >
                    <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-purple-500/50 transition-colors" />
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                                    <Code2 size={16} className="text-white" />
                                </div>
                                <h3 className="font-bold text-white">Union-Find</h3>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                                <X size={18} className="text-white/70" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500 focus:outline-none cursor-pointer">
                                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
                            </select>
                            <button onClick={() => setWrap(!wrap)} className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/70'}`}>
                                <WrapText size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                        {lines.map((line, i) => (
                            <motion.div key={i} animate={i + 1 === activeLine ? { backgroundColor: "rgba(168,85,247,0.2)" } : { backgroundColor: "transparent" }} className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-purple-400" : ""}`}>
                                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-purple-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-purple-100" : "text-white/70"}`}>{line || " "}</pre>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
CodePanel.displayName = 'CodePanel';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UnionFind = () => {
    const navigate = useNavigate();
    const svgRef = useRef(null);

    // Configuration
    const [nodeCount, setNodeCount] = useState(8);
    const [graphType, setGraphType] = useState('demo');

    // Visualization state
    const [steps, setSteps] = useState(() => generateSteps(8, 'demo'));
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    // Computed
    // Computed
    const currentStep = steps[currentStepIndex] || steps[0];
    const positions = calculateNodePositions(currentStep.parent, nodeCount);
    const nodeColors = currentStep.parent.map((_, i) => getSetColor(i, currentStep.parent, COLORS));

    // Dynamic node sizing
    const spacing = 600 / (nodeCount + 1);
    const nodeRadius = Math.max(16, Math.min(24, spacing / 2 - 4));

    // UI state
    const [showCode, setShowCode] = useState(false);
    const [panelWidth, setPanelWidth] = useState(450);
    const [showSettings, setShowSettings] = useState(false);
    const [showParentPanel, setShowParentPanel] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false); // Desktop panel visibility
    const [showHelp, setShowHelp] = useState(false);
    const settingsRef = useRef(null);
    const dropdownRef = useRef(null); // Ref for settings dropdown
    const codeRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ bottom: 0, left: 0 });

    // Dragging nodes
    const [draggingNode, setDraggingNode] = useState(null);
    // Canvas panning
    const [panOffset, setPanOffset] = useState(DEFAULT_PAN);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [customPositions, setCustomPositions] = useState(null);

    // Playback
    useEffect(() => {
        if (!playing) return;
        const interval = setInterval(() => {
            setCurrentStepIndex(prev => {
                if (prev >= steps.length - 1) { setPlaying(false); return prev; }
                return prev + 1;
            });
        }, 1200 / speed);
        return () => clearInterval(interval);
    }, [playing, speed, steps.length]);

    // Click outside settings
    useEffect(() => {
        const handleClick = (e) => {
            if (showSettings &&
                settingsRef.current && !settingsRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowSettings(false);
            }
            // Close code panel if clicked outside
            if (showCode && codeRef.current && !codeRef.current.contains(e.target) && !e.target.closest('[data-control-bar]')) {
                setShowCode(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showSettings, showCode]);

    // Handlers
    const handlePlayPause = () => setPlaying(!playing);
    const handleStepForward = () => currentStepIndex < steps.length - 1 && setCurrentStepIndex(i => i + 1);
    const handleStepBack = () => currentStepIndex > 0 && setCurrentStepIndex(i => i - 1);
    const handleReset = () => { setCurrentStepIndex(0); setPlaying(false); };
    const handleScrub = (e) => setCurrentStepIndex(parseInt(e.target.value));


    // Node dragging
    const handleNodeMouseDown = (e, nodeId) => { e.preventDefault(); setDraggingNode(nodeId); setPlaying(false); };
    const handleMouseMove = (e) => {
        // Canvas panning (when clicking on empty space)
        if (isPanning && svgRef.current) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            // Scale movement based on viewBox ratio
            const svg = svgRef.current;
            const rect = svg.getBoundingClientRect();
            const scaleX = CANVAS_WIDTH / rect.width;
            const scaleY = CANVAS_HEIGHT / rect.height;
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
        pt.x = e.clientX; pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        const newPos = [...(customPositions || positions)];
        newPos[draggingNode] = { x: Math.max(30, Math.min(570, svgP.x)), y: Math.max(30, Math.min(470, svgP.y)) };
        setCustomPositions(newPos);
    };
    const handleMouseUp = () => { setDraggingNode(null); setIsPanning(false); };
    // Start panning when clicking on empty canvas space
    const handleCanvasMouseDown = (e) => {
        if (e.target === svgRef.current) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };
    const handleTouchStart = (e, nodeId) => { e.preventDefault(); setDraggingNode(nodeId); setPlaying(false); };
    const handleTouchMove = (e) => {
        if (draggingNode === null || !svgRef.current) return;
        const touch = e.touches[0];
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = touch.clientX; pt.y = touch.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        const newPos = [...(customPositions || positions)];
        newPos[draggingNode] = { x: Math.max(30, Math.min(570, svgP.x)), y: Math.max(30, Math.min(470, svgP.y)) };
        setCustomPositions(newPos);
    };
    // Reset pan
    const resetPan = () => setPanOffset(DEFAULT_PAN);

    const displayPositions = customPositions || positions;

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
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white" />
                            <span className="text-[9px] sm:text-xs text-white/60">Root</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                            <span className="text-[9px] sm:text-xs text-white/60">Path</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-500" />
                            <span className="text-[9px] sm:text-xs text-white/60">Compressed</span>
                        </div>
                    </div>

                    {/* GRAPH CANVAS */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <svg
                            ref={svgRef}
                            viewBox={`${panOffset.x} ${panOffset.y} ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                            className="w-full h-full cursor-grab active:cursor-grabbing"
                            preserveAspectRatio="xMidYMid meet"
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                        >
                            {/* Edges (Child -> Parent) */}
                            {displayPositions.map((pos, i) => {
                                if (!pos || currentStep.parent[i] === i) return null;
                                const parentPos = displayPositions[currentStep.parent[i]];
                                if (!parentPos) return null;

                                const isHighlighted = currentStep.highlightPath?.includes(i);
                                const isAnimating = currentStep.animatingNodes?.includes(i);

                                // Arrow direction: child -> parent
                                const dx = parentPos.x - pos.x;
                                const dy = parentPos.y - pos.y;
                                const len = Math.sqrt(dx * dx + dy * dy);
                                const nx = dx / len; const ny = dy / len;
                                const x1 = pos.x + nx * nodeRadius;
                                const y1 = pos.y + ny * nodeRadius;
                                const x2 = parentPos.x - nx * nodeRadius;
                                const y2 = parentPos.y - ny * nodeRadius;

                                return (
                                    <g key={`edge-${i}`}>
                                        <motion.line
                                            x1={x1} y1={y1} x2={x2} y2={y2}
                                            stroke={isHighlighted ? '#eab308' : isAnimating ? '#06b6d4' : 'rgba(255,255,255,0.3)'}
                                            strokeWidth={isHighlighted ? 3 : 2}
                                            initial={false}
                                            animate={{ x1, y1, x2, y2 }}
                                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                                        />
                                        {/* Arrowhead */}
                                        <motion.polygon
                                            points="-6,-4 0,0 -6,4"
                                            fill={isHighlighted ? '#eab308' : 'rgba(255,255,255,0.5)'}
                                            initial={false}
                                            animate={{
                                                x: x2,
                                                y: y2,
                                                rotate: Math.atan2(dy, dx) * 180 / Math.PI
                                            }}
                                            style={{ transformOrigin: 'center' }}
                                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                                        />
                                    </g>
                                );
                            })}

                            {/* Nodes */}
                            {displayPositions.map((pos, i) => {
                                if (!pos) return null;

                                const isRoot = currentStep.parent[i] === i;
                                const isHighlighted = currentStep.highlightPath?.includes(i);
                                const isAnimating = currentStep.animatingNodes?.includes(i);

                                let fillColor = 'rgba(50,50,60,0.8)';
                                let strokeColor = 'rgba(255,255,255,0.3)';

                                // Color by set
                                fillColor = nodeColors[i];
                                strokeColor = isRoot ? '#ffffff' : 'rgba(255,255,255,0.5)';

                                return (
                                    <g
                                        key={`node-${i}`}
                                        onMouseDown={(e) => handleNodeMouseDown(e, i)}
                                        onTouchStart={(e) => handleTouchStart(e, i)}
                                        style={{ cursor: 'grab' }}
                                    >
                                        {/* Highlight glow */}
                                        {isHighlighted && (
                                            <motion.circle
                                                cx={pos.x} cy={pos.y} r={nodeRadius * 1.3}
                                                fill="none" stroke="#eab308" strokeWidth={3}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            />
                                        )}

                                        <motion.circle
                                            cx={pos.x} cy={pos.y} r={nodeRadius}
                                            fill={fillColor}
                                            stroke={strokeColor}
                                            strokeWidth={isRoot ? 3 : 2}
                                            initial={false}
                                            animate={isAnimating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        <text
                                            x={pos.x} y={pos.y + 5}
                                            textAnchor="middle"
                                            className="text-sm font-bold fill-white pointer-events-none"
                                        >
                                            {i}
                                        </text>

                                        {/* Rank badge for roots */}
                                        {isRoot && (
                                            <g transform={`translate(${pos.x + nodeRadius * 0.75}, ${pos.y - nodeRadius * 0.75})`}>
                                                <circle cx={0} cy={0} r={10} fill="#1e1e2e" stroke="white" strokeWidth={1} />
                                                <text x={0} y={4} textAnchor="middle" className="text-[10px] font-bold fill-white">
                                                    {currentStep.rank[i]}
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Reset View button - shows when canvas is panned */}
                        {(panOffset.x !== DEFAULT_PAN.x || panOffset.y !== DEFAULT_PAN.y) && (
                            <button
                                onClick={resetPan}
                                className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-purple-500/80 text-white text-xs font-medium hover:bg-purple-500 transition-colors flex items-center gap-1.5"
                            >
                                <RotateCcw size={12} />
                                Reset View
                            </button>
                        )}
                    </div>

                    {/* MOBILE TOGGLE BUTTON for Parent Panel */}
                    <button
                        onClick={() => setShowParentPanel(true)}
                        className="xl:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40 p-2 rounded-l-xl bg-purple-500 text-white shadow-lg"
                    >
                        <Menu size={20} />
                    </button>

                    {/* DESKTOP: Show panel button when hidden */}
                    {!showRightPanel && (
                        <button
                            onClick={() => setShowRightPanel(true)}
                            className="hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-xl bg-purple-500 text-white shadow-lg items-center gap-1.5 text-xs"
                        >
                            <Menu size={16} />
                            Array
                        </button>
                    )}

                    {/* BACKDROP for click-outside-to-close */}
                    {showParentPanel && (
                        <div
                            className="xl:hidden fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowParentPanel(false)}
                        />
                    )}

                    {/* PARENT ARRAY PANEL - Centered on mobile */}
                    <div className={`${showParentPanel ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-h-[70vh]' : 'hidden'} ${showRightPanel ? 'xl:relative xl:translate-x-0 xl:translate-y-0 xl:top-auto xl:left-auto xl:block' : 'xl:hidden'} w-72 xl:w-56 backdrop-blur-xl bg-black/90 xl:bg-black/40 border border-white/10 xl:border-l xl:border-y-0 xl:border-r-0 overflow-hidden rounded-2xl xl:rounded-none flex flex-col`}>
                        {/* Panel Header */}
                        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/50">
                            <div className="text-lg text-white/70 flex items-center gap-2">
                                <TreeDeciduous size={20} />
                                Parent Array
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setShowRightPanel(false)} className="hidden xl:block p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20" title="Hide panel">
                                    <X size={14} />
                                </button>
                                <button onClick={() => setShowParentPanel(false)} className="xl:hidden p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {currentStep.parent.map((p, i) => {
                                const isHighlighted = currentStep.highlightPath?.includes(i);
                                const isAnimating = currentStep.animatingNodes?.includes(i);

                                return (
                                    <motion.div
                                        key={i}
                                        initial={false}
                                        animate={isAnimating ? { scale: 1.02 } : { scale: 1 }}
                                        className={`px-3 py-2 rounded-lg border ${isHighlighted ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-slate-800/50 border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white/70">parent[{i}]</span>
                                            <span className={`text-sm font-bold ${isHighlighted ? 'text-yellow-400' : 'text-white'}`}>{p}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-white/40">rank</span>
                                            <span className="text-xs text-white/60">{currentStep.rank[i]}</span>
                                        </div>
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
                        <h1 className="text-xl font-black text-white">Union-Find</h1>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">DSU</span>
                    </div>
                    <p className="text-xs text-white/50 mb-2">Disjoint Set Union with Path Compression</p>
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
                            <h1 className="text-sm sm:text-base font-bold text-white">Union-Find</h1>
                            <div className="flex items-center gap-1.5">
                                <div className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/30">
                                    <span className="text-[10px] sm:text-xs font-bold text-purple-400">Sets: {currentStep.numSets}</span>
                                </div>
                                <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                                    <span className="text-[10px] sm:text-xs font-bold text-cyan-400">Largest: {currentStep.largestSize}</span>
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
                                <Network size={12} />
                                Disjoint Sets
                            </div>
                            <div className="text-2xl font-black text-purple-400">{currentStep.numSets}</div>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <div className="text-xs text-cyan-400">Largest</div>
                                <div className="text-lg font-bold text-cyan-400">{currentStep.largestSize}</div>
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
                        <div className="w-3 h-3 rounded-full border-2 border-white" />
                        <span className="text-xs font-semibold text-white/80">Root</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-xs font-semibold text-white/80">Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                        <span className="text-xs font-semibold text-white/80">Compressed</span>
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
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-purple-500"
                        />
                        <span className="text-[10px] sm:text-xs text-white font-medium">{currentStepIndex + 1}/{steps.length}</span>
                    </div>

                    <div className="w-px h-8 bg-white/10 flex-shrink-0" />

                    {/* Playback */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
                            <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer">
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
                        <Zap size={12} className="text-purple-400 sm:w-3.5 sm:h-3.5" />
                        <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.5"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-purple-500"
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
                        className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
                    >
                        <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>

                    {/* Code Toggle */}
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
                    >
                        <Code2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                </motion.div>
            </motion.div>

            {/* CODE PANEL */}
            <CodePanel
                ref={codeRef}
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
                            className="fixed inset-0 z-40"
                            onClick={() => setShowSettings(false)}
                        />
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="fixed z-50 backdrop-blur-2xl bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl p-4 min-w-[200px]"
                            style={{ bottom: dropdownPos.bottom, left: dropdownPos.left }}
                        >
                            <div className="space-y-3">
                                <div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                                            <span>Nodes: {nodeCount}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="4"
                                            max="16"
                                            value={nodeCount}
                                            onChange={(e) => {
                                                const count = parseInt(e.target.value);
                                                setNodeCount(count);
                                                setSteps(generateSteps(count));
                                                setCurrentStepIndex(0);
                                                setPlaying(false);
                                            }}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
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

export default UnionFind;