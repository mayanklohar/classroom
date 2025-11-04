import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const AdminClassDetail = () => {
  const { logout } = useAuth();
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [classAssignments, setClassAssignments] = useState([]);
  const [classSubmissions, setClassSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const [classResponse, assignmentsResponse, submissionsResponse] = await Promise.all([
        api.get(`/admin/classes/${id}`),
        api.get(`/admin/classes/${id}/assignments`),
        api.get(`/admin/classes/${id}/submissions`)
      ]);
      
      setClassData(classResponse.data);
      setClassAssignments(assignmentsResponse.data);
      setClassSubmissions(submissionsResponse.data);
    } catch (error) {
      console.error('Error fetching class details:', error);
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

  if (!classData) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <ThemeToggle className="theme-toggle" />
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Class Not Found</h1>
          <Link to="/admin/classes" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ← Back to Classes
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
              <Link to="/admin/classes" className="text-blue-600 hover:text-blue-800">
                ← Back to Classes
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Class Details</h1>
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
        {/* Class Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{classData.name}</h2>
              <p className="text-xl text-gray-600">{classData.subject}</p>
              <p className="text-sm text-gray-500 mt-2">{classData.description}</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-mono text-lg">
                {classData.classCode}
              </div>
              <p className="text-xs text-gray-500 mt-1">Class Code</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{classData.students?.length || 0}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{classAssignments.length}</div>
              <div className="text-sm text-gray-600">Assignments</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{classSubmissions.length}</div>
              <div className="text-sm text-gray-600">Submissions</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Created</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(classData.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Teacher Info */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Teacher</h3>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-300 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-700">
                  {classData.teacher?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <div className="font-medium text-purple-900">{classData.teacher?.name}</div>
                <div className="text-sm text-purple-600">{classData.teacher?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Enrolled Students</h3>
          {classData.students && classData.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData.students.map((student) => (
                <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-300 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">
                        {student.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No students enrolled yet.</p>
          )}
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Assignments</h3>
          {classAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classAssignments.map((assignment) => {
                    const isOverdue = new Date(assignment.dueDate) < new Date();
                    const isDueSoon = new Date(assignment.dueDate) - new Date() < 24 * 60 * 60 * 1000;
                    
                    return (
                      <tr key={assignment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {assignment.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isOverdue ? 'bg-red-100 text-red-800' :
                            isDueSoon ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No assignments created yet.</p>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Submissions</h3>
          {classSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
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
                  {classSubmissions.slice(0, 10).map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.student?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.assignment?.title}
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
            <p className="text-gray-500">No submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClassDetail;