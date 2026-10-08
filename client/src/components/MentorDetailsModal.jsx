import React, { useState } from 'react';
import { getInitials } from '../utils/imageUtils';
import CertificateViewerModal from './CertificateViewerModal';

/**
 * MentorDetailsModal
 * Displays detailed information about a selected alumni mentor,
 * including their photo, company, domain, bio, graduation year, LinkedIn,
 * availability slots, and an action button to connect/book a session.
 */
const MentorDetailsModal = ({ mentor, isOpen, onClose, onConnect, connectLabel = 'Connect & Book Session' }) => {
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Escape key handler to close modal (Declared unconditionally at top of component)
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentor) return null;

  const avatar = mentor.profileImage || mentor.img;
  const name = mentor.name || 'Alumni Mentor';
  const roleOrCompany = mentor.company || mentor.role || 'Industry Alumnus';
  const designation = mentor.designation;
  const headline = mentor.headline;
  const qualification = mentor.qualification;
  const college = mentor.college;
  const experienceYears = mentor.experienceYears;
  const skills = Array.isArray(mentor.skills) 
    ? mentor.skills 
    : (typeof mentor.skills === 'string' ? mentor.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
  const certifications = mentor.certifications;
  const certificatesList = Array.isArray(mentor.certificatesList) ? mentor.certificatesList : [];
  const github = mentor.github;
  const portfolio = mentor.portfolio;
  const domain = mentor.domain || 'Technology & Engineering';
  const graduationYear = mentor.graduationYear;
  const bio = mentor.bio;
  const linkedIn = mentor.linkedIn;
  const email = mentor.email;
  const phoneNumber = mentor.phoneNumber;
  const availability = mentor.availability || [];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-[#0E131F] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button - Cross Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2.5 rounded-full hover:bg-white/10 bg-white/[0.04] border border-white/5 transition-all cursor-pointer z-30 shadow-md active:scale-90"
          aria-label="Close mentor profile modal"
          title="Close (Esc)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header / Avatar & Core details (LinkedIn Header Style) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-5 text-center sm:text-left relative z-10">
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

            {/* LinkedIn-style Headline */}
            {headline ? (
              <p className="text-xs sm:text-sm font-medium text-cyan-300 mb-1.5 leading-snug">
                {headline}
              </p>
            ) : (
              <p className="text-sm font-semibold text-cyan-400 mb-1">{designation ? `${designation} @ ${roleOrCompany}` : roleOrCompany}</p>
            )}

            {/* Quick credentials tag strip */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              {roleOrCompany && (
                <span className="text-[11px] font-medium text-slate-300 bg-white/[0.05] border border-white/10 px-2.5 py-0.5 rounded-md">
                  🏢 {roleOrCompany}
                </span>
              )}
              {experienceYears && (
                <span className="text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                  💼 {experienceYears}+ Yrs Exp
                </span>
              )}
              {domain && (
                <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md">
                  ⚡ {domain}
                </span>
              )}
              {graduationYear && (
                <span className="text-[11px] font-medium text-slate-400 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-md">
                  🎓 Class of {graduationYear}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Education & Qualification Card (LinkedIn Education Style) */}
        {(qualification || college) && (
          <div className="mb-4 bg-gradient-to-r from-blue-950/30 to-purple-950/20 border border-blue-500/20 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-lg text-blue-400 shrink-0">
              🎓
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                Education & Qualifications
              </span>
              {qualification && <p className="text-xs font-semibold text-white leading-tight">{qualification}</p>}
              {college && <p className="text-[11px] text-slate-300 mt-0.5">{college}</p>}
            </div>
          </div>
        )}

        {/* Skills & Endorsements Section */}
        {skills && skills.length > 0 && (
          <div className="mb-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>🎯</span> Skills & Technical Expertise
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{skills.length} skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-medium transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Honors Section (With Uploaded Proof) */}
        {((certificatesList && certificatesList.length > 0) || certifications) && (
          <div className="mb-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🏆</span> Certifications & Honors
              </span>
              {certificatesList.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono">
                  {certificatesList.length} Verified
                </span>
              )}
            </div>

            {/* Uploaded Certificate Items */}
            {certificatesList.length > 0 && (
              <div className="space-y-2 mb-2.5">
                {certificatesList.map((certItem, idx) => {
                  if (!certItem) return null;
                  const cert = typeof certItem === 'object' ? certItem : { title: String(certItem) };
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs group hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {cert.fileUrl ? (
                        cert.fileType === 'pdf' ? (
                          <div 
                            onClick={() => setViewingCertificate(cert)}
                            className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-xs font-bold text-rose-400 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            title="Click to view PDF proof"
                          >
                            PDF
                          </div>
                        ) : (
                          <img
                            src={cert.fileUrl}
                            alt={cert.title}
                            onClick={() => setViewingCertificate(cert)}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            title="Click to preview certificate"
                          />
                        )
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-sm shrink-0">
                          🏆
                        </div>
                      )}

                      <div className="min-w-0">
                        <strong className="text-white block truncate leading-tight group-hover:text-amber-300 transition-colors">
                          {cert.title}
                        </strong>
                        <p className="text-[11px] text-slate-400 truncate">
                          {cert.issuer || 'Verified Credential'} {cert.issueYear ? `• ${cert.issueYear}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {cert.fileUrl && (
                        <button
                          type="button"
                          onClick={() => setViewingCertificate(cert)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>👁️</span>
                          <span>View Proof</span>
                        </button>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 text-[11px] font-medium transition-colors"
                          title="Verify at issuer website"
                        >
                          Verify ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}

            {/* Fallback summary text if present */}
            {certifications && (
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                {certifications}
              </p>
            )}
          </div>
        )}

        {/* Bio / About Section */}
        {bio && (
          <div className="mb-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              About & Experience
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}

        {/* Professional Links (LinkedIn, GitHub, Portfolio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {linkedIn && (
            <a
              href={linkedIn.startsWith('http') ? linkedIn : `https://${linkedIn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 border border-[#0A66C2]/30 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#0A66C2] fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 0 0-1.64 1.63 1.64 1.64 0 0 0 1.64 1.63 1.64 1.64 0 0 0 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
                </svg>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">LinkedIn Profile</span>
                  <span className="text-xs text-blue-300 font-medium group-hover:text-white transition-colors">View Profile</span>
                </div>
              </div>
              <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform text-xs">↗</span>
            </a>
          )}

          {github && (
            <a
              href={github.startsWith('http') ? github : `https://${github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">💻</span>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">GitHub</span>
                  <span className="text-xs text-slate-200 group-hover:text-white transition-colors">Projects & Code</span>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform text-xs">↗</span>
            </a>
          )}

          {portfolio && (
            <a
              href={portfolio.startsWith('http') ? portfolio : `https://${portfolio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-between transition-all group sm:col-span-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🌐</span>
                <div>
                  <span className="text-[10px] text-purple-300 font-semibold block uppercase">Portfolio / Website</span>
                  <span className="text-xs text-slate-200 font-mono truncate max-w-xs block">{portfolio}</span>
                </div>
              </div>
              <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform text-xs">↗</span>
            </a>
          )}
        </div>

        {/* Verified Contact Details (Email & Phone) */}
        {(email || phoneNumber) && (
          <div className="mb-5 bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Verified Mentor Contact Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {email && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-xs shrink-0">
                    ✉️
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Registered Email</span>
                    <a href={`mailto:${email}`} className="text-xs text-blue-300 font-mono truncate block hover:underline" title={email}>
                      {email}
                    </a>
                  </div>
                </div>
              )}
              {phoneNumber && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-xs shrink-0">
                    📞
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Contact Phone</span>
                    <a href={`tel:${phoneNumber}`} className="text-xs text-emerald-300 font-mono truncate block hover:underline">
                      {phoneNumber}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Certificate Proof Fullscreen Viewer Modal */}
        <CertificateViewerModal
          isOpen={Boolean(viewingCertificate)}
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      </div>
    </div>
  );
};

export default MentorDetailsModal;
