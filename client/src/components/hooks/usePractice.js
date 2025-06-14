import { useEffect, useState, useCallback } from 'react';
import { getPracticeQuestions, checkPracticeAnswers } from '../../services/questionService';
import useAuth from './useAuth';
import { getCurrentUser, updateUserLicense } from '../../services/userService';
import axios from 'axios';
import { toast } from 'react-toastify';

const usePractice = () => {
    const { token } = useAuth();
    const [license, setLicense] = useState('A1');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [checkResult, setCheckResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [topic, setTopic] = useState(null);
    const [progress, setProgress] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [zoomImageSrc, setZoomImageSrc] = useState(null);

    // Responsive: ẩn sidebar khi nhỏ hơn 700px
    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth > 700);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (token) {
            getCurrentUser(token)
                .then(userData => {
                    if (userData?.license) setLicense(userData.license);
                })
                .catch(console.error);
            // Lấy tiến trình làm bài
            axios.get('/api/questions/progress', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (res.data && Array.isArray(res.data.data)) {
                    const prog = {};
                    res.data.data.forEach(entry => {
                        prog[entry.questionNumber] = {
                            user_answer: entry.user_answer,
                            is_correct: entry.is_correct
                        };
                    });
                    setProgress(prog);
                }
            }).catch(() => { });
        }
    }, [token]);

    const handleLicenseChange = async (e) => {
        const newLicense = e.target.value;
        setLicense(newLicense);
        try {
            await updateUserLicense(newLicense, token);
        } catch (error) {
            toast.error('Cập nhật hạng bằng thất bại!');
        }
    };

    const handleGetQuestions = async () => {
        setLoading(true);
        setCheckResult(null);
        setAnswers({});
        try {
            const params = topic !== null ? { license, topic } : { license };
            const res = await getPracticeQuestions(token, params);
            setQuestions(res.data);
            setCurrentQuestionIndex(0);
        } catch (error) {
            toast.error('Lỗi lấy câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (questionNumber, answer) => {
        setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
        try {
            const body = { [questionNumber]: answer };
            const res = await checkPracticeAnswers(token, body);
            if (res && Array.isArray(res.results)) {
                const result = res.results.find(r => r.questionNumber === questionNumber);
                setCheckResult(result || null);
            } else {
                setCheckResult(null);
            }
            axios.get('/api/questions/progress', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (res.data && Array.isArray(res.data.data)) {
                    const prog = {};
                    res.data.data.forEach(entry => {
                        prog[entry.questionNumber] = {
                            user_answer: entry.user_answer,
                            is_correct: entry.is_correct
                        };
                    });
                    setProgress(prog);
                }
            }).catch(() => { });
        } catch (error) {
            setCheckResult(null);
        }
    };

    const handleKeyDown = useCallback((e) => {
        if (!questions.length) return;
        if (e.key === 'ArrowRight') {
            setCurrentQuestionIndex(idx => Math.min(idx + 1, questions.length - 1));
            setCheckResult(null);
        } else if (e.key === 'ArrowLeft') {
            setCurrentQuestionIndex(idx => Math.max(idx - 1, 0));
            setCheckResult(null);
        } else if (["1", "2", "3", "4"].includes(e.key)) {
            const idx = Number(e.key) - 1;
            const currentQuestion = questions[currentQuestionIndex];
            if (currentQuestion && currentQuestion.options && idx < currentQuestion.options.length) {
                handleAnswer(currentQuestion.questionNumber, idx + 1);
            }
        }
    }, [questions, currentQuestionIndex]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleSelectSidebar = useCallback((idx) => {
        setCurrentQuestionIndex(idx);
        setCheckResult(null);
    }, []);

    useEffect(() => {
        const q = questions[currentQuestionIndex];
        if (q && progress[q.questionNumber]) {
            setAnswers(prev => ({
                ...prev,
                [q.questionNumber]: progress[q.questionNumber].user_answer
            }));
            setCheckResult({
                questionNumber: q.questionNumber,
                isCorrect: progress[q.questionNumber].is_correct,
                correct_answer: progress[q.questionNumber].user_answer
            });
        } else {
            setCheckResult(null);
            setAnswers(prev => ({
                ...prev,
                [q?.questionNumber]: undefined
            }));
        }
    }, [currentQuestionIndex, questions, progress]);

    const handleDeleteProgressClick = () => setShowDeleteModal(true);

    const handleDeleteProgress = async () => {
        try {
            await axios.delete('/api/questions/progress', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProgress({});
            setAnswers({});
            setCheckResult(null);
            setShowDeleteModal(false);
            toast.success('Đã xoá tiến trình ôn tập!', { position: 'bottom-left' });
        } catch (error) {
            setShowDeleteModal(false);
            toast.error('Xoá tiến trình thất bại!', { position: 'bottom-left' });
        }
    };

    return {
        license,
        setLicense,
        questions,
        currentQuestionIndex,
        answers,
        checkResult,
        loading,
        showSidebar,
        setShowSidebar,
        topic,
        setTopic,
        progress,
        showDeleteModal,
        setShowDeleteModal,
        showImageModal,
        setShowImageModal,
        zoomImageSrc,
        setZoomImageSrc,
        handleLicenseChange,
        handleGetQuestions,
        handleAnswer,
        handleSelectSidebar,
        handleDeleteProgressClick,
        handleDeleteProgress
    };
};

export default usePractice;