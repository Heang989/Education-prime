import Teacher from '../models/Teacher.js'
import { logError } from '../utils/helper.js'

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getAll = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select('-createdBy -__v')
      .sort({ level: 1, createdAt: -1 })
      .lean()

    res.json(teachers)
  } catch (error) {
    const errorMessage = `Failed to fetch teachers: ${error.message}`
    console.error(errorMessage)
    await logError('teacher', errorMessage, res)
  }
}

// @desc    Get teachers by level
// @route   GET /api/teachers/level/:level
// @access  Private
export const getByLevel = async (req, res) => {
  try {
    const { level } = req.params
    const teachers = await Teacher.find({ level: parseInt(level) })
      .select('-createdBy -__v')
      .sort({ createdAt: -1 })
      .lean()

    res.json(teachers)
  } catch (error) {
    const errorMessage = `Failed to fetch teachers by level: ${error.message}`
    console.error(errorMessage)
    await logError('teacher', errorMessage, res)
  }
}

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private/Admin
export const create = async (req, res) => {
  try {
    const {
      name,
      subject,
      level,
      experience,
      rating,
      students,
      avatar,
      bio,
      specialties,
      schedule
    } = req.body

    if (!name || !subject || !level || !experience || !bio || !schedule) {
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }

    // Check if level already has 2 teachers
    const levelTeachers = await Teacher.find({ level: parseInt(level) })
    if (levelTeachers.length >= 2) {
      return res.status(400).json({ message: `Level ${level} already has 2 teachers. Each level can only have 2 teachers.` })
    }

    // Parse specialties if it's a JSON string
    let specialtiesArray = []
    if (specialties) {
      if (typeof specialties === 'string') {
        try {
          specialtiesArray = JSON.parse(specialties)
        } catch (e) {
          specialtiesArray = specialties.split(',').map(s => s.trim())
        }
      } else if (Array.isArray(specialties)) {
        specialtiesArray = specialties
      }
    }

    const teacher = await Teacher.create({
      name,
      subject,
      level: parseInt(level),
      experience,
      rating: rating ? parseFloat(rating) : 4.5,
      students: students ? parseInt(students) : 0,
      avatar: avatar || '👩‍🏫',
      bio,
      specialties: specialtiesArray,
      schedule,
      createdBy: req.user._id
    })

    res.status(201).json(teacher)
  } catch (error) {
    const errorMessage = `Failed to create teacher: ${error.message}`
    console.error(errorMessage)
    await logError('teacher', errorMessage, res)
  }
}

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
export const update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      subject,
      level,
      experience,
      rating,
      students,
      avatar,
      bio,
      specialties,
      schedule
    } = req.body

    const teacher = await Teacher.findById(id)

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    // Parse specialties if it's a JSON string
    let specialtiesArray = teacher.specialties
    if (specialties !== undefined) {
      if (typeof specialties === 'string') {
        try {
          specialtiesArray = JSON.parse(specialties)
        } catch (e) {
          specialtiesArray = specialties.split(',').map(s => s.trim())
        }
      } else if (Array.isArray(specialties)) {
        specialtiesArray = specialties
      }
    }

    // If level is being changed, check if new level already has 2 teachers
    if (level !== undefined && parseInt(level) !== teacher.level) {
      const newLevelTeachers = await Teacher.find({ level: parseInt(level), _id: { $ne: id } })
      if (newLevelTeachers.length >= 2) {
        return res.status(400).json({ message: `Level ${level} already has 2 teachers. Each level can only have 2 teachers.` })
      }
    }

    teacher.name = name ?? teacher.name
    teacher.subject = subject ?? teacher.subject
    teacher.level = level !== undefined ? parseInt(level) : teacher.level
    teacher.experience = experience ?? teacher.experience
    teacher.rating = rating !== undefined ? parseFloat(rating) : teacher.rating
    teacher.students = students !== undefined ? parseInt(students) : teacher.students
    teacher.avatar = avatar ?? teacher.avatar
    teacher.bio = bio ?? teacher.bio
    teacher.specialties = specialtiesArray
    teacher.schedule = schedule ?? teacher.schedule

    const updatedTeacher = await teacher.save()

    res.json(updatedTeacher)
  } catch (error) {
    const errorMessage = `Failed to update teacher: ${error.message}`
    console.error(errorMessage)
    await logError('teacher', errorMessage, res)
  }
}

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
export const remove = async (req, res) => {
  try {
    const { id } = req.params

    const teacher = await Teacher.findById(id)

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    await teacher.deleteOne()

    res.json({ message: 'Teacher removed' })
  } catch (error) {
    const errorMessage = `Failed to delete teacher: ${error.message}`
    console.error(errorMessage)
    await logError('teacher', errorMessage, res)
  }
}

