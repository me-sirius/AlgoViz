import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Alert from "../../components/Alert";
import MarkdownEditor from "../../components/MarkdownEditor";
import {
  PlusCircle,
  Save,
  Code,
  MinusCircle,
  Sparkles,
  Loader2,
  Lightbulb,
  BookOpen,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
const AddQuestionForm = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState("cpp");
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "error",
    customButtons: null,
  });
  // Initial State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    inputFormat: "The first line contains an integer T.",
    outputFormat: "Print the answer in a new line.",
    timeLimit: 2,
    memoryLimit: 256,
    constraints: [""],
    opportunityType: "Internship",
    hints: [""],
    solution: "",
    tags: "", // comma separated string
    companies: "", // comma separated string
    yearAsked: new Date().getFullYear(),
    referenceSolution: `// JavaScript Solution
// This code will run against the generated large input
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');

function solve() {
    // Example: Reading N and an Array
    const n = parseInt(input[0]);
    const arr = input[1].split(' ').map(Number);
    
    // LOGIC: Sort the array
    arr.sort((a,b) => a-b);
    
    // Print Output
    console.log(arr.join(" "));
}
solve();`,
    inputGenerator: `// Input Generator (Node.js)
// Print random test data to stdout
const N = Math.floor(Math.random() * 100) + 1;
const arr = Array.from({length: N}, () => Math.floor(Math.random() * 1000));
console.log(N);
console.log(arr.join(" "));`,
    generateLargeCase: false, // Checkbox state
    testCases: [{ input: "", output: "", isPublic: true, explanation: "" }],
    starterCode: [
      {
        language: "cpp",
        code: "// C++ Solution\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    // code here\n}",
      },
      {
        language: "java",
        code: "// Java Solution\nimport java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        // code here\n    }\n}",
      },
      {
        language: "python",
        code: "# Python Solution\ndef solve():\n    # code here",
      },
      {
        language: "javascript",
        code: "// JavaScript Solution\nfunction solve() {\n    // code here\n}",
      },
    ],
  });

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    // processFiles(files);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    processFiles(files);
  };

  // Process files to base64
  const processFiles = (files) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(",")[1];
        setImages((prev) => [
          ...prev,
          {
            data: base64,
            mimeType: file.type,
            preview: e.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Image extraction logic removed.

  // --- Handlers ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleHintChange = (idx, val) => {
    const newArr = [...formData.hints];
    newArr[idx] = val;
    setFormData({ ...formData, hints: newArr });
  };
  const addHint = () =>
    setFormData({ ...formData, hints: [...formData.hints, ""] });
  const removeHint = (idx) => {
    if (formData.hints.length === 1) return;
    setFormData({
      ...formData,
      hints: formData.hints.filter((_, i) => i !== idx),
    });
  };
  const handleInputFormatChange = (idx, val) => {
    const newArr = [...formData.inputFormat];
    newArr[idx] = val;
    setFormData({ ...formData, inputFormat: newArr });
  };
  const addInputFormat = () =>
    setFormData({ ...formData, inputFormat: [...formData.inputFormat, ""] });
  const removeInputFormat = (idx) => {
    if (formData.inputFormat.length === 1) return;
    setFormData({
      ...formData,
      inputFormat: formData.inputFormat.filter((_, i) => i !== idx),
    });
  };

  // Output Format
  const handleOutputFormatChange = (idx, val) => {
    const newArr = [...formData.outputFormat];
    newArr[idx] = val;
    setFormData({ ...formData, outputFormat: newArr });
  };
  const addOutputFormat = () =>
    setFormData({ ...formData, outputFormat: [...formData.outputFormat, ""] });
  const removeOutputFormat = (idx) => {
    if (formData.outputFormat.length === 1) return;
    setFormData({
      ...formData,
      outputFormat: formData.outputFormat.filter((_, i) => i !== idx),
    });
  };
  // Dynamic Constraints
  const handleConstraintChange = (idx, val) => {
    const newConstraints = [...formData.constraints];
    newConstraints[idx] = val;
    setFormData({ ...formData, constraints: newConstraints });
  };
  const addConstraint = () =>
    setFormData({ ...formData, constraints: [...formData.constraints, ""] });
  const removeConstraint = (idx) => {
    if (formData.constraints.length === 1) return;
    setFormData({
      ...formData,
      constraints: formData.constraints.filter((_, i) => i !== idx),
    });
  };

  // Dynamic Test Cases
  const handleTestCaseChange = (idx, field, val) => {
    const newCases = [...formData.testCases];
    newCases[idx][field] = val;
    setFormData({ ...formData, testCases: newCases });
  };
  const addTestCase = () =>
    setFormData({
      ...formData,
      testCases: [
        ...formData.testCases,
        { input: "", output: "", isPublic: false, explanation: "" },
      ],
    });
  const removeTestCase = (idx) => {
    if (formData.testCases.length === 1) return;
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== idx),
    });
  };

  // Starter Code
  const handleCodeChange = (lang, val) => {
    const newStarterCode = formData.starterCode.map((sc) =>
      sc.language === lang ? { ...sc, code: val } : sc
    );
    setFormData({ ...formData, starterCode: newStarterCode });
  };

  // --- GEMINI AI GENERATION ---
  const handleGenerateTestCase = async () => {
    if (!formData.referenceSolution) {
      alert("Please provide a Reference Solution first.");
      return;
    }
    if (!formData.title || !formData.description) {
      alert(
        "Please fill in Title and Description first so Gemini has context!"
      );
      return;
    }

    setGenerating(true);
    try {
      const secret = sessionStorage.getItem("admin_secret");
      const { data } = await axios.post(
        `${API_URL}/admin/generate-auto-cases`,
        {
          inputGenerator: formData.inputGenerator,
          referenceSolution: formData.referenceSolution,
        },
        { headers: { "x-admin-secret": secret }, timeout: 60000 }
      );

      if (data.success && Array.isArray(data.data)) {
        // Mark AI generated cases as NOT public by default (for hidden tests)
        const newCases = data.data.map((tc) => ({
          input: tc.input,
          output: tc.output,
          explanation: tc.explanation || "Generated by AI",
          isPublic: false,
        }));

        setFormData((prev) => ({
          ...prev,
          testCases: [...prev.testCases, ...newCases],
        }));
        console.log("test cases : ", newCases);
        // toast.success(`Gemini added ${newCases.length} new test cases!`);
      }
    } catch (error) {
      console.error(error);
      //   toast.error("AI Generation Failed. Check backend logs.");
    } finally {
      setGenerating(false);
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const secret = sessionStorage.getItem("admin_secret");

      const payload = {
        ...formData,
        inputFormat: formData.inputFormat,
        outputFormat: formData.outputFormat,
        tags: formData.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        companies: formData.companies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        constraints: formData.constraints.filter(Boolean),
      };
      console.log("payload : ", payload);
      const response = await axios.post(`${API_URL}/admin/question`, payload, {
        headers: { "x-admin-secret": secret },
      });
      console.log("data : ", response.data);
      //   toast.success("Problem Added Successfully!");
      if (response.status === 201) {
        setAlertConfig({
          isOpen: true,
          message: response.message,
          type: "success",
          customButtons: (
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() =>
                  setAlertConfig((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-6 py-3 bg-gray-600 text-white font-bold rounded-2xl cursor-pointer"
              >
                Close
              </button>
            </div>
          ),
        });
      }
      // Reset logic can go here
    } catch (error) {
      console.error(error);
      setAlertConfig({
        isOpen: true,
        message: "Something went wrong or you might submit same question twice",
        type: "error",
        customButtons: (
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() =>
                setAlertConfig((prev) => ({ ...prev, isOpen: false }))
              }
              className="px-6 py-3 bg-gray-600 text-white font-bold rounded-2xl cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/20">
          <Code size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Question Builder</h2>
          <p className="text-gray-400 text-sm">
            Create new CP problems for the platform
          </p>
        </div>
      </div>
      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        customButtons={alertConfig.customButtons}
      />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* AI Image Extraction removed. */}
        {/* 1. Basic Info Card */}
        <div className="bg-[#161b22] border border-[#333] rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2 mb-4">
            Core Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Title
              </label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                placeholder="e.g. Reverse Linked List"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <MarkdownEditor
            label="Problem Statement"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={8}
            placeholder="Write the problem description here using Markdown...

**Example:**
Given an array of integers, find the **maximum sum** of any contiguous subarray.

- Use `**bold**` for emphasis
- Use `inline code` for variables
- Use bullet points for lists"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Format (Markdown) */}
            <MarkdownEditor
              label="Input Format"
              value={formData.inputFormat}
              onChange={(e) =>
                setFormData({ ...formData, inputFormat: e.target.value })
              }
              rows={6}
              placeholder="e.g.\n* The first line contains **T**, the number of test cases.\n* The next line contains **N**, the size of the array."
            />

            {/* Output Format (Markdown) */}
            <MarkdownEditor
              label="Output Format"
              value={formData.outputFormat}
              onChange={(e) =>
                setFormData({ ...formData, outputFormat: e.target.value })
              }
              rows={6}
              placeholder="e.g. Print the **maximum sum** for each test case on a new line."
            />
          </div>
        </div>

        {/* 2. Config & Meta */}
        <div className="bg-[#161b22] border border-[#333] rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2 mb-4">
            Configuration & Metadata
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-blue-400 mb-1 block">
                Time Limit (sec)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-400 mb-1 block">
                Memory Limit (MB)
              </label>
              <input
                type="number"
                name="memoryLimit"
                value={formData.memoryLimit}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400">
                Constraints
              </label>
              <button
                type="button"
                onClick={addConstraint}
                className="text-blue-400 text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                <PlusCircle size={12} /> Add Constraint
              </button>
            </div>
            {formData.constraints.map((c, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    Constraint #{i + 1}
                  </span>
                  {formData.constraints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConstraint(i)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MinusCircle size={14} /> Remove
                    </button>
                  )}
                </div>
                <MarkdownEditor
                  value={c}
                  onChange={(e) => handleConstraintChange(i, e.target.value)}
                  rows={2}
                  placeholder={`e.g. **1** ≤ N ≤ **10^5**`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Tags (Comma separated)
              </label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white outline-none"
                placeholder="e.g. DP, Arrays"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Companies
              </label>
              <input
                name="companies"
                value={formData.companies}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white outline-none"
                placeholder="e.g. Google, Amazon"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-400 mb-1 block">
                Year Asked
              </label>
              <input
                type="number"
                value={formData.yearAsked}
                onChange={(e) =>
                  setFormData({ ...formData, yearAsked: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-blue-500"
                placeholder="e.g. 2024"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-400 mb-1 block">
                Opportunity Type
              </label>
              <div className="relative">
                <select
                  value={formData.opportunityType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      opportunityType: e.target.value,
                    })
                  }
                  className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="Internship">Internship</option>
                  <option value="Placement">Placement</option>
                </select>

                {/* Optional: Custom Arrow Icon to look better than browser default */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 3. NEW: Editorial & Hints */}
        <div className="bg-[#161b22] border border-[#333] rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2 mb-4">
            Editorial & Assistance
          </h3>

          {/* Hints Section */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                <Lightbulb size={12} /> Hints
              </label>
              <button
                type="button"
                onClick={addHint}
                className="text-yellow-500 text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                <PlusCircle size={12} /> Add Hint
              </button>
            </div>
            {formData.hints.map((h, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    Hint #{i + 1}
                  </span>
                  {formData.hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHint(i)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MinusCircle size={14} /> Remove
                    </button>
                  )}
                </div>
                <MarkdownEditor
                  value={h}
                  onChange={(e) => handleHintChange(i, e.target.value)}
                  rows={4}
                  placeholder={`Write hint #${i + 1} using Markdown...

**Example:**
Think about using a **hash map** to store the elements.`}
                />
              </div>
            ))}
          </div>

          {/* Full Solution Section */}
          <MarkdownEditor
            label="Full Solution / Editorial"
            value={formData.solution}
            onChange={(e) =>
              setFormData({ ...formData, solution: e.target.value })
            }
            rows={8}
            placeholder="Write the editorial solution here using Markdown...

**Approach:**
1. First, we need to understand the problem...
2. The optimal approach uses **dynamic programming**...

**Time Complexity:** `O(n)`
**Space Complexity:** `O(1)`"
          />
        </div>
        {/* 3. Starter Code Tabs */}
        <div className="bg-[#161b22] border border-[#333] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Boilerplate Code
            </h3>
            <div className="flex gap-2">
              {["cpp", "java", "python", "javascript"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLangTab(lang)}
                  className={`text-xs px-3 py-1 rounded capitalize transition-all cursor-pointer ${
                    activeLangTab === lang
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white bg-[#0d1117]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {formData.starterCode.map((sc, i) => (
            <div
              key={i}
              className={activeLangTab === sc.language ? "block" : "hidden"}
            >
              <textarea
                value={sc.code}
                onChange={(e) => handleCodeChange(sc.language, e.target.value)}
                rows={8}
                className="w-full bg-[#0d1117] border border-[#333] rounded-lg p-3 text-gray-300 font-mono text-xs leading-relaxed outline-none resize-y"
              />
            </div>
          ))}
        </div>
        {/* --- NEW SECTION: GENERATOR SETTINGS --- */}
        <div className="bg-[#161b22] border border-[#333] rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[#333] pb-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" /> Custom Test Case
              Generator
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* INPUT GENERATOR */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-green-400  flex justify-between">
                <span>Input Generator (Node.js)</span>
                <span className="text-gray-500 font-normal">
                  Prints random input
                </span>
              </label>
              <textarea
                name="inputGenerator"
                value={formData.inputGenerator}
                onChange={handleChange}
                rows={12}
                className="w-full bg-[#0d1117] border border-[#333] rounded-xl p-4 text-green-100 font-mono text-xs leading-relaxed outline-none focus:border-green-500/50"
                spellCheck="false"
                placeholder="// console.log(Math.random())..."
              />
            </div>

            {/* REFERENCE SOLUTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-yellow-400  flex justify-between">
                <span>Reference Solution (Node.js)</span>
                <span className="text-gray-500 font-normal">
                  Calculates correct output
                </span>
              </label>
              <textarea
                name="referenceSolution"
                value={formData.referenceSolution}
                onChange={handleChange}
                rows={12}
                className="w-full bg-[#0d1117] border border-[#333] rounded-xl p-4 text-yellow-100 font-mono text-xs leading-relaxed outline-none focus:border-yellow-500/50"
                spellCheck="false"
                placeholder="// fs.readFileSync(0)..."
              />
            </div>
          </div>

          {/* <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleGenerateTestCase}
              disabled={generating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {generating ? "Generating..." : "Generate 10 Cases"}
            </button>
          </div> */}
        </div>

        {/* 4. Test Cases & AI Generation */}
        <div className="bg-[#161b22] border border-[#333] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#333] pb-2 mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Test Cases
            </h3>

            <div className="flex gap-3">
              {/* AUTO-GENERATOR BUTTON */}
              <button
                type="button"
                onClick={handleGenerateTestCase}
                disabled={generating}
                className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:bg-blue-500/10 px-3 py-1.5 rounded transition-colors border border-blue-500/20 cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <PlusCircle size={14} /> Auto-generate Cases
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={addTestCase}
                className="text-green-500 text-xs font-bold flex items-center gap-1 hover:bg-green-500/10 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <PlusCircle size={14} /> Add Manually
              </button>
            </div>
          </div>

          {formData.testCases.map((tc, i) => (
            <div
              key={i}
              className="bg-[#0d1117] p-4 rounded-xl border border-[#333] space-y-3 relative group"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-500">
                  Case #{i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tc.isPublic}
                      onChange={(e) =>
                        handleTestCaseChange(i, "isPublic", e.target.checked)
                      }
                      className="accent-blue-500"
                    />
                    Public Example?
                  </label>
                  {formData.testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(i)}
                      className="text-red-500 hover:text-red-400 cursor-pointer"
                    >
                      <MinusCircle size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Input
                  </label>
                  <textarea
                    value={tc.input}
                    onChange={(e) =>
                      handleTestCaseChange(i, "input", e.target.value)
                    }
                    rows={3}
                    className="w-full bg-[#161b22] border border-[#333] rounded p-2 text-white font-mono text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    Output
                  </label>
                  <textarea
                    value={tc.output}
                    onChange={(e) =>
                      handleTestCaseChange(i, "output", e.target.value)
                    }
                    rows={3}
                    className="w-full bg-[#161b22] border border-[#333] rounded p-2 text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>

              {tc.isPublic && (
                <div className="mt-3">
                  <MarkdownEditor
                    label="Explanation (Optional)"
                    value={tc.explanation}
                    onChange={(e) =>
                      handleTestCaseChange(i, "explanation", e.target.value)
                    }
                    rows={3}
                    placeholder={`Explain the logic for this test case...

**Example:** The array [1, 2, 3] has a sum of **6**.`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-blue-900/20 transition-all flex items-center gap-2 transform hover:-translate-y-1 cursor-pointer"
          >
            {loading ? (
              "Publishing..."
            ) : (
              <>
                <Save size={20} /> Publish Question
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestionForm;
