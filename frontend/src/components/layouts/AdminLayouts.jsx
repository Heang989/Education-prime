import React from 'react'
import { Outlet } from 'react-router-dom'

const AdminLayouts = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple wrapper for admin and dashboard pages */}
            <Outlet />
        </div>
    )
}

export default AdminLayouts
