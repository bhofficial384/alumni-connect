import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — 3D Tactile Light / Dark Mode Switcher
 * Features realistic 3D perspective flip, celestial sun/moon orb with specular
 * lighting, animated cosmic starfield, and tactile click response.
 */
const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className={`group relative flex items-center gap-2 p-1 rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
        isDark
          ? 'bg-[#0E131F]/90 border border-white/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.3)] hover:border-purple-500/40'
          : 'bg-slate-200/90 border border-slate-300/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] hover:border-amber-400/60'
      } ${className}`}
    >
      {/* 3D Track Capsule */}
      <div className="relative w-14 h-7 rounded-full flex items-center px-0.5 overflow-hidden">
        {/* Track Ambient Glow Background */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            isDark
              ? 'bg-gradient-to-r from-indigo-950 via-purple-950/60 to-slate-900 opacity-90'
              : 'bg-gradient-to-r from-amber-100 via-sky-100 to-blue-100 opacity-90'
          }`}
        />

        {/* Night Stars Background Effect (Dark Mode) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="absolute top-1.5 left-2 w-0.5 h-0.5 rounded-full bg-cyan-300 animate-pulse" />
          <span className="absolute bottom-2 left-4 w-1 h-1 rounded-full bg-purple-300/80" />
          <span className="absolute top-2 left-6 w-0.5 h-0.5 rounded-full bg-white/70" />
        </div>

        {/* Day Cloud / Ray Background Effect (Light Mode) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            !isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="absolute top-1 right-2.5 w-3 h-1.5 rounded-full bg-white/80 blur-[0.5px]" />
          <span className="absolute bottom-1 right-5 w-2 h-1 rounded-full bg-sky-200/60" />
        </div>

        {/* 3D Sliding Celestial Orb */}
        <div
          className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform shadow-md ${
            isDark
              ? 'translate-x-7 bg-gradient-to-br from-indigo-500 via-purple-600 to-slate-900 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
              : 'translate-x-0 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 shadow-[0_0_12px_rgba(251,191,36,0.65)]'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Specular Highlight Ring */}
          <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />

          {/* 3D Sun Icon (Light Mode) */}
          <div
            className={`absolute transition-all duration-500 transform ${
              !isDark
                ? 'scale-100 rotate-0 opacity-100'
                : 'scale-0 -rotate-90 opacity-0'
            }`}
          >
            <svg
              className="w-3.5 h-3.5 text-amber-950 drop-shadow-sm"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
            </svg>
          </div>

          {/* 3D Moon Icon (Dark Mode) */}
          <div
            className={`absolute transition-all duration-500 transform ${
              isDark
                ? 'scale-100 rotate-0 opacity-100'
                : 'scale-0 rotate-90 opacity-0'
            }`}
          >
            <svg
              className="w-3.5 h-3.5 text-cyan-200 drop-shadow-sm"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12.3 2a10 10 0 0 0-.19 14 10 10 0 0 0 11.57 3.32A10 10 0 1 1 12.3 2z" />
            </svg>
          </div>
        </div>
      </div>

      {showLabel && (
        <span
          className={`text-xs font-semibold pr-2 transition-colors ${
            isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
          }`}
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};

export default React.memo(ThemeToggle);
