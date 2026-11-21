import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Image as ImageIcon, Calendar, X, ZoomIn, Camera } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function PolaroidWall({ polaroids, onUpdatePolaroidImage }) {
  const [activePolaroid, setActivePolaroid] = useState(null);

  const handleOpenPhoto = (pol) => {
    sounds.playChime(1.2);
    setActivePolaroid(pol);
  };

  // Simple, robust photo upload handler
  const handlePhotoUpload = (e, polId) => {
    const file = e.target.files?.[0];
    if (!file || !polId) return;

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
          if (onUpdatePolaroidImage) {
            onUpdatePolaroidImage(polId, compressed);
          }
          setActivePolaroid((prev) => (prev && prev.id === polId ? { ...prev, image: compressed } : prev));
          sounds.playCelebrationChord();
        } catch (_) {
          if (onUpdatePolaroidImage) {
            onUpdatePolaroidImage(polId, src);
          }
          setActivePolaroid((prev) => (prev && prev.id === polId ? { ...prev, image: src } : prev));
          sounds.playCelebrationChord();
        }
      };
      img.onerror = () => {
        if (onUpdatePolaroidImage) {
          onUpdatePolaroidImage(polId, src);
        }
        setActivePolaroid((prev) => (prev && prev.id === polId ? { ...prev, image: src } : prev));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <section id="gallery" className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
      {/* Background radial glow */}
      <div className="absolute bottom-1/4 left-10 w-96 h-96 rounded-full bg-rose-950/20 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-love border border-rose-400/30 text-rose-300 text-xs font-cinzel uppercase tracking-[0.2em] mb-4"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Polaroid Gallery</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-serif-luxury font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-rose-200 to-pink-300 mb-4 whitespace-pre-line leading-tight"
        >
          Little Moments.
          Big Feelings.
          Beautiful Memories.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-rose-200/80 font-serif-luxury italic"
        >
          Each polaroid holds a piece of our story. Tap any card to upload or view your special photo! 📷
        </motion.p>
      </div>

      {/* Hanging Polaroid Wall Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 w-full relative z-10">
        {polaroids.map((pol, index) => {
          const hasImage = Boolean(pol.image && pol.image.trim().length > 0);

          return (
            <motion.div
              key={pol.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, rotate: 0 }}
              style={{ rotate: `${pol.rotation}deg` }}
              className="transition-transform duration-300"
            >
              {/* Polaroid Frame */}
              <div className="relative p-4 pb-6 bg-[#fbf9f6] text-neutral-800 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-neutral-300 flex flex-col group">
                {/* Washi tape pin effect at top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-rose-300/60 rounded-sm shadow-sm rotate-[-2deg] border border-rose-400/30 backdrop-blur-xs pointer-events-none" />

                {/* Photo container */}
                <div className="relative w-full h-64 sm:h-72 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-300/40 mb-3.5 flex items-center justify-center">
                  {hasImage ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={pol.image}
                        alt={pol.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        loading="eager"
                        onClick={() => handleOpenPhoto(pol)}
                      />
                      <div
                        className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors cursor-pointer"
                        onClick={() => handleOpenPhoto(pol)}
                      />

                      {/* Zoom indicator */}
                      <div 
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>

                      {/* Change Photo Overlay Button with Native Direct Input */}
                      <div className="absolute bottom-2 right-2 z-20 overflow-hidden rounded-full shadow-md">
                        <div className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-cinzel text-white bg-black/80 hover:bg-rose-900 border border-rose-300/40 backdrop-blur-md cursor-pointer transition-all active:scale-95">
                          <Camera className="w-3.5 h-3.5 text-rose-300" />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handlePhotoUpload(e, pol.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Direct Native Upload Box */
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/80 hover:bg-rose-100/90 rounded-lg transition-all cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => handlePhotoUpload(e, pol.id)}
                      />
                      <div className="w-14 h-14 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 mb-2.5 shadow-sm">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="font-cinzel text-xs font-bold text-neutral-800 tracking-wider uppercase mb-1">
                        Upload Photo 📷
                      </span>
                      <span className="text-[11px] text-neutral-500 font-sans">
                        Tap anywhere to choose photo
                      </span>
                    </div>
                  )}
                </div>

                {/* Polaroid Handwritten Caption */}
                <div className="flex flex-col items-center text-center px-1">
                  <span className="font-handwriting text-xl sm:text-2xl text-neutral-900 font-bold mb-0.5">
                    {pol.title}
                  </span>
                  {pol.date && (
                    <span className="text-[11px] font-cinzel text-neutral-500 uppercase tracking-wider">
                      {pol.date}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fullscreen Photo Modal */}
      <AnimatePresence>
        {activePolaroid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActivePolaroid(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel-love border-2 border-rose-400/50 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePolaroid(null)}
                className="absolute top-5 right-5 p-2 rounded-full glass-panel text-rose-300 hover:text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-cinzel text-rose-400 tracking-widest uppercase mb-2">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>Cherished Moment</span>
              </div>

              <h3 className="text-2xl font-serif-luxury font-bold text-rose-100 mb-1">
                {activePolaroid.title}
              </h3>

              {activePolaroid.date && (
                <div className="flex items-center gap-2 text-xs font-cinzel text-rose-300/80 mb-5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>{activePolaroid.date}</span>
                </div>
              )}

              {/* Large Image View or Modal Upload */}
              <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden mb-5 border border-rose-400/30 shadow-inner group flex items-center justify-center bg-black/60">
                {activePolaroid.image && activePolaroid.image.trim().length > 0 ? (
                  <>
                    <img
                      src={activePolaroid.image}
                      alt={activePolaroid.title}
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
                          onChange={(e) => handlePhotoUpload(e, activePolaroid.id)}
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
                      onChange={(e) => handlePhotoUpload(e, activePolaroid.id)}
                    />
                    <div className="w-16 h-16 rounded-full bg-rose-900/60 border border-rose-400/40 flex items-center justify-center text-rose-300 mb-3">
                      <Camera className="w-8 h-8" />
                    </div>
                    <span className="text-base font-cinzel text-rose-100 font-bold tracking-wider mb-1">
                      Tap to Upload Photo 📷
                    </span>
                    <span className="text-xs text-rose-300/80">
                      Choose any picture from your device
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-black/40 border border-rose-400/20 mb-3">
                <p className="text-lg font-handwriting text-rose-100 leading-relaxed">
                  "{activePolaroid.caption}"
                </p>
              </div>

              <div className="text-right font-script text-2xl text-rose-300">
                You are my forever view, Anju ❤️
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
