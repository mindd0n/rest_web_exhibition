import React, { useState, useEffect, useRef } from 'react';
import './RightBottomControls.css';

<<<<<<< HEAD
const RightBottomControls = () => {
    const [isMusicOn, setIsMusicOn] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const imageDataRef = useRef({});
=======
// S3 기본 URL
const S3_BASE_URL = 'https://rest-exhibition.s3.ap-northeast-2.amazonaws.com/deploy_media';

const RightBottomControls = () => {
    const [isMusicOn, setIsMusicOn] = useState(true);
    const [showMap, setShowMap] = useState(false);
>>>>>>> main
    const audioRef = useRef(null);

    useEffect(() => {
        const imageInfos = {
<<<<<<< HEAD
            'out_button': '/images/buttons/icon_out.png',
            'map_button': '/images/buttons/icon_map.png'
        };

        Object.entries(imageInfos).forEach(([key, src]) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = src;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                imageDataRef.current[key] = ctx.getImageData(0, 0, img.width, img.height).data;
            };
        });

        audioRef.current = new Audio('/deploy_videos/x.waybackhome.wav');
=======
            'out_button': `${S3_BASE_URL}/icon_out.png`,
            'map_button': `${S3_BASE_URL}/icon_map.png`
        };

        // 이미지 프리로드
        Object.values(imageInfos).forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    useEffect(() => {
        // BGM 오디오 파일 로드
        audioRef.current = new Audio(`${S3_BASE_URL}/bgm.mp3`);
>>>>>>> main
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        if (isMusicOn) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
<<<<<<< HEAD
    }, [isMusicOn]);

    const isPixelTransparent = (x, y, buttonId, element) => {
        const imageData = imageDataRef.current[buttonId];
        if (!imageData || !element) return true;

        const rect = element.getBoundingClientRect();
        const realX = Math.round((x - rect.left) * (element.naturalWidth / rect.width));
        const realY = Math.round((y - rect.top) * (element.naturalHeight / rect.height));

        const alphaIndex = (realY * element.naturalWidth + realX) * 4 + 3;
        return imageData[alphaIndex] === 0;
    };
=======
    }, []);
>>>>>>> main

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isMusicOn) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
<<<<<<< HEAD
        }
        setIsMusicOn(!isMusicOn);
=======
            setIsMusicOn(!isMusicOn);
        }
>>>>>>> main
    };

    const toggleMap = (e) => {
        if (e && isPixelTransparent(e.clientX, e.clientY, 'map_button', e.target)) return;
        setShowMap(!showMap);
    };

<<<<<<< HEAD
    const handleExit = (e) => {
        if (isPixelTransparent(e.clientX, e.clientY, 'out_button', e.target)) return;
        window.open('/exit-page/index.html', '_blank');
=======
    const handleExit = () => {
        if (window.confirm('정말로 나가시겠습니까?')) {
            window.close();
        }
    };

    const isPixelTransparent = (x, y, buttonType, target) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const rect = target.getBoundingClientRect();
            const pixelX = Math.floor((x - rect.left) * (img.width / rect.width));
            const pixelY = Math.floor((y - rect.top) * (img.height / rect.height));
            
            const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
            return pixelData[3] < 128; // 알파값이 128 미만이면 투명
        };
        
        img.src = target.src;
        return false;
>>>>>>> main
    };

    return (
        <>
            <div className="controls-container">
                <button className="base-button out-button">
                    <img
                        className="out-button-img"
<<<<<<< HEAD
                        src="/images/buttons/icon_out.png"
                        alt="Exit"
                        onClick={handleExit}
                        onMouseEnter={(e) => e.currentTarget.src = '/images/buttons/icon_out_hover.png'}
                        onMouseLeave={(e) => e.currentTarget.src = '/images/buttons/icon_out.png'}
=======
                        src={`${S3_BASE_URL}/icon_out.png`}
                        alt="Exit"
                        onClick={handleExit}
                        onMouseEnter={(e) => e.currentTarget.src = `${S3_BASE_URL}/icon_out_hover.png`}
                        onMouseLeave={(e) => e.currentTarget.src = `${S3_BASE_URL}/icon_out.png`}
>>>>>>> main
                    />
                </button>

                <button className="base-button map-button">
                    <img
                        id="map_button"
                        className="map-button-img"
<<<<<<< HEAD
                        src="/images/buttons/icon_map.png"
=======
                        src={`${S3_BASE_URL}/icon_map.png`}
>>>>>>> main
                        alt="Map"
                        onClick={toggleMap}
                    />
                </button>

                <button className="base-button music-button" onClick={toggleMusic}>
                    <img
                        className="music-button-img"
<<<<<<< HEAD
                        src={isMusicOn ? '/images/buttons/music-on.png' : '/images/buttons/music-off.png'}
=======
                        src={isMusicOn ? `${S3_BASE_URL}/music-on.png` : `${S3_BASE_URL}/music-off.png`}
>>>>>>> main
                        alt="Music Toggle"
                    />
                </button>
            </div>

            {showMap && (
                <div className="map-popup-overlay" onClick={() => setShowMap(false)}>
                    <img
                        className="map-popup-image"
<<<<<<< HEAD
                        src="/images/buttons/icon_map_inner.png"
=======
                        src={`${S3_BASE_URL}/icon_map_inner.png`}
>>>>>>> main
                        alt="Map Inner"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default RightBottomControls; 