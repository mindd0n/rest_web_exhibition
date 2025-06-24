import React, { useState, useEffect } from 'react';

const IntroScreen = ({ onComplete }) => {
    const [videoSrc, setVideoSrc] = useState('');
    const [posterSrc, setPosterSrc] = useState('');

    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        setVideoSrc(isMobile ? '/assets/intro_m.mp4' : '/deploy_videos/intro_pc.MP4');
        setPosterSrc(isMobile ? '/assets/jpg_intro_m.jpg' : '/assets/jpg_intro_pc.jpg');
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#000' }}>
            <video
                key={videoSrc}
                autoPlay
                muted
                playsInline
                onEnded={onComplete}
                poster={posterSrc}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div
                onClick={onComplete}
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    right: '5%',
                    cursor: 'pointer',
                    width: '100px',
                    height: '50px',
                    backgroundImage: "url('/assets/btn_skip.png')",
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                }}
            />
        </div>
    );
};

export default IntroScreen; 