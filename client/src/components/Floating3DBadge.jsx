import React from 'react';

const Floating3DBadge = ({ icon, text, company, color = 'gold', className = '', delay = '0s', floatClass = 'animate-float-slow' }) => {
  const colorStyles = {
    gold: 'border-purple-500/40 text-purple-200 bg-slate-900/90 shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    teal: 'border-cyan-500/40 text-cyan-200 bg-slate-900/90 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    blue: 'border-indigo-500/40 text-indigo-200 bg-slate-900/90 shadow-[0_0_25px_rgba(99,102,241,0.3)]',
    pink: 'border-pink-500/40 text-pink-200 bg-slate-900/90 shadow-[0_0_25px_rgba(236,72,153,0.3)]',
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md cursor-default select-none transition-all duration-300 hover:scale-110 hover:shadow-xl ${colorStyles[color] || colorStyles.gold} ${floatClass} ${className}`}
      style={{ animationDelay: delay }}
    >
      <span className="text-base">{icon}</span>
      <div className="flex flex-col text-left">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-white">{text}</span>
        {company && <span className="text-[9px] text-gray-300 -mt-0.5">{company}</span>}
      </div>
    </div>
  );
};

export default Floating3DBadge;
