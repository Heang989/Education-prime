import express from 'express'
import { body } from 'express-validator'
import { getAll, getByLevel, create, update, remove } from '../controllers/teachers.controller.js'
import { protect, admin } from '../middleware/auth.js'
import { validateCheck } from '../middleware/validation.js'

const router = express.Router()

// Validation rules for teacher
const validateData = () => {
  return [
    body('name').notEmpty().withMessage('Please fill in teacher name!'),
    body('subject').notEmpty().withMessage('Please fill in subject!'),
    body('level').isInt({ min: 1, max: 8 }).withMessage('Level must be between 1 and 8!'),
    body('experience').notEmpty().withMessage('Please fill in experience!'),
    body('bio').notEmpty().withMessage('Please fill in bio!'),
    body('schedule').notEmpty().withMessage('Please fill in schedule!')
  ]
}

// GET /api/teachers -> list all teachers (authenticated users)
router.get('/', protect, getAll)

// GET /api/teachers/level/:level -> get teachers by level (authenticated users)
router.get('/level/:level', protect, getByLevel)

// POST /api/teachers -> create new teacher (admin only)
router.post('/', protect, admin, validateData(), validateCheck, create)

// PUT /api/teachers/:id -> update teacher (admin only)
router.put('/:id', protect, admin, validateData(), validateCheck, update)

// DELETE /api/teachers/:id -> delete teacher (admin only)
router.delete('/:id', protect, admin, remove)

export default router

