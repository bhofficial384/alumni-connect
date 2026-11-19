import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, User, Image, Heart, Sparkles, Check, Calendar, Mail } from 'lucide-react';
import { resetStoredData } from '../utils/storage';
import { sounds } from '../utils/soundEffects';
import { resolveAssetUrl, compressImageFile } from '../utils/defaultData';

export default function PersonalizeModal({ isOpen, onClose, config, onSaveConfig, onResetProgress }) {
  const [recipient, setRecipient] = useState(config.recipientName || 'Anju');
  const [author, setAuthor] = useState(config.authorName || 'Saurabh');
  const [startDate, setStartDate] = useState(config.relationshipStartDate || '2024-01-01');
  const [timeline, setTimeline] = useState(config.timeline || []);
  const [polaroids, setPolaroids] = useState(config.polaroids || []);
  const [activeTab, setActiveTab] = useState('general');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetProgressSuccess, setResetProgressSuccess] = useState(false);

  // Sync state whenever modal opens or config updates
  useEffect(() => {
    if (isOpen) {
      setRecipient(config.recipientName || 'Anju');
      setAuthor(config.authorName || 'Saurabh');
      setStartDate(config.relationshipStartDate || '2024-01-01');
      setTimeline(config.timeline || []);
      setPolaroids(config.polaroids || []);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleResetProgressOnly = () => {
    sounds.playChime(1.2);
    if (onResetProgress) {
      onResetProgress();
    }
    setResetProgressSuccess(true);
    setTimeout(() => setResetProgressSuccess(false), 2000);
  };

  const handleSave = () => {
    sounds.playCelebrationChord();
    onSaveConfig({
      ...config,
      recipientName: recipient,
      authorName: author,
      relationshipStartDate: startDate,
      timeline: timeline,
      polaroids: polaroids,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleTimelineImageChange = (index, url) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], image: url };
    setTimeline(updated);
  };

  const handleTimelineUpload = async (index, file) => {
    if (!file) return;
    sounds.playSoftChime();
    const compressed = await compressImageFile(file);
    if (compressed) {
      handleTimelineImageChange(index, compressed);
    }
  };

  const handlePolaroidImageChange = (index, url) => {
    const updated = [...polaroids];
    updated[index] = { ...updated[index], image: url };
    setPolaroids(updated);
  };

  const handlePolaroidUpload = async (index, file) => {
    if (!file) return;
    sounds.playSoftChime();
    const compressed = await compressImageFile(file);
    if (compressed) {
      handlePolaroidImageChange(index, compressed);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl max-h-[88vh] rounded-3xl glass-panel-love border border-rose-400/40 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col text-rose-50"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full glass-panel text-rose-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 text-xs font-cinzel text-rose-300 tracking-widest uppercase mb-1">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Love Story Customizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-rose-100 mb-6">
            Personalize for Anju & Saurabh
          </h2>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-rose-950 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-cinzel uppercase tracking-wider transition-all ${
                activeTab === 'general'
                  ? 'bg-rose-600/30 text-rose-200 border border-rose-400/50'
                  : 'text-rose-300/60 hover:text-rose-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Names & Dates</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-cinzel uppercase tracking-wider transition-all ${
                activeTab === 'timeline'
                  ? 'bg-rose-600/30 text-rose-200 border border-rose-400/50'
                  : 'text-rose-300/60 hover:text-rose-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline Photos ({timeline.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('polaroids')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-cinzel uppercase tracking-wider transition-all ${
                activeTab === 'polaroids'
                  ? 'bg-rose-600/30 text-rose-200 border border-rose-400/50'
                  : 'text-rose-300/60 hover:text-rose-100'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Polaroids ({polaroids.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel text-rose-300 uppercase tracking-wider mb-1.5">
                    Girlfriend's Name:
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-rose-500/30 text-rose-100 font-serif-luxury text-base focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-rose-300 uppercase tracking-wider mb-1.5">
                    Your Name (Author):
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-rose-500/30 text-rose-100 font-serif-luxury text-base focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-rose-300 uppercase tracking-wider mb-1.5">
                    Relationship Start Date (for Live Counter):
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-rose-500/30 text-rose-100 font-serif-luxury text-base focus:border-rose-400 outline-none"
                  />
                  <p className="text-[11px] text-rose-300/60 mt-1">
                    The live relationship counter on the hero section counts from this date!
                  </p>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-rose-500/25 mt-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-cinzel text-rose-300 uppercase tracking-wider">
                        Reset Unlocked Reasons & Progress
                      </h4>
                      <p className="text-[11px] text-rose-400/70 mt-0.5">
                        Reset reasons unlocked (0/20), opened envelopes, and wishes to lock them again. Keeps your custom names & photos intact!
                      </p>
                    </div>
                    <button
                      onClick={handleResetProgressOnly}
                      className="shrink-0 px-4 py-2 rounded-full bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/50 text-xs font-cinzel text-rose-200 uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      {resetProgressSuccess ? 'Reset Complete! ✨' : 'Reset Unlocks (0/20)'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <p className="text-xs text-rose-200/80 font-serif-luxury italic">
                  Upload personal photographs for each milestone in your love journey.
                </p>

                {timeline.map((mem, index) => (
                  <div
                    key={mem.id}
                    className="p-3.5 rounded-2xl glass-panel border border-rose-500/20 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-rose-400/30 shrink-0">
                      <img src={resolveAssetUrl(mem.image)} alt={mem.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <p className="text-xs font-cinzel text-rose-200 truncate font-semibold">
                        {mem.memoryTag}: {mem.title}
                      </p>
                      <input
                        type="text"
                        value={mem.image}
                        onChange={(e) => handleTimelineImageChange(index, e.target.value)}
                        placeholder="Image URL..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-black/60 border border-rose-500/30 focus:border-rose-400 text-rose-100 outline-none truncate"
                      />
                    </div>
                    <label className="shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel text-rose-200 bg-rose-600/20 border border-rose-400/40 hover:bg-rose-600/30 cursor-pointer">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleTimelineUpload(index, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'polaroids' && (
              <div className="space-y-4">
                <p className="text-xs text-rose-200/80 font-serif-luxury italic">
                  Customize the polaroid wall with real photos of Anju and Saurabh.
                </p>

                {polaroids.map((pol, index) => (
                  <div
                    key={pol.id}
                    className="p-3.5 rounded-2xl glass-panel border border-rose-500/20 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-rose-400/30 shrink-0">
                      <img src={resolveAssetUrl(pol.image)} alt={pol.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <p className="text-xs font-cinzel text-rose-200 truncate font-semibold">
                        {pol.title}
                      </p>
                      <input
                        type="text"
                        value={pol.image}
                        onChange={(e) => handlePolaroidImageChange(index, e.target.value)}
                        placeholder="Image URL..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-black/60 border border-rose-500/30 focus:border-rose-400 text-rose-100 outline-none truncate"
                      />
                    </div>
                    <label className="shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel text-rose-200 bg-rose-600/20 border border-rose-400/40 hover:bg-rose-600/30 cursor-pointer">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePolaroidUpload(index, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-rose-950 mt-5">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-cinzel text-rose-400 hover:text-rose-200 uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/50 text-xs font-cinzel text-rose-200 uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
