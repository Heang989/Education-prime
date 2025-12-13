import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'
import { fetchLessonsByLevel } from '../../store/slices/lessonsSlice'
import { logout } from '../../store/slices/authSlice'
import CategoryCard from '../../components/category/CategoryCard'
import logoImage from '../../assets/image logo/6bea2fd6-9cc9-4f3a-9b66-d644e3e8aba0.jpg'

const DashboardPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [searchQuery, setSearchQuery] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [navSearchQuery, setNavSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState('categories') // 'categories' or 'lessons'
    const [selectedLevel, setSelectedLevel] = useState(1)
    const itemsPerPage = 12

    // Get categories and user from Redux store
    const { categories: categoryList, loading: isLoading, error } = useSelector(
        (state) => state.categories
    )
    const { lessons, loading: lessonsLoading } = useSelector((state) => state.lessons)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        // Fetch categories on component mount
        dispatch(fetchCategories())
        // Fetch lessons for level 1 by default
        dispatch(fetchLessonsByLevel(1))
    }, [dispatch])

    // Fetch lessons when level changes
    useEffect(() => {
        if (activeTab === 'lessons') {
            dispatch(fetchLessonsByLevel(selectedLevel))
        }
    }, [dispatch, selectedLevel, activeTab])

    // Get lessons for selected level
    const levelLessons = useMemo(() => {
        return lessons.filter(l => l.level === selectedLevel).sort((a, b) => a.lessonNumber - b.lessonNumber)
    }, [lessons, selectedLevel])

    // Sidebar menu items (defined early so it can be used in useMemo)
    const sidebarMenuItems = [
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
        }
    ]

    // Memoize filtered categories to prevent recalculation on every render
    const filteredCategories = useMemo(() => {
        return categoryList.filter(category =>
            category.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.khmerName.includes(searchQuery) ||
            category.phonetic.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [categoryList, searchQuery])

    // Filter navigation items based on search (for when there are many menu items)
    const filteredNavItems = useMemo(() => {
        if (!navSearchQuery) return sidebarMenuItems
        const query = navSearchQuery.toLowerCase()
        return sidebarMenuItems.filter(item => 
            item.label.toLowerCase().includes(query)
        )
    }, [navSearchQuery, sidebarMenuItems])

    // Pagination for categories
    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredCategories.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredCategories, currentPage])

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handleCategoryClick = (category) => {
        // Navigate to word detail page with state indicating we came from dashboard
        navigate(`/word/${category._id}`, { state: { from: 'dashboard' } })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-screen z-40`}>
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
                            {/* <span className="text-lg font-bold text-slate-900">Prime-Education</span> */}
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
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="absolute right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>

                {/* User Profile Section */}
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

                {/* Stats Section */}
                {sidebarOpen && (
                    <div className="p-4 border-t border-slate-200 space-y-3">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3">
                            <p className="text-xs text-slate-600 mb-1">Total Categories</p>
                            <p className="text-2xl font-bold text-slate-900">{categoryList.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3">
                            <p className="text-xs text-slate-600 mb-1">Place Types</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {categoryList.filter(c => c.type === 'place').length}
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

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 mb-4">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        {activeTab === 'categories' ? 'Learn Khmer Places' : 'Learn Chinese Lessons'}
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex justify-center gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`px-6 py-3 rounded-xl font-semibold transition ${
                                activeTab === 'categories'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Categories
                        </button>
                        <button
                            onClick={() => setActiveTab('lessons')}
                            className={`px-6 py-3 rounded-xl font-semibold transition ${
                                activeTab === 'lessons'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Lessons
                        </button>
                    </div>

                    {activeTab === 'categories' ? (
                        <>
                            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl mb-4">
                                Place Categories
                            </h1>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Explore common places in Khmer. Click on any card to learn more and hear the pronunciation.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl mb-4">
                                Lessons
                            </h1>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                                Select a level and choose a lesson to start learning.
                            </p>
                            
                            {/* Level Selector */}
                            <div className="flex justify-center gap-2 mb-8 flex-wrap">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            selectedLevel === level
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        Level {level}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Search Bar */}
                <div className="mb-8 mx-auto max-w-2xl">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search places in English or Khmer..."
                            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-lg ring-1 ring-black/5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 flex justify-center gap-6 text-sm">
                    {isLoading && categoryList.length === 0 ? (
                        // Loading skeleton for stats
                        <>
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md ring-1 ring-black/5 animate-pulse">
                                    <div className="h-5 w-12 rounded bg-slate-200"></div>
                                    <div className="h-5 w-20 rounded bg-slate-200"></div>
                                </div>
                            ))}
                        </>
                    ) : (
                        // Actual stats with fade-in
                        <>
                            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md ring-1 ring-black/5 animate-fade-in">
                                <span className="font-semibold text-slate-900 transition-all duration-300">{filteredCategories.length}</span>
                        <span className="text-slate-600">
                            {filteredCategories.length === 1 ? 'Category' : 'Categories'}
                        </span>
                    </div>
                            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md ring-1 ring-black/5 animate-fade-in">
                        <span className="font-semibold text-indigo-600">Places</span>
                        <span className="text-slate-600">Type</span>
                    </div>
                        </>
                    )}
                </div>

                {/* Error state */}
                {error && activeTab === 'categories' && (
                    <div className="mb-4 animate-fade-in rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                        {typeof error === 'string' ? error : 'Failed to load categories'}
                    </div>
                )}

                {/* Lessons Grid */}
                {activeTab === 'lessons' && (
                    <>
                        {lessonsLoading && levelLessons.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                <p className="mt-4 text-slate-600">Loading lessons...</p>
                            </div>
                        ) : levelLessons.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-600">No lessons available for Level {selectedLevel} yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {levelLessons.map((lesson) => (
                                    <div
                                        key={lesson._id}
                                        onClick={() => navigate(`/lesson/${lesson._id}`)}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100 group cursor-pointer"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                                    📚
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-indigo-600">0{lesson.lessonNumber}</div>
                                                    <div className="text-xs text-gray-500">Lesson</div>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2">{lesson.titleEnglish}</p>
                                            <p className="text-indigo-600 font-semibold mb-4">{lesson.subtitle}</p>
                                            <div className="text-xs text-gray-500">
                                                {lesson.vocabulary?.length || 0} vocabulary words
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Categories Grid */}
                {activeTab === 'categories' && isLoading && categoryList.length === 0 ? (
                    // Loading skeleton for category cards
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 animate-pulse"
                            >
                                {/* Background decoration skeleton */}
                                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-200 opacity-50 blur-2xl"></div>

                                {/* Type label skeleton */}
                                <div className="relative mb-4">
                                    <div className="h-6 w-20 rounded-full bg-slate-200"></div>
                                </div>

                                {/* Icon skeleton */}
                                <div className="relative mb-6 flex justify-center">
                                    <div className="h-24 w-24 rounded-2xl bg-slate-200"></div>
                                </div>

                                {/* Content skeleton */}
                                <div className="relative text-center space-y-3">
                                    <div className="h-6 w-32 mx-auto rounded bg-slate-200"></div>
                                    <div className="h-8 w-24 mx-auto rounded bg-slate-200"></div>
                                    <div className="h-5 w-28 mx-auto rounded bg-slate-200"></div>
                                    <div className="h-10 w-full rounded-xl bg-slate-200"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCategories.length > 0 ? (
                    <>
                        {/* Actual category cards with fade-in animation */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {paginatedCategories.map((category, index) => (
                                <div
                                    key={category._id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <CategoryCard
                                        category={category}
                                        onClick={handleCategoryClick}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls (only show if more than one page) */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = currentPage - 2 + i
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                    currentPage === pageNum
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Page Info */}
                        {totalPages > 1 && (
                            <div className="mt-4 text-center text-sm text-slate-600">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
                            </div>
                        )}
                    </>
                ) : (
                    // No results found
                    <div className="text-center py-12 animate-fade-in">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No categories found</h3>
                            <p className="text-slate-600">Try adjusting your search query</p>
                        </div>
                )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
