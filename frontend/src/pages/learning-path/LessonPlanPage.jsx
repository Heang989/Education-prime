import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LessonPlanPage = () => {
    const navigate = useNavigate()
    const [expandedSection, setExpandedSection] = useState(1)

    // Lesson plan structure
    const lessonPlan = {
        title: "Let's practice Khmer!",
        subtitle: "Practice reading words with Khmer characters",
        sections: [
            {
                id: 1,
                title: "SECTION 1, UNIT 1",
                name: "Name food and drinks",
                units: [
                    { id: 1, name: "Greetings", locked: false, completed: false },
                    { id: 2, name: "Basic Phrases", locked: false, completed: false },
                    { id: 3, name: "Numbers", locked: true, completed: false },
                ]
            },
            {
                id: 2,
                title: "SECTION 1, UNIT 2",
                name: "Talk about nationalities",
                units: [
                    { id: 4, name: "Countries", locked: true, completed: false },
                    { id: 5, name: "Languages", locked: true, completed: false },
                ]
            },
            {
                id: 3,
                title: "SECTION 1, UNIT 3",
                name: "Discuss professions",
                units: [
                    { id: 6, name: "Jobs", locked: true, completed: false },
                    { id: 7, name: "Workplace", locked: true, completed: false },
                ]
            },
            {
                id: 4,
                title: "SECTION 1, UNIT 4",
                name: "Discuss your courses",
                units: [
                    { id: 8, name: "School Subjects", locked: true, completed: false },
                    { id: 9, name: "Study Verbs", locked: true, completed: false },
                ]
            },
            {
                id: 5,
                title: "SECTION 1, UNIT 5",
                name: "Use possessive pronouns",
                units: [
                    { id: 10, name: "My/Your/His/Her", locked: true, completed: false },
                    { id: 11, name: "Our/Their", locked: true, completed: false },
                ]
            },
        ]
    }

    const handleUnitClick = (unit) => {
        if (!unit.locked) {
            navigate(`/lesson/${unit.id}`)
        }
    }

    const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/learning-path')}
                            className="text-gray-600 hover:text-gray-900 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">5</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">7</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">571</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{lessonPlan.title}</h1>
                    <p className="text-gray-600">{lessonPlan.subtitle}</p>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {lessonPlan.sections.map((section) => (
                        <div
                            key={section.id}
                            className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden transition-all"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                                <div className="text-left">
                                    <div className="text-xs font-bold text-gray-500 mb-1">{section.title}</div>
                                    <div className="text-lg font-bold text-gray-900">{section.name}</div>
                                </div>
                                <svg
                                    className={`w-6 h-6 text-gray-400 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Units List */}
                            {expandedSection === section.id && (
                                <div className="border-t border-gray-200 bg-gray-50 p-4">
                                    <div className="space-y-2">
                                        {section.units.map((unit) => (
                                            <button
                                                key={unit.id}
                                                onClick={() => handleUnitClick(unit)}
                                                disabled={unit.locked}
                                                className={`
                          w-full px-4 py-3 rounded-xl flex items-center justify-between
                          transition-all
                          ${unit.locked
                                                        ? 'bg-gray-200 cursor-not-allowed opacity-60'
                                                        : 'bg-white hover:bg-gray-100 shadow-sm hover:shadow-md cursor-pointer'
                                                    }
                        `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {unit.locked ? (
                                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <span className={`font-semibold ${unit.locked ? 'text-gray-500' : 'text-gray-900'}`}>
                                                        {unit.name}
                                                    </span>
                                                </div>
                                                {!unit.locked && (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Sidebar Promotions (Optional) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Super Duolingo Promo */}
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-xs font-bold mb-1">SUPER</div>
                                <h3 className="text-xl font-bold">Try Super for free</h3>
                            </div>
                            <div className="text-4xl">👑</div>
                        </div>
                        <p className="text-sm mb-4 opacity-90">No ads, personalized practice, and unlimited Legendary!</p>
                        <button className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition">
                            TRY 1 WEEK FREE
                        </button>
                    </div>

                    {/* Leaderboards Unlock */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Unlock Leaderboards!</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">5</span>
                            </div>
                            <p className="text-sm text-gray-600">Complete 5 more lessons to start competing</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LessonPlanPage
