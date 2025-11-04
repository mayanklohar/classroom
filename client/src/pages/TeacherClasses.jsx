import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClasses } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';


const TeacherClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // Fetch classes without search query to get teacher's classes
      const response = await getClasses();
      console.log('Fetched classes:', response.data.classes);
      setClasses(response.data.classes);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <p className="text-gray-600 mt-2">Classes you're teaching</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/teacher/create-class')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Create New Class</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Yet</h3>
            <p className="text-gray-600 mb-6">You haven't created any classes yet.</p>
            <button
              onClick={() => navigate('/teacher/create-class')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => {
              console.log('Rendering class:', classItem);
              return (
              <div key={classItem._id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 p-6 border border-gray-200 hover:border-blue-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                      {classItem.title.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{classItem.title}</h3>
                      <p className="text-sm text-gray-600">Code: {classItem.code}</p>
                    </div>
                  </div>
                </div>

                {classItem.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{classItem.description}</p>
                )}

                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span>{classItem.members?.length || 0} students enrolled</span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      console.log('Navigating to manage class:', `/teacher/class/${classItem._id}`);
                      navigate(`/teacher/class/${classItem._id}`);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm"
                  >
                    Manage Class
                  </button>
                  <button
                    onClick={() => {
                      console.log('Navigating to assignments:', `/teacher/class/${classItem._id}/assignments`);
                      navigate(`/teacher/class/${classItem._id}/assignments`);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Assignments
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;