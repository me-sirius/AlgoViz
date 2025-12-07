// import React, { useState, useRef, useCallback, useEffect } from "react";
// import Editor from "@monaco-editor/react";
// import axios from "axios";
// import Confetti from "react-confetti"; // npm install react-confetti
// import {
//   Play,
//   CheckCircle,
//   AlertCircle,
//   ChevronDown,
//   Settings,
//   Code2,
//   FileText,
//   Home,
//   Layers,
//   RotateCcw,
//   X,
//   Clock,
//   Database,
//   Terminal,
// } from "lucide-react";

// const VITE_API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// // --- Language Config (Kept same as yours) ---
// const LANGUAGE_CONFIG = {
//   javascript: {
//     name: "JavaScript",
//     monacoLanguage: "javascript",
//     starterCode: `/**\n * @param {TreeNode} root\n * @return {TreeNode}\n */\nvar invertTree = function(root) {\n    // Write your JavaScript code here\n    if (!root) return null;\n    \n    let temp = root.left;\n    root.left = root.right;\n    root.right = temp;\n    \n    invertTree(root.left);\n    invertTree(root.right);\n    \n    return root;\n};`,
//   },
//   python: {
//     name: "Python 3",
//     monacoLanguage: "python",
//     starterCode: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nclass Solution:\n    def invertTree(self, root: TreeNode) -> TreeNode:\n        if not root:\n            return None\n        root.left, root.right = root.right, root.left\n        self.invertTree(root.left)\n        self.invertTree(root.right)\n        return root`,
//   },
//   cpp: {
//     name: "C++",
//     monacoLanguage: "cpp",
//     starterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (root == nullptr) return nullptr;\n        TreeNode* temp = root->left;\n        root->left = root->right;\n        root->right = temp;\n        invertTree(root->left);\n        invertTree(root->right);\n        return root;\n    }\n};\n\nint main() {\n    cout << "Compiles successfully." << endl;\n    return 0;\n}`,
//   },
//   c: {
//     name: "C",
//     monacoLanguage: "c",
//     starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\nstruct TreeNode {\n    int val;\n    struct TreeNode *left;\n    struct TreeNode *right;\n};\n\nstruct TreeNode* invertTree(struct TreeNode* root) {\n    if (root == NULL) return NULL;\n    struct TreeNode* temp = root->left;\n    root->left = root->right;\n    root->right = temp;\n    invertTree(root->left);\n    invertTree(root->right);\n    return root;\n}\n\nint main() {\n    printf("Compiles successfully.\\n");\n    return 0;\n}`,
//   },
// };

// const mockProblem = {
//   title: "1. Invert Binary Tree",
//   difficulty: "Easy",
//   description: `Given the root of a binary tree, invert the tree, and return its root.

// Example 1:
// Input: root = [4,2,7,1,3,6,9]
// Output: [4,7,2,9,6,3,1]

// Constraints:
// • The number of nodes in the tree is in the range [0, 100].`,
// };

