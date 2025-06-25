import React, { useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";

const DiaryModal = ({ onClose }) => {
  // 쿼리스트링에서 width, height 읽기
  let width = 600;
  let height = 800;
  if (window && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    width = parseInt(params.get('width')) || 600;
    height = parseInt(params.get('height')) || 800;
  }

  const pages = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="diary-modal" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <button className="back-button" onClick={onClose}>Back</button>
      <HTMLFlipBook
        width={width}
        height={height}
        size="fixed"
        showCover={false}
        maxShadowOpacity={0}
        className="custom-book"
        flippingTime={700}
        usePortrait={false}
        drawShadow={false}
      >
        {pages.map((num) => (
          <div key={num} className="page" style={{width: '50%', height: '100%'}}>
            <img src={`images/${num}.jpg`} alt={`page${num}`} style={{height: '100%', width: '100%', objectFit: 'contain'}} />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

export default DiaryModal;