import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Dribbble3DHeroMockup from '../components/Dribbble3DHeroMockup';
import DribbbleBentoCards from '../components/DribbbleBentoCards';
import TiltCard3D from '../components/TiltCard3D';
import Hero3DScene from '../components/Hero3DScene';
import MentorDetailsModal from '../components/MentorDetailsModal';

/**
 * Landing — Recreating Tran Mau Tri Tam's "ELITE." Dribbble Landing Page (Shot 23209099).
 * Featuring fluid aurora backdrop, rounded obsidian luxury hero container,
 * 3D isometric floating phone mockups, dual-line charts, and AI assistant bento cards.
 */
const Landing = () => {
  const { user } = useAuth();
  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  // Live real mentors state
  const [liveMentors, setLiveMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showAllMentors, setShowAllMentors] = useState(false);

  React.useEffect(() => {
    const fetchLiveMentors = async () => {
      try {
        const res = await api.get('/mentors');
        if (Array.isArray(res.data)) {
          setLiveMentors(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch live mentors for landing page:', err);
      } finally {
        setMentorsLoading(false);
      }
    };
    fetchLiveMentors();
  }, []);

  // Handle contact form submission — POST /api/contact
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    setContactSuccess(false);
    try {
      await api.post('/contact', contactForm);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

// Isolated, ultra-performant scroll progress indicator that never re-renders parent tree
const ScrollProgressBeam = React.memo(() => {
  const barRef = React.useRef(null);

  React.useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && barRef.current) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        barRef.current.style.width = `${pct}%`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 z-50 shadow-[0_0_12px_rgba(6,182,212,0.8)] pointer-events-none transition-all duration-75"
      style={{ width: '0%' }}
    />
  );
});

  return (
    <div className="min-h-screen bg-[#07090E] text-white overflow-x-hidden selection:bg-[#2563EB] selection:text-white relative">
      
      {/* 3D Scroll Progress Luminous Top Beam */}
      <ScrollProgressBeam />
      
      {/* ========================================================
          FLUID AURORA BACKGROUND MESH (Surrounding Frame)
         ======================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Coral/Pink Blob (Top Left) */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#FF3366]/15 rounded-full blur-[160px] animate-glow-pulse" />
        {/* Electric Cyan/Blue Blob (Top Right) */}
        <div className="absolute top-10 -right-32 w-[650px] h-[650px] bg-[#00F0FF]/15 rounded-full blur-[170px] animate-pulse-slow" />
        {/* Sunset Orange/Gold Blob (Center Left) */}
        <div className="absolute top-[45%] -left-40 w-[550px] h-[550px] bg-[#FF7A00]/12 rounded-full blur-[150px]" />
        {/* Royal Blue / Purple Blob (Bottom Right) */}
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-[#3B82F6]/15 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10">
        {/* Top Floating Navbar */}
        <Navbar />

        {/* ========================================================
            HERO CONTAINER (Tran Mau Tri Tam Rounded Luxury Card)
           ======================================================== */}
        <section className="px-3 sm:px-6 lg:px-8 pt-4 pb-12">
          <div className="max-w-[1360px] mx-auto rounded-[36px] bg-[#0E121C] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.85)] p-6 sm:p-10 lg:p-14 relative overflow-hidden">
            
            {/* 3D Interactive Small Bubble & Particle Canvas Scene */}
            <Hero3DScene />

            {/* Ambient inner soft highlight */}
            <div className="absolute -top-40 left-1/4 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Floating ambient translucent glowing bubbles */}
            <div className="absolute top-20 left-1/3 w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/25 blur-[1px] animate-float-slow pointer-events-none" />
            <div className="absolute bottom-24 left-14 w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/25 blur-[1px] animate-float-reverse pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-pink-500/10 border border-pink-500/20 blur-[1px] animate-float-slow pointer-events-none" />
            <div className="absolute top-16 right-16 w-8 h-8 rounded-full bg-amber-400/15 border border-amber-400/30 blur-[1px] animate-float-reverse pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[580px]">
              
              {/* LEFT COLUMN: Hero Copy & CTA */}
              <div className="lg:col-span-6 flex flex-col justify-center relative z-10 pt-4 lg:pt-0">
                
                {/* Mint/Cyan Tracked Kicker Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                    INTRODUCING ALUMNI MENTORSHIP
                  </span>
                </div>

                {/* Responsive Headline */}
                <h1 className="font-display text-4xl sm:text-6xl lg:text-[74px] font-extrabold text-white tracking-tight leading-[1.08] sm:leading-[1.06] mb-5 sm:mb-6">
                  Mentorship for <br />
                  <span className="text-white">any career</span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-400 text-sm sm:text-lg lg:text-xl font-normal max-w-lg mb-6 sm:mb-8 leading-relaxed">
                  A fully integrated suite of 1-on-1 mentorship, career acceleration, and verified alumni access.
                </p>

                {/* CTA Buttons: Responsive stack on mobile, row on tablet/desktop */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-14">
                  <Link
                    to={user?.role ? `/dashboard/${user.role}` : "/register"}
                    className="px-7 py-3.5 rounded-full text-white text-sm sm:text-base font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[0_12px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center justify-center gap-2 text-center"
                  >
                    <span>{user?.role ? 'Go to Dashboard' : 'Start free trial'}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <a
                    href="#mentors"
                    className="px-6 py-3.5 rounded-full text-slate-300 hover:text-white text-sm font-semibold hover:bg-white/[0.06] transition-all text-center"
                  >
                    Explore Mentors →
                  </a>
                </div>
              </div>

              {/* RIGHT COLUMN: 3D Floating Isometric Multi-Screen Mockup */}
              <div className="lg:col-span-6 relative z-10 flex items-center justify-center">
                <Dribbble3DHeroMockup 
                  mentors={liveMentors} 
                  onMentorSelect={(m) => setSelectedMentor(m)}
                />
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================
            BENTO CARDS (AI Assistant, 64m Metrics, Instant Booking)
           ======================================================== */}
        <DribbbleBentoCards />
        {/* Luminous Neon Divider Conduit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/30 via-purple-500/30 to-transparent relative">
            <div className="absolute inset-y-0 left-1/3 right-1/3 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-sm" />
          </div>
        </div>

        {/* ========================================================
            SECTION 1: HOW IT WORKS (Search by Company → Book 1-on-1 Slot → Get Mentored)
           ======================================================== */}
        <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Central Ambient Nebula */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/12 rounded-full blur-[160px] pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#A855F7]" />
              <span>3-Step Career Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Search by Company → Book 1-on-1 Slot → Get Mentored
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
              A high-impact workflow engineered to bridge university students directly with verified alumni across the globe.
            </p>
          </div>

          <div className="relative z-10">
            {/* Luminous Neon Connecting Bar across desktop cards */}
            <div className="hidden md:block absolute top-[110px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-cyan-500/40 via-purple-500/50 to-emerald-500/40 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 blur-[2px] opacity-70 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 01 */}
              <TiltCard3D className="h-full">
                <div className="rounded-[32px] bg-[#0E121C] border border-white/[0.08] hover:border-cyan-400/50 p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.22)] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between h-full">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/15 group-hover:bg-cyan-500/25 rounded-full blur-2xl transition-all pointer-events-none" />
                  
                  <div>
                    {/* Glowing 3D Orb Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-lg shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:scale-105 transition-transform">
                        01
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/25">
                        DISCOVERY
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      Search by Company
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Filter verified alumni by target company (Google, Stripe, Goldman Sachs, Microsoft), graduation batch, and engineering technical domain.
                    </p>

                    {/* Interactive mock tag pills */}
                    <div className="p-3.5 rounded-2xl bg-[#131826]/90 border border-white/5 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Top Recruited Firms</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">Google</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">Stripe</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Goldman Sachs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard3D>

              {/* Step 02 */}
              <TiltCard3D className="h-full">
                <div className="rounded-[32px] bg-[#0E121C] border border-white/[0.08] hover:border-purple-400/50 p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(168,85,247,0.22)] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between h-full">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/15 group-hover:bg-purple-500/25 rounded-full blur-2xl transition-all pointer-events-none" />
                  
                  <div>
                    {/* Glowing 3D Orb Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-lg shadow-[0_0_20px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-transform">
                        02
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/25">
                        BOOKING
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      Book 1-on-1 Slot
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Pick an available time slot directly from the mentor’s live calendar with instant session dispatch and automated email reminders.
                    </p>

                    {/* Interactive mock calendar badge */}
                    <div className="p-3.5 rounded-2xl bg-[#131826]/90 border border-white/5 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Live Time Slot</div>
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
                        <span>🗓️ Tomorrow, 6:00 PM</span>
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Confirmed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard3D>

              {/* Step 03 */}
              <TiltCard3D className="h-full">
                <div className="rounded-[32px] bg-[#0E121C] border border-white/[0.08] hover:border-emerald-400/50 p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.22)] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between h-full">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/15 group-hover:bg-emerald-500/25 rounded-full blur-2xl transition-all pointer-events-none" />
                  
                  <div>
                    {/* Glowing 3D Orb Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
                        03
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                        ELEVATION
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                      Get Mentored
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Attend your dedicated 1-on-1 video session for real mock interviews, career guidance, salary negotiation, and line-by-line resume critique.
                    </p>

                    {/* Interactive mock checklist */}
                    <div className="p-3.5 rounded-2xl bg-[#131826]/90 border border-white/5 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <span>✓</span> <span>System Design & Coding Mock</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <span>✓</span> <span>Actionable Resume Edits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </div>
        </section>

        {/* Luminous Neon Divider Conduit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/30 via-blue-500/30 to-transparent relative">
            <div className="absolute inset-y-0 left-1/3 right-1/3 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent blur-sm" />
          </div>
        </div>

        {/* ========================================================
            SECTION 2: FEATURED MENTORS DIRECTORY
           ======================================================== */}
        <section id="mentors" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Ambient Lighting Halos */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/12 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-purple-600/12 rounded-full blur-[150px] pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22D3EE]" />
                <span>Verified Industry Alumni</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Connect with industry alumni
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
                Book direct 1-on-1 sessions with accomplished graduates working at Fortune 500 and top-tier tech companies.
              </p>
            </div>
            {liveMentors.length > 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (showAllMentors) {
                    setShowAllMentors(false);
                    const el = document.getElementById('mentors');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setShowAllMentors(true);
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400/60 text-sm font-semibold text-blue-300 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer group shadow-lg shadow-blue-500/15"
              >
                <span>{showAllMentors ? 'Show top 4 only' : `View all (${liveMentors.length}) mentors`}</span>
                <span className="transition-transform group-hover:translate-x-1">
                  {showAllMentors ? '↑' : '→'}
                </span>
              </button>
            ) : liveMentors.length > 0 ? (
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-slate-300">
                {liveMentors.length} Verified Mentors Active
              </span>
            ) : null}
          </div>

          {mentorsLoading ? (
            <div className="py-16 flex justify-center items-center gap-3 text-slate-400">
              <svg className="animate-spin h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium text-sm">Loading verified mentors...</span>
            </div>
          ) : liveMentors.length > 0 ? (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(showAllMentors ? liveMentors : liveMentors.slice(0, 4)).map((m, idx) => {
                const avatar = m.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'Alumni Mentor')}&background=1D4ED8&color=fff&bold=true`;
                return (
                  <TiltCard3D key={m._id || idx} className="h-full">
                    <div 
                      onClick={() => setSelectedMentor(m)}
                      className="relative overflow-hidden rounded-[28px] bg-[#0E121C] border border-white/[0.08] hover:border-cyan-400/50 p-6 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.22)] transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer before:absolute before:inset-0 before:-translate-x-full group-hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent before:transition-transform before:duration-1000 before:pointer-events-none"
                    >
                      {/* Corner Neon Light Flare */}
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent group-hover:from-cyan-500/30 rounded-full blur-2xl transition-all pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className="relative w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-lg shadow-blue-500/25">
                            <img
                              src={avatar}
                              alt={m.name || 'Mentor'}
                              className="w-full h-full rounded-[14px] object-cover"
                            />
                            {/* Online green indicator */}
                            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0E121C] shadow-[0_0_8px_#34D399]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors">
                              {m.name || 'Alumni Mentor'}
                            </h4>
                            <p className="text-xs text-blue-400 font-medium">{m.domain || 'Tech & Systems'}</p>
                            <span className="text-[10px] text-slate-400">
                              {m.graduationYear ? `Class of '${m.graduationYear}` : 'Verified Alumnus'}
                            </span>
                          </div>
                        </div>

                        {/* LinkedIn headline or Company badge */}
                        {m.headline ? (
                          <p className="text-xs text-cyan-300 font-medium line-clamp-2 mb-3 leading-snug">
                            {m.headline}
                          </p>
                        ) : (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/[0.06] text-slate-200 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                              {m.designation ? `${m.designation} @ ` : ''}{m.company || 'Industry Alumni'}
                            </span>
                            {m.experienceYears && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                                {m.experienceYears}+ Yrs Exp
                              </span>
                            )}
                          </div>
                        )}

                        {/* Skills badges with glowing pills */}
                        {m.skills && (Array.isArray(m.skills) ? m.skills.length > 0 : Boolean(m.skills)) ? (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {(Array.isArray(m.skills) ? m.skills : m.skills.split(',').map(s => s.trim()).filter(Boolean)).slice(0, 3).map((sk, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                                {sk}
                              </span>
                            ))}
                            {(Array.isArray(m.skills) ? m.skills : m.skills.split(',').length) > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{(Array.isArray(m.skills) ? m.skills : m.skills.split(',').length) - 3} more
                              </span>
                            )}
                          </div>
                        ) : m.bio ? (
                          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed italic">
                            "{m.bio}"
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-300">
                              Career Guidance
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-300">
                              Mock Interview
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]"></span>
                          {m.availability?.length > 0 ? 'Live Slots' : 'Available'}
                        </span>
                        <Link
                          to={
                            !user
                              ? '/login'
                              : user.role === 'student'
                              ? `/dashboard/student?search=${encodeURIComponent(m.company || m.name || '')}`
                              : `/dashboard/${user.role}`
                          }
                          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Book Slot
                        </Link>
                      </div>
                    </div>
                  </TiltCard3D>
                );
              })}
            </div>
          ) : (
            <div className="relative z-10 rounded-[32px] bg-[#0E121C] border border-white/[0.08] p-10 text-center max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
                🎓
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verified Mentorship Network</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Alumni from leading industries are joining for this semester's 1-on-1 sessions. Are you a graduate or working professional?
              </p>
              <Link
                to="/register"
                className="px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-600/40 hover:scale-105 transition-all inline-block"
              >
                Join as an Alumni Mentor →
              </Link>
            </div>
          )}
        </section>

        {/* Luminous Neon Divider Conduit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/30 via-cyan-500/30 to-transparent relative">
            <div className="absolute inset-y-0 left-1/3 right-1/3 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-sm" />
          </div>
        </div>

        {/* ========================================================
            SECTION 3: ABOUT US (Alumni Association Mission & Vision)
           ======================================================== */}
        <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="rounded-[36px] bg-[#0E121C] border border-white/[0.1] p-8 sm:p-12 lg:p-16 shadow-[0_30px_100px_rgba(0,0,0,0.85)] relative overflow-hidden">
            {/* Luminous Top Laser Line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 via-purple-400/60 to-transparent pointer-events-none" />

            {/* Glowing Nebula Lighting Blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/12 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22D3EE]" />
                <span>ABOUT ALUMNICONNECT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Alumni Association Mission & Vision
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Founded by the University Alumni Association, AlumniConnect serves as the official technological bridge between current engineering students and accomplished graduates worldwide. We foster a collaborative campus ecosystem where alumni give back through structured, high-impact 1-on-1 mentorship.
              </p>
            </div>

            {/* 4 Telemetry Metric Stat Pillars */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="p-5 rounded-2xl bg-[#131826]/80 border border-white/5 hover:border-cyan-500/30 transition-all shadow-lg">
                <div className="text-3xl sm:text-4xl font-black text-cyan-400 tracking-tight mb-1">500+</div>
                <div className="text-xs text-slate-300 font-semibold">Active Alumni Mentors</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Verified across 30+ countries</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#131826]/80 border border-white/5 hover:border-emerald-500/30 transition-all shadow-lg">
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mb-1">98%</div>
                <div className="text-xs text-slate-300 font-semibold">Placement Success Rate</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Students receiving job offers</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#131826]/80 border border-white/5 hover:border-purple-500/30 transition-all shadow-lg">
                <div className="text-3xl sm:text-4xl font-black text-purple-400 tracking-tight mb-1">50+</div>
                <div className="text-xs text-slate-300 font-semibold">Fortune 500 Companies</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Represented in directory</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#131826]/80 border border-white/5 hover:border-amber-500/30 transition-all shadow-lg">
                <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight mb-1">100%</div>
                <div className="text-xs text-slate-300 font-semibold">Free for Students</div>
                <div className="text-[10px] text-slate-500 mt-0.5">University backed initiative</div>
              </div>
            </div>

            {/* 3 Core Pillar Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-7 rounded-3xl bg-[#131826] border border-white/[0.08] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
                  🎯
                </div>
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-cyan-300 transition-colors">Our Mission</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  To democratize access to elite tech and corporate careers by pairing student mentees directly with proven industry alumni who share their technical domain and aspirations.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#131826] border border-white/[0.08] hover:border-purple-400/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.18)] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 text-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform">
                  🔭
                </div>
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-300 transition-colors">Our Vision</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  A thriving global alumni-student network where every graduating engineer is empowered with real-world interview preparation, industry insights, and career confidence.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#131826] border border-white/[0.08] hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.18)] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
                  🤝
                </div>
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-300 transition-colors">Community Commitment</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Over 500+ active alumni mentors across software engineering, data science, product management, and investment banking volunteering their time for campus student success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Luminous Neon Divider Conduit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/30 via-pink-500/30 to-transparent relative">
            <div className="absolute inset-y-0 left-1/3 right-1/3 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent blur-sm" />
          </div>
        </div>

        {/* ========================================================
            SECTION 4: SUCCESS STORIES / TESTIMONIALS (Mentee Placement Success)
           ======================================================== */}
        <section id="testimonials" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Ambient Lighting Nebula */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-pink-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(236,72,153,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse shadow-[0_0_8px_#F472B6]" />
              <span>TESTIMONIALS & PLACEMENTS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Backed by verified student offers
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Discover how university students transformed their interview readiness into dream corporate offers.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The mock interview sessions with Rajesh helped me crack my Google SWE offer. His advice on distributed systems and DSA preparation was spot on.",
                name: "Vikram Mehta",
                offer: "Google SWE Intern",
                batch: "Class of 2024",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
                badgeColor: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
              },
              {
                quote: "Priya's feedback on financial modeling and IB behavioral rounds made all the difference in receiving an offer from Goldman Sachs.",
                name: "Neha Gupta",
                offer: "Goldman Sachs Analyst",
                batch: "Class of 2023",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
                badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-300"
              },
              {
                quote: "Amit helped me master case interview structuring in just 3 sessions. His frameworks gave me complete confidence in final round partner interviews.",
                name: "Arjun Das",
                offer: "McKinsey Associate",
                batch: "Class of 2024",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
                badgeColor: "bg-purple-500/15 border-purple-500/30 text-purple-300"
              }
            ].map((t, idx) => (
              <TiltCard3D key={idx} className="h-full">
                <div className="relative overflow-hidden rounded-[32px] bg-[#0E121C] border border-white/[0.08] hover:border-pink-500/40 p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.22)] transition-all duration-300 flex flex-col justify-between h-full group before:absolute before:inset-0 before:-translate-x-full group-hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent before:transition-transform before:duration-1000 before:pointer-events-none">
                  {/* Subtle corner light halo */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-pink-500/15 group-hover:bg-pink-500/25 rounded-full blur-2xl transition-all pointer-events-none" />

                  <div className="relative z-10">
                    {/* Glowing Stars + Quotation icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-1 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                        {[...Array(5)].map((_, s) => (
                          <span key={s} className="text-sm">★</span>
                        ))}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-300 text-lg font-serif">
                        “
                      </div>
                    </div>

                    <p className="text-slate-200 text-sm leading-relaxed italic mb-8">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="relative z-10 pt-5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-500 shrink-0 shadow-md">
                        <img src={t.avatar} alt={t.name} className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">{t.name}</div>
                        <div className="text-[10px] text-slate-400">{t.batch}</div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${t.badgeColor} shadow-sm`}>
                      {t.offer}
                    </span>
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </section>

        {/* Luminous Neon Divider Conduit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500/30 via-blue-500/30 to-transparent relative">
            <div className="absolute inset-y-0 left-1/3 right-1/3 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent blur-sm" />
          </div>
        </div>

        {/* ========================================================
            SECTION 5: CONTACT SECTION
           ======================================================== */}
        <section id="contact" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Ambient Lighting Nebula */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/12 rounded-full blur-[160px] pointer-events-none" />

          <div className="relative z-10 rounded-[36px] bg-[#0E121C] border border-white/[0.1] p-8 sm:p-14 shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Luminous Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 via-blue-500/60 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Helpdesk & Office Channels */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(37,99,235,0.25)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#3B82F6]" />
                    <span>ALUMNI RELATIONS OFFICE</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Alumni Relations Helpdesk
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mt-3">
                    Have questions about mentor onboarding, session scheduling, or campus alumni chapters? Our dedicated alumni relations officers are here to assist.
                  </p>
                </div>

                {/* Interactive Contact Channel Cards */}
                <div className="space-y-3">
                  <a
                    href="mailto:alumni-relations@university.edu"
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131826]/80 hover:bg-[#182033] border border-white/5 hover:border-cyan-500/40 transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg group-hover:scale-105 transition-transform">
                      ✉️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Helpdesk Email</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-cyan-300 truncate transition-colors">
                        alumni-relations@university.edu
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
                  </a>

                  <a
                    href="tel:+15550192834"
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131826]/80 hover:bg-[#182033] border border-white/5 hover:border-purple-500/40 transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg group-hover:scale-105 transition-transform">
                      📞
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direct Desk Phone</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                        +1 (555) 019-2834
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-purple-400 transition-colors">→</span>
                  </a>

                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131826]/80 border border-white/5 shadow-md">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                      ⏰
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operating Hours</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200">
                        Monday – Friday: 9:00 AM – 5:00 PM EST
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131826]/80 border border-white/5 shadow-md">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                      📍
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Campus Office</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200">
                        Alumni Center, Room 204, Campus Main Gate
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Tech Cyber Console Form */}
              <div className="lg:col-span-7">
                <div className="p-6 sm:p-8 rounded-3xl bg-[#131826]/90 border border-white/10 shadow-2xl relative">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>Send a Dispatch</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      Response within 24h
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Drop your question or suggestion directly to the alumni engagement team.
                  </p>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {contactSuccess && (
                      <div className="p-3.5 bg-emerald-500/15 text-emerald-300 rounded-xl text-xs border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2">
                        <span>✓</span>
                        <span>Message dispatched successfully! Our team will reply within 24 hours.</span>
                      </div>
                    )}
                    {contactError && (
                      <div className="p-3.5 bg-red-500/15 text-red-300 rounded-xl text-xs border border-red-500/30 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{contactError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          className="input-field text-sm focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
                          value={contactForm.name}
                          onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. rahul@university.edu"
                          className="input-field text-sm focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
                          value={contactForm.email}
                          onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Inquiry Subject *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Question regarding mentor onboarding or career guidance"
                        className="input-field text-sm focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
                        value={contactForm.subject}
                        onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Your Inquiry Message *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Detailed message..."
                        className="input-field text-sm focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all resize-none"
                        value={contactForm.message}
                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold shadow-[0_4px_25px_rgba(37,99,235,0.45)] hover:shadow-[0_4px_35px_rgba(168,85,247,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {contactLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Dispatching Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mentor Details Modal */}
      <MentorDetailsModal
        mentor={selectedMentor}
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
        onConnect={(m) => {
          setSelectedMentor(null);
          if (!user) {
            window.location.href = '/login';
          } else if (user.role === 'student') {
            window.location.href = `/dashboard/student?search=${encodeURIComponent(m.company || m.name || '')}`;
          } else {
            window.location.href = `/dashboard/${user.role}`;
          }
        }}
        connectLabel={!user ? "Login to Book Session" : "Connect & Book Slot"}
      />
    </div>
  );
};

export default Landing;
