import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'
import { fetchLessonById } from '../../store/slices/lessonsSlice'
// PDF libraries will be imported dynamically to avoid build issues

const LessonDetailPage = () => {
    const { teacherId, lessonId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { categories: categoryList } = useSelector((state) => state.categories)
    const { currentLesson, loading: lessonLoading, error: lessonError } = useSelector((state) => state.lessons)

    const [vocabulary, setVocabulary] = useState([])
    const [selectedImage, setSelectedImage] = useState(null)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const lessonContentRef = useRef(null)

    // Fetch lesson and categories on mount
    useEffect(() => {
        if (lessonId) {
            // Clean and validate lessonId
            const cleanId = lessonId.trim()
            // Only fetch if it looks like a valid MongoDB ObjectId
            if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
                dispatch(fetchLessonById(cleanId))
            } else {
                console.error('Invalid lesson ID format:', lessonId)
            }
        }
        if (categoryList.length === 0) {
            dispatch(fetchCategories())
        }
    }, [dispatch, lessonId, categoryList.length])

    // Update vocabulary when lesson loads
    useEffect(() => {
        if (currentLesson && currentLesson.vocabulary) {
            setVocabulary(currentLesson.vocabulary)
        }
    }, [currentLesson])

    // Match vocabulary with categories from database
    useEffect(() => {
        if (categoryList.length > 0 && vocabulary.length > 0) {
            const updatedVocabulary = vocabulary.map(vocab => {
                // If already has categoryId, try to match
                if (vocab.categoryId) {
                    const match = categoryList.find(cat => cat._id === vocab.categoryId)
                    if (match && match.icon) {
                        return {
                            ...vocab,
                            english: vocab.english || match.englishName,
                            khmer: vocab.khmer || match.khmerName,
                            phonetic: vocab.phonetic || vocab.pinyin || match.phonetic,
                            categoryIcon: match.icon
                        }
                    }
                }
                
                // Try to find matching category by Chinese name
                let match = categoryList.find(cat => 
                    cat.chineseName && cat.chineseName.trim().toLowerCase() === vocab.chinese.trim().toLowerCase()
                )
                
                // If no match by Chinese name, try by English name
                if (!match && vocab.english) {
                    match = categoryList.find(cat => 
                        cat.englishName && cat.englishName.trim().toLowerCase() === vocab.english.trim().toLowerCase()
                    )
                }
                
                // If still no match, try by phonetic/pinyin
                if (!match && (vocab.pinyin || vocab.phonetic)) {
                    match = categoryList.find(cat => 
                        cat.phonetic && cat.phonetic.trim().toLowerCase() === (vocab.pinyin || vocab.phonetic).trim().toLowerCase()
                    )
                }
                
                if (match && match.icon) {
                    return {
                        ...vocab,
                        english: vocab.english || match.englishName,
                        khmer: vocab.khmer || match.khmerName,
                        phonetic: vocab.phonetic || vocab.pinyin || match.phonetic,
                        categoryId: match._id,
                        categoryIcon: match.icon
                    }
                }
                return vocab
            })
            
            // Only update if there are actual changes
            const hasUpdates = updatedVocabulary.some((vocab, idx) => {
                const original = vocabulary[idx]
                if (!original) return false
                return vocab.english !== original.english || 
                       vocab.khmer !== original.khmer || 
                       vocab.phonetic !== original.phonetic ||
                       vocab.categoryId !== original.categoryId ||
                       vocab.categoryIcon !== original.categoryIcon
            })
            
            if (hasUpdates) {
                setVocabulary(updatedVocabulary)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryList])

    // Function to download lesson as PDF
    const handleDownloadPDF = async () => {
        if (!currentLesson || !lessonContentRef.current) return
        
        setIsGeneratingPDF(true)
        try {
            // Dynamic import to handle module resolution
            const [{ default: jsPDF }, html2canvas] = await Promise.all([
                import('jspdf'),
                import('html2canvas')
            ])
            
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm
            const margin = 10
            const availableWidth = pdfWidth - (margin * 2)
            
            // Create a temporary style element to override oklch colors
            const tempStyle = document.createElement('style')
            tempStyle.id = 'pdf-oklch-override'
            tempStyle.textContent = `
                * {
                    color: rgb(0, 0, 0) !important;
                    background-color: rgb(255, 255, 255) !important;
                    border-color: rgb(199, 210, 254) !important;
                }
                .text-gray-900, .text-gray-700, .text-gray-600, .text-gray-500, .text-gray-400 {
                    color: rgb(17, 24, 39) !important;
                }
                .text-indigo-600, .text-indigo-400 {
                    color: rgb(99, 102, 241) !important;
                }
                .bg-indigo-50 {
                    background-color: rgb(238, 242, 255) !important;
                }
                .bg-white {
                    background-color: rgb(255, 255, 255) !important;
                }
                .border-indigo-200 {
                    border-color: rgb(199, 210, 254) !important;
                }
                .border-gray-200 {
                    border-color: rgb(229, 231, 235) !important;
                }
            `
            document.head.appendChild(tempStyle)
            
            try {
                // Split vocabulary into chunks of 10 words per page
                const WORDS_PER_PAGE = 10
                const totalPages = Math.ceil(vocabulary.length / WORDS_PER_PAGE)
                
                console.log(`Generating PDF with ${totalPages} page(s) for ${vocabulary.length} words`)
                
                for (let pageNum = 0; pageNum < totalPages; pageNum++) {
                    console.log(`Processing page ${pageNum + 1} of ${totalPages}`)
                    const startIdx = pageNum * WORDS_PER_PAGE
                    const endIdx = Math.min(startIdx + WORDS_PER_PAGE, vocabulary.length)
                    const pageVocabulary = vocabulary.slice(startIdx, endIdx)
                    
                    // Create a temporary container for this page
                    const pageContainer = document.createElement('div')
                    pageContainer.style.cssText = `
                        position: absolute;
                        left: -9999px;
                        width: ${availableWidth * 3.7795275591}px;
                        padding: 2rem;
                        background: white;
                        min-height: ${pdfHeight * 3.7795275591}px;
                    `
                    pageContainer.style.position = 'relative'
                    
                    // Build the page content - show header only on first page
                    const headerSection = pageNum === 0 ? `
                        <div style="margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid rgb(199, 210, 254);">
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <h1 style="font-size: 3rem; font-weight: bold; color: rgb(17, 24, 39); margin-bottom: 0.5rem; word-break: break-word; overflow-wrap: break-word;">
                                    ${currentLesson.title}
                                </h1>
                                <p style="font-size: 1.25rem; color: rgb(75, 85, 99); word-break: break-word; overflow-wrap: break-word;">${currentLesson.titleEnglish}</p>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                                <h2 style="font-size: 2.25rem; font-weight: bold; color: rgb(99, 102, 241); word-break: break-word; overflow-wrap: break-word;">
                                    ${currentLesson.subtitle}
                                </h2>
                                <span style="font-size: 1.25rem; color: rgb(107, 114, 128); word-break: break-word; overflow-wrap: break-word;">(${currentLesson.subtitleEnglish})</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 2rem;">
                            <h3 style="font-size: 1.5rem; font-weight: bold; color: rgb(17, 24, 39); margin-bottom: 1.5rem;">
                                <span style="color: rgb(99, 102, 241);">生词</span>
                                <span style="font-size: 1.125rem; font-weight: normal; color: rgb(75, 85, 99);"> (Vocabulary)</span>
                            </h3>
                    ` : ''
                    
                    pageContainer.innerHTML = `
                        ${headerSection}
                        <div style="margin-bottom: 2rem;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background-color: rgb(238, 242, 255); border-bottom: 2px solid rgb(199, 210, 254);">
                                        <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; font-weight: bold; color: rgb(55, 65, 81); border-right: 1px solid rgb(199, 210, 254);">#</th>
                                        <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; font-weight: bold; color: rgb(55, 65, 81); border-right: 1px solid rgb(199, 210, 254);">中文</th>
                                        <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; font-weight: bold; color: rgb(55, 65, 81); border-right: 1px solid rgb(199, 210, 254);">拼音</th>
                                        <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; font-weight: bold; color: rgb(55, 65, 81); border-right: 1px solid rgb(199, 210, 254);">English</th>
                                        <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; font-weight: bold; color: rgb(55, 65, 81); border-right: 1px solid rgb(199, 210, 254);">ខ្មែរ</th>
                                        <th style="padding: 0.75rem 1rem; text-align: center; font-size: 0.875rem; font-weight: bold; color: rgb(55, 65, 81);">Image</th>
                                    </tr>
                                </thead>
                                <tbody id="vocab-tbody-${pageNum}">
                                </tbody>
                            </table>
                        </div>
                        <div style="position: absolute; bottom: 0; right: 0; font-size: 0.875rem; color: rgb(107, 114, 128); padding: 0.5rem;">
                            Page ${pageNum + 1} of ${totalPages}
                        </div>
                    `
                    
                    document.body.appendChild(pageContainer)
                    
                    // Add vocabulary rows with images
                    const tbody = pageContainer.querySelector(`#vocab-tbody-${pageNum}`)
                    for (let i = 0; i < pageVocabulary.length; i++) {
                        const word = pageVocabulary[i]
                        const globalIndex = startIdx + i
                        const tr = document.createElement('tr')
                        tr.style.cssText = 'border-bottom: 1px solid rgb(229, 231, 235);'
                        
                        const getImageUrl = (icon) => {
                            if (!icon) return null
                            if (icon.startsWith('/uploads/')) {
                                return `http://localhost:5000${icon}`
                            }
                            if (icon.startsWith('data:image')) {
                                return icon
                            }
                            return null
                        }
                        
                        const imageUrl = getImageUrl(word.categoryIcon)
                        const isImage = imageUrl !== null
                        
                        let imageContent = '<span style="color: rgb(156, 163, 175);">-</span>'
                        if (isImage) {
                            imageContent = `<img src="${imageUrl}" crossorigin="anonymous" style="height: 48px; width: 48px; object-fit: cover; border-radius: 0.5rem; border: 2px solid rgb(199, 210, 254); display: inline-block;" />`
                        } else if (word.categoryIcon) {
                            imageContent = `<span style="font-size: 1.5rem;">${word.categoryIcon}</span>`
                        }
                        
                        tr.innerHTML = `
                            <td style="padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; color: rgb(75, 85, 99); border-right: 1px solid rgb(229, 231, 235);">${globalIndex + 1}</td>
                            <td style="padding: 0.75rem 1rem; font-size: 1.125rem; font-weight: bold; color: rgb(17, 24, 39); border-right: 1px solid rgb(229, 231, 235);">${word.chinese}</td>
                            <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: rgb(55, 65, 81); border-right: 1px solid rgb(229, 231, 235);">${word.pinyin || word.phonetic || '-'}</td>
                            <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: rgb(55, 65, 81); border-right: 1px solid rgb(229, 231, 235);">${word.english}</td>
                            <td style="padding: 0.75rem 1rem; font-size: 0.875rem; color: rgb(55, 65, 81); border-right: 1px solid rgb(229, 231, 235);">${word.khmer || '-'}</td>
                            <td style="padding: 0.75rem 1rem; text-align: center;">${imageContent}</td>
                        `
                        tbody.appendChild(tr)
                    }
                    
                    // Wait for images to load
                    const images = pageContainer.querySelectorAll('img')
                    await Promise.all(Array.from(images).map(img => {
                        return new Promise((resolve) => {
                            if (img.complete) {
                                resolve()
                            } else {
                                img.onload = resolve
                                img.onerror = resolve
                            }
                        })
                    }))
                    
                    // Render this page to canvas
                    const canvas = await html2canvas.default(pageContainer, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        allowTaint: true,
                        foreignObjectRendering: false,
                        proxy: null
                    })
                    
                    const imgData = canvas.toDataURL('image/png', 1.0)
                    const pxToMm = 0.264583 / 2
                    const imgWidthInMm = canvas.width * pxToMm
                    const imgHeightInMm = canvas.height * pxToMm
                    const ratio = availableWidth / imgWidthInMm
                    const scaledWidth = availableWidth
                    const scaledHeight = imgHeightInMm * ratio
                    
                    // Ensure content fits within page height
                    const availableHeight = pdfHeight - (margin * 2)
                    const finalHeight = Math.min(scaledHeight, availableHeight)
                    
                    // Add new page if this is not the first page
                    if (pageNum > 0) {
                        pdf.addPage()
                    }
                    
                    // Add image to current page
                    pdf.addImage(imgData, 'PNG', margin, margin, scaledWidth, finalHeight)
                    
                    console.log(`Page ${pageNum + 1} added to PDF (${pageVocabulary.length} words)`)
                    
                    // Clean up
                    document.body.removeChild(pageContainer)
                }
                
                // Verify PDF has correct number of pages
                const finalPageCount = pdf.internal.pages.length - 1 // jsPDF counts from 1, but array is 0-indexed
                console.log(`PDF generation complete. Total pages: ${finalPageCount}, Expected: ${totalPages}`)
                
                // Generate filename
                const filename = `${currentLesson.title || 'lesson'}_${currentLesson.subtitle || 'vocabulary'}.pdf`
                pdf.save(filename)
            } finally {
                // Remove temporary style
                const styleElement = document.getElementById('pdf-oklch-override')
                if (styleElement) {
                    document.head.removeChild(styleElement)
                }
            }
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (teacherId) {
                                navigate(`/teacher/${teacherId}/lessons`)
                            } else {
                                navigate('/dashboard')
                            }
                        }}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {teacherId ? 'Back to Lessons' : 'Back to Dashboard'}
                    </button>
                    {currentLesson && (
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            className="mb-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 5.373 12 12h-4zm8 0a8 8 0 00-8-8v4a4 4 0 014 4h4z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Paper-like Lesson Content */}
                <div 
                    ref={lessonContentRef}
                    className="bg-white rounded-lg shadow-2xl border border-gray-200" 
                    style={{
                        padding: '2rem',
                        maxWidth: '210mm', // A4 width
                        margin: '0 auto',
                        background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)'
                    }}
                >
                    {/* Error Display */}
                    {lessonError && (
                        <div className="mb-6 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                            <p className="font-semibold">Error loading lesson:</p>
                            <p>{typeof lessonError === 'string' ? lessonError : 'Failed to load lesson. Please check the lesson ID.'}</p>
                            {lessonId && (
                                <p className="mt-2 text-xs text-rose-600">Lesson ID: {lessonId}</p>
                            )}
                        </div>
                    )}

                    {/* Lesson Header */}
                    <div className="mb-8 pb-6 border-b-2 border-indigo-200">
                        {lessonLoading ? (
                            <div className="py-8 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                <p className="mt-4 text-gray-600">Loading lesson...</p>
                            </div>
                        ) : currentLesson ? (
                            <>
                                <div className="text-center mb-4">
                                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                        {currentLesson.title}
                                    </h1>
                                    <p className="text-xl text-gray-600" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{currentLesson.titleEnglish}</p>
                                </div>
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <h2 className="text-3xl md:text-4xl font-bold text-indigo-600" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                        {currentLesson.subtitle}
                                    </h2>
                                    <span className="text-xl text-gray-500" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>({currentLesson.subtitleEnglish})</span>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-xl text-gray-600">Lesson not found</p>
                                <p className="text-sm text-gray-500 mt-2">Please check the lesson ID and try again.</p>
                                {lessonId && (
                                    <p className="text-xs text-gray-400 mt-1">ID: {lessonId}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Vocabulary Section */}
                    <div className="mb-8">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-indigo-600">生词</span>
                                <span className="text-lg font-normal text-gray-600">(Vocabulary)</span>
                            </h3>
                        </div>

                        {/* Vocabulary Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-indigo-50 border-b-2 border-indigo-200">
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-r border-indigo-200">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-r border-indigo-200">中文</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-r border-indigo-200">拼音</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-r border-indigo-200">English</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-r border-indigo-200">ខ្មែរ</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Image</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vocabulary.map((word, index) => {
                                        const getImageUrl = (icon) => {
                                            if (!icon) return null
                                            // Check if it's an image file path
                                            if (icon.startsWith('/uploads/')) {
                                                return `http://localhost:5000${icon}`
                                            }
                                            // Check if it's a base64 image
                                            if (icon.startsWith('data:image')) {
                                                return icon
                                            }
                                            return null
                                        }
                                        
                                        const imageUrl = getImageUrl(word.categoryIcon)
                                        const isImage = imageUrl !== null
                                        
                                        return (
                                        <tr 
                                            key={index} 
                                            className="border-b border-gray-200 hover:bg-indigo-50/50 transition"
                                        >
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-600 border-r border-gray-200">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-lg font-bold text-gray-900 border-r border-gray-200">
                                                {word.chinese}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                {word.pinyin || word.phonetic || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                {word.english}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                {word.khmer || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center border-gray-200">
                                                {isImage ? (
                                                    <button
                                                        onClick={() => setSelectedImage(imageUrl)}
                                                        className="inline-block cursor-pointer transition-transform hover:scale-110"
                                                        title="Click to view larger image"
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={word.chinese || 'Vocabulary image'}
                                                            className="h-12 w-12 object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-400"
                                                            crossOrigin="anonymous"
                                                            loading="eager"
                                                            style={{ display: 'inline-block' }}
                                                        />
                                                    </button>
                                                ) : word.categoryIcon ? (
                                                    <span className="text-2xl" title={word.chinese || 'Icon'}>
                                                        {word.categoryIcon}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {vocabulary.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>No vocabulary words available for this lesson.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Image Popup Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-4">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 z-10 rounded-full bg-white/90 p-2 text-gray-800 shadow-lg transition hover:bg-white hover:scale-110"
                            aria-label="Close"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Vocabulary"
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default LessonDetailPage