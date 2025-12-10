import React, { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'

const WordDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { categories: categoryList, loading, error } = useSelector((state) => state.categories)
    
    // Determine where to navigate back to based on where user came from
    const getBackPath = () => {
        // Check if we have state indicating where user came from
        if (location.state?.from === 'dashboard') {
            return '/dashboard'
        } else if (location.state?.from === 'word-translate') {
            return '/word-translate'
        }
        // Default: check referrer or default to word-translate
        return '/word-translate'
    }
    
    const handleBackClick = () => {
        navigate(getBackPath())
    }

    // Fetch categories if not already loaded
    useEffect(() => {
        if (categoryList.length === 0 && !loading) {
            dispatch(fetchCategories())
        }
    }, [dispatch, categoryList.length, loading])

    // Find the word by ID
    const category = categoryList.find(cat => cat._id === id)
    
    // Show loading state while fetching
    if (loading || (categoryList.length === 0 && !error)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
                    <p className="mt-4 text-slate-600">Loading word details...</p>
                </div>
            </div>
        )
    }
    
    // Show error state if fetch failed
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Error loading word</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={handleBackClick}
                        className="mt-4 rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-white cursor-pointer transition hover:bg-amber-600"
                    >
                        Back to {location.state?.from === 'dashboard' ? 'Dashboard' : 'Dictionary'}
                    </button>
                </div>
            </div>
        )
    }
    
    // Show not found only after categories are loaded
    if (!category) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Word not found</h2>
                    <button
                        onClick={handleBackClick}
                        className="mt-4 rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-white cursor-pointer transition hover:bg-amber-600"
                    >
                        Back to {location.state?.from === 'dashboard' ? 'Dashboard' : 'Dictionary'}
                    </button>
                </div>
            </div>
        )
    }

    // Transform category to word format
    const types = Array.isArray(category.type) 
        ? category.type 
        : (category.type ? [category.type] : ['general'])

    // Handle backward compatibility: if old 'example' field exists, use it for ex_english
    const ex_english = category.ex_english || (category.example || '')
    const ex_chinese = category.ex_chinese || ''
    const ex_chinese_pinyin = category.ex_chinese_pinyin || ''
    const ex_khmer = category.ex_khmer || ''

    const word = {
        id: category._id,
        english: String(category.englishName || ''),
        khmer: String(category.khmerName || ''),
        romanized: String(category.phonetic || ''),
        image: String(category.icon || '📝'),
        types: types.map(t => String(t).toLowerCase()),
        category: types[0]?.toLowerCase() || 'general',
        chinese: String(category.chineseName || ''),
        ex_english: String(ex_english),
        ex_chinese: String(ex_chinese),
        ex_chinese_pinyin: String(ex_chinese_pinyin),
        ex_khmer: String(ex_khmer),
        highlight_english: String(category.highlight_english || ''),
        highlight_chinese: String(category.highlight_chinese || ''),
        highlight_chinese_pinyin: String(category.highlight_chinese_pinyin || ''),
        highlight_khmer: String(category.highlight_khmer || ''),
        definition: String(category.definition || ''),
        usage: String(category.usage || ''),
        notes: String(category.notes || '')
    }

    // Function to add spaces between Chinese characters for better readability
    const addSpacesToChinese = (text) => {
        if (!text) return text
        // Add space after each Chinese character (including punctuation)
        return text.split('').join(' ')
    }

    // Helper function to detect if text contains Chinese characters
    const containsChinese = (text) => {
        return /[\u4e00-\u9fff]/.test(text)
    }

    // Helper function to detect if text contains Khmer characters
    const containsKhmer = (text) => {
        return /[\u1780-\u17ff]/.test(text)
    }

    // Helper function to detect if text is Pinyin (contains tone marks or romanized Chinese)
    const isPinyin = (text) => {
        // Pinyin typically contains: a-z, tone marks (ā, á, ǎ, à, etc.), and spaces
        return /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(text) || 
               (/^[a-z\s\.]+$/i.test(text) && !containsChinese(text) && !containsKhmer(text))
    }

    // Function to highlight the word in text (supports English, Chinese, Pinyin, and Khmer)
    const highlightWord = (text, wordToHighlight, language = 'auto') => {
        if (!text || !wordToHighlight) return text
        
        // Auto-detect language if not specified
        if (language === 'auto') {
            if (containsChinese(text)) {
                language = 'chinese'
            } else if (containsKhmer(text)) {
                language = 'khmer'
            } else if (isPinyin(text)) {
                language = 'pinyin'
            } else {
                language = 'english'
            }
        }

        let regex
        const escapedWord = wordToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        
        // Initialize matches array before switch (used in Pinyin case)
        const matches = []

        switch (language) {
            case 'chinese':
                // For Chinese: match the characters directly (no word boundaries)
                // Match the word even if it's part of a longer string
                // Handle both with and without spaces in the text
                const chineseWordNoSpaces = wordToHighlight.replace(/\s+/g, '')
                const escapedChineseWord = chineseWordNoSpaces.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                regex = new RegExp(escapedChineseWord, 'g')
                break
            
            case 'khmer':
                // For Khmer: strong automatic matching
                // Khmer text doesn't use spaces between words, so we need smart matching
                const khmerWord = wordToHighlight.trim()
                
                // Strategy 1: Direct character match (most common case)
                // Strategy 2: Match with optional spaces (in case user added spaces)
                const khmerWordNoSpaces = khmerWord.replace(/\s+/g, '')
                const escapedKhmerWord = khmerWordNoSpaces.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                
                // Try to match the word, accounting for possible spacing variations
                // Khmer words can appear with or without spaces in examples
                if (khmerWord.includes(' ')) {
                    // If word has spaces, match with flexible spacing
                    const spacedPattern = khmerWord.split(/\s+/).map(char => 
                        char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    ).join('\\s*')
                    regex = new RegExp(spacedPattern, 'g')
                } else {
                    // Direct match - Khmer doesn't use word boundaries like English
                    // Match the exact sequence of characters
                    regex = new RegExp(escapedKhmerWord, 'g')
                }
                break
            
            case 'pinyin':
                // For Pinyin: match syllables with spaces, handle tone marks
                const pinyinText = text.trim()
                const pinyinWord = wordToHighlight.trim()
                
                // Strategy 1: Try exact match first (case-insensitive, handles tone marks)
                const escapedPinyinWord = pinyinWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                const exactMatch = new RegExp(escapedPinyinWord, 'i')
                let match = exactMatch.exec(pinyinText)
                
                if (match) {
                    matches.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        text: match[0]
                    })
                } else {
                    // Strategy 2: Normalize and match (removes tone marks for comparison)
                    const normalizePinyin = (str) => {
                        if (!str) return ''
                        return str
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '') // Remove tone marks/diacritics
                            .toLowerCase()
                            .trim()
                    }
                    
                    // Split into syllables
                    const textSyllables = pinyinText.split(/\s+/)
                    const wordSyllables = pinyinWord.split(/\s+/)
                    
                    // Normalize syllables for matching
                    const normalizedTextSyllables = textSyllables.map(normalizePinyin)
                    const normalizedWordSyllables = wordSyllables.map(normalizePinyin)
                    const normalizedWordPattern = normalizedWordSyllables.join(' ')
                    
                    // Find where the word syllables appear in the text
                    let syllableStartIndex = -1
                    for (let i = 0; i <= normalizedTextSyllables.length - normalizedWordSyllables.length; i++) {
                        const slice = normalizedTextSyllables.slice(i, i + normalizedWordSyllables.length).join(' ')
                        if (slice === normalizedWordPattern) {
                            syllableStartIndex = i
                            break
                        }
                    }
                    
                    if (syllableStartIndex !== -1) {
                        // Get the matched syllables from original text (with tone marks)
                        const matchedSyllables = textSyllables.slice(syllableStartIndex, syllableStartIndex + wordSyllables.length)
                        const matchedText = matchedSyllables.join(' ')
                        
                        // Find exact character positions in original text
                        // Build a pattern to match: syllables with spaces between them
                        const pattern = matchedSyllables.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')
                        const matchRegex = new RegExp(pattern, 'i')
                        const normalizedMatch = matchRegex.exec(pinyinText)
                        
                        if (normalizedMatch) {
                            matches.push({
                                start: normalizedMatch.index,
                                end: normalizedMatch.index + normalizedMatch[0].length,
                                text: normalizedMatch[0]
                            })
                        } else {
                            // Fallback: calculate position manually
                            let charStart = 0
                            for (let i = 0; i < syllableStartIndex; i++) {
                                charStart += textSyllables[i].length + 1 // +1 for space
                            }
                            const charEnd = charStart + matchedText.length
                            
                            matches.push({
                                start: charStart,
                                end: charEnd,
                                text: matchedText
                            })
                        }
                    }
                }
                
                // Set regex to null to skip standard regex matching
                regex = null
                break
            
            case 'english':
            default:
                // For English: strong automatic matching with multiple strategies
                const englishWord = wordToHighlight.trim().toLowerCase()
                
                // Strategy 1: Try exact match with word boundaries (handles plurals, tenses)
                // Escape special regex characters
                const escapedEnglishWord = englishWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                
                if (englishWord.includes(' ')) {
                    // Multi-word phrase: match with flexible spacing
                    const phrasePattern = escapedEnglishWord.split(/\s+/).map(w => `\\b${w}\\b`).join('\\s+')
                    regex = new RegExp(phrasePattern, 'gi')
                } else {
                    // Single word: try multiple patterns for robustness
                    // Pattern 1: Exact word with boundaries
                    const exactPattern = `\\b${escapedEnglishWord}\\b`
                    
                    // Pattern 2: Handle common plural/singular variations
                    let pluralPattern = exactPattern
                    if (englishWord.endsWith('s')) {
                        // Try without 's' (singular form)
                        const singular = englishWord.slice(0, -1)
                        pluralPattern = `\\b(?:${escapedEnglishWord}|${singular.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`
                    } else {
                        // Try with 's' (plural form)
                        pluralPattern = `\\b(?:${escapedEnglishWord}|${escapedEnglishWord}s)\\b`
                    }
                    
                    // Use the more flexible pattern
                    regex = new RegExp(pluralPattern, 'gi')
                }
                break
        }
        
        // Find all matches with their positions (if not already populated by Pinyin case)
        // If regex is null (Pinyin case handled above), skip regex matching
        if (regex) {
            let match
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0]
                })
            }
        }
        
        // Fallback strategies if no matches found (for English, Pinyin, and Khmer to make it stronger)
        if (matches.length === 0) {
            if (language === 'pinyin') {
                // Fallback for Pinyin: try direct substring match (case-insensitive)
                const lowerText = text.toLowerCase()
                const lowerWord = wordToHighlight.trim().toLowerCase()
                let searchIndex = 0
                
                while ((searchIndex = lowerText.indexOf(lowerWord, searchIndex)) !== -1) {
                    // Check if it's at a word/syllable boundary (space or start/end)
                    const beforeChar = searchIndex > 0 ? text[searchIndex - 1] : ' '
                    const afterChar = searchIndex + lowerWord.length < text.length 
                        ? text[searchIndex + lowerWord.length] 
                        : ' '
                    
                    // Accept if surrounded by spaces or at start/end
                    if ((beforeChar === ' ' || searchIndex === 0) && (afterChar === ' ' || searchIndex + lowerWord.length === text.length)) {
                        matches.push({
                            start: searchIndex,
                            end: searchIndex + lowerWord.length,
                            text: text.substring(searchIndex, searchIndex + lowerWord.length)
                        })
                    }
                    
                    searchIndex += lowerWord.length
                }
            } else if (language === 'english') {
                // Fallback 1: Try case-insensitive substring match with word boundary detection
                const lowerText = text.toLowerCase()
                const lowerWord = wordToHighlight.trim().toLowerCase()
                let searchIndex = 0
                
                while ((searchIndex = lowerText.indexOf(lowerWord, searchIndex)) !== -1) {
                    // Check if it's at a word boundary
                    const beforeChar = searchIndex > 0 ? text[searchIndex - 1] : ' '
                    const afterChar = searchIndex + lowerWord.length < text.length 
                        ? text[searchIndex + lowerWord.length] 
                        : ' '
                    
                    // Accept if surrounded by non-word characters (word boundary)
                    if (!/[a-z0-9]/i.test(beforeChar) && !/[a-z0-9]/i.test(afterChar)) {
                        matches.push({
                            start: searchIndex,
                            end: searchIndex + lowerWord.length,
                            text: text.substring(searchIndex, searchIndex + lowerWord.length)
                        })
                    }
                    
                    searchIndex += lowerWord.length
                }
                
                // Fallback 2: If still no matches, try matching individual words in phrase
                if (matches.length === 0 && lowerWord.includes(' ')) {
                    const words = lowerWord.split(/\s+/)
                    let searchIndex = 0
                    const foundWords = []
                    
                    for (const word of words) {
                        const wordIndex = lowerText.indexOf(word, searchIndex)
                        if (wordIndex !== -1) {
                            // Check word boundaries
                            const beforeChar = wordIndex > 0 ? text[wordIndex - 1] : ' '
                            const afterChar = wordIndex + word.length < text.length 
                                ? text[wordIndex + word.length] 
                                : ' '
                            
                            if (!/[a-z0-9]/i.test(beforeChar) && !/[a-z0-9]/i.test(afterChar)) {
                                foundWords.push({
                                    start: wordIndex,
                                    end: wordIndex + word.length,
                                    text: text.substring(wordIndex, wordIndex + word.length)
                                })
                                searchIndex = wordIndex + word.length
                            } else {
                                break
                            }
                        } else {
                            break
                        }
                    }
                    
                    if (foundWords.length === words.length) {
                        matches.push(...foundWords)
                    }
                }
            } else if (language === 'khmer') {
                // Fallback for Khmer: try multiple strategies
                const khmerWord = wordToHighlight.trim()
                const khmerWordNoSpaces = khmerWord.replace(/\s+/g, '')
                
                // Strategy 1: Direct match
                let index = text.indexOf(khmerWord)
                if (index !== -1) {
                    matches.push({
                        start: index,
                        end: index + khmerWord.length,
                        text: text.substring(index, index + khmerWord.length)
                    })
                } else {
                    // Strategy 2: Match without spaces
                    const textNoSpaces = text.replace(/\s+/g, '')
                    const indexNoSpaces = textNoSpaces.indexOf(khmerWordNoSpaces)
                    
                    if (indexNoSpaces !== -1) {
                        // Map back to original text positions
                        let originalIndex = 0
                        let noSpaceIndex = 0
                        
                        for (let i = 0; i < text.length && noSpaceIndex < indexNoSpaces; i++) {
                            if (text[i] !== ' ') {
                                noSpaceIndex++
                            }
                            originalIndex = i + 1
                        }
                        
                        matches.push({
                            start: originalIndex,
                            end: originalIndex + khmerWordNoSpaces.length,
                            text: text.substring(originalIndex, originalIndex + khmerWordNoSpaces.length)
                        })
                    } else {
                        // Strategy 3: Case-insensitive match (if text has mixed case)
                        const lowerText = text.toLowerCase()
                        const lowerWord = khmerWord.toLowerCase()
                        const lowerIndex = lowerText.indexOf(lowerWord)
                        
                        if (lowerIndex !== -1) {
                            matches.push({
                                start: lowerIndex,
                                end: lowerIndex + khmerWord.length,
                                text: text.substring(lowerIndex, lowerIndex + khmerWord.length)
                            })
                        }
                    }
                }
            }
        }
        
        // If still no matches, return original text
        if (matches.length === 0) {
            return text
        }
        
        // Build highlighted text
        const result = []
        let lastIndex = 0
        
        matches.forEach((match, index) => {
            // Add text before match
            if (match.start > lastIndex) {
                result.push(
                    <span key={`text-${index}`}>{text.substring(lastIndex, match.start)}</span>
                )
            }
            
            // Add highlighted match
            result.push(
                <mark 
                    key={`highlight-${index}`} 
                    className="bg-amber-300 text-amber-900 font-semibold px-1.5 py-0.5 rounded shadow-sm"
                >
                    {match.text}
                </mark>
            )
            
            lastIndex = match.end
        })
        
        // Add remaining text after last match
        if (lastIndex < text.length) {
            result.push(
                <span key="text-end">{text.substring(lastIndex)}</span>
            )
        }
        
        return result
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={handleBackClick}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    {location.state?.from === 'dashboard' ? 'Back to Dashboard' : 'Back to Dictionary'}
                </button>

                {/* Word Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-white">
                        <h1 className="text-4xl font-bold">{word.english}</h1>
                        <p className="text-amber-100 mt-1">Detailed Information</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Image/Icon */}
                        <div className="flex justify-center">
                            <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden shadow-lg">
                                {word.image && (word.image.startsWith('data:image') || word.image.startsWith('/uploads/')) ? (
                                    <img
                                        src={word.image.startsWith('/uploads/') ? `http://localhost:5000${word.image}` : word.image}
                                        alt={word.english}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                            const fallback = e.target.parentElement.querySelector('.image-fallback')
                                            if (fallback) fallback.style.display = 'block'
                                        }}
                                    />
                                ) : (
                                    <span className="text-9xl">{word.image}</span>
                                )}
                                <span className="image-fallback text-9xl hidden">📝</span>
                            </div>
                        </div>

                        {/* Main Translation */}
                        <div className="text-center space-y-3 border-b border-slate-200 pb-8">
                            <h2 className="text-5xl font-bold text-slate-900">{word.khmer}</h2>
                            {word.romanized && (
                                <p className="text-2xl text-slate-600 font-medium">{word.romanized}</p>
                            )}
                            {word.chinese && (
                                <p className="text-3xl font-semibold text-emerald-600">{word.chinese}</p>
                            )}
                        </div>

                        {/* Type Badges */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {word.types.map((type, idx) => {
                                const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
                                return (
                                    <span
                                        key={idx}
                                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200"
                                    >
                                        {typeLabel}
                                    </span>
                                )
                            })}
                        </div>

                        {/* Example Sentences */}
                        {(word.ex_english || word.ex_chinese || word.ex_khmer) && (
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-4">
                                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">💡</span> Example Sentences
                                </h3>
                                
                                {/* English Example */}
                                {word.ex_english && (
                                    <div className="bg-white/60 rounded-xl p-4 border border-amber-300/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">English</span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed text-lg">
                                            {word.highlight_english 
                                                ? highlightWord(word.ex_english, word.highlight_english, 'english')
                                                : word.ex_english
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Chinese Example */}
                                {(word.ex_chinese || word.ex_chinese_pinyin) && (
                                    <div className="bg-white/60 rounded-xl p-4 border border-amber-300/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Chinese</span>
                                        </div>
                                        
                                        {/* Pinyin (on top) */}
                                        {word.ex_chinese_pinyin && (
                                            <div className="mb-3">
                                                <p className="text-slate-600 leading-relaxed text-base font-medium italic">
                                                    {word.highlight_chinese_pinyin 
                                                        ? highlightWord(word.ex_chinese_pinyin, word.highlight_chinese_pinyin, 'pinyin')
                                                        : word.ex_chinese_pinyin
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Chinese Characters (below, with spaces) */}
                                        {word.ex_chinese && (
                                            <div>
                                                <p className="text-slate-700 leading-relaxed text-xl font-medium tracking-wide">
                                                    {word.highlight_chinese 
                                                        ? (() => {
                                                            // Use the highlight_chinese field if provided
                                                            const highlightWordText = word.highlight_chinese.replace(/\s+/g, '')
                                                            const chineseExample = word.ex_chinese.replace(/\s+/g, '')
                                                            const wordIndex = chineseExample.indexOf(highlightWordText)
                                                            
                                                            if (wordIndex === -1) {
                                                                // Word not found, just add spaces
                                                                return addSpacesToChinese(word.ex_chinese)
                                                            }
                                                            
                                                            // Split into parts: before, word, after
                                                            const before = chineseExample.substring(0, wordIndex)
                                                            const matched = chineseExample.substring(wordIndex, wordIndex + highlightWordText.length)
                                                            const after = chineseExample.substring(wordIndex + highlightWordText.length)
                                                            
                                                            // Add spaces and highlight
                                                            return (
                                                                <>
                                                                    {before && <span>{addSpacesToChinese(before)}</span>}
                                                                    {before && <span> </span>}
                                                                    <mark className="bg-amber-300 text-amber-900 font-semibold px-1.5 py-0.5 rounded shadow-sm">
                                                                        {addSpacesToChinese(matched)}
                                                                    </mark>
                                                                    {after && <span> </span>}
                                                                    {after && <span>{addSpacesToChinese(after)}</span>}
                                                                </>
                                                            )
                                                        })()
                                                        : addSpacesToChinese(word.ex_chinese)
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Khmer Example */}
                                {word.ex_khmer && (
                                    <div className="bg-white/60 rounded-xl p-4 border border-amber-300/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Khmer</span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed text-lg">
                                            {word.highlight_khmer 
                                                ? highlightWord(word.ex_khmer, word.highlight_khmer, 'khmer')
                                                : word.ex_khmer
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Definition */}
                        {word.definition && (
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">📖</span> Definition / Explanation
                                </h3>
                                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                                    {highlightWord(word.definition, word.english)}
                                </p>
                            </div>
                        )}

                        {/* Usage */}
                        {word.usage && (
                            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                                <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">🔧</span> Usage / How to Use
                                </h3>
                                <p className="text-slate-700 leading-relaxed text-lg">
                                    {highlightWord(word.usage, word.english)}
                                </p>
                            </div>
                        )}

                        {/* Notes */}
                        {word.notes && (
                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                                <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">📝</span> Additional Notes
                                </h3>
                                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                                    {highlightWord(word.notes, word.english)}
                                </p>
                            </div>
                        )}

                        {/* Audio Button */}
                        <div className="pt-4">
                            <button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-lg font-semibold text-white cursor-pointer transition hover:from-amber-600 hover:to-orange-600 shadow-lg">
                                🔊 Play Audio Pronunciation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WordDetailPage

