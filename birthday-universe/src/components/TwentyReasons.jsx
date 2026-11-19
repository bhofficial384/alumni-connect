import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, CheckCircle2, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function TwentyReasons({ reasons, recipientName, progress, onUpdateProgress }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [justReset, setJustReset] = useState(false);
  const unlocked = progress?.unlockedReasons || [];

  const handleHeartClick = (index) => {
    sounds.playChime(1.1 + (index % 5) * 0.1);
    setSelectedReason({ index, text: reasons[index] });

    if (!unlocked.includes(index)) {
      const updated = [...unlocked, index];
      onUpdateProgress({ ...progress, unlockedReasons: updated });

      if (updated.length === 20) {
        sounds.playCelebrationChord();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fb7185', '#ffe4e6', '#fbbf24'],
        });
      }
    }
  };

  const handleUnlockAll = () => {
    sounds.playCelebrationChord();
    const all = Array.from({ length: 20 }, (_, i) => i);
    onUpdateProgress({ ...progress, unlockedReasons: all });
  };

  const handleResetReasons = () => {
    sounds.playChime(1.1);
    onUpdateProgress({ ...progress, unlockedReasons: [] });
    setJustReset(true);
    setTimeout(() => setJustReset(false), 1800);
  };

  return (
    <section id="reasons" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-pink-950/20 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>My Confession of Love</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-4"
        >
          20 Reasons Why I Love {recipientName} ❤️
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-rose-200/80 font-serif-luxury italic"
        >
          There are a million reasons, but here are twenty that make my heart skip a beat.
          <br className="hidden sm:inline" /> Tap each glowing heart to reveal what I cherish about you.
        </motion.p>

        {/* Progress meter & Control buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel-love border border-rose-400/30 text-xs font-cinzel text-rose-200">
            <span>Reasons Unlocked:</span>
            <span className="font-bold text-rose-400">{unlocked.length} / 20</span>
            <div className="w-20 h-1.5 bg-rose-950/80 rounded-full overflow-hidden border border-rose-500/30">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-500 rounded-full"
                style={{ width: `${(unlocked.length / 20) * 100}%` }}
              />
            </div>
          </div>

          {unlocked.length < 20 ? (
            <button
              onClick={handleUnlockAll}
              className="px-3.5 py-1.5 rounded-full text-xs font-cinzel text-rose-200 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-400/40 uppercase tracking-wider cursor-pointer transition-all"
            >
              Reveal All
            </button>
          ) : null}

          {/* Direct Reset Reasons Button */}
          {unlocked.length > 0 && (
            <button
              onClick={handleResetReasons}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-cinzel text-rose-300 hover:text-white bg-black/40 hover:bg-rose-950/60 border border-rose-500/30 hover:border-rose-400/60 uppercase tracking-wider cursor-pointer transition-all shadow-sm"
              title="Lock all hearts again to rediscover them"
            >
              <RotateCcw className="w-3 h-3 text-rose-400" />
              <span>{justReset ? 'Reset Complete! ✨' : 'Reset Reasons'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 20 Glowing Hearts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 sm:gap-5 w-full relative z-10">
        {reasons.map((reasonText, idx) => {
          const isUnlocked = unlocked.includes(idx);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleHeartClick(idx)}
              className="cursor-pointer"
            >
              <div
                className={`relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all duration-500 min-h-[130px] sm:min-h-[150px] border ${
                  isUnlocked
                    ? 'bg-rose-950/40 border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    : 'glass-panel-love border-rose-500/20 hover:border-rose-400/40 hover:bg-rose-950/20'
                }`}
              >
                {/* Heart Number Badge */}
                <span className="absolute top-2.5 left-3 text-[10px] font-cinzel text-rose-400/70 uppercase">
                  #{idx + 1}
                </span>

                {/* Heart Icon */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2.5 transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-rose-600/30 text-rose-400 glow-rose'
                      : 'bg-black/40 text-rose-400/40'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      isUnlocked ? 'fill-rose-500 text-rose-400 animate-pulse' : ''
                    }`}
                  />
                </div>

                {/* Text preview or Tap prompt */}
                {isUnlocked ? (
                  <p className="text-[11px] sm:text-xs font-serif-luxury text-rose-100 line-clamp-2 leading-tight">
                    "{reasonText}"
                  </p>
                ) : (
                  <span className="text-[10px] font-cinzel text-rose-300/60 uppercase tracking-widest">
                    Tap to open
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal / Expanded Reason Card */}
      <AnimatePresence>
        {selectedReason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedReason(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl p-8 sm:p-10 glass-panel-love border-2 border-rose-400/60 text-center shadow-[0_0_60px_rgba(244,63,94,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedReason(null)}
                className="absolute top-5 right-5 p-2 rounded-full glass-panel text-rose-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-rose-600/30 border border-rose-400/50 flex items-center justify-center mx-auto mb-4 glow-rose">
                <Heart className="w-8 h-8 text-rose-400 fill-rose-500 animate-bounce" />
              </div>

              <div className="text-xs font-cinzel text-rose-300 tracking-widest uppercase mb-2">
                Reason #{selectedReason.index + 1} Why I Love You
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-rose-100 my-4 leading-relaxed">
                "{selectedReason.text}"
              </h3>

              <div className="mt-6 font-script text-2xl text-rose-300">
                Forever yours, Saurabh ❤️
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
