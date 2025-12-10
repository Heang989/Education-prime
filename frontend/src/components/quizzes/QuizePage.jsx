import React, { useState, useEffect } from 'react'

const quizCategories = [
    { id: 'basics', label: 'Basic Phrases', emoji: '👋', color: 'violet', difficulty: 'Easy' },
    { id: 'vocabulary', label: 'Vocabulary', emoji: '📚', color: 'blue', difficulty: 'Medium' },
    { id: 'grammar', label: 'Grammar', emoji: '✍️', color: 'rose', difficulty: 'Hard' },
    { id: 'culture', label: 'Culture', emoji: '🎭', color: 'emerald', difficulty: 'Medium' },
    { id: 'mixed', label: 'Mixed Challenge', emoji: '🎯', color: 'amber', difficulty: 'Hard' }
]

const quizData = {
    basics: [
        {
            id: 1,
            type: 'multiple-choice',
            question: 'How do you say "Hello" in Khmer?',
            options: ['សួស្តី', 'អរគុណ', 'ទេ', 'បាទ'],
            correct: 0,
            explanation: 'សួស្តី (suos-dai) is the standard greeting in Khmer.'
        },
        {
            id: 2,
            type: 'multiple-choice',
            question: 'What does "អរគុណ" mean?',
            options: ['Hello', 'Thank you', 'Goodbye', 'Please'],
            correct: 1,
            explanation: 'អរគុណ (or-kun) means "Thank you" in Khmer.'
        },
        {
            id: 3,
            type: 'true-false',
            question: '"បាទ" (bat) is used by males to say "Yes"',
            correct: true,
            explanation: 'Correct! Males say "បាទ" (bat) while females say "ចាស" (chas) for "Yes".'
        },
        {
            id: 4,
            type: 'fill-blank',
            question: 'Complete: "សុំ___" means "Sorry/Excuse me"',
            answer: 'ទោស',
            hint: 'Romanized: tos',
            explanation: 'សុំទោស (som-tos) means "Sorry" or "Excuse me".'
        },
        {
            id: 5,
            type: 'multiple-choice',
            question: 'Which phrase means "Please"?',
            options: ['សូម', 'ទេ', 'មក', 'ទៅ'],
            correct: 0,
            explanation: 'សូម (som) is used to say "Please" in Khmer.'
        }
    ],
    vocabulary: [
        {
            id: 6,
            type: 'multiple-choice',
            question: 'What is "Rice" in Khmer?',
            options: ['ទឹក', 'បាយ', 'ត្រី', 'មាន់'],
            correct: 1,
            explanation: 'បាយ (bay) means rice, a staple food in Cambodia.'
        },
        {
            id: 7,
            type: 'matching',
            question: 'Match the Khmer number with its value:',
            pairs: [
                { khmer: 'មួយ', english: 'One' },
                { khmer: 'ពីរ', english: 'Two' },
                { khmer: 'បី', english: 'Three' }
            ],
            explanation: 'មួយ (muoy) = One, ពីរ (pir) = Two, បី (bei) = Three'
        },
        {
            id: 8,
            type: 'fill-blank',
            question: 'The Khmer word for "Water" is ___',
            answer: 'ទឹក',
            hint: 'Romanized: tuk',
            explanation: 'ទឹក (tuk) means water in Khmer.'
        },
        {
            id: 9,
            type: 'multiple-choice',
            question: 'What does "ឆ្ងាញ់" mean?',
            options: ['Spicy', 'Delicious', 'Sweet', 'Sour'],
            correct: 1,
            explanation: 'ឆ្ងាញ់ (chhngahn) means "Delicious".'
        },
        {
            id: 10,
            type: 'true-false',
            question: '"ម្តាយ" (mdai) means "Father"',
            correct: false,
            explanation: 'False! ម្តាយ (mdai) means "Mother". Father is ឪពុក (ov-puk).'
        }
    ],
    grammar: [
        {
            id: 11,
            type: 'multiple-choice',
            question: 'Which word order is correct in Khmer?',
            options: ['Subject-Verb-Object', 'Verb-Subject-Object', 'Object-Verb-Subject', 'Subject-Object-Verb'],
            correct: 0,
            explanation: 'Khmer follows Subject-Verb-Object word order, similar to English.'
        },
        {
            id: 12,
            type: 'true-false',
            question: 'Khmer verbs conjugate for tense like English verbs',
            correct: false,
            explanation: 'False! Khmer verbs do not conjugate. Time is indicated by context or time markers.'
        }
    ],
    culture: [
        {
            id: 13,
            type: 'multiple-choice',
            question: 'What is the traditional Khmer greeting gesture called?',
            options: ['Sampeah', 'Wai', 'Namaste', 'Bow'],
            correct: 0,
            explanation: 'The Sampeah is the traditional Khmer greeting with hands pressed together.'
        },
        {
            id: 14,
            type: 'true-false',
            question: 'It is polite to touch someone\'s head in Cambodian culture',
            correct: false,
            explanation: 'False! The head is considered sacred in Khmer culture and should not be touched.'
        }
    ],
    mixed: [
        {
            id: 15,
            type: 'multiple-choice',
            question: 'How do you say "Where is...?" in Khmer?',
            options: ['...នៅឯណា?', '...ប៉ុន្មាន?', '...យ៉ាងម៉េច?', '...ពេលណា?'],
            correct: 0,
            explanation: '...នៅឯណា? (...nov ae-na?) means "Where is...?"'
        }
    ]
}

