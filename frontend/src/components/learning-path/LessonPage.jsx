import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'

const LessonPage = ({ lessonId, lessonLabel, lessonIcon, onClose, onComplete }) => {
  const dispatch = useDispatch()
  const { categories: categoryList } = useSelector((state) => state.categories)

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

  // Get words for this lesson
  const lessonWords = useMemo(() => {
    if (!lessonId || categoryList.length === 0) return []

    const wordTypes = lessonWordMap[lessonId] || ['general']
    const words = categoryList
      .filter(cat => {
        const types = Array.isArray(cat.type) ? cat.type : (cat.type ? [cat.type] : ['general'])
        return types.some(t => wordTypes.includes(t.toLowerCase()))
      })
      .slice(0, 10) // Limit to 10 words per lesson
      .map(cat => ({
        id: cat._id,
        english: cat.englishName,
        khmer: cat.khmerName,
        romanized: cat.phonetic,
        chinese: cat.chineseName,
        chinesePinyin: cat.chinesePinyin || cat.ex_chinese_pinyin,
        icon: cat.icon,
        example: cat.example,
        definition: cat.definition
      }))

    return words
  }, [lessonId, categoryList])

  // Practice questions (mix of translation and multiple choice)
  const practiceQuestions = useMemo(() => {
    if (lessonWords.length === 0) return []

    const questions = []

    // Translation questions (English to Khmer)
    lessonWords.slice(0, 5).forEach((word, index) => {
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

    // Multiple choice questions
    lessonWords.slice(5, 8).forEach((word, index) => {
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
    if (onComplete) {
      onComplete({
        lessonId,
        score,
        totalQuestions: practiceQuestions.length,
        wordsLearned: lessonWords.length
      })
    }
    setCurrentStep(3)
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md mx-4">
          <p className="text-center text-slate-600">No words found for this lesson.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] max-h-[90vh] overflow-hidden flex flex-col border-4 border-white/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl drop-shadow-lg">{lessonIcon || '📚'}</span>
              <div>
                <h2 className="text-3xl font-bold drop-shadow-md">{lessonLabel || 'Lesson'}</h2>
                <p className="text-indigo-100 text-base font-medium">{lessonId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 flex items-center">
          {/* Step 0: Introduction */}
          {currentStep === 0 && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">{lessonIcon || '📚'}</div>
              <h3 className="text-3xl font-bold text-slate-900">Welcome to {lessonLabel}!</h3>
              <p className="text-slate-600 text-lg">
                In this lesson, you'll learn {lessonWords.length} new words.
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
                <div className="bg-pink-50 rounded-xl p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="font-semibold text-slate-900">15 XP</p>
                  <p className="text-sm text-slate-600">Points</p>
                </div>
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
                {/* Card Container - Compact, no scroll needed */}
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

                  {/* Card Content - Compact, fits without scroll */}
                  <div className="p-6">
                    {/* Word Tab Content - Modern compact layout */}
                    {activeTab === 'word' && (
                      <div className="space-y-4">
                        {/* Icon and English in one row */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-shrink-0">
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

                        {/* Khmer - Main translation */}
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

                        {/* Chinese - Compact display */}
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

                    {/* Phrase/Example Tab Content - Compact */}
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

                    {/* Play Audio Button - Compact */}
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
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-slate-900">Lesson Complete!</h3>
              <p className="text-slate-600 text-lg">
                You've learned {lessonWords.length} new words and earned 15 XP!
              </p>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 mt-6">
                <p className="text-emerald-700 font-semibold">Well done! Keep up the great work!</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex items-center justify-between gap-4">
            {currentStep > 0 && currentStep < 3 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                Back
              </button>
            )}
            <div className="flex-1" />
            {currentStep === 0 && (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105"
              >
                Start Learning →
              </button>
            )}
            {currentStep === 1 && (
              <button
                onClick={handleNext}
                disabled={currentCardIndex === lessonWords.length - 1}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentCardIndex === lessonWords.length - 1 ? 'Start Practice →' : 'Next Card →'}
              </button>
            )}
            {currentStep === 2 && showResults && (
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105"
              >
                Complete Lesson →
              </button>
            )}
            {currentStep === 3 && (
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D Card Flip Styles */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @media (max-width: 640px) {
          .perspective-1000 {
            perspective: 800px;
          }
        }
      `}</style>
    </div>
  )
}

export default LessonPage

