const Post = require('../models/Post');

// Lấy post theo status, có thể thêm phân trang nếu cần
exports.getPostsByStatus = async (req, res) => {
    try {
        let { status, page = 1, limit = 20, tags } = req.query;
        const filter = {};

        // Thêm điều kiện status nếu có
        if (status) {
            filter.status = status.toLowerCase();
        }

        // Thêm điều kiện tags nếu có
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }

        page = parseInt(page);
        limit = parseInt(limit);

        const posts = await Post.find(filter)
            .select('post_id status content author thumbnail_url video_url tags createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Post.countDocuments(filter);

        res.json({
            data: posts,
            page,
            limit,
            total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePostStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['pending', 'approved', 'declined'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Status must be one of: pending, approved, declined'
            });
        }

        const post = await Post.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('post_id status content author thumbnail_url video_url tags createdAt');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Thêm API để cập nhật tags của post
exports.updatePostTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;

        // Validate tags
        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
        }

        // Clean tags (remove duplicates and trim)
        const cleanTags = [...new Set(tags.map(tag => tag.trim()).filter(tag => tag))];

        const post = await Post.findByIdAndUpdate(
            id,
            { tags: cleanTags },
            { new: true }
        ).select('post_id status content author thumbnail_url video_url tags createdAt');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Thêm API để lấy tất cả tags
exports.getAllTags = async (req, res) => {
    try {
        const posts = await Post.find({}, 'tags');
        const allTags = new Set();

        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => allTags.add(tag));
            }
        });

        res.json({
            tags: Array.from(allTags)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};