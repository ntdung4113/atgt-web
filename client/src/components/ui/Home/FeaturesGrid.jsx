import React from 'react';
import FeatureCard from './FeatureCard';

function FeaturesGrid() {
    const features = [
        {
            title: "Văn bản pháp luật",
            description: "Tra cứu luật, nghị định và thông tư giao thông",
            link: "/laws",
            linkText: "Bắt đầu"
        },
        {
            title: "Mức phạt vi phạm",
            description: "Tìm mức phạt cho các lỗi vi phạm giao thông",
            link: "/violations",
            linkText: "Bắt đầu"
        },
        {
            title: "Biển báo giao thông",
            description: "Hiểu ý nghĩa các loại biển báo và vạch kẻ đường",
            link: "/signs",
            linkText: "Bắt đầu"
        },
        {
            title: "Ôn tập lý thuyết sát hạch GPLX",
            description: "Làm quen bộ câu hỏi sát hạch lái xe mới nhất",
            link: "/practice",
            linkText: "Bắt đầu"
        },
        {
            title: "Thi thử lý thuyết sát hạch GPLX",
            description: "Thi thử đề thi sát hạch lái xe các hạng",
            link: "/test",
            linkText: "Bắt đầu"
        },
        {
            title: "Tình huống giao thông",
            description: "Xem những tình huống giao thông thực tế",
            link: "/situations",
            linkText: "Bắt đầu"
        }
    ];

    return (
        <div
            style={{
                display: 'grid',
                gap: '1.5rem',
                padding: '0 2rem',
                maxWidth: 1000,
                margin: '0 auto',
                width: '100%',
                gridTemplateColumns: 'repeat(3, 1fr)'
            }}
            className="features-grid-responsive"
        >
            {features.map((feature, index) => (
                <FeatureCard
                    key={index}
                    title={feature.title}
                    description={feature.description}
                    link={feature.link}
                    linkText={feature.linkText}
                />
            ))}
        </div>
    );
}

export default FeaturesGrid; 