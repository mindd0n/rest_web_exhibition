import React from 'react';
import './styles.css';

// S3 기본 URL
const S3_BASE_URL = 'https://rest-exhibition.s3.ap-northeast-2.amazonaws.com/deploy_media';

const Popup = ({ isOpen, onClose, buttonType }) => {
  if (!isOpen) return null;

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.style.display = 'none';
    const altText = document.createElement('span');
    altText.innerText = e.target.alt;
    e.target.parentNode.appendChild(altText);
  };

  const renderContent = () => {
    switch (buttonType) {
      case 'wall_photo_btn':
        return <iframe title="Photo Content" src="/popup-content/btn_p_go/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'wall_video_btn':
        return <iframe title="Video Content" src="/popup-content/btn_p_note/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'wall_text_btn':
        return <iframe title="Text Content" src="/popup-content/btn_w_bridge/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'wall_page_btn':
        return <iframe title="Page Content" src="/popup-content/btn_w_walk/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_h_home':
        return <iframe title="Home Content" src="/popup-content/btn_h_home/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_h_ribbon':
        return <iframe title="Ribbon Content" src="/popup-content/btn_h_ribbon/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_b_busstop':
        return <iframe title="Bus Stop Content" src="/popup-content/btn_b_busstop/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_b_bus':
        return <iframe title="Bus Content" src="/popup-content/btn_b_bus/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_b_home':
        return <iframe title="B Home Content" src="/popup-content/btn_b_home/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_w_sign':
        return (
          <>
            <iframe title="Sign Content" src="/popup-content/btn_w_sign/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />
          </>
        );
      case 'btn_w_sun':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src="/content/btn_w_sun/images/playlist.png"
                alt="playlist"
                onError={handleImageError}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '20px', 
                right: '20px', 
                width: '300px', 
                zIndex: 10 
              }}>
                <iframe 
                  title="Spotify Playlist"
                  style={{borderRadius: '12px'}} 
                  src="https://open.spotify.com/embed/playlist/5jngExT7M9drt4yVZvrzQu?utm_source=generator" 
                  width="100%" 
                  height="152" 
                  frameBorder="0" 
                  allowFullScreen="" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        );
      case 'btn_map':
        return (
          <img
            src="/images/buttons/icons/btn_map_popup.png"
            alt="지도 팝업"
            onError={handleImageError}
            style={{ width: '100%', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', margin: 'auto' }}
          />
        );
      default:
        return <div>컨텐츠를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{buttonType}</h2>
          <button className="popup-close" onClick={onClose}>
            <img src={`${S3_BASE_URL}/btn_back.png`} alt="닫기" />
          </button>
        </div>
        <div className="popup-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Popup; 