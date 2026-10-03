import React from 'react';
import { getInitials } from '../utils/imageUtils';

/**
 * MentorDetailsModal
 * Displays detailed information about a selected alumni mentor,
 * including their photo, company, domain, bio, graduation year, LinkedIn,
 * availability slots, and an action button to connect/book a session.
 */
const MentorDetailsModal = ({ mentor, isOpen, onClose, onConnect, connectLabel = 'Connect & Book Session' }) => {
  if (!isOpen || !mentor) return null;

  const avatar = mentor.profileImage || mentor.img;
  const name = mentor.name || 'Alumni Mentor';
  const roleOrCompany = mentor.company || mentor.role || 'Industry Alumnus';
  const domain = mentor.domain || 'Technology & Engineering';
  const graduationYear = mentor.graduationYear;
  const bio = mentor.bio;
  const linkedIn = mentor.linkedIn;
  const email = mentor.email;
  const availability = mentor.availability || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0E131F] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header / Avatar & Core details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-6 text-center sm:text-left relative z-10">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shrink-0 shadow-lg shadow-blue-500/20">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full rounded-[14px] object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-[#161B2E] flex items-center justify-center text-xl font-bold text-white uppercase">
                {getInitials(name)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0E131F] ring-1 ring-emerald-400" title="Verified Alumnus" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{name}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <span>✓</span> Verified Mentor
              </span>
            </div>

            <p className="text-sm font-semibold text-cyan-400 mb-1">{roleOrCompany}</p>
            <p className="text-xs text-slate-300">{domain}</p>

            {graduationYear && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-lg">
                <span>🎓</span>
                <span>Alumni Class of {graduationYear}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {bio && (
          <div className="mb-5 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              About Mentor
            </span>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}

        {/* Details Grid: Domain, Company, LinkedIn, Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-900/70 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Primary Expertise</span>
            <p className="text-xs font-medium text-white">{domain}</p>
          </div>

          <div className="bg-slate-900/70 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Current Organization</span>
            <p className="text-xs font-medium text-white">{roleOrCompany}</p>
          </div>

          {linkedIn && (
            <div className="bg-slate-900/70 border border-white/5 rounded-xl p-3 sm:col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">LinkedIn Profile</span>
                <span className="text-xs text-blue-400 truncate max-w-[260px] sm:max-w-xs block font-mono">
                  {linkedIn}
                </span>
              </div>
              <a
                href={linkedIn.startsWith('http') ? linkedIn : `https://${linkedIn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Open</span>
                <span>↗</span>
              </a>
            </div>
          )}

          {email && (
            <div className="bg-slate-900/70 border border-white/5 rounded-xl p-3 sm:col-span-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Contact Email</span>
              <p className="text-xs text-slate-300 font-mono">{email}</p>
            </div>
          )}
        </div>

        {/* Availability Schedule */}
        <div className="mb-6 bg-slate-900/50 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>📅</span> Mentorship Availability
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {availability.length > 0 ? `${availability.length} active slot(s)` : 'Available upon booking'}
            </span>
          </div>

          {availability.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availability.map((slot, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-slate-200"
                >
                  <strong className="text-white capitalize">{slot.day}:</strong> {slot.startTime} – {slot.endTime}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              This mentor reviews incoming session requests and confirms meeting dates on demand.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/[0.06] text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Close
          </button>

          {onConnect && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onConnect(mentor);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🤝</span>
              <span>{connectLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDetailsModal;
