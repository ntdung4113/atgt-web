const Situation = require('../models/Situation');
const { crawl } = require('../services/crawler/facebook');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

exports.getCheckedSituations = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const filter = { status: { $in: ['approved', 'declined'] } };

        page = parseInt(page);
        limit = parseInt(limit);

        const situations = await Situation.find(filter)
            .select('_id situation_id content status author thumbnail_url video_url tags createdAt')
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

exports.getPendingSituations = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const filter = { status: 'pending' };

        page = parseInt(page);
        limit = parseInt(limit);

        const situations = await Situation.find(filter)
            .select('_id situation_id content author thumbnail_url video_url tags createdAt')
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

exports.getApprovedSituations = async (req, res) => {
    try {
        let { page = 1, limit = 12, tags } = req.query;
        const skip = (page - 1) * limit;
        const filter = { status: 'approved' };

        if (tags) {
            let tagArray = [];
            if (Array.isArray(tags)) {
                tagArray = tags;
            } else if (typeof tags === 'string') {
                tagArray = tags.split(',').map(tag => tag.trim());
            }
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid situation ID' });
        }

        if (!['pending', 'approved', 'declined'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Status must be one of: pending, approved, declined'
            });
        }

        const situation = await Situation.findOneAndUpdate(
            { _id: id },
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

exports.getSituationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid situation ID' });
        }

        const situation = await Situation.findById(id);
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid situation ID' });
        }

        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
        }

        const cleanTags = [...new Set(tags.map(tag => tag.trim()).filter(tag => tag))];

        const situation = await Situation.findOneAndUpdate(
            { _id: id },
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

exports.startCrawling = async (req, res) => {
    try {
        const { groupUrl, maxVideos, scrollTimeout } = req.body;
        const cookiesFile = req.file;

        if (!groupUrl || !cookiesFile) {
            return res.status(400).json({
                error: 'Thiếu thông tin groupUrl hoặc file cookies'
            });
        }

        const cookiesData = JSON.parse(
            await fs.readFile(cookiesFile.path, 'utf8')
        );

        const result = await crawl(groupUrl, cookiesData, {
            maxVideos: maxVideos ? parseInt(maxVideos) : 3,
            scrollTimeout: (scrollTimeout ? parseInt(scrollTimeout) : 5) * 60 * 1000
        });

        await fs.unlink(cookiesFile.path);

        res.json({
            message: 'Crawl hoàn tất',
            status: result.status,
            data: {
                totalCollected: result.totalCollected,
                totalResponses: result.totalResponses,
                logs: result.logs
            }
        });

    } catch (err) {
        console.error('Lỗi khi crawl:', err);

        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }

        res.status(500).json({
            error: err.error || 'Lỗi không xác định',
            status: 'failed',
            logs: err.logs || []
        });
    }
};