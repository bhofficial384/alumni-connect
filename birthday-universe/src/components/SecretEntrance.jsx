import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function SecretEntrance({ onEnter, recipientName }) {
  const [isWarping, setIsWarping] = useState(false);

  const handleEnterClick = () => {
    sounds.init();
    sounds.playCelebrationChord();
    setIsWarping(true);

    setTimeout(() => {
      onEnter();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#03030c] px-6 text-center select-none overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{
          opacity: isWarping ? 0 : 1,
          scale: isWarping ? 1.4 : 1,
          filter: isWarping ? 'blur(10px)' : 'blur(0px)',
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Deep space glow halos */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-900/15 blur-[120px] pointer-events-none -top-20 -left-20 animate-pulse" />
        <div className="absolute w-[650px] h-[650px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none -bottom-20 -right-20 animate-pulse [animation-delay:2s]" />

        {/* Floating subtle constellation ring */}
        <motion.div
          className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-purple-500/15 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-300 rounded-full glow-gold" />
          <div className="absolute bottom-10 right-10 w-1.5 h-1.5 bg-purple-300 rounded-full glow-purple" />
          <div className="absolute left-6 top-1/3 w-1 h-1 bg-white rounded-full" />
        </motion.div>

        {/* Content Container */}
        <div className="relative z-10 max-w-2xl flex flex-col items-center">
          {/* Constellation Icon Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="mb-8 flex items-center justify-center p-3.5 rounded-full glass-panel border border-amber-400/20 text-amber-300 glow-gold"
          >
            <Sparkles className="w-6 h-6 animate-spin [animation-duration:12s]" />
          </motion.div>

          {/* First line: "Some people are stars..." */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
            className="text-xl sm:text-2xl md:text-3xl font-serif-luxury italic text-slate-300 tracking-wide mb-3"
          >
            "Some people are stars..."
          </motion.p>

          {/* Second line: "...but you are the entire universe." */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 1.8, ease: 'easeOut' }}
            className="text-2xl sm:text-4xl md:text-5xl font-cinzel font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-purple-200 tracking-wider mb-10 text-glow-gold"
          >
            "...but you are the entire universe."
          </motion.h1>

          {/* Glowing button: "Enter Your Universe ✨" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 2.8, ease: 'easeOut' }}
            className="relative"
          >
            <button
              onClick={handleEnterClick}
              disabled={isWarping}
              className="relative group px-9 py-4 rounded-full font-cinzel text-sm sm:text-base tracking-[0.2em] font-semibold text-amber-200 uppercase overflow-hidden transition-all duration-500 glass-panel-gold border border-amber-400/50 hover:border-amber-300 hover:shadow-[0_0_35px_rgba(251,191,36,0.45)] hover:scale-105 active:scale-95"
            >
              {/* Shimmer effect inside button */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

              <span className="relative z-10 flex items-center gap-3">
                <span>Enter Your Universe</span>
                <span className="text-amber-300 text-lg group-hover:rotate-12 transition-transform duration-300">
                  ✨
                </span>
              </span>
            </button>

            {/* Glowing aura beneath button */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 blur-lg opacity-70 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.5, delay: 3.5 }}
            className="mt-8 text-xs font-cinzel tracking-widest text-slate-400 uppercase"
          >
            A personal celestial journey crafted for {recipientName}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
