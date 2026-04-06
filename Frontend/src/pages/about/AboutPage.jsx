import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Brain,
  Compass,
  Github,
  Linkedin,
  Target,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../core/context/ThemeContext";

const problemCards = [
  {
    icon: Brain,
    title: "From memorization to intuition",
    copy: "Most learners can repeat an algorithm but cannot reason through it under pressure. AlgoViz is designed to make the logic visible so intuition forms naturally.",
  },
  {
    icon: Compass,
    title: "From scattered prep to clear path",
    copy: "Interview preparation often feels random. We combine visual learning, practice, and guided progression into one connected journey.",
  },
  {
    icon: Target,
    title: "From anxiety to confidence",
    copy: "Confidence comes from seeing how and why an algorithm works. Our product focuses on depth of understanding, not surface repetition.",
  },
];

const pillars = [
  {
    icon: Brain,
    title: "Understand with live visualizers",
    copy: "Our Understand stage lets learners explore animated algorithm demos and category deep-dives across arrays, trees, dynamic programming, searching, greedy, and backtracking.",
  },
  {
    icon: Target,
    title: "Practice and evaluate in real environments",
    copy: "The Practice and Evaluate stages combine coding IDE workflows, DSA and MCQ problem banks, and OA-style timed simulations to build interview readiness under pressure.",
  },
  {
    icon: Users,
    title: "Learn from outcomes and guided mentorship",
    copy: "The Learn and Guided stages provide interview experiences, company-focused preparation, mock interviews, and mentorship sessions for actionable improvement.",
  },
];

const proofStats = [
  { value: "30+", label: "Algorithms mapped" },
  { value: "200+", label: "Practice problems" },
  { value: "100+", label: "Learning guides" },
  { value: "3", label: "Core builders" },
];

const valueCards = [
  {
    icon: Target,
    title: "Clarity over complexity",
    copy: "Every interface and explanation should reduce cognitive load and improve decision-making.",
  },
  {
    icon: BadgeCheck,
    title: "Proof over hype",
    copy: "We prioritize outcomes users can feel: better understanding, stronger recall, and interview readiness.",
  },
  {
    icon: Users,
    title: "Builders close to learners",
    copy: "We design with direct user feedback and iterate fast on where people get stuck.",
  },
  {
    icon: Compass,
    title: "Depth with momentum",
    copy: "Our approach balances conceptual depth with practical progress so users keep moving forward.",
  },
];

const storyTimeline = [
  {
    year: "Phase 1",
    title: "The first principle",
    copy: "AlgoViz started with a simple belief: algorithm learning should be visual, interactive, and emotionally less intimidating.",
  },
  {
    year: "Phase 2",
    title: "From demos to system",
    copy: "We expanded from isolated visual demos into a structured learning platform with practice tracks and learning support.",
  },
  {
    year: "Now",
    title: "A visual intelligence platform",
    copy: "We are building the product as a full-stack learning environment where reasoning, repetition, and progress all live together.",
  },
];

const teamMembers = [
  {
    name: "Ratan",
    role: "Frontend and Backend",
    focus: "Product architecture, interaction design, and end-to-end user experience execution.",
    links: [
      { label: "GitHub", href: "https://github.com/Ratan10067", icon: Github },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/ratan-kumar-24961b285/", icon: Linkedin },
    ],
  },
  {
    name: "Anup",
    role: "Frontend and Security",
    focus: "Frontend systems, reliability, and secure-by-default platform behavior.",
    links: [
      { label: "GitHub", href: "https://github.com/me-sirius", icon: Github },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/anup-kumar-kgp/", icon: Linkedin },
    ],
  },
  {
    name: "Vishnu",
    role: "Backend and Quality",
    focus: "Core service robustness, testing discipline, and performance-oriented backend delivery.",
    links: [
      { label: "GitHub", href: "https://github.com/vishnu-1817", icon: Github },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/vishnukumarpaswan/", icon: Linkedin },
    ],
  },
];

const roadmap = [
  {
    state: "Live",
    title: "Visualization core",
    copy: "Interactive algorithm walkthroughs and guided educational content for foundational DSA learning.",
  },
  {
    state: "Next",
    title: "Complete developer hub",
    copy: "We are extending AlgoViz as a complete hub for software developers with integrated support for blogs, tutorials, mentorship, and growth resources.",
  },
  {
    state: "Planned",
    title: "AI code-to-visualization engine",
    copy: "We are planning to integrate an AI model that converts any correct code into visualization with stunning animations for last-minute understanding of algorithms.",
  },
];

