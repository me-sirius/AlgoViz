import React, { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

// --- TOGGLE SWITCH ---
export const SettingsToggle = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">
    <div>
      <p className="text-white text-sm font-medium">{label}</p>
      {description && (
        <p className="text-zinc-500 text-xs mt-0.5">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${enabled ? "bg-emerald-600" : "bg-zinc-700"
        }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "left-6" : "left-1"
          }`}
      />
    </button>
  </div>
);

// --- TAG INPUT ---
export const TagInput = ({
  tags = [],
  onTagsChange,
  placeholder = "Type and press Enter",
}) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onTagsChange([...tags, input.trim()]);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 focus-within:border-emerald-500/50 transition-colors">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-sm font-medium"
          >
            {tag}
            <button
              onClick={() => onTagsChange(tags.filter((t) => t !== tag))}
              className="hover:text-emerald-300 cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-white text-sm placeholder-zinc-600"
        />
      </div>
    </div>
  );
};

// --- LOADING BAR ---
export const LoadingBar = ({ isLoading }) => (
  <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 overflow-hidden">
    {isLoading && (
      <motion.div
        className="h-full bg-emerald-500"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        style={{ width: "30%" }}
      />
    )}
  </div>
);

// --- SPARKLINE ---
export const Sparkline = ({ data = [], width = 200, height = 50 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient
          id="sparklineGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparklineGradient)" />
      <polyline
        points={points}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
