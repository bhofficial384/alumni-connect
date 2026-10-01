import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { compressAndResizeImage, getInitials } from '../utils/imageUtils';
import CameraCaptureModal from './CameraCaptureModal';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    linkedIn: user?.linkedIn || '',
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

  // Sync state when modal opens
  React.useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        linkedIn: user.linkedIn || '',
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

          {/* Mentor-specific Career Details */}
          {user?.role === 'mentor' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google, Microsoft, Adobe"
                  className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Specialization / Domain
                </label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  placeholder="e.g. Cloud & Distributed Systems"
                  className="w-full bg-[#131826] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Bio / About */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Bio / Goals
            </label>
            <textarea
              name="bio"
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others briefly about your background or guidance goals..."
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
      </div>
    </div>
  );
};

export default ProfileModal;
