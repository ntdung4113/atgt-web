const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/me', protect, userController.getCurrentUser);

router.patch('/update-license', protect, userController.updateLicense);
router.put('/update-license', protect, userController.updateLicense);

module.exports = router;