const Session = require('../models/Session');
const User = require('../models/User');
const {
  sendSessionRequestEmailToMentor,
  sendSessionStatusEmailToStudent
} = require('../utils/emailService');

const getOriginFromReq = (req) => {
  if (!req) return null;
  const origin = req.get('origin');
  if (origin && origin !== 'null' && origin !== '*' && !origin.includes('*')) {
    return origin;
  }
  const referer = req.get('referer');
  if (referer) {
    try {
      const u = new URL(referer);
      return u.origin;
    } catch (e) {}
  }
  return null;
};

const createSession = async (req, res) => {
  try {
    const { mentorId, topic, message, preferredDate } = req.body;

    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    if (mentor.isApproved === false || mentor.approvalStatus === 'rejected') {
      return res.status(400).json({ message: 'This mentor is currently pending admin approval and cannot accept bookings yet.' });
    }

    const session = await Session.create({
      student: req.user.id,
      mentor: mentorId,
      topic,
      message,
      preferredDate
    });

    const populatedSession = await Session.findById(session._id)
      .populate('mentor', 'name email company domain profileImage headline designation qualification college experienceYears skills certifications certificatesList linkedIn github portfolio')
      .populate('student', 'name email graduationYear registrationNumber branch semester rollNumber profileImage');

    // Guaranteed email dispatch to mentor's registered email
    if (populatedSession?.mentor?.email) {
      const clientUrl = getOriginFromReq(req);
      try {
        console.log(`📨 [SESSION CREATE] Sending real-time email to mentor (${populatedSession.mentor.email})...`);
        const mailRes = await sendSessionRequestEmailToMentor({
          mentor: populatedSession.mentor,
          student: populatedSession.student,
          topic: populatedSession.topic,
          message: populatedSession.message,
          preferredDate: populatedSession.preferredDate,
          clientUrl
        });
        console.log(`✅ [SESSION CREATE] Email delivery to mentor ${populatedSession.mentor.email}: ${mailRes?.delivered ? 'SUCCESS' : 'FAILED'}`);
      } catch (err) {
        console.error('⚠️ [SESSION CREATE EMAIL ERROR]:', err.message);
      }
    } else {
      console.warn('⚠️ [SESSION CREATE] Mentor email not found on populated session:', populatedSession?.mentor);
    }

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating session', error: error.message });
  }
};

const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ student: req.user.id })
      .populate('mentor', 'name email company domain profileImage headline designation qualification college experienceYears skills certifications certificatesList linkedIn github portfolio')
      .sort({ createdAt: -1 });
      
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching sessions', error: error.message });
  }
};

const getIncomingSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ mentor: req.user.id })
      .populate('student', 'name email graduationYear registrationNumber branch semester rollNumber profileImage')
      .sort({ createdAt: -1 });
      
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching incoming sessions', error: error.message });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const { status, mentorNotes, scheduledDate } = req.body;
    
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, mentor: req.user.id };

    const session = await Session.findOne(query);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }
    
    if (status) session.status = status;
    if (mentorNotes !== undefined) session.mentorNotes = mentorNotes;
    if (scheduledDate) session.scheduledDate = scheduledDate;
    
    await session.save();
    
    const updatedSession = await Session.findById(session._id)
      .populate('student', 'name email graduationYear registrationNumber branch semester rollNumber profileImage')
      .populate('mentor', 'name email company domain profileImage headline designation qualification college experienceYears skills certifications certificatesList linkedIn github portfolio');

    // Guaranteed email dispatch to student's registered email on approval or rejection
    if (updatedSession?.student?.email && (status === 'approved' || status === 'rejected')) {
      const clientUrl = getOriginFromReq(req);
      try {
        console.log(`📨 [SESSION ${status.toUpperCase()}] Sending real-time status email to student (${updatedSession.student.email})...`);
        const mailRes = await sendSessionStatusEmailToStudent({
          student: updatedSession.student,
          mentor: updatedSession.mentor,
          status: updatedSession.status,
          topic: updatedSession.topic,
          scheduledDate: updatedSession.scheduledDate || updatedSession.preferredDate,
          mentorNotes: updatedSession.mentorNotes,
          clientUrl
        });
        console.log(`✅ [SESSION ${status.toUpperCase()}] Email delivery to student ${updatedSession.student.email}: ${mailRes?.delivered ? 'SUCCESS' : 'FAILED'}`);
      } catch (err) {
        console.error(`⚠️ [SESSION ${status.toUpperCase()} EMAIL ERROR]:`, err.message);
      }
    } else {
      console.warn(`⚠️ [SESSION STATUS] Student email not found or status not actionable (status=${status}):`, updatedSession?.student);
    }

    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating session status', error: error.message });
  }
};

module.exports = {
  createSession,
  getStudentSessions,
  getIncomingSessions,
  updateSessionStatus
};
