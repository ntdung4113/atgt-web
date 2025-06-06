const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question_id: {
    type: Number,
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

// Đảm bảo chỉ có một bản ghi cho mỗi cặp user_id và question_id
progressSchema.index({ user_id: 1, question_id: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);