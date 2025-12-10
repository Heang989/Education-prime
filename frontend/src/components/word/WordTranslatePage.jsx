import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchCategories } from '../../store/slices/categoriesSlice'

// Color mapping for category types
const typeColorMap = {
    'place': 'indigo',
    'food': 'rose',
    'animal': 'amber',
    'family': 'purple',
    'color': 'cyan',
    'time': 'violet',
    'number': 'emerald',
    'language': 'pink',
    'general': 'slate'
}

const WordTranslatePage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [selectedType, setSelectedType] = useState(null) // Changed from selectedCategoryId to selectedType
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // grid or list

    // Get categories from Redux store
    const { categories: categoryList, loading: isLoading } = useSelector(
        (state) => state.categories
    )

    // Fetch categories on mount
    useEffect(() => {
        dispatch(fetchCategories())
    }, [dispatch])

    // Transform categories to vocabulary format - support multiple types per category
    const vocabularyDatabase = useMemo(() => {
        const grouped = {}
        
        // Ensure categoryList is an array
        if (!Array.isArray(categoryList) || categoryList.length === 0) {
            return {}
        }
        
        categoryList.forEach(category => {
            // Safety check - ensure category is an object
            if (!category || typeof category !== 'object') {
                return
            }
            
            // Handle type as array or single value (backward compatibility)
            const types = Array.isArray(category.type) 
                ? category.type 
                : (category.type ? [category.type] : ['general'])
            
            // Transform category to word format - ensure all fields are strings
            const word = {
                id: category._id || String(Math.random()),
                english: String(category.englishName || ''),
                khmer: String(category.khmerName || ''),
                romanized: String(category.phonetic || ''),
                image: String(category.icon || '📝'),
                types: types.map(t => String(t).toLowerCase()), // Store all types
                category: types[0]?.toLowerCase() || 'general', // Primary type for backward compatibility
                chinese: String(category.chineseName || ''),
                example: String(category.example || ''),
                definition: String(category.definition || ''),
                usage: String(category.usage || ''),
                notes: String(category.notes || ''),
                bgColor: category.bgColor || 'bg-orange-50' // Add bgColor for card decoration
            }
            
            // Only process if it has at least english name
            if (!word.english.trim()) {
                return
            }
            
            // Add word to each type group it belongs to
            types.forEach(type => {
                const typeKey = String(type).toLowerCase()
                
                if (!grouped[typeKey]) {
                    // Use first category's icon as the group icon, but only if it's an emoji
                    const iconValue = category.icon || '📝'
                    const isEmoji = iconValue && !iconValue.startsWith('data:image') && !iconValue.startsWith('/uploads/')
                    
                    grouped[typeKey] = {
                        name: typeKey.charAt(0).toUpperCase() + typeKey.slice(1),
                        emoji: isEmoji ? iconValue : '📝',
                        icon: iconValue, // Store original icon for image rendering
                        color: typeColorMap[typeKey] || 'slate',
                        words: []
                    }
                }
                
                // Add word to this type group
                grouped[typeKey].words.push(word)
            })
        })
        
        return grouped
    }, [categoryList])

    // Set first type as selected when categories load
    useEffect(() => {
        if (Object.keys(vocabularyDatabase).length > 0 && !selectedType) {
            const firstType = Object.keys(vocabularyDatabase)[0]
            setSelectedType(firstType)
        }
    }, [vocabularyDatabase, selectedType])

    // Get current type group
    const currentTypeGroup = selectedType
        ? vocabularyDatabase[selectedType]
        : null

    // All words from all categories (deduplicated by ID)
    const allWords = useMemo(() => {
        const wordsMap = new Map()
        Object.values(vocabularyDatabase).forEach(cat => {
            cat.words.forEach(word => {
                if (!wordsMap.has(word.id)) {
                    wordsMap.set(word.id, word)
                }
            })
        })
        return Array.from(wordsMap.values())
    }, [vocabularyDatabase])

    // Filter words based on search or selected type
    const filteredWords = useMemo(() => {
        if (searchQuery) {
            // When searching, show all matching words (deduplicated)
            const wordsMap = new Map()
            allWords.forEach(word => {
                if (
                    word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    word.khmer.includes(searchQuery) ||
                    word.romanized.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (word.chinese && word.chinese.toLowerCase().includes(searchQuery.toLowerCase()))
                ) {
                    if (!wordsMap.has(word.id)) {
                        wordsMap.set(word.id, word)
                    }
                }
            })
            return Array.from(wordsMap.values())
        }
        
        // When filtering by type, show all words that have this type
        if (selectedType) {
            const wordsMap = new Map()
            allWords.forEach(word => {
                const wordTypes = word.types || (word.category ? [word.category] : ['general'])
                if (wordTypes.some(t => String(t).toLowerCase() === selectedType)) {
                    if (!wordsMap.has(word.id)) {
                        wordsMap.set(word.id, word)
                    }
                }
            })
            return Array.from(wordsMap.values())
        }
        
        return []
    }, [searchQuery, allWords, selectedType])

    const totalWords = allWords.length

    const handleWordClick = (word) => {
        // Navigate to detail page with state indicating we came from word-translate
        navigate(`/word/${word.id}`, { state: { from: 'word-translate' } })
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="px-3 text-center sm:px-6 lg:px-0">
                <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
                    Visual Vocabulary
                </p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">
                    Khmer Word Dictionary
                </h1>
                <p className="mt-2 text-base text-slate-500">
                    Browse {totalWords} words with images and translations. Learn visually!
                </p>
            </div>

            {/* Search & Filters */}
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search words in English, Khmer, or romanized..."
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pl-12 text-sm placeholder:text-slate-400 cursor-text focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition ${viewMode === 'grid'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Grid View
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition ${viewMode === 'list'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            List View
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                {!searchQuery && !isLoading && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {Object.entries(vocabularyDatabase).map(([key, category]) => {
                            const isSelected = selectedType === key
                            
                            // Get the icon from category group or first category in this group
                            const iconValue = category.icon || category.emoji || '📝'
                            const isImageIcon = iconValue && (iconValue.startsWith('data:image') || iconValue.startsWith('/uploads/'))
                            
                            // Count unique words that have this type
                            const uniqueWordsCount = new Set(
                                allWords
                                    .filter(word => {
                                        const wordTypes = word.types || (word.category ? [word.category] : ['general'])
                                        return wordTypes.some(t => String(t).toLowerCase() === key)
                                    })
                                    .map(word => word.id)
                            ).size
                            
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedType(key)}
                                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold cursor-pointer transition ${
                                        isSelected
                                            ? `border-${category.color}-500 bg-${category.color}-50 text-${category.color}-600`
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    {/* Icon/Image */}
                                    {isImageIcon ? (
                                        <img
                                            src={iconValue.startsWith('/uploads/') ? `http://localhost:5000${iconValue}` : iconValue}
                                            alt={category.name}
                                            className="h-5 w-5 object-cover rounded"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                                const fallback = e.target.parentElement.querySelector('.icon-fallback')
                                                if (fallback) fallback.style.display = 'inline'
                                            }}
                                        />
                                    ) : null}
                                    <span className={`text-lg ${isImageIcon ? 'hidden icon-fallback' : ''}`}>
                                        {isImageIcon ? '📝' : iconValue}
                                    </span>
                                    <span>{category.name}</span>
                                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
                                        {uniqueWordsCount}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
                
                {/* Loading state */}
                {isLoading && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-32 rounded-full bg-slate-200 animate-pulse"></div>
                        ))}
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                    {searchQuery ? (
                        <>
                            Found <span className="font-semibold text-slate-900">{filteredWords.length}</span> words
                            matching "{searchQuery}"
                        </>
                    ) : (
                        <>
                            Showing <span className="font-semibold text-slate-900">{filteredWords.length}</span> words
                            {currentTypeGroup && ` in ${currentTypeGroup.name}`}
                        </>
                    )}
                </p>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-sm font-semibold text-amber-600 hover:text-amber-500 cursor-pointer"
                    >
                        Clear search
                    </button>
                )}
            </div>

            {/* Word Cards - Grid View */}
            {viewMode === 'grid' && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredWords.map((word) => {
                        // Safety check - ensure word is an object with required properties
                        if (!word || typeof word !== 'object') {
                            return null
                        }
                        
                        const english = word.english || ''
                        const khmer = word.khmer || ''
                        const romanized = word.romanized || ''
                        const image = word.image || '📝'
                        const types = word.types || (word.category ? [word.category] : ['general'])
                        const category = word.category || 'general'
                        const chinese = word.chinese || ''
                        
                        const bgColor = word.bgColor || 'bg-orange-50'
                        
                        return (
                            <div
                                key={word.id || Math.random()}
                                onClick={() => handleWordClick(word)}
                                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:ring-indigo-500/50 cursor-pointer"
                            >
                                {/* Background decoration */}
                                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${bgColor} opacity-50 blur-2xl transition-all duration-300 group-hover:scale-150`}></div>

                                {/* Type labels - support multiple types */}
                                <div className="relative mb-4 flex flex-wrap gap-1.5">
                                    {types.slice(0, 3).map((type, idx) => {
                                        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
                                        return (
                                            <span 
                                                key={idx}
                                                className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 break-words leading-tight max-w-[200px]"
                                                title={typeLabel}
                                            >
                                                <span className="block line-clamp-2">{typeLabel}</span>
                                            </span>
                                        )
                                    })}
                                    {types.length > 3 && (
                                        <span 
                                            className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                            title={`+${types.length - 3} more`}
                                        >
                                            +{types.length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Icon */}
                                <div className="relative mb-6 flex justify-center">
                                    <div className={`flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden ${image && (image.startsWith('data:image') || image.startsWith('/uploads/')) ? 'bg-white/5' : bgColor} ${image && (image.startsWith('data:image') || image.startsWith('/uploads/')) ? '' : 'text-5xl'} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                                        {image && (image.startsWith('data:image') || image.startsWith('/uploads/')) ? (
                                            <img
                                                src={image.startsWith('/uploads/') ? `http://localhost:5000${image}` : image}
                                                alt={english}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null
                                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="50%" x="50%" text-anchor="middle" font-size="48">📝</text></svg>'
                                                }}
                                            />
                                        ) : (
                                            <span>{image || '📝'}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative text-center">
                                    {/* English Name */}
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {english}
                                    </h3>

                                    {/* Khmer Name */}
                                    <p className="text-2xl font-bold text-slate-800 mb-1">
                                        {khmer}
                                    </p>

                                    {/* Chinese Name (optional) */}
                                    {chinese && (
                                        <p className="text-xl font-semibold text-emerald-700 mb-1">
                                            {chinese}
                                        </p>
                                    )}

                                    {/* Phonetic */}
                                    {romanized && (
                                        <p className="text-sm text-slate-500 mb-4">
                                            {romanized}
                                        </p>
                                    )}

                                    {/* Play Audio Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            // Handle audio play
                                        }}
                                        className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-orange-500/30"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                            </svg>
                                            Play Audio
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Word Cards - List View */}
            {viewMode === 'list' && (
                <div className="space-y-3">
                    {filteredWords.map((word) => {
                        // Safety check - ensure word is an object with required properties
                        if (!word || typeof word !== 'object') {
                            return null
                        }
                        
                        const english = word.english || ''
                        const khmer = word.khmer || ''
                        const romanized = word.romanized || ''
                        const image = word.image || '📝'
                        const types = word.types || (word.category ? [word.category] : ['general'])
                        const category = word.category || 'general'
                        const chinese = word.chinese || ''
                        
                        return (
                            <div
                                key={word.id || Math.random()}
                                onClick={() => handleWordClick(word)}
                                className="flex items-center gap-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:shadow-xl cursor-pointer"
                            >
                            {/* Image */}
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden relative">
                                {image && (image.startsWith('data:image') || image.startsWith('/uploads/')) ? (
                                    <>
                                        <img
                                            src={image.startsWith('/uploads/') ? `http://localhost:5000${image}` : image}
                                            alt={english}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                                const fallback = e.target.parentElement.querySelector('.image-fallback')
                                                if (fallback) fallback.style.display = 'block'
                                            }}
                                        />
                                        <span className="image-fallback text-4xl hidden">📝</span>
                                    </>
                                ) : (
                                    <span className="text-4xl">{image}</span>
                                )}
                            </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-lg font-bold text-slate-900">{english}</h3>
                                        {/* Type Badges */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {types.map((type, idx) => {
                                                const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
                                                return (
                                                    <span 
                                                        key={idx}
                                                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200 break-words leading-tight max-w-[150px]"
                                                        title={typeLabel}
                                                    >
                                                        <span className="block line-clamp-2">{typeLabel}</span>
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-4">
                                        <p className="text-2xl font-bold text-slate-900">{khmer}</p>
                                        {romanized && (
                                            <p className="text-sm text-slate-600">{romanized}</p>
                                        )}
                                        {chinese && (
                                            <p className="text-sm text-emerald-600 font-medium">({chinese})</p>
                                        )}
                                    </div>
                                </div>

                            {/* Audio Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // Handle audio play
                                }}
                                className="flex-shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer transition hover:from-amber-600 hover:to-orange-600"
                            >
                                🔊 Play
                            </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* No Results */}
            {filteredWords.length === 0 && (
                <div className="rounded-3xl bg-white p-12 text-center shadow-xl ring-1 ring-black/5">
                    <span className="text-6xl">🔍</span>
                    <h3 className="mt-4 text-xl font-bold text-slate-900">No words found</h3>
                    <p className="mt-2 text-slate-600">
                        Try searching with different keywords or browse categories above.
                    </p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-6 rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-white cursor-pointer transition hover:bg-amber-600"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {/* Stats Footer */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 ring-1 ring-amber-100">
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">{totalWords}</p>
                        <p className="mt-1 text-sm text-slate-600">Total Words</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">
                            {Object.keys(vocabularyDatabase).length}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Categories</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">
                            {new Set(categoryList.map(cat => cat.type || 'general')).size}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Types</p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default WordTranslatePage
