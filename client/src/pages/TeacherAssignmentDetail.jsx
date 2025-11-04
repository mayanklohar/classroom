import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById, updateAssignment, deleteAssignment } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const TeacherAssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    dueAt: '',
    maxScore: 100
  });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignmentById(id);
      const assignmentData = response.data.assignment;
      setAssignment(assignmentData);
      
      // Set edit data
      setEditData({
        title: assignmentData.title,
        description: assignmentData.description,
        dueAt: new Date(assignmentData.dueAt).toISOString().slice(0, 16),
        maxScore: assignmentData.maxScore
      });
    } catch (err) {
      console.error('Error fetching assignment:', err);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatePayload = {
        ...editData,
        dueAt: new Date(editData.dueAt).toISOString()
      };

      await updateAssignment(id, updatePayload);
      setSuccess('Assignment updated successfully!');
      setEditing(false);
      fetchAssignment(); // Refresh data
    } catch (err) {
      console.error('Error updating assignment:', err);
      setError(err.response?.data?.error || 'Failed to update assignment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteAssignment(id);
      navigate(-1); // Go back to assignments list
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError(err.response?.data?.error || 'Failed to delete assignment');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(assignment?.dueAt) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Assignments</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Assignment Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {editing ? (
            // Edit Form
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dueAt" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="dueAt"
                    value={editData.dueAt}
                    onChange={(e) => setEditData(prev => ({ ...prev, dueAt: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Points *
                  </label>
                  <input
                    type="number"
                    id="maxScore"
                    min="1"
                    value={editData.maxScore}
                    onChange={(e) => setEditData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment?.title}</h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Due: {new Date(assignment?.dueAt).toLocaleDateString()} at {new Date(assignment?.dueAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{assignment?.maxScore} points</span>
                    </div>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isOverdue 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isOverdue ? 'Overdue' : 'Active'}
                </span>
              </div>

              {assignment?.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                </div>
              )}

              {assignment?.attachments && assignment.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {assignment.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <a 
                          href={`http://localhost:5000/${attachment.path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {attachment.filename}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit Assignment</span>
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L10 11.414l2.293-2.293a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>{deleting ? 'Deleting...' : 'Delete Assignment'}</span>
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/teacher/assignment/${id}/submissions`)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>View Submissions</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentDetail;