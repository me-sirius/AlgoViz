import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Github, Mail, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../../core/context/ThemeContext";

const SUPPORT_EMAIL = 'help.algoviz@gmail.com';

const QUICK_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Support', path: '/support' },
  { label: 'Contact', path: '/contact' },
];

const LEGAL_HUB = {
  label: 'Legal Center',
  path: '/legal/terms',
};

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Obsidian Spatial Unified Footer
  return (
    <footer className={`relative w-full mt-24 overflow-hidden border-t ${isDark ? 'border-none' : 'border-slate-100 bg-slate-50/30'}`}>
      {/* Background gradient & Glows */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${
        isDark 
          ? 'bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712]' 
          : 'bg-gradient-to-b from-transparent via-white/50 to-white'
      }`} />
      
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none z-0 ${
        isDark ? 'bg-cyan-900/10 blur-[120px]' : 'bg-cyan-100/20 blur-[100px]'
      }`} />
      
      <div className={`absolute top-0 w-full h-px z-10 ${
        isDark 
          ? 'bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent' 
          : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'
      }`} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 py-16 lg:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] gap-10 lg:gap-16 items-start"
        >
          {/* Brand & Mission */}
          <div className="flex flex-col items-center lg:items-start gap-6 max-w-md text-center lg:text-left">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-xl ring-1 shadow-sm ${
                isDark 
                  ? 'bg-[#0f172a]/80 ring-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                  : 'bg-white ring-slate-200'
              }`}
            >
              <Terminal className={`w-6 h-6 ${isDark ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-cyan-600 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]'}`} />
            </motion.div>
            
            <div className="space-y-3">
              <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Algo<span className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>Viz</span>
              </h3>
              <p className={`text-sm font-medium leading-loose ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Demystifying complex algorithms through hyper-realistic spatial visualizations and interactive learning environments.
              </p>
            </div>
          </div>

          {/* Links & Action Area */}
          <div className="w-full max-w-[560px] mx-auto lg:mx-0 lg:justify-self-end flex flex-col gap-4">
            <div className={`rounded-2xl p-5 ring-1 backdrop-blur-md ${
              isDark ? 'bg-white/[0.02] ring-white/10' : 'bg-white/75 ring-slate-200'
            }`}>
              <p className={`font-code text-[10px] uppercase tracking-[0.18em] mb-3 ${
                isDark ? 'text-cyan-300/90' : 'text-cyan-700'
              }`}>
                Quick Access
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_LINKS.map((link, i) => (
                  <motion.button
                    key={link.label}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.12 + i * 0.08 }}
                    whileHover={{ y: -2 }}
                    onClick={() => navigate(link.path)}
                    className={`cursor-pointer px-3 py-2 rounded-lg text-[12px] font-bold font-mono tracking-wide ring-1 transition-all duration-300 ${
                      isDark
                        ? 'text-slate-200 ring-white/10 bg-white/[0.03] hover:text-cyan-300 hover:ring-cyan-500/40 hover:bg-cyan-500/10'
                        : 'text-slate-700 ring-slate-200 bg-white hover:text-cyan-700 hover:ring-cyan-500/35 hover:bg-cyan-50'
                    }`}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(LEGAL_HUB.path)}
                className={`cursor-pointer w-full rounded-xl ring-1 p-3.5 flex items-center justify-between gap-3 text-left transition-all duration-300 ${
                  isDark
                    ? 'bg-white/[0.04] ring-white/10 hover:bg-cyan-500/10 hover:ring-cyan-500/40'
                    : 'bg-white ring-slate-200 hover:bg-cyan-50 hover:ring-cyan-500/35'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-[12px] font-bold font-mono tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {LEGAL_HUB.label}
                  </p>
                  <p className={`text-[11px] font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Terms, Privacy, Refunds, and Shipping in one place
                  </p>
                </div>
                <ArrowUpRight size={14} className={isDark ? 'text-cyan-300' : 'text-cyan-700'} />
              </motion.button>
            </div>

            <div className="w-full flex flex-wrap items-center justify-center lg:justify-end gap-3">
              <motion.a
                whileHover={{ y: -2 }}
                href={`mailto:${SUPPORT_EMAIL}`}
                className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl ring-1 transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 ring-white/10 text-slate-200 hover:text-cyan-300'
                    : 'bg-white ring-slate-200 text-slate-700 hover:text-cyan-700 hover:bg-cyan-50'
                }`}
              >
                <Mail size={15} />
                <span className="font-mono text-xs font-semibold">{SUPPORT_EMAIL}</span>
              </motion.a>

              <motion.a
                whileHover={{ y: -2 }}
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl ring-1 transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 ring-white/10 text-slate-300 hover:text-cyan-300'
                    : 'bg-white ring-slate-200 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50'
                }`}
              >
                <Github size={15} />
                <span className="font-mono text-xs font-semibold">GitHub</span>
                <ArrowUpRight size={13} />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className={`mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-medium ${
            isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}
        >
          <p>© 2026 AlgoViz. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
