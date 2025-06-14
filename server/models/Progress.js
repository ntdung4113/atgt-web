const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  user_answer: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  is_correct: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true,
});

progressSchema.index({ user_id: 1, question_id: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);