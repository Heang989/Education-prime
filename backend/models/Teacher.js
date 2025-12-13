import mongoose from 'mongoose'

const teacherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Teacher name is required'],
            trim: true,
            index: true
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true
        },
        level: {
            type: Number,
            required: [true, 'Level is required'],
            min: 1,
            max: 8,
            index: true
        },
        experience: {
            type: String,
            required: [true, 'Experience is required'],
            trim: true
        },
        rating: {
            type: Number,
            default: 4.5,
            min: 0,
            max: 5
        },
        students: {
            type: Number,
            default: 0,
            min: 0
        },
        avatar: {
            type: String,
            default: '👩‍🏫',
            trim: true
        },
        bio: {
            type: String,
            required: [true, 'Bio is required'],
            trim: true
        },
        specialties: {
            type: [String],
            required: [true, 'Specialties are required'],
            default: []
        },
        schedule: {
            type: String,
            required: [true, 'Schedule is required'],
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

const Teacher = mongoose.model('Teacher', teacherSchema)

export default Teacher

