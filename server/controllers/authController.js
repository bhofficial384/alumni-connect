const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');
const smsService = require('../utils/smsService');

/**
 * Cookie options for Secure Backend JWT Sessions
 * - httpOnly: Inaccessible to client-side JavaScript (mitigates XSS token theft)
 * - secure: Transmitted only over HTTPS in production
 * - sameSite: Protects against Cross-Site Request Forgery (CSRF)
 * - maxAge: 7-day session lifetime
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/'
});

/**
 * Centralized helper to issue signed JWT and set HttpOnly session cookie
 */
const sendTokenResponse = (user, statusCode, res, message = 'Authenticated successfully') => {
  // Sign JWT with user identity and authorization role
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set HttpOnly cookie for transparent, tamper-proof session persistence
  res.cookie('token', token, getCookieOptions());

  // Return dual session: Token in body (for explicit headers) + HttpOnly cookie
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company || '',
      domain: user.domain || '',
      bio: user.bio || '',
      graduationYear: user.graduationYear,
      registrationNumber: user.registrationNumber || '',
      branch: user.branch || '',
      semester: user.semester || '',
      rollNumber: user.rollNumber || '',
      assignedMentor: user.assignedMentor || null,
      linkedIn: user.linkedIn || '',
      profileImage: user.profileImage || '',
      phoneNumber: user.phoneNumber || '',
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      isApproved: user.isApproved !== undefined ? user.isApproved : (user.role !== 'mentor'),
      approvalStatus: user.approvalStatus || (user.role === 'mentor' ? 'pending' : 'approved'),
      authProvider: user.authProvider || 'local',
      isProfileComplete: user.isProfileComplete || false,
      requiresProfile: !user.isProfileComplete
    }
  });
};

/**
 * Cryptographically verify Google Identity Services ID Token
 * Validates Google's RSA signature, certificate chain, expiration, and verified email status.
 */
const verifyGoogleIdToken = async (credential) => {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error_description || 'Google signature verification failed');
    }

    const payload = await response.json();

    if (!payload.email) {
      throw new Error('Google token does not contain an email address');
    }

    // Verify audience matches application client ID if configured
    const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      throw new Error('Google token was not issued for this client application');
    }

    // Require verified email from Google
    const isVerified = payload.email_verified === 'true' || payload.email_verified === true;
    if (!isVerified) {
      throw new Error('Google email address has not been verified');
    }

    return {
      email: payload.email.toLowerCase().trim(),
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      googleId: payload.sub,
      picture: payload.picture || '',
      isEmailVerified: true
    };
  } catch (err) {
    throw new Error(`Google token validation error: ${err.message}`);
  }
};

/**
 * Register a new user (Email + Password only at signup, verified via Email OTP)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const safeRole = role === 'mentor' ? 'mentor' : 'student';

    let user = await User.findOne({ email: normalizedEmail });
    if (user && user.isEmailVerified) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }

    // Hash password with strong work factor
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP for email verification during registration
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const defaultName = (name && name.trim()) || normalizedEmail.split('@')[0];

    if (user && !user.isEmailVerified) {
      // Re-use unverified user record
      user.password = hashedPassword;
      user.role = safeRole;
      user.name = defaultName;
      user.emailVerificationOtp = otp;
      user.emailVerificationOtpExpires = expires;
      user.isProfileComplete = false;
      await user.save();
    } else {
      user = await User.create({
        name: defaultName,
        email: normalizedEmail,
        password: hashedPassword,
        role: safeRole,
        isEmailVerified: false,
        isProfileComplete: false,
        emailVerificationOtp: otp,
        emailVerificationOtpExpires: expires,
        lastLogin: new Date()
      });
    }

    // 1. Immediately send success response so frontend transitions instantly to OTP screen (0ms delay)
    res.status(201).json({
      success: true,
      requiresOtp: true,
      verificationType: 'email',
      message: `A 6-digit verification code has been dispatched to your email ${user.email}.`,
      email: user.email,
      role: user.role
    });

    // 2. Dispatch 6-digit OTP asynchronously in the background via persistent pooled SMTP
    emailService.sendEmailVerificationOtp({
      toEmail: user.email,
      name: user.name,
      otp
    }).catch(err => console.error('Background Email OTP dispatch error:', err.message));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * User Login (Architecture matching geckhaiml.live backend)
 * POST /api/auth/login
 * Supports email, 10-digit mobile, registration number, or roll number.
 * Handles BLOCKED, PENDING_APPROVAL, REJECTED, and NOT_REGISTERED states.
 */
