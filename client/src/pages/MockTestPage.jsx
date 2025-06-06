import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import useMockTest from '../hooks/useMockTest';
import useTimer from '../hooks/useTimer';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentUser, updateUserLicense } from '../services/userService';
import QuestionGrid from '../components/MockTest/QuestionGrid';
import { useNavigate } from 'react-router-dom';

const LICENSES = ['A1', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D2', 'D', 'BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE'];
const LICENSE_INFO = {
    A1: { count: 25, min: 21, time: 19 },
    A: { count: 25, min: 23, time: 19 },
    B1: { count: 25, min: 23, time: 19 },
    B: { count: 30, min: 27, time: 20 },
    C1: { count: 35, min: 32, time: 22 },
    C: { count: 40, min: 36, time: 24 },
    D1: { count: 45, min: 41, time: 26 },
    D2: { count: 45, min: 41, time: 26 },
    D: { count: 45, min: 41, time: 26 },
    BE: { count: 45, min: 41, time: 26 },
    C1E: { count: 45, min: 41, time: 26 },
    CE: { count: 45, min: 41, time: 26 },
    D1E: { count: 45, min: 41, time: 26 },
    D2E: { count: 45, min: 41, time: 26 },
    DE: { count: 45, min: 41, time: 26 },
};

function ResultModal({ open, result, onRetry, onReview }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={onRetry}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 32,
                    width: '90%',
                    maxWidth: 480,
                    boxShadow: '0 4px 24px #0002',
                    textAlign: 'center'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{
                    color: result.status === 'pass' ? '#43a047' : '#d32f2f',
                    marginBottom: 24,
                    fontSize: 32,
                    fontWeight: 700
                }}>
                    {result.status === 'pass' ? 'ĐỖ' : 'TRƯỢT'}
                </h2>
                <div style={{
                    margin: '24px 0',
                    fontSize: 18,
                    lineHeight: 1.6
                }}>
                    Số câu đúng: <b>{result.correct}</b> / {result.total} <br />
                    Số câu sai và chưa làm: <b>{result.wrong}</b> <br />
                    {result.fail_reason && <div style={{ color: '#d32f2f', marginTop: 12, fontSize: 16 }}>Lý do: {result.fail_reason}</div>}
                    Yêu cầu tối thiểu: <b>{result.min_correct}</b> câu đúng
                </div>
                <div style={{
                    display: 'flex',
                    gap: 16,
                    justifyContent: 'center',
                    marginTop: 32,
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={onRetry}
                        style={{
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 32px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            flex: 1,
                            minWidth: 160
                        }}
                    >
                        Làm lại bài khác
                    </button>
                    <button
                        onClick={onReview}
                        style={{
                            background: '#43a047',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 32px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            flex: 1,
                            minWidth: 160
                        }}
                    >
                        Xem lại bài thi
                    </button>
                </div>
                <div style={{
                    marginTop: 20,
                    fontSize: 14,
                    color: '#666',
                    fontStyle: 'italic'
                }}>
                    (Nhấn ESC hoặc click bên ngoài để thoát)
                </div>
            </div>
        </div>
    );
}

function ImageModal({ open, imageUrl, onClose }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.9)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={onClose}
        >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                <img
                    src={imageUrl}
                    alt="Zoomed question"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain'
                    }}
                />
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: -40,
                        right: 0,
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: 32,
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}

