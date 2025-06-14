const mongoose = require('mongoose');

const situationSchema = new mongoose.Schema({
    situation_id: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined', 'not-uploaded'],
        default: 'pending'
    },
    content: {
        type: String
    },
    author: {
        name: {
            type: String
        },
        link: {
            type: String
        }
    },
    thumbnail_url: {
        type: String
    },
    video_url: {
        type: String
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Situation', situationSchema);