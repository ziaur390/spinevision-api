/**
 * API Service for SPINEVISION-AI
 * Handles all backend communication with JWT authentication
 */

import axios from 'axios';

// Backend API base URL - uses environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================================================
// Authentication APIs
// ============================================================================

/**
 * Register a new user
 */
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

/**
 * Login user and get JWT token
 */
export const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    // Store token and user data
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// ============================================================================
// Upload APIs
// ============================================================================

/**
 * Upload X-ray image for analysis
 */
export const uploadXray = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
            }
        },
    });

    return response.data;
};

/**
 * Get upload status
 */
export const getUploadStatus = async (uploadId) => {
    const response = await api.get(`/upload/${uploadId}`);
    return response.data;
};

// ============================================================================
// Result APIs
// ============================================================================

/**
 * Get analysis result for an upload
 */
export const getResult = async (uploadId) => {
    const response = await api.get(`/result/${uploadId}`);
    return response.data;
};

/**
 * Get heatmap image URL
 */
export const getHeatmapUrl = (uploadId) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/result/${uploadId}/heatmap?token=${token}`;
};

/**
 * Get report download URL
 */
export const getReportUrl = (uploadId) => {
    return `${API_BASE_URL}/result/${uploadId}/report`;
};

/**
 * Download report
 */
export const downloadReport = async (uploadId) => {
    const response = await api.get(`/result/${uploadId}/report`, {
        responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPINEVISION_Report_${uploadId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// ============================================================================
// History APIs
// ============================================================================

/**
 * Get user's upload history
 */
export const getHistory = async (page = 1, pageSize = 10) => {
    const response = await api.get('/history', {
        params: { page, page_size: pageSize },
    });
    return response.data;
};

/**
 * Get user statistics
 */
export const getStatistics = async () => {
    const response = await api.get('/history/statistics');
    return response.data;
};

/**
 * Delete an upload
 */
export const deleteUpload = async (uploadId) => {
    const response = await api.delete(`/history/${uploadId}`);
    return response.data;
};

// ============================================================================
// Health Check
// ============================================================================

/**
 * Check if backend is healthy
 */
export const healthCheck = async () => {
    const response = await api.get('/health');
    return response.data;
};

// Export the axios instance for custom requests
export default api;

// Export base URL for image paths
export { API_BASE_URL };
