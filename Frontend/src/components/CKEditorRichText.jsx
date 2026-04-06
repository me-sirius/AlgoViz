import React, { useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading,
    Font,
    Alignment,
    List,
    Link,
    Image,
    ImageUpload,
    ImageResize,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    SimpleUploadAdapter,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    BlockQuote,
    CodeBlock,
    MediaEmbed,
    Indent,
    IndentBlock,
    Highlight,
    HorizontalLine,
    PasteFromOffice,
    TextTransformation,
    AutoImage,
    AutoLink,
    WordCount,
    Paragraph,
    Undo,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * CKEditor 5 Rich Text Editor Component
 *
 * A premium MS Word-like WYSIWYG editor with full formatting support.
 *
 * @param {string} content - The HTML content to display
 * @param {function} onChange - Callback fired when content changes, receives HTML string
 * @param {boolean} isDark - Whether to use dark mode styling
 * @param {string} placeholder - Placeholder text when editor is empty
 */
const CKEditorRichText = ({
    content = '',
    onChange,
    isDark = true,
    placeholder = 'Tell your story...'
}) => {
    const editorConfig = useMemo(() => ({
        licenseKey: 'GPL',
        plugins: [
            Essentials, Bold, Italic, Underline, Strikethrough,
            Heading, Font, Alignment, List, Link,
            Image, ImageUpload, ImageResize, ImageToolbar, ImageCaption, ImageStyle,
            SimpleUploadAdapter,
            Table, TableToolbar, TableProperties, TableCellProperties,
            BlockQuote, CodeBlock, MediaEmbed,
            Indent, IndentBlock, Highlight, HorizontalLine,
            PasteFromOffice, TextTransformation, AutoImage, AutoLink,
            WordCount, Paragraph, Undo,
        ],
        toolbar: {
            items: [
                'undo', 'redo',
                '|',
                'heading',
                '|',
                'bold', 'italic', 'underline', 'strikethrough',
                '|',
                'fontSize', 'fontColor',
                '|',
                'alignment',
                '|',
                'bulletedList', 'numberedList',
                '|',
                'outdent', 'indent',
                '|',
                'link', 'insertImage', 'insertTable', 'blockQuote', 'codeBlock',
                '|',
                'highlight', 'horizontalLine',
            ],
            shouldNotGroupWhenFull: false,
        },
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            ]
        },
        fontSize: {
            options: [10, 12, 14, 'default', 18, 20, 24, 28, 32],
        },
        image: {
            toolbar: [
                'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
                '|',
                'toggleImageCaption', 'imageTextAlternative',
                '|',
                'resizeImage',
            ],
            resizeOptions: [
                { name: 'resizeImage:original', value: null, label: 'Original' },
                { name: 'resizeImage:25', value: '25', label: '25%' },
                { name: 'resizeImage:50', value: '50', label: '50%' },
                { name: 'resizeImage:75', value: '75', label: '75%' },
            ],
        },
        simpleUpload: {
            uploadUrl: `${API_URL}/upload/blog-image`,
            withCredentials: false,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
        },
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
        },
        codeBlock: {
            languages: [
                { language: 'javascript', label: 'JavaScript' },
                { language: 'typescript', label: 'TypeScript' },
                { language: 'python', label: 'Python' },
                { language: 'java', label: 'Java' },
                { language: 'cpp', label: 'C++' },
                { language: 'c', label: 'C' },
                { language: 'css', label: 'CSS' },
                { language: 'html', label: 'HTML' },
                { language: 'sql', label: 'SQL' },
                { language: 'bash', label: 'Bash' },
                { language: 'json', label: 'JSON' },
                { language: 'plaintext', label: 'Plain text' },
            ],
        },
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
        },
        placeholder: placeholder,
    }), [placeholder]);

    // ── Dark Mode CSS ──
    const darkStyles = `
        /* ═══ GLOBAL CK BORDER RESET ═══ */
        .ck-editor-dark .ck.ck-editor {
            border: 1px solid rgba(255,255,255,0.12) !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 24px rgba(0,0,0,0.3) !important;
        }
        .ck-editor-dark .ck-rounded-corners .ck.ck-editor__top .ck-sticky-panel .ck-toolbar,
        .ck-editor-dark .ck.ck-editor__top .ck-sticky-panel .ck-toolbar {
            border: none !important;
            border-radius: 0 !important;
        }
        .ck-editor-dark .ck.ck-editor__top .ck-sticky-panel .ck-sticky-panel__content {
            border: none !important;
        }
        .ck-editor-dark .ck.ck-editor__top {
            border: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.10) !important;
        }
        .ck-editor-dark .ck-rounded-corners .ck.ck-editor__main > .ck-editor__editable,
        .ck-editor-dark .ck.ck-editor__main > .ck-editor__editable.ck-rounded-corners {
            border-radius: 0 !important;
        }

        /* ═══ EDITOR CONTENT AREA ═══ */
        .ck-editor-dark .ck.ck-editor__main > .ck-editor__editable {
            background: #0d1117 !important;
            color: #e6edf3 !important;
            border: none !important;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 18px;
            line-height: 1.8;
            padding: 24px 32px;
            min-height: 350px;
        }
        .ck-editor-dark .ck.ck-editor__editable.ck-focused {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
        }
        .ck-editor-dark .ck.ck-editor__editable.ck-blurred {
            border: none !important;
        }

        /* ═══ TOOLBAR ═══ */
        .ck-editor-dark .ck.ck-toolbar {
            background: #161b22 !important;
            border: none !important;
            padding: 6px 8px !important;
        }
        .ck-editor-dark .ck.ck-toolbar .ck-toolbar__separator {
            background: rgba(255,255,255,0.12) !important;
        }
        .ck-editor-dark .ck.ck-toolbar .ck-toolbar__items {
            border: none !important;
        }

        /* ═══ TOOLBAR BUTTONS ═══ */
        .ck-editor-dark .ck.ck-button,
        .ck-editor-dark .ck.ck-button.ck-off {
            color: #8b949e !important;
            background: transparent !important;
            border: none !important;
            border-radius: 6px !important;
            cursor: pointer !important;
        }
        .ck-editor-dark .ck.ck-button:hover,
        .ck-editor-dark .ck.ck-button.ck-off:hover {
            color: #e6edf3 !important;
            background: rgba(255,255,255,0.08) !important;
        }
        .ck-editor-dark .ck.ck-button.ck-on {
            color: #ffffff !important;
            background: rgba(99,102,241,0.25) !important;
        }
        .ck-editor-dark .ck.ck-button svg path {
            color: inherit !important;
        }
        /* Dropdown arrow buttons */
        .ck-editor-dark .ck.ck-splitbutton > .ck-splitbutton__arrow {
            border: none !important;
        }
        .ck-editor-dark .ck.ck-splitbutton:hover > .ck-splitbutton__arrow {
            background: rgba(255,255,255,0.08) !important;
        }

        /* ═══ DROPDOWNS ═══ */
        .ck-editor-dark .ck.ck-dropdown__panel {
            background: #1c2128 !important;
            border: 1px solid rgba(255,255,255,0.15) !important;
            border-radius: 10px !important;
            box-shadow: 0 16px 48px rgba(0,0,0,0.5) !important;
        }
        .ck-editor-dark .ck.ck-list {
            background: transparent !important;
        }
        .ck-editor-dark .ck.ck-list__item .ck-button {
            color: #c9d1d9 !important;
            border: none !important;
        }
        .ck-editor-dark .ck.ck-list__item .ck-button:hover {
            background: rgba(255,255,255,0.06) !important;
            color: #ffffff !important;
        }
        .ck-editor-dark .ck.ck-list__item .ck-button.ck-on {
            background: rgba(99,102,241,0.2) !important;
            color: #a5b4fc !important;
        }
        .ck-editor-dark .ck.ck-list__separator {
            background: rgba(255,255,255,0.1) !important;
        }
        /* Kill blue focus outlines on dropdown items */
        .ck-editor-dark .ck.ck-list__item .ck-button:focus,
        .ck-editor-dark .ck.ck-list__item .ck-button.ck-on:focus {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }
        .ck-editor-dark .ck.ck-button:focus,
        .ck-editor-dark .ck.ck-button:active {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }

        /* ═══ INPUT FIELDS (link, etc.) ═══ */
        .ck-editor-dark .ck.ck-input {
            background: #0d1117 !important;
            color: #e6edf3 !important;
            border: 1px solid rgba(255,255,255,0.18) !important;
            border-radius: 8px !important;
        }
        .ck-editor-dark .ck.ck-input:focus {
            border-color: #6366f1 !important;
            box-shadow: 0 0 0 2px rgba(99,102,241,0.25) !important;
        }
        .ck-editor-dark .ck.ck-labeled-field-view__status {
            color: #8b949e !important;
        }
        .ck-editor-dark .ck.ck-form__header {
            background: #161b22 !important;
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .ck-editor-dark .ck.ck-form__header .ck-form__header__label {
            color: #e6edf3 !important;
        }

        /* ═══ BALLOON / FORM PANELS ═══ */
        .ck-editor-dark .ck.ck-balloon-panel {
            background: #1c2128 !important;
            border: 1px solid rgba(255,255,255,0.15) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 48px rgba(0,0,0,0.4) !important;
        }
        .ck-editor-dark .ck.ck-balloon-panel[class*="_arrow_s"]::after {
            border-color: #1c2128 transparent !important;
        }
        .ck-editor-dark .ck.ck-balloon-panel[class*="_arrow_s"]::before {
            border-color: rgba(255,255,255,0.15) transparent !important;
        }
        .ck-editor-dark .ck.ck-balloon-panel[class*="_arrow_n"]::after {
            border-color: transparent transparent #1c2128 !important;
        }
        .ck-editor-dark .ck.ck-balloon-panel[class*="_arrow_n"]::before {
            border-color: transparent transparent rgba(255,255,255,0.15) !important;
        }

        /* ═══ CONTENT STYLES ═══ */
        .ck-editor-dark .ck-editor__editable h1 {
            font-size: 2em;
            font-weight: bold;
            color: #ffffff;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        .ck-editor-dark .ck-editor__editable h2 {
            font-size: 1.5em;
            font-weight: bold;
            color: #ffffff;
            margin-top: 1.25em;
            margin-bottom: 0.5em;
        }
        .ck-editor-dark .ck-editor__editable h3 {
            font-size: 1.25em;
            font-weight: 600;
            color: #e6edf3;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }
        .ck-editor-dark .ck-editor__editable blockquote {
            border-left: 4px solid #6366f1 !important;
            padding-left: 16px;
            color: #94a3b8;
            font-style: italic;
            background: rgba(99,102,241,0.05);
            border-radius: 0 8px 8px 0;
            padding: 12px 16px 12px 20px;
            margin: 1em 0;
        }
        .ck-editor-dark .ck-editor__editable pre {
            background: #161b22 !important;
            color: #e6edf3 !important;
            border-radius: 10px !important;
            padding: 16px 20px !important;
            border: 1px solid rgba(255,255,255,0.10);
            font-family: 'Fira Code', 'JetBrains Mono', monospace;
            font-size: 14px;
            line-height: 1.6;
        }
        .ck-editor-dark .ck-editor__editable code {
            background: rgba(255,255,255,0.08);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Fira Code', 'JetBrains Mono', monospace;
            font-size: 0.85em;
            color: #a5b4fc;
        }
        .ck-editor-dark .ck-editor__editable a {
            color: #58a6ff;
            text-decoration: underline;
            text-underline-offset: 3px;
        }
        .ck-editor-dark .ck-editor__editable hr {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.12);
            margin: 2em 0;
        }
        .ck-editor-dark .ck-editor__editable .table table {
            border-collapse: collapse;
        }
        .ck-editor-dark .ck-editor__editable .table th,
        .ck-editor-dark .ck-editor__editable .table td {
            border: 1px solid rgba(255,255,255,0.18) !important;
            padding: 10px 14px;
        }
        .ck-editor-dark .ck-editor__editable .table th {
            background: rgba(255,255,255,0.06) !important;
            font-weight: 600;
            color: #e6edf3;
        }
        .ck-editor-dark .ck-editor__editable .image > figcaption {
            background: rgba(255,255,255,0.05) !important;
            color: #8b949e !important;
            border: none !important;
        }

        /* ═══ PLACEHOLDER ═══ */
        .ck-editor-dark .ck.ck-editor__editable > .ck-placeholder::before {
            color: #484f58 !important;
            font-style: normal;
        }

        /* ═══ WORD COUNT ═══ */
        .ck-editor-dark .ck-word-count {
            color: #484f58 !important;
            font-size: 12px;
            padding: 8px 16px;
            background: rgba(255,255,255,0.02);
            border-top: 1px solid rgba(255,255,255,0.08);
        }

        /* ═══ RESIZE HANDLE ═══ */
        .ck-editor-dark .ck.ck-widget__resizer__handle {
            background: #6366f1 !important;
            border: 2px solid #0d1117 !important;
        }
    `;

    // ── Light Mode CSS ──
    const lightStyles = `
        .ck-editor-light .ck.ck-editor__main > .ck-editor__editable {
            background: #ffffff !important;
            color: #1f2937 !important;
            border: none !important;
            border-top: 1px solid #e5e7eb !important;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 18px;
            line-height: 1.8;
            padding: 24px 32px;
            min-height: 350px;
        }
        .ck-editor-light .ck.ck-editor__editable:focus {
            border: none !important;
            border-top: 1px solid #e5e7eb !important;
            box-shadow: none !important;
        }
        .ck-editor-light .ck.ck-toolbar {
            background: #f9fafb !important;
            border: none !important;
            border-bottom: 1px solid #e5e7eb !important;
            padding: 6px 8px !important;
        }
        .ck-editor-light .ck.ck-editor__top {
            border: none !important;
        }
        .ck-editor-light .ck.ck-editor {
            border: 1px solid #e5e7eb !important;
            border-radius: 12px !important;
            overflow: hidden;
        }
        .ck-editor-light .ck-editor__editable pre {
            background: #1f2937 !important;
            color: #e5e7eb !important;
            border-radius: 10px !important;
            padding: 16px 20px !important;
            font-family: 'Fira Code', 'JetBrains Mono', monospace;
            font-size: 14px;
        }
        .ck-editor-light .ck-editor__editable blockquote {
            border-left: 4px solid #3b82f6 !important;
            padding: 12px 16px 12px 20px;
            background: rgba(59,130,246,0.05);
            border-radius: 0 8px 8px 0;
            color: #6b7280;
            font-style: italic;
        }
        .ck-editor-light .ck-word-count {
            color: #9ca3af !important;
            font-size: 12px;
            padding: 8px 16px;
            border-top: 1px solid #e5e7eb;
        }
    `;

    const wrapperClass = isDark ? 'ck-editor-dark' : 'ck-editor-light';

    return (
        <div className={wrapperClass}>
            <style>{isDark ? darkStyles : lightStyles}</style>
            <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={content}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    if (onChange) {
                        onChange(data);
                    }
                }}
            />
        </div>
    );
};

export default CKEditorRichText;
