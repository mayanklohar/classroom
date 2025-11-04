import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentClasses from './pages/StudentClasses.jsx';
import StudentClassDetail from './pages/StudentClassDetail.jsx';
import StudentAssignments from './pages/StudentAssignments.jsx';
import StudentAssignmentDetail from './pages/StudentAssignmentDetail.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import TeacherClasses from './pages/TeacherClasses.jsx';
import TeacherClassDetail from './pages/TeacherClassDetail.jsx';
import TeacherAssignments from './pages/TeacherAssignments.jsx';
import CreateAssignment from './pages/CreateAssignment.jsx';
import TeacherAssignmentDetail from './pages/TeacherAssignmentDetail.jsx';
import TeacherAssignmentSubmissions from './pages/TeacherAssignmentSubmissions.jsx';
import TeacherSubmissions from './pages/TeacherSubmissions.jsx';
import CreateClass from './pages/CreateClass.jsx';
import JoinClass from './pages/JoinClass.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminClasses from './pages/AdminClasses.jsx';
import AdminAssignments from './pages/AdminAssignments.jsx';
import AdminAnalytics from './pages/AdminAnalytics.jsx';
import AdminAssignmentDetail from './pages/AdminAssignmentDetail.jsx';
import AdminUserDetail from './pages/AdminUserDetail.jsx';
import AdminClassDetail from './pages/AdminClassDetail.jsx';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/join-class" 
            element={
              <ProtectedRoute roles={['student']}>
                <JoinClass />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/classes" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentClasses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/class/:id" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentClassDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/class/:id/assignments" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentAssignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/assignment/:id" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentAssignmentDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/classes" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherClasses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/submissions" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherSubmissions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/class/:id" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherClassDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/class/:id/assignments" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherAssignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/class/:id/assignments/create" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <CreateAssignment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/assignment/:id" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherAssignmentDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/assignment/:id/submissions" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherAssignmentSubmissions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/create-class" 
            element={
              <ProtectedRoute roles={['teacher']}>
                <CreateClass />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/classes" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminClasses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/assignments" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminAssignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/assignments/:id" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminAssignmentDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/:id" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUserDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/classes/:id" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminClassDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Unauthorized */}
          <Route 
            path="/unauthorized" 
            element={
              <div className="min-h-screen page-bg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚫</div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">403 - Unauthorized</h1>
                  <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
                </div>
              </div>
            } 
          />
        </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