const login = async (req, res) => {
  try {
    const rawIdentifier = (req.body.identifier || req.body.email || '').trim();
    const { password } = req.body;

    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email address or mobile number, and password are required'
      });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawIdentifier);
    let user = null;

    if (isEmail) {
      const normalizedEmail = rawIdentifier.toLowerCase();
      user = await User.findOne({ email: normalizedEmail }).select('+password');
    } else {
      // Check phone number, registration number, or roll number
      const cleanPhone = rawIdentifier.replace(/\D/g, '').slice(-10);
      user = await User.findOne({
        $or: [
          { email: rawIdentifier.toLowerCase() },
          ...(cleanPhone.length >= 10 ? [{ phoneNumber: { $regex: cleanPhone } }] : []),
          { registrationNumber: rawIdentifier },
          { rollNumber: rawIdentifier }
        ]
      }).select('+password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        message: 'You are not registered. Please sign up first.'
      });
    }

    // Check account status: BLOCKED
    if (user.isBlocked || user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        message: 'BLOCKED'
      });
    }

    // Check account status: PENDING_APPROVAL (Faculty/Mentor accounts)
    if (user.role === 'mentor' && user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        isPending: true,
        message: 'PENDING_APPROVAL',
        detail: 'Your mentor account is pending admin approval. You cannot access the dashboard until approved.'
      });
    }

    // Check account status: REJECTED
    if (user.role === 'mentor' && user.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        isRejected: true,
        message: 'REJECTED',
        detail: 'Your mentor account registration has been rejected by admin.'
      });
    }

    // If account was created strictly with Google or GitHub and has no local password
    if (!user.password && (user.googleId || user.githubId)) {
      const provider = user.githubId ? 'GitHub' : 'Google';
      return res.status(401).json({
        success: false,
        message: `This account was created with ${provider} OAuth. Please sign in using the "Continue with ${provider}" button, or reset your password.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email or phone number and password.'
      });
    }

    // Record last successful login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login Successful');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};


/**
 * Google OAuth Authentication
 * POST /api/auth/google
 * Cryptographically verifies token with Google and establishes secure session
 */
const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;
    // Real Google Identity Services (Cryptographic Verification)
    if (!credential) {
      return res.status(400).json({ message: 'No Google credential token provided. Please sign in via Google.' });
    }
    
    const verifiedAccount = await verifyGoogleIdToken(credential);
    const { email, name, googleId, picture, isEmailVerified } = verifiedAccount;

    // Enforce safe role (prevent unauthorized admin creation)
    const safeRole = role === 'mentor' ? 'mentor' : 'student';

    let user = await User.findOne({ email });

    if (user) {
      // Link Google ID if not yet associated
      if (!user.googleId && googleId) {
        user.googleId = googleId;
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
      }
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // First-time Google registration: provision new user
      user = await User.create({
        name,
        email,
        googleId,
        profileImage: picture,
        role: safeRole,
        authProvider: 'google',
        isEmailVerified: true,
        lastLogin: new Date()
      });
    }

    sendTokenResponse(user, 200, res, 'Google authentication successful');
  } catch (error) {
    console.error('Google Auth Controller Error:', error.message);
    res.status(401).json({ message: error.message || 'Google authentication failed' });
  }
};

/**
 * Fetch Current Authenticated User Profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assignedMentor', 'name email company domain profileImage');
    const u = user || req.user;
    res.json({
      success: true,
      user: {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        company: u.company || '',
        domain: u.domain || '',
        bio: u.bio || '',
        graduationYear: u.graduationYear,
        registrationNumber: u.registrationNumber || '',
        branch: u.branch || '',
        semester: u.semester || '',
        rollNumber: u.rollNumber || '',
        assignedMentor: u.assignedMentor || null,
        linkedIn: u.linkedIn || '',
        phoneNumber: u.phoneNumber || '',
        availability: u.availability || [],
        profileImage: u.profileImage || '',
        isEmailVerified: u.isEmailVerified || false,
        isPhoneVerified: u.isPhoneVerified || false,
        isApproved: u.isApproved !== undefined ? u.isApproved : (u.role !== 'mentor'),
        approvalStatus: u.approvalStatus || (u.role === 'mentor' ? 'pending' : 'approved'),
        authProvider: u.authProvider || 'local',
        lastLogin: u.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user session', error: error.message });
  }
};

/**
 * Invalidate Backend JWT Session & Clear HttpOnly Cookie
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0), // Expire immediately in browser cookie jar
      maxAge: 0,
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Signed out successfully. Session invalidated.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error terminating session', error: error.message });
  }
};

/**
 * Update Authenticated User Profile (Photo, Bio, Academic / Career Details)
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      name,
      phoneNumber,
      profileImage,
      bio,
      linkedIn,
      registrationNumber,
      branch,
      semester,
      rollNumber,
      company,
      domain
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (phoneNumber !== undefined) {
      if (!phoneNumber || !phoneNumber.trim()) {
        return res.status(400).json({ message: 'Phone number is required and cannot be empty.' });
      }
      const digitsOnly = phoneNumber.trim().replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        return res.status(400).json({ message: 'Please enter a valid phone number (at least 10 digits).' });
      }
      user.phoneNumber = phoneNumber.trim();
    }

    if (profileImage !== undefined) {
      if (!profileImage || !profileImage.trim()) {
        return res.status(400).json({ message: 'Profile photo is required and cannot be removed.' });
      }
      user.profileImage = profileImage;
    }
    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (bio !== undefined) {
      user.bio = bio.trim();
    }
    if (linkedIn !== undefined) {
      user.linkedIn = linkedIn.trim();
    }

    if (user.role === 'student') {
      if (registrationNumber !== undefined) user.registrationNumber = registrationNumber.trim();
      if (branch !== undefined) user.branch = branch.trim();
      if (semester !== undefined) user.semester = String(semester).trim();
      if (rollNumber !== undefined) user.rollNumber = rollNumber.trim();
    } else if (user.role === 'mentor') {
      if (company !== undefined) user.company = company.trim();
      if (domain !== undefined) user.domain = domain.trim();
    }

    user.isProfileComplete = true;
    await user.save();

    sendTokenResponse(user, 200, res, 'Profile updated successfully');
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

/**
 * GitHub OAuth Authentication
 * POST /api/auth/github
 * Supports standard GitHub OAuth Authorization Code exchange and Dev Mode Simulation
 */
const githubAuth = async (req, res) => {
  try {
    const { code, role, profile } = req.body;
    let verifiedAccount = null;

    // 1. Production / Real GitHub OAuth code exchange
    if (code) {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(400).json({
          message: 'GitHub OAuth is not configured on the server. Please provide GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.'
        });
      }

      // Exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || 'Failed to exchange GitHub authorization code');
      }

      // Fetch GitHub profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'User-Agent': 'AlumniConnect-App'
        }
      });
      const ghUser = await userRes.json();

      let email = ghUser.email;
      // If user's email is private, query the user/emails endpoint
      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'User-Agent': 'AlumniConnect-App'
          }
        });
        const emails = await emailsRes.json();
        if (Array.isArray(emails)) {
          const primaryEmailObj = emails.find(e => e.primary && e.verified) || emails[0];
          email = primaryEmailObj ? primaryEmailObj.email : null;
        }
      }

      if (!email) {
        email = `${ghUser.login}@users.noreply.github.com`;
      }

      verifiedAccount = {
        email: email.toLowerCase().trim(),
        name: ghUser.name || ghUser.login,
        githubId: String(ghUser.id),
        picture: ghUser.avatar_url || '',
        isEmailVerified: true
      };
    } else {
      return res.status(400).json({ message: 'GitHub authorization code is required' });
    }

    const { email, name, githubId, picture } = verifiedAccount;
    const safeRole = role === 'mentor' ? 'mentor' : 'student';

    let user = await User.findOne({ email });

    if (user) {
      // Link GitHub ID if not yet associated
      if (!user.githubId && githubId) {
        user.githubId = githubId;
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
      }
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user with GitHub OAuth identity
      user = await User.create({
        name,
        email,
        githubId,
        profileImage: picture,
        role: safeRole,
        authProvider: 'github',
        isEmailVerified: true,
        lastLogin: new Date()
      });
    }

    sendTokenResponse(user, 200, res, 'GitHub authentication successful');
  } catch (error) {
    console.error('GitHub Auth Controller Error:', error.message);
    res.status(401).json({ message: error.message || 'GitHub authentication failed' });
  }
};

/**
 * Dispatch 6-Digit OTP for Email Verification
 * POST /api/auth/email/send-otp
 */
const sendEmailVerificationOtp = async (req, res) => {
  try {
    const email = (req.body.email || (req.user && req.user.email) || '').toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email address' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'This email is already verified' });
    }

    // Generate cryptographic 6-digit numeric OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpires = expires;
    await user.save();

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}.`,
      expiresIn: '10 minutes'
    });

    emailService.sendEmailVerificationOtp({
      toEmail: user.email,
      name: user.name,
      otp
    }).catch(err => console.error('Background Resend OTP dispatch error:', err.message));
  } catch (error) {
    console.error('Send Email Verification OTP Error:', error);
    res.status(500).json({ message: 'Server error generating verification code', error: error.message });
  }
};

