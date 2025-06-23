import React, { useRef, useState, useEffect } from 'react';

const Magnifier = ({ src, width = 1000, zoom = 2.5, lensSize = 180 }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [lensVisible, setLensVisible] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setNaturalSize({ width: img.width, height: img.height });
    };
  }, [src]);

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const image = imgRef.current;
    const rect = image.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 비율 계산
    const scaleX = naturalSize.width / rect.width;
    const scaleY = naturalSize.height / rect.height;

    setLensPosition({
      x: x * scaleX,
      y: y * scaleY,
      screenX: x,
      screenY: y,
    });

    setLensVisible(true);
  };

  const handleMouseLeave = () => {
    setLensVisible(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '50px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt="신문 이미지"
        width={width}
        style={{ maxWidth: '100%', display: 'block' }}
      />

      {lensVisible && (
        <div
          style={{
            position: 'absolute',
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            border: '3px solid #999',
            borderRadius: '50%',
            overflow: 'hidden',
            pointerEvents: 'none',
            left: `${lensPosition.screenX - lensSize / 2}px`,
            top: `${lensPosition.screenY - lensSize / 2}px`,
            zIndex: 10,
          }}
        >
          <img
            src={src}
            alt="확대 이미지"
            style={{
              position: 'absolute',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              left: `${-lensPosition.x * zoom + lensSize / 2}px`,
              top: `${-lensPosition.y * zoom + lensSize / 2}px`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Magnifier;
