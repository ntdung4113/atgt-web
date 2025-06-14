const express = require('express');
const router = express.Router();
const trafficViolationController = require('../controllers/trafficViolationController');

router.get('/search', trafficViolationController.searchViolations);

router.get('/', trafficViolationController.getViolations);

router.get('/filters', trafficViolationController.getFilters);

module.exports = router; 