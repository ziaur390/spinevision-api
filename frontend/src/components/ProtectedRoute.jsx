/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirect to login page, saving the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
