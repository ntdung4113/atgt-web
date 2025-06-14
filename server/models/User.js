const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Vui lòng nhập email hợp lệ'
        ]
    },
    picture: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    license: {
        type: String,
        default: 'B1'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);