const SUPPORT_EMAIL = "help.algoviz@gmail.com";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Practice", path: "/practice" },
      { label: "MCQ Arena", path: "/mcq" },
      { label: "Mock Test", path: "/mock-test" },
      { label: "IDE Playground", path: "/ide" },
      { label: "Algorithms", path: "/algorithms" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", path: "/blogs" },
      { label: "Documentation", path: "/view-documentation" },
      { label: "Cheat Sheet", path: "/cheatsheet" },
      { label: "Big O Guide", path: "/big-o-guide" },
      { label: "Interview Experiences", path: "/Interview-Experience" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Premium", path: "/premium" },
      { label: "Support", path: "/support" },
      { label: "Contact", path: "/contact" },
      { label: "Leaderboard", path: "/leaderboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", path: "/legal/terms" },
      { label: "Privacy", path: "/legal/privacy" },
      { label: "Refunds", path: "/legal/refunds" },
      { label: "Shipping", path: "/legal/shipping" },
    ],
  },
];

const footerMetaLinks = [
  { label: "Terms", path: "/legal/terms" },
  { label: "Privacy", path: "/legal/privacy" },
  { label: "Refunds", path: "/legal/refunds" },
  { label: "Shipping", path: "/legal/shipping" },
];

const buildReveal = (reduceMotion, delay = 0.08, y = 16) => {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay },
  };
};

