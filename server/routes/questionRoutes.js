const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

router.get('/license-questions', protect, questionController.getQuestionsByLicense);
router.post('/check-answers', protect, questionController.checkAnswers);
router.get('/progress', protect, questionController.getProgress);
router.delete('/progress', protect, questionController.deleteProgress);
router.get('/mock-test', protect, questionController.startMockTest);
router.post('/submit-mock-test', protect, questionController.submitMockTest);

module.exports = router;