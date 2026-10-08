import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * EmailVerificationModal — 6-Digit OTP Email Verification Modal
 * Validates user's email with a 6-digit code and marks isEmailVerified: true.
 */
const EmailVerificationModal = ({ isOpen, onClose, emailToVerify = '' }) => {
  const { user, sendEmailVerificationOtp, verifyEmailOtp } = useAuth();

  const targetEmail = emailToVerify || user?.email || '';
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [hasSent, setHasSent] = useState(false);

  // 10-minute countdown
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Auto-send OTP when opened for first time
  useEffect(() => {
    if (isOpen && targetEmail && !hasSent) {
      handleSendCode();
    }
  }, [isOpen, targetEmail]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
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
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const fullOtp = otpDigits.join('');

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await sendEmailVerificationOtp(targetEmail);
      setMessage(data.message || `Verification code sent to ${targetEmail}.`);
      setHasSent(true);
      setTimeLeft(600);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

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

  const handleVerify = async (e) => {
    e.preventDefault();
    if (fullOtp.length !== 6) {
      return setError('Please enter the full 6-digit OTP code.');
    }

    setLoading(true);
    setError('');
    try {
      await verifyEmailOtp({ email: targetEmail, otp: fullOtp });
      setMessage('Email verified successfully! You now have a verified account badge.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#0E121C] rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.95)] max-w-md w-full p-5 sm:p-8 relative overflow-hidden border border-white/[0.12] text-white animate-scale-in max-h-[92vh] overflow-y-auto">
        
        {/* Ambient Top Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-[70px] pointer-events-none" />

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
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            ACCOUNT VERIFICATION
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-1">
          Verify your email
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          We sent a 6-digit one-time password to <strong className="text-white font-medium">{targetEmail}</strong>. Enter it below to unlock all mentor messaging and verified privileges.
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

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 text-center">
              Enter 6-Digit Code
            </label>
            <div className="flex justify-center sm:justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
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
                  className="w-10 sm:w-12 h-12 sm:h-14 bg-[#131826] border border-white/[0.12] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-xl text-center text-lg sm:text-xl font-bold font-mono text-white transition-all outline-none"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Expires in: <strong className="text-white font-mono">{formatTimer(timeLeft)}</strong></span>
            <button
              type="button"
              onClick={handleSendCode}
              disabled={!canResend || loading}
              className={`font-semibold transition-colors ${
                canResend ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              Resend Code
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || fullOtp.length !== 6}
            className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-[0_8px_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email Address ✅'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default EmailVerificationModal;
