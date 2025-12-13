import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createTeacher, fetchTeachers, updateTeacher, deleteTeacher } from '../../store/slices/teachersSlice'

const TeacherManagement = () => {
    const dispatch = useDispatch()
    const { teachers, loading, error } = useSelector((state) => state.teachers)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        level: '1',
        experience: '',
        rating: '4.5',
        students: '0',
        avatar: '👩‍🏫',
        bio: '',
        specialties: '',
        schedule: ''
    })
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        dispatch(fetchTeachers())
    }, [dispatch])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSpecialtiesChange = (e) => {
        const value = e.target.value
        setFormData(prev => ({
            ...prev,
            specialties: value
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required'
        }
        if (!formData.level || parseInt(formData.level) < 1 || parseInt(formData.level) > 8) {
            newErrors.level = 'Level must be between 1 and 8'
        }
        if (!formData.experience.trim()) {
            newErrors.experience = 'Experience is required'
        }
        if (!formData.bio.trim()) {
            newErrors.bio = 'Bio is required'
        }
        if (!formData.schedule.trim()) {
            newErrors.schedule = 'Schedule is required'
        }
        if (!formData.specialties.trim()) {
            newErrors.specialties = 'At least one specialty is required'
        }

        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        // Check if level already has 2 teachers (only for new teachers, not when editing)
        if (!editingTeacher) {
            const levelTeachers = teachers.filter(t => t.level === parseInt(formData.level))
            if (levelTeachers.length >= 2) {
                setFormErrors({ level: `Level ${formData.level} already has 2 teachers. Each level can only have 2 teachers.` })
                return
            }
        }

        try {
            const specialtiesArray = formData.specialties.split(',').map(s => s.trim()).filter(s => s)
            const teacherData = {
                ...formData,
                level: parseInt(formData.level),
                rating: parseFloat(formData.rating),
                students: parseInt(formData.students),
                specialties: specialtiesArray
            }

            if (editingTeacher) {
                await dispatch(updateTeacher({ id: editingTeacher._id, teacherData })).unwrap()
            } else {
                await dispatch(createTeacher(teacherData)).unwrap()
            }

            // Reset form
            setFormData({
                name: '',
                subject: '',
                level: '1',
                experience: '',
                rating: '4.5',
                students: '0',
                avatar: '👩‍🏫',
                bio: '',
                specialties: '',
                schedule: ''
            })
            setIsFormOpen(false)
            setEditingTeacher(null)
            setFormErrors({})
            // Refresh teachers list
            dispatch(fetchTeachers())
        } catch (error) {
            console.error('Failed to save teacher:', error)
        }
    }

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher)
        setFormData({
            name: teacher.name,
            subject: teacher.subject,
            level: String(teacher.level),
            experience: teacher.experience,
            rating: String(teacher.rating),
            students: String(teacher.students),
            avatar: teacher.avatar || '👩‍🏫',
            bio: teacher.bio,
            specialties: Array.isArray(teacher.specialties) ? teacher.specialties.join(', ') : teacher.specialties || '',
            schedule: teacher.schedule
        })
        setIsFormOpen(true)
    }

    const handleDelete = async (teacherId) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) {
            return
        }

        try {
            await dispatch(deleteTeacher(teacherId)).unwrap()
            dispatch(fetchTeachers())
        } catch (error) {
            console.error('Failed to delete teacher:', error)
        }
    }

    const handleCancel = () => {
        setIsFormOpen(false)
        setEditingTeacher(null)
        setFormData({
            name: '',
            subject: '',
            level: '1',
            experience: '',
            rating: '4.5',
            students: '0',
            avatar: '👩‍🏫',
            bio: '',
            specialties: '',
            schedule: ''
        })
        setFormErrors({})
    }

    // Group teachers by level
    const teachersByLevel = {}
    teachers.forEach(teacher => {
        if (!teachersByLevel[teacher.level]) {
            teachersByLevel[teacher.level] = []
        }
        teachersByLevel[teacher.level].push(teacher)
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Teacher Management</h2>
                    <p className="text-slate-400">Create and manage teachers by level</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg cursor-pointer transition hover:bg-violet-500"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Teacher
                </button>
            </div>

            {/* Error state */}
            {error && (
                <div className="animate-fade-in rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {typeof error === 'string' ? error : 'An error occurred'}
                </div>
            )}

            {/* Create/Edit Teacher Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-2xl bg-slate-800 p-6 shadow-2xl ring-1 ring-white/10 animate-fade-in my-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {editingTeacher ? 'Edit Teacher' : 'Create New Teacher'}
                            </h3>
                            <button
                                onClick={handleCancel}
                                className="text-slate-400 hover:text-white cursor-pointer transition"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Teacher Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                            formErrors.name
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                        }`}
                                        placeholder="Sarah Johnson"
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-sm text-rose-400">{formErrors.name}</p>
                                    )}
                                </div>

                                {/* Subject */}
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                            formErrors.subject
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                        }`}
                                        placeholder="English Language"
                                    />
                                    {formErrors.subject && (
                                        <p className="mt-1 text-sm text-rose-400">{formErrors.subject}</p>
                                    )}
                                </div>

                                {/* Level */}
                                <div>
                                    <label htmlFor="level" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Level (1-8) * <span className="text-xs text-slate-400">(Max 2 teachers per level)</span>
                                    </label>
                                    <select
                                        id="level"
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border px-4 py-3 text-slate-900 bg-white cursor-pointer transition focus:outline-none focus:ring-2 ${
                                            formErrors.level
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                        }`}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(level => {
                                            const levelTeachers = teachers.filter(t => t.level === level)
                                            const count = levelTeachers.length
                                            const isFull = count >= 2
                                            const isEditingThisLevel = editingTeacher && editingTeacher.level === level
                                            const canSelect = !isFull || isEditingThisLevel
                                            
                                            return (
                                                <option 
                                                    key={level} 
                                                    value={level}
                                                    disabled={!canSelect && !editingTeacher}
                                                >
                                                    Level {level} {isFull && !isEditingThisLevel ? `(Full - ${count}/2)` : `(${count}/2)`}
                                                </option>
                                            )
                                        })}
                                    </select>
                                    {formErrors.level && (
                                        <p className="mt-1 text-sm text-rose-400">{formErrors.level}</p>
                                    )}
                                    {(() => {
                                        const selectedLevel = parseInt(formData.level)
                                        const levelTeachers = teachers.filter(t => t.level === selectedLevel && (!editingTeacher || t._id !== editingTeacher._id))
                                        const count = levelTeachers.length
                                        if (count >= 2 && !editingTeacher) {
                                            return (
                                                <p className="mt-1 text-sm text-amber-400">
                                                    ⚠️ Level {selectedLevel} already has 2 teachers. Please select a different level.
                                                </p>
                                            )
                                        } else if (count === 1 && !editingTeacher) {
                                            return (
                                                <p className="mt-1 text-sm text-slate-400">
                                                    ✓ Level {selectedLevel} has 1 teacher. You can add 1 more.
                                                </p>
                                            )
                                        } else if (count === 0 && !editingTeacher) {
                                            return (
                                                <p className="mt-1 text-sm text-slate-400">
                                                    ✓ Level {selectedLevel} has no teachers. You can add 2 teachers.
                                                </p>
                                            )
                                        }
                                        return null
                                    })()}
                                </div>

                                {/* Experience */}
                                <div>
                                    <label htmlFor="experience" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Experience *
                                    </label>
                                    <input
                                        type="text"
                                        id="experience"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                            formErrors.experience
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                        }`}
                                        placeholder="5 years"
                                    />
                                    {formErrors.experience && (
                                        <p className="mt-1 text-sm text-rose-400">{formErrors.experience}</p>
                                    )}
                                </div>

                                {/* Rating */}
                                <div>
                                    <label htmlFor="rating" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Rating
                                    </label>
                                    <input
                                        type="number"
                                        id="rating"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                    />
                                </div>

                                {/* Students */}
                                <div>
                                    <label htmlFor="students" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Number of Students
                                    </label>
                                    <input
                                        type="number"
                                        id="students"
                                        name="students"
                                        value={formData.students}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                    />
                                </div>

                                {/* Avatar */}
                                <div>
                                    <label htmlFor="avatar" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Avatar (Emoji)
                                    </label>
                                    <input
                                        type="text"
                                        id="avatar"
                                        name="avatar"
                                        value={formData.avatar}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                        placeholder="👩‍🏫"
                                    />
                                </div>

                                {/* Schedule */}
                                <div>
                                    <label htmlFor="schedule" className="block text-sm font-semibold text-slate-300 mb-2">
                                        Schedule *
                                    </label>
                                    <input
                                        type="text"
                                        id="schedule"
                                        name="schedule"
                                        value={formData.schedule}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                            formErrors.schedule
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                        }`}
                                        placeholder="Mon-Fri, 9:00 AM - 5:00 PM"
                                    />
                                    {formErrors.schedule && (
                                        <p className="mt-1 text-sm text-rose-400">{formErrors.schedule}</p>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label htmlFor="bio" className="block text-sm font-semibold text-slate-300 mb-2">
                                    Bio *
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                        formErrors.bio
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                            : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                    }`}
                                    placeholder="Passionate teacher with expertise in..."
                                />
                                {formErrors.bio && (
                                    <p className="mt-1 text-sm text-rose-400">{formErrors.bio}</p>
                                )}
                            </div>

                            {/* Specialties */}
                            <div>
                                <label htmlFor="specialties" className="block text-sm font-semibold text-slate-300 mb-2">
                                    Specialties (comma-separated) *
                                </label>
                                <input
                                    type="text"
                                    id="specialties"
                                    name="specialties"
                                    value={formData.specialties}
                                    onChange={handleSpecialtiesChange}
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 cursor-text transition focus:outline-none focus:ring-2 ${
                                        formErrors.specialties
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                            : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                    }`}
                                    placeholder="Grammar, Conversation, Writing"
                                />
                                {formErrors.specialties && (
                                    <p className="mt-1 text-sm text-rose-400">{formErrors.specialties}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 rounded-xl border border-slate-600 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 cursor-pointer transition hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white cursor-pointer transition hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Create Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Teachers List by Level */}
            <div className="space-y-6">
                {loading && teachers.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
                        <p className="mt-4 text-slate-400">Loading teachers...</p>
                    </div>
                ) : teachers.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-8 text-center">
                        <p className="text-slate-400">No teachers found. Create your first teacher!</p>
                    </div>
                ) : (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(level => {
                        const levelTeachers = teachersByLevel[level] || []
                        if (levelTeachers.length === 0) return null

                        return (
                            <div key={level} className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur overflow-hidden">
                                <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4">
                                    <h3 className="text-xl font-bold text-white">Level {level}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Subject</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rating</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Students</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {levelTeachers.map((teacher) => (
                                                <tr key={teacher._id} className="hover:bg-white/5 transition">
                                                    <td className="px-6 py-4 text-sm text-white">{teacher.avatar} {teacher.name}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-300">{teacher.subject}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-300">⭐ {teacher.rating}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-300">{teacher.students}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEdit(teacher)}
                                                                className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400 transition-all duration-200 hover:bg-indigo-500/30 hover:scale-110 cursor-pointer"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(teacher._id)}
                                                                className="rounded-lg bg-rose-500/20 p-2 text-rose-400 transition-all duration-200 hover:bg-rose-500/30 hover:scale-110 cursor-pointer"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default TeacherManagement

