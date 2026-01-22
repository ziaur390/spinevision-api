/**
 * Dashboard Page
 * Professional medical dashboard with statistics and quick actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getStatistics, getStoredUser, getHistory } from '../services/api';

const Dashboard = () => {
    const user = getStoredUser();
    const [stats, setStats] = useState({
        total_uploads: 0,
        normal_count: 0,
        abnormal_count: 0,
        pending_count: 0,
    });
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, historyData] = await Promise.all([
                getStatistics(),
                getHistory(1, 5)
            ]);
            setStats(statsData);
            setRecentScans(historyData.items || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const statCards = [
        {
            title: 'Total Scans',
            value: stats.total_uploads,
            change: '+12%',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
        },
        {
            title: 'Normal Results',
            value: stats.normal_count,
            change: 'Healthy',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-emerald-500 to-green-600',
            bgLight: 'bg-emerald-50',
        },
        {
            title: 'Abnormalities',
            value: stats.abnormal_count,
            change: 'Detected',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            gradient: 'from-orange-500 to-red-500',
            bgLight: 'bg-orange-50',
        },
        {
            title: 'Processing',
            value: stats.pending_count,
            change: 'In Queue',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-purple-500 to-indigo-600',
            bgLight: 'bg-purple-50',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />

            {/* Main Content */}
            <main className="ml-64 pt-16 p-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {getTimeOfDay()}, {user?.full_name?.split(' ')[0] || 'Doctor'}! 👋
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Here's an overview of your spine analysis activity
                            </p>
                        </div>
                        <Link to="/upload" className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Analysis
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
                        <div
                            key={card.title}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                    {card.icon}
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${card.bgLight} text-gray-600`}>
                                    {card.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-1">
                                    {loading ? (
                                        <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                                    ) : (
                                        card.value
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Upload Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Upload X-ray</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Upload a new spine X-ray image for instant AI analysis
                                </p>
                                <Link to="/upload" className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                                    Start Upload
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* History Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">View History</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Access all previous scans and download reports
                                </p>
                                <Link to="/history" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                                    View All
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Scans */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-800">Recent Scans</h3>
                                    <Link to="/history" className="text-sm text-teal-600 font-medium hover:text-teal-700">
                                        View All →
                                    </Link>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="p-4 animate-pulse">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : recentScans.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500">No scans yet. Upload your first X-ray!</p>
                                    </div>
                                ) : (
                                    recentScans.map((scan) => (
                                        <div key={scan.upload_id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 truncate max-w-[200px]">{scan.file_name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(scan.uploaded_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {scan.overall_classification && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${scan.overall_classification.includes('Normal')
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {scan.overall_classification.includes('Normal') ? 'Normal' : 'Abnormal'}
                                                        </span>
                                                    )}
                                                    {scan.status === 'done' && (
                                                        <Link to={`/result/${scan.upload_id}`} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* AI Info Card */}
                        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold">AI Model Active</h4>
                                    <p className="text-sm text-teal-100">v0.1 - Ready</p>
                                </div>
                            </div>
                            <p className="text-sm text-teal-100">
                                Our deep learning model can detect 7+ spine conditions including disc narrowing,
                                spondylolisthesis, and degenerative changes.
                            </p>
                        </div>

                        {/* Detectable Conditions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-4">Detectable Conditions</h4>
                            <div className="space-y-3">
                                {[
                                    'Disc Space Narrowing',
                                    'Degenerative Changes',
                                    'Spondylolisthesis',
                                    'Osteophytes',
                                    'Scoliosis',
                                    'Vertebral Compression',
                                    'Spinal Stenosis',
                                ].map((condition) => (
                                    <div key={condition} className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                        <span className="text-gray-600">{condition}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
