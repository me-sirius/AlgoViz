import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, GitBranch, Layers, ArrowDown, Sparkles, Network, Binary, ListOrdered, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Animated node component
const GraphNode = ({ x, y, label, delay, isActive }) => (
    <motion.div
        className="absolute"
        style={{ left: x, top: y }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: 1,
            scale: 1,
            boxShadow: isActive ? '0 0 30px rgba(168, 85, 247, 0.6)' : 'none'
        }}
        transition={{ delay, duration: 0.5, type: "spring" }}
    >
        <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2
        ${isActive
                    ? 'bg-gradient-to-br from-purple-500 to-violet-600 border-purple-400 text-white'
                    : 'bg-slate-800 border-slate-600 text-white/70'
                }`}
            animate={isActive ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            {label}
        </motion.div>
    </motion.div>
);

// Animated edge/arrow between nodes
const Edge = ({ x1, y1, x2, y2, delay }) => {
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    return (
        <motion.div
            className="absolute origin-left"
            style={{
                left: x1 + 24,
                top: y1 + 24,
                width: length - 48,
                transform: `rotate(${angle}deg)`
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.4 }}
            transition={{ delay, duration: 0.5 }}
        >
            <div className="h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 w-full" />
            <ChevronDown
                size={12}
                className="absolute -right-1 -top-1.5 text-violet-400 rotate-[-90deg]"
            />
        </motion.div>
    );
};

// Falling order number
const OrderNumber = ({ number, delay }) => (
    <motion.div
        className="absolute"
        initial={{ opacity: 0, y: -50 }}
        animate={{
            opacity: [0, 1, 1, 0],
            y: [-50, 0, 0, 50]
        }}
        transition={{
            delay,
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
        }}
        style={{ left: `${15 + number * 12}%` }}
    >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-600/30 border border-purple-500/40 flex items-center justify-center">
            <span className="text-purple-400 font-bold">{number}</span>
        </div>
    </motion.div>
);

const TopologicalSort = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeNode, setActiveNode] = useState(0);

    // Cycle through active nodes
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNode(prev => (prev + 1) % 6);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Node positions for the DAG visualization
    const nodes = [
        { x: 80, y: 20, label: 'A' },
        { x: 180, y: 20, label: 'B' },
        { x: 30, y: 100, label: 'C' },
        { x: 130, y: 100, label: 'D' },
        { x: 230, y: 100, label: 'E' },
        { x: 130, y: 180, label: 'F' },
    ];

    // Edges (from -> to indices)
    const edges = [
        [0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]
    ];

    return (
        <div className="fixed inset-0 bg-[#0b0b0d] overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-violet-900/20" />
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px]"
                    animate={{
                        x: mousePos.x - 300,
                        y: mousePos.y - 300,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                />
            </div>

            {/* Falling order numbers background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[1, 2, 3, 4, 5, 6].map((num, i) => (
                    <OrderNumber key={num} number={num} delay={i * 0.5} />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">

                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate("/")}
                    className="fixed top-4 left-4 sm:top-6 sm:left-6 p-3 rounded-xl backdrop-blur-xl bg-black/40 border border-white/10 hover:bg-white/10 transition-all cursor-pointer z-50"
                >
                    <ArrowLeft size={20} className="text-white" />
                </motion.button>

                {/* Main content card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative backdrop-blur-2xl bg-black/60 border border-white/10 rounded-3xl p-8 sm:p-12 max-w-lg text-center"
                >
                    {/* Glowing border effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 rounded-3xl opacity-20 blur-sm" />

                    <div className="relative">
                        {/* Icon cluster */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <GitBranch size={32} className="text-purple-400" />
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30"
                            >
                                <Network size={40} className="text-white" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                <Layers size={32} className="text-violet-400" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                            Topological Sort
                        </h1>

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 mb-6"
                        >
                            <Sparkles size={16} className="text-purple-400" />
                            <span className="text-sm font-bold text-purple-400">Coming Soon</span>
                        </motion.div>

                        {/* Animated DAG visualization */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="relative h-56 w-72 mx-auto mb-6 bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                        >
                            {/* Edges */}
                            {edges.map(([from, to], i) => (
                                <Edge
                                    key={`${from}-${to}`}
                                    x1={nodes[from].x}
                                    y1={nodes[from].y}
                                    x2={nodes[to].x}
                                    y2={nodes[to].y}
                                    delay={0.8 + i * 0.1}
                                />
                            ))}

                            {/* Nodes */}
                            {nodes.map((node, i) => (
                                <GraphNode
                                    key={node.label}
                                    x={node.x}
                                    y={node.y}
                                    label={node.label}
                                    delay={0.7 + i * 0.1}
                                    isActive={activeNode === i}
                                />
                            ))}
                        </motion.div>

                        {/* Description */}
                        <p className="text-white/60 mb-8 leading-relaxed">
                            Linear ordering of vertices in a Directed Acyclic Graph (DAG) where for every
                            directed edge (u, v), vertex u comes before v in the ordering.
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: Network, label: "DAG Analysis" },
                                { icon: ListOrdered, label: "Linear Order" },
                                { icon: Binary, label: "DFS Based" },
                                { icon: ArrowDown, label: "Dependencies" }
                            ].map(({ icon: Icon, label }, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 + i * 0.1 }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                                >
                                    <Icon size={14} className="text-purple-400" />
                                    <span className="text-xs font-medium text-white/70">{label}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Complexity info */}
                        <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                            <span className="px-2 py-1 rounded bg-white/5">Time: O(V + E)</span>
                            <span className="px-2 py-1 rounded bg-white/5">Space: O(V)</span>
                        </div>
                    </div>
                </motion.div>

                {/* Animated dots decoration */}
                <motion.div
                    className="absolute bottom-10 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-purple-500"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default TopologicalSort;
