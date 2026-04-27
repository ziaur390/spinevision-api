/**
 * History Page
 * Displays user's upload history with filtering and pagination
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getHistory, deleteUpload, API_BASE_URL } from '../services/api';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getHistory(page, 10);
            setHistory(data.items || []);
            setTotalPages(data.total_pages || 1);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uploadId) => {
        if (!confirm('Are you sure you want to delete this scan?')) return;

        setDeleting(uploadId);
        try {
            await deleteUpload(uploadId);
            setHistory(history.filter(item => item.upload_id !== uploadId));
        } catch (err) {
            console.error('Failed to delete:', err);
        } finally {
            setDeleting(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'done':
                return <span className="badge badge-success">Completed</span>;
            case 'processing':
                return <span className="badge badge-warning">Processing</span>;
            case 'uploaded':
                return <span className="badge badge-info">Uploaded</span>;
            case 'failed':
                return <span className="badge badge-danger">Failed</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getClassificationBadge = (classification) => {
        if (!classification) return null;
        if (classification.includes('Normal')) {
            return <span className="badge badge-success">Normal</span>;
        }
        if (classification.includes('High')) {
            return <span className="badge badge-danger">Abnormal</span>;
        }
        if (classification.includes('Moderate') || classification.includes('Possibly')) {
            return <span className="badge badge-warning">Possibly Abnormal</span>;
        }
        return <span className="badge">{classification}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />

            {/* Main Content */}
            <main className="md:ml-64 pt-16 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Scan History</h1>
                        <p className="text-gray-500 mt-1">
                            View and manage your previous X-ray analyses
                        </p>
                    </div>
                    <Link to="/upload" className="btn btn-primary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Scan
                    </Link>
                </div>

                {/* History Table */}
                <div className="card animate-fade-in">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="loader mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No scans yet</h3>
                            <p className="text-gray-500 mb-4">Upload your first X-ray to get started</p>
                            <Link to="/upload" className="btn btn-primary">
                                Upload X-ray
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>File Name</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Result</th>
                                            <th>Confidence</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((item, index) => (
                                            <tr key={item.upload_id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-medium text-gray-800 truncate max-w-[200px]">
                                                            {item.file_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-gray-500 text-sm">
                                                    {formatDate(item.uploaded_at)}
                                                </td>
                                                <td>
                                                    {getStatusBadge(item.status)}
                                                </td>
                                                <td>
                                                    {getClassificationBadge(item.overall_classification)}
                                                </td>
                                                <td className="text-gray-800">
                                                    {item.confidence_score
                                                        ? `${(item.confidence_score * 100).toFixed(0)}%`
                                                        : '-'}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        {item.status === 'done' && (
                                                            <Link
                                                                to={`/result/${item.upload_id}`}
                                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                                                title="View Result"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(item.upload_id)}
                                                            disabled={deleting === item.upload_id}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deleting === item.upload_id ? (
                                                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        Page {page} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                            className="btn btn-secondary disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === totalPages}
                                            className="btn btn-secondary disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;
