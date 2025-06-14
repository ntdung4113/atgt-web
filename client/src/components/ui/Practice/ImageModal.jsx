import React from 'react';

const ImageModal = ({ src, onClose }) => (
    <div
        onClick={onClose}
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
        }}
    >
        <img
            src={src}
            alt="zoom"
            style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                borderRadius: 12,
                boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
                background: '#fff',
                cursor: 'zoom-out'
            }}
            onClick={e => e.stopPropagation()}
        />
        <button
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 32,
                right: 48,
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontSize: 22,
                fontWeight: 700,
                color: '#d32f2f',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
        >
            ×
        </button>
    </div>
);

export default ImageModal;