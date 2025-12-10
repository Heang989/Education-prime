import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'
import CategoryCard from '../../components/category/CategoryCard'
import SidebarPage from '../../components/sidebar/SidebarPage'

const DashboardPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const itemsPerPage = 12

    // Get categories from Redux store
    const { categories: categoryList, loading: isLoading, error } = useSelector(
        (state) => state.categories
    )

    useEffect(() => {
        // Fetch categories on component mount
        dispatch(fetchCategories())
    }, [dispatch])

    // Memoize filtered categories to prevent recalculation on every render
    const filteredCategories = useMemo(() => {
        return categoryList.filter(category =>
            category.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.khmerName.includes(searchQuery) ||
            category.phonetic.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [categoryList, searchQuery])

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
            {/* Sidebar Component */}
            <SidebarPage 
                showStats={true} 
                onSidebarToggle={setSidebarOpen}
            />

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
                        Learn Khmer Places
                      
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl mb-4">
                        Place Categories
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Explore common places in Khmer. Click on any card to learn more and hear the pronunciation.
                    </p>
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
                {error && (
                    <div className="mb-4 animate-fade-in rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                        {typeof error === 'string' ? error : 'Failed to load categories'}
                    </div>
                )}

                {/* Categories Grid */}
                {isLoading && categoryList.length === 0 ? (
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
