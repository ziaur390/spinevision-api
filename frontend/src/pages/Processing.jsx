/**
 * Processing Page
 * Shows loading animation while AI processes the X-ray
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getResult } from '../services/api';
import logo from '../assets/logo.png';

const Processing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { uploadId } = useParams();
    const [status, setStatus] = useState('processing');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate progress animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 15;
            });
        }, 500);

        // Check for result
        const checkResult = async () => {
            try {
                const result = await getResult(uploadId);
                if (result) {
                    setProgress(100);
                    setTimeout(() => {
                        navigate(`/result/${uploadId}`, { state: { result } });
                    }, 500);
                }
            } catch (err) {
                // Still processing, continue waiting
                setTimeout(checkResult, 2000);
            }
        };

        // Start checking after a brief delay
        const timeout = setTimeout(checkResult, 2000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timeout);
        };
    }, [uploadId, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            </div>

            <div className="relative text-center animate-fade-in">
                {/* Animated Logo */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative">
                        {/* Spinning ring */}
                        <div className="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>

                        {/* Logo in center */}
                        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <img src={logo} alt="SpineVision AI" className="w-16 h-16 object-contain" />
                        </div>
                    </div>
                </div>

                {/* Status Text */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Analyzing X-ray...
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Our AI model is processing your spine X-ray to detect potential abnormalities
                </p>

                {/* Progress Bar */}
                <div className="w-80 mx-auto mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Processing</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar h-3">
                        <div
                            className="progress-bar-fill transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Steps */}
                <div className="flex justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-gray-600">Uploaded</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-teal-600 font-medium">Analyzing</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-gray-400">Results</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Processing;
