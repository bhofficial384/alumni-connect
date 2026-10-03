import React, { useEffect, useRef, useState } from 'react';

/**
 * SocialAuthButtons — Dual Google & GitHub Real OAuth
 * Features:
 * - Official Google Identity Services SDK (Cryptographic Token Verification)
 * - GitHub OAuth redirect flow
 * - Tran Mau Tri Tam dark luxury obsidian glass aesthetic
 */
const SocialAuthButtons = ({ onGoogleSuccess, onGithubSuccess, role = 'student' }) => {
  const googleBtnRef = useRef(null);
  const [socialError, setSocialError] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!googleClientId) return;

    let isMounted = true;

    const setupGoogle = () => {
      if (!isMounted || !googleBtnRef.current || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              setSocialError('');
              onGoogleSuccess({ credential: response.credential, role });
            }
          }
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'pill'
        });
      } catch (err) {
        console.warn('Google Identity Services initialization notice:', err);
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const pollTimer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(pollTimer);
          setupGoogle();
        }
      }, 100);
      const timeoutTimer = setTimeout(() => clearInterval(pollTimer), 5000);
      return () => {
        isMounted = false;
        clearInterval(pollTimer);
        clearTimeout(timeoutTimer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [googleClientId, role, onGoogleSuccess]);

  // Handle Google Click (fallback if rendered button clicked or prompt needed)
  const handleGoogleClick = () => {
    setSocialError('');
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setSocialError('Please select or enable popups to complete Google Sign-In.');
        }
      });
    } else {
      setSocialError('Google Client ID is not configured or Google services are unreachable.');
    }
  };

  // Handle GitHub Click (Real OAuth Authorization redirect)
  const handleGithubClick = () => {
    setSocialError('');
    if (githubClientId) {
      localStorage.setItem('alumni_oauth_role', role);
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    } else {
      setSocialError('GitHub OAuth is not configured on this server. Please use Google or Email.');
    }
  };

  return (
    <div className="w-full space-y-3">
      {socialError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <span>{socialError}</span>
          <button
            type="button"
            onClick={() => setSocialError('')}
            className="text-amber-400 hover:text-white font-bold text-sm ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      <div className="w-full flex justify-center">
        {/* Google OAuth Button */}
        {googleClientId ? (
          <div ref={googleBtnRef} className="w-full flex justify-center min-h-[48px] scale-[1.04] origin-center py-1"></div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border border-white/[0.16] hover:border-white/[0.3] bg-[#121624] hover:bg-[#181F33] text-white font-medium text-sm sm:text-base transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.25)] hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="font-semibold tracking-wide text-slate-100 group-hover:text-white transition-colors">Continue with Google</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialAuthButtons;
