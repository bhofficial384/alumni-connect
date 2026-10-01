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

  // Scroll progress for top beam and ambient parallax
  const [pageScroll, setPageScroll] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setPageScroll((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-white overflow-x-hidden selection:bg-[#2563EB] selection:text-white relative">
      
      {/* 3D Scroll Progress Luminous Top Beam */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 z-50 shadow-[0_0_12px_rgba(6,182,212,0.8)] pointer-events-none transition-all duration-75"
        style={{ width: `${pageScroll}%` }}
      />
      
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

                {/* Massive Bold Headline */}
                <h1 className="font-display text-5xl sm:text-6xl lg:text-[74px] font-extrabold text-white tracking-tight leading-[1.06] mb-6">
                  Mentorship for <br />
                  <span className="text-white">any career</span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-400 text-base sm:text-lg lg:text-xl font-normal max-w-lg mb-8 leading-relaxed">
                  A fully integrated suite of 1-on-1 mentorship, career acceleration, and verified alumni access.
                </p>

                {/* CTA Button: Electric Royal Blue Pill */}
                <div className="flex items-center gap-4 mb-14">
                  <Link
                    to={user?.role ? `/dashboard/${user.role}` : "/register"}
                    className="px-8 py-3.5 rounded-full text-white text-sm sm:text-base font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[0_12px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <span>{user?.role ? 'Go to Dashboard' : 'Start free trial'}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <a
                    href="#mentors"
                    className="px-6 py-3.5 rounded-full text-slate-300 hover:text-white text-sm font-semibold hover:bg-white/[0.06] transition-all"
                  >
                    Explore Mentors →
                  </a>
                </div>
              </div>

              {/* RIGHT COLUMN: 3D Floating Isometric Multi-Screen Mockup */}
              <div className="lg:col-span-6 relative z-10 flex items-center justify-center">
                <Dribbble3DHeroMockup />
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================
            BENTO CARDS (AI Assistant, 64m Metrics, Instant Booking)
           ======================================================== */}
        <DribbbleBentoCards />

        {/* ========================================================
            FEATURED MENTORS DIRECTORY
           ======================================================== */}
        <section id="mentors" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#38BDF8] block mb-2">
                VERIFIED DIRECTORY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Connect with industry alumni
              </h2>
            </div>
            <Link
              to={
                !user
                  ? '/register'
                  : user.role === 'student'
                  ? '/dashboard/student'
                  : `/dashboard/${user.role}`
              }
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{liveMentors.length > 0 ? `View all (${liveMentors.length}) mentors` : 'View all mentors'}</span>
              <span>→</span>
            </Link>
          </div>

          {mentorsLoading ? (
            <div className="py-12 flex justify-center items-center gap-3 text-slate-400">
              <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading verified mentors...</span>
            </div>
          ) : liveMentors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveMentors.map((m, idx) => {
                const avatar = m.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'Alumni Mentor')}&background=1D4ED8&color=fff&bold=true`;
                return (
                  <TiltCard3D key={m._id || idx} className="h-full">
                    <div className="rounded-[28px] bg-[#0E121C] border border-white/[0.08] p-6 shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between h-full group">
                      <div>
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                            <img
                              src={avatar}
                              alt={m.name || 'Mentor'}
                              className="w-full h-full rounded-[14px] object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base leading-tight">{m.name || 'Alumni Mentor'}</h4>
                            <p className="text-xs text-blue-400 font-medium">{m.domain || 'Tech & Systems'}</p>
                            <span className="text-[10px] text-slate-400">
                              {m.graduationYear ? `Class of '${m.graduationYear}` : 'Verified Alumnus'}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/[0.06] text-slate-200 border border-white/10">
                            {m.company || 'Industry Alumni'}
                          </span>
                        </div>

                        {m.bio ? (
                          <p className="text-xs text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                            {m.bio}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300">
                              Career Guidance
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300">
                              Mock Interview
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {m.availability?.length > 0 ? 'Live Slots Available' : 'Available by Request'}
                        </span>
                        <Link
                          to={
                            !user
                              ? '/login'
                              : user.role === 'student'
                              ? `/dashboard/student?search=${encodeURIComponent(m.company || m.name || '')}`
                              : `/dashboard/${user.role}`
                          }
                          className="px-3.5 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
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
            <div className="rounded-[28px] bg-[#0E121C] border border-white/[0.08] p-10 text-center max-w-xl mx-auto shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl mx-auto mb-4">
                🎓
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verified Mentorship Network</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Alumni from leading industries are joining for this semester's 1-on-1 sessions. Are you a graduate or working professional?
              </p>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-lg shadow-blue-600/40 transition-all inline-block"
              >
                Join as an Alumni Mentor →
              </Link>
            </div>
          )}
        </section>

        {/* ========================================================
            HOW IT WORKS (Search by Company → Book 1-on-1 Slot → Get Mentored)
           ======================================================== */}
        <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8] block mb-2">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Search by Company → Book 1-on-1 Slot → Get Mentored
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              A streamlined three-step workflow designed to connect engineering students directly with industry alumni.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Search by Company',
                desc: 'Filter verified alumni by target company (Google, Stripe, Goldman Sachs), graduation batch, and technical domain.',
                accent: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
              },
              {
                step: '02',
                title: 'Book 1-on-1 Slot',
                desc: 'Pick an available time slot directly from the mentor’s live calendar with instant session request dispatch.',
                accent: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
              },
              {
                step: '03',
                title: 'Get Mentored',
                desc: 'Attend your dedicated 1-on-1 video session for mock interviews, career guidance, and actionable resume feedback.',
                accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              }
            ].map((s, idx) => (
              <div key={idx} className="rounded-[30px] bg-[#0E121C] border border-white/[0.08] p-8 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-5 ${s.accent}`}>
                  Step {s.step}
                </span>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            ABOUT US (Alumni Association Mission & Vision)
           ======================================================== */}
        <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#0E121C] border border-white/[0.08] p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-3xl mb-12">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 block mb-2">
                ABOUT US
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Alumni Association Mission & Vision
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Founded by the University Alumni Association, AlumniConnect serves as the official bridge between current engineering students and accomplished graduates. We foster a collaborative campus ecosystem where alumni give back through structured, high-impact 1-on-1 mentorship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#131826] border border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 text-xl">
                  🎯
                </div>
                <h3 className="font-bold text-base text-white mb-2">Our Mission</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  To democratize access to elite tech and corporate careers by pairing student mentees directly with proven industry alumni who share their domain passion.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#131826] border border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 text-xl">
                  🔭
                </div>
                <h3 className="font-bold text-base text-white mb-2">Our Vision</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  A thriving alumni-student network where every graduating engineer is empowered with real-world interview preparation, industry insights, and career confidence.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#131826] border border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 text-xl">
                  🤝
                </div>
                <h3 className="font-bold text-base text-white mb-2">Community Commitment</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Over 500+ active alumni mentors across software engineering, data science, product management, and investment banking volunteering their time for student success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SUCCESS STORIES / TESTIMONIALS (Mentee Placement Success)
           ======================================================== */}
        <section id="testimonials" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EC4899] block mb-2">
              REAL RESULTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Backed by verified student offers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The mock interview sessions with Rajesh helped me crack my Google SWE offer. His advice on distributed systems and DSA preparation was spot on.",
                name: "Vikram Mehta",
                offer: "Google SWE Intern",
                batch: "Class of 2024"
              },
              {
                quote: "Priya's feedback on financial modeling and IB behavioral rounds made all the difference in receiving an offer from Goldman Sachs.",
                name: "Neha Gupta",
                offer: "Goldman Sachs Analyst",
                batch: "Class of 2023"
              },
              {
                quote: "Amit helped me master case interview structuring in just 3 sessions. His frameworks gave me complete confidence in final round interviews.",
                name: "Arjun Das",
                offer: "McKinsey Associate",
                batch: "Class of 2024"
              }
            ].map((t, idx) => (
              <div key={idx} className="rounded-[30px] bg-[#0E121C] border border-white/[0.08] p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 text-xs mb-4">★★★★★</div>
                  <p className="text-slate-300 text-sm leading-relaxed italic mb-6">"{t.quote}"</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-blue-400 font-medium">{t.offer}</div>
                  <div className="text-[10px] text-slate-500">{t.batch}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            CONTACT SECTION
           ======================================================== */}
        <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#0E121C] border border-white/[0.08] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#38BDF8] block">
                  ALUMNI RELATIONS OFFICE
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Alumni Relations Office & Helpdesk
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Have questions about mentor onboarding, session scheduling, or campus alumni chapters? Our dedicated alumni relations officers are here to help.
                </p>
                <div className="pt-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>✉️</span>
                    <span><strong>Helpdesk Email:</strong> alumni-relations@university.edu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span><strong>Direct Desk:</strong> +1 (555) 019-2834</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏰</span>
                    <span><strong>Operating Hours:</strong> Monday – Friday: 9:00 AM – 5:00 PM EST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span><strong>Office:</strong> Alumni Center, Room 204, Campus Main Gate</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactSuccess && (
                    <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl text-xs border border-emerald-500/30">
                      ✓ Message dispatched! We will reply within 24 hours.
                    </div>
                  )}
                  {contactError && (
                    <div className="p-3 bg-red-500/10 text-red-300 rounded-xl text-xs border border-red-500/30">
                      {contactError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="input-field text-sm"
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="input-field text-sm"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Subject"
                    className="input-field text-sm"
                    value={contactForm.subject}
                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Your inquiry..."
                    className="input-field text-sm min-h-[100px]"
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="px-8 py-3 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-lg shadow-blue-600/40 transition-all disabled:opacity-50"
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
