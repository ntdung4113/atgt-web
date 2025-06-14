const express = require('express');
const router = express.Router();
const lawController = require('../controllers/lawController');

router.get('/', lawController.getLaws);
router.get('/search', lawController.searchLaws);
router.get('/:lawNumber', lawController.getLawDetail);

module.exports = router;