const User = require('../models/User');
const Session = require('../models/Session');
const Contact = require('../models/Contact');

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('assignedMentor', 'name email company domain profileImage')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching students', error: error.message });
  }
};

/**
 * Update Student Details and Assigned Mentor
 * PUT/PATCH /api/admin/students/:id
 */
const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { name, email, phoneNumber, registrationNumber, rollNumber, branch, semester, assignedMentor } = req.body;

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.toLowerCase().trim();
    if (phoneNumber !== undefined) student.phoneNumber = phoneNumber.trim();
    if (registrationNumber !== undefined) student.registrationNumber = registrationNumber.trim();
    if (rollNumber !== undefined) student.rollNumber = rollNumber.trim();
    if (branch !== undefined) student.branch = branch.trim();
    if (semester !== undefined) student.semester = String(semester).trim();

    if (assignedMentor === null || assignedMentor === '' || assignedMentor === 'none') {
      student.assignedMentor = undefined;
    } else if (assignedMentor) {
      const mentor = await User.findOne({ _id: assignedMentor, role: 'mentor' });
      if (!mentor) {
        return res.status(400).json({ message: 'Selected mentor not found or is not a mentor' });
      }
      student.assignedMentor = mentor._id;
    }

    await student.save();

    const populatedStudent = await User.findById(student._id)
      .select('-password')
      .populate('assignedMentor', 'name email company domain profileImage');

    res.json({
      success: true,
      message: `Student ${populatedStudent.name} updated successfully.`,
      student: populatedStudent
    });
  } catch (error) {
    console.error('Update Student Error:', error);
    res.status(500).json({ message: 'Server error updating student', error: error.message });
  }
};

/**
 * Delete Student and cleanup associated sessions
 * DELETE /api/admin/students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found or already deleted.' });
    }

    const studentName = student.name;

    // Delete all mentoring sessions associated with this student
    const sessionDeleteResult = await Session.deleteMany({ student: student._id });

    // Permanently remove student account
    await User.findByIdAndDelete(student._id);

    res.json({
      success: true,
      message: `Student "${studentName}" and ${sessionDeleteResult.deletedCount || 0} associated session(s) were permanently deleted.`,
      studentId
    });
  } catch (error) {
    console.error('Delete Student Error:', error);
    res.status(500).json({ message: 'Server error deleting student', error: error.message });
  }
};

const deleteMentor = async (req, res) => {
  try {
    const mentorId = req.params.id;

    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found or already deleted.' });
    }

    const mentorName = mentor.name;

    // Unassign this mentor from any students who have them as assignedMentor
    await User.updateMany(
      { assignedMentor: mentor._id },
      { $unset: { assignedMentor: "" } }
    );

    // Delete all mentoring sessions associated with this mentor
    const sessionDeleteResult = await Session.deleteMany({ mentor: mentor._id });

    // Permanently remove mentor account
    await User.findByIdAndDelete(mentor._id);

    res.json({
      success: true,
      message: `Mentor "${mentorName}" and ${sessionDeleteResult.deletedCount || 0} associated session(s) were permanently deleted.`,
      mentorId
    });
  } catch (error) {
    console.error('Delete Mentor Error:', error);
    res.status(500).json({ message: 'Server error deleting mentor', error: error.message });
  }
};

const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching mentors', error: error.message });
  }
};

/**
 * Approve or Reject Mentor Registration
 * PATCH /api/admin/mentors/:id/approval
 */
