import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import categoriesReducer from './slices/categoriesSlice'
import teachersReducer from './slices/teachersSlice'
import lessonsReducer from './slices/lessonsSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        categories: categoriesReducer,
        teachers: teachersReducer,
        lessons: lessonsReducer
    }
})
