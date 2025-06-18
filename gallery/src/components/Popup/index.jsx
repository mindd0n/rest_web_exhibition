import React from 'react';
import './styles.css';

const Popup = ({ isOpen, onClose, buttonType }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (buttonType) {
      case 'wall_photo_btn':
        return <iframe src="/popup-content/btn_p_go/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'wall_video_btn':
        return <iframe src="/popup-content/btn_p_note/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'wall_text_btn':
        return <iframe src="/popup-content/btn_w_bridge/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'wall_page_btn':
        return <iframe src="/popup-content/btn_w_walk/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_h_home':
        return <iframe src="/popup-content/btn_h_home/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_h_ribbon':
        return <iframe src="/popup-content/btn_h_ribbon/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_b_busstop':
        return <iframe src="/popup-content/btn_b_busstop/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_b_bus':
        return <iframe src="/popup-content/btn_b_bus/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_b_home':
        return <iframe src="/popup-content/btn_b_home/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_c_heart':
        return <iframe src="/popup-content/btn_c_heart/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_c_lamp':
        return <iframe src="/popup-content/btn_c_lamp/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />;
      case 'btn_w_sign':
        return (
          <>
            <iframe src="/popup-content/btn_w_sign/content/index.html" style={{ width: '100%', height: '100%', border: 'none' }} />
          </>
        );
      case 'btn_w_sun':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src="/popup-content/btn_w_sun/images/playlist.png"
                alt="playlist"
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
            style={{ width: '100%', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', margin: 'auto' }}
          />
        );
      default:
        return <div>컨텐츠를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose} style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', zIndex:20000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.7)'}}>
      <div className="popup-content" onClick={e => e.stopPropagation()} style={{position:'relative', background:'#fff', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', padding:0, zIndex:2, width:'90vw', maxWidth:'1200px', height:'auto', maxHeight:'90vh', aspectRatio:'10/9', boxSizing:'border-box', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'16px', overflow:'hidden'}}>
        {/* 배경 이미지 - 팝업(컨텐츠) 영역에만, 비율 유지 */}
        <img src="/popup-content/popup_bg.png" alt="popup_bg" style={{position:'absolute', left:'50%', top:0, height:'100%', width:'auto', maxWidth:'100%', objectFit:'contain', zIndex:0, borderRadius:'16px', pointerEvents:'none', background:'#fff', transform:'translateX(-50%)'}} />
        {/* 실제 컨텐츠 */}
        <div style={{position:'relative', zIndex:2, width:'80%', height:'80%', display:'flex', justifyContent:'center', alignItems:'center', margin:'auto'}}>
          {renderContent()}
        </div>
        {/* Back 버튼 - 팝업(컨텐츠) 우측 하단 */}
        <img 
          src="/popup-content/btn_back.png" 
          alt="Back"
          style={{position:'absolute', right:'8px', bottom:'-8px', width:'100px', height:'auto', cursor:'pointer', zIndex:3}}
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default Popup; 