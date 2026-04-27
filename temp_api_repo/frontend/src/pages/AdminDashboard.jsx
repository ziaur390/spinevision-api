/**
 * Admin Dashboard
 * Real-time administrative control panel with live data from backend
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/api';
import api from '../services/api';
import logo from '../assets/logo.png';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = getStoredUser();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Real data states
    const [stats, setStats] = useState({
        total_users: 0,
        active_users: 0,
        total_scans: 0,
        today_scans: 0,
        pending_scans: 0,
        completed_scans: 0,
        normal_count: 0,
        abnormal_count: 0
    });
    const [users, setUsers] = useState([]);
    const [scans, setScans] = useState([]);
    const [activity, setActivity] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);

    // Fetch all data
    const fetchData = async () => {
        try {
            const [statsRes, usersRes, scansRes, activityRes, weeklyRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/scans'),
                api.get('/admin/activity'),
                api.get('/admin/analytics/weekly')
            ]);

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setScans(scansRes.data);
            setActivity(activityRes.data);
            setWeeklyData(weeklyRes.data.weekly_data || []);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleToggleUserStatus = async (userId) => {
        try {
            await api.patch(`/admin/users/${userId}/status`);
            fetchData();
        } catch (err) {
            console.error('Failed to toggle user status:', err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await api.patch(`/admin/users/${userId}/role?role=${newRole}`);
            fetchData();
        } catch (err) {
            console.error('Failed to change role:', err);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return date.toLocaleDateString();
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: '📊' },
        { id: 'users', name: 'Users', icon: '👥' },
        { id: 'scans', name: 'Scans', icon: '🔬' },
        { id: 'analytics', name: 'Analytics', icon: '📈' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading admin data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="SpineVision AI" className="h-10 w-auto" />
                        <div>
                            <p className="font-bold">SPINEVISION AI</p>
                            <p className="text-xs text-gray-400">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                    ? 'bg-teal-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <span>🏠</span>
                        <span>User Dashboard</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {tabs.find(t => t.id === activeTab)?.name || 'Dashboard'}
                        </h1>
                        <p className="text-gray-500">Real-time system management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
                        >
                            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {user?.full_name?.charAt(0) || 'A'}
                            </div>
                            <span className="font-medium text-gray-700">{user?.full_name || 'Admin'}</span>
                        </div>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">👥</span>
                                    <span className="text-green-600 font-medium">{stats.active_users} active</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{stats.total_users}</p>
                                <p className="text-gray-500">Total Users</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">🔬</span>
                                    <span className="text-blue-600 font-medium">{stats.completed_scans} done</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{stats.total_scans}</p>
                                <p className="text-gray-500">Total Scans</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">📊</span>
                                    <span className="text-teal-600 font-medium">Today</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{stats.today_scans}</p>
                                <p className="text-gray-500">Today's Scans</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">🎯</span>
                                    <span className="text-orange-600 font-medium">{stats.abnormal_count} abnormal</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{stats.normal_count}</p>
                                <p className="text-gray-500">Normal Results</p>
                            </div>
                        </div>

                        {/* Activity & Quick Stats */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Recent Activity */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-800">Recent Activity</h3>
                                    <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                    {activity.length === 0 ? (
                                        <p className="p-6 text-center text-gray-500">No recent activity</p>
                                    ) : (
                                        activity.map((item) => (
                                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl">{item.type === 'upload' ? '📤' : '👤'}</span>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.action}</p>
                                                        <p className="text-sm text-gray-500">{item.user}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-400">{formatTime(item.time)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-800 mb-4">System Status</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Pending Scans</span>
                                        <span className="font-bold text-orange-600">{stats.pending_scans}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Completed Today</span>
                                        <span className="font-bold text-green-600">{stats.today_scans}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Normal Results</span>
                                        <span className="font-bold text-teal-600">{stats.normal_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Abnormal Results</span>
                                        <span className="font-bold text-red-600">{stats.abnormal_count}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">System Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">User Management ({users.length} users)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Scans</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                                                        {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{u.full_name || 'No Name'}</p>
                                                        <p className="text-sm text-gray-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                >
                                                    <option value="doctor">doctor</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{u.scan_count}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{formatTime(u.last_active)}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleUserStatus(u.id)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${u.is_active === 'true' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {u.is_active === 'true' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete User"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Scans Tab */}
                {activeTab === 'scans' && (
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Recent Scans ({scans.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">File</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Result</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800 truncate max-w-[200px]">{scan.file_name}</td>
                                            <td className="px-6 py-4 text-gray-600">{scan.user_name || scan.user_email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${scan.status === 'done' ? 'bg-green-100 text-green-700' :
                                                        scan.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {scan.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {scan.classification ? (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${scan.classification.includes('Normal') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {scan.classification.includes('Normal') ? 'Normal' : 'Abnormal'}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{formatTime(scan.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Weekly Chart */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-6">Weekly Scan Activity</h3>
                            <div className="flex items-end justify-between h-48 gap-2">
                                {weeklyData.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-lg transition-all"
                                            style={{ height: `${Math.max((day.scans / Math.max(...weeklyData.map(d => d.scans), 1)) * 100, 5)}%` }}
                                        ></div>
                                        <span className="text-xs text-gray-500">{day.day}</span>
                                        <span className="text-sm font-bold text-gray-800">{day.scans}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
                                <h4 className="text-lg font-semibold mb-2">Total Scans</h4>
                                <p className="text-4xl font-bold">{stats.total_scans}</p>
                                <p className="text-teal-100 mt-2">All time</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                                <h4 className="text-lg font-semibold mb-2">Success Rate</h4>
                                <p className="text-4xl font-bold">
                                    {stats.total_scans > 0 ? Math.round((stats.completed_scans / stats.total_scans) * 100) : 0}%
                                </p>
                                <p className="text-green-100 mt-2">Completed scans</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                                <h4 className="text-lg font-semibold mb-2">Detection Rate</h4>
                                <p className="text-4xl font-bold">
                                    {(stats.normal_count + stats.abnormal_count) > 0
                                        ? Math.round((stats.abnormal_count / (stats.normal_count + stats.abnormal_count)) * 100)
                                        : 0}%
                                </p>
                                <p className="text-purple-100 mt-2">Abnormalities found</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
