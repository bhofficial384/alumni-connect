import React, { useEffect, useRef } from 'react';

const GoogleSignInButton = ({ onGoogleSuccess, role = 'student' }) => {
  const googleBtnRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (clientId && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onGoogleSuccess({ credential: response.credential, role });
            }
          }
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
      } catch (err) {
        console.warn('Google SDK init error:', err);
      }
    }
  }, [clientId, role, onGoogleSuccess]);

  const handleCustomGoogleClick = () => {
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full">
      {clientId ? (
        <div ref={googleBtnRef} className="w-full flex justify-center"></div>
      ) : (
        <button
          type="button"
          onClick={handleCustomGoogleClick}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-700 rounded-xl hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
        >
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;
