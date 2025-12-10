import Category from '../models/Categories.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logError } from '../utils/helper.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getAll = async (req, res) => {
  try {
    const categories = await Category.find()
      .select('-createdBy -__v')
      .sort({ createdAt: -1 })
      .lean()

    res.json(categories)
  } catch (error) {
    const errorMessage = `Failed to fetch categories: ${error.message}`
    console.error(errorMessage)
    await logError('category', errorMessage, res)
  }
}

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const create = async (req, res) => {
  try {
    let {
      englishName,
      khmerName,
      chineseName,
      phonetic,
      icon,
      type,
      ex_english,
      ex_chinese,
      ex_chinese_pinyin,
      ex_khmer,
      highlight_english,
      highlight_chinese,
      highlight_chinese_pinyin,
      highlight_khmer,
      definition,
      usage,
      notes
    } = req.body

    // Parse type if it's a JSON string (from FormData)
    if (typeof type === 'string') {
      try {
        type = JSON.parse(type)
      } catch (e) {
        // If parsing fails, treat as single string
      }
    }

    // Icon can be either emoji (string) or image file (uploaded)
    let iconValue = icon // Default to emoji if provided

    // If image file was uploaded, use the file path
    if (req.file) {
      iconValue = `/uploads/images/categories/${req.file.filename}`
    }

    if (!englishName || !khmerName || !phonetic || !iconValue) {
      // If file was uploaded but validation failed, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }

    // Normalize type to array: if string, convert to array; if array, use as is
    const typeArray = Array.isArray(type) ? type : type ? [type] : ['General']

    const category = await Category.create({
      englishName,
      khmerName,
      chineseName,
      phonetic,
      icon: iconValue,
      type: typeArray,
      ex_english: ex_english || '',
      ex_chinese: ex_chinese || '',
      ex_chinese_pinyin: ex_chinese_pinyin || '',
      ex_khmer: ex_khmer || '',
      highlight_english: highlight_english || '',
      highlight_chinese: highlight_chinese || '',
      highlight_chinese_pinyin: highlight_chinese_pinyin || '',
      highlight_khmer: highlight_khmer || '',
      definition: definition || '',
      usage: usage || '',
      notes: notes || '',
      createdBy: req.user._id
    })

    res.status(201).json(category)
  } catch (error) {
    // Delete uploaded file if category creation failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (err) {
        console.error('Error deleting file:', err)
      }
    }
    const errorMessage = `Failed to create category: ${error.message}`
    console.error(errorMessage)
    await logError('category', errorMessage, res)
  }
}

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const update = async (req, res) => {
  try {
    const { id } = req.params
    let {
      englishName,
      khmerName,
      chineseName,
      phonetic,
      icon,
      type,
      ex_english,
      ex_chinese,
      ex_chinese_pinyin,
      ex_khmer,
      highlight_english,
      highlight_chinese,
      highlight_chinese_pinyin,
      highlight_khmer,
      definition,
      usage,
      notes
    } = req.body

    // Parse type if it's a JSON string (from FormData)
    if (typeof type === 'string') {
      try {
        type = JSON.parse(type)
      } catch (e) {
        // If parsing fails, treat as single string
      }
    }

    const category = await Category.findById(id)

    if (!category) {
      // Delete uploaded file if category not found
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(404).json({ message: 'Category not found' })
    }

    // Handle icon update
    let iconValue = icon ?? category.icon

    // If new image file was uploaded
    if (req.file) {
      // Delete old image file if it exists and is not an emoji
      if (category.icon && category.icon.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', category.icon)
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath)
          }
        } catch (err) {
          console.error('Error deleting old image:', err)
        }
      }
      // Use new uploaded file (in categories subfolder)
      iconValue = `/uploads/images/categories/${req.file.filename}`
    }

    category.englishName = englishName ?? category.englishName
    category.khmerName = khmerName ?? category.khmerName
    category.chineseName = chineseName ?? category.chineseName
    category.phonetic = phonetic ?? category.phonetic
    category.icon = iconValue
    // Normalize type to array: if string, convert to array; if array, use as is; if not provided, keep existing
    if (type !== undefined) {
      category.type = Array.isArray(type) ? type : type ? [type] : ['General']
    }
    // Handle optional fields - set to empty string if undefined or null
    category.ex_english = ex_english !== undefined ? ex_english || '' : category.ex_english || ''
    category.ex_chinese = ex_chinese !== undefined ? ex_chinese || '' : category.ex_chinese || ''
    category.ex_chinese_pinyin =
      ex_chinese_pinyin !== undefined ? ex_chinese_pinyin || '' : category.ex_chinese_pinyin || ''
    category.ex_khmer = ex_khmer !== undefined ? ex_khmer || '' : category.ex_khmer || ''
    category.highlight_english =
      highlight_english !== undefined ? highlight_english || '' : category.highlight_english || ''
    category.highlight_chinese =
      highlight_chinese !== undefined ? highlight_chinese || '' : category.highlight_chinese || ''
    category.highlight_chinese_pinyin =
      highlight_chinese_pinyin !== undefined
        ? highlight_chinese_pinyin || ''
        : category.highlight_chinese_pinyin || ''
    category.highlight_khmer =
      highlight_khmer !== undefined ? highlight_khmer || '' : category.highlight_khmer || ''
    category.definition = definition !== undefined ? definition || '' : category.definition || ''
    category.usage = usage !== undefined ? usage || '' : category.usage || ''
    category.notes = notes !== undefined ? notes || '' : category.notes || ''

    const updatedCategory = await category.save()

    res.json(updatedCategory)
  } catch (error) {
    // Delete uploaded file if update failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (err) {
        console.error('Error deleting file:', err)
      }
    }
    const errorMessage = `Failed to update category: ${error.message}`
    console.error(errorMessage)
    await logError('category', errorMessage, res)
  }
}

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const remove = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findById(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Delete associated image file if it exists
    if (category.icon && category.icon.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', category.icon)
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (err) {
        console.error('Error deleting image file:', err)
        // Continue with category deletion even if file deletion fails
      }
    }

    await category.deleteOne()

    res.json({ message: 'Category removed' })
  } catch (error) {
    const errorMessage = `Failed to delete category: ${error.message}`
    console.error(errorMessage)
    await logError('category', errorMessage, res)
  }
}
