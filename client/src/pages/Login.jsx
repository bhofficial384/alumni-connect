import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialAuthButtons from '../components/SocialAuthButtons';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import TiltCard3D from '../components/TiltCard3D';

/**
 * Login — Tran Mau Tri Tam "ELITE." Dark Luxury UI
 * High-end obsidian glass card, fluid aurora ambient mesh,
 * Google & GitHub social auth, 6-digit OTP forgot password, and demo credentials.
 */
const Login = () => {
  const navigate = useNavigate();
  const rememberedEmail = localStorage.getItem('alumniconnect_remembered_email') || '';
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!rememberedEmail);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { user, login, googleLogin, githubLogin, loading, error, clearError } = useAuth();

  // If already authenticated, redirect immediately to role-specific dashboard
  useEffect(() => {
    if (user?.role) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rememberMe) {
      localStorage.setItem('alumniconnect_remembered_email', email);
    } else {
      localStorage.removeItem('alumniconnect_remembered_email');
    }
    try {
      await login(email, password);
    } catch (err) {
      // Error is set in AuthContext
    }
  };

  if (user?.role) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-white selection:bg-[#2563EB] selection:text-white relative overflow-hidden">
      {/* ========================================================
          FLUID AURORA BACKGROUND MESH
         ======================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FF3366]/15 rounded-full blur-[160px] animate-glow-pulse" />
        <div className="absolute top-20 -right-32 w-[600px] h-[600px] bg-[#00F0FF]/15 rounded-full blur-[170px] animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-[#3B82F6]/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/3 -left-20 w-[450px] h-[450px] bg-[#FF7A00]/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-16">
          <TiltCard3D className="max-w-[460px] w-full" maxTilt={6} scale={1.01}>
            <div className="rounded-[36px] bg-[#0E121C] border border-white/[0.09] shadow-[0_30px_100px_rgba(0,0,0,0.85)] p-5 sm:p-10 relative overflow-hidden backdrop-blur-xl">
              
              {/* Ambient inner soft highlight */}
              <div className="absolute -top-32 left-1/4 w-[350px] h-[200px] bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

              {/* Mint / Cyan Status Kicker */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                  SECURE AUTHENTICATION
                </span>
              </div>

              {/* Header Title & Subtitle */}
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  Welcome back
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm font-normal max-w-xs mx-auto leading-relaxed">
                  Sign in to access your sessions, network graph, and verified mentor matches.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in shadow-lg">
                  <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email or Mobile Number Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                      placeholder="e.g. alex@university.edu or 9876543210"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer transition-colors bg-transparent border-0 p-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl pl-10 pr-10 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-[#131826] text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-400 font-medium">Keep me signed in</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">7-day JWT Session</span>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-[0_12px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-[#0E121C] px-3 text-slate-500 font-semibold">Or continue with</span>
                </div>
              </div>

              {/* Google Social OAuth */}
              <SocialAuthButtons
                onGoogleSuccess={({ credential }) => googleLogin({ credential, role: 'student' })}
              />

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2">
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </TiltCard3D>
        </main>

        <Footer />
      </div>

      {showForgotModal && (
        <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};

export default Login;
