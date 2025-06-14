import React from 'react';
import { useNavigate } from 'react-router-dom';

function FeatureCard({ title, description, link, linkText }) {
    const navigate = useNavigate();
    return (
        <div style={{
            background: 'white',
            padding: '0.75rem',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
            maxWidth: '280px',
            margin: '0 auto'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate(link)}
        >
            <h2 style={{
                color: '#1a73e8',
                marginBottom: '0.5rem',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                fontWeight: 600
            }}>{title}</h2>
            <p style={{
                color: '#5f6368',
                marginBottom: '0.75rem',
                fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                lineHeight: 1.4,
                flex: 1
            }}>{description}</p>
            <div style={{
                display: 'inline-block',
                padding: '0.35rem 0.75rem',
                background: '#1a73e8',
                color: 'white',
                borderRadius: '4px',
                fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                fontWeight: 500,
                textAlign: 'center',
                transition: 'background-color 0.2s'
            }}
                onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
            >
                {linkText}
            </div>
        </div>
    );
}

export default FeatureCard; 