import express from 'express'
import {
    register,
    login,
    getMe,
    logout,
    logoutAll,
    getActiveSessions,
    createUser,
    getUsers
} from '../controllers/auth.controller.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', register) // Keep for backward compatibility but can be disabled
router.post('/login', login)

// Protected routes
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)
router.post('/logout-all', protect, logoutAll)
router.get('/sessions', protect, getActiveSessions)

// Admin-only routes
router.post('/create-user', protect, admin, createUser)
router.get('/users', protect, admin, getUsers)

export default router
