import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import InteractiveGoButton from './InteractiveGoButton.jsx';
import PavilionContent from './content/PavilionContent.jsx';
import HomeContent from './content/HomeContent.jsx';

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
          loop
          playsInline
        />
      </div>
    </div>
  );
};

const ContentMap = {
  // Pavilion
  'btn_p_pavilion': { type: 'custom' },
  'btn_p_note': { type: 'iframe', src: '/content/btn_p_note/F.cocoon-diary/dist/index.html' },
  'btn_p_tree': { type: 'custom' },
  'btn_p_go': { type: 'custom' },

  // Home
  'btn_h_dog': { type: 'iframe', src: '/content/btn_h_dog/S.hoya-story/dist/index.html' },
  'btn_h_star': { type: 'custom' },
  'btn_h_ribbon': { type: 'video', src: '/content/btn_h_ribbon/R.mp4' },
  'btn_h_home': { type: 'custom' },

  // Bus-stop
  'btn_b_bus': { type: 'video', src: '/content/btn_b_bus/i.mp4' },
  'btn_b_busstop': { type: 'video', src: '/content/btn_b_busstop/H.mp4' },
  'btn_b_home': { type: 'iframe', src: '/content/btn_b_home/j/index.html' },
  
  // Ceiling
  'btn_c_heart': { type: 'image', src: '/content/btn_c_heart/U.PNG' },
  'btn_c_lamp': { type: 'video', src: '/content/videos/O.mp4' },
  
  // Floor
  'btn_f_rug': { type: 'iframe', src: '/content/btn_f_rug/참여형 페이지/build/index.html' },
  'btn_f_phone': { type: 'iframe', src: '/content/btn_f_phone/V.디지털디톡스/build/index.html' },

  // Walk
  'btn_w_walk': { type: 'video', src: '/content/videos/L.mp4' },
  'btn_w_bridge': { type: 'video', src: '/content/videos/M.mp4' },
  'btn_w_sign': { type: 'video', src: '/content/videos/N.mp4' },
  'btn_w_sun': { type: 'video', src: '/content/videos/P.mp4' },
};

const TreeContent = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <div style={{ flex: 2, minHeight: 0 }}>
        <GenericContent 
          type='video' 
          src='/content/btn_p_tree/C.mp4' 
        />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '1px', minHeight: 0 }}>
        <div style={{ flex: 2, minHeight: 0 }}>
          <GenericContent 
            type='image'
            src='/content/btn_p_tree/D.jpg'
            objectFit='cover'
          />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <GenericContent 
            type='image'
            src='/content/btn_p_tree/E.JPG'
            objectFit='cover'
          />
        </div>
      </div>
    </div>
  );
};

