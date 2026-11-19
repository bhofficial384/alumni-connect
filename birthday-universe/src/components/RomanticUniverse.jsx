import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Sparkles, X, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function RomanticUniverse({ wishes, recipientName, progress, onUpdateProgress }) {
  const [selectedStar, setSelectedStar] = useState(null);
  const revealed = progress.revealedStars || [];

  const handleStarClick = (star) => {
    sounds.playChime(1.25);
    setSelectedStar(star);

    if (!revealed.includes(star.id)) {
      const updated = [...revealed, star.id];
      onUpdateProgress({ ...progress, revealedStars: updated });
    }
  };

  // Coordinates designed to form a glowing celestial heart shape
  const heartPoints = [
    { x: 30, y: 30 }, // Top left lobe
    { x: 50, y: 40 }, // Center dip
    { x: 70, y: 30 }, // Top right lobe
    { x: 80, y: 55 }, // Right side
    { x: 50, y: 82 }, // Bottom tip
    { x: 20, y: 55 }, // Left side
  ];

  return (
    <section id="universe" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full bg-rose-950/20 blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Star Map of Wishes</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-4"
        >
          Our Little Universe 🌌
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-rose-200/80 font-serif-luxury italic"
        >
          Look closely at the stars — their constellation forms a heart for you, {recipientName}.
          <br className="hidden sm:inline" /> Tap each glowing star to reveal a wish from Saurabh.
        </motion.p>

        {/* Revealed counter */}
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-cinzel text-rose-300/80">
          <span>Wishes Discovered: {revealed.length} of {wishes.length}</span>
        </div>
      </div>

      {/* Interactive Constellation Sky Container */}
      <div className="relative w-full max-w-4xl h-[460px] sm:h-[540px] rounded-3xl glass-panel-love border border-rose-400/30 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        {/* SVG Heart Constellation Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="roseHeartLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.6)" />
              <stop offset="50%" stopColor="rgba(251, 113, 133, 0.5)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0.6)" />
            </linearGradient>
          </defs>

          {/* Heart shaped connected lines */}
          <path
            d={`M ${heartPoints[0].x * 8}% ${heartPoints[0].y * 5}%
               Q ${heartPoints[1].x * 8}% ${heartPoints[1].y * 5}%, ${heartPoints[2].x * 8}% ${heartPoints[2].y * 5}%
               L ${heartPoints[3].x * 8}% ${heartPoints[3].y * 5}%
               L ${heartPoints[4].x * 8}% ${heartPoints[4].y * 5}%
               L ${heartPoints[5].x * 8}% ${heartPoints[5].y * 5}%
               Z`}
            fill="none"
            stroke="url(#roseHeartLine)"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            className="opacity-70 animate-pulse"
          />
        </svg>

        {/* Nebula Glow inside map */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-rose-600/15 blur-[80px] pointer-events-none" />

        {/* Wish Stars positioned along heart nodes */}
        {wishes.map((star, idx) => {
          const pt = heartPoints[idx % heartPoints.length];
          const isRevealed = revealed.includes(star.id);

          return (
            <div
              key={star.id}
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <motion.button
                onClick={() => handleStarClick(star)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.95 }}
                className="relative group p-2 flex items-center justify-center cursor-pointer outline-none"
              >
                {/* Pulsing ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isRevealed
                      ? 'border border-rose-400/60 scale-125'
                      : 'border border-pink-400/40 animate-ping opacity-40'
                  }`}
                />

                {/* Star icon */}
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRevealed
                      ? 'bg-rose-600/40 text-rose-200 border border-rose-400 glow-rose shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                      : 'bg-black/70 text-rose-300/80 hover:text-white border border-rose-500/40'
                  }`}
                >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isRevealed ? 'fill-rose-400 text-rose-300' : 'fill-rose-300/30'}`} />
                </div>

                {/* Star Name Label */}
                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-cinzel uppercase tracking-wider backdrop-blur-md ${
                      isRevealed
                        ? 'text-rose-200 bg-black/60 border border-rose-400/40 shadow-sm'
                        : 'text-rose-400/70 bg-black/40 border border-rose-500/20'
                    }`}
                  >
                    {star.title}
                  </span>
                </div>
              </motion.button>
            </div>
          );
        })}

        <div className="absolute bottom-4 left-6 pointer-events-none text-xs font-cinzel text-rose-400/60 tracking-widest uppercase">
          Tap any star in the heart to unlock its wish
        </div>
      </div>

      {/* Wish Reveal Modal */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedStar(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl p-8 sm:p-10 glass-panel-love border-2 border-rose-400/60 text-center shadow-[0_0_60px_rgba(244,63,94,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedStar(null)}
                className="absolute top-5 right-5 p-2 rounded-full glass-panel text-rose-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-rose-600/30 border border-rose-400/50 flex items-center justify-center mx-auto mb-4 glow-rose">
                <Star className="w-7 h-7 text-rose-300 fill-rose-400 animate-pulse" />
              </div>

              <div className="text-xs font-cinzel text-rose-400 tracking-widest uppercase mb-2">
                {selectedStar.title}
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-rose-100 my-4 leading-relaxed">
                "{selectedStar.wish}"
              </h3>

              <div className="mt-6 font-script text-2xl text-rose-300">
                Amen, from Saurabh ❤️
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
