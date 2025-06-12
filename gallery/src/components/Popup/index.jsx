import React from 'react';
import './styles.css';

const Popup = ({ isOpen, onClose, buttonType }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (buttonType) {
      case 'wall_photo_btn':
        return <div>벽 사진 컨텐츠</div>;
      case 'wall_video_btn':
        return <div>벽 영상 컨텐츠</div>;
      case 'wall_text_btn':
        return <div>벽 텍스트 컨텐츠</div>;
      case 'wall_page_btn':
        return <div>벽 페이지 컨텐츠</div>;
      default:
        return <div>컨텐츠를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        {renderContent()}
      </div>
    </div>
  );
};

export default Popup; 