import React from 'react';

const PracticeQuestionGrid = ({ questions, currentQuestionIndex, progress, onSelect }) => {
    return (
        <div
            style={{
                minWidth: 260,
                maxWidth: 320,
                padding: 12,
                background: '#f8f9fa',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                marginRight: 24,
                marginBottom: 16,
                overflowY: 'auto',
                maxHeight: 420,
            }}
        >
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
            }}>
                {questions.map((q, idx) => {
                    let bg = idx === currentQuestionIndex ? '#1976d2' : '#e0e0e0';
                    let color = idx === currentQuestionIndex ? '#fff' : '#333';
                    if (progress[q.questionNumber]) {
                        if (progress[q.questionNumber].is_correct === true) {
                            bg = '#d0f5e8';
                            color = '#1976d2';
                        } else if (progress[q.questionNumber].is_correct === false) {
                            bg = '#ffd6d6';
                            color = '#d32f2f';
                        } else {
                            bg = '#f0f0f0';
                            color = '#333';
                        }
                    }
                    return (
                        <button
                            key={q.questionNumber}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: bg,
                                color: color,
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: idx === currentQuestionIndex ? '0 2px 6px #1976d255' : undefined,
                                outline: 'none',
                                position: 'relative',
                            }}
                            onClick={() => onSelect(idx)}
                            title={q.content}
                        >
                            {q.order || idx + 1}
                            {q.is_critical && (
                                <span style={{ color: 'red', position: 'absolute', top: 2, right: 6, fontWeight: 'bold' }}>*</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PracticeQuestionGrid;