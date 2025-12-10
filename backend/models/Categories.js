import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
    {
        englishName: {
            type: String,
            required: [true, 'English name is required'],
            trim: true,
            index: true  // Add index for search performance
        },
        khmerName: {
            type: String,
            required: [true, 'Khmer name is required'],
            trim: true,
            index: true  // Add index for search performance
        },
        chineseName: {
            type: String,
            trim: true
        },
        phonetic: {
            type: String,
            required: [true, 'Phonetic is required'],
            trim: true,
            index: true  // Add index for search performance
        },
        icon: {
            // You are using emoji / Tailwind class text like "text-red-500" in the UI,
            // so we keep this as a simple string.
            type: String,
            required: [true, 'Icon is required'],
            trim: true
        },
        type: {
            type: [String],  // Array of types to support multiple classifications
            default: ['General'],
            index: true  // Add index for filtering by type
        },
        ex_english: {
            type: String,
            trim: true
        },
        ex_chinese: {
            type: String,
            trim: true
        },
        ex_chinese_pinyin: {
            type: String,
            trim: true
        },
        ex_khmer: {
            type: String,
            trim: true
        },
        highlight_english: {
            type: String,
            trim: true
        },
        highlight_chinese: {
            type: String,
            trim: true
        },
        highlight_chinese_pinyin: {
            type: String,
            trim: true
        },
        highlight_khmer: {
            type: String,
            trim: true
        },
        definition: {
            type: String,
            trim: true
        },
        usage: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Category = mongoose.model('Category', categorySchema)

export default Category

