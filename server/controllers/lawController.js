const Law = require('../models/Law');

exports.getLaws = async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;
        const skip = (page - 1) * limit;
        const filter = {};
        if (type) {
            filter['metadata.type'] = type;
        }
        const docs = await Law.find(filter, 'lawNumber title issuedDate metadata.issuer metadata.category metadata.type')
            .sort({ issuedDate: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Law.countDocuments(filter);
        res.json({
            data: docs,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLawDetail = async (req, res) => {
    try {
        const { lawNumber } = req.params;
        const doc = await Law.findOne({ lawNumber });
        if (!doc) return res.status(404).json({ error: 'Not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchLaws = async (req, res) => {
    try {
        const { q, page = 1, limit = 20, type } = req.query;
        const skip = (page - 1) * limit;

        if (!q) return res.status(400).json({ error: 'Missing search query' });

        const regex = new RegExp(q, 'i');
        const queryObj = {
            $and: [
                {
                    $or: [
                        { lawNumber: regex },
                        { title: regex },
                        { contentText: regex }
                    ]
                }
            ]
        };
        if (type) {
            queryObj.$and.push({ 'metadata.type': type });
        }

        const results = await Law.find(
            queryObj,
            {
                lawNumber: 1,
                title: 1,
                issuedDate: 1,
                'metadata.issuer': 1,
                'metadata.category': 1,
                'metadata.type': 1,
            }
        )
            .sort({ issuedDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Law.countDocuments(queryObj);

        res.json({
            data: results,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: err.message });
    }
};