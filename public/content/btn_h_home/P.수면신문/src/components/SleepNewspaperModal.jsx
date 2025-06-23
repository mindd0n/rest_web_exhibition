import React from 'react';
import Magnifier from './Magnifier';
import newspaperImage from '../assets/IMG_0853.PNG';

const SleepNewspaperModal = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{ position: 'relative' }}>
        <Magnifier src={newspaperImage} />
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'white',
            border: '1px solid #ccc',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 10000,
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default SleepNewspaperModal;
