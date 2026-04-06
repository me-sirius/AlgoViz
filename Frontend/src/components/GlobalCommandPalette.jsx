import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAlgorithmRoute, topics } from "../core/constants/algorithms";
import { useTheme } from "../core/context/ThemeContext";
import { COMMAND_PALETTE_OPEN_EVENT } from "../core/utils/commandPalette";

const VISITS_KEY = "algoviz:algorithm-visit-counts";

const ALGORITHM_INDEX = (Array.isArray(topics) ? topics : []).flatMap((topic) =>
  (Array.isArray(topic?.algorithms) ? topic.algorithms : []).map((algorithm) => {
    const path = getAlgorithmRoute(algorithm.id);

    return {
      id: algorithm.id,
      name: algorithm.name,
      topicTitle: topic.title,
      path,
      searchBlob: `${algorithm.name} ${topic.title} ${algorithm.id}`.toLowerCase(),
    };
  }),
);

const ALGORITHM_BY_PATH = new Map(
  ALGORITHM_INDEX.filter((item) => Boolean(item.path)).map((item) => [item.path, item.id]),
);

const isTypingTarget = (target) => {
  if (!target || !(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tag = target.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
};

const getShortcutLabel = () => {
  if (typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)) {
    return "CMD+K";
  }
  return "CTRL+K";
};

const readVisitMap = () => {
  if (typeof window === "undefined") return {};

  try {
    const parsed = JSON.parse(window.localStorage.getItem(VISITS_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const safe = {};
    for (const [id, visits] of Object.entries(parsed)) {
      if (typeof visits === "number" && Number.isFinite(visits) && visits > 0) {
        safe[id] = Math.floor(visits);
      }
    }

    return safe;
  } catch {
    return {};
  }
};

const GlobalCommandPalette = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const inputRef = useRef(null);
  const scrollYRef = useRef(0);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visitMap, setVisitMap] = useState(readVisitMap);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setInputValue("");
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const openAlgorithm = useCallback(
    (item) => {
      if (!item) return;

      if (item.path) {
        navigate(item.path);
      } else {
        navigate("/coming-soon", {
          state: {
            featureType: "algorithm",
            featureName: item.name,
          },
        });
      }

      closePalette();
    },
    [closePalette, navigate],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VISITS_KEY, JSON.stringify(visitMap));
  }, [visitMap]);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      setQuery(inputValue.trim().toLowerCase());
      setSelectedIndex(0);
    }, 120);

    return () => window.clearTimeout(debounceId);
  }, [inputValue]);

  const suggestions = useMemo(() => {
    const enriched = ALGORITHM_INDEX.map((item) => ({
      ...item,
      visits: visitMap[item.id] || 0,
    }));

    if (!query) {
      return enriched
        .filter((item) => item.visits > 0)
        .sort((a, b) => {
          if (b.visits !== a.visits) return b.visits - a.visits;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 8);
    }

    const score = (item) => {
      const name = item.name.toLowerCase();
      if (name === query) return 300;
      if (name.startsWith(query)) return 200;
      if (name.includes(query)) return 130;
      return 100;
    };

    return enriched
      .filter((item) => item.searchBlob.includes(query))
      .sort((a, b) => {
        const rankDiff = score(b) - score(a);
        if (rankDiff) return rankDiff;
        if (b.visits !== a.visits) return b.visits - a.visits;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 12);
  }, [query, visitMap]);

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (!suggestions.length) return 0;
      return Math.min(prev, suggestions.length - 1);
    });
  }, [suggestions.length]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.defaultPrevented) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.shiftKey || event.altKey) return;
      if (event.key.toLowerCase() !== "k") return;
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
      setIsOpen(true);
    };

    document.addEventListener("keydown", handleShortcut, true);
    return () => document.removeEventListener("keydown", handleShortcut, true);
  }, []);

  useEffect(() => {
    const handleExternalOpen = () => setIsOpen(true);
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, handleExternalOpen);
    return () => window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, handleExternalOpen);
  }, []);

  useEffect(() => {
    setIsOpen(false);

    const visitedAlgorithmId = ALGORITHM_BY_PATH.get(location.pathname);
    if (!visitedAlgorithmId) return;

    setVisitMap((prev) => ({
      ...prev,
      [visitedAlgorithmId]: (prev[visitedAlgorithmId] || 0) + 1,
    }));
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const body = document.body;
    const previousStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    scrollYRef.current = window.scrollY;

    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 20);

    return () => {
      window.clearTimeout(focusTimer);
      body.style.position = previousStyles.position;
      body.style.top = previousStyles.top;
      body.style.left = previousStyles.left;
      body.style.right = previousStyles.right;
      body.style.width = previousStyles.width;
      body.style.overflow = previousStyles.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOpenKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
        return;
      }

      if (!suggestions.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        openAlgorithm(suggestions[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handleOpenKeyDown);
    return () => document.removeEventListener("keydown", handleOpenKeyDown);
  }, [closePalette, isOpen, openAlgorithm, selectedIndex, suggestions]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[460]">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={closePalette}
          />

          <div
            className="absolute inset-0 flex items-start md:items-center justify-center p-4"
            onClick={closePalette}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Algorithm search"
              initial={{ opacity: 0, scale: 0.98, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 14 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-2xl overflow-hidden"
              style={{
                background: isDark ? "rgba(17,22,39,0.97)" : "rgba(255,255,255,0.98)",
                borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.09)",
                boxShadow: isDark
                  ? "0 24px 60px -28px rgba(0,0,0,0.65)"
                  : "0 24px 60px -28px rgba(15,23,42,0.2)",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl"
                style={{ background: isDark ? "rgba(34,197,94,0.14)" : "rgba(14,165,233,0.14)" }}
              />
              <div
                className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full blur-3xl"
                style={{ background: isDark ? "rgba(56,189,248,0.14)" : "rgba(20,184,166,0.14)" }}
              />

              <div
                className="relative p-4 md:p-5 border-b"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-code text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--text-secondary)" }}>
                    {query ? "Live Suggestions" : "Frequently Visited"}
                  </p>
                  <span
                    className="px-2 py-1 rounded-md font-code text-[10px] uppercase tracking-[0.1em]"
                    style={{
                      color: "var(--text-secondary)",
                      background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
                    }}
                  >
                    {getShortcutLabel()}
                  </span>
                </div>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder="Search algorithms..."
                    className="w-full h-12 rounded-2xl pl-11 pr-4 text-sm outline-none border"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div className="relative max-h-[60vh] overflow-y-auto p-2">
                {suggestions.length > 0 ? (
                  suggestions.map((item, index) => {
                    const active = index === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => openAlgorithm(item)}
                        className="w-full text-left rounded-2xl border px-3 py-2.5 transition-all"
                        style={{
                          background: active
                            ? isDark
                              ? "linear-gradient(130deg, rgba(34,197,94,0.16), rgba(56,189,248,0.1))"
                              : "linear-gradient(130deg, rgba(14,165,233,0.14), rgba(20,184,166,0.08))"
                            : isDark
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.65)",
                          borderColor: active
                            ? isDark
                              ? "rgba(34,197,94,0.35)"
                              : "rgba(14,165,233,0.35)"
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(15,23,42,0.08)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-display text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                              {item.name}
                            </p>
                            <p className="font-code text-[10px] uppercase tracking-[0.1em] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                              {item.topicTitle}
                            </p>
                          </div>

                          {!query && item.visits > 0 && (
                            <span
                              className="shrink-0 px-2 py-1 rounded-md text-[10px] font-code uppercase tracking-[0.08em]"
                              style={{
                                color: isDark ? "#86efac" : "#0f766e",
                                background: isDark ? "rgba(34,197,94,0.14)" : "rgba(20,184,166,0.12)",
                              }}
                            >
                              {item.visits} visit{item.visits === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                    <Sparkles size={16} className="mx-auto mb-2" />
                    <p className="text-sm">
                      {query
                        ? "No matching algorithms found."
                        : "No history yet. Open algorithms and they will appear here."}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalCommandPalette;
