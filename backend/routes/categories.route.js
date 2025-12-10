import express from 'express'
import { body } from 'express-validator'
import { getAll, create, update, remove } from '../controllers/categories.controller.js'
import { protect, admin } from '../middleware/auth.js'
import { validateCheck } from '../middleware/validation.js'
import upload from '../middleware/upload.js'

const router = express.Router()

// Validation rules for category
const validateData = () => {
  return [
    body('englishName').notEmpty().withMessage('Please fill in English name!'),
    body('khmerName').notEmpty().withMessage('Please fill in Khmer name!'),
    body('phonetic').notEmpty().withMessage('Please fill in phonetic!')
  ]
}

// GET /api/categories -> list categories (authenticated users)
router.get('/', protect, getAll)

// POST /api/categories -> create new category (admin only)
router.post('/', protect, admin, upload.single('iconImage'), validateData(), validateCheck, create)

// PUT /api/categories/:id -> update category (admin only)
router.put('/:id', protect, admin, upload.single('iconImage'), validateData(), validateCheck, update)

// DELETE /api/categories/:id -> delete category (admin only)
router.delete('/:id', protect, admin, remove)

export default router
