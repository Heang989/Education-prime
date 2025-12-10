import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth)

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Check both isAuthenticated flag AND user object for better security
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    if (requireAdmin && user.role !== 'admin') {
        // Non-admin users trying to access an admin-only route
        // should be redirected to the main Home page.
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
