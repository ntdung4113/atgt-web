const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    tag: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sign', signSchema);
