import mongoose from 'mongoose'

const vocabularySchema = new mongoose.Schema({
    chinese: {
        type: String,
        required: true,
        trim: true
    },
    pinyin: {
        type: String,
        trim: true
    },
    english: {
        type: String,
        required: true,
        trim: true
    },
    khmer: {
        type: String,
        trim: true
    },
    phonetic: {
        type: String,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
}, { _id: true })

const lessonSchema = new mongoose.Schema(
    {
        level: {
            type: Number,
            required: [true, 'Level is required'],
            min: 1,
            max: 8,
            index: true
        },
        lessonNumber: {
            type: Number,
            required: [true, 'Lesson number is required'],
            min: 1,
            max: 6,
            index: true
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true
        },
        titleEnglish: {
            type: String,
            required: [true, 'English title is required'],
            trim: true
        },
        subtitle: {
            type: String,
            required: [true, 'Subtitle is required'],
            trim: true
        },
        subtitleEnglish: {
            type: String,
            required: [true, 'English subtitle is required'],
            trim: true
        },
        vocabulary: {
            type: [vocabularySchema],
            default: []
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher ID is required'],
            index: true
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

// Compound index to ensure unique lesson per teacher, level, and lesson number
lessonSchema.index({ teacherId: 1, level: 1, lessonNumber: 1 }, { unique: true })

const Lesson = mongoose.model('Lesson', lessonSchema)

export default Lesson

