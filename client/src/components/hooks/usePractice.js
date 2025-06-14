import { useEffect, useReducer, useCallback } from 'react';
import { getPracticeQuestions, checkPracticeAnswers } from '../../services/questionService';
import useAuth from './useAuth';
import { getCurrentUser, updateUserLicense } from '../../services/userService';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
    license: 'A1',
    questions: [],
    currentQuestionIndex: 0,
    answers: new Map(),
    checkResult: null,
    loading: false,
    showSidebar: true,
    topic: null,
    progress: new Map(),
    showDeleteModal: false,
    showImageModal: false,
    zoomImageSrc: null
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_LICENSE':
            return { ...state, license: action.payload };
        case 'SET_QUESTIONS':
            return { ...state, questions: action.payload, currentQuestionIndex: 0 };
        case 'SET_CURRENT_QUESTION_INDEX':
            return { ...state, currentQuestionIndex: action.payload };
        case 'SET_ANSWERS':
            return { ...state, answers: action.payload };
        case 'SET_CHECK_RESULT':
            return { ...state, checkResult: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_SHOW_SIDEBAR':
            return { ...state, showSidebar: action.payload };
        case 'SET_TOPIC':
            return { ...state, topic: action.payload };
        case 'SET_PROGRESS':
            return { ...state, progress: action.payload };
        case 'SET_SHOW_DELETE_MODAL':
            return { ...state, showDeleteModal: action.payload };
        case 'SET_SHOW_IMAGE_MODAL':
            return { ...state, showImageModal: action.payload };
        case 'SET_ZOOM_IMAGE_SRC':
            return { ...state, zoomImageSrc: action.payload };
        case 'CLEAR_PROGRESS':
            return { ...state, progress: new Map(), answers: new Map(), checkResult: null };
        default:
            return state;
    }
};

