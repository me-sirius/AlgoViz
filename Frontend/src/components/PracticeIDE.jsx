import React, { useState, useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios"; // Ensure axios is installed
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
  Moon,
} from "lucide-react";
const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
// --- 1. Language Configuration & Boilerplate ---
const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    monacoLanguage: "javascript",
    starterCode: `/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTree = function(root) {
    // Write your JavaScript code here
    if (!root) return null;
    
    let temp = root.left;
    root.left = root.right;
    root.right = temp;
    
    invertTree(root.left);
    invertTree(root.right);
    
    return root;
};

// --- Test Driver (Normally hidden) ---
// console.log("Test Output...");
`,
  },
  python: {
    name: "Python 3",
    monacoLanguage: "python",
    starterCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        # Write your Python code here
        if not root:
            return None
            
        root.left, root.right = root.right, root.left
        self.invertTree(root.left)
        self.invertTree(root.right)
        
        return root

# --- Driver Code ---
# s = Solution()
# print("Running Tests...")
`,
  },
  cpp: {
    name: "C++",
    monacoLanguage: "cpp",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        // Write your C++ code here
        if (root == nullptr) return nullptr;
        
        TreeNode* temp = root->left;
        root->left = root->right;
        root->right = temp;
        
        invertTree(root->left);
        invertTree(root->right);
        
        return root;
    }
};

int main() {
    cout << "Compiles successfully." << endl;
    return 0;
}
`,
  },
  c: {
    name: "C",
    monacoLanguage: "c",
    starterCode: `#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

struct TreeNode* invertTree(struct TreeNode* root) {
    // Write your C code here
    if (root == NULL) return NULL;
    
    struct TreeNode* temp = root->left;
    root->left = root->right;
    root->right = temp;
    
    invertTree(root->left);
    invertTree(root->right);
    
    return root;
}

int main() {
    printf("Compiles successfully.\\n");
    return 0;
}
`,
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

const IDEPage = () => {
  // State
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [currentLang, setCurrentLang] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Store code for ALL languages so switching doesn't lose progress
  const [codeMap, setCodeMap] = useState({
    javascript: LANGUAGE_CONFIG.javascript.starterCode,
    python: LANGUAGE_CONFIG.python.starterCode,
    cpp: LANGUAGE_CONFIG.cpp.starterCode,
    c: LANGUAGE_CONFIG.c.starterCode,
  });

  const editorRef = useRef(null);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
  }, []);

  // Update codeMap whenever editor content changes
  const handleEditorChange = (value) => {
    setCodeMap((prev) => ({
      ...prev,
      [currentLang]: value,
    }));
  };

  const handleLanguageSwitch = (langKey) => {
    setCurrentLang(langKey);
    setIsDropdownOpen(false);
    setOutput(null);
    // Editor value automatically updates because 'value' prop is bound to codeMap[currentLang]
  };

  const handleReset = () => {
    setCodeMap((prev) => ({
      ...prev,
      [currentLang]: LANGUAGE_CONFIG[currentLang].starterCode,
    }));
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const sourceCode = codeMap[currentLang];
    console.log("code", sourceCode);
    console.log("lang", currentLang);
    try {
      const response = await axios.post(`${VITE_API_BASE_URL}/code/run`, {
        code: sourceCode,
        language: currentLang,
      });

      const data = response.data;

      setOutput({
        type:
          data.status.includes("Accepted") || data.status === "OK"
            ? "success"
            : "error",
        message: `${data.status}\nTime: ${data.time || 0}s | Memory: ${
          data.memory || 0
        }KB\n\nOutput:\n${data.output}`,
      });
    } catch (error) {
      console.error(error);
      setOutput({
        type: "error",
        message: "Server Error: Could not connect to execution engine.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // --- Components ---

  const NavBar = () => (
    <nav className="h-14 bg-gradient-to-r from-[#0a0e17] to-[#0d1117] border-b border-gray-800/50 px-6 flex justify-between items-center shrink-0 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <div className="text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code2 size={20} className="text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AlgoViz
          </span>
        </div>
        <div className="hidden md:flex gap-1">
          <a
            href="#"
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all flex items-center gap-2 text-sm"
          >
            <Home size={16} /> Home
          </a>
          <a
            href="#"
            className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-2 text-sm"
          >
            <Code2 size={16} /> Practice
          </a>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 border border-gray-700/50">
          <Settings size={16} className="text-gray-400" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
          R
        </div>
      </div>
    </nav>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0e17] text-gray-100 font-sans overflow-hidden">
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
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <FileText size={16} /> Description
            </button>
            <button
              onClick={() => setActiveLeftTab("visualizer")}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                activeLeftTab === "visualizer"
                  ? "border-purple-500 text-purple-400 bg-purple-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Visualizer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeLeftTab === "description" ? (
              <div className="space-y-6">
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
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center border-2 border-dashed border-gray-800/50 rounded-xl bg-gray-900/20">
                <Layers size={32} className="text-purple-400 mb-4" />
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
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#333] rounded-lg hover:bg-[#3a3a3a] text-sm text-gray-300 transition-all border border-gray-700/50 min-w-[120px] justify-between"
                >
                  {LANGUAGE_CONFIG[currentLang].name} <ChevronDown size={14} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-[#2d2d2d] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
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
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 text-xs text-gray-300 transition-all border border-gray-600/50"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg ${
                isRunning
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              }`}
            >
              {isRunning ? (
                "Running..."
              ) : (
                <>
                  <Play size={16} fill="currentColor" /> Run Code
                </>
              )}
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={LANGUAGE_CONFIG[currentLang].monacoLanguage}
              value={codeMap[currentLang]}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
              }}
            />
          </div>

          {/* Output Console */}
          <div
            className={`bg-[#0a0e17] border-t border-gray-800/50 flex flex-col transition-all duration-300 ${
              output ? "h-2/5" : "h-10"
            }`}
          >
            <div className="h-10 bg-gradient-to-r from-[#1a1e2e] to-[#1e1e1e] border-b border-gray-800/50 px-4 flex items-center text-sm font-medium text-gray-400 shrink-0">
              <span className="flex items-center gap-2">
                {output?.type === "success" ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : output?.type === "error" ? (
                  <AlertCircle size={16} className="text-red-400" />
                ) : null}
                Console Output
              </span>
            </div>
            {output && (
              <div
                className={`flex-1 p-5 overflow-y-auto font-mono text-sm custom-scrollbar leading-relaxed ${
                  output.type === "error"
                    ? "text-red-300 bg-red-900/10"
                    : "text-green-300 bg-green-900/10"
                }`}
              >
                <pre className="whitespace-pre-wrap">{output.message}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(10, 14, 23, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.5); border-radius: 5px; }
      `}</style>
    </div>
  );
};

export default IDEPage;
