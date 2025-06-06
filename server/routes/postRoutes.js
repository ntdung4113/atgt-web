const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Logging middleware
router.use((req, res, next) => {
    console.log(`[PostRoutes] ${req.method} ${req.path}`);
    next();
});

// Public route - chỉ lấy danh sách posts
router.get('/', postController.getPostsByStatus);

module.exports = router;