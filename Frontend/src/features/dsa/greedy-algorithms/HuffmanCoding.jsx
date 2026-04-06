import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  ArrowLeft, Zap, Settings, X, Code2, WrapText,
  HelpCircle, Binary, TreeDeciduous, Target, TrendingDown,
  FileText, Hash
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { huffmanCoding as huffmanCodingCode } from "../../../core/constants/codeExamples.js";

// ============================================================================
// HUFFMAN CODING STEP GENERATOR
// ============================================================================

const generateHuffmanSteps = (text) => {
  const steps = [];

  if (!text || text.length === 0) {
    return [{
      type: 'empty',
      description: 'Enter text to compress',
      nodes: [],
      tree: null,
      codes: {},
      phase: 'ready',
      codeLine: null
    }];
  }

  const getCodeLine = (phase) => {
    switch (phase) {
      case 'counting': return 2;
      case 'leaves_created': return 5;
      case 'finding_min': return 9;
      case 'merging': return 12;
      case 'tree_complete': return 16;
      case 'complete': return 20;
      default: return 1;
    }
  };

  // Step 1: Count frequencies
  const freqMap = {};
  for (const char of text) {
    freqMap[char] = (freqMap[char] || 0) + 1;
  }

  // Create initial nodes
  let nodeId = 0;
  let nodes = Object.entries(freqMap).map(([char, freq]) => ({
    id: nodeId++,
    char,
    freq,
    isLeaf: true,
    left: null,
    right: null,
    status: 'pending',
    x: 0,
    y: 0
  }));

  steps.push({
    type: 'count_frequencies',
    description: `Counting character frequencies in "${text.slice(0, 20)}${text.length > 20 ? '...' : ''}"`,
    nodes: nodes.map(n => ({ ...n })),
    frequencies: { ...freqMap },
    tree: null,
    codes: {},
    phase: 'counting',
    codeLine: getCodeLine('counting'),
    minNodes: null
  });

  // Sort nodes by frequency initially
  nodes.sort((a, b) => a.freq - b.freq);

  steps.push({
    type: 'create_leaves',
    description: `Created ${nodes.length} leaf nodes, sorted by frequency`,
    nodes: nodes.map(n => ({ ...n, status: 'leaf' })),
    frequencies: { ...freqMap },
    tree: null,
    codes: {},
    phase: 'leaves_created',
    codeLine: getCodeLine('leaves_created'),
    minNodes: null
  });

  // Build Huffman tree
  let pool = nodes.map(n => ({ ...n }));

  while (pool.length > 1) {
    // Sort pool by frequency
    pool.sort((a, b) => a.freq - b.freq);

    // Highlight two minimum nodes
    const min1 = pool[0];
    const min2 = pool[1];

    steps.push({
      type: 'highlight_min',
      description: `Finding two lowest: "${min1.char || '(' + min1.freq + ')'}" (${min1.freq}) and "${min2.char || '(' + min2.freq + ')'}" (${min2.freq})`,
      nodes: pool.map((n, i) => ({
        ...n,
        status: i === 0 || i === 1 ? 'minimum' : 'pending'
      })),
      frequencies: { ...freqMap },
      tree: null,
      codes: {},
      phase: 'finding_min',
      codeLine: getCodeLine('finding_min'),
      minNodes: [min1.id, min2.id]
    });

    // Create parent node
    const parent = {
      id: nodeId++,
      char: null,
      freq: min1.freq + min2.freq,
      isLeaf: false,
      left: { ...min1 },
      right: { ...min2 },
      status: 'new',
      x: 0,
      y: 0
    };

    // Remove min nodes and add parent
    pool = pool.slice(2);
    pool.push(parent);

    steps.push({
      type: 'merge',
      description: `Merged: "${min1.char || '(' + min1.freq + ')'}" + "${min2.char || '(' + min2.freq + ')'}" = Parent(${parent.freq})`,
      nodes: pool.map(n => ({
        ...n,
        status: n.id === parent.id ? 'new' : 'pending'
      })),
      frequencies: { ...freqMap },
      tree: pool.length === 1 ? parent : null,
      codes: {},
      phase: 'merging',
      codeLine: getCodeLine('merging'),
      minNodes: null,
      mergedParent: parent.id
    });
  }

  // Final tree
  const root = pool[0];

  // Generate codes
  const codes = {};
  const generateCodes = (node, code = '') => {
    if (!node) return;
    if (node.isLeaf) {
      codes[node.char] = code || '0';
      return;
    }
    generateCodes(node.left, code + '0');
    generateCodes(node.right, code + '1');
  };
  generateCodes(root);

  steps.push({
    type: 'tree_complete',
    description: 'Huffman tree complete! Generating binary codes...',
    nodes: [{ ...root, status: 'complete' }],
    frequencies: { ...freqMap },
    tree: root,
    codes: {},
    phase: 'tree_complete',
    codeLine: getCodeLine('tree_complete'),
    minNodes: null
  });

  // Calculate compression stats
  const originalBits = text.length * 8;
  let compressedBits = 0;
  for (const char of text) {
    compressedBits += codes[char].length;
  }
  const savings = Math.round((1 - compressedBits / originalBits) * 100);

  // Generate encoded output
  const encoded = text.split('').map(c => codes[c]).join('');

  steps.push({
    type: 'complete',
    description: `🎉 Compression complete! ${savings}% size reduction`,
    nodes: [{ ...root, status: 'complete' }],
    frequencies: { ...freqMap },
    tree: root,
    codes,
    phase: 'complete',
    codeLine: getCodeLine('complete'),
    minNodes: null,
    stats: {
      originalBits,
      compressedBits,
      savings,
      encoded: encoded.slice(0, 50) + (encoded.length > 50 ? '...' : '')
    }
  });

  return steps;
};

