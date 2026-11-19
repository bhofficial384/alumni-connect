import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, RotateCcw, ArrowUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function TheFinalSecret({ recipientName, authorName, secretData, onRestart, onReturnToTop, progress }) {
  const [isRevealed, setIsRevealed] = useState(false);

  // Sync if progress is reset externally
  useEffect(() => {
    if (!progress?.finalSecretUnlocked) {
      setIsRevealed(false);
    }
  }, [progress?.finalSecretUnlocked]);

  const handleReveal = () => {
    sounds.playCelebrationChord();
    setIsRevealed(true);

    // Grand romantic fireworks & heart confetti shower
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 65 * (timeLeft / duration);
      confetti({
        particleCount,
        spread: 360,
        startVelocity: 35,
        ticks: 80,
        origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() * 0.5 + 0.2 },
        colors: ['#f43f5e', '#fb7185', '#ffe4e6', '#fbbf24', '#e11d48'],
      });
      confetti({
        particleCount,
        spread: 360,
        startVelocity: 35,
        ticks: 80,
        origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() * 0.5 + 0.2 },
        colors: ['#f43f5e', '#fda4af', '#fef08a', '#ffffff'],
      });
    }, 400);
  };

  const handleReplayClick = () => {
    sounds.playCelebrationChord();
    setIsRevealed(false);
    if (onRestart) {
      onRestart();
    }
  };

  const handleReturnToTopClick = () => {
    sounds.playCelebrationChord();
    setIsRevealed(false);
    if (onReturnToTop) {
      onReturnToTop();
    }
  };

  return (
    <section id="final-secret" className="relative min-h-screen py-28 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
      {/* Background Deep Romantic Glow */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-rose-950/30 via-pink-900/20 to-red-950/20 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl flex flex-col items-center">
        {!isRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-8">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>The Grand Finale</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-6">
              Before Our Little Movie Ends...
            </h2>

            <p className="text-base sm:text-xl text-rose-200/90 font-serif-luxury italic mb-12 max-w-xl">
              I have one last secret that belongs only to you and me.
            </p>

            {/* Glowing Button: Anju... One Last Surprise 🤫 */}
            <div className="relative group">
              <motion.button
                onClick={handleReveal}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 px-10 py-5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-cinzel font-semibold tracking-[0.2em] uppercase text-sm sm:text-lg shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:shadow-[0_0_60px_rgba(244,63,94,0.9)] border border-rose-300/50 transition-all cursor-pointer flex items-center gap-3"
              >
                <span>{secretData.buttonLabel}</span>
              </motion.button>

              <div className="absolute -inset-2 rounded-full bg-rose-500/30 blur-xl opacity-80 group-hover:opacity-100 animate-pulse -z-10" />
            </div>
          </motion.div>
        ) : (
          /* Grand Revealed Cinematic Universe */
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-3xl glass-panel-love border-2 border-rose-400/60 p-8 sm:p-14 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
          >
            {/* Pulsing center heart */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-950/60 border-2 border-rose-400 flex items-center justify-center mx-auto mb-8 glow-rose">
              <Heart className="w-9 h-9 sm:w-11 sm:h-11 text-rose-500 fill-rose-500 animate-bounce" />
            </div>

            {/* Poetic Declaration */}
            <div className="space-y-3 mb-10 max-w-2xl mx-auto">
              {secretData.declaration.map((line, idx) => (
                <p
                  key={idx}
                  className={`font-serif-luxury leading-relaxed ${
                    line.includes('Your Saurabh')
                      ? 'text-2xl sm:text-4xl text-rose-300 font-bold font-handwriting mt-4'
                      : 'text-lg sm:text-2xl text-rose-100 italic'
                  }`}
                >
                  "{line}"
                </p>
              ))}
            </div>

            {/* Glowing Heart Accent */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto my-8" />

            {/* Final Message Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-black/50 border border-rose-500/30 max-w-xl mx-auto mb-10 shadow-inner">
              <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-rose-100 mb-3 whitespace-pre-line leading-relaxed">
                {secretData.closingQuote}
              </p>
            </div>

            {/* Return / Replay Buttons with Automatic Full Reset */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-rose-500/20">
              <button
                onClick={handleReplayClick}
                className="flex items-center gap-2 px-6 py-3 rounded-full glass-panel border border-rose-400/40 text-xs font-cinzel text-rose-200 hover:text-white hover:border-rose-300 uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:bg-rose-500/10 active:scale-95"
                title="Reset everything and replay from the entrance envelope"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Replay Our Love Story</span>
              </button>

              <button
                onClick={handleReturnToTopClick}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/50 text-xs font-cinzel text-rose-200 uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95"
                title="Reset everything and return to the top"
              >
                <ArrowUp className="w-3.5 h-3.5 text-rose-300" />
                <span>Return to Top</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Website Footer signature */}
      <div className="mt-20 text-center text-xs font-cinzel tracking-[0.25em] text-rose-400/50 uppercase">
        Handcrafted with all my love, Saurabh • Created exclusively for Anju ❤️
      </div>
    </section>
  );
}
