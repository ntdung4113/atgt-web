import React from 'react';
import Hero from '../../components/ui/Home/Hero';
import FeaturesGrid from '../../components/ui/Home/FeaturesGrid';
import tuyentruyen from '../../assets/images/tuyentruyen.jpg';

const Home = () => {
    return (
        <main className="home-page">
            <Hero />
            <img src={tuyentruyen} alt="Tuyên truyền an toàn giao thông" style={{
                width: '100%',
                maxWidth: '900px',
                height: 'auto',
                display: 'block',
                margin: '0 auto 2rem auto',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }} />
            <FeaturesGrid />
        </main>
    );
};

export default Home; 