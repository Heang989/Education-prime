import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'

// Generate Access Token (7 days - longer life since no refresh token)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
}

// Save token to database (User model)
const saveToken = async (userId, token) => {
    try {
        console.log('Saving token to User document:', userId)

        // Update user with new token
        await User.findByIdAndUpdate(userId, {
            token: token
        })

        console.log('Token saved to User successfully')
    } catch (error) {
        console.error('Error saving token to User:', error.message)
        throw error
    }
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        // Check if user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        })

        if (user) {
            // Generate token
            const token = generateToken(user._id)

            // Save token to user document
            await saveToken(user._id, token)

            res.status(201).json({
                accessToken: token, // Keep key as accessToken for frontend compatibility
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })
        } else {
            res.status(400).json({ message: 'Invalid user data' })
        }
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({ message: error.message })
    }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' })
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Check password
        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Generate token
        const token = generateToken(user._id)

        // Save token to user document
        await saveToken(user._id, token)

        res.json({
            accessToken: token, // Keep key as accessToken for frontend compatibility
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // Clear token from user document
        await User.findByIdAndUpdate(req.user._id, {
            token: null
        })

        res.json({ message: 'Logged out successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Logout from all devices (same as logout in this model)
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAll = async (req, res) => {
    try {
        // Clear token from user document
        await User.findByIdAndUpdate(req.user._id, {
            token: null
        })

        res.json({ message: 'Logged out from all devices successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get active sessions (Not supported in single-token model)
// @route   GET /api/auth/sessions
// @access  Private
export const getActiveSessions = async (req, res) => {
    res.json([{
        deviceInfo: 'Current Device',
        ipAddress: 'Unknown',
        createdAt: new Date(),
        lastUsedAt: new Date()
    }])
}

// @desc    Create new user (Admin only)
// @route   POST /api/auth/create-user
// @access  Private/Admin
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        // Check if user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Create user (no token generation - admin creates account, user will login later)
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        })

        if (user) {
            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            })
        } else {
            res.status(400).json({ message: 'Invalid user data' })
        }
    } catch (error) {
        console.error('Create user error:', error)
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -token').sort({ createdAt: -1 })
        res.json(users)
    } catch (error) {
        console.error('Get users error:', error)
        res.status(500).json({ message: error.message })
    }
}