const express = require('express');
const router = express.Router();
const Sign = require('../models/Sign');

// Lấy tất cả biển báo, có thể lọc theo tag, PHÂN TRANG
router.get('/', async (req, res) => {
    try {
        const { tag, page = 1, limit = 20 } = req.query;
        let filter = {};
        if (tag !== undefined) {
            filter.tag = { $in: [tag] };
        }
        const skip = (page - 1) * limit;
        const total = await Sign.countDocuments(filter);
        const signs = await Sign.find(filter)
            .sort({ _id: 1 })
            .skip(Number(skip))
            .limit(Number(limit));
        res.json({
            data: signs,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Lấy biển báo theo tag, PHÂN TRANG
router.get('/tag/:tag', async (req, res) => {
    try {
        const tag = req.params.tag;
        const { page = 1, limit = 20 } = req.query;
        const filter = { tag };
        const skip = (page - 1) * limit;
        const total = await Sign.countDocuments(filter);
        const signs = await Sign.find(filter)
            .sort({ _id: 1 })
            .skip(Number(skip))
            .limit(Number(limit));
        res.json({
            data: signs,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
