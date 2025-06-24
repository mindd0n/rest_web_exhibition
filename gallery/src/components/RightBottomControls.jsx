import React, { useState, useEffect, useRef } from 'react';
import './RightBottomControls.css';

const RightBottomControls = () => {
    const [isMusicOn, setIsMusicOn] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const imageDataRef = useRef({});
    const audioRef = useRef(null);

    useEffect(() => {
        const imageInfos = {
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
    }, []);

    const isPixelTransparent = (x, y, buttonId, element) => {
        const imageData = imageDataRef.current[buttonId];
        if (!imageData || !element) return true;

        const rect = element.getBoundingClientRect();
        const realX = Math.round((x - rect.left) * (element.naturalWidth / rect.width));
        const realY = Math.round((y - rect.top) * (element.naturalHeight / rect.height));

        const alphaIndex = (realY * element.naturalWidth + realX) * 4 + 3;
        return imageData[alphaIndex] === 0;
    };

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isMusicOn) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
        setIsMusicOn(!isMusicOn);
    };

    const toggleMap = (e) => {
        if (e && isPixelTransparent(e.clientX, e.clientY, 'map_button', e.target)) return;
        setShowMap(!showMap);
    };

    const handleExit = (e) => {
        if (isPixelTransparent(e.clientX, e.clientY, 'out_button', e.target)) return;
        window.open('/exit-page/index.html', '_blank');
    };

    return (
        <>
            <div className="controls-container">
                <button className="base-button out-button">
                    <img
                        className="out-button-img"
                        src="/images/buttons/icon_out.png"
                        alt="Exit"
                        onClick={handleExit}
                        onMouseEnter={(e) => e.currentTarget.src = '/images/buttons/icon_out_hover.png'}
                        onMouseLeave={(e) => e.currentTarget.src = '/images/buttons/icon_out.png'}
                    />
                </button>

                <button className="base-button map-button">
                    <img
                        id="map_button"
                        className="map-button-img"
                        src="/images/buttons/icon_map.png"
                        alt="Map"
                        onClick={toggleMap}
                    />
                </button>

                <button className="base-button music-button" onClick={toggleMusic}>
                    <img
                        className="music-button-img"
                        src={isMusicOn ? '/images/buttons/music-on.png' : '/images/buttons/music-off.png'}
                        alt="Music Toggle"
                    />
                </button>
            </div>

            {showMap && (
                <div className="map-popup-overlay" onClick={() => setShowMap(false)}>
                    <img
                        className="map-popup-image"
                        src="/images/buttons/icon_map_inner.png"
                        alt="Map Inner"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default RightBottomControls; 