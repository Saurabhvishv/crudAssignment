const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

    fname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true, 
        index: true
    },
    lname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true, 
        index: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date,
        default: null
    }
}, { timestamps: true })



module.exports = mongoose.model('Users', userSchema);