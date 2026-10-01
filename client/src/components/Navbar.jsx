import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmailVerificationModal from './EmailVerificationModal';
import ProfileModal from './ProfileModal';
import { getInitials } from '../utils/imageUtils';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[#07090E]/85 backdrop-blur-xl border-b border-white/10 text-white transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-all duration-300">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="font-display text-xl font-extrabold tracking-wider text-white">
                ALUMNI<span className="text-[#2563EB]">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">How It Works</a>
            <a href="/#mentors" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Mentors</a>
            <a href="/#about" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">About Us</a>
            <a href="/#testimonials" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Stories</a>
            <a href="/#contact" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Contact</a>

            <div className="flex items-center gap-3 pl-2">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-slate-300 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white border border-white/10 transition-all"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
                  >
                    Start free trial
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/dashboard/${user.role}`}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                  >
                    Dashboard
                  </Link>

                  {/* Profile & Photo Button */}
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group"
                    title="View & Edit Profile Photo"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shrink-0">
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
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">Profile</span>
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
                      <span>Verify Email</span>
                    </button>
                  )}

                  <span className="text-xs text-slate-400 font-medium hidden lg:inline">Hi, {user.name?.split(' ')[0]}</span>
                  <button
                    onClick={logout}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white">
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-dark border-b border-navy-light shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-4">
            {!user ? (
              <>
                <a href="#how-it-works" className="block text-gray-300 hover:text-gold" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="#mentors" className="block text-gray-300 hover:text-gold" onClick={() => setMobileMenuOpen(false)}>Mentors</a>
                <Link to="/login" className="block text-gray-300 hover:text-gold" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="block w-full text-center bg-gold text-navy font-semibold py-2 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </>
            ) : (
              <>
                <Link to={`/dashboard/${user.role}`} className="block text-gray-300 hover:text-gold" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <button
                  onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-cyan-300 hover:text-cyan-200"
                >
                  My Profile & Photo
                </button>
                <div className="pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">Signed in as {user.name}</div>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left text-red-400 hover:text-red-300">Logout</button>
                </div>
              </>
            )}
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

export default Navbar;
