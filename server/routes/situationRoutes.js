const express = require('express');
const router = express.Router();
const situationController = require('../controllers/situationController');
const { protect, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/public', situationController.getApprovedSituations);
router.get('/tags', situationController.getAllTags);

router.get('/checked', protect, isAdmin, situationController.getCheckedSituations);
router.get('/pending', protect, isAdmin, situationController.getPendingSituations);
router.post('/crawl',
    protect,
    isAdmin,
    upload.single('cookies'), 
    situationController.startCrawling
);

router.get('/:id', situationController.getSituationById);
router.patch('/:id/status', protect, isAdmin, situationController.updateSituationStatus);
router.patch('/:id/tags', protect, isAdmin, situationController.updateSituationTags);

module.exports = router;