export default function AboutPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === "dark";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ambientBackground = isDark
    ? "radial-gradient(ellipse at 16% 11%, color-mix(in srgb, var(--accent-primary) 18%, transparent) 0%, transparent 36%), radial-gradient(ellipse at 84% 24%, color-mix(in srgb, var(--accent-secondary) 14%, transparent) 0%, transparent 38%), linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 96%, black) 0%, var(--bg-primary) 100%)"
    : "radial-gradient(ellipse at 14% 9%, color-mix(in srgb, var(--accent-primary) 11%, transparent) 0%, transparent 35%), radial-gradient(ellipse at 86% 26%, color-mix(in srgb, var(--accent-secondary) 8%, transparent) 0%, transparent 36%), linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 96%, white) 0%, var(--bg-primary) 100%)";

  const surfaceBorderColor = isDark
    ? "color-mix(in srgb, var(--text-primary) 16%, var(--border-default))"
    : "var(--border-default)";

  const mutedTextColor = isDark
    ? "color-mix(in srgb, var(--text-primary) 62%, var(--text-muted))"
    : "var(--text-muted)";

  const bodyTextColor = isDark
    ? "color-mix(in srgb, var(--text-primary) 86%, var(--text-secondary))"
    : "var(--text-secondary)";

  const controlTextColor = isDark
    ? "color-mix(in srgb, var(--text-primary) 88%, var(--text-secondary))"
    : "var(--text-secondary)";

  const controlBorderColor = isDark
    ? "color-mix(in srgb, var(--text-primary) 15%, var(--border-default))"
    : "var(--border-default)";

  const sectionClass = "mt-[72px] max-[680px]:mt-[52px]";
  const sectionHeadClass = "mb-[22px]";
  const sectionKickerClass = "m-0 font-code text-[11px] uppercase tracking-[0.14em]";
  const sectionTitleClass = "mt-2 font-display text-[clamp(1.5rem,3.6vw,2.3rem)] leading-[1.2] tracking-[-0.02em]";
  const sectionDescClass = "mt-[10px] max-w-[760px] leading-[1.8]";
  const primaryButtonClass = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-transparent px-[18px] py-3 font-code text-[13px] font-semibold tracking-[0.03em] text-[var(--bg-primary)] transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-px";
  const secondaryButtonClass = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-lg)] border px-[18px] py-3 font-code text-[13px] font-semibold tracking-[0.03em] transition-all duration-200 ease-out hover:-translate-y-px hover:text-[var(--text-primary)]";
  const cardClass = "rounded-[20px] border p-5";
  const cardTitleClass = "mb-2 mt-[14px] font-display text-[19px] leading-[1.2]";
  const cardCopyClass = "m-0 text-sm leading-[1.7]";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: ambientBackground }}>
        <div
          className="absolute -left-[120px] -top-[140px] h-[560px] w-[560px] rounded-full blur-[80px]"
          style={{ background: "color-mix(in srgb, var(--accent-primary) 22%, transparent)" }}
        />
        <div
          className="absolute -right-[140px] top-[160px] h-[520px] w-[520px] rounded-full blur-[80px]"
          style={{ background: "color-mix(in srgb, var(--accent-secondary) 16%, transparent)" }}
        />
      </div>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          opacity: isDark ? 0.14 : 0.22,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)' opacity='0.95'/%3E%3C/svg%3E\")",
        }}
      />

      <main className="relative z-10 mx-auto w-[min(1200px,calc(100%-40px))] pt-[102px] max-[900px]:w-[min(1200px,calc(100%-24px))] max-[680px]:pt-[84px]">
        <motion.section
          className="relative overflow-hidden rounded-[28px] border p-[42px] max-[900px]:p-[26px]"
          style={{
            borderColor: surfaceBorderColor,
            background:
              "linear-gradient(155deg, color-mix(in srgb, var(--bg-elevated) 94%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 86%, transparent) 100%)",
            boxShadow: "var(--shadow-md), inset 0 1px 0 var(--specular-highlight)",
          }}
          {...buildReveal(reduceMotion, 0.04, 10)}
        >
          <div
            className="pointer-events-none absolute -right-[100px] -top-[120px] h-[340px] w-[340px] rounded-full blur-[92px]"
            style={{ background: "color-mix(in srgb, var(--accent-primary) 20%, transparent)" }}
          />

          <p className="relative m-0 inline-flex items-center gap-2 font-code text-[11px] uppercase tracking-[0.16em] text-[var(--accent-primary)]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)]"
              aria-hidden="true"
            />
            About AlgoViz
          </p>
          <h1 className="relative mb-[18px] mt-[14px] max-w-[780px] font-display text-[clamp(2rem,5.4vw,3.8rem)] leading-[1.08] tracking-[-0.03em]">
            Algorithms should be <span className="bg-[var(--gradient-text)] bg-clip-text text-transparent">seen</span>, not memorized.
          </h1>
          <p className="relative m-0 max-w-[700px] text-[17px] leading-[1.75]" style={{ color: bodyTextColor }}>
            AlgoViz is a visual intelligence platform for DSA mastery. We help learners move from vague pattern memorization
            to deep algorithmic intuition through interactive visual systems, structured practice, and guided reasoning.
          </p>
          <div className="relative mt-[30px] flex flex-wrap gap-3">
            <button
              type="button"
              className={primaryButtonClass}
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "var(--shadow-sm), 0 0 20px var(--accent-glow)",
              }}
              onClick={() => navigate("/ide")}
            >
              Start Visualizing
              <ArrowUpRight size={14} />
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              style={{
                color: controlTextColor,
                borderColor: controlBorderColor,
                background: "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
              }}
              onClick={() => navigate("/view-documentation")}
            >
              Explore Documentation
            </button>
          </div>
        </motion.section>

        <section className={sectionClass}>
          <motion.div className={sectionHeadClass} {...buildReveal(reduceMotion, 0.06)}>
            <p className={sectionKickerClass} style={{ color: mutedTextColor }}>Why We Exist</p>
            <h2 className={sectionTitleClass}>The real gap is not access, it is understanding.</h2>
            <p className={sectionDescClass} style={{ color: bodyTextColor }}>
              Developers have content everywhere, yet many still struggle to reason through problems under interview pressure.
              AlgoViz was built to close that gap by making algorithm behavior tangible.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
            {problemCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  className={cardClass}
                  style={{
                    borderColor: surfaceBorderColor,
                    background:
                      "linear-gradient(160deg, color-mix(in srgb, var(--bg-elevated) 90%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 86%, transparent) 100%)",
                    boxShadow: "var(--shadow-sm), inset 0 1px 0 var(--specular-highlight)",
                  }}
                  {...buildReveal(reduceMotion, 0.08 + index * 0.05)}
                >
                  <div
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-xl border text-[var(--accent-primary)]"
                    style={{
                      borderColor: "color-mix(in srgb, var(--accent-primary) 32%, var(--border-default))",
                      background: "color-mix(in srgb, var(--accent-primary) 14%, transparent)",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className={cardTitleClass}>{item.title}</h3>
                  <p className={cardCopyClass} style={{ color: bodyTextColor }}>{item.copy}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className={sectionClass}>
          <motion.div className={sectionHeadClass} {...buildReveal(reduceMotion, 0.05)}>
            <p className={sectionKickerClass} style={{ color: mutedTextColor }}>How It Works</p>
            <h2 className={sectionTitleClass}>A practical system: understand, practice, evaluate, and grow.</h2>
            <p className={sectionDescClass} style={{ color: bodyTextColor }}>
              This flow is mapped directly from the landing journey sections: Understand, Practice, Evaluate, Learn, and Guided.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
            {pillars.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  className={cardClass}
                  style={{
                    borderColor: surfaceBorderColor,
                    background:
                      "linear-gradient(160deg, color-mix(in srgb, var(--bg-elevated) 90%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 86%, transparent) 100%)",
                    boxShadow: "var(--shadow-sm), inset 0 1px 0 var(--specular-highlight)",
                  }}
                  {...buildReveal(reduceMotion, 0.08 + index * 0.06)}
                >
                  <div
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-xl border text-[var(--accent-primary)]"
                    style={{
                      borderColor: "color-mix(in srgb, var(--accent-primary) 32%, var(--border-default))",
                      background: "color-mix(in srgb, var(--accent-primary) 14%, transparent)",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className={cardTitleClass}>{item.title}</h3>
                  <p className={cardCopyClass} style={{ color: bodyTextColor }}>{item.copy}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className={sectionClass}>
          <motion.div className={sectionHeadClass} {...buildReveal(reduceMotion, 0.05)}>
            <p className={sectionKickerClass} style={{ color: mutedTextColor }}>Momentum</p>
            <h2 className={sectionTitleClass}>Small team, clear output, compounding product depth.</h2>
          </motion.div>

          <div className="grid grid-cols-4 gap-[14px] max-[1120px]:grid-cols-2 max-[680px]:grid-cols-1">
            {proofStats.map((item, index) => (
              <motion.article
                key={item.label}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: surfaceBorderColor,
                  background: "color-mix(in srgb, var(--bg-secondary) 90%, transparent)",
                  boxShadow: "var(--shadow-sm)",
                }}
                {...buildReveal(reduceMotion, 0.08 + index * 0.04, 10)}
              >
                <p className="m-0 font-display text-[clamp(1.45rem,3.4vw,2.2rem)] tracking-[-0.03em]">{item.value}</p>
                <p
                  className="mt-1 font-code text-xs uppercase tracking-[0.06em]"
                  style={{ color: mutedTextColor }}
                >
                  {item.label}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <motion.div className={sectionHeadClass} {...buildReveal(reduceMotion, 0.05)}>
            <p className={sectionKickerClass} style={{ color: mutedTextColor }}>Founder Story</p>
            <h2 className={sectionTitleClass}>Built from learner pain, not from trend-chasing.</h2>
          </motion.div>

          <div className="grid gap-[14px]">
            {storyTimeline.map((item, index) => (
              <motion.article
                key={item.title}
                className="grid grid-cols-[98px_minmax(0,1fr)] gap-4 rounded-[18px] border p-4 max-[900px]:grid-cols-1 max-[900px]:gap-[10px]"
                style={{
                  borderColor: surfaceBorderColor,
                  background: "color-mix(in srgb, var(--bg-secondary) 86%, transparent)",
                  boxShadow: "var(--shadow-sm)",
                }}
                {...buildReveal(reduceMotion, 0.08 + index * 0.05, 10)}
              >
                <p className="m-0 font-code text-[13px] uppercase tracking-[0.08em] text-[var(--accent-primary)]">{item.year}</p>
                <div>
                  <h3 className="m-0 font-display text-[20px]">{item.title}</h3>
                  <p className="mt-2 leading-[1.7]" style={{ color: bodyTextColor }}>{item.copy}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <motion.div className={sectionHeadClass} {...buildReveal(reduceMotion, 0.05)}>
            <p className={sectionKickerClass} style={{ color: mutedTextColor }}>Operating Values</p>
            <h2 className={sectionTitleClass}>How we build, ship, and learn.</h2>
          </motion.div>

          <div className="grid grid-cols-4 gap-4 max-[1120px]:grid-cols-2 max-[680px]:grid-cols-1">
            {valueCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  className={cardClass}
                  style={{
                    borderColor: surfaceBorderColor,
                    background:
                      "linear-gradient(160deg, color-mix(in srgb, var(--bg-elevated) 90%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 86%, transparent) 100%)",
                    boxShadow: "var(--shadow-sm), inset 0 1px 0 var(--specular-highlight)",
                  }}
                  {...buildReveal(reduceMotion, 0.08 + index * 0.04, 10)}
                >
                  <div
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-xl border text-[var(--accent-primary)]"
                    style={{
                      borderColor: "color-mix(in srgb, var(--accent-primary) 32%, var(--border-default))",
                      background: "color-mix(in srgb, var(--accent-primary) 14%, transparent)",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className={cardTitleClass}>{item.title}</h3>
                  <p className={cardCopyClass} style={{ color: bodyTextColor }}>{item.copy}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="mt-[84px] max-[680px]:mt-[52px]">
          <motion.div
            className="rounded-[28px] border p-[34px] max-[900px]:p-[26px]"
            style={{
              borderColor: surfaceBorderColor,
              background:
                "linear-gradient(145deg, color-mix(in srgb, var(--accent-primary) 10%, var(--bg-secondary)) 0%, color-mix(in srgb, var(--accent-secondary) 8%, var(--bg-primary)) 100%)",
              boxShadow: "var(--shadow-md), inset 0 1px 0 var(--specular-highlight)",
            }}
            {...buildReveal(reduceMotion, 0.05)}
          >
            <div className="mb-[26px]">
              <p className={sectionKickerClass} style={{ color: mutedTextColor }}>Team</p>
              <h2 className={sectionTitleClass}>A focused team from IIT Kharagpur.</h2>
              <p className="mt-[10px] max-w-[920px] leading-[1.8]" style={{ color: bodyTextColor }}>
                The team is the core differentiator of AlgoViz. We build with direct learner pain in mind and ship product improvements weekly.
                Photo slots are intentionally left as placeholders for the final profile image set.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[1120px]:grid-cols-2 max-[900px]:grid-cols-1">
              {teamMembers.map((member, index) => (
                <motion.article
                  key={member.name}
                  className="min-h-[230px] rounded-[20px] border p-[22px]"
                  style={{
                    borderColor: surfaceBorderColor,
                    background:
                      "linear-gradient(155deg, color-mix(in srgb, var(--bg-elevated) 95%, transparent) 0%, color-mix(in srgb, var(--bg-secondary) 90%, transparent) 100%)",
                    boxShadow: "var(--shadow-sm), inset 0 1px 0 var(--specular-highlight)",
                  }}
                  {...buildReveal(reduceMotion, 0.1 + index * 0.05, 12)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-[14px]">
                      <div
                        className="inline-flex h-[74px] w-[74px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[18px] border border-dashed"
                        style={{
                          borderColor: "color-mix(in srgb, var(--accent-primary) 55%, var(--border-default))",
                          background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                        }}
                        aria-hidden="true"
                      >
                        <span className="font-display text-[20px] leading-none tracking-[0.02em] text-[var(--accent-primary)]">
                          {member.name.slice(0, 2).toUpperCase()}
                        </span>
                        <small className="font-code text-[9px] uppercase tracking-[0.1em]" style={{ color: mutedTextColor }}>
                          Photo
                        </small>
                      </div>
                      <div>
                        <h3 className="m-0 font-display text-[21px]">{member.name}</h3>
                        <p className="mt-1 font-code text-xs uppercase tracking-[0.07em]" style={{ color: mutedTextColor }}>
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex gap-2">
                      {member.links.map((link) => {
                        const Icon = link.icon;
                        return (
                          <a
                            key={`${member.name}-${link.label}`}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] border transition-all duration-200 ease-out hover:-translate-y-px hover:text-[var(--accent-primary)]"
                            style={{
                              color: controlTextColor,
                              borderColor: controlBorderColor,
                              background: "color-mix(in srgb, var(--bg-primary) 70%, transparent)",
                            }}
                            aria-label={`${member.name} ${link.label}`}
                            title={`${member.name} ${link.label}`}
                          >
                            <Icon size={15} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                  <p className="mt-[10px] text-sm leading-[1.7]" style={{ color: bodyTextColor }}>{member.focus}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>

        <section className={sectionClass}>
          <motion.div className={sectionHeadClass} {...buildReveal(reduceMotion, 0.05)}>
            <p className={sectionKickerClass} style={{ color: mutedTextColor }}>Roadmap</p>
            <h2 className={sectionTitleClass}>Transparent progress, not vague promises.</h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-[14px] max-[1120px]:grid-cols-2 max-[680px]:grid-cols-1">
            {roadmap.map((item, index) => (
              <motion.article
                key={item.title}
                className="rounded-[18px] border p-4"
                style={{
                  borderColor: surfaceBorderColor,
                  background: "color-mix(in srgb, var(--bg-secondary) 88%, transparent)",
                  boxShadow: "var(--shadow-sm)",
                }}
                {...buildReveal(reduceMotion, 0.08 + index * 0.05, 10)}
              >
                <p className="m-0 font-code text-[11px] uppercase tracking-[0.12em] text-[var(--accent-primary)]">{item.state}</p>
                <h3 className="mb-[6px] mt-[10px] font-display text-[20px]">{item.title}</h3>
                <p className="m-0 text-sm leading-[1.7]" style={{ color: bodyTextColor }}>{item.copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <motion.footer
          className="ml-[calc(50%-50vw)] mt-[88px] w-screen border-t max-[680px]:mt-[64px]"
          style={{
            borderColor: surfaceBorderColor,
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 88%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 96%, transparent) 100%)",
          }}
          {...buildReveal(reduceMotion, 0.06)}
        >
          <div className="mx-auto w-[min(1240px,calc(100%-40px))] pb-[26px] pt-[42px] max-[900px]:w-[min(1240px,calc(100%-24px))]">
            <div className="flex items-end justify-between gap-7 border-b pb-[30px] max-[900px]:flex-col max-[900px]:items-start" style={{ borderColor: surfaceBorderColor }}>
              <div className="max-w-[780px]">
                <p className="m-0 font-code text-[11px] uppercase tracking-[0.16em]" style={{ color: mutedTextColor }}>Start Building</p>
                <h2 className="mt-[10px] font-display text-[clamp(1.6rem,4vw,2.7rem)] leading-[1.15] tracking-[-0.02em]">Ready to build algorithm intuition with visual intelligence?</h2>
                <p className="mt-3 max-w-[700px] leading-[1.8]" style={{ color: bodyTextColor }}>
                  AlgoViz brings visual learning, coding practice, interviews, and mentorship into one focused ecosystem for software developers.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 max-[900px]:justify-start">
                <button
                  type="button"
                  className={primaryButtonClass}
                  style={{
                    background: "var(--gradient-brand)",
                    boxShadow: "var(--shadow-sm), 0 0 20px var(--accent-glow)",
                  }}
                  onClick={() => navigate("/ide")}
                >
                  Open Playground
                  <ArrowUpRight size={14} />
                </button>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  style={{
                    color: controlTextColor,
                    borderColor: controlBorderColor,
                    background: "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
                  }}
                  onClick={() => navigate("/support")}
                >
                  Contact Support
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-[22px] border-b py-[30px] max-[1120px]:grid-cols-2 max-[680px]:grid-cols-1" style={{ borderColor: surfaceBorderColor }}>
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-3 mt-0 font-code text-[11px] uppercase tracking-[0.14em]" style={{ color: mutedTextColor }}>{column.title}</h3>
                  <ul className="m-0 grid list-none gap-2 p-0">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        <button
                          type="button"
                          className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm leading-[1.65] transition-all duration-200 ease-out hover:translate-x-0.5 hover:text-[var(--accent-primary)]"
                          style={{ color: bodyTextColor }}
                          onClick={() => navigate(link.path)}
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <p className="m-0 font-code text-[11px] uppercase tracking-[0.05em]" style={{ color: mutedTextColor }}>
                © 2026 AlgoViz. Support: {SUPPORT_EMAIL}
              </p>
              <div className="flex flex-wrap gap-2">
                {footerMetaLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    className="cursor-pointer rounded-full border px-[10px] py-1.5 font-code text-[11px] uppercase tracking-[0.06em] transition-all duration-200 ease-out hover:text-[var(--text-primary)]"
                    style={{
                      color: controlTextColor,
                      borderColor: controlBorderColor,
                      background: "color-mix(in srgb, var(--bg-primary) 72%, transparent)",
                    }}
                    onClick={() => navigate(link.path)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
