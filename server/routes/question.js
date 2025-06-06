const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// Lấy danh sách câu hỏi theo category và type
router.get('/practice', auth, async (req, res) => {
    try {
        const { category, type, limit = 20 } = req.query;

        // Xây dựng query
        const query = {};
        if (category) query.category = category;
        if (type) query.type = type;

        // Lấy câu hỏi ngẫu nhiên
        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(limit) } },
            {
                $project: {
                    _id: 0,
                    questionId: 1,
                    content: 1,
                    type: 1,
                    category: 1,
                    options: 1,
                    images: 1
                }
            }
        ]);

        // Chuyển đổi cấu trúc options để phù hợp với frontend
        const transformedQuestions = questions.map(q => ({
            ...q,
            options: q.options.map((opt, index) => ({
                content: opt.content,
                isCorrect: opt.isCorrect
            }))
        }));

        res.json(transformedQuestions);
    } catch (error) {
        console.error('Error getting practice questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Kiểm tra đáp án
router.post('/check-answer', auth, async (req, res) => {
    try {
        const { questionId, selectedOption } = req.body;
        console.log(`Checking answer for question ${questionId}, selected option:`, selectedOption);

        const question = await Question.findOne({ questionId });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const correctOption = question.options.find(opt => opt.isCorrect);

        // Kiểm tra xem selectedOption là index hay content string
        let isCorrect = false;

        if (typeof selectedOption === 'number') {
            // Nếu selectedOption là index
            isCorrect = question.options[selectedOption]?.isCorrect || false;
        } else {
            // Nếu selectedOption là content string
            isCorrect = question.options.some(opt =>
                opt.content === selectedOption && opt.isCorrect
            );
        }

        console.log(`Answer check result: ${isCorrect ? 'Correct' : 'Incorrect'}`);

        res.json({
            isCorrect,
            correctAnswer: correctOption.content,
            explanation: question.explanation
        });
    } catch (error) {
        console.error('Error checking answer:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;