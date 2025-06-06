const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Route để lấy thông tin người dùng hiện tại
router.get('/me', protect, userController.getCurrentUser);

// Route để cập nhật license cho người dùng
router.patch('/update-license', protect, userController.updateLicense);
router.put('/update-license', protect, userController.updateLicense);

module.exports = router;