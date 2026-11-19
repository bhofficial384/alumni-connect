import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MailOpen } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function SecretGiftEntrance({ onOpenSurprise, recipientName, authorName, scene1Data }) {
  const [textStep, setTextStep] = useState(0);
  const [envelopeOpening, setEnvelopeOpening] = useState(false);
  const [showWelcomeNote, setShowWelcomeNote] = useState(false);

  // Progressive text lines sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setTextStep(1), 800);  // "Hey Anju... ❤️"
    const timer2 = setTimeout(() => setTextStep(2), 2400); // "Today is your special day."
    const timer3 = setTimeout(() => setTextStep(3), 4200); // "But I have something for you..."
    const timer4 = setTimeout(() => setTextStep(4), 6000); // "Something that I made with all my heart."
    const timer5 = setTimeout(() => setTextStep(5), 7800); // Envelope appears!

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  const handleOpenEnvelope = () => {
    sounds.init();
    sounds.playEnvelopeOpen();
    sounds.playCelebrationChord();
    setEnvelopeOpening(true);

    setTimeout(() => {
      setShowWelcomeNote(true);
    }, 700);

    setTimeout(() => {
      onOpenSurprise();
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050209] px-6 text-center select-none overflow-hidden">
      {/* Background radial rose glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-rose-950/20 blur-[130px] pointer-events-none -top-10 -left-10" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-900/15 blur-[120px] pointer-events-none -bottom-10 -right-10" />

      {/* Center glowing heart pulsing */}
      <motion.div
        className="mb-8 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: 1,
          scale: [1, 1.12, 1],
        }}
        transition={{
          opacity: { duration: 1.5 },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="relative p-4 rounded-full bg-rose-950/40 border border-rose-500/30 glow-heart shadow-[0_0_35px_rgba(244,63,94,0.45)]">
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 fill-rose-500" />
        </div>
      </motion.div>

      {/* Progressive Text sequence */}
      <div className="max-w-xl min-h-[140px] flex flex-col items-center justify-center space-y-2.5">
        {textStep >= 1 && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-serif-luxury text-rose-200"
          >
            "Hey {recipientName}... ❤️"
          </motion.h2>
        )}

        {textStep >= 2 && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-lg sm:text-2xl font-serif-luxury italic text-rose-100/90"
          >
            "Today is your special day."
          </motion.p>
        )}

        {textStep >= 3 && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base sm:text-xl font-serif-luxury text-rose-300/90"
          >
            "But I have something for you..."
          </motion.p>
        )}

        {textStep >= 4 && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-base sm:text-xl font-handwriting text-rose-200 text-glow-rose"
          >
            "Something that I made with all my heart."
          </motion.p>
        )}
      </div>

      {/* Animated Envelope (Step 5) */}
      <AnimatePresence>
        {textStep >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mt-8 flex flex-col items-center"
          >
            {!showWelcomeNote ? (
              <div className="relative group p-6 sm:p-8 rounded-3xl glass-panel-love border-2 border-rose-500/40 shadow-[0_15px_45px_rgba(225,29,72,0.3)] max-w-sm flex flex-col items-center">
                {/* Envelope Wax Seal / Header */}
                <div className="w-12 h-12 rounded-full bg-rose-600/30 border border-rose-400/50 flex items-center justify-center mb-4 glow-rose">
                  <Heart className="w-5 h-5 text-rose-300 fill-rose-400 animate-pulse" />
                </div>

                {/* Tag */}
                <div className="font-handwriting text-2xl sm:text-3xl text-rose-100 mb-1 leading-snug">
                  To My {recipientName} 💗
                </div>
                <div className="font-script text-xl sm:text-2xl text-rose-300/90 mb-6">
                  From {authorName}
                </div>

                {/* Open Button */}
                <motion.button
                  onClick={handleOpenEnvelope}
                  disabled={envelopeOpening}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-cinzel text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:shadow-[0_0_35px_rgba(244,63,94,0.8)] border border-rose-300/40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MailOpen className="w-4 h-4" />
                  <span>{envelopeOpening ? 'Unfolding Love...' : 'Open Your Surprise 💌'}</span>
                </motion.button>
              </div>
            ) : (
              /* Revealed Note */
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="p-8 rounded-3xl glass-panel-love border border-rose-400/50 max-w-md shadow-[0_0_50px_rgba(244,63,94,0.5)]"
              >
                <Sparkles className="w-6 h-6 text-rose-300 mx-auto mb-3 animate-spin [animation-duration:10s]" />
                <p className="text-xl sm:text-2xl font-serif-luxury italic text-rose-100 leading-relaxed">
                  "Welcome to a little world...
                  <br />
                  that I created just for you."
                </p>
                <div className="mt-4 font-script text-2xl text-rose-300">
                  With all my love, {authorName} ❤️
                </div>
              </motion.div>
            )}

            {/* Skip animation button */}
            {!showWelcomeNote && (
              <button
                onClick={handleOpenEnvelope}
                className="mt-6 text-[11px] font-cinzel text-rose-400/60 hover:text-rose-300 uppercase tracking-widest underline underline-offset-4 cursor-pointer"
              >
                Skip directly to surprise →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
