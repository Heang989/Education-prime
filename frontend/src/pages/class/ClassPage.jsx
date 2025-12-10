import React from 'react'

const ClassPage = () => {
    // Mock data for teachers - you can modify this later
    const teachers = [
        {
            id: 1,
            name: 'Sarah Johnson',
            subject: 'English Language',
            experience: '5 years',
            rating: 4.8,
            students: 1250,
            avatar: '👩‍🏫',
            bio: 'Passionate English teacher with expertise in grammar and conversation. Specializes in helping students improve their speaking and writing skills.',
            specialties: ['Grammar', 'Conversation', 'Writing'],
            schedule: 'Mon-Fri, 9:00 AM - 5:00 PM'
        },
        {
            id: 2,
            name: 'Michael Chen',
            subject: 'Mathematics',
            experience: '7 years',
            rating: 4.9,
            students: 1890,
            avatar: '👨‍🏫',
            bio: 'Experienced math teacher focusing on making complex concepts easy to understand. Expert in algebra, calculus, and problem-solving techniques.',
            specialties: ['Algebra', 'Calculus', 'Problem Solving'],
            schedule: 'Mon-Fri, 10:00 AM - 6:00 PM'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Teachers</h1>
                    <p className="text-gray-600">Meet our experienced and dedicated instructors</p>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
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
                                            <h2 className="text-2xl font-bold text-gray-800">{teacher.name}</h2>
                                            <p className="text-indigo-600 font-semibold">{teacher.subject}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center space-x-1 mb-1">
                                            <span className="text-yellow-400 text-xl">⭐</span>
                                            <span className="text-lg font-bold text-gray-800">{teacher.rating}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{teacher.students} students</p>
                                    </div>
                                </div>

                                {/* Bio */}
                                <p className="text-gray-600 mb-4 leading-relaxed">{teacher.bio}</p>

                                {/* Experience */}
                                <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Experience: {teacher.experience}</span>
                                </div>

                                {/* Specialties */}
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Specialties:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.specialties.map((specialty, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{teacher.schedule}</span>
                                </div>

                                {/* Action Button */}
                                <button className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ClassPage

