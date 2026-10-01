import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#05070B] text-white pt-16 pb-8 border-t border-white/10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="font-display text-xl font-extrabold tracking-wider text-white">
                ALUMNI<span className="text-[#2563EB]">.</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Connecting alumni with the next generation. Fostering mentorship, career growth, and lifelong networks.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-cream">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a></li>
              <li><a href="#mentors" className="hover:text-gold transition-colors">Find a Mentor</a></li>
              <li><a href="#testimonials" className="hover:text-gold transition-colors">Success Stories</a></li>
              <li><Link to="/register" className="hover:text-gold transition-colors">Join as Mentor</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-cream">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-gold transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Interview Guide</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Resume Tips</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-cream">Alumni Relations Office</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>✉️ alumni-relations@university.edu</li>
              <li>📞 +1 (555) 019-2834</li>
              <li>⏰ Mon - Fri: 9:00 AM - 5:00 PM EST</li>
              <li>📍 Alumni Hall, Campus Center</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AlumniConnect. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <span className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all cursor-pointer text-xs">In</span>
            <span className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer text-xs">Tw</span>
            <span className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all cursor-pointer text-xs">Fb</span>
          </div>
          <p className="mt-4 md:mt-0 text-slate-400">Designed with ❤️ for Group 08</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
