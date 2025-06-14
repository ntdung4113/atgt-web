import React from 'react';
import usePractice from '../../components/hooks/usePractice';
import PracticeQuestionGrid from '../../components/ui/Practice/PracticeQuestionGrid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LICENSES, TOPIC_LIST } from '../../components/utils/constants';

const PracticePage = () => {
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

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 10,
            background: '#fff'
        }}>
            <h2 style={{ marginBottom: 24, color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Luyện tập bộ câu hỏi
            </h2>
            <div style={{
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap'
            }}>
                <label style={{ fontWeight: 500 }}>Hạng bằng:</label>
                <select value={license} onChange={handleLicenseChange} style={{ padding: 6, borderRadius: 6 }}>
                    {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <span style={{ fontWeight: 500 }}>Chủ đề:</span>
                <select
                    value={topic === null ? '' : topic}
                    onChange={e => setTopic(e.target.value === '' ? null : Number(e.target.value))}
                    style={{ padding: 6, borderRadius: 6 }}
                >
                    {TOPIC_LIST.map(t => (
                        <option key={t.value === null ? 'all' : t.value} value={t.value === null ? '' : t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleGetQuestions}
                    disabled={loading}
                    style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 20px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px #1976d233',
                        marginRight: 12
                    }}
                >
                    {loading ? 'Đang tải...' : 'Bắt đầu'}
                </button>
                {!showSidebar && questions.length > 0 && (
                    <button
                        onClick={() => setShowSidebar(s => !s)}
                        style={{
                            background: '#fff',
                            border: '1px solid #1976d2',
                            color: '#1976d2',
                            borderRadius: 6,
                            padding: '8px 16px',
                            fontWeight: 600,
                            marginLeft: 'auto'
                        }}
                    >
                        {showSidebar ? 'Đóng' : 'Danh sách câu hỏi'}
                    </button>
                )}
            </div>
            {questions.length > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 24,
                    flexDirection: showSidebar ? 'row' : 'column'
                }}>
                    {showSidebar && (
                        <PracticeQuestionGrid
                            questions={questions}
                            currentQuestionIndex={currentQuestionIndex}
                            progress={progress}
                            onSelect={handleSelectSidebar}
                        />
                    )}
                    <div style={{
                        flex: 1,
                        background: '#f5f7fa',
                        borderRadius: 12,
                        padding: '18px 40px 12px 32px',
                        minHeight: 440,
                        height: 440,
                        maxWidth: 900,
                        width: '100%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        border: currentQuestion?.is_critical ? '2px solid #d32f2f' : '2px solid #1976d2',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        overflowY: 'auto',
                    }}>
                        <div
                            style={{
                                marginBottom: 10,
                                marginTop: 0,
                                fontWeight: 600,
                                fontSize: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                flexWrap: 'nowrap',
                                lineHeight: 1.5,
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    border: '3px solid #1976d2',
                                    flexShrink: 0,
                                }}
                            >
                                {currentQuestion?.order || currentQuestionIndex + 1}
                            </span>
                            <span
                                style={{
                                    color: currentQuestion?.is_critical ? '#d32f2f' : undefined,
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-line',
                                    fontWeight: currentQuestion?.is_critical ? 700 : 600,
                                    flex: 1,
                                }}
                            >
                                {currentQuestion?.content}
                            </span>
                        </div>
                        {currentQuestion?.image_link && (
                            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                                <img
                                    src={currentQuestion.image_link}
                                    alt="question"
                                    style={{ maxWidth: 220, borderRadius: 8, cursor: 'zoom-in' }}
                                    onClick={() => { setZoomImageSrc(currentQuestion.image_link); setShowImageModal(true); }}
                                />
                            </div>
                        )}
                        <div>
                            {currentQuestion?.options.map((opt, i) => {
                                const answerValue = i + 1;
                                const isSelected = answers[currentQuestion.questionNumber] === answerValue;
                                const isCorrect = checkResult && checkResult.correct_answer === answerValue && checkResult.isCorrect;
                                const isWrong = checkResult && isSelected && !checkResult.isCorrect;
                                let answerBg = isSelected ? '#e3f2fd' : '';
                                if (checkResult !== null) {
                                    if (isCorrect) answerBg = '#d0f5e8';
                                    else if (isWrong) answerBg = '#ffd6d6';
                                }
                                return (
                                    <div key={i} style={{ marginBottom: i === currentQuestion.options.length - 1 ? 0 : 8 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                background: answerBg,
                                                borderRadius: 8,
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                border: isCorrect ? '2px solid #43a047' : isWrong ? '2px solid #d32f2f' : '1px solid #ccc',
                                                boxShadow: isSelected ? '0 2px 8px #1976d233' : undefined,
                                                transition: 'background 0.2s, border 0.2s',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-line',
                                                fontWeight: isSelected ? 600 : 500,
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = checkResult !== null ? answerBg : '#f0f7ff'}
                                            onMouseLeave={e => e.currentTarget.style.background = answerBg}
                                            onClick={() => handleAnswer(currentQuestion.questionNumber, answerValue)}
                                        >
                                            <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{opt}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {checkResult !== null && (
                            <div style={{ marginTop: 12, color: checkResult.isCorrect ? '#43a047' : '#d32f2f', fontWeight: 600 }}>
                                {checkResult.isCorrect ? 'Đúng!' : 'Sai!'}
                                {currentQuestion?.hint && (
                                    <div style={{ marginTop: 8, color: '#888', fontStyle: 'italic' }}>
                                        Gợi ý: {currentQuestion.hint}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div style={{ marginTop: 16, color: '#888', fontStyle: 'italic', textAlign: 'center', fontSize: 12 }}>
                Mẹo: Dùng phím ← → để chuyển câu, dùng phím 1 2 3 4 để chọn đáp án nhanh.
            </div>
            {questions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <button
                        onClick={handleDeleteProgressClick}
                        style={{
                            background: '#fff',
                            color: '#d32f2f',
                            border: '1.5px solid #d32f2f',
                            borderRadius: 8,
                            padding: '10px 28px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 12
                        }}
                    >
                        Xoá tiến trình ôn tập
                    </button>
                </div>
            )}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 280, boxShadow: '0 2px 16px #0002', textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Bạn có chắc chắn muốn xoá toàn bộ tiến trình ôn tập?</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                            <button onClick={handleDeleteProgress} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Xác nhận</button>
                            <button onClick={() => setShowDeleteModal(false)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Huỷ</button>
                        </div>
                    </div>
                </div>
            )}
            {showImageModal && zoomImageSrc && (
                <div onClick={() => setShowImageModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
                }}>
                    <img
                        src={zoomImageSrc}
                        alt="zoom"
                        style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 4px 32px #0006', background: '#fff', cursor: 'zoom-out' }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setShowImageModal(false)}
                        style={{ position: 'fixed', top: 32, right: 48, background: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 22, fontWeight: 700, color: '#d32f2f', cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}
                    >×</button>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default PracticePage;