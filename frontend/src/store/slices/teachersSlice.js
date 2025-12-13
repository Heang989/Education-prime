import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, REQUEST_TIMEOUT } from '../../config/api.js'

const TEACHERS_API_URL = `${API_URL}/teachers`

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
export const fetchTeachers = createAsyncThunk(
    'teachers/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(TEACHERS_API_URL, {
                ...getAuthConfig(),
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout - please check if backend is running')
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch teachers'
            )
        }
    }
)

export const fetchTeachersByLevel = createAsyncThunk(
    'teachers/fetchByLevel',
    async (level, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${TEACHERS_API_URL}/level/${level}`, {
                ...getAuthConfig(),
                timeout: REQUEST_TIMEOUT
            })
            return { level, teachers: data }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout - please check if backend is running')
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch teachers by level'
            )
        }
    }
)

export const createTeacher = createAsyncThunk(
    'teachers/create',
    async (teacherData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.post(TEACHERS_API_URL, teacherData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create teacher'
            )
        }
    }
)

export const updateTeacher = createAsyncThunk(
    'teachers/update',
    async ({ id, teacherData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.put(`${TEACHERS_API_URL}/${id}`, teacherData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update teacher'
            )
        }
    }
)

export const deleteTeacher = createAsyncThunk(
    'teachers/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${TEACHERS_API_URL}/${id}`, getAuthConfig())
            return id
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete teacher'
            )
        }
    }
)

// Initial state
const initialState = {
    teachers: [],
    loading: false,
    error: null,
    success: false
}

// Slice
const teachersSlice = createSlice({
    name: 'teachers',
    initialState,
    reducers: {
        resetTeachersState: (state) => {
            state.loading = false
            state.error = null
            state.success = false
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch teachers
            .addCase(fetchTeachers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchTeachers.fulfilled, (state, action) => {
                state.loading = false
                state.teachers = action.payload
                state.error = null
            })
            .addCase(fetchTeachers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create teacher
            .addCase(createTeacher.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(createTeacher.fulfilled, (state, action) => {
                state.loading = false
                state.teachers.unshift(action.payload)
                state.success = true
                state.error = null
            })
            .addCase(createTeacher.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.success = false
            })
            // Update teacher
            .addCase(updateTeacher.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(updateTeacher.fulfilled, (state, action) => {
                state.loading = false
                const index = state.teachers.findIndex(
                    (teacher) => teacher._id === action.payload._id
                )
                if (index !== -1) {
                    state.teachers[index] = action.payload
                }
                state.success = true
                state.error = null
            })
            .addCase(updateTeacher.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.success = false
            })
            // Delete teacher
            .addCase(deleteTeacher.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteTeacher.fulfilled, (state, action) => {
                state.loading = false
                state.teachers = state.teachers.filter(
                    (teacher) => teacher._id !== action.payload
                )
                state.error = null
            })
            .addCase(deleteTeacher.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { resetTeachersState } = teachersSlice.actions
export default teachersSlice.reducer

