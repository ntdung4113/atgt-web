import React, { memo } from 'react';

const ImageModal = memo(({ open, imageUrl, onClose }) => {
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
});

export default ImageModal;