import React, { Suspense } from 'react';
import styled from 'styled-components';

const PavilionContent = React.lazy(() => import('./content/PavilionContent'));
// 다른 콘텐츠 컴포넌트들도 여기에 추가
// const StarContent = React.lazy(() => import('./content/StarContent'));

const ContentMap = {
  'btn_p_pavilion': PavilionContent,
  // 'btn_h_star': StarContent,
};

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: white;
  font-size: 1.5rem;
`;

const ContentDisplay = ({ buttonId, onClose }) => {
  if (!buttonId) return null;

  const ContentComponent = ContentMap[buttonId];

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
        zIndex: 1000,
        cursor: 'pointer',
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          backgroundImage: 'url(/assets/content/popup/popup_bg.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '95%',
          height: '95%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'default',
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '8%',
          left: '18%',
          background: 'rgba(0,0,0,0.4)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          fontSize: '22px',
          lineHeight: '44px',
          textAlign: 'center',
          cursor: 'pointer',
          zIndex: 210,
        }}>
          &times;
        </button>

        <div style={{
          width: '80%',
          height: '80%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '5%',
          zIndex: 2,
          position: 'relative',
        }}>
          <Suspense fallback={<LoadingWrapper>Loading...</LoadingWrapper>}>
            {ContentComponent ? <ContentComponent /> : <LoadingWrapper>콘텐츠를 찾을 수 없습니다.</LoadingWrapper>}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay; 