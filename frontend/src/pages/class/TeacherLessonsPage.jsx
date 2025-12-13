import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLessonsByLevel } from '../../store/slices/lessonsSlice'

const TeacherLessonsPage = () => {
    const { teacherId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { teachers } = useSelector((state) => state.teachers)
    const { lessons, loading: lessonsLoading } = useSelector((state) => state.lessons)

    // Find the teacher by ID
    const teacher = teachers.find(t => t._id === teacherId || t.id === teacherId)
    
    // Get teacher's level (default to 1 if not found)
    const teacherLevel = teacher?.level || 1

    // Fetch lessons for this specific teacher
    useEffect(() => {
        if (teacherId && teacherLevel) {
            // Fetch lessons by teacher and level
            dispatch(fetchLessonsByLevel({ level: teacherLevel, teacherId }))
        }
    }, [dispatch, teacherId, teacherLevel])

    // Get lessons for this specific teacher, sorted by lesson number
    const teacherLessons = lessons
        .filter(lesson => lesson.teacherId === teacherId && lesson.level === teacherLevel)
        .sort((a, b) => a.lessonNumber - b.lessonNumber)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/class')}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Teachers
                    </button>
                    
                    {teacher && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl shadow-md">
                                    {teacher.avatar}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-1">{teacher.name}</h1>
                                    <p className="text-indigo-600 font-semibold text-lg">{teacher.subject}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-yellow-400 text-lg">⭐</span>
                                            <span className="text-sm font-semibold text-gray-700">{teacher.rating?.toFixed(1) || '4.5'}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">•</span>
                                        <span className="text-sm text-gray-600">{teacher.experience}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-gray-800 mb-2">Lessons</h2>
                        <p className="text-gray-600">Choose a lesson to start learning</p>
                        {teacher && (
                            <p className="text-sm text-gray-500 mt-1">Level {teacherLevel} - {teacherLessons.length} lessons available</p>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {lessonsLoading && teacherLessons.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading lessons...</p>
                    </div>
                )}

                {/* No Lessons State */}
                {!lessonsLoading && teacherLessons.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">No lessons available for Level {teacherLevel} yet.</p>
                        <p className="text-sm text-gray-500">Lessons will appear here once they are created by an admin.</p>
                    </div>
                )}

                {/* Lessons Grid */}
                {teacherLessons.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teacherLessons.map((lesson) => {
                            // Determine difficulty based on lesson number
                            const getDifficulty = (lessonNum) => {
                                if (lessonNum <= 2) return { level: 'Beginner', color: 'bg-green-100 text-green-700' }
                                if (lessonNum <= 4) return { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' }
                                return { level: 'Advanced', color: 'bg-red-100 text-red-700' }
                            }
                            const difficulty = getDifficulty(lesson.lessonNumber)
                            const vocabCount = lesson.vocabulary?.length || 0
                            
                            return (
                                <div
                                    key={lesson._id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100 group cursor-pointer"
                                    onClick={() => {
                                        navigate(`/teacher/${teacherId}/lesson/${lesson._id}`)
                                    }}
                                >
                                    <div className="p-6">
                                        {/* Lesson Icon and Number */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                                📚
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-indigo-600">0{lesson.lessonNumber}</div>
                                                <div className="text-xs text-gray-500">Lesson</div>
                                            </div>
                                        </div>

                                        {/* Lesson Title */}
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {lesson.title}
                                        </h3>

                                        {/* Lesson Subtitle */}
                                        <p className="text-gray-600 text-sm mb-2">{lesson.titleEnglish}</p>
                                        <p className="text-indigo-600 font-semibold mb-4">{lesson.subtitle}</p>

                                        {/* Lesson Meta Info */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>{vocabCount} words</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficulty.color}`}>
                                                {difficulty.level}
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/teacher/${teacherId}/lesson/${lesson._id}`)
                                            }}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 transform group-hover:scale-105 shadow-md"
                                        >
                                            Start Lesson
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Progress Summary */}
                {teacherLessons.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                                    <span className="text-sm font-semibold text-indigo-600">0%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-3 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-600">0</div>
                                <div className="text-xs text-gray-500">of {teacherLessons.length} completed</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherLessonsPage


