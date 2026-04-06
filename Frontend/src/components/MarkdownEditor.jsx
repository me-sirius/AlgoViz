import React from "react";
import MDEditor from "@uiw/react-md-editor";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const MarkdownEditor = ({
    value,
    onChange,
    placeholder = "Write your content here...",
    rows = 8,
    label,
    required = false,
}) => {
    // Calculate height from rows (approx 24px per row)
    const height = rows * 24 + 100;

    // Handle change from MDEditor (it passes value directly, not event)
    const handleChange = (val) => {
        // Create a synthetic event-like object for compatibility
        onChange({ target: { value: val || "" } });
    };

    return (
        <div className="space-y-2" data-color-mode="dark">
            {label && (
                <label className="text-xs font-bold text-gray-400 mb-1 block">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="rounded-xl overflow-hidden border border-[#333]">
                <style>{`
                    .w-md-editor {
                        background-color: #0d1117 !important;
                        color: #e6edf3 !important;
                    }
                    .w-md-editor-toolbar {
                        background-color: #161b22 !important;
                        border-bottom: 1px solid #333 !important;
                    }
                    .w-md-editor-toolbar li > button {
                        color: #8b949e !important;
                    }
                    .w-md-editor-toolbar li > button:hover {
                        color: #e6edf3 !important;
                        background-color: #21262d !important;
                    }
                    .w-md-editor-text-pre > code,
                    .w-md-editor-text-input {
                        color: #e6edf3 !important;
                        font-size: 14px !important;
                        line-height: 1.6 !important;
                    }
                    .w-md-editor-preview {
                        background-color: #0d1117 !important;
                        padding: 16px !important;
                    }
                    .w-md-editor-preview .wmde-markdown {
                        background-color: #0d1117 !important;
                        color: #e6edf3 !important;
                    }
                    .wmde-markdown h1 {
                        font-size: 1.5rem !important;
                        font-weight: 700 !important;
                        color: #ffffff !important;
                        border-bottom: 1px solid #333 !important;
                        padding-bottom: 0.5rem !important;
                        margin-bottom: 1rem !important;
                        margin-top: 1.5rem !important;
                    }
                    .wmde-markdown h2 {
                        font-size: 1.25rem !important;
                        font-weight: 700 !important;
                        color: #ffffff !important;
                        margin-bottom: 0.75rem !important;
                        margin-top: 1.25rem !important;
                    }
                    .wmde-markdown h3 {
                        font-size: 1.1rem !important;
                        font-weight: 600 !important;
                        color: #e6edf3 !important;
                        margin-bottom: 0.5rem !important;
                        margin-top: 1rem !important;
                    }
                    .wmde-markdown p {
                        color: #c9d1d9 !important;
                        margin-bottom: 0.75rem !important;
                        line-height: 1.7 !important;
                    }
                    .wmde-markdown ul, .wmde-markdown ol {
                        color: #c9d1d9 !important;
                        padding-left: 1.5rem !important;
                        margin-bottom: 0.75rem !important;
                    }
                    .wmde-markdown li {
                        color: #c9d1d9 !important;
                        margin-bottom: 0.25rem !important;
                    }
                    .wmde-markdown ul {
                        list-style-type: disc !important;
                    }
                    .wmde-markdown ol {
                        list-style-type: decimal !important;
                    }
                    .wmde-markdown code {
                        background-color: #21262d !important;
                        color: #79c0ff !important;
                        padding: 0.15rem 0.4rem !important;
                        border-radius: 4px !important;
                        font-size: 0.9em !important;
                    }
                    .wmde-markdown pre {
                        background-color: #161b22 !important;
                        border: 1px solid #333 !important;
                        border-radius: 8px !important;
                        padding: 1rem !important;
                        overflow-x: auto !important;
                    }
                    .wmde-markdown pre code {
                        background-color: transparent !important;
                        padding: 0 !important;
                    }
                    .wmde-markdown strong, .wmde-markdown b {
                        color: #ffffff !important;
                        font-weight: 700 !important;
                    }
                    .wmde-markdown em {
                        color: #c9d1d9 !important;
                    }
                    .wmde-markdown blockquote {
                        border-left: 4px solid #3b82f6 !important;
                        padding-left: 1rem !important;
                        color: #8b949e !important;
                        margin: 0.75rem 0 !important;
                        background-color: #161b22 !important;
                        padding: 0.5rem 1rem !important;
                        border-radius: 0 8px 8px 0 !important;
                    }
                    .wmde-markdown a {
                        color: #58a6ff !important;
                    }
                    .wmde-markdown hr {
                        border-color: #333 !important;
                        margin: 1.5rem 0 !important;
                    }
                    .wmde-markdown table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                        margin: 1rem 0 !important;
                    }
                    .wmde-markdown th, .wmde-markdown td {
                        border: 1px solid #333 !important;
                        padding: 0.5rem 0.75rem !important;
                    }
                    .wmde-markdown th {
                        background-color: #161b22 !important;
                        color: #ffffff !important;
                        font-weight: 600 !important;
                    }
                    .wmde-markdown td {
                        background-color: #0d1117 !important;
                        color: #c9d1d9 !important;
                    }
                    /* KaTeX Math Styling */
                    .wmde-markdown .katex {
                        color: #a5d6ff !important;
                        font-size: 1.1em !important;
                    }
                    .wmde-markdown .katex-display {
                        margin: 1rem 0 !important;
                        overflow-x: auto !important;
                    }
                `}</style>
                <MDEditor
                    value={value}
                    onChange={handleChange}
                    preview="live"
                    height={height}
                    visibleDragbar={false}
                    hideToolbar={false}
                    enableScroll={true}
                    textareaProps={{
                        placeholder: placeholder,
                        required: required,
                    }}
                    previewOptions={{
                        remarkPlugins: [remarkMath],
                        rehypePlugins: [rehypeKatex],
                    }}
                />
            </div>

            {/* <p className="text-[10px] text-gray-500">
                Supports Markdown and LaTeX math ($x^2$, $$\\sum_{i = 1}^n$$). Use toolbar for formatting.
            </p> */}
        </div>
    );
};

export default MarkdownEditor;