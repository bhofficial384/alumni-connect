const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please add a valid email']
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: function() { return !this.googleId && !this.githubId && !this.firebaseUid; },
    minlength: 6,
    select: false
  },
  googleId: {
    type: String,
    sparse: true
  },
  githubId: {
    type: String,
    sparse: true
  },
  firebaseUid: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  },
  company: {
    type: String,
    default: ''
  },
  domain: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  graduationYear: {
    type: Number
  },
  registrationNumber: {
    type: String,
    trim: true,
    default: ''
  },
  branch: {
    type: String,
    trim: true,
    default: ''
  },
  semester: {
    type: String,
    trim: true,
    default: ''
  },
  rollNumber: {
    type: String,
    trim: true,
    default: ''
  },
  assignedMentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  linkedIn: {
    type: String,
    default: ''
  },
  headline: {
    type: String,
    trim: true,
    default: ''
  },
  designation: {
    type: String,
    trim: true,
    default: ''
  },
  qualification: {
    type: String,
    trim: true,
    default: ''
  },
  college: {
    type: String,
    trim: true,
    default: ''
  },
  experienceYears: {
    type: String,
    trim: true,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  certifications: {
    type: String,
    trim: true,
    default: ''
  },
  certificatesList: [{
    title: { type: String, trim: true, default: '' },
    issuer: { type: String, trim: true, default: '' },
    issueYear: { type: String, trim: true, default: '' },
    credentialUrl: { type: String, trim: true, default: '' },
    fileUrl: { type: String, default: '' },
    fileType: { type: String, default: 'image' },
    fileName: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  github: {
    type: String,
    trim: true,
    default: ''
  },
  portfolio: {
    type: String,
    trim: true,
    default: ''
  },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  profileImage: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'google-dev-mock', 'github', 'github-dev-mock', 'firebase'],
    default: 'local'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationOtp: {
    type: String,
    select: false
  },
  phoneVerificationOtpExpires: {
    type: Date,
    select: false
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== 'mentor'; // Students and admins pre-approved; Mentors require admin review
    }
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      return this.role === 'mentor' ? 'pending' : 'approved';
    }
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  emailVerificationOtp: {
    type: String,
    select: false
  },
  emailVerificationOtpExpires: {
    type: Date,
    select: false
  },
  resetPasswordOtp: {
    type: String,
    select: false
  },
  resetPasswordOtpExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
