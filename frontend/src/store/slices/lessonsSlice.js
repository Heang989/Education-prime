import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, REQUEST_TIMEOUT } from '../../config/api.js'

const LESSONS_API_URL = `${API_URL}/lessons`

// Get token from localStorage
const getAuthConfig = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
}

// Async thunks
export const fetchLessons = createAsyncThunk(
    'lessons/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(LESSONS_API_URL, {
                ...getAuthConfig(),
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout - please check if backend is running')
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch lessons'
            )
        }
    }
)

export const fetchLessonsByLevel = createAsyncThunk(
    'lessons/fetchByLevel',
    async ({ level, teacherId }, { rejectWithValue }) => {
        try {
            const params = teacherId ? { teacherId } : {}
            const { data } = await axios.get(`${LESSONS_API_URL}/level/${level}`, {
                ...getAuthConfig(),
                params,
                timeout: REQUEST_TIMEOUT
            })
            return { level, teacherId, lessons: data }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout - please check if backend is running')
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch lessons by level'
            )
        }
    }
)

export const fetchLessonsByTeacher = createAsyncThunk(
    'lessons/fetchByTeacher',
    async ({ teacherId, level }, { rejectWithValue }) => {
        try {
            const params = level ? { level } : {}
            const { data } = await axios.get(`${LESSONS_API_URL}/teacher/${teacherId}`, {
                ...getAuthConfig(),
                params,
                timeout: REQUEST_TIMEOUT
            })
            return { teacherId, level, lessons: data }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout - please check if backend is running')
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch lessons by teacher'
            )
        }
    }
)

export const fetchLessonById = createAsyncThunk(
    'lessons/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            // Validate ID format before making request
            if (!id || typeof id !== 'string') {
                return rejectWithValue('Invalid lesson ID')
            }
            
            // Clean the ID - remove any invalid characters
            const cleanId = id.trim()
            
            // Check if it's a valid MongoDB ObjectId format (24 hex characters)
            if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
                return rejectWithValue('Invalid lesson ID format. Expected MongoDB ObjectId.')
            }
            
            const { data } = await axios.get(`${LESSONS_API_URL}/${cleanId}`, {
                ...getAuthConfig(),
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout - please check if backend is running')
            }
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch lesson'
            console.error('Error fetching lesson:', errorMessage, 'ID:', id)
            return rejectWithValue(errorMessage)
        }
    }
)

export const createLesson = createAsyncThunk(
    'lessons/create',
    async (lessonData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.post(LESSONS_API_URL, lessonData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create lesson'
            )
        }
    }
)

export const updateLesson = createAsyncThunk(
    'lessons/update',
    async ({ id, lessonData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.put(`${LESSONS_API_URL}/${id}`, lessonData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update lesson'
            )
        }
    }
)

export const deleteLesson = createAsyncThunk(
    'lessons/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${LESSONS_API_URL}/${id}`, getAuthConfig())
            return id
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete lesson'
            )
        }
    }
)

// Initial state
const initialState = {
    lessons: [],
    currentLesson: null,
    loading: false,
    error: null,
    success: false
}

// Slice
const lessonsSlice = createSlice({
    name: 'lessons',
    initialState,
    reducers: {
        resetLessonsState: (state) => {
            state.loading = false
            state.error = null
            state.success = false
        },
        setCurrentLesson: (state, action) => {
            state.currentLesson = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch lessons
            .addCase(fetchLessons.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLessons.fulfilled, (state, action) => {
                state.loading = false
                state.lessons = action.payload
                state.error = null
            })
            .addCase(fetchLessons.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch lessons by level
            .addCase(fetchLessonsByLevel.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLessonsByLevel.fulfilled, (state, action) => {
                state.loading = false
                const newLessons = action.payload.lessons || []
                // Remove old lessons for this level/teacher combination
                if (action.payload.level && action.payload.teacherId) {
                    state.lessons = state.lessons.filter(
                        l => !(l.level === action.payload.level && l.teacherId === action.payload.teacherId)
                    )
                } else if (action.payload.level) {
                    state.lessons = state.lessons.filter(
                        l => l.level !== action.payload.level
                    )
                }
                // Add new lessons
                state.lessons.push(...newLessons)
                state.error = null
            })
            .addCase(fetchLessonsByTeacher.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLessonsByTeacher.fulfilled, (state, action) => {
                state.loading = false
                const newLessons = action.payload.lessons || []
                // Remove old lessons for this teacher
                if (action.payload.teacherId) {
                    if (action.payload.level) {
                        state.lessons = state.lessons.filter(
                            l => !(l.teacherId === action.payload.teacherId && l.level === action.payload.level)
                        )
                    } else {
                        state.lessons = state.lessons.filter(
                            l => l.teacherId !== action.payload.teacherId
                        )
                    }
                }
                // Add new lessons
                state.lessons.push(...newLessons)
                state.error = null
            })
            .addCase(fetchLessonsByTeacher.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchLessonsByLevel.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch lesson by ID
            .addCase(fetchLessonById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLessonById.fulfilled, (state, action) => {
                state.loading = false
                state.currentLesson = action.payload
                state.error = null
            })
            .addCase(fetchLessonById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create lesson
            .addCase(createLesson.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(createLesson.fulfilled, (state, action) => {
                state.loading = false
                state.lessons.push(action.payload)
                state.success = true
                state.error = null
            })
            .addCase(createLesson.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.success = false
            })
            // Update lesson
            .addCase(updateLesson.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(updateLesson.fulfilled, (state, action) => {
                state.loading = false
                const index = state.lessons.findIndex(
                    (lesson) => lesson._id === action.payload._id
                )
                if (index !== -1) {
                    state.lessons[index] = action.payload
                }
                if (state.currentLesson && state.currentLesson._id === action.payload._id) {
                    state.currentLesson = action.payload
                }
                state.success = true
                state.error = null
            })
            .addCase(updateLesson.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.success = false
            })
            // Delete lesson
            .addCase(deleteLesson.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteLesson.fulfilled, (state, action) => {
                state.loading = false
                state.lessons = state.lessons.filter(
                    (lesson) => lesson._id !== action.payload
                )
                if (state.currentLesson && state.currentLesson._id === action.payload) {
                    state.currentLesson = null
                }
                state.error = null
            })
            .addCase(deleteLesson.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { resetLessonsState, setCurrentLesson } = lessonsSlice.actions
export default lessonsSlice.reducer