const updateMentorApproval = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected' | 'pending'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved, rejected, or pending.' });
    }

    const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.approvalStatus = status;
    mentor.isApproved = status === 'approved';
    if (status === 'approved') {
      mentor.approvedAt = new Date();
      mentor.approvedBy = req.user ? req.user._id : undefined;
    }

    await mentor.save();

    res.json({
      success: true,
      message: `Mentor ${mentor.name} has been ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'set to pending'} successfully.`,
      mentor
    });
  } catch (error) {
    console.error('Update Mentor Approval Error:', error);
    res.status(500).json({ message: 'Server error updating mentor approval', error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const approvedMentors = await User.countDocuments({ role: 'mentor', isApproved: true });
    const pendingMentors = await User.countDocuments({ role: 'mentor', $or: [{ isApproved: false }, { approvalStatus: 'pending' }] });
    const totalSessions = await Session.countDocuments();
    
    const pendingSessions = await Session.countDocuments({ status: 'pending' });
    const approvedSessions = await Session.countDocuments({ status: 'approved' });
    const rejectedSessions = await Session.countDocuments({ status: 'rejected' });
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const totalContacts = await Contact.countDocuments();
    
    res.json({
      users: {
        totalStudents,
        totalMentors,
        approvedMentors,
        pendingMentors,
        total: totalStudents + totalMentors + 1 // +1 for admin
      },
      sessions: {
        total: totalSessions,
        pending: pendingSessions,
        approved: approvedSessions,
        rejected: rejectedSessions,
        completed: completedSessions
      },
      contacts: {
        total: totalContacts
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
};

/**
 * Get All Contact Inquiries
 * GET /api/admin/contacts
 */
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching contact inquiries', error: error.message });
  }
};

/**
 * Delete a Contact Inquiry
 * DELETE /api/admin/contacts/:id
 */
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }
    res.json({ success: true, message: 'Contact inquiry deleted successfully', contactId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting contact inquiry', error: error.message });
  }
};

/**
 * Direct Add Student by Admin
 * POST /api/admin/students
 */
const createStudent = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const {
      name,
      email,
      password,
      phoneNumber,
      registrationNumber,
      rollNumber,
      branch,
      semester,
      assignedMentor,
      profileImage
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Student name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Student email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: `A user with email ${normalizedEmail} already exists (${existing.role})` });
    }

    // Default or specified password (minimum 6 characters)
    const rawPassword = (password && password.trim().length >= 6) ? password.trim() : 'student123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    let validMentorId = undefined;
    if (assignedMentor && assignedMentor !== 'none') {
      const mentorDoc = await User.findOne({ _id: assignedMentor, role: 'mentor' });
      if (mentorDoc) {
        validMentorId = mentorDoc._id;
      }
    }

    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      registrationNumber: registrationNumber ? registrationNumber.trim() : '',
      rollNumber: rollNumber ? rollNumber.trim() : '',
      branch: branch ? branch.trim() : '',
      semester: semester ? String(semester).trim() : '',
      assignedMentor: validMentorId,
      profileImage: profileImage ? profileImage.trim() : '',
      isEmailVerified: true, // Directly verified by admin
      isProfileComplete: true
    });

    const populatedStudent = await User.findById(student._id)
      .select('-password')
      .populate('assignedMentor', 'name email company domain profileImage');

    res.status(201).json({
      success: true,
      message: `Student "${populatedStudent.name}" created successfully.`,
      student: populatedStudent
    });
  } catch (error) {
    console.error('Direct Create Student Error:', error);
    res.status(500).json({ message: 'Server error creating student', error: error.message });
  }
};

/**
 * Direct Add Mentor by Admin
 * POST /api/admin/mentors
 */
const createMentor = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const {
      name,
      email,
      password,
      phoneNumber,
      company,
      domain,
      bio,
      graduationYear,
      linkedIn,
      profileImage,
      approvalStatus = 'approved' // Direct additions by admin default to approved
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Mentor name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Mentor email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: `A user with email ${normalizedEmail} already exists (${existing.role})` });
    }

    const rawPassword = (password && password.trim().length >= 6) ? password.trim() : 'mentor123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const isApproved = approvalStatus === 'approved';

    const mentor = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'mentor',
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      company: company ? company.trim() : '',
      domain: domain ? domain.trim() : 'Software Engineering',
      bio: bio ? bio.trim() : '',
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      linkedIn: linkedIn ? linkedIn.trim() : '',
      profileImage: profileImage ? profileImage.trim() : '',
      isApproved,
      approvalStatus,
      approvedAt: isApproved ? new Date() : undefined,
      approvedBy: isApproved && req.user ? req.user._id : undefined,
      isEmailVerified: true, // Directly verified by admin
      isProfileComplete: true
    });

    const populatedMentor = await User.findById(mentor._id).select('-password');

    res.status(201).json({
      success: true,
      message: `Mentor "${populatedMentor.name}" created successfully.`,
      mentor: populatedMentor
    });
  } catch (error) {
    console.error('Direct Create Mentor Error:', error);
    res.status(500).json({ message: 'Server error creating mentor', error: error.message });
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getMentors,
  createMentor,
  updateMentorApproval,
  deleteMentor,
  getStats,
  getContacts,
  deleteContact
};
