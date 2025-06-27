const Question = require('../models/Question');
const User = require('../models/User');
const Progress = require('../models/Progress');

exports.getQuestionsByLicense = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

        const license = user.license;
        const topicParam = req.query.topic;
        const topic = topicParam === undefined || topicParam === 'null' ? null : Number(topicParam);

        if (topic !== null && (isNaN(topic) || topic < 1 || topic > 7)) {
            return res.status(400).json({ error: 'Topic không hợp lệ' });
        }

        const isCriticalOnly = topic === 7;

        const licenseMap = {
            A1: { order: 'order_250', critical: 'is_critical_250' },
            A: { order: 'order_250', critical: 'is_critical_250' },
            B1: { order: 'order_300', critical: 'is_critical_300' },
            B: { order: null, critical: 'is_critical_600' },
            C1: { order: null, critical: 'is_critical_600' },
            C: { order: null, critical: 'is_critical_600' },
            D1: { order: null, critical: 'is_critical_600' },
            D2: { order: null, critical: 'is_critical_600' },
            D: { order: null, critical: 'is_critical_600' },
            BE: { order: null, critical: 'is_critical_600' },
            C1E: { order: null, critical: 'is_critical_600' },
            CE: { order: null, critical: 'is_critical_600' },
            D1E: { order: null, critical: 'is_critical_600' },
            D2E: { order: null, critical: 'is_critical_600' },
            DE: { order: null, critical: 'is_critical_600' },
        };

        const licenseInfo = licenseMap[license];
        if (!licenseInfo) return res.status(400).json({ error: 'Hạng bằng không hợp lệ' });

        const query = {};
        if (licenseInfo.order) query[licenseInfo.order] = { $ne: null };
        if (isCriticalOnly) {
            query[licenseInfo.critical] = true;
        } else if (topic !== null) {
            query.topic = topic;
        }

        const questions = await Question.find(query)
            .select(`questionNumber content options image_link hint topic ${licenseInfo.critical} ${licenseInfo.order}`)
            .sort({ questionNumber: 1 });

        const formatted = questions.map(q => ({
            order: licenseInfo.order ? q[licenseInfo.order] : q.questionNumber,
            questionNumber: q.questionNumber,
            content: q.content,
            options: q.options,
            image_link: q.image_link,
            hint: q.hint,
            topic: q.topic,
            is_critical: q[licenseInfo.critical],
        }));

        res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.checkAnswers = async (req, res) => {
    try {
        const { answers } = req.body;

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Vui lòng cung cấp đáp án hợp lệ' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

        const licenseMap = {
            A1: { criticalField: 'is_critical_250' },
            A: { criticalField: 'is_critical_250' },
            B1: { criticalField: 'is_critical_300' },
            B: { criticalField: 'is_critical_600' },
            C1: { criticalField: 'is_critical_600' },
            C: { criticalField: 'is_critical_600' },
            D1: { criticalField: 'is_critical_600' },
            D2: { criticalField: 'is_critical_600' },
            D: { criticalField: 'is_critical_600' },
            BE: { criticalField: 'is_critical_600' },
            C1E: { criticalField: 'is_critical_600' },
            CE: { criticalField: 'is_critical_600' },
            D1E: { criticalField: 'is_critical_600' },
            D2E: { criticalField: 'is_critical_600' },
            DE: { criticalField: 'is_critical_600' },
        };

        const licenseInfo = licenseMap[user.license];
        if (!licenseInfo) {
            return res.status(400).json({ error: 'Hạng bằng không hợp lệ' });
        }

        const criticalField = licenseInfo.criticalField;

        const questionNumbers = Object.keys(answers).map(Number).filter(Boolean);
        if (questionNumbers.length === 0) {
            return res.status(400).json({ error: 'Không có câu hỏi nào được gửi' });
        }

        const questions = await Question.find({
            questionNumber: { $in: questionNumbers }
        }).select(`questionNumber correct_answer ${criticalField}`);

        let correctCount = 0;
        let wrongCritical = false;
        const results = [];

        for (const question of questions) {
            const userAnswer = Number(answers[question.questionNumber]);
            const isCorrect = userAnswer === question.correct_answer;
            const isCritical = question[criticalField] === true;

            if (isCorrect) correctCount++;
            if (isCritical && !isCorrect) wrongCritical = true;

            await Progress.findOneAndUpdate(
                { user_id: user._id, question_id: question._id },
                { user_answer: userAnswer, is_correct: isCorrect },
                { upsert: true, new: true }
            );

            results.push({
                question_id: question.questionNumber,
                isCorrect,
                correct_answer: question.correct_answer
            });
        }

        res.status(200).json({
            success: true,
            total: questions.length,
            correct: correctCount,
            wrongCritical,
            results
        });
    } catch (err) {
        console.error('checkAnswers error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

        const progress = await Progress.find({ user_id: req.user._id }).sort({ updatedAt: -1 });

        const questionIds = progress.map(p => p.question_id);
        const questions = await Question.find({ _id: { $in: questionIds } })
            .select('questionNumber content options image_link hint topic');

        const questionMap = Object.fromEntries(questions.map(q => [q._id.toString(), q]));

        const result = progress.map(entry => {
            const q = questionMap[entry.question_id.toString()] || {};
            return {
                questionNumber: q.questionNumber || null,
                content: q.content || '',
                options: q.options || [],
                image_link: q.image_link || '',
                hint: q.hint || '',
                topic: q.topic || null,
                user_answer: entry.user_answer,
                is_correct: entry.is_correct,
                answered_at: entry.updatedAt,
            };
        });

        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        const result = await Progress.deleteMany({ user_id: req.user._id });
        res.status(200).json({ success: true, count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.startMockTest = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        const license = user.license;

        const licenseConfigs = {
            A1: { query: { order_250: { $ne: null } }, criticalField: 'is_critical_250', total: 25, dist: [8, 1, 1, 0, 8, 6], duration: 19, min: 21 },
            A:  { query: { order_250: { $ne: null } }, criticalField: 'is_critical_250', total: 25, dist: [8, 1, 1, 0, 8, 6], duration: 19, min: 23 },
            B1: { query: { order_300: { $ne: null } }, criticalField: 'is_critical_300', total: 25, dist: Math.random() < 0.5 ? [8, 1, 1, 0, 8, 6] : [8, 1, 0, 1, 8, 6], duration: 19, min: 23 },
            B:  { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 30, dist: [9, 1, 2, 1, 10, 6], duration: 20, min: 27 },
            C1: { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 35, dist: [10, 2, 2, 2, 11, 7], duration: 22, min: 32 },
            C:  { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 40, dist: [12, 2, 2, 2, 12, 9], duration: 24, min: 36 },
            D1: { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 45, dist: [13, 2, 3, 2, 13, 11], duration: 26, min: 41 },
            D2: { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 45, dist: [13, 2, 3, 2, 13, 11], duration: 26, min: 41 },
            D:  { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 45, dist: [13, 2, 3, 2, 13, 11], duration: 26, min: 41 },
            BE: { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 45, dist: [13, 2, 3, 2, 13, 11], duration: 26, min: 41 },
            C1E: { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 45, dist: [13, 2, 3, 2, 13, 11], duration: 26, min: 41 },
            CE:  { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 45, dist: [13, 2, 3, 2, 13, 11], duration: 26, min: 41 },
            D1E: { query: { questionNumber: { $ne: null } }, criticalField: 'is_critical_600', total: 45, dist: [13, 2, 3, 2, 13, 11], duration: 26, min: 41 },
        };

        const config = licenseConfigs[license];

        if (!config || !config.dist) {
            return res.status(400).json({ error: 'Hạng bằng không hợp lệ' });
        }

        const { query, criticalField, dist: questionDistribution, duration, min: minCorrect } = config;
        const questions = [];

        for (let topic = 1; topic <= 6; topic++) {
            const count = questionDistribution[topic - 1];
            if (count > 0) {
                const topicQuestions = await Question.find({
                    ...query,
                    topic,
                    [criticalField]: false
                })
                    .select('_id questionNumber content options image_link topic order')
                    .lean();

                const shuffled = topicQuestions.sort(() => 0.5 - Math.random());
                questions.push(...shuffled.slice(0, count));
            }
        }

        const [criticalQuestion] = await Question.aggregate([
            { $match: { ...query, [criticalField]: true } },
            { $sample: { size: 1 } },
            { $project: { _id: 1, questionNumber: 1, content: 1, options: 1, image_link: 1, topic: 1, order: 1 } }
        ]);
        if (criticalQuestion) {
            questions.push(criticalQuestion);
        }

        const topicMap = new Map();
        for (const q of questions) {
            if (!topicMap.has(q.topic)) topicMap.set(q.topic, []);
            topicMap.get(q.topic).push(q);
        }

        const finalQuestions = [];
        [...topicMap.keys()].sort((a, b) => a - b).forEach(topic => {
            const shuffled = topicMap.get(topic).sort(() => 0.5 - Math.random());
            finalQuestions.push(...shuffled);
        });

        const formattedQuestions = finalQuestions.map((q, idx) => ({
            order: idx + 1,
            question_id: q._id,
            content: q.content,
            options: q.options,
            image_link: q.image_link,
            topic: q.topic,
            is_critical: q[criticalField] || false
        }));

        res.status(200).json({
            success: true,
            license,
            duration,
            min_correct: minCorrect,
            count: formattedQuestions.length,
            question_ids: formattedQuestions.map(q => q.question_id),
            data: formattedQuestions
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.submitMockTest = async (req, res) => {
    try {
        const { answers, question_ids, license } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        if (
            !answers || typeof answers !== 'object' ||
            !question_ids || !Array.isArray(question_ids) ||
            !license
        ) {
            return res.status(400).json({ error: 'Vui lòng cung cấp đáp án, danh sách câu hỏi, và hạng bằng' });
        }

        const licenseConfigs = {
            A1:  { criticalField: 'is_critical_250', minCorrect: 21, duration: 19 },
            A:   { criticalField: 'is_critical_250', minCorrect: 23, duration: 19 },
            B1:  { criticalField: 'is_critical_300', minCorrect: 23, duration: 19 },
            B:   { criticalField: 'is_critical_600', minCorrect: 27, duration: 20 },
            C1:  { criticalField: 'is_critical_600', minCorrect: 32, duration: 22 },
            C:   { criticalField: 'is_critical_600', minCorrect: 36, duration: 24 },
            D1: { criticalField: 'is_critical_600', minCorrect: 41, duration: 26 },
            D2: { criticalField: 'is_critical_600', minCorrect: 41, duration: 26 },
            D:   { criticalField: 'is_critical_600', minCorrect: 41, duration: 26 },
            BE:  { criticalField: 'is_critical_600', minCorrect: 41, duration: 26 },
            C1E: { criticalField: 'is_critical_600', minCorrect: 41, duration: 26 },
            CE:  { criticalField: 'is_critical_600', minCorrect: 41, duration: 26 },
            D1E: { criticalField: 'is_critical_600', minCorrect: 41, duration: 26 },
        };

        const config = licenseConfigs[license];

        if (!config || !config.criticalField) {
            return res.status(400).json({ error: 'Hạng bằng không hợp lệ' });
        }

        const { criticalField, minCorrect, duration } = config;

        const questions = await Question.find({
            _id: { $in: question_ids }
        }).select(`_id questionNumber content options image_link topic correct_answer hint is_critical_250 is_critical_300 is_critical_600`).lean();

        const questionMap = new Map();
        questions.forEach(q => questionMap.set(q._id.toString(), q));

        let correctCount = 0;
        let wrongCritical = false;

        const progressUpdates = [];
        const formattedQuestions = [];

        for (let i = 0; i < question_ids.length; i++) {
            const idStr = question_ids[i].toString();
            const question = questionMap.get(idStr);
            const userAnswerRaw = answers[idStr];
            const userAnswer = userAnswerRaw !== undefined ? Number(userAnswerRaw) : null;

            let isCorrect = false;
            let isCritical = question?.[criticalField] || false;

            if (userAnswer !== null && question) {
                isCorrect = userAnswer === question.correct_answer;
                if (isCorrect) correctCount++;
            }

            if (isCritical && !isCorrect) {
                wrongCritical = true;
            }

            // Cập nhật tiến độ nếu có câu trả lời
            if (userAnswer !== null && question) {
                progressUpdates.push(Progress.findOneAndUpdate(
                    { user_id: user._id, question_id: question._id },
                    { user_answer: userAnswer, is_correct: isCorrect },
                    { upsert: true, new: true }
                ));
            }

            formattedQuestions.push({
                order: i + 1,
                questionNumber: question?.questionNumber || '',
                content: question?.content || '',
                options: question?.options || [],
                image_link: question?.image_link || '',
                hint: question?.hint || '',
                topic: question?.topic || 0,
                is_critical: isCritical,
                user_answer: userAnswer,
                is_correct: isCorrect,
                correct_answer: question?.correct_answer || 0,
            });
        }

        // Đợi cập nhật progress
        await Promise.all(progressUpdates);

        const wrongCount = formattedQuestions.length - correctCount;

        let failReason = null;
        if (wrongCritical && correctCount < minCorrect) {
            failReason = 'Không đủ câu đúng và Sai câu điểm liệt';
        } else if (wrongCritical) {
            failReason = 'Sai câu điểm liệt';
        } else if (correctCount < minCorrect) {
            failReason = 'Không đủ câu đúng';
        }

        const passed = !wrongCritical && correctCount >= minCorrect;

        res.status(200).json({
            success: true,
            license,
            duration,
            min_correct: minCorrect,
            total: formattedQuestions.length,
            correct: correctCount,
            wrong: wrongCount,
            status: passed ? 'pass' : 'fail',
            fail_reason: failReason,
            data: formattedQuestions
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
