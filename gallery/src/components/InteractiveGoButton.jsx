import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTexture } from '@react-three/drei';

const InteractiveGoButton = ({
  position,
  onVideoAOpen,
  onVideoBOpen,
}) => {
  const audioRef = useRef(null);
  const meshRef = useRef();
  const iconARef = useRef();
  const iconBRef = useRef();

  const textures = useTexture({
    background: '/content/btn_p_go/배경.png',
    iconA: '/content/btn_p_go/icon_a.png',
    iconB: '/content/btn_p_go/icon_b.png'
  });

  const [bgSize, setBgSize] = useState([20, 20]);

  useEffect(() => {
    const bgImage = textures.background.image;
    if (bgImage) {
      const { naturalWidth, naturalHeight } = bgImage;
      const aspect = naturalWidth / naturalHeight;
      const width = 18; // 기준 너비 (잘리지 않도록 조정)
      setBgSize([width, width / aspect]);
    }
  }, [textures.background]);

  useEffect(() => {
    audioRef.current = new Audio('/content/btn_p_go/싱잉볼효과음.m4a');
    audioRef.current.loop = false;
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  }, []);

  const checkAlphaClick = useCallback((event, texture) => {
    if (!texture || !texture.image) return false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    ctx.drawImage(texture.image, 0, 0);
    const uv = event.uv;
    const x = Math.floor(uv.x * texture.image.width);
    const y = Math.floor((1 - uv.y) * texture.image.height);
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const alpha = pixelData[3] / 255;
    return alpha > 0.1; 
  }, []);

  const handleBackgroundClick = useCallback((e) => {
    if (checkAlphaClick(e, textures.background)) {
      e.stopPropagation();
      playSound();
    }
  }, [textures.background, checkAlphaClick, playSound]);

  const handleIconAClick = useCallback((e) => {
    if (checkAlphaClick(e, textures.iconA)) {
      e.stopPropagation();
      if (onVideoAOpen) onVideoAOpen();
    }
  }, [textures.iconA, checkAlphaClick, onVideoAOpen]);

  const handleIconBClick = useCallback((e) => {
    if (checkAlphaClick(e, textures.iconB)) {
      e.stopPropagation();
      if (onVideoBOpen) onVideoBOpen();
    }
  }, [textures.iconB, checkAlphaClick, onVideoBOpen]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={bgSize} />
        <meshStandardMaterial
          map={textures.background}
          transparent
          alphaTest={0.1}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={iconARef}
        position={[0, 0, 0.1]}
        onClick={handleIconAClick}
      >
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial
          map={textures.iconA}
          transparent
          alphaTest={0.1}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={iconBRef}
        position={[0, 0, 0.1]}
        onClick={handleIconBClick}
      >
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial
          map={textures.iconB}
          transparent
          alphaTest={0.1}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default InteractiveGoButton;