import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, RotateCcw, Share2, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function FinalSurprise({ recipientName, finalSurprise, onRestart }) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    sounds.playCelebrationChord();
    setIsRevealed(true);

    // Grand cinematic fireworks finale
    const duration = 4.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 100 };

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 60 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() * 0.5 + 0.2 },
        colors: ['#fbbf24', '#fef08a', '#c084fc', '#ffffff', '#f43f5e'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() * 0.5 + 0.2 },
        colors: ['#fbbf24', '#fef08a', '#c084fc', '#ffffff', '#38bdf8'],
      });
    }, 400);
  };

  return (
    <section id="surprise" className="relative min-h-screen py-28 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
      {/* Background Deep Cosmic Aura */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-amber-500/15 via-purple-900/20 to-pink-600/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl flex flex-col items-center">
        {!isRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/25 text-amber-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Grand Finale</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 font-light mb-6">
              Before You Leave This Universe...
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-serif-luxury italic mb-12 max-w-xl">
              There is one secret message that was written in the stars long before this day began.
            </p>

            {/* Glowing Mysterious Button: "One Last Thing... 💌" */}
            <div className="relative group">
              <motion.button
                onClick={handleReveal}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 px-10 py-5 rounded-full glass-panel-gold border-2 border-amber-400/60 text-amber-200 font-cinzel font-semibold tracking-[0.25em] uppercase text-base sm:text-lg shadow-[0_0_35px_rgba(251,191,36,0.45)] hover:shadow-[0_0_60px_rgba(251,191,36,0.7)] hover:border-amber-300 transition-all cursor-pointer flex items-center gap-3"
              >
                <span>One Last Thing...</span>
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                  💌
                </span>
              </motion.button>

              {/* Pulsing ring behind button */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400/30 via-purple-500/30 to-pink-500/30 blur-xl opacity-80 group-hover:opacity-100 animate-pulse -z-10" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-3xl glass-panel-gold border-2 border-amber-400/50 p-8 sm:p-14 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Shimmer starlight rays */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/30 text-amber-300 text-xs font-cinzel uppercase tracking-[0.25em] mb-8">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>A Forever Truth</span>
            </div>

            {/* Grand finale quote: "Happy Birthday, [NAME] ❤️" */}
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-serif-luxury font-light text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-300 tracking-wide mb-6 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]">
              Happy Birthday, {recipientName} ❤️
            </h3>

            {/* "The world became a little more beautiful on the day you were born." */}
            <p className="text-xl sm:text-3xl font-serif-luxury italic text-amber-200/90 leading-relaxed max-w-2xl mx-auto mb-8 text-glow-gold">
              "The world became a little more beautiful on the day you were born."
            </p>

            {/* Extended message body */}
            <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-amber-400/20 max-w-xl mx-auto mb-10 shadow-inner">
              <p className="text-base sm:text-lg font-serif-luxury text-slate-300 italic leading-relaxed">
                {finalSurprise.body}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-amber-400/20">
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-full glass-panel border border-amber-400/30 text-xs font-cinzel text-amber-200 hover:text-white hover:border-amber-300 uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Experience Again</span>
              </button>

              <button
                onClick={() => {
                  sounds.playCelebrationChord();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-xs font-cinzel text-amber-300 uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Return to Stars</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Website Footer signature */}
      <div className="mt-20 text-center text-xs font-cinzel tracking-[0.25em] text-slate-500 uppercase">
        Created exclusively for {recipientName} • Handcrafted with love & starlight
      </div>
    </section>
  );
}
