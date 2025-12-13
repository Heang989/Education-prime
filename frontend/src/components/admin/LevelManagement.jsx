import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLessonsByLevel, createLesson, updateLesson, deleteLesson } from '../../store/slices/lessonsSlice'
import { fetchCategories } from '../../store/slices/categoriesSlice'
import { fetchTeachers } from '../../store/slices/teachersSlice'

const LevelManagement = ({ level, onBack }) => {
    const dispatch = useDispatch()
    const { lessons, loading, error } = useSelector((state) => state.lessons)
    const { categories: categoryList } = useSelector((state) => state.categories)
    const { teachers } = useSelector((state) => state.teachers)
    const [selectedLesson, setSelectedLesson] = useState(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState(null)
    const [formData, setFormData] = useState({
        teacherId: '',
        lessonNumber: '1',
        title: '',
        titleEnglish: '',
        subtitle: '',
        subtitleEnglish: '',
        vocabulary: []
    })
    const [editingVocabIndex, setEditingVocabIndex] = useState(null)
    const [showCategoryImport, setShowCategoryImport] = useState(false)

    useEffect(() => {
        dispatch(fetchLessonsByLevel({ level }))
        dispatch(fetchCategories())
        dispatch(fetchTeachers())
    }, [dispatch, level])

    // Filter lessons by level (show all teachers' lessons for this level in admin view)
    const levelLessons = lessons.filter(l => l.level === level).sort((a, b) => {
        // Sort by teacher name first, then by lesson number
        const teacherA = teachers.find(t => t._id === l.teacherId)?.name || ''
        const teacherB = teachers.find(t => t._id === b.teacherId)?.name || ''
        if (teacherA !== teacherB) {
            return teacherA.localeCompare(teacherB)
        }
        return a.lessonNumber - b.lessonNumber
    })

    const handleCreateLesson = () => {
        setEditingLesson(null)
        // Get teachers for this level
        const levelTeachers = teachers.filter(t => t.level === level)
        setFormData({
            teacherId: levelTeachers.length > 0 ? levelTeachers[0]._id : '',
            lessonNumber: String(levelLessons.length + 1),
            title: '',
            titleEnglish: '',
            subtitle: '',
            subtitleEnglish: '',
            vocabulary: []
        })
        setIsFormOpen(true)
    }

    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson)
        setFormData({
            teacherId: lesson.teacherId || '',
            lessonNumber: String(lesson.lessonNumber),
            title: lesson.title,
            titleEnglish: lesson.titleEnglish,
            subtitle: lesson.subtitle,
            subtitleEnglish: lesson.subtitleEnglish,
            vocabulary: lesson.vocabulary || []
        })
        setIsFormOpen(true)
    }

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) {
            return
        }
        try {
            await dispatch(deleteLesson(lessonId)).unwrap()
            dispatch(fetchLessonsByLevel({ level }))
        } catch (error) {
            console.error('Failed to delete lesson:', error)
        }
    }

    const handleSaveLesson = async () => {
        try {
            // Validate required fields
            if (!formData.title || !formData.title.trim()) {
                alert('Please fill in the Chinese title (Title)')
                return
            }
            if (!formData.titleEnglish || !formData.titleEnglish.trim()) {
                alert('Please fill in the English title')
                return
            }
            if (!formData.subtitle || !formData.subtitle.trim()) {
                alert('Please fill in the Chinese subtitle')
                return
            }
            if (!formData.subtitleEnglish || !formData.subtitleEnglish.trim()) {
                alert('Please fill in the English subtitle')
                return
            }

            if (!formData.teacherId) {
                alert('Please select a teacher for this lesson')
                return
            }

            const lessonData = {
                level: parseInt(level), // Ensure it's an integer
                lessonNumber: parseInt(formData.lessonNumber), // Ensure it's an integer
                title: formData.title.trim(),
                titleEnglish: formData.titleEnglish.trim(),
                subtitle: formData.subtitle.trim(),
                subtitleEnglish: formData.subtitleEnglish.trim(),
                vocabulary: formData.vocabulary || [],
                teacherId: formData.teacherId
            }

            if (editingLesson) {
                await dispatch(updateLesson({ id: editingLesson._id, lessonData })).unwrap()
            } else {
                await dispatch(createLesson(lessonData)).unwrap()
            }

            setIsFormOpen(false)
            setEditingLesson(null)
            dispatch(fetchLessonsByLevel(level))
        } catch (error) {
            console.error('Failed to save lesson:', error)
            // Show more detailed error message
            const errorMessage = error?.response?.data?.errors 
                ? error.response.data.errors.map(e => e.msg).join(', ')
                : error?.response?.data?.message || error?.message || 'Failed to save lesson'
            alert(`Error: ${errorMessage}`)
        }
    }

    const handleAddVocabulary = () => {
        setFormData({
            ...formData,
            vocabulary: [...formData.vocabulary, {
                chinese: '',
                pinyin: '',
                english: '',
                khmer: '',
                phonetic: ''
            }]
        })
        setEditingVocabIndex(formData.vocabulary.length)
    }

    const handleUpdateVocabulary = (index, updatedVocab) => {
        const newVocabulary = [...formData.vocabulary]
        newVocabulary[index] = updatedVocab
        setFormData({ ...formData, vocabulary: newVocabulary })
    }

    const handleDeleteVocabulary = (index) => {
        const newVocabulary = formData.vocabulary.filter((_, i) => i !== index)
        setFormData({ ...formData, vocabulary: newVocabulary })
    }

    const handleMatchWithCategory = (index) => {
        const vocab = formData.vocabulary[index]
        if (!vocab.chinese) return

        const match = categoryList.find(cat =>
            cat.chineseName && cat.chineseName.trim() === vocab.chinese.trim()
        )

        if (match) {
            handleUpdateVocabulary(index, {
                ...vocab,
                english: match.englishName || vocab.english,
                khmer: match.khmerName || vocab.khmer,
                phonetic: match.phonetic || vocab.pinyin || vocab.phonetic,
                categoryId: match._id
            })
        }
    }

    const handleImportFromCategories = (selectedCategories) => {
        const existingChineseWords = formData.vocabulary.map(v => v.chinese.trim().toLowerCase())
        
        const newVocabulary = selectedCategories
            .filter(cat => {
                // Don't add if already exists
                const chinese = cat.chineseName?.trim()
                return chinese && !existingChineseWords.includes(chinese.toLowerCase())
            })
            .map(cat => ({
                chinese: cat.chineseName || '',
                pinyin: cat.phonetic || '',
                english: cat.englishName || '',
                khmer: cat.khmerName || '',
                phonetic: cat.phonetic || '',
                categoryId: cat._id
            }))

        setFormData({
            ...formData,
            vocabulary: [...formData.vocabulary, ...newVocabulary]
        })
        setShowCategoryImport(false)
    }

    if (selectedLesson) {
        return (
            <LessonDetailView
                lesson={selectedLesson}
                onBack={() => setSelectedLesson(null)}
                isAdmin={true}
            />
        )
    }

    if (isFormOpen) {
        return (
            <>
                <LessonForm
                    formData={formData}
                    setFormData={setFormData}
                    editingVocabIndex={editingVocabIndex}
                    setEditingVocabIndex={setEditingVocabIndex}
                    onSave={handleSaveLesson}
                    onCancel={() => {
                        setIsFormOpen(false)
                        setEditingLesson(null)
                    }}
                    onAddVocabulary={handleAddVocabulary}
                    onUpdateVocabulary={handleUpdateVocabulary}
                    onDeleteVocabulary={handleDeleteVocabulary}
                    onMatchWithCategory={handleMatchWithCategory}
                    onImportFromCategories={() => setShowCategoryImport(true)}
                    categoryList={categoryList}
                    teachers={teachers}
                    level={level}
                />
                {showCategoryImport && (
                    <CategoryImportModal
                        categoryList={categoryList}
                        existingVocabulary={formData.vocabulary}
                        onImport={handleImportFromCategories}
                        onClose={() => setShowCategoryImport(false)}
                    />
                )}
            </>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={onBack}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Levels
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-2">Level {level} - Lessons</h2>
                    <p className="text-slate-400">Manage lessons for this level</p>
                </div>
                <button
                    onClick={handleCreateLesson}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-500"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Lesson
                </button>
            </div>

            {error && (
                <div className="animate-fade-in rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {typeof error === 'string' ? error : 'An error occurred'}
                </div>
            )}

            {loading && levelLessons.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-400">Loading lessons...</p>
                </div>
            ) : levelLessons.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-400 mb-4">No lessons yet. Create your first lesson!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levelLessons.map((lesson) => {
                        const lessonTeacher = teachers.find(t => t._id === lesson.teacherId)
                        return (
                        <div
                            key={lesson._id}
                            className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-3xl">
                                    📚
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-amber-400">0{lesson.lessonNumber}</div>
                                    <div className="text-xs text-slate-400">Lesson</div>
                                </div>
                            </div>
                            {lessonTeacher && (
                                <div className="mb-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-400">
                                        👤 {lessonTeacher.name}
                                    </span>
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
                            <p className="text-slate-400 text-sm mb-2">{lesson.titleEnglish}</p>
                            <p className="text-amber-400 font-semibold mb-4">{lesson.subtitle}</p>
                            <div className="text-xs text-slate-500 mb-4">
                                {lesson.vocabulary?.length || 0} vocabulary words
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditLesson(lesson)}
                                    className="flex-1 rounded-xl bg-indigo-600/20 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-600/30 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteLesson(lesson._id)}
                                    className="flex-1 rounded-xl bg-rose-600/20 px-4 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-600/30 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// Lesson Form Component
const LessonForm = ({
    formData,
    setFormData,
    editingVocabIndex,
    setEditingVocabIndex,
    onSave,
    onCancel,
    onAddVocabulary,
    onUpdateVocabulary,
    onDeleteVocabulary,
    onMatchWithCategory,
    onImportFromCategories,
    categoryList,
    teachers,
    level
}) => {
    // Get teachers for this level
    const levelTeachers = teachers.filter(t => t.level === level)
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create/Edit Lesson</h3>
                <button
                    onClick={onCancel}
                    className="text-slate-400 hover:text-white transition"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Teacher *</label>
                    <select
                        value={formData.teacherId}
                        onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        required
                    >
                        <option value="" className="bg-slate-800">Select a teacher</option>
                        {levelTeachers.map(teacher => (
                            <option key={teacher._id} value={teacher._id} className="bg-slate-800">
                                {teacher.name} ({teacher.subject})
                            </option>
                        ))}
                    </select>
                    {levelTeachers.length === 0 && (
                        <p className="mt-2 text-xs text-rose-400">No teachers assigned to Level {level}. Please assign teachers first.</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Lesson Number (1-6)</label>
                    <select
                        value={formData.lessonNumber}
                        onChange={(e) => setFormData({ ...formData, lessonNumber: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num} className="bg-slate-800">Lesson {num}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Title (Chinese)</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder="第一课"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Title (English)</label>
                    <input
                        type="text"
                        value={formData.titleEnglish}
                        onChange={(e) => setFormData({ ...formData, titleEnglish: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder="Lesson 1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Subtitle (Chinese)</label>
                    <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder="你好"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Subtitle (English)</label>
                    <input
                        type="text"
                        value={formData.subtitleEnglish}
                        onChange={(e) => setFormData({ ...formData, subtitleEnglish: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder="Hello"
                    />
                </div>
            </div>

            {/* Vocabulary Section */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">Vocabulary</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={onImportFromCategories}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-sm font-semibold"
                        >
                            📥 Import from Categories
                        </button>
                        <button
                            onClick={onAddVocabulary}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 text-sm"
                        >
                            + Add Word
                        </button>
                    </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {formData.vocabulary.map((vocab, index) => (
                        <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="grid grid-cols-5 gap-2">
                                <input
                                    type="text"
                                    value={vocab.chinese}
                                    onChange={(e) => onUpdateVocabulary(index, { ...vocab, chinese: e.target.value })}
                                    placeholder="中文"
                                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm"
                                />
                                <input
                                    type="text"
                                    value={vocab.pinyin || vocab.phonetic || ''}
                                    onChange={(e) => onUpdateVocabulary(index, { ...vocab, pinyin: e.target.value, phonetic: e.target.value })}
                                    placeholder="拼音"
                                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm"
                                />
                                <input
                                    type="text"
                                    value={vocab.english}
                                    onChange={(e) => onUpdateVocabulary(index, { ...vocab, english: e.target.value })}
                                    placeholder="English"
                                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm"
                                />
                                <input
                                    type="text"
                                    value={vocab.khmer || ''}
                                    onChange={(e) => onUpdateVocabulary(index, { ...vocab, khmer: e.target.value })}
                                    placeholder="ខ្មែរ"
                                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onMatchWithCategory(index)}
                                        className="px-3 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 text-xs"
                                        title="Match with database"
                                    >
                                        🔍
                                    </button>
                                    <button
                                        onClick={() => onDeleteVocabulary(index)}
                                        className="px-3 py-2 bg-rose-600/20 text-rose-400 rounded-lg hover:bg-rose-600/30 text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    className="flex-1 rounded-xl border border-slate-600 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    className="flex-1 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 transition"
                >
                    Save Lesson
                </button>
            </div>
        </div>
    )
}

// Lesson Detail View Component (for admin)
const LessonDetailView = ({ lesson, onBack, isAdmin }) => {
    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Lessons
            </button>

            <div className="bg-white/5 rounded-2xl p-8 ring-1 ring-white/10">
                <div className="text-center mb-8 pb-6 border-b-2 border-amber-500/20">
                    <h1 className="text-4xl font-bold text-white mb-2">{lesson.title}</h1>
                    <p className="text-xl text-slate-400 mb-3">{lesson.titleEnglish}</p>
                    <div className="flex items-center justify-center gap-3">
                        <h2 className="text-3xl font-bold text-amber-400">{lesson.subtitle}</h2>
                        <span className="text-xl text-slate-500">({lesson.subtitleEnglish})</span>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-white mb-6">生词 (Vocabulary)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-amber-500/20 border-b-2 border-amber-500/30">
                                    <th className="px-4 py-3 text-left text-sm font-bold text-white border-r border-amber-500/30">#</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-white border-r border-amber-500/30">中文</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-white border-r border-amber-500/30">拼音</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-white border-r border-amber-500/30">English</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-white">ខ្មែរ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lesson.vocabulary?.map((word, index) => (
                                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-300 border-r border-white/10">{index + 1}</td>
                                        <td className="px-4 py-3 text-lg font-bold text-white border-r border-white/10">{word.chinese}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300 border-r border-white/10">{word.pinyin || word.phonetic || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300 border-r border-white/10">{word.english}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300">{word.khmer || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Category Import Modal Component
const CategoryImportModal = ({ categoryList, existingVocabulary, onImport, onClose }) => {
    const [selectedCategories, setSelectedCategories] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    
    // Get existing Chinese words to filter out
    const existingChineseWords = existingVocabulary.map(v => v.chinese.trim().toLowerCase())
    
    // Filter categories that aren't already in vocabulary
    const availableCategories = categoryList.filter(cat => {
        const chinese = cat.chineseName?.trim()
        return chinese && !existingChineseWords.includes(chinese.toLowerCase())
    })
    
    // Filter by search query
    const filteredCategories = availableCategories.filter(cat => {
        const query = searchQuery.toLowerCase()
        return (
            cat.chineseName?.toLowerCase().includes(query) ||
            cat.englishName?.toLowerCase().includes(query) ||
            cat.khmerName?.toLowerCase().includes(query) ||
            cat.phonetic?.toLowerCase().includes(query)
        )
    })
    
    const handleToggleCategory = (category) => {
        if (selectedCategories.find(c => c._id === category._id)) {
            setSelectedCategories(selectedCategories.filter(c => c._id !== category._id))
        } else {
            setSelectedCategories([...selectedCategories, category])
        }
    }
    
    const handleSelectAll = () => {
        if (selectedCategories.length === filteredCategories.length) {
            setSelectedCategories([])
        } else {
            setSelectedCategories([...filteredCategories])
        }
    }
    
    const handleImport = () => {
        if (selectedCategories.length > 0) {
            onImport(selectedCategories)
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Import Words from Categories</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Chinese, English, Khmer, or Pinyin..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-sm">
                        {filteredCategories.length} words available
                        {selectedCategories.length > 0 && ` • ${selectedCategories.length} selected`}
                    </p>
                    <button
                        onClick={handleSelectAll}
                        className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 text-sm"
                    >
                        {selectedCategories.length === filteredCategories.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>No categories found. All words may already be in the lesson.</p>
                        </div>
                    ) : (
                        filteredCategories.map((category) => {
                            const isSelected = selectedCategories.find(c => c._id === category._id)
                            return (
                                <div
                                    key={category._id}
                                    onClick={() => handleToggleCategory(category)}
                                    className={`p-4 rounded-xl border cursor-pointer transition ${
                                        isSelected
                                            ? 'bg-indigo-600/20 border-indigo-500'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                            isSelected ? 'bg-indigo-600 border-indigo-500' : 'border-slate-400'
                                        }`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 grid grid-cols-4 gap-2">
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">中文</div>
                                                <div className="text-lg font-bold text-white">{category.chineseName || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">拼音</div>
                                                <div className="text-sm text-slate-300">{category.phonetic || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">English</div>
                                                <div className="text-sm text-slate-300">{category.englishName || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">ខ្មែរ</div>
                                                <div className="text-sm text-slate-300">{category.khmerName || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-slate-600 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={selectedCategories.length === 0}
                        className="flex-1 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Import {selectedCategories.length > 0 ? `${selectedCategories.length} ` : ''}Word{selectedCategories.length !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LevelManagement