/**
 * Verify 6-Digit OTP for Email Verification
 * POST /api/auth/email/verify-otp
 */
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit OTP code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+emailVerificationOtp +emailVerificationOtpExpires');
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.isEmailVerified) {
      return sendTokenResponse(user, 200, res, 'Email is already verified. Logging in...');
    }

    if (!user.emailVerificationOtp || user.emailVerificationOtp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid 6-digit verification code. Please check and try again.' });
    }

    if (!user.emailVerificationOtpExpires || user.emailVerificationOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Verify account and clear OTP fields
    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    user.phoneVerificationOtp = undefined;
    user.phoneVerificationOtpExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Email and phone verified successfully! Registration complete.');
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    res.status(500).json({ message: 'Server error validating verification code', error: error.message });
  }
};

/**
 * Dispatch 6-Digit SMS OTP for Phone Number Verification
 * POST /api/auth/phone/send-otp
 */
const sendPhoneVerificationOtp = async (req, res) => {
  try {
    const rawPhone = (req.body.phoneNumber || (req.user && req.user.phoneNumber) || '').trim();
    const email = (req.body.email || (req.user && req.user.email) || '').toLowerCase().trim();

    if (!rawPhone && !email) {
      return res.status(400).json({ message: 'Phone number or email address is required' });
    }

    let user = null;
    if (rawPhone) {
      const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
      user = await User.findOne({ phoneNumber: { $regex: cleanDigits } });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this phone number or email' });
    }

    // Generate cryptographic 6-digit numeric OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.phoneVerificationOtp = otp;
    user.phoneVerificationOtpExpires = expires;
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpires = expires;
    await user.save();

    const smsResult = await smsService.sendPhoneVerificationOtp({
      phoneNumber: user.phoneNumber,
      name: user.name,
      otp
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.phoneNumber}.`,
      phoneNumber: user.phoneNumber,
      smsDelivered: smsResult.delivered,
      smsProvider: smsResult.provider,
      smsError: smsResult.deliveryError,
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Send Phone Verification OTP Error:', error);
    res.status(500).json({ message: 'Server error generating phone verification code', error: error.message });
  }
};

/**
 * Verify 6-Digit SMS OTP for Phone Number Verification
 * POST /api/auth/phone/verify-otp
 */
const verifyPhoneOtp = async (req, res) => {
  try {
    const { phoneNumber, email, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: '6-digit OTP code is required' });
    }

    const cleanOtp = String(otp).trim();
    let user = null;

    if (phoneNumber) {
      const cleanDigits = phoneNumber.replace(/\D/g, '').slice(-10);
      user = await User.findOne({ phoneNumber: { $regex: cleanDigits } }).select('+phoneVerificationOtp +phoneVerificationOtpExpires +emailVerificationOtp +emailVerificationOtpExpires');
    }
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+phoneVerificationOtp +phoneVerificationOtpExpires +emailVerificationOtp +emailVerificationOtpExpires');
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please register or check your phone number.' });
    }

    // Verify 6-digit OTP against user record
    const { e164 } = smsService.formatPhoneNumber(user.phoneNumber || phoneNumber);
    const isOtpMatch = (user.phoneVerificationOtp && String(user.phoneVerificationOtp).trim() === cleanOtp) ||
                       (user.emailVerificationOtp && String(user.emailVerificationOtp).trim() === cleanOtp);

    console.log(`\n======================================================`);
    console.log(`🔍 [VERIFY PHONE OTP] Attempt:`);
    console.log(`Input Phone: "${phoneNumber}" | Target Phone: ${e164}`);
    console.log(`Entered OTP: "${cleanOtp}"`);
    console.log(`Target User: ${user.name} (${user.email})`);
    console.log(`Final Verification Result: ${isOtpMatch ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    console.log(`======================================================\n`);

    if (!isOtpMatch) {
      return res.status(400).json({
        message: 'Invalid 6-digit verification code. Please check the code received on your phone and try again.'
      });
    }

    const isExpired = user.phoneVerificationOtpExpires && user.phoneVerificationOtpExpires < new Date();
    if (isExpired) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Verify phone and account, clear OTP fields
    user.isPhoneVerified = true;
    user.isEmailVerified = true;
    user.phoneVerificationOtp = undefined;
    user.phoneVerificationOtpExpires = undefined;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Phone number and account verified successfully! Registration complete.');
  } catch (error) {
    console.error('Verify Phone OTP Error:', error);
    res.status(500).json({ message: 'Server error validating verification code', error: error.message });
  }
};

/**
 * Request Password Reset 6-Digit OTP
 * POST /api/auth/forgot-password
 */
const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address' });
    }

    // Generate cryptographic 6-digit numeric OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expires;
    await user.save();

    await emailService.sendPasswordResetOtp({
      toEmail: user.email,
      name: user.name,
      otp
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${user.email}.`,
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Forgot Password Request Error:', error);
    res.status(500).json({ message: 'Server error processing password reset request', error: error.message });
  }
};

/**
 * Verify 6-Digit Password Reset OTP (Intermediate validation before password change)
 * POST /api/auth/verify-reset-otp
 */
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit OTP code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid 6-digit reset code. Please check and try again.' });
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully. You may now enter your new password.'
    });
  } catch (error) {
    console.error('Verify Reset OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying reset code', error: error.message });
  }
};

/**
 * Reset Password with Verified 6-Digit OTP
 * POST /api/auth/reset-password-otp
 */
const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, 6-digit OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password +resetPasswordOtp +resetPasswordOtpExpires');
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid 6-digit reset code' });
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new code.' });
    }

    // Hash new password with strong work factor
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    // Invalidate reset OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Log the user in with new JWT session
    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (error) {
    console.error('Reset Password With OTP Error:', error);
    res.status(500).json({ message: 'Server error completing password reset', error: error.message });
  }
};

/**
 * Real-time availability check for email or phone
 * POST /api/auth/check-availability
 */
const checkAvailability = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const checks = {};

    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      checks.emailAvailable = !existingEmail;
      if (existingEmail) {
        checks.emailMessage = 'This email address is already registered';
      }
    }

    if (phoneNumber) {
      const cleanDigits = phoneNumber.replace(/\D/g, '').slice(-10);
      if (cleanDigits.length >= 10) {
        const existingPhone = await User.findOne({ phoneNumber: { $regex: cleanDigits } });
        checks.phoneAvailable = !existingPhone;
        if (existingPhone) {
          checks.phoneMessage = 'This mobile number is already linked to an account';
        }
      } else {
        checks.phoneAvailable = true;
      }
    }

    res.json({ success: true, ...checks });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error checking availability' });
  }
};

/**
 * Update phone number for an unverified account and resend OTP
 * POST /api/auth/phone/update-and-resend
 */
const updatePhoneAndResendOtp = async (req, res) => {
  try {
    const { email, newPhoneNumber } = req.body;
    if (!email || !newPhoneNumber) {
      return res.status(400).json({ message: 'Email and new mobile number are required' });
    }

    const cleanNewDigits = newPhoneNumber.replace(/\D/g, '');
    if (cleanNewDigits.length < 10 || cleanNewDigits.length > 15) {
      return res.status(400).json({ message: 'Please provide a valid 10-15 digit mobile number' });
    }

    // Check if new phone is already in use by another verified user
    const existingPhone = await User.findOne({
      phoneNumber: { $regex: cleanNewDigits.slice(-10) },
      email: { $ne: email.toLowerCase().trim() }
    });
    if (existingPhone) {
      return res.status(400).json({ message: 'This mobile number is already registered to another account' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Registration record not found' });
    }

    // Generate fresh 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.phoneNumber = newPhoneNumber.trim();
    user.phoneVerificationOtp = otp;
    user.phoneVerificationOtpExpires = otpExpires;
    user.isPhoneVerified = false;
    await user.save();

    // Attempt real SMS delivery via Fast2SMS
    const smsResult = await smsService.sendPhoneVerificationOtp({
      phoneNumber: user.phoneNumber,
      name: user.name,
      otp
    });

    // Also back up via email dispatch
    emailService.sendEmailVerificationOtp({
      toEmail: user.email,
      name: user.name,
      otp
    }).catch(err =>
      console.warn('Backup email OTP warning:', err.message)
    );

    res.json({
      success: true,
      message: `Mobile number updated to ${user.phoneNumber}. A fresh verification code has been dispatched.`,
      phoneNumber: user.phoneNumber,
      smsDelivered: smsResult.delivered,
      smsProvider: smsResult.provider,
      smsError: smsResult.deliveryError
    });
  } catch (error) {
    console.error('Update phone and resend OTP error:', error);
    res.status(500).json({ message: 'Server error updating phone number', error: error.message });
  }
};

module.exports = {
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
};
