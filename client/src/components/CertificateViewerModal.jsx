import React from 'react';

/**
 * CertificateViewerModal
 * Displays high-resolution certificate or honor document/image with metadata,
 * external verification link, and full-screen view.
 */
const CertificateViewerModal = ({ certificate, isOpen, onClose }) => {
  if (!isOpen || !certificate) return null;

  const isPdf = certificate.fileType === 'pdf' || (certificate.fileUrl && certificate.fileUrl.startsWith('data:application/pdf'));

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-[#0E121C] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏆</span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                {certificate.title || 'Certificate & Honor'}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              {certificate.issuer && (
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 font-semibold">
                  🏢 {certificate.issuer}
                </span>
              )}
              {certificate.issueYear && (
                <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-300">
                  📅 Issued: {certificate.issueYear}
                </span>
              )}
              {certificate.credentialUrl && (
                <a
                  href={certificate.credentialUrl.startsWith('http') ? certificate.credentialUrl : `https://${certificate.credentialUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold hover:bg-emerald-500/25 flex items-center gap-1 transition-colors"
                >
                  <span>Verify Credential</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors shrink-0"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 overflow-auto my-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center min-h-[300px] p-2 relative">
          {certificate.fileUrl ? (
            isPdf ? (
              <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
                <span className="text-5xl mb-3">📄</span>
                <p className="text-sm font-semibold text-white mb-2">{certificate.fileName || 'PDF Certificate Document'}</p>
                <p className="text-xs text-slate-400 mb-4 max-w-md">
                  This certificate was uploaded as a PDF document. You can open and view it in a new window or print it.
                </p>
                <div className="flex gap-3">
                  <a
                    href={certificate.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={certificate.fileName || 'certificate.pdf'}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Open / Download PDF ↗
                  </a>
                </div>
              </div>
            ) : (
              <img
                src={certificate.fileUrl}
                alt={certificate.title || 'Certificate Proof'}
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            )
          ) : (
            <div className="p-8 text-center text-slate-400">
              <span className="text-4xl block mb-2">📜</span>
              <p className="text-sm font-medium text-slate-300">No document/image was uploaded for this certificate.</p>
              {certificate.credentialUrl && (
                <a
                  href={certificate.credentialUrl.startsWith('http') ? certificate.credentialUrl : `https://${certificate.credentialUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Visit Credential Link ↗
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 shrink-0 text-xs text-slate-400">
          <span>Verified Alumni & Mentor Credential</span>
          {certificate.fileUrl && !isPdf && (
            <a
              href={certificate.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={certificate.fileName || `${certificate.title || 'certificate'}.jpg`}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white font-medium border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <span>Download High-Res</span>
              <span>💾</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateViewerModal;
