import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/**
 * AICopilot — Full-Featured AI Career & Mentorship Assistant
 * Features:
 * 1. Conversational Chat (AlumniCopilot) with quick topic chips & multi-turn memory
 * 2. Interview Prep Hub (Company & Role tailored behavioral/technical guide)
 * 3. Resume Bullet Polisher (Google XYZ Formula with quantified impact)
 * Dark luxury glassmorphism design with fluid ambient glow.
 */
const AICopilot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'interview' | 'resume'

  // Chat Tab State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I'm **AlumniCopilot**, your personal career strategist.\n\nI can help you prepare for technical interviews at top tech firms, polish your resume with Google's XYZ formula, or draft high-response cold outreach messages to alumni. What are you working on today?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Interview Prep Tab State
  const [interviewForm, setInterviewForm] = useState({
    company: 'Google',
    role: 'Software Engineer',
    level: 'Entry-Level'
  });
  const [interviewResult, setInterviewResult] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);

  // Resume Polish Tab State
  const [resumeBullet, setResumeBullet] = useState('');
  const [resumeRole, setResumeRole] = useState('Software Engineer');
  const [resumeResult, setResumeResult] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isOpen]);

  // Handle Send Chat
  const handleSendChat = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || chatLoading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const history = messages.slice(-5).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.post('/ai/chat', {
        message: query,
        conversationHistory: history
      });

      const assistantMsg = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: res.data.reply
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ I had trouble processing your question. Please try asking again in a moment.'
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Interview Prep Submit
  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    setInterviewLoading(true);
    setInterviewResult('');
    try {
      const res = await api.post('/ai/interview-prep', {
        targetCompany: interviewForm.company,
        role: interviewForm.role,
        experienceLevel: interviewForm.level
      });
      setInterviewResult(res.data.prepGuide);
    } catch (err) {
      setInterviewResult('⚠️ Failed to generate interview guide. Please check your connection and retry.');
    } finally {
      setInterviewLoading(false);
    }
  };

  // Handle Resume Polish Submit
  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    if (!resumeBullet.trim()) return;
    setResumeLoading(true);
    setResumeResult('');
    try {
      const res = await api.post('/ai/resume-polish', {
        bulletPoint: resumeBullet.trim(),
        targetRole: resumeRole
      });
      setResumeResult(res.data.result);
    } catch (err) {
      setResumeResult('⚠️ Failed to polish resume bullet. Please try again.');
    } finally {
      setResumeLoading(false);
    }
  };

  // Copy helper
  const handleCopyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore fallback
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-2xl shadow-[0_10px_35px_rgba(37,99,235,0.45)] border border-white/20 flex items-center gap-2.5 text-white hover:scale-105 active:scale-95 transition-all duration-300 z-50 cursor-pointer ${
          isOpen ? 'shadow-[0_0_40px_rgba(6,182,212,0.6)]' : ''
        }`}
        title="AlumniCopilot AI"
      >
        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-sm shadow-inner">
          {isOpen ? '✕' : '✨'}
        </div>
        <span className="font-bold text-xs sm:text-sm tracking-wide hidden sm:inline">
          {isOpen ? 'Close Copilot' : 'AlumniCopilot AI'}
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Slide-Up Copilot Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[450px] max-h-[85vh] h-[640px] bg-[#0E121C] border border-white/[0.12] rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden z-50 animate-scale-in text-white backdrop-blur-2xl">
          
          {/* Ambient Top Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between relative z-10 bg-[#0E121C]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-white">AlumniCopilot</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Neural AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Career Strategy & Mentorship Advisor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/[0.08] bg-[#121624] px-3 pt-2 gap-1 relative z-10">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-[#0E121C] text-cyan-300 border-t border-x border-white/[0.12] -mb-[1px]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>Ask Copilot</span>
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'interview'
                  ? 'bg-[#0E121C] text-cyan-300 border-t border-x border-white/[0.12] -mb-[1px]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎯</span>
              <span>Interview Prep</span>
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'resume'
                  ? 'bg-[#0E121C] text-cyan-300 border-t border-x border-white/[0.12] -mb-[1px]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📄</span>
              <span>Resume Polish</span>
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-4 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
            
            {/* ========================================================
                TAB 1: CONVERSATIONAL CHAT
               ======================================================== */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-3">
                
                {/* Prompt Quick Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <button
                    onClick={() => handleSendChat('How should I structure my 30-minute alumni coffee chat?')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-cyan-500/20 border border-white/[0.08] hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    ☕ Coffee Chat Structure
                  </button>
                  <button
                    onClick={() => handleSendChat('What are the top behavioral questions for Google SWE interviews?')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-cyan-500/20 border border-white/[0.08] hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    🎯 Google SWE Prep
                  </button>
                  <button
                    onClick={() => handleSendChat('How can I transition into Product Management with a CS degree?')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-cyan-500/20 border border-white/[0.08] hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    💡 CS to PM Transition
                  </button>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed relative group ${
                          m.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                            : 'bg-[#141A29] border border-white/[0.09] text-slate-200 rounded-tl-sm shadow-inner'
                        }`}
                      >
                        <div className="whitespace-pre-line prose-invert">
                          {m.text}
                        </div>

                        {/* Copy button for assistant responses */}
                        {m.sender === 'assistant' && (
                          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
                            <span>AlumniCopilot</span>
                            <button
                              onClick={() => handleCopyText(m.text, m.id)}
                              className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>{copiedId === m.id ? '✓ Copied' : '📋 Copy'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#141A29] border border-white/[0.09] w-28 animate-pulse text-xs text-cyan-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div className="pt-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ask anything about mentorship, interviews, careers..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={chatLoading}
                      className="flex-1 bg-[#131826] border border-white/[0.1] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !inputMessage.trim()}
                      className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 2: INTERVIEW PREP HUB
               ======================================================== */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
                <form onSubmit={handleInterviewSubmit} className="space-y-3 p-3.5 rounded-2xl bg-[#131826] border border-white/[0.08]">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Target Company
                      </label>
                      <input
                        type="text"
                        placeholder="Google, Stripe, Amazon..."
                        value={interviewForm.company}
                        onChange={(e) => setInterviewForm({ ...interviewForm, company: e.target.value })}
                        className="w-full bg-[#0E121C] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        placeholder="Software Engineer, PM..."
                        value={interviewForm.role}
                        onChange={(e) => setInterviewForm({ ...interviewForm, role: e.target.value })}
                        className="w-full bg-[#0E121C] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={interviewLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {interviewLoading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Generating Interview Strategy...</span>
                      </>
                    ) : (
                      <>
                        <span>🎯</span>
                        <span>Generate Interview Prep Guide</span>
                      </>
                    )}
                  </button>
                </form>

                {interviewResult && (
                  <div className="p-4 rounded-2xl bg-[#141A29] border border-white/[0.09] text-xs text-slate-200 leading-relaxed whitespace-pre-line animate-fade-in relative">
                    <button
                      onClick={() => handleCopyText(interviewResult, 'interview')}
                      className="absolute top-3 right-3 text-[11px] text-cyan-300 hover:underline cursor-pointer"
                    >
                      {copiedId === 'interview' ? '✓ Copied' : '📋 Copy Guide'}
                    </button>
                    {interviewResult}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                TAB 3: RESUME BULLET POLISHER (GOOGLE XYZ)
               ======================================================== */}
            {activeTab === 'resume' && (
              <div className="space-y-4">
                <form onSubmit={handleResumeSubmit} className="space-y-3 p-3.5 rounded-2xl bg-[#131826] border border-white/[0.08]">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Target Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer, Data Analyst"
                      value={resumeRole}
                      onChange={(e) => setResumeRole(e.target.value)}
                      className="w-full bg-[#0E121C] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Raw Resume Bullet Point
                    </label>
                    <textarea
                      placeholder="e.g. Built a website for students to connect with alumni mentors..."
                      value={resumeBullet}
                      onChange={(e) => setResumeBullet(e.target.value)}
                      className="w-full bg-[#0E121C] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none min-h-[75px]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resumeLoading || !resumeBullet.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resumeLoading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Polishing with XYZ Formula...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Upgrade with Google XYZ Formula</span>
                      </>
                    )}
                  </button>
                </form>

                {resumeResult && (
                  <div className="p-4 rounded-2xl bg-[#141A29] border border-white/[0.09] text-xs text-slate-200 leading-relaxed whitespace-pre-line animate-fade-in relative">
                    <button
                      onClick={() => handleCopyText(resumeResult, 'resume')}
                      className="absolute top-3 right-3 text-[11px] text-cyan-300 hover:underline cursor-pointer"
                    >
                      {copiedId === 'resume' ? '✓ Copied' : '📋 Copy Bullets'}
                    </button>
                    {resumeResult}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-3 bg-[#0B0E17] border-t border-white/[0.06] text-center text-[10px] text-slate-500">
            Powered by AlumniConnect AI Engine • Personalized Career Intelligence
          </div>

        </div>
      )}
    </>
  );
};

export default AICopilot;
