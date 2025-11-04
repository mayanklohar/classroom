import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';


const AdminClasses = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class? This will also delete all related assignments and submissions.')) {
      try {
        await api.delete(`/admin/classes/${classId}`);
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800 transition-colors">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <input
            type="text"
            placeholder="Search classes by name, teacher, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
          />
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <div key={classItem._id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300" onClick={() => navigate(`/admin/classes/${classItem._id}`)}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{classItem.name}</h3>
                  <p className="text-sm text-gray-600">{classItem.subject}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(classItem._id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Teacher:</span>
                  <span className="ml-2">{classItem.teacher?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Students:</span>
                  <span className="ml-2">{classItem.students?.length || 0}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Code:</span>
                  <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{classItem.classCode}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created: {new Date(classItem.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-blue-600">
                  Click to view details →
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No classes have been created yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClasses;