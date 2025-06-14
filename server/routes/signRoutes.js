const express = require('express');
const router = express.Router();
const signController = require('../controllers/signController');

router.get('/', signController.getAllSigns);

router.get('/tag/:tag', signController.getSignsByTag);

module.exports = router;
