import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getClasses, getMySubmissions } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatCard from '../components/StatCard.jsx';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, submissionsRes] = await Promise.all([
        getClasses({ mine: '1' }),
        getMySubmissions({ limit: 5 })
      ]);
      
      setClasses(classesRes.data.classes || []);
      setSubmissions(submissionsRes.data.submissions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'submitted': 'bg-blue-100 text-blue-800',
      'graded': 'bg-green-100 text-green-800',
      'late': 'bg-yellow-100 text-yellow-800',
      'missing': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  const avgScore = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + (s.grade?.score || 0), 0) / gradedSubmissions.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Cards - Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Enrolled Classes"
            value={classes.length}
            icon="📚"
            color="blue"
          />
          <StatCard
            title="Total Submissions"
            value={submissions.length}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Pending"
            value={submissions.filter(s => s.status === 'submitted').length}
            icon="⏳"
            color="orange"
          />
          <StatCard
            title="Average Score"
            value={`${avgScore}%`}
            icon="🎯"
            color="purple"
          />
        </div>

        {/* Main Content Area */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Classes */}
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
                  <button 
                    onClick={() => navigate('/student/join-class')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Join Class</span>
                  </button>
                </div>

                {classes.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-xl">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Yet</h3>
                    <p className="text-gray-600 mb-4">Get started by enrolling in your first class!</p>
                    <button 
                      onClick={() => navigate('/student/join-class')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Join Your First Class
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {classes.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => navigate(`/student/class/${cls._id}`)}
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                            {cls.title.charAt(0)}
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{cls.code}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {cls.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {cls.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                          {cls.teacherId?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* Recent Submissions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Submissions</h2>
                
                {submissions.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center shadow-xl">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-gray-500 text-sm">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => (
                      <div key={sub._id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {sub.assignmentId?.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                            {sub.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-2">
                          Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                        </p>
                        
                        {sub.grade?.score !== undefined && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Score</span>
                              <span className="text-lg font-bold text-blue-600">
                                {sub.grade.score}/{sub.grade.max}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;