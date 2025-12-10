import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Import images from week folders
import week1Image from '../../assets/lession/week1/21dbd346a371c5bceffd6d61e491c3b0.gif' // Panda
import week2Image from '../../assets/lession/week2/1910792_352f9.gif' // Cat
import coinImage from '../../assets/coin.png'

const LearningPathVertical = ({
  lessons,
  currentLevel = 0,
  currentDay = 1,
  currentWeek = 1,
  todayCompleted = { newWords: false, reviewWords: false, quiz: false },
  onLessonComplete,
  levelConfig
}) => {
  const navigate = useNavigate()
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [hoveredLesson, setHoveredLesson] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null) // Track selected day point
  const containerRef = useRef(null)
  const svgContainerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(672) // Default to max-w-2xl
  const [coinPosition, setCoinPosition] = useState({ x: 0, y: 0 })

  // Default lessons if none provided
  const defaultLessons = [
    { id: '1-1', level: 0, label: 'Greetings', icon: '👋', type: 'lesson', locked: false, completed: true, stars: 3 },
    { id: '1-2', level: 1, label: 'Name', icon: '👤', type: 'lesson', locked: false, completed: true, stars: 2 },
    { id: '1-3', level: 2, label: 'Nationality 1', icon: '🌍', type: 'lesson', locked: false, completed: false, stars: 0 },
    { id: '1-4', level: 3, label: 'Nationality 2', icon: '🌏', type: 'lesson', locked: true, completed: false, stars: 0 },
    { id: '1-5', level: 4, label: 'Numbers', icon: '🔢', type: 'lesson', locked: true, completed: false, stars: 0 },
    { id: '1-6', level: 5, label: 'Family 1', icon: '👨‍👩‍👧', type: 'lesson', locked: true, completed: false, stars: 0 },
    { id: '1-7', level: 6, label: 'Family 2', icon: '👶', type: 'lesson', locked: true, completed: false, stars: 0 },
    { id: '1-8', level: 7, label: 'Food', icon: '🍕', type: 'lesson', locked: true, completed: false, stars: 0 },
    { id: 'test-1', level: 8, label: 'Unit Test', icon: '👑', type: 'test', locked: true, completed: false, stars: 0 },
  ]

  const lessonData = lessons || defaultLessons
  const lessonCount = lessonData.length

  // Generate path points - Duolingo style with STRONG twisted curves for better UX
  const generatePathPoints = () => {
    const points = []
    const startY = 100
    const daySpacing = 70 // INCREASED spacing for longer path height
    const weekHeight = 7 * daySpacing // Total height for 7 days
    const examSpacing = 100 // More space after exam
    const xCenter = 50 // Keep path centered
    const amplitude = 40 // MAXIMUM horizontal curve amplitude
    const frequency = 0.015 // Frequency for smooth S-curves
    // Using COSINE instead of sine to start from LEFT side
    // cos(0) = 1, so path starts at left (xCenter - amplitude)

    let currentY = startY
    let weekIndex = 0

    // Separate lessons and exams
    const lessons = lessonData.filter(l => l.type !== 'test')
    const exams = lessonData.filter(l => l.type === 'test')

    lessons.forEach((lesson, idx) => {
      // Calculate curved x position using COSINE for left-right-left pattern
      const xOffset = amplitude * Math.cos(frequency * currentY)

      // Week start node
      points.push({
        x: xCenter + xOffset,
        y: currentY,
        isExam: false,
        weekIndex: weekIndex,
        lessonIndex: idx
      })

      // Check if there's an exam after this week
      const weekExam = exams.find(e => {
        const examLevel = parseFloat(e.level)
        return examLevel > weekIndex && examLevel < weekIndex + 1
      })

      if (weekExam) {
        const examY = currentY + weekHeight + 40
        const examXOffset = amplitude * Math.cos(frequency * examY)

        // Position exam after Day 7
        points.push({
          x: xCenter + examXOffset,
          y: examY,
          isExam: true,
          weekIndex: weekIndex,
          examIndex: exams.indexOf(weekExam)
        })
        currentY += weekHeight + examSpacing + 40
      } else {
        currentY += weekHeight + examSpacing
      }

      weekIndex++
    })

    return points
  }

  // Calculate point on quadratic Bezier curve (to match the curved path)
  const getPointOnCurve = (p0, p1, p2, t) => {
    // Quadratic Bezier: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const mt = 1 - t
    const mt2 = mt * mt
    const t2 = t * t

    return {
      x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
      y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y
    }
  }

  // Generate day points - Duolingo style with STRONG curves, Days 1-7 grouped per week
  const generateDayPoints = () => {
    const dayPoints = []
    const pathPoints = generatePathPoints()
    const daySpacing = 70 // INCREASED spacing to match path points
    const amplitude = 40 // Match path amplitude
    const frequency = 0.015 // Match path frequency
    // Using COSINE for left-right-left pattern

    if (pathPoints.length === 0) return dayPoints

    // Get week start nodes only
    const weekStarts = pathPoints.filter(p => !p.isExam)

    weekStarts.forEach((weekStart, weekIdx) => {
      const startY = weekStart.y + 30 // Start days below week node

      // Generate 7 days for this week
      for (let day = 1; day <= 7; day++) {
        const dayY = startY + (day * daySpacing)
        const globalDay = (weekIdx * 7) + day
        // Calculate curved x position using COSINE for organized left-right pattern
        const xOffset = amplitude * Math.cos(frequency * dayY)

        dayPoints.push({
          x: 50 + xOffset,
          y: dayY,
          weekIndex: weekIdx,
          dayInWeek: day,
          globalDay: globalDay
        })
      }
    })

    return dayPoints
  }

  const pathPoints = generatePathPoints()
  const dayPoints = generateDayPoints()
  // Calculate total height based on last point + padding
  const lastPoint = pathPoints[pathPoints.length - 1]
  const lastDay = dayPoints[dayPoints.length - 1]
  const maxY = Math.max(
    lastPoint?.y || 0,
    lastDay?.y || 0
  )
  const totalHeight = Math.max(maxY + 400, 1500)

  // Generate clean straight path through all points
  const generatePath = () => {
    if (pathPoints.length === 0 && dayPoints.length === 0) return ''

    // Combine all points in order: week nodes, days, exams
    const allPoints = []
    const weekStarts = pathPoints.filter(p => !p.isExam)
    const exams = pathPoints.filter(p => p.isExam)

    weekStarts.forEach((weekStart, weekIdx) => {
      // Week start
      allPoints.push({ x: weekStart.x, y: weekStart.y })

      // Days 1-7
      const weekDays = dayPoints.filter(d => d.weekIndex === weekIdx)
      weekDays.forEach(day => {
        allPoints.push({ x: day.x, y: day.y })
      })

      // Exam after Day 7
      const weekExam = exams.find(e => e.weekIndex === weekIdx)
      if (weekExam) {
        allPoints.push({ x: weekExam.x, y: weekExam.y })
      }
    })

    if (allPoints.length === 0) return ''

    // Simple straight path with smooth curves
    let path = `M ${allPoints[0].x} ${allPoints[0].y}`
    for (let i = 1; i < allPoints.length; i++) {
      const prev = allPoints[i - 1]
      const curr = allPoints[i]
      const midY = (prev.y + curr.y) / 2
      path += ` Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`
    }

    return path
  }

  // Generate progress path (colored portion) - game-like progression
  // Connects completed days and extends to next day when tasks are completed
  const generateProgressPath = () => {
    if (dayPoints.length === 0) return ''

    // Get all points up to and including current day + next day if tasks completed
    const allPoints = []
    const weekStarts = pathPoints.filter(p => !p.isExam)
    const exams = pathPoints.filter(p => p.isExam)
    
    // Determine how far to extend the path
    // If current day tasks are completed, extend to next day (game-like unlock)
    const maxDayToShow = todayCompleted.newWords ? currentDay + 1 : currentDay

    weekStarts.forEach((weekStart, weekIdx) => {
      // Calculate the first and last day of this week
      const weekFirstDay = weekIdx * 7 + 1
      const weekLastDay = (weekIdx + 1) * 7
      
      // Add week start if we're in this week or have passed it
      if (maxDayToShow >= weekFirstDay) {
        allPoints.push({ x: weekStart.x, y: weekStart.y })
      }

      // Add days up to maxDayToShow (includes next day if tasks completed)
      const weekDays = dayPoints.filter(d => 
        d.weekIndex === weekIdx && d.globalDay <= maxDayToShow
      )
      weekDays.forEach(day => {
        allPoints.push({ x: day.x, y: day.y })
      })

      // Add exam if we've completed all days of the week
      const weekExam = exams.find(e => e.weekIndex === weekIdx)
      if (weekExam && maxDayToShow > weekLastDay) {
        allPoints.push({ x: weekExam.x, y: weekExam.y })
      }
    })

    if (allPoints.length === 0) return ''

    // Sort points by Y position to ensure correct path order
    allPoints.sort((a, b) => a.y - b.y)

    let path = `M ${allPoints[0].x} ${allPoints[0].y}`

    // Connect all points with smooth curves (game-like progression)
    for (let i = 0; i < allPoints.length - 1; i++) {
      const current = allPoints[i]
      const next = allPoints[i + 1]
      const controlPointY = (current.y + next.y) / 2

      path += ` Q ${current.x} ${controlPointY}, ${next.x} ${next.y}`
    }

    return path
  }

  const currentLessonIndex = Math.min(currentLevel, lessonData.length - 1)

  // Generate decorative elements dynamically
  // All decorative elements removed (flower, owl, palm tree, parrot, round tree, and others)
  const generateDecorations = () => {
    // Return empty array - all decorations removed
    return []
  }

  const decorations = generateDecorations()

  // Generate image positions for week1 (panda) and week2 (cat)
  const generateSection1Images = () => {
    const imagePositions = []
    const amplitude = 40
    const frequency = 0.015
    const xCenter = 50

    // PANDA (week1): Position before point 4 of week 1 on LEFT side
    const day3Point = dayPoints.find(p => p.weekIndex === 0 && p.dayInWeek === 3)
    const day4Point = dayPoints.find(p => p.weekIndex === 0 && p.dayInWeek === 4)

    if (day3Point && day4Point) {
      const startY = day3Point.y
      const endY = day4Point.y
      const pandaY = startY + (endY - startY) * 0.5 // Middle between day 3 and 4

      const baseXOffset = amplitude * Math.cos(frequency * pandaY)
      const finalXOffset = baseXOffset - 50 // LEFT side

      imagePositions.push({
        x: xCenter + finalXOffset,
        y: pandaY,
        image: week1Image, // Panda from week1 folder
        index: 0,
        name: 'panda'
      })
    } else {
      // Fallback position for panda
      const fallbackY = 400
      const baseXOffset = amplitude * Math.cos(frequency * fallbackY)
      imagePositions.push({
        x: xCenter + baseXOffset - 50,
        y: fallbackY,
        image: week1Image,
        index: 0,
        name: 'panda'
      })
    }

    // CAT (week2): Position after week 2 point on RIGHT side
    // Find week 2 lesson point (the main milestone node for week 2)
    const week2LessonPoint = pathPoints.find(p => !p.isExam && p.weekIndex === 1)
    const week2LastDay = dayPoints.find(p => p.weekIndex === 1 && p.dayInWeek === 7)
    const week3FirstDay = dayPoints.find(p => p.weekIndex === 2 && p.dayInWeek === 1)
    const week3LessonPoint = pathPoints.find(p => !p.isExam && p.weekIndex === 2)

    let catY
    if (week2LessonPoint) {
      // Position right after the week 2 lesson point (the milestone node)
      // Calculate spacing: week height is ~490px, so position after that
      const weekHeight = 7 * 70 // 7 days * daySpacing
      catY = week2LessonPoint.y + weekHeight + 150 // After week 2 milestone + spacing
    } else if (week2LastDay) {
      // After last day of week 2
      catY = week2LastDay.y + 100
    } else if (week3LessonPoint) {
      // If week 2 point not found, position before week 3
      catY = week3LessonPoint.y - 100
    } else if (week3FirstDay) {
      // Position before week 3 first day
      catY = week3FirstDay.y - 100
    } else {
      // Fallback: calculate based on week 1
      const week1LastDay = dayPoints.find(p => p.weekIndex === 0 && p.dayInWeek === 7)
      if (week1LastDay) {
        catY = week1LastDay.y + 600
      } else {
        const pandaY = imagePositions[0]?.y || 400
        catY = pandaY + 800
      }
    }

    // Position on RIGHT side with good spacing from path
    const catBaseX = amplitude * Math.cos(frequency * catY)
    const catX = xCenter + catBaseX + 50 // RIGHT side (+50 offset)

    imagePositions.push({
      x: catX,
      y: catY,
      image: week2Image, // Cat from week2 folder
      index: 1,
      name: 'cat'
    })

    return imagePositions
  }

  const section1ImagePositions = generateSection1Images()

  // Get current lesson topic/label for section separator
  const getCurrentTopic = () => {
    const currentLesson = lessonData[currentLessonIndex]
    return currentLesson ? currentLesson.label : 'Learning Path'
  }

  // Measure container width for accurate popup positioning
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    
    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
    return () => window.removeEventListener('resize', updateContainerWidth)
  }, [])

  // Calculate coin's actual pixel position on screen for fixed popup positioning
  // This ensures popup stays locked to coin, not affected by background animations
  useEffect(() => {
    if (!selectedDay || !svgContainerRef.current || !containerRef.current) return

    const dayPoint = dayPoints.find((p) => `day-${p.weekIndex}-${p.dayInWeek}` === selectedDay)
    if (!dayPoint) return

    const svgElement = svgContainerRef.current.querySelector('svg')
    if (!svgElement) return

    // Get SVG's actual rendered dimensions and container position
    const svgRect = svgElement.getBoundingClientRect()
    const svgContainerRect = svgContainerRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    
    // SVG viewBox is "0 0 100 ${totalHeight}" with preserveAspectRatio="xMidYMin meet"
    // Calculate scale factors for X and Y
    const viewBoxWidth = 100
    const viewBoxHeight = totalHeight
    const scaleX = svgRect.width / viewBoxWidth
    const scaleY = svgRect.height / viewBoxHeight
    
    // Use the smaller scale (meet preserves aspect ratio)
    const scale = Math.min(scaleX, scaleY)
    
    // Calculate coin's position in pixels relative to SVG
    // X: dayPoint.x is 0-100 in viewBox, convert to pixels
    // With xMid alignment, we need to account for centering
    const svgContentWidth = viewBoxWidth * scale
    const svgContentLeft = (svgRect.width - svgContentWidth) / 2
    const coinXPxInSvg = (dayPoint.x * scale) + svgContentLeft
    
    // Y: dayPoint.y is in pixels in viewBox, convert to actual pixels
    // preserveAspectRatio="xMidYMin" means Y starts at top (YMin)
    const coinYPxInSvg = dayPoint.y * scale
    
    // Convert to position relative to main container
    // SVG container is positioned within main container
    const coinXPx = coinXPxInSvg + (svgContainerRect.left - containerRect.left)
    const coinYPx = coinYPxInSvg + (svgContainerRect.top - containerRect.top)

    // Position relative to container (for absolute positioning)
    setCoinPosition({
      x: coinXPx,
      y: coinYPx
    })
  }, [selectedDay, dayPoints, totalHeight])

  return (
    <div className="w-full bg-white" onClick={(e) => {
      // Close popup when clicking outside of it
      if (selectedDay && e.target === e.currentTarget) {
        setSelectedDay(null)
      }
    }}>
      <div ref={containerRef} className="max-w-2xl mx-auto relative py-8">
        {/* SVG Path Container - Duolingo style: Very tall and spacious */}
        <div ref={svgContainerRef} className="relative" style={{ height: `${totalHeight}px`, minHeight: '2000px' }}>
          {/* SVG for the path */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 100 ${totalHeight}`}
            preserveAspectRatio="xMidYMin meet"
          >
            {/* Gradient definition for path */}
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="25%" stopColor="#A78BFA" />
                <stop offset="50%" stopColor="#F472B6" />
                <stop offset="75%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>

            {/* Background path - Duolingo style road */}
            <path
              d={generatePath()}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />

            {/* Progress path - Duolingo style colored progress */}
            <path
              d={generateProgressPath()}
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-lg"
            />


            {/* Day Points - Duolingo style circular design */}
            {dayPoints.map((point, idx) => {
              const lessonBefore = lessonData[point.weekIndex]
              const isCompleted = lessonBefore && (lessonBefore.completed || point.weekIndex < currentLessonIndex)
              const isCurrentDay = point.globalDay === currentDay
              // Check if current day's task is completed (only newWords)
              const currentDayAllTasksCompleted = isCurrentDay && todayCompleted.newWords
              // Day is unlocked if it's the current day, a past day, or the next day (to allow task planning)
              // This allows users to see and access the next day's tasks
              const isUnlocked = point.globalDay <= currentDay + 1
              // Day is completed if it's a past day (before current day)
              const isDayCompleted = point.globalDay < currentDay

              const dayKey = `day-${point.weekIndex}-${point.dayInWeek}`
              const isSelected = selectedDay === dayKey

              return (
                <g
                  key={dayKey}
                  onClick={() => setSelectedDay(dayKey)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Clickable area - larger hitbox */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="35"
                    fill="transparent"
                    className="hover:fill-blue-100 hover:opacity-30 transition-all duration-200"
                  />

                  {/* Glow for current day */}
                  {isCurrentDay && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="24"
                      fill="#3B82F6"
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Coin Background */}
                  <image
                    href={coinImage}
                    x={point.x - 22} // Centered (44px width/2)
                    y={point.y - 22} // Centered (44px height/2)
                    height="44"
                    width="44"
                    className={`transition-all duration-200 ${isSelected ? 'drop-shadow-lg' : ''}`}
                    style={{
                      // Unlock coin if it's unlocked (current day or past day)
                      opacity: (isUnlocked || isDayCompleted || currentDayAllTasksCompleted) ? 1 : 0.6,
                      filter: (isUnlocked || isDayCompleted || currentDayAllTasksCompleted) ? 'none' : 'grayscale(1)'
                    }}
                  />

                  {/* Day number */}
                  <text
                    x={point.x}
                    y={point.y + 8}
                    fontSize={isCurrentDay ? "26" : isDayCompleted || currentDayAllTasksCompleted ? "24" : "22"}
                    fill="#92400E"
                    fontWeight="800"
                    textAnchor="middle"
                    className="pointer-events-none font-bold"
                    style={{
                      textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                      fontFamily: 'ui-rounded, system-ui, sans-serif'
                    }}
                  >
                    {point.dayInWeek}
                  </text>

                  {/* Checkmark for completed */}
                  {(isDayCompleted || currentDayAllTasksCompleted) && (
                    <text
                      x={point.x}
                      y={point.y + 18}
                      fontSize="16"
                      fill="#FFFFFF"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      ✓
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Lesson Nodes - Duolingo style with circular buttons */}
          {pathPoints.map((position, posIdx) => {
            // Find corresponding lesson
            let lesson = null
            if (position.isExam) {
              const examIndex = position.examIndex
              const exams = lessonData.filter(l => l.type === 'test')
              lesson = exams[examIndex]
            } else {
              const lessonIndex = position.lessonIndex
              const lessons = lessonData.filter(l => l.type !== 'test')
              lesson = lessons[lessonIndex]
            }

            if (!lesson) return null

            const isLocked = lesson.locked
            const isCompleted = lesson.completed
            const lessonIndex = lessonData.indexOf(lesson)
            const isCurrent = lessonIndex === currentLessonIndex && !isCompleted
            const isTest = lesson.type === 'test'

            return (
              <div
                key={lesson.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredLesson(lesson.id)}
                onMouseLeave={() => setHoveredLesson(null)}
              >

                {/* Active Lesson - Large green button with play icon */}
                {isCurrent && !isTest ? (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 10 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const currentLessonId = `${currentWeek}-1`
                      navigate(`/lesson/${currentLessonId}`, {
                        state: {
                          lessonId: currentLessonId,
                          lessonLabel: `Week ${currentWeek}`,
                          lessonIcon: lesson.icon,
                          dailyGoal: levelConfig?.dailyNewWords
                        }
                      })
                    }}
                    className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-2xl flex items-center justify-center border-4 border-white"
                    style={{
                      boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4), 0 0 0 8px rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    {/* Play icon */}
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>

                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
                  </motion.button>
                ) : (
                  /* Inactive Lesson Button - 3D Style */
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                      delay: posIdx * 0.05
                    }}
                    whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : -2 }}
                    whileTap={{ scale: isLocked ? 1 : 0.95 }}
                    onClick={() => !isLocked && setSelectedLesson(selectedLesson === lesson.id ? null : lesson.id)}
                    disabled={isLocked}
                    className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isLocked
                        ? 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)'
                        : 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
                      boxShadow: isLocked
                        ? 'inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
                        : 'inset 0 -2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.15), 0 0 0 4px white',
                    }}
                  >
                    {/* Inner circle for depth */}
                    <div
                      className="absolute inset-2 rounded-full"
                      style={{
                        background: isLocked
                          ? 'linear-gradient(135deg, #D1D5DB 0%, #E5E7EB 100%)'
                          : 'linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)'
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {isLocked ? (
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span
                          className="text-2xl font-bold text-gray-400"
                          style={{
                            textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.2)'
                          }}
                        >
                          {posIdx + 1}
                        </span>
                      )}
                    </div>
                  </motion.button>
                )}

                {/* Lesson Label - Only show for non-current lessons */}
                {!isCurrent && (
                  <div className="mt-3 text-center">
                    <div className={`
                      text-xs font-semibold px-3 py-1 rounded-full
                      ${isLocked
                        ? 'text-gray-400'
                        : 'text-gray-600'
                      }
                    `}>
                      {lesson.label}
                    </div>
                  </div>
                )}


              </div>
            )
          })}

          {/* Section1 Images - Before lesson 4 with alternating left-right pattern */}
          {section1ImagePositions.map((imagePos, index) => (
            <motion.div
              key={`section1-${index}`}
              className="absolute z-20 cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 12,
                delay: (index + 1) * 0.1
              }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/lesson-plan')}
              style={{
                left: `${imagePos.x}%`,
                top: `${imagePos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img
                src={imagePos.image}
                alt={`Section 1 Image ${index + 1}`}
                className="w-24 h-24 object-contain"
              />
            </motion.div>
          ))}

          {/* Decorative Elements */}
          {decorations.map((decoration, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className={`${decoration.size} opacity-60`}>{decoration.emoji}</span>
            </div>
          ))}

          {/* Day Labels removed - numbers are now INSIDE the circles for cleaner design */}

        </div>

        {/* Lesson Detail Panel (when selected) */}
        {/* Day Point Popup - Inline on Path Map */}
        <AnimatePresence>
        {selectedDay && (() => {
          const dayPoint = dayPoints.find((p, idx) => `day-${p.weekIndex}-${p.dayInWeek}` === selectedDay)
          if (!dayPoint) return null

          const weekNumber = dayPoint.weekIndex + 1
          const isCompleted = dayPoint.globalDay < currentDay || (dayPoint.globalDay === currentDay && todayCompleted.newWords)
          const isCurrent = dayPoint.globalDay === currentDay
          const isUnlocked = dayPoint.globalDay <= currentDay + 1
          const isLocked = dayPoint.globalDay > currentDay + 1

          // Get lesson label for the day
          const lessonLabel = lessonData[dayPoint.weekIndex]?.label || `Week ${weekNumber} Day ${dayPoint.dayInWeek}`
          
          // FIXED POSITIONING: Popup stays directly below coin, locked to coin's pixel position
          // This ensures the popup doesn't shift when background road twists or animates
          const pointerPositionPx = 20 // Pointer is 20px from left edge of green card (always fixed)
          const leftSpacePx = 200 // Big left space to push content to the right (creates empty green area)
          const greenCardMaxWidth = 320 // max-w-[320px] from the green card
          
          // Use coin's actual pixel position (calculated in useEffect)
          // Position popup so pointer aligns with coin's center
          // Coin center X = coinPosition.x
          // Pointer X = popupLeft + leftSpacePx + pointerPositionPx
          // We want: popupLeft + leftSpacePx + pointerPositionPx = coinPosition.x
          // Therefore: popupLeft = coinPosition.x - leftSpacePx - pointerPositionPx
          let popupLeft = coinPosition.x - leftSpacePx - pointerPositionPx
          
          // Ensure popup doesn't go off-screen on the left
          const minPopupLeft = 0
          popupLeft = Math.max(popupLeft, minPopupLeft)
          
          // Ensure popup doesn't go off-screen on the right
          const maxPopupLeft = containerWidth - leftSpacePx - greenCardMaxWidth
          popupLeft = Math.min(popupLeft, maxPopupLeft)
          
          // Position directly below coin with spacing
          const popupTop = coinPosition.y + 50
          

          return (
            <motion.div 
              key={selectedDay}
              className="absolute z-30"
              style={{
                left: `${popupLeft}px`, // Fixed pixel position relative to coin
                top: `${popupTop}px`, // Fixed pixel position relative to coin
                paddingLeft: `${leftSpacePx}px`, // ALWAYS 200px - creates big left space, pushes content right
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside popup
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                duration: 0.3
              }}
            >
              {/* Green Speech Bubble Card - ALWAYS same structure: big left space, pointer on left, content on right */}
              <motion.div 
                className="relative bg-green-500 rounded-3xl p-5 shadow-2xl min-w-[280px] max-w-[320px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {/* Speech bubble pointer - ALWAYS 20px from left edge of green card, points up to clicked coin */}
                <div 
                  className="absolute w-0 h-0"
                  style={{
                    left: `${pointerPositionPx}px`, // ALWAYS 20px - fixed position from left edge of green card
                    top: '-12px',
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderBottom: '12px solid #10B981'
                  }}
                ></div>
                
                {/* Close button */}
                <button
                  onClick={() => setSelectedDay(null)}
                  className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1.5 shadow-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Content */}
                <div className="relative">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-1 text-center">
                    {lessonLabel}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white/90 text-center mb-4 text-xs">
                    {isCompleted 
                      ? "Prove your proficiency with Legendary" 
                      : isUnlocked 
                      ? "Start your learning journey"
                      : "Complete previous days to unlock"}
                  </p>

                  {/* Green Owl Character (right side) */}
                  <div className="absolute right-3 top-0 opacity-80">
                    <div className="text-4xl">🦉</div>
                  </div>

                  {/* Action Buttons */}
                  {isUnlocked && (
                    <div className="space-y-2 mt-6">
                      {/* Practice Button */}
                      <button
                        onClick={() => {
                          const lessonId = `${weekNumber}-${dayPoint.dayInWeek}`
                          navigate(`/lesson/${lessonId}`, {
                            state: {
                              lessonId: lessonId,
                              day: dayPoint.globalDay,
                              week: weekNumber,
                              dayInWeek: dayPoint.dayInWeek,
                              lessonLabel: lessonLabel,
                              dailyGoal: levelConfig?.dailyNewWords,
                              mode: 'practice'
                            }
                          })
                          setSelectedDay(null)
                        }}
                        className="w-full bg-white text-green-600 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-all transform hover:scale-105 shadow-md"
                      >
                        PRACTICE +5 XP
                      </button>

                      {/* Legendary Button */}
                      <button
                        onClick={() => {
                          const lessonId = `${weekNumber}-${dayPoint.dayInWeek}`
                          navigate(`/lesson/${lessonId}`, {
                            state: {
                              lessonId: lessonId,
                              day: dayPoint.globalDay,
                              week: weekNumber,
                              dayInWeek: dayPoint.dayInWeek,
                              lessonLabel: lessonLabel,
                              dailyGoal: levelConfig?.dailyNewWords,
                              mode: 'legendary'
                            }
                          })
                          setSelectedDay(null)
                        }}
                        className="w-full bg-yellow-400 text-green-800 py-3 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-md"
                      >
                        LEGENDARY +40 XP
                      </button>
                    </div>
                  )}

                  {isLocked && (
                    <div className="text-center py-3">
                      <p className="text-white/80 text-xs">Complete previous days to unlock</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
        </AnimatePresence>

        {/* Lesson Popup Modal */}
        {selectedLesson && (
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-50 animate-slide-up">
            {(() => {
              const lesson = lessonData.find(l => l.id === selectedLesson)
              if (!lesson) return null

              return (
                <div className="max-w-md mx-auto">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="text-center mb-4">
                    <span className="text-5xl mb-3 block">{lesson.icon}</span>
                    <h3 className="text-2xl font-bold text-gray-800">{lesson.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{lesson.id}</p>
                  </div>

                  {lesson.completed && (
                    <div className="bg-green-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700 font-semibold">Completed</span>
                      </div>
                      <div className="flex justify-center gap-1 mt-2">
                        {Array.from({ length: lesson.stars }).map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">⭐</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        // Navigate to lesson page
                        navigate(`/lesson/${lesson.id}`, {
                          state: {
                            lessonId: lesson.id,
                            lessonLabel: lesson.label,
                            lessonIcon: lesson.icon
                          }
                        })
                        setSelectedLesson(null) // Close the detail panel
                      }}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      {lesson.completed ? 'Practice Again' : 'Start Lesson'}
                    </button>

                    {lesson.completed && (
                      <button
                        onClick={() => {
                          // Navigate to quiz page for reviewing mistakes
                          navigate('/quize', {
                            state: {
                              lessonId: lesson.id,
                              lessonLabel: lesson.label,
                              from: 'learning-path',
                              reviewMode: true
                            }
                          })
                        }}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        Review Mistakes
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="text-2xl mb-1">💬</div>
                      <div className="text-gray-600">15 words</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <div className="text-2xl mb-1">⏱️</div>
                      <div className="text-gray-600">5 min</div>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-xl">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-gray-600">15 XP</div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>

    </div>
  )
}

export default LearningPathVertical

