import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Heart } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AudioController({ isEntered, audioMuted, setAudioMuted }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isEntered && !audioMuted) {
      sounds.init();
      sounds.startAmbientMusic();
      setIsPlaying(true);
    } else if (audioMuted) {
      sounds.setMuted(true);
      setIsPlaying(false);
    }
  }, [isEntered, audioMuted]);

  const toggleSound = () => {
    sounds.init();
    if (audioMuted) {
      setAudioMuted(false);
      sounds.setMuted(false);
      sounds.startAmbientMusic();
      sounds.playChime(1.2);
      setIsPlaying(true);
    } else {
      setAudioMuted(true);
      sounds.setMuted(true);
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3">
      <div className="relative">
        <button
          onClick={toggleSound}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel-love border transition-all duration-300 group ${
            !audioMuted
              ? 'border-rose-400/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
              : 'border-rose-900/60 text-rose-400/60 hover:text-rose-200'
          }`}
          aria-label={audioMuted ? 'Unmute romantic melody' : 'Mute music'}
        >
          {/* Animated sound wave bars when active */}
          {!audioMuted && isPlaying ? (
            <div className="flex items-center gap-0.5 h-3.5 px-0.5">
              <span className="w-0.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
              <span className="w-0.5 bg-pink-300 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
              <span className="w-0.5 bg-rose-400 rounded-full animate-bounce [animation-delay:300ms] h-4/5" />
            </div>
          ) : (
            <VolumeX className="w-4 h-4 text-rose-400/60" />
          )}

          <span className="text-xs font-medium tracking-wider uppercase font-cinzel">
            {audioMuted ? 'Music Off' : 'Romantic Melodies'}
          </span>
          <Heart className={`w-3 h-3 ${!audioMuted ? 'fill-rose-500 text-rose-400' : 'text-rose-500/40'}`} />
        </button>

        {/* Floating tooltip */}
        {showTooltip && (
          <div className="absolute right-0 top-12 w-52 p-2 text-center text-xs text-rose-200 rounded-lg glass-panel-love border border-rose-500/30 shadow-xl pointer-events-none">
            {audioMuted ? 'Click to play romantic ambient background music' : 'Click to mute background music'}
          </div>
        )}
      </div>
    </div>
  );
}
