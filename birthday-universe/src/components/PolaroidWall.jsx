import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Image as ImageIcon, Calendar, X, ZoomIn, Check, Camera } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { resolveAssetUrl, compressImageFile, readFileAsDataUrl } from '../utils/defaultData';

export default function PolaroidWall({ polaroids, onUpdatePolaroidImage }) {
  const [activePolaroid, setActivePolaroid] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const handleOpenPhoto = (pol) => {
    sounds.playChime(1.2);
    setActivePolaroid(pol);
  };

  const handleUpload = async (e, polId) => {
    const file = e.target.files?.[0];
    if (!file || !polId) return;

    setUploadingId(polId);
    sounds.playSoftChime();

    try {
      // Step 1: Read the file as data URL
      const rawDataUrl = await readFileAsDataUrl(file);
      if (!rawDataUrl) {
        setUploadingId(null);
        return;
      }

      // Step 2: Compress to ensure fast rendering and prevent localStorage quota issues
      const compressed = await compressImageFile(file, 800, 0.75);
      const finalUrl = compressed || rawDataUrl;

      // Step 3: Update application state and storage
      if (onUpdatePolaroidImage) {
        onUpdatePolaroidImage(polId, finalUrl);
      }

      // Step 4: Update active modal if currently open
      setActivePolaroid((prev) => (prev && prev.id === polId ? { ...prev, image: finalUrl } : prev));

      sounds.playCelebrationChord();
      setSuccessId(polId);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err) {
      console.error('Failed to upload polaroid photo:', err);
    } finally {
      setUploadingId(null);
      if (e.target) e.target.value = '';
    }
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
          const isCurrentUploading = uploadingId === pol.id;
          const isCurrentSuccess = successId === pol.id;

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
                    <div
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => handleOpenPhoto(pol)}
                    >
                      <img
                        src={resolveAssetUrl(pol.image)}
                        alt={pol.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          if (!e.currentTarget.dataset.retried) {
                            e.currentTarget.dataset.retried = '1';
                            const clean = pol.image.replace(/^\.?\/+/, '');
                            if (e.currentTarget.src.includes('/alumni-connect/')) {
                              e.currentTarget.src = '/' + clean;
                            } else {
                              e.currentTarget.src = './' + clean;
                            }
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                      {/* Zoom indicator */}
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>

                      {/* Direct Native Change Button */}
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-cinzel text-white bg-black/80 hover:bg-rose-900 border border-rose-300/40 backdrop-blur-md shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUpload(e, pol.id)}
                        />
                        {isCurrentSuccess ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-rose-300" />
                        )}
                        <span>{isCurrentUploading ? 'Saving...' : isCurrentSuccess ? 'Saved! ✨' : 'Change'}</span>
                      </label>
                    </div>
                  ) : (
                    /* Direct Native Upload Label */
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-rose-300/80 hover:border-rose-500 bg-rose-50/80 hover:bg-rose-100/90 rounded-lg transition-all cursor-pointer group/up relative"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, pol.id)}
                      />
                      <div className="w-14 h-14 rounded-full bg-rose-200/90 group-hover/up:bg-rose-300 flex items-center justify-center text-rose-600 mb-2.5 group-hover/up:scale-110 transition-all shadow-sm">
                        {isCurrentUploading ? (
                          <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-7 h-7" />
                        )}
                      </div>
                      <span className="font-cinzel text-xs font-bold text-neutral-800 tracking-wider uppercase mb-1">
                        {isCurrentUploading ? 'Uploading...' : 'Upload Photo 📷'}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-sans">
                        Tap anywhere to choose photo
                      </span>
                    </label>
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
                      src={resolveAssetUrl(activePolaroid.image)}
                      alt={activePolaroid.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                      decoding="async"
                    />

                    {/* Change Photo Button */}
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-cinzel text-rose-100 bg-rose-950/90 hover:bg-rose-900 border border-rose-400/50 hover:border-rose-300 cursor-pointer shadow-lg backdrop-blur-md transition-all active:scale-95"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, activePolaroid.id)}
                      />
                      {successId === activePolaroid.id ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Camera className="w-4 h-4 text-rose-300 shrink-0" />
                      )}
                      <span className="font-semibold select-none">
                        {uploadingId === activePolaroid.id
                          ? 'Saving Photo...'
                          : successId === activePolaroid.id
                          ? 'Photo Updated! ✨'
                          : 'Change Photo'}
                      </span>
                    </label>
                  </>
                ) : (
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer border-2 border-dashed border-rose-400/50 hover:border-rose-300 hover:bg-rose-950/30 transition-all group/modalup"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, activePolaroid.id)}
                    />
                    <div className="w-16 h-16 rounded-full bg-rose-900/60 border border-rose-400/40 flex items-center justify-center text-rose-300 mb-3 group-hover/modalup:scale-110 transition-transform">
                      {uploadingId === activePolaroid.id ? (
                        <div className="w-7 h-7 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8" />
                      )}
                    </div>
                    <span className="text-base font-cinzel text-rose-100 font-bold tracking-wider mb-1">
                      {uploadingId === activePolaroid.id ? 'Uploading Photo...' : 'Tap to Upload Photo 📷'}
                    </span>
                    <span className="text-xs text-rose-300/80">
                      Choose any picture from your device
                    </span>
                  </label>
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
