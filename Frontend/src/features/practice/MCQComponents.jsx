import React, { useState, useEffect, useRef, useId } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { Lock, CheckCircle, XCircle, Target, Flame, Crown } from "lucide-react";
import { useTheme } from "../../core/context/ThemeContext";

// Initialize Mermaid with dark theme
// Initialize Mermaid (default to dark, will be updated by component)
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  fontFamily: "Inter, system-ui, sans-serif",
  securityLevel: "loose",
  pie: {
    textPosition: 0.65,
    useMaxWidth: true,
  },
});

// Vibrant colors for pie chart
const PIE_COLORS = [
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Red
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#84cc16", // Lime
];

// ============================================================================
// RECHARTS PIE CHART COMPONENT - Parses Mermaid pie syntax
// ============================================================================
const RechartsPieChart = ({ code }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Parse Mermaid pie syntax
  const parseData = () => {
    const lines = code.split("\n");
    let title = "";
    const data = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Parse title: "pie title My Title"
      if (trimmed.startsWith("pie title ")) {
        title = trimmed.replace("pie title ", "");
      } else if (trimmed.startsWith("pie showData") || trimmed === "pie") {
        // Skip pie keyword lines
        continue;
      } else if (trimmed.includes(":")) {
        // Parse data: "Label" : value
        const match = trimmed.match(/"([^"]+)"\s*:\s*([\d.]+)/);
        if (match) {
          data.push({
            name: match[1],
            value: parseFloat(match[2]),
          });
        }
      }
    }

    return { title, data };
  };

  const { title, data } = parseData();

  if (data.length === 0) {
    return (
      <div className="text-red-400 text-sm p-4">
        Could not parse pie chart data
      </div>
    );
  }

  // Custom label to show percentage
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xl font-bold"
        style={{ fontSize: "22px", fontWeight: "bold", textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-col gap-2 pr-20">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`my-6 px-20 pt-8 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}>
      {title && (
        <h3 className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
      )}
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              stroke={isDark ? "#0f0f14" : "#ffffff"}
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ paddingLeft: "20px" }}
              content={renderLegend}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1a1a24" : "#ffffff",
                border: isDark ? "1px solid #30363d" : "1px solid #e5e7eb",
                borderRadius: "8px",
                color: isDark ? "#fff" : "#1f2937",
                boxShadow: isDark ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: isDark ? "#fff" : "#1f2937" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============================================================================
