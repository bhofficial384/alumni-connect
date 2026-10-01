const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  githubAuth,
  sendEmailVerificationOtp,
  verifyEmailOtp,
  sendPhoneVerificationOtp,
  verifyPhoneOtp,
  checkAvailability,
  updatePhoneAndResendOtp,
  forgotPasswordRequest,
  verifyResetOtp,
  resetPasswordWithOtp,
  getMe,
  updateProfile,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../middleware/validate');

// Standard Auth
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.post('/check-availability', checkAvailability);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Social / OAuth (Google & GitHub)
router.post('/google', googleAuth);
router.post('/github', githubAuth);

// Phone Number Verification with 6-Digit OTP (Actual SMS Delivery)
router.post('/phone/send-otp', sendPhoneVerificationOtp);
router.post('/phone/verify-otp', verifyPhoneOtp);
router.post('/phone/update-and-resend', updatePhoneAndResendOtp);

// Email Verification with 6-Digit OTP
router.post('/email/send-otp', sendEmailVerificationOtp);
router.post('/email/verify-otp', verifyEmailOtp);

// Forgot Password Flow with 6-Digit OTP
router.post('/forgot-password', forgotPasswordRequest);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password-otp', resetPasswordWithOtp);

module.exports = router;
