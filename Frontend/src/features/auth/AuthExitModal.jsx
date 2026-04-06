import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  Crown,
  Rocket,
  Bookmark,
  Bell,
  ShieldCheck,
  ArrowRight,
  MessageSquareText,
  PenTool,
} from "lucide-react";

const cardMotion = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.05 } }),
};

export default function AuthExitModal({
  isOpen,
  variant, // 'signup' | 'signin'
  tone = "playful", // 'playful' | 'professional'
  onStay,
  onLeave,
}) {
  const [reason, setReason] = useState("browsing");

  const content = useMemo(() => {
    const isPlayful = tone === "playful";
    if (variant === "signin") {
      return {
        badgeIcon: ShieldCheck,
        badgeText: isPlayful ? "Quick vibe check" : "Quick check",
        title: isPlayful ? "Why’d you change your mind?" : "Why did you change your mind?",
        subtitle:
          reason === "forgot"
            ? (isPlayful
              ? "Happens to the best of us. Reset it and you’re back in 60 seconds."
              : "No worries — you can reset your password and be back in a minute.")
            : reason === "time"
              ? (isPlayful
                ? "Fair. But your saved stuff will miss you."
                : "Totally fair. Just don’t lose access to your saved stuff.")
              : (isPlayful
                ? "Sign in once — keep your progress, bookmarks, and premium tools ready."
                : "If you sign in, your progress and saved content stay with you."),
        reasons: [
          { key: "browsing", label: isPlayful ? "Just peeking" : "Just browsing" },
          { key: "forgot", label: isPlayful ? "Password vanished" : "Forgot password" },
          { key: "time", label: isPlayful ? "Later" : "Not now" },
        ],
        bulletsTitle: isPlayful ? "You’re leaving behind" : "Signing in unlocks",
        bullets: [
          { icon: Bookmark, title: "Saved content", desc: "Bookmarks and reads tied to your account." },
          { icon: Bell, title: "Notifications", desc: "Updates and activity in one place." },
          { icon: Crown, title: "Premium tools", desc: "Mock tests and other gated features." },
        ],
        primary: isPlayful ? "Okay, I’ll stay" : "Stay & sign in",
        secondary: isPlayful ? "I’ll bounce" : "Leave for now",
      };
    }

    return {
      badgeIcon: Sparkles,
      badgeText: isPlayful ? "Don’t ghost this" : "Before you go",
      title: isPlayful ? "You’re this close." : "You’re one step away.",
      subtitle:
        isPlayful
          ? "Create an account and keep your learning streak, saves, and pro tools all in one place."
          : "Creating an account keeps your learning in sync and unlocks the community features.",
      reasons: null,
      bulletsTitle: isPlayful ? "If you leave now, you’ll miss" : "If you leave now, you’ll miss",
      bullets: [
        { icon: Rocket, title: "Mock interviews & tests", desc: "Access to practice experiences and pro tools." },
        { icon: MessageSquareText, title: "Community learnings", desc: "Share interview experiences and learn faster." },
        { icon: PenTool, title: "Create & save", desc: "Write blogs, save resources, and track your journey." },
      ],
      primary: isPlayful ? "Let me in" : "Finish signing up",
      secondary: isPlayful ? "I’ll risk it" : "Leave anyway",
    };
  }, [variant, reason, tone]);

  const BadgeIcon = content.badgeIcon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onStay}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 bg-[#0b0b0d]/95 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent pointer-events-none" />

            <button
              type="button"
              onClick={onStay}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-10"
            >
              <X size={18} />
            </button>

            <div className="relative p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                <BadgeIcon size={14} className="text-cyan-400" />
                {content.badgeText}
              </div>

              <h2 className="mt-5 text-3xl font-black text-white tracking-tight">
                {content.title}
              </h2>
              <p className="mt-3 text-gray-400 leading-relaxed">
                {content.subtitle}
              </p>

              {content.reasons && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {content.reasons.map((r) => {
                    const active = reason === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setReason(r.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${active
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20"
                          }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-7">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {content.bulletsTitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {content.bullets.map((b, i) => {
                    const Icon = b.icon;
                    return (
                      <motion.div
                        key={b.title}
                        custom={i}
                        variants={cardMotion}
                        initial="hidden"
                        animate="show"
                        className="rounded-2xl bg-white/5 border border-white/10 p-4"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-3">
                          <Icon size={18} className="text-cyan-300" />
                        </div>
                        <p className="text-sm font-bold text-white">{b.title}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{b.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={onLeave}
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold transition-all cursor-pointer"
                >
                  {content.secondary}
                </button>

                <button
                  type="button"
                  onClick={onStay}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {content.primary}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
