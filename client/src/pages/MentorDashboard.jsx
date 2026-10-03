import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import AICopilot from '../components/AICopilot';
import ProfileModal from '../components/ProfileModal';
import ApproveScheduleModal from '../components/ApproveScheduleModal';
import UniversalProfileDetailsModal from '../components/UniversalProfileDetailsModal';
import { getInitials } from '../utils/imageUtils';

/**
 * MentorDashboard — Dashboard for alumni mentors.
 * Shows incoming session requests (approve/reject), and availability management.
 * All data fetched live from the backend.
 */
const MentorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '', endTime: '' });
  const [actionLoading, setActionLoading] = useState(null); // Track which request is being acted on
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedSessionToApprove, setSelectedSessionToApprove] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Fetch incoming session requests from the API
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/sessions/incoming');
      setRequests(res.data.sessions || res.data);
    } catch (err) {
      console.error('Failed to fetch session requests:', err);
      setError('Failed to load session requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current availability from user profile
  const fetchAvailability = async () => {
    try {
      const res = await api.get('/auth/me');
      setAvailability(res.data.user?.availability || []);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAvailability();
  }, []);

  // Confirm approved session with date, time, and meeting notes
  const handleConfirmApproval = async ({ sessionId, scheduledDate, mentorNotes }) => {
    setActionLoading(sessionId);
    try {
      await api.patch(`/sessions/${sessionId}/status`, {
        status: 'approved',
        scheduledDate,
        mentorNotes,
      });
      // Refresh the requests list
      await fetchData();
    } catch (err) {
      console.error('Failed to update session status:', err);
      throw new Error(err.response?.data?.message || 'Failed to approve session');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject session request
  const handleReject = async (sessionId) => {
    if (!window.confirm('Are you sure you want to decline this session request?')) return;
    setActionLoading(sessionId);
    try {
      await api.patch(`/sessions/${sessionId}/status`, { status: 'rejected' });
      await fetchData();
    } catch (err) {
      console.error('Failed to decline session:', err);
      alert(err.response?.data?.message || 'Failed to decline session. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Add a new availability slot to the local list
  const handleAddSlot = (e) => {
    e.preventDefault();
    if (newSlot.startTime && newSlot.endTime) {
      setAvailability([...availability, { ...newSlot }]);
      setNewSlot({ day: 'Monday', startTime: '', endTime: '' });
    }
  };

  // Remove a slot from the local list
  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  // Save availability to the backend via PUT /api/mentors/availability
  const saveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await api.put('/mentors/availability', { availability });
      alert('Availability saved successfully!');
    } catch (err) {
      console.error('Failed to save availability:', err);
      alert(err.response?.data?.message || 'Failed to save availability.');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Compute stats from real data
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const uniqueMentees = new Set(requests.map(r => r.student?._id || r.student?.id || r.studentName)).size;

  if (loading) return <><Navbar /><LoadingSpinner fullPage /></>;

  return (
    <div className="min-h-screen bg-[#07090E] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#0E121C] border border-white/[0.08] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-60 h-32 bg-purple-600/10 rounded-full blur-[70px] pointer-events-none" />

            <div className="flex items-center gap-5">
              {/* Profile Photo Avatar with Edit Trigger */}
              <div className="relative group shrink-0">
                <div 
                  onClick={() => setShowProfileModal(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 shadow-xl overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                  title="Click to view or upload photo"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full rounded-[14px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-[#131826] flex items-center justify-center text-xl font-bold text-white">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  title="Upload / Change Photo"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg border-2 border-[#0E121C] text-[11px] transition-all cursor-pointer hover:scale-110"
                >
                  📷
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    Alumni Mentor
                  </span>

                  {/* Mentor Approval Badge */}
                  {user?.isApproved ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                      <span>✓</span> Verified & Approved
                    </span>
                  ) : user?.approvalStatus === 'rejected' ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                      ✕ Approval Declined
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-amber-500/20">
                      <span>⏳</span> Pending Admin Approval
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 underline font-medium transition-colors cursor-pointer"
                  >
                    Edit Profile Photo
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading text-white flex items-center gap-2.5">
                  Welcome back, <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Mentor'}</span>! <span>👋</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Manage incoming requests, approve sessions, and update your weekly availability</p>
              </div>
            </div>

            {/* Mentor Company & Domain Badges */}
            {(user?.company || user?.domain) && (
              <div className="p-3 rounded-2xl bg-[#131826] border border-white/[0.09] shadow-inner text-xs flex flex-wrap items-center gap-2.5 text-slate-300 shrink-0">
                {user.company && (
                  <span className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-white font-semibold flex items-center gap-1.5">
                    🏢 {user.company}
                  </span>
                )}
                {user.domain && (
                  <span className="px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                    ⚡ {user.domain}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mentor Admin Approval Status Banner */}
        {user && (!user.isApproved || user.approvalStatus === 'pending') && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4 text-amber-200 shadow-xl animate-fade-in">
            <span className="text-2xl mt-0.5">⏳</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-white text-sm font-semibold">Account Pending Admin Verification</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider font-bold">
                  In Review
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Welcome to AlumniConnect! Your mentor profile has been registered and is currently under review by the university administration. Once approved, your profile will be published to the mentor directory for students to request 1-on-1 career guidance sessions.
              </p>
            </div>
          </div>
        )}

        {user && user.approvalStatus === 'rejected' && (
          <div className="mb-8 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-4 text-rose-200 shadow-xl animate-fade-in">
            <span className="text-2xl mt-0.5">❌</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-white text-sm font-semibold">Registration Not Approved</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider font-bold">
                  Declined
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your alumni mentor registration was declined by the administrator. Please contact the Alumni Relations Office (<a href="mailto:alumni-office@university.edu" className="underline text-white">alumni-office@university.edu</a>) for more details.
              </p>
            </div>
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
          <div className="glass-card-dark p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-amber-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/10">⏳</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Incoming Requests</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-white bg-clip-text text-transparent mt-0.5">{pendingCount}</p>
            </div>
          </div>
          <div className="glass-card-dark p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-emerald-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10">✅</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Approved Sessions</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-white bg-clip-text text-transparent mt-0.5">{approvedCount}</p>
            </div>
          </div>
          <div className="glass-card-dark p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-indigo-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/10">👥</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Mentees</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent mt-0.5">{uniqueMentees}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SESSION REQUESTS */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Incoming Session Requests</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 font-normal">{requests.length}</span>
            </h2>

            {requests.length === 0 ? (
              <div className="glass-card-dark rounded-2xl border border-white/10 p-10 text-center">
                <div className="text-4xl mb-3">📬</div>
                <h3 className="font-semibold text-white mb-1">No requests right now</h3>
                <p className="text-xs text-slate-400">When students request sessions, they'll appear here for your review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req._id || req.id} className="glass-card-dark rounded-2xl border border-white/10 p-6 shadow-lg hover:border-purple-500/40 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group/student"
                        onClick={() => req.student && setViewingStudent(req.student)}
                        title="Click to view student profile & details"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md group-hover/student:scale-105 transition-transform">
                          {req.student?.profileImage ? (
                            <img
                              src={req.student.profileImage}
                              alt={req.student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(req.student?.name || 'Student')
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base text-white group-hover/student:text-cyan-300 transition-colors">
                              {req.student?.name || 'Student'}
                            </h3>
                            {req.student?.branch && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 font-semibold">
                                {req.student.branch}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {req.student?.email || ''}
                            {req.student?.registrationNumber && ` • Reg: ${req.student.registrationNumber}`}
                          </p>
                        </div>
                      </div>
                      <span className={`badge-${req.status}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          req.status === 'pending' ? 'bg-amber-400' :
                          req.status === 'approved' ? 'bg-emerald-400' :
                          req.status === 'rejected' ? 'bg-red-400' :
                          'bg-cyan-400'
                        }`}></span>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>

                    <div className="bg-slate-900/70 border border-white/10 p-4 rounded-xl mb-4">
                      <p className="text-sm font-semibold text-cyan-300 mb-1">Topic: {req.topic}</p>
                      <p className="text-xs text-slate-300 italic">"{req.message}"</p>
                      {req.preferredDate && (
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                          Preferred: {new Date(req.preferredDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSessionToApprove(req)}
                          disabled={actionLoading === (req._id || req.id)}
                          className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <span>📅</span>
                          <span>Approve & Schedule</span>
                          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md text-emerald-200 font-mono">
                            Calendar & Clock
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req._id || req.id)}
                          disabled={actionLoading === (req._id || req.id)}
                          className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold rounded-xl transition-all text-xs disabled:opacity-50 cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {req.status === 'approved' && req.scheduledDate && (
                      <div className="text-xs text-emerald-300 bg-emerald-500/10 px-3.5 py-2.5 rounded-xl border border-emerald-500/30 font-medium">
                        📅 Scheduled for: {new Date(req.scheduledDate).toLocaleString()}
                        {req.mentorNotes && (
                          <p className="text-xs text-emerald-400 mt-1 italic">Note: {req.mentorNotes}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AVAILABILITY SCHEDULER */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>My Availability</span>
            </h2>
            <div className="glass-card-dark rounded-2xl border border-white/10 p-6">
              {/* Add Slot Form */}
              <form onSubmit={handleAddSlot} className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Day of Week</label>
                  <select
                    className="input-field text-sm py-2.5"
                    value={newSlot.day}
                    onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <span>🕒</span>
                      <span>Start Time</span>
                    </label>
                    <input
                      type="time"
                      className="input-field text-sm py-2 font-mono"
                      value={newSlot.startTime}
                      onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <span>🕒</span>
                      <span>End Time</span>
                    </label>
                    <input
                      type="time"
                      className="input-field text-sm py-2 font-mono"
                      value={newSlot.endTime}
                      onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Quick Clock Presets */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                    Quick Clock Slots:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setNewSlot(prev => ({ ...prev, startTime: '10:00', endTime: '12:00' }))}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      10 AM - 12 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSlot(prev => ({ ...prev, startTime: '14:00', endTime: '16:00' }))}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      02 PM - 04 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSlot(prev => ({ ...prev, startTime: '17:00', endTime: '19:00' }))}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      05 PM - 07 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSlot(prev => ({ ...prev, startTime: '19:30', endTime: '21:00' }))}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      07:30 PM - 09 PM
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full btn-gold py-2.5 text-xs font-bold rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-md">
                  <span>+</span>
                  <span>Add Time Slot</span>
                </button>
              </form>

              {/* Current Slots */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Configured Slots:</h3>
                {availability.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No availability slots added yet</p>
                ) : (
                  availability.map((slot, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-white/10 text-xs">
                      <span className="font-semibold text-cyan-300">{slot.day}</span>
                      <span className="text-slate-300">{slot.startTime} - {slot.endTime}</span>
                      <button onClick={() => removeSlot(index)} className="text-red-400 hover:text-red-300 p-1">✕</button>
                    </div>
                  ))
                )}
              </div>

              {/* Save Button */}
              {availability.length > 0 && (
                <button
                  onClick={saveAvailability}
                  disabled={savingAvailability}
                  className="w-full btn-outline-gold py-2.5 text-xs font-semibold mt-4 disabled:opacity-50"
                >
                  {savingAvailability ? 'Saving...' : 'Save Availability to Cloud'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Career & Mentorship Copilot */}
      <AICopilot />

      {/* Profile & Photo Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Approve & Schedule Modal with Calendar and Clock */}
      <ApproveScheduleModal
        isOpen={!!selectedSessionToApprove}
        session={selectedSessionToApprove}
        onClose={() => setSelectedSessionToApprove(null)}
        onConfirm={handleConfirmApproval}
      />

      {/* Student Profile Details Modal */}
      <UniversalProfileDetailsModal
        user={viewingStudent}
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
      />
    </div>
  );
};

export default MentorDashboard;
