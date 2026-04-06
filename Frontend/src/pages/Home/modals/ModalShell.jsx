import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers } from 'lucide-react';

/**
 * ModalShell — Shared wrapper providing the ~20% visual DNA across all category modals.
 * Handles: backdrop blur, ambient orbs, close button, coming-soon overlay.
 * 
 * Performance: Uses static backdrop-filter (no animation), GPU-accelerated opacity
 * transitions, and reduced ambient orb complexity.
 */
const ModalShell = ({
  isOpen,
  onClose,
  children,
  ambientOrbs = ['bg-cyan-600/10', 'bg-blue-800/10'],
  comingSoonConfig,
  showComingSoon,
  onCloseComingSoon,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 overflow-hidden"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop — static blur, only opacity animates */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[80px]"
          style={{ willChange: 'opacity' }}
        />

        {/* Ambient Orbs — static, no rotation/scale animation */}
        <div
          className={`absolute top-[-10%] right-[10%] w-[45vw] h-[45vw] rounded-full blur-[180px] pointer-events-none mix-blend-screen opacity-40 ${ambientOrbs[0]}`}
        />
        <div
          className={`absolute bottom-[-10%] left-[10%] w-[35vw] h-[35vw] rounded-full blur-[160px] pointer-events-none mix-blend-screen opacity-40 ${ambientOrbs[1]}`}
        />

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[1700px] h-[95vh] lg:h-[85vh] flex flex-col lg:flex-row gap-6 md:gap-8 drop-shadow-2xl"
          style={{ willChange: 'transform, opacity' }}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>

      {/* Coming Soon Overlay */}
      <AnimatePresence>
        {showComingSoon && comingSoonConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-[80px]"
            onClick={onCloseComingSoon}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className={`relative rounded-[3rem] p-10 lg:p-14 max-w-lg w-full ring-1 ${comingSoonConfig.comingSoonBg} shadow-[0_40px_100px_rgba(0,0,0,0.5)] text-center overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r ${comingSoonConfig.buttonGradient} opacity-50`} />
              <div className={`absolute inset-0 bg-gradient-to-b ${comingSoonConfig.heroBg} pointer-events-none opacity-50`} />
              <div className={`absolute -top-32 -left-32 w-64 h-64 ${comingSoonConfig.activeGlow} blur-[80px] rounded-full pointer-events-none`} />
              <div className={`absolute -bottom-32 -right-32 w-64 h-64 ${comingSoonConfig.activeGlow} blur-[80px] rounded-full pointer-events-none`} />

              <div className="relative z-10">
                <div className="mb-10 flex justify-center">
                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br ${comingSoonConfig.iconGlow} backdrop-blur-xl`}
                  >
                    <Layers className={`w-12 h-12 ${comingSoonConfig.iconColor}`} />
                  </motion.div>
                </div>

                <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tighter text-white">
                  Sequence <span className={`text-transparent bg-clip-text bg-gradient-to-r ${comingSoonConfig.buttonGradient}`}>Locked</span>
                </h2>
                <p className="text-base font-medium leading-relaxed text-slate-400 mb-10 px-4">
                  This highly specialized visualizer sequence is currently undergoing dimensional calibration in our labs.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCloseComingSoon}
                  className="w-full py-5 rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 text-white font-bold tracking-widest uppercase transition-all"
                >
                  Acknowledge
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default ModalShell;
