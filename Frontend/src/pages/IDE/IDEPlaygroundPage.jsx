import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Bug,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Columns3,
  Command,
  Copy,
  Edit3,
  File,
  FileCode,
  FileCode2,
  FilePlus2,
  Focus,
  FolderTree,
  Fullscreen,
  GitBranch,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Share2,
  Smartphone,
  Sparkles,
  Square,
  Trash2,
  Sun,
  Terminal,
  TestTube2,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../../core/context/ThemeContext";
const IDE_PLAYGROUND_INLINE_STYLES = String.raw`
/* ═══════════════════════════════════════════════════════════════
   AlgoViz IDE Playground — V2 (Kinetic Obsidian)
   Ground-up rewrite · LeetCode/OnlineGDB density
   ═══════════════════════════════════════════════════════════════ */

/* ── Page Root ── */
.idev-page {
  min-height: 100vh;
  height: 100vh;
  height: 100dvh;
  background:
    radial-gradient(circle at 10% 6%, rgba(76, 215, 246, 0.10), transparent 28%),
    radial-gradient(circle at 86% 10%, rgba(208, 188, 255, 0.08), transparent 32%),
    var(--bg-primary);
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .idev-page {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d30;
  --bg-elevated: #333337;
  --bg-highest: #3c3c3c;
  --bg-glass: rgba(30, 30, 30, 0.9);
  --bg-hover: #2a2d2e;
  --accent-primary: #007acc;
  --text-primary: #d4d4d4;
  --text-secondary: #b9b9b9;
  --text-muted: #8d8d8d;
  --border-default: rgba(255, 255, 255, 0.14);
  --border-hover: rgba(255, 255, 255, 0.24);
  --specular-highlight: rgba(255, 255, 255, 0.08);
  --accent-glow: rgba(0, 122, 204, 0.26);
  background: linear-gradient(180deg, #1f1f1f 0%, #181818 100%);
}

.surface-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.35;
  z-index: 0;
}

/* ── Ambient Orbs ── */
.idev-ambient-orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.idev-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.idev-orb-1 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(76, 215, 246, 0.11), transparent 70%);
  top: 3%;
  left: 5%;
  animation: orbDrift1 18s ease-in-out infinite;
}

.idev-orb-2 {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(208, 188, 255, 0.09), transparent 70%);
  top: 6%;
  right: 8%;
  animation: orbDrift2 22s ease-in-out infinite;
}

.idev-orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(76, 215, 246, 0.06), transparent 70%);
  bottom: 14%;
  left: 38%;
  animation: orbDrift3 20s ease-in-out infinite;
}

[data-theme="dark"] .idev-ambient-orbs {
  opacity: 0.34;
}

[data-theme="dark"] .idev-orb-1 {
  background: radial-gradient(circle, rgba(0, 122, 204, 0.1), transparent 72%);
}

[data-theme="dark"] .idev-orb-2 {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.04), transparent 74%);
}

[data-theme="dark"] .idev-orb-3 {
  background: radial-gradient(circle, rgba(0, 122, 204, 0.06), transparent 72%);
}

@keyframes orbDrift1 {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(28px, 18px); }
  66% { transform: translate(-14px, 32px); }
}

@keyframes orbDrift2 {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(-22px, 14px); }
  66% { transform: translate(18px, -18px); }
}

@keyframes orbDrift3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(22px, -26px); }
}

/* ── Page Inner ── */
.idev-page-inner {
  position: relative;
  z-index: 1;
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: var(--space-4) var(--space-5) var(--space-6);
  min-height: 100%;
  height: 100%;
  display: grid;
  gap: var(--space-3);
  grid-template-rows: auto auto 1fr auto;
}

/* ── Liquid Glass ── */
.liquid-glass {
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid var(--border-default);
  box-shadow: inset 0 1px 1px 0 var(--specular-highlight);
}

[data-theme="dark"] .liquid-glass {
  backdrop-filter: blur(12px) saturate(1.05);
  -webkit-backdrop-filter: blur(12px) saturate(1.05);
}

/* ══ Global Topbar ══ */
.idev-global-topbar {
  min-height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  position: sticky;
  top: var(--space-3);
  z-index: 5;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 16px -4px rgba(7, 13, 31, 0.5),
    0 0 0 1px var(--border-default);
}

.idev-topbar-left {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-code);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.idev-topbar-left strong {
  color: var(--text-primary);
}

.idev-topbar-center {
  display: flex;
  align-items: center;
  gap: 0;
}

.idev-topbar-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.idev-phase-pill {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  color: var(--accent-primary);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 40%, var(--border-default));
  background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
}

.idev-phase-pill-muted {
  color: var(--text-secondary);
  border-color: var(--border-default);
  background: var(--bg-tertiary);
}

/* ── Compact Mode Switcher (segmented pill) ── */
.idev-mode-switcher {
  display: inline-flex;
  align-items: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  padding: 3px;
  gap: 2px;
}

.idev-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;
}

.idev-mode-btn div {
  display: none;
}

.idev-mode-btn span {
  display: none;
}

.idev-mode-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.idev-mode-btn-active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 2px 6px -1px rgba(0, 0, 0, 0.3);
}

/* ══ Command Bar ══ */
.idev-command-bar {
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px var(--space-4);
  gap: var(--space-3);
  min-height: 48px;
  position: relative;
  z-index: 30;
  overflow: visible;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 14px -4px rgba(7, 13, 31, 0.45),
    0 0 0 1px var(--border-default);
}

.idev-command-left,
.idev-command-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.idev-command-cluster {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.idev-path-row {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-family: var(--font-code);
  font-size: var(--text-xs);
}

.idev-path-chip {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: inherit;
  transition: color 150ms ease, background 150ms ease;
}

.idev-path-chip:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.idev-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  font-weight: 500;
}

.idev-file-chip .idev-lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Language Picker ── */
.idev-language-picker {
  position: relative;
  z-index: 2;
}

.idev-language-picker-open {
  z-index: 60;
}

.idev-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-family: var(--font-code);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.idev-select-btn:hover {
  border-color: var(--accent-primary);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 12px var(--accent-glow);
}

.idev-chevron {
  transition: transform 180ms ease;
  opacity: 0.6;
}

.idev-chevron-open {
  transform: rotate(180deg);
}

/* Fix for Language Menu dropdown position and blur */
.idev-language-menu {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 228px; max-height: 336px;
  border-radius: var(--radius-lg); border: 1px solid var(--border-default);
  box-shadow: 0 12px 40px -8px rgba(0,0,0,0.5), 0 0 0 1px var(--border-default);
  z-index: 2200; overflow: hidden; display: flex; flex-direction: column;
}

.idev-language-menu-portal {
  position: fixed;
  right: auto;
  z-index: 5000;
  background: color-mix(in srgb, var(--bg-elevated) 94%, var(--bg-primary));
  pointer-events: auto;
}

.idev-menu-header {
  padding: 10px 14px;
  font-family: var(--font-body); font-size: 10px; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
  background: color-mix(in srgb, var(--bg-secondary) 40%, transparent);
  border-bottom: 1px solid var(--border-default);
}

.idev-menu-scroll { padding: 6px; overflow-y: auto; }

.idev-language-option {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  min-height: 44px;
  padding: 8px 10px;
  margin-bottom: 2px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary); cursor: pointer; transition: all 0.15s ease;
}

.idev-language-option:hover {
  background: color-mix(in srgb, var(--accent-primary) 10%, var(--bg-tertiary));
  border-color: color-mix(in srgb, var(--accent-primary) 32%, var(--border-default));
  transform: translateX(1px);
}

.idev-language-option.active {
  background: color-mix(in srgb, var(--accent-primary) 16%, var(--bg-tertiary));
  border-color: color-mix(in srgb, var(--accent-primary) 45%, var(--border-default));
}

.idev-opt-info { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.idev-opt-label { font-family: var(--font-body); font-size: 13px; font-weight: 600; }
.idev-opt-runtime { font-family: var(--font-code); font-size: 11px; color: var(--text-secondary); }
.idev-opt-check { color: var(--accent-primary); }

.idev-runtime-pill {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
}

/* ── Buttons ── */
.idev-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-code);
  font-size: var(--text-xs);
  font-weight: 600;
  transition: all 150ms ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.idev-icon-btn:hover {
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--accent-primary) 40%, var(--border-default));
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.idev-icon-btn:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.25);
}

.idev-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.15);
}

.idev-btn-secondary:hover {
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--accent-primary) 30%, var(--border-default));
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 10px rgba(0, 0, 0, 0.25);
}

.idev-btn-secondary:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.idev-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  background: linear-gradient(135deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary) 70%, #6366f1));
  color: #0C1324;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 4px 12px -2px rgba(76, 215, 246, 0.35),
    0 1px 3px rgba(0, 0, 0, 0.2);
}

.idev-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 6px 18px -3px rgba(76, 215, 246, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.2);
}

.idev-btn-primary:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .idev-btn-primary {
  border: 1px solid color-mix(in srgb, var(--accent-primary) 76%, #ffffff 4%);
  background: var(--accent-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px -3px rgba(0, 122, 204, 0.55);
}

[data-theme="dark"] .idev-btn-primary:hover {
  background: color-mix(in srgb, var(--accent-primary) 88%, #ffffff 12%);
  box-shadow: 0 4px 12px -4px rgba(0, 122, 204, 0.65);
}

[data-theme="dark"] .idev-btn-primary:active {
  background: color-mix(in srgb, var(--accent-primary) 90%, #000000 10%);
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.25);
}

/* ── Run Button Glow ── */
.idev-run-btn {
  position: relative;
  overflow: visible;
}

.idev-run-btn-busy {
  animation: runGlow 2s ease-in-out infinite;
}

@keyframes runGlow {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px -2px rgba(0,122,204,0.35), 0 0 0 0 rgba(0,122,204,0); }
  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px -2px rgba(0,122,204,0.35), 0 0 0 6px rgba(0,122,204,0.16); }
}

.idev-font-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.idev-font-size-pill {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  color: var(--text-muted);
  min-width: 32px;
  text-align: center;
}

.idev-mode-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  background: var(--bg-tertiary);
  color: var(--accent-primary);
  font-family: var(--font-code);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 150ms ease;
}

.idev-mode-pill:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-glow);
}

.idev-command-hint {
  font-family: var(--font-code);
  font-size: 10px;
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  background: var(--bg-tertiary);
}

/* ══════════════════════════════════════════════════════════════
   PREVIEW ZONE + WORKBENCH
   ══════════════════════════════════════════════════════════════ */
.idev-preview-zone {
  min-height: 0;
  position: relative;
  z-index: 1;
  display: flex;
}

.idev-preview-zone > * {
  flex: 1 1 auto;
  min-height: 0;
}

.idev-layout-frame {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.idev-workbench {
  position: relative;
  display: flex;
  min-height: 0;
  height: 100%;
}

.idev-workbench-main {
  flex: 1; display: grid; overflow: hidden;
  grid-template-columns: var(--idev-rail-width, 52px) minmax(0, 1fr) auto var(--idev-context-width, 320px);
  background: var(--bg-primary);
  min-height: 0;
  height: 100%;
}

/* ── Activity Rail ── */
.idev-rail {
  width: var(--idev-rail-width, 52px);
  min-width: var(--idev-rail-width, 52px);
  max-width: var(--idev-rail-width, 52px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2) 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-default);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  box-shadow: inset 1px 0 0 rgba(255,255,255,0.03), 2px 0 8px -2px rgba(0,0,0,0.15);
  transition: width 220ms ease, min-width 220ms ease, max-width 220ms ease;
  overflow: hidden;
}
.idev-rail-expanded { align-items: stretch; }
.idev-rail-stack { display: flex; flex-direction: column; gap: 2px; flex: 1; }

.idev-rail-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 0; border: none; background: transparent;
  color: var(--text-secondary); cursor: pointer; position: relative;
  border-radius: var(--radius-md); margin: 0 6px; transition: all 150ms ease;
}
.idev-rail-expanded .idev-rail-btn { justify-content: flex-start; padding: 8px 12px; }
.idev-rail-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }

.idev-rail-active {
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  box-shadow: inset 3px 0 0 var(--accent-primary);
}
.idev-rail-active::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  box-shadow: 0 0 16px var(--accent-glow); opacity: 0.4; pointer-events: none;
}

.idev-rail-label {
  display: inline-block;
  max-width: 0;
  overflow: hidden;
  font-family: var(--font-body); font-size: 11px; font-weight: 600;
  white-space: nowrap; opacity: 0; pointer-events: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-10px);
}
.idev-rail-expanded .idev-rail-label {
  max-width: 120px;
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-stack {
  gap: 6px;
  padding-top: 2px;
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-btn {
  gap: 0;
  margin: 0 auto;
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border-radius: 12px;
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-btn svg {
  flex-shrink: 0;
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-btn:hover {
  background: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-tertiary));
  color: var(--text-primary);
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-active {
  border: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-primary) 52%, transparent), 0 4px 10px -6px var(--accent-glow);
  background: color-mix(in srgb, var(--accent-primary) 18%, transparent);
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-active::after {
  opacity: 0.22;
}

.idev-rail-collapse {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  padding: 0; border: 1px solid var(--border-default); background: var(--bg-tertiary);
  color: var(--text-secondary); cursor: pointer; border-radius: var(--radius-md);
  margin: 4px auto; transition: all 150ms ease;
}
.idev-rail-expanded .idev-rail-collapse { width: auto; margin: 4px; padding: 0 8px; }
.idev-rail-collapse:hover { background: var(--bg-elevated); color: var(--text-primary); border-color: var(--accent-primary); }

.idev-tooltip {
  position: absolute; left: calc(100% + 8px); top: 50%; transform: translateY(-50%);
  padding: 4px 10px; background: var(--bg-elevated); color: var(--text-primary);
  font-family: var(--font-body); font-size: var(--text-xs); border-radius: var(--radius-md);
  white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 150ms ease;
  z-index: 15; border: 1px solid var(--border-default); box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.idev-rail-btn:hover .idev-tooltip { opacity: 1; }

/* ── Main Column ── */
.idev-main-column {
  display: grid;
  grid-template-rows: minmax(var(--idev-editor-height, 520px), var(--idev-editor-height, 520px)) auto minmax(0, 1fr);
  min-height: 0;
}
.idev-editor-wrap { min-height: 0; overflow: hidden; }

/* ── Editor Surface ── */
.idev-editor {
  display: flex; flex-direction: column; height: 100%;
  background: var(--bg-secondary);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -4px rgba(7,13,31,0.4);
}

.idev-editor-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 var(--space-3); min-height: 36px;
  border-bottom: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--bg-secondary) 80%, var(--bg-primary));
}

.idev-tab-row { display: flex; align-items: center; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.idev-tab-row::-webkit-scrollbar { display: none; }
.idev-tab {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 0 var(--space-4); height: 36px; min-width: 120px;
  border: none; background: transparent;
  color: var(--text-secondary); font-family: var(--font-body); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.2s ease; position: relative;
  border-right: 1px solid var(--border-default);
}
.idev-tab:hover { background: var(--bg-hover); color: var(--text-primary); }
.idev-tab.active,
.idev-tab-active {
  background: color-mix(in srgb, var(--bg-secondary) 50%, var(--bg-primary));
  color: var(--accent-primary);
}
.idev-tab.active::after,
.idev-tab-active::after {
  content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-glow);
}
.idev-tab-close {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 6px;
  margin-left: var(--space-2);
  opacity: 0;
  color: var(--text-muted);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.idev-tab:hover .idev-tab-close { opacity: 0.8; }
.idev-tab-close:hover {
  opacity: 1;
  color: #ef4444;
  background: color-mix(in srgb, #ef4444 14%, var(--bg-tertiary));
  border-color: color-mix(in srgb, #ef4444 46%, var(--border-default));
}

.idev-tab-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  margin-left: 6px;
  flex: 0 0 auto;
  transition: all 0.2s ease;
}

.idev-tab-add:hover {
  color: var(--text-primary);
  border-color: var(--accent-primary);
  background: var(--bg-elevated);
}

.idev-code-surface { flex: 1; min-height: 0; position: relative; overflow: hidden; }
.idev-monaco-wrap { height: 100%; }

.idev-monaco-wrap .monaco-editor .margin {
  background: transparent !important;
  border-right: none !important;
}

.idev-monaco-wrap .monaco-editor .glyph-margin,
.idev-monaco-wrap .monaco-editor .line-numbers {
  background: transparent !important;
}

.idev-monaco-wrap .monaco-editor .glyph-margin {
  border-right: none !important;
  box-shadow: none !important;
}

.idev-monaco-wrap .monaco-editor .margin-view-overlays .cgmr {
  cursor: pointer;
  position: relative;
}

.idev-format-sweep {
  position: absolute; top: 0; left: 0; width: 4px; height: 100%;
  background: linear-gradient(to bottom, transparent, var(--accent-primary), transparent);
  pointer-events: none; z-index: 5;
}

/* Monaco decorations */
.idev-monaco-breakpoint-slot,
.idev-monaco-breakpoint-glyph {
  background-image: none !important;
  position: relative;
}

.idev-monaco-breakpoint-slot::before,
.idev-monaco-breakpoint-glyph::before {
  content: "";
  position: absolute;
  right: 9px;
  top: 50%;
  width: 11px;
  height: 11px;
  border-radius: 999px;
  transform: translateY(-50%);
  box-sizing: border-box;
}

.idev-monaco-breakpoint-slot {
  opacity: 1 !important;
}

.idev-monaco-breakpoint-slot::before {
  background: color-mix(in srgb, var(--bg-primary) 96%, #f7fcff 4%);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 65%, var(--text-muted));
  opacity: 0.42;
  transition:
    opacity 0.16s ease,
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.idev-monaco-breakpoint-slot:hover::before,
.idev-monaco-wrap .monaco-editor .margin-view-overlays .cgmr:hover .idev-monaco-breakpoint-slot::before {
  opacity: 0.98;
  transform: translateY(-50%) scale(1.08);
  border-color: color-mix(in srgb, var(--accent-primary) 84%, #d9f5ff 16%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-primary) 28%, transparent);
}

.idev-monaco-breakpoint-glyph {
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--accent-primary) 45%, transparent));
}

.idev-monaco-breakpoint-glyph::before {
  background: radial-gradient(circle at 32% 30%, #d8f7ff 0%, #6fe1ff 34%, #20b9dd 62%, #0c6f8c 100%);
  transition: transform 0.16s ease;
}

.idev-monaco-breakpoint-glyph:hover::before,
.idev-monaco-wrap .monaco-editor .margin-view-overlays .cgmr:hover .idev-monaco-breakpoint-glyph::before {
  transform: translateY(-50%) scale(1.08);
}

.idev-monaco-debug-line { background: color-mix(in srgb, var(--accent-primary) 15%, transparent) !important; }
.idev-monaco-debug-line-margin { background: var(--accent-primary); width: 3px !important; }

/* ── Output Panel ── */
.idev-output-wrap { min-height: 0; overflow: hidden; }

.idev-output-panel {
  display: flex; flex-direction: column; height: 100%;
  background: var(--bg-secondary); border-top: 1px solid var(--border-default);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), 0 -2px 8px -2px rgba(7,13,31,0.2);
}

.idev-output-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px var(--space-3); min-height: 32px;
  border-bottom: 1px solid var(--border-default);
  transition: background 300ms ease;
}
.idev-output-header-success { background: color-mix(in srgb, #22C55E 8%, transparent); }
.idev-output-header-error { background: color-mix(in srgb, #EF4444 8%, transparent); }

.idev-output-title-wrap { display: flex; align-items: center; gap: var(--space-2); }
.idev-output-title-wrap h3 {
  font-family: var(--font-code); font-size: var(--text-xs); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin: 0;
}

.idev-metrics-wrap { display: flex; gap: 6px; }
.idev-metric-badge {
  font-family: var(--font-code); font-size: 10px; font-weight: 600;
  padding: 2px 8px; border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--accent-primary) 15%, transparent);
  color: var(--accent-primary);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent);
}

.idev-output-tabs { display: flex; gap: 0; padding: 0 var(--space-3); border-bottom: 1px solid var(--border-default); }
.idev-output-tab {
  padding: 6px 14px; border: none; background: transparent;
  color: var(--text-secondary); font-family: var(--font-code); font-size: var(--text-xs);
  font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent;
  transition: all 150ms ease;
}
.idev-output-tab:hover { color: var(--text-primary); }
.idev-output-tab-active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }

.idev-output-body {
  flex: 1; overflow-y: auto; padding: var(--space-3);
  font-family: var(--font-code); font-size: var(--text-xs); line-height: 1.65;
  color: var(--text-primary); position: relative;
}

.idev-output-line { white-space: pre-wrap; word-break: break-all; min-height: 1.4em; }

.idev-exit-badge {
  display: inline-block; margin-top: var(--space-2);
  font-family: var(--font-code); font-size: 10px; font-weight: 600;
  padding: 2px 8px; border-radius: var(--radius-full);
}
.idev-exit-success {
  color: #22C55E; background: color-mix(in srgb, #22C55E 12%, transparent);
  border: 1px solid color-mix(in srgb, #22C55E 25%, transparent);
}
.idev-exit-error {
  color: #EF4444; background: color-mix(in srgb, #EF4444 12%, transparent);
  border: 1px solid color-mix(in srgb, #EF4444 25%, transparent);
}
.idev-output-panel-compact {
  border-radius: var(--radius-lg); border: 1px solid var(--border-default); max-height: 280px;
}

/* ══════════════════════════════════════════════════════════════
   RESIZERS
   ══════════════════════════════════════════════════════════════ */
.idev-pane-resizer {
  border: none; background: transparent; padding: 0; cursor: col-resize; position: relative;
  display: flex; align-items: center; justify-content: center; touch-action: none;
}
.idev-pane-resizer::after {
  content: ""; position: absolute; border-radius: 2px; background: var(--border-default);
  transition: background 150ms ease;
}
.idev-pane-resizer:hover::after, .idev-pane-resizer-active::after {
  background: var(--accent-primary);
}
.idev-pane-resizer-vertical { width: 8px; cursor: col-resize; }
.idev-pane-resizer-vertical::after { width: 2px; height: 32px; }
.idev-pane-resizer-horizontal { height: 8px; cursor: row-resize; }
.idev-pane-resizer-horizontal::after { height: 2px; width: 32px; }

/* ══════════════════════════════════════════════════════════════
   CONTEXT PANEL (RIGHT SIDE)
   ══════════════════════════════════════════════════════════════ */
.idev-context-wrap {
  min-height: 0;
  overflow: visible;
  position: relative;
}

.idev-context-panel-toggle {
  position: absolute;
  left: -28px;
  top: 1px;
  width: 26px;
  height: 34px;
  border-radius: 8px 0 0 8px;
  border: 1px solid var(--border-default);
  border-right: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 4;
  transition: color 140ms ease, border-color 140ms ease, transform 140ms ease;
}

.idev-context-panel-toggle:hover {
  color: var(--text-primary);
  border-color: var(--accent-primary);
  transform: translateX(-1px);
}

.idev-context-reopen {
  width: 30px;
  min-width: 30px;
  border: 1px solid var(--border-default);
  border-left: none;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 140ms ease, border-color 140ms ease, transform 140ms ease;
}

.idev-context-reopen:hover {
  color: var(--text-primary);
  border-color: var(--accent-primary);
  transform: translateX(1px);
}

.idev-context-reopen svg {
  transform: rotate(180deg);
}

.idev-context-panel {
  height: 100%; overflow-y: auto; padding: var(--space-3);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-default);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  box-shadow: inset -1px 0 0 rgba(255,255,255,0.03), -2px 0 8px -2px rgba(0,0,0,0.15);
}

.idev-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-3);
}
.idev-panel-header h3 {
  font-family: var(--font-code); font-size: var(--text-xs); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin: 0;
}

.idev-textarea {
  width: 100%; min-height: 100px; padding: var(--space-2); border-radius: var(--radius-md);
  border: 1px solid var(--border-default); background: var(--bg-primary);
  color: var(--text-primary); font-family: var(--font-code); font-size: var(--text-xs);
  resize: vertical; transition: border-color 150ms ease;
}
.idev-textarea:focus { border-color: var(--accent-primary); outline: none; box-shadow: 0 0 0 2px var(--accent-glow); }

.idev-chip-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: var(--space-2); }
.idev-input-chip {
  padding: 4px 10px; border-radius: var(--radius-full);
  border: 1px solid var(--border-default); background: var(--bg-tertiary);
  color: var(--text-secondary); font-family: var(--font-code); font-size: var(--text-xs);
  cursor: pointer; transition: all 150ms ease;
}
.idev-input-chip:hover {
  background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
  border-color: var(--accent-primary); color: var(--accent-primary);
}

.idev-run-profile { margin-top: var(--space-4); }
.idev-run-profile h3 {
  font-family: var(--font-code); font-size: var(--text-xs); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);
  margin: 0 0 var(--space-2) 0;
}

.idev-kv-row {
  display: flex; justify-content: space-between; padding: 4px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--border-default) 50%, transparent);
  font-size: var(--text-xs);
}
.idev-kv-row span { color: var(--text-secondary); }
.idev-kv-row strong { color: var(--text-primary); font-weight: 500; }

.idev-note-row {
  display: flex; align-items: center; gap: 6px; margin-top: var(--space-3);
  padding: 8px; border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--accent-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
  color: var(--accent-primary); font-size: var(--text-xs);
}

/* ── Debugger Panel ── */
.idev-debugger-panel,
.idev-debug-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
}

.idev-debug-state {
  font-family: var(--font-code);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--bg-tertiary) 86%, transparent);
}

.idev-debug-state-idle {
  color: var(--text-secondary);
  border-color: color-mix(in srgb, var(--text-muted) 45%, var(--border-default));
}

.idev-debug-state-running {
  color: var(--accent-primary);
  border-color: color-mix(in srgb, var(--accent-primary) 52%, var(--border-default));
  background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
}

.idev-debug-state-paused {
  color: #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 46%, var(--border-default));
  background: color-mix(in srgb, #f59e0b 14%, transparent);
}

.idev-debug-toolbar,
.idev-debug-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.idev-debug-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--bg-primary) 82%, transparent);
}

.idev-debug-summary p {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.idev-debug-grid {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: minmax(0, 1fr);
}

.idev-debug-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-primary);
  padding: var(--space-2) var(--space-3);
}

.idev-debug-card h4 {
  margin: 0 0 var(--space-2) 0;
  font-family: var(--font-code);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.idev-debug-card ul {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-code);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.idev-watch-table {
  display: grid;
  gap: 6px;
}

.idev-watch-head,
.idev-watch-row {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.8fr) auto;
  align-items: center;
  gap: 8px;
}

.idev-watch-head {
  padding: 0 6px 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--border-default) 74%, transparent);
  font-family: var(--font-code);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.idev-watch-row {
  padding: 6px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--border-default) 78%, transparent);
  background: color-mix(in srgb, var(--bg-secondary) 82%, transparent);
  font-family: var(--font-code);
  font-size: var(--text-xs);
}

.idev-watch-row span,
.idev-watch-row strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.idev-watch-row strong {
  color: var(--text-primary);
}

.idev-watch-pin,
.idev-pin-btn {
  justify-self: end;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  font-family: var(--font-code);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 150ms ease;
}

.idev-watch-pin:hover,
.idev-pin-btn:hover {
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--accent-primary) 54%, var(--border-default));
}

.idev-watch-pin-active,
.idev-pin-active {
  color: var(--accent-primary);
  border-color: color-mix(in srgb, var(--accent-primary) 62%, var(--border-default));
  background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
}

/* ── Test Cases Panel ── */
.idev-tests-panel,
.idev-test-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
}

.idev-tests-badge {
  font-family: var(--font-code);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
}

.idev-tests-badge-good {
  color: #22c55e;
  border-color: color-mix(in srgb, #22c55e 44%, var(--border-default));
  background: color-mix(in srgb, #22c55e 14%, transparent);
}

.idev-tests-badge-mid {
  color: #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 42%, var(--border-default));
  background: color-mix(in srgb, #f59e0b 14%, transparent);
}

.idev-tests-badge-bad {
  color: #ef4444;
  border-color: color-mix(in srgb, #ef4444 42%, var(--border-default));
  background: color-mix(in srgb, #ef4444 12%, transparent);
}

.idev-tests-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.idev-tests-progress,
.idev-progress-bar {
  height: 5px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bg-tertiary) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--border-default) 62%, transparent);
  overflow: hidden;
}

.idev-tests-progress-fill,
.idev-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary) 68%, #40d3ff));
}

.idev-tests-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.idev-test-card {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.idev-test-pass,
.idev-test-card-pass {
  border-color: color-mix(in srgb, #22c55e 42%, var(--border-default));
}

.idev-test-fail,
.idev-test-card-fail {
  border-color: color-mix(in srgb, #ef4444 42%, var(--border-default));
}

.idev-test-running,
.idev-test-card-running {
  border-color: color-mix(in srgb, var(--accent-primary) 44%, var(--border-default));
}

.idev-test-pending {
  border-color: color-mix(in srgb, var(--border-default) 85%, transparent);
}

.idev-test-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.idev-test-title-wrap strong {
  margin: 0;
  font-size: calc(var(--text-sm) + 1px);
  color: var(--text-primary);
}

.idev-test-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.idev-test-field > span {
  font-family: var(--font-code);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.idev-test-stdin,
.idev-test-expected {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-code);
  font-size: var(--text-sm);
  line-height: 1.5;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.idev-test-stdin {
  min-height: 72px;
  padding: 10px 12px;
  resize: vertical;
}

.idev-test-expected {
  height: 40px;
  padding: 0 12px;
}

.idev-test-stdin:focus,
.idev-test-expected:focus {
  border-color: var(--accent-primary);
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-primary) 18%, transparent);
}

.idev-test-bottom-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(110px, 0.42fr);
  gap: var(--space-2);
  align-items: end;
}

.idev-test-got {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 40px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--bg-secondary) 86%, transparent);
}

.idev-test-got span {
  font-family: var(--font-code);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.idev-test-got strong {
  color: var(--text-primary);
  font-size: calc(var(--text-sm) + 1px);
  overflow-wrap: anywhere;
}

.idev-test-diff {
  display: grid;
  gap: 4px;
  margin-top: 2px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, #ef4444 34%, var(--border-default));
  background: color-mix(in srgb, #ef4444 9%, transparent);
  color: #ef4444;
  font-family: var(--font-code);
  font-size: 11px;
}

.idev-test-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

/* ── AI Assist Panel ── */
.idev-ai-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
}

.idev-ai-beta {
  font-family: var(--font-code);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.idev-ai-quick-actions,
.idev-ai-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.idev-ai-quick-chip,
.idev-ai-chip-wrap button {
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  padding: 5px 12px;
  cursor: pointer;
  transition: all 150ms ease;
}

.idev-ai-quick-chip:hover,
.idev-ai-chip-wrap button:hover {
  border-color: color-mix(in srgb, var(--accent-primary) 62%, var(--border-default));
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
}

.idev-ai-thread,
.idev-ai-messages {
  flex: 1;
  min-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-right: 2px;
}

.idev-ai-msg,
.idev-ai-bubble {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.55;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.idev-ai-msg p {
  margin: 0;
}

.idev-ai-msg-user,
.idev-ai-bubble-user {
  background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 26%, var(--border-default));
  align-self: flex-end;
  color: var(--text-primary);
}

.idev-ai-msg-assistant,
.idev-ai-bubble-assistant {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  align-self: flex-start;
  color: var(--text-primary);
}

.idev-ai-code-wrap,
.idev-ai-code-block {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--border-default) 82%, transparent);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--bg-tertiary) 90%, transparent);
}

.idev-ai-code {
  margin: 0;
  padding: 10px 40px 10px 10px;
  font-family: var(--font-code);
  font-size: var(--text-xs);
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
}

.idev-ai-code-wrap .idev-icon-btn,
.idev-ai-copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
}

.idev-ai-input-row {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-1);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-default);
}

.idev-ai-input-row .idev-textarea {
  min-height: 76px;
  resize: vertical;
}

.idev-ai-input-row .idev-btn-primary {
  min-width: 120px;
  align-self: stretch;
  justify-content: center;
}

.idev-complexity-badge {
  display: inline-flex; align-items: center; gap: 4px; margin-top: var(--space-2);
  padding: 4px 10px; border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--accent-secondary, #d0bcff) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-secondary, #d0bcff) 25%, transparent);
  color: var(--accent-secondary, #d0bcff); font-family: var(--font-code); font-size: 10px;
}

/* ── History Panel ── */
.idev-history-panel { display: flex; flex-direction: column; gap: var(--space-3); }
.idev-history-note {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}
.idev-history-list { display: flex; flex-direction: column; gap: var(--space-2); }
.idev-history-card {
  padding: var(--space-3); border-radius: var(--radius-md);
  border: 1px solid var(--border-default); background: var(--bg-primary);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.idev-history-card:hover { border-color: color-mix(in srgb, var(--accent-primary) 40%, var(--border-default)); }
.idev-history-card-active { border-color: var(--accent-primary); box-shadow: 0 0 10px var(--accent-glow); }

.idev-history-card header,
.idev-history-top { display: flex; align-items: center; justify-content: space-between; }
.idev-history-card header strong,
.idev-history-top strong {
  font-size: calc(var(--text-sm) + 1px);
  color: var(--text-primary);
}

.idev-history-card header span,
.idev-history-top time {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-code);
}

.idev-history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-secondary);
  font-family: var(--font-code);
}

.idev-history-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid color-mix(in srgb, var(--border-default) 80%, transparent);
  background: color-mix(in srgb, var(--bg-tertiary) 86%, transparent);
}

.idev-history-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .idev-test-bottom-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .idev-ai-input-row {
    flex-direction: column;
  }

  .idev-ai-input-row .idev-btn-primary {
    width: 100%;
  }

  .idev-watch-head,
  .idev-watch-row {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) auto;
  }

  .idev-watch-head span:nth-child(3),
  .idev-watch-row span:nth-child(3) {
    display: none;
  }
}

/* ══════════════════════════════════════════════════════════════
   STATUS BAR
   ══════════════════════════════════════════════════════════════ */
.idev-status-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px var(--space-4); min-height: 28px;
  background: var(--bg-secondary); border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.04),
    0 -4px 12px -4px rgba(7,13,31,0.3);
  font-family: var(--font-code); font-size: 11px;
}

.idev-status-left, .idev-status-right {
  display: flex; align-items: center; gap: var(--space-3);
}
.idev-status-left span { color: var(--text-secondary); }

.idev-status-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 8px; border-radius: var(--radius-full);
  font-weight: 600; font-size: 10px; letter-spacing: 0.03em;
}
.idev-status-chip::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
}
.idev-status-ready { color: var(--text-secondary); }
.idev-status-ready::before { background: var(--text-muted); }
.idev-status-compiling, .idev-status-running {
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
}
.idev-status-compiling::before, .idev-status-running::before {
  background: var(--accent-primary); animation: statusPulse 1.5s ease-in-out infinite;
}
.idev-status-done { color: #22C55E; }
.idev-status-done::before { background: #22C55E; }

@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.idev-status-kbd {
  padding: 1px 6px; border-radius: var(--radius-sm);
  border: 1px solid var(--border-default); background: var(--bg-tertiary);
  color: var(--text-muted); font-size: 10px;
}
.idev-status-cloud { color: var(--text-muted); font-size: 10px; }

/* ══════════════════════════════════════════════════════════════
   COMMAND PALETTE
   ══════════════════════════════════════════════════════════════ */
/* ══ Command Palette ══ */
.idev-command-palette-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: flex-start; justify-content: center; padding-top: 15vh;
}
.idev-command-palette-card {
  width: min(640px, 92vw); max-height: 70vh;
  display: flex; flex-direction: column; overflow: hidden;
  border-radius: var(--radius-xl);
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 20%, var(--border-default));
  box-shadow:
    0 16px 48px -8px rgba(7,13,31,0.8),
    0 0 0 1px var(--border-default),
    0 0 40px -12px var(--accent-glow);
}
.idev-command-search-row {
  border-bottom: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--bg-secondary) 60%, var(--bg-elevated));
}
.idev-command-search {
  flex: 1; border: none; background: transparent; color: var(--text-primary);
  font-family: var(--font-body); font-size: var(--text-sm); outline: none;
}
.idev-command-search::placeholder { color: var(--text-muted); }
.idev-command-list { flex: 1; overflow-y: auto; padding: var(--space-2); }
.idev-command-empty {
  text-align: center; color: var(--text-muted); padding: var(--space-4);
  font-size: var(--text-sm);
}
.idev-command-group {
  font-family: var(--font-code); font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--accent-primary);
  padding: var(--space-2) var(--space-2) 4px; margin: 0;
}
.idev-command-item {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 8px var(--space-3); border: none; background: transparent;
  color: var(--text-primary); font-size: var(--text-sm); font-family: var(--font-body);
  border-radius: var(--radius-md); cursor: pointer; transition: all 120ms ease;
}
.idev-command-item:hover, .idev-command-item-active {
  background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
  box-shadow: inset 3px 0 0 var(--accent-primary);
}
.idev-command-shortcut {
  font-family: var(--font-code); font-size: 10px; font-weight: 600;
  color: var(--text-muted);
  padding: 2px 6px; border-radius: var(--radius-sm);
  background: var(--bg-tertiary); border: 1px solid var(--border-default);
}

/* ══ Language Switch Dialog ══ */
.idev-language-switch-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10010;
  background: rgba(5, 10, 24, 0.56);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.idev-language-switch-card {
  width: min(540px, 92vw);
  border-radius: var(--radius-xl);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 24%, var(--border-default));
  background: color-mix(in srgb, var(--bg-elevated) 92%, transparent);
  box-shadow:
    0 22px 52px -14px rgba(7, 13, 31, 0.86),
    0 0 0 1px var(--border-default),
    0 0 34px -18px var(--accent-glow);
  overflow: hidden;
}

.idev-language-switch-header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--border-default) 76%, transparent);
}

.idev-language-switch-header h3 {
  margin: 0;
  font-family: var(--font-body);
  font-size: calc(var(--text-base) + 1px);
  font-weight: 700;
  color: var(--text-primary);
}

.idev-language-switch-header p {
  margin: 6px 0 0;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.idev-language-switch-options {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
}

.idev-language-switch-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  text-align: left;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--border-default) 90%, transparent);
  background: color-mix(in srgb, var(--bg-primary) 86%, transparent);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 150ms ease;
}

.idev-language-switch-option:hover {
  border-color: color-mix(in srgb, var(--accent-primary) 46%, var(--border-default));
  background: color-mix(in srgb, var(--accent-primary) 12%, var(--bg-primary));
  transform: translateY(-1px);
}

.idev-language-switch-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 30%, var(--border-default));
  background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
  color: var(--accent-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.idev-language-switch-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.idev-language-switch-copy strong {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.idev-language-switch-copy span {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.45;
}

.idev-language-switch-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0 16px 16px;
}

/* ══════════════════════════════════════════════════════════════
   FOCUS MODE
   ══════════════════════════════════════════════════════════════ */
.idev-focus-mode {
  display: flex; flex-direction: column; gap: var(--space-2);
  flex: 1; min-height: 520px;
}
.idev-focus-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px var(--space-4);
  border-radius: var(--radius-lg);
  min-height: 50px;
}
.idev-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-code); font-size: var(--text-xs); color: var(--text-secondary);
  min-width: 0;
  white-space: nowrap;
}

.idev-breadcrumb-back {
  border: 1px solid color-mix(in srgb, var(--border-default) 80%, transparent);
  background: color-mix(in srgb, var(--bg-secondary) 65%, transparent);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-code);
  font-size: var(--text-xs);
  line-height: 1;
  cursor: pointer;
  transition: all 150ms ease;
}

.idev-breadcrumb-back:hover {
  border-color: color-mix(in srgb, var(--accent-primary) 46%, var(--border-default));
  background: color-mix(in srgb, var(--accent-primary) 12%, var(--bg-secondary));
}

.idev-divider {
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.idev-breadcrumb-file {
  color: var(--text-primary);
  font-family: var(--font-code);
  font-size: var(--text-sm);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}
.idev-focus-actions { display: flex; align-items: center; gap: var(--space-2); }
.idev-diagnostics-strip {
  display: flex; gap: var(--space-3); padding: 6px var(--space-3);
  border-radius: var(--radius-md); background: var(--bg-secondary);
  border: 1px solid var(--border-default); font-size: var(--text-xs);
}
.idev-diag-success { display: flex; align-items: center; gap: 4px; color: #22C55E; }
.idev-diag-warning { display: flex; align-items: center; gap: 4px; color: #F59E0B; }
.idev-focus-output-drawer {
  border-radius: var(--radius-lg); border: 1px solid var(--border-default);
  overflow: hidden; max-height: 260px;
}

/* Focus Mode Global Hiding */
body.idev-page-focus .idev-global-topbar,
body.idev-page-focus .idev-command-bar,
body.idev-page-focus .idev-status-bar {
  display: none !important;
}

body.idev-page-focus .idev-page-inner {
  padding: 0 !important;
  grid-template-rows: 1fr !important;
}

body.idev-page-focus .idev-preview-zone { padding: 0 !important; }
body.idev-page-focus .surface-grain::before { opacity: 0.05; }

/* ══════════════════════════════════════════════════════════════
   EXPLORER PANEL
   ══════════════════════════════════════════════════════════════ */
.idev-explorer { display: flex; flex-direction: column; height: 100%; }
.idev-explorer-header {
  padding: var(--space-3) var(--space-4);
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border-default);
}
.idev-explorer-title {
  font-family: var(--font-body); font-size: 11px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
}
.idev-explorer-actions { display: flex; gap: var(--space-1); }

.idev-file-list { flex: 1; overflow-y: auto; padding: var(--space-2); }
.idev-file-item {
  width: 100%; display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-3); margin-bottom: 1px;
  border: none; background: transparent; border-radius: var(--radius-md);
  color: var(--text-secondary); cursor: pointer; transition: all 0.15s ease;
  position: relative;
}
.idev-file-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.idev-file-item.active { background: color-mix(in srgb, var(--accent-primary) 12%, var(--bg-hover)); color: var(--accent-primary); }

.idev-file-name { font-family: var(--font-body); font-size: 13px; flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; }

.idev-file-item-actions {
  display: flex; gap: 4px; opacity: 0; transition: opacity 120ms ease;
}
.idev-file-item:hover .idev-file-item-actions { opacity: 1; }
.idev-file-action-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border: none; background: transparent;
  color: var(--text-muted); border-radius: var(--radius-sm); cursor: pointer;
  transition: all 120ms ease;
}
.idev-file-action-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  transform: translateY(-1px);
}
.idev-file-action-btn-danger:hover { background: rgba(239,68,68,0.15); color: #EF4444; }

.idev-new-file-input {
  width: 100%; padding: 6px 10px; border: 1px solid var(--accent-primary);
  background: var(--bg-tertiary); color: var(--text-primary);
  font-family: var(--font-code); font-size: var(--text-xs);
  border-radius: var(--radius-md); outline: none;
}
.idev-new-file-input::placeholder { color: var(--text-muted); }

.idev-import-zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-2); padding: var(--space-4);
  border: 2px dashed var(--border-default); border-radius: var(--radius-lg);
  color: var(--text-muted); font-size: var(--text-xs); font-family: var(--font-body);
  cursor: pointer; transition: all 150ms ease; text-align: center;
}
.idev-import-zone:hover, .idev-import-zone-active {
  border-color: var(--accent-primary); background: color-mix(in srgb, var(--accent-primary) 6%, transparent);
  color: var(--text-secondary);
}

.idev-guest-banner {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 8px var(--space-3); border-radius: var(--radius-md);
  background: color-mix(in srgb, #F59E0B 10%, var(--bg-tertiary));
  border: 1px solid color-mix(in srgb, #F59E0B 30%, var(--border-default));
  font-size: var(--text-xs); font-family: var(--font-body); color: var(--text-secondary);
}
.idev-guest-banner p {
  margin: 0;
  flex: 1;
  line-height: 1.45;
}
.idev-guest-banner strong { color: #F59E0B; font-weight: 600; }

.idev-guest-btn {
  border: 1px solid color-mix(in srgb, #F59E0B 55%, var(--border-default));
  background: color-mix(in srgb, #F59E0B 18%, var(--bg-primary));
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease, border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
}

.idev-guest-btn:hover {
  background: color-mix(in srgb, #F59E0B 28%, var(--bg-primary));
  border-color: color-mix(in srgb, #F59E0B 80%, var(--border-default));
  transform: translateY(-1px);
  box-shadow: 0 4px 10px -4px rgba(245, 158, 11, 0.5);
}

.idev-guest-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, #F59E0B 70%, transparent);
  outline-offset: 2px;
}

.idev-rename-input {
  background: transparent; border: none; border-bottom: 1px solid var(--accent-primary);
  color: var(--text-primary); font-family: var(--font-code); font-size: var(--text-xs);
  outline: none; width: 100%; padding: 0;
}

/* ══════════════════════════════════════════════════════════════
   MOBILE MODE
   ══════════════════════════════════════════════════════════════ */
.idev-mobile-wrap { display: flex; justify-content: center; padding: var(--space-3); }
.idev-mobile-device {
  width: min(420px, 100%); min-height: 600px; border-radius: var(--radius-xl, 20px);
  background: var(--bg-secondary); border: 1px solid var(--border-default);
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 8px 32px -6px rgba(7,13,31,0.5);
}
.idev-mobile-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-3); border-bottom: 1px solid var(--border-default);
  font-family: var(--font-body); font-weight: 600; font-size: var(--text-sm);
}
.idev-mobile-main { flex: 1; min-height: 0; overflow: hidden; }
.idev-mobile-pane { padding: var(--space-3); overflow-y: auto; height: 100%; }
.idev-mobile-pane h3 {
  font-family: var(--font-code); font-size: var(--text-xs); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);
  margin: 0 0 var(--space-2) 0;
}
.idev-mobile-ai { display: flex; flex-direction: column; gap: var(--space-2); }
.idev-mobile-ai p { font-size: var(--text-xs); color: var(--text-secondary); margin: 0; }

.idev-mobile-nav {
  display: flex; border-top: 1px solid var(--border-default); background: var(--bg-primary);
}
.idev-mobile-tab {
  flex: 1; padding: 10px 0; border: none; background: transparent;
  color: var(--text-secondary); font-size: 11px; font-weight: 500; cursor: pointer;
  transition: color 150ms ease;
}
.idev-mobile-tab-active { color: var(--accent-primary); box-shadow: inset 0 2px 0 var(--accent-primary); }

.idev-mobile-run {
  position: fixed; bottom: 20px; right: 20px; width: 48px; height: 48px;
  border-radius: 50%; border: none;
  background: linear-gradient(135deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary) 70%, #6366f1));
  color: #0C1324; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10;
  box-shadow: 0 4px 16px -2px rgba(76,215,246,0.5);
}

/* ══════════════════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   ══════════════════════════════════════════════════════════════ */
@media (max-width: 1279px) {
  .idev-workbench-main {
    grid-template-columns: var(--idev-rail-width, 52px) minmax(0, 1fr) auto 280px;
  }
}

@media (max-width: 1023px) {
  .idev-topbar-center { display: none; }
  .idev-workbench-main {
    grid-template-columns: var(--idev-rail-width, 52px) minmax(0, 1fr);
  }
  .idev-pane-resizer-vertical,
  .idev-context-wrap,
  .idev-context-reopen { display: none; }
}

@media (max-width: 900px) {
  .idev-page-inner {
    padding: var(--space-2) var(--space-3) var(--space-4);
    grid-template-rows: auto auto 1fr auto;
  }
  .idev-mode-switcher { display: none; }
  .idev-global-topbar { min-height: 42px; }
  .idev-command-bar { min-height: 40px; padding: 6px var(--space-3); }
  .idev-font-group { display: none; }
}

@media (max-width: 639px) {
  .idev-page-inner { padding: var(--space-1) var(--space-2) var(--space-3); }
  .idev-command-cluster:nth-child(2) { display: none; }
  .idev-status-bar { font-size: 10px; padding: 4px var(--space-3); }
}

/* ══════════════════════════════════════════════════════════════
   REDUCED MOTION
   ══════════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .idev-orb-1, .idev-orb-2, .idev-orb-3 { animation: none; }
  .idev-run-btn-busy { animation: none; }
  .idev-status-compiling::before,
  .idev-status-running::before { animation: none; }
  .idev-rail, .idev-rail-label, .idev-rail-btn,
  .idev-icon-btn, .idev-btn-secondary, .idev-btn-primary,
  .idev-select-btn, .idev-output-header { transition: none; }
}

/* ══════════════════════════════════════════════════════════════
   FOCUS OUTLINES (Accessibility)
   ══════════════════════════════════════════════════════════════ */
.idev-rail-btn:focus-visible,
.idev-icon-btn:focus-visible,
.idev-btn-secondary:focus-visible,
.idev-btn-primary:focus-visible,
.idev-select-btn:focus-visible,
.idev-output-tab:focus-visible,
.idev-command-item:focus-visible,
.idev-mobile-tab:focus-visible,
.idev-mode-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-primary) 76%, white 6%), 0 0 0 4px color-mix(in srgb, var(--accent-primary) 22%, transparent);
}

.idev-rail:not(.idev-rail-expanded) .idev-rail-btn.idev-rail-active:focus-visible {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-primary) 55%, transparent), 0 0 0 2px color-mix(in srgb, var(--accent-primary) 80%, white 10%), 0 0 0 4px color-mix(in srgb, var(--accent-primary) 24%, transparent), 0 4px 10px -6px var(--accent-glow);
}
`;

