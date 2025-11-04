import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatCard from '../components/StatCard.jsx';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalAssignments: 0,
        totalSubmissions: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, usersResponse] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users/recent')
            ]);

            setStats(statsResponse.data);
            setRecentUsers(usersResponse.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin Dashboard 👨‍💼</h1>
                    <p className="text-gray-600">Welcome back, {user?.name}! Monitor and manage the entire system</p>
                </div>

                {/* Stats Cards - Horizontal Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon="👥"
                        color="blue"
                    />
                    <StatCard
                        title="Students"
                        value={stats.totalStudents}
                        icon="🎓"
                        color="green"
                    />
                    <StatCard
                        title="Teachers"
                        value={stats.totalTeachers}
                        icon="👨‍🏫"
                        color="purple"
                    />
                    <StatCard
                        title="Classes"
                        value={stats.totalClasses}
                        icon="📚"
                        color="orange"
                    />
                    <StatCard
                        title="Assignments"
                        value={stats.totalAssignments}
                        icon="📝"
                        color="red"
                    />
                    <StatCard
                        title="Submissions"
                        value={stats.totalSubmissions}
                        icon="📤"
                        color="blue"
                    />
                </div>

                {/* Main Content Area */}
                <div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Quick Actions */}
                      <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link
                                to="/admin/users"
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
                                        👥
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Users</h3>
                                    <p className="text-gray-600 text-sm">View and edit all users in the system</p>
                                </div>
                            </Link>

                            <Link
                                to="/admin/classes"
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
                                        📚
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Classes</h3>
                                    <p className="text-gray-600 text-sm">Oversee all classes and their activities</p>
                                </div>
                            </Link>

                            <Link
                                to="/admin/assignments"
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
                                        📝
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">View Assignments</h3>
                                    <p className="text-gray-600 text-sm">Monitor all assignments and submissions</p>
                                </div>
                            </Link>

                            <Link
                                to="/admin/analytics"
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
                                        📊
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
                                    <p className="text-gray-600 text-sm">View detailed system analytics and reports</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                      {/* Recent Users */}
                      <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Users</h2>
                            <Link
                                to="/admin/users"
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
                            >
                                View All →
                            </Link>
                        </div>
                        
                        {recentUsers.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
                                <div className="text-4xl mb-3">👤</div>
                                <p className="text-gray-500">No recent users</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentUsers.slice(0, 5).map((recentUser) => (
                                    <div 
                                        key={recentUser._id} 
                                        className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
                                        onClick={() => navigate(`/admin/users/${recentUser._id}`)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                {recentUser.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {recentUser.name}
                                                </p>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {recentUser.email}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    recentUser.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                    recentUser.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {recentUser.role}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(recentUser.createdAt).toLocaleDateString()}
                                                </span>
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
        </div>
    );
};

export default AdminDashboard;