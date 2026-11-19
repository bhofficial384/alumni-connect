import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Compass, Heart, Shield, Smile, Flame, Star, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const iconMap = {
  Sun: Sun,
  Compass: Compass,
  Heart: Heart,
  Shield: Shield,
  Smile: Smile,
  Flame: Flame,
};

export default function FutureConstellation({ wishes, progress, onUpdateProgress, recipientName }) {
  const [activeWish, setActiveWish] = useState(null);

  const revealedIds = progress.wishesRevealed || [];

  const handleWishClick = (wishItem) => {
    sounds.playChime(1.25);
    setActiveWish(wishItem);

    if (!revealedIds.includes(wishItem.id)) {
      const updated = [...revealedIds, wishItem.id];
      onUpdateProgress({ ...progress, wishesRevealed: updated });
    }
  };

  return (
    <section id="future" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Background Starlight Nebula */}
      <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-blue-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-purple-900/15 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/25 text-amber-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Section 05 // Future Constellation</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 font-light mb-4"
        >
          Things I Hope Life Gives You
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-slate-300 font-serif-luxury italic"
        >
          Six guiding stars cast into your future sky.
          <br className="hidden sm:inline" /> Click each star to unveil a cosmic blessing for the journey ahead.
        </motion.p>

        {/* Revealed Counter */}
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-cinzel text-amber-300/80">
          <span>Blessings Unlocked: {revealedIds.length} of {wishes.length}</span>
        </div>
      </div>

      {/* Interactive Constellation Grid of Wishes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl relative z-10">
        {wishes.map((item, index) => {
          const isRevealed = revealedIds.includes(item.id);
          const isSelected = activeWish?.id === item.id;
          const Icon = iconMap[item.icon] || Star;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleWishClick(item)}
            >
              <div
                className={`relative rounded-3xl p-7 glass-panel-gold border transition-all duration-500 overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.35)] bg-slate-900/80'
                    : isRevealed
                    ? 'border-amber-400/40 shadow-[0_10px_25px_rgba(0,0,0,0.6)]'
                    : 'border-slate-700/60 hover:border-amber-400/40 opacity-90'
                }`}
              >
                {/* Glow badge */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300"
                    style={{
                      backgroundColor: `${item.color}15`,
                      borderColor: `${item.color}50`,
                      boxShadow: isRevealed ? `0 0 20px ${item.color}30` : 'none',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>

                  {isRevealed ? (
                    <span className="flex items-center gap-1 text-[11px] font-cinzel text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      <Check className="w-3 h-3 text-amber-400" /> Revealed
                    </span>
                  ) : (
                    <span className="text-[11px] font-cinzel text-slate-400 bg-slate-800/60 px-2.5 py-0.5 rounded-full border border-slate-700">
                      Click to Reveal
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-cinzel font-semibold text-amber-100 mb-2">
                  {item.title}
                </h3>

                {/* Wish Content */}
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    <motion.p
                      key="revealed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-base sm:text-lg font-serif-luxury text-slate-200 italic leading-relaxed"
                    >
                      "{item.wish}"
                    </motion.p>
                  ) : (
                    <motion.p
                      key="hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-serif-luxury text-slate-500 italic"
                    >
                      A secret blessing waits behind this star...
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Bottom starlight accent line */}
                <div
                  className="mt-6 h-0.5 w-full rounded-full transition-all duration-500"
                  style={{
                    background: isRevealed
                      ? `linear-gradient(90deg, transparent, ${item.color}, transparent)`
                      : 'rgba(255,255,255,0.05)',
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
