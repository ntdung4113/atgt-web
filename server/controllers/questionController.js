const Question = require('../models/Question');
const User = require('../models/User');
const Progress = require('../models/Progress');
const asyncHandler = require('express-async-handler');

// @desc    Lấy tất cả câu hỏi dựa trên hạng bằng, đánh số thứ tự từ 1
// @route   GET /api/questions
// @access  Private
const getQuestionsByLicense = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }

    const license = user.license;
    let topics = [1, 2, 3, 4, 5, 6, 7];
    if (req.query.topic) {
        if (Array.isArray(req.query.topic)) {
            topics = req.query.topic.map(Number).filter(Boolean);
        } else if (typeof req.query.topic === 'string') {
            topics = req.query.topic.split(',').map(Number).filter(Boolean);
        } else {
            topics = [Number(req.query.topic)];
        }
        if (topics.length === 0) topics = [1, 2, 3, 4, 5, 6, 7];
    }
    let query = { topic: { $in: topics } };
    let criticalField = '';

    switch (license) {
        case 'A1':
        case 'A':
            query.order_250 = { $ne: null };
            criticalField = 'is_critical_250';
            break;
        case 'B1':
            query.order_300 = { $ne: null };
            criticalField = 'is_critical_300';
            break;
        case 'B':
        case 'C1':
        case 'C':
        case 'D1':
        case 'D2':
        case 'D':
        case 'BE':
        case 'C1E':
        case 'CE':
        case 'D1E':
        case 'D2E':
        case 'DE':
            criticalField = 'is_critical_600';
            break;
        default:
            res.status(400);
            throw new Error('Hạng bằng không hợp lệ');
    }

    const questions = await Question.find(query)
        .select('question_id content options image_link hint topic is_critical_250 is_critical_300 is_critical_600 order_250 order_300')
        .sort({ question_id: 1 });

    const formattedQuestions = questions.map((question) => {
        let order = null;
        switch (license) {
            case 'A1':
            case 'A':
                order = question.order_250;
                break;
            case 'B1':
                order = question.order_300;
                break;
            default:
                order = question.question_id;
        }
        return {
            order,
            question_id: question.question_id,
            content: question.content,
            options: question.options,
            image_link: question.image_link,
            hint: question.hint,
            topic: question.topic,
            is_critical: question[criticalField],
        };
    });

    res.status(200).json({
        success: true,
        count: formattedQuestions.length,
        data: formattedQuestions,
    });
});

// @desc    Kiểm tra đáp án và lưu tiến trình (chỉ lưu lần trả lời gần nhất)
// @route   POST /api/questions/check-answers
// @access  Private
const checkAnswers = asyncHandler(async (req, res) => {
    const { answers } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }

    if (!answers || typeof answers !== 'object') {
        res.status(400);
        throw new Error('Vui lòng cung cấp đáp án');
    }

    const license = user.license;
    let criticalField = '';

    switch (license) {
        case 'A1':
        case 'A':
            criticalField = 'is_critical_250';
            break;
        case 'B1':
            criticalField = 'is_critical_300';
            break;
        case 'B':
        case 'C1':
        case 'C':
        case 'D1':
        case 'D2':
        case 'D':
        case 'BE':
        case 'C1E':
        case 'CE':
        case 'D1E':
        case 'D2E':
        case 'DE':
            criticalField = 'is_critical_600';
            break;
        default:
            res.status(400);
            throw new Error('Hạng bằng không hợp lệ');
    }

    const questionIds = Object.keys(answers).map((id) => Number(id));
    const questions = await Question.find({
        question_id: { $in: questionIds },
    }).select(`question_id correct_answer ${criticalField}`);

    let correctCount = 0;
    let wrongCritical = false;
    const results = [];

    for (const question of questions) {
        const userAnswer = answers[question.question_id];
        let isCorrect = false;

        // Kiểm tra câu điểm liệt dựa theo hạng bằng
        let isCritical = false;
        switch (license) {
            case 'A1':
            case 'A':
                isCritical = question.is_critical_250;
                break;
            case 'B1':
                isCritical = question.is_critical_300;
                break;
            case 'B':
            case 'C1':
            case 'C':
            case 'D1':
            case 'D2':
            case 'D':
            case 'BE':
            case 'C1E':
            case 'CE':
            case 'D1E':
            case 'D2E':
            case 'DE':
                isCritical = question.is_critical_600;
                break;
        }

        if (userAnswer !== undefined) {
            isCorrect = Number(userAnswer) === question.correct_answer;
            if (isCorrect) {
                correctCount++;
            }
        }

        // Nếu là câu điểm liệt và (chưa trả lời hoặc trả lời sai) thì đánh dấu wrongCritical
        if (isCritical && (!userAnswer || !isCorrect)) {
            wrongCritical = true;
        }

        await Progress.findOneAndUpdate(
            { user_id: user._id, question_id: question.question_id },
            {
                user_answer: Number(userAnswer),
                is_correct: isCorrect,
            },
            { upsert: true, new: true }
        );

        results.push({
            question_id: question.question_id,
            isCorrect,
            correct_answer: question.correct_answer,
        });
    }

    res.status(200).json({
        success: true,
        total: questions.length,
        correct: correctCount,
        wrongCritical,
        results,
    });
});

// @desc    Lấy tiến trình trả lời của người dùng
// @route   GET /api/progress
// @access  Private
const getProgress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }

    const progress = await Progress.find({ user_id: req.user._id })
        .sort({ updatedAt: -1 });

    // Get all question IDs from progress
    const questionIds = progress.map(p => p.question_id);

    // Fetch all questions in one query
    const questions = await Question.find({
        question_id: { $in: questionIds }
    }).select('question_id content options image_link hint topic');

    // Create a map of questions for easy lookup
    const questionMap = questions.reduce((map, question) => {
        map[question.question_id] = question;
        return map;
    }, {});

    res.status(200).json({
        success: true,
        count: progress.length,
        data: progress.map((entry) => {
            const question = questionMap[entry.question_id] || {};
            return {
                question_id: entry.question_id,
                content: question.content || '',
                options: question.options || [],
                image_link: question.image_link || '',
                hint: question.hint || '',
                user_answer: entry.user_answer,
                is_correct: entry.is_correct,
                answered_at: entry.updatedAt,
            };
        }),
    });
});

// @desc    Xóa toàn bộ tiến trình ôn tập của user
// @route   DELETE /api/questions/progress
// @access  Private
const deleteProgress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }
    const result = await Progress.deleteMany({ user_id: req.user._id });
    res.status(200).json({ success: true, count: result.deletedCount });
});

