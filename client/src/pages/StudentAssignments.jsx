import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassById, getAssignments } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const StudentAssignments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, overdue, completed

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const [classResponse, assignmentsResponse] = await Promise.all([
        getClassById(id),
        getAssignments(id)
      ]);
      
      setClassData(classResponse.data.class);
      setAssignments(assignmentsResponse.data.assignments || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You are not a member of this class.');
      } else if (err.response?.status === 404) {
        setError('Class not found.');
      } else {
        setError(`Failed to load assignments: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return assignments.filter(a => new Date(a.dueAt) > now);
      case 'overdue':
        return assignments.filter(a => new Date(a.dueAt) < now);
      case 'completed':
        // This would need submission data to determine completion
        return assignments.filter(a => a.isSubmitted); // Placeholder
      default:
        return assignments;
    }
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error || 'Class not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/student/class/${id}`)}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to {classData.title}</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600">{classData.title} - {classData.code}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All', count: assignments.length },
                { key: 'upcoming', label: 'Upcoming', count: assignments.filter(a => new Date(a.dueAt) > new Date()).length },
                { key: 'overdue', label: 'Overdue', count: assignments.filter(a => new Date(a.dueAt) < new Date()).length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Assignments Yet' : `No ${filter} assignments`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Your teacher hasn\'t created any assignments yet.' 
                : `You don't have any ${filter} assignments.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAssignments.map((assignment) => {
              const isOverdue = new Date(assignment.dueAt) < new Date();
              const daysUntilDue = Math.ceil((new Date(assignment.dueAt) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={assignment._id} className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 ${
                  isOverdue ? 'border-red-500' : daysUntilDue <= 3 ? 'border-yellow-500' : 'border-green-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800' 
                            : daysUntilDue <= 3 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue 
                            ? 'Overdue' 
                            : daysUntilDue <= 3 
                              ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                              : 'Upcoming'
                          }
                        </span>
                      </div>
                      
                      {assignment.description && (
                        <p className="text-gray-700 mb-4 line-clamp-2">{assignment.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>Due: {new Date(assignment.dueAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{assignment.maxScore} points</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className={assignment.isSubmitted ? 'text-green-600' : 'text-gray-600'}>
                            {assignment.isSubmitted ? 'Submitted' : 'Not submitted'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={() => navigate(`/student/assignment/${assignment._id}`)}
                        className={`text-sm py-2 px-4 ${
                          assignment.isSubmitted 
                            ? 'btn-secondary' 
                            : isOverdue 
                              ? 'btn-danger' 
                              : 'btn-primary'
                        }`}
                      >
                        {assignment.isSubmitted ? 'View Submission' : isOverdue ? 'Submit Late' : 'Submit'}
                      </button>
                    </div>
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

export default StudentAssignments;