const QuizePage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [userAnswers, setUserAnswers] = useState({})
    const [showResults, setShowResults] = useState(false)
    const [score, setScore] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showExplanation, setShowExplanation] = useState(false)
    const [fillBlankAnswer, setFillBlankAnswer] = useState('')
    const [quizStarted, setQuizStarted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
    const [timerActive, setTimerActive] = useState(false)

    const currentQuestions = selectedCategory ? quizData[selectedCategory] || [] : []
    const currentQuestion = currentQuestions[currentQuestionIndex]
    const totalQuestions = currentQuestions.length
    const categoryInfo = quizCategories.find(c => c.id === selectedCategory)

    // Timer
    useEffect(() => {
        if (timerActive && timeLeft > 0 && !showResults) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else if (timeLeft === 0 && !showResults) {
            handleFinishQuiz()
        }
    }, [timerActive, timeLeft, showResults])

    const startQuiz = (categoryId) => {
        setSelectedCategory(categoryId)
        setQuizStarted(true)
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setShowResults(false)
        setScore(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
        setTimeLeft(300)
        setTimerActive(true)
    }

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer)
    }

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null && !fillBlankAnswer) return

        const isCorrect = checkAnswer()
        setUserAnswers({
            ...userAnswers,
            [currentQuestion.id]: {
                answer: selectedAnswer !== null ? selectedAnswer : fillBlankAnswer,
                correct: isCorrect
            }
        })
        setShowExplanation(true)
    }

    const checkAnswer = () => {
        if (currentQuestion.type === 'multiple-choice') {
            return selectedAnswer === currentQuestion.correct
        } else if (currentQuestion.type === 'true-false') {
            return selectedAnswer === currentQuestion.correct
        } else if (currentQuestion.type === 'fill-blank') {
            return fillBlankAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
        }
        return false
    }

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setSelectedAnswer(null)
            setFillBlankAnswer('')
            setShowExplanation(false)
        } else {
            handleFinishQuiz()
        }
    }

    const handleFinishQuiz = () => {
        setTimerActive(false)
        const correctAnswers = Object.values(userAnswers).filter(a => a.correct).length
        setScore(correctAnswers)
        setShowResults(true)
    }

    const handleRestartQuiz = () => {
        setQuizStarted(false)
        setSelectedCategory(null)
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setShowResults(false)
        setScore(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
        setFillBlankAnswer('')
        setTimeLeft(300)
        setTimerActive(false)
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'emerald'
        if (percentage >= 60) return 'amber'
        return 'rose'
    }

    // Category Selection Screen
    if (!quizStarted) {
        return (
            <div className="w-full space-y-6">
                <div className="px-3 text-center sm:px-6 lg:px-0">
                    <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">
                        Test Your Knowledge
                    </p>
                    <h1 className="mt-3 text-4xl font-bold text-slate-900">
                        Khmer Language Quizzes
                    </h1>
                    <p className="mt-2 text-base text-slate-500">
                        Challenge yourself with interactive quizzes and track your progress.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {quizCategories.map((category) => {
                        const questionCount = quizData[category.id]?.length || 0
                        return (
                            <button
                                key={category.id}
                                onClick={() => startQuiz(category.id)}
                                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5 transition hover:shadow-2xl hover:scale-105"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 opacity-0 transition group-hover:opacity-100`}></div>

                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <span className="text-4xl">{category.emoji}</span>
                                        <span className={`rounded-full bg-${category.color}-100 px-3 py-1 text-xs font-semibold text-${category.color}-600`}>
                                            {category.difficulty}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-xl font-bold text-slate-900">{category.label}</h3>
                                    <p className="mt-2 text-sm text-slate-600">{questionCount} questions</p>

                                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>~5 minutes</span>
                                    </div>

                                    <div className={`mt-4 rounded-xl bg-${category.color}-50 px-4 py-2 text-center text-sm font-semibold text-${category.color}-600 transition group-hover:bg-${category.color}-100`}>
                                        Start Quiz →
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Stats Section */}
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 p-6 ring-1 ring-violet-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">0</p>
                                <p className="text-sm text-slate-600">Quizzes Completed</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-6 ring-1 ring-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">0%</p>
                                <p className="text-sm text-slate-600">Average Score</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 ring-1 ring-amber-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">0</p>
                                <p className="text-sm text-slate-600">Achievements</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Results Screen
    if (showResults) {
        const percentage = Math.round((score / totalQuestions) * 100)
        const scoreColor = getScoreColor(percentage)

        return (
            <div className="w-full space-y-6">
                <div className="px-3 text-center sm:px-6 lg:px-0">
                    <div className="mx-auto max-w-2xl">
                        <div className={`mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-${scoreColor}-400 to-${scoreColor}-600`}>
                            <span className="text-5xl font-bold text-white">{percentage}%</span>
                        </div>

                        <h1 className="text-4xl font-bold text-slate-900">
                            {percentage >= 80 ? '🎉 Excellent Work!' : percentage >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
                        </h1>
                        <p className="mt-2 text-lg text-slate-600">
                            You scored {score} out of {totalQuestions} questions correctly
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                                <p className="text-sm text-slate-600">Correct Answers</p>
                                <p className="mt-1 text-3xl font-bold text-emerald-600">{score}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                                <p className="text-sm text-slate-600">Incorrect</p>
                                <p className="mt-1 text-3xl font-bold text-rose-600">{totalQuestions - score}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                                <p className="text-sm text-slate-600">Time Taken</p>
                                <p className="mt-1 text-3xl font-bold text-violet-600">{formatTime(300 - timeLeft)}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4 justify-center">
                            <button
                                onClick={() => startQuiz(selectedCategory)}
                                className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-violet-600 hover:to-purple-600"
                            >
                                🔄 Retry Quiz
                            </button>
                            <button
                                onClick={handleRestartQuiz}
                                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                ← Back to Categories
                            </button>
                        </div>
                    </div>
                </div>

                {/* Review Answers */}
                <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
                    <h3 className="text-lg font-bold text-slate-900">📝 Review Your Answers</h3>
                    <div className="mt-4 space-y-4">
                        {currentQuestions.map((q, idx) => {
                            const userAnswer = userAnswers[q.id]
                            const isCorrect = userAnswer?.correct

                            return (
                                <div key={q.id} className={`rounded-2xl border-2 p-4 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900">
                                                {idx + 1}. {q.question}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-600">{q.explanation}</p>
                                        </div>
                                        <span className={`text-2xl ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {isCorrect ? '✓' : '✗'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // Quiz Question Screen
    return (
        <div className="w-full space-y-6">
            {/* Header with Progress */}
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-600">
                            {categoryInfo?.emoji} {categoryInfo?.label}
                        </p>
                        <p className="text-xs text-slate-500">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${timeLeft < 60 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold">{formatTime(timeLeft)}</span>
                        </div>

                        <button
                            onClick={handleRestartQuiz}
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Exit
                        </button>
                    </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 p-8 ring-1 ring-violet-100">
                        <div className="flex items-start justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">{currentQuestion?.question}</h2>
                            <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                                {currentQuestion?.type}
                            </span>
                        </div>

                        {currentQuestion?.hint && (
                            <p className="mt-3 text-sm text-violet-600">💡 Hint: {currentQuestion.hint}</p>
                        )}

                        {/* Multiple Choice */}
                        {currentQuestion?.type === 'multiple-choice' && (
                            <div className="mt-6 space-y-3">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(idx)}
                                        disabled={showExplanation}
                                        className={`w-full rounded-2xl border-2 p-4 text-left text-lg font-medium transition ${selectedAnswer === idx
                                                ? showExplanation
                                                    ? idx === currentQuestion.correct
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : 'border-rose-500 bg-rose-50 text-rose-700'
                                                    : 'border-violet-500 bg-violet-50 text-violet-700'
                                                : showExplanation && idx === currentQuestion.correct
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                                            } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option}</span>
                                            {showExplanation && idx === currentQuestion.correct && <span className="text-emerald-600">✓</span>}
                                            {showExplanation && selectedAnswer === idx && idx !== currentQuestion.correct && <span className="text-rose-600">✗</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* True/False */}
                        {currentQuestion?.type === 'true-false' && (
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAnswerSelect(true)}
                                    disabled={showExplanation}
                                    className={`rounded-2xl border-2 p-6 text-center text-xl font-bold transition ${selectedAnswer === true
                                            ? showExplanation
                                                ? currentQuestion.correct === true
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-rose-500 bg-rose-50 text-rose-700'
                                                : 'border-violet-500 bg-violet-50 text-violet-700'
                                            : showExplanation && currentQuestion.correct === true
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                                        } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    ✓ True
                                </button>
                                <button
                                    onClick={() => handleAnswerSelect(false)}
                                    disabled={showExplanation}
                                    className={`rounded-2xl border-2 p-6 text-center text-xl font-bold transition ${selectedAnswer === false
                                            ? showExplanation
                                                ? currentQuestion.correct === false
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-rose-500 bg-rose-50 text-rose-700'
                                                : 'border-violet-500 bg-violet-50 text-violet-700'
                                            : showExplanation && currentQuestion.correct === false
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                                        } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    ✗ False
                                </button>
                            </div>
                        )}

                        {/* Fill in the Blank */}
                        {currentQuestion?.type === 'fill-blank' && (
                            <div className="mt-6">
                                <input
                                    type="text"
                                    value={fillBlankAnswer}
                                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                                    disabled={showExplanation}
                                    placeholder="Type your answer..."
                                    className={`w-full rounded-2xl border-2 px-6 py-4 text-lg font-medium focus:outline-none focus:ring-2 ${showExplanation
                                            ? checkAnswer()
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-emerald-200'
                                                : 'border-rose-500 bg-rose-50 text-rose-700 ring-rose-200'
                                            : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
                                        }`}
                                />
                                {showExplanation && !checkAnswer() && (
                                    <p className="mt-2 text-sm text-rose-600">
                                        Correct answer: {currentQuestion.answer}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Explanation */}
                        {showExplanation && (
                            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-sm font-semibold text-slate-900">📚 Explanation:</p>
                                <p className="mt-2 text-sm text-slate-600">{currentQuestion.explanation}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {!showExplanation ? (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={selectedAnswer === null && !fillBlankAnswer}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 py-4 text-sm font-semibold text-white transition hover:from-violet-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Answer
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 py-4 text-sm font-semibold text-white transition hover:from-violet-600 hover:to-purple-600"
                            >
                                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question →' : 'Finish Quiz'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Question Navigator */}
                    <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5">
                        <h3 className="text-sm font-semibold text-slate-900">Questions</h3>
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {currentQuestions.map((_, idx) => {
                                const answered = userAnswers[currentQuestions[idx].id]
                                return (
                                    <div
                                        key={idx}
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${idx === currentQuestionIndex
                                                ? 'bg-violet-500 text-white'
                                                : answered
                                                    ? answered.correct
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-rose-100 text-rose-600'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {idx + 1}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 p-5 ring-1 ring-violet-100">
                        <h3 className="text-sm font-semibold text-slate-900">💡 Quiz Tips</h3>
                        <ul className="mt-3 space-y-2 text-xs text-slate-600">
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Read each question carefully</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Use hints when available</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Review explanations to learn</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Take your time, no rush!</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuizePage
