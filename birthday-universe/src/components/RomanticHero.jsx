import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Clock, ChevronDown, Lock, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function RomanticHero({ recipientName, authorName, heroData, startDate, easterEggNote }) {
  const [heartClicks, setHeartClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate live relationship counter
  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate || '2024-01-01').getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  // Handle Easter egg clicks (7 clicks)
  const handleHeartClick = () => {
    sounds.playChime(1.1 + heartClicks * 0.1);
    const nextClicks = heartClicks + 1;
    setHeartClicks(nextClicks);

    if (nextClicks >= 7 && !showEasterEgg) {
      sounds.playCelebrationChord();
      setShowEasterEgg(true);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#ffe4e6', '#fbbf24'],
      });
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-900/15 via-pink-900/10 to-amber-900/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Love Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs sm:text-sm font-cinzel uppercase tracking-[0.25em] mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        >
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>A Love Story by {authorName}</span>
          <Sparkles className="w-4 h-4 text-rose-400" />
        </motion.div>

        {/* Hero Title: HAPPY BIRTHDAY, MY ANJU ❤️ */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-8xl font-serif-luxury font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-rose-300 drop-shadow-[0_0_35px_rgba(244,63,94,0.5)] mb-6 leading-tight whitespace-pre-line"
        >
          {heroData.title}
        </motion.h1>

        {/* Glowing Interactive Heart (Easter Egg Trigger) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="relative my-4 group cursor-pointer"
          onClick={handleHeartClick}
          title="Click to share love (hint: tap 7 times for a secret)"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-950/60 border-2 border-rose-500/50 flex items-center justify-center glow-heart group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(225,29,72,0.6)]">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          {heartClicks > 0 && heartClicks < 7 && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-cinzel text-rose-400 whitespace-nowrap">
              {7 - heartClicks} more taps...
            </div>
          )}
        </motion.div>

        {/* Poetic quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="max-w-2xl mx-auto my-6 p-6 sm:p-8 rounded-3xl glass-panel-love border border-rose-400/25 shadow-xl"
        >
          <p className="text-lg sm:text-2xl font-serif-luxury italic text-rose-100/95 leading-relaxed whitespace-pre-line">
            "{heroData.quote}"
          </p>
        </motion.div>

        {/* Relationship Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mb-10 inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-3 rounded-2xl glass-panel border border-rose-400/20 text-xs sm:text-sm font-cinzel text-rose-200"
        >
          <div className="flex items-center gap-2 text-rose-300">
            <Clock className="w-4 h-4" />
            <span>Cherishing Anju For:</span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-rose-100">
            <span><strong className="text-rose-400 text-base">{timeTogether.days}</strong> Days</span>
            <span>•</span>
            <span><strong className="text-rose-400 text-base">{timeTogether.hours}</strong> Hrs</span>
            <span>•</span>
            <span><strong className="text-rose-400 text-base">{timeTogether.minutes}</strong> Mins</span>
            <span>•</span>
            <span><strong className="text-rose-400 text-base">{timeTogether.seconds}</strong> Secs</span>
          </div>
        </motion.div>

        {/* Action Buttons: Explore Our Little World & Read What My Heart Says */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => scrollToSection('story')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-cinzel font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:shadow-[0_0_40px_rgba(244,63,94,0.8)] border border-rose-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-rose-200" />
            <span>{heroData.btnExplore}</span>
          </button>

          <button
            onClick={() => scrollToSection('letter')}
            className="px-8 py-4 rounded-full glass-panel-love border border-rose-400/40 text-rose-200 font-cinzel font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-rose-500/10 hover:border-rose-300 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>{heroData.btnLetter}</span>
          </button>
        </motion.div>

        {/* Scroll Cue */}
        <motion.button
          onClick={() => scrollToSection('story')}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="mt-14 text-xs font-cinzel text-rose-300/60 hover:text-rose-200 uppercase tracking-widest flex flex-col items-center gap-1 cursor-pointer"
        >
          <span>Scroll to uncover our love story</span>
          <ChevronDown className="w-4 h-4 text-rose-400" />
        </motion.button>
      </div>

      {/* Secret Easter Egg Modal */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setShowEasterEgg(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="p-8 rounded-3xl glass-panel-love border-2 border-rose-400/60 max-w-lg text-center shadow-[0_0_60px_rgba(244,63,94,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-600/30 border border-rose-400 flex items-center justify-center mx-auto mb-4 glow-rose">
                <Heart className="w-7 h-7 text-rose-400 fill-rose-400 animate-bounce" />
              </div>

              <h3 className="text-2xl font-serif-luxury font-bold text-rose-100 mb-3">
                Secret Love Note Unlocked 🔐
              </h3>

              <p className="text-base sm:text-lg font-handwriting text-rose-200 leading-relaxed mb-6 whitespace-pre-line">
                "{easterEggNote}"
              </p>

              <button
                onClick={() => setShowEasterEgg(false)}
                className="px-6 py-2 rounded-full bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/50 text-xs font-cinzel text-rose-200 uppercase tracking-widest transition-all"
              >
                Keep In My Heart ❤️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
