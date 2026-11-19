import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Edit3, Check, RotateCcw, FastForward, Sparkles, Feather } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function HeartfeltLetter({ initialLetter, onSaveLetter, recipientName, authorName }) {
  const [letterContent, setLetterContent] = useState(initialLetter);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialLetter);
  const [fontStyle, setFontStyle] = useState('handwriting'); // default to romantic handwriting

  const typingIndexRef = useRef(0);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    setLetterContent(initialLetter);
    setEditValue(initialLetter);
  }, [initialLetter]);

  // Typewriter effect
  useEffect(() => {
    if (isEditing) return;

    setDisplayedText('');
    typingIndexRef.current = 0;
    setIsTyping(true);

    const typeNextChar = () => {
      if (typingIndexRef.current < letterContent.length) {
        setDisplayedText(letterContent.substring(0, typingIndexRef.current + 1));
        typingIndexRef.current += 1;

        if (typingIndexRef.current % 40 === 0) {
          sounds.playChime(1.3);
        }

        const char = letterContent[typingIndexRef.current - 1];
        const delay = char === '\n' ? 200 : char === '.' ? 160 : 22;
        typingTimerRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };

    typingTimerRef.current = setTimeout(typeNextChar, 350);

    return () => clearTimeout(typingTimerRef.current);
  }, [letterContent, isEditing]);

  const handleSkipTyping = () => {
    clearTimeout(typingTimerRef.current);
    setDisplayedText(letterContent);
    setIsTyping(false);
  };

  const handleRestartTyping = () => {
    clearTimeout(typingTimerRef.current);
    setDisplayedText('');
    typingIndexRef.current = 0;
    setIsTyping(true);

    const typeNextChar = () => {
      if (typingIndexRef.current < letterContent.length) {
        setDisplayedText(letterContent.substring(0, typingIndexRef.current + 1));
        typingIndexRef.current += 1;
        const char = letterContent[typingIndexRef.current - 1];
        const delay = char === '\n' ? 200 : char === '.' ? 160 : 22;
        typingTimerRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };
    typeNextChar();
  };

  const handleSaveEdit = () => {
    setLetterContent(editValue);
    onSaveLetter(editValue);
    setIsEditing(false);
    sounds.playCelebrationChord();
  };

  return (
    <section id="letter" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center">
      {/* Background Aurora */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-rose-950/20 via-pink-900/15 to-purple-950/20 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Feather className="w-3.5 h-3.5 text-rose-400" />
          <span>From My Soul to Yours</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-4"
        >
          A Letter From {authorName} to {recipientName} 💗
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-rose-200/80 font-serif-luxury italic"
        >
          Every word written here comes straight from my heart.
        </motion.p>
      </div>

      {/* Stationery Parchment Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full rounded-3xl glass-panel-love border-2 border-rose-400/40 p-6 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden"
      >
        {/* Corner rose accents */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-rose-400/40 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-rose-400/40 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-rose-400/40 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-rose-400/40 rounded-br-xl pointer-events-none" />

        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-rose-500/20">
          <div className="flex items-center gap-2 text-xs font-cinzel text-rose-300 uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Dedicated with all my love to: {recipientName}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setFontStyle(fontStyle === 'serif' ? 'handwriting' : 'serif')}
                  className="px-3 py-1 rounded-full text-xs font-cinzel text-rose-200 glass-panel border border-rose-500/30 hover:border-rose-300 transition-colors"
                >
                  {fontStyle === 'serif' ? 'Handwritten' : 'Classic Serif'}
                </button>

                {isTyping ? (
                  <button
                    onClick={handleSkipTyping}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-cinzel text-rose-300 glass-panel border border-rose-400/40 hover:bg-rose-500/10 transition-colors"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>Skip</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRestartTyping}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-cinzel text-rose-300 glass-panel border border-rose-500/30 hover:border-rose-300 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Replay</span>
                  </button>
                )}
              </>
            )}

            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-cinzel text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/80 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Letter</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-cinzel text-rose-300/90 hover:text-rose-100 glass-panel border border-rose-400/30 hover:border-rose-400/60 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Letter</span>
              </button>
            )}
          </div>
        </div>

        {/* Letter Body */}
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={12}
              className="w-full p-4 rounded-2xl bg-black/60 border border-rose-400/30 text-rose-100 font-serif-luxury text-base sm:text-lg leading-relaxed focus:border-rose-400 outline-none resize-y"
              placeholder="Edit your love letter here..."
            />
            <p className="text-xs font-cinzel text-rose-400/70">
              Your edits are automatically saved to localStorage so Anju always sees your personal words!
            </p>
          </div>
        ) : (
          <div className="min-h-[260px]">
            <p
              className={`text-lg sm:text-2xl leading-relaxed sm:leading-loose whitespace-pre-line text-rose-100/95 ${
                fontStyle === 'handwriting'
                  ? 'font-handwriting text-2xl sm:text-3xl font-semibold'
                  : 'font-serif-luxury italic'
              }`}
            >
              {displayedText}
              {isTyping && (
                <span className="inline-block w-1.5 h-5 sm:h-7 bg-rose-400 ml-1.5 animate-pulse align-middle" />
              )}
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
