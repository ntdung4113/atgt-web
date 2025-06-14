import React, { memo } from 'react';

const ResultModal = memo(({ open, result, onRetry, onReview }) => {
    if (!open) return null;
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    color: result.status === 'pass' ? '#4caf50' : '#d32f2f',
                    fontSize: '24px',
                    marginBottom: '16px'
                }}>
                    {result.status === 'pass' ? 'ĐỖ' : 'TRƯỢT'}
                </h2>
                <div style={{
                    fontSize: '16px',
                    color: '#333',
                    marginBottom: '24px',
                    lineHeight: '1.6'
                }}>
                    <div style={{ marginBottom: '8px' }}>
                        Số câu Đúng: <b>{result.correct}</b> / {result.total}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        Số câu Sai: <b>{result.wrong}</b>
                    </div>
                    {result.fail_reason && (
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            background: '#fff3f3',
                            borderRadius: '8px',
                            color: '#d32f2f',
                            fontSize: '15px'
                        }}>
                            Lý do trượt: {result.fail_reason}
                        </div>
                    )}
                </div>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onReview}
                        style={{
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 24px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Xem lại
                    </button>
                    <button
                        onClick={onRetry}
                        style={{
                            background: '#fff',
                            color: '#1976d2',
                            border: '1px solid #1976d2',
                            borderRadius: '8px',
                            padding: '10px 24px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Làm lại
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ResultModal;