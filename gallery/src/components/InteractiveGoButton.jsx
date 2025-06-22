import React, { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

const InteractiveGoButton = ({
  position,
  wallType,
  setHoveredObject,
  hoveredObject,
  setSelectedButton,
  animateCamera,
  onVideoAOpen,
  onVideoBOpen,
  onSoundToggle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoA, setShowVideoA] = useState(false);
  const [showVideoB, setShowVideoB] = useState(false);
  const audioRef = useRef(null);
  const meshRef = useRef();
  const iconARef = useRef();
  const iconBRef = useRef();

  // 텍스처 로딩
  const textures = useTexture({
    background: '/images/buttons/wall_photo_btn/pop_p_go/pop_p_go.png',
    iconA: '/images/buttons/wall_photo_btn/pop_p_go/pop_p_go_in.png',
    iconB: '/images/buttons/wall_photo_btn/pop_p_go/pop_p_go_out.png'
  });

  // 사운드 초기화
  useEffect(() => {
    // audioRef.current = new Audio('/images/buttons/wall_photo_btn/pop_p_go/싱잉볼효과음.m4a');
    // audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 사운드 토글 함수
  const toggleSound = useCallback(() => {
    if (onSoundToggle) {
      onSoundToggle();
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, onSoundToggle]);

  // 알파 마스크 기반 클릭 감지 함수
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
    return alpha > 0.1; // 알파값이 0.1보다 크면 클릭 가능
  }, []);

  // 배경 클릭 핸들러
  const handleBackgroundClick = useCallback((e) => {
    if (checkAlphaClick(e, textures.background)) {
      e.stopPropagation();
      toggleSound();
    }
  }, [textures.background, checkAlphaClick, toggleSound]);

  // 아이콘 A 클릭 핸들러
  const handleIconAClick = useCallback((e) => {
    if (checkAlphaClick(e, textures.iconA)) {
      e.stopPropagation();
      if (onVideoAOpen) {
        onVideoAOpen();
      }
    }
  }, [textures.iconA, checkAlphaClick, onVideoAOpen]);

  // 아이콘 B 클릭 핸들러
  const handleIconBClick = useCallback((e) => {
    if (checkAlphaClick(e, textures.iconB)) {
      e.stopPropagation();
      if (onVideoBOpen) {
        onVideoBOpen();
      }
    }
  }, [textures.iconB, checkAlphaClick, onVideoBOpen]);

  // 마우스 오버 핸들러
  const handlePointerMove = useCallback((e) => {
    if (!setHoveredObject) return;
    const target = e.object;
    let isHovered = false;
    if (target === meshRef.current && checkAlphaClick(e, textures.background)) {
      isHovered = true;
    } else if (target === iconARef.current && checkAlphaClick(e, textures.iconA)) {
      isHovered = true;
    } else if (target === iconBRef.current && checkAlphaClick(e, textures.iconB)) {
      isHovered = true;
    }
    if (isHovered && hoveredObject !== 'btn_p_go') {
      setHoveredObject('btn_p_go');
    } else if (!isHovered && hoveredObject === 'btn_p_go') {
      setHoveredObject(null);
    }
  }, [hoveredObject, setHoveredObject, textures, checkAlphaClick]);

  const handlePointerOut = useCallback(() => {
    if (!setHoveredObject) return;
    if (hoveredObject === 'btn_p_go') {
      setHoveredObject(null);
    }
  }, [hoveredObject, setHoveredObject]);

  return (
    <group position={position}>
      {/* 배경 이미지 */}
      <mesh
        ref={meshRef}
        onClick={handleBackgroundClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          map={textures.background}
          transparent
          alphaTest={0.1}
          depthWrite={false}
        />
      </mesh>
      {/* 아이콘 A */}
      <mesh
        ref={iconARef}
        position={[-2, 2, 0.01]}
        onClick={handleIconAClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          map={textures.iconA}
          transparent
          alphaTest={0.1}
          depthWrite={false}
        />
      </mesh>
      {/* 아이콘 B */}
      <mesh
        ref={iconBRef}
        position={[2, 2, 0.01]}
        onClick={handleIconBClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[2, 2]} />
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