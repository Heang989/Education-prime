import express from 'express'
import { body } from 'express-validator'
import { getAll, getByLevel, getByTeacher, getById, create, update, remove } from '../controllers/lessons.controller.js'
import { protect, admin } from '../middleware/auth.js'
import { validateCheck } from '../middleware/validation.js'

const router = express.Router()

// Validation rules for lesson
const validateData = () => {
  return [
    body('level')
      .isInt({ min: 1, max: 8 })
      .withMessage('Level must be between 1 and 8!')
      .toInt(),
    body('lessonNumber')
      .isInt({ min: 1, max: 6 })
      .withMessage('Lesson number must be between 1 and 6!')
      .toInt(),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Please fill in title!'),
    body('titleEnglish')
      .trim()
      .notEmpty()
      .withMessage('Please fill in English title!'),
    body('subtitle')
      .trim()
      .notEmpty()
      .withMessage('Please fill in subtitle!'),
    body('subtitleEnglish')
      .trim()
      .notEmpty()
      .withMessage('Please fill in English subtitle!'),
    body('teacherId')
      .notEmpty()
      .withMessage('Teacher ID is required!')
      .isMongoId()
      .withMessage('Invalid teacher ID format!')
  ]
}

// GET /api/lessons -> list all lessons (authenticated users)
router.get('/', protect, getAll)

// GET /api/lessons/level/:level -> get lessons by level (authenticated users)
router.get('/level/:level', protect, getByLevel)

// GET /api/lessons/teacher/:teacherId -> get lessons by teacher (authenticated users)
router.get('/teacher/:teacherId', protect, getByTeacher)

// GET /api/lessons/:id -> get single lesson (authenticated users)
router.get('/:id', protect, getById)

// POST /api/lessons -> create new lesson (admin only)
router.post('/', protect, admin, validateData(), validateCheck, create)

// PUT /api/lessons/:id -> update lesson (admin only)
router.put('/:id', protect, admin, validateData(), validateCheck, update)

// DELETE /api/lessons/:id -> delete lesson (admin only)
router.delete('/:id', protect, admin, remove)

export default router

