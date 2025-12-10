import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'

const LessonDetailPage = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { categories: categoryList } = useSelector((state) => state.categories)

  // Get lesson data from location state or use defaults
  const lessonData = location.state || {}
  const lessonLabel = lessonData.lessonLabel || lessonId || 'Lesson'
  const lessonIcon = lessonData.lessonIcon || '📚'
  const dailyGoal = lessonData.dailyGoal || 15 // Default to 15 words if not provided

  const [currentStep, setCurrentStep] = useState(0) // 0: intro, 1: flashcards, 2: practice, 3: complete
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [practiceAnswers, setPracticeAnswers] = useState({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // Track current question
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState('word') // 'word' or 'phrase'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    if (categoryList.length === 0) {
      dispatch(fetchCategories())
    }
  }, [dispatch, categoryList.length])

  // Map lesson IDs to word types/categories
  const lessonWordMap = {
    '1-1': ['language', 'general'], // Greetings
    '1-2': ['general'], // Name
    '1-3': ['place', 'general'], // Nationality 1
    '1-4': ['place', 'general'], // Nationality 2
    '1-5': ['number'], // Numbers
    '1-6': ['family'], // Family 1
    '1-7': ['family'], // Family 2
    '1-8': ['food'], // Food
  }

  // Get words for this lesson - check lessonId field first, then fall back to type mapping
  const lessonWords = useMemo(() => {
    if (!lessonId || categoryList.length === 0) return []

    let words = []

    // First, try to find categories that have lessonId field matching this lesson
    words = categoryList.filter(cat => {
      // Check if category has lessonId field (if added to schema)
      if (cat.lessonId) {
        // Support both string and array of lessonIds
        if (typeof cat.lessonId === 'string') {
          return cat.lessonId === lessonId
        } else if (Array.isArray(cat.lessonId)) {
          return cat.lessonId.includes(lessonId)
        }
      }
      return false
    })

    // If no categories found by lessonId, fall back to type-based mapping
    if (words.length === 0) {
      const wordTypes = lessonWordMap[lessonId] || ['general']
      // Normalize word types to lowercase for comparison
      const normalizedWordTypes = wordTypes.map(wt => String(wt).toLowerCase().trim())

      words = categoryList.filter(cat => {
        // Get types from category (handle array, string, or null)
        const types = Array.isArray(cat.type)
          ? cat.type
          : (cat.type ? [cat.type] : ['general'])

        // Check if any type matches any word type (case-insensitive, flexible matching)
        return types.some(t => {
          const normalizedType = String(t).toLowerCase().trim()

          // Exact match
          if (normalizedWordTypes.includes(normalizedType)) return true

          // Check each word type for matches
          return normalizedWordTypes.some(wt => {
            // Exact match
            if (normalizedType === wt) return true
            // Partial match - type contains word type
            if (normalizedType.includes(wt)) return true
            // Partial match - word type contains type
            if (wt.includes(normalizedType)) return true
            // Special cases for lesson 1-1 (Greetings/Language)
            if (lessonId === '1-1') {
              // Match greetings, expressions, language-related
              if ((normalizedType.includes('greeting') || normalizedType.includes('expression') ||
                normalizedType.includes('talking') || normalizedType.includes('speaking')) &&
                (wt === 'language' || wt === 'general')) return true
            }
            return false
          })
        })
      })

      // If still no words found, get any categories with 'general' type as fallback
      if (words.length === 0) {
        words = categoryList.filter(cat => {
          const types = Array.isArray(cat.type) ? cat.type : (cat.type ? [cat.type] : ['general'])
          return types.some(t => String(t).toLowerCase().trim() === 'general')
        }).slice(0, 10) // Get at least some words
      }
    }

    // Debug: Log how many words found
    console.log(`Lesson ${lessonId}: Found ${words.length} words from ${categoryList.length} total categories, dailyGoal: ${dailyGoal}`)

    // Ensure we have enough words based on daily goal - fill with additional categories if needed
    if (words.length < dailyGoal && categoryList.length > 0) {
      const existingIds = new Set(words.map(w => w.id || w._id))
      const additionalWords = categoryList
        .filter(cat => {
          // Get words that weren't already included and have required fields
          const catId = cat._id || cat.id
          return !existingIds.has(catId) &&
            cat.englishName &&
            cat.khmerName &&
            cat.phonetic
        })
        .slice(0, dailyGoal - words.length)

      words = [...words, ...additionalWords]
      console.log(`Added ${additionalWords.length} additional words, total: ${words.length}`)
    }

    // Limit to daily goal (or max 20) and map to lesson word format
    return words
      .slice(0, Math.max(dailyGoal, 20))
      .map(cat => ({
        id: cat._id,
        english: cat.englishName,
        khmer: cat.khmerName,
        romanized: cat.phonetic,
        chinese: cat.chineseName,
        chinesePinyin: cat.chinesePinyin || cat.ex_chinese_pinyin,
        icon: cat.icon,
        example: cat.example || cat.ex_english || cat.ex_khmer,
        definition: cat.definition
      }))
  }, [lessonId, categoryList, dailyGoal])

  // Practice questions (mix of translation and multiple choice) - use all lesson words
  const practiceQuestions = useMemo(() => {
    if (lessonWords.length === 0) return []

    const questions = []
    const halfLength = Math.ceil(lessonWords.length / 2)
    const minQuestions = Math.min(lessonWords.length, 8) // At least 8 questions

    // Translation questions (English to Khmer) - use first half
    lessonWords.slice(0, Math.max(halfLength, Math.ceil(minQuestions / 2))).forEach((word, index) => {
      questions.push({
        id: `translate-${index}`,
        type: 'translate',
        question: `Translate "${word.english}" to Khmer:`,
        correctAnswer: word.khmer,
        options: [
          word.khmer,
          ...lessonWords
            .filter(w => w.id !== word.id)
            .map(w => w.khmer)
            .slice(0, 3)
        ].sort(() => Math.random() - 0.5)
      })
    })

    // Multiple choice questions - use second half
    lessonWords.slice(Math.max(halfLength, Math.ceil(minQuestions / 2))).forEach((word, index) => {
      questions.push({
        id: `choice-${index}`,
        type: 'choice',
        question: `What does "${word.khmer}" mean?`,
        correctAnswer: word.english,
        options: [
          word.english,
          ...lessonWords
            .filter(w => w.id !== word.id)
            .map(w => w.english)
            .slice(0, 3)
        ].sort(() => Math.random() - 0.5)
      })
    })

    return questions
  }, [lessonWords])

  const handleCardFlip = (cardId) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const handlePracticeAnswer = (questionId, answer) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // All questions answered, calculate score and show results
      handleSubmitPractice()
    }
  }

  const handleSubmitPractice = () => {
    let correct = 0
    practiceQuestions.forEach(q => {
      if (practiceAnswers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    setScore(correct)
    setShowResults(true)
  }

  const handleComplete = () => {
    // Show completion screen first, then navigate back
    setCurrentStep(3)

    // After a brief moment, navigate back to learning path with task completion
    setTimeout(() => {
      navigate('/learning-path', {
        state: {
          lessonCompleted: true,
          lessonId,
          score,
          totalQuestions: practiceQuestions.length,
          wordsLearned: lessonWords.length,
          taskCompleted: 'newWords', // Mark the new words task as complete
          completedAt: new Date().toISOString() // Track when task was completed
        }
      })
    }, 2000) // Show completion screen for 2 seconds
  }

  const handleFinishAndReturn = () => {
    // Mark task as complete and navigate back to learning path
    // This will mark the "Learn New Words" task as complete
    navigate('/learning-path', {
      state: {
        lessonCompleted: true,
        lessonId,
        score,
        totalQuestions: practiceQuestions.length,
        wordsLearned: lessonWords.length,
        taskCompleted: 'newWords', // Mark the new words task as complete
        completedAt: new Date().toISOString() // Track when task was completed
      }
    })
  }

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else if (currentStep === 1 && currentCardIndex < lessonWords.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
    } else if (currentStep === 1) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep === 1 && currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
    } else if (currentStep === 2) {
      setCurrentStep(1)
      setCurrentCardIndex(0)
    } else if (currentStep === 1) {
      setCurrentStep(0)
    } else if (currentStep === 0) {
      navigate('/learning-path')
    }
  }

  // Play audio using Web Speech API
  const playAudio = (text, lang = 'km-KH') => {
    if ('speechSynthesis' in window) {
      setIsPlayingAudio(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      speechSynthesis.speak(utterance)
    } else {
      alert('Audio playback is not supported in your browser')
      setIsPlayingAudio(false)
    }
  }

  // Calculate progress
  const progress = useMemo(() => {
    if (currentStep === 0) return 0
    if (currentStep === 1) return 30 + (currentCardIndex / lessonWords.length) * 30
    if (currentStep === 2 && !showResults) {
      // Progress from 60% to 100% based on questions answered
      const questionsAnswered = currentQuestionIndex + 1
      const totalQuestions = practiceQuestions.length
      return 60 + (questionsAnswered / totalQuestions) * 40
    }
    if (currentStep === 2 && showResults) return 100 // Show 100% when results are shown
    if (currentStep === 3) return 100
    return 0
  }, [currentStep, currentCardIndex, lessonWords.length, showResults, currentQuestionIndex, practiceQuestions.length])

  if (lessonWords.length === 0 && categoryList.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md shadow-xl">
          <p className="text-center text-slate-600 mb-4">No words found for this lesson.</p>
          <button
            onClick={() => navigate('/learning-path')}
            className="w-full bg-indigo-500 text-white py-2 rounded-xl hover:bg-indigo-600 transition"
          >
            Back to Learning Path
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-5xl drop-shadow-lg">{lessonIcon}</span>
              <div>
                <h2 className="text-3xl font-bold drop-shadow-md">{lessonLabel}</h2>
                <p className="text-indigo-100 text-base font-medium">{lessonId}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/learning-path')}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-3 bg-white/30 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-white rounded-full transition-all duration-300 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm mt-2 text-indigo-100 font-semibold">{Math.round(progress)}% Complete</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Step 0: Introduction */}
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
            <div className="text-6xl mb-4">{lessonIcon}</div>
            <h3 className="text-3xl font-bold text-slate-900">Welcome to {lessonLabel}!</h3>
            <p className="text-slate-600 text-lg">
              In this lesson, you'll learn {lessonWords.length > 0 ? lessonWords.length : 'several'} new words.
              Let's start with flashcards, then practice what you've learned.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="text-3xl mb-2">📖</div>
                <p className="font-semibold text-slate-900">{lessonWords.length}</p>
                <p className="text-sm text-slate-600">New Words</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-3xl mb-2">⏱️</div>
                <p className="font-semibold text-slate-900">5 min</p>
                <p className="text-sm text-slate-600">Estimated</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 group cursor-pointer">
                {/* 3D Coin Icon with Hover Animation */}
                <div className="relative w-12 h-12 mx-auto mb-2 transition-transform duration-200 group-hover:translate-y-1">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Coin shadow/depth */}
                    <ellipse cx="50" cy="85" rx="35" ry="8" fill="#FFB6C1" opacity="0.3" />

                    {/* Coin body - gradient for 3D effect */}
                    <defs>
                      <radialGradient id="coinGradient" cx="30%" cy="30%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#FF8C00" />
                      </radialGradient>
                    </defs>

                    {/* Main coin circle */}
                    <circle cx="50" cy="50" r="35" fill="url(#coinGradient)" stroke="#FF8C00" strokeWidth="2" />

                    {/* Coin highlight */}
                    <ellipse cx="38" cy="38" rx="12" ry="15" fill="white" opacity="0.3" />

                    {/* Star in center */}
                    <path d="M50 30 L54 42 L67 42 L57 50 L61 62 L50 54 L39 62 L43 50 L33 42 L46 42 Z"
                      fill="white" opacity="0.9" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-900">15 XP</p>
                <p className="text-sm text-slate-600">Points</p>
              </div>
            </div>

            {/* START Button */}
            <div className="pt-4">
              <button
                onClick={handleNext}
                className="px-12 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105"
              >
                START
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Flashcards */}
        {currentStep === 1 && lessonWords.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-slate-700">
                Card {currentCardIndex + 1} of {lessonWords.length}
              </p>
              <div className="mt-2 flex justify-center gap-1">
                {lessonWords.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${idx === currentCardIndex
                      ? 'w-8 bg-indigo-500'
                      : idx < currentCardIndex
                        ? 'w-2 bg-indigo-300'
                        : 'w-2 bg-slate-200'
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              {/* Card Container */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                  <button
                    onClick={() => setActiveTab('word')}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold transition ${activeTab === 'word'
                      ? 'bg-white text-slate-900 border-b-2 border-indigo-500'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    Word
                  </button>
                  <button
                    onClick={() => setActiveTab('phrase')}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold transition ${activeTab === 'phrase'
                      ? 'bg-white text-slate-900 border-b-2 border-indigo-500'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {lessonWords[currentCardIndex].example ? 'Example' : 'Details'}
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Word Tab Content */}
                  {activeTab === 'word' && (
                    <div className="space-y-4">
                      {/* Icon and English in one row */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="shrink-0">
                          {(() => {
                            const icon = lessonWords[currentCardIndex].icon || '📝'
                            const isImageUrl = icon && (
                              icon.startsWith('http') ||
                              icon.startsWith('/') ||
                              icon.startsWith('data:image') ||
                              (icon.includes('.') && !icon.match(/^[\u{1F300}-\u{1F9FF}]/u))
                            )

                            return isImageUrl ? (
                              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center overflow-hidden shadow-sm border border-amber-100">
                                <img
                                  src={icon.startsWith('/uploads/') ? `http://localhost:5000${icon}` : icon}
                                  alt={lessonWords[currentCardIndex].english}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    const fallback = e.target.parentElement.querySelector('.icon-fallback')
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                                <div className="hidden icon-fallback text-4xl">📝</div>
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center shadow-sm border border-amber-100">
                                <span className="text-4xl">{icon}</span>
                              </div>
                            )
                          })()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-bold text-slate-900 leading-tight">
                            {lessonWords[currentCardIndex].english || 'No word'}
                          </h3>
                        </div>
                      </div>

                      {/* Khmer */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                        <p className="text-4xl font-bold text-indigo-700 mb-2 text-center leading-tight">
                          {lessonWords[currentCardIndex].khmer || 'No translation'}
                        </p>
                        {lessonWords[currentCardIndex].romanized && (
                          <p className="text-lg text-slate-600 text-center font-medium">
                            {lessonWords[currentCardIndex].romanized}
                          </p>
                        )}
                      </div>

                      {/* Chinese */}
                      {lessonWords[currentCardIndex].chinese && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100">
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-emerald-700 mb-1">
                              {lessonWords[currentCardIndex].chinese}
                            </p>
                            {lessonWords[currentCardIndex].chinesePinyin && (
                              <p className="text-base text-emerald-600 font-medium">
                                {lessonWords[currentCardIndex].chinesePinyin}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phrase/Example Tab Content */}
                  {activeTab === 'phrase' && (
                    <div className="space-y-4">
                      {lessonWords[currentCardIndex].example ? (
                        <>
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center leading-relaxed">
                              {lessonWords[currentCardIndex].example}
                            </h3>
                          </div>
                          {lessonWords[currentCardIndex].definition && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Definition</h4>
                              <p className="text-slate-700 leading-relaxed text-sm">
                                {lessonWords[currentCardIndex].definition}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-slate-500 py-6">
                          <p>No example phrase available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Play Audio Button */}
                  <div className="mt-5">
                    <button
                      onClick={() => {
                        const textToSpeak = activeTab === 'word'
                          ? lessonWords[currentCardIndex].khmer || lessonWords[currentCardIndex].english
                          : lessonWords[currentCardIndex].example || lessonWords[currentCardIndex].khmer
                        playAudio(textToSpeak, 'km-KH')
                      }}
                      disabled={isPlayingAudio}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPlayingAudio ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Playing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          <span>Play Audio</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4">
              {currentCardIndex > 0 && (
                <button
                  onClick={() => setCurrentCardIndex(prev => prev - 1)}
                  className="px-8 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition"
                >
                  ← BACK
                </button>
              )}
              {currentCardIndex < lessonWords.length - 1 ? (
                <button
                  onClick={() => setCurrentCardIndex(prev => prev + 1)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105"
                >
                  NEXT →
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105"
                >
                  START PRACTICE →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Practice - Duolingo Style Quiz */}
        {currentStep === 2 && (
          <div className="w-full max-w-2xl mx-auto">
            {!showResults ? (
              <>
                {/* Show only current question */}
                {practiceQuestions[currentQuestionIndex] && (() => {
                  const question = practiceQuestions[currentQuestionIndex]
                  const isAnswered = practiceAnswers[question.id] !== undefined
                  const isCorrect = practiceAnswers[question.id] === question.correctAnswer

                  return (
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      {/* Question Header */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        {question.type === 'translate' ? 'Translate this word' : 'Select the correct meaning'}
                      </h3>

                      {/* Character Illustration + Word */}
                      <div className="flex flex-col items-center mb-8">
                        <div className="w-32 h-32 mb-4">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="50" cy="50" r="45" fill="#58CC02" />
                            <circle cx="35" cy="40" r="5" fill="white" />
                            <circle cx="65" cy="40" r="5" fill="white" />
                            <path d="M 30 60 Q 50 70 70 60" stroke="white" strokeWidth="3" fill="none" />
                          </svg>
                        </div>
                        <div className="bg-gray-100 px-6 py-3 rounded-xl">
                          <span className="text-2xl font-bold text-gray-900">
                            {question.type === 'translate'
                              ? question.question.match(/"([^"]+)"/)[1]
                              : question.question.match(/"([^"]+)"/)[1]
                            }
                          </span>
                        </div>
                      </div>

                      {/* Multiple Choice Options */}
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => {
                          const isSelected = practiceAnswers[question.id] === option
                          const showCorrect = isAnswered && option === question.correctAnswer
                          const showWrong = isAnswered && isSelected && !isCorrect

                          return (
                            <button
                              key={optIndex}
                              onClick={() => !isAnswered && handlePracticeAnswer(question.id, option)}
                              disabled={isAnswered}
                              className={`
                                w-full text-left p-4 rounded-2xl border-2 transition-all
                                flex items-center gap-4
                                ${!isAnswered && !isSelected ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' : ''}
                                ${!isAnswered && isSelected ? 'border-gray-400 bg-gray-50' : ''}
                                ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                                ${showWrong ? 'border-red-500 bg-red-50' : ''}
                                ${isAnswered ? 'cursor-default' : 'cursor-pointer'}
                              `}
                            >
                              {/* Number Circle */}
                              <div className={`
                                w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold
                                ${!isAnswered ? 'border-gray-300 text-gray-600' : ''}
                                ${showCorrect ? 'border-green-500 bg-green-500 text-white' : ''}
                                ${showWrong ? 'border-red-500 bg-red-500 text-white' : ''}
                              `}>
                                {showCorrect ? '✓' : showWrong ? '✗' : optIndex + 1}
                              </div>

                              {/* Option Text */}
                              <span className={`
                                text-lg font-semibold
                                ${!isAnswered ? 'text-gray-900' : ''}
                                ${showCorrect ? 'text-green-700' : ''}
                                ${showWrong ? 'text-red-700' : ''}
                              `}>
                                {option}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Feedback Banner with CONTINUE button */}
                      {isAnswered && (
                        <div className={`
                          mt-6 p-4 rounded-2xl flex items-center justify-between
                          ${isCorrect ? 'bg-green-100' : 'bg-red-100'}
                        `}>
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center
                              ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
                            `}>
                              {isCorrect ? (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-red-600">
                                  Correct answer: {question.correctAnswer}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* CONTINUE Button */}
                          <button
                            onClick={handleNextQuestion}
                            className={`
                              px-8 py-3 rounded-xl font-bold text-white transition-all
                              ${isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                            `}
                          >
                            CONTINUE
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </>
            ) : (
              <div className="space-y-6">
                {/* Score Summary */}
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <div className="text-6xl mb-4">
                    {score === practiceQuestions.length ? '🎉' : score >= practiceQuestions.length * 0.7 ? '👍' : '💪'}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">
                    You scored {score} out of {practiceQuestions.length}!
                  </h3>
                  <p className="text-slate-600 text-lg">
                    {score === practiceQuestions.length
                      ? 'Perfect! You mastered this lesson!'
                      : score >= practiceQuestions.length * 0.7
                        ? 'Great job! Keep practicing!'
                        : 'Good effort! Review the flashcards and try again.'}
                  </p>
                </div>

                {/* Review All Questions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Review Your Answers</h4>
                  <div className="space-y-4">
                    {practiceQuestions.map((question, index) => {
                      const userAnswer = practiceAnswers[question.id]
                      const isCorrect = userAnswer === question.correctAnswer

                      return (
                        <div
                          key={question.id}
                          className={`p-4 rounded-xl border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Correct/Incorrect Icon */}
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                              ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
                            `}>
                              {isCorrect ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 mb-2">
                                {index + 1}. {question.question}
                              </p>
                              <div className="space-y-1 text-sm">
                                <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                  <span className="font-semibold">Your answer:</span> {userAnswer || 'No answer'}
                                </p>
                                {!isCorrect && (
                                  <p className="text-green-700">
                                    <span className="font-semibold">Correct answer:</span> {question.correctAnswer}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleComplete}
                    className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105"
                  >
                    CONTINUE
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Completion */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-slate-900">Lesson Complete!</h3>
            <p className="text-slate-600 text-lg">
              You've learned {lessonWords.length} new words and earned 15 XP!
            </p>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 mt-6">
              <p className="text-emerald-700 font-semibold mb-2">Well done! Keep up the great work!</p>
              <p className="text-emerald-600 text-sm">
                ✅ Your daily task "Learn {lessonWords.length} New Words" will be marked as complete!
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default LessonDetailPage

