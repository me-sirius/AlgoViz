import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Compass, MapPin, Navigation, Sparkles, Zap, Target, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Animated grid cell for the background
const GridCell = ({ delay, isPath, isStart, isEnd }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: isPath ? [0.3, 0.8, 0.3] : 0.1,
            scale: 1,
            backgroundColor: isStart ? '#22d3ee' : isEnd ? '#f472b6' : isPath ? '#06b6d4' : '#1e293b'
        }}
        transition={{
            delay: delay,
            duration: isPath ? 2 : 0.5,
            repeat: isPath ? Infinity : 0,
            ease: "easeInOut"
        }}
        className="aspect-square rounded-sm"
    />
);

// Floating particle effect
const Particle = ({ delay }) => (
    <motion.div
        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
        initial={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: 0
        }}
        animate={{
            x: [null, Math.random() * 400 - 200],
            y: [null, Math.random() * 400 - 200],
            opacity: [0, 1, 0]
        }}
        transition={{
            duration: 4,
            delay: delay,
            repeat: Infinity,
            ease: "linear"
        }}
    />
);

const AStar = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Generate animated path pattern
    const pathCells = [0, 1, 2, 12, 22, 23, 24, 34, 44, 45, 46, 47, 57, 67, 77, 87, 88, 89, 99];

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0b0b0d] overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-blue-900/20" />
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]"
                    animate={{
                        x: mousePos.x - 300,
                        y: mousePos.y - 300,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <Particle key={i} delay={i * 0.2} />
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

                {/* Animated grid background */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="grid grid-cols-10 gap-1 w-80 h-80 opacity-30">
                        {Array.from({ length: 100 }).map((_, i) => (
                            <GridCell
                                key={i}
                                delay={i * 0.02}
                                isPath={pathCells.includes(i)}
                                isStart={i === 0}
                                isEnd={i === 99}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Main content card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative backdrop-blur-2xl bg-black/60 border border-white/10 rounded-3xl p-8 sm:p-12 max-w-lg text-center"
                >
                    {/* Glowing border effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-3xl opacity-20 blur-sm" />

                    <div className="relative">
                        {/* Icon cluster */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <Compass size={32} className="text-cyan-400" />
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30"
                            >
                                <Navigation size={40} className="text-white" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                <Target size={32} className="text-blue-400" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                            A* Search
                        </h1>

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6"
                        >
                            <Sparkles size={16} className="text-cyan-400" />
                            <span className="text-sm font-bold text-cyan-400">Coming Soon</span>
                        </motion.div>

                        {/* Description */}
                        <p className="text-white/60 mb-8 leading-relaxed">
                            The optimal pathfinding algorithm that combines the best of Dijkstra's algorithm
                            and greedy best-first search using heuristic functions.
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: Route, label: "Optimal Path" },
                                { icon: Zap, label: "Fast Search" },
                                { icon: MapPin, label: "Grid Navigation" },
                                { icon: Target, label: "Heuristic f(n)" }
                            ].map(({ icon: Icon, label }, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                                >
                                    <Icon size={14} className="text-cyan-400" />
                                    <span className="text-xs font-medium text-white/70">{label}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Complexity info */}
                        <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                            <span className="px-2 py-1 rounded bg-white/5">Time: O(b^d)</span>
                            <span className="px-2 py-1 rounded bg-white/5">Space: O(b^d)</span>
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
                            className="w-2 h-2 rounded-full bg-cyan-500"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default AStar;
