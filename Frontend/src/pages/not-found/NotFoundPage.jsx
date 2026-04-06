import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ArrowLeft, Terminal, Code2, Rocket } from "lucide-react";

// All available routes for search
const routes = [
  // Main Pages
  { name: "Home", path: "/" },
  { name: "Blogs", path: "/blogs" },
  { name: "Cheat Sheet", path: "/cheatsheet" },
  { name: "About", path: "/about" },
  { name: "Support", path: "/support" },
  { name: "Algorithms", path: "/algorithms" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Premium", path: "/premium" },
  { name: "Documentation", path: "/view-documentation" },
  // Auth
  { name: "Sign In", path: "/signin" },
  { name: "Register", path: "/register" },
  { name: "User Profile", path: "/user-profile" },
  // Practice
  { name: "MCQ Practice", path: "/mcq" },
  { name: "Mock Test", path: "/mock-test" },
  // Interview
  { name: "Interview Experience", path: "/Interview-Experience" },
  { name: "Mock Interview", path: "/Mock-Interview" },
  { name: "Share Experience", path: "/share-experience" },
  // Sorting Algorithms
  { name: "Bubble Sort", path: "/bubble-sort" },
  { name: "Selection Sort", path: "/selection-sort" },
  { name: "Insertion Sort", path: "/insertion-sort" },
  { name: "Quick Sort", path: "/quick-sort" },
  { name: "Merge Sort", path: "/merge-sort" },
  { name: "Heap Sort", path: "/heap-sort" },
  // Search Algorithms
  { name: "Binary Search", path: "/binary-search" },
  { name: "Linear Search", path: "/linear-search" },
  { name: "Exponential Search", path: "/exponential-search" },
  { name: "Interpolation Search", path: "/interpolation-search" },
  { name: "Jump Search", path: "/jump-search" },
  // Trees and Graphs
  { name: "BFS Visualizer", path: "/bfs-visualizer" },
  { name: "DFS Visualizer", path: "/dfs-visualizer" },
  { name: "Dijkstra", path: "/dijkstra-visualizer" },
  { name: "A* Algorithm", path: "/astar-visualizer" },
  { name: "Topological Sort", path: "/topological-sort" },
  { name: "Tree Traversal", path: "/tree-traversal" },
  { name: "Binary Search Tree", path: "/bst" },
  { name: "AVL Tree", path: "/avl-tree" },
  // Dynamic Programming
  { name: "Fibonacci", path: "/fibonacci" },
  { name: "Climbing Stairs", path: "/climbing-stairs" },
  { name: "Knapsack Problem", path: "/knapsack" },
  { name: "LCS", path: "/lcs" },
  { name: "Edit Distance", path: "/edit-distance" },
  { name: "Coin Change", path: "/coin-change" },
  // Greedy Algorithms
  { name: "Activity Selection", path: "/activity-selection" },
  { name: "Huffman Coding", path: "/huffman-coding" },
  { name: "Prim's MST", path: "/prim-mst" },
  { name: "Kruskal's MST", path: "/kruskal-mst" },
  { name: "Union Find", path: "/union-find" },
  // Backtracking
  { name: "N-Queens", path: "/n-queens" },
  { name: "Sudoku Solver", path: "/sudoku-solver" },
  { name: "Maze Solver", path: "/maze-solver" },
  { name: "Subset Sum", path: "/subset-sum" },
  { name: "Word Search", path: "/word-search" },
  
  { name: "Notifications", path: "/notification" },
];

// Rocket component that launches on click
const LaunchRocket = ({ x, y, onComplete }) => (
  <motion.div
    className="fixed pointer-events-none z-50"
    style={{ left: x, top: y }}
    initial={{ y: 0, opacity: 1, scale: 1 }}
    animate={{ y: -800, opacity: 0, scale: 0.5, rotate: [0, -5, 5, 0] }}
    transition={{ duration: 2, ease: "easeOut" }}
    onAnimationComplete={onComplete}
  >
    <div className="relative">
      {/* Rocket body */}
      <div className="text-4xl">🚀</div>
      {/* Flame trail */}
      <motion.div
        className="absolute top-8 left-3 w-2"
        animate={{
          height: [20, 40, 20],
          opacity: [1, 0.8, 1],
        }}
        transition={{ duration: 0.2, repeat: Infinity }}
        style={{
          background: 'linear-gradient(to bottom, #ff6b35, #f7931e, #ffcc00, transparent)',
          borderRadius: '0 0 50% 50%',
          filter: 'blur(2px)',
        }}
      />
    </div>
  </motion.div>
);

// Shooting star that appears randomly
const ShootingStar = ({ onComplete }) => {
  const startX = Math.random() * 100;
  const startY = Math.random() * 30;

  return (
    <motion.div
      className="fixed pointer-events-none z-20"
      style={{ left: `${startX}%`, top: `${startY}%` }}
      initial={{ x: 0, y: 0, opacity: 1 }}
      animate={{ x: 300, y: 200, opacity: 0 }}
      transition={{ duration: 1, ease: "linear" }}
      onAnimationComplete={onComplete}
    >
      <div
        className="w-20 h-[2px]"
        style={{
          background: 'linear-gradient(to right, transparent, #fff, #0ff)',
          transform: 'rotate(30deg)',
          boxShadow: '0 0 10px #0ff',
        }}
      />
    </motion.div>
  );
};

// Floating asteroid that can be clicked to explode
const Asteroid = ({ id, x, y, size, onExplode, mouseX, mouseY }) => {
  const [isExploding, setIsExploding] = useState(false);

  const handleClick = () => {
    setIsExploding(true);
    onExplode(id);
  };

  if (isExploding) {
    return (
      <motion.div
        className="fixed pointer-events-none z-30"
        style={{ left: `${x}%`, top: `${y}%` }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-2xl">💥</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed cursor-pointer z-30 hover:scale-125 transition-transform"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        x: mouseX * -0.8,
        y: mouseY * -0.8,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      onClick={handleClick}
      title="Click to destroy!"
    >
      <span style={{ fontSize: size }}>🪨</span>
    </motion.div>
  );
};

// Score display
const ScoreDisplay = ({ score }) => (
  <motion.div
    className="fixed top-6 right-6 z-50 px-4 py-2 rounded-lg backdrop-blur-md"
    style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <span className="text-cyan-400 font-mono text-sm">SCORE: </span>
    <span className="text-white font-mono font-bold">{score}</span>
  </motion.div>
);

// Hint display
const HintDisplay = () => (
  <motion.div
    className="fixed bottom-6 left-6 z-50 px-4 py-2 rounded-lg backdrop-blur-md"
    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1 }}
  >
    <p className="text-gray-400 text-xs">
      💡 <span className="text-cyan-400">Click anywhere</span> to launch rockets •
      <span className="text-orange-400"> Click asteroids</span> to destroy them!
    </p>
  </motion.div>
);

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [glitchText, setGlitchText] = useState("404");
  const [isFocused, setIsFocused] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [rockets, setRockets] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [score, setScore] = useState(0);

  // Initialize asteroids
  useEffect(() => {
    const initialAsteroids = [...Array(5)].map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 40,
      size: 20 + Math.random() * 20,
    }));
    setAsteroids(initialAsteroids);
  }, []);

  // Respawn asteroids
  useEffect(() => {
    const respawnInterval = setInterval(() => {
      setAsteroids(prev => {
        if (prev.length < 5) {
          return [...prev, {
            id: Date.now(),
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 40,
            size: 20 + Math.random() * 20,
          }];
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(respawnInterval);
  }, []);

  // Shooting stars
  useEffect(() => {
    const starInterval = setInterval(() => {
      const id = Date.now();
      setShootingStars(prev => [...prev, { id }]);
    }, 4000);
    return () => clearInterval(starInterval);
  }, []);

  // Mouse tracking
  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouse({ x: x * 40, y: y * 40 });
  };

  // Launch rocket on click
  const handleClick = useCallback((e) => {
    if (e.target.closest('button, input, li, a')) return;
    const id = Date.now();
    setRockets(prev => [...prev, { id, x: e.clientX - 20, y: e.clientY }]);
    setScore(prev => prev + 1);
  }, []);

  // Remove completed rocket
  const removeRocket = useCallback((id) => {
    setRockets(prev => prev.filter(r => r.id !== id));
  }, []);

  // Remove shooting star
  const removeShootingStar = useCallback((id) => {
    setShootingStars(prev => prev.filter(s => s.id !== id));
  }, []);

  // Explode asteroid
  const explodeAsteroid = useCallback((id) => {
    setScore(prev => prev + 10);
    setTimeout(() => {
      setAsteroids(prev => prev.filter(a => a.id !== id));
    }, 300);
  }, []);

  // Glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const glitchChars = "!@#$%^&*";
      setGlitchText("404".split('').map(char =>
        Math.random() > 0.7 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
      ).join(''));
      setTimeout(() => setGlitchText("404"), 100);
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, []);

  // Generate stars
  const stars = useMemo(() => {
    return [...Array(120)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
      parallax: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  // Search
  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSuggestions(term.length >= 2
      ? routes.filter(r => r.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5)
      : []
    );
  };

  return (
    <div
      className="min-h-screen bg-[#020510] text-white overflow-hidden relative cursor-crosshair"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Score */}
      <ScoreDisplay score={score} />

      {/* Hint */}
      <HintDisplay />

      {/* Rockets */}
      <AnimatePresence>
        {rockets.map(rocket => (
          <LaunchRocket
            key={rocket.id}
            x={rocket.x}
            y={rocket.y}
            onComplete={() => removeRocket(rocket.id)}
          />
        ))}
      </AnimatePresence>

      {/* Shooting Stars */}
      <AnimatePresence>
        {shootingStars.map(star => (
          <ShootingStar
            key={star.id}
            onComplete={() => removeShootingStar(star.id)}
          />
        ))}
      </AnimatePresence>

      {/* Asteroids */}
      {asteroids.map(asteroid => (
        <Asteroid
          key={asteroid.id}
          id={asteroid.id}
          x={asteroid.x}
          y={asteroid.y}
          size={asteroid.size}
          onExplode={explodeAsteroid}
          mouseX={mouse.x}
          mouseY={mouse.y}
        />
      ))}

      {/* Space background with visible nebulae */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 30% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 40%),
            linear-gradient(to bottom, #020510 0%, #0a1628 50%, #020510 100%)
          `,
        }}
      />

      {/* Planets */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: '10%',
          top: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(100, 180, 255, 0.4), rgba(50, 100, 200, 0.2) 50%, rgba(20, 50, 100, 0.1) 80%, transparent)',
          boxShadow: 'inset -30px -30px 60px rgba(0,0,0,0.6), 0 0 60px rgba(100, 180, 255, 0.3)',
          x: mouse.x * -1.5,
          y: mouse.y * -1.5,
        }}
      />

      {/* Saturn-like planet with ring */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          right: '8%',
          bottom: '20%',
          x: mouse.x * -1.2,
          y: mouse.y * -1.2,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(255, 180, 100, 0.5), rgba(200, 120, 60, 0.3) 60%, transparent)',
            boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(255, 180, 100, 0.2)',
          }}
        />
        {/* Ring */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 180,
            height: 50,
            borderRadius: '50%',
            border: '4px solid rgba(255, 200, 150, 0.25)',
            transform: 'translateX(-50%) translateY(-50%) rotateX(70deg)',
          }}
        />
      </motion.div>

      {/* Moon */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          right: '25%',
          top: '10%',
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, rgba(200, 200, 210, 0.6), rgba(100, 100, 120, 0.3) 70%, transparent)',
          boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.5)',
          x: mouse.x * -0.8,
          y: mouse.y * -0.8,
        }}
      />

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              x: mouse.x * star.parallax,
              y: mouse.y * star.parallax,
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2,5,16,0.6) 100%)' }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pointer-events-none">

        {/* Glitching 404 */}
        <motion.div
          className="relative mb-8"
          animate={{ x: [0, -2, 2, -1, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        >
          <span className="absolute text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-black tracking-tighter opacity-50" style={{ color: '#ff0040', transform: 'translate(-4px, 0)', filter: 'blur(1px)' }}>{glitchText}</span>
          <span className="absolute text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-black tracking-tighter opacity-50" style={{ color: '#00ff88', transform: 'translate(4px, 0)', filter: 'blur(1px)' }}>{glitchText}</span>
          <span className="relative text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-black tracking-tighter" style={{ color: '#fff', textShadow: '0 0 40px rgba(0, 255, 136, 0.5), 0 0 80px rgba(0, 255, 136, 0.3)' }}>{glitchText}</span>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <Terminal className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-mono text-sm">LOST_IN_SPACE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">You've drifted into the void</h2>
          <p className="text-gray-400 font-mono text-sm">
            <span className="text-cyan-400">coordinates:</span> unknown • <span className="text-red-400">signal:</span> lost
          </p>
        </motion.div>

        {/* Terminal Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md pointer-events-auto"
        >
          <div className="rounded-xl p-6 border backdrop-blur-xl" style={{ background: 'rgba(0, 0, 0, 0.5)', borderColor: 'rgba(0, 255, 136, 0.2)', boxShadow: '0 0 40px rgba(0, 255, 136, 0.1)' }}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-gray-500 text-xs font-mono">space_navigation.sh</span>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (suggestions.length >= 1) navigate(suggestions[0].path); }} className="mb-4 relative">
              <div className={`flex items-center rounded-lg transition-all duration-300 ${isFocused ? 'ring-2 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : ''}`} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Code2 className="w-4 h-4 text-cyan-400 ml-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder="find_destination()"
                  className="flex-1 bg-transparent text-white placeholder-gray-500 px-3 py-3 focus:outline-none text-sm font-mono"
                />
              </div>
              {suggestions.length > 0 && isFocused && (
                <motion.ul initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-30 border border-cyan-500/20 backdrop-blur-xl" style={{ background: 'rgba(10, 10, 20, 0.95)' }}>
                  {suggestions.map((s) => (
                    <li key={s.path} onMouseDown={() => navigate(s.path)} className="px-4 py-2.5 text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-3 text-sm font-mono">
                      <span className="text-cyan-500">→</span>{s.name}
                    </li>
                  ))}
                </motion.ul>
              )}
            </form>

            <div className="flex gap-3">
              <motion.button onClick={() => navigate("/")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                <Home className="w-4 h-4" /><span className="font-mono">return_home()</span>
              </motion.button>
              <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-white border border-white/10 hover:border-white/20" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <ArrowLeft className="w-4 h-4" /><span className="font-mono">back()</span>
              </motion.button>
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-5 font-mono">status: 404 | rockets_launched: {score}</p>
        </motion.div>
      </div>
    </div>
  );
}
