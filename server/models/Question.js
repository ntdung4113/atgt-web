const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length <= 4; 
      },
      message: 'Options array must have at most 4 elements',
    },
  },
  image_link: {
    type: String,
    default: null,
  },
  correct_answer: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  topic: {
    type: Number,
    required: true,
  },
  order_250: {
    type: Number,
    default: null,
  },
  order_300: {
    type: Number,
    default: null,
  },
  is_critical_250: {
    type: Boolean,
    default: false,
  },
  is_critical_300: {
    type: Boolean,
    default: false,
  },
  is_critical_600: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: null,
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('Question', questionSchema);