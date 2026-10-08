import React, { useState, useEffect, useRef } from 'react';
import TiltCard3D from './TiltCard3D';

/**
 * DribbbleBentoCards — Bento Grid feature cards with Scroll-Driven 3D Perspective Reveals
 * Features:
 *  1. "Manage your career with an AI assistant"
 *  2. "64m / 64k+" Metric & Animated Neon Line Chart
 *  3. "Book sessions anytime, anywhere" with interactive live calendar slots
 */
const DribbbleBentoCards = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-12 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ROW 1: Large AI Card + 64m Metric Card */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{
            perspective: '1200px',
          }}
        >
          
          {/* Card 1: AI Career Assistant (Span 7) */}
          <TiltCard3D className="lg:col-span-7 rounded-[32px] bg-[#0E121C] border border-white/[0.08] p-5 sm:p-12 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
            {/* Subtle background ambient glow */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-600/25 transition-all duration-700" />
            
            <div className="relative z-10 max-w-lg mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8] mb-3 block">
                WHY ALUMNICONNECT?
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Manage your career with an AI assistant.
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Simplify outreach using our AI Mentor Drafter. Formulate tailored questions, analyze interview patterns, and connect with industry leaders in seconds.
              </p>
            </div>

            {/* Mockup matching Dribbble shot: Avatar + Skeleton lines + Floating purple notification pill */}
            <div className="relative z-10 w-full pt-4">
              <div className="rounded-2xl bg-[#131826] border border-white/10 p-5 shadow-xl relative overflow-hidden">
                {/* User avatar & skeleton lines */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      alt="User avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-3/5 rounded-full bg-slate-700/80" />
                    <div className="h-2.5 w-4/5 rounded-full bg-slate-800" />
                  </div>
                </div>

                {/* Additional skeleton lines */}
                <div className="space-y-2 mb-2 opacity-50">
                  <div className="h-2.5 w-full rounded-full bg-slate-800" />
                  <div className="h-2.5 w-5/6 rounded-full bg-slate-800" />
                </div>

                {/* Floating Purple Notification Pill (directly from Dribbble shot) */}
                <div className="mt-4 sm:absolute sm:bottom-4 sm:right-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] p-3.5 shadow-2xl flex items-center gap-3 text-white border border-white/20 animate-float-slow">
                  <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center text-slate-900 font-bold shrink-0">
                    <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Session Confirmed</div>
                    <div className="text-[10px] text-purple-200">Verified Alumni · 1-on-1 Mentorship</div>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard3D>

          {/* Card 2: 64m Metric & Glowing Dual-Line Chart (Span 5) */}
          <TiltCard3D className="lg:col-span-5 rounded-[32px] bg-[#0E121C] border border-white/[0.08] p-5 sm:p-12 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
            {/* Background cyan glow */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-700" />

            <div className="relative z-10 flex items-start justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#38BDF8] mb-1 block">
                  NETWORK POWER
                </span>
                <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  64k<span className="text-[#2563EB]">+</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Mentorship minutes logged</div>
              </div>

              {/* Verified Mentor Avatar Pill */}
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/[0.06] border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                  alt="Verified Mentor"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-[11px] font-semibold text-white">Verified</span>
              </div>
            </div>

            {/* Glowing Dual-Line SVG Graph (Matching the Dribbble shot curve) */}
            <div className="relative z-10 w-full my-6">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 300 120">
                {/* Purple dashed trajectory line */}
                <path
                  d="M 10 90 Q 60 70 110 50 T 200 40 T 290 20"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="opacity-70"
                />
                {/* Cyan solid glowing line with sharp crests */}
                <path
                  d="M 10 95 L 50 65 L 90 75 L 140 45 L 180 55 L 220 30 L 260 38 L 290 15"
                  fill="none"
                  stroke="#00F0FF"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]"
                />
                {/* Interactive point */}
                <circle cx="220" cy="30" r="4.5" fill="#00F0FF" className="animate-ping opacity-75" />
                <circle cx="220" cy="30" r="4" fill="#FFFFFF" stroke="#00F0FF" strokeWidth="2" />
              </svg>
            </div>

            {/* Card stats footer from Dribbble shot */}
            <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider">Sessions Hosted</span>
                <span className="text-lg font-bold text-white tracking-tight">28,562</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider">Placement Rate</span>
                <span className="text-lg font-bold text-emerald-400 tracking-tight">98.4%</span>
              </div>
            </div>
          </TiltCard3D>
        </div>

        {/* ROW 2: Scheduling Card "Book sessions anytime, anywhere" */}
        <div
          className={`rounded-[32px] bg-[#0E121C] border border-white/[0.08] p-5 sm:p-12 shadow-2xl relative overflow-hidden group transition-all duration-1000 delay-150 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-[90px] pointer-events-none group-hover:bg-blue-600/25 transition-all duration-700" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#60A5FA] block">
                WHY ALUMNICONNECT?
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Book sessions anytime, anywhere.
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
                Direct calendar access with zero back-and-forth email tagging. Automatic timezone conversion, calendar invites, and instant 1-click video links.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  ✓ Instant Google Meet Sync
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  ✓ 100% Free for Students
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  ✓ Verified Alumni Only
                </span>
              </div>
            </div>

            {/* Interactive Calendar Scheduler Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#131826] border border-white/10 p-6 shadow-2xl max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-sm font-bold text-white">Select Availability</h4>
                    <span className="text-[11px] text-slate-400">Next available slots this week</span>
                  </div>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                    Live Booking
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {[
                    { day: 'Mon, Oct 12', time: '5:00 PM', active: false },
                    { day: 'Wed, Oct 14', time: '6:30 PM', active: true },
                    { day: 'Sat, Oct 17', time: '11:00 AM', active: false },
                  ].map((slot, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                        slot.active
                          ? 'bg-[#2563EB] border-[#3B82F6] text-white shadow-lg shadow-blue-600/40 scale-105'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] opacity-80">{slot.day}</div>
                      <div className="text-xs font-bold mt-1">{slot.time}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      G
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Google Meet Ready</div>
                      <div className="text-[10px] text-slate-400">Link auto-generated on booking</div>
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md">
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DribbbleBentoCards;
