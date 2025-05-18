import React, { useState, useEffect, useRef } from 'react';

const BGMControl = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // 오디오 초기화
    audioRef.current = new Audio('/audio/bgm.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    // 자동 재생 시도
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.log("자동 재생이 차단되었습니다:", error);
          setIsPlaying(false);
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleBGM = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.log("재생 실패:", error);
              setIsPlaying(false);
            });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
        cursor: 'pointer',
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
        ':hover': {
          transform: 'scale(1.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        }
      }}
      onClick={toggleBGM}
    >
      <img 
        src={isPlaying ? '/images/buttons/music-off.png' : '/images/buttons/music-on.png'} 
        alt={isPlaying ? '음악 끄기' : '음악 켜기'}
        style={{ 
          width: '60px', 
          height: '60px',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
        }}
      />
    </div>
  );
};

export default BGMControl; 