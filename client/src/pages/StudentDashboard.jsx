import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import RequestSessionModal from '../components/RequestSessionModal';
import AICopilot from '../components/AICopilot';
import LoadingSpinner from '../components/LoadingSpinner';
import EmailVerificationModal from '../components/EmailVerificationModal';
import ProfileModal from '../components/ProfileModal';
import { getInitials } from '../utils/imageUtils';

/**
 * StudentDashboard — Main dashboard for logged-in students.
 * Fetches sessions and mentors from the backend in real time.
 */
const StudentDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [domainFilter, setDomainFilter] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch student's sessions and available mentors from the API
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsRes, mentorsRes] = await Promise.all([
        api.get('/sessions/my'),
        api.get('/mentors'),
      ]);
      setSessions(sessionsRes.data.sessions || sessionsRes.data);
      setMentors(mentorsRes.data.mentors || mentorsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== undefined) {
      setSearch(q);
    }
  }, [searchParams]);

  // After a successful session request, refresh data
  const handleRequestSuccess = () => {
    setSelectedMentor(null);
    fetchData();
  };

  // Filter mentors by search text and domain
  const filteredMentors = mentors.filter(m =>
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.company && m.company.toLowerCase().includes(search.toLowerCase()))) &&
    (domainFilter === '' || m.domain === domainFilter)
  );

  // Compute stats from real session data
  const totalSessions = sessions.length;
  const pendingSessions = sessions.filter(s => s.status === 'pending').length;
  const approvedSessions = sessions.filter(s => s.status === 'approved').length;

  if (loading) return <><Navbar /><LoadingSpinner fullPage /></>;

  return (
    <div className="min-h-screen bg-[#07090E] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#0E121C] border border-white/[0.08] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-1/3 w-60 h-32 bg-cyan-600/10 rounded-full blur-[70px] pointer-events-none" />

            <div className="flex items-center gap-4">
              {/* Profile Photo Avatar with Edit Trigger */}
              <div className="relative group shrink-0">
                <div 
                  onClick={() => setShowProfileModal(true)}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-[1.5px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-md overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                  title="Click to view or upload photo"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full rounded-[10px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[10px] bg-[#131826] flex items-center justify-center text-sm font-bold text-white">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  title="Upload / Change Photo"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow border border-[#0E121C] text-[9px] transition-all cursor-pointer hover:scale-110"
                >
                  📷
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Student Mentee
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 underline font-medium transition-colors cursor-pointer"
                  >
                    Edit Profile Photo
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading text-white flex items-center gap-2.5">
                  Welcome back, <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Student'}</span>! <span>👋</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Manage your mentorship sessions and book 1-on-1 guidance</p>
              </div>
            </div>

            {/* Student Academic Credentials Badge */}
            {(user?.registrationNumber || user?.branch || user?.rollNumber) && (
              <div className="p-3 rounded-2xl bg-[#131826] border border-white/[0.09] shadow-inner text-xs flex flex-wrap items-center gap-2.5 text-slate-300 shrink-0">
                {user.branch && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                    🎓 {user.branch}
                  </span>
                )}
                {user.semester && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                    📚 {user.semester}
                  </span>
                )}
                {user.registrationNumber && (
                  <span className="text-[11px] text-slate-400">
                    Reg: <strong className="text-white font-mono">{user.registrationNumber}</strong>
                  </span>
                )}
                {user.rollNumber && (
                  <span className="text-[11px] text-slate-400">
                    Roll: <strong className="text-white font-mono">{user.rollNumber}</strong>
                  </span>
                )}
                {user.phoneNumber && (
                  <span className="text-[11px] text-slate-400">
                    📞 <strong className="text-white font-mono">{user.phoneNumber}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assigned Alumni Mentor Spotlight Card */}
        {user?.assignedMentor && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-cyan-950/30 border border-purple-500/30 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-xl overflow-hidden shrink-0">
                  {user.assignedMentor.profileImage ? (
                    <img
                      src={user.assignedMentor.profileImage}
                      alt={user.assignedMentor.name}
                      className="w-full h-full rounded-[14px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-[#111624] flex items-center justify-center text-lg font-bold text-white">
                      {getInitials(user.assignedMentor.name)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 mb-1">
                    <span>⭐</span> Your Assigned Alumni Mentor
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {user.assignedMentor.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {user.assignedMentor.company ? <strong className="text-white">{user.assignedMentor.company}</strong> : null}
                    {user.assignedMentor.company && user.assignedMentor.domain ? ' • ' : ''}
                    {user.assignedMentor.domain || 'Alumni Mentor'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(user.assignedMentor)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>📅</span>
                  <span>Book 1-on-1 Guidance Slot</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Status Banner */}
        {user && !user.isEmailVerified && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-200 text-xs shadow-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong className="text-white text-sm font-semibold block">Email Verification Required</strong>
                <span className="text-slate-300">Verify your account with a 6-digit OTP code to unlock priority mentor booking and verified credentials.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              Verify with 6-Digit OTP →
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-medium">Retry</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card-dark p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-indigo-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/10">📊</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Sessions</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent mt-0.5">{totalSessions}</p>
            </div>
          </div>
          <div className="glass-card-dark p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-amber-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/10">⏳</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Requests</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-white bg-clip-text text-transparent mt-0.5">{pendingSessions}</p>
            </div>
          </div>
          <div className="glass-card-dark p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-emerald-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10">✅</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Approved Sessions</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-white bg-clip-text text-transparent mt-0.5">{approvedSessions}</p>
            </div>
          </div>
        </div>

        {/* Main Content: Sessions + Mentors */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT: My Sessions */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>My Mentorship Sessions</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 font-normal">{sessions.length}</span>
            </h2>

            {sessions.length === 0 ? (
              <div className="glass-card-dark rounded-2xl border border-white/10 p-10 text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-semibold text-white mb-1">No sessions booked yet</h3>
                <p className="text-xs text-slate-400 mb-5">Explore available alumni mentors on the right to schedule your first 1-on-1 session!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map(session => (
                  <div key={session._id || session.id} className="glass-card-dark rounded-2xl border border-white/10 p-5 shadow-lg hover:border-purple-500/40 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-base">
                          {session.mentor?.name || 'Mentor'}
                        </h3>
                        <p className="text-xs text-cyan-400 font-medium">
                          {session.mentor?.company || ''}
                        </p>
                      </div>
                      <span className={`badge-${session.status}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          session.status === 'pending' ? 'bg-amber-400' :
                          session.status === 'approved' ? 'bg-emerald-400' :
                          session.status === 'rejected' ? 'bg-red-400' :
                          'bg-cyan-400'
                        }`}></span>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-200 mb-2">Topic: <span className="text-white font-normal">{session.topic}</span></div>

                    {session.status === 'approved' && session.scheduledDate && (
                      <div className="mt-4 pt-3 border-t border-white/10 bg-slate-900/60 p-3.5 rounded-xl border border-emerald-500/20">
                        <p className="text-xs text-slate-400 font-medium mb-1">Scheduled for:</p>
                        <p className="text-sm text-emerald-300 font-semibold mb-1">📅 {new Date(session.scheduledDate).toLocaleString()}</p>
                        {session.mentorNotes && (
                          <p className="text-xs text-slate-400 italic">"{session.mentorNotes}"</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Find Mentors */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Find Mentors</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 font-normal">{filteredMentors.length}</span>
            </h2>
            <div className="glass-card-dark rounded-2xl border border-white/10 p-5">
              {/* AI Smart Match Assistant Banner */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-cyan-500/25 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <span className="text-xs font-bold text-white block">AI Matchmaker Active</span>
                    <span className="text-[10px] text-cyan-300">Click any mentor to auto-draft requests with AI</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDomainFilter(domainFilter === 'Software Engineering' ? '' : 'Software Engineering')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  {domainFilter === 'Software Engineering' ? 'Show All' : 'Top Tech'}
                </button>
              </div>

              {/* Search & Filter */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Search name or company..."
                  className="input-field text-sm py-2.5"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  className="input-field text-sm py-2.5"
                  value={domainFilter}
                  onChange={e => setDomainFilter(e.target.value)}
                >
                  <option value="">All Domains</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Finance">Finance</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              {/* Mentor List */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredMentors.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No mentors found</p>
                ) : (
                  filteredMentors.map(mentor => (
                    <div key={mentor._id || mentor.id} className="bg-slate-900/60 border border-white/10 rounded-xl p-3.5 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                          {mentor.profileImage ? (
                            <img
                              src={mentor.profileImage}
                              alt={mentor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            mentor.name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white leading-tight">{mentor.name}</h4>
                          <p className="text-xs text-cyan-400">{mentor.company}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full block w-fit mb-3">
                        {mentor.domain}
                      </span>
                      <button
                        onClick={() => setSelectedMentor(mentor)}
                        className="w-full text-xs font-semibold btn-gold py-2 rounded-lg"
                      >
                        Request Session
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Assistant Floating Panel */}
      <AICopilot />

      {/* Session Request Modal */}
      <RequestSessionModal
        mentor={selectedMentor}
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
        onSuccess={handleRequestSuccess}
      />

      {/* 6-Digit OTP Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />

      {/* Profile & Photo Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default StudentDashboard;
