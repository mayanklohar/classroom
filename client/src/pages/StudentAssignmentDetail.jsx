import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById, createSubmission, getMySubmissions } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const StudentAssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [submissionData, setSubmissionData] = useState({
    linkOrFiles: [],
    textSubmission: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        getAssignmentById(id),
        getMySubmissions({ assignmentId: id })
      ]);
      
      setAssignment(assignmentResponse.data.assignment);
      
      // Check if student has already submitted
      const existingSubmission = submissionsResponse.data.submissions?.find(
        sub => sub.assignmentId === id
      );
      setSubmission(existingSubmission || null);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionData(prev => ({
      ...prev,
      linkOrFiles: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add text submission if provided
      if (submissionData.textSubmission.trim()) {
        formData.append('textSubmission', submissionData.textSubmission);
      }
      
      // Add files
      submissionData.linkOrFiles.forEach((file) => {
        formData.append('files', file);
      });

      await createSubmission(id, formData);
      setSuccess('Assignment submitted successfully! 🎉');
      
      // Refresh data to show submission
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError(err.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
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
  const daysUntilDue = Math.ceil((new Date(assignment?.dueAt) - new Date()) / (1000 * 60 * 60 * 24));

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

        {/* Assignment Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
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
              submission 
                ? 'bg-green-100 text-green-800' 
                : isOverdue 
                  ? 'bg-red-100 text-red-800' 
                  : daysUntilDue <= 3 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
            }`}>
              {submission 
                ? 'Submitted' 
                : isOverdue 
                  ? 'Overdue' 
                  : daysUntilDue <= 3 
                    ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                    : 'Upcoming'
              }
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
        </div>

        {/* Submission Section */}
        {submission ? (
          // Show existing submission
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Submission</h2>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {submission.grade && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Grade</h3>
                <div className="text-2xl font-bold text-blue-900">
                  {submission.grade.score}/{submission.grade.max} points
                </div>
                {submission.feedback && (
                  <div className="mt-3">
                    <h4 className="font-medium text-blue-900">Feedback:</h4>
                    <p className="text-blue-800 mt-1">{submission.feedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* Show submitted files/content */}
            {submission.linkOrFiles && submission.linkOrFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Submitted Files</h3>
                <div className="space-y-2">
                  {submission.linkOrFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>{file.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Show submission form
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Assignment</h2>
            
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="textSubmission" className="block text-sm font-medium text-gray-700 mb-2">
                  Text Submission (Optional)
                </label>
                <textarea
                  id="textSubmission"
                  rows={6}
                  value={submissionData.textSubmission}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, textSubmission: e.target.value }))}
                  className="input-field"
                  placeholder="Enter your submission text here..."
                />
              </div>

              <div>
                <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  id="files"
                  multiple
                  onChange={handleFileChange}
                  className="input-field"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB per file)
                </p>
                
                {submissionData.linkOrFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Selected files:</p>
                    <ul className="mt-1 text-sm text-gray-600">
                      {submissionData.linkOrFiles.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={submitting || (!submissionData.textSubmission.trim() && submissionData.linkOrFiles.length === 0)}
                  className={`btn-primary flex items-center space-x-2 ${
                    isOverdue ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>{isOverdue ? 'Submit Late' : 'Submit Assignment'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentDetail;