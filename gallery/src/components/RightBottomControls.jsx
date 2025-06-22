import React, { useState, useEffect, useRef } from 'react';

const RightBottomControls = () => {
    const [isMusicOn, setIsMusicOn] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const audioRef = useRef(null);
    const outButtonRef = useRef(null);

    // 배경음악 초기화 (임시 비활성화 - way back home.mp3 파일이 없음)
    useEffect(() => {
        // TODO: 배경음악 파일이 추가되면 아래 주석을 해제하세요
        /*
        audioRef.current = new Audio('/deploy_videos/way back home.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        
        // 인트로 영상이 끝나고 전시 방에 입장하면 자동 재생
        const timer = setTimeout(() => {
            if (audioRef.current && isMusicOn) {
                audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            }
        }, 3000); // 3초 후 자동 재생

        return () => {
            clearTimeout(timer);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
        */
    }, []);

    // 음악 토글 함수
    const toggleMusic = () => {
        // TODO: 배경음악 파일이 추가되면 아래 주석을 해제하세요
        /*
        if (audioRef.current) {
            if (isMusicOn) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            }
        }
        */
        setIsMusicOn(!isMusicOn);
        console.log('Music toggled:', !isMusicOn ? 'ON' : 'OFF');
    };

    // 지도 팝업 토글
    const toggleMap = () => {
        setShowMap(!showMap);
    };

    // 나가기 버튼 클릭
    const handleExit = () => {
        window.open('/exit-page/index.html', '_blank');
    };

    const normalButtonStyle = {
        width: '80px',
        height: '80px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        marginBottom: '20px',
        transition: 'transform 0.2s ease',
    };
    
    const outButtonStyle = {
        ...normalButtonStyle,
        width: '250px',
        height: '250px',
        marginBottom: '0px',
        position: 'relative',
        top: '100px',
        pointerEvents: 'none',
    };

    const containerStyle = {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1000,
    };

    const mapPopupStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        cursor: 'pointer',
    };

    const mapImageStyle = {
        maxWidth: '90vw',
        maxHeight: '90vh',
        objectFit: 'contain',
        cursor: 'default',
    };

    return (
        <>
            {/* 우측 하단 버튼 컨테이너 */}
            <div style={containerStyle}>
                {/* 3. Out 버튼 */}
                <button
                    ref={outButtonRef}
                    style={outButtonStyle}
                >
                    <img
                        src="/images/buttons/icon_out.png"
                        alt="Exit"
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain', 
                            padding: '0px',
                            pointerEvents: 'auto',
                        }}
                        onClick={handleExit}
                        onMouseEnter={(e) => {
                            if (outButtonRef.current) outButtonRef.current.style.transform = 'scale(1.1)';
                            e.currentTarget.src = '/images/buttons/icon_out_hover.png';
                        }}
                        onMouseLeave={(e) => {
                            if (outButtonRef.current) outButtonRef.current.style.transform = 'scale(1)';
                            e.currentTarget.src = '/images/buttons/icon_out.png';
                        }}
                    />
                </button>

                {/* 2. Map 버튼 */}
                <button
                    style={normalButtonStyle}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    onClick={toggleMap}
                >
                    <img
                        src="/images/buttons/icon_map.png"
                        alt="Map"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </button>

                {/* 1. Music 버튼 (토글) */}
                <button
                    style={normalButtonStyle}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    onClick={toggleMusic}
                >
                    <img
                        src={isMusicOn ? '/images/buttons/music-on.png' : '/images/buttons/music-off.png'}
                        alt="Music Toggle"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </button>
            </div>

            {/* 지도 팝업 */}
            {showMap && (
                <div style={mapPopupStyle} onClick={toggleMap}>
                    <img
                        src="/images/buttons/icon_map_inner.png"
                        alt="Map Inner"
                        style={mapImageStyle}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default RightBottomControls; 