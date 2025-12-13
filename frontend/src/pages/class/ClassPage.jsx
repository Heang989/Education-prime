import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchTeachers } from '../../store/slices/teachersSlice'

const ClassPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { teachers, loading, error } = useSelector((state) => state.teachers)

    useEffect(() => {
        dispatch(fetchTeachers())
    }, [dispatch])

    // Group teachers by level and ensure exactly 2 teachers per level
    const teachersByLevel = {}
    for (let level = 1; level <= 8; level++) {
        const levelTeachers = teachers.filter(teacher => teacher.level === level)
        // Ensure we only show 2 teachers per level (take first 2 if more exist)
        teachersByLevel[level] = levelTeachers.slice(0, 2)
    }

    // Create levels data structure - always show 2 slots per level
    const levelsData = []
    for (let level = 1; level <= 8; level++) {
        const levelTeachers = teachersByLevel[level] || []
        // Ensure we always have 2 teacher slots (fill with null if missing)
        const teachersWithSlots = [
            levelTeachers[0] || null,
            levelTeachers[1] || null
        ]
        levelsData.push({
            level,
            teachers: teachersWithSlots
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Teachers</h1>
                    <p className="text-gray-600">Meet our experienced and dedicated instructors by level</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading teachers...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">Error loading teachers: {error}</p>
                        <button
                            onClick={() => dispatch(fetchTeachers())}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Levels Container */}
                {!loading && !error && (
                    <div className="space-y-8">
                        {levelsData.map(({ level, teachers }) => (
                        <div
                            key={level}
                            className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 overflow-hidden"
                        >
                            {/* Level Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
                                <h2 className="text-2xl font-bold text-white">Level {level}</h2>
                            </div>

                            {/* Teachers Grid for this Level - Always show 2 slots */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {teachers.map((teacher, index) => {
                                        if (!teacher) {
                                            // Empty slot - show placeholder
                                            return (
                                                <div
                                                    key={`empty-${level}-${index}`}
                                                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md border-2 border-dashed border-gray-300"
                                                >
                                                    <div className="p-6 text-center">
                                                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-4xl mx-auto mb-4">
                                                            👤
                                                        </div>
                                                        <p className="text-gray-500 font-medium">Teacher Slot {index + 1}</p>
                                                        <p className="text-sm text-gray-400 mt-2">Available for assignment</p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        
                                        // Teacher card
                                        return (
                                            <div
                                                key={teacher._id || teacher.id}
                                                className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100"
                                            >
                                                {/* Teacher Card */}
                                                <div className="p-6">
                                                    {/* Header Section */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl shadow-md">
                                                                {teacher.avatar}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-800">{teacher.name}</h3>
                                                                <p className="text-indigo-600 font-semibold">{teacher.subject}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center space-x-1 mb-1">
                                                                <span className="text-yellow-400 text-xl">⭐</span>
                                                                <span className="text-lg font-bold text-gray-800">{teacher.rating?.toFixed(1) || '4.5'}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{teacher.students || 0} students</p>
                                                        </div>
                                                    </div>

                                                    {/* Bio */}
                                                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">{teacher.bio}</p>

                                                    {/* Experience */}
                                                    <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="font-medium">Experience: {teacher.experience}</span>
                                                    </div>

                                                    {/* Specialties */}
                                                    {teacher.specialties && teacher.specialties.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-semibold text-gray-700 mb-2">Specialties:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {Array.isArray(teacher.specialties) ? (
                                                                    teacher.specialties.map((specialty, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                                                        >
                                                                            {specialty}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                                                        {teacher.specialties}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Schedule */}
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>{teacher.schedule}</span>
                                                    </div>

                                                    {/* Action Button */}
                                                    <button 
                                                        onClick={() => navigate(`/teacher/${teacher._id || teacher.id}/lessons`)}
                                                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                                                    >
                                                        View Lession
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClassPage

