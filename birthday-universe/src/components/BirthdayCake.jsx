import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cake as CakeIcon, Heart, Wind, Check, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function BirthdayCake({ recipientName, cakeData, progress, onUpdateProgress }) {
  const [candlesLit, setCandlesLit] = useState(!progress.candlesBlown);
  const [wishInput, setWishInput] = useState(progress.userWish || '');
  const [wishSent, setWishSent] = useState(!!progress.userWish);

  // Sync state when progress is reset
  useEffect(() => {
    setCandlesLit(!progress.candlesBlown);
    setWishInput(progress.userWish || '');
    setWishSent(!!progress.userWish);
  }, [progress.candlesBlown, progress.userWish]);

  const handleMakeWish = () => {
    if (!candlesLit) return;

    sounds.playBlowCandle();
    setCandlesLit(false);
    onUpdateProgress({ ...progress, candlesBlown: true });

    // Grand explosion of hearts, pink, and golden confetti
    const count = 220;
    const defaults = { origin: { y: 0.7 }, disableForReducedMotion: true };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#f43f5e', '#fb7185', '#ffe4e6', '#fbbf24'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#f43f5e', '#e11d48', '#fda4af'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.9,
      colors: ['#f43f5e', '#fef08a', '#ffffff'],
    });
    fire(0.2, {
      spread: 120,
      startVelocity: 35,
      decay: 0.92,
      scalar: 1.3,
      colors: ['#fb7185', '#fbbf24', '#ffffff'],
    });
  };

  const handleRelight = () => {
    sounds.playChime(1.3);
    setCandlesLit(true);
    onUpdateProgress({ ...progress, candlesBlown: false });
  };

  const handleSendWish = (e) => {
    e.preventDefault();
    if (!wishInput.trim()) return;

    sounds.playCelebrationChord();
    setWishSent(true);
    onUpdateProgress({ ...progress, userWish: wishInput });

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fbbf24', '#ffffff'],
    });
  };

  return (
    <section id="cake" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
      {/* Background radial glow */}
      <div className={`absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 ${
        !candlesLit ? 'bg-pink-600/25' : 'bg-rose-950/20'
      }`} />

      {/* Header */}
      <div className="text-center max-w-2xl mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <CakeIcon className="w-3.5 h-3.5" />
          <span>A Wish For My Girl</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-4 whitespace-pre-line"
        >
          {cakeData.prompt}
        </motion.h2>
      </div>

      {/* 3D-inspired Romantic Birthday Cake */}
      <div className="relative flex flex-col items-center justify-center my-6 select-none">
        {/* Glow under cake plate */}
        <div className="absolute -bottom-6 w-72 sm:w-80 h-16 bg-rose-500/20 blur-xl rounded-full" />

        {/* Candles Group */}
        <div className="flex items-end justify-center gap-6 sm:gap-8 mb-[-4px] z-20">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="flex flex-col items-center cursor-pointer group"
              onClick={handleMakeWish}
              title={candlesLit ? 'Click to blow candle' : 'Candle blown'}
            >
              {/* Flame */}
              <AnimatePresence>
                {candlesLit ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.15, 0.95, 1.05] }}
                    exit={{
                      scale: 0,
                      y: -25,
                      opacity: 0,
                      filter: 'blur(6px)',
                      transition: { duration: 0.5 },
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4 + idx * 0.2,
                      ease: 'easeInOut',
                    }}
                    className="relative w-4 h-8 sm:w-5 sm:h-10 mb-1 flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 animate-flicker shadow-[0_0_15px_#f59e0b,0_0_25px_#fbbf24]" />
                    <div className="absolute bottom-1 w-2 h-2 rounded-full bg-blue-300/80 blur-[1px]" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0.8, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -40, scale: 1.8 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="w-4 h-6 mb-1 rounded-full bg-rose-300/30 blur-sm pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* Wick */}
              <div className="w-0.5 h-2.5 bg-neutral-800" />

              {/* Candle Body */}
              <div className="w-3 sm:w-3.5 h-14 sm:h-16 rounded-t-sm bg-gradient-to-r from-rose-100 via-rose-200 to-pink-200 shadow-md border-x border-rose-300/40 relative overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#e11d48_4px,#e11d48_8px)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Tier 1 (Top Tier) */}
        <div className="relative w-44 sm:w-52 h-16 sm:h-20 rounded-t-2xl bg-gradient-to-r from-[#4c0519] via-[#881337] to-[#4c0519] border-t-2 border-x-2 border-rose-400/50 shadow-lg flex items-center justify-center overflow-hidden z-10">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-rose-300/30 to-transparent" />
          <div className="flex gap-2.5 sm:gap-3 absolute top-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-200 glow-rose" />
            ))}
          </div>
          <span className="font-serif-luxury text-sm text-rose-100 font-bold tracking-wider">
            {recipientName} ❤️
          </span>
        </div>

        {/* Tier 2 (Middle Tier) */}
        <div className="relative w-60 sm:w-72 h-20 sm:h-24 rounded-t-2xl bg-gradient-to-r from-[#3b071a] via-[#4c0519] to-[#3b071a] border-t-2 border-x-2 border-rose-400/40 shadow-xl flex items-center justify-center overflow-hidden">
          <div className="flex items-center gap-2 text-rose-300/90 font-handwriting text-xl">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>My Favorite Person</span>
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <div className="flex gap-3 absolute top-1">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-200/80" />
            ))}
          </div>
        </div>

        {/* Tier 3 (Base Plate) */}
        <div className="relative w-76 sm:w-92 h-6 rounded-b-3xl bg-gradient-to-r from-rose-700/40 via-pink-600/40 to-rose-700/40 border-2 border-rose-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-md" />
      </div>

      {/* Button / Wishes Reveal */}
      <div className="mt-10 flex flex-col items-center">
        {candlesLit ? (
          <motion.button
            onClick={handleMakeWish}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="group px-9 py-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-cinzel font-semibold tracking-[0.2em] uppercase text-sm sm:text-base shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:shadow-[0_0_45px_rgba(244,63,94,0.85)] border border-rose-300/50 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Heart className="w-5 h-5 text-rose-200 fill-rose-200 group-hover:scale-125 transition-transform" />
            <span>{cakeData.buttonText}</span>
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center p-8 sm:p-10 rounded-3xl glass-panel-love border-2 border-rose-400/50 max-w-xl shadow-[0_0_40px_rgba(244,63,94,0.4)]"
            >
              <div className="w-12 h-12 rounded-full bg-rose-600/30 border border-rose-400 flex items-center justify-center mx-auto mb-4 glow-rose">
                <Sparkles className="w-6 h-6 text-rose-300" />
              </div>

              {cakeData.reveal.map((line, i) => (
                <p
                  key={i}
                  className={`font-serif-luxury leading-relaxed my-2.5 ${
                    i === cakeData.reveal.length - 1
                      ? 'text-lg sm:text-2xl text-rose-300 font-bold font-handwriting'
                      : i === cakeData.reveal.length - 2
                      ? 'text-sm sm:text-base text-rose-400/80 italic mt-4'
                      : 'text-base sm:text-xl text-rose-100 italic'
                  }`}
                >
                  "{line}"
                </p>
              ))}
            </motion.div>

            <button
              onClick={handleRelight}
              className="text-xs font-cinzel text-rose-400/70 hover:text-rose-200 tracking-wider uppercase underline underline-offset-4 cursor-pointer mt-2"
            >
              Relight Candles
            </button>
          </div>
        )}
      </div>

      {/* Secret Birthday Wish Input */}
      <AnimatePresence>
        {!candlesLit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md mt-8 p-6 rounded-3xl glass-panel-love border border-rose-400/25 shadow-xl"
          >
            {wishSent ? (
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-2 text-rose-300 text-sm font-cinzel mb-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Your Wish Is Sealed in My Heart</span>
                </div>
                <p className="text-sm text-rose-200/80 font-handwriting italic">
                  "{wishInput}"
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendWish} className="flex flex-col gap-3">
                <label className="text-xs font-cinzel text-rose-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Send your secret birthday wish to Saurabh:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wishInput}
                    onChange={(e) => setWishInput(e.target.value)}
                    placeholder="Type your secret wish here..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-black/60 border border-rose-500/40 focus:border-rose-400 text-xs text-rose-100 placeholder:text-rose-400/40 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/50 text-rose-200 text-xs font-cinzel uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
