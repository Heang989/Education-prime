import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../../../store/slices/authSlice'

const RegisterPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user', // Default to user role
        agreeToTerms: false
    })
    const [localErrors, setLocalErrors] = useState({})

    useEffect(() => {
        if (isAuthenticated && user) {
            // Small delay to ensure smooth transition
            const redirectTimer = setTimeout(() => {
                if (user.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true })
                } else if (user.role === 'user') {
                    // Regular users go to the main Home page
                    navigate('/', { replace: true })
                } else {
                    // Fallback for any other roles
                    navigate('/', { replace: true })
                }
            }, 100)

            return () => clearTimeout(redirectTimer)
        }

        // Clear errors on unmount
        return () => {
            dispatch(clearError())
        }
    }, [isAuthenticated, user, navigate, dispatch])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Clear error when user starts typing
        if (localErrors[name]) {
            setLocalErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required'
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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and privacy policy'
        }

        setLocalErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!validateForm()) return

        dispatch(register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        }))
    }

    return (
        <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            {/* Left Side - Form */}
            <div className="w-full p-8 md:p-12 lg:w-1/2">
                <div className="text-center lg:text-left">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 lg:mx-0">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="mt-6 text-3xl font-bold text-slate-900">Create Account</h1>
                    <p className="mt-2 text-slate-600">Start your Khmer learning journey today.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    {/* General Error */}
                    {error && (
                        <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
                            <p className="text-sm text-rose-600">{error}</p>
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`mt-2 w-full rounded-xl border px-4 py-3 text-slate-900 transition focus:outline-none focus:ring-2 ${localErrors.name
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                                }`}
                            placeholder="John Doe"
                        />
                        {localErrors.name && (
                            <p className="mt-1 text-sm text-rose-600">{localErrors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mt-2 w-full rounded-xl border px-4 py-3 text-slate-900 transition focus:outline-none focus:ring-2 ${localErrors.email
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                                }`}
                            placeholder="you@example.com"
                        />
                        {localErrors.email && (
                            <p className="mt-1 text-sm text-rose-600">{localErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`mt-2 w-full rounded-xl border px-4 py-3 text-slate-900 transition focus:outline-none focus:ring-2 ${localErrors.password
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                                }`}
                            placeholder="••••••••"
                        />
                        {localErrors.password && (
                            <p className="mt-1 text-sm text-rose-600">{localErrors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`mt-2 w-full rounded-xl border px-4 py-3 text-slate-900 transition focus:outline-none focus:ring-2 ${localErrors.confirmPassword
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                                }`}
                            placeholder="••••••••"
                        />
                        {localErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-rose-600">{localErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                            Account Type
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                            <option value="user">👤 User - Learn Khmer</option>
                            <option value="admin">⚙️ Admin - Manage Content</option>
                        </select>
                    </div>

                    {/* Terms & Conditions */}
                    <div>
                        <label className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-200 ${localErrors.agreeToTerms ? 'border-rose-300' : ''
                                    }`}
                            />
                            <span className="text-sm text-slate-600">
                                I agree to the{' '}
                                <Link to="/terms" className="font-semibold text-emerald-600 hover:text-emerald-500">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="font-semibold text-emerald-600 hover:text-emerald-500">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {localErrors.agreeToTerms && (
                            <p className="mt-1 text-sm text-rose-600">{localErrors.agreeToTerms}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-slate-500">Or sign up with</span>
                        </div>
                    </div>

                    {/* Social Sign Up */}
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">
                            <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div>
                    <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                        Start Learning
                    </div>
                    <h2 className="mt-6 text-3xl font-bold">Your Journey Begins Here</h2>
                    <p className="mt-4 text-emerald-100">
                        Create an account to access personalized lessons, track your progress, and join our community of learners.
                    </p>
                </div>

                <div className="relative mt-12">
                    {/* Abstract Shapes */}
                    <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-yellow-400/30 blur-xl"></div>
                    <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-cyan-400/30 blur-xl"></div>

                    <div className="relative rounded-2xl bg-white/10 p-6 backdrop-blur-md ring-1 ring-white/20">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-2xl">
                                �
                            </div>
                            <div>
                                <p className="font-bold">Unlock Potential</p>
                                <p className="text-sm text-emerald-100">Learn a new language, open new doors.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-emerald-200">
                    <p>© 2025 KhmerTranslate</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
