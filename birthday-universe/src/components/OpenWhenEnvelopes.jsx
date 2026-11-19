import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Heart, Smile, Frown, Sparkles, Users, Flame, X, Check, Eye } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const iconMap = {
  Heart: Heart,
  Frown: Frown,
  Smile: Smile,
  Sparkles: Sparkles,
  Users: Users,
  Flame: Flame,
  Mail: Mail,
};

export default function OpenWhenEnvelopes({ letters, recipientName, authorName, progress, onUpdateProgress }) {
  const [activeLetter, setActiveLetter] = useState(null);
  const openedIds = progress.openedEnvelopes || [];

  const handleOpenEnvelope = (letter) => {
    sounds.playEnvelopeOpen();
    setActiveLetter(letter);

    if (!openedIds.includes(letter.id)) {
      const updated = [...openedIds, letter.id];
      onUpdateProgress({ ...progress, openedEnvelopes: updated });
    }
  };

  return (
    <section id="open-when" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-rose-950/20 blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Special Envelopes</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-4"
        >
          Open When... 💌
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-rose-200/80 font-serif-luxury italic"
        >
          Seven sealed letters written for specific moments when you need my words the most.
          <br className="hidden sm:inline" /> Tap any envelope to break the seal.
        </motion.p>
      </div>

      {/* 7 Envelopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 w-full max-w-5xl relative z-10">
        {letters.map((letter, index) => {
          const isOpened = openedIds.includes(letter.id);
          const Icon = iconMap[letter.icon] || Heart;

          return (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleOpenEnvelope(letter)}
              className="cursor-pointer"
            >
              <div
                className={`relative rounded-3xl p-6 glass-panel-love border transition-all duration-500 overflow-hidden ${
                  isOpened
                    ? 'border-rose-400/50 shadow-[0_10px_25px_rgba(244,63,94,0.2)] bg-rose-950/30'
                    : 'border-rose-500/25 hover:border-rose-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                }`}
              >
                {/* Envelope Flap Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500/40 via-pink-400/40 to-rose-500/40" />

                {/* Status indicator */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-cinzel tracking-widest text-rose-300/60 uppercase">
                    Letter 0{index + 1}
                  </span>
                  {isOpened ? (
                    <span className="flex items-center gap-1 text-[10px] font-cinzel text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-400/30">
                      <Check className="w-3 h-3 text-rose-400" /> Read
                    </span>
                  ) : (
                    <span className="text-[10px] font-cinzel text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-400/30 animate-pulse">
                      Sealed with love 💌
                    </span>
                  )}
                </div>

                {/* Wax Seal Icon */}
                <div className="flex items-center justify-center my-3">
                  <div className="w-13 h-13 rounded-full bg-rose-900/40 border border-rose-400/50 flex items-center justify-center glow-rose group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-rose-300 fill-rose-500/30" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-serif-luxury font-bold text-rose-100 text-center mb-4">
                  {letter.title}
                </h3>

                {/* Action prompt */}
                <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-rose-950 text-xs font-cinzel text-rose-300/80 uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isOpened ? 'Read Again' : 'Unfold Letter'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Unfolded Letter Modal */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 25 }}
              className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-3xl p-7 sm:p-10 glass-panel-love border-2 border-rose-400/50 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-rose-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveLetter(null)}
                className="absolute top-5 right-5 p-2 rounded-full glass-panel text-rose-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-cinzel text-rose-400 tracking-widest uppercase mb-3">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>Written by {authorName} for {recipientName}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-rose-100 mb-6 pb-3 border-b border-rose-500/20">
                {activeLetter.title}
              </h3>

              <div className="p-6 rounded-2xl bg-[#12040c]/90 border border-rose-500/30 shadow-inner">
                <p className="text-base sm:text-lg font-handwriting text-rose-100 leading-relaxed sm:leading-loose whitespace-pre-line">
                  {activeLetter.content}
                </p>

                <div className="mt-8 text-right font-script text-2xl text-rose-300">
                  Always here for you, {authorName} ❤️
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveLetter(null)}
                  className="px-6 py-2 rounded-full glass-panel border border-rose-400/30 text-xs font-cinzel text-rose-200 uppercase tracking-widest hover:border-rose-300 transition-colors"
                >
                  Close & Keep Close to Heart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
