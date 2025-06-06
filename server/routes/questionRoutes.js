const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

// Middleware để xử lý lỗi một cách tốt hơn
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/license-questions', protect, asyncHandler(questionController.getQuestionsByLicense));
router.post('/check-answers', protect, asyncHandler(questionController.checkAnswers));
router.get('/progress', protect, asyncHandler(questionController.getProgress));
router.delete('/progress', protect, asyncHandler(questionController.deleteProgress));
router.post('/mock-test', protect, asyncHandler(questionController.startMockTest));
router.post('/submit-mock-test', protect, asyncHandler(questionController.submitMockTest));

module.exports = router;