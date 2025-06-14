import React, { memo } from 'react';

const QuestionGrid = memo(({
    questions,
    currentIdx,
    onQuestionClick,
    getQuestionStatus,
    showCritical = false,
    isMobile = false,
    showModal = false,
    onCloseModal = () => { },
    onToggleFlag = null,
    flagged = {},
}) => {
    const renderQuestionButton = (q, idx) => {
        const status = getQuestionStatus(q, idx);
        const isCurrent = idx === currentIdx;
        const isFlagged = flagged[q.question_id];

        return (
            <button
                key={q.question_id}
                onClick={() => onQuestionClick(idx)}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: status.bg,
                    color: status.color,
                    border: isFlagged ? '2px solid #ffd600' : status.border,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    position: 'relative',
                    outline: isCurrent ? '2px solid #1976d2' : 'none',
                    transition: 'all 0.1s',
                }}
                title={isFlagged ? 'Đánh dấu làm sau' : status.title}
            >
                {q.order || idx + 1}
                {showCritical && q.is_critical && (
                    <span style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        color: '#d32f2f',
                        fontSize: 12,
                        fontWeight: 'bold'
                    }}>!</span>
                )}
            </button>
        );
    };

    const renderGrid = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8,
            padding: '8px 0'
        }}>
            {questions.map((q, idx) => renderQuestionButton(q, idx))}
        </div>
    );

    if (isMobile && showModal) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'block'
            }}
                onClick={onCloseModal}
            >
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '85%',
                    maxWidth: 320,
                    background: '#fff',
                    padding: '60px 16px 16px 16px',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                    transform: 'translateX(0)',
                    transition: 'transform 0.3s ease-in-out',
                    overflowY: 'auto'
                }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16
                    }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#1976d2' }}>
                            Danh sách câu hỏi
                        </div>
                        <button
                            onClick={onCloseModal}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: 24,
                                cursor: 'pointer',
                                color: '#666',
                                padding: '4px 8px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                    {renderGrid()}
                </div>
            </div>
        );
    }

    if (!isMobile) {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))',
                gap: 8,
                marginBottom: 20,
                maxWidth: 400,
                marginLeft: 'auto',
                marginRight: 'auto',
            }}>
                {renderGrid()}
            </div>
        );
    }

    return null;
});

export default QuestionGrid;