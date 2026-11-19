import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Calendar, Sparkles, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function MemoryConstellation({ memories, progress, onUpdateProgress, onUpdateMemoryImage }) {
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const viewedIds = progress.viewedMemories || [];

  const handleStarClick = (mem) => {
    sounds.playChime(1.1);
    setSelectedMemory(mem);

    if (!viewedIds.includes(mem.id)) {
      const updated = [...viewedIds, mem.id];
      onUpdateProgress({ ...progress, viewedMemories: updated });
    }
  };

  const closeModal = () => {
    setSelectedMemory(null);
  };

  const handlePrev = () => {
    if (!selectedMemory) return;
    const currentIndex = memories.findIndex((m) => m.id === selectedMemory.id);
    const prevIndex = (currentIndex - 1 + memories.length) % memories.length;
    handleStarClick(memories[prevIndex]);
  };

  const handleNext = () => {
    if (!selectedMemory) return;
    const currentIndex = memories.findIndex((m) => m.id === selectedMemory.id);
    const nextIndex = (currentIndex + 1) % memories.length;
    handleStarClick(memories[nextIndex]);
  };

  // Image replacement helper for the user
  const handleImageFileChange = (e, memId) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (base64 && onUpdateMemoryImage) {
          onUpdateMemoryImage(memId, base64);
          if (selectedMemory && selectedMemory.id === memId) {
            setSelectedMemory({ ...selectedMemory, image: base64 });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="memories" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Section Header */}
      <div className="text-center max-w-2xl mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/25 text-amber-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Section 01 // Celestial Archive</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 font-light mb-4"
        >
          The Universe of Memories
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-slate-300 font-serif-luxury italic"
        >
          Every moment we share is like a star etched forever into the dark sky.
          <br className="hidden sm:inline" /> Tap each glowing star to reveal the memory it holds.
        </motion.p>

        {/* Discovery Progress Meter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel-gold border border-amber-400/30 text-xs font-cinzel text-amber-200"
        >
          <span>Treasures Discovered:</span>
          <span className="font-bold text-amber-300">{viewedIds.length} / {memories.length}</span>
          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-amber-400/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-purple-400 transition-all duration-500 rounded-full"
              style={{ width: `${(viewedIds.length / memories.length) * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Constellation Star Map Container */}
      <div className="relative w-full max-w-5xl h-[480px] sm:h-[580px] rounded-3xl glass-panel-gold border border-amber-400/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {/* Constellation lines SVG connecting the stars */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(251, 191, 36, 0.4)" />
              <stop offset="50%" stopColor="rgba(192, 132, 252, 0.3)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0.4)" />
            </linearGradient>
          </defs>
          {/* Draw connecting lines between consecutive stars */}
          {memories.map((mem, i) => {
            if (i === memories.length - 1) return null;
            const next = memories[i + 1];
            return (
              <line
                key={`line-${mem.id}-${next.id}`}
                x1={`${mem.x}%`}
                y1={`${mem.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-60"
              />
            );
          })}
          {/* Loop line back from last star to second star to form a realistic constellation shape */}
          {memories.length > 2 && (
            <line
              x1={`${memories[memories.length - 1].x}%`}
              y1={`${memories[memories.length - 1].y}%`}
              x2={`${memories[1].x}%`}
              y2={`${memories[1].y}%`}
              stroke="url(#lineGrad)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              className="opacity-40"
            />
          )}
        </svg>

        {/* Ambient Nebula Glow inside the Star Map */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-400/10 blur-[90px] pointer-events-none" />

        {/* Star Nodes */}
        {memories.map((mem, index) => {
          const isViewed = viewedIds.includes(mem.id);

          return (
            <div
              key={mem.id}
              style={{ left: `${mem.x}%`, top: `${mem.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <motion.button
                onClick={() => handleStarClick(mem)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.95 }}
                className="relative group p-2 flex items-center justify-center cursor-pointer outline-none"
                aria-label={`Open memory: ${mem.title}`}
              >
                {/* Outer pulsing ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isViewed
                      ? 'border border-amber-400/50 scale-125'
                      : 'border border-amber-300/30 animate-ping opacity-30'
                  }`}
                />

                {/* Star icon / core */}
                <div
                  className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isViewed
                      ? 'bg-amber-400/20 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] border border-amber-400/60'
                      : 'bg-slate-900/80 text-amber-200/90 hover:text-amber-300 border border-amber-300/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  }`}
                >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isViewed ? 'fill-amber-400 text-amber-300' : 'fill-amber-200/40'}`} />
                </div>

                {/* Floating Star Name Label */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-cinzel transition-all duration-300 tracking-wider uppercase backdrop-blur-md ${
                      isViewed
                        ? 'text-amber-200 bg-black/60 border border-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                        : 'text-slate-300 bg-black/40 border border-slate-700/50 group-hover:border-amber-400/40 group-hover:text-amber-200'
                    }`}
                  >
                    {mem.starName}
                  </span>
                </div>
              </motion.button>
            </div>
          );
        })}

        {/* Constellation Hint watermark */}
        <div className="absolute bottom-4 left-6 pointer-events-none text-xs font-cinzel text-slate-400/60 tracking-widest uppercase">
          Tap any coordinate to unlock memory
        </div>
      </div>

      {/* Memory Card Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-gold border border-amber-400/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 p-2 rounded-full glass-panel text-slate-400 hover:text-amber-300 transition-colors z-20"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Star Badge */}
              <div className="flex items-center gap-2 text-xs font-cinzel text-amber-300 tracking-widest uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{selectedMemory.starName} // {selectedMemory.constellationGroup}</span>
              </div>

              {/* Memory Title */}
              <h3 className="text-xl sm:text-2xl font-cinzel font-semibold text-amber-100 mb-2">
                {selectedMemory.title}
              </h3>

              {/* Date */}
              {selectedMemory.date && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-5 font-cinzel">
                  <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>{selectedMemory.date}</span>
                </div>
              )}

              {/* Memory Photo */}
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 group border border-amber-400/20 shadow-inner">
                <img
                  src={selectedMemory.image}
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to high-res starry aesthetic
                    e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";
                  }}
                />

                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Replace Photo helper button */}
                <label className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-cinzel text-amber-200 glass-panel border border-amber-400/30 hover:border-amber-300 cursor-pointer transition-all shadow-lg backdrop-blur-md">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, selectedMemory.id)}
                  />
                </label>
              </div>

              {/* Caption */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-700/60 mb-6">
                <p className="text-base sm:text-lg font-serif-luxury text-slate-200 italic leading-relaxed">
                  "{selectedMemory.caption}"
                </p>
              </div>

              {/* Modal Navigation Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 text-xs font-cinzel text-slate-400 hover:text-amber-200 transition-colors uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-amber-300/80 font-cinzel">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unlocked to Memory Log</span>
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 text-xs font-cinzel text-slate-400 hover:text-amber-200 transition-colors uppercase tracking-wider"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
