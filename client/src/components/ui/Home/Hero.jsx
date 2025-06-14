import React from 'react';

function Hero() {
    return (
        <div style={{
            textAlign: 'center',
            padding: '1rem 1rem',
            background: '#e3f2fd',
            color: '#333',
            marginBottom: '0.5rem',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
                zIndex: 1
            }} />
            <h1 style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                marginBottom: '1rem',
                fontWeight: 700,
                color: '#1a1a1a',
                zIndex: 2
            }}>An toàn giao thông</h1>
            <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: '#333',
                margin: 0,
                maxWidth: '600px',
                lineHeight: 1.6,
                zIndex: 2
            }}>Website phổ biến luật ATGT và luyện thi lý thuyết</p>
        </div>
    );
}

export default Hero; 