import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  reload
} from 'firebase/auth';

// Auth context for managing user authentication state across the app
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('alumniconnect_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // On mount: verify active session (cookie or stored token) by calling /api/auth/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // If unauthenticated or token expired, cleanly reset
        localStorage.removeItem('alumniconnect_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login: POST /api/auth/login → store JWT, redirect by role (accepts email or mobile number)
  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', {
        email: identifier,
        identifier,
        password
      });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('alumniconnect_token', newToken);
      setToken(newToken);
      setUser(userData);

      // Redirect to role-specific dashboard
      navigate(`/dashboard/${userData.role}`);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000. Please ensure the server is running.'
          : 'Login failed. Please check your credentials.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Register: POST /api/auth/register → handles OTP flow during registration
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', formData);

      // If registration requires 6-digit OTP verification:
      if (response.data?.requiresOtp) {
        return response.data;
      }

      const { token: newToken, user: userData } = response.data;

      if (newToken && userData) {
        localStorage.setItem('alumniconnect_token', newToken);
        setToken(newToken);
        setUser(userData);
        // Redirect to role-specific dashboard
        navigate(`/dashboard/${userData.role}`);
      }
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000. Please ensure the server is running.'
          : 'Registration failed. Please check your information and try again.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login / Register (Real Google Identity Services)
  const googleLogin = async ({ credential, role }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/google', { credential, role });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('alumniconnect_token', newToken);
      setToken(newToken);
      setUser(userData);

      // Redirect to role-specific dashboard
      navigate(`/dashboard/${userData.role}`);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Google authentication failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // GitHub OAuth Login / Register (Real OAuth Code Exchange)
  const githubLogin = async ({ code, role }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/github', { code, role });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('alumniconnect_token', newToken);
      setToken(newToken);
      setUser(userData);

      // Redirect to role-specific dashboard
      navigate(`/dashboard/${userData.role}`);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'GitHub authentication failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Send 6-Digit OTP for Email Verification
  const sendEmailVerificationOtp = async (email) => {
    try {
      const targetEmail = email || user?.email;
      const response = await api.post('/auth/email/send-otp', { email: targetEmail });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000. Please ensure the server is running.'
          : 'Failed to send verification code.');
      throw new Error(message);
    }
  };

  // Verify 6-Digit Email OTP
  const verifyEmailOtp = async ({ email, otp }) => {
    try {
      const targetEmail = email || user?.email;
      const response = await api.post('/auth/email/verify-otp', { email: targetEmail, otp });
      const { token: newToken, user: userData } = response.data || {};

      if (newToken && userData) {
        localStorage.setItem('alumniconnect_token', newToken);
        setToken(newToken);
        setUser(userData);
        if (userData.isProfileComplete) {
          navigate(`/dashboard/${userData.role}`);
        }
      } else if (response.data?.user) {
        setUser((prev) => ({ ...prev, ...response.data.user, isEmailVerified: true }));
      } else {
        setUser((prev) => (prev ? { ...prev, isEmailVerified: true } : prev));
      }
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired verification code.';
      throw new Error(message);
    }
  };

  // Send 6-Digit OTP for Phone Number Verification (Actual SMS)
  const sendPhoneVerificationOtp = async ({ phoneNumber, email }) => {
    try {
      const response = await api.post('/auth/phone/send-otp', {
        phoneNumber: phoneNumber || user?.phoneNumber,
        email: email || user?.email
      });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000. Please ensure the server is running.'
          : 'Failed to send phone verification SMS.');
      throw new Error(message);
    }
  };

  // Verify 6-Digit SMS OTP for Phone Number
  const verifyPhoneOtp = async ({ phoneNumber, email, otp }) => {
    try {
      const response = await api.post('/auth/phone/verify-otp', {
        phoneNumber: phoneNumber || user?.phoneNumber,
        email: email || user?.email,
        otp
      });
      const { token: newToken, user: userData } = response.data || {};

      if (newToken && userData) {
        localStorage.setItem('alumniconnect_token', newToken);
        setToken(newToken);
        setUser(userData);
        navigate(`/dashboard/${userData.role}`);
      } else if (response.data?.user) {
        setUser((prev) => ({ ...prev, ...response.data.user, isPhoneVerified: true, isEmailVerified: true }));
      } else {
        setUser((prev) => (prev ? { ...prev, isPhoneVerified: true, isEmailVerified: true } : prev));
      }
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000.'
          : 'Failed to verify phone OTP.');
      throw new Error(message);
    }
  };

  // Update phone number and dispatch fresh OTP for an unverified account
  const updatePhoneAndResend = async (email, newPhoneNumber) => {
    try {
      const response = await api.post('/auth/phone/update-and-resend', { email, newPhoneNumber });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000.'
          : 'Failed to update phone number and resend verification code.');
      throw new Error(message);
    }
  };

  // Check real-time uniqueness of email or phone
  const checkAvailability = async (payload) => {
    try {
      const response = await api.post('/auth/check-availability', payload);
      return response.data;
    } catch (err) {
      return { success: true, emailAvailable: true, phoneAvailable: true };
    }
  };

  // Request 6-Digit Password Reset OTP
  const forgotPasswordRequest = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000. Please ensure the server is running.'
          : 'Failed to request password reset code.');
      throw new Error(message);
    }
  };

  // Verify 6-Digit Password Reset OTP
  const verifyResetOtp = async ({ email, otp }) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired reset code.';
      throw new Error(message);
    }
  };

  // Reset Password with 6-Digit OTP and Log In
  const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password-otp', { email, otp, newPassword });
      const { token: newToken, user: userData } = response.data;

      if (newToken && userData) {
        localStorage.setItem('alumniconnect_token', newToken);
        setToken(newToken);
        setUser(userData);
      }
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000.'
          : 'Failed to reset password.');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout: Invalidate backend cookie session, clear client state, redirect to home
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout notification skipped or errored:', err);
    } finally {
      localStorage.removeItem('alumniconnect_token');
      setToken(null);
      setUser(null);
      setError(null);
      navigate('/');
    }
  };

  // Update Profile (Photo, Bio, Academic details)
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user: updatedUser, token: newToken } = response.data || {};
      if (updatedUser) {
        setUser(updatedUser);
      }
      if (newToken) {
        localStorage.setItem('alumniconnect_token', newToken);
        setToken(newToken);
      }
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server on port 5000.'
          : 'Failed to update profile.');
      throw new Error(message);
    }
  };

  // Firebase Auth: Create user & send official Google verification link
  const firebaseRegister = async ({ email, password, role }) => {
    setLoading(true);
    setError(null);
    try {
      let userCredential;
      const cleanEmail = email.trim();
      try {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      } catch (fbErr) {
        if (fbErr.code === 'auth/email-already-in-use') {
          try {
            userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          } catch (signInErr) {
            throw new Error('An account with this email already exists. If it belongs to you, please log in with your password.');
          }
        } else if (fbErr.code === 'auth/weak-password') {
          throw new Error('Password should be at least 6 characters.');
        } else if (fbErr.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else if (fbErr.code === 'auth/operation-not-allowed') {
          throw new Error('Email/Password provider is disabled in Firebase Console. Please enable it under Authentication -> Sign-in method.');
        } else {
          throw new Error(fbErr.message || 'Firebase registration failed.');
        }
      }

      // If already verified
      if (userCredential.user.emailVerified) {
        return {
          success: true,
          email: userCredential.user.email,
          alreadyVerified: true
        };
      }

      // Dispatch Firebase verification email
      await sendEmailVerification(userCredential.user);
      return {
        success: true,
        email: userCredential.user.email,
        alreadyVerified: false
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Firebase Auth: Check if current user has verified their email
  const checkFirebaseEmailVerified = async () => {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);
    return Boolean(auth.currentUser.emailVerified);
  };

  // Firebase Auth: Resend verification email
  const resendFirebaseVerification = async () => {
    if (!auth.currentUser) {
      throw new Error('No active registration session found. Please try signing up again.');
    }
    await sendEmailVerification(auth.currentUser);
    return true;
  };

  // Firebase Auth: Finalize verification with backend MongoDB Atlas
  const completeFirebaseVerification = async ({ email, password, role }) => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) {
        throw new Error('Firebase session not found. Please try again.');
      }
      await reload(auth.currentUser);
      if (!auth.currentUser.emailVerified) {
        throw new Error('Email is not verified yet. Please click the link in your email inbox.');
      }

      const idToken = await auth.currentUser.getIdToken(true);
      const response = await api.post('/auth/firebase-verify', {
        idToken,
        email: auth.currentUser.email || email,
        password,
        role
      });

      const { token: newToken, user: userData } = response.data;
      if (newToken && userData) {
        localStorage.setItem('alumniconnect_token', newToken);
        setToken(newToken);
        setUser(userData);
      }
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Firebase verification failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Clear any auth errors
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        googleLogin,
        githubLogin,
        firebaseRegister,
        checkFirebaseEmailVerified,
        resendFirebaseVerification,
        completeFirebaseVerification,
        sendEmailVerificationOtp,
        verifyEmailOtp,
        sendPhoneVerificationOtp,
        verifyPhoneOtp,
        updatePhoneAndResend,
        checkAvailability,
        forgotPasswordRequest,
        verifyResetOtp,
        resetPasswordWithOtp,
        updateProfile,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
