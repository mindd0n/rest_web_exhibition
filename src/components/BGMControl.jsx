import React, { useState, useEffect, useRef } from 'react';

// S3 기본 URL
const S3_BASE_URL = 'https://rest-exhibition.s3.ap-northeast-2.amazonaws.com/deploy_media';

const BGMControl = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(`${S3_BASE_URL}/bgm.mp3`);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    // 자동 재생 시도는 제거 (브라우저 정책)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 버튼을 누르면 항상 음악이 꺼지고, 아이콘이 반대로 바뀌게
  const handleClick = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 40,
        bottom: 40,
        zIndex: 9999,
        width: 80,
        height: 80,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
      onClick={handleClick}
    >
      <img 
        src={isPlaying ? `${S3_BASE_URL}/music-off.png` : `${S3_BASE_URL}/music-on.png`}
        alt="BGM"
        style={{ width: 60, height: 60 }}
      />
    </div>
  );
};

export default BGMControl; 