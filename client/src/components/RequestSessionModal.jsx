import React, { useState } from 'react';
import api from '../api/axios';

/**
 * RequestSessionModal — Modal dialog for students to request a mentoring session.
 * Sends POST /api/sessions to the backend.
 */
const RequestSessionModal = ({ mentor, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ topic: '', message: '', preferredDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiDrafting, setAiDrafting] = useState(false);

  if (!isOpen) return null;

  // AI 1-click outreach note generator
  const handleAiDraft = async () => {
    setAiDrafting(true);
    setError('');
    try {
      const res = await api.post('/ai/draft-outreach', {
        mentorName: mentor?.name || 'Alumni Mentor',
        mentorCompany: mentor?.company,
        mentorDomain: mentor?.domain,
        topic: formData.topic || 'Career guidance & industry insights'
      });
      if (res.data?.outreachMessage) {
        setFormData((prev) => ({
          ...prev,
          message: res.data.outreachMessage
        }));
      }
    } catch (err) {
      console.warn('AI Draft error:', err);
      // Fallback local note if network error
      setFormData((prev) => ({
        ...prev,
        message: `Hi ${mentor?.name || 'Mentor'},\n\nI came across your profile on AlumniConnect and was impressed by your experience${mentor?.company ? ` at ${mentor.company}` : ''}. I'd love to connect for a 30-minute session to ask a few questions about ${formData.topic || 'career transition and industry best practices'}.\n\nThank you for giving back to the community!`
      }));
    } finally {
      setAiDrafting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      setLoading(false);
      return;
    }
    if (!formData.message.trim()) {
      setError('Please enter a message');
      setLoading(false);
      return;
    }

    try {
      await api.post('/sessions', {
        mentorId: mentor._id || mentor.id,
        topic: formData.topic.trim(),
        message: formData.message.trim(),
        preferredDate: formData.preferredDate || undefined,
      });

      // Reset form and notify parent
      setFormData({ topic: '', message: '', preferredDate: '' });
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to request session. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-card-dark rounded-2xl shadow-2xl border border-white/15 max-w-lg w-full p-6 sm:p-8 animate-slide-up relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-2">
            🤝 Direct Alumni Connection
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
            Connect & Request Session
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Connect with <span className="text-cyan-300 font-semibold">{mentor?.name}</span> ({mentor?.company || 'Alumni Mentor'})
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Topic *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Mock Interview, Resume Review, Tech Stack Transition"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">Message *</label>
              <button
                type="button"
                disabled={aiDrafting}
                onClick={handleAiDraft}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[11px] font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {aiDrafting ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-cyan-300" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>AI Draft Message</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              className="input-field min-h-[110px]"
              placeholder="Tell the mentor your background and what specific areas you'd like guidance on, or click 'AI Draft Message'..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Preferred Date (Optional)</label>
            <input
              type="date"
              className="input-field"
              value={formData.preferredDate}
              onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Dispatching...
                </>
              ) : (
                '🤝 Connect & Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestSessionModal;