const LANGUAGES = [
  {
    value: "c",
    label: "C",
    ext: "c",
    runtime: "GCC 13.2",
    color: "#5C9EDE",
  },
  {
    value: "cpp",
    label: "C++",
    ext: "cpp",
    runtime: "G++ 13.2",
    color: "#00599C",
  },
  {
    value: "python",
    label: "Python",
    ext: "py",
    runtime: "Python 3.12",
    color: "#F7C948",
  },
  {
    value: "java",
    label: "Java",
    ext: "java",
    runtime: "JDK 21",
    color: "#E76F00",
  },
  {
    value: "javascript",
    label: "JavaScript",
    ext: "js",
    runtime: "Node 20 LTS",
    color: "#F0DB4F",
  },
];

const MONACO_LANGUAGE_MAP = {
  c: "c",
  cpp: "cpp",
  python: "python",
  java: "java",
  javascript: "javascript",
};

const CODE_SNIPPETS = {
  c: `#include <stdio.h>\n\nint square(int x) {\n    return x * x;\n}\n\nint main(void) {\n    int n = 0;\n    scanf("%d", &n);\n    printf("%d\\n", square(n));\n    return 0;\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nstatic int square(int x) {\n    return x * x;\n}\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    int n = 0;\n    cin >> n;\n    cout << square(n) << "\\n";\n    return 0;\n}`,
  python: `def square(x: int) -> int:\n    return x * x\n\n\ndef solve() -> None:\n    n = int(input().strip())\n    print(square(n))\n\n\nif __name__ == "__main__":\n    solve()`,
  java: `import java.util.*;\n\npublic class Main {\n    private static int square(int x) {\n        return x * x;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(square(n));\n    }\n}`,
  javascript: `"use strict";\n\nfunction square(x) {\n  return x * x;\n}\n\nconst fs = require("fs");\nconst n = Number(fs.readFileSync(0, "utf8").trim());\nconsole.log(square(n));`,
};

