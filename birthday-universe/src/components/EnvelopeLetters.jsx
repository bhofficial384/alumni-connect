import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, Heart, Moon, Sun, Star, X, Check, Eye } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const iconMap = {
  Heart: Heart,
  Sparkles: Sparkles,
  Moon: Moon,
  Sun: Sun,
  Star: Star,
};

export default function EnvelopeLetters({ letters, progress, onUpdateProgress, recipientName }) {
  const [activeLetter, setActiveLetter] = useState(null);

  const openedIds = progress.openedLetters || [];

  const handleOpenEnvelope = (letter) => {
    sounds.playEnvelopeOpen();
    setActiveLetter(letter);

    if (!openedIds.includes(letter.id)) {
      const updated = [...openedIds, letter.id];
      onUpdateProgress({ ...progress, openedLetters: updated });
    }
  };

  const handleClose = () => {
    setActiveLetter(null);
  };

  return (
    <section id="letters" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Background Nebula Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-purple-950/20 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/25 text-amber-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Section 02 // Unspoken Words</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 font-light mb-4"
        >
          Things I Never Say Enough
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-slate-300 font-serif-luxury italic"
        >
          Five sealed letters, penned from the quietest corners of my thoughts.
          <br className="hidden sm:inline" /> Tap an envelope to break the celestial seal.
        </motion.p>
      </div>

      {/* Envelopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl relative z-10">
        {letters.map((letter, index) => {
          const isOpened = openedIds.includes(letter.id);
          const Icon = iconMap[letter.sealIcon] || Heart;

          return (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="cursor-pointer"
              onClick={() => handleOpenEnvelope(letter)}
            >
              <div
                className={`relative group rounded-3xl p-6 sm:p-7 glass-panel-gold border transition-all duration-500 overflow-hidden ${
                  isOpened
                    ? 'border-amber-400/40 shadow-[0_10px_30px_rgba(251,191,36,0.15)] bg-slate-900/60'
                    : 'border-amber-400/20 hover:border-amber-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(251,191,36,0.25)]'
                }`}
              >
                {/* Envelope Flap visual decoration */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400/30 via-purple-400/30 to-amber-400/30" />

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-cinzel tracking-widest text-slate-400 uppercase">
                    Letter {index + 1} of {letters.length}
                  </span>
                  {isOpened ? (
                    <span className="flex items-center gap-1 text-[11px] font-cinzel text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      <Check className="w-3 h-3" /> Read
                    </span>
                  ) : (
                    <span className="text-[11px] font-cinzel text-purple-300 bg-purple-400/10 px-2.5 py-0.5 rounded-full border border-purple-400/30 animate-pulse">
                      Sealed ✨
                    </span>
                  )}
                </div>

                {/* Wax / Celestial Seal */}
                <div className="flex items-center justify-center my-4">
                  <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500/30 via-purple-900/40 to-slate-900 border-2 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:scale-110 group-hover:border-amber-300 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-amber-200" />
                    <div className="absolute inset-0 rounded-full border border-amber-300/30 animate-spin [animation-duration:15s]" />
                  </div>
                </div>

                {/* Letter Title */}
                <h3 className="text-lg sm:text-xl font-cinzel font-medium text-amber-100 text-center mb-2 group-hover:text-amber-200 transition-colors">
                  "{letter.title}"
                </h3>

                <p className="text-xs text-center text-slate-400 font-serif-luxury italic mb-5 line-clamp-1">
                  {letter.subtitle}
                </p>

                {/* Open Action Indicator */}
                <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-800 text-xs font-cinzel text-amber-300/80 group-hover:text-amber-200 uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isOpened ? 'Read Again' : 'Unfold Letter'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Letter Reading Modal / Animated Envelope Unfold */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl rounded-3xl p-7 sm:p-10 glass-panel-gold border-2 border-amber-400/40 shadow-[0_30px_70px_rgba(0,0,0,0.95)] text-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full glass-panel text-slate-400 hover:text-amber-300 transition-colors"
                aria-label="Close letter"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative Header Stamp */}
              <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 tracking-widest uppercase mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Cosmic Postmark // For {recipientName}</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-amber-100 mb-6 pb-3 border-b border-amber-400/20">
                {activeLetter.title}
              </h3>

              {/* Letter Parchment Body */}
              <div className="relative p-6 sm:p-8 rounded-2xl bg-[#0b0c1e]/90 border border-amber-400/20 shadow-inner">
                <p className="text-lg sm:text-xl font-handwriting text-amber-100/95 leading-relaxed sm:leading-loose">
                  {activeLetter.content}
                </p>

                {/* Signature at bottom */}
                <div className="mt-8 text-right font-script text-2xl text-amber-300/90">
                  With all my warmth & love, always.
                </div>
              </div>

              {/* Footer action */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full glass-panel border border-amber-400/30 text-xs font-cinzel text-amber-200 hover:text-amber-100 hover:border-amber-300 uppercase tracking-widest transition-all"
                >
                  Fold & Store Letter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
