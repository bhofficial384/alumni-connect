import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

import StarfieldCanvas from './components/StarfieldCanvas';
import AudioController from './components/AudioController';
import NavigationPill from './components/NavigationPill';
import SecretGiftEntrance from './components/SecretGiftEntrance';
import RomanticHero from './components/RomanticHero';
import RomanticTimeline from './components/RomanticTimeline';
import TwentyReasons from './components/TwentyReasons';
import OpenWhenEnvelopes from './components/OpenWhenEnvelopes';
import PolaroidWall from './components/PolaroidWall';
import HeartfeltLetter from './components/HeartfeltLetter';
import BirthdayCake from './components/BirthdayCake';
import RomanticUniverse from './components/RomanticUniverse';
import TheFinalSecret from './components/TheFinalSecret';
import PersonalizeModal from './components/PersonalizeModal';

import {
  getStoredConfig,
  saveStoredConfig,
  getStoredProgress,
  saveStoredProgress,
  INITIAL_PROGRESS,
  resetStoredProgressOnly,
} from './utils/storage';
import { sounds } from './utils/soundEffects';

export default function App() {
  const [config, setConfig] = useState(getStoredConfig);
  const [progress, setProgress] = useState(getStoredProgress);
  const [hasOpenedGift, setHasOpenedGift] = useState(progress.hasOpenedGift || false);
  const [isHyperspace, setIsHyperspace] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Romantic Loading Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateProgress = (newProgress) => {
    setProgress(newProgress);
    saveStoredProgress(newProgress);
  };

  const handleResetProgress = () => {
    const fresh = { ...INITIAL_PROGRESS, hasOpenedGift: true };
    setProgress(fresh);
    saveStoredProgress(fresh);
  };

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);
  };

  const handleUpdateTimelineImage = (momentId, newImageUrl) => {
    const updated = config.timeline.map((m) =>
      m.id === momentId ? { ...m, image: newImageUrl } : m
    );
    handleSaveConfig({ ...config, timeline: updated });
  };

  const handleUpdatePolaroidImage = (polId, newImageUrl) => {
    const updated = config.polaroids.map((p) =>
      p.id === polId ? { ...p, image: newImageUrl } : p
    );
    handleSaveConfig({ ...config, polaroids: updated });
  };

  const handleSaveLetter = (newLetterText) => {
    handleSaveConfig({ ...config, heartfeltLetter: newLetterText });
  };

  const handleOpenSurprise = () => {
    setIsHyperspace(true);
    setTimeout(() => {
      setHasOpenedGift(true);
      setIsHyperspace(false);
      handleUpdateProgress({ ...progress, hasOpenedGift: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 1200);
  };

  const handleRestart = () => {
    // Automatically reset all progress completely so replaying starts totally fresh
    const fresh = { ...INITIAL_PROGRESS, hasOpenedGift: false };
    setProgress(fresh);
    saveStoredProgress(fresh);
    setHasOpenedGift(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleReturnToTop = () => {
    // Automatically reset all progress (reasons 0/20, envelopes sealed, candles lit, stars locked) and scroll to top
    const fresh = { ...INITIAL_PROGRESS, hasOpenedGift: true };
    setProgress(fresh);
    saveStoredProgress(fresh);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#050209] text-rose-50 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Initial Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050209] text-center select-none"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="p-5 rounded-full bg-rose-950/50 border border-rose-500/40 glow-rose mb-6"
            >
              <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-serif-luxury text-rose-100 italic">
              "Preparing something special for {config.recipientName}... ❤️"
            </h2>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-cinzel text-rose-400/70 tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Gathering Starlight & Love</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Starfield, Rose Petals & Interactive Click Hearts */}
      <StarfieldCanvas isHyperspace={isHyperspace} intensity={1} />

      {/* Floating Audio Controller */}
      <AudioController
        isEntered={hasOpenedGift}
        audioMuted={audioMuted}
        setAudioMuted={setAudioMuted}
      />

      {/* SCENE 1 — THE SECRET GIFT */}
      {!hasOpenedGift ? (
        <SecretGiftEntrance
          onOpenSurprise={handleOpenSurprise}
          recipientName={config.recipientName}
          authorName={config.authorName}
          scene1Data={config.scene1}
        />
      ) : (
        /* MAIN LOVE STORY MOVIE EXPERIENCE */
        <main className="relative z-10 animate-fadeIn">
          {/* Quick-Jump Navigation Pill */}
          <NavigationPill
            onOpenPersonalize={() => setIsPersonalizeOpen(true)}
            progress={progress}
          />

          {/* SCENE 2 — HAPPY BIRTHDAY, MY ANJU 🎂 */}
          <RomanticHero
            recipientName={config.recipientName}
            authorName={config.authorName}
            heroData={config.hero}
            startDate={config.relationshipStartDate}
            easterEggNote={config.easterEggNote}
          />

          {/* Rose Gradient Divider */}
          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
          </div>

          {/* SCENE 3 — OUR LITTLE STORY (Scrapbook Timeline) */}
          <RomanticTimeline
            timeline={config.timeline}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onUpdateTimelineImage={handleUpdateTimelineImage}
          />

          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
          </div>

          {/* SCENE 4 — 20 REASONS WHY I LOVE ANJU ❤️ */}
          <TwentyReasons
            reasons={config.reasons}
            recipientName={config.recipientName}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />

          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
          </div>

          {/* SCENE 5 — OPEN WHEN... 💌 */}
          <OpenWhenEnvelopes
            letters={config.openWhenLetters}
            recipientName={config.recipientName}
            authorName={config.authorName}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />

          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
          </div>

          {/* SCENE 6 — OUR MEMORIES (Polaroid Wall Gallery) */}
          <PolaroidWall
            polaroids={config.polaroids}
            onUpdatePolaroidImage={handleUpdatePolaroidImage}
          />

          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
          </div>

          {/* SCENE 7 — A LETTER FROM SAURABH TO ANJU 💗 */}
          <HeartfeltLetter
            initialLetter={config.heartfeltLetter}
            onSaveLetter={handleSaveLetter}
            recipientName={config.recipientName}
            authorName={config.authorName}
          />

          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
          </div>

          {/* SCENE 8 — A WISH FOR MY GIRL 🎂 (Cake Experience) */}
          <BirthdayCake
            recipientName={config.recipientName}
            cakeData={config.cakeSection}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />

          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
          </div>

          {/* SCENE 9 — OUR LITTLE UNIVERSE 🌌 (Star Map Wishes) */}
          <RomanticUniverse
            wishes={config.universeWishes}
            recipientName={config.recipientName}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />

          <div className="w-full flex items-center justify-center py-6 opacity-35">
            <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
          </div>

          {/* SCENE 10 — THE FINAL SECRET ❤️ */}
          <TheFinalSecret
            recipientName={config.recipientName}
            authorName={config.authorName}
            secretData={config.finalSecret}
            onRestart={handleRestart}
            onReturnToTop={handleReturnToTop}
            progress={progress}
          />
        </main>
      )}

      {/* Personalization Workshop */}
      <PersonalizeModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
