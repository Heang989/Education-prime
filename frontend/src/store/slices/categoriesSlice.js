import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, REQUEST_TIMEOUT } from '../../config/api.js'

const CATEGORIES_API_URL = `${API_URL}/categories`

// Get token from localStorage (support both old and new token keys)
const getAuthConfig = () => {
    // Try new accessToken first, fallback to old token key
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
}

// Async thunks
export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(CATEGORIES_API_URL, {
                ...getAuthConfig(),
                timeout: REQUEST_TIMEOUT
            })
            return data
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout - please check if backend is running')
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch categories'
            )
        }
    }
)

export const createCategory = createAsyncThunk(
    'categories/create',
    async (categoryData, { rejectWithValue }) => {
        try {
            const formData = new FormData()

            // Add text fields
            formData.append('englishName', categoryData.englishName)
            formData.append('khmerName', categoryData.khmerName)
            formData.append('chineseName', categoryData.chineseName || '')
            formData.append('phonetic', categoryData.phonetic)
            formData.append('type', JSON.stringify(categoryData.type)) // Stringify array for FormData
            
            // Add optional fields
            formData.append('ex_english', categoryData.ex_english || '')
            formData.append('ex_chinese', categoryData.ex_chinese || '')
            formData.append('ex_chinese_pinyin', categoryData.ex_chinese_pinyin || '')
            formData.append('ex_khmer', categoryData.ex_khmer || '')
            formData.append('highlight_english', categoryData.highlight_english || '')
            formData.append('highlight_chinese', categoryData.highlight_chinese || '')
            formData.append('highlight_chinese_pinyin', categoryData.highlight_chinese_pinyin || '')
            formData.append('highlight_khmer', categoryData.highlight_khmer || '')
            formData.append('definition', categoryData.definition || '')
            formData.append('usage', categoryData.usage || '')
            formData.append('notes', categoryData.notes || '')

            // Add icon - either emoji string or file
            if (categoryData.iconFile) {
                formData.append('iconImage', categoryData.iconFile)
            } else {
                formData.append('icon', categoryData.icon)
            }

            const token = localStorage.getItem('token')

            const { data } = await axios.post(CATEGORIES_API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            })
            return data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create category'
            )
        }
    }
)

export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            const formData = new FormData()

            // Add text fields
            formData.append('englishName', categoryData.englishName)
            formData.append('khmerName', categoryData.khmerName)
            formData.append('chineseName', categoryData.chineseName || '')
            formData.append('phonetic', categoryData.phonetic)
            formData.append('type', JSON.stringify(categoryData.type)) // Stringify array for FormData
            
            // Add optional fields
            formData.append('ex_english', categoryData.ex_english || '')
            formData.append('ex_chinese', categoryData.ex_chinese || '')
            formData.append('ex_chinese_pinyin', categoryData.ex_chinese_pinyin || '')
            formData.append('ex_khmer', categoryData.ex_khmer || '')
            formData.append('highlight_english', categoryData.highlight_english || '')
            formData.append('highlight_chinese', categoryData.highlight_chinese || '')
            formData.append('highlight_chinese_pinyin', categoryData.highlight_chinese_pinyin || '')
            formData.append('highlight_khmer', categoryData.highlight_khmer || '')
            formData.append('definition', categoryData.definition || '')
            formData.append('usage', categoryData.usage || '')
            formData.append('notes', categoryData.notes || '')

            // Add icon - either emoji string or file
            if (categoryData.iconFile) {
                formData.append('iconImage', categoryData.iconFile)
            } else if (categoryData.icon) {
                formData.append('icon', categoryData.icon)
            }

            const token = localStorage.getItem('token')

            const { data } = await axios.put(`${CATEGORIES_API_URL}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            })
            return data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update category'
            )
        }
    }
)

export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${CATEGORIES_API_URL}/${id}`, getAuthConfig())
            return id
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete category'
            )
        }
    }
)

// Initial state
const initialState = {
    categories: [],
    loading: false,
    error: null,
    success: false
}

// Slice
const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        resetCategoriesState: (state) => {
            state.loading = false
            state.error = null
            state.success = false
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false
                state.categories = action.payload
                state.error = null
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create category
            .addCase(createCategory.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false
                state.categories.unshift(action.payload)
                state.success = true
                state.error = null
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.success = false
            })
            // Update category
            .addCase(updateCategory.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false
                const index = state.categories.findIndex(
                    (cat) => cat._id === action.payload._id
                )
                if (index !== -1) {
                    state.categories[index] = action.payload
                }
                state.success = true
                state.error = null
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.success = false
            })
            // Delete category
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false
                state.categories = state.categories.filter(
                    (cat) => cat._id !== action.payload
                )
                state.error = null
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { resetCategoriesState } = categoriesSlice.actions
export default categoriesSlice.reducer
