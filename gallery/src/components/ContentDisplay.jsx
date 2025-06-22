import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import InteractiveGoButton from './InteractiveGoButton.jsx';

// 비디오 팝업 컴포넌트
const VideoPopup = ({ videoSrc, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '80vw',
          height: '80vh',
          maxWidth: '1200px',
          maxHeight: '800px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-15px',
            right: '-15px',
            background: 'white',
            color: 'black',
            border: '2px solid #333',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 2001,
          }}
        >
          X
        </button>
        <video
          src={videoSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          controls
          autoPlay
          loop
          playsInline
        />
      </div>
    </div>
  );
};

const ContentMap = {
  // Pavilion
  'btn_p_pavilion': { type: 'iframe', src: '/content/btn_p_pavilion/G.영화추천리스트/index.html' },
  'btn_p_note': { type: 'iframe', src: '/content/btn_p_note/F.cocoon-diary/dist/index.html' },
  'btn_p_tree': { type: 'image', src: '/content/btn_p_tree/E.JPG' },
  'btn_p_go': { type: 'custom' },

  // Home
  'btn_h_dog': { type: 'iframe', src: '/content/btn_h_dog/S.hoya-story/dist/index.html' },
  'btn_h_star': { type: 'iframe', src: '/content/btn_h_star/T.cocooon-scroll-gallery/dist/index.html' },
  'btn_h_ribbon': { type: 'video', src: '/deploy_videos/R.mp4' },
  'btn_h_home': { type: 'iframe', src: '/content/btn_h_home/j/index.html' },

  // Bus-stop
  'btn_b_bus': { type: 'video', src: '/deploy_videos/i.mp4' },
  'btn_b_busstop': { type: 'video', src: '/deploy_videos/H.mp4' },
  'btn_b_home': { type: 'iframe', src: '/content/btn_b_home/j/index.html' },
  
  // Ceiling
  'btn_c_heart': { type: 'image', src: '/content/btn_c_heart/U.PNG' },
  'btn_c_lamp': { type: 'video', src: '/deploy_videos/O.mp4' },
  
  // Floor
  'btn_f_rug': { type: 'iframe', src: '/content/btn_f_rug/참여형 페이지/index.html' },
  'btn_f_phone': { type: 'iframe', src: '/content/btn_f_phone/V.디지털디톡스/index.html' },

  // Walk
  'btn_w_walk': { type: 'video', src: '/deploy_videos/L.mp4' },
  'btn_w_bridge': { type: 'video', src: '/deploy_videos/M.mp4' },
  'btn_w_sign': { type: 'video', src: '/deploy_videos/N.mp4' },
  'btn_w_sun': { type: 'video', src: '/deploy_videos/P.mp4' },
};

const GenericContent = ({ type, src, onClose }) => {
  const contentStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
  };

  switch (type) {
    case 'video':
      return (
        <video src={src} style={contentStyle} controls autoPlay loop playsInline />
      );
    case 'iframe':
      return (
        <iframe src={src} style={contentStyle} title="content" />
      );
    case 'image':
      return (
        <img src={src} style={{ ...contentStyle, objectFit: 'contain' }} alt="content" />
      );
    default:
      return <div>Unsupported content type</div>;
  }
};

const ContentDisplay = ({ buttonId, onClose }) => {
  const [show, setShow] = useState(false);
  const [showVideoA, setShowVideoA] = useState(false);
  const [showVideoB, setShowVideoB] = useState(false);
  const contentInfo = ContentMap[buttonId];

  useEffect(() => {
    if (buttonId && contentInfo) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [buttonId, contentInfo]);

  const handleClose = (e) => {
    e.stopPropagation();
    setShow(false);
    onClose();
  };
  
  const handleWrapperClick = (e) => {
      e.stopPropagation();
      handleClose(e);
  };
  
  const handleContentClick = (e) => {
      e.stopPropagation();
  };

  if (!show || !contentInfo) {
    return null;
  }

  return (
    <>
      <div 
        onClick={handleWrapperClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          cursor: 'default',
        }}
      >
        <div
          onClick={handleContentClick}
          style={{
            position: 'relative',
            width: '95vw',
            maxWidth: '1800px',
            maxHeight: '95vh',
            aspectRatio: '10/9',
          }}
        >
          <img 
            src="/content/popup/popup_bg.png" 
            alt="Popup UI" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(1.3)' }}
          />
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.10)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: '1%',
              left: '1%',
              width: '98%',
              height: '98%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {buttonId === 'btn_p_go' ? (
              <Canvas style={{ width: '100%', height: '100%', background: 'transparent' }} camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={1.2} />
                <InteractiveGoButton 
                  position={[0, 0, 0]} 
                  onVideoAOpen={() => setShowVideoA(true)}
                  onVideoBOpen={() => setShowVideoB(true)}
                />
              </Canvas>
            ) : (
              <GenericContent type={contentInfo.type} src={contentInfo.src} onClose={onClose} />
            )}
          </div>
          <img 
            src="/content/popup/btn_back.png" 
            alt="Back button"
            style={{
              position:'absolute', 
              right:'18%',
              bottom:'4%', 
              width:'120px',
              height:'auto', 
              cursor:'pointer',
              zIndex: 3,
            }}
            onClick={handleClose}
          />
        </div>
      </div>
      
      {/* 비디오 팝업들 */}
      {showVideoA && (
        <VideoPopup
          videoSrc="/deploy_videos/L.mp4"
          onClose={() => setShowVideoA(false)}
        />
      )}
      {showVideoB && (
        <VideoPopup
          videoSrc="/deploy_videos/M.mp4"
          onClose={() => setShowVideoB(false)}
        />
      )}
    </>
  );
};

export default ContentDisplay;