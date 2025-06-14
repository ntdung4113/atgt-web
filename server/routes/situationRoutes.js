const express = require('express');
const router = express.Router();
const situationController = require('../controllers/situationController');
const { protect, isAdmin } = require('../middleware/auth');

// Public route - chỉ lấy situations đã được approved
router.get('/public', situationController.getApprovedSituations);
router.get('/tags', situationController.getAllTags);

// Admin routes - yêu cầu xác thực và quyền admin
router.get('/', protect, isAdmin, situationController.getAllSituations);
router.patch('/:id/status', protect, isAdmin, situationController.updateSituationStatus);
router.patch('/:id/tags', protect, isAdmin, situationController.updateSituationTags);

module.exports = router;