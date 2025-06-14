const Situation = require('../models/Situation');

exports.getAllSituations = async (req, res) => {
    try {
        let { status, page = 1, limit = 20, tags } = req.query;
        const filter = {};

        if (status) {
            filter.status = status.toLowerCase();
        }

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }

        page = parseInt(page);
        limit = parseInt(limit);

        const situations = await Situation.find(filter)
            .select('situation_id status content author thumbnail_url video_url tags createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Situation.countDocuments(filter);

        res.json({
            data: situations,
            page,
            limit,
            total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getApprovedSituations = async (req, res) => {
    try {
        let { page = 1, limit = 9, tags } = req.query;
        const skip = (page - 1) * limit;
        const filter = { status: 'approved' };

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }

        page = parseInt(page);
        limit = parseInt(limit);

        const situations = await Situation.find(filter)
            .select('situation_id content author thumbnail_url video_url tags createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Situation.countDocuments(filter);

        res.json({
            data: situations,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSituationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'declined'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Status must be one of: pending, approved, declined'
            });
        }

        const situation = await Situation.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('situation_id status content author thumbnail_url video_url tags createdAt');

        if (!situation) {
            return res.status(404).json({ error: 'Situation not found' });
        }

        res.json(situation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSituationTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;

        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
        }

        const cleanTags = [...new Set(tags.map(tag => tag.trim()).filter(tag => tag))];

        const situation = await Situation.findByIdAndUpdate(
            id,
            { tags: cleanTags },
            { new: true }
        ).select('situation_id status content author thumbnail_url video_url tags createdAt');

        if (!situation) {
            return res.status(404).json({ error: 'Situation not found' });
        }

        res.json(situation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTags = async (req, res) => {
    try {
        const situations = await Situation.find({}, 'tags');
        const allTags = new Set();

        situations.forEach(situation => {
            if (situation.tags && Array.isArray(situation.tags)) {
                situation.tags.forEach(tag => allTags.add(tag));
            }
        });

        res.json({
            tags: Array.from(allTags)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};