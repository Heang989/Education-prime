import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RoadGoalMap from './RoadGoalMap'
import LearningPathVertical from './LearningPathVertical'
import AnimatedBackground from './AnimatedBackground'
import backgroundImage from '../../assets/bg/floating-islands-waterfalls-sky.jpg'
import SidebarPage from '../sidebar/SidebarPage.jsx'

// Level configurations
const levelConfigs = {
    beginner: {
        id: 'beginner',
        name: 'Beginner',
        subtitle: 'A1-A2 Level',
        emoji: '🌱',
        color: 'emerald',
        dailyNewWords: 15,
        dailyReviewWords: 10,
        examFrequency: 7, // days
        examType: 'weekly',
        duration: 12, // weeks
        totalWords: 1260,
        focus: ['Basic vocabulary', 'Greetings', 'Numbers', 'Common phrases'],
        description: 'Perfect for absolute beginners. Learn essential words and phrases for everyday situations.'
    },
    intermediate: {
        id: 'intermediate',
        name: 'Intermediate',
        subtitle: 'B1-B2 Level',
        emoji: '🚀',
        color: 'blue',
        dailyNewWords: 25,
        dailyReviewWords: 20,
        examFrequency: 5,
        examType: 'bi-weekly',
        duration: 16,
        totalWords: 2800,
        focus: ['Conversational phrases', 'Grammar basics', 'Cultural context', 'Sentence structure'],
        description: 'Build on your foundation with conversational skills and deeper cultural understanding.'
    },
    advanced: {
        id: 'advanced',
        name: 'Advanced',
        subtitle: 'C1-C2 Level',
        emoji: '🎓',
        color: 'purple',
        dailyNewWords: 35,
        dailyReviewWords: 30,
        examFrequency: 3,
        examType: 'tri-weekly',
        duration: 20,
        totalWords: 4900,
        focus: ['Complex grammar', 'Idioms', 'Formal/Informal registers', 'Literature', 'Advanced writing'],
        description: 'Master advanced concepts and achieve fluency in formal and informal Khmer.'
    }
}

// Achievement definitions
const achievements = [
    { id: 'first_day', name: 'First Steps', icon: '🎯', description: 'Complete your first day', requirement: 1 },
    { id: 'week_streak', name: 'Week Warrior', icon: '🔥', description: '7-day study streak', requirement: 7 },
    { id: 'month_streak', name: 'Monthly Master', icon: '💪', description: '30-day study streak', requirement: 30 },
    { id: 'hundred_words', name: 'Century Club', icon: '💯', description: 'Learn 100 words', requirement: 100 },
    { id: 'five_hundred_words', name: 'Vocabulary Vault', icon: '📚', description: 'Learn 500 words', requirement: 500 },
    { id: 'perfect_week', name: 'Perfect Week', icon: '⭐', description: 'Complete all tasks for 7 days', requirement: 7 },
    { id: 'exam_ace', name: 'Exam Ace', icon: '🏆', description: 'Score 90%+ on an exam', requirement: 90 },
    { id: 'level_complete', name: 'Level Master', icon: '👑', description: 'Complete a full level', requirement: 100 }
]

const LearningPathPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [hasStarted, setHasStarted] = useState(false)
    const [selectedLevel, setSelectedLevel] = useState(null)
    const [learningData, setLearningData] = useState(null)
    const [showLevelSelector, setShowLevelSelector] = useState(false)
    const [viewMode, setViewMode] = useState('roadmap') // 'roadmap' or 'vertical'
    const processedCompletions = useRef(new Set()) // Track processed lesson completions to prevent double-counting

    // Generate lessons data for vertical path view
    const generateLessonsFromData = (data, config) => {
        if (!data || !config) return []

        const lessons = []
        const currentWeekIndex = data.currentWeek - 1
        const totalWeeks = config.duration

        // Generate lessons for each week
        for (let week = 0; week < totalWeeks; week++) {
            const weekDay = (week * 7) + 1
            const isCompleted = data.currentDay > weekDay + 6
            const isCurrent = data.currentWeek - 1 === week
            const isLocked = week > currentWeekIndex

            // Main lesson for the week
            lessons.push({
                id: `${week + 1}-1`,
                level: week,
                label: `Week ${week + 1}`,
                icon: getWeekIcon(week),
                type: 'lesson',
                locked: isLocked,
                completed: isCompleted,
                stars: isCompleted ? Math.floor(Math.random() * 3) + 1 : 0
            })

            // Add exam every few weeks
            if ((week + 1) % Math.ceil(config.examFrequency / 7) === 0 && week < totalWeeks - 1) {
                lessons.push({
                    id: `exam-${week + 1}`,
                    level: week + 0.5,
                    label: 'Unit Test',
                    icon: '👑',
                    type: 'test',
                    locked: week >= currentWeekIndex,
                    completed: week < currentWeekIndex - 1,
                    stars: 0
                })
            }
        }

        return lessons.sort((a, b) => a.level - b.level)
    }

    // Get icon based on week number
    const getWeekIcon = (week) => {
        const icons = ['👋', '👤', '🌍', '🌏', '🔢', '👨‍👩‍👧', '👶', '🍕', '🎨', '🐶', '🏠', '🚗',
            '📚', '✈️', '🎵', '⚽', '🍎', '☀️', '🌙', '⭐']
        return icons[week % icons.length]
    }

    // Load learning data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('khmerLearningPath')
        if (saved) {
            const data = JSON.parse(saved)
            setLearningData(data)
            setSelectedLevel(data.selectedLevel)
            setHasStarted(true)
        }
    }, [])

    // Handle lesson completion when returning from lesson page
    useEffect(() => {
        if (location.state?.lessonCompleted && learningData && selectedLevel) {
            const result = location.state
            const taskType = result.taskCompleted || 'newWords'

            // Create a unique key for this completion to prevent double-counting
            const completionKey = `${result.lessonId || 'lesson'}-${taskType}-${result.completedAt || Date.now()}`

            // Check if we've already processed this completion
            if (processedCompletions.current.has(completionKey)) {
                console.log('⚠️ Duplicate completion detected, skipping...')
                // Clear the state and return early
                window.history.replaceState({}, document.title)
                return
            }

            // Check if task already completed today to prevent double-counting
            if (learningData.todayCompleted[taskType]) {
                console.log(`⚠️ Task "${taskType}" already completed today, skipping...`)
                window.history.replaceState({}, document.title)
                return
            }

            // Mark this completion as processed
            processedCompletions.current.add(completionKey)

            // Always use daily goal for task completion, not the total words in lesson
            const config = levelConfigs[selectedLevel]
            // For newWords task, always add the daily goal amount (not total words in lesson)
            const wordsToAdd = taskType === 'newWords' ? config.dailyNewWords : 0

            setLearningData(prevData => {
                if (!prevData) return prevData

                // Double-check task not already completed
                if (prevData.todayCompleted[taskType]) {
                    console.log(`⚠️ Task "${taskType}" already completed, skipping update...`)
                    return prevData
                }

                const updated = {
                    ...prevData,
                    progress: {
                        ...prevData.progress,
                        totalWordsLearned: prevData.progress.totalWordsLearned + wordsToAdd
                    },
                    todayCompleted: {
                        ...prevData.todayCompleted,
                        // Mark the task that was completed
                        [taskType]: true
                    }
                }

                // Update level completion
                updated.progress.levelCompletion = Math.min(
                    Math.round((updated.progress.totalWordsLearned / config.totalWords) * 100),
                    100
                )

                // Check if task completed (only newWords)
                const allTasksCompleted = updated.todayCompleted.newWords === true
                if (allTasksCompleted) {
                    // Update streak if all tasks completed
                    updated.progress.currentStreak += 1
                    updated.progress.longestStreak = Math.max(
                        updated.progress.longestStreak,
                        updated.progress.currentStreak
                    )

                    // Mark day as completed and advance to next day
                    updated.currentDay += 1

                    // Calculate new week if needed (7 days per week)
                    const newWeek = Math.ceil(updated.currentDay / 7)
                    if (newWeek > updated.currentWeek) {
                        updated.currentWeek = newWeek
                    }

                    // Reset today's tasks for the new day
                    updated.todayCompleted = {
                        newWords: false,
                        reviewWords: false,
                        quiz: false,
                        studyTime: false
                    }

                    // Save completion to daily history
                    const today = new Date().toISOString().split('T')[0]
                    if (!updated.dailyHistory) updated.dailyHistory = []
                    updated.dailyHistory.push({
                        date: today,
                        wordsLearned: wordsToAdd,
                        tasksCompleted: ['newWords'],
                        completed: true
                    })

                    console.log(`🎉 All tasks completed! Day ${updated.currentDay - 1} completed. Moving to Day ${updated.currentDay}`)
                }

                // Check achievements
                checkAchievements(updated)

                localStorage.setItem('khmerLearningPath', JSON.stringify(updated))

                // Show success message
                console.log(`✅ Task "${taskType}" completed! Words learned: ${wordsToAdd} (daily goal: ${config.dailyNewWords})`)

                return updated
            })

            // Clear the state to prevent re-triggering
            window.history.replaceState({}, document.title)

            // Clean up old completion keys (keep only last 10)
            if (processedCompletions.current.size > 10) {
                const keysArray = Array.from(processedCompletions.current)
                processedCompletions.current = new Set(keysArray.slice(-10))
            }
        }
    }, [location.state, selectedLevel]) // Removed learningData from dependencies to prevent re-triggering

    // Initialize learning path
    const startLearningPath = (levelId) => {
        const config = levelConfigs[levelId]
        const today = new Date().toISOString().split('T')[0]

        const initialData = {
            userId: 'user_' + Date.now(),
            selectedLevel: levelId,
            startDate: today,
            currentDay: 1,
            currentWeek: 1,

            dailyGoals: {
                newWords: config.dailyNewWords,
                reviewWords: config.dailyReviewWords,
                quizzes: 1,
                studyMinutes: 30
            },

            progress: {
                totalWordsLearned: 0,
                totalQuizzesCompleted: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalStudyTime: 0,
                levelCompletion: 0
            },

            dailyHistory: [],

            examSchedule: [
                {
                    id: 1,
                    date: getNextExamDate(today, config.examFrequency),
                    type: config.examType,
                    status: 'upcoming',
                    score: null
                }
            ],

            achievements: achievements.map(a => ({ ...a, unlocked: false, date: null })),

            todayCompleted: {
                newWords: false,
                reviewWords: false,
                quiz: false,
                studyTime: false
            }
        }

        localStorage.setItem('khmerLearningPath', JSON.stringify(initialData))
        setLearningData(initialData)
        setSelectedLevel(levelId)
        setHasStarted(true)
        setShowLevelSelector(false)
    }

    // Calculate next exam date
    const getNextExamDate = (startDate, frequency) => {
        const date = new Date(startDate)
        date.setDate(date.getDate() + frequency)
        return date.toISOString().split('T')[0]
    }

    // Calculate days until exam
    const getDaysUntilExam = () => {
        if (!learningData?.examSchedule?.length) return null
        const nextExam = learningData.examSchedule.find(e => e.status === 'upcoming')
        if (!nextExam) return null

        const today = new Date()
        const examDate = new Date(nextExam.date)
        const diffTime = examDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // Mark task as complete
    const completeTask = (taskType) => {
        const updated = {
            ...learningData,
            todayCompleted: {
                ...learningData.todayCompleted,
                [taskType]: true
            }
        }

        // Update progress
        if (taskType === 'newWords') {
            updated.progress.totalWordsLearned += updated.dailyGoals.newWords
        } else if (taskType === 'quiz') {
            updated.progress.totalQuizzesCompleted += 1
        }

        // Check if task completed (only newWords)
        const allCompleted = updated.todayCompleted.newWords === true
        if (allCompleted) {
            updated.progress.currentStreak += 1
            updated.progress.longestStreak = Math.max(updated.progress.longestStreak, updated.progress.currentStreak)

            // Mark day as completed and advance to next day
            updated.currentDay += 1

            // Calculate new week if needed (7 days per week)
            const newWeek = Math.ceil(updated.currentDay / 7)
            if (newWeek > updated.currentWeek) {
                updated.currentWeek = newWeek
            }

            // Reset today's tasks for the new day
            updated.todayCompleted = {
                newWords: false,
                reviewWords: false,
                quiz: false,
                studyTime: false
            }

            // Save completion to daily history
            const today = new Date().toISOString().split('T')[0]
            if (!updated.dailyHistory) updated.dailyHistory = []
            updated.dailyHistory.push({
                date: today,
                wordsLearned: updated.dailyGoals.newWords,
                tasksCompleted: ['newWords'],
                completed: true
            })

            // Check achievements
            checkAchievements(updated)

            console.log(`🎉 All tasks completed! Day ${updated.currentDay - 1} completed. Moving to Day ${updated.currentDay}`)
        }

        // Update level completion
        const config = levelConfigs[selectedLevel]
        updated.progress.levelCompletion = Math.min(
            Math.round((updated.progress.totalWordsLearned / config.totalWords) * 100),
            100
        )

        localStorage.setItem('khmerLearningPath', JSON.stringify(updated))
        setLearningData(updated)
    }

    // Handle lesson completion
    const handleLessonComplete = (result) => {
        const config = levelConfigs[selectedLevel]
        // Always use daily goal, not total words in lesson
        const wordsToAdd = config.dailyNewWords

        // Check if task already completed to prevent double-counting
        if (learningData.todayCompleted.newWords) {
            console.log('⚠️ Task already completed today, skipping...')
            return
        }

        const updated = {
            ...learningData,
            progress: {
                ...learningData.progress,
                totalWordsLearned: learningData.progress.totalWordsLearned + wordsToAdd
            },
            todayCompleted: {
                ...learningData.todayCompleted,
                newWords: true // Mark new words task as complete
            }
        }

        // Update level completion
        updated.progress.levelCompletion = Math.min(
            Math.round((updated.progress.totalWordsLearned / config.totalWords) * 100),
            100
        )

        // Check achievements
        checkAchievements(updated)

        localStorage.setItem('khmerLearningPath', JSON.stringify(updated))
        setLearningData(updated)
    }

    // Check and unlock achievements
    const checkAchievements = (data) => {
        const updated = { ...data }
        let hasNewAchievement = false

        updated.achievements = updated.achievements.map(achievement => {
            if (achievement.unlocked) return achievement

            let shouldUnlock = false

            if (achievement.id === 'first_day' && data.currentDay >= 1) shouldUnlock = true
            if (achievement.id === 'week_streak' && data.progress.currentStreak >= 7) shouldUnlock = true
            if (achievement.id === 'month_streak' && data.progress.currentStreak >= 30) shouldUnlock = true
            if (achievement.id === 'hundred_words' && data.progress.totalWordsLearned >= 100) shouldUnlock = true
            if (achievement.id === 'five_hundred_words' && data.progress.totalWordsLearned >= 500) shouldUnlock = true
            if (achievement.id === 'level_complete' && data.progress.levelCompletion >= 100) shouldUnlock = true

            if (shouldUnlock) {
                hasNewAchievement = true
                return { ...achievement, unlocked: true, date: new Date().toISOString().split('T')[0] }
            }

            return achievement
        })

        if (hasNewAchievement) {
            localStorage.setItem('khmerLearningPath', JSON.stringify(updated))
            setLearningData(updated)
        }
    }

    // Reset learning path
    const resetLearningPath = () => {
        if (confirm('Are you sure you want to reset your learning progress? This cannot be undone.')) {
            localStorage.removeItem('khmerLearningPath')
            setLearningData(null)
            setSelectedLevel(null)
            setHasStarted(false)
        }
    }

    const config = selectedLevel ? levelConfigs[selectedLevel] : null
    const daysUntilExam = getDaysUntilExam()
    const unlockedAchievements = learningData?.achievements?.filter(a => a.unlocked) || []

    // Level Selection Screen
    if (!hasStarted || showLevelSelector) {
        return (
            <div className="w-full space-y-8">
                <div className="px-3 text-center sm:px-6 lg:px-0">
                    <p className="text-sm font-semibold uppercase tracking-widest text-rose-500">
                        Personalized Learning
                    </p>
                    <h1 className="mt-3 text-4xl font-bold text-slate-900">
                        Choose Your Learning Path
                    </h1>
                    <p className="mt-2 text-base text-slate-500">
                        Select your proficiency level to get a personalized study plan with daily goals and scheduled assessments.
                    </p>
                </div>

                {/* Level Cards */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {Object.values(levelConfigs).map((level) => (
                        <button
                            key={level.id}
                            onClick={() => startLearningPath(level.id)}
                            className="group relative overflow-hidden rounded-3xl bg-white p-8 text-left shadow-xl ring-1 ring-black/5 transition hover:shadow-2xl hover:scale-105"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-${level.color}-50 to-${level.color}-100 opacity-0 transition group-hover:opacity-100`}></div>

                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-5xl">{level.emoji}</span>
                                    <span className={`rounded-full bg-${level.color}-100 px-3 py-1 text-xs font-semibold text-${level.color}-600`}>
                                        {level.subtitle}
                                    </span>
                                </div>

                                <h3 className="mt-6 text-2xl font-bold text-slate-900">{level.name}</h3>
                                <p className="mt-2 text-sm text-slate-600">{level.description}</p>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Daily Words</span>
                                        <span className="font-semibold text-slate-900">{level.dailyNewWords} new + {level.dailyReviewWords} review</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Exams</span>
                                        <span className="font-semibold text-slate-900">Every {level.examFrequency} days</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Duration</span>
                                        <span className="font-semibold text-slate-900">{level.duration} weeks</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Total Words</span>
                                        <span className="font-semibold text-slate-900">{level.totalWords.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Focus Areas</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {level.focus.map((item, idx) => (
                                            <span key={idx} className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={`mt-6 rounded-xl bg-${level.color}-50 px-4 py-3 text-center text-sm font-semibold text-${level.color}-600 transition group-hover:bg-${level.color}-100`}>
                                    Start {level.name} Path →
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Info Section */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 ring-1 ring-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">📚 What You'll Get</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <p className="font-semibold text-slate-900">Daily Goals</p>
                                <p className="text-sm text-slate-600">Structured tasks to keep you on track</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📊</span>
                            <div>
                                <p className="font-semibold text-slate-900">Progress Tracking</p>
                                <p className="text-sm text-slate-600">Visual charts and statistics</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <p className="font-semibold text-slate-900">Scheduled Exams</p>
                                <p className="text-sm text-slate-600">Regular assessments to test knowledge</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <p className="font-semibold text-slate-900">Achievements</p>
                                <p className="text-sm text-slate-600">Unlock badges as you progress</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Main Dashboard - Duolingo Style Layout with Sidebar and Right Panel
  return (
    <div className="flex">
      <SidebarPage/>
      <div className="flex-1">
        <LearningPathVertical/>
      </div>
    </div>
  );
}

export default LearningPathPage
