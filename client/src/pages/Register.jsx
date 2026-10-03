import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialAuthButtons from '../components/SocialAuthButtons';
import TiltCard3D from '../components/TiltCard3D';
import CameraCaptureModal from '../components/CameraCaptureModal';
import { compressAndResizeImage } from '../utils/imageUtils';

/**
 * Register — Architecture:
 * 1. Step 1 (Signup): Takes Email, Password, Confirm Password -> Dispatches 6-digit OTP to Email.
 * 2. Step 2 (Verification): 6-digit Email OTP entry -> Verifies email & establishes session.
 * 3. Step 3 (Profile Setup): User enters Name, Photo, Phone & Role Details -> Saves to Dashboard.
 * 
 * Visual Theme: Tran Mau Tri Tam "ELITE." Dark Luxury Obsidian UI
 */
const Register = () => {
  const navigate = useNavigate();

  // Multi-step state: 1 = Credentials, 2 = Email OTP, 3 = Profile Details
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');

  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [step1Error, setStep1Error] = useState('');

  // Step 2: 6-Digit Email OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  // Step 3: Profile Details
  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    profileImage: '',
    registrationNumber: '',
    branch: '',
    semester: '',
    rollNumber: '',
    company: '',
    domain: '',
    graduationYear: '',
    linkedIn: '',
    bio: ''
  });
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const photoInputRef = useRef(null);

  const {
    user,
    register,
    googleLogin,
    githubLogin,
    sendEmailVerificationOtp,
    verifyEmailOtp,
    updateProfile,
    loading
  } = useAuth();

  // If already authenticated AND profile is complete, redirect to dashboard
  useEffect(() => {
    if (user?.role && user?.isProfileComplete) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // Step 2: Countdown Timer
  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // ========================================================
  // STEP 1 HANDLERS: EMAIL + PASSWORD SIGNUP
  // ========================================================
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setStep1Error('');
    setTermsError('');

    if (!termsAgreed) {
      setTermsError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStep1Error('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setStep1Error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setStep1Error('Passwords do not match. Please verify.');
      return;
    }

    try {
      const res = await register({
        email: email.trim(),
        password,
        role
      });

      if (res?.requiresOtp) {
        setStep(2);
        setTimeLeft(60);
        setCanResend(false);
        setOtpError('');
        setOtpSuccess(res.message || `A 6-digit verification code has been sent to ${email.trim()}`);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      }
    } catch (err) {
      setStep1Error(err.message || 'Failed to initialize signup. Please try again.');
    }
  };

  // ========================================================
  // STEP 2 HANDLERS: 6-DIGIT EMAIL OTP VERIFICATION
  // ========================================================
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d{1,6}$/.test(pasted)) {
      const newDigits = [...otpDigits];
      pasted.split('').forEach((char, idx) => {
        newDigits[idx] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  const fullOtp = otpDigits.join('');

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      return setOtpError('Please enter the complete 6-digit verification code.');
    }

    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await verifyEmailOtp({
        email: email.trim(),
        otp: fullOtp
      });

      setOtpSuccess('Email verified successfully! Setting up your profile...');
      // Move to Step 3: Profile Details
      setTimeout(() => {
        setStep(3);
      }, 500);
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend && timeLeft > 0) return;
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await sendEmailVerificationOtp(email.trim());
      setOtpSuccess(res?.message || `A fresh 6-digit code has been sent to ${email.trim()}.`);
      setTimeLeft(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ========================================================
  // STEP 3 HANDLERS: PROFILE COMPLETION
  // ========================================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (name === 'phoneNumber' && phoneError) setPhoneError('');
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    setPhotoError('');
    try {
      const compressed = await compressAndResizeImage(file, 360, 360, 0.82);
      setProfileData((prev) => ({ ...prev, profileImage: compressed }));
    } catch (err) {
      setPhotoError(err.message || 'Failed to process selected image.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setPhoneError('');

    if (!profileData.name.trim()) {
      setProfileError('Full Name is required.');
      return;
    }

    const cleanPhone = profileData.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        ...profileData,
        phoneNumber: cleanPhone
      });
      // Navigate to Dashboard
      navigate(`/dashboard/${user?.role || role}`);
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-white selection:bg-[#2563EB] selection:text-white relative overflow-hidden">
      {/* ========================================================
          FLUID AURORA BACKGROUND MESH
         ======================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 -right-32 w-[600px] h-[600px] bg-[#00F0FF]/15 rounded-full blur-[170px] animate-pulse-slow" />
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FF3366]/15 rounded-full blur-[160px] animate-glow-pulse" />
        <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-[#3B82F6]/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 -right-20 w-[450px] h-[450px] bg-[#FF7A00]/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-16">
          <TiltCard3D className="max-w-[520px] w-full" maxTilt={4} scale={1.01}>
            <div className="rounded-[36px] bg-[#0E121C] border border-white/[0.09] shadow-[0_30px_100px_rgba(0,0,0,0.85)] p-7 sm:p-10 relative overflow-hidden backdrop-blur-xl">
              
              {/* Ambient inner soft highlight */}
              <div className="absolute -top-32 right-1/4 w-[350px] h-[200px] bg-cyan-600/10 rounded-full blur-[90px] pointer-events-none" />

              {/* Progress Steps Header */}
              <div className="flex items-center justify-center gap-2.5 mb-6">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  step === 1 
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' 
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                }`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-current text-[#0E121C] font-bold">
                    {step > 1 ? '✓' : '1'}
                  </span>
                  <span>Credentials</span>
                </div>

                <div className="w-4 h-px bg-white/20" />

                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  step === 2 
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' 
                    : step > 2
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/[0.04] border-white/10 text-slate-500'
                }`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-current text-[#0E121C] font-bold">
                    {step > 2 ? '✓' : '2'}
                  </span>
                  <span>Email OTP</span>
                </div>

                <div className="w-4 h-px bg-white/20" />

                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  step === 3 
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' 
                    : 'bg-white/[0.04] border-white/10 text-slate-500'
                }`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-current text-[#0E121C] font-bold">
                    3
                  </span>
                  <span>Profile Setup</span>
                </div>
              </div>

              {/* ========================================================
                  STEP 1: SIGNUP CREDENTIALS (Email + Password + Role)
                 ======================================================== */}
              {step === 1 && (
                <div className="animate-fade-in">
                  {/* Status Kicker */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                      STEP 1 OF 3 • SIGN UP
                    </span>
                  </div>

                  {/* Header Title & Subtitle */}
                  <div className="text-center mb-6">
                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                      Create your account
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm font-normal max-w-xs mx-auto leading-relaxed">
                      Join the alumni network to connect with mentors and peers.
                    </p>
                  </div>

                  {/* Role Switcher */}
                  <div className="flex gap-2 p-1.5 rounded-2xl bg-[#131826] border border-white/[0.08] mb-6">
                    <button
                      type="button"
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                        role === 'student'
                          ? 'bg-[#2563EB] text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                      onClick={() => setRole('student')}
                    >
                      <span>🎓</span>
                      <span>Student / Mentee</span>
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                        role === 'mentor'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(147,51,234,0.4)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                      onClick={() => setRole('mentor')}
                    >
                      <span>💼</span>
                      <span>Alumni Mentor</span>
                    </button>
                  </div>

                  {/* Google Social OAuth */}
                  <SocialAuthButtons
                    role={role}
                    onGoogleSuccess={({ credential }) => googleLogin({ credential, role })}
                  />

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                      <span className="bg-[#0E121C] px-3 text-slate-500 font-semibold">Or register with email</span>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {step1Error && (
                    <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in shadow-lg">
                      <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="leading-snug">{step1Error}</span>
                    </div>
                  )}

                  {/* Step 1 Form */}
                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. alex@university.edu"
                          className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl pl-10 pr-10 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
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

                    {/* Confirm Password Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-white/20 bg-[#131826] text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-300 leading-relaxed">
                          I agree to the Terms of Service and Privacy Policy.
                        </span>
                      </label>
                      {termsError && (
                        <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
                          <span>⚠️</span> {termsError}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-3 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-[0_12px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Email Verification</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch to Login */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                      Already have an account?{' '}
                      <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* ========================================================
                  STEP 2: 6-DIGIT EMAIL OTP VERIFICATION
                 ======================================================== */}
              {step === 2 && (
                <div className="animate-scale-in">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22D3EE] animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                      STEP 2 OF 3 • EMAIL VERIFICATION
                    </span>
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mx-auto mb-3 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.15)] text-2xl">
                      ✉️
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                      Verify Your Email
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-normal max-w-sm mx-auto leading-relaxed">
                      We sent a 6-digit code to{' '}
                      <span className="text-cyan-300 font-mono font-bold break-all">
                        {email}
                      </span>
                      .{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setOtpError('');
                          setOtpSuccess('');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium cursor-pointer"
                      >
                        Change email
                      </button>
                    </p>
                  </div>

                  {otpSuccess && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shadow-sm">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{otpSuccess}</span>
                    </div>
                  )}

                  {otpError && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-fade-in shadow-sm">
                      <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* 6 Digit Cells */}
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-[#131826] border border-white/[0.12] rounded-2xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-inner"
                        />
                      ))}
                    </div>

                    {/* Expiration Timer & Resend Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>Resend available in:</span>
                        <span className="font-mono font-bold text-cyan-300">{formatTimer(timeLeft)}</span>
                      </div>

                      <button
                        type="button"
                        disabled={!canResend || otpLoading}
                        onClick={handleResendOtp}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        Resend verification code
                      </button>
                    </div>

                    {/* Verify & Proceed Button */}
                    <button
                      type="submit"
                      disabled={otpLoading || fullOtp.length !== 6}
                      className="w-full py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-[0_12px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {otpLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Validating Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Continue to Profile Setup</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* ========================================================
                  STEP 3: COMPLETE PROFILE DETAILS (Final Step)
                 ======================================================== */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#C084FC] animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-purple-400">
                      STEP 3 OF 3 • PROFILE SETUP
                    </span>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
                      Complete Your {role === 'mentor' ? 'Mentor' : 'Student'} Profile
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-normal max-w-xs mx-auto leading-relaxed">
                      Enter your details to finalize your verified profile and unlock your dashboard.
                    </p>
                  </div>

                  {profileError && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStep3Submit} className="space-y-4">
                    {/* Profile Photo */}
                    <div className="p-4 rounded-2xl bg-[#131826] border border-white/[0.08]">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-[2px] shadow-md overflow-hidden flex items-center justify-center ${
                            profileData.profileImage
                              ? 'bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-500'
                              : 'bg-gradient-to-tr from-purple-500 via-blue-500 to-slate-700'
                          }`}>
                            {profileData.profileImage ? (
                              <img
                                src={profileData.profileImage}
                                alt="Profile Preview"
                                className="w-full h-full rounded-[14px] object-cover"
                              />
                            ) : (
                              <div className="w-full h-full rounded-[14px] bg-[#0E121C] flex flex-col items-center justify-center text-xs font-bold text-slate-300">
                                <span>📷</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-200 block mb-0.5">
                            Profile Photo
                          </label>
                          <p className="text-[11px] text-slate-400 mb-2">
                            Upload a clear photo for verified mentorship & sessions
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="file"
                              ref={photoInputRef}
                              accept="image/*"
                              onChange={handlePhotoSelect}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => photoInputRef.current?.click()}
                              disabled={photoLoading}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>📁</span>
                              <span>{photoLoading ? 'Processing...' : profileData.profileImage ? 'Change Photo' : 'Upload File'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowCameraModal(true)}
                              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>📷</span>
                              <span>Camera</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {photoError && (
                        <p className="mt-2 text-rose-400 text-xs">{photoError}</p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder={role === 'student' ? 'e.g. Vivek Kumar' : 'e.g. Alex Johnson'}
                        className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Mobile Number (10 digits) *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        required
                        value={profileData.phoneNumber}
                        onChange={handleProfileChange}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                      />
                      {phoneError && (
                        <p className="mt-1 text-xs text-rose-400">{phoneError}</p>
                      )}
                    </div>

                    {/* Student-Specific Fields */}
                    {role === 'student' && (
                      <div className="space-y-3.5 pt-2 border-t border-white/[0.08]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              Registration Number
                            </label>
                            <input
                              type="text"
                              name="registrationNumber"
                              value={profileData.registrationNumber}
                              onChange={handleProfileChange}
                              placeholder="e.g. 210101"
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              Roll Number
                            </label>
                            <input
                              type="text"
                              name="rollNumber"
                              value={profileData.rollNumber}
                              onChange={handleProfileChange}
                              placeholder="e.g. 21CS04"
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              Branch
                            </label>
                            <select
                              name="branch"
                              value={profileData.branch}
                              onChange={handleProfileChange}
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                              <option value="" className="bg-[#0E121C]">Select Branch</option>
                              <option value="Computer Science" className="bg-[#0E121C]">Computer Science & Eng</option>
                              <option value="AI & ML" className="bg-[#0E121C]">AI & Machine Learning</option>
                              <option value="Electronics" className="bg-[#0E121C]">Electronics & Comm.</option>
                              <option value="Mechanical" className="bg-[#0E121C]">Mechanical Eng</option>
                              <option value="Civil" className="bg-[#0E121C]">Civil Eng</option>
                              <option value="Electrical" className="bg-[#0E121C]">Electrical Eng</option>
                              <option value="Other" className="bg-[#0E121C]">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              Semester
                            </label>
                            <select
                              name="semester"
                              value={profileData.semester}
                              onChange={handleProfileChange}
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                              <option value="" className="bg-[#0E121C]">Select Semester</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                <option key={s} value={String(s)} className="bg-[#0E121C]">
                                  Semester {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mentor-Specific Fields */}
                    {role === 'mentor' && (
                      <div className="space-y-3.5 pt-2 border-t border-white/[0.08]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              Current Company
                            </label>
                            <input
                              type="text"
                              name="company"
                              value={profileData.company}
                              onChange={handleProfileChange}
                              placeholder="e.g. Google, Microsoft"
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              Domain
                            </label>
                            <input
                              type="text"
                              name="domain"
                              value={profileData.domain}
                              onChange={handleProfileChange}
                              placeholder="e.g. Software, AI/ML"
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              Graduation Year
                            </label>
                            <input
                              type="number"
                              name="graduationYear"
                              value={profileData.graduationYear}
                              onChange={handleProfileChange}
                              placeholder="2020"
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                              LinkedIn URL
                            </label>
                            <input
                              type="url"
                              name="linkedIn"
                              value={profileData.linkedIn}
                              onChange={handleProfileChange}
                              placeholder="https://linkedin.com/in/..."
                              className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Short Bio / Goal
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder={role === 'mentor' ? 'Share your expertise and how you guide students...' : 'Share your career interests and learning goals...'}
                        className="w-full bg-[#131826] border border-white/[0.09] rounded-2xl px-3.5 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 min-h-[65px]"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full mt-2 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-[0_12px_30px_rgba(79,70,229,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {profileLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Profile & Enter Dashboard</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </TiltCard3D>
        </main>

        <Footer />
      </div>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={(base64) => {
            setProfileData((prev) => ({ ...prev, profileImage: base64 }));
            setShowCameraModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Register;
