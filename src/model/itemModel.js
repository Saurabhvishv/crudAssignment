const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({

    itemName: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true, 
        index: true
    },
    description: {
        type: String,
        required: true,
        lowercase: true,
        trim: true, 
        index: true
    },
    price: {
        type: Number,
        required: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
}, { timestamps: true })



module.exports = mongoose.model('Items', itemSchema);