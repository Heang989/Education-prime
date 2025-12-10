import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from token and include the stored token for validation
            const user = await User.findById(decoded.id).select('-password +token')

            if (!user) {
                return res.status(401).json({ message: 'User not found' })
            }

            // Check if token matches the one in database
            // This ensures that if user logs out (token=null), the old token becomes invalid
            if (user.token !== token) {
                return res.status(401).json({ message: 'Token is no longer valid' })
            }

            req.user = user
            next()
        } catch (error) {
            console.error(error)
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired, please refresh' })
            }
            return res.status(401).json({ message: 'Not authorized, token failed' })
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' })
    }
}

// Check if user is admin
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(403).json({ message: 'Not authorized as admin' })
    }
}
