import React, { useState } from 'react'

const RoadGoalMap = ({ learningData, levelConfig }) => {
    const [selectedMilestone, setSelectedMilestone] = useState(null)
    const [hoveredMilestone, setHoveredMilestone] = useState(null)

    if (!learningData || !levelConfig) return null

    const { currentDay, currentWeek, progress, examSchedule, achievements } = learningData
    const { duration, examFrequency, totalWords, dailyNewWords } = levelConfig

    // Calculate total days in the path
    const totalDays = duration * 7
    const currentProgress = Math.min((currentDay / totalDays) * 100, 100)

    // Generate milestones
    const generateMilestones = () => {
        const milestones = []
        
        // Week milestones (show every 2 weeks to avoid clutter, but mark all weeks)
        for (let week = 1; week <= duration; week++) {
            const weekDay = (week - 1) * 7 + 1
            const isCompleted = currentDay >= weekDay + 6 // Week is complete if we've passed day 7
            const isCurrent = currentDay >= weekDay && currentDay < weekDay + 7
            
            // Show all weeks, but make some smaller
            const isMajorWeek = week % 2 === 1 || week === duration || week === 1
            
            milestones.push({
                id: `week-${week}`,
                type: 'week',
                week: week,
                day: weekDay,
                label: `Week ${week}`,
                isCompleted,
                isCurrent,
                isMajor: isMajorWeek,
                description: `Complete Week ${week} tasks and activities`,
                wordsAtMilestone: Math.min(weekDay * dailyNewWords, totalWords)
            })
        }

        // Exam milestones
        examSchedule.forEach((exam, index) => {
            const examDate = new Date(exam.date)
            const startDate = new Date(learningData.startDate)
            const daysDiff = Math.floor((examDate - startDate) / (1000 * 60 * 60 * 24))
            
            if (daysDiff > 0 && daysDiff <= totalDays) {
                const isCompleted = exam.status === 'completed' || currentDay >= daysDiff
                const isUpcoming = exam.status === 'upcoming' && currentDay < daysDiff
                
                milestones.push({
                    id: `exam-${exam.id}`,
                    type: 'exam',
                    examId: exam.id,
                    day: daysDiff,
                    label: `${exam.type} Exam`,
                    isCompleted,
                    isUpcoming,
                    description: `Assessment to test your progress`,
                    exam: exam
                })
            }
        })

        // Achievement milestones (key ones)
        const keyAchievements = [
            { id: 'first_day', day: 1, label: 'First Steps', icon: '🎯' },
            { id: 'hundred_words', day: Math.ceil(100 / dailyNewWords), label: '100 Words', icon: '💯' },
            { id: 'week_streak', day: 7, label: 'Week Warrior', icon: '🔥' },
            { id: 'five_hundred_words', day: Math.ceil(500 / dailyNewWords), label: '500 Words', icon: '📚' },
            { id: 'month_streak', day: 30, label: 'Monthly Master', icon: '💪' }
        ]

        keyAchievements.forEach(achievement => {
            if (achievement.day <= totalDays) {
                const achievementData = achievements.find(a => a.id === achievement.id)
                const isUnlocked = achievementData?.unlocked || false
                
                milestones.push({
                    id: `achievement-${achievement.id}`,
                    type: 'achievement',
                    achievementId: achievement.id,
                    day: achievement.day,
                    label: achievement.label,
                    icon: achievement.icon,
                    isUnlocked,
                    description: achievementData?.description || 'Unlock this achievement',
                    achievement: achievementData
                })
            }
        })

        // Sort milestones by day
        return milestones.sort((a, b) => a.day - b.day)
    }

    const milestones = generateMilestones()
    const completedMilestones = milestones.filter(m => m.isCompleted || m.isUnlocked).length
    const totalMilestones = milestones.length

    // Get milestone position percentage
    const getMilestonePosition = (day) => {
        return Math.min((day / totalDays) * 100, 100)
    }

    // Get color based on milestone type and status
    const getMilestoneColor = (milestone) => {
        if (milestone.type === 'exam') {
            if (milestone.isCompleted) return 'bg-emerald-500'
            if (milestone.isUpcoming) return 'bg-rose-500'
            return 'bg-slate-400'
        }
        if (milestone.type === 'achievement') {
            if (milestone.isUnlocked) return 'bg-amber-500'
            return 'bg-slate-400'
        }
        if (milestone.type === 'week') {
            if (milestone.isCompleted) return 'bg-indigo-500'
            if (milestone.isCurrent) return 'bg-indigo-400'
            return 'bg-slate-400'
        }
        return 'bg-slate-400'
    }

    // Get milestone size
    const getMilestoneSize = (milestone) => {
        if (milestone.type === 'exam') return 'w-6 h-6'
        if (milestone.type === 'achievement') return 'w-5 h-5'
        if (milestone.type === 'week') {
            return milestone.isMajor ? 'w-5 h-5' : 'w-3 h-3'
        }
        return 'w-4 h-4'
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">🗺️ Learning Roadmap</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {completedMilestones} of {totalMilestones} milestones completed
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-indigo-600">{Math.round(currentProgress)}%</p>
                    <p className="text-xs text-slate-600">Overall Progress</p>
                </div>
            </div>

            {/* Roadmap Container */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 shadow-xl ring-1 ring-black/5">
                {/* Progress Bar Background */}
                <div className="relative mb-12">
                    <div className="h-3 w-full rounded-full bg-slate-200">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${currentProgress}%` }}
                        />
                    </div>
                    
                    {/* Milestones */}
                    <div className="relative -mt-6">
                        {milestones.map((milestone) => {
                            const position = getMilestonePosition(milestone.day)
                            const isPast = milestone.day <= currentDay
                            
                            return (
                                <div
                                    key={milestone.id}
                                    className="absolute -translate-x-1/2"
                                    style={{ left: `${position}%` }}
                                    onMouseEnter={() => setHoveredMilestone(milestone.id)}
                                    onMouseLeave={() => setHoveredMilestone(null)}
                                >
                                    {/* Milestone Marker */}
                                    <button
                                        onClick={() => setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)}
                                        className={`relative z-10 ${getMilestoneSize(milestone)} rounded-full ${getMilestoneColor(milestone)} shadow-lg transition-all duration-200 hover:scale-125 ${
                                            selectedMilestone === milestone.id ? 'ring-4 ring-indigo-300 scale-125' : ''
                                        } ${isPast ? 'ring-2 ring-white' : ''}`}
                                        title={milestone.label}
                                    >
                                        {milestone.type === 'achievement' && milestone.icon && (
                                            <span className="absolute inset-0 flex items-center justify-center text-xs">
                                                {milestone.icon}
                                            </span>
                                        )}
                                        {milestone.type === 'exam' && (
                                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                                📝
                                            </span>
                                        )}
                                    </button>

                                    {/* Milestone Label - Show for major milestones or when hovered/selected */}
                                    {(milestone.isMajor || milestone.type !== 'week' || hoveredMilestone === milestone.id || selectedMilestone === milestone.id) && (
                                        <div className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap ${
                                            hoveredMilestone === milestone.id || selectedMilestone === milestone.id
                                                ? 'opacity-100 translate-y-0 z-20'
                                                : milestone.isMajor || milestone.type !== 'week'
                                                ? 'opacity-70 translate-y-0'
                                                : 'opacity-0 translate-y-2 pointer-events-none'
                                        } transition-all duration-200`}>
                                            <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg ${
                                                milestone.isCompleted || milestone.isUnlocked
                                                    ? 'bg-emerald-500 text-white'
                                                    : milestone.isCurrent || milestone.isUpcoming
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-slate-500 text-white'
                                            }`}>
                                                {milestone.label}
                                            </div>
                                            <div className="mx-auto mt-1 h-2 w-0.5 bg-slate-300" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

            {/* Timeline Labels */}
            <div className="mt-8 flex justify-between text-xs text-slate-500">
                <div className="text-left">
                    <p className="font-semibold text-slate-700">Start</p>
                    <p className="text-slate-400">Day 1</p>
                    <p className="text-slate-400">Week 1</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold text-indigo-600">Current Position</p>
                    <p className="text-indigo-500">Day {currentDay}</p>
                    <p className="text-indigo-500">Week {currentWeek}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-slate-700">Goal</p>
                    <p className="text-slate-400">Day {totalDays}</p>
                    <p className="text-slate-400">Week {duration}</p>
                </div>
            </div>

            {/* Progress Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{progress.totalWordsLearned}</p>
                    <p className="text-xs text-slate-600">Words Learned</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{completedMilestones}</p>
                    <p className="text-xs text-slate-600">Milestones Reached</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{progress.currentStreak}</p>
                    <p className="text-xs text-slate-600">Day Streak</p>
                </div>
            </div>
            </div>

            {/* Milestone Details Panel */}
            {selectedMilestone && (
                <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
                    {(() => {
                        const milestone = milestones.find(m => m.id === selectedMilestone)
                        if (!milestone) return null

                        return (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {milestone.type === 'achievement' && milestone.icon && (
                                            <span className="text-3xl">{milestone.icon}</span>
                                        )}
                                        {milestone.type === 'exam' && (
                                            <span className="text-3xl">📝</span>
                                        )}
                                        {milestone.type === 'week' && (
                                            <span className="text-3xl">📅</span>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{milestone.label}</h3>
                                            <p className="text-sm text-slate-600">Day {milestone.day}</p>
                                        </div>
                                    </div>
                                    <div className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                                        milestone.isCompleted || milestone.isUnlocked
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : milestone.isCurrent || milestone.isUpcoming
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {milestone.isCompleted || milestone.isUnlocked
                                            ? 'Completed'
                                            : milestone.isCurrent || milestone.isUpcoming
                                            ? 'Active'
                                            : 'Upcoming'}
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600">{milestone.description}</p>

                                {milestone.type === 'week' && (
                                    <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Target Words</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                {milestone.wordsAtMilestone.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Status</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                {milestone.isCompleted ? '✓ Complete' : milestone.isCurrent ? 'In Progress' : 'Not Started'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {milestone.type === 'exam' && milestone.exam && (
                                    <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Exam Type</p>
                                            <p className="text-lg font-bold text-slate-900">{milestone.exam.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Date</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                {new Date(milestone.exam.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {milestone.exam.score !== null && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-slate-500">Score</p>
                                                <p className="text-lg font-bold text-slate-900">{milestone.exam.score}%</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {milestone.type === 'achievement' && milestone.achievement && (
                                    <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                                        <p className="text-xs font-semibold text-amber-700">Achievement Unlocked</p>
                                        <p className="mt-1 text-sm text-amber-900">
                                            {milestone.achievement.description}
                                        </p>
                                        {milestone.achievement.date && (
                                            <p className="mt-2 text-xs text-amber-600">
                                                Unlocked on {new Date(milestone.achievement.date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })()}
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                <p className="text-xs font-semibold text-slate-500 uppercase">Legend:</p>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-indigo-500" />
                    <span className="text-xs text-slate-600">Week Milestone</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-rose-500" />
                    <span className="text-xs text-slate-600">Exam</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-amber-500" />
                    <span className="text-xs text-slate-600">Achievement</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-600">Upcoming</span>
                </div>
            </div>
        </div>
    )
}

export default RoadGoalMap

