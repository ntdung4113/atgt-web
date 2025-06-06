const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/google', authController.googleAuth);
router.post('/test-login', authController.testLogin);
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;