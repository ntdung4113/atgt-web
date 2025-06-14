import React, { useState, useEffect, useCallback } from 'react';
import usePractice from '../../components/hooks/usePractice';
import PracticeQuestionGrid from '../../components/ui/Practice/PracticeQuestionGrid';
import PracticeQuestion from '../../components/ui/Practice/PracticeQuestion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LICENSES, TOPIC_LIST } from '../../components/utils/constants';
import DeleteModal from '../../components/ui/Practice/DeleteModal';
import ImageModal from '../../components/ui/Practice/ImageModal';
import styles from '../../assets/css/Practice.module.css';

const PracticePage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showGrid, setShowGrid] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const {
        license,
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
    } = usePractice();

    const currentQuestion = questions[currentQuestionIndex];

    const handleQuestionSelect = useCallback((index) => {
        handleSelectSidebar(index);
        if (isMobile) {
            setShowGrid(false);
        }
    }, [handleSelectSidebar, isMobile]);

    const wrappedHandleLicenseChange = useCallback((e) => {
        handleLicenseChange(e);
    }, [handleLicenseChange]);

    const wrappedHandleGetQuestions = useCallback(() => {
        handleGetQuestions();
    }, [handleGetQuestions]);

    const wrappedHandleAnswer = useCallback((questionNumber, answerValue) => {
        handleAnswer(questionNumber, answerValue);
    }, [handleAnswer]);

    const onZoomImage = useCallback((src) => {
        setZoomImageSrc(src);
        setShowImageModal(true);
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                Luyện tập bộ câu hỏi
            </h2>
            <div className={styles.controls}>
                <label className={styles.label}>Hạng bằng:</label>
                <select value={license} onChange={wrappedHandleLicenseChange} className={styles.select}>
                    {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <span className={styles.label}>Chủ đề:</span>
                <select
                    value={topic === null ? '' : topic}
                    onChange={e => setTopic(e.target.value === '' ? null : Number(e.target.value))}
                    className={styles.topicSelect}
                >
                    {TOPIC_LIST.map(t => (
                        <option key={t.value === null ? 'all' : t.value} value={t.value === null ? '' : t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={wrappedHandleGetQuestions}
                    disabled={loading}
                    className={styles.startButton}
                >
                    {loading ? 'Đang tải...' : 'Bắt đầu'}
                </button>
                {isMobile && questions.length > 0 && (
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={styles.gridButton}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Danh sách câu hỏi
                    </button>
                )}
            </div>
            {questions.length > 0 && (
                <div className={isMobile ? styles.questionContainerMobile : (showSidebar ? styles.questionContainerSidebar : styles.questionContainerMobile)}>
                    {isMobile ? (
                        showGrid ? (
                            <div className={styles.gridWrapper}>
                                <div className={styles.gridHeader}>
                                    <div className={styles.gridTitle}>
                                        Danh sách câu hỏi
                                    </div>
                                    <button
                                        onClick={() => setShowGrid(false)}
                                        className={styles.closeButton}
                                    >
                                        ×
                                    </button>
                                </div>
                                <PracticeQuestionGrid
                                    questions={questions}
                                    currentQuestionIndex={currentQuestionIndex}
                                    progress={progress}
                                    onSelect={handleQuestionSelect}
                                />
                            </div>
                        ) : (
                            <PracticeQuestion
                                question={currentQuestion}
                                questionIndex={currentQuestionIndex}
                                answers={answers}
                                checkResult={checkResult}
                                onAnswer={wrappedHandleAnswer}
                                onZoomImage={onZoomImage}
                            />
                        )
                    ) : (
                        <>
                            {showSidebar && (
                                <PracticeQuestionGrid
                                    questions={questions}
                                    currentQuestionIndex={currentQuestionIndex}
                                    progress={progress}
                                    onSelect={handleSelectSidebar}
                                />
                            )}
                            <PracticeQuestion
                                question={currentQuestion}
                                questionIndex={currentQuestionIndex}
                                answers={answers}
                                checkResult={checkResult}
                                onAnswer={wrappedHandleAnswer}
                                onZoomImage={onZoomImage}
                            />
                        </>
                    )}
                </div>
            )}
            <div className={styles.tip}>
                Mẹo: Dùng phím ← → để chuyển câu, dùng phím 1 2 3 4 để chọn đáp án nhanh.
            </div>
            {questions.length > 0 && (
                <div className={styles.deleteButtonContainer}>
                    <button
                        onClick={handleDeleteProgressClick}
                        className={styles.deleteButton}
                    >
                        Xoá tiến trình ôn tập
                    </button>
                </div>
            )}
            {showDeleteModal && (
                <DeleteModal
                    onConfirm={handleDeleteProgress}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
            {showImageModal && zoomImageSrc && (
                <ImageModal
                    src={zoomImageSrc}
                    onClose={() => setShowImageModal(false)}
                />
            )}
            <ToastContainer />
        </div>
    );
};

export default PracticePage;