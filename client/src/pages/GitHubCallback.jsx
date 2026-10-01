import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * GitHubCallback — Handles GitHub OAuth redirect code exchange
 */
const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { githubLogin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error_description') || searchParams.get('error');

  useEffect(() => {
    const exchangeCode = async () => {
      if (errorParam) {
        setError(`GitHub authentication rejected: ${errorParam}`);
        setLoading(false);
        return;
      }

      if (!code) {
        setError('No authorization code received from GitHub.');
        setLoading(false);
        return;
      }

      try {
        const storedRole = localStorage.getItem('alumni_oauth_role') || 'student';
        await githubLogin({ code, role: storedRole });
        // Navigation to dashboard is handled inside AuthContext
      } catch (err) {
        setError(err.message || 'Failed to exchange GitHub authorization code.');
        setLoading(false);
      }
    };

    exchangeCode();
  }, [code, errorParam, githubLogin]);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-white selection:bg-[#2563EB] selection:text-white relative overflow-hidden">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-[#0E121C] rounded-[32px] border border-white/[0.1] shadow-2xl max-w-md w-full p-8 sm:p-10 text-center relative overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-500/15 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-500/15 rounded-full blur-[60px] pointer-events-none" />

          {loading ? (
            <div className="space-y-5 relative z-10 py-4">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold font-display text-white tracking-tight mb-1">
                  Connecting GitHub Account
                </h2>
                <p className="text-xs text-slate-400">
                  Verifying authorization code and establishing secure session...
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 relative z-10 py-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>

              <h2 className="text-xl font-bold font-display text-white tracking-tight">
                Authentication Error
              </h2>
              <p className="text-xs text-rose-300 leading-relaxed max-w-xs mx-auto">
                {error}
              </p>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-lg inline-block transition-all"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GitHubCallback;
