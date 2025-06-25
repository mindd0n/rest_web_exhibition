import React, { useState, useEffect } from 'react';

<<<<<<< HEAD
=======
// S3 기본 URL
const S3_BASE_URL = 'https://rest-exhibition.s3.ap-northeast-2.amazonaws.com/deploy_media';

>>>>>>> main
const IntroScreen = ({ onComplete }) => {
    const [videoSrc, setVideoSrc] = useState('');
    const [posterSrc, setPosterSrc] = useState('');

    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
<<<<<<< HEAD
        setVideoSrc(isMobile ? '/assets/deploy_media/intro_m.mp4' : '/assets/deploy_media/intro_pc.MP4');
        setPosterSrc(isMobile ? '/assets/deploy_media/jpg_intro_m.jpg' : '/assets/deploy_media/jpg_intro_pc.jpg');
=======
        setVideoSrc(isMobile ? `${S3_BASE_URL}/intro_m.mp4` : `${S3_BASE_URL}/intro_pc.MP4`);
        setPosterSrc(isMobile ? `${S3_BASE_URL}/jpg_intro_m.jpg` : `${S3_BASE_URL}/jpg_intro_pc.jpg`);
>>>>>>> main
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
<<<<<<< HEAD
                    backgroundImage: "url('/assets/btn_skip.png')",
=======
                    backgroundImage: `url('${S3_BASE_URL}/btn_skip.png')`,
>>>>>>> main
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                }}
            />
        </div>
    );
};

export default IntroScreen; 