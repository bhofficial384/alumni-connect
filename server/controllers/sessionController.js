const Session = require('../models/Session');
const User = require('../models/User');
const {
  sendSessionRequestEmailToMentor,
  sendSessionStatusEmailToStudent
} = require('../utils/emailService');

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
      .populate('mentor', 'name email company domain profileImage')
      .populate('student', 'name email graduationYear registrationNumber branch semester rollNumber profileImage');

    // Trigger asynchronous email to mentor's registered email
    if (populatedSession?.mentor?.email) {
      sendSessionRequestEmailToMentor({
        mentor: populatedSession.mentor,
        student: populatedSession.student,
        topic: populatedSession.topic,
        message: populatedSession.message,
        preferredDate: populatedSession.preferredDate
      }).catch(err => {
        console.error('⚠️ [SESSION EMAIL] Error notifying mentor of session request:', err.message);
      });
    }

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating session', error: error.message });
  }
};

const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ student: req.user.id })
      .populate('mentor', 'name email company domain profileImage')
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
      .populate('mentor', 'name email company domain profileImage');

    // Trigger asynchronous email to student's registered email on approval or rejection
    if (updatedSession?.student?.email && (status === 'approved' || status === 'rejected')) {
      sendSessionStatusEmailToStudent({
        student: updatedSession.student,
        mentor: updatedSession.mentor,
        status: updatedSession.status,
        topic: updatedSession.topic,
        scheduledDate: updatedSession.scheduledDate || updatedSession.preferredDate,
        mentorNotes: updatedSession.mentorNotes
      }).catch(err => {
        console.error(`⚠️ [SESSION EMAIL] Error notifying student of ${status} status:`, err.message);
      });
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
