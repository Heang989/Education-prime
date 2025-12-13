import Lesson from '../models/Lesson.js'
import Category from '../models/Categories.js'
import { logError } from '../utils/helper.js'

// @desc    Get all lessons
// @route   GET /api/lessons
// @access  Private
export const getAll = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .select('-createdBy -__v')
      .sort({ level: 1, lessonNumber: 1 })
      .lean()

    res.json(lessons)
  } catch (error) {
    const errorMessage = `Failed to fetch lessons: ${error.message}`
    console.error(errorMessage)
    await logError('lesson', errorMessage, res)
  }
}

// @desc    Get lessons by level
// @route   GET /api/lessons/level/:level
// @access  Private
export const getByLevel = async (req, res) => {
  try {
    const { level } = req.params
    const { teacherId } = req.query // Optional: filter by teacher
    
    const query = { level: parseInt(level) }
    if (teacherId) {
      query.teacherId = teacherId
    }
    
    const lessons = await Lesson.find(query)
      .select('-createdBy -__v')
      .sort({ lessonNumber: 1 })
      .lean()

    res.json(lessons)
  } catch (error) {
    const errorMessage = `Failed to fetch lessons by level: ${error.message}`
    console.error(errorMessage)
    await logError('lesson', errorMessage, res)
  }
}

// @desc    Get lessons by teacher
// @route   GET /api/lessons/teacher/:teacherId
// @access  Private
export const getByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params
    const { level } = req.query // Optional: filter by level
    
    const query = { teacherId }
    if (level) {
      query.level = parseInt(level)
    }
    
    const lessons = await Lesson.find(query)
      .select('-createdBy -__v')
      .sort({ level: 1, lessonNumber: 1 })
      .lean()

    res.json(lessons)
  } catch (error) {
    const errorMessage = `Failed to fetch lessons by teacher: ${error.message}`
    console.error(errorMessage)
    await logError('lesson', errorMessage, res)
  }
}

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
export const getById = async (req, res) => {
  try {
    const { id } = req.params
    
    // Validate MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid lesson ID format' })
    }

    const lesson = await Lesson.findById(id)
      .select('-createdBy -__v')
      .lean()

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    res.json(lesson)
  } catch (error) {
    const errorMessage = `Failed to fetch lesson: ${error.message}`
    console.error(errorMessage)
    console.error('Error details:', error)
    
    // Check if it's a MongoDB cast error
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid lesson ID format' })
    }
    
    await logError('lesson', errorMessage, res)
  }
}

// @desc    Create new lesson
// @route   POST /api/lessons
// @access  Private/Admin
export const create = async (req, res) => {
  try {
    const {
      level,
      lessonNumber,
      title,
      titleEnglish,
      subtitle,
      subtitleEnglish,
      vocabulary,
      teacherId
    } = req.body

    if (!level || !lessonNumber || !title || !titleEnglish || !subtitle || !subtitleEnglish || !teacherId) {
      return res.status(400).json({ message: 'Please fill in all required fields including teacherId' })
    }

    // Match vocabulary with categories
    const matchedVocabulary = await Promise.all(
      (vocabulary || []).map(async (vocab) => {
        if (vocab.chinese) {
          // Try to find matching category by Chinese name
          const category = await Category.findOne({
            chineseName: { $regex: new RegExp(`^${vocab.chinese.trim()}$`, 'i') }
          })

          if (category) {
            return {
              chinese: vocab.chinese,
              pinyin: vocab.pinyin || vocab.phonetic || '',
              english: vocab.english || category.englishName || '',
              khmer: vocab.khmer || category.khmerName || '',
              phonetic: vocab.phonetic || category.phonetic || vocab.pinyin || '',
              categoryId: category._id
            }
          }
        }
        return {
          chinese: vocab.chinese || '',
          pinyin: vocab.pinyin || vocab.phonetic || '',
          english: vocab.english || '',
          khmer: vocab.khmer || '',
          phonetic: vocab.phonetic || vocab.pinyin || '',
          categoryId: null
        }
      })
    )

    const lesson = await Lesson.create({
      level: parseInt(level),
      lessonNumber: parseInt(lessonNumber),
      title,
      titleEnglish,
      subtitle,
      subtitleEnglish,
      vocabulary: matchedVocabulary,
      teacherId,
      createdBy: req.user._id
    })

    res.status(201).json(lesson)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Lesson already exists for this level and lesson number' })
    }
    const errorMessage = `Failed to create lesson: ${error.message}`
    console.error(errorMessage)
    await logError('lesson', errorMessage, res)
  }
}

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private/Admin
export const update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      level,
      lessonNumber,
      title,
      titleEnglish,
      subtitle,
      subtitleEnglish,
      vocabulary,
      teacherId
    } = req.body

    const lesson = await Lesson.findById(id)

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Validate required fields if they are being updated
    if (level !== undefined && (!title || !titleEnglish || !subtitle || !subtitleEnglish)) {
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }

    // Match vocabulary with categories if vocabulary is provided
    let matchedVocabulary = lesson.vocabulary
    if (vocabulary !== undefined) {
      matchedVocabulary = await Promise.all(
        vocabulary.map(async (vocab) => {
          if (vocab.chinese) {
            // Try to find matching category by Chinese name
            const category = await Category.findOne({
              chineseName: { $regex: new RegExp(`^${vocab.chinese.trim()}$`, 'i') }
            })

            if (category) {
              return {
                chinese: vocab.chinese,
                pinyin: vocab.pinyin || vocab.phonetic || '',
                english: vocab.english || category.englishName || '',
                khmer: vocab.khmer || category.khmerName || '',
                phonetic: vocab.phonetic || category.phonetic || vocab.pinyin || '',
                categoryId: category._id
              }
            }
          }
          return {
            chinese: vocab.chinese || '',
            pinyin: vocab.pinyin || vocab.phonetic || '',
            english: vocab.english || '',
            khmer: vocab.khmer || '',
            phonetic: vocab.phonetic || vocab.pinyin || '',
            categoryId: vocab.categoryId || null
          }
        })
      )
    }

    // Only update fields that are provided
    if (level !== undefined) lesson.level = parseInt(level)
    if (lessonNumber !== undefined) lesson.lessonNumber = parseInt(lessonNumber)
    if (title !== undefined) lesson.title = title.trim()
    if (titleEnglish !== undefined) lesson.titleEnglish = titleEnglish.trim()
    if (subtitle !== undefined) lesson.subtitle = subtitle.trim()
    if (subtitleEnglish !== undefined) lesson.subtitleEnglish = subtitleEnglish.trim()
    if (vocabulary !== undefined) lesson.vocabulary = matchedVocabulary
    if (teacherId !== undefined) lesson.teacherId = teacherId

    const updatedLesson = await lesson.save()

    res.json(updatedLesson)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Lesson already exists for this teacher, level, and lesson number' })
    }
    const errorMessage = `Failed to update lesson: ${error.message}`
    console.error(errorMessage)
    await logError('lesson', errorMessage, res)
  }
}

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
export const remove = async (req, res) => {
  try {
    const { id } = req.params

    const lesson = await Lesson.findById(id)

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    await lesson.deleteOne()

    res.json({ message: 'Lesson removed' })
  } catch (error) {
    const errorMessage = `Failed to delete lesson: ${error.message}`
    console.error(errorMessage)
    await logError('lesson', errorMessage, res)
  }
}

