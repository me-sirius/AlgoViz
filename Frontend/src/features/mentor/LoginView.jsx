import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { LoadingBar } from "./Common";

const LoginView = ({
  loginData,
  setLoginData,
  handleLogin,
  isLoading,
  error,
  showPassword,
  setShowPassword,
  shake,
}) => {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <LoadingBar isLoading={isLoading} />

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md relative z-10 ${shake ? "animate-shake" : ""}`}
      >
        <div className="bg-[#0d0d0d]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield size={28} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-1">
              Secure Access
            </h1>
            <p className="text-zinc-500 text-sm">
              Mentor Portal • Verified Entry
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-[#0d0d0d] border border-white/10 text-white px-4 py-3.5 rounded-xl outline-none transition-all placeholder-zinc-600 focus:border-emerald-500/50 font-mono text-sm"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
              />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-[#0d0d0d] border border-white/10 text-white px-4 py-3.5 rounded-xl outline-none transition-all placeholder-zinc-600 focus:border-emerald-500/50 pr-12 font-mono text-sm"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-zinc-600 text-xs mt-6 font-mono">
            Protected by 256-bit encryption
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes shake { 
          0%, 100% { transform: translateX(0); } 
          25% { transform: translateX(-5px); } 
          75% { transform: translateX(5px); } 
        } 
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LoginView;
