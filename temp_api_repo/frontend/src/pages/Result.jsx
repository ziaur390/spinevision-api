/**
 * Result Page
 * Professional display of AI analysis results
 */

import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getResult, downloadReport, API_BASE_URL } from '../services/api';

const Result = () => {
    const { uploadId } = useParams();
    const location = useLocation();
    const [result, setResult] = useState(location.state?.result || null);
    const [loading, setLoading] = useState(!result);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!result) {
            fetchResult();
        }
    }, [uploadId]);

    const fetchResult = async () => {
        try {
            const data = await getResult(uploadId);
            setResult(data);
        } catch (err) {
            console.error('Failed to fetch result:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        setDownloading(true);
        try {
            await downloadReport(uploadId);
        } catch (err) {
            console.error('Failed to download report:', err);
        } finally {
            setDownloading(false);
        }
    };

    const getClassificationStyle = (classification) => {
        if (!classification) return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
        if (classification.includes('Normal')) {
            return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '✓' };
        }
        if (classification.includes('High')) {
            return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '!' };
        }
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '?' };
    };

    const getProbabilityColor = (probability) => {
        if (probability >= 0.7) return 'from-red-500 to-red-600';
        if (probability >= 0.5) return 'from-orange-500 to-yellow-500';
        if (probability >= 0.3) return 'from-yellow-400 to-yellow-500';
        return 'from-green-400 to-emerald-500';
    };

    const getProbabilityLabel = (probability) => {
        if (probability >= 0.7) return { text: 'High Risk', color: 'text-red-600' };
        if (probability >= 0.5) return { text: 'Moderate', color: 'text-orange-600' };
        if (probability >= 0.3) return { text: 'Low Risk', color: 'text-yellow-600' };
        return { text: 'Very Low', color: 'text-green-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar />
                <main className="ml-64 pt-16 p-8 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading results...</p>
                    </div>
                </main>
            </div>
        );
    }

    const resultData = result?.result || result;
    const predictions = resultData?.predictions || [];
    const classStyle = getClassificationStyle(resultData?.overall_classification);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />

            <main className="md:ml-64 pt-16 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/history" className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-800">Analysis Results</h1>
                        </div>
                        <p className="text-gray-500">AI-powered spine X-ray analysis report</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadReport}
                            disabled={downloading}
                            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-200 flex items-center gap-2"
                        >
                            {downloading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF Report
                                </>
                            )}
                        </button>
                        <Link to="/upload" className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Scan
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Overall Classification */}
                        <div className={`rounded-2xl p-8 border-2 ${classStyle.bg} ${classStyle.border}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Overall Classification</p>
                                    <h2 className={`text-3xl font-bold ${classStyle.text}`}>
                                        {resultData?.overall_classification || 'Processing...'}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Confidence</p>
                                    <p className="text-4xl font-bold text-gray-800">
                                        {resultData?.confidence_score
                                            ? `${(resultData.confidence_score * 100).toFixed(0)}%`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Model Version: <span className="font-medium text-gray-700">{resultData?.model_version || 'v0.1'}</span>
                                </p>
                                <p className="text-sm text-gray-500">
                                    Analyzed: <span className="font-medium text-gray-700">{new Date().toLocaleString()}</span>
                                </p>
                            </div>
                        </div>

                        {/* Detected Conditions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800">Detected Conditions</h3>
                                <p className="text-gray-500 text-sm mt-1">Probability scores for each spine condition</p>
                            </div>
                            <div className="p-6">
                                {predictions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 font-medium">No abnormalities detected</p>
                                        <p className="text-gray-400 text-sm">The X-ray appears normal</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {predictions.map((pred, index) => {
                                            const probLabel = getProbabilityLabel(pred.probability);
                                            return (
                                                <div key={index} className="bg-gray-50 rounded-xl p-5">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h4 className="font-bold text-gray-800">{pred.label}</h4>
                                                                <span className={`text-xs font-medium ${probLabel.color}`}>
                                                                    {probLabel.text}
                                                                </span>
                                                            </div>
                                                            {pred.description && (
                                                                <p className="text-sm text-gray-500">{pred.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-bold text-gray-800">
                                                                {(pred.probability * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${getProbabilityColor(pred.probability)} rounded-full transition-all duration-700`}
                                                            style={{ width: `${pred.probability * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Heatmap */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">Heatmap Visualization</h3>
                                <p className="text-gray-500 text-sm mt-1">Areas of interest highlighted</p>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-900 rounded-xl overflow-hidden aspect-square">
                                    {resultData?.heatmap_url ? (
                                        <img
                                            src={`${API_BASE_URL}${resultData.heatmap_url}`}
                                            alt="Heatmap visualization"
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500"
                                        style={{ display: resultData?.heatmap_url ? 'none' : 'flex' }}>
                                        <svg className="w-16 h-16 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm">Heatmap visualization</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                                        <span className="text-gray-500">High interest</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                        <span className="text-gray-500">Moderate</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                        <span className="text-gray-500">Normal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-800 mb-1">Important Notice</h4>
                                    <p className="text-sm text-amber-700">
                                        This AI analysis is for clinical decision support only.
                                        Final diagnosis must be made by a qualified healthcare professional.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-4">Quick Actions</h4>
                            <div className="space-y-3">
                                <Link to="/upload" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Upload Another X-ray</span>
                                </Link>
                                <Link to="/history" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">View All Scans</span>
                                </Link>
                                <Link to="/dashboard" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Back to Dashboard</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Result;
