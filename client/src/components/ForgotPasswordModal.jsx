import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ForgotPasswordModal — 3-Step 6-Digit OTP Password Reset Flow
 * 1. Request 6-digit OTP to email
 * 2. Verify 6-digit OTP code (with individual digit cells & countdown)
 * 3. Set new password & auto-login
 */
const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const { forgotPasswordRequest, verifyResetOtp, resetPasswordWithOtp } = useAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 10-minute countdown timer
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  // Countdown timer for Step 2
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

  if (!isOpen) return null;

  const fullOtp = otpDigits.join('');

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return setError('Please enter your email address.');

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await forgotPasswordRequest(email);
      setMessage(data.message || 'Verification code sent to your email.');
      setStep(2);
      setTimeLeft(600);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input cells
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next cell
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d{1,6}$/.test(pasted)) {
      const newDigits = [...otpDigits];
      pasted.split('').forEach((char, idx) => {
        newDigits[idx] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  // Step 2 submit: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      return setError('Please enter the complete 6-digit OTP code.');
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await verifyResetOtp({ email, otp: fullOtp });
      setMessage(data.message || 'Code verified successfully.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setError('');
    try {
      await resetPasswordWithOtp({ email, otp: fullOtp, newPassword });
      setMessage('Password successfully changed! You are now logged in.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0E121C] rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.95)] max-w-md w-full p-7 sm:p-8 relative overflow-hidden border border-white/[0.12] text-white animate-scale-in">
        
        {/* Ambient Top Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/15 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-[70px] pointer-events-none" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_#F43F5E]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">
            6-DIGIT OTP SECURITY
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-1">
          {step === 1 && 'Reset your password'}
          {step === 2 && 'Enter 6-digit code'}
          {step === 3 && 'Create new password'}
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {step === 1 && 'Enter your registered email address and we will dispatch a 6-digit verification code.'}
          {step === 2 && `We sent a 6-digit verification code to ${email}. Valid for ${formatTimer(timeLeft)}.`}
          {step === 3 && 'Choose a strong password with at least 6 characters.'}
        </p>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {message && !error && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <span>✅</span>
            <span>{message}</span>
          </div>
        )}


        {/* ========================================================
            STEP 1: ENTER EMAIL
           ======================================================== */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#131826] border border-white/[0.1] rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-[0_8px_25px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Dispatching OTP...' : 'Send 6-Digit Code →'}
            </button>
          </form>
        )}

        {/* ========================================================
            STEP 2: ENTER 6-DIGIT OTP CELLS
           ======================================================== */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e.target)}
                    className="w-11 sm:w-12 h-14 bg-[#131826] border border-white/[0.12] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-xl text-center text-xl font-bold font-mono text-white transition-all outline-none"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Code expires in: <strong className="text-white font-mono">{formatTimer(timeLeft)}</strong></span>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={!canResend || loading}
                className={`font-semibold transition-colors ${
                  canResend ? 'text-cyan-400 hover:text-cyan-300 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                Resend Code
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-full border border-white/[0.1] text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/[0.04] transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || fullOtp.length !== 6}
                className="flex-1 py-3 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-[0_8px_25px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify Code →'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 3: NEW PASSWORD & CONFIRM
           ======================================================== */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#131826] border border-white/[0.1] rounded-2xl pl-4 pr-12 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#131826] border border-white/[0.1] rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-[0_8px_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Updating Password...' : 'Save Password & Sign In ✅'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordModal;
