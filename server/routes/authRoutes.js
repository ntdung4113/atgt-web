const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/google', authController.googleAuth);
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;