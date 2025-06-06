import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 64px)'
        }}>
            {/* Hero section */}
            <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                color: '#333',
                marginBottom: '1.5rem',
                height: '40vh',
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
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: 1
                }} />
                <h1 style={{
                    fontSize: '3.5rem',
                    marginBottom: '1rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    zIndex: 2
                }}>An toàn giao thông</h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#333',
                    margin: 0,
                    maxWidth: '600px',
                    lineHeight: 1.6,
                    zIndex: 2
                }}>Website phổ biến luật ATGT và luyện thi lý thuyết</p>
            </div>

            {/* Features grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                padding: '0 2rem',
                maxWidth: 1000,
                margin: '0 auto',
                width: '100%'
            }}>
                <FeatureCard
                    title="Văn bản pháp luật"
                    description="Tra cứu nhanh chóng các luật, nghị định, thông tư về giao thông đường bộ"
                    link="/laws"
                    linkText="Xem ngay"
                />
                <FeatureCard
                    title="Mức phạt vi phạm"
                    description="Tra cứu mức phạt cho các lỗi vi phạm giao thông đường bộ"
                    link="/violations"
                    linkText="Xem ngay"
                />
                <FeatureCard
                    title="Biển báo giao thông"
                    description="Tìm hiểu ý nghĩa và cách nhận biết các loại biển báo giao thông, vạch kẻ đường"
                    link="/signs"
                    linkText="Xem ngay"
                />
                <FeatureCard
                    title="Ôn tập lý thuyết sát hạch GPLX"
                    description="Ôn tập bộ câu hỏi dùng cho sát hạch lái xe cơ giới đường bộ mới nhất của Cục Cảnh sát giao thông (áp dụng từ ngày 01/06/2025) theo hạng bằng, chủ đề "
                    link="/practice"
                    linkText="Bắt đầu"
                />
                <FeatureCard
                    title="Thi thử lý thuyết sát hạch GPLX"
                    description="Thi thử đề thi sát hạch cấp Giấy phép lái xe các hạng"
                    link="/test"
                    linkText="Bắt đầu"
                />
                <FeatureCard
                    title="Tình huống giao thông"
                    description="Xem những tình huống giao thông thực tế"
                    link="/posts"
                    linkText="Khám phá"
                />
            </div>
        </div>
    );
}

function FeatureCard({ title, description, link, linkText }) {
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
            onClick={() => window.location.href = link}
        >
            <h2 style={{
                color: '#1a73e8',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600
            }}>{title}</h2>
            <p style={{
                color: '#5f6368',
                marginBottom: '0.75rem',
                fontSize: '0.8rem',
                lineHeight: 1.4,
                flex: 1
            }}>{description}</p>
            <div style={{
                display: 'inline-block',
                padding: '0.35rem 0.75rem',
                background: '#1a73e8',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.8rem',
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

export default Home; 