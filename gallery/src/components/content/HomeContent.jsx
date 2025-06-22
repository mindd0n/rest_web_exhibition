import React, { useState } from 'react';
import './HomeContent.css';

const HomeContent = () => {
  const [selectedContent, setSelectedContent] = useState(null);

  const handleIconClick = (contentType) => {
    setSelectedContent(contentType);
  };

  const handleCloseDetail = () => {
    setSelectedContent(null);
  };

  const renderDetailContent = () => {
    switch (selectedContent) {
      case 'icon_o':
        return (
          <video 
            src="/deploy_videos/media/O.mp4" 
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain' 
            }} 
            controls 
            loop 
            playsInline 
          />
        );
      case 'icon_p':
        return (
          <iframe 
            src="/content/btn_h_home/P.수면신문/dist/index.html" 
            style={{ width: '100%', height: '100%', border: 'none' }} 
            title="수면신문"
          />
        );
      case 'icon_q':
        return (
          <video 
            src="/deploy_videos/media/Q.mp4" 
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain' 
            }} 
            controls 
            loop 
            playsInline 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      {/* 배경 이미지 */}
      <img 
        src="/content/btn_h_home/btn_h_home_bg.png" 
        alt="Home Background" 
        className="home-bg-image"
      />
      
      {/* 투명 버튼들 */}
      <button 
        className="icon-button icon-o"
        onClick={() => handleIconClick('icon_o')}
        style={{
          position: 'absolute',
          top: '15%',
          left: '0%',
          width: '75%',
          height: '75%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        <img 
          src="/content/btn_h_home/icon_o.png" 
          alt="Icon O" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            pointerEvents: 'auto'
          }}
        />
      </button>

      <button 
        className="icon-button icon-p"
        onClick={() => handleIconClick('icon_p')}
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '75%',
          height: '75%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        <img 
          src="/content/btn_h_home/icon_p.png" 
          alt="Icon P" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            pointerEvents: 'auto'
          }}
        />
      </button>

      <button 
        className="icon-button icon-q"
        onClick={() => handleIconClick('icon_q')}
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '75%',
          height: '75%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        <img 
          src="/content/btn_h_home/icon_q.png" 
          alt="Icon Q" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            pointerEvents: 'auto'
          }}
        />
      </button>

      {/* 2차 팝업창 */}
      {selectedContent && (
        <div className="detail-popup-overlay" onClick={handleCloseDetail}>
          <div className="detail-popup-content" onClick={(e) => e.stopPropagation()}>
            {renderDetailContent()}
            <button onClick={handleCloseDetail} className="close-detail-button">X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeContent; 