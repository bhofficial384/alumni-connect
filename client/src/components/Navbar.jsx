import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NavbarLogo3D from './NavbarLogo3D';
import ThemeToggle from './ThemeToggle';
import EmailVerificationModal from './EmailVerificationModal';
import ProfileModal from './ProfileModal';
import { getInitials } from '../utils/imageUtils';

/**
 * Navbar — Elevated Cyber-Glassmorphic Header
 * Features interactive 3D canvas logo polyhedron, celestial 3D dark/light mode toggle,
 * luminous gradient laser edge, tactile glass pills, and responsive mobile drawer.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <nav
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        isDark
          ? 'bg-[#07090E]/85 border-b border-white/[0.08] text-white shadow-[0_12px_36px_rgba(0,0,0,0.65)]'
          : 'bg-white/85 border-b border-slate-200/90 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
      } backdrop-blur-2xl relative`}
    >
      {/* Ambient Traveling Holographic Laser Beam along bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-500/20 via-purple-500/20 to-transparent" />
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400 via-indigo-400 to-transparent blur-[1px] animate-laser-beam opacity-90" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center gap-2 lg:gap-4 flex-nowrap">
          {/* Logo with 3D Canvas Graphic */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group select-none">
              <NavbarLogo3D />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className={`font-display text-lg sm:text-xl lg:text-2xl font-black tracking-tight transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    ALUMNI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 font-extrabold">CONNECT</span>
                  </span>
                  <span className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Network
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-slate-400 -mt-0.5 hidden lg:block">
                  Mentorship & Career Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links: 5 Distinct Sections Adjusted in One Line */}
          <div
            className={`hidden md:flex items-center space-x-0.5 lg:space-x-1 p-1 rounded-full border transition-all duration-300 shrink-0 ${
              isDark
                ? 'bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                : 'bg-slate-900/[0.03] border-slate-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
            }`}
          >
            {[
              { label: 'How It Works', id: 'how-it-works', href: '/#how-it-works' },
              { label: 'Mentors', id: 'mentors', href: '/#mentors' },
              { label: 'About Us', id: 'about', href: '/#about' },
              { label: 'Stories', id: 'testimonials', href: '/#testimonials' },
              { label: 'Contact', id: 'contact', href: '/#contact' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (window.location.pathname === '/' || window.location.pathname === '') {
                    e.preventDefault();
                    const el = document.getElementById(link.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                      window.history.pushState(null, '', `/#${link.id}`);
                    }
                  }
                }}
                className={`relative px-2.5 lg:px-3.5 py-1.5 rounded-full text-[11px] lg:text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-300 group ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute bottom-1 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 origin-center" />
              </a>
            ))}
          </div>

          {/* Right Header Actions: 3D Theme Switcher + Auth / Profile Adjusted in One Line */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            {/* 3D Celestial Dark / Light Mode Switcher */}
            <ThemeToggle />

            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border hover:scale-105 active:scale-95 ${
                    isDark
                      ? 'border-white/10 text-slate-200 bg-white/[0.05] hover:bg-white/[0.12] hover:text-white hover:border-white/20'
                      : 'border-slate-300/80 text-slate-700 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="relative group overflow-hidden px-4 lg:px-5 py-1.5 lg:py-2 rounded-full text-xs font-bold text-white whitespace-nowrap bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_24px_rgba(168,85,247,0.55)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                  <span className="relative z-10">Start free trial</span>
                  <span className="relative z-10 text-xs transition-transform group-hover:translate-x-1 duration-300">→</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to={`/dashboard/${user.role}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile & Photo Button */}
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all cursor-pointer group ${
                    isDark
                      ? 'bg-white/[0.05] hover:bg-white/[0.12] border-white/10 hover:border-blue-500/40'
                      : 'bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 hover:border-blue-500/50'
                  }`}
                  title="View & Edit Profile Photo"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full rounded-full bg-[#0E121C] text-[10px] font-bold text-white flex items-center justify-center">
                        {getInitials(user.name)}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                    Profile
                  </span>
                </button>

                {/* Email Verification Status */}
                {user.isEmailVerified ? (
                  <span
                    title="Email Verified"
                    className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>✓</span>
                    <span>Verified</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(true)}
                    className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>⚠️</span>
                    <span>Verify</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Bar: Theme Toggle + Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b transition-colors shadow-2xl animate-fade-in ${
            isDark
              ? 'bg-[#0A0D15]/98 border-white/10 text-white'
              : 'bg-white/98 border-slate-200 text-slate-900'
          } backdrop-blur-2xl`}
        >
          <div className="px-5 pt-4 pb-6 space-y-3">
            {/* Theme Toggle row in mobile menu */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Appearance Mode
              </span>
              <ThemeToggle showLabel={true} />
            </div>

            <a
              href="/#how-it-works"
              className={`block py-2 text-sm font-semibold transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="/#mentors"
              className={`block py-2 text-sm font-semibold transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Mentors
            </a>
            <a
              href="/#about"
              className={`block py-2 text-sm font-semibold transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              href="/#testimonials"
              className={`block py-2 text-sm font-semibold transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Stories
            </a>
            <a
              href="/#contact"
              className={`block py-2 text-sm font-semibold transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>

            <div className="pt-3 border-t border-white/10 space-y-3">
              {!user ? (
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    to="/login"
                    className={`block w-full py-2.5 text-center rounded-xl text-sm font-semibold border transition-all ${
                      isDark
                        ? 'text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border-white/10'
                        : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full py-2.5 text-center rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start free trial
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* User Profile summary on mobile */}
                  <div className={`flex items-center gap-3 p-2.5 rounded-2xl border ${
                    isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shrink-0">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="w-full h-full rounded-full bg-[#0E121C] text-xs font-bold text-white flex items-center justify-center">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{user.role} Account</div>
                    </div>
                    {user.isEmailVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        ✓ Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setShowVerifyModal(true); setMobileMenuOpen(false); }}
                        className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold"
                      >
                        ⚠️ Verify
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/dashboard/${user.role}`}
                    className="block w-full py-2.5 text-center rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 transition-all shadow-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
                    className={`block w-full py-2.5 text-center rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      isDark ? 'text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border-white/10' : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    My Profile & Photo
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="block w-full py-2 text-center text-xs font-medium text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6-Digit OTP Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />

      {/* Profile & Photo Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </nav>
  );
};

export default React.memo(Navbar);
