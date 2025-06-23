import { useState, useEffect } from 'react';
import * as THREE from 'three';

// 벽/천장/바닥별 plane 전체를 꽉 채우는 크기 반환 (Room.jsx와 동일하게 맞춤)
const WALL_SIZES = {
  front:  [166.68, 150],   // roomWidth, roomHeight
  back:   [166.68, 150],   // roomWidth, roomHeight
  left:   [166.68, 150],   // roomWidth, roomHeight
  right:  [166.68, 150],   // roomWidth, roomHeight
  ceiling:[166.68, 166.68],// roomWidth, roomDepth (정사각형)
  floor:  [166.68, 166.68] // roomWidth, roomDepth (정사각형)
};

export const useButtonImageData = (src, wallType) => {
  const [size, setSize] = useState([1, 1]);
  const [texture, setTexture] = useState(null);
  const [image, setImage] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    
    img.onload = () => {
      // plane 전체를 꽉 채우는 크기
      const size = WALL_SIZES[wallType] || [166.68, 150];
      setSize(size);
      // 텍스처 생성
      const newTexture = new THREE.TextureLoader().load(src);
      newTexture.minFilter = THREE.LinearFilter;
      newTexture.magFilter = THREE.LinearFilter;
      setTexture(newTexture);
      // 캔버스 생성
      const newCanvas = document.createElement('canvas');
      newCanvas.width = img.width;
      newCanvas.height = img.height;
      const ctx = newCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      setCanvas(newCanvas);
      setImage(img);
      setReady(true);
    };
  }, [src, wallType]);

  return [size, texture, image, canvas, ready];
}; 