// @desc    Tạo bộ câu hỏi thi thử
// @route   GET /api/mock-test
// @access  Private
const startMockTest = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }

    const license = user.license;
    let query = {};
    let criticalField = '';
    let questionDistribution = [];
    let duration = 0;
    let minCorrect = 0;
    let totalQuestions = 0;
    let criticalQuestionsCount = 1; // Default to at least one critical question

    // Xác định phân bổ câu hỏi, thời gian, và số câu đúng tối thiểu
    switch (license) {
        case 'A1':
            query.order_250 = { $ne: null };
            criticalField = 'is_critical_250';
            totalQuestions = 25;
            questionDistribution = [8, 1, 1, 0, 8, 6, 1]; // Sums to 25 (24 non-critical + 1 critical)
            duration = 19;
            minCorrect = 21;
            break;
        case 'A':
            query.order_250 = { $ne: null };
            criticalField = 'is_critical_250';
            totalQuestions = 25;
            questionDistribution = [8, 1, 1, 0, 8, 6, 1]; // Sums to 25
            duration = 19;
            minCorrect = 23;
            break;
        case 'B1':
            query.order_300 = { $ne: null };
            criticalField = 'is_critical_300';
            totalQuestions = 25;
            questionDistribution = [8, 1, 1, 0, 8, 6, 1]; // Sums to 25
            duration = 19;
            minCorrect = 23;
            break;
        case 'B':
            query.question_id = { $ne: null };
            criticalField = 'is_critical_600';
            totalQuestions = 30;
            questionDistribution = [9, 1, 2, 1, 10, 6, 1]; // Sums to 30
            duration = 20;
            minCorrect = 27;
            break;
        case 'C1':
            query.question_id = { $ne: null };
            criticalField = 'is_critical_600';
            totalQuestions = 35;
            questionDistribution = [10, 2, 2, 2, 11, 7, 1]; // Sums to 35
            duration = 22;
            minCorrect = 32;
            break;
        case 'C':
            query.question_id = { $ne: null };
            criticalField = 'is_critical_600';
            totalQuestions = 40;
            questionDistribution = [12, 2, 2, 2, 12, 9, 1]; // Sums to 40
            duration = 24;
            minCorrect = 36;
            break;
        case 'D1':
        case 'D2':
        case 'D':
        case 'BE':
        case 'C1E':
        case 'CE':
        case 'D1E':
        case 'D2E':
        case 'DE':
            query.question_id = { $ne: null };
            criticalField = 'is_critical_600';
            totalQuestions = 45;
            questionDistribution = [13, 2, 3, 2, 13, 11, 1]; // Sums to 45
            duration = 26;
            minCorrect = 41;
            break;
        default:
            res.status(400);
            throw new Error('Hạng bằng không hợp lệ');
    }

    // Kiểm tra số lượng câu điểm liệt trước
    const criticalCount = await Question.countDocuments({
        ...query,
        [criticalField]: true,
    });
    if (criticalCount < questionDistribution[6]) {
        res.status(500);
        throw new Error('Không đủ câu điểm liệt để tạo đề thi thử');
    }

    // Kiểm tra tổng số câu hỏi có sẵn
    let totalAvailable = 0;
    for (let topic = 1; topic <= 6; topic++) {
        const count = await Question.countDocuments({
            ...query,
            topic,
            [criticalField]: false,
        });
        totalAvailable += count;
    }

    const questions = [];
    // Lấy câu hỏi không điểm liệt theo phân bổ
    for (let topic = 1; topic <= 6; topic++) {
        const count = questionDistribution[topic - 1];
        if (count > 0) {
            const topicQuestions = await Question.find({
                ...query,
                topic,
                [criticalField]: false,
            })
                .select('question_id content options image_link hint topic order')
                .lean();

            if (topicQuestions.length < count) {
                // Lấy tất cả câu hỏi có sẵn trong topic
                questions.push(...topicQuestions);
            } else {
                // Chọn ngẫu nhiên 'count' câu hỏi
                const shuffled = topicQuestions.sort(() => 0.5 - Math.random());
                questions.push(...shuffled.slice(0, count));
            }
        }
    }

    // Nếu thiếu câu hỏi, lấy bổ sung từ các topic khác
    const nonCriticalNeeded = totalQuestions - questionDistribution[6];
    const currentCount = questions.length;
    if (currentCount < nonCriticalNeeded) {
        const additionalCount = nonCriticalNeeded - currentCount;
        const excludeIds = questions.map((q) => q.question_id);
        const additionalQuestions = await Question.find({
            ...query,
            [criticalField]: false,
            question_id: { $nin: excludeIds },
        })
            .select('question_id content options image_link hint topic order')
            .lean()
            .limit(additionalCount);

        questions.push(...additionalQuestions);
    }

    // Lấy câu điểm liệt
    if (questionDistribution[6] > 0) {
        const excludeIds = questions.map((q) => q.question_id);
        const criticalQuestions = await Question.find({
            ...query,
            [criticalField]: true,
            question_id: { $nin: excludeIds },
        })
            .select('question_id content options image_link hint topic order')
            .lean();

        if (criticalQuestions.length >= questionDistribution[6]) {
            const shuffledCritical = criticalQuestions.sort(() => 0.5 - Math.random());
            questions.push(...shuffledCritical.slice(0, questionDistribution[6]));
        } else {
            res.status(500);
            throw new Error('Không đủ câu điểm liệt để tạo đề thi thử');
        }
    }

    // Kiểm tra tổng số câu hỏi
    if (questions.length !== totalQuestions) {
        res.status(500);
        throw new Error(`Không đủ câu hỏi để tạo đề thi thử, chỉ lấy được ${questions.length} câu, cần ${totalQuestions} câu`);
    }

    // Sắp xếp câu hỏi theo topic
    questions.sort((a, b) => a.topic - b.topic);

    // Định dạng câu hỏi trả về
    const formattedQuestions = questions.map((question, index) => ({
        order: index + 1,
        question_id: question.question_id,
        content: question.content,
        options: question.options,
        image_link: question.image_link,
        hint: question.hint,
        topic: question.topic,
        is_critical: question[criticalField] || false,
    }));

    res.status(200).json({
        success: true,
        license,
        duration,
        min_correct: minCorrect,
        count: formattedQuestions.length,
        question_ids: questions.map((q) => q.question_id),
        data: formattedQuestions,
    });
});

