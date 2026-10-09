import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * Dribbble3DHeroMockup — Fey Website-Inspired Vertical 3D Scroll Animation
 * Based on Fey (fey.com) as featured in Framer University Blog #1.
 * 
 * Key Vertical Scroll Mechanics:
 *  - Pure Vertical X-Axis 3D Unfolding: Starts tilted backward at 26deg, unfolds to 0deg upright
 *  - Vertical Zoom / Scale: Scales from 0.88 up to 1.04 as user scrolls down
 *  - Zero Horizontal Drift: Locked rotateY(0), rotateZ(0), translateX(0)
 *  - Dynamic vertical Z-plane elevation and specular light sweep
 */
const Dribbble3DHeroMockup = ({ mentors: propMentors, onMentorSelect }) => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentorsList, setMentorsList] = useState(propMentors || []);

  useEffect(() => {
    if (propMentors && propMentors.length > 0) {
      setMentorsList(propMentors);
    } else {
      api.get('/mentors')
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setMentorsList(res.data);
          }
        })
        .catch(() => {});
    }
  }, [propMentors]);

  const handleContinue = () => {
    if (user?.role) {
      navigate(`/dashboard/${user.role}`);
    } else {
      navigate('/login');
    }
  };

  const handleMentorClick = (mentorItem) => {
    const raw = mentorItem?.rawMentor || mentorItem;
    if (onMentorSelect) {
      onMentorSelect(raw);
    } else {
      handleContinue();
    }
  };

  const displayMentors = mentorsList.length > 0
    ? mentorsList.slice(0, 4).map(m => ({
        id: m._id || m.id,
        name: m.name ? (m.name.length > 9 ? m.name.split(' ')[0] : m.name) : 'Mentor',
        role: m.company || m.domain || 'Alumni',
        img: m.profileImage || null,
        rawMentor: m
      }))
    : [
        { name: 'Saurabh', role: 'Geck', img: null },
        { name: 'Anjali', role: 'Google', img: null },
        { name: 'Karan', role: 'AWS', img: null },
        { name: 'Morgan', role: 'Amazon', img: null }
      ];

  // Vertical scroll tracking with requestAnimationFrame for smooth 60fps performance
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          // Progress from 0 (top of page) to 1 (scrolled 600px down)
          const progress = Math.min(Math.max(scrollY / 600, 0), 1);
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fey.com vertical 3D math:
  // Starts laid back at 26deg, smoothly unfolds to 0deg (facing viewer) as user scrolls
  const rotateX = 26 * (1 - scrollProgress);
  // Smoothly scales up from 0.88 to 1.04 (zooms in towards camera)
  const scale = 0.88 + scrollProgress * 0.16;
  // Subtle vertical elevation
  const translateY = -scrollProgress * 45;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[470px] xs:h-[490px] sm:h-[580px] lg:h-[620px] flex items-center justify-center select-none overflow-hidden"
      style={{ perspective: '1400px' }}
    >
      {/* Dynamic Ambient Glow Halo — Expands vertically as device unfolds */}
      <div
        className="absolute w-[280px] sm:w-[460px] h-[280px] sm:h-[460px] bg-gradient-to-tr from-blue-600/25 via-purple-600/20 to-pink-500/20 rounded-full blur-[60px] sm:blur-[90px] pointer-events-none transition-transform duration-300"
        style={{
          transform: `scale(${0.9 + scrollProgress * 0.25}) translateY(${translateY * 0.5}px)`,
        }}
      />

      {/* Floating ambient colored specks (Vertical-only motion) */}
      <div
        className="absolute top-12 left-10 w-2.5 h-2.5 rounded-full bg-[#FFA07A] shadow-[0_0_12px_#FFA07A] animate-pulse-slow pointer-events-none"
        style={{ transform: `translateY(${-scrollProgress * 50}px)` }}
      />
      <div
        className="absolute bottom-16 left-8 w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_10px_#34D399] pointer-events-none"
        style={{ transform: `translateY(${scrollProgress * 40}px)` }}
      />
      <div
        className="absolute top-20 right-8 w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_10px_#38BDF8] pointer-events-none"
        style={{ transform: `translateY(${-scrollProgress * 35}px)` }}
      />

      {/* ========================================================
          FEY-STYLE 3D VERTICAL SCROLL STAGE
          Pure Vertical X-axis rotation & vertical zoom (Zero horizontal skew)
         ======================================================== */}
      <div
        className="relative w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[620px] h-[450px] xs:h-[470px] sm:h-[520px] scale-[0.94] xs:scale-[0.98] sm:scale-100 origin-center transition-transform duration-100 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'center 40%',
          transform: `rotateX(${rotateX}deg) rotateY(0deg) rotateZ(0deg) scale(${scale}) translateY(${translateY}px)`,
        }}
      >
        {/* Dynamic Fey-Style Ground Contact Shadow (Sharpens as device stands upright) */}
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-black/80 rounded-full blur-2xl pointer-events-none transition-all duration-300"
          style={{
            transform: `scaleX(${1 - scrollProgress * 0.2}) scaleY(${1 - scrollProgress * 0.4})`,
            opacity: 0.6 + scrollProgress * 0.35,
          }}
        />

        {/* ========================================================
            SCREEN 1: BACK LEFT PHONE (Geodesic Sphere & Intro)
            Vertical elevation in Z & Y as device unfolds (Visible on tablet/desktop)
           ======================================================== */}
        <div
          className="hidden sm:flex absolute left-0 top-2 w-[240px] sm:w-[260px] h-[450px] rounded-[38px] bg-[#111420] border-[5px] border-[#222738] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-4 flex-col justify-between overflow-hidden transition-transform duration-150"
          style={{
            transform: `translateZ(${-30 + scrollProgress * 35}px) translateY(${-scrollProgress * 15}px)`,
          }}
        >
          {/* Vertical Specular Glass Reflection Sweep */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-white/20 via-transparent to-transparent transition-opacity duration-300"
            style={{ transform: `translateY(${-100 + scrollProgress * 180}%)` }}
          />

          {/* Top Speaker / Camera Notch */}
          <div className="w-20 h-4 bg-[#1B2030] rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          </div>

          {/* Wireframe Concentric Geodesic Sphere Graphic */}
          <div className="relative w-full h-44 flex items-center justify-center my-auto">
            <svg
              className="w-full h-full text-blue-500/40 transition-transform duration-200"
              style={{ transform: `rotate(${scrollProgress * 45}deg)` }}
              viewBox="0 0 200 200"
            >
              <ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
              <ellipse cx="100" cy="100" rx="80" ry="45" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <ellipse cx="100" cy="100" rx="65" ry="60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
              <ellipse cx="100" cy="100" rx="45" ry="75" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <ellipse cx="100" cy="100" rx="25" ry="85" fill="none" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="100" cy="100" rx="90" ry="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </svg>
            {/* Holographic Glowing Core */}
            <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] border border-white/50" />
          </div>

          {/* Text Content */}
          <div className="mt-auto space-y-2 relative z-10">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span>More than a network</span>
              <span>🎓</span>
            </div>
            <h4 className="text-white text-base font-bold leading-tight">
              Connect Directly With Alumni.
            </h4>

            {/* Pagination dots */}
            <div className="flex items-center gap-1 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            </div>

            {/* Electric Blue CTA */}
            <button className="w-full py-2 rounded-full bg-[#2563EB] text-white text-xs font-semibold shadow-lg shadow-blue-600/40 hover:bg-blue-600 transition-colors">
              Get Started
            </button>
          </div>
        </div>

        {/* ========================================================
            SCREEN 2: CENTER FRONT PHONE (Main Dashboard View)
            Rises vertically forward into sharp foreground focus
           ======================================================== */}
        <div
          className="absolute left-1/2 -translate-x-1/2 sm:left-28 sm:translate-x-0 top-1 sm:top-8 w-[255px] xs:w-[275px] sm:w-[290px] h-[435px] xs:h-[455px] sm:h-[490px] rounded-[34px] sm:rounded-[42px] bg-[#0E111C] border-[4px] sm:border-[6px] border-[#252B3E] shadow-[0_20px_60px_rgba(0,0,0,0.95)] sm:shadow-[0_35px_90px_rgba(0,0,0,0.95)] p-3 sm:p-4 flex flex-col justify-between overflow-hidden transition-transform duration-150 z-20"
          style={{
            transform: `translateZ(${45 + scrollProgress * 85}px) translateY(${-scrollProgress * 30}px) scale(${1 + scrollProgress * 0.04})`,
          }}
        >
          {/* Vertical Specular Glass Reflection Glare */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25 bg-gradient-to-b from-cyan-300/30 via-transparent to-transparent transition-transform duration-200"
            style={{ transform: `translateY(${-40 + scrollProgress * 120}%)` }}
          />

          {/* Top Notch & Dynamic Island */}
          <div className="flex items-center justify-between px-2 pt-0.5 sm:pt-1 mb-2 sm:mb-3 text-slate-400 relative z-10">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="w-14 sm:w-16 h-3 sm:h-3.5 bg-black/60 rounded-full flex items-center justify-center">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-slate-700" />
            </div>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {/* User Welcome Banner */}
          <div className="px-1 mb-1.5 sm:mb-2 relative z-10">
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Welcome back 👋</span>
            <h3 className="text-white text-base sm:text-lg font-bold">Campus Mentee</h3>
          </div>

          {/* Metric / Mentorship Balance Card */}
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#161B2E] to-[#111422] border border-white/10 p-2.5 sm:p-3.5 mb-2 sm:mb-3 shadow-inner relative overflow-hidden z-10">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">1-on-1 Sessions Goal</span>
              {/* Overlapping Master-style Iridescent circles */}
              <div className="flex -space-x-1.5">
                <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-emerald-500/80" />
                <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-cyan-400/80" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1 sm:mb-2">
              100% Verified
            </div>

            {/* Soundwave Equalizer modulated vertically by scroll progress */}
            <div className="w-full h-6 sm:h-8 flex items-end justify-between gap-1 pt-0.5 opacity-90">
              {[40, 65, 30, 85, 95, 55, 75, 90, 45, 80, 100, 60, 40, 70, 85, 50].map((h, i) => {
                const dynamicHeight = Math.min(100, Math.max(15, h + Math.sin(scrollProgress * 8 + i * 0.6) * 35));
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full bg-gradient-to-t from-blue-500 via-purple-500 to-pink-400 transition-all duration-100"
                    style={{ height: `${dynamicHeight}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Recent Mentors / "Book again" Avatars with Real Database Mentors */}
          <div className="px-1 mb-2 sm:mb-3 relative z-10">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1.5 sm:mb-2 font-medium">
              <span className="text-slate-300">Book again</span>
              <span
                onClick={handleContinue}
                className="text-blue-400 hover:text-blue-300 cursor-pointer text-[9px] sm:text-[10px] transition-colors"
              >
                View all
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
              {displayMentors.map((mentor, i) => (
                <div
                  key={mentor.id || i}
                  onClick={() => handleMentorClick(mentor)}
                  className="flex flex-col items-center group cursor-pointer"
                  title={`View details of ${mentor.name}`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[1px] sm:p-[1.5px] bg-gradient-to-tr from-blue-500 to-purple-500 mb-1 group-hover:scale-110 transition-transform overflow-hidden shadow-md">
                    {mentor.img ? (
                      <img
                        src={mentor.img}
                        alt={mentor.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#131826] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {mentor.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-200 font-medium truncate w-full group-hover:text-blue-400 transition-colors">{mentor.name}</span>
                  <span className="text-[7.5px] sm:text-[8px] text-slate-500 truncate w-full">{mentor.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Electric Blue Action Button — Redirects to /login if not logged in, or /dashboard if logged in */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-2 sm:py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-lg shadow-blue-600/40 hover:shadow-blue-600/60 transition-all relative z-10 cursor-pointer active:scale-95"
          >
            Continue
          </button>
        </div>

        {/* ========================================================
            SCREEN 3: RIGHT FRONT WIDGET (Histogram & Activities)
            Vertical elevation in Z & Y as device unfolds
           ======================================================== */}
        <div
          className="hidden sm:flex absolute right-2 top-20 w-[240px] h-[390px] rounded-[36px] bg-[#101422] border-[5px] border-[#22283A] shadow-[0_30px_70px_rgba(0,0,0,0.9)] p-4 flex-col justify-between overflow-hidden transition-transform duration-150 z-30"
          style={{
            transform: `translateZ(${65 + scrollProgress * 45}px) translateY(${-scrollProgress * 20}px)`,
          }}
        >
          {/* Header & Date */}
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400">Current Semester</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="text-[9px] text-slate-500 font-medium">Completed 1-on-1 Sessions</div>
            <div className="text-xl font-bold text-white tracking-tight">24 Sessions</div>
          </div>

          {/* Histogram Bar Chart (Orange to Cyan bars from shot) */}
          <div className="my-2">
            <div className="h-16 flex items-end justify-between gap-1 px-1">
              {[25, 45, 35, 70, 95, 60, 40, 80].map((val, idx) => {
                const dynamicVal = Math.min(100, Math.max(15, val + Math.cos(scrollProgress * 6 + idx) * 20));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-orange-500 via-pink-500 to-cyan-400 transition-all duration-100"
                      style={{ height: `${dynamicVal}%` }}
                    />
                    <span className="text-[7px] text-slate-500 mt-1">{idx + 5}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest Activities */}
          <div className="space-y-2 mt-auto">
            <span className="text-[10px] text-slate-400 font-semibold block">Recent Milestones</span>

            {/* Activity 1: Google Mock Interview */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold text-blue-400">
                  G
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white leading-none">Mock Interview</div>
                  <div className="text-[8px] text-slate-400">System Design Prep</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400">Completed</span>
            </div>

            {/* Activity 2: Resume Review */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold text-purple-400">
                  R
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white leading-none">Resume Review</div>
                  <div className="text-[8px] text-slate-400">FAANG Alignment</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dribbble3DHeroMockup;
