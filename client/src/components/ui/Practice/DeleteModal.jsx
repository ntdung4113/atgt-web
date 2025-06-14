import React from 'react';

const DeleteModal = ({ onConfirm, onCancel }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.25)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            minWidth: 280,
            boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
            textAlign: 'center'
        }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>
                Bạn có chắc chắn muốn xoá toàn bộ tiến trình ôn tập?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <button
                    onClick={onConfirm}
                    style={{
                        background: '#d32f2f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 20px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Xác nhận
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        background: '#eee',
                        color: '#333',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 20px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Huỷ
                </button>
            </div>
        </div>
    </div>
);

export default DeleteModal;