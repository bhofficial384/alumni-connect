import React, { useState, useEffect } from 'react';
import { getInitials } from '../utils/imageUtils';

/**
 * ApproveScheduleModal — Interactive Calendar and Clock UI for Mentors & Admins.
 * Features:
 * - Full interactive monthly Calendar with date grid, navigation, and quick presets.
 * - Interactive Digital Clock & Time Slot Selector with quick chips, AM/PM toggle, and hour/minute sliders.
 * - Meeting details (Platform, Link, Preparation notes for the student).
 * - Real-time ISO date calculation and validation.
 */
const ApproveScheduleModal = ({ isOpen, session, onClose, onConfirm }) => {
  const today = new Date();
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow or preferredDate
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  // Clock state
  const [selectedHour, setSelectedHour] = useState('04');
  const [selectedMinute, setSelectedMinute] = useState('30');
  const [selectedPeriod, setSelectedPeriod] = useState('PM'); // 'AM' | 'PM'

  // Meeting details
  const [meetingPlatform, setMeetingPlatform] = useState('Google Meet');
  const [meetingLink, setMeetingLink] = useState('');
  const [mentorNotes, setMentorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Preset quick times
  const QUICK_TIMES = [
    { label: '10:00 AM', hour: '10', minute: '00', period: 'AM' },
    { label: '11:30 AM', hour: '11', minute: '30', period: 'AM' },
    { label: '02:00 PM', hour: '02', minute: '00', period: 'PM' },
    { label: '03:30 PM', hour: '03', minute: '30', period: 'PM' },
    { label: '05:00 PM', hour: '05', minute: '00', period: 'PM' },
    { label: '06:30 PM', hour: '06', minute: '30', period: 'PM' },
    { label: '08:00 PM', hour: '08', minute: '00', period: 'PM' }
  ];

  // Initialize from session when modal opens
  useEffect(() => {
    if (session && isOpen) {
      if (session.preferredDate) {
        const pref = new Date(session.preferredDate);
        if (!isNaN(pref.getTime())) {
          setSelectedDate(pref);
          setCurrentMonth(pref.getMonth());
          setCurrentYear(pref.getFullYear());
        }
      }
      setMentorNotes(session.topic ? `Looking forward to our session on ${session.topic}. Please bring your resume & questions.` : '');
      setMeetingLink(session.meetingLink || '');
      setValidationError('');
      setSubmitting(false);
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calendar calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handleSelectDay = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    // Disallow past dates
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (newDate < startOfToday) return;

    setSelectedDate(newDate);
    setValidationError('');
  };

  const setQuickDate = (offsetDays) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    setSelectedDate(target);
    setCurrentMonth(target.getMonth());
    setCurrentYear(target.getFullYear());
    setValidationError('');
  };

  const handleQuickTimeSelect = (t) => {
    setSelectedHour(t.hour);
    setSelectedMinute(t.minute);
    setSelectedPeriod(t.period);
    setValidationError('');
  };

  // Compute final ISO string
  const getScheduledISO = () => {
    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && hour24 < 12) hour24 += 12;
    if (selectedPeriod === 'AM' && hour24 === 12) hour24 = 0;

    const finalDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour24,
      parseInt(selectedMinute, 10),
      0
    );
    return finalDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scheduledDateTime = getScheduledISO();

    if (scheduledDateTime < new Date()) {
      setValidationError('Scheduled time must be in the future. Please pick an upcoming date & time.');
      return;
    }

    setSubmitting(true);
    setValidationError('');

    try {
      const formattedNote = [
        mentorNotes.trim(),
        meetingLink.trim() ? `Meeting Link (${meetingPlatform}): ${meetingLink.trim()}` : ''
      ].filter(Boolean).join('\n\n');

      await onConfirm({
        sessionId: session._id || session.id,
        scheduledDate: scheduledDateTime.toISOString(),
        mentorNotes: formattedNote
      });
      onClose();
    } catch (err) {
      console.error('Approval failed:', err);
      setValidationError(err.message || 'Failed to approve and schedule session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto">
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/4 w-72 h-36 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-36 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-5 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 mb-1.5">
              <span>📅</span>
              <span>Session Scheduler & Approval</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Approve & Schedule Session
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pick the date and time using the interactive calendar and clock below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Student & Topic Summary Banner */}
        <div className="p-3.5 rounded-2xl bg-[#121727] border border-white/10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-md overflow-hidden shrink-0">
              {session.student?.profileImage ? (
                <img
                  src={session.student.profileImage}
                  alt={session.student.name}
                  className="w-full h-full rounded-[10px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[10px] bg-[#0E121C] flex items-center justify-center text-sm font-bold text-white">
                  {getInitials(session.student?.name || 'Student')}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {session.student?.name || 'Student Mentee'}
              </h4>
              <p className="text-[11px] text-cyan-300">
                {session.student?.branch || 'Undergraduate'}
                {session.student?.semester ? ` • ${session.student.semester}` : ''}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Topic: <strong className="text-white">{session.topic}</strong>
              </p>
            </div>
          </div>

          {session.preferredDate && (
            <div className="text-right text-[11px] text-slate-400">
              <span className="block text-slate-500">Student Preferred</span>
              <span className="font-semibold text-purple-300">
                {new Date(session.preferredDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DUAL PICKER: CALENDAR (LEFT) & CLOCK (RIGHT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. INTERACTIVE CALENDAR */}
            <div className="p-4 rounded-2xl bg-[#121727]/90 border border-white/10 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Calendar</span>
                    </span>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md font-mono">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Day-of-week header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 mb-2 uppercase">
                  {dayNames.map((d, i) => (
                    <span key={i} className={i === 0 || i === 6 ? 'text-slate-600' : ''}>{d}</span>
                  ))}
                </div>

                {/* Calendar Day Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {/* Empty cells before month starts */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}

                  {/* Days of current month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(currentYear, currentMonth, day);
                    const isSelected = isSameDay(dateObj, selectedDate);
                    const isToday = isSameDay(dateObj, today);
                    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isPast = dateObj < startOfToday;

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleSelectDay(day)}
                        className={`h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 font-bold scale-105 z-10'
                            : isPast
                            ? 'text-slate-600 cursor-not-allowed opacity-40'
                            : 'text-slate-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {day}
                        {isToday && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Quick Select
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(2)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    In 2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Next Week
                  </button>
                </div>
              </div>
            </div>

            {/* 2. INTERACTIVE CLOCK & TIME SELECTOR */}
            <div className="p-4 rounded-2xl bg-[#121727]/90 border border-white/10 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>🕒</span>
                    <span>Clock & Time</span>
                  </span>
                  <span className="text-[10px] text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                    1-on-1 Session (45 min)
                  </span>
                </div>

                {/* Digital Clock Readout Display */}
                <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 shadow-inner flex items-center justify-center gap-3 mb-4">
                  <div className="flex items-center text-3xl sm:text-4xl font-extrabold font-mono text-cyan-300 tracking-tight">
                    <span>{selectedHour}</span>
                    <span className="mx-1 text-purple-400 animate-pulse">:</span>
                    <span>{selectedMinute}</span>
                  </div>

                  <div className="flex flex-col gap-1 ml-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('AM')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        selectedPeriod === 'AM'
                          ? 'bg-cyan-500 text-black shadow-md'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('PM')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        selectedPeriod === 'PM'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Hour and Minute Selectors */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Hour
                    </label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="w-full bg-[#0E1322] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Minute
                    </label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="w-full bg-[#0E1322] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {['00', '15', '30', '45'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Time Slot Chips */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Popular Time Slots
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TIMES.map((t, idx) => {
                    const isCurrent =
                      selectedHour === t.hour &&
                      selectedMinute === t.minute &&
                      selectedPeriod === t.period;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickTimeSelect(t)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                            : 'bg-white/5 hover:bg-white/15 text-slate-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SCHEDULE PREVIEW BANNER */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Scheduled Session Slot</span>
                <strong className="text-white text-sm">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  {' '}at{' '}
                  <span className="text-cyan-300 font-mono">{selectedHour}:{selectedMinute} {selectedPeriod}</span>
                </strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Duration: <strong className="text-white font-medium">45 Minutes</strong>
            </div>
          </div>

          {/* MEETING PLATFORM & LINK */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Platform
              </label>
              <select
                value={meetingPlatform}
                onChange={(e) => setMeetingPlatform(e.target.value)}
                className="w-full bg-[#121727] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Campus / In-Person">Campus / In-Person</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meeting Link / Location
              </label>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Enter meeting link or location (e.g. Google Meet, Zoom, or Room number)"
                className="w-full bg-[#121727] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* NOTE FOR STUDENT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Preparation Note for Student</span>
              <span className="text-[10px] text-slate-500 font-normal">Sent in the approval notification</span>
            </label>
            <textarea
              rows={2}
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              placeholder="e.g. Bring your resume and draft 2-3 questions about systems architecture..."
              className="w-full bg-[#121727] border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            />
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Approving & Scheduling...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Confirm & Schedule Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveScheduleModal;