const LAYOUT_OPTIONS = [
  {
    id: "workbench",
    title: "Workbench",
    subtitle: "Full IDE layout for edit, run, debug, and output.",
    icon: Columns3,
  },
  {
    id: "focus",
    title: "Focus Mode",
    subtitle: "Minimal chrome with maximum coding surface.",
    icon: Focus,
  },
  {
    id: "mobile",
    title: "Mobile Mode",
    subtitle: "Mode-based workflow optimized for compact devices.",
    icon: Smartphone,
  },
];

const RAIL_ITEMS = [
  { id: "explorer", label: "Explorer", icon: FolderTree },
  { id: "editor", label: "Editor", icon: FileCode2 },
  { id: "console", label: "Console", icon: Terminal },
  { id: "debugger", label: "Debugger", icon: Bug },
  { id: "tests", label: "Test Cases", icon: TestTube2 },
  { id: "ai", label: "AI Assist", icon: Sparkles },
  { id: "history", label: "History", icon: GitBranch },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const OUTPUT_TABS = ["Output", "Stderr", "Diagnostics"];

const KEYBINDING_MODES = [
  { value: "STD", color: "var(--accent-primary)" },
  { value: "VIM", color: "#f59e0b" },
  { value: "EMC", color: "var(--accent-secondary)" },
];


const QUICK_AI_ACTIONS = [
  "Explain Code",
  "Find Bugs",
  "Optimize",
  "Add Comments",
  "Complexity",
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

const DEFAULT_RIGHT_PANEL_WIDTH = 312;
const RIGHT_PANEL_MIN = 280;
const RIGHT_PANEL_MAX = 440;

const DEFAULT_EDITOR_PANEL_HEIGHT = 520;
const EDITOR_PANEL_MIN = 260;
const EDITOR_PANEL_MAX = 980;
const BOTTOM_PANEL_MIN = 100;
const HORIZONTAL_RESIZER_THICKNESS = 8;

const DEFAULT_RUN_STREAMS = {
  stdout: "",
  stderr: "",
  diagnostics: "Diagnostics will appear after execution.",
  verdict: "READY",
  stdin: "",
};

const DEFAULT_AI_MESSAGE = {
  id: 1,
  role: "assistant",
  text: "AI Assist ready. Ask for explanation, bug checks, optimization, or complexity analysis.",
};

const MAX_FILES = 10;

const EXT_TO_LANGUAGE = {
  c: "c", h: "c",
  cpp: "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp",
  py: "python",
  java: "java",
  js: "javascript",
  txt: "plaintext",
};

const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getLanguageFromExt = (ext) => EXT_TO_LANGUAGE[ext?.toLowerCase()] || "plaintext";

const getExtFromLanguage = (lang) => {
  const config = LANGUAGES.find((l) => l.value === lang);
  return config ? config.ext : "txt";
};

const getUserWorkspaceStorageKey = (userId) => (userId ? `ide-files-${userId}` : null);

const getAuthSnapshot = () => {
  if (typeof window === "undefined") {
    return { token: null, userId: null };
  }

  try {
    return {
      token: localStorage.getItem("token"),
      userId: localStorage.getItem("userId"),
    };
  } catch {
    return { token: null, userId: null };
  }
};

const buildNextUntitledName = (files, language) => {
  const ext = getExtFromLanguage(language);
  const existing = new Set((files || []).map((file) => String(file.name || "").toLowerCase()));

  for (let index = 1; index <= 9999; index += 1) {
    const candidate = `untitled-${index}.${ext}`;
    if (!existing.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return `untitled-${Date.now()}.${ext}`;
};

const buildStarterFileName = (files, language) => {
  const ext = getExtFromLanguage(language);
  const preferred = `main.${ext}`;
  const existing = new Set((files || []).map((file) => String(file.name || "").toLowerCase()));

  if (!existing.has(preferred.toLowerCase())) {
    return preferred;
  }

  return buildNextUntitledName(files, language);
};

const replaceFileExtensionForLanguage = (fileName, language) => {
  const nextExt = getExtFromLanguage(language);
  const safeName = String(fileName || "").trim();

  if (!safeName) {
    return `main.${nextExt}`;
  }

  const lastDotIndex = safeName.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return `${safeName}.${nextExt}`;
  }

  return `${safeName.slice(0, lastDotIndex)}.${nextExt}`;
};

const splitFileNameForRename = (fileName) => {
  const safeName = String(fileName || "").trim();
  const lastDotIndex = safeName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return {
      baseName: safeName,
      extension: "",
    };
  }

  return {
    baseName: safeName.slice(0, lastDotIndex),
    extension: safeName.slice(lastDotIndex),
  };
};

const ensureUniqueFileName = ({ files = [], fileName, excludeFileId = null }) => {
  const normalizedName = String(fileName || "").trim();
  if (!normalizedName) {
    return "untitled.txt";
  }

  const taken = new Set(
    files
      .filter((file) => file.id !== excludeFileId)
      .map((file) => String(file.name || "").toLowerCase()),
  );

  if (!taken.has(normalizedName.toLowerCase())) {
    return normalizedName;
  }

  const lastDotIndex = normalizedName.lastIndexOf(".");
  const hasExt = lastDotIndex > 0;
  const base = hasExt ? normalizedName.slice(0, lastDotIndex) : normalizedName;
  const extSuffix = hasExt ? normalizedName.slice(lastDotIndex) : "";

  for (let index = 2; index <= 9999; index += 1) {
    const candidate = `${base}-${index}${extSuffix}`;
    if (!taken.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}${extSuffix}`;
};

const ACCEPTED_EXTENSIONS = ".c,.cpp,.cc,.cxx,.h,.hpp,.py,.java,.js,.txt";

const loadFilesFromStorage = () => {
  try {
    const { token, userId } = getAuthSnapshot();
    if (userId && token) {
      const storageKey = getUserWorkspaceStorageKey(userId);
      const saved = storageKey ? localStorage.getItem(storageKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch {}
  return [{ id: "file-default", name: "main.cpp", language: "cpp", content: CODE_SNIPPETS.cpp }];
};

const isBusy = (runStatus) => runStatus === "COMPILING" || runStatus === "RUNNING";

const isTypingTarget = (target) => {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getMaxEditorPanelHeight = (mainColumnRect) => {
  if (!mainColumnRect) {
    return EDITOR_PANEL_MAX;
  }

  const maxEditorFromLayout = Math.max(
    EDITOR_PANEL_MIN,
    mainColumnRect.height - BOTTOM_PANEL_MIN - HORIZONTAL_RESIZER_THICKNESS,
  );

  return Math.min(EDITOR_PANEL_MAX, maxEditorFromLayout);
};

const isCompactViewport = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(max-width: 900px)").matches;
};

const getLanguageConfig = (value) =>
  LANGUAGES.find((lang) => lang.value === value) || LANGUAGES[1];

const getFileName = (language) => `main.${getLanguageConfig(language).ext}`;

const formatClock = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const getDefaultDebugLine = (lineCount = 1) => clamp(1, 1, Math.max(lineCount, 1));

const resolveDebuggerStartLine = ({ breakpoints = [], cursorLine = 1, lineCount = 1 }) => {
  const maxLine = Math.max(lineCount, 1);
  const sortedBreakpoints = [...new Set(
    breakpoints
      .filter((line) => Number.isInteger(line))
      .map((line) => clamp(line, 1, maxLine)),
  )].sort((a, b) => a - b);

  if (sortedBreakpoints.length > 0) {
    return sortedBreakpoints[0];
  }

  return clamp(cursorLine, 1, maxLine);
};

const buildDebuggerWatches = (line) => [
  { id: "n", name: "n", type: "int", value: "12", pinned: true },
  {
    id: "result",
    name: "result",
    type: "int",
    value: line >= 12 ? "144" : "pending",
    pinned: false,
  },
  {
    id: "line",
    name: "line",
    type: "int",
    value: String(line),
    pinned: false,
  },
];

const buildCallStackForLine = (line) => {
  if (line >= 4 && line <= 13) {
    return ["main()", "square(n)"];
  }

  return ["main()"];
};

const createDebugState = (line = getDefaultDebugLine()) => ({
  mode: "idle",
  line,
  lastStep: "Debugger is idle.",
  callStack: ["main()"],
  watches: buildDebuggerWatches(line),
});

const createSnapshotEntry = ({ id, reason, language, status, timeMs, line }) => ({
  id,
  reason,
  language,
  runtime: getLanguageConfig(language).runtime,
  status,
  timeMs,
  line,
  createdAt: formatClock(),
});

const getStatusLabel = (runStatus, runMeta, runVerdict) => {
  const safeRunMeta = runMeta || { timeMs: 0, memoryMb: "0.0", exitCode: 0 };

  if (runStatus === "DONE") {
    return `${runVerdict || "DONE"} · ${safeRunMeta.timeMs}ms`;
  }

  return runStatus;
};

const formatMemoryMb = (memoryValue) => {
  const parsed = Number(memoryValue);
  if (!Number.isFinite(parsed)) {
    return "0.00";
  }

  if (parsed >= 100) {
    return parsed.toFixed(0);
  }

  return parsed.toFixed(2);
};

const normalizeRunResponse = ({ data, activeLanguage, stdin }) => {
  const fallbackStatus = data?.run ? (data.run.code === 0 ? "Accepted" : "Error") : "Error";
  const verdict = data?.status || fallbackStatus;
  const rawTime = data?.time ?? data?.run?.time ?? 0;
  const rawMemory = data?.memory ?? data?.run?.memory ?? 0;
  const timeMs = Number.isFinite(Number(rawTime)) ? Math.max(0, Math.round(Number(rawTime))) : 0;
  const memoryMb = formatMemoryMb(rawMemory);

  const possibleStdout = data?.output ?? data?.run?.stdout ?? "";
  const possibleError = data?.error ?? data?.run?.stderr ?? data?.stderr ?? "";

  const isAccepted = verdict === "Accepted";
  const stdout = isAccepted ? String(possibleStdout || "") : String(data?.run?.stdout || "");
  const stderr = isAccepted
    ? String(possibleError || "")
    : String(possibleStdout || possibleError || "Execution failed");
  const exitCode = isAccepted ? 0 : 1;

  const diagnosticsLines = [
    `status: ${verdict}`,
    `language: ${getLanguageConfig(activeLanguage).label}`,
    `time: ${timeMs}ms`,
    `memory: ${memoryMb} MB`,
    `stdin bytes: ${(stdin || "").length}`,
  ];

  if (!isAccepted && stderr) {
    diagnosticsLines.push("hint: check stderr tab for details.");
  }

  return {
    runMeta: {
      timeMs,
      memoryMb,
      exitCode,
    },
    streams: {
      stdout,
      stderr,
      diagnostics: diagnosticsLines.join("\n"),
      verdict,
      stdin,
    },
  };
};

const getOutputContent = (runStatus, activeLanguage, runMeta, runStreams, tab) => {
  const safeRunMeta = runMeta || { timeMs: 0, memoryMb: "0.0", exitCode: 0 };
  const safeRunStreams = runStreams || DEFAULT_RUN_STREAMS;
  const language = getLanguageConfig(activeLanguage).label;

  if (runStatus === "COMPILING") {
    if (tab === "Output") {
      return `Compiling ${language} source...`;
    }

    if (tab === "Stderr") {
      return "stderr stream is waiting for process output...";
    }

    return "Compiler diagnostics will appear once compilation finishes.";
  }

  if (runStatus === "RUNNING") {
    if (tab === "Output") {
      return "Program is running...";
    }

    if (tab === "Stderr") {
      return "stderr stream is waiting for process output...";
    }

    return "Collecting runtime diagnostics...";
  }

  if (runStatus !== "DONE") {
    if (tab === "Output") {
      return "Run your code to see output here.";
    }

    if (tab === "Stderr") {
      return "stderr is empty until a run is performed.";
    }

    return "Diagnostics will appear after execution.";
  }

  if (tab === "Output") {
    if (safeRunStreams.stdout) {
      return safeRunStreams.stdout;
    }

    return safeRunMeta.exitCode === 0 ? "Program completed with no stdout output." : "No stdout output.";
  }

  if (tab === "Stderr") {
    return safeRunStreams.stderr || "No stderr output.";
  }

  return safeRunStreams.diagnostics || "No diagnostics captured.";
};

const evaluateTestCase = (stdin, expected) => {
  const primaryToken = (stdin || "").trim().split(/\s+/)[0] || "";
  const number = Number(primaryToken);

  if (!Number.isFinite(number)) {
    return {
      got: "invalid input",
      passed: false,
      expected: (expected || "").trim(),
    };
  }

  const got = String(number * number);
  return {
    got,
    expected: (expected || "").trim(),
    passed: got === (expected || "").trim(),
  };
};

const buildAiReply = (prompt, activeLanguage, runMeta) => {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("complexity")) {
    return {
      text: `Estimated complexity for the current ${getLanguageConfig(activeLanguage).label} snippet: time O(1), space O(1).`,
    };
  }

  if (normalized.includes("bug")) {
    return {
      text: "Potential issue: guard non-numeric stdin before arithmetic. Add a validation branch to avoid undefined runtime behavior.",
    };
  }

  if (normalized.includes("comment")) {
    return {
      text: "Annotated version prepared:",
      code: `// Reads one integer and prints its square\nint n = 0;\ncin >> n;\ncout << (n * n) << "\\n";`,
    };
  }

  if (normalized.includes("optimize")) {
    return {
      text: "I/O is already optimal for this use case. For bigger workloads, keep sync disabled and avoid extra allocations.",
    };
  }

  return {
    text: `This routine computes square(n) and prints it once. Last successful run was ${runMeta.timeMs}ms at ${runMeta.memoryMb} MB.`,
  };
};

function LanguagePicker({ activeLanguage, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const syncMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === "undefined") {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = compact ? 210 : 228;
    const viewportPadding = 12;
    const centeredLeft = rect.left + rect.width / 2 - menuWidth / 2;
    const left = clamp(
      centeredLeft,
      viewportPadding,
      Math.max(viewportPadding, window.innerWidth - menuWidth - viewportPadding),
    );
    const top = rect.bottom + 8;
    const maxHeight = Math.min(336, Math.max(180, window.innerHeight - top - viewportPadding));

    setMenuPosition({
      top,
      left,
      width: menuWidth,
      maxHeight,
    });
  }, [compact]);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    syncMenuPosition();

    const handleReposition = () => syncMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, syncMenuPosition]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedInsideTrigger = wrapRef.current?.contains(event.target);
      const clickedInsideMenu = menuRef.current?.contains(event.target);

      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const active = getLanguageConfig(activeLanguage);

  const languageMenu = typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {open && menuPosition && (
            <motion.div
              ref={menuRef}
              className="idev-language-menu idev-language-menu-portal liquid-glass"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
              }}
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="idev-menu-header">Select Language</div>
              <div className="idev-menu-scroll">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    className={`idev-language-option ${
                      lang.value === activeLanguage ? "active" : ""
                    }`}
                    onClick={() => {
                      onChange(lang.value);
                      setOpen(false);
                    }}
                  >
                    <div className="idev-opt-info">
                      <span className="idev-opt-label">{lang.label}</span>
                      <span className="idev-opt-runtime">{lang.runtime}</span>
                    </div>
                    {lang.value === activeLanguage && (
                      <motion.div
                        layoutId="active-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check size={14} className="idev-opt-check" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <div
      className={`idev-language-picker ${compact ? "idev-language-picker-compact" : ""} ${open ? "idev-language-picker-open" : ""}`}
      ref={wrapRef}
    >
      <button
        type="button"
        className="idev-select-btn liquid-glass"
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select language"
        aria-expanded={open}
      >
        <span className="idev-btn-label">{active.label}</span>
        <ChevronDown size={14} className={`idev-chevron ${open ? "idev-chevron-open" : ""}`} />
      </button>

      {languageMenu}
    </div>
  );
}

