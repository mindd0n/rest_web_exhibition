import React from "react";
import HTMLFlipBook from "react-pageflip";

const DiaryModal = ({ onClose }) => {
  const pages = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="modal-overlay">
      <button className="back-button" onClick={onClose}>Back</button>
     <HTMLFlipBook
  width={500}
  height={700}
  size="fixed"
  showCover={false}
  maxShadowOpacity={0.5}
  className="custom-book"
  flippingTime={700}
  usePortrait={false}
  drawShadow={true}
>
        {pages.map((num) => (
          <div key={num} className="single-page">
            <img
              src={`/images/${num}.jpg`}
              alt={`Page ${num}`}
              className="page-image"
            />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

export default DiaryModal;

