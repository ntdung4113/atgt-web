const express = require('express');
const multer = require('multer');
const path = require('path');
const { importLawFile, importLawFromUrl } = require('../controllers/adminController');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../data/uploads') });

router.post('/import-law', upload.single('file'), importLawFile);
router.post('/import-law-url', importLawFromUrl);

module.exports = router; 