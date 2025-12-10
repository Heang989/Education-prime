import React, { useState, useMemo } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import logoImage from '../../assets/image logo/6bea2fd6-9cc9-4f3a-9b66-d644e3e8aba0.jpg'

const SidebarPage = ({ 
    menuItems = null, // Optional: custom menu items
    showStats = false, // Optional: show stats section
    statsData = null, // Optional: stats data object
    className = '', // Optional: additional classes
    onSidebarToggle = null // Optional: callback when sidebar toggles (receives isOpen state)
}) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { categories: categoryList = [] } = useSelector((state) => state.categories)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [navSearchQuery, setNavSearchQuery] = useState('')

    // Default menu items if none provided
    const defaultMenuItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            active: true
        },
        {
            label: 'Translator',
            path: '/translator',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.196 2.196l1.4 1.4M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Chatbot',
            path: '/chatbot',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            )
        },
        {
            label: 'Word Learning',
            path: '/word-translate',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            label: 'Quiz',
            path: '/quize',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        },
        {
            label: 'Learning Path',
            path: '/learning-path',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            )
        },
        {
            label: 'Class',
            path: '/class',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        }
    ]

    // Use provided menu items or default
    const sidebarMenuItems = menuItems || defaultMenuItems

    // Filter navigation items based on search
    const filteredNavItems = useMemo(() => {
        if (!navSearchQuery) return sidebarMenuItems
        const query = navSearchQuery.toLowerCase()
        return sidebarMenuItems.filter(item => 
            item.label.toLowerCase().includes(query)
        )
    }, [navSearchQuery, sidebarMenuItems])

    // Get stats data (use provided or default from categories)
    const displayStats = statsData || {
        totalCategories: categoryList.length,
        placeTypes: categoryList.filter(c => c.type === 'place').length
    }

    return (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-screen z-40 ${className}`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-center relative">
                {sidebarOpen ? (
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 transition hover:opacity-80 cursor-pointer group"
                    >
                        <img 
                            src={logoImage} 
                            alt="Prime-Education Logo" 
                            className="h-8 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
                        />
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/')}
                        className="flex h-8 w-8 items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                    >
                        <img 
                            src={logoImage} 
                            alt="Prime-Education Logo" 
                            className="h-8 w-auto object-contain rounded-xl"
                        />
                    </button>
                )}
                <button
                    onClick={() => {
                        const newState = !sidebarOpen
                        setSidebarOpen(newState)
                        if (onSidebarToggle) {
                            onSidebarToggle(newState)
                        }
                    }}
                    className="absolute right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* User Profile Section - Optional */}
            {/* <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                        </div>
                    )}
                </div>
            </div> */}

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {/* Search Navigation (only show if there are many items or sidebar is open) */}
                {sidebarOpen && sidebarMenuItems.length > 6 && (
                    <div className="mb-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={navSearchQuery}
                                onChange={(e) => setNavSearchQuery(e.target.value)}
                                placeholder="Search menu..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pl-8 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <svg className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {navSearchQuery && (
                                <button
                                    onClick={() => setNavSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}
                
                {filteredNavItems.length > 0 ? (
                    filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            <span className={`${item.active ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {item.icon}
                            </span>
                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                        </NavLink>
                    ))
                ) : (
                    sidebarOpen && (
                        <div className="px-3 py-2 text-xs text-slate-500">
                            No menu items found
                        </div>
                    )
                )}
            </nav>

            {/* Stats Section - Optional */}
            {showStats && sidebarOpen && (
                <div className="p-4 border-t border-slate-200 space-y-3">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3">
                        <p className="text-xs text-slate-600 mb-1">Total Categories</p>
                        <p className="text-2xl font-bold text-slate-900">{displayStats.totalCategories}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3">
                        <p className="text-xs text-slate-600 mb-1">Place Types</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {displayStats.placeTypes}
                        </p>
                    </div>
                </div>
            )}

            {/* Admin & Logout */}
            <div className="p-4 border-t border-slate-200 space-y-2">
                {user?.role === 'admin' && (
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {sidebarOpen && <span className="text-sm font-medium">Admin Panel</span>}
                    </button>
                )}
                <button
                    onClick={async () => {
                        try {
                            await dispatch(logout()).unwrap()
                            localStorage.removeItem('accessToken')
                            navigate('/login', { replace: true })
                        } catch (error) {
                            localStorage.removeItem('token')
                            localStorage.removeItem('accessToken')
                            navigate('/login', { replace: true })
                        }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    )
}

export default SidebarPage

