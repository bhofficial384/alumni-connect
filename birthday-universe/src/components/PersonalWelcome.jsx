import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function PersonalWelcome({ recipientName, welcomeIntro }) {
  const [stage, setStage] = useState(0); // 0: intro handwriting, 1: countdown, 2: grand reveal
  const [countdownNum, setCountdownNum] = useState(3);

  useEffect(() => {
    // Stage 0: Show handwritten intro for 4.2 seconds
    const timer1 = setTimeout(() => {
      setStage(1);
    }, 4200);

    return () => clearTimeout(timer1);
  }, []);

  // Countdown timer for Stage 1
  useEffect(() => {
    if (stage !== 1) return;

    if (countdownNum > 1) {
      sounds.playChime(1 + (3 - countdownNum) * 0.2);
      const timer = setTimeout(() => {
        setCountdownNum((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Reached 1 -> transition to stage 2
      sounds.playChime(1.6);
      const timer = setTimeout(() => {
        setStage(2);
        triggerGentleConfetti();
        sounds.playCelebrationChord();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stage, countdownNum]);

  const triggerGentleConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#fef08a', '#c084fc', '#e0e7ff'],
      disableForReducedMotion: true,
    });
  };

  const scrollToNext = () => {
    const el = document.getElementById('memories');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="welcome"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden"
    >
      {/* Radiant celestial moon / orb in background */}
      <motion.div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-400/10 via-purple-600/15 to-transparent blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.4, 0.65, 0.4],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Decorative crescent moon outline */}
      <motion.div
        className="absolute top-16 right-8 sm:right-24 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-t-2 border-r-2 border-amber-300/25 pointer-events-none"
        animate={{ rotate: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Stage 0: Animated Handwritten-style message */}
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="intro-script"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 1.2 }}
              className="px-6 py-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/20 text-amber-300 text-xs font-cinzel uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Cosmic Alignment</span>
              </div>

              <p className="text-2xl sm:text-4xl md:text-5xl font-handwriting text-amber-100/90 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_15px_rgba(251,191,36,0.3)]">
                "Today isn't just another day.
                <br />
                Today is the day someone extraordinary came into this world."
              </p>

              <motion.button
                onClick={() => setStage(1)}
                className="mt-8 text-xs font-cinzel text-amber-300/70 hover:text-amber-200 tracking-widest uppercase underline underline-offset-4 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
              >
                Skip to reveal →
              </motion.button>
            </motion.div>
          )}

          {/* Stage 1: Countdown-style animation */}
          {stage === 1 && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <p className="text-xs sm:text-sm font-cinzel text-slate-400 uppercase tracking-[0.3em] mb-4">
                Aligning Constellations
              </p>

              <div className="relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full glass-panel-gold border-2 border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                <motion.span
                  key={countdownNum}
                  initial={{ opacity: 0, scale: 0.4, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 0.4 }}
                  className="text-5xl sm:text-7xl font-cinzel font-bold text-amber-200 text-glow-gold"
                >
                  {countdownNum}
                </motion.span>
                <div className="absolute inset-0 rounded-full border border-amber-300/30 animate-ping opacity-25" />
              </div>
            </motion.div>
          )}

          {/* Stage 2: Grand Birthday Reveal */}
          {stage === 2 && (
            <motion.div
              key="grand-reveal"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel-gold border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-cinzel tracking-[0.25em] uppercase mb-6 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin [animation-duration:8s]" />
                <span>The Brightest Star in the Sky</span>
              </motion.div>

              {/* Glowing Person's Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="relative mb-4"
              >
                <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif-luxury font-light tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-300 drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
                  {recipientName}
                </h2>
                {/* Background aura behind name */}
                <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-amber-400/20 via-purple-500/20 to-amber-400/20 opacity-80" />
              </motion.div>

              {/* Happy Birthday Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="flex items-center justify-center gap-3 text-xl sm:text-3xl md:text-4xl font-cinzel text-amber-300 font-semibold tracking-wide mb-6 text-glow-gold"
              >
                <span>HAPPY BIRTHDAY, {recipientName}</span>
                <span className="text-3xl sm:text-4xl animate-bounce">🎂</span>
              </motion.div>

              {/* Poetic description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="max-w-xl text-sm sm:text-base md:text-lg text-slate-300 font-serif-luxury italic leading-relaxed mb-10"
              >
                "Out of all the coordinates in time and space, the universe chose to place you here — to bring warmth, light, and gentleness to those around you."
              </motion.p>

              {/* Scroll prompt button */}
              <motion.button
                onClick={scrollToNext}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                transition={{
                  opacity: { delay: 1.6, duration: 0.8 },
                  y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                }}
                className="flex flex-col items-center gap-2 text-xs font-cinzel text-amber-300/80 hover:text-amber-200 tracking-[0.2em] uppercase cursor-pointer group"
              >
                <span>Scroll to Explore Your Galaxy</span>
                <div className="p-2 rounded-full glass-panel border border-amber-400/30 group-hover:border-amber-300 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <ChevronDown className="w-4 h-4 text-amber-300" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
