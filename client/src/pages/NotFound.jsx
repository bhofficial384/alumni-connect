import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 glass-card-dark rounded-3xl p-10 max-w-lg border border-white/10 shadow-2xl">
        <h1 className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent mb-2 tracking-tight">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Signal Lost in Deep Space</h2>
        <p className="text-slate-400 text-sm mb-8">
          The requested coordinate does not exist or has been shifted in the constellation.
        </p>
        <Link to="/" className="btn-gold inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Mission Control
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
