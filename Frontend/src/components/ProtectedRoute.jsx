import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../core/context/UserContext";

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Redirects to signin page if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useContext(AuthContext);
    const location = useLocation();

    // Show nothing while checking auth status
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Redirect to signin if not authenticated
    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
