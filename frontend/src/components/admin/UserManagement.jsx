import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createUser, fetchUsers } from '../../store/slices/authSlice'

const UserManagement = () => {
    const dispatch = useDispatch()
    const { users, usersLoading, usersError } = useSelector((state) => state.auth)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    })
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            await dispatch(createUser(formData)).unwrap()
            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user'
            })
            setIsFormOpen(false)
            setFormErrors({})
            // Refresh users list
            dispatch(fetchUsers())
        } catch (error) {
            console.error('Failed to create user:', error)
        }
    }

    const handleCancel = () => {
        setIsFormOpen(false)
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user'
        })
        setFormErrors({})
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
                    <p className="text-slate-400">Create and manage user accounts</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg cursor-pointer transition hover:bg-emerald-500"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create User
                </button>
            </div>

            {/* Error state */}
            {usersError && (
                <div className="animate-fade-in rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {typeof usersError === 'string' ? usersError : 'An error occurred'}
                </div>
            )}

            {/* Create User Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl ring-1 ring-white/10 animate-fade-in">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Create New User</h3>
                            <button
                                onClick={handleCancel}
                                className="text-slate-400 hover:text-white cursor-pointer transition"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full rounded-xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                        formErrors.name
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    placeholder="John Doe"
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-rose-400">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full rounded-xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                        formErrors.email
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    placeholder="user@example.com"
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-rose-400">{formErrors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full rounded-xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                        formErrors.password
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    placeholder="••••••••"
                                />
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-rose-400">{formErrors.password}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-semibold text-slate-300 mb-2">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 bg-white cursor-pointer transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                >
                                    <option value="user" className="text-slate-900">👤 User - Learn Khmer</option>
                                    <option value="admin" className="text-slate-900">⚙️ Admin - Manage Content</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 rounded-xl border border-slate-600 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 cursor-pointer transition hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={usersLoading}
                                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white cursor-pointer transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {usersLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur overflow-hidden">
                {usersLoading && users.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                        <p className="mt-4 text-slate-400">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-400">No users found. Create your first user!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {users.map((user) => (
                                    <tr key={user._id || user.id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4 text-sm text-white">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                user.role === 'admin' 
                                                    ? 'bg-indigo-500/20 text-indigo-300' 
                                                    : 'bg-slate-500/20 text-slate-300'
                                            }`}>
                                                {user.role === 'admin' ? '⚙️ Admin' : '👤 User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserManagement

