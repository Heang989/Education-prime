import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categoriesSlice'
import { fetchTeachers } from '../../store/slices/teachersSlice'
import CategoryForm from '../../components/admin/CategoryForm'
import UserManagement from '../../components/admin/UserManagement'
import TeacherManagement from '../../components/admin/TeacherManagement'
import LevelManagement from '../../components/admin/LevelManagement'

const AdminDashboard = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [activeTab, setActiveTab] = useState('categories') // 'categories', 'users', 'teachers', or 'levels'
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLevel, setSelectedLevel] = useState(null)

    // Get categories and teachers from Redux store
    const { categories: categoryList, loading: isLoading, error } = useSelector(
        (state) => state.categories
    )
    const { teachers } = useSelector((state) => state.teachers)

    // Load categories and teachers from API on mount
    useEffect(() => {
        dispatch(fetchCategories())
        dispatch(fetchTeachers())
    }, [dispatch])

    const handleSaveCategory = async (categoryData) => {
        try {
            if (editingCategory) {
                // Update existing category
                await dispatch(updateCategory({
                    id: editingCategory._id,
                    categoryData
                })).unwrap()
            } else {
                // Create new category
                await dispatch(createCategory(categoryData)).unwrap()
            }

            setIsFormOpen(false)
            setEditingCategory(null)
        } catch (err) {
            console.error('Failed to save category:', err)
            // Error is handled by Redux state
        }
    }

    const handleEditCategory = (category) => {
        setEditingCategory(category)
        setIsFormOpen(true)
    }

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return
        }

        try {
            await dispatch(deleteCategory(categoryId)).unwrap()
        } catch (err) {
            console.error('Failed to delete category:', err)
            // Error is handled by Redux state
        }
    }

    const handleCancelForm = () => {
        setIsFormOpen(false)
        setEditingCategory(null)
    }

    // Filter categories based on search query
    const filteredCategories = categoryList.filter(category => {
        if (!searchQuery.trim()) return true
        
        const query = searchQuery.toLowerCase()
        const englishName = (category.englishName || '').toLowerCase()
        const khmerName = (category.khmerName || '').toLowerCase()
        const phonetic = (category.phonetic || '').toLowerCase()
        const chineseName = (category.chineseName || '').toLowerCase()
        
        // Check if search matches English name, Khmer name, phonetic, or Chinese name
        if (englishName.includes(query) || 
            khmerName.includes(query) || 
            phonetic.includes(query) ||
            chineseName.includes(query)) {
            return true
        }
        
        // Check if search matches any type
        if (category.type) {
            const types = Array.isArray(category.type) ? category.type : [category.type]
            const typeMatch = types.some(type => {
                const typeStr = typeof type === 'object' 
                    ? (type.label || type.value || JSON.stringify(type))
                    : String(type)
                return typeStr.toLowerCase().includes(query)
            })
            if (typeMatch) return true
        }
        
        return false
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-400">
                        Manage categories and user accounts
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-6 py-3 text-sm font-semibold transition ${
                            activeTab === 'categories'
                                ? 'border-b-2 border-indigo-500 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 text-sm font-semibold transition ${
                            activeTab === 'users'
                                ? 'border-b-2 border-emerald-500 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`px-6 py-3 text-sm font-semibold transition ${
                            activeTab === 'teachers'
                                ? 'border-b-2 border-violet-500 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Teachers
                    </button>
                    <button
                        onClick={() => setActiveTab('levels')}
                        className={`px-6 py-3 text-sm font-semibold transition ${
                            activeTab === 'levels'
                                ? 'border-b-2 border-amber-500 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Levels
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'users' ? (
                    <UserManagement />
                ) : activeTab === 'teachers' ? (
                    <TeacherManagement />
                ) : activeTab === 'levels' ? (
                    selectedLevel ? (
                        <LevelManagement level={selectedLevel} onBack={() => setSelectedLevel(null)} />
                    ) : (
                        <div className="space-y-6">
                            {/* Levels Header */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Level Management</h2>
                                <p className="text-slate-400">Manage lessons and content for each level (1-8)</p>
                            </div>

                            {/* Levels Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                                    <div
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <span className="text-4xl font-bold text-amber-400">L{level}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Level {level}</h3>
                                            <div className="space-y-2 text-sm text-slate-400">
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <span>6 Lessons</span>
                                                </div>
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Vocabulary</span>
                                                </div>
                                            </div>
                                            <button className="mt-4 w-full rounded-xl bg-amber-600/20 px-4 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-600/30 transition">
                                                Manage Level {level}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Level Details Section */}
                            <div className="mt-8 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
                                <h3 className="text-xl font-bold text-white mb-4">Level Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="rounded-xl bg-white/5 p-4">
                                        <div className="text-sm text-slate-400 mb-1">Total Levels</div>
                                        <div className="text-2xl font-bold text-white">8</div>
                                    </div>
                                    <div className="rounded-xl bg-white/5 p-4">
                                        <div className="text-sm text-slate-400 mb-1">Total Lessons</div>
                                        <div className="text-2xl font-bold text-white">48</div>
                                    </div>
                                    <div className="rounded-xl bg-white/5 p-4">
                                        <div className="text-sm text-slate-400 mb-1">Active Teachers</div>
                                        <div className="text-2xl font-bold text-white">
                                            {teachers?.length || 0}
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-white/5 p-4">
                                        <div className="text-sm text-slate-400 mb-1">Status</div>
                                        <div className="text-2xl font-bold text-emerald-400">Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        {/* Categories Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Category Management</h2>
                                <p className="text-slate-400">Manage place categories and their content</p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Category
                            </button>
                        </div>

                        {/* Error state */}
                        {error && (
                            <div className="mb-4 animate-fade-in rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                                {typeof error === 'string' ? error : 'An error occurred'}
                            </div>
                        )}

                {/* Stats */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {isLoading && categoryList.length === 0 ? (
                        // Loading skeleton for stats
                        <>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white/10"></div>
                                        <div className="flex-1">
                                            <div className="h-4 w-24 mb-2 rounded bg-white/10"></div>
                                            <div className="h-8 w-12 rounded bg-white/10"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        // Actual stats
                        <>
                            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur animate-fade-in">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Total Categories</p>
                                        <p className="text-2xl font-bold text-white transition-all duration-300">{categoryList.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur animate-fade-in">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Place Type</p>
                                        <p className="text-2xl font-bold text-white transition-all duration-300">{categoryList.filter(c => c.type === 'place').length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur animate-fade-in">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Status</p>
                                        <p className="text-2xl font-bold text-white">Active</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                        {/* Category List */}
                        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-xl font-bold text-white">All Categories</h2>
                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                                <span>Loading...</span>
                            </div>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search categories by name, Khmer, phonetic, Chinese, or type..."
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-12 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                            />
                            <svg
                                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="mt-2 text-sm text-slate-400">
                                Found <span className="font-semibold text-white">{filteredCategories.length}</span> {filteredCategories.length === 1 ? 'category' : 'categories'} matching "{searchQuery}"
                            </p>
                        )}
                    </div>

                    {isLoading && categoryList.length === 0 ? (
                        // Loading skeleton for categories
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-xl bg-white/5 p-4 ring-1 ring-white/10 animate-pulse"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-xl bg-white/10"></div>
                                        <div className="flex-1">
                                            <div className="h-5 w-32 mb-2 rounded bg-white/10"></div>
                                            <div className="h-4 w-48 rounded bg-white/10"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-16 rounded-full bg-white/10"></div>
                                        <div className="h-9 w-9 rounded-lg bg-white/10"></div>
                                        <div className="h-9 w-9 rounded-lg bg-white/10"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCategories.length > 0 ? (
                        // Actual categories with fade-in animation
                        <div className="space-y-4">
                            {filteredCategories.map((category, index) => (
                                <div
                                    key={category._id}
                                    className="flex items-center justify-between rounded-xl bg-white/5 p-4 ring-1 ring-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-[1.01] animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden transition-transform duration-300 hover:scale-110 ${category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('/uploads/')) ? 'bg-white/5' : category.bgColor} ${category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('/uploads/')) ? '' : 'text-2xl'}`}>
                                            {category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('/uploads/')) ? (
                                                <img
                                                    src={category.icon.startsWith('/uploads/') ? `http://localhost:5000${category.icon}` : category.icon}
                                                    alt={category.englishName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                category.icon
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{category.englishName}</h3>
                                            <p className="text-sm text-slate-400">
                                                {category.khmerName} ({category.phonetic})
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {Array.isArray(category.type) ? (
                                            category.type.map((typeObj, idx) => {
                                                // If type is an object with value/label, show label, else show as string
                                                const label = (typeObj && typeof typeObj === "object")
                                                    ? (typeObj.label || typeObj.value || JSON.stringify(typeObj))
                                                    : String(typeObj)
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 mr-1"
                                                    >
                                                        {label}
                                                    </span>
                                                )
                                            })
                                        ) : (
                                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                                                {category.type && typeof category.type === "object"
                                                    ? category.type.label || category.type.value || JSON.stringify(category.type)
                                                    : String(category.type)}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleEditCategory(category)}
                                            className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400 transition-all duration-200 hover:bg-indigo-500/30 hover:scale-110"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category._id)}
                                            className="rounded-lg bg-rose-500/20 p-2 text-rose-400 transition-all duration-200 hover:bg-rose-500/30 hover:scale-110"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="py-12 text-center animate-fade-in">
                            <p className="text-slate-400">No categories found matching "{searchQuery}"</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="py-12 text-center animate-fade-in">
                            <p className="text-slate-400">No categories yet. Add your first category!</p>
                        </div>
                    )}
                        </div>
                    </>
                )}
            </div>

            {/* Category Form Modal */}
            {isFormOpen && (
                <CategoryForm
                    category={editingCategory}
                    onSave={handleSaveCategory}
                    onCancel={handleCancelForm}
                />
            )}
        </div>
    )
}

export default AdminDashboard