function CommandBar({
  activeLanguage,
  onLanguageChange,
  theme,
  onToggleTheme,
  fontSize,
  onDecreaseFont,
  onIncreaseFont,
  keybindingMode,
  onCycleKeybinding,
  onShare,
  onFormat,
  onRun,
  onOpenCommandPalette,
  runStatus,
}) {
  const language = getLanguageConfig(activeLanguage);
  const busy = isBusy(runStatus);

  return (
    <header className="idev-command-bar liquid-glass" aria-label="IDE command bar">
      <div className="idev-command-left">
        <div className="idev-command-cluster idev-command-cluster-file">
          <div className="idev-path-row">
            <button type="button" className="idev-path-chip">
              workspace
            </button>
            <ChevronRight size={12} />
            <button type="button" className="idev-path-chip">
              scratch
            </button>
            <ChevronRight size={12} />
            <div className="idev-file-chip" aria-label="Active file">
              <span>{getFileName(activeLanguage)}</span>
            </div>
          </div>
        </div>

        <div className="idev-command-cluster idev-command-cluster-language">
          <LanguagePicker activeLanguage={activeLanguage} onChange={onLanguageChange} />
          <span className="idev-runtime-pill">{language.runtime}</span>
        </div>
      </div>

      <div className="idev-command-right">
        <div className="idev-command-cluster idev-command-cluster-core">
          <button
            type="button"
            className="idev-icon-btn"
            aria-label="Toggle theme"
            onClick={onToggleTheme}
          >
            <motion.span
              key={theme}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </motion.span>
          </button>

          <div className="idev-font-group" aria-label="Font size controls">
            <button
              type="button"
              className="idev-icon-btn"
              onClick={onDecreaseFont}
              aria-label="Decrease editor font size"
            >
              A-
            </button>
            <span className="idev-font-size-pill">{fontSize}px</span>
            <button
              type="button"
              className="idev-icon-btn"
              onClick={onIncreaseFont}
              aria-label="Increase editor font size"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            className="idev-mode-pill"
            onClick={onCycleKeybinding}
            aria-label="Cycle keybinding mode"
          >
            {keybindingMode}
          </button>
        </div>

        <div className="idev-command-cluster idev-command-cluster-tools">
          <button type="button" className="idev-btn-secondary" onClick={onShare}>
            <Copy size={14} /> Share
          </button>

          <button type="button" className="idev-btn-secondary" onClick={onFormat}>
            <WandSparkles size={14} /> Format
          </button>

          <button type="button" className="idev-btn-secondary" onClick={onOpenCommandPalette}>
            <Terminal size={14} /> Commands
          </button>
        </div>

        <button type="button" className={`idev-btn-primary idev-run-btn ${busy ? "idev-run-btn-busy" : ""}`} onClick={onRun}>
          {busy ? <Square size={14} /> : <Play size={14} />}
          {busy ? "Stop" : "Run"}
        </button>
      </div>
    </header>
  );
}

