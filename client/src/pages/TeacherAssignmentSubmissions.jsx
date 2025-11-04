import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById, getSubmissions, gradeSubmission } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const TeacherAssignmentSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        getAssignmentById(id),
        getSubmissions(id)
      ]);
      
      setAssignment(assignmentResponse.data.assignment);
      setSubmissions(submissionsResponse.data.submissions || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    setError('');
    setSuccess('');

    try {
      await gradeSubmission(submissionId, gradeData);
      setSuccess('Grade submitted successfully!');
      setGradingSubmission(null);
      setGradeData({ score: '', feedback: '' });
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error grading submission:', err);
      setError(err.response?.data?.error || 'Failed to grade submission');
    }
  };

  const startGrading = (submission) => {
    setGradingSubmission(submission._id);
    setGradeData({
      score: submission.grade?.score || '',
      feedback: submission.feedback || ''
    });
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

  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  const avgScore = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + (s.grade?.score || 0), 0) / gradedSubmissions.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/teacher/assignment/${id}`)}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Assignment Details</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment?.title} - Submissions</h1>
            <p className="text-gray-600 mt-2">
              Due: {new Date(assignment?.dueAt).toLocaleDateString()} • {assignment?.maxScore} points
            </p>
          </div>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                  <dd className="text-lg font-medium text-gray-900">{submissions.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Graded</dt>
                  <dd className="text-lg font-medium text-gray-900">{gradedSubmissions.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{submissions.length - gradedSubmissions.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                  <dd className="text-lg font-medium text-gray-900">{avgScore}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600">Students haven't submitted their work yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.studentId?.name || 'Unknown Student'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                      
                      {submission.grade && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>Grade: {submission.grade.score}/{submission.grade.max}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submitted Files */}
                {submission.linkOrFiles && submission.linkOrFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submitted Files:</h4>
                    <div className="space-y-1">
                      {submission.linkOrFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {file.type === 'link' ? (
                            <a href={file.value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
                              {file.value}
                            </a>
                          ) : (
                            <a href={`http://localhost:5000/${file.path}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
                              {file.value}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grading Section */}
                {gradingSubmission === submission._id ? (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Grade Submission</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                          Score (out of {assignment?.maxScore})
                        </label>
                        <input
                          type="number"
                          id="score"
                          min="0"
                          max={assignment?.maxScore}
                          value={gradeData.score}
                          onChange={(e) => setGradeData(prev => ({ ...prev, score: e.target.value }))}
                          className="input-field"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback (Optional)
                      </label>
                      <textarea
                        id="feedback"
                        rows={3}
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                        className="input-field"
                        placeholder="Provide feedback to the student..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleGradeSubmission(submission._id)}
                        className="btn-primary text-sm"
                        disabled={!gradeData.score}
                      >
                        Save Grade
                      </button>
                      <button
                        onClick={() => setGradingSubmission(null)}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4">
                    {submission.grade ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {submission.grade.score}/{submission.grade.max} points
                          </div>
                          {submission.feedback && (
                            <p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
                          )}
                        </div>
                        <button
                          onClick={() => startGrading(submission)}
                          className="btn-secondary text-sm"
                        >
                          Edit Grade
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startGrading(submission)}
                        className="btn-primary text-sm"
                      >
                        Grade Submission
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignmentSubmissions;