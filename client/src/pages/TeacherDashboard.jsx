import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getClasses, getTeacherStats } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatCard from '../components/StatCard.jsx';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, statsRes] = await Promise.all([
        getClasses({ mine: '1' }),
        getTeacherStats()
      ]);
      
      setClasses(classesRes.data.classes || []);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Hello, Professor {user?.name}! 👨‍🏫</h1>
          <p className="text-gray-600">Manage your classes and track student progress</p>
        </div>

        {/* Stats Cards - Horizontal Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Classes"
              value={stats.totalClasses}
              icon="🏫"
              color="blue"
            />
            <StatCard
              title="Assignments"
              value={stats.totalAssignments}
              icon="📋"
              color="green"
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pendingSubmissions}
              icon="⏳"
              color="orange"
            />
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              icon="📊"
              color="purple"
            />
          </div>
        )}

        {/* Main Content Area */}
        <div>
          {/* Classes Section */}
          <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
                <button 
                  onClick={() => navigate('/teacher/create-class')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create New Class</span>
                </button>
              </div>

              {classes.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center shadow-xl">
                  <div className="text-6xl mb-4">🎓</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Classes Yet</h3>
                  <p className="text-gray-600 mb-6">Create your first class to get started!</p>
                  <button 
                    onClick={() => navigate('/teacher/create-class')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Create Your First Class
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {classes.map((cls) => (
                    <div
                      key={cls._id}
                      onClick={() => navigate(`/teacher/class/${cls._id}`)}
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                          {cls.title.charAt(0)}
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{cls.code}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {cls.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {cls.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          {cls.members?.length || 0} Students
                        </div>
                        <div className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                          View →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;