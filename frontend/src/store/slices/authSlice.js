import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_URL, fetchWithTimeout } from '../../config/api.js'

const AUTH_API_URL = `${API_URL}/auth`

// Async thunk for login
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetchWithTimeout(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || 'Login failed')
            }

            // Store token and user data in localStorage
            localStorage.setItem('token', data.accessToken)
            localStorage.setItem('user', JSON.stringify(data.user))

            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for register
export const register = createAsyncThunk(
    'auth/register',
    async ({ name, email, password, role }, { rejectWithValue }) => {
        try {
            const response = await fetchWithTimeout(`${AUTH_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || 'Registration failed')
            }

            // Store token and user data in localStorage
            localStorage.setItem('token', data.accessToken)
            localStorage.setItem('user', JSON.stringify(data.user))

            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for checking auth status (load user)
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token')
        if (!token) {
            return rejectWithValue('No token found')
        }

        try {
            const response = await fetchWithTimeout(`${AUTH_API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                localStorage.removeItem('token')
                return rejectWithValue('Token invalid')
            }

            const data = await response.json()
            // Store user data in localStorage for immediate rendering on reload
            localStorage.setItem('user', JSON.stringify(data))
            return { user: data, token }
        } catch (error) {
            // Don't remove token on network errors - might be temporary
            if (error.message.includes('timeout') || error.message.includes('connect')) {
                return rejectWithValue(error.message)
            }
            localStorage.removeItem('token')
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for logout
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token')

        try {
            await fetchWithTimeout(`${AUTH_API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            // Clear token and user data regardless of response
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('refreshToken') // Clean up old token if exists

            return null
        } catch (error) {
            // Still clear token and user data even if request fails
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for logout from all devices
export const logoutAll = createAsyncThunk(
    'auth/logoutAll',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token')

        try {
            await fetchWithTimeout(`${AUTH_API_URL}/logout-all`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            localStorage.removeItem('token')

            return null
        } catch (error) {
            localStorage.removeItem('token')
            return rejectWithValue(error.message)
        }
    }
)

// Check if token exists to determine initial loading state
const hasToken = !!localStorage.getItem('token')
// Try to get cached user data from localStorage
const cachedUser = (() => {
    try {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    } catch {
        return null
    }
})()

const initialState = {
    user: cachedUser, // Use cached user data for immediate rendering
    token: localStorage.getItem('token'),
    isAuthenticated: !!cachedUser && hasToken, // Optimistically authenticated if we have both
    isLoading: hasToken, // Only show loading if we have a token to verify
    error: null,
    users: [], // For admin user management
    usersLoading: false,
    usersError: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.accessToken
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.accessToken
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.token
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false
                state.isAuthenticated = false
                state.user = null
                state.token = null
                // Clear cached user data if auth check fails
                localStorage.removeItem('user')
            })
            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.error = null
            })
            .addCase(logout.rejected, (state) => {
                // Even if logout fails, clear the state
                state.isLoading = false
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.error = null
            })
            // Logout All
            .addCase(logoutAll.fulfilled, (state) => {
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.error = null
            })
            // Create User (Admin)
            .addCase(createUser.pending, (state) => {
                state.usersLoading = true
                state.usersError = null
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.usersLoading = false
                state.users.push(action.payload.user)
            })
            .addCase(createUser.rejected, (state, action) => {
                state.usersLoading = false
                state.usersError = action.payload
            })
            // Fetch Users (Admin)
            .addCase(fetchUsers.pending, (state) => {
                state.usersLoading = true
                state.usersError = null
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.usersLoading = false
                state.users = action.payload
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.usersLoading = false
                state.usersError = action.payload
            })
    }
})

// Async thunk for creating user (Admin only)
export const createUser = createAsyncThunk(
    'auth/createUser',
    async ({ name, email, password, role }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token || localStorage.getItem('token')
            const response = await fetchWithTimeout(`${AUTH_API_URL}/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, password, role: role || 'user' })
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to create user')
            }

            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for fetching all users (Admin only)
export const fetchUsers = createAsyncThunk(
    'auth/fetchUsers',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token || localStorage.getItem('token')
            const response = await fetchWithTimeout(`${AUTH_API_URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch users')
            }

            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const { clearError } = authSlice.actions
export default authSlice.reducer