const usePractice = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { token } = useAuth();

    useEffect(() => {
        const handleResize = () => {
            dispatch({ type: 'SET_SHOW_SIDEBAR', payload: window.innerWidth > 700 });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (token) {
            const fetchUserDataAndProgress = async () => {
                try {
                    const [userResponse, progressResponse] = await Promise.all([
                        getCurrentUser(token),
                        axios.get('/api/questions/progress', { headers: { Authorization: `Bearer ${token}` } })
                    ]);
                    if (userResponse?.license) {
                        dispatch({ type: 'SET_LICENSE', payload: userResponse.license });
                    }
                    if (progressResponse.data && Array.isArray(progressResponse.data.data)) {
                        const newProgress = new Map();
                        progressResponse.data.data.forEach(entry => {
                            newProgress.set(entry.questionNumber, {
                                user_answer: entry.user_answer,
                                is_correct: entry.is_correct
                            });
                        });
                        dispatch({ type: 'SET_PROGRESS', payload: newProgress });
                    }
                } catch (error) {
                    console.error('Error fetching user data or progress:', error);
                }
            };
            fetchUserDataAndProgress();
        }
    }, [token]);

    const handleLicenseChange = useCallback(async (e) => {
        const newLicense = e.target.value;
        dispatch({ type: 'SET_LICENSE', payload: newLicense });
        try {
            await updateUserLicense(newLicense, token);
        } catch (error) {
            toast.error('Cập nhật hạng bằng thất bại!');
        }
    }, [token]);

    const handleGetQuestions = useCallback(async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để tiếp tục.');
            return;
        }
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_CHECK_RESULT', payload: null });
        dispatch({ type: 'SET_ANSWERS', payload: new Map() });
        try {
            const params = state.topic !== null ? { license: state.license, topic: state.topic } : { license: state.license };
            const res = await getPracticeQuestions(token, params);
            dispatch({ type: 'SET_QUESTIONS', payload: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tải câu hỏi. Vui lòng kiểm tra kết nối mạng.');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [token, state.license, state.topic]);

    const handleAnswer = useCallback(async (questionNumber, answer) => {
        const newAnswers = new Map(state.answers);
        newAnswers.set(questionNumber, answer);
        dispatch({ type: 'SET_ANSWERS', payload: newAnswers });
        try {
            const body = { [questionNumber]: answer };
            const res = await checkPracticeAnswers(token, body);
            if (res && Array.isArray(res.results)) {
                const result = res.results.find(r => r.questionNumber === questionNumber);
                dispatch({ type: 'SET_CHECK_RESULT', payload: result || null });
            } else {
                dispatch({ type: 'SET_CHECK_RESULT', payload: null });
            }
            const progressRes = await axios.get('/api/questions/progress', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (progressRes.data && Array.isArray(progressRes.data.data)) {
                const newProgress = new Map();
                progressRes.data.data.forEach(entry => {
                    newProgress.set(entry.questionNumber, {
                        user_answer: entry.user_answer,
                        is_correct: entry.is_correct
                    });
                });
                dispatch({ type: 'SET_PROGRESS', payload: newProgress });
            }
        } catch (error) {
            dispatch({ type: 'SET_CHECK_RESULT', payload: null });
        }
    }, [token, state.answers]);

    const handleKeyDown = useCallback((e) => {
        if (!state.questions.length || !state.questions[state.currentQuestionIndex]) return;

        const currentQuestion = state.questions[state.currentQuestionIndex];

        switch (e.key) {
            case 'ArrowRight':
                dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1) });
                dispatch({ type: 'SET_CHECK_RESULT', payload: null });
                break;
            case 'ArrowLeft':
                dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: Math.max(state.currentQuestionIndex - 1, 0) });
                dispatch({ type: 'SET_CHECK_RESULT', payload: null });
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const answerIndex = Number(e.key) - 1;
                if (answerIndex < currentQuestion.options.length) {
                    handleAnswer(currentQuestion.questionNumber, answerIndex + 1);
                }
                break;
            default:
                break;
        }
    }, [state.questions, state.currentQuestionIndex, handleAnswer]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleSelectSidebar = useCallback((idx) => {
        dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: idx });
        dispatch({ type: 'SET_CHECK_RESULT', payload: null });
    }, []);

    useEffect(() => {
        const q = state.questions[state.currentQuestionIndex];
        if (q && state.progress.has(q.questionNumber)) {
            const progressEntry = state.progress.get(q.questionNumber);
            const newAnswers = new Map(state.answers);
            newAnswers.set(q.questionNumber, progressEntry.user_answer);
            dispatch({ type: 'SET_ANSWERS', payload: newAnswers });
            dispatch({
                type: 'SET_CHECK_RESULT',
                payload: {
                    questionNumber: q.questionNumber,
                    isCorrect: progressEntry.is_correct,
                    correct_answer: progressEntry.user_answer
                }
            });
        } else {
            dispatch({ type: 'SET_CHECK_RESULT', payload: null });
            const newAnswers = new Map(state.answers);
            newAnswers.delete(q?.questionNumber);
            dispatch({ type: 'SET_ANSWERS', payload: newAnswers });
        }
    }, [state.currentQuestionIndex, state.questions, state.progress]);

    const handleDeleteProgressClick = useCallback(() => {
        dispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: true });
    }, []);

    const handleDeleteProgress = useCallback(async () => {
        try {
            await axios.delete('/api/questions/progress', {
                headers: { Authorization: `Bearer ${token}` }
            });
            dispatch({ type: 'CLEAR_PROGRESS' });
            dispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: false });
            toast.success('Đã xoá tiến trình ôn tập!', { position: 'bottom-left' });
        } catch (error) {
            dispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: false });
            toast.error('Xoá tiến trình thất bại!', { position: 'bottom-left' });
        }
    }, [token]);

    return {
        license: state.license,
        setLicense: (value) => dispatch({ type: 'SET_LICENSE', payload: value }),
        questions: state.questions,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: Object.fromEntries(state.answers), // Chuyển Map thành object để tương thích với component
        checkResult: state.checkResult,
        loading: state.loading,
        showSidebar: state.showSidebar,
        setShowSidebar: (value) => dispatch({ type: 'SET_SHOW_SIDEBAR', payload: value }),
        topic: state.topic,
        setTopic: (value) => dispatch({ type: 'SET_TOPIC', payload: value }),
        progress: Object.fromEntries(state.progress), // Chuyển Map thành object
        showDeleteModal: state.showDeleteModal,
        setShowDeleteModal: (value) => dispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: value }),
        showImageModal: state.showImageModal,
        setShowImageModal: (value) => dispatch({ type: 'SET_SHOW_IMAGE_MODAL', payload: value }),
        zoomImageSrc: state.zoomImageSrc,
        setZoomImageSrc: (value) => dispatch({ type: 'SET_ZOOM_IMAGE_SRC', payload: value }),
        handleLicenseChange,
        handleGetQuestions,
        handleAnswer,
        handleSelectSidebar,
        handleDeleteProgressClick,
        handleDeleteProgress
    };
};

export default usePractice;