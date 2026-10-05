import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { compressAndResizeImage, compressCertificateFile, getInitials } from '../utils/imageUtils';
import CameraCaptureModal from './CameraCaptureModal';
import CertificateViewerModal from './CertificateViewerModal';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
    portfolio: user?.portfolio || '',
    headline: user?.headline || '',
    designation: user?.designation || '',
    qualification: user?.qualification || '',
    college: user?.college || '',
    experienceYears: user?.experienceYears || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
    certifications: user?.certifications || '',
    certificatesList: Array.isArray(user?.certificatesList) ? user.certificatesList : [],
    graduationYear: user?.graduationYear || '',
    registrationNumber: user?.registrationNumber || '',
    branch: user?.branch || '',
    semester: user?.semester || '',
    rollNumber: user?.rollNumber || '',
    company: user?.company || '',
    domain: user?.domain || ''
  });

  const [previewImage, setPreviewImage] = useState(user?.profileImage || '');
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Certificate upload states
  const certFileInputRef = useRef(null);
  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    issueYear: '',
    credentialUrl: '',
    fileUrl: '',
    fileType: 'image',
    fileName: ''
  });
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certError, setCertError] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        linkedIn: user.linkedIn || '',
        github: user.github || '',
        portfolio: user.portfolio || '',
        headline: user.headline || '',
        designation: user.designation || '',
        qualification: user.qualification || '',
        college: user.college || '',
        experienceYears: user.experienceYears || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        certifications: user.certifications || '',
        certificatesList: Array.isArray(user.certificatesList) ? user.certificatesList : [],
        graduationYear: user.graduationYear || '',
        registrationNumber: user.registrationNumber || '',
        branch: user.branch || '',
        semester: user.semester || '',
        rollNumber: user.rollNumber || '',
        company: user.company || '',
        domain: user.domain || ''
      });
      setPreviewImage(user.profileImage || '');
      setIsPhotoChanged(false);
      setStatusMessage({ type: '', text: '' });
      setCertError('');
      setNewCert({
        title: '',
        issuer: '',
        issueYear: '',
        credentialUrl: '',
        fileUrl: '',
        fileType: 'image',
        fileName: ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatusMessage({ type: 'info', text: 'Optimizing and resizing photo...' });
      const optimizedBase64 = await compressAndResizeImage(file, 400, 400, 0.85);
      setPreviewImage(optimizedBase64);
      setIsPhotoChanged(true);
      setStatusMessage({ type: '', text: '' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to process image' });
    }
  };

  const handleRemovePhoto = () => {
    setStatusMessage({
      type: 'error',
      text: 'Profile photo is required. To change your photo, click "Choose Photo" to upload a new one.'
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCertFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertError('');
    setIsUploadingCert(true);
    try {
      const res = await compressCertificateFile(file);
      setNewCert((prev) => ({
        ...prev,
        fileUrl: res.dataUrl,
        fileType: res.fileType,
        fileName: res.fileName,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    } catch (err) {
      setCertError(err.message || 'Failed to process certificate file.');
    } finally {
      setIsUploadingCert(false);
    }
  };

  const handleAddCertificate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newCert.title || !newCert.title.trim()) {
      setCertError('Please enter a certificate or honor title (e.g. AWS Certified Solutions Architect).');
      return;
    }
    const currentList = Array.isArray(formData.certificatesList) ? formData.certificatesList : [];
    const updatedList = [
      ...currentList,
      {
        ...newCert,
        title: newCert.title.trim(),
        issuer: newCert.issuer?.trim() || '',
        issueYear: newCert.issueYear?.trim() || '',
        credentialUrl: newCert.credentialUrl?.trim() || ''
      }
    ];
    setFormData((prev) => ({
      ...prev,
      certificatesList: updatedList
    }));
    setNewCert({
      title: '',
      issuer: '',
      issueYear: '',
      credentialUrl: '',
      fileUrl: '',
      fileType: 'image',
      fileName: ''
    });
    setCertError('');
    if (certFileInputRef.current) certFileInputRef.current.value = '';
  };

  const handleRemoveCertificate = (indexToRemove) => {
    const currentList = Array.isArray(formData.certificatesList) ? formData.certificatesList : [];
    setFormData((prev) => ({
      ...prev,
      certificatesList: currentList.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!previewImage || !previewImage.trim()) {
      setStatusMessage({ type: 'error', text: 'Profile photo is required. Please upload a clear photo before saving.' });
      return;
    }

    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      setStatusMessage({ type: 'error', text: 'Phone number is required and cannot be empty.' });
      return;
    }
    const cleanDigits = formData.phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10 || cleanDigits.length > 15) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid phone number (at least 10 digits).' });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        profileImage: previewImage
      };

      await updateProfile(payload);
      setStatusMessage({ type: 'success', text: 'Profile & photo updated successfully!' });
      setIsPhotoChanged(false);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0E121C] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-36 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Your Profile & Photo</h2>
              <p className="text-xs text-slate-400">View and customize your public identity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-slate-400 hover:text-white flex items-center justify-center text-base transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage.text && (
          <div className={`mb-5 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              : 'bg-blue-500/15 border border-blue-500/30 text-blue-300'
          }`}>
            <span>{statusMessage.type === 'success' ? '✓' : statusMessage.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* PHOTO UPLOAD & PREVIEW SECTION */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#131826] border border-white/[0.08] mb-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl p-[3px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-xl overflow-hidden flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={formData.name || 'Profile'}
                  className="w-full h-full rounded-[13px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[13px] bg-[#0E121C] flex items-center justify-center text-2xl font-bold text-white">
                  {getInitials(formData.name || user?.name)}
                </div>
              )}
            </div>

            {/* Quick camera trigger icon */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new photo"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-[#0E121C] text-xs transition-all cursor-pointer hover:scale-110"
            >
              📷
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
              <h4 className="text-sm font-bold text-white">Profile Picture *</h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Upload a clear face photo (PNG, JPG, or WEBP) for your verified directory card, session bookings, and mentor engagements.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📁</span>
                <span>{previewImage ? 'Choose File' : 'Upload File *'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>📷</span>
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* PROFILE DETAILS FORM */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Full Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="e.g. +91 9876543210"
                className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address (Verified)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full bg-[#131826]/50 border border-white/[0.05] rounded-xl px-3.5 py-2.5 text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          {/* Student-specific Academic Details */}
          {user?.role === 'student' && (
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span>🎓</span>
                <span>Academic Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Registration Number</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. 24101154022"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 24-CSE-045"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Branch</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-[#0E121C]">Select Branch</option>
                    <option value="Computer Science & Engineering (CSE)" className="bg-[#0E121C]">CSE</option>
                    <option value="CSE (IoT)" className="bg-[#0E121C]">CSE (IoT)</option>
                    <option value="CSE (AI & ML)" className="bg-[#0E121C]">CSE (AI&ML)</option>
                    <option value="Civil Engineering" className="bg-[#0E121C]">Civil Engineering</option>
                    <option value="Mechanical Engineering" className="bg-[#0E121C]">Mechanical Engineering</option>
                    <option value="Electrical Engineering" className="bg-[#0E121C]">Electrical Engineering</option>
                    <option value="Electronics & Communication (ECE)" className="bg-[#0E121C]">ECE</option>
                    <option value="Information Technology" className="bg-[#0E121C]">Information Technology</option>
                    <option value="Other" className="bg-[#0E121C]">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-[#0E121C]">Select Semester</option>
                    <option value="1st Semester" className="bg-[#0E121C]">1st Semester</option>
                    <option value="2nd Semester" className="bg-[#0E121C]">2nd Semester</option>
                    <option value="3rd Semester" className="bg-[#0E121C]">3rd Semester</option>
                    <option value="4th Semester" className="bg-[#0E121C]">4th Semester</option>
                    <option value="5th Semester" className="bg-[#0E121C]">5th Semester</option>
                    <option value="6th Semester" className="bg-[#0E121C]">6th Semester</option>
                    <option value="7th Semester" className="bg-[#0E121C]">7th Semester</option>
                    <option value="8th Semester" className="bg-[#0E121C]">8th Semester</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Mentor-specific Professional & LinkedIn Qualifications */}
          {user?.role === 'mentor' && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-blue-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <span className="text-sm">💼</span>
                  <span>LinkedIn & Professional Qualifications</span>
                </div>
                <span className="text-[10px] text-slate-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                  Mentor Credentials
                </span>
              </div>

              {/* LinkedIn Headline */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Professional Headline (Like LinkedIn) *
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer at Google | Ex-Amazon | Mentoring in System Design & DSA"
                  className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">This appears as your main title under your name on all student cards.</p>
              </div>

              {/* Designation & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Company / Org *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Google, Microsoft, Adobe"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Experience Years & Specialization Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Total Experience
                  </label>
                  <input
                    type="text"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    placeholder="e.g. 5+ Years"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Specialization / Domain
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineering, Cloud & AI"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Academic Qualification & College */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Highest Educational Qualification *
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech in Computer Science & Engineering"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="e.g. 2022"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* College / University */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  College / University (Alma Mater)
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. BCE Patna / IIT Kharagpur"
                  className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              {/* Skills & Mentorship Areas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Skills & Mentorship Topics (Comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. System Design, DSA, Cloud Architecture, Mock Interview, Resume Review"
                  className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              {/* Certifications & Honors Section with File Upload */}
              <div className="bg-[#111625] border border-white/10 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏆</span>
                    <div>
                      <label className="block text-xs font-bold text-white uppercase tracking-wider">
                        Certifications & Honors (With Uploaded Proof)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Upload certificates (PDF or Image) to build trust with students and mentees.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono">
                    {Array.isArray(formData.certificatesList) ? formData.certificatesList.length : 0} Added
                  </span>
                </div>

                {/* List of Already Uploaded Certificates */}
                {Array.isArray(formData.certificatesList) && formData.certificatesList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {formData.certificatesList.map((cert, idx) => {
                      if (!cert) return null;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs"
                        >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {cert.fileUrl ? (
                            cert.fileType === 'pdf' ? (
                              <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-sm font-bold text-rose-400 shrink-0">
                                PDF
                              </div>
                            ) : (
                              <img
                                src={cert.fileUrl}
                                alt={cert.title}
                                className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0 cursor-pointer"
                                onClick={() => setViewingCertificate(cert)}
                              />
                            )
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-sm shrink-0">
                              📜
                            </div>
                          )}

                          <div className="min-w-0">
                            <strong className="text-white block truncate leading-tight">{cert.title}</strong>
                            <p className="text-[11px] text-slate-400 truncate">
                              {cert.issuer || 'Self-verified'} {cert.issueYear ? `• ${cert.issueYear}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {cert.fileUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingCertificate(cert)}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-[11px] font-semibold transition-colors"
                            >
                              View Proof
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCertificate(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove Certificate"
                          >
                            ✕
                          </button>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add New Certificate Form */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-dashed border-white/15 space-y-3">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                    + Add New Certificate or Award Proof
                  </span>

                  {certError && (
                    <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                      {certError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                        placeholder="Certificate Title (e.g. AWS Certified Solutions Architect)"
                        className="w-full bg-[#131826] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newCert.issuer}
                        onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                        placeholder="Issuer (e.g. Amazon, Google, IIT)"
                        className="w-full bg-[#131826] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        value={newCert.issueYear}
                        onChange={(e) => setNewCert({ ...newCert, issueYear: e.target.value })}
                        placeholder="Year / Date (e.g. 2024)"
                        className="w-full bg-[#131826] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        value={newCert.credentialUrl}
                        onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                        placeholder="Verification Link (e.g. https://credly.com/...)"
                        className="w-full bg-[#131826] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Upload File Input */}
                  <div>
                    <input
                      type="file"
                      ref={certFileInputRef}
                      onChange={handleCertFileSelect}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => certFileInputRef.current?.click()}
                        disabled={isUploadingCert}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        {isUploadingCert ? (
                          <>
                            <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>📤</span>
                            <span>Upload Certificate File (PNG, JPG, PDF)</span>
                          </>
                        )}
                      </button>

                      {newCert.fileUrl && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          <span>✓</span>
                          <span className="truncate max-w-[180px] font-medium">{newCert.fileName || 'Proof Attached'}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddCertificate}
                        className="ml-auto px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        + Add Certificate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Summary Text Fallback */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Summary Text / Key Accreditations (Optional)
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    placeholder="e.g. AWS Certified Solutions Architect, Google Cloud Professional"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* LinkedIn & Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#38BDF8] mb-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 0 0-1.64 1.63 1.64 1.64 0 0 0 1.64 1.63 1.64 1.64 0 0 0 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
                    </svg>
                    <span>LinkedIn Profile URL *</span>
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-[#131826] border border-blue-500/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 placeholder-slate-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub or Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://myportfolio.com or GitHub"
                    className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bio / Mentorship About */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {user?.role === 'mentor' ? 'About & Mentorship Philosophy' : 'Bio / Goals'}
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder={user?.role === 'mentor' 
                ? "Describe your professional journey, what students can learn from you, and how you can guide them..."
                : "Tell others briefly about your background or guidance goals..."}
              className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>

        {/* Live Camera Capture Modal */}
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={(photo) => {
            setPreviewImage(photo);
            setIsPhotoChanged(true);
            setStatusMessage({ type: 'info', text: 'Live camera snapshot captured! Click "Save Profile Changes" to update.' });
          }}
        />

        {/* Certificate Proof Preview Modal */}
        <CertificateViewerModal
          isOpen={Boolean(viewingCertificate)}
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      </div>
    </div>
  );
};

export default ProfileModal;