function EditorSurface({
  language,
  code,
  onCodeChange,
  theme,
  fontSize,
  keybindingMode,
  showFormatSweep,
  breakpoints = [],
  onToggleBreakpoint = () => {},
  debugLine = null,
  debugEnabled = false,
  onCursorChange = () => {},
  tabs = [],
  activeFileId = null,
  onTabSwitch = () => {},
  onTabClose = () => {},
  showCreateFileButton = true,
  onCreateFile = () => {},
  onEditorMount = () => {},
}) {
  const editorCode = typeof code === "string" ? code : "";
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIdsRef = useRef([]);
  const disposableRefs = useRef([]);

  const monacoLanguage = useMemo(
    () => MONACO_LANGUAGE_MAP[language] || "plaintext",
    [language],
  );

  const monacoTheme = theme === "dark" ? "algoviz-ide-dark" : "algoviz-ide-light";

  const lineNumbersMinChars = useMemo(() => {
    const lineCount = Math.max(editorCode.split("\n").length, 1);
    return clamp(String(lineCount).length + 1, 3, 7);
  }, [editorCode]);

  const handleEditorWillMount = useCallback((monaco) => {
    monaco.editor.defineTheme("algoviz-ide-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editor.lineHighlightBackground": "#2A2D2E",
        "editorCursor.foreground": "#AEAFAD",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#C6C6C6",
        "editorLineNumber.dimmedForeground": "#666666",
        "editorIndentGuide.background1": "#404040",
        "editorIndentGuide.activeBackground1": "#707070",
        "editorGutter.background": "#1E1E1E",
        "editorGutter.modifiedBackground": "#007ACC",
        "editorGutter.addedBackground": "#22C55E",
        "editorGutter.deletedBackground": "#EF4444",
      },
    });

    monaco.editor.defineTheme("algoviz-ide-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "65748B", fontStyle: "italic" },
        { token: "keyword", foreground: "6D28D9" },
        { token: "string", foreground: "0F766E" },
        { token: "number", foreground: "B45309" },
        { token: "type", foreground: "0369A1" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#0F172A",
        "editor.lineHighlightBackground": "#E2E8F0",
        "editorCursor.foreground": "#008DA5",
        "editor.selectionBackground": "#99D9E466",
        "editor.inactiveSelectionBackground": "#CFE9EE66",
        "editorLineNumber.foreground": "#64748B",
        "editorLineNumber.activeForeground": "#0F172A",
        "editorLineNumber.dimmedForeground": "#94A3B8",
        "editorIndentGuide.background1": "#CBD5E1",
        "editorIndentGuide.activeBackground1": "#94A3B8",
        "editorGutter.background": "#FFFFFF",
        "editorGutter.modifiedBackground": "#008DA5",
        "editorGutter.addedBackground": "#16A34A",
        "editorGutter.deletedBackground": "#DC2626",
      },
    });
  }, []);

  const applyMonacoDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) {
      return;
    }

    const model = editor.getModel();
    if (!model) {
      return;
    }

    const maxLine = Math.max(model.getLineCount(), 1);
    const decorations = [];

    const safeBreakpoints = [...new Set(
      breakpoints.map((lineNo) => clamp(lineNo, 1, maxLine)),
    )].sort((a, b) => a - b);

    for (let lineNo = 1; lineNo <= maxLine; lineNo += 1) {
      if (safeBreakpoints.includes(lineNo)) {
        continue;
      }

      decorations.push({
        range: new monaco.Range(lineNo, 1, lineNo, 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: "idev-monaco-breakpoint-slot",
          glyphMarginHoverMessage: [{ value: "Click to add a breakpoint" }],
        },
      });
    }

    safeBreakpoints.forEach((safeLine) => {
      decorations.push({
        range: new monaco.Range(safeLine, 1, safeLine, 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: "idev-monaco-breakpoint-glyph",
          glyphMarginHoverMessage: [{ value: "Click to remove breakpoint" }],
          overviewRuler: {
            color: "rgba(0, 122, 204, 0.8)",
            position: monaco.editor.OverviewRulerLane.Left,
          },
        },
      });
    });

    if (debugEnabled && Number.isFinite(debugLine)) {
      const safeDebugLine = clamp(debugLine, 1, maxLine);
      decorations.push({
        range: new monaco.Range(safeDebugLine, 1, safeDebugLine, 1),
        options: {
          isWholeLine: true,
          className: "idev-monaco-debug-line",
          linesDecorationsClassName: "idev-monaco-debug-line-margin",
        },
      });
    }

    decorationIdsRef.current = editor.deltaDecorations(
      decorationIdsRef.current,
      decorations,
    );
  }, [breakpoints, debugEnabled, debugLine]);

  const handleEditorMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      onEditorMount(editor);

      disposableRefs.current.forEach((disposable) => disposable?.dispose?.());

      const cursorDisposable = editor.onDidChangeCursorPosition((event) => {
        onCursorChange({
          line: event.position.lineNumber,
          column: event.position.column,
        });
      });

      const glyphDisposable = editor.onMouseDown((event) => {
        const lineNo = event.target.position?.lineNumber;
        if (!lineNo) {
          return;
        }

        const targetType = event.target.type;
        if (
          targetType === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
          targetType === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
        ) {
          onToggleBreakpoint(lineNo);
        }
      });

      disposableRefs.current = [cursorDisposable, glyphDisposable];

      const cursor = editor.getPosition();
      if (cursor) {
        onCursorChange({ line: cursor.lineNumber, column: cursor.column });
      }

      applyMonacoDecorations();
    },
    [applyMonacoDecorations, onCursorChange, onToggleBreakpoint],
  );

  useEffect(() => {
    applyMonacoDecorations();
  }, [applyMonacoDecorations, editorCode]);

  useEffect(
    () => () => {
      disposableRefs.current.forEach((disposable) => disposable?.dispose?.());

      if (editorRef.current) {
        editorRef.current.deltaDecorations(decorationIdsRef.current, []);
      }
    },
    [],
  );

  return (
    <section className="idev-editor" aria-label="Code editor surface">
      <div className="idev-editor-toolbar">
        <div className="idev-tab-row">
          {tabs.length > 0 ? (
            tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`idev-tab ${tab.id === activeFileId ? "idev-tab-active" : ""}`}
                onClick={() => onTabSwitch(tab.id)}
                onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); onTabClose(tab.id); } }}
              >
                <span className="idev-tab-lang-dot" style={{ background: getLanguageConfig(tab.language).color }} />
                {tab.name}
                {tabs.length > 1 && (
                  <span className="idev-tab-close" onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}>
                    <X size={12} />
                  </span>
                )}
              </button>
            ))
          ) : (
            <button type="button" className="idev-tab idev-tab-active">
              <span className="idev-tab-lang-dot" style={{ background: getLanguageConfig(language).color }} />
              {getFileName(language)}
            </button>
          )}

          {showCreateFileButton && (
            <button
              type="button"
              className="idev-tab-add"
              aria-label="Create new file"
              onClick={(event) => {
                event.stopPropagation();
                onCreateFile();
              }}
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>

      <div
        className={`idev-code-surface ${keybindingMode === "VIM" ? "idev-code-surface-vim" : ""}`}
        role="region"
        aria-label="Code editor"
        style={{ "--editor-font-size": `${fontSize}px` }}
      >
        <div className="idev-monaco-wrap">
          <MonacoEditor
            className="idev-monaco-editor"
            height="100%"
            beforeMount={handleEditorWillMount}
            onMount={handleEditorMount}
            language={monacoLanguage}
            theme={monacoTheme}
            value={editorCode}
            onChange={(value) => onCodeChange(value ?? "")}
            options={{
              readOnly: false,
              minimap: { enabled: false },
              fontSize,
              fontFamily: "IBM Plex Mono, monospace",
              lineHeight: Math.round(fontSize * 1.7),
              lineNumbers: "on",
              lineNumbersMinChars,
              glyphMargin: true,
              lineDecorationsWidth: 18,
              folding: true,
              foldingStrategy: "auto",
              showFoldingControls: "mouseover",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              smoothScrolling: true,
              wordWrap: "off",
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
              contextmenu: true,
              padding: { top: 12, bottom: 12 },
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </div>

        <AnimatePresence>
          {showFormatSweep && (
            <motion.div
              className="idev-format-sweep"
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "120%", opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function OutputPanel({
  runStatus,
  activeLanguage,
  runMeta = { timeMs: 0, memoryMb: "0.0", exitCode: 0 },
  runStreams = DEFAULT_RUN_STREAMS,
  compact = false,
}) {
  const [activeTab, setActiveTab] = useState("Output");

  useEffect(() => {
    if (runStatus !== "READY") {
      setActiveTab("Output");
    }
  }, [runStatus]);

  const outputText = useMemo(
    () => getOutputContent(runStatus, activeLanguage, runMeta, runStreams, activeTab),
    [activeLanguage, activeTab, runMeta, runStatus, runStreams],
  );
  const outputLines = useMemo(() => outputText.split("\n"), [outputText]);

  const handleCopyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast.success("Output copied");
    } catch {
      toast.error("Copy failed");
    }
  }, [outputText]);

  return (
    <section className={`idev-output-panel ${compact ? "idev-output-panel-compact" : ""}`}>
      <div className={`idev-output-header ${runStreams.verdict === "Accepted" ? "idev-output-header-success" : runStreams.verdict && runStreams.verdict !== "RUNNING" && runStatus === "DONE" ? "idev-output-header-error" : ""}`}>
        <div className="idev-output-title-wrap">
          <h3>stdout</h3>

          <AnimatePresence>
            {runStatus === "DONE" && (
              <motion.div
                className="idev-metrics-wrap"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <span className="idev-metric-badge">{runMeta.timeMs}ms</span>
                <span className="idev-metric-badge">{runMeta.memoryMb} MB</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="idev-icon-btn"
          onClick={handleCopyOutput}
          aria-label="Copy output"
        >
          <Copy size={14} />
        </button>
      </div>

      <div className="idev-output-tabs" aria-label="Output tabs">
        {OUTPUT_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`idev-output-tab ${activeTab === tab ? "idev-output-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="idev-output-body" role="log" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${runStatus}-${activeLanguage}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {outputLines.map((line, idx) => (
              <motion.div
                key={`${activeTab}-line-${idx}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.14, delay: idx * 0.02 }}
                className="idev-output-line"
              >
                {line}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <span
          className={`idev-exit-badge ${
            runMeta.exitCode === 0 ? "idev-exit-success" : "idev-exit-error"
          }`}
        >
          exit {runMeta.exitCode}
        </span>
      </div>
    </section>
  );
}

function TestCasesPanel({
  testCases = [],
  testRunProgress,
  testRunInFlight,
  onRunAll,
  onRunCase,
  onAddCase,
  onDeleteCase,
  onUpdateCase,
}) {
  const passedCount = testCases.filter((test) => test.status === "pass").length;
  const passRatio = testCases.length > 0 ? passedCount / testCases.length : 0;
  const badgeClass =
    passRatio >= 0.8 ? "idev-tests-badge-good" : passRatio >= 0.4 ? "idev-tests-badge-mid" : "idev-tests-badge-bad";

  return (
    <div className="idev-tests-panel">
      <div className="idev-panel-header">
        <h3>Test Cases</h3>
        <span className={`idev-tests-badge ${badgeClass}`}>{passedCount}/{testCases.length} passing</span>
      </div>

      <div className="idev-tests-actions">
        <button type="button" className="idev-btn-secondary" onClick={onAddCase}>
          <FilePlus2 size={14} /> Add Case
        </button>
        <button type="button" className="idev-btn-primary" onClick={onRunAll}>
          {testRunInFlight ? <CircleDashed size={14} className="idev-spin" /> : <Play size={14} />}
          {testRunInFlight ? "Running..." : "Run All"}
        </button>
      </div>

      <div className="idev-tests-progress" aria-label="Test run progress">
        <motion.div
          className="idev-tests-progress-fill"
          style={{ transformOrigin: "left center" }}
          animate={{ scaleX: testRunProgress }}
          transition={{ duration: 0.22 }}
        />
      </div>

      <div className="idev-tests-list" aria-label="Test case list">
        {testCases.map((testCase) => {
          const statusClass = `idev-test-${testCase.status}`;

          return (
            <article key={testCase.id} className={`idev-test-card ${statusClass}`}>
              <header className="idev-test-header">
                <div className="idev-test-title-wrap">
                  <strong>{testCase.label}</strong>
                </div>

                <div className="idev-test-actions">
                  <button
                    type="button"
                    className="idev-icon-btn"
                    onClick={() => onRunCase(testCase.id)}
                    aria-label={`Run ${testCase.label}`}
                  >
                    <Play size={13} />
                  </button>
                  <button
                    type="button"
                    className="idev-icon-btn"
                    onClick={() => onDeleteCase(testCase.id)}
                    aria-label={`Delete ${testCase.label}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </header>

              <label className="idev-test-field">
                <span>Input</span>
                <textarea
                  className="idev-test-stdin"
                  value={testCase.stdin}
                  onChange={(event) => onUpdateCase(testCase.id, "stdin", event.target.value)}
                />
              </label>

              <div className="idev-test-bottom-row">
                <label className="idev-test-field">
                  <span>Expected</span>
                  <input
                    className="idev-test-expected"
                    value={testCase.expected}
                    onChange={(event) => onUpdateCase(testCase.id, "expected", event.target.value)}
                  />
                </label>

                <div className="idev-test-got">
                  <span>Got</span>
                  <strong>{testCase.got || "-"}</strong>
                </div>
              </div>

              {testCase.status === "fail" && (
                <div className="idev-test-diff">
                  <span>Expected: {testCase.expected || "-"}</span>
                  <span>Got: {testCase.got || "-"}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function AIAssistPanel({
  messages,
  input,
  onInputChange,
  onSend,
  onQuickAction,
  onCopyCode,
  showComplexity,
}) {
  return (
    <div className="idev-ai-panel">
      <div className="idev-panel-header">
        <h3>AI Assist</h3>
        <span className="idev-ai-beta">BETA</span>
      </div>

      <div className="idev-ai-quick-actions">
        {QUICK_AI_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            className="idev-ai-quick-chip"
            onClick={() => onQuickAction(action)}
          >
            {action}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showComplexity && (
          <motion.div
            className="idev-complexity-badge"
            initial={{ scale: 0.8, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <span>Time: O(1)</span>
            <span>Space: O(1)</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="idev-ai-thread" aria-live="polite">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`idev-ai-msg ${message.role === "user" ? "idev-ai-msg-user" : "idev-ai-msg-assistant"}`}
          >
            <p>{message.text}</p>
            {message.code && (
              <div className="idev-ai-code-wrap">
                <pre className="idev-ai-code">{message.code}</pre>
                <button
                  type="button"
                  className="idev-icon-btn"
                  onClick={() => onCopyCode(message.code)}
                  aria-label="Copy AI code block"
                >
                  <Copy size={13} />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="idev-ai-input-row">
        <textarea
          className="idev-textarea"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask about your code..."
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />
        <button type="button" className="idev-btn-primary" onClick={onSend}>
          <ChevronRight size={14} /> Send
        </button>
      </div>
    </div>
  );
}

function DebuggerPanel({
  debugState,
  breakpoints,
  onStart,
  onPause,
  onContinue,
  onStep,
  onReset,
  onToggleWatchPin,
}) {
  const isRunning = debugState.mode === "running";

  return (
    <div className="idev-debugger-panel">
      <div className="idev-panel-header">
        <h3>Debugger</h3>
        <span className={`idev-debug-state idev-debug-state-${debugState.mode}`}>
          {debugState.mode.toUpperCase()}
        </span>
      </div>

      <div className="idev-debug-toolbar">
        <button type="button" className="idev-btn-primary" onClick={onStart}>
          <Play size={14} /> Start
        </button>

        <button
          type="button"
          className="idev-btn-secondary"
          onClick={isRunning ? onPause : onContinue}
        >
          {isRunning ? <Square size={14} /> : <Play size={14} />}
          {isRunning ? "Pause" : "Continue"}
        </button>

        <button
          type="button"
          className="idev-btn-secondary"
          onClick={onStep}
          disabled={isRunning}
        >
          <ChevronRight size={14} /> Step
        </button>

        <button type="button" className="idev-btn-secondary" onClick={onReset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="idev-debug-summary">
        <div className="idev-kv-row">
          <span>Current Line</span>
          <strong>L{debugState.line}</strong>
        </div>
        <div className="idev-kv-row">
          <span>Breakpoints</span>
          <strong>{breakpoints.length > 0 ? breakpoints.join(", ") : "None"}</strong>
        </div>
        <p>{debugState.lastStep}</p>
      </div>

      <div className="idev-debug-grid">
        <section className="idev-debug-card">
          <h4>Call Stack</h4>
          <ul>
            {debugState.callStack.map((frame) => (
              <li key={frame}>{frame}</li>
            ))}
          </ul>
        </section>

        <section className="idev-debug-card">
          <h4>Watch</h4>
          <div className="idev-watch-table" role="table" aria-label="Debugger watch variables">
            <div className="idev-watch-head" role="row">
              <span>Name</span>
              <span>Value</span>
              <span>Type</span>
              <span>Pin</span>
            </div>

            {debugState.watches.map((watch) => (
              <div className="idev-watch-row" role="row" key={watch.id}>
                <span>{watch.name}</span>
                <strong>{watch.value}</strong>
                <span>{watch.type}</span>
                <button
                  type="button"
                  className={`idev-watch-pin ${watch.pinned ? "idev-watch-pin-active" : ""}`}
                  onClick={() => onToggleWatchPin(watch.id)}
                >
                  {watch.pinned ? "PINNED" : "PIN"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HistoryPanel({ snapshots, activeSnapshotId, onCapture, onRestore }) {
  return (
    <div className="idev-history-panel">
      <div className="idev-panel-header">
        <h3>Snapshot History</h3>
        <button type="button" className="idev-btn-secondary" onClick={onCapture}>
          <FilePlus2 size={14} /> Capture
        </button>
      </div>

      <p className="idev-history-note">Auto snapshots are captured on run, format, and debug actions.</p>

      <div className="idev-history-list">
        {snapshots.map((snapshot) => (
          <article
            key={snapshot.id}
            className={`idev-history-card ${
              snapshot.id === activeSnapshotId ? "idev-history-card-active" : ""
            }`}
          >
            <header>
              <strong>{snapshot.reason}</strong>
              <span>{snapshot.createdAt}</span>
            </header>

            <div className="idev-history-meta">
              <span>{getLanguageConfig(snapshot.language).label}</span>
              <span>{snapshot.runtime}</span>
              <span>{snapshot.status}</span>
              <span>L{snapshot.line}</span>
            </div>

            <div className="idev-history-footer">
              <span>{snapshot.timeMs}ms</span>
              <button type="button" className="idev-btn-secondary" onClick={() => onRestore(snapshot.id)}>
                Restore
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ExplorerPanel({
  files,
  activeFileId,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onImportFile,
  isAuthenticated,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [createLanguageOverride, setCreateLanguageOverride] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameExtension, setRenameExtension] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreateSubmit = useCallback((e) => {
    e.preventDefault();
    const name = newFileName.trim();
    if (!name) {
      setIsCreating(false);
      setCreateLanguageOverride(null);
      return;
    }

    const fallbackExt = createLanguageOverride ? getExtFromLanguage(createLanguageOverride) : "txt";
    const baseName = name.includes(".") ? name : `${name}.${fallbackExt}`;
    const finalName = createLanguageOverride
      ? replaceFileExtensionForLanguage(baseName, createLanguageOverride)
      : baseName;

    onCreateFile(finalName, { language: createLanguageOverride });
    setNewFileName("");
    setCreateLanguageOverride(null);
    setIsCreating(false);
  }, [createLanguageOverride, newFileName, onCreateFile]);

  const handleRenameSubmit = useCallback((fileId, e) => {
    if (e) e.preventDefault();
    const baseName = renameValue.trim();
    if (baseName) {
      const finalName = renameExtension ? `${baseName}${renameExtension}` : baseName;
      onRenameFile(fileId, finalName);
    }
    setRenamingId(null);
    setRenameValue("");
    setRenameExtension("");
  }, [renameExtension, renameValue, onRenameFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    droppedFiles.forEach((f) => onImportFile(f));
  }, [onImportFile]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleFileInput = useCallback((e) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach((f) => onImportFile(f));
    e.target.value = "";
  }, [onImportFile]);

  return (
    <div className="idev-explorer surface-grain">
      <div className="idev-explorer-header">
        <span className="idev-explorer-title">Explorer</span>
        <div className="idev-explorer-actions">
          <button
            type="button"
            className="idev-icon-btn"
            onClick={() => {
              setIsCreating(true);
              setCreateLanguageOverride(null);
              setNewFileName("");
            }}
            aria-label="New file"
          >
            <FilePlus2 size={14} />
          </button>
          <button
            type="button"
            className="idev-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import file"
          >
            <Upload size={14} />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple
        style={{ display: "none" }}
        onChange={handleFileInput}
      />

      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="idev-new-file-form">
          <input
            className="idev-new-file-input"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.ext"
            autoFocus
            onBlur={() => {
              if (!newFileName.trim()) {
                setIsCreating(false);
                setCreateLanguageOverride(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsCreating(false);
                setCreateLanguageOverride(null);
                setNewFileName("");
              }
            }}
          />
        </form>
      )}

      <div className="idev-file-list">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            className={`idev-file-item ${file.id === activeFileId ? "active" : ""}`}
            onClick={() => onFileSelect(file.id)}
          >
            <FileCode2 size={14} className="idev-file-item-icon" style={{ color: getLanguageConfig(file.language).color }} />
            {renamingId === file.id ? (
              <form onSubmit={(e) => handleRenameSubmit(file.id, e)} style={{ flex: 1 }}>
                <input
                  className="idev-rename-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="filename"
                  autoFocus
                  onBlur={() => handleRenameSubmit(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setRenamingId(null);
                      setRenameValue("");
                      setRenameExtension("");
                    }
                  }}
                />
              </form>
            ) : (
              <span className="idev-file-name">{file.name}</span>
            )}
            <div className="idev-file-item-actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="idev-file-action-btn"
                onClick={() => {
                  const { baseName, extension } = splitFileNameForRename(file.name);
                  setRenamingId(file.id);
                  setRenameValue(baseName);
                  setRenameExtension(extension);
                }}
                title="Rename"
              >
                <Edit3 size={13} />
              </button>
              <button
                type="button"
                className="idev-file-action-btn"
                onClick={() => onDeleteFile(file.id)}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </button>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="idev-guest-banner">
          <p>Guest files are temporary. Please sign in to persist your workspace.</p>
          <button
            type="button"
            className="idev-guest-btn"
            onClick={() => window.location.href = "./signin"}
          >
            Login to Sync
          </button>
        </div>
      )}
    </div>
  );
}

function RightContextPanel({
  activeRail,
  stdin,
  onStdinChange,
  inputPresets,
  testCases,
  testRunProgress,
  testRunInFlight,
  onRunAllTests,
  onRunSingleTest,
  onAddTestCase,
  onDeleteTestCase,
  onUpdateTestCase,
  aiMessages,
  aiInput,
  onAiInputChange,
  onSendAi,
  onQuickAiAction,
  onCopyAiCode,
  showComplexityBadge,
  debugState,
  breakpoints,
  onDebuggerStart,
  onDebuggerPause,
  onDebuggerContinue,
  onDebuggerStep,
  onDebuggerReset,
  onToggleWatchPin,
  snapshots,
  activeSnapshotId,
  onCaptureSnapshot,
  onRestoreSnapshot,
  files,
  activeFileId,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onImportFile,
  isAuthenticated,
}) {
  if (activeRail === "explorer") {
    return (
      <aside className="idev-context-panel" aria-label="Explorer panel">
        <ExplorerPanel
          files={files}
          activeFileId={activeFileId}
          onFileSelect={onFileSelect}
          onCreateFile={onCreateFile}
          onDeleteFile={onDeleteFile}
          onRenameFile={onRenameFile}
          onImportFile={onImportFile}
          isAuthenticated={isAuthenticated}
        />
      </aside>
    );
  }

  if (activeRail === "debugger") {
    return (
      <aside className="idev-context-panel" aria-label="Debugger panel">
        <DebuggerPanel
          debugState={debugState}
          breakpoints={breakpoints}
          onStart={onDebuggerStart}
          onPause={onDebuggerPause}
          onContinue={onDebuggerContinue}
          onStep={onDebuggerStep}
          onReset={onDebuggerReset}
          onToggleWatchPin={onToggleWatchPin}
        />
      </aside>
    );
  }

  if (activeRail === "history") {
    return (
      <aside className="idev-context-panel" aria-label="History timeline panel">
        <HistoryPanel
          snapshots={snapshots}
          activeSnapshotId={activeSnapshotId}
          onCapture={onCaptureSnapshot}
          onRestore={onRestoreSnapshot}
        />
      </aside>
    );
  }

  if (activeRail === "tests") {
    return (
      <aside className="idev-context-panel" aria-label="Test cases panel">
        <TestCasesPanel
          testCases={testCases}
          testRunProgress={testRunProgress}
          testRunInFlight={testRunInFlight}
          onRunAll={onRunAllTests}
          onRunCase={onRunSingleTest}
          onAddCase={onAddTestCase}
          onDeleteCase={onDeleteTestCase}
          onUpdateCase={onUpdateTestCase}
        />
      </aside>
    );
  }

  if (activeRail === "ai") {
    return (
      <aside className="idev-context-panel" aria-label="AI assist panel">
        <AIAssistPanel
          messages={aiMessages}
          input={aiInput}
          onInputChange={onAiInputChange}
          onSend={onSendAi}
          onQuickAction={onQuickAiAction}
          onCopyCode={onCopyAiCode}
          showComplexity={showComplexityBadge}
        />
      </aside>
    );
  }

  return (
    <aside className="idev-context-panel" aria-label="Input and profile panel">
      <div className="idev-panel-header">
        <h3>stdin</h3>
        <button type="button" className="idev-icon-btn" aria-label="Add input preset">
          <FilePlus2 size={14} />
        </button>
      </div>

      <textarea
        className="idev-textarea"
        value={stdin}
        onChange={(event) => onStdinChange(event.target.value)}
        placeholder="Enter program input here..."
      />

      <div className="idev-chip-wrap" aria-label="Input presets">
        {inputPresets.map((chip) => (
          <button
            key={chip}
            type="button"
            className="idev-input-chip"
            onClick={() => onStdinChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="idev-run-profile">
        <h3>Execution Profile</h3>
        <div className="idev-kv-row">
          <span>Timeout</span>
          <strong>2s</strong>
        </div>
        <div className="idev-kv-row">
          <span>Memory</span>
          <strong>256 MB</strong>
        </div>
        <div className="idev-kv-row">
          <span>Optimization</span>
          <strong>O2</strong>
        </div>
        <div className="idev-kv-row">
          <span>Mode</span>
          <strong>Public</strong>
        </div>
      </div>

      <div className="idev-note-row">
        <Sparkles size={14} />
        <span>Public route enabled, no sign-in required.</span>
      </div>
    </aside>
  );
}

function WorkbenchLayout({
  activeLanguage,
  code,
  onCodeChange,
  theme,
  onCursorChange,
  fontSize,
  keybindingMode,
  runStatus,
  runMeta,
  runStreams,
  showFormatSweep,
  activeRail,
  onSetActiveRail,
  expandedRail,
  onSetExpandedRail,
  contextPanelOpen,
  onSetContextPanelOpen,
  breakpoints,
  onToggleBreakpoint,
  debugLine,
  debugEnabled,
  rightPanelWidth,
  editorPanelHeight,
  onStartRightResize,
  onStartOutputResize,
  onResetRightPanelSize,
  onResetOutputPanelSize,
  onResizeSeparatorKeyDown,
  resizeMode,
  contextPanelProps,
  tabs = [],
  activeFileId,
  onTabSwitch,
  onTabClose,
  onCreateFile,
  onEditorMount,
}) {
  return (
    <article className="idev-workbench" aria-label="Full workbench layout">
      <div
        className="idev-workbench-main"
        style={{
          "--idev-context-width": contextPanelOpen ? `${rightPanelWidth}px` : "0px",
          "--idev-rail-width": expandedRail ? "176px" : "56px",
        }}
      >
        <motion.aside
          layout
          className={`idev-rail ${expandedRail ? "idev-rail-expanded" : ""}`}
          aria-label="Activity rail"
        >
          <div className="idev-rail-stack">
            {RAIL_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`idev-rail-btn ${activeRail === item.id ? "idev-rail-active" : ""}`}
                  onClick={() => {
                    if (activeRail === item.id && contextPanelOpen) {
                      onSetContextPanelOpen(false);
                      return;
                    }

                    onSetActiveRail(item.id);
                    onSetContextPanelOpen(true);
                  }}
                  aria-label={item.label}
                >
                  <Icon size={16} />
                  <span className="idev-rail-label">{item.label}</span>
                  {!expandedRail && <span className="idev-tooltip">{item.label}</span>}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="idev-rail-collapse"
            onClick={() => onSetExpandedRail((prev) => !prev)}
            aria-label={expandedRail ? "Collapse left sidebar" : "Expand left sidebar"}
          >
            {expandedRail ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </motion.aside>

        <div className="idev-main-column" style={{ "--idev-editor-height": `${editorPanelHeight}px` }}>
          <div className="idev-editor-wrap">
            <EditorSurface
              language={activeLanguage}
              code={code}
              onCodeChange={onCodeChange}
              theme={theme}
              fontSize={fontSize}
              keybindingMode={keybindingMode}
              showFormatSweep={showFormatSweep}
              breakpoints={breakpoints}
              onToggleBreakpoint={onToggleBreakpoint}
              debugLine={debugLine}
              debugEnabled={debugEnabled}
              onCursorChange={onCursorChange}
              tabs={tabs}
              activeFileId={activeFileId}
              onTabSwitch={onTabSwitch}
              onTabClose={onTabClose}
              onCreateFile={onCreateFile}
              onEditorMount={onEditorMount}
            />
          </div>

          <button
            type="button"
            className={`idev-pane-resizer idev-pane-resizer-horizontal ${
              resizeMode === "output" ? "idev-pane-resizer-active" : ""
            }`}
            onPointerDown={onStartOutputResize}
            onDoubleClick={onResetOutputPanelSize}
            onKeyDown={(event) => onResizeSeparatorKeyDown("output", event)}
            role="separator"
            aria-label="Resize editor panel"
            aria-orientation="horizontal"
            aria-valuemin={EDITOR_PANEL_MIN}
            aria-valuemax={EDITOR_PANEL_MAX}
            aria-valuenow={Math.round(editorPanelHeight)}
          />

          <div className="idev-output-wrap">
            <OutputPanel
              runStatus={runStatus}
              activeLanguage={activeLanguage}
              runMeta={runMeta}
              runStreams={runStreams}
            />
          </div>
        </div>

        {contextPanelOpen ? (
          <>
            <button
              type="button"
              className={`idev-pane-resizer idev-pane-resizer-vertical ${
                resizeMode === "right" ? "idev-pane-resizer-active" : ""
              }`}
              onPointerDown={onStartRightResize}
              onDoubleClick={onResetRightPanelSize}
              onKeyDown={(event) => onResizeSeparatorKeyDown("right", event)}
              role="separator"
              aria-label="Resize context panel"
              aria-orientation="vertical"
              aria-valuemin={RIGHT_PANEL_MIN}
              aria-valuemax={RIGHT_PANEL_MAX}
              aria-valuenow={Math.round(rightPanelWidth)}
            />

            <div className="idev-context-wrap">
              <button
                type="button"
                className="idev-context-panel-toggle"
                onClick={() => onSetContextPanelOpen(false)}
                aria-label="Collapse context panel"
              >
                <PanelLeftClose size={15} />
              </button>
              <RightContextPanel activeRail={activeRail} {...contextPanelProps} />
            </div>
          </>
        ) : (
          <button
            type="button"
            className="idev-context-reopen"
            onClick={() => onSetContextPanelOpen(true)}
            aria-label="Open context panel"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}
      </div>
    </article>
  );
}

function FocusLayout({
  activeLanguage,
  activeFileName,
  code,
  onCodeChange,
  onToggleFocus,
  onLanguageChange,
  onRun,
  runStatus,
  runMeta,
  runStreams,
  theme,
  onCursorChange,
  fontSize,
  keybindingMode,
  showFormatSweep,
  tabs,
  activeFileId,
  onTabSwitch,
  onTabClose,
  onCreateFile,
}) {
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (runStatus !== "READY") {
      setShowOutput(true);
    }
  }, [runStatus]);

  return (
    <article className="idev-focus-mode" aria-label="Focus mode layout">
      <div className="idev-focus-toolbar liquid-glass">
        <div className="idev-breadcrumb">
          <button type="button" className="idev-breadcrumb-back" onClick={onToggleFocus}>
            <ChevronLeft size={16} />
            <span>Exit Focus</span>
          </button>
          <span className="idev-divider">/</span>
          <span className="idev-breadcrumb-file">{activeFileName || getFileName(activeLanguage)}</span>
        </div>

        <div className="idev-focus-actions">
          <LanguagePicker compact activeLanguage={activeLanguage} onChange={onLanguageChange} />

          <button type="button" className="idev-btn-primary" onClick={onRun}>
            {isBusy(runStatus) ? <Square size={14} /> : <Play size={14} />}
            {isBusy(runStatus) ? "Stop" : "Run Script"}
          </button>

          <button
            type="button"
            className={`idev-btn-secondary ${showOutput ? "active" : ""}`}
            onClick={() => setShowOutput((prev) => !prev)}
          >
            {showOutput ? "Hide Output" : "Show Console"}
          </button>
        </div>
      </div>

      <EditorSurface
        language={activeLanguage}
        code={code}
        onCodeChange={onCodeChange}
        theme={theme}
        fontSize={fontSize}
        keybindingMode={keybindingMode}
        showFormatSweep={showFormatSweep}
        onCursorChange={onCursorChange}
        tabs={tabs}
        activeFileId={activeFileId}
        onTabSwitch={onTabSwitch}
        onTabClose={onTabClose}
        showCreateFileButton={false}
        onCreateFile={onCreateFile}
      />

      <div className="idev-diagnostics-strip" role="status" aria-live="polite">
        <div className="idev-diag-success">
          <Check size={14} /> Core checks passed
        </div>
        <div className="idev-diag-warning">
          <AlertTriangle size={14} /> Add custom stdin before final run
        </div>
      </div>

      <AnimatePresence>
        {showOutput && (
          <motion.div
            className="idev-focus-output-drawer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <OutputPanel
              compact
              runStatus={runStatus}
              activeLanguage={activeLanguage}
              runMeta={runMeta}
              runStreams={runStreams}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function MobileLayout({
  activeLanguage,
  code,
  onCodeChange,
  onLanguageChange,
  onRun,
  runStatus,
  runMeta,
  runStreams,
  stdin,
  onStdinChange,
  theme,
  onCursorChange,
  onCreateFile,
}) {
  const [activeMode, setActiveMode] = useState("Edit");
  const modes = ["Edit", "Input", "Output", "AI", "Details"];

  return (
    <article className="idev-mobile-wrap" aria-label="Mobile mode layout">
      <div className="idev-mobile-device">
        <header className="idev-mobile-header">
          <span>AlgoViz IDE</span>
          <LanguagePicker compact activeLanguage={activeLanguage} onChange={onLanguageChange} />
        </header>

        <main className="idev-mobile-main">
          {activeMode === "Edit" && (
            <EditorSurface
              language={activeLanguage}
              code={code}
              onCodeChange={onCodeChange}
              theme={theme}
              fontSize={13}
              keybindingMode="STD"
              showFormatSweep={false}
              onCursorChange={onCursorChange}
              onCreateFile={onCreateFile}
            />
          )}

          {activeMode === "Input" && (
            <div className="idev-mobile-pane">
              <h3>Input</h3>
              <textarea
                className="idev-textarea"
                value={stdin}
                onChange={(event) => onStdinChange(event.target.value)}
              />
            </div>
          )}

          {activeMode === "Output" && (
            <div className="idev-mobile-pane">
              <OutputPanel
                compact
                runStatus={runStatus}
                activeLanguage={activeLanguage}
                runMeta={runMeta}
                runStreams={runStreams}
              />
            </div>
          )}

          {activeMode === "AI" && (
            <div className="idev-mobile-pane idev-mobile-ai">
              <h3>AI Assist</h3>
              <div className="idev-ai-chip-wrap">
                <button type="button">Explain</button>
                <button type="button">Find Bugs</button>
                <button type="button">Optimize</button>
              </div>
              <p>Ask AI to explain logic, find bugs, or optimize performance.</p>
            </div>
          )}

          {activeMode === "Details" && (
            <div className="idev-mobile-pane">
              <h3>Execution Details</h3>
              <div className="idev-kv-row">
                <span>Status</span>
                <strong>{runStreams.verdict || runStatus}</strong>
              </div>
              <div className="idev-kv-row">
                <span>Runtime</span>
                <strong>{getLanguageConfig(activeLanguage).runtime}</strong>
              </div>
              <div className="idev-kv-row">
                <span>Last Time</span>
                <strong>{runMeta.timeMs}ms</strong>
              </div>
            </div>
          )}
        </main>

        <nav className="idev-mobile-nav" aria-label="Mobile IDE mode switch">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`idev-mobile-tab ${activeMode === mode ? "idev-mobile-tab-active" : ""}`}
              onClick={() => setActiveMode(mode)}
            >
              {mode}
            </button>
          ))}
        </nav>

        <button type="button" className="idev-mobile-run" onClick={onRun} aria-label="Run code">
          {isBusy(runStatus) ? <Square size={16} /> : <Play size={16} />}
        </button>
      </div>
    </article>
  );
}

function IDECommandPalette({
  open,
  onClose,
  query,
  onQueryChange,
  commands,
  activeIndex,
  onActiveIndexChange,
  onExecute,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const id = window.setTimeout(() => inputRef.current?.focus(), 12);
    return () => window.clearTimeout(id);
  }, [open]);

  const rows = useMemo(() => {
    const list = [];
    let currentGroup = "";

    commands.forEach((command, index) => {
      if (command.group !== currentGroup) {
        currentGroup = command.group;
        list.push({ type: "group", key: `group-${currentGroup}`, label: currentGroup });
      }

      list.push({ type: "item", key: command.id, command, index });
    });

    return list;
  }, [commands]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="idev-command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
        >
          <motion.section
            className="idev-command-palette-card liquid-glass"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-label="IDE command palette"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="idev-command-search-row">
              <Terminal size={15} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                className="idev-command-search"
                placeholder="Type a command or search..."
                aria-label="Search command"
              />
              <span className="idev-command-hint">Ctrl+K</span>
            </div>

            <div className="idev-command-list" role="listbox">
              {rows.map((row) => (
                <div key={row.key}>
                  {row.type === "group" && (
                    <div className="idev-command-group-label">{row.label}</div>
                  )}
                  {row.type === "item" && (
                    <button
                      type="button"
                      className={`idev-command-item ${activeIndex === row.index ? "idev-command-active" : ""}`}
                      onClick={() => onExecute(row.command)}
                      onMouseEnter={() => onActiveIndexChange(row.index)}
                    >
                      <span className="idev-command-icon">
                        {getCommandIcon(row.command.id)}
                      </span>
                      <div className="idev-command-text">
                        <span className="idev-command-label">{row.command.label}</span>
                        <span className="idev-command-desc">{row.command.description}</span>
                      </div>
                      {row.command.kbd && (
                        <kbd className="idev-command-kbd">{row.command.kbd}</kbd>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NewFileNameDialog({
  open,
  languageValue,
  baseName,
  onBaseNameChange,
  onClose,
  onConfirm,
}) {
  const inputRef = useRef(null);
  const safeLanguage = languageValue || "plaintext";
  const languageLabel = getLanguageConfig(safeLanguage).label;
  const extension = getExtFromLanguage(safeLanguage);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    onConfirm();
  }, [onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="idev-language-switch-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
        >
          <motion.section
            className="idev-language-switch-card liquid-glass"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="Create new file"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="idev-language-switch-header">
              <h3>Create {languageLabel} File</h3>
              <p>Type only the file name. The .{extension} extension is added automatically.</p>
            </header>

            <form onSubmit={handleSubmit} className="idev-new-file-form" style={{ marginTop: 12 }}>
              <input
                ref={inputRef}
                className="idev-new-file-input"
                value={baseName}
                onChange={(event) => onBaseNameChange(event.target.value)}
                placeholder="filename"
                autoFocus
                onFocus={(event) => event.target.select()}
              />

              <div className="idev-language-switch-footer" style={{ marginTop: 14 }}>
                <button type="button" className="idev-btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="idev-btn-primary">
                  Create
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LanguageSwitchDialog({
  open,
  currentFileName,
  targetLanguage,
  onClose,
  onUseCurrentFile,
  onStartNewFile,
}) {
  const languageLabel = getLanguageConfig(targetLanguage).label;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="idev-language-switch-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
        >
          <motion.section
            className="idev-language-switch-card liquid-glass"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm language switch"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="idev-language-switch-header">
              <h3>Switch To {languageLabel}</h3>
              <p>Choose how you want to apply this language change.</p>
            </header>

            <div className="idev-language-switch-options">
              <button
                type="button"
                className="idev-language-switch-option"
                onClick={onUseCurrentFile}
              >
                <span className="idev-language-switch-icon"><FileCode2 size={16} /></span>
                <span className="idev-language-switch-copy">
                  <strong>Use Current File</strong>
                  <span>
                    Keep existing code, switch language, and change extension of {currentFileName || "the current file"}.
                  </span>
                </span>
              </button>

              <button
                type="button"
                className="idev-language-switch-option"
                onClick={onStartNewFile}
              >
                <span className="idev-language-switch-icon"><FilePlus2 size={16} /></span>
                <span className="idev-language-switch-copy">
                  <strong>Start New File</strong>
                  <span>
                    Open a new {languageLabel} file with boilerplate and keep this file unchanged.
                  </span>
                </span>
              </button>
            </div>

            <div className="idev-language-switch-footer">
              <button type="button" className="idev-btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatusBar({ activeLanguage, runStatus, runMeta, runVerdict, keybindingMode, cursor }) {
  const language = getLanguageConfig(activeLanguage);

  return (
    <footer className="idev-status-bar">
      <div className="idev-status-left">
        <span>
          {language.label} · {language.runtime}
        </span>
        <span>UTF-8</span>
        <span>
          Ln {cursor.line}, Col {cursor.column}
        </span>
      </div>

      <div className="idev-status-right">
        <span className={`idev-status-chip idev-status-${runStatus.toLowerCase()}`} aria-live="polite">
          {getStatusLabel(runStatus, runMeta, runVerdict)}
        </span>
        <span className="idev-status-kbd">{keybindingMode}</span>
        <span className="idev-status-cloud">Cloud Ready</span>
      </div>
    </footer>
  );
}

const getCommandIcon = (id) => {
  switch (id) {
    case "run": return <Play size={14} />;
    case "format": return <FileCode size={14} />;
    case "share": return <Share2 size={14} />;
    case "focus": return <Fullscreen size={14} />;
    case "theme": return <Palette size={14} />;
    case "new-file": return <Plus size={14} />;
    case "import": return <Upload size={14} />;
    default: return <Command size={14} />;
  }
};

export default function IDEPlaygroundPage() {
  const { theme, toggleTheme } = useTheme();
  const initialFilesRef = useRef(loadFilesFromStorage());
  const [activeLayout, setActiveLayout] = useState("workbench");
  const [files, setFiles] = useState(() => initialFilesRef.current);
  const [openTabs, setOpenTabs] = useState(() => [initialFilesRef.current[0]?.id || "file-default"]);
  const [activeFileId, setActiveFileId] = useState(() => initialFilesRef.current[0]?.id || "file-default");
  const [runStatus, setRunStatus] = useState("READY");
  const [fontSize, setFontSize] = useState(14);
  const [keybindingMode, setKeybindingMode] = useState("STD");
  const [showFormatSweep, setShowFormatSweep] = useState(false);
  const [runMeta, setRunMeta] = useState({ timeMs: 0, memoryMb: "0.0", exitCode: 0 });
  const [runStreams, setRunStreams] = useState(DEFAULT_RUN_STREAMS);
  const [stdin, setStdin] = useState("12");

  const isAuthenticated = Boolean(getAuthSnapshot().token);
  const editorInstanceRef = useRef(null);

  const activeFile = useMemo(() => files.find((f) => f.id === activeFileId) || files[0], [files, activeFileId]);
  const activeLanguage = activeFile?.language ?? "cpp";
  const activeCode = activeFile?.content ?? "";

  const tabData = useMemo(
    () => openTabs.map((tabId) => files.find((f) => f.id === tabId)).filter(Boolean),
    [openTabs, files],
  );
  const inputPresets = useMemo(() => ["12", "[1,2,3]", "hello world"], []);
  const [editorCursor, setEditorCursor] = useState({ line: 1, column: 1 });
  const [activeRail, setActiveRail] = useState("editor");
  const [expandedRail, setExpandedRail] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);
  const [breakpoints, setBreakpoints] = useState([]);
  const [debugState, setDebugState] = useState(() => createDebugState());
  const [rightPanelWidth, setRightPanelWidth] = useState(DEFAULT_RIGHT_PANEL_WIDTH);
  const [editorPanelHeight, setEditorPanelHeight] = useState(DEFAULT_EDITOR_PANEL_HEIGHT);
  const [resizeMode, setResizeMode] = useState(null);
  const [isCompactMode, setIsCompactMode] = useState(isCompactViewport);

  const [snapshots, setSnapshots] = useState(() => [
    createSnapshotEntry({
      id: 1,
      reason: "Initial workspace",
      language: "cpp",
      status: "READY",
      timeMs: 0,
      line: getDefaultDebugLine(),
    }),
  ]);
  const [activeSnapshotId, setActiveSnapshotId] = useState(1);

  const [testCases, setTestCases] = useState([
    {
      id: 1,
      label: "Case 1",
      stdin: "12",
      expected: "144",
      got: "",
      status: "pending",
    },
    {
      id: 2,
      label: "Case 2",
      stdin: "7",
      expected: "49",
      got: "",
      status: "pending",
    },
    {
      id: 3,
      label: "Case 3",
      stdin: "5",
      expected: "26",
      got: "",
      status: "pending",
    },
  ]);
  const [testRunProgress, setTestRunProgress] = useState(0);
  const [testRunInFlight, setTestRunInFlight] = useState(false);

  const [aiMessages, setAiMessages] = useState([DEFAULT_AI_MESSAGE]);
  const [aiInput, setAiInput] = useState("");
  const [showComplexityBadge, setShowComplexityBadge] = useState(false);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [pendingLanguageChange, setPendingLanguageChange] = useState(null);
  const [pendingNewFileDraft, setPendingNewFileDraft] = useState(null);

  const activeCodeLineCount = useMemo(
    () => Math.max(activeCode.split("\n").length, 1),
    [activeCode],
  );

  const selectableLayouts = useMemo(
    () =>
      isCompactMode
        ? LAYOUT_OPTIONS.filter((layout) => layout.id === "mobile")
        : LAYOUT_OPTIONS.filter((layout) => layout.id !== "mobile"),
    [isCompactMode],
  );

  const runAbortControllerRef = useRef(null);
  const testTimersRef = useRef([]);
  const debugTimersRef = useRef([]);
  const resizeOriginRef = useRef({
    x: 0,
    y: 0,
    rightWidth: DEFAULT_RIGHT_PANEL_WIDTH,
    editorHeight: DEFAULT_EDITOR_PANEL_HEIGHT,
    mainColumnRect: null,
  });
  const nextTestCaseIdRef = useRef(4);
  const nextAiMessageIdRef = useRef(2);
  const nextSnapshotIdRef = useRef(2);

  const clearTestTimers = useCallback(() => {
    testTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    testTimersRef.current = [];
  }, []);

  const queueTestTransition = useCallback((fn, delay) => {
    const id = window.setTimeout(fn, delay);
    testTimersRef.current.push(id);
  }, []);

  const clearDebugTimers = useCallback(() => {
    debugTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    debugTimersRef.current = [];
  }, []);

  const queueDebugTransition = useCallback((fn, delay) => {
    const id = window.setTimeout(fn, delay);
    debugTimersRef.current.push(id);
  }, []);

  useEffect(
    () => () => {
      runAbortControllerRef.current?.abort();
      clearTestTimers();
      clearDebugTimers();
    },
    [clearDebugTimers, clearTestTimers],
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const handleViewportChange = (event) => setIsCompactMode(event.matches);

    setIsCompactMode(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleViewportChange);
      return () => mediaQuery.removeEventListener("change", handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  useEffect(() => {
    if (isCompactMode && activeLayout !== "mobile") {
      setActiveLayout("mobile");
      return;
    }

    if (!isCompactMode && activeLayout === "mobile") {
      setActiveLayout("workbench");
    }
  }, [activeLayout, isCompactMode]);

  useEffect(() => {
    setBreakpoints((prev) => {
      const next = prev.filter((line) => line <= activeCodeLineCount);
      return next.length === prev.length ? prev : next;
    });

    setDebugState((prev) => {
      const clampedLine = clamp(prev.line, 1, activeCodeLineCount);
      if (clampedLine === prev.line) {
        return prev;
      }

      const pinState = new Map(prev.watches.map((watch) => [watch.id, watch.pinned]));
      const watches = buildDebuggerWatches(clampedLine).map((watch) => ({
        ...watch,
        pinned: pinState.get(watch.id) || false,
      }));

      return {
        ...prev,
        line: clampedLine,
        callStack: buildCallStackForLine(clampedLine),
        watches,
      };
    });
  }, [activeCodeLineCount]);

  useEffect(() => {
    if (!resizeMode) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      if (resizeMode === "right") {
        const { rightWidth, x } = resizeOriginRef.current;
        const deltaX = event.clientX - x;
        const nextWidth = clamp(rightWidth - deltaX, RIGHT_PANEL_MIN, RIGHT_PANEL_MAX);
        setRightPanelWidth(nextWidth);
        return;
      }

      const { y } = resizeOriginRef.current;
      const deltaY = event.clientY - y;
      const { editorHeight, mainColumnRect } = resizeOriginRef.current;
      const clampedEditorMax = getMaxEditorPanelHeight(mainColumnRect);
      const nextHeight = clamp(editorHeight + deltaY, EDITOR_PANEL_MIN, clampedEditorMax);
      setEditorPanelHeight(nextHeight);
    };

    const handlePointerUp = () => setResizeMode(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizeMode]);

  useEffect(() => {
    if (activeLayout !== "workbench" || typeof document === "undefined") {
      return undefined;
    }

    const clampEditorHeightToLayout = () => {
      const mainColumnRect = document
        .querySelector(".idev-main-column")
        ?.getBoundingClientRect() || null;
      const maxEditorHeight = getMaxEditorPanelHeight(mainColumnRect);

      setEditorPanelHeight((prev) => clamp(prev, EDITOR_PANEL_MIN, maxEditorHeight));
    };

    const frameId = window.requestAnimationFrame(clampEditorHeightToLayout);
    window.addEventListener("resize", clampEditorHeightToLayout);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", clampEditorHeightToLayout);
    };
  }, [activeLayout]);

  useEffect(() => {
    if (!showFormatSweep) {
      return undefined;
    }

    const id = window.setTimeout(() => setShowFormatSweep(false), 520);
    return () => window.clearTimeout(id);
  }, [showFormatSweep]);

  const pushSnapshot = useCallback(
    (reason, overrides = {}) => {
      const language = overrides.language || activeLanguage;
      const status = overrides.status || runStatus;
      const timeMs = overrides.timeMs ?? runMeta.timeMs;
      const line = overrides.line ?? debugState.line;

      const id = nextSnapshotIdRef.current;
      nextSnapshotIdRef.current += 1;

      const entry = createSnapshotEntry({
        id,
        reason,
        language,
        status,
        timeMs,
        line,
      });

      setSnapshots((prev) => [entry, ...prev].slice(0, 16));
      setActiveSnapshotId(id);

      return entry;
    },
    [activeLanguage, debugState.line, runMeta.timeMs, runStatus],
  );

  const setDebuggerFrame = useCallback((line, mode, lastStep) => {
    setDebugState((prev) => {
      const pinState = new Map(prev.watches.map((watch) => [watch.id, watch.pinned]));
      const watches = buildDebuggerWatches(line).map((watch) => ({
        ...watch,
        pinned: pinState.get(watch.id) || false,
      }));

      return {
        ...prev,
        mode,
        line,
        lastStep,
        callStack: buildCallStackForLine(line),
        watches,
      };
    });
  }, []);

  const openExplorerCreateFlow = useCallback(
    (preferredLanguage = null) => {
      const targetLanguage = preferredLanguage || activeLanguage;
      const nextName = ensureUniqueFileName({
        files,
        fileName: buildStarterFileName(files, targetLanguage),
      });
      const { baseName } = splitFileNameForRename(nextName);

      setPendingNewFileDraft({
        languageValue: targetLanguage,
        baseName: baseName || "untitled",
      });
    },
    [activeLanguage, files],
  );

  const applyLanguageChange = useCallback(
    (languageValue, strategy) => {
      const languageLabel = getLanguageConfig(languageValue).label;
      const targetFileId = activeFileId || files[0]?.id;

      const switchCurrentFileLanguage = () => {
        if (!targetFileId) {
          return false;
        }

        const target = files.find((file) => file.id === targetFileId);
        if (!target) {
          return false;
        }

        const requestedName = replaceFileExtensionForLanguage(target.name, languageValue);
        const uniqueName = ensureUniqueFileName({
          files,
          fileName: requestedName,
          excludeFileId: targetFileId,
        });

        setFiles((prev) =>
          prev.map((file) => {
            if (file.id !== targetFileId) {
              return file;
            }

            return {
              ...file,
              language: languageValue,
              name: uniqueName,
            };
          }),
        );

        if (!openTabs.includes(targetFileId)) {
          setOpenTabs((prev) => [...prev, targetFileId]);
        }

        setActiveFileId(targetFileId);
        setRunStatus("READY");
        pushSnapshot(`Switched current file to ${languageLabel}`, {
          language: languageValue,
          status: "READY",
        });

        if (uniqueName !== requestedName) {
          toast.error(`File already exists. Used ${uniqueName} instead.`);
        }

        toast.success(`Current file is now ${languageLabel}`);
        return true;
      };

      const startNewLanguageFile = () => {
        openExplorerCreateFlow(languageValue);
        toast.success(`Type a name for your new ${languageLabel} file`);
      };

      if (strategy === "current-file") {
        if (!switchCurrentFileLanguage()) {
          startNewLanguageFile();
        }
        return;
      }

      startNewLanguageFile();
    },
    [activeFileId, files, openTabs, openExplorerCreateFlow, pushSnapshot],
  );

  const handleLanguageChange = useCallback(
    (languageValue, options = {}) => {
      if (!languageValue || languageValue === activeLanguage) {
        return;
      }

      const strategy = options.strategy || "prompt";
      if (strategy === "prompt") {
        setPendingLanguageChange({ languageValue });
        return;
      }

      applyLanguageChange(languageValue, strategy);
    },
    [activeLanguage, applyLanguageChange],
  );

  const closeLanguageSwitchDialog = useCallback(() => {
    setPendingLanguageChange(null);
  }, []);

  const handleLanguageSwitchUseCurrentFile = useCallback(() => {
    if (!pendingLanguageChange?.languageValue) {
      return;
    }

    applyLanguageChange(pendingLanguageChange.languageValue, "current-file");
    setPendingLanguageChange(null);
  }, [applyLanguageChange, pendingLanguageChange]);

  const handleLanguageSwitchStartNewFile = useCallback(() => {
    if (!pendingLanguageChange?.languageValue) {
      return;
    }

    applyLanguageChange(pendingLanguageChange.languageValue, "new-file");
    setPendingLanguageChange(null);
  }, [applyLanguageChange, pendingLanguageChange]);

  const handleCodeChange = useCallback(
    (nextCode) => {
      setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, content: nextCode } : f)));
    },
    [activeFileId],
  );

  // Persistence handler
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const { userId } = getAuthSnapshot();
    const storageKey = getUserWorkspaceStorageKey(userId);
    if (!storageKey) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(files));
    } catch {}
  }, [files, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const { userId } = getAuthSnapshot();
    const storageKey = getUserWorkspaceStorageKey(userId);
    if (!storageKey) {
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setFiles(parsed);
        const firstId = parsed[0].id;
        setOpenTabs([firstId]);
        setActiveFileId(firstId);
      }
    } catch {}
  }, [isAuthenticated]);

  const handleTabSwitch = useCallback((tabId) => {
    setActiveFileId(tabId);
    if (!openTabs.includes(tabId)) setOpenTabs((prev) => [...prev, tabId]);
  }, [openTabs]);

  const handleTabClose = useCallback((tabId) => {
    setOpenTabs((prev) => {
      const nextTabs = prev.filter((id) => id !== tabId);
      if (activeFileId === tabId && nextTabs.length > 0) {
        setActiveFileId(nextTabs[nextTabs.length - 1]);
      } else if (nextTabs.length === 0) {
        // Always keep at least one tab open/active by creating/selecting default if empty
        // But for now, just fallback to first available file
        setActiveFileId(files[0]?.id);
        return [files[0]?.id];
      }
      return nextTabs;
    });
  }, [activeFileId, files]);

  const handleFileCreate = useCallback((name, options = {}) => {
    const preferredLanguage = options.language || null;
    const trimmedName = String(name || "").trim();
    if (!trimmedName) {
      return;
    }

    const fallbackExt = getExtFromLanguage(preferredLanguage || "plaintext");
    let baseName = trimmedName.includes(".") ? trimmedName : `${trimmedName}.${fallbackExt}`;
    if (preferredLanguage) {
      baseName = replaceFileExtensionForLanguage(baseName, preferredLanguage);
    }

    const uniqueName = ensureUniqueFileName({ files, fileName: baseName });
    const usedFallbackName = uniqueName !== baseName;
    const ext = uniqueName.split(".").pop();
    const lang = preferredLanguage || getLanguageFromExt(ext);
    const newId = generateFileId();
    const newFile = {
      id: newId,
      name: uniqueName,
      language: lang,
      content: CODE_SNIPPETS[lang] || "",
    };
    setFiles((prev) => [...prev, newFile]);
    setOpenTabs((prev) => [...prev, newId]);
    setActiveFileId(newId);

    if (usedFallbackName) {
      toast.error(`File already exists. Created as ${uniqueName}.`);
      return;
    }

    toast.success(`Created ${uniqueName}`);
  }, [files]);

  const handleQuickCreateFile = useCallback(() => {
    openExplorerCreateFlow(activeLanguage);
  }, [activeLanguage, openExplorerCreateFlow]);

  const closeNewFileDialog = useCallback(() => {
    setPendingNewFileDraft(null);
  }, []);

  const handlePendingNewFileBaseNameChange = useCallback((nextBaseName) => {
    setPendingNewFileDraft((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        baseName: nextBaseName,
      };
    });
  }, []);

  const handleConfirmPendingNewFile = useCallback(() => {
    if (!pendingNewFileDraft?.languageValue) {
      return;
    }

    const baseName = String(pendingNewFileDraft.baseName || "").trim();
    if (!baseName) {
      toast.error("File name is required");
      return;
    }

    handleFileCreate(baseName, { language: pendingNewFileDraft.languageValue });
    setPendingNewFileDraft(null);
  }, [handleFileCreate, pendingNewFileDraft]);

  const handleFileDelete = useCallback((fileId) => {
    if (files.length <= 1) {
      toast.error("Cannot delete the only file");
      return;
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setOpenTabs((prev) => prev.filter((id) => id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = files.filter((f) => f.id !== fileId);
      setActiveFileId(remainingFiles[remainingFiles.length - 1].id);
    }
    toast.success("File deleted");
  }, [files, activeFileId]);

  const handleFileRename = useCallback((fileId, newName) => {
    const requestedName = String(newName || "").trim();
    if (!requestedName) {
      return;
    }

    const uniqueName = ensureUniqueFileName({ files, fileName: requestedName, excludeFileId: fileId });
    const ext = uniqueName.split(".").pop();
    const lang = getLanguageFromExt(ext);

    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, name: uniqueName, language: lang } : f)));

    if (uniqueName !== requestedName) {
      toast.error(`File already exists. Renamed as ${uniqueName}.`);
      return;
    }

    toast.success("File renamed");
  }, [files]);

  const handleImportFile = useCallback((fileObject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const requestedName = String(fileObject.name || "").trim();
      const name = ensureUniqueFileName({ files, fileName: requestedName });
      const usedFallbackName = name !== requestedName;
      const ext = name.split(".").pop();
      const lang = getLanguageFromExt(ext);
      const newId = generateFileId();
      const newFile = { id: newId, name, language: lang, content };
      setFiles((prev) => [...prev, newFile]);
      setOpenTabs((prev) => [...prev, newId]);
      setActiveFileId(newId);

      if (usedFallbackName) {
        toast.error(`File already exists. Imported as ${name}.`);
        return;
      }

      toast.success(`Imported ${name}`);
    };
    reader.readAsText(fileObject);
  }, [files]);

  const handleToggleBreakpoint = useCallback((lineNo) => {
    setBreakpoints((prev) => {
      if (prev.includes(lineNo)) {
        return prev.filter((line) => line !== lineNo);
      }

      return [...prev, lineNo].sort((a, b) => a - b);
    });
  }, []);

  const handleStartResize = useCallback(
    (pane, event) => {
      event.preventDefault();

      const mainColumn = event.currentTarget.closest(".idev-main-column");

      resizeOriginRef.current = {
        x: event.clientX,
        y: event.clientY,
        rightWidth: rightPanelWidth,
        editorHeight: editorPanelHeight,
        mainColumnRect: mainColumn?.getBoundingClientRect() || null,
      };
      setResizeMode(pane);
    },
    [editorPanelHeight, rightPanelWidth],
  );

  const handleResetRightPanelSize = useCallback(() => {
    setRightPanelWidth(DEFAULT_RIGHT_PANEL_WIDTH);
  }, []);

  const handleResetOutputPanelSize = useCallback(() => {
    const mainColumnRect = typeof document === "undefined"
      ? null
      : document.querySelector(".idev-main-column")?.getBoundingClientRect() || null;
    const maxEditorHeight = getMaxEditorPanelHeight(mainColumnRect);

    setEditorPanelHeight(clamp(DEFAULT_EDITOR_PANEL_HEIGHT, EDITOR_PANEL_MIN, maxEditorHeight));
  }, []);

  const handleResizeSeparatorKeyDown = useCallback((pane, event) => {
    const step = event.shiftKey ? 24 : 12;

    if (pane === "right") {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setRightPanelWidth((prev) => clamp(prev + step, RIGHT_PANEL_MIN, RIGHT_PANEL_MAX));
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setRightPanelWidth((prev) => clamp(prev - step, RIGHT_PANEL_MIN, RIGHT_PANEL_MAX));
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const mainColumnRect = event.currentTarget
        ?.closest(".idev-main-column")
        ?.getBoundingClientRect() || null;
      const maxEditorHeight = getMaxEditorPanelHeight(mainColumnRect);

      setEditorPanelHeight((prev) => clamp(prev - step, EDITOR_PANEL_MIN, maxEditorHeight));
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const mainColumnRect = event.currentTarget
        ?.closest(".idev-main-column")
        ?.getBoundingClientRect() || null;
      const maxEditorHeight = getMaxEditorPanelHeight(mainColumnRect);

      setEditorPanelHeight((prev) => clamp(prev + step, EDITOR_PANEL_MIN, maxEditorHeight));
    }
  }, []);

  const handleFormat = useCallback(async () => {
    if (!editorInstanceRef.current) return;
    
    setShowFormatSweep(true);
    try {
      await editorInstanceRef.current.getAction("editor.action.formatDocument").run();
      toast.success("Code formatted");
    } catch (err) {
      console.warn("Formatting failed", err);
      toast.error("Format action failed");
    }
  }, []);

  const handleRun = useCallback(async () => {
    if (isBusy(runStatus)) {
      runAbortControllerRef.current?.abort();
      runAbortControllerRef.current = null;
      setRunStatus("READY");
      toast("Execution stopped");
      return;
    }

    const sourceCode = activeCode;
    if (!sourceCode.trim()) {
      toast.error("Editor is empty");
      return;
    }

    const controller = new AbortController();
    runAbortControllerRef.current = controller;

    setRunStatus("COMPILING");
    setRunMeta({ timeMs: 0, memoryMb: "0.0", exitCode: 0 });
    setRunStreams({
      ...DEFAULT_RUN_STREAMS,
      diagnostics: `Compiling ${getLanguageConfig(activeLanguage).label} source...`,
      verdict: "RUNNING",
      stdin,
    });

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 120));
      setRunStatus("RUNNING");

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const payload = {
        code: sourceCode,
        language: activeLanguage,
        stdin,
      };

      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/code/run-public`,
          payload,
          {
            headers,
            signal: controller.signal,
            timeout: 120000,
          },
        );
      } catch (primaryRunError) {
        const shouldUseLegacyRunRoute =
          primaryRunError?.response?.status === 404 && Boolean(token);

        if (!shouldUseLegacyRunRoute) {
          throw primaryRunError;
        }

        response = await axios.post(
          `${API_BASE_URL}/code/run-new`,
          payload,
          {
            headers,
            signal: controller.signal,
            timeout: 120000,
          },
        );
      }

      const normalized = normalizeRunResponse({
        data: response.data,
        activeLanguage,
        stdin,
      });

      setRunMeta(normalized.runMeta);
      setRunStreams(normalized.streams);
      setRunStatus("DONE");

      pushSnapshot(
        normalized.streams.verdict === "Accepted"
          ? "Run completed"
          : `Run finished (${normalized.streams.verdict})`,
        {
          status: "DONE",
          timeMs: normalized.runMeta.timeMs,
          line: debugState.line,
        },
      );

      if (normalized.streams.verdict === "Accepted") {
        toast.success("Run completed");
      } else {
        toast.error(normalized.streams.verdict);
      }
    } catch (error) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
        return;
      }

      const fallbackError =
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.response?.data?.message ||
        error?.message ||
        "Execution failed";

      setRunMeta({ timeMs: 0, memoryMb: "0.0", exitCode: 1 });
      setRunStreams({
        stdout: "",
        stderr: String(fallbackError),
        diagnostics: [
          "status: Error",
          `language: ${getLanguageConfig(activeLanguage).label}`,
          `stdin bytes: ${(stdin || "").length}`,
          "hint: verify backend /code/run-public availability.",
        ].join("\n"),
        verdict: "Error",
        stdin,
      });
      setRunStatus("DONE");
      pushSnapshot("Run failed", { status: "DONE", timeMs: 0, line: debugState.line });
      toast.error("Execution failed");
    } finally {
      if (runAbortControllerRef.current === controller) {
        runAbortControllerRef.current = null;
      }
    }
  }, [activeLanguage, activeCode, debugState.line, pushSnapshot, runStatus, stdin]);

  const handleShare = useCallback(async () => {
    const permalink = `${window.location.origin}/ide?lang=${activeLanguage}`;

    try {
      await navigator.clipboard.writeText(permalink);
      toast.success("Permalink copied");
    } catch {
      toast.error("Unable to copy link");
    }
  }, [activeLanguage]);


  const cycleKeybindingMode = useCallback(() => {
    setKeybindingMode((current) => {
      const currentIndex = KEYBINDING_MODES.findIndex((mode) => mode.value === current);
      const next = KEYBINDING_MODES[(currentIndex + 1) % KEYBINDING_MODES.length];
      return next.value;
    });
  }, []);

  const openWorkbenchPanel = useCallback((panelId) => {
    if (isCompactMode) {
      return;
    }

    setActiveLayout("workbench");
    setActiveRail(panelId);
    setContextPanelOpen(true);
  }, [isCompactMode]);

  const handleCaptureSnapshot = useCallback(() => {
    openWorkbenchPanel("history");
    pushSnapshot("Manual snapshot", { status: "READY" });
    toast.success("Snapshot captured");
  }, [openWorkbenchPanel, pushSnapshot]);

  const handleRestoreSnapshot = useCallback(
    (snapshotId) => {
      const snapshot = snapshots.find((entry) => entry.id === snapshotId);
      if (!snapshot) {
        return;
      }

      setActiveSnapshotId(snapshot.id);
      handleLanguageChange(snapshot.language, { strategy: "current-file" });
      setRunStatus(snapshot.status === "DONE" ? "DONE" : "READY");
      setRunMeta((prev) => ({
        ...prev,
        timeMs: snapshot.timeMs,
        exitCode: snapshot.status === "DONE" ? 0 : prev.exitCode,
      }));
      setDebuggerFrame(snapshot.line, "paused", `Restored snapshot from ${snapshot.createdAt}.`);
      openWorkbenchPanel("history");
      toast.success(`Restored: ${snapshot.reason}`);
    },
    [handleLanguageChange, openWorkbenchPanel, setDebuggerFrame, snapshots],
  );

  const handleDebuggerStart = useCallback(() => {
    clearDebugTimers();
    openWorkbenchPanel("debugger");
    setDebugState((prev) => ({
      ...prev,
      mode: "running",
      lastStep: "Launching debugger session...",
      callStack: ["main()"],
    }));

    const startLine = resolveDebuggerStartLine({
      breakpoints,
      cursorLine: editorCursor.line,
      lineCount: activeCodeLineCount,
    });

    queueDebugTransition(() => {
      setDebuggerFrame(startLine, "paused", `Paused at breakpoint L${startLine}.`);
      pushSnapshot("Debugger session started", {
        status: "READY",
        line: startLine,
      });
    }, 360);
  }, [
    activeCodeLineCount,
    breakpoints,
    clearDebugTimers,
    editorCursor.line,
    openWorkbenchPanel,
    pushSnapshot,
    queueDebugTransition,
    setDebuggerFrame,
  ]);

  const handleDebuggerPause = useCallback(() => {
    clearDebugTimers();
    setDebugState((prev) => {
      if (prev.mode !== "running") {
        return prev;
      }

      return {
        ...prev,
        mode: "paused",
        lastStep: `Execution paused at line ${prev.line}.`,
      };
    });
  }, [clearDebugTimers]);

  const handleDebuggerContinue = useCallback(() => {
    if (debugState.mode === "idle") {
      handleDebuggerStart();
      return;
    }

    clearDebugTimers();
    setDebugState((prev) => ({ ...prev, mode: "running", lastStep: "Continuing execution..." }));

    const sortedBreakpoints = [...breakpoints].sort((a, b) => a - b);
    const nextBreakpoint = sortedBreakpoints.find((line) => line > debugState.line);
    const maxLine = activeCodeLineCount;

    queueDebugTransition(() => {
      if (nextBreakpoint) {
        setDebuggerFrame(nextBreakpoint, "paused", `Paused at breakpoint L${nextBreakpoint}.`);
        pushSnapshot("Debugger paused", {
          status: "READY",
          line: nextBreakpoint,
        });
        return;
      }

      setDebuggerFrame(maxLine, "idle", "Program exited normally.");
      pushSnapshot("Debugger finished", {
        status: "DONE",
        line: maxLine,
        timeMs: runMeta.timeMs,
      });
    }, 360);
  }, [
    activeCodeLineCount,
    breakpoints,
    clearDebugTimers,
    debugState.line,
    debugState.mode,
    handleDebuggerStart,
    pushSnapshot,
    queueDebugTransition,
    runMeta.timeMs,
    setDebuggerFrame,
  ]);

  const handleDebuggerStep = useCallback(() => {
    if (debugState.mode === "idle") {
      handleDebuggerStart();
      return;
    }

    clearDebugTimers();
    const maxLine = activeCodeLineCount;
    const nextLine = clamp(debugState.line + 1, 1, maxLine);

    setDebuggerFrame(nextLine, "paused", `Stepped to line ${nextLine}.`);
    pushSnapshot("Debugger step", {
      status: "READY",
      line: nextLine,
    });
  }, [
    activeCodeLineCount,
    clearDebugTimers,
    debugState.line,
    debugState.mode,
    handleDebuggerStart,
    pushSnapshot,
    setDebuggerFrame,
  ]);

  const handleDebuggerReset = useCallback(() => {
    clearDebugTimers();
    const resetLine = resolveDebuggerStartLine({
      breakpoints,
      cursorLine: editorCursor.line,
      lineCount: activeCodeLineCount,
    });

    setDebugState(createDebugState(resetLine));
    pushSnapshot("Debugger reset", {
      status: "READY",
      line: resetLine,
    });
    toast("Debugger reset");
  }, [activeCodeLineCount, breakpoints, clearDebugTimers, editorCursor.line, pushSnapshot]);

  const handleToggleWatchPin = useCallback((watchId) => {
    setDebugState((prev) => ({
      ...prev,
      watches: prev.watches.map((watch) =>
        watch.id === watchId ? { ...watch, pinned: !watch.pinned } : watch,
      ),
    }));
  }, []);

  const handleUpdateTestCase = useCallback((caseId, field, value) => {
    setTestCases((prev) =>
      prev.map((testCase) =>
        testCase.id === caseId
          ? {
              ...testCase,
              [field]: value,
              status: "pending",
            }
          : testCase,
      ),
    );
  }, []);

  const handleAddTestCase = useCallback(() => {
    const id = nextTestCaseIdRef.current;
    nextTestCaseIdRef.current += 1;

    setTestCases((prev) => [
      ...prev,
      {
        id,
        label: `Case ${id}`,
        stdin: "",
        expected: "",
        got: "",
        status: "pending",
      },
    ]);
    openWorkbenchPanel("tests");
  }, [openWorkbenchPanel]);

  const handleDeleteTestCase = useCallback((caseId) => {
    setTestCases((prev) => prev.filter((testCase) => testCase.id !== caseId));
  }, []);

  const handleRunSingleTest = useCallback(
    (caseId) => {
      const targetCase = testCases.find((testCase) => testCase.id === caseId);
      if (!targetCase) {
        return;
      }

      clearTestTimers();
      setTestRunInFlight(true);
      setTestRunProgress(0);
      setTestCases((prev) =>
        prev.map((testCase) =>
          testCase.id === caseId
            ? {
                ...testCase,
                status: "running",
              }
            : testCase,
        ),
      );

      queueTestTransition(() => {
        const result = evaluateTestCase(targetCase.stdin, targetCase.expected);

        setTestCases((prev) =>
          prev.map((testCase) =>
            testCase.id === caseId
              ? {
                  ...testCase,
                  got: result.got,
                  status: result.passed ? "pass" : "fail",
                }
              : testCase,
          ),
        );
        setTestRunProgress(1);
        setTestRunInFlight(false);
      }, 280);
    },
    [clearTestTimers, queueTestTransition, testCases],
  );

  const handleRunAllTests = useCallback(() => {
    if (testCases.length === 0) {
      return;
    }

    clearTestTimers();
    setTestRunInFlight(true);
    setTestRunProgress(0);
    setTestCases((prev) =>
      prev.map((testCase) => ({
        ...testCase,
        status: "pending",
        got: "",
      })),
    );

    testCases.forEach((testCase, index) => {
      const startDelay = index * 320;

      queueTestTransition(() => {
        setTestCases((prev) =>
          prev.map((entry) =>
            entry.id === testCase.id
              ? {
                  ...entry,
                  status: "running",
                }
              : entry,
          ),
        );
      }, startDelay);

      queueTestTransition(() => {
        const result = evaluateTestCase(testCase.stdin, testCase.expected);

        setTestCases((prev) =>
          prev.map((entry) =>
            entry.id === testCase.id
              ? {
                  ...entry,
                  got: result.got,
                  status: result.passed ? "pass" : "fail",
                }
              : entry,
          ),
        );

        const progress = (index + 1) / testCases.length;
        setTestRunProgress(progress);
        setTestRunInFlight(index + 1 < testCases.length);
      }, startDelay + 220);
    });
  }, [clearTestTimers, queueTestTransition, testCases]);

  const addAiExchange = useCallback((userText, assistantReply) => {
    const userMessage = {
      id: nextAiMessageIdRef.current,
      role: "user",
      text: userText,
    };
    nextAiMessageIdRef.current += 1;

    const assistantMessage = {
      id: nextAiMessageIdRef.current,
      role: "assistant",
      ...assistantReply,
    };
    nextAiMessageIdRef.current += 1;

    setAiMessages((prev) => [...prev, userMessage, assistantMessage]);
  }, []);

  const handleQuickAiAction = useCallback(
    (action) => {
      openWorkbenchPanel("ai");
      addAiExchange(action, buildAiReply(action, activeLanguage, runMeta));
    },
    [activeLanguage, addAiExchange, openWorkbenchPanel, runMeta],
  );

  const handleSendAi = useCallback(() => {
    const prompt = aiInput.trim();
    if (!prompt) {
      return;
    }

    setAiInput("");
    addAiExchange(prompt, buildAiReply(prompt, activeLanguage, runMeta));
  }, [activeLanguage, addAiExchange, aiInput, runMeta]);

  const handleCopyAiCode = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("AI snippet copied");
    } catch {
      toast.error("Unable to copy snippet");
    }
  }, []);

  useEffect(() => {
    if (runStatus !== "DONE") {
      setShowComplexityBadge(false);
      return undefined;
    }

    const id = window.setTimeout(() => setShowComplexityBadge(true), 600);
    return () => window.clearTimeout(id);
  }, [runStatus]);

  const commandItems = useMemo(
    () => [
      {
        id: "cmd-run",
        group: "Actions",
        label: isBusy(runStatus) ? "Stop Execution" : "Run Code",
        shortcut: "Ctrl+Enter",
        keywords: "run execute compile",
        action: handleRun,
      },
      {
        id: "cmd-format",
        group: "Actions",
        label: "Format Editor",
        shortcut: "Shift+Alt+F",
        keywords: "format beautify",
        action: handleFormat,
      },
      {
        id: "cmd-share",
        group: "Actions",
        label: "Share Permalink",
        shortcut: "Share",
        keywords: "copy link",
        action: handleShare,
      },
      {
        id: "cmd-theme",
        group: "Actions",
        label: "Toggle Theme",
        shortcut: "Theme",
        keywords: "dark light",
        action: toggleTheme,
      },
      {
        id: "cmd-debug-start",
        group: "Debugger",
        label: "Start Debug Session",
        shortcut: "F5",
        keywords: "debugger breakpoint",
        action: handleDebuggerStart,
      },
      {
        id: "cmd-debug-step",
        group: "Debugger",
        label: "Step Over",
        shortcut: "F10",
        keywords: "debug step",
        action: handleDebuggerStep,
      },
      {
        id: "cmd-debug-continue",
        group: "Debugger",
        label: "Continue Execution",
        shortcut: "F5",
        keywords: "debug continue",
        action: handleDebuggerContinue,
      },
      {
        id: "cmd-debug-reset",
        group: "Debugger",
        label: "Reset Debugger",
        shortcut: "Shift+F5",
        keywords: "debug reset",
        action: handleDebuggerReset,
      },
      {
        id: "cmd-history-capture",
        group: "History",
        label: "Capture Snapshot",
        shortcut: "Timeline",
        keywords: "snapshot history save",
        action: handleCaptureSnapshot,
      },
      ...LANGUAGES.map((lang) => ({
        id: `cmd-lang-${lang.value}`,
        group: "Language",
        label: `Switch to ${lang.label}`,
        shortcut: lang.runtime,
        keywords: `${lang.label} runtime compiler`,
        action: () => handleLanguageChange(lang.value),
      })),
      ...RAIL_ITEMS.map((panel) => ({
        id: `cmd-panel-${panel.id}`,
        group: "Panels",
        label: `Open ${panel.label}`,
        shortcut: "Workbench",
        keywords: panel.label,
        action: () => openWorkbenchPanel(panel.id),
      })),
    ],
    [
      handleCaptureSnapshot,
      handleDebuggerContinue,
      handleDebuggerReset,
      handleDebuggerStart,
      handleDebuggerStep,
      handleFormat,
      handleLanguageChange,
      handleRun,
      handleShare,
      openWorkbenchPanel,
      runStatus,
      toggleTheme,
    ],
  );

  const filteredCommandItems = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) {
      return commandItems;
    }

    return commandItems.filter((item) =>
      `${item.label} ${item.group} ${item.keywords}`.toLowerCase().includes(query),
    );
  }, [commandItems, commandQuery]);

  useEffect(() => {
    setCommandIndex((prev) => clamp(prev, 0, Math.max(filteredCommandItems.length - 1, 0)));
  }, [filteredCommandItems.length]);

  const executeCommand = useCallback((command) => {
    if (!command) {
      return;
    }

    command.action();
    setIsCommandPaletteOpen(false);
    setCommandQuery("");
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const withMeta = event.metaKey || event.ctrlKey;

      if (isCommandPaletteOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsCommandPaletteOpen(false);
          setCommandQuery("");
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setCommandIndex((prev) => (prev + 1) % Math.max(filteredCommandItems.length, 1));
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          setCommandIndex(
            (prev) =>
              (prev - 1 + Math.max(filteredCommandItems.length, 1)) %
              Math.max(filteredCommandItems.length, 1),
          );
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          executeCommand(filteredCommandItems[commandIndex]);
        }

        return;
      }

      if (pendingLanguageChange) {
        if (event.key === "Escape") {
          event.preventDefault();
          setPendingLanguageChange(null);
        }
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      if (withMeta && key === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      if (withMeta && !event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        handleRun();
        return;
      }

      if (event.key === "F5") {
        event.preventDefault();

        if (event.shiftKey) {
          handleDebuggerReset();
          return;
        }

        if (debugState.mode === "idle") {
          handleDebuggerStart();
          return;
        }

        handleDebuggerContinue();
        return;
      }

      if (event.key === "F10") {
        event.preventDefault();
        handleDebuggerStep();
        return;
      }

      if (event.shiftKey && event.altKey && key === "f") {
        event.preventDefault();
        handleFormat();
        return;
      }

      if (withMeta && event.shiftKey && key === "a") {
        event.preventDefault();
        openWorkbenchPanel("ai");
        return;
      }

      if (withMeta && event.shiftKey && key === "h") {
        event.preventDefault();
        openWorkbenchPanel("history");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    commandIndex,
    debugState.mode,
    executeCommand,
    filteredCommandItems,
    handleDebuggerContinue,
    handleDebuggerReset,
    handleDebuggerStart,
    handleDebuggerStep,
    handleFormat,
    handleRun,
    isCommandPaletteOpen,
    openWorkbenchPanel,
    pendingLanguageChange,
  ]);

  const contextPanelProps = useMemo(
    () => ({
      files,
      activeFileId,
      onFileSelect: handleTabSwitch,
      onCreateFile: handleFileCreate,
      onDeleteFile: handleFileDelete,
      onRenameFile: handleFileRename,
      onImportFile: handleImportFile,
      isAuthenticated,
      stdin,
      onStdinChange: setStdin,
      inputPresets,
      testCases,
      testRunProgress,
      testRunInFlight,
      onRunAllTests: handleRunAllTests,
      onRunSingleTest: handleRunSingleTest,
      onAddTestCase: handleAddTestCase,
      onDeleteTestCase: handleDeleteTestCase,
      onUpdateTestCase: handleUpdateTestCase,
      aiMessages,
      aiInput,
      onAiInputChange: setAiInput,
      onSendAi: handleSendAi,
      onQuickAiAction: handleQuickAiAction,
      onCopyAiCode: handleCopyAiCode,
      showComplexityBadge,
      debugState,
      breakpoints,
      onDebuggerStart: handleDebuggerStart,
      onDebuggerPause: handleDebuggerPause,
      onDebuggerContinue: handleDebuggerContinue,
      onDebuggerStep: handleDebuggerStep,
      onDebuggerReset: handleDebuggerReset,
      onToggleWatchPin: handleToggleWatchPin,
      snapshots,
      activeSnapshotId,
      onCaptureSnapshot: handleCaptureSnapshot,
      onRestoreSnapshot: handleRestoreSnapshot,
    }),
    [
      files,
      activeFileId,
      handleTabSwitch,
      handleFileCreate,
      handleFileDelete,
      handleFileRename,
      handleImportFile,
      isAuthenticated,
      activeSnapshotId,
      aiInput,
      aiMessages,
      breakpoints,
      debugState,
      inputPresets,
      handleAddTestCase,
      handleCaptureSnapshot,
      handleCopyAiCode,
      handleDeleteTestCase,
      handleDebuggerContinue,
      handleDebuggerPause,
      handleDebuggerReset,
      handleDebuggerStart,
      handleDebuggerStep,
      handleQuickAiAction,
      handleRestoreSnapshot,
      handleRunAllTests,
      handleRunSingleTest,
      handleSendAi,
      handleToggleWatchPin,
      handleUpdateTestCase,
      showComplexityBadge,
      stdin,
      snapshots,
      testCases,
      testRunInFlight,
      testRunProgress,
    ],
  );

  useEffect(() => {
    if (activeLayout === "focus") {
      document.body.classList.add("idev-page-focus");
    } else {
      document.body.classList.remove("idev-page-focus");
    }
    return () => document.body.classList.remove("idev-page-focus");
  }, [activeLayout]);

  let layoutContent;

  if (activeLayout === "focus") {
    layoutContent = (
      <FocusLayout
        activeLanguage={activeLanguage}
        activeFileName={activeFile?.name}
        code={activeCode}
        onCodeChange={handleCodeChange}
        onToggleFocus={() => setActiveLayout("workbench")}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        runStatus={runStatus}
        runMeta={runMeta}
        runStreams={runStreams}
        theme={theme}
        onCursorChange={setEditorCursor}
        fontSize={fontSize}
        keybindingMode={keybindingMode}
        showFormatSweep={showFormatSweep}
        tabs={tabData}
        activeFileId={activeFileId}
        onTabSwitch={handleTabSwitch}
        onTabClose={handleTabClose}
        onCreateFile={handleQuickCreateFile}
      />
    );
  } else if (activeLayout === "mobile") {
    layoutContent = (
      <MobileLayout
        activeLanguage={activeLanguage}
        code={activeCode}
        onCodeChange={handleCodeChange}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        runStatus={runStatus}
        runMeta={runMeta}
        runStreams={runStreams}
        stdin={stdin}
        onStdinChange={setStdin}
        theme={theme}
        onCursorChange={setEditorCursor}
        onCreateFile={handleQuickCreateFile}
      />
    );
  } else {
    layoutContent = (
      <WorkbenchLayout
        activeLanguage={activeLanguage}
        code={activeCode}
        onCodeChange={handleCodeChange}
        theme={theme}
        onCursorChange={setEditorCursor}
        fontSize={fontSize}
        keybindingMode={keybindingMode}
        runStatus={runStatus}
        runMeta={runMeta}
        runStreams={runStreams}
        showFormatSweep={showFormatSweep}
        activeRail={activeRail}
        onSetActiveRail={setActiveRail}
        expandedRail={expandedRail}
        onSetExpandedRail={setExpandedRail}
        contextPanelOpen={contextPanelOpen}
        onSetContextPanelOpen={setContextPanelOpen}
        breakpoints={breakpoints}
        onToggleBreakpoint={handleToggleBreakpoint}
        debugLine={debugState.line}
        debugEnabled={activeRail === "debugger"}
        rightPanelWidth={rightPanelWidth}
        editorPanelHeight={editorPanelHeight}
        onStartRightResize={(event) => handleStartResize("right", event)}
        onStartOutputResize={(event) => handleStartResize("output", event)}
        onResetRightPanelSize={handleResetRightPanelSize}
        onResetOutputPanelSize={handleResetOutputPanelSize}
        onResizeSeparatorKeyDown={handleResizeSeparatorKeyDown}
        resizeMode={resizeMode}
        contextPanelProps={contextPanelProps}
        tabs={tabData}
        activeFileId={activeFileId}
        onTabSwitch={handleTabSwitch}
        onTabClose={handleTabClose}
        onCreateFile={handleQuickCreateFile}
        onEditorMount={(instance) => {
          editorInstanceRef.current = instance;
        }}
      />
    );
  }

  return (
    <div className="idev-page surface-grain">
      <style>{IDE_PLAYGROUND_INLINE_STYLES}</style>
      <div className="idev-ambient-orbs" aria-hidden="true">
        <div className="idev-orb idev-orb-1" />
        <div className="idev-orb idev-orb-2" />
        <div className="idev-orb idev-orb-3" />
      </div>

      <div className="idev-page-inner">
        <header className="idev-global-topbar liquid-glass">
          <div className="idev-topbar-left">
            <span>AlgoViz</span>
            <ChevronRight size={14} />
            <span>Playground</span>
            <ChevronRight size={14} />
            <strong>ide</strong>
          </div>

          {!isCompactMode && (
            <div className="idev-topbar-center">
              <nav className="idev-mode-switcher" aria-label="Switch IDE workspace layout">
                {selectableLayouts.map((layout) => {
                  const Icon = layout.icon;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      className={`idev-mode-btn ${activeLayout === layout.id ? "idev-mode-btn-active" : ""}`}
                      onClick={() => setActiveLayout(layout.id)}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          <div className="idev-topbar-right">
            <span className="idev-phase-pill idev-phase-pill-muted">Public IDE</span>
            <span className="idev-phase-pill">No sign-in required</span>
          </div>
        </header>

        <CommandBar
          activeLanguage={activeLanguage}
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          fontSize={fontSize}
          onDecreaseFont={() => setFontSize((prev) => clamp(prev - 1, 12, 18))}
          onIncreaseFont={() => setFontSize((prev) => clamp(prev + 1, 12, 18))}
          keybindingMode={keybindingMode}
          onCycleKeybinding={cycleKeybindingMode}
          onShare={handleShare}
          onFormat={handleFormat}
          onRun={handleRun}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          runStatus={runStatus}
        />

        <div className="idev-preview-zone">
          <AnimatePresence mode="wait">
            <motion.div
              className="idev-layout-frame"
              key={activeLayout}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {layoutContent}
            </motion.div>
          </AnimatePresence>
        </div>

        <StatusBar
          activeLanguage={activeLanguage}
          runStatus={runStatus}
          runMeta={runMeta}
          runVerdict={runStreams.verdict}
          keybindingMode={keybindingMode}
          cursor={editorCursor}
        />

        <IDECommandPalette
          open={isCommandPaletteOpen}
          onClose={() => {
            setIsCommandPaletteOpen(false);
            setCommandQuery("");
          }}
          query={commandQuery}
          onQueryChange={setCommandQuery}
          commands={filteredCommandItems}
          activeIndex={commandIndex}
          onActiveIndexChange={setCommandIndex}
          onExecute={executeCommand}
        />

        <LanguageSwitchDialog
          open={Boolean(pendingLanguageChange)}
          currentFileName={activeFile?.name}
          targetLanguage={pendingLanguageChange?.languageValue || activeLanguage}
          onClose={closeLanguageSwitchDialog}
          onUseCurrentFile={handleLanguageSwitchUseCurrentFile}
          onStartNewFile={handleLanguageSwitchStartNewFile}
        />

        <NewFileNameDialog
          open={Boolean(pendingNewFileDraft)}
          languageValue={pendingNewFileDraft?.languageValue || activeLanguage}
          baseName={pendingNewFileDraft?.baseName || ""}
          onBaseNameChange={handlePendingNewFileBaseNameChange}
          onClose={closeNewFileDialog}
          onConfirm={handleConfirmPendingNewFile}
        />
      </div>
    </div>
  );
}