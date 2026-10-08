import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import TiltCard3D from '../components/TiltCard3D';
import CameraCaptureModal from '../components/CameraCaptureModal';
import UniversalProfileDetailsModal from '../components/UniversalProfileDetailsModal';
import { getInitials, compressAndResizeImage } from '../utils/imageUtils';

/**
 * AdminDashboard — Overview & management panel for AlumniConnect administrators.
 * Displays system metrics, user rosters (mentors & students), and session stats.
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'mentors' | 'contacts'
  const [mentorFilter, setMentorFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({ text: '', type: '' });
  const [viewingProfileUser, setViewingProfileUser] = useState(null);

  // Student editing modal state
  const [selectedStudentToEdit, setSelectedStudentToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    registrationNumber: '',
    rollNumber: '',
    branch: '',
    semester: '',
    assignedMentor: ''
  });
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  // Student deletion modal state
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // Mentor deletion modal state
  const [mentorToDelete, setMentorToDelete] = useState(null);
  const [isDeletingMentor, setIsDeletingMentor] = useState(false);

  // Direct Add Student Modal state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    registrationNumber: '',
    rollNumber: '',
    branch: '',
    semester: '',
    assignedMentor: '',
    profileImage: ''
  });
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  // Direct Add Mentor Modal state
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [newMentorData, setNewMentorData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    company: '',
    domain: 'Software Engineering',
    graduationYear: '',
    linkedIn: '',
    bio: '',
    approvalStatus: 'approved',
    profileImage: ''
  });
  const [isCreatingMentor, setIsCreatingMentor] = useState(false);

  // Live Camera Capture Modal State ('student' | 'mentor' | null)
  const [cameraModalTarget, setCameraModalTarget] = useState(null);

  // Contact inquiries state
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  // Administrators state
  const [admins, setAdmins] = useState([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    profileImage: ''
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, studentsRes, mentorsRes, adminsRes, contactsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/students'),
        api.get('/admin/mentors'),
        api.get('/admin/admins'),
        api.get('/admin/contacts')
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data || []);
      setMentors(mentorsRes.data || []);
      setAdmins(adminsRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError(err.response?.data?.message || 'Failed to load admin telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleMentorApproval = async (mentorId, status) => {
    setActionLoadingId(mentorId);
    setActionFeedback({ text: '', type: '' });
    try {
      const res = await api.patch(`/admin/mentors/${mentorId}/approval`, { status });
      const updated = res.data.mentor;

      // Update mentor in local state
      setMentors(prev => prev.map(m => m._id === mentorId ? { ...m, isApproved: updated.isApproved, approvalStatus: updated.approvalStatus } : m));

      // Refresh stats
      fetchAdminData();

      setActionFeedback({
        text: `Mentor ${updated.name || ''} successfully ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'}.`,
        type: status === 'approved' ? 'success' : 'info'
      });

      setTimeout(() => {
        setActionFeedback({ text: '', type: '' });
      }, 4000);
    } catch (err) {
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to update mentor approval status.',
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openEditStudentModal = (student) => {
    setSelectedStudentToEdit(student);
    setEditFormData({
      name: student.name || '',
      email: student.email || '',
      phoneNumber: student.phoneNumber || '',
      registrationNumber: student.registrationNumber || '',
      rollNumber: student.rollNumber || '',
      branch: student.branch || '',
      semester: student.semester ? String(student.semester) : '',
      assignedMentor: student.assignedMentor?._id || student.assignedMentor || ''
    });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentToEdit) return;
    setIsSavingStudent(true);
    setActionFeedback({ text: '', type: '' });

    try {
      const res = await api.put(`/admin/students/${selectedStudentToEdit._id}`, editFormData);
      const updated = res.data.student;

      // Update student in local state
      setStudents(prev => prev.map(s => s._id === selectedStudentToEdit._id ? updated : s));
      setSelectedStudentToEdit(null);

      setActionFeedback({
        text: res.data.message || `Student ${updated.name} updated successfully!`,
        type: 'success'
      });

      setTimeout(() => {
        setActionFeedback({ text: '', type: '' });
      }, 4500);
    } catch (err) {
      console.error('Error saving student:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to update student and mentor assignment.',
        type: 'error'
      });
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeletingStudent(true);
    try {
      const res = await api.delete(`/admin/students/${studentToDelete._id}`);
      setStudents(prev => prev.filter(s => s._id !== studentToDelete._id));
      setStats(prev => {
        if (!prev?.users) return prev;
        return {
          ...prev,
          users: {
            ...prev.users,
            totalStudents: Math.max(0, (prev.users.totalStudents || 1) - 1),
            total: Math.max(0, (prev.users.total || 1) - 1)
          }
        };
      });
      setActionFeedback({
        text: res.data?.message || `Student ${studentToDelete.name || ''} has been permanently deleted.`,
        type: 'success'
      });
      if (selectedStudentToEdit?._id === studentToDelete._id) {
        setSelectedStudentToEdit(null);
      }
      setStudentToDelete(null);
      setTimeout(() => {
        setActionFeedback({ text: '', type: '' });
      }, 4500);
    } catch (err) {
      console.error('Failed to delete student:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to delete student.',
        type: 'error'
      });
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleDeleteMentor = async () => {
    if (!mentorToDelete?._id) return;
    setIsDeletingMentor(true);
    setActionFeedback({ text: '', type: '' });
    try {
      const res = await api.delete(`/admin/mentors/${mentorToDelete._id}`);
      setMentors(prev => prev.filter(m => m._id !== mentorToDelete._id));
      setStats(prev => {
        if (!prev?.users) return prev;
        return {
          ...prev,
          users: {
            ...prev.users,
            totalMentors: Math.max(0, (prev.users.totalMentors || 1) - 1),
            total: Math.max(0, (prev.users.total || 1) - 1)
          }
        };
      });
      setActionFeedback({
        text: res.data?.message || `Mentor "${mentorToDelete.name || ''}" has been permanently deleted.`,
        type: 'success'
      });
      setMentorToDelete(null);
      setTimeout(() => {
        setActionFeedback({ text: '', type: '' });
      }, 4500);
    } catch (err) {
      console.error('Failed to delete mentor:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to delete mentor.',
        type: 'error'
      });
    } finally {
      setIsDeletingMentor(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setIsCreatingStudent(true);
    setActionFeedback({ text: '', type: '' });
    try {
      const res = await api.post('/admin/students', newStudentData);
      const created = res.data.student;
      setStudents(prev => [created, ...prev]);
      setStats(prev => {
        if (!prev?.users) return prev;
        return {
          ...prev,
          users: {
            ...prev.users,
            totalStudents: (prev.users.totalStudents || 0) + 1,
            total: (prev.users.total || 0) + 1
          }
        };
      });
      setShowAddStudentModal(false);
      setNewStudentData({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        registrationNumber: '',
        rollNumber: '',
        branch: '',
        semester: '',
        assignedMentor: '',
        profileImage: ''
      });
      setActionFeedback({
        text: res.data.message || `Student ${created.name} added successfully!`,
        type: 'success'
      });
      setTimeout(() => setActionFeedback({ text: '', type: '' }), 4500);
    } catch (err) {
      console.error('Failed to create student:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to add student.',
        type: 'error'
      });
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    setIsCreatingMentor(true);
    setActionFeedback({ text: '', type: '' });
    try {
      const res = await api.post('/admin/mentors', newMentorData);
      const created = res.data.mentor;
      setMentors(prev => [created, ...prev]);
      setStats(prev => {
        if (!prev?.users) return prev;
        const isApproved = created.isApproved || created.approvalStatus === 'approved';
        return {
          ...prev,
          users: {
            ...prev.users,
            totalMentors: (prev.users.totalMentors || 0) + 1,
            approvedMentors: isApproved ? (prev.users.approvedMentors || 0) + 1 : (prev.users.approvedMentors || 0),
            pendingMentors: !isApproved ? (prev.users.pendingMentors || 0) + 1 : (prev.users.pendingMentors || 0),
            total: (prev.users.total || 0) + 1
          }
        };
      });
      setShowAddMentorModal(false);
      setNewMentorData({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        company: '',
        domain: 'Software Engineering',
        graduationYear: '',
        linkedIn: '',
        bio: '',
        approvalStatus: 'approved',
        profileImage: ''
      });
      setActionFeedback({
        text: res.data.message || `Mentor ${created.name} added successfully!`,
        type: 'success'
      });
      setTimeout(() => setActionFeedback({ text: '', type: '' }), 4500);
    } catch (err) {
      console.error('Failed to create mentor:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to add mentor.',
        type: 'error'
      });
    } finally {
      setIsCreatingMentor(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    setIsDeletingContact(true);
    try {
      await api.delete(`/admin/contacts/${contactToDelete._id}`);
      setContacts(prev => prev.filter(c => c._id !== contactToDelete._id));
      setStats(prev => {
        if (!prev?.contacts) return prev;
        return {
          ...prev,
          contacts: {
            ...prev.contacts,
            total: Math.max(0, (prev.contacts.total || 1) - 1)
          }
        };
      });
      if (selectedContact?._id === contactToDelete._id) {
        setSelectedContact(null);
      }
      setActionFeedback({
        text: `Inquiry from ${contactToDelete.name} deleted successfully.`,
        type: 'success'
      });
      setContactToDelete(null);
      setTimeout(() => setActionFeedback({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error('Failed to delete contact inquiry:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to delete contact inquiry.',
        type: 'error'
      });
    } finally {
      setIsDeletingContact(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    setActionFeedback({ text: '', type: '' });
    try {
      const res = await api.post('/admin/admins', newAdminData);
      const created = res.data.admin;
      setAdmins(prev => [created, ...prev]);
      setStats(prev => {
        if (!prev?.users) return prev;
        return {
          ...prev,
          users: {
            ...prev.users,
            totalAdmins: (prev.users.totalAdmins || 0) + 1,
            total: (prev.users.total || 0) + 1
          }
        };
      });
      setShowAddAdminModal(false);
      setNewAdminData({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        profileImage: ''
      });
      setActionFeedback({
        text: res.data.message || `Administrator "${created.name}" created successfully!`,
        type: 'success'
      });
      setTimeout(() => setActionFeedback({ text: '', type: '' }), 4500);
    } catch (err) {
      console.error('Failed to create admin:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to create administrator.',
        type: 'error'
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    if (user?._id === adminToDelete._id || user?.email === adminToDelete.email) {
      setActionFeedback({
        text: 'You cannot delete your own admin account.',
        type: 'error'
      });
      setAdminToDelete(null);
      return;
    }
    if (admins.length <= 1) {
      setActionFeedback({
        text: 'Cannot delete the only remaining administrator in the system.',
        type: 'error'
      });
      setAdminToDelete(null);
      return;
    }

    setIsDeletingAdmin(true);
    try {
      const res = await api.delete(`/admin/admins/${adminToDelete._id}`);
      setAdmins(prev => prev.filter(a => a._id !== adminToDelete._id));
      setStats(prev => {
        if (!prev?.users) return prev;
        return {
          ...prev,
          users: {
            ...prev.users,
            totalAdmins: Math.max(1, (prev.users.totalAdmins || 1) - 1),
            total: Math.max(1, (prev.users.total || 1) - 1)
          }
        };
      });
      setActionFeedback({
        text: res.data?.message || `Admin "${adminToDelete.name}" deleted successfully.`,
        type: 'success'
      });
      setAdminToDelete(null);
      setTimeout(() => setActionFeedback({ text: '', type: '' }), 4500);
    } catch (err) {
      console.error('Failed to delete admin:', err);
      setActionFeedback({
        text: err.response?.data?.message || 'Failed to delete administrator.',
        type: 'error'
      });
    } finally {
      setIsDeletingAdmin(false);
    }
  };

  const filteredAdmins = admins.filter(a =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMentors = mentors.filter(m => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.currentRole?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (mentorFilter === 'pending') {
      return !m.isApproved || m.approvalStatus === 'pending';
    }
    if (mentorFilter === 'approved') {
      return m.isApproved === true;
    }
    if (mentorFilter === 'rejected') {
      return m.approvalStatus === 'rejected';
    }
    return true;
  });

  const pendingMentorsCount = mentors.filter(m => !m.isApproved || m.approvalStatus === 'pending').length;
  const approvedMentorsCount = mentors.filter(m => m.isApproved === true).length;
  const rejectedMentorsCount = mentors.filter(m => m.approvalStatus === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              Admin Control Nexus
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time platform telemetry, session distribution, and community directory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-purple-500/50 hover:bg-slate-800 text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync Telemetry
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchAdminData} className="underline hover:text-white">Retry</button>
          </div>
        )}

        {/* Action Feedback Notification */}
        {actionFeedback.text && (
          <div className={`mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-xl animate-fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : actionFeedback.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <span>{actionFeedback.type === 'success' ? '✓' : actionFeedback.type === 'error' ? '⚠️' : 'ℹ️'}</span>
              <span>{actionFeedback.text}</span>
            </div>
            <button
              onClick={() => setActionFeedback({ text: '', type: '' })}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {loading && !stats ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Telemetry Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 mb-10">
              {/* Total Students */}
              <TiltCard3D className="glass-card-dark rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">{stats?.users?.totalStudents || 0}</div>
                <div className="text-xs text-purple-400 mt-2 font-medium">Aspiring Students</div>
              </TiltCard3D>

              {/* Verified Mentors */}
              <TiltCard3D className="glass-card-dark rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Mentors</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {stats?.users?.approvedMentors !== undefined ? stats?.users?.approvedMentors : approvedMentorsCount}
                </div>
                <div className="text-xs text-emerald-400 mt-2 font-medium">Active Directory</div>
              </TiltCard3D>

              {/* Pending Mentor Approvals (Interactive) */}
              <TiltCard3D 
                onClick={() => { setActiveTab('mentors'); setMentorFilter('pending'); }}
                className="glass-card-dark rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all"
              >
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Pending Mentors</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-lg">
                    ⏳
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-amber-300 tracking-tight">
                    {stats?.users?.pendingMentors !== undefined ? stats?.users?.pendingMentors : pendingMentorsCount}
                  </div>
                  {pendingMentorsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      Review
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-400/80 mt-2 font-medium flex items-center gap-1">
                  <span>Review pending →</span>
                </div>
              </TiltCard3D>

              {/* Total Sessions */}
              <TiltCard3D className="glass-card-dark rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sessions</span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">{stats?.sessions?.total || 0}</div>
                <div className="text-xs text-cyan-400 mt-2 font-medium">
                  {stats?.sessions?.approved || 0} appvd • {stats?.sessions?.pending || 0} pend
                </div>
              </TiltCard3D>

              {/* Administrators */}
              <TiltCard3D 
                onClick={() => setActiveTab('admins')}
                className="glass-card-dark rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-violet-500/50 transition-all"
              >
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/25 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Admins</span>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-lg">
                    🛡️
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-violet-300 tracking-tight">
                  {stats?.users?.totalAdmins !== undefined ? stats?.users?.totalAdmins : admins.length}
                </div>
                <div className="text-xs text-violet-400/80 mt-2 font-medium flex items-center gap-1">
                  <span>Manage admins ({admins.length}) →</span>
                </div>
              </TiltCard3D>

              {/* Contact Form Inquiries */}
              <TiltCard3D 
                onClick={() => setActiveTab('contacts')}
                className="glass-card-dark rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-pink-500/50 transition-all"
              >
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/25 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Inquiries</span>
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 text-lg">
                    📬
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-pink-300 tracking-tight">
                  {stats?.contacts?.total !== undefined ? stats?.contacts?.total : contacts.length}
                </div>
                <div className="text-xs text-pink-400/80 mt-2 font-medium flex items-center gap-1">
                  <span>Home inquiries →</span>
                </div>
              </TiltCard3D>
            </div>

            {/* Navigation Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
              <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overview & Pipeline
                </button>
                <button
                  onClick={() => setActiveTab('mentors')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'mentors'
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Mentors ({mentors.length})</span>
                  {pendingMentorsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-black shadow-sm">
                      {pendingMentorsCount} Pending
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'students'
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Students ({students.length})
                </button>
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'admins'
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🛡️ Admins ({admins.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'contacts'
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Inquiries ({contacts.length})</span>
                  {contacts.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/25 border border-pink-500/40 text-pink-300 shadow-sm">
                      {contacts.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab !== 'overview' && (
                <div className="w-full sm:w-72">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* TAB: Overview & Session Pipeline */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Session Breakdown */}
                <div className="glass-card-dark rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-1">Session Status Distribution</h3>
                  <p className="text-xs text-slate-400 mb-6">Status breakdown across all mentoring engagements</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1 font-medium">
                        <span className="text-emerald-400">Approved & Scheduled</span>
                        <span className="text-white">{stats?.sessions?.approved || 0}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${stats?.sessions?.total ? (stats.sessions.approved / stats.sessions.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1 font-medium">
                        <span className="text-amber-400">Pending Review</span>
                        <span className="text-white">{stats?.sessions?.pending || 0}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-700"
                          style={{ width: `${stats?.sessions?.total ? (stats.sessions.pending / stats.sessions.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1 font-medium">
                        <span className="text-cyan-400">Completed Sessions</span>
                        <span className="text-white">{stats?.sessions?.completed || 0}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                          style={{ width: `${stats?.sessions?.total ? (stats.sessions.completed / stats.sessions.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1 font-medium">
                        <span className="text-rose-400">Declined / Cancelled</span>
                        <span className="text-white">{stats?.sessions?.rejected || 0}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-700"
                          style={{ width: `${stats?.sessions?.total ? (stats.sessions.rejected / stats.sessions.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Health & Quick Status */}
                <div className="glass-card-dark rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">System Health & Security</h3>
                    <p className="text-xs text-slate-400 mb-6">Database, authentication, and service readiness</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-sm font-medium text-slate-200">Database Engine</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Connected & Synced</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-sm font-medium text-slate-200">Google OAuth 2.0 Identity</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Active</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                          <span className="text-sm font-medium text-slate-200">AI Outreach Engine</span>
                        </div>
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Operational</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
                          <span className="text-sm font-medium text-slate-200">System Administrators</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-violet-300">{admins.length} Active</span>
                          <button
                            type="button"
                            onClick={() => setShowAddAdminModal(true)}
                            className="px-2 py-0.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            + Add Admin
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span>Active Admin Session: <strong className="text-slate-200">{user?.email}</strong></span>
                    <span className="text-cyan-400 font-mono">v2.4.0-cyber</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Administrators Directory */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>System Administrators</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                        {filteredAdmins.length} of {admins.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Personnel with superuser administrative privileges and full dashboard access
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>➕</span>
                    <span>Direct Add Admin</span>
                  </button>
                </div>

                {/* Admins Grid */}
                {filteredAdmins.length === 0 ? (
                  <div className="glass-card-dark rounded-2xl p-12 text-center border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto text-2xl mb-4">
                      🛡️
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {searchQuery ? 'No matching administrators' : 'No administrators found'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {searchQuery ? `No admin matches "${searchQuery}".` : 'Add an administrator using the Direct Add Admin button above.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAdmins.map((admin) => {
                      const isCurrentUser = (user?._id && admin._id === user._id) || (user?.email && admin.email?.toLowerCase() === user.email?.toLowerCase());
                      const isSoleAdmin = admins.length <= 1;

                      return (
                        <div
                          key={admin._id}
                          className={`glass-card-dark rounded-2xl p-5 border flex flex-col justify-between transition-all relative overflow-hidden group shadow-lg ${
                            isCurrentUser
                              ? 'border-violet-500/50 bg-gradient-to-b from-violet-950/20 to-slate-900/60'
                              : 'border-white/10 hover:border-violet-500/30'
                          }`}
                        >
                          <div>
                            {/* Card Header: Avatar & Info */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-md shrink-0">
                                  {admin.profileImage ? (
                                    <img src={admin.profileImage} alt={admin.name} className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(admin.name)
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white text-base leading-tight">{admin.name}</h4>
                                    {isCurrentUser && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500/25 border border-violet-500/50 text-violet-300">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-violet-400 font-medium flex items-center gap-1 mt-0.5">
                                    <span>🛡️</span>
                                    <span>System Administrator</span>
                                  </p>
                                </div>
                              </div>

                              {/* Delete button (or protected badge) */}
                              {isCurrentUser ? (
                                <span
                                  title="Active logged-in session"
                                  className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  Active
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isSoleAdmin}
                                  onClick={() => setAdminToDelete(admin)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 hover:text-rose-200 text-xs transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  title={isSoleAdmin ? 'Cannot delete the sole administrator' : `Remove admin access for ${admin.name}`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Details List */}
                            <div className="text-xs text-slate-400 space-y-2 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                              <div className="flex items-center gap-2 truncate">
                                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${admin.email}`} className="truncate text-slate-300 hover:text-white hover:underline">
                                  {admin.email}
                                </a>
                              </div>

                              {admin.phoneNumber ? (
                                <div className="flex items-center gap-2 text-slate-300">
                                  <span className="text-slate-500">📞</span>
                                  <span>{admin.phoneNumber}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-slate-500 italic">
                                  <span>📞</span>
                                  <span>No phone number</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Permissions: <strong className="text-violet-300">Full Access</strong></span>
                            <span>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Active'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Mentors Directory */}
            {activeTab === 'mentors' && (
              <div className="space-y-6">
                {/* Approval Status Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setMentorFilter('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        mentorFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      All Mentors ({mentors.length})
                    </button>
                    <button
                      onClick={() => setMentorFilter('pending')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        mentorFilter === 'pending'
                          ? 'bg-amber-400 text-black shadow-md font-bold'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      <span>⏳ Pending Review</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current font-extrabold">
                        {pendingMentorsCount}
                      </span>
                    </button>
                    <button
                      onClick={() => setMentorFilter('approved')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        mentorFilter === 'approved'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      ✓ Approved ({approvedMentorsCount})
                    </button>
                    <button
                      onClick={() => setMentorFilter('rejected')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        mentorFilter === 'rejected'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20'
                      }`}
                    >
                      ✕ Declined ({rejectedMentorsCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      Showing <strong className="text-white">{filteredMentors.length}</strong> mentors
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddMentorModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>➕</span>
                      <span>Direct Add Mentor</span>
                    </button>
                  </div>
                </div>

                {/* Mentors Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMentors.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-white/5">
                      No mentors matched the current filter.
                    </div>
                  ) : (
                    filteredMentors.map((m) => (
                      <div key={m._id} className="glass-card-dark rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div 
                              className="flex items-center gap-3 cursor-pointer group/mentor"
                              onClick={() => setViewingProfileUser(m)}
                              title="Click to view full mentor profile"
                            >
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md shrink-0 group-hover/mentor:scale-105 transition-transform">
                                {m.profileImage ? (
                                  <img src={m.profileImage} alt={m.name} className="w-full h-full object-cover" />
                                ) : (
                                  getInitials(m.name)
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-base leading-tight group-hover/mentor:text-purple-300 transition-colors">{m.name}</h4>
                                <p className="text-xs text-cyan-400 font-medium">{m.domain || m.currentRole || 'Alumni Mentor'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Approval Status Badge */}
                              {m.isApproved ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                                  <span>✓</span> Approved
                                </span>
                              ) : m.approvalStatus === 'rejected' ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                                  ✕ Declined
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm shadow-amber-500/20 shrink-0">
                                  <span>⏳</span> Pending Review
                                </span>
                              )}

                              {/* Delete Mentor Button in Header */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMentorToDelete(m);
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 hover:text-rose-200 text-xs transition-all shadow-sm cursor-pointer"
                                title={`Delete Mentor ${m.name}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-400 space-y-1.5 mb-3">
                            <div className="flex items-center gap-1.5 truncate">
                              <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate">{m.email}</span>
                            </div>

                            {m.company && (
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <span>🏢</span>
                                <span className="font-medium">{m.company}</span>
                              </div>
                            )}

                            {m.bio && (
                              <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1">
                                "{m.bio}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Interactive Approval Actions */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
                          {!m.isApproved ? (
                            <div className="flex items-center gap-2 w-full">
                              <button
                                type="button"
                                onClick={() => handleMentorApproval(m._id, 'approved')}
                                disabled={actionLoadingId === m._id}
                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {actionLoadingId === m._id ? (
                                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <span>✓</span>
                                    <span>Approve Mentor</span>
                                  </>
                                )}
                              </button>

                              {m.approvalStatus !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleMentorApproval(m._id, 'rejected')}
                                  disabled={actionLoadingId === m._id}
                                  className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live in Directory
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMentorApproval(m._id, 'rejected')}
                                disabled={actionLoadingId === m._id}
                                className="py-1 px-2.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-[11px] font-medium transition-all cursor-pointer"
                              >
                                Revoke
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: Students Directory */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                {/* Students Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Enrolled Students: <strong className="text-cyan-400 font-bold">{students.length}</strong>
                    </span>
                    {searchQuery && (
                      <span className="text-xs text-slate-400">
                        (Filtered: <strong className="text-white">{filteredStudents.length}</strong>)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span>➕</span>
                    <span>Direct Add Student</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-500">
                      No students matched your search query.
                    </div>
                  ) : (
                  filteredStudents.map((s) => (
                    <div key={s._id} className="glass-card-dark rounded-2xl p-4 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-xl group">
                      <div>
                        {/* Student Profile Card Header */}
                        <div className="flex items-start justify-between gap-2.5 mb-2.5">
                          <div 
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer group/student"
                            onClick={() => setViewingProfileUser(s)}
                            title="Click to view full student profile"
                          >
                            <div className="w-9 h-9 rounded-xl p-[1.5px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 shadow-sm overflow-hidden shrink-0 group-hover/student:scale-105 transition-transform">
                              {s.profileImage ? (
                                <img src={s.profileImage} alt={s.name} className="w-full h-full rounded-[10px] object-cover" />
                              ) : (
                                <div className="w-full h-full rounded-[10px] bg-[#111624] flex items-center justify-center text-xs font-bold text-white">
                                  {getInitials(s.name)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-sm leading-tight group-hover/student:text-cyan-300 transition-colors truncate">
                                {s.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate max-w-[155px]" title={s.email}>
                                {s.email}
                              </p>
                              {s.phoneNumber && (
                                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[155px] flex items-center gap-1" title={s.phoneNumber}>
                                  <span>📞</span>
                                  <span>{s.phoneNumber}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditStudentModal(s)}
                              className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                              title="Edit Student Details & Assigned Mentor"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentToDelete(s)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 hover:text-rose-200 text-xs transition-all shadow-sm cursor-pointer"
                              title={`Delete ${s.name}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Academic Credentials Compact 2x2 Grid */}
                        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 mb-2.5 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Branch</span>
                            <span className="text-blue-300 font-semibold truncate block" title={s.branch}>
                              🎓 {s.branch ? s.branch.replace('Computer Science & Engineering', 'CSE').replace('Electronics & Communication', 'ECE') : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Semester</span>
                            <span className="text-purple-300 font-semibold truncate block">
                              📚 {s.semester || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Reg No.</span>
                            <span className="font-mono text-cyan-300 font-semibold truncate block">
                              {s.registrationNumber || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Roll No.</span>
                            <span className="font-mono text-indigo-300 font-semibold truncate block">
                              {s.rollNumber || '—'}
                            </span>
                          </div>
                        </div>

                        {/* Assigned Alumni Mentor Box */}
                        <div className="mt-3 mb-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Assigned Alumni Mentor
                            </span>
                            {s.assignedMentor && (
                              <button
                                type="button"
                                onClick={() => openEditStudentModal(s)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
                              >
                                Reassign
                              </button>
                            )}
                          </div>

                          {s.assignedMentor ? (
                            <div 
                              onClick={() => typeof s.assignedMentor === 'object' && setViewingProfileUser({ ...s.assignedMentor, role: 'mentor' })}
                              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/30 flex items-center justify-between gap-2 shadow-inner cursor-pointer hover:border-cyan-400/60 transition-all group/mentorPill"
                              title="Click to view mentor details"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden group-hover/mentorPill:scale-105 transition-transform">
                                  {s.assignedMentor.profileImage ? (
                                    <img src={s.assignedMentor.profileImage} alt={s.assignedMentor.name} className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(s.assignedMentor.name)
                                  )}
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-bold text-white group-hover/mentorPill:text-cyan-300 transition-colors truncate leading-tight">
                                    {s.assignedMentor.name}
                                  </p>
                                  <p className="text-[11px] text-cyan-300 truncate">
                                    {s.assignedMentor.company ? `${s.assignedMentor.company} • ` : ''}{s.assignedMentor.domain || 'Mentor'}
                                  </p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                                Assigned
                              </span>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-dashed border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                              <span className="italic text-[11px] text-slate-500">No mentor assigned yet</span>
                              <button
                                type="button"
                                onClick={() => openEditStudentModal(s)}
                                className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                + Assign Mentor
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Enrolled Student
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditStudentModal(s)}
                          className="text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer"
                        >
                          Edit Details & Mentor →
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>
            )}

            {/* TAB: Contact Inquiries */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>Contact Form Inquiries</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                        {filteredContacts.length} of {contacts.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Messages submitted by visitors and prospective users via the Home Page Contact Form
                    </p>
                  </div>
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="glass-card-dark rounded-2xl p-12 text-center border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto text-2xl mb-4">
                      📬
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {searchQuery ? 'No matching inquiries found' : 'No contact inquiries yet'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {searchQuery ? `No messages matched "${searchQuery}". Try a different keyword.` : 'When visitors submit the contact form on the home page, their inquiries will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact._id}
                        className="glass-card-dark rounded-2xl border border-white/10 p-5 hover:border-pink-500/40 transition-all flex flex-col justify-between group shadow-lg shadow-black/20"
                      >
                        <div>
                          {/* Header: Sender and Date */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
                                {contact.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-white text-sm leading-tight truncate">
                                  {contact.name}
                                </h4>
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-xs text-cyan-400 hover:underline truncate block"
                                  title={contact.email}
                                >
                                  {contact.email}
                                </a>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                              {new Date(contact.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Subject */}
                          <div className="mb-2.5">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-pink-500/10 text-pink-300 border border-pink-500/20 max-w-full truncate">
                              📌 {contact.subject}
                            </span>
                          </div>

                          {/* Message Body */}
                          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                            {contact.message}
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedContact(contact)}
                            className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Read Full Message</span>
                            <span>→</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <span>✉️</span>
                              <span>Reply</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setContactToDelete(contact)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                              title="Delete inquiry"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal: Edit Student Details & Mentor Assignment */}
        {selectedStudentToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#0C101B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 right-1/4 w-48 h-24 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 mb-1.5">
                    <span>✏️</span> Student Management
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Edit Student & Mentor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update academic records and assign or reassign an alumni mentor.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentToEdit(null)}
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-[#131826] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter student name"
                  />
                </div>

                {/* Email Address & Phone Number Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-[#131826] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editFormData.phoneNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                      className="w-full bg-[#131826] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                {/* 2-Column Academic Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Registration Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.registrationNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, registrationNumber: e.target.value })}
                      className="w-full bg-[#131826] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. 2021BCSE001"
                    />
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.rollNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                      className="w-full bg-[#131826] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. 210129"
                    />
                  </div>
                </div>

                {/* Branch and Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Branch / Department
                    </label>
                    <input
                      type="text"
                      value={editFormData.branch}
                      onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                      className="w-full bg-[#131826] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Current Semester
                    </label>
                    <select
                      value={editFormData.semester}
                      onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
                      className="w-full bg-[#131826] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">Select Semester</option>
                      <option value="1">Semester 1 (1st Year)</option>
                      <option value="2">Semester 2 (1st Year)</option>
                      <option value="3">Semester 3 (2nd Year)</option>
                      <option value="4">Semester 4 (2nd Year)</option>
                      <option value="5">Semester 5 (3rd Year)</option>
                      <option value="6">Semester 6 (3rd Year)</option>
                      <option value="7">Semester 7 (4th Year)</option>
                      <option value="8">Semester 8 (4th Year)</option>
                    </select>
                  </div>
                </div>

                {/* Mentor Assignment Selector */}
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-xs font-semibold text-cyan-300 mb-1.5 flex items-center justify-between">
                    <span>Assigned Alumni Mentor</span>
                    <span className="text-[10px] text-slate-400 font-normal">Choose an approved alumni mentor</span>
                  </label>
                  <select
                    value={editFormData.assignedMentor}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedMentor: e.target.value })}
                    className="w-full bg-[#131826] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
                  >
                    <option value="">-- No Mentor Assigned (Unassigned) --</option>
                    {mentors
                      .slice()
                      .sort((a, b) => (b.isApproved ? 1 : 0) - (a.isApproved ? 1 : 0))
                      .map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} {m.company ? `(${m.company})` : ''} — {m.domain || 'Alumni'} {m.isApproved ? '✓ [Approved]' : '⏳ [Pending]'}
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assigned mentors will appear directly in the student's dashboard and profile.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const student = selectedStudentToEdit;
                      setSelectedStudentToEdit(null);
                      setStudentToDelete(student);
                    }}
                    disabled={isSavingStudent}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Student</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentToEdit(null)}
                      disabled={isSavingStudent}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingStudent}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingStudent ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Save Student & Mentor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Student Confirmation Modal */}
        {studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#0e121e] border border-rose-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-rose-950/40 relative">
              {/* Warning Header */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Delete Student Account
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Are you sure you want to permanently delete this student? All associated mentoring sessions, requests, and profile data will be permanently removed.
              </p>

              {/* Student Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-5 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white font-semibold">{studentToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{studentToDelete.email}</span>
                </div>
                {studentToDelete.phoneNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-300 font-mono text-[11px]">{studentToDelete.phoneNumber}</span>
                  </div>
                )}
                {studentToDelete.registrationNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Reg No:</span>
                    <span className="text-cyan-300 font-mono text-[11px]">{studentToDelete.registrationNumber}</span>
                  </div>
                )}
                {studentToDelete.branch && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Branch:</span>
                    <span className="text-purple-300 truncate max-w-[200px]">{studentToDelete.branch}</span>
                  </div>
                )}
                {studentToDelete.assignedMentor && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Mentor:</span>
                    <span className="text-cyan-400 font-medium">
                      {typeof studentToDelete.assignedMentor === 'object' ? studentToDelete.assignedMentor.name : 'Assigned'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStudentToDelete(null)}
                  disabled={isDeletingStudent}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStudent}
                  disabled={isDeletingStudent}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingStudent ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting Student...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Mentor Confirmation Modal */}
        {mentorToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0e121e] border border-rose-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-rose-950/40 relative">
              {/* Warning Header */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 text-lg">
                  🗑️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Permanently Delete Mentor?
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Are you sure you want to permanently delete mentor <strong className="text-white">"{mentorToDelete.name}"</strong>? All associated mentoring sessions, requests, availability schedule, and assignments with students will be permanently removed.
              </p>

              {/* Mentor Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-5 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white font-semibold">{mentorToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{mentorToDelete.email}</span>
                </div>
                {mentorToDelete.company && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Company:</span>
                    <span className="text-cyan-300 font-semibold">{mentorToDelete.company}</span>
                  </div>
                )}
                {mentorToDelete.domain && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Domain:</span>
                    <span className="text-purple-300 truncate max-w-[200px]">{mentorToDelete.domain}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-semibold ${mentorToDelete.isApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {mentorToDelete.isApproved ? 'Approved Alumnus' : 'Pending Approval'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMentorToDelete(null)}
                  disabled={isDeletingMentor}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMentor}
                  disabled={isDeletingMentor}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingMentor ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting Mentor...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Full Contact Inquiry */}
        {selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#0C101B] border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 text-lg">
                    📬
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      Contact Form Inquiry
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submitted on {new Date(selectedContact.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Sender Details */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sender Name:</span>
                  <span className="text-white font-semibold">{selectedContact.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email Address:</span>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-cyan-400 hover:underline font-mono text-[11px]"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Subject:</span>
                  <span className="text-pink-300 font-medium">{selectedContact.subject}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Message Content:
                </label>
                <div className="p-4 rounded-xl bg-[#131826] border border-white/10 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedContact.message}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedContact;
                    setSelectedContact(null);
                    setContactToDelete(c);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject)}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
                  >
                    <span>✉️</span>
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Delete Contact Inquiry Confirmation */}
        {contactToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0e121e] border border-rose-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-rose-950/40 relative">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Delete Contact Inquiry
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    This inquiry will be permanently deleted from the database.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">From:</span>
                  <span className="text-white font-semibold">{contactToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{contactToDelete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subject:</span>
                  <span className="text-pink-300 truncate max-w-[220px]">{contactToDelete.subject}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setContactToDelete(null)}
                  disabled={isDeletingContact}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteContact}
                  disabled={isDeletingContact}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingContact ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Direct Add Student */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn" onClick={() => setShowAddStudentModal(false)}>
            <div 
              className="relative w-full max-w-lg bg-[#0C101B] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-lg">
                    🎓
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">
                      Direct Add Student
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Create an enrolled student account directly without waiting for self-registration.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-4">
                {/* Photo Upload & Preview */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 shrink-0 shadow-md overflow-hidden relative group">
                    {newStudentData.profileImage ? (
                      <img
                        src={newStudentData.profileImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#111624] rounded-[14px] flex items-center justify-center text-cyan-300 font-bold text-lg">
                        {newStudentData.name ? getInitials(newStudentData.name) : '📷'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-white mb-1">
                      Student Profile Photo
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <span>📤 Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const base64 = await compressAndResizeImage(file, 400, 400, 0.85);
                              setNewStudentData(prev => ({ ...prev, profileImage: base64 }));
                            } catch (err) {
                              alert(err.message || 'Error processing image');
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setCameraModalTarget('student')}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>📸 Camera</span>
                      </button>

                      {newStudentData.profileImage && (
                        <button
                          type="button"
                          onClick={() => setNewStudentData(prev => ({ ...prev, profileImage: '' }))}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Upload file or snap live photo using camera</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={newStudentData.name}
                      onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@college.edu"
                      value={newStudentData.email}
                      onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Temporary Password
                    </label>
                    <input
                      type="text"
                      placeholder="Defaults to student123"
                      value={newStudentData.password}
                      onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Leave blank for default: student123</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={newStudentData.phoneNumber}
                      onChange={(e) => setNewStudentData({ ...newStudentData, phoneNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Branch / Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={newStudentData.branch}
                      onChange={(e) => setNewStudentData({ ...newStudentData, branch: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6th Semester"
                      value={newStudentData.semester}
                      onChange={(e) => setNewStudentData({ ...newStudentData, semester: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REG-2023-089"
                      value={newStudentData.registrationNumber}
                      onChange={(e) => setNewStudentData({ ...newStudentData, registrationNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 21CS042"
                      value={newStudentData.rollNumber}
                      onChange={(e) => setNewStudentData({ ...newStudentData, rollNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Assign Alumni Mentor (Optional)
                  </label>
                  <select
                    value={newStudentData.assignedMentor}
                    onChange={(e) => setNewStudentData({ ...newStudentData, assignedMentor: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">No Mentor Assigned</option>
                    {mentors.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.company || m.domain || 'Mentor'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingStudent}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingStudent ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Adding Student...</span>
                      </>
                    ) : (
                      <>
                        <span>➕</span>
                        <span>Add Student</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Direct Add Mentor */}
        {showAddMentorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn" onClick={() => setShowAddMentorModal(false)}>
            <div 
              className="relative w-full max-w-lg bg-[#0C101B] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-lg">
                    ⭐
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">
                      Direct Add Mentor
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Directly onboard an alumni mentor into the verified directory.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddMentorModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateMentor} className="space-y-4">
                {/* Photo Upload & Preview */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 shrink-0 shadow-md overflow-hidden relative group">
                    {newMentorData.profileImage ? (
                      <img
                        src={newMentorData.profileImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#111624] rounded-[14px] flex items-center justify-center text-purple-300 font-bold text-lg">
                        {newMentorData.name ? getInitials(newMentorData.name) : '📷'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-white mb-1">
                      Mentor Profile Photo
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <span>📤 Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const base64 = await compressAndResizeImage(file, 400, 400, 0.85);
                              setNewMentorData(prev => ({ ...prev, profileImage: base64 }));
                            } catch (err) {
                              alert(err.message || 'Error processing image');
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setCameraModalTarget('mentor')}
                        className="px-3 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 hover:text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>📸 Camera</span>
                      </button>

                      {newMentorData.profileImage && (
                        <button
                          type="button"
                          onClick={() => setNewMentorData(prev => ({ ...prev, profileImage: '' }))}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Upload file or snap live photo using camera</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={newMentorData.name}
                      onChange={(e) => setNewMentorData({ ...newMentorData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. priya@google.com"
                      value={newMentorData.email}
                      onChange={(e) => setNewMentorData({ ...newMentorData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Temporary Password
                    </label>
                    <input
                      type="text"
                      placeholder="Defaults to mentor123"
                      value={newMentorData.password}
                      onChange={(e) => setNewMentorData({ ...newMentorData, password: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Leave blank for default: mentor123</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google, Microsoft"
                      value={newMentorData.company}
                      onChange={(e) => setNewMentorData({ ...newMentorData, company: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Primary Domain
                    </label>
                    <select
                      value={newMentorData.domain}
                      onChange={(e) => setNewMentorData({ ...newMentorData, domain: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Finance">Finance</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Design">Design</option>
                      <option value="Core Engineering">Core Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2021"
                      value={newMentorData.graduationYear}
                      onChange={(e) => setNewMentorData({ ...newMentorData, graduationYear: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={newMentorData.phoneNumber}
                      onChange={(e) => setNewMentorData({ ...newMentorData, phoneNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Approval Status
                    </label>
                    <select
                      value={newMentorData.approvalStatus}
                      onChange={(e) => setNewMentorData({ ...newMentorData, approvalStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="approved">Approved (Live Immediately)</option>
                      <option value="pending">Pending Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={newMentorData.linkedIn}
                    onChange={(e) => setNewMentorData({ ...newMentorData, linkedIn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Bio / Experience Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief overview of mentorship focus and background..."
                    value={newMentorData.bio}
                    onChange={(e) => setNewMentorData({ ...newMentorData, bio: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddMentorModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingMentor}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingMentor ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Adding Mentor...</span>
                      </>
                    ) : (
                      <>
                        <span>➕</span>
                        <span>Add Mentor</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Direct Add Admin */}
        {showAddAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn" onClick={() => setShowAddAdminModal(false)}>
            <div 
              className="relative w-full max-w-lg bg-[#0C101B] border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 text-lg">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">
                      Direct Add Administrator
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Grant full administrative privileges to manage users and platform operations.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {/* Photo Upload & Preview */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-violet-500 via-purple-500 to-indigo-500 shrink-0 shadow-md overflow-hidden relative group">
                    {newAdminData.profileImage ? (
                      <img
                        src={newAdminData.profileImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#111624] rounded-[14px] flex items-center justify-center text-violet-300 font-bold text-lg">
                        {newAdminData.name ? getInitials(newAdminData.name) : '📷'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-white mb-1">
                      Admin Profile Photo
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <span>📤 Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const base64 = await compressAndResizeImage(file, 400, 400, 0.85);
                              setNewAdminData(prev => ({ ...prev, profileImage: base64 }));
                            } catch (err) {
                              alert(err.message || 'Error processing image');
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setCameraModalTarget('admin')}
                        className="px-3 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 hover:text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>📸 Camera</span>
                      </button>

                      {newAdminData.profileImage && (
                        <button
                          type="button"
                          onClick={() => setNewAdminData(prev => ({ ...prev, profileImage: '' }))}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Upload file or take photo with webcam</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={newAdminData.name}
                      onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@college.edu"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Password (Minimum 6 characters)
                    </label>
                    <input
                      type="text"
                      placeholder="Defaults to admin123"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Leave blank for default: admin123</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={newAdminData.phoneNumber}
                      onChange={(e) => setNewAdminData({ ...newAdminData, phoneNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-start gap-2">
                  <span className="text-sm">ℹ️</span>
                  <span>
                    New administrators receive full access to approve mentors, manage student rosters, schedule sessions, and system telemetry immediately.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingAdmin}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingAdmin ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Adding Administrator...</span>
                      </>
                    ) : (
                      <>
                        <span>🛡️</span>
                        <span>Add Administrator</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Admin Confirmation */}
        {adminToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0e121e] border border-rose-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-rose-950/40 relative">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Revoke Administrator Access
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    This user will lose all administrative dashboard and telemetry access.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin Name:</span>
                  <span className="text-white font-semibold">{adminToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{adminToDelete.email}</span>
                </div>
                {adminToDelete.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-300">{adminToDelete.phoneNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdminToDelete(null)}
                  disabled={isDeletingAdmin}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAdmin}
                  disabled={isDeletingAdmin}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingAdmin ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Revoking Access...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Confirm Revocation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Camera Snapshot Modal */}
        <CameraCaptureModal
          isOpen={!!cameraModalTarget}
          onClose={() => setCameraModalTarget(null)}
          onCapture={(compressedBase64) => {
            if (cameraModalTarget === 'student') {
              setNewStudentData(prev => ({ ...prev, profileImage: compressedBase64 }));
            } else if (cameraModalTarget === 'mentor') {
              setNewMentorData(prev => ({ ...prev, profileImage: compressedBase64 }));
            } else if (cameraModalTarget === 'admin') {
              setNewAdminData(prev => ({ ...prev, profileImage: compressedBase64 }));
            }
            setCameraModalTarget(null);
          }}
        />
        {/* Universal Profile Details Modal */}
        <UniversalProfileDetailsModal
          user={viewingProfileUser}
          isOpen={!!viewingProfileUser}
          onClose={() => setViewingProfileUser(null)}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
