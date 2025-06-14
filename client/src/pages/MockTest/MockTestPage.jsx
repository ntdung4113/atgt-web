import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import useMockTest from '../../components/hooks/useMockTest';
import useTimer from '../../components/hooks/useTimer';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentUser, updateUserLicense } from '../../services/userService';
import QuestionGrid from '../../components/ui/MockTest/QuestionGrid';
import ResultModal from '../../components/ui/MockTest/ResultModal';
import ImageModal from '../../components/ui/MockTest/ImageModal';
import { useNavigate } from 'react-router-dom';
import { LICENSES, LICENSE_INFO } from '../../components/utils/constants';
import styles from '../../assets/css/MockTestPage.module.css';

const MockTestPage = () => {
    const { token } = useContext(AuthContext);
    const [showLicenseBar, setShowLicenseBar] = useState(true);
    const [showResultModal, setShowResultModal] = useState(false);
    const [license, setLicense] = useState('A1');
    const [answers, setAnswers] = useState({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [result, setResult] = useState(null);
    const { questions, duration, minCorrect, isLoading, error, fetchMockTest } = useMockTest(token);
    const [showQuestionGrid, setShowQuestionGrid] = useState(false);
    const [timeLeft, start, pause, reset, running] = useTimer(0, false, () => handleSubmit());
    const [testStarted, setTestStarted] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [flagged, setFlagged] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    const handleLicenseChange = useCallback(async (e) => {
        const newLicense = e.target.value;
        setLicense(newLicense);
        try {
            await updateUserLicense(newLicense, token);
        } catch (error) {
            toast.error('Cập nhật hạng bằng thất bại!', { position: 'bottom-left' });
        }
    }, [token]);

    const handleStart = useCallback(async () => {
        await fetchMockTest();
        setAnswers({});
        setResult(null);
        setShowLicenseBar(false);
        setCurrentIdx(0);
        setTestStarted(true);
        setFlagged({});
    }, [fetchMockTest]);

    const handleSelect = useCallback((qid, val) => {
        setAnswers(prev => ({ ...prev, [qid]: val }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!testStarted) return;
        try {
            setIsSubmitting(true);
            const requestBody = {
                answers,
                question_ids: questions.map(q => q.question_id),
                license
            };
            const res = await axios.post('/api/questions/submit-mock-test', requestBody, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = res.data;
            setResult(result);
            setShowResultModal(true);
            setTestStarted(false);
            setAnswers({});
            setCurrentIdx(0);
            setFlagged({});
            reset(0);
            if (result.status === 'pass') {
                toast.success('Chúc mừng! Bạn đã ĐỖ!', { position: 'bottom-left' });
            } else {
                toast.error(`Bạn đã TRƯỢT! Lý do: ${result.fail_reason || 'Không đạt yêu cầu'}`, { position: 'bottom-left' });
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.', { position: 'bottom-left' });
        } finally {
            setIsSubmitting(false);
        }
    }, [testStarted, answers, questions, license, token, reset]);

    const handleRetry = useCallback(() => {
        setShowResultModal(false);
        setShowLicenseBar(true);
        setAnswers({});
        setResult(null);
        setCurrentIdx(0);
        setTestStarted(false);
        setFlagged({});
        reset(0);
    }, [reset]);

    const handleReview = useCallback(() => {
        setShowResultModal(false);
        setReviewMode(true);
    }, []);

    const handleExitReview = useCallback(() => {
        setReviewMode(false);
        setShowLicenseBar(true);
        setAnswers({});
        setResult(null);
        setCurrentIdx(0);
        setTestStarted(false);
        setFlagged({});
        reset(0);
    }, [reset]);

    const handleToggleFlag = useCallback((qid) => {
        setFlagged(prev => ({ ...prev, [qid]: !prev[qid] }));
    }, []);

    const handlePreviousQuestion = useCallback(() => {
        setCurrentIdx(idx => Math.max(idx - 1, 0));
    }, []);

    const handleNextQuestion = useCallback(() => {
        setCurrentIdx(idx => Math.min(idx + 1, questions.length - 1));
    }, [questions.length]);

    const formatTime = useCallback((seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    const getTestQuestionStatus = useCallback((q, idx) => {
        const answered = answers[q.question_id] !== undefined;
        const isCurrent = idx === currentIdx;
        const isFlagged = flagged[q.question_id];
        let bg = '#fff', color = '#333', border = '1px solid #ccc', title = 'Chưa trả lời';
        if (isCurrent) {
            bg = '#1976d2'; color = '#fff'; border = '2px solid #1976d2';
        } else if (answered) {
            bg = '#42a5f5'; color = '#fff'; border = '2px solid #42a5f5';
            title = 'Đã trả lời';
        }
        if (isFlagged) {
            border = '2px solid #ffd600';
            title = 'Đánh dấu làm sau';
        }
        return { bg, color, border, title };
    }, [answers, currentIdx, flagged]);

    const getReviewQuestionStatus = useCallback((q, idx) => {
        const isCurrent = idx === currentIdx;
        const isCorrect = q.is_correct;
        const isUnanswered = q.user_answer === null;
        let bg = '#fff', color = '#333', border = '1px solid #ccc', title = 'Chưa trả lời';
        if (isCurrent) {
            bg = '#1976d2'; color = '#fff'; border = '2px solid #1976d2';
        } else if (isUnanswered) {
            bg = '#fff'; color = '#666'; border = '2px solid #666';
        } else if (isCorrect) {
            bg = '#43a047'; color = '#fff'; border = '2px solid #43a047';
            title = 'Đúng';
        } else {
            bg = '#d32f2f'; color = '#fff'; border = '2px solid #d32f2f';
            title = 'Sai';
        }
        return { bg, color, border, title };
    }, [currentIdx]);

    const handleKeyDown = useCallback((e) => {
        if (showLicenseBar || showResultModal) return;
        if (e.key === 'ArrowLeft') {
            setCurrentIdx(idx => Math.max(idx - 1, 0));
        } else if (e.key === 'ArrowRight') {
            setCurrentIdx(idx => Math.min(idx + 1, questions.length - 1));
        } else if (["1", "2", "3", "4"].includes(e.key)) {
            const q = questions[currentIdx];
            if (q && q.options && q.options.length >= Number(e.key)) {
                setAnswers(prev => ({ ...prev, [q.question_id]: Number(e.key) }));
            }
        }
    }, [showLicenseBar, showResultModal, questions, currentIdx]);

    const handleEsc = useCallback((e) => {
        if (e.key === 'Escape' && showResultModal) {
            handleRetry();
        }
    }, [showResultModal, handleRetry]);

    useEffect(() => {
        if (token) {
            getCurrentUser(token)
                .then(userData => {
                    if (userData?.license) setLicense(userData.license);
                })
                .catch(() => {});
        }
    }, [token]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 700);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (testStarted && duration > 0) {
            reset(duration * 60);
            start();
        }
    }, [testStarted, duration, reset, start]);

    useEffect(() => {
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [handleEsc]);

    if (showLicenseBar) {
        return (
            <div className={styles.licenseContainer}>
                <h2 className={styles.licenseTitle}>Thi thử lý thuyết</h2>
                <div className={styles.licenseSelection}>
                    <label className={styles.licenseLabel}>Hạng bằng:</label>
                    <select value={license} onChange={handleLicenseChange} className={styles.licenseSelect}>
                        {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button onClick={handleStart} disabled={isLoading || !token} className={styles.startButton}>
                        {isLoading ? 'Đang tạo đề...' : 'Bắt đầu thi thử'}
                    </button>
                </div>
                <div className={styles.licenseInfo}>
                    Số câu hỏi: <b>{LICENSE_INFO[license].count}</b>  |  Số câu cần đúng: <b>{LICENSE_INFO[license].min}</b>  |  Thời gian: <b>{LICENSE_INFO[license].time} phút</b>
                </div>
                {error && <div className={styles.errorMessage}>Lỗi: {error.message || 'Không tạo được đề thi'}</div>}
            </div>
        );
    }

    if (showResultModal && result) {
        return (
            <ResultModal
                open={showResultModal}
                result={result}
                onRetry={handleRetry}
                onReview={handleReview}
            />
        );
    }

    if (reviewMode && result) {
        const reviewQuestions = result.data.sort((a, b) => a.order - b.order);
        const q = reviewQuestions[currentIdx];
        const status = q.user_answer === null ? 'Chưa trả lời' : q.is_correct ? 'Đúng' : 'Sai';
        const statusColorClass = q.user_answer === null ? styles.reviewStatusUnanswered : q.is_correct ? styles.reviewStatusCorrect : styles.reviewStatusWrong;

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerTitle}>Xem lại bài làm</div>
                    </div>
                </div>
                <div className={`${styles.mainContent} ${!isMobile ? styles.mainContentDesktop : ''}`}>
                    {!isMobile && (
                        <div className={styles.sidebar}>
                            <QuestionGrid
                                questions={reviewQuestions}
                                currentIdx={currentIdx}
                                onQuestionClick={setCurrentIdx}
                                getQuestionStatus={getReviewQuestionStatus}
                                showCritical={true}
                            />
                        </div>
                    )}
                    <div className={styles.questionSection}>
                        {isMobile && (
                            <div className={styles.mobileHeader}>
                                <div className={`${styles.reviewStatus} ${statusColorClass}`}>{status}</div>
                                <button onClick={() => setShowQuestionGrid(true)} className={styles.questionListButton}>
                                    Danh sách câu hỏi
                                </button>
                            </div>
                        )}
                        <div className={`${styles.reviewContainer} ${q?.is_critical ? styles.reviewContainerCritical : ''}`}>
                            <div className={styles.questionHeader}>
                                <span className={styles.questionNumber}>{q?.order || currentIdx + 1}</span>
                                <span className={`${styles.questionText} ${q?.is_critical ? styles.questionTextCritical : ''}`}>
                                    {q?.content}
                                </span>
                            </div>
                            {q?.image_link && (
                                <div className={styles.imageContainer}>
                                    <img
                                        src={q.image_link}
                                        alt="question"
                                        className={styles.questionImage}
                                        onClick={() => {
                                            setSelectedImage(q.image_link);
                                            setShowImageModal(true);
                                        }}
                                    />
                                </div>
                            )}
                            <div>
                                {q?.options.map((opt, i) => {
                                    const isCorrect = i === q.correct_answer;
                                    const isUserAnswer = i === q.user_answer;
                                    const isWrong = isUserAnswer && !isCorrect;
                                    const optionClass = isCorrect ? styles.reviewOptionCorrect : isWrong ? styles.reviewOptionWrong : styles.reviewOptionDefault;
                                    return (
                                        <div key={i} className={styles.option}>
                                            <div className={`${styles.reviewOptionContent} ${optionClass}`}>
                                                <span>{opt}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {q?.hint && (
                                <div className={styles.hintContainer}>
                                    <div className={styles.hintTitle}>Mẹo:</div>
                                    <div className={styles.hintText}>{q.hint}</div>
                                </div>
                            )}
                        </div>
                        {!isMobile && (
                            <div className={styles.actionBar}>
                                <div className={`${styles.reviewStatus} ${statusColorClass}`}>{status}</div>
                                <button onClick={handleExitReview} className={`${styles.button} ${styles.exitButton}`}>
                                    Thoát
                                </button>
                            </div>
                        )}
                        {isMobile && (
                            <div className={`${styles.actionBar} ${styles.actionBarMobile}`}>
                                <div className={styles.actionButtonsMobile}>
                                    <button
                                        onClick={handlePreviousQuestion}
                                        disabled={currentIdx === 0}
                                        className={`${styles.navButton} ${styles.buttonMobile}`}
                                    >
                                        Câu trước
                                    </button>
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={currentIdx === reviewQuestions.length - 1}
                                        className={`${styles.navButton} ${styles.buttonMobile}`}
                                    >
                                        Câu sau
                                    </button>
                                    <button onClick={handleExitReview} className={`${styles.button} ${styles.exitButton} ${styles.buttonMobile}`}>
                                        Thoát
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {isMobile && showQuestionGrid && (
                    <QuestionGrid
                        questions={reviewQuestions}
                        currentIdx={currentIdx}
                        onQuestionClick={(idx) => {
                            setCurrentIdx(idx);
                            setShowQuestionGrid(false);
                        }}
                        getQuestionStatus={getReviewQuestionStatus}
                        isMobile={true}
                        showModal={true}
                        onCloseModal={() => setShowQuestionGrid(false)}
                        showCritical={true}
                    />
                )}
                <ImageModal
                    open={showImageModal}
                    imageUrl={selectedImage}
                    onClose={() => {
                        setShowImageModal(false);
                        setSelectedImage(null);
                    }}
                />
            </div>
        );
    }

    const q = questions[currentIdx];
    if (!q) {
        return (
            <div className={styles.licenseContainer}>
                <h2 className={styles.errorMessage}>Lỗi</h2>
                <div className={styles.licenseInfo}>
                    Không đủ câu hỏi cho hạng bằng {license}. Vui lòng thử lại sau hoặc chọn hạng bằng khác.
                </div>
                <button onClick={handleRetry} className={styles.startButton}>
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <>
            {!showLicenseBar && !showResultModal && !reviewMode && (
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <div className={styles.headerTitle}>Thi thử lý thuyết</div>
                        </div>
                    </div>
                    <div className={`${styles.mainContent} ${!isMobile ? styles.mainContentDesktop : ''}`}>
                        {!isMobile && (
                            <div className={styles.sidebar}>
                                <QuestionGrid
                                    questions={questions}
                                    currentIdx={currentIdx}
                                    onQuestionClick={setCurrentIdx}
                                    getQuestionStatus={getTestQuestionStatus}
                                    flagged={flagged}
                                    onToggleFlag={handleToggleFlag}
                                />
                            </div>
                        )}
                        <div className={styles.questionSection}>
                            {isMobile && (
                                <div className={styles.mobileHeader}>
                                    <div className={styles.timeLeft}>Thời gian: {formatTime(timeLeft)}</div>
                                    <button onClick={() => setShowQuestionGrid(true)} className={styles.questionListButton}>
                                        Danh sách câu hỏi
                                    </button>
                                </div>
                            )}
                            <div className={`${styles.questionContainer} ${q?.is_critical ? styles.questionContainerCritical : ''}`}>
                                <div className={styles.questionHeader}>
                                    <span className={styles.questionNumber}>{q?.order || currentIdx + 1}</span>
                                    <span className={`${styles.questionText} ${q?.is_critical ? styles.questionTextCritical : ''}`}>
                                        {q?.content}
                                    </span>
                                    <button
                                        onClick={() => handleToggleFlag(q.question_id)}
                                        className={`${styles.flagButton} ${flagged[q.question_id] ? styles.flagButtonFlagged : ''}`}
                                        title={flagged[q.question_id] ? 'Bỏ đánh dấu' : 'Đánh dấu làm sau'}
                                    >
                                        {flagged[q.question_id] ? '★' : '☆'}
                                    </button>
                                </div>
                                {q?.image_link && (
                                    <div className={styles.imageContainer}>
                                        <img
                                            src={q.image_link}
                                            alt="question"
                                            className={styles.questionImage}
                                            onClick={() => {
                                                setSelectedImage(q.image_link);
                                                setShowImageModal(true);
                                            }}
                                        />
                                    </div>
                                )}
                                <div>
                                    {q?.options.map((opt, i) => {
                                        const val = i + 1;
                                        const isSelected = answers[q.question_id] === val;
                                        return (
                                            <div key={i} className={styles.option}>
                                                <div
                                                    className={`${styles.optionContent} ${isSelected ? styles.optionContentSelected : ''}`}
                                                    onClick={() => handleSelect(q.question_id, val)}
                                                >
                                                    <span>{opt}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {!isMobile && (
                                <div className={styles.actionBar}>
                                    <div className={styles.timeLeft}>Thời gian: {formatTime(timeLeft)}</div>
                                    <div className={styles.actionButtons}>
                                        <button onClick={handleRetry} className={`${styles.button} ${styles.exitButton}`}>
                                            Thoát
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className={`${styles.button} ${styles.submitButton} ${isSubmitting ? styles.submitButtonDisabled : ''}`}
                                        >
                                            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {isMobile && (
                                <div className={`${styles.actionBar} ${styles.actionBarMobile}`}>
                                    <div className={styles.actionButtonsMobile}>
                                        <button
                                            onClick={handlePreviousQuestion}
                                            disabled={currentIdx === 0}
                                            className={`${styles.navButton} ${styles.buttonMobile}`}
                                        >
                                            Câu trước
                                        </button>
                                        <button
                                            onClick={handleNextQuestion}
                                            disabled={currentIdx === questions.length - 1}
                                            className={`${styles.navButton} ${styles.buttonMobile}`}
                                        >
                                            Câu sau
                                        </button>
                                        <button onClick={handleRetry} className={`${styles.button} ${styles.exitButton} ${styles.buttonMobile}`}>
                                            Thoát
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className={`${styles.button} ${styles.submitButton} ${styles.buttonMobile} ${isSubmitting ? styles.submitButtonDisabled : ''}`}
                                        >
                                            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {isMobile && showQuestionGrid && (
                        <QuestionGrid
                            questions={questions}
                            currentIdx={currentIdx}
                            onQuestionClick={(idx) => {
                                setCurrentIdx(idx);
                                setShowQuestionGrid(false);
                            }}
                            getQuestionStatus={getTestQuestionStatus}
                            isMobile={true}
                            showModal={true}
                            onCloseModal={() => setShowQuestionGrid(false)}
                            flagged={flagged}
                            onToggleFlag={handleToggleFlag}
                        />
                    )}
                </div>
            )}
            {!isMobile && (
                <div className={styles.tip}>
                    Mẹo: Dùng phím ← → để chuyển câu, dùng phím 1 2 3 4 để chọn đáp án nhanh.
                </div>
            )}
            <ImageModal
                open={showImageModal}
                imageUrl={selectedImage}
                onClose={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                }}
            />
            <ToastContainer />
        </>
    );
};

export default MockTestPage;