// // --- NEW COMPONENT: Settings Modal ---
// const SettingsModal = ({
//   isOpen,
//   onClose,
//   fontSize,
//   setFontSize,
//   theme,
//   setTheme,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
//       <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 w-96 shadow-2xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-bold text-gray-100">Editor Settings</h2>
//           <button onClick={onClose} className="text-gray-400 hover:text-white">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="space-y-6">
//           {/* Font Size Option */}
//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-300">
//               Font Size
//             </label>
//             <div className="flex gap-2">
//               {[12, 14, 16, 18, 20].map((size) => (
//                 <button
//                   key={size}
//                   onClick={() => setFontSize(size)}
//                   className={`px-3 py-2 rounded-lg text-sm transition-all ${
//                     fontSize === size
//                       ? "bg-blue-600 text-white"
//                       : "bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d]"
//                   }`}
//                 >
//                   {size}px
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Theme Option (Just visuals for now) */}
//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-300">Theme</label>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setTheme("vs-dark")}
//                 className={`flex-1 py-2 rounded-lg text-sm ${
//                   theme === "vs-dark"
//                     ? "bg-blue-600 text-white"
//                     : "bg-[#2d2d2d] text-gray-400"
//                 }`}
//               >
//                 Dark
//               </button>
//               <button
//                 onClick={() => setTheme("light")}
//                 className={`flex-1 py-2 rounded-lg text-sm ${
//                   theme === "light"
//                     ? "bg-blue-600 text-white"
//                     : "bg-[#2d2d2d] text-gray-400"
//                 }`}
//               >
//                 Light
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const IDEPage = () => {
//   // State
//   const [activeLeftTab, setActiveLeftTab] = useState("description");
//   const [currentLang, setCurrentLang] = useState("javascript");
//   const [isRunning, setIsRunning] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   // Settings State
//   const [showSettings, setShowSettings] = useState(false);
//   const [fontSize, setFontSize] = useState(14);
//   const [editorTheme, setEditorTheme] = useState("vs-dark");
//   const [showConfetti, setShowConfetti] = useState(false);

//   // Output State - Changed to store raw object
//   const [outputData, setOutputData] = useState(null);

//   const [codeMap, setCodeMap] = useState({
//     javascript: LANGUAGE_CONFIG.javascript.starterCode,
//     python: LANGUAGE_CONFIG.python.starterCode,
//     cpp: LANGUAGE_CONFIG.cpp.starterCode,
//     c: LANGUAGE_CONFIG.c.starterCode,
//   });

//   const editorRef = useRef(null);

//   const handleEditorDidMount = useCallback((editor) => {
//     editorRef.current = editor;
//   }, []);

//   const handleEditorChange = (value) => {
//     setCodeMap((prev) => ({ ...prev, [currentLang]: value }));
//   };

//   const handleLanguageSwitch = (langKey) => {
//     setCurrentLang(langKey);
//     setIsDropdownOpen(false);
//     setOutputData(null);
//   };

//   const handleReset = () => {
//     setCodeMap((prev) => ({
//       ...prev,
//       [currentLang]: LANGUAGE_CONFIG[currentLang].starterCode,
//     }));
//     setOutputData(null);
//   };

//   const handleRunCode = async () => {
//     setIsRunning(true);
//     setOutputData(null);
//     setShowConfetti(false);

//     const sourceCode = codeMap[currentLang];

//     try {
//       const response = await axios.post(`${VITE_API_BASE_URL}/code/run`, {
//         code: sourceCode,
//         language: currentLang,
//       });

//       const data = response.data;

//       // Store raw data for better UI rendering
//       setOutputData(data);

//       // Trigger confetti if accepted
//       if (data.status.includes("Accepted") || data.status === "OK") {
//         setShowConfetti(true);
//         // Stop confetti after 5 seconds
//         setTimeout(() => setShowConfetti(false), 5000);
//       }
//     } catch (error) {
//       console.error(error);
//       setOutputData({
//         status: "Error",
//         output: "Server Error: Could not connect to execution engine.",
//         time: 0,
//         memory: 0,
//       });
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   const NavBar = () => (
//     <nav className="h-14 bg-gradient-to-r from-[#0a0e17] to-[#0d1117] border-b border-gray-800/50 px-6 flex justify-between items-center shrink-0 backdrop-blur-sm">
//       <div className="flex items-center gap-8">
//         <div className="text-xl font-bold flex items-center gap-2">
//           <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//             <Code2 size={20} className="text-white" />
//           </div>
//           <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
//             AlgoViz
//           </span>
//         </div>
//         <div className="hidden md:flex gap-1">{/* Links here... */}</div>
//       </div>
//       <div className="flex items-center gap-3">
//         {/* Settings Button Triggers Modal */}
//         <button
//           onClick={() => setShowSettings(true)}
//           className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 border border-gray-700/50 transition-all hover:text-white text-gray-400"
//         >
//           <Settings size={18} />
//         </button>
//         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
//           R
//         </div>
//       </div>
//     </nav>
//   );

//   return (
//     <div className="h-screen w-full flex flex-col bg-[#0a0e17] text-gray-100 font-sans overflow-hidden relative">
//       {/* Confetti Overlay */}
//       {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

//       {/* Settings Modal */}
//       <SettingsModal
//         isOpen={showSettings}
//         onClose={() => setShowSettings(false)}
//         fontSize={fontSize}
//         setFontSize={setFontSize}
//         theme={editorTheme}
//         setTheme={setEditorTheme}
//       />

//       <NavBar />

//       <div className="flex flex-1 h-[calc(100vh-56px)] w-full overflow-hidden">
//         {/* LEFT PANEL */}
//         <div className="w-2/5 h-full border-r border-gray-800/50 bg-gradient-to-br from-[#0d111c] to-[#0a0e17] flex flex-col">
//           {/* Tabs */}
//           <div className="flex border-b border-gray-800/50 bg-[#0a0e17]/50 backdrop-blur-sm shrink-0">
//             <button
//               onClick={() => setActiveLeftTab("description")}
//               className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
//                 activeLeftTab === "description"
//                   ? "border-blue-500 text-blue-400 bg-blue-500/5"
//                   : "border-transparent text-gray-400"
//               }`}
//             >
//               <FileText size={16} /> Description
//             </button>
//             <button
//               onClick={() => setActiveLeftTab("visualizer")}
//               className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
//                 activeLeftTab === "visualizer"
//                   ? "border-purple-500 text-purple-400 bg-purple-500/5"
//                   : "border-transparent text-gray-400"
//               }`}
//             >
//               Visualizer
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
//             {activeLeftTab === "description" ? (
//               <div className="space-y-6">
//                 <div className="flex justify-between items-start">
//                   <h1 className="text-2xl font-bold">{mockProblem.title}</h1>
//                   <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20">
//                     {mockProblem.difficulty}
//                   </span>
//                 </div>
//                 <div className="prose prose-invert prose-sm max-w-none text-gray-300">
//                   <pre className="whitespace-pre-wrap font-sans bg-transparent p-0">
//                     {mockProblem.description}
//                   </pre>
//                 </div>
//               </div>
//             ) : (
//               <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center border-2 border-dashed border-gray-800/50 rounded-xl bg-gray-900/20">
//                 <Layers size={32} className="text-purple-400 mb-4" />
//                 <p className="text-sm">Visualization Component Placeholder</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div className="w-3/5 h-full flex flex-col bg-[#1e1e1e]">
//           {/* Toolbar */}
//           <div className="h-12 bg-[#252526] border-b border-[#333] flex justify-between items-center px-4 shrink-0">
//             <div className="flex items-center gap-3 relative">
//               <div className="relative">
//                 <button
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                   className="flex items-center gap-2 px-3 py-1.5 bg-[#333] rounded-lg hover:bg-[#3a3a3a] text-sm text-gray-300 transition-all border border-gray-700/50 min-w-[120px] justify-between"
//                 >
//                   {LANGUAGE_CONFIG[currentLang].name} <ChevronDown size={14} />
//                 </button>

//                 {isDropdownOpen && (
//                   <div className="absolute top-full left-0 mt-1 w-40 bg-[#2d2d2d] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
//                     {Object.keys(LANGUAGE_CONFIG).map((langKey) => (
//                       <button
//                         key={langKey}
//                         onClick={() => handleLanguageSwitch(langKey)}
//                         className={`w-full text-left px-4 py-2 text-sm hover:bg-[#3e3e42] transition-colors ${
//                           currentLang === langKey
//                             ? "text-blue-400 bg-[#3e3e42]"
//                             : "text-gray-300"
//                         }`}
//                       >
//                         {LANGUAGE_CONFIG[langKey].name}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={handleReset}
//                 className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 text-xs text-gray-300 transition-all border border-gray-600/50"
//               >
//                 <RotateCcw size={12} /> Reset
//               </button>
//             </div>

//             <button
//               onClick={handleRunCode}
//               disabled={isRunning}
//               className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg ${
//                 isRunning
//                   ? "bg-gray-600 cursor-not-allowed text-gray-400"
//                   : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
//               }`}
//             >
//               {isRunning ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                   <span>Running...</span>
//                 </>
//               ) : (
//                 <>
//                   <Play size={16} fill="currentColor" /> Run Code
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Editor Area - Now uses fontSize and editorTheme */}
//           <div className="flex-1 relative overflow-hidden group">
//             <Editor
//               height="100%"
//               theme={editorTheme}
//               language={LANGUAGE_CONFIG[currentLang].monacoLanguage}
//               value={codeMap[currentLang]}
//               onChange={handleEditorChange}
//               onMount={handleEditorDidMount}
//               options={{
//                 minimap: { enabled: false },
//                 fontSize: fontSize,
//                 fontFamily: "'Fira Code', monospace",
//                 scrollBeyondLastLine: false,
//                 automaticLayout: true,
//                 autoClosingBrackets: "always",
//                 autoClosingQuotes: "always",
//                 padding: { top: 16 },
//               }}
//             />
//           </div>

//           {/* Enhanced Output Panel */}
//           <div
//             className={`bg-[#0a0e17] border-t border-gray-800/50 flex flex-col transition-all duration-300 ${
//               outputData ? "h-[45%]" : "h-12"
//             }`}
//           >
//             {/* Output Header */}
//             <div className="h-12 bg-[#1e1e1e] border-b border-gray-800/50 px-4 flex items-center justify-between shrink-0">
//               <div className="flex items-center gap-4">
//                 <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
//                   <Terminal size={16} /> Console
//                 </span>

//                 {/* Status Badge */}
//                 {outputData && (
//                   <div
//                     className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
//                       outputData.status.includes("Accepted") ||
//                       outputData.status === "OK"
//                         ? "bg-green-500/20 text-green-400 border border-green-500/30"
//                         : "bg-red-500/20 text-red-400 border border-red-500/30"
//                     }`}
//                   >
//                     {outputData.status.includes("Accepted") ||
//                     outputData.status === "OK" ? (
//                       <CheckCircle size={14} />
//                     ) : (
//                       <AlertCircle size={14} />
//                     )}
//                     {outputData.status}
//                   </div>
//                 )}
//               </div>

//               {/* Metrics */}
//               {outputData &&
//                 (outputData.status.includes("Accepted") ||
//                   outputData.status === "OK") && (
//                   <div className="flex items-center gap-4 text-xs text-gray-400">
//                     <span className="flex items-center gap-1.5">
//                       <Clock size={14} /> {outputData.time}s
//                     </span>
//                     <span className="flex items-center gap-1.5">
//                       <Database size={14} /> {outputData.memory}KB
//                     </span>
//                   </div>
//                 )}
//             </div>

//             {/* Output Body */}
//             {outputData && (
//               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
//                 <div className="font-mono text-sm space-y-3">
//                   <div>
//                     <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-2">
//                       Output
//                     </span>
//                     <div
//                       className={`p-3 rounded-lg border ${
//                         outputData.status.includes("Accepted") ||
//                         outputData.status === "OK"
//                           ? "bg-green-500/5 border-green-500/20 text-gray-300"
//                           : "bg-red-500/5 border-red-500/20 text-red-300"
//                       }`}
//                     >
//                       <pre className="whitespace-pre-wrap">
//                         {outputData.output}
//                       </pre>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.4); border-radius: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(75, 85, 99, 0.6); }
//       `}</style>
//     </div>
//   );
// };

// export default IDEPage;

import React, { useState, useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import Confetti from "react-confetti";
import {
  Play,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Settings,
  Code2,
  FileText,
  Home,
  Layers,
  RotateCcw,
  X,
  Clock,
  Database,
  Terminal,
  ArrowLeft,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Type,
  Palette,
  Monitor,
  Layout,
} from "lucide-react";

const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// --- Language Config ---
const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    monacoLanguage: "javascript",
    starterCode: `/**\n * @param {TreeNode} root\n * @return {TreeNode}\n */\nvar invertTree = function(root) {\n    // Write your JavaScript code here\n    if (!root) return null;\n    \n    let temp = root.left;\n    root.left = root.right;\n    root.right = temp;\n    \n    invertTree(root.left);\n    invertTree(root.right);\n    \n    return root;\n};`,
  },
  python: {
    name: "Python 3",
    monacoLanguage: "python",
    starterCode: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nclass Solution:\n    def invertTree(self, root: TreeNode) -> TreeNode:\n        if not root:\n            return None\n        root.left, root.right = root.right, root.left\n        self.invertTree(root.left)\n        self.invertTree(root.right)\n        return root`,
  },
  cpp: {
    name: "C++",
    monacoLanguage: "cpp",
    starterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (root == nullptr) return nullptr;\n        TreeNode* temp = root->left;\n        root->left = root->right;\n        root->right = temp;\n        invertTree(root->left);\n        invertTree(root->right);\n        return root;\n    }\n};\n\nint main() {\n    cout << "Compiles successfully." << endl;\n    return 0;\n}`,
  },
  c: {
    name: "C",
    monacoLanguage: "c",
    starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\nstruct TreeNode {\n    int val;\n    struct TreeNode *left;\n    struct TreeNode *right;\n};\n\nstruct TreeNode* invertTree(struct TreeNode* root) {\n    if (root == NULL) return NULL;\n    struct TreeNode* temp = root->left;\n    root->left = root->right;\n    root->right = temp;\n    invertTree(root->left);\n    invertTree(root->right);\n    return root;\n}\n\nint main() {\n    printf("Compiles successfully.\\n");\n    return 0;\n}`,
  },
};

const mockProblem = {
  title: "1. Invert Binary Tree",
  difficulty: "Easy",
  description: `Given the root of a binary tree, invert the tree, and return its root.

Example 1:
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]

Constraints:
• The number of nodes in the tree is in the range [0, 100].`,
};

// --- Enhanced Settings Modal ---
const SettingsModal = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  theme,
  setTheme,
  showLineNumbers,
  setShowLineNumbers,
  autoSave,
  setAutoSave,
  tabSize,
  setTabSize,
  wordWrap,
  setWordWrap,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-gradient-to-br from-[#1e1e1e] to-[#252526] border border-gray-700/50 rounded-2xl p-6 w-[500px] shadow-2xl animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Settings className="text-blue-400" size={24} />
            Editor Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-all text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {/* Font Size */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Type size={16} className="text-purple-400" />
              Font Size
            </label>
            <div className="flex gap-2 flex-wrap">
              {[12, 14, 16, 18, 20, 22].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    fontSize === size
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d] hover:text-gray-200"
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Palette size={16} className="text-pink-400" />
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme("vs-dark")}
                className={`py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  theme === "vs-dark"
                    ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-2 border-blue-500"
                    : "bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d]"
                }`}
              >
                <Moon size={16} /> Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  theme === "light"
                    ? "bg-gradient-to-r from-blue-100 to-purple-100 text-gray-900 border-2 border-blue-500"
                    : "bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d]"
                }`}
              >
                <Sun size={16} /> Light
              </button>
            </div>
          </div>

          {/* Tab Size */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Layout size={16} className="text-green-400" />
              Tab Size
            </label>
            <div className="flex gap-2">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => setTabSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tabSize === size
                      ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg"
                      : "bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d]"
                  }`}
                >
                  {size} spaces
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between p-3 bg-[#2d2d2d] rounded-lg hover:bg-[#3d3d3d] transition-all">
              <span className="text-sm font-medium text-gray-300">
                Show Line Numbers
              </span>
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`w-12 h-6 rounded-full transition-all ${
                  showLineNumbers ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    showLineNumbers ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#2d2d2d] rounded-lg hover:bg-[#3d3d3d] transition-all">
              <span className="text-sm font-medium text-gray-300">
                Word Wrap
              </span>
              <button
                onClick={() => setWordWrap(!wordWrap)}
                className={`w-12 h-6 rounded-full transition-all ${
                  wordWrap ? "bg-purple-600" : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    wordWrap ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#2d2d2d] rounded-lg hover:bg-[#3d3d3d] transition-all">
              <span className="text-sm font-medium text-gray-300">
                Auto Save
              </span>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`w-12 h-6 rounded-full transition-all ${
                  autoSave ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    autoSave ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IDEPage = () => {
  // State
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [currentLang, setCurrentLang] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [tabSize, setTabSize] = useState(4);
  const [wordWrap, setWordWrap] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Output State
  const [outputData, setOutputData] = useState(null);
  const [showOutput, setShowOutput] = useState(false);

  const [codeMap, setCodeMap] = useState({
    javascript: LANGUAGE_CONFIG.javascript.starterCode,
    python: LANGUAGE_CONFIG.python.starterCode,
    cpp: LANGUAGE_CONFIG.cpp.starterCode,
    c: LANGUAGE_CONFIG.c.starterCode,
  });

  const editorRef = useRef(null);

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const handleEditorChange = (value) => {
    setCodeMap((prev) => ({ ...prev, [currentLang]: value }));
  };

  const handleLanguageSwitch = (langKey) => {
    setCurrentLang(langKey);
    setIsDropdownOpen(false);
    setOutputData(null);
    setShowOutput(false);
  };

  const handleReset = () => {
    setCodeMap((prev) => ({
      ...prev,
      [currentLang]: LANGUAGE_CONFIG[currentLang].starterCode,
    }));
    setOutputData(null);
    setShowOutput(false);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutputData(null);
    setShowConfetti(false);
    setShowOutput(true);

    const sourceCode = codeMap[currentLang];

    try {
      const response = await axios.post(`${VITE_API_BASE_URL}/code/run`, {
        code: sourceCode,
        language: currentLang,
      });

      const data = response.data;
      setOutputData(data);

      if (data.status.includes("Accepted") || data.status === "OK") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error(error);
      setOutputData({
        status: "Error",
        output: "Server Error: Could not connect to execution engine.",
        time: 0,
        memory: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleBack = () => {
    // You can implement navigation logic here
    console.log("Back button clicked");
  };

  const NavBar = () => (
    <nav className="h-14 bg-gradient-to-r from-[#0a0e17] to-[#0d1117] border-b border-gray-800/50 px-6 flex justify-between items-center shrink-0 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 border border-gray-700/50 transition-all hover:text-white text-gray-400 group"
          title="Go back"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
        </button>

        <div className="text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Code2 size={20} className="text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AlgoViz
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 border border-gray-700/50 transition-all hover:text-white text-gray-400 group"
        >
          <Settings
            size={18}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
          R
        </div>
      </div>
    </nav>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0e17] text-gray-100 font-sans overflow-hidden relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        theme={editorTheme}
        setTheme={setEditorTheme}
        showLineNumbers={showLineNumbers}
        setShowLineNumbers={setShowLineNumbers}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        tabSize={tabSize}
        setTabSize={setTabSize}
        wordWrap={wordWrap}
        setWordWrap={setWordWrap}
      />

      <NavBar />

      <div className="flex flex-1 h-[calc(100vh-56px)] w-full overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-2/5 h-full border-r border-gray-800/50 bg-gradient-to-br from-[#0d111c] to-[#0a0e17] flex flex-col">
          <div className="flex border-b border-gray-800/50 bg-[#0a0e17]/50 backdrop-blur-sm shrink-0">
            <button
              onClick={() => setActiveLeftTab("description")}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                activeLeftTab === "description"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <FileText size={16} /> Description
            </button>
            <button
              onClick={() => setActiveLeftTab("visualizer")}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                activeLeftTab === "visualizer"
                  ? "border-purple-500 text-purple-400 bg-purple-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Visualizer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeLeftTab === "description" ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold">{mockProblem.title}</h1>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20">
                    {mockProblem.difficulty}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                  <pre className="whitespace-pre-wrap font-sans bg-transparent p-0">
                    {mockProblem.description}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center border-2 border-dashed border-gray-800/50 rounded-xl bg-gray-900/20 animate-fadeIn">
                <Layers
                  size={32}
                  className="text-purple-400 mb-4 animate-pulse"
                />
                <p className="text-sm">Visualization Component Placeholder</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-3/5 h-full flex flex-col bg-[#1e1e1e]">
          {/* Toolbar */}
          <div className="h-12 bg-[#252526] border-b border-[#333] flex justify-between items-center px-4 shrink-0">
            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#333] rounded-lg hover:bg-[#3a3a3a] text-sm text-gray-300 transition-all border border-gray-700/50 min-w-[120px] justify-between"
                >
                  {LANGUAGE_CONFIG[currentLang].name}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-[#2d2d2d] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-slideDown">
                    {Object.keys(LANGUAGE_CONFIG).map((langKey) => (
                      <button
                        key={langKey}
                        onClick={() => handleLanguageSwitch(langKey)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#3e3e42] transition-colors ${
                          currentLang === langKey
                            ? "text-blue-400 bg-[#3e3e42]"
                            : "text-gray-300"
                        }`}
                      >
                        {LANGUAGE_CONFIG[langKey].name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 text-xs text-gray-300 transition-all border border-gray-600/50 group"
              >
                <RotateCcw
                  size={12}
                  className="group-hover:rotate-180 transition-transform duration-300"
                />{" "}
                Reset
              </button>
            </div>

            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg ${
                isRunning
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/50"
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" /> Run Code
                </>
              )}
            </button>
          </div>

          {/* Editor Area */}
          <div
            className={`relative overflow-hidden transition-all duration-500 ${
              showOutput ? "h-[55%]" : "flex-1"
            }`}
          >
            <Editor
              height="100%"
              theme={editorTheme}
              language={LANGUAGE_CONFIG[currentLang].monacoLanguage}
              value={codeMap[currentLang]}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                fontFamily: "'Fira Code', monospace",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                padding: { top: 16 },
                lineNumbers: showLineNumbers ? "on" : "off",
                tabSize: tabSize,
                wordWrap: wordWrap ? "on" : "off",
              }}
            />
          </div>

          {/* Enhanced Output Panel with Sliding Animation */}
          <div
            className={`bg-[#0a0e17] border-t border-gray-800/50 flex flex-col transition-all duration-500 ${
              showOutput ? "h-[45%] animate-slideUp" : "h-0 overflow-hidden"
            }`}
          >
            {/* Output Header */}
            <div className="h-12 bg-[#1e1e1e] border-b border-gray-800/50 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Terminal size={16} /> Console
                </span>

                {outputData && !isRunning && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold animate-fadeIn ${
                      outputData.status.includes("Accepted") ||
                      outputData.status === "OK"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {outputData.status.includes("Accepted") ||
                    outputData.status === "OK" ? (
                      <CheckCircle size={14} className="animate-bounce" />
                    ) : (
                      <AlertCircle size={14} className="animate-pulse" />
                    )}
                    {outputData.status}
                  </div>
                )}

                {isRunning && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                    <Zap size={14} />
                    Executing...
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {outputData &&
                  !isRunning &&
                  (outputData.status.includes("Accepted") ||
                    outputData.status === "OK") && (
                    <div className="flex items-center gap-4 text-xs text-gray-400 animate-fadeIn">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-lg">
                        <Clock size={14} className="text-blue-400" />{" "}
                        {outputData.time}s
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded-lg">
                        <Database size={14} className="text-purple-400" />{" "}
                        {outputData.memory}KB
                      </span>
                    </div>
                  )}

                <button
                  onClick={() => setShowOutput(false)}
                  className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Output Body */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {isRunning ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <Sparkles
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse"
                      size={24}
                    />
                  </div>
                  <p className="text-gray-400 text-sm animate-pulse">
                    Compiling and running your code...
                  </p>
                </div>
              ) : outputData ? (
                <div className="font-mono text-sm space-y-3 animate-fadeIn">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-2">
                      Output
                    </span>
                    <div
                      className={`p-4 rounded-lg border backdrop-blur-sm ${
                        outputData.status.includes("Accepted") ||
                        outputData.status === "OK"
                          ? "bg-green-500/5 border-green-500/20 text-gray-300"
                          : "bg-red-500/5 border-red-500/20 text-red-300"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap">
                        {outputData.output}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-500">
                  <Terminal size={32} className="opacity-30" />
                  <p className="text-sm">
                    Run your code to see the output here
                  </p>
                  <p className="text-xs opacity-70">
                    Results, errors, and execution details will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 bg-[#0a0e17] border-t border-gray-800/50 px-4 flex items-center justify-between text-xs text-gray-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Code2 size={12} />
            {LANGUAGE_CONFIG[currentLang].name}
          </span>
          <span className="flex items-center gap-1.5">
            <Monitor size={12} />
            {editorTheme === "vs-dark" ? "Dark" : "Light"} Theme
          </span>
          <span className="flex items-center gap-1.5">
            <Type size={12} />
            Font: {fontSize}px
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>Spaces: {tabSize}</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 animate-fadeIn">
        <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
          Ctrl
        </span>
        <span>+</span>
        <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
          Enter
        </span>
        <span>to run code</span>
      </div>

      {/* Click Handler for Closing Dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default IDEPage;