const StarContent = () => {
  console.log('StarContent rendering');
  
  const [showGallery, setShowGallery] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);

  const handleClick = () => {
    setShowGallery(true);
    setGalleryReady(false);

    setTimeout(() => {
      const section = document.getElementById("gallery");
      section?.scrollIntoView({ behavior: "smooth" });
      setGalleryReady(true);
    }, 100);
  };

  const images = [
    "/content/btn_h_star/T.cocooon-scroll-gallery/public/1.jpeg",
    "/content/btn_h_star/T.cocooon-scroll-gallery/public/2.JPEG",
    "/content/btn_h_star/T.cocooon-scroll-gallery/public/3.JPEG",
    "/content/btn_h_star/T.cocooon-scroll-gallery/public/4.JPEG",
    "/content/btn_h_star/T.cocooon-scroll-gallery/public/5.JPEG",
  ];

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      padding: '30px'
    }}>
      {!showGallery && (
        <button
          style={{
            fontSize: '16px',
            border: '1px solid white',
            padding: '10px 20px',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = 'black';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'white';
          }}
          onClick={handleClick}
        >
          사진 보러 가기
        </button>
      )}

      {showGallery && (
        <div id="gallery" style={{ 
          marginTop: '20px', 
          padding: '0 12px 50px 12px', 
          width: '100%',
          maxWidth: '500px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }}>
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`사진 ${index + 1}`}
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '6px',
                marginBottom: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                objectFit: 'contain'
              }}
            />
          ))}

          {galleryReady && (
            <div style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '20px',
              paddingBottom: '20px'
            }}>
              <button
                onClick={() => setShowGallery(false)}
                style={{
                  fontSize: '14px',
                  border: '1px solid white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'white';
                }}
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const GenericContent = ({ type, src, onClose, objectFit = 'contain' }) => {
  const baseStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
  };

  switch (type) {
    case 'video':
      return (
        <video 
          src={src} 
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'contain' 
          }} 
          controls loop playsInline 
        />
      );
    case 'iframe':
      return (
        <iframe src={src} style={baseStyle} title="content" />
      );
    case 'image':
      return (
        <img src={src} style={{ ...baseStyle, objectFit: objectFit }} alt="content" />
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
    console.log('ContentDisplay useEffect:', { buttonId, contentInfo });
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
    console.log('ContentDisplay not showing:', { show, contentInfo });
    return null;
  }

  console.log('ContentDisplay rendering:', { buttonId, contentInfo });

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
            width: buttonId === 'btn_p_note' || buttonId === 'btn_h_star' ? '90vw' : 'auto',
            height: buttonId === 'btn_p_note' || buttonId === 'btn_h_star' ? '80vh' : 'auto',
            maxWidth: buttonId === 'btn_p_note' || buttonId === 'btn_h_star' ? '1200px' : '98vw',
            maxHeight: buttonId === 'btn_p_note' || buttonId === 'btn_h_star' ? '800px' : '98vh',
            backgroundColor: buttonId === 'btn_p_note' || buttonId === 'btn_h_star' ? '#000' : 'transparent',
            borderRadius: buttonId === 'btn_p_note' || buttonId === 'btn_h_star' ? '8px' : '0',
          }}
        >
          {buttonId !== 'btn_p_note' && buttonId !== 'btn_h_star' && (
            <img 
              src="/content/popup/popup_bg.png" 
              alt="Popup UI" 
              style={{ 
                display: 'block',
                width: 'auto',
                maxWidth: '98vw',
                maxHeight: '98vh',
                filter: 'brightness(1.3)' 
              }}
            />
          )}
          {buttonId !== 'btn_p_note' && buttonId !== 'btn_h_star' && (
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
          )}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              padding: buttonId === 'btn_p_note' || buttonId === 'btn_h_star' ? '0' : '2% 10% 10% 10%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            {(() => {
              if (buttonId === 'btn_p_go') {
                return (
                  <Canvas style={{ width: '100%', height: '100%', background: 'transparent' }} camera={{ position: [0, 0, 15], fov: 50 }}>
                    <ambientLight intensity={1.2} />
                    <InteractiveGoButton 
                      position={[0, 0, 0]} 
                      onVideoAOpen={() => setShowVideoA(true)}
                      onVideoBOpen={() => setShowVideoB(true)}
                    />
                  </Canvas>
                );
              } else if (buttonId === 'btn_p_pavilion') {
                return <PavilionContent />;
              } else if (buttonId === 'btn_h_home') {
                return <HomeContent />;
              } else if (buttonId === 'btn_p_tree') {
                return <TreeContent />;
              } else if (buttonId === 'btn_h_star') {
                return <StarContent />;
              } else {
                return <GenericContent type={contentInfo.type} src={contentInfo.src} onClose={onClose} />;
              }
            })()}
          </div>
          <img 
            src="/content/popup/btn_back.png" 
            alt="Back button"
            style={{
              position:'absolute', 
              right:'1%',
              bottom:'8%',
              width:'100px',
              height:'auto', 
              cursor:'pointer',
              zIndex: 2,
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