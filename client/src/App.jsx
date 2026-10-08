import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Route-level code splitting: pages load on-demand instead of blocking the main bundle
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const GitHubCallback = lazy(() => import('./pages/GitHubCallback'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Fast lightweight route transition fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
    <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-3 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Loading...</span>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/auth/github/callback" element={<GitHubCallback />} />
          
          <Route path="/dashboard/student" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/mentor" element={
            <ProtectedRoute role="mentor">
              <MentorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