// ============================================================================
// TREE NODE COMPONENT
// ============================================================================

const TreeNodeComponent = ({ node, depth = 0 }) => {
  if (!node) return null;

  const getNodeStyle = () => {
    if (node.status === 'minimum') {
      return 'bg-yellow-500/30 border-yellow-400 text-yellow-300 animate-pulse shadow-lg shadow-yellow-500/30';
    }
    if (node.status === 'new') {
      return 'bg-purple-500/30 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/30';
    }
    if (node.status === 'complete') {
      return 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30';
    }
    if (node.isLeaf) {
      return 'bg-blue-500/30 border-blue-400 text-blue-300';
    }
    return 'bg-slate-600/50 border-slate-500 text-slate-300';
  };

  const spacing = Math.max(40, 120 / (depth + 1));

  return (
    <div className="flex flex-col items-center">
      <motion.div
        layout
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex flex-col items-center justify-center z-10 ${getNodeStyle()}`}
      >
        {node.isLeaf ? (
          <>
            <span className="text-[10px] sm:text-xs font-bold">
              {node.char === ' ' ? '␣' : node.char}
            </span>
            <span className="text-[8px] sm:text-[10px] opacity-70">{node.freq}</span>
          </>
        ) : (
          <span className="text-sm sm:text-base font-bold">{node.freq}</span>
        )}
      </motion.div>

      {(node.left || node.right) && (
        <div className="flex items-start mt-1">
          {node.left && (
            <div className="flex flex-col items-center" style={{ marginRight: spacing / 2 }}>
              <div className="h-4 w-px bg-cyan-400/50" />
              <span className="text-[8px] text-cyan-400 font-mono mb-1">0</span>
              <TreeNodeComponent node={node.left} depth={depth + 1} />
            </div>
          )}

          {node.right && (
            <div className="flex flex-col items-center" style={{ marginLeft: spacing / 2 }}>
              <div className="h-4 w-px bg-purple-400/50" />
              <span className="text-[8px] text-purple-400 font-mono mb-1">1</span>
              <TreeNodeComponent node={node.right} depth={depth + 1} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// NODE POOL COMPONENT
// ============================================================================

const NodePool = ({ nodes, minNodes }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center p-4">
      <AnimatePresence mode="popLayout">
        {nodes.map((node) => {
          const isMin = minNodes?.includes(node.id);

          return (
            <motion.div
              key={node.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isMin ? 1.15 : 1,
                opacity: 1,
                y: isMin ? -5 : 0
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center border-2
                ${isMin
                  ? 'bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-500/30'
                  : node.status === 'new'
                    ? 'bg-purple-500/30 border-purple-400 shadow-lg shadow-purple-500/30'
                    : node.isLeaf
                      ? 'bg-blue-500/30 border-blue-400'
                      : 'bg-slate-600/50 border-slate-500'
                }`}
            >
              {node.isLeaf ? (
                <>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {node.char === ' ' ? '␣' : node.char}
                  </span>
                  <span className="text-[10px] text-white/70">{node.freq}</span>
                </>
              ) : (
                <>
                  <TreeDeciduous className="w-3 h-3 text-white/60" />
                  <span className="text-sm font-bold text-white">{node.freq}</span>
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
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
  const lines = (huffmanCodingCode[language] || "").split('\n');

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
          <div onMouseDown={handleResize} className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-cyan-500/50 transition-colors" />

          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Code2 size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-white">Huffman Coding</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                {Object.entries(labels).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <button
                onClick={() => setWrap(!wrap)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${wrap ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 border border-white/10'}`}
              >
                <WrapText size={16} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 font-mono text-sm ${wrap ? 'overflow-auto' : 'overflow-x-auto overflow-y-auto'}`}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                animate={i + 1 === activeLine ? { backgroundColor: "rgba(6,182,212,0.2)" } : { backgroundColor: "transparent" }}
                className={`flex items-start gap-3 px-3 py-1 rounded-lg ${i + 1 === activeLine ? "border-l-2 border-cyan-400" : ""}`}
              >
                <span className={`w-6 text-right text-xs flex-shrink-0 ${i + 1 === activeLine ? "text-cyan-400 font-bold" : "text-white/30"}`}>{i + 1}</span>
                <pre className={`flex-1 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${i + 1 === activeLine ? "text-cyan-100" : "text-white/70"}`}>{line || " "}</pre>
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

const HuffmanCoding = () => {
  const navigate = useNavigate();

  // State
  const [inputText, setInputText] = useState('BEEP BOOP');
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
    const allSteps = generateHuffmanSteps(inputText);
    setSteps(allSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  }, [inputText]);

  useEffect(() => { initialize(); }, [initialize]);

  // Current step
  const currentStep = steps[currentStepIndex] || {
    nodes: [],
    tree: null,
    codes: {},
    description: 'Enter text and press Play',
    phase: 'ready',
    frequencies: {},
    codeLine: 1
  };

  // Stats
  const stats = currentStep.stats || {
    originalBits: inputText.length * 8,
    compressedBits: 0,
    savings: 0,
    encoded: ''
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

  // Apply new text
  const applyText = () => {
    setShowSettings(false);
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
        <div className="absolute inset-0 flex flex-col pt-28 sm:pt-32 xl:pt-40 pb-28 sm:pb-32 overflow-auto px-4">

          {/* MOBILE/TABLET: LEGEND */}
          <div className="xl:hidden flex justify-center flex-wrap gap-2 sm:gap-4 mt-2 mt-6 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Leaf</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Min Freq</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500" />
              <span className="text-[9px] sm:text-xs text-white/60">New Parent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-500" />
              <span className="text-[9px] sm:text-xs text-white/60">Complete</span>
            </div>
          </div>

          {/* VISUALIZATION */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6">

            {/* Frequency Table */}
            {Object.keys(currentStep.frequencies || {}).length > 0 && (
              <div className="backdrop-blur-xl bg-slate-800/40 border border-white/10 rounded-2xl p-3 sm:p-4">
                <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                  <Hash size={12} />
                  Frequency Table
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(currentStep.frequencies || {}).map(([char, freq]) => (
                    <div key={char} className="px-2 py-1 rounded-lg bg-slate-700/50 border border-white/10 flex items-center gap-1.5">
                      <span className="text-cyan-400 font-mono text-sm">{char === ' ' ? '␣' : char}</span>
                      <span className="text-white/40">:</span>
                      <span className="text-white font-bold text-sm">{freq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tree or Node Pool */}
            <div className="w-full max-w-4xl bg-slate-800/30 rounded-2xl border border-white/5 p-4 sm:p-6 overflow-auto">
              {currentStep.tree ? (
                <div className="flex flex-col items-center">
                  <div className="text-xs text-white/50 mb-4 flex items-center gap-2">
                    <TreeDeciduous size={12} />
                    Huffman Tree (Left = 0, Right = 1)
                  </div>
                  <div className="overflow-auto max-w-full pb-4">
                    <TreeNodeComponent node={currentStep.tree} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-xs text-white/50 mb-4 flex items-center gap-2">
                    <Target size={12} />
                    Node Priority Queue ({currentStep.nodes?.length || 0} nodes)
                  </div>
                  <NodePool
                    nodes={currentStep.nodes || []}
                    minNodes={currentStep.minNodes}
                  />
                </div>
              )}
            </div>

            {/* Code Table */}
            {Object.keys(currentStep.codes || {}).length > 0 && (
              <div className="backdrop-blur-xl bg-slate-800/40 border border-white/10 rounded-2xl p-3 sm:p-4">
                <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                  <Binary size={12} />
                  Binary Codes
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(currentStep.codes).map(([char, code]) => (
                    <div key={char} className="px-2 py-1 rounded-lg bg-slate-700/50 border border-cyan-500/30 flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">{char === ' ' ? '␣' : char}</span>
                      <span className="text-white/40">→</span>
                      <span className="text-green-400 font-mono text-xs">{code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            <h1 className="text-xl font-black text-white">Huffman Coding</h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">Greedy</span>
          </div>
          <p className="text-xs text-white/50 mb-2">Lossless data compression</p>
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
              <h1 className="text-sm sm:text-base font-bold text-white">Huffman Coding</h1>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400">{stats.originalBits}b</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-400">{stats.savings}%</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/50">Lossless data compression</p>
          </div>
        </motion.div>

        {/* DESKTOP: Compression HUD */}
        <motion.div
          className="hidden xl:flex fixed top-6 z-40 flex-col items-end gap-2"
          initial={{ right: 24 }}
          animate={{ right: showCode ? panelWidth + 24 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
            <div>
              <div className="text-xs text-white/50 flex items-center gap-2">
                <FileText size={12} />
                Original
              </div>
              <div className="text-2xl font-black text-amber-400">{stats.originalBits} <span className="text-sm font-normal">bits</span></div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-cyan-400 flex items-center gap-1">
                  <Binary size={10} />
                  Compressed
                </div>
                <div className="text-lg font-bold text-cyan-400">{stats.compressedBits || '?'}</div>
              </div>
              <div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <TrendingDown size={10} />
                  Savings
                </div>
                <div className="text-lg font-bold text-green-400">{stats.savings}%</div>
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
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-white/80">Leaf</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-white/80">Min Freq</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-white/80">New Parent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-xs font-semibold text-white/80">Complete</span>
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
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500"
            />
            <span className="text-[10px] sm:text-xs text-white font-medium">{currentStepIndex + 1}/{steps.length}</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Playback */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={handleStepBack} disabled={currentStepIndex <= 0} className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
              <SkipBack size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={handlePlayPause} className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer">
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
            <Zap size={12} className="text-cyan-400 sm:w-3.5 sm:h-3.5" />
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-12 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 accent-cyan-500"
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
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Code Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${showCode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
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
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Text to Compress</label>
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text like MISSISSIPPI..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Presets */}
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase mb-1.5 block">Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['BEEP BOOP', 'MISSISSIPPI', 'ABRACADABRA', 'HELLO WORLD'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => { setInputText(preset); setShowSettings(false); }}
                        className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-xs text-white/80 hover:text-cyan-300 transition-colors border border-transparent hover:border-cyan-500/30 truncate"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={applyText}
                  className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HELP BUTTON */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-lg"
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Huffman Coding</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h3 className="font-bold text-cyan-400 mb-1">🎯 Goal</h3>
                  <p>Lossless compression: frequent characters get short codes, rare get long codes.</p>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-1">📝 Greedy Strategy</h3>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs sm:text-sm">
                    1. Count frequencies<br />
                    2. Merge 2 lowest freq nodes<br />
                    3. Repeat until 1 tree<br />
                    4. Generate binary codes
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-1">🌳 Visual States</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span>Leaf Node</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500" />
                      <span>Min Frequency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span>New Parent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-cyan-500" />
                      <span>Complete</span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <h3 className="font-bold text-cyan-400 mb-1">💡 Why It Works</h3>
                  <p className="text-xs">Frequent chars end up near root (short paths = short codes). Rare chars end up deep (long paths = long codes). Total bits minimized!</p>
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

export default HuffmanCoding;
