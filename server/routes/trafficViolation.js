const express = require('express');
const router = express.Router();
const TrafficViolation = require('../models/TrafficViolation');

// GET /api/traffic-violations/search?q=...
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        if (!q.trim()) {
            return res.status(400).json({ error: 'Thiếu tham số tìm kiếm q' });
        }
        // Tìm kiếm theo text index violation_name
        const results = await TrafficViolation.find({
            $text: { $search: q }
        }).limit(20);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/traffic-violations
router.get('/', async (req, res) => {
    try {
        const { vehicle_type, topic, q, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (vehicle_type) filter.vehicle_type = vehicle_type;
        if (topic) filter.topic = topic;
        let data = [], total = 0;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        if (q) {
            // Tìm kiếm AND tất cả các từ
            const words = q.trim().split(/\s+/);
            const andQuery = words.map(w => `"${w}"`).join(' ');
            filter.$text = { $search: andQuery };
            data = await TrafficViolation.find(filter).skip(skip).limit(parseInt(limit));
            total = await TrafficViolation.countDocuments(filter);
        } else {
            data = await TrafficViolation.find(filter).skip(skip).limit(parseInt(limit));
            total = await TrafficViolation.countDocuments(filter);
        }
        res.json({ data, total, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/traffic-violations/filters
router.get('/filters', async (req, res) => {
    try {
        const vehicle_types = await TrafficViolation.distinct('vehicle_type');
        const topics = await TrafficViolation.distinct('topic');
        res.json({ vehicle_types, topics });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 