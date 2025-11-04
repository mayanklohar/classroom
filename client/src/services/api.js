import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Rate limited - don't retry automatically
      console.warn('Rate limited. Please wait before making more requests.');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');
export const updateMe = (data) => API.patch('/auth/me', data);

// Class APIs
export const createClass = (data) => API.post('/classes', data);
export const getClasses = (params) => API.get('/classes', { params });
export const getClassById = (id) => API.get(`/classes/${id}`);
export const enrollStudent = (classId, studentId) => API.post(`/classes/${classId}/enroll`, { studentId });
export const removeStudent = (classId, userId) => API.delete(`/classes/${classId}/members/${userId}`);
// export const joinClassByCode = (code) => API.post('/classes/join', { code });


// Assignment APIs
export const createAssignment = (classId, formData) => API.post(`/classes/${classId}/assignments`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getAssignments = (classId, params) => API.get(`/classes/${classId}/assignments`, { params });
export const getAssignmentById = (id) => API.get(`/assignments/${id}`);
export const updateAssignment = (id, data) => API.patch(`/assignments/${id}`, data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);

// Submission APIs
export const createSubmission = (assignmentId, formData) => API.post(`/assignments/${assignmentId}/submissions`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getSubmissions = (assignmentId, params) => API.get(`/assignments/${assignmentId}/submissions`, { params });
export const getMySubmissions = (params) => API.get('/submissions/me', { params });
export const getTeacherSubmissions = (params) => API.get('/submissions/teacher', { params });
export const gradeSubmission = (id, data) => API.patch(`/submissions/${id}/grade`, data);
export const addComment = (id, data) => API.post(`/submissions/${id}/comments`, data);

// Analytics APIs
export const getGradeDistribution = (classId) => API.get(`/analytics/class/${classId}/grades`);
export const getTeacherStats = () => API.get('/analytics/teacher/stats');

// Add this to your existing api.js file:

// Join class by code (student)
export const joinClassByCode = (code) => API.post('/classes/join', { code });


export default API;
