import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Zap,
  Crown,
  Terminal,
  Code2,
  ShieldCheck,
  Building2,
  Info,
} from "lucide-react";

// --- DATA ---
const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: "₹0",
    originalPrice: "₹99",
    period: "/ forever",
    tagline: "For casual learners",
    features: [
      { text: "10 Code Runs / Day", included: true },
      { text: "Access to Public Problems", included: true },
      { text: "Community Forums", included: true },
      { text: "Unlimited Code Runs", included: false },
      { text: "Company Archives", included: false },
      { text: "Mock Interviews", included: false },
    ],
    buttonText: "Current Plan",
    theme: "gray",
    icon: Code2,
  },
  {
    id: "standard",
    name: "Coder",
    price: "₹49",
    originalPrice: "₹199",
    period: "/ month",
    tagline: "Remove limits",
    features: [
      { text: "Unlimited Code Runs", included: true },
      { text: "Must Do Problem Sets", included: true },
      { text: "Company Archives", included: true },
      { text: "Advanced Test Cases", included: true },
      { text: "Solution Editor", included: true },
      { text: "Mock Interviews", included: false },
    ],
    buttonText: "Unlock Coding",
    theme: "blue",
    tag: "Recommended",
    icon: Terminal,
  },
  {
    id: "premium",
    name: "Job Ready",
    price: "₹199",
    originalPrice: "₹499",
    period: "/ month",
    tagline: "Full mentorship suite",
    features: [
      { text: "Everything in Coder", included: true },
      { text: "Unlimited Code Runs", included: true },
      { text: "4 Mock Interviews / Mo", included: true },
      { text: "Resume Review Credit", included: true },
      { text: "Priority Mentorship", included: true },
      { text: "Verified Certificate", included: true },
    ],
    buttonText: "Get Placed Now",
    theme: "gold",
    tag: "Best Value",
    icon: Crown,
  },
];

// --- COMPONENTS ---

// Spotlight Gradient Logic
function useSpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return { mouseX, mouseY, handleMouseMove };
}

const FlipCard = ({ plan, loading, handlePayment }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { mouseX, mouseY, handleMouseMove } = useSpotlight();

  const isPremium = plan.theme === "gold";
  const isBlue = plan.theme === "blue";

  // Dynamic Colors
  const glowColor = isPremium
    ? "rgba(245, 158, 11, 0.15)"
    : isBlue
      ? "rgba(59, 130, 246, 0.15)"
      : "rgba(255, 255, 255, 0.05)";

  return (
    <div
      className="relative w-full h-[360px] cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)} // Mobile tap
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* --- FRONT FACE --- */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border border-white/5 bg-[#0f172a] shadow-xl flex flex-col items-center justify-center text-center overflow-hidden"
          onMouseMove={handleMouseMove}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Spotlight (Front Only) */}
          <motion.div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  300px circle at ${mouseX}px ${mouseY}px,
                  ${glowColor},
                  transparent 80%
                )
              `,
            }}
          />

          {plan.tag && (
            <div className={`absolute top-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPremium ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-400"
              }`}>
              {plan.tag}
            </div>
          )}

          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-3xl ${isPremium ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-500" : isBlue ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-gray-500"
            }`}>
            <plan.icon size={28} strokeWidth={1.5} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 line-through">{plan.originalPrice}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${isPremium ? "text-amber-400" : "text-white"}`}>{plan.price}</span>
              <span className="text-xs text-gray-500">{plan.period}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">{plan.tagline}</p>

          <div className="absolute bottom-4 flex items-center gap-1 text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
            <Info size={10} /> Flip for details
          </div>
        </div>

        {/* --- BACK FACE --- */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border border-white/10 bg-[#1e293b] p-6 flex flex-col z-10"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Features</h4>
          <ul className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${feature.included ? (isPremium ? "text-amber-500" : "text-blue-400") : "text-gray-600"
                  }`}>
                  <Check size={12} strokeWidth={3} className={!feature.included && "opacity-0"} />
                </div>
                <span className={`text-xs ${feature.included ? "text-gray-300" : "text-gray-500 line-through"}`}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (plan.price !== "₹0") handlePayment(plan.id);
            }}
            disabled={plan.price === "₹0" || loading === plan.id}
            className={`w-full py-3 rounded-lg text-sm font-bold tracking-wide transition-all mt-4 cursor-pointer ${isPremium
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-105"
                : isBlue
                  ? "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105"
                  : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
          >
            {loading === plan.id ? "Processing..." : plan.buttonText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const LegalFooter = () => (
  <div className="border-t border-white/5 py-12 text-center mt-auto">
    <div className="flex justify-center flex-wrap gap-8 mb-6 text-sm text-gray-400">
      <Link to="/legal/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</Link>
      <Link to="/legal/terms" className="hover:text-white transition-colors cursor-pointer">Terms of Service</Link>
      <Link to="/legal/refund" className="hover:text-white transition-colors cursor-pointer">Refund Policy</Link>
      <Link to="/contact" className="hover:text-white transition-colors cursor-pointer">Contact Support</Link>
    </div>
    <p className="text-xs text-gray-600">© 2026 AlgoViz Inc. All rights reserved.</p>
  </div>
);

const PremiumPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handlePayment = (planId) => {
    setLoading(planId);
    setTimeout(() => {
      setLoading(null);
      alert(`Redirecting...`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-amber-500/30 overflow-x-hidden flex flex-col">

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </nav>

      <div className="relative pt-32 pb-10 flex-grow">
        {/* Hero */}
        <div className="text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-6">
            <Zap size={14} fill="currentColor" /> Limited Offer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple Pricing, <span className="text-amber-500">Maximum Impact</span>
          </h1>
        </div>

        {/* Grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 md:grid-cols-3 md:gap-6 mb-24">
          {PLANS.map((plan) => (
            <FlipCard
              key={plan.id}
              plan={plan}
              loading={loading}
              handlePayment={handlePayment}
            />
          ))}
        </div>

        {/* Trust Badges Minimal */}
        <div className="flex justify-center gap-8 text-gray-500 opacity-60 mb-20 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2"><ShieldCheck size={16} /> Secure Payment</div>
          <div className="flex items-center gap-2"><Building2 size={16} /> Official Partner</div>
        </div>
      </div>

      <LegalFooter />
    </div>
  );
};

export default PremiumPage;
