import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClasses, joinClassByCode } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';


const JoinClass = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundClass, setFoundClass] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFoundClass(null);
    setLoading(true);

    try {
      // Search for class by code
      const response = await getClasses({ q: classCode.toUpperCase() });
      
      if (response.data.classes.length === 0) {
        setError('No class found with this code. Please check and try again.');
      } else {
        // Find exact match
        const exactMatch = response.data.classes.find(
          cls => cls.code.toUpperCase() === classCode.toUpperCase()
        );
        
        if (exactMatch) {
          setFoundClass(exactMatch);
        } else {
          setError('No class found with this code. Please check and try again.');
        }
      }
    } catch (err) {
      console.error('Error searching class:', err);
      setError('Failed to search for class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const handleJoinClass = async () => {
  if (!foundClass) return;
  
  // Check if user is a student
  if (user?.role !== 'student') {
    setError('Only students can join classes. Please log in with a student account.');
    return;
  }
  
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    console.log('Attempting to join class:', foundClass.code);
    console.log('Current token:', localStorage.getItem('token'));
    
    // Add user info from context for debugging
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    
    const response = await joinClassByCode(foundClass.code);
    console.log('Join class success:', response.data);
    
    setSuccess(`Successfully joined ${foundClass.title}! 🎉`);
    setFoundClass(null);
    setClassCode('');
    
    setTimeout(() => {
      navigate('/student/dashboard');
    }, 2000);
  } catch (err) {
    console.error('Join class error:', err);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);
    
    let errorMessage = err.response?.data?.error || 'Failed to join class';
    
    // Add more specific error messages
    if (err.response?.status === 403) {
      errorMessage = `Access denied: ${err.response.data.error}. Please make sure you're logged in as a student.`;
    } else if (err.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="text-gray-600 hover:text-blue-600 flex items-center space-x-2 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Join a Class</h1>
          <p className="text-gray-600 mt-2">Enter the class code provided by your teacher</p>
          
          {/* Debug info */}
          {user && (
            <div className="mt-2 text-sm text-gray-500">
              Logged in as: {user.name} ({user.role})
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-slide-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded animate-slide-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
                Class Code
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="classCode"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black uppercase flex-1"
                  placeholder="e.g., CS101"
                  required
                  disabled={loading || success}
                  style={{ textTransform: 'uppercase' }}
                />
                <button
                  type="submit"
                  disabled={loading || !classCode.trim() || success}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Ask your teacher for the class code</p>
            </div>
          </form>

          {/* Found Class Card */}
          {foundClass && !success && (
            <div className="mt-8 animate-slide-in">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Found! ✨</h3>
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                      {foundClass.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{foundClass.title}</h4>
                      <p className="text-sm text-gray-600 font-semibold">Code: {foundClass.code}</p>
                    </div>
                  </div>
                </div>

                {foundClass.description && (
                  <p className="text-gray-700 mb-4 text-sm">{foundClass.description}</p>
                )}

                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  <span className="font-medium">Teacher: {foundClass.teacherId?.name || 'Unknown'}</span>
                </div>

                <button
                  onClick={handleJoinClass}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Join This Class</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            How to Join a Class
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2 text-blue-600">1.</span>
              <span>Ask your teacher for the class code</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-blue-600">2.</span>
              <span>Enter the code in the field above and click "Search"</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-blue-600">3.</span>
              <span>Review the class details and click "Join This Class"</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-blue-600">4.</span>
              <span>Start accessing assignments and course materials!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinClass;
