import React, { useState, useEffect, useRef } from 'react'

const CategoryForm = ({ category, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        englishName: '',
        khmerName: '',
        chineseName: '',
        phonetic: '',
        icon: '',
        imageUrl: '',
        audioUrl: '',
        type: [],  // Changed to empty array - will be set dynamically based on category or user selection
        ex_english: '',
        ex_chinese: '',
        ex_chinese_pinyin: '',
        ex_khmer: '',
        highlight_english: '',
        highlight_chinese: '',
        highlight_chinese_pinyin: '',
        highlight_khmer: '',
        definition: '',
        usage: '',
        notes: '',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-500'
    })

    const [errors, setErrors] = useState({})
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
    const [typeSearchQuery, setTypeSearchQuery] = useState('')
    const typeDropdownRef = useRef(null)
    const [iconType, setIconType] = useState('emoji') // 'emoji' or 'image'
    const [iconPreview, setIconPreview] = useState(null)
    const [iconFile, setIconFile] = useState(null) // Store the actual file for upload
    const fileInputRef = useRef(null)

    // Type options for the searchable dropdown
    const typeOptions = [
        { value: 'place', label: 'Place' },
        { value:'Talking / Speaking', label: 'Talking / Speaking' },
        { value:'Country', label: 'Country' },
        { value:'Question phrase', label: 'Question phrase' },
        { value:'Adverb', label: 'Adverb' },
        { value:'City', label: 'City' },
        { value:'Ice', label: 'Ice' },
        { value:'Money', label: 'Money' },
        { value:'Measure word', label: 'Measure word' },
        { value:'Question word', label: 'Question word' },
        { value:'School', label: 'School' },
        { value:'Alcohol', label: 'Alcohol' },
        { value:'Transport', label: 'Transport' },
        { value:'Classroom Phrase', label: 'Classroom Phrase' },
        { value:'Media', label: 'Media' },
        { value: 'conversation', label: 'Conversation' },
        { value: 'Adjective / Emotion', label: 'Adjective / Emotion' },
        { value: 'Weapons/Sharp Tools', label: 'Weapons/Sharp Tools' },
        { value: 'Tools / Writing Tools', label: 'Tools / Writing Tools' },
        { value: 'education', label: 'Education' },
        { value: 'language', label: 'Language' },
        { value: 'Body Parts', label: 'Body Parts' },
        { value: 'health', label: 'Health' },
        { value: 'Expression / Greeting', label: 'Expression / Greeting' },
        { value: 'sports', label: 'Sports' },
        { value: 'business', label: 'Business' },
        { value: 'finance', label: 'Finance' },
        { value: 'technology', label: 'Technology' },
        { value: 'science', label: 'Science' },
        { value: 'art', label: 'Art' },
        { value: 'music', label: 'Music' },
        { value: 'dance', label: 'Dance' },
        { value: 'theater', label: 'Theater' },
        { value: 'travel', label: 'Travel' },
        { value: 'food', label: 'Food' },
        { value: 'drink', label: 'Drink' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'accessory', label: 'Accessory' },
        { value: 'home', label: 'Home' },
        { value: 'garden', label: 'Garden' },
        { value: 'animal', label: 'Animal' },
        { value: 'plant', label: 'Plant' },
        { value: 'mineral', label: 'Mineral' },
        { value: 'weather', label: 'Weather' },
        { value: 'Time', label: 'Time' },
        { value: 'event', label: 'Event' },
        { value: 'other', label: 'Other' },
        { value: 'Emotion', label: 'Emotion' },
        { value: 'Nature', label: 'Nature' },
        { value: 'person', label: 'Person' },
        { value: 'object', label: 'Object' },
        { value: 'color', label: 'Color' },
        { value: 'Musical Instrument', label: 'Musical Instrument' },
        { value: 'activity', label: 'Activity' },
        { value: 'verb', label: 'Verb' },
        { value: 'Idiom', label: 'Idiom' },
        { value: 'Noun', label: 'Noun' },
        { value: 'Preposition', label: 'Preposition' },
        { value: 'Conjunction', label: 'Conjunction' },
        { value: 'Pronoun', label: 'Pronoun' },
        { value: 'Demonstrative', label: 'Demonstrative' },
        { value: 'adjective', label: 'Adjective' }
    ]

    // Auto-assign colors based on icon
    const colorPairs = [
        { bgColor: 'bg-orange-50', iconColor: 'text-orange-500' },
        { bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
        { bgColor: 'bg-pink-50', iconColor: 'text-pink-500' },
        { bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
        { bgColor: 'bg-red-50', iconColor: 'text-red-500' },
        { bgColor: 'bg-indigo-50', iconColor: 'text-indigo-500' },
        { bgColor: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        { bgColor: 'bg-sky-50', iconColor: 'text-sky-500' }
    ]

    useEffect(() => {
        if (category) {
            // Normalize type to array for backward compatibility
            // Preserve all selected types from database - don't default to 'General' or 'place'
            let normalizedType = []
            if (Array.isArray(category.type)) {
                // If it's already an array, use it as-is (preserves multiple selections)
                normalizedType = category.type.length > 0 ? category.type : []
            } else if (category.type) {
                // If it's a single string, convert to array
                normalizedType = [category.type]
            }
            // If no type exists, leave as empty array (user will select)
            
            // Ensure all optional fields are set to empty string if undefined
            // Handle backward compatibility: if old 'example' field exists, use it for ex_english
            const normalizedCategory = {
                ...category,
                type: normalizedType,
                ex_english: category.ex_english || (category.example || ''),
                ex_chinese: category.ex_chinese || '',
                ex_chinese_pinyin: category.ex_chinese_pinyin || '',
                ex_khmer: category.ex_khmer || '',
                highlight_english: category.highlight_english || '',
                highlight_chinese: category.highlight_chinese || '',
                highlight_chinese_pinyin: category.highlight_chinese_pinyin || '',
                highlight_khmer: category.highlight_khmer || '',
                definition: category.definition || '',
                usage: category.usage || '',
                notes: category.notes || ''
            }
            setFormData(normalizedCategory)
            // Check if icon is an image (URL path or data URL) or emoji
            if (category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('/uploads/'))) {
                setIconType('image')
                // If it's a URL path, construct full URL for preview
                if (category.icon.startsWith('/uploads/')) {
                    setIconPreview(`http://localhost:5000${category.icon}`)
                } else {
                    setIconPreview(category.icon)
                }
            } else {
                setIconType('emoji')
                setIconPreview(null)
            }
            setIconFile(null)
        } else {
            // Auto-assign random color for new categories
            const randomColor = colorPairs[Math.floor(Math.random() * colorPairs.length)]
            setFormData(prev => ({ ...prev, ...randomColor }))
            setIconType('emoji')
            setIconPreview(null)
            setIconFile(null)
        }
    }, [category])

    // Handle clicks outside the dropdown and prevent body scroll
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
                setIsTypeDropdownOpen(false)
                setTypeSearchQuery('')
            }
        }

        if (isTypeDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            // Prevent body scroll when dropdown is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = ''
        }
    }, [isTypeDropdownOpen])

    // Filter type options based on search query
    const filteredTypeOptions = typeOptions.filter(option =>
        option.label.toLowerCase().includes(typeSearchQuery.toLowerCase())
    )

    // Handle type selection (toggle)
    const handleTypeToggle = (typeValue) => {   
        setFormData(prev => {
            const currentTypes = Array.isArray(prev.type) ? prev.type : (prev.type ? [prev.type] : [])
            if (currentTypes.includes(typeValue)) {
                // Remove if already selected - allow empty array (no forced default)
                const newTypes = currentTypes.filter(t => t !== typeValue)
                return { ...prev, type: newTypes }
            } else {
                // Add if not selected
                return { ...prev, type: [...currentTypes, typeValue] }
            }
        })
    }

    // Remove a type
    const handleTypeRemove = (typeValue) => {
        setFormData(prev => {
            const currentTypes = Array.isArray(prev.type) ? prev.type : (prev.type ? [prev.type] : [])
            const newTypes = currentTypes.filter(t => t !== typeValue)
            // Allow empty array - no forced default
            return { ...prev, type: newTypes }
        })
    }

    // Get selected types array - properly handle all cases
    const selectedTypes = Array.isArray(formData.type) 
        ? formData.type 
        : (formData.type ? [formData.type] : [])
    const selectedTypeLabel = selectedTypes.length > 0 
        ? `${selectedTypes.length} type${selectedTypes.length > 1 ? 's' : ''} selected`
        : 'Select types…'

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleIconTypeChange = (type) => {
        setIconType(type)
        // Clear icon when switching types
        setFormData(prev => ({ ...prev, icon: '' }))
        setIconPreview(null)
        setIconFile(null)
        if (errors.icon) {
            setErrors(prev => ({ ...prev, icon: '' }))
        }
        // Clear file input if switching to emoji
        if (type === 'emoji' && fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width
                            width = maxWidth
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height
                            height = maxHeight
                        }
                    }

                    // Create canvas and compress
                    const canvas = document.createElement('canvas')
                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    // Convert to blob for file upload (better than base64)
                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Create a new File object from the blob
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            })
                            resolve(compressedFile)
                        } else {
                            reject(new Error('Failed to compress image'))
                        }
                    }, 'image/jpeg', quality)
                }
                img.onerror = reject
                img.src = e.target.result
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, icon: 'Please select an image file' }))
            return
        }

        // Validate file size (max 5MB before compression)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, icon: 'Image size must be less than 5MB' }))
            return
        }

        try {
            // Compress image and store the file
            const compressedFile = await compressImage(file, 400, 400, 0.8)
            setIconFile(compressedFile)
            
            // Create preview URL from the compressed file
            const previewUrl = URL.createObjectURL(compressedFile)
            setIconPreview(previewUrl)
            
            // Clear icon field since we'll send the file separately
            setFormData(prev => ({ ...prev, icon: '' }))
            
            if (errors.icon) {
                setErrors(prev => ({ ...prev, icon: '' }))
            }
        } catch (err) {
            console.error('Image compression error:', err)
            setErrors(prev => ({ ...prev, icon: 'Failed to process image file' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.englishName.trim()) newErrors.englishName = 'Required'
        if (!formData.khmerName.trim()) newErrors.khmerName = 'Required'
        // Chinese is optional, so no validation error
        if (!formData.phonetic.trim()) newErrors.phonetic = 'Required'
        if (iconType === 'emoji' && !formData.icon.trim()) {
            newErrors.icon = 'Please enter an emoji'
        } else if (iconType === 'image' && !iconFile && !formData.icon) {
            newErrors.icon = 'Please upload an image'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Check if icon is an image (URL path or data URL)
    const isIconImage = formData.icon && (formData.icon.startsWith('data:image') || formData.icon.startsWith('/uploads/')) || iconFile

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateForm()) return
        
        // Prepare data to send
        const dataToSend = {
            ...formData,
            // Include icon file separately if it's an image upload
            iconFile: iconFile || null
        }
        
        onSave(dataToSend)
    }

    return (
        <>
            <style>{`
                .custom-thin-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-thin-scrollbar::-webkit-scrollbar-track {
                    background: #1e293b;
                    border-radius: 3px;
                }
                .custom-thin-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569;
                    border-radius: 3px;
                }
                .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
            `}</style>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className={`w-full max-w-lg rounded-2xl bg-slate-900 p-4 shadow-2xl ring-1 ring-white/10 max-h-[90vh] ${isTypeDropdownOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                        {category ? 'Edit Category' : 'New Category'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                    {/* 2-Column Grid for Main Fields */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {/* English Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                English Name *
                            </label>
                            <input
                                type="text"
                                name="englishName"
                                value={formData.englishName}
                                onChange={handleChange}
                                className={`w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white transition focus:outline-none focus:ring-2 ${errors.englishName
                                        ? 'border-rose-500 focus:ring-rose-500/50'
                                        : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50'
                                    }`}
                                placeholder="House"
                            />
                            {errors.englishName && (
                                <p className="mt-0.5 text-xs text-rose-400">{errors.englishName}</p>
                            )}
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Icon *
                            </label>
                            
                            {/* Icon Type Toggle */}
                            <div className="mb-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleIconTypeChange('emoji')}
                                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                        iconType === 'emoji'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                                >
                                    Emoji
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleIconTypeChange('image')}
                                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                        iconType === 'image'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                                >
                                    Image
                                </button>
                            </div>

                            {/* Emoji Input */}
                            {iconType === 'emoji' && (
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white transition focus:outline-none focus:ring-2 ${errors.icon
                                            ? 'border-rose-500 focus:ring-rose-500/50'
                                             : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50'
                                         }`}
                                     placeholder="Use emoji, e.g. 🏠"
                                />
                            )}

                            {/* Image Upload */}
                            {iconType === 'image' && (
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="icon-image-upload"
                                    />
                                    <label
                                        htmlFor="icon-image-upload"
                                        className={`flex cursor-pointer items-center justify-center rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white transition focus:outline-none focus:ring-2 ${
                                            errors.icon
                                                ? 'border-rose-500 focus:ring-rose-500/50'
                                                : 'border-white/10 hover:bg-white/10 focus:border-indigo-500 focus:ring-indigo-500/50'
                                        }`}
                                    >
                                        {iconPreview ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Image Selected
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Upload Image
                                            </span>
                                        )}
                                    </label>
                                </div>
                            )}

                            {errors.icon && (
                                <p className="mt-0.5 text-xs text-rose-400">{errors.icon}</p>
                            )}
                        </div>
                    </div>

                    {/* Khmer Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Khmer Name *
                        </label>
                        <input
                            type="text"
                            name="khmerName"
                            value={formData.khmerName}
                            onChange={handleChange}
                            className={`w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white transition focus:outline-none focus:ring-2 ${errors.khmerName
                                    ? 'border-rose-500 focus:ring-rose-500/50'
                                    : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50'
                                }`}
                            placeholder="ផ្ទះ"
                        />
                        {errors.khmerName && (
                            <p className="mt-0.5 text-xs text-rose-400">{errors.khmerName}</p>
                        )}
                    </div>

                    {/* Chinese Name (optional) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Chinese Name
                        </label>
                        <input
                            type="text"
                            name="chineseName"
                            value={formData.chineseName}
                            onChange={handleChange}
                            className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50"
                            placeholder="苹果"
                        />
                    </div>

                    {/* Phonetic */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Phonetic *
                        </label>
                        <input
                            type="text"
                            name="phonetic"
                            value={formData.phonetic}
                            onChange={handleChange}
                            className={`w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white transition focus:outline-none focus:ring-2 ${errors.phonetic
                                    ? 'border-rose-500 focus:ring-rose-500/50'
                                    : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50'
                                }`}
                            placeholder="pteah"
                        />
                        {errors.phonetic && (
                            <p className="mt-0.5 text-xs text-rose-400">{errors.phonetic}</p>
                        )}
                    </div>

                    {/* Type - Multi-select */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Types <span className="text-slate-500">(Select multiple)</span>
                        </label>
                        <div className="relative" ref={typeDropdownRef}>
                            {/* Dropdown Button */}
                            <button
                                type="button"
                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-50 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 flex items-center justify-between cursor-pointer"
                            >
                                <span className={selectedTypes.length > 0 ? 'text-slate-50' : 'text-slate-400'}>
                                    {selectedTypeLabel}
                                </span>
                                <svg
                                    className={`h-4 w-4 text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Selected Types Tags */}
                            {selectedTypes.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {selectedTypes.map((typeValue) => {
                                        const typeOption = typeOptions.find(opt => opt.value === typeValue)
                                        return typeOption ? (
                                            <span
                                                key={typeValue}
                                                className="inline-flex items-center gap-1 rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300 max-w-full"
                                                title={typeOption.label}
                                            >
                                                <span className="truncate max-w-[120px]">{typeOption.label}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTypeRemove(typeValue)}
                                                    className="hover:text-indigo-100 cursor-pointer flex-shrink-0"
                                                    title="Remove"
                                                >
                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ) : null
                                    })}
                                </div>
                            )}

                            {/* Dropdown Menu */}
                            {isTypeDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 shadow-xl max-h-64 overflow-hidden">
                                    {/* Search Input */}
                                    <div className="p-2 border-b border-slate-600">
                                        <div className="relative">
                                            <svg
                                                className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                value={typeSearchQuery}
                                                onChange={(e) => setTypeSearchQuery(e.target.value)}
                                                placeholder="Search type..."
                                                className="w-full rounded-md border border-slate-600 bg-slate-700 px-8 py-2 text-sm text-slate-50 placeholder:text-slate-400 cursor-text focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                                                autoFocus
                                            />
                                            {typeSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTypeSearchQuery('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Options List with Custom Scrollbar and Checkboxes */}
                                    <div 
                                        className="max-h-48 overflow-y-auto custom-thin-scrollbar"
                                        style={{
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#475569 #1e293b'
                                        }}
                                    >
                                        {filteredTypeOptions.length > 0 ? (
                                            filteredTypeOptions.map((option) => {
                                                const isSelected = selectedTypes.includes(option.value)
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleTypeToggle(option.value)}
                                                        className={`w-full px-3 py-2 text-left text-sm transition hover:bg-slate-700 flex items-center gap-2 cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-indigo-600/20 text-indigo-400'
                                                                : 'text-slate-50'
                                                        }`}
                                                    >
                                                        <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                                                            isSelected 
                                                                ? 'border-indigo-400 bg-indigo-600' 
                                                                : 'border-slate-500 bg-slate-700'
                                                        }`}>
                                                            {isSelected && (
                                                                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        {option.label}
                                                    </button>
                                                )
                                            })
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-slate-400">
                                                No types found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Example Sentences - Three Languages */}
                    <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Example Sentences
                        </label>
                        
                        {/* English Example */}
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    English Example
                                </label>
                                <textarea
                                    name="ex_english"
                                    value={formData.ex_english}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50 resize-none"
                                    placeholder="e.g., I use a dictionary to learn new words."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-normal text-slate-500 mb-1">
                                    Word to Highlight (English)
                                </label>
                                <input
                                    type="text"
                                    name="highlight_english"
                                    value={formData.highlight_english}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50"
                                    placeholder="e.g., dictionary"
                                />
                            </div>
                        </div>

                        {/* Chinese Example */}
                        <div className="space-y-2.5">
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                Chinese Example
                            </label>
                            
                            {/* Pinyin Input */}
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-normal text-slate-500 mb-1">
                                        Pinyin (Romanization)
                                    </label>
                                    <textarea
                                        name="ex_chinese_pinyin"
                                        value={formData.ex_chinese_pinyin}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50 resize-none"
                                        placeholder="Wǒ měi tiān zǎo shang kàn bào zhǐ."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-normal text-slate-500 mb-1">
                                        Word to Highlight (Pinyin)
                                    </label>
                                    <input
                                        type="text"
                                        name="highlight_chinese_pinyin"
                                        value={formData.highlight_chinese_pinyin}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50"
                                        placeholder="e.g., bào zhǐ"
                                    />
                                </div>
                            </div>

                            {/* Chinese Characters Input */}
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-normal text-slate-500 mb-1">
                                        Chinese Characters
                                    </label>
                                    <textarea
                                        name="ex_chinese"
                                        value={formData.ex_chinese}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50 resize-none"
                                        placeholder="我 每天 早上 看 报 纸。"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-normal text-slate-500 mb-1">
                                        Word to Highlight (Chinese)
                                    </label>
                                    <input
                                        type="text"
                                        name="highlight_chinese"
                                        value={formData.highlight_chinese}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50"
                                        placeholder="e.g., 报纸"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Khmer Example */}
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Khmer Example
                                </label>
                                <textarea
                                    name="ex_khmer"
                                    value={formData.ex_khmer}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50 resize-none"
                                    placeholder="ឧទាហរណ៍ ខ្ញុំប្រើវចនានុក្រមដើម្បីរៀនពាក្យថ្មី។"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-normal text-slate-500 mb-1">
                                    Word to Highlight (Khmer)
                                </label>
                                <input
                                    type="text"
                                    name="highlight_khmer"
                                    value={formData.highlight_khmer}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50"
                                    placeholder="e.g., វចនានុក្រម"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Definition */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Definition / Explanation
                        </label>
                        <textarea
                            name="definition"
                            value={formData.definition}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50 resize-none"
                            placeholder="A detailed explanation of what this word means..."
                        />
                    </div>

                    {/* Usage */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Usage / How to Use
                        </label>
                        <textarea
                            name="usage"
                            value={formData.usage}
                            onChange={handleChange}
                            rows="2"
                            className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50 resize-none"
                            placeholder="e.g., Used when referring to a book that contains definitions..."
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                            className="w-full rounded-lg border bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 transition focus:outline-none focus:ring-2 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/50 resize-none"
                            placeholder="Any additional information, tips, or cultural context..."
                        />
                    </div>

                    {/* Preview */}
                    <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                        <p className="mb-2 text-xs font-semibold text-slate-400">Preview</p>
                        <div className="flex items-center gap-2.5">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden ${isIconImage ? '' : formData.bgColor} ${isIconImage ? 'bg-white/5' : ''} ${isIconImage ? '' : 'text-2xl'}`}>
                                {isIconImage ? (
                                    <img 
                                        src={iconPreview || (formData.icon && formData.icon.startsWith('/uploads/') ? `http://localhost:5000${formData.icon}` : formData.icon)} 
                                        alt="Icon preview" 
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    formData.icon || '?'
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-bold text-white">
                                    {formData.englishName || 'Name'}
                                </h3>
                                <p className="truncate text-sm font-bold text-slate-300">
                                    {formData.khmerName || 'ខ្មែរ'}
                                </p>
                                {formData.chineseName && (
                                    <p className="truncate text-xs text-emerald-200">
                                        {formData.chineseName}
                                    </p>
                                )}
                                <p className="truncate text-xs text-slate-400">
                                    {formData.phonetic || 'phonetic'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500"
                        >
                            {category ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    )
}

export default CategoryForm