const MockTestPage = () => {
    const { token } = useContext(AuthContext);
    const [showLicenseBar, setShowLicenseBar] = useState(true);
    const [showResultModal, setShowResultModal] = useState(false);
    const [license, setLicense] = useState('A1');
    const [answers, setAnswers] = useState({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [result, setResult] = useState(null);
    const { questions, duration, minCorrect, isLoading, error, fetchMockTest } = useMockTest(token, license);
    const [showQuestionGrid, setShowQuestionGrid] = useState(false);
    const [timeLeft, start, pause, reset, running] = useTimer(0, false, () => handleSubmit(true));
    const [testStarted, setTestStarted] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [flagged, setFlagged] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            getCurrentUser(token)
                .then(userData => {
                    if (userData?.license) setLicense(userData.license);
                })
                .catch(() => { });
        }
    }, [token]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 700);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLicenseChange = async (e) => {
        const newLicense = e.target.value;
        setLicense(newLicense);
        try {
            await updateUserLicense(newLicense, token);
        } catch (error) {
            toast.error('Cập nhật hạng bằng thất bại!', { position: 'bottom-left' });
        }
    };

    const handleStart = async () => {
        await fetchMockTest();
        setAnswers({});
        setResult(null);
        setShowLicenseBar(false);
        setCurrentIdx(0);
        setTestStarted(true);
        setFlagged({});
    };

    const handleSelect = (qid, val) => {
        setAnswers(prev => ({ ...prev, [qid]: val }));
    };

    const handleSubmit = async () => {
        if (!testStarted) return;

        try {
            setIsSubmitting(true);
            const requestBody = {
                answers,
                question_ids: questions.map(q => q.question_id),
                license
            };
            console.log('Submit test request body:', requestBody);

            const res = await axios.post('/api/questions/submit-mock-test', requestBody, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = res.data;
            console.log('Submit test response:', result);

            setResult(result);
            setShowResultModal(true);
            setTestStarted(false);
            setAnswers({});
            setCurrentIdx(0);
            setFlagged({});
            reset(0);

            // Hiển thị thông báo kết quả
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
    };

    const handleRetry = () => {
        setShowResultModal(false);
        setShowLicenseBar(true);
        setAnswers({});
        setResult(null);
        setCurrentIdx(0);
        setTestStarted(false);
        setFlagged({});
        reset(0);
    };

    const handleReview = () => {
        setShowResultModal(false);
        setReviewMode(true);
    };

    const handleExitReview = () => {
        setReviewMode(false);
        setShowLicenseBar(true);
        setAnswers({});
        setResult(null);
        setCurrentIdx(0);
        setTestStarted(false);
        setFlagged({});
        reset(0);
    };

    const handleToggleFlag = (qid) => {
        setFlagged(prev => ({ ...prev, [qid]: !prev[qid] }));
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTestQuestionStatus = (q, idx) => {
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
    };

    const getReviewQuestionStatus = (q, idx) => {
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
    };

    const handleReviewQuestionClick = (idx) => {
        setCurrentIdx(idx);
        if (isMobile) {
            setShowQuestionGrid(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
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
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [questions, currentIdx, showLicenseBar, showResultModal]);

    useEffect(() => {
        if (testStarted && duration > 0) {
            reset(duration * 60);
            start();
        }
    }, [testStarted, duration, reset, start]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && showResultModal) {
                handleRetry();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showResultModal]);

    if (showLicenseBar) {
        return (
            <div style={{
                maxWidth: 700,
                margin: '40px auto 0 auto',
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 4px 24px #0001',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18
            }}>
                <h2 style={{ color: '#1976d2', marginBottom: 8 }}>Thi thử lý thuyết</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                    <label style={{ fontWeight: 500, fontSize: 17 }}>Hạng bằng:</label>
                    <select value={license} onChange={handleLicenseChange} style={{ padding: 8, borderRadius: 8, fontSize: 17, minWidth: 90 }}>
                        {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button onClick={handleStart} disabled={isLoading || !token} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 17, cursor: 'pointer', minWidth: 120 }}>
                        {isLoading ? 'Đang tạo đề...' : 'Bắt đầu thi thử'}
                    </button>
                </div>
                <div style={{ fontSize: 16, color: '#333', background: '#f5f5f5', borderRadius: 8, padding: 14, minWidth: 260 }}>
                    Số câu hỏi: <b>{LICENSE_INFO[license].count}</b>  |  Số câu cần đúng: <b>{LICENSE_INFO[license].min}</b>  |  Thời gian: <b>{LICENSE_INFO[license].time} phút</b>
                </div>
                {error && <div style={{ color: 'red', marginTop: 10 }}>Lỗi: {error.message || 'Không tạo được đề thi'}</div>}
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
        const statusColor = q.user_answer === null ? '#666' : q.is_correct ? '#43a047' : '#d32f2f';

        return (
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: 10,
                background: '#fff'
            }}>
                {/* Header cố định cho cả desktop và mobile */}
                <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-lg font-semibold">Xem lại bài làm</h1>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 24,
                    marginTop: 12
                }}>
                    {/* Sidebar lưới số thứ tự cho desktop */}
                    {!isMobile && (
                        <div style={{
                            width: 240,
                            background: 'transparent',
                            padding: '0 16px'
                        }}>
                            <QuestionGrid
                                questions={reviewQuestions}
                                currentIdx={currentIdx}
                                onQuestionClick={setCurrentIdx}
                                getQuestionStatus={(q) => {
                                    if (q.is_correct) {
                                        return {
                                            bg: '#43a047',
                                            color: '#fff',
                                            border: '1px solid #43a047',
                                            title: 'Đúng'
                                        };
                                    }
                                    if (q.user_answer === null) {
                                        return {
                                            bg: '#fff',
                                            color: '#666',
                                            border: '1px solid #ccc',
                                            title: 'Chưa trả lời'
                                        };
                                    }
                                    return {
                                        bg: '#d32f2f',
                                        color: '#fff',
                                        border: '1px solid #d32f2f',
                                        title: 'Sai'
                                    };
                                }}
                                showCritical={true}
                            />
                        </div>
                    )}

                    {/* Nội dung câu hỏi */}
                    <div style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    }}>
                        <div style={{
                            background: '#f5f7fa',
                            borderRadius: 12,
                            padding: '24px',
                            height: '60vh',
                            display: 'flex',
                            flexDirection: 'column',
                            border: q?.is_critical ? '2px solid #d32f2f' : '2px solid #1976d2',
                            overflowY: 'auto'
                        }}>
                            <div style={{
                                marginBottom: 10,
                                fontWeight: 600,
                                fontSize: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                flexWrap: 'nowrap',
                                lineHeight: 1.5,
                            }}>
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
                                    {q?.order || currentIdx + 1}
                                </span>
                                <span
                                    style={{
                                        color: q?.is_critical ? '#d32f2f' : undefined,
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-line',
                                        fontWeight: q?.is_critical ? 700 : 600,
                                        flex: 1,
                                    }}
                                >
                                    {q?.content}
                                </span>
                            </div>
                            {q?.image_link && (
                                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                                    <img
                                        src={q.image_link}
                                        alt="question"
                                        style={{
                                            maxWidth: 220,
                                            borderRadius: 8,
                                            cursor: 'pointer'
                                        }}
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
                                    return (
                                        <div key={i} style={{ marginBottom: i === q.options.length - 1 ? 0 : 8 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    background: isCorrect ? '#e8f5e9' : isWrong ? '#ffebee' : 'transparent',
                                                    borderRadius: 8,
                                                    padding: '12px 16px',
                                                    border: isCorrect ? '2px solid #43a047' : isWrong ? '2px solid #d32f2f' : '1px solid #ccc',
                                                    boxShadow: isCorrect || isWrong ? '0 2px 8px rgba(0,0,0,0.1)' : undefined,
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-line',
                                                    fontWeight: isCorrect || isWrong ? 600 : 500,
                                                }}
                                            >
                                                <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{opt}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {q?.hint && (
                                <div style={{
                                    marginTop: 16,
                                    padding: 16,
                                    background: '#e3f2fd',
                                    borderRadius: 8,
                                    border: '1px solid #90caf9'
                                }}>
                                    <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 8 }}>Mẹo:</div>
                                    <div style={{ color: '#333', whiteSpace: 'pre-line' }}>{q.hint}</div>
                                </div>
                            )}
                        </div>

                        {/* Unified action bar for both desktop and mobile */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                background: '#f5f7fa',
                                borderRadius: 12,
                                padding: isMobile ? '12px 8px' : '12px 24px',
                                marginTop: 8,
                                flexWrap: 'nowrap',
                                minHeight: 56
                            }}
                        >
                            {/* Status */}
                            <div style={{ fontSize: 16, fontWeight: 600, color: statusColor, whiteSpace: 'nowrap' }}>
                                {status}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'nowrap' }}>
                                {/* Show question list button only on mobile/modal */}
                                {isMobile && (
                                    <>
                                        <button
                                            onClick={() => setShowQuestionGrid(true)}
                                            style={{
                                                background: '#fff',
                                                border: '1px solid #1976d2',
                                                color: '#1976d2',
                                                borderRadius: 8,
                                                padding: '8px 20px',
                                                fontWeight: 600,
                                                fontSize: 15,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Danh sách câu hỏi
                                        </button>
                                        {showQuestionGrid && (
                                            <QuestionGrid
                                                questions={reviewQuestions}
                                                currentIdx={currentIdx}
                                                onQuestionClick={(idx) => {
                                                    setCurrentIdx(idx);
                                                    setShowQuestionGrid(false);
                                                }}
                                                getQuestionStatus={(q) => {
                                                    if (q.is_correct) {
                                                        return {
                                                            bg: '#43a047',
                                                            color: '#fff',
                                                            border: '1px solid #43a047',
                                                            title: 'Đúng'
                                                        };
                                                    }
                                                    if (q.user_answer === null) {
                                                        return {
                                                            bg: '#fff',
                                                            color: '#666',
                                                            border: '1px solid #ccc',
                                                            title: 'Chưa trả lời'
                                                        };
                                                    }
                                                    return {
                                                        bg: '#d32f2f',
                                                        color: '#fff',
                                                        border: '1px solid #d32f2f',
                                                        title: 'Sai'
                                                    };
                                                }}
                                                isMobile={true}
                                                showModal={true}
                                                onCloseModal={() => setShowQuestionGrid(false)}
                                            />
                                        )}
                                    </>
                                )}
                                <button
                                    onClick={handleExitReview}
                                    style={{
                                        background: '#1976d2',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '8px 24px',
                                        fontWeight: 600,
                                        fontSize: 15,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Thoát
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Modal */}
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
            <div style={{
                maxWidth: 700,
                margin: '40px auto 0 auto',
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 4px 24px #0001',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18
            }}>
                <h2 style={{ color: '#d32f2f', marginBottom: 8 }}>Lỗi</h2>
                <div style={{ fontSize: 16, color: '#333', textAlign: 'center' }}>
                    Không đủ câu hỏi cho hạng bằng {license}. Vui lòng thử lại sau hoặc chọn hạng bằng khác.
                </div>
                <button onClick={handleRetry} style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px',
                    fontWeight: 600,
                    fontSize: 17,
                    cursor: 'pointer'
                }}>
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <>
            {!showLicenseBar && !showResultModal && !reviewMode && (
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: 10,
                    background: '#fff'
                }}>
                    {/* Header cố định cho cả desktop và mobile */}
                    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
                        <div className="flex items-center justify-between p-3">
                            <div className="flex items-center space-x-2">
                                <h1 className="text-lg font-semibold">Thi thử lý thuyết</h1>
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 24,
                        marginTop: 12
                    }}>
                        {/* Sidebar lưới số thứ tự cho desktop */}
                        {!isMobile && (
                            <div style={{
                                width: 240,
                                background: 'transparent',
                                padding: '0 16px'
                            }}>
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

                        {/* Nội dung câu hỏi */}
                        <div style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16
                        }}>
                            <div style={{
                                background: '#f5f7fa',
                                borderRadius: 12,
                                padding: '24px',
                                height: '60vh',
                                display: 'flex',
                                flexDirection: 'column',
                                border: q?.is_critical ? '2px solid #d32f2f' : '2px solid #1976d2',
                                overflowY: 'auto'
                            }}>
                                <div style={{
                                    marginBottom: 10,
                                    fontWeight: 600,
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    flexWrap: 'nowrap',
                                    lineHeight: 1.5,
                                }}>
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
                                        {q?.order || currentIdx + 1}
                                    </span>
                                    <span
                                        style={{
                                            color: q?.is_critical ? '#d32f2f' : undefined,
                                            wordBreak: 'break-word',
                                            whiteSpace: 'pre-line',
                                            fontWeight: q?.is_critical ? 700 : 600,
                                            flex: 1,
                                        }}
                                    >
                                        {q?.content}
                                    </span>
                                    <button
                                        onClick={() => handleToggleFlag(q.question_id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: flagged[q.question_id] ? '#ffd600' : '#666',
                                            fontSize: 24,
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title={flagged[q.question_id] ? 'Bỏ đánh dấu' : 'Đánh dấu làm sau'}
                                    >
                                        {flagged[q.question_id] ? '★' : '☆'}
                                    </button>
                                </div>
                                {q?.image_link && (
                                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                                        <img src={q.image_link} alt="question" style={{ maxWidth: 220, borderRadius: 8 }} />
                                    </div>
                                )}
                                <div>
                                    {q?.options.map((opt, i) => {
                                        const val = i + 1;
                                        const isSelected = answers[q.question_id] === val;
                                        return (
                                            <div key={i} style={{ marginBottom: i === q.options.length - 1 ? 0 : 8 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        background: isSelected ? '#e3f2fd' : 'transparent',
                                                        borderRadius: 8,
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
                                                        boxShadow: isSelected ? '0 2px 8px #1976d233' : undefined,
                                                        transition: 'background 0.2s, border 0.2s',
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-line',
                                                        fontWeight: isSelected ? 600 : 500,
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                                                    onMouseLeave={e => e.currentTarget.style.background = isSelected ? '#e3f2fd' : 'transparent'}
                                                    onClick={() => handleSelect(q.question_id, val)}
                                                >
                                                    <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{opt}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Unified action bar for both desktop and mobile */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    background: '#f5f7fa',
                                    borderRadius: 12,
                                    padding: isMobile ? '12px 8px' : '12px 24px',
                                    marginTop: 8,
                                    flexWrap: 'nowrap',
                                    minHeight: 56
                                }}
                            >
                                {/* Time */}
                                <div style={{ fontSize: 16, fontWeight: 600, color: '#1976d2', whiteSpace: 'nowrap' }}>
                                    Thời gian: {formatTime(timeLeft)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'nowrap' }}>
                                    {/* Show question list button only on mobile/modal */}
                                    {isMobile && (
                                        <>
                                            <button
                                                onClick={() => setShowQuestionGrid(true)}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #1976d2',
                                                    color: '#1976d2',
                                                    borderRadius: 8,
                                                    padding: '8px 20px',
                                                    fontWeight: 600,
                                                    fontSize: 15,
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Danh sách câu hỏi
                                            </button>
                                            {showQuestionGrid && (
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
                                        </>
                                    )}
                                    <button
                                        onClick={handleRetry}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #666',
                                            color: '#666',
                                            borderRadius: 8,
                                            padding: '8px 24px',
                                            fontWeight: 600,
                                            fontSize: 15,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Thoát
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        style={{
                                            background: isSubmitting ? '#ccc' : '#1976d2',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            padding: '8px 24px',
                                            fontWeight: 600,
                                            fontSize: 15,
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Hướng dẫn phím tắt */}
            <div style={{ marginTop: 12, color: '#888', fontStyle: 'italic', textAlign: 'center', fontSize: 12 }}>
                Mẹo: Dùng phím ← → để chuyển câu, dùng phím 1 2 3 4 để chọn đáp án nhanh.
            </div>
            <ToastContainer />
        </>
    );
}

export default MockTestPage;