// RECHARTS BAR CHART COMPONENT
// ============================================================================
const RechartsBarChart = ({ code }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const parseData = () => {
    const lines = code.trim().split("\n");
    let title = "";
    let data = [];

    // Check if valid Mermaid xychart-beta syntax
    const isMermaidSyntax = lines[0].trim() === "xychart-beta";

    if (isMermaidSyntax) {
      // --- PARSE MERMAID SYNTAX ---
      try {
        const fullCode = code.replace(/\n/g, " "); // Flatten for easier regex

        // Extract Title
        const titleMatch = fullCode.match(/title\s+"([^"]+)"/);
        if (titleMatch) title = titleMatch[1];

        // Extract X-Axis Categories
        // Matches: x-axis ["A", "B", "C"]
        const xAxisMatch = fullCode.match(/x-axis\s+\[(.*?)\]/);
        let categories = [];
        if (xAxisMatch) {
          // Split by comma, but handle potential quotes
          categories = xAxisMatch[1]
            .split(",")
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
        }

        // Extract Bar Data
        // Matches: bar [10, 20, 30]
        const barMatch = fullCode.match(/bar\s+\[(.*?)\]/);
        let values = [];
        if (barMatch) {
          values = barMatch[1].split(",").map((v) => parseFloat(v.trim()));
        }

        // Combine into data object
        data = categories.map((cat, i) => ({
          name: cat,
          value: values[i] || 0,
        }));
      } catch (e) {
        console.error("Failed to parse xychart-beta:", e);
      }
    } else {
      // --- PARSE CUSTOM SIMPLE SYNTAX ---
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("bar-chart title ")) {
          title = trimmed.replace("bar-chart title ", "");
        } else if (trimmed.startsWith("bar-chart")) {
          continue;
        } else if (trimmed.includes(":")) {
          const match = trimmed.match(/"([^"]+)"\s*:\s*([\d.]+)/);
          if (match) {
            data.push({
              name: match[1],
              value: parseFloat(match[2]),
            });
          }
        }
      }
    }
    return { title, data };
  };

  const { title, data } = parseData();

  if (data.length === 0) {
    return (
      <div className="text-red-400 text-sm p-4">
        Could not parse bar chart data
      </div>
    );
  }

  return (
    <div className={`my-6 px-4 py-8 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}>
      {title && (
        <h3 className={`text-2xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h3>
      )}
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#30363d" : "#e5e7eb"}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
              tickLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
              axisLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
            />
            <YAxis
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
              tickLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
              axisLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1a1a24" : "#ffffff",
                border: isDark ? "1px solid #30363d" : "1px solid #e5e7eb",
                borderRadius: "8px",
                color: isDark ? "#fff" : "#1f2937",
                boxShadow: isDark ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}
            />
            <Bar
              dataKey="value"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              barSize={60}
              label={{
                position: "top",
                fill: isDark ? "#fff" : "#1f2937",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============================================================================
// RECHARTS LINE CHART COMPONENT
// ============================================================================
const RechartsLineChart = ({ code }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const parseData = () => {
    const lines = code.trim().split("\n");
    let title = "";
    let yAxisLabel = "";
    let xAxisData = [];
    const seriesData = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("line-chart title ")) {
        title = trimmed.replace("line-chart title ", "").replace(/"/g, "");
      } else if (trimmed.startsWith("y-axis-label:")) {
        yAxisLabel = trimmed
          .replace("y-axis-label:", "")
          .trim()
          .replace(/"/g, "");
      } else if (trimmed.startsWith("x-axis:")) {
        xAxisData = trimmed
          .replace("x-axis:", "")
          .split(",")
          .map((s) => s.trim());
      } else if (trimmed.startsWith("series")) {
        // series "Name": 10, 20, 30
        const match = trimmed.match(/series\s+"([^"]+)"\s*:\s*(.*)/);
        if (match) {
          seriesData.push({
            name: match[1],
            values: match[2].split(",").map((v) => parseFloat(v.trim())),
          });
        }
      }
    });

    // Transform for Recharts
    const data = xAxisData.map((xVal, index) => {
      const dataPoint = { name: xVal };
      seriesData.forEach((series) => {
        dataPoint[series.name] = series.values[index] || 0;
      });
      return dataPoint;
    });

    return {
      title,
      yAxisLabel,
      data,
      seriesNames: seriesData.map((s) => s.name),
    };
  };

  const { title, yAxisLabel, data, seriesNames } = parseData();
  const LINE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  if (data.length === 0) {
    return (
      <div className="text-red-400 text-sm p-4">
        Could not parse line chart data
      </div>
    );
  }

  return (
    <div className={`my-6 px-4 py-8 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}>
      {title && (
        <h3 className={`text-2xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h3>
      )}
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#30363d" : "#e5e7eb"}
              vertical={true}
            />
            <XAxis
              dataKey="name"
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
              tickLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
              axisLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
              label={{
                value: "N",
                position: "insideBottom",
                offset: -10,
                fill: isDark ? "#9ca3af" : "#6b7280",
              }}
            />
            <YAxis
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
              tickLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
              axisLine={{ stroke: isDark ? "#30363d" : "#e5e7eb" }}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                fill: isDark ? "#9ca3af" : "#6b7280",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1a1a24" : "#ffffff",
                border: isDark ? "1px solid #30363d" : "1px solid #e5e7eb",
                borderRadius: "8px",
                color: isDark ? "#fff" : "#1f2937",
                boxShadow: isDark ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              cursor={{ stroke: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)" }}
            />
            <Legend verticalAlign="top" height={36} />
            {seriesNames.map((series, index) => (
              <Line
                key={series}
                type="monotone"
                dataKey={series}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
const MermaidDiagram = ({ code }) => {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const uniqueId = useId().replace(/:/g, "_");
  const { theme } = useTheme();

  useEffect(() => {
    // Re-initialize mermaid when theme changes
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      themeVariables: theme === 'dark' ? {
        primaryColor: "#8b5cf6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#6d28d9",
        lineColor: "#64748b",
        secondaryColor: "#1e1b4b",
        tertiaryColor: "#0f172a",
        background: "#0f0f14",
        mainBkg: "#1a1a24",
        nodeBorder: "#6d28d9",
        clusterBkg: "#1e1b4b",
        titleColor: "#ffffff",
        edgeLabelBackground: "#1a1a24",
      } : {
        primaryColor: "#7c3aed",
        primaryTextColor: "#1f2937",
        primaryBorderColor: "#7c3aed",
        lineColor: "#64748b",
        secondaryColor: "#f3f4f6",
        tertiaryColor: "#ffffff",
        background: "#ffffff",
        mainBkg: "#f9fafb",
        nodeBorder: "#7c3aed",
        clusterBkg: "#f3f4f6",
        titleColor: "#1f2937",
        edgeLabelBackground: "#f9fafb",
      },
      fontFamily: "Inter, system-ui, sans-serif",
      securityLevel: "loose",
    });
  }, [theme]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || isRendering) return;

      setIsRendering(true);
      try {
        // Clear previous content
        setSvg("");
        setError(null);

        // Generate unique ID for this diagram
        const id = `mermaid_${uniqueId}_${Date.now()}`;

        // Render the diagram
        let { svg: renderedSvg } = await mermaid.render(id, code);

        // Post-process SVG to fix viewBox clipping
        // Expand the viewBox to prevent title cutoff on left
        renderedSvg = renderedSvg.replace(
          /viewBox="([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)"/,
          (match, x, y, w, h) => {
            const newX = parseFloat(x) - 100; // Add 100px left padding
            const newW = parseFloat(w) + 250; // Add 250px extra width
            return `viewBox="${newX} ${y} ${newW} ${h}"`;
          },
        );

        setSvg(renderedSvg);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err.message || "Failed to render diagram");
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [code, uniqueId, theme]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm">
        <div className="font-bold mb-2">⚠️ Diagram Error</div>
        <code className="text-xs whitespace-pre-wrap">{error}</code>
        <pre className="mt-2 text-[10px] text-gray-700 dark:text-gray-500 bg-gray-100 dark:bg-black/20 p-2 rounded overflow-x-auto">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`my-6 p-10 rounded-xl border flex flex-col justify-center items-center overflow-x-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}
    >
      {svg ? (
        <div
          className="mermaid-diagram [&_svg]:h-auto [&_.pieTitleText]:font-bold [&_.pieOuterCircle]:hidden"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="text-gray-500 text-sm py-8 animate-pulse">
          Loading diagram...
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MARKDOWN RENDERER
// ============================================================================
export const MarkdownRenderer = ({ content, className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Fix: Auto-escape backslashes in SQL LIKE clauses to ensure they render correctly
  // e.g. converts "LIKE '%a\_%b'" to "LIKE '%a\\_%b'" so Markdown preserves the backslash
  let processedContent =
    typeof content === "string"
      ? content.replace(
        /(LIKE\s+['"])(.*?)(['"])/gi,
        (match, prefix, inner, suffix) => {
          return prefix + inner.replace(/\\/g, "\\\\") + suffix;
        },
      )
      : content;

  // Fix: Escape double underscores (__) to prevents bolding in C++/Python code (e.g. __shared__)
  // Only escape if NOT inside code blocks (backticks)
  if (typeof processedContent === "string") {
    processedContent = processedContent.replace(
      /(`{1,3})[\s\S]*?\1|(__)/g,
      (match, code, underscores) => {
        if (code) return match; // Preserve code blocks
        if (underscores) return "\\_\\_"; // Escape __
        return match;
      },
    );
  }

  return (
    <div className={`markdown-content ${className} text-gray-800 dark:text-gray-300`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            const hasMultipleLines = codeContent.includes("\n");

            // Debug logging
            if (match) {
              console.log("Code block detected:", {
                language: match[1],
                inline,
                hasMultipleLines,
              });
            }

            // Special handling for Mermaid diagrams
            if (!inline && match && match[1] === "mermaid") {
              // Check if it's a pie chart - use Recharts for better styling
              if (codeContent.trim().startsWith("pie")) {
                return <RechartsPieChart code={codeContent} />;
              }
              // Check if it's a bar chart (Custom OR Mermaid syntax)
              if (
                codeContent.trim().startsWith("bar-chart") ||
                codeContent.trim().startsWith("xychart-beta")
              ) {
                return <RechartsBarChart code={codeContent} />;
              }
              // Check if it's a line chart (Custom)
              if (codeContent.trim().startsWith("line-chart")) {
                return <RechartsLineChart code={codeContent} />;
              }
              // Use Mermaid for other diagram types (flowchart, sequence, etc.)
              return <MermaidDiagram code={codeContent} />;
            }

            // Fenced code block with language
            if (!inline && match) {
              return (
                <div className="rounded-lg overflow-hidden my-4 border border-gray-200 dark:border-white/20 shadow-sm dark:shadow-none">
                  <div className="bg-gray-100 dark:bg-[#1e1e1e] px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-white/20">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-xs text-gray-500 dark:text-white/40 font-mono">
                      {match[1]}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0f0f14]">
                    <code
                      className={`${className} font-mono text-sm text-gray-800 dark:text-gray-300`}
                      {...props}
                    >
                      {children}
                    </code>
                  </div>
                </div>
              );
            }
            // Fenced code block WITHOUT language (must have multiple lines to be a block)
            if (!inline && !match && hasMultipleLines) {
              return (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-white/20 my-4 shadow-sm dark:shadow-none">
                  <div className="bg-gray-100 dark:bg-[#1a1a24] px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-white/20">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    <span className="ml-2 text-xs text-gray-500 font-mono">
                      pseudocode
                    </span>
                  </div>
                  <div className="overflow-x-auto p-4 bg-gray-50 dark:bg-[#0f0f14]">
                    <code
                      className="font-mono text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap"
                      {...props}
                    >
                      {children}
                    </code>
                  </div>
                </div>
              );
            }

            // Inline code (single backticks)
            return (
              <code
                className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-amber-600 dark:text-amber-300"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-gray-900 dark:text-white font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-gray-800 dark:text-gray-200 italic">{children}</em>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside space-y-2 mb-4 text-gray-700 dark:text-gray-300 ml-6">
              {children}
            </ol>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside space-y-2 mb-4 text-gray-700 dark:text-gray-300 ml-6">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300 leading-relaxed pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-500/50 pl-4 my-4 bg-purple-500/5 py-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-white mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-white mb-2">{children}</h3>
          ),
          table: ({ children, ...props }) => (
            <div className={`overflow-x-auto my-6 border rounded-xl ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-white shadow-sm"}`}>
              <table
                {...props}
                className={`min-w-full divide-y text-center text-sm ${isDark ? "divide-white/10" : "divide-gray-200"}`}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead {...props} className={`font-bold ${isDark ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody
              {...props}
              className={`divide-y ${isDark ? "divide-white/10 text-gray-300" : "divide-gray-200 text-gray-700"}`}
            >
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr {...props} className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th
              {...props}
              style={{ ...props.style, textAlign: "center" }}
              className={`px-4 py-3 font-semibold border-r last:border-r-0 text-center font-mono tracking-tight leading-snug ${isDark ? "border-white/5 text-white" : "border-gray-200 text-gray-900"}`}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              {...props}
              style={{ ...props.style, textAlign: "center" }}
              className={`px-4 py-3 align-top border-r last:border-r-0 text-center font-mono tabular-nums text-xs ${isDark ? "border-white/5" : "border-gray-200"}`}
            >
              {children}
            </td>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Custom image renderer with white background for diagrams
          img: ({ src, alt, ...props }) => (
            <div className="my-4 rounded-xl overflow-hidden bg-white border border-gray-200 dark:border-white/10 p-3 inline-block max-w-full shadow-sm dark:shadow-none">
              <img
                src={src}
                alt={alt || "Question diagram"}
                className="max-w-full max-h-80 object-contain mx-auto rounded-lg"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<div class="text-center py-4 text-red-400"><p class="text-sm">⚠️ Image could not be loaded</p></div>';
                }}
                {...props}
              />
            </div>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div >
  );
};

// ============================================================================
// COMPANY LOGO HELPERS
// ============================================================================
const getCompanyDomain = (company) => {
  const domains = {
    Google: "google.com",
    Amazon: "amazon.com",
    Microsoft: "microsoft.com",
    Meta: "meta.com",
    Apple: "apple.com",
    Netflix: "netflix.com",
    "Goldman Sachs": "goldmansachs.com",
    JPMorgan: "jpmorgan.com",
    "Morgan Stanley": "morganstanley.com",
    Uber: "uber.com",
    Flipkart: "flipkart.com",
    Walmart: "walmart.com",
    Adobe: "adobe.com",
    Salesforce: "salesforce.com",
    Oracle: "oracle.com",
    IBM: "ibm.com",
    Cisco: "cisco.com",
    Intel: "intel.com",
    Samsung: "samsung.com",
    TCS: "tcs.com",
    Infosys: "infosys.com",
    Wipro: "wipro.com",
    HCL: "hcltech.com",
  };
  return domains[company] || `${company.toLowerCase().replace(/\s/g, "")}.com`;
};

const getCompanyLogoUrl = (company) => {
  const domain = getCompanyDomain(company);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    domain,
  )}&sz=128`;
};

export const CompanyLogo = ({ company, size = 40 }) => {
  const [logoError, setLogoError] = useState(false);
  const logoUrl = getCompanyLogoUrl(company);

  // Calculate inner image size (60% of container)
  const imgSize = Math.max(Math.round(size * 0.6), 10);

  if (!logoError) {
    return (
      <div
        className="rounded-lg bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-sm dark:shadow-none"
        style={{ width: size, height: size }}
      >
        <img
          src={logoUrl}
          alt={company}
          style={{ width: imgSize, height: imgSize }}
          className="object-contain"
          onError={() => setLogoError(true)}
        />
      </div>
    );
  }
  // Fallback to first letter
  return (
    <div
      className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      <span className="font-bold text-white">{company?.[0] || "?"}</span>
    </div>
  );
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

// Simple Glass Card
export const GlassCard = ({ children, className = "", onClick = null }) => {
  return (
    <div
      onClick={onClick}
      className={`relative backdrop-blur-xl bg-white/50 dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none ${onClick ? "cursor-pointer" : ""
        } ${className}`}
    >
      {children}
    </div>
  );
};

// Premium Lock Overlay
export const PremiumLock = ({ onUnlock }) => (
  <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/60 rounded-2xl flex flex-col items-center justify-center">
    <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/20 dark:to-orange-500/20 border border-yellow-500/20 dark:border-yellow-500/30 mb-4">
      <Lock size={32} className="text-yellow-600 dark:text-yellow-500" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Premium Feature</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center px-4">
      Unlock unlimited access to all questions
    </p>
    <button
      onClick={onUnlock}
      className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-black hover:shadow-lg hover:shadow-yellow-500/25 transition-all cursor-pointer"
    >
      <span className="flex items-center gap-2">
        <Crown size={16} />
        Unlock Premium
      </span>
    </button>
  </div>
);

// Option Button for MCQ
export const OptionButton = ({
  option,
  index,
  isSelected,
  isCorrect,
  isWrong,
  isChecked,
  onSelect,
  disabled,
}) => {
  // Generate letter dynamically: 0 -> A, 1 -> B, 2 -> C, etc.
  const letter = String.fromCharCode(65 + index);
  let borderColor = "border-gray-200 dark:border-white/10",
    bgColor = "bg-white dark:bg-white/5",
    textColor = "text-gray-600 dark:text-gray-300",
    iconElement = null;

  if (isChecked) {
    if (isCorrect) {
      borderColor = "border-emerald-500";
      bgColor = "bg-emerald-500/10 dark:bg-emerald-500/15";
      textColor = "text-emerald-600 dark:text-emerald-400";
      iconElement = <CheckCircle size={20} className="text-emerald-500" />;
    } else if (isWrong) {
      borderColor = "border-red-500";
      bgColor = "bg-red-500/10 dark:bg-red-500/15";
      textColor = "text-red-600 dark:text-red-400";
      iconElement = <XCircle size={20} className="text-red-500" />;
    } else {
      borderColor = "border-gray-200 dark:border-white/5";
      bgColor = "bg-gray-50 dark:bg-white/[0.02]";
      textColor = "text-gray-400 dark:text-gray-500 opacity-60";
    }
  } else if (isSelected) {
    borderColor = "border-purple-500 border-2"; // Thicker border for selection
    bgColor = "bg-purple-500/10 dark:bg-purple-500/20";
    textColor = "text-gray-900 dark:text-white";
  }

  return (
    <motion.button
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      animate={isWrong ? { x: [-4, 4, -4, 4, 0] } : {}}
      transition={{ duration: 0.3 }}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 shadow-sm dark:shadow-none ${borderColor} ${bgColor} ${!disabled && !isChecked
        ? "hover:border-purple-300 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-purple-500/5"
        : ""
        } ${disabled ? "cursor-not-allowed hidden-cursor" : "cursor-pointer"}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border border-transparent ${isSelected
          ? "bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-white border-purple-200 dark:border-purple-500/50"
          : isCorrect
            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : isWrong
              ? "bg-red-500/20 text-red-600 dark:text-red-400"
              : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
          } ${textColor}`}
      >
        {letter}
      </div>
      <div
        className={`flex-1 min-w-0 overflow-x-auto text-left font-medium text-base ${textColor} [&_p]:mb-0 [&_.markdown-content]:overflow-visible`}
      >
        <MarkdownRenderer content={option} />
      </div>
      {iconElement && <div className="shrink-0">{iconElement}</div>}
    </motion.button>
  );
};

// Explanation Accordion
export const ExplanationAccordion = ({ isOpen, isCorrect, explanation }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div
          className={`mt-6 p-6 rounded-xl border backdrop-blur-xl ${isCorrect
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-red-500/5 border-red-500/20"
            }`}
        >
          <div className="flex items-center gap-2 mb-4">
            {isCorrect ? (
              <>
                <CheckCircle size={20} className="text-emerald-500" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Correct! +4 Points
                </span>
              </>
            ) : (
              <>
                <XCircle size={20} className="text-red-500" />
                <span className="font-bold text-red-600 dark:text-red-400">
                  Incorrect. -1 Point
                </span>
              </>
            )}
          </div>
          <div className="border-t border-gray-200 dark:border-white/10 pt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Explanation
            </h4>
            <MarkdownRenderer
              content={explanation || "No explanation provided."}
            />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Stats HUD
export const StatsHUD = ({ streak = 0, solved = 0, accuracy = 0 }) => (
  <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/10 border border-orange-500/20 dark:border-orange-500/20">
      <Flame size={18} className="text-orange-600 dark:text-orange-500" />
      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{streak} Streak</span>
    </div>
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20">
      <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-500" />
      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
        {solved} Solved
      </span>
    </div>
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/20 dark:border-purple-500/20">
      <Target size={18} className="text-purple-600 dark:text-purple-500" />
      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{accuracy}% Acc</span>
    </div>
  </div>
);
