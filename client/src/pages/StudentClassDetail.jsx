import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassById, getAssignments } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const StudentClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classResponse, assignmentsResponse] = await Promise.all([
        getClassById(id),
        getAssignments(id)
      ]);
      
      setClassData(classResponse.data.class);
      setAssignments(assignmentsResponse.data.assignments || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error || 'Class not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAssignments = assignments.filter(a => new Date(a.dueAt) > new Date());
  const overdueAssignments = assignments.filter(a => new Date(a.dueAt) < new Date());

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/classes')}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to My Classes</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {classData.title.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{classData.title}</h1>
                <p className="text-gray-600">Code: {classData.code}</p>
                <p className="text-sm text-gray-500">Teacher: {classData.teacherId?.name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/student/class/${id}/assignments`)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span>View All Assignments</span>
            </button>
          </div>
        </div>

        {/* Class Description */}
        {classData.description && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Class</h2>
            <p className="text-gray-700">{classData.description}</p>
          </div>
        )}

        {/* Assignments Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Assignments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Assignments ({upcomingAssignments.length})
              </h2>
            </div>

            {upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAssignments.slice(0, 3).map((assignment) => (
                  <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {new Date(assignment.dueAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {assignment.maxScore} points
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/student/assignment/${assignment._id}`)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingAssignments.length > 3 && (
                  <button
                    onClick={() => navigate(`/student/class/${id}/assignments`)}
                    className="w-full text-center text-primary-600 hover:text-primary-800 text-sm font-medium py-2"
                  >
                    View all {upcomingAssignments.length} assignments →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-600">No upcoming assignments</p>
              </div>
            )}
          </div>

          {/* Overdue Assignments */}
          {overdueAssignments.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-red-900">
                  Overdue Assignments ({overdueAssignments.length})
                </h2>
              </div>

              <div className="space-y-4">
                {overdueAssignments.slice(0, 3).map((assignment) => (
                  <div key={assignment._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-red-900">{assignment.title}</h3>
                        <p className="text-sm text-red-600 mt-1">
                          Due: {new Date(assignment.dueAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                          {assignment.maxScore} points
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/student/assignment/${assignment._id}`)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Assignments</span>
                <span className="font-semibold">{assignments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Students</span>
                <span className="font-semibold">{classData.members?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Class Code</span>
                <span className="font-semibold font-mono bg-gray-100 px-2 py-1 rounded">{classData.code}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetail;