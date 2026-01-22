/**
 * Upload Page
 * Professional drag & drop X-ray upload interface
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { uploadXray } from '../services/api';

const Upload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        handleFile(selectedFile);
    };

    const handleFile = (selectedFile) => {
        setError('');

        if (!selectedFile) return;

        const extension = selectedFile.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['png', 'jpg', 'jpeg', 'dcm', 'dicom'];

        if (!allowedExtensions.includes(extension)) {
            setError('Please upload a valid image file (PNG, JPG, or DICOM)');
            return;
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            setError('File size must be less than 50MB');
            return;
        }

        setFile(selectedFile);

        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true);
        setProgress(0);
        setError('');

        try {
            const result = await uploadXray(file, (percent) => {
                setProgress(percent);
            });

            navigate(`/result/${result.upload_id}`, { state: { result } });
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />

            <main className="ml-64 pt-16 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Upload X-ray</h1>
                    <p className="text-gray-500 mt-1">
                        Upload a spine X-ray image for AI-powered analysis
                    </p>
                </div>

                <div className="max-w-4xl">
                    {/* Main Upload Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Drop Zone */}
                        {!file && (
                            <div
                                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-gray-200 hover:border-teal-400 hover:bg-gray-50'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".png,.jpg,.jpeg,.dcm,.dicom"
                                    className="hidden"
                                />

                                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-teal-100' : 'bg-gray-100'
                                    }`}>
                                    <svg className={`w-10 h-10 ${isDragging ? 'text-teal-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {isDragging ? 'Drop your file here' : 'Drag and drop your X-ray image'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    or <span className="text-teal-600 font-semibold">browse</span> from your computer
                                </p>
                                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        PNG, JPG, DICOM
                                    </span>
                                    <span>•</span>
                                    <span>Max 50MB</span>
                                </div>
                            </div>
                        )}

                        {/* File Preview */}
                        {file && (
                            <div className="space-y-6">
                                <div className="flex gap-6">
                                    {/* Preview Image */}
                                    <div className="w-64 h-64 bg-gray-900 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="X-ray preview"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1">
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">File Name</p>
                                            <h4 className="text-lg font-bold text-gray-800 truncate">{file.name}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Size</p>
                                                <p className="text-gray-800 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Type</p>
                                                <p className="text-gray-800 font-medium">{file.type || 'DICOM'}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {uploading && (
                                            <div className="mb-6">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-gray-600 font-medium">Uploading & Analyzing...</span>
                                                    <span className="text-teal-600 font-bold">{progress}%</span>
                                                </div>
                                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className="flex-1 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                        </svg>
                                                        Start AI Analysis
                                                    </>
                                                )}
                                            </button>

                                            {!uploading && (
                                                <button
                                                    onClick={clearFile}
                                                    className="px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                                                >
                                                    Change
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {[
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                ),
                                title: 'Secure',
                                desc: 'End-to-end encryption',
                                color: 'text-green-600',
                                bg: 'bg-green-50',
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                ),
                                title: 'Fast',
                                desc: 'Results in seconds',
                                color: 'text-yellow-600',
                                bg: 'bg-yellow-50',
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                ),
                                title: 'AI-Powered',
                                desc: 'Deep learning model',
                                color: 'text-purple-600',
                                bg: 'bg-purple-50',
                            },
                        ].map((item) => (
                            <div key={item.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Upload;
