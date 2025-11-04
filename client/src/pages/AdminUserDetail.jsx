import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const AdminUserDetail = () => {
  const { logout } = useAuth();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userClasses, setUserClasses] = useState([]);
  const [userAssignments, setUserAssignments] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const [userResponse, classesResponse, assignmentsResponse, submissionsResponse] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/admin/users/${id}/classes`),
        api.get(`/admin/users/${id}/assignments`),
        api.get(`/admin/users/${id}/submissions`)
      ]);
      
      setUser(userResponse.data);
      setUserClasses(classesResponse.data);
      setUserAssignments(assignmentsResponse.data);
      setUserSubmissions(submissionsResponse.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <ThemeToggle className="theme-toggle" />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <ThemeToggle className="theme-toggle" />
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">User Not Found</h1>
          <Link to="/admin/users" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      {/* Theme Toggle */}
      <ThemeToggle className="theme-toggle" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-800">
                ← Back to Users
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Member Since</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Classes</div>
              <div className="text-lg font-semibold text-gray-900">
                {userClasses.length}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                {user.role === 'teacher' ? 'Assignments Created' : 'Submissions'}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user.role === 'teacher' ? userAssignments.length : userSubmissions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Classes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {user.role === 'teacher' ? 'Classes Teaching' : 'Enrolled Classes'}
          </h3>
          {userClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userClasses.map((classItem) => (
                <div key={classItem._id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                  <p className="text-sm text-gray-600">{classItem.subject}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Code: {classItem.classCode}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No classes found.</p>
          )}
        </div>

        {/* Assignments or Submissions */}
        {user.role === 'teacher' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assignments Created</h3>
            {userAssignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userAssignments.map((assignment) => (
                      <tr key={assignment._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assignment.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.class?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No assignments created yet.</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Submissions</h3>
            {userSubmissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userSubmissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {submission.assignment?.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.assignment?.class?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.grade || 'Not graded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No submissions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetail;