import React, { memo } from 'react';

const PracticeQuestion = memo(({ question, questionIndex, answers, checkResult, onAnswer, onZoomImage }) => {
    return (
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
            border: question?.is_critical ? '2px solid #d32f2f' : '2px solid #1976d2',
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
                    {question?.order || questionIndex + 1}
                </span>
                <span
                    style={{
                        color: question?.is_critical ? '#d32f2f' : undefined,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line',
                        fontWeight: question?.is_critical ? 700 : 600,
                        flex: 1,
                    }}
                >
                    {question?.content}
                </span>
            </div>
            {question?.image_link && (
                <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                    <img
                        src={question.image_link}
                        alt="question"
                        style={{ maxWidth: 220, borderRadius: 8, cursor: 'zoom-in' }}
                        onClick={() => onZoomImage(question.image_link)}
                    />
                </div>
            )}
            <div>
                {question?.options.map((opt, i) => {
                    const answerValue = i + 1;
                    const isSelected = answers[question.questionNumber] === answerValue;
                    const isCorrect = checkResult && checkResult.correct_answer === answerValue && checkResult.isCorrect;
                    const isWrong = checkResult && isSelected && !checkResult.isCorrect;
                    let answerBg = isSelected ? '#e3f2fd' : '';
                    if (checkResult !== null) {
                        if (isCorrect) answerBg = '#d0f5e8';
                        else if (isWrong) answerBg = '#ffd6d6';
                    }
                    return (
                        <div key={i} style={{ marginBottom: i === question.options.length - 1 ? 0 : 8 }}>
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
                                onClick={() => onAnswer(question.questionNumber, answerValue)}
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
                    {question?.hint && (
                        <div style={{ marginTop: 8, color: '#888', fontStyle: 'italic' }}>
                            Gợi ý: {question.hint}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default PracticeQuestion;