// @desc    Nộp bài thi thử và trả về kết quả
// @route   POST /api/mock-test/submit
// @access  Private
const submitMockTest = asyncHandler(async (req, res) => {
    const { answers, question_ids, license } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }

    if (
        !answers ||
        typeof answers !== 'object' ||
        !question_ids ||
        !Array.isArray(question_ids) ||
        !license
    ) {
        res.status(400);
        throw new Error('Vui lòng cung cấp đáp án, danh sách câu hỏi, và hạng bằng');
    }

    let criticalField = '';
    let minCorrect = 0;
    let duration = 0;

    switch (license) {
        case 'A1':
            criticalField = 'is_critical_250';
            minCorrect = 21;
            duration = 19;
            break;
        case 'A':
            criticalField = 'is_critical_250';
            minCorrect = 23;
            duration = 19;
            break;
        case 'B1':
            criticalField = 'is_critical_300';
            minCorrect = 23;
            duration = 19;
            break;
        case 'B':
            criticalField = 'is_critical_600';
            minCorrect = 27;
            duration = 20;
            break;
        case 'C1':
            criticalField = 'is_critical_600';
            minCorrect = 32;
            duration = 22;
            break;
        case 'C':
            criticalField = 'is_critical_600';
            minCorrect = 36;
            duration = 24;
            break;
        case 'D1':
        case 'D2':
        case 'D':
        case 'BE':
        case 'C1E':
        case 'CE':
        case 'D1E':
        case 'D2E':
        case 'DE':
            criticalField = 'is_critical_600';
            minCorrect = 41;
            duration = 26;
            break;
        default:
            res.status(400);
            throw new Error('Hạng bằng không hợp lệ');
    }

    const questions = await Question.find({
        question_id: { $in: question_ids.map(Number) }
    }).select(`question_id content options image_link hint topic correct_answer is_critical_250 is_critical_300 is_critical_600`);

    // Tạo map để lưu thứ tự câu hỏi
    const questionOrderMap = {};
    question_ids.forEach((id, index) => {
        questionOrderMap[Number(id)] = index + 1;
    });

    let correctCount = 0;
    let wrongCritical = false;
    const results = [];
    const answerMap = {};

    for (const question of questions) {
        const userAnswer = answers[question.question_id];
        let isCorrect = false;

        // Kiểm tra câu điểm liệt dựa theo hạng bằng
        let isCritical = false;
        switch (license) {
            case 'A1':
            case 'A':
                isCritical = question.is_critical_250;
                break;
            case 'B1':
                isCritical = question.is_critical_300;
                break;
            case 'B':
            case 'C1':
            case 'C':
            case 'D1':
            case 'D2':
            case 'D':
            case 'BE':
            case 'C1E':
            case 'CE':
            case 'D1E':
            case 'D2E':
            case 'DE':
                isCritical = question.is_critical_600;
                break;
        }

        if (userAnswer !== undefined) {
            isCorrect = Number(userAnswer) === question.correct_answer;
            if (isCorrect) {
                correctCount++;
            }
        }

        // Nếu là câu điểm liệt và (chưa trả lời hoặc trả lời sai) thì đánh dấu wrongCritical
        if (isCritical && (!userAnswer || !isCorrect)) {
            wrongCritical = true;
        }

        if (userAnswer !== undefined) {
            await Progress.findOneAndUpdate(
                { user_id: user._id, question_id: question.question_id },
                {
                    user_answer: Number(userAnswer),
                    is_correct: isCorrect,
                },
                { upsert: true, new: true }
            );
        }

        answerMap[question.question_id] = {
            question_id: question.question_id,
            user_answer: userAnswer !== undefined ? Number(userAnswer) : null,
            is_correct: isCorrect,
        };

        results.push({
            question_id: question.question_id,
            isCorrect,
            correct_answer: question.correct_answer,
        });
    }

    const wrongCount = results.length - correctCount;

    // Xác định lý do trượt trước khi kiểm tra passed
    let failReason = null;
    if (wrongCritical && correctCount < minCorrect) {
        failReason = 'Không đủ câu đúng và Sai câu điểm liệt';
    } else if (wrongCritical) {
        failReason = 'Sai câu điểm liệt';
    } else if (correctCount < minCorrect) {
        failReason = 'Không đủ câu đúng';
    }

    // Kiểm tra passed sau khi đã xác định fail_reason
    const passed = !wrongCritical && correctCount >= minCorrect;

    // Sắp xếp câu hỏi theo thứ tự đã gửi lên
    const formattedQuestions = question_ids.map((questionId, index) => {
        const question = questions.find(q => q.question_id === Number(questionId));
        const answerData = answerMap[Number(questionId)];
        let isCritical = false;

        if (question) {
            switch (license) {
                case 'A1':
                case 'A':
                    isCritical = question.is_critical_250;
                    break;
                case 'B1':
                    isCritical = question.is_critical_300;
                    break;
                case 'B':
                case 'C1':
                case 'C':
                case 'D1':
                case 'D2':
                case 'D':
                case 'BE':
                case 'C1E':
                case 'CE':
                case 'D1E':
                case 'D2E':
                case 'DE':
                    isCritical = question.is_critical_600;
                    break;
            }
        }

        return {
            order: index + 1,
            question_id: Number(questionId),
            content: question?.content || '',
            options: question?.options || [],
            image_link: question?.image_link || '',
            hint: question?.hint || '',
            topic: question?.topic || 0,
            is_critical: isCritical,
            user_answer: answerData?.user_answer ?? null,
            is_correct: answerData?.is_correct ?? false,
            correct_answer: question?.correct_answer || 0,
        };
    });

    res.status(200).json({
        success: true,
        license,
        duration,
        min_correct: minCorrect,
        total: questions.length,
        correct: correctCount,
        wrong: wrongCount,
        status: passed ? 'pass' : 'fail',
        fail_reason: failReason,
        data: formattedQuestions,
    });
});

module.exports = {
    getQuestionsByLicense,
    checkAnswers,
    getProgress,
    deleteProgress,
    startMockTest,
    submitMockTest,
};