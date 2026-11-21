import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Sparkles, X, Camera } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function RomanticTimeline({ timeline, progress, onUpdateProgress, onUpdateTimelineImage }) {
  const [selectedMoment, setSelectedMoment] = useState(null);
  const viewedIds = progress.viewedTimeline || [];

  const handleCardClick = (moment) => {
    sounds.playChime(1.15);
    setSelectedMoment(moment);

    if (!viewedIds.includes(moment.id)) {
      const updated = [...viewedIds, moment.id];
      onUpdateProgress({ ...progress, viewedTimeline: updated });
    }
  };

  // Simple, robust photo upload handler
  const handlePhotoUpload = (e, momentId) => {
    const file = e.target.files?.[0];
    if (!file || !momentId) return;

    sounds.playSoftChime();

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result;
      if (!src) return;

      // Simple canvas resize to keep image lightweight (~50KB)
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          if (onUpdateTimelineImage) {
            onUpdateTimelineImage(momentId, compressed);
          }
          setSelectedMoment((prev) => (prev && prev.id === momentId ? { ...prev, image: compressed } : prev));
          sounds.playCelebrationChord();
        } catch (_) {
          if (onUpdateTimelineImage) {
            onUpdateTimelineImage(momentId, src);
          }
          setSelectedMoment((prev) => (prev && prev.id === momentId ? { ...prev, image: src } : prev));
          sounds.playCelebrationChord();
        }
      };
      img.onerror = () => {
        if (onUpdateTimelineImage) {
          onUpdateTimelineImage(momentId, src);
        }
        setSelectedMoment((prev) => (prev && prev.id === momentId ? { ...prev, image: src } : prev));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <section id="story" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
      {/* Background radial aura */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-rose-950/20 blur-[120px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>Our Love Journey</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-4"
        >
          Some Beautiful Moments of Us
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-rose-200/80 font-serif-luxury italic"
        >
          A scrapbook of memories that I keep close to my heart.
          <br className="hidden sm:inline" /> Tap any memory to open or upload your special photo.
        </motion.p>
      </div>

      {/* Timeline Tree / Scrapbook */}
      <div className="relative w-full max-w-4xl">
        {/* Central glowing vertical timeline line */}
        <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-rose-500/10 via-rose-500/40 to-rose-500/10" />

        <div className="space-y-12 sm:space-y-16">
          {timeline.map((moment, index) => {
            const isEven = index % 2 === 0;
            const isViewed = viewedIds.includes(moment.id);
            const hasImage = Boolean(moment.image && moment.image.trim().length > 0);

            return (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                  isEven ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Central Heart Marker on line */}
                <div
                  onClick={() => handleCardClick(moment)}
                  className={`absolute left-4 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer z-10 ${
                    isViewed
                      ? 'bg-rose-900 border-rose-400 text-rose-200 glow-rose scale-110 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                      : 'bg-black/80 border-rose-500/40 text-rose-400 hover:border-rose-400 hover:scale-105'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isViewed ? 'fill-rose-400 text-rose-400' : ''}`} />
                </div>

                {/* Content Card */}
                <div
                  className={`w-full sm:w-[46%] pl-12 sm:pl-0 ${
                    isEven ? 'sm:text-right sm:pr-8' : 'sm:pl-8'
                  }`}
                >
                  <div className="group relative p-5 sm:p-6 rounded-3xl glass-panel-love border border-rose-400/25 hover:border-rose-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] transition-all overflow-hidden">
                    {/* Photo preview or Direct Upload Box */}
                    <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 border border-rose-400/20 group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center bg-black/40">
                      {hasImage ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={moment.image}
                            alt={moment.title}
                            className="w-full h-full object-cover cursor-pointer"
                            loading="eager"
                            onClick={() => handleCardClick(moment)}
                          />
                          <div 
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" 
                          />

                          {/* Chapter badge */}
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-cinzel uppercase bg-black/60 text-rose-300 border border-rose-400/30 backdrop-blur-md pointer-events-none">
                            {moment.memoryTag}
                          </span>

                          {/* Quick Change Native Button */}
                          <div className="absolute bottom-2 right-2 z-20 overflow-hidden rounded-full shadow-md">
                            <div className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-cinzel text-white bg-black/80 hover:bg-rose-900 border border-rose-300/40 backdrop-blur-md cursor-pointer transition-all active:scale-95">
                              <Camera className="w-3.5 h-3.5 text-rose-300" />
                              <span>Change</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handlePhotoUpload(e, moment.id)}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Direct Native Upload Box */
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-rose-400/40 hover:border-rose-400/80 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handlePhotoUpload(e, moment.id)}
                          />
                          <div className="w-11 h-11 rounded-full bg-rose-900/60 border border-rose-400/40 flex items-center justify-center text-rose-300 mb-2">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-cinzel text-rose-200 font-semibold tracking-wider">
                            Upload Photo 📷
                          </span>
                          <span className="text-[10px] text-rose-300/70 mt-0.5">
                            Tap to pick from device
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div
                      className={`flex items-center gap-1.5 text-xs font-cinzel text-rose-300/80 mb-1.5 ${
                        isEven ? 'sm:justify-end' : ''
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{moment.date}</span>
                    </div>

                    {/* Title */}
                    <h3 
                      className="text-lg sm:text-xl font-serif-luxury font-bold text-rose-100 group-hover:text-rose-200 transition-colors mb-2 cursor-pointer"
                      onClick={() => handleCardClick(moment)}
                    >
                      {moment.title}
                    </h3>

                    {/* Caption */}
                    <p className="text-xs sm:text-sm font-handwriting text-rose-200/90 leading-relaxed line-clamp-2">
                      "{moment.caption}"
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Memory Modal */}
      <AnimatePresence>
        {selectedMoment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedMoment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-love border-2 border-rose-400/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMoment(null)}
                className="absolute top-5 right-5 p-2 rounded-full glass-panel text-rose-300 hover:text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-cinzel text-rose-400 tracking-widest uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{selectedMoment.memoryTag} // Chapter of Us</span>
              </div>

              <h3 className="text-2xl font-serif-luxury font-bold text-rose-100 mb-2">
                {selectedMoment.title}
              </h3>

              {selectedMoment.date && (
                <div className="flex items-center gap-2 text-xs font-cinzel text-rose-300/80 mb-5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedMoment.date}</span>
                </div>
              )}

              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 border border-rose-400/30 shadow-inner group flex items-center justify-center bg-black/50">
                {selectedMoment.image && selectedMoment.image.trim().length > 0 ? (
                  <>
                    <img
                      src={selectedMoment.image}
                      alt={selectedMoment.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />

                    {/* Change Photo Button */}
                    <div className="absolute bottom-3 right-3 z-30 overflow-hidden rounded-full shadow-lg">
                      <div className="relative flex items-center gap-1.5 px-4 py-2 text-xs font-cinzel text-rose-100 bg-rose-950/90 hover:bg-rose-900 border border-rose-400/50 cursor-pointer backdrop-blur-md transition-all active:scale-95">
                        <Camera className="w-4 h-4 text-rose-300 shrink-0" />
                        <span className="font-semibold select-none">Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handlePhotoUpload(e, selectedMoment.id)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer border-2 border-dashed border-rose-400/50 hover:border-rose-300 hover:bg-rose-950/30 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handlePhotoUpload(e, selectedMoment.id)}
                    />
                    <div className="w-14 h-14 rounded-full bg-rose-900/60 border border-rose-400/40 flex items-center justify-center text-rose-300 mb-2.5">
                      <Camera className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-cinzel text-rose-100 font-bold tracking-wider mb-1">
                      Tap to Upload Photo 📷
                    </span>
                    <span className="text-xs text-rose-300/80">
                      Choose any picture from your device
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-rose-400/20 mb-4">
                <p className="text-lg sm:text-xl font-handwriting text-rose-100 leading-relaxed">
                  "{selectedMoment.caption}"
                </p>
              </div>

              <div className="text-right font-script text-2xl text-rose-300">
                Forever cherishing our moments ❤️
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
