import React, { useRef, useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import './styles.css';
import { useTexture } from '@react-three/drei';
import { useButtonImageData } from '../hooks/useButtonImageData';
import ContentDisplay from './ContentDisplay.jsx';
import gsap from 'gsap';

// 버튼 위치 계산 함수 (예시)
function getButtonPosition(wallType, buttonKey, index, total) {
  const gap = 20;
  const baseY = 0;
  const baseZ = 0.1;
  return [index * gap - (total - 1) * gap / 2, baseY, baseZ];
}

// Room dimensions
const roomHeight = 150;
const roomWidth = 166.68; // 150 * 10 / 9
const roomDepth = 166.68;
const viewerHeight = 45;

const minDistance = 0.5;
const maxDistance = Math.max(roomWidth, roomHeight, roomDepth) / 2;

// 초기 카메라 상태를 상수로 정의
const INITIAL_CAMERA_POSITION = new THREE.Vector3(0, viewerHeight, roomDepth / 2 - 1);
const INITIAL_CAMERA_LOOKAT = new THREE.Vector3(0, 0, 0);
const INITIAL_CAMERA_FOV = 75;

// 텍스처 로더를 컴포넌트 외부로 이동
const textureLoader = new THREE.TextureLoader();
const textureSettings = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType,
  generateMipmaps: false
};

// Button 컴포넌트 수정
const Button = React.memo(function Button({ 
  type, 
  position, 
  src, 
  wallType, 
  hoveredObject, 
  setHoveredObject, 
  buttonKey, 
  hoverSrc, 
  controlsRef,
  setSelectedButton,
  animateCamera,
  btnIdx,
  btnTotal
}) {
  const isHovered = hoveredObject === buttonKey;
  const [size, texture, image, canvas, ready] = useButtonImageData(isHovered ? hoverSrc : src, wallType);
  const meshRef = useRef();
  
  const handleClick = useCallback((e) => {
    console.log(`벽면 버튼 클릭: ${buttonKey}`);
    if (!image || !texture || !canvas) return;
    const uv = e.uv;
    if (!uv) return;
    const x = Math.floor(uv.x * image.naturalWidth);
    const y = Math.floor((1 - uv.y) * image.naturalHeight);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const alpha = ctx.getImageData(x, y, 1, 1).data[3] / 255;
    if (alpha > 0.05) {
      e.stopPropagation();
      const zoomTarget = getZoomTargetForButton(position, wallType);
      animateCamera(
        {
          position: zoomTarget.position,
          target: zoomTarget.target,
          fov: 45
        },
        1.5,
        () => setSelectedButton(buttonKey)
      );
      setHoveredObject(null);
    }
  }, [image, texture, canvas, buttonKey, wallType, animateCamera, setHoveredObject, setSelectedButton]);

  const handlePointerMove = useCallback((e) => {
    if (!image || !texture || !canvas) return;
    const uv = e.uv;
    if (!uv) return;
    const x = Math.floor(uv.x * image.naturalWidth);
    const y = Math.floor((1 - uv.y) * image.naturalHeight);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const alpha = ctx.getImageData(x, y, 1, 1).data[3] / 255;
    if (alpha > 0.05 && hoveredObject !== buttonKey) {
      e.stopPropagation();
      setHoveredObject(buttonKey);
    } else if (alpha <= 0.05 && hoveredObject === buttonKey) {
      setHoveredObject(null);
    }
  }, [image, texture, canvas, hoveredObject, buttonKey, setHoveredObject]);

  const handlePointerOut = useCallback(() => {
    if (hoveredObject === buttonKey) {
      setHoveredObject(null);
    }
  }, [hoveredObject, buttonKey, setHoveredObject]);

  if (!ready) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, 0, 0]}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.5}
        depthWrite={true}
      />
    </mesh>
  );
});

// getZoomTargetForButton 함수를 일반 함수로 변경
const getZoomTargetForButton = (position, wallType) => {
  const [x, y, z] = position;
  const distance = minDistance;
  let cameraPos, target;
  target = new THREE.Vector3(x, y, z);
  switch (wallType) {
    case 'front': cameraPos = new THREE.Vector3(x, y, z + distance); break;
    case 'back': cameraPos = new THREE.Vector3(x, y, z - distance); break;
    case 'left': cameraPos = new THREE.Vector3(x + distance, y, z); break;
    case 'right': cameraPos = new THREE.Vector3(x - distance, y, z); break;
    case 'ceiling': cameraPos = new THREE.Vector3(x, y - distance, z); break;
    case 'floor': cameraPos = new THREE.Vector3(x, y + distance, z); break;
    default: cameraPos = new THREE.Vector3(x, y, z + distance);
  }
  return { position: cameraPos, target };
};

// Room 컴포넌트를 별도로 분리
const Room = ({ 
  isHovered, 
  setIsHovered, 
  buttonRef, 
  setHoveredObject, 
  hoveredObject, 
  setSelectedButton,
  animateCamera
}) => {
  const wallTextures = useTexture({
    front: '/images/walls/wall_photo.png',
    back: '/images/walls/wall_walk.png',
    left: '/images/walls/wall_bus-stop.png',
    right: '/images/walls/wall_home.png',
    ceiling: '/images/walls/wall_ceiling.png',
    floor: '/images/walls/wall_floor.png',
  });
  
  useEffect(() => {
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      console.log('모든 텍스처 로딩 완료');
    };
  }, []);

  const wallButtonData = useMemo(() => ({
    'front': [
      { key: 'btn_p_go',       src: '/images/buttons/wall_photo_btn/btn_p_go.png',       hoverSrc: '/images/buttons/wall_photo_btn/btn_p_go_hover.png' },
      { key: 'btn_p_tree',     src: '/images/buttons/wall_photo_btn/btn_p_tree.png',     hoverSrc: '/images/buttons/wall_photo_btn/btn_p_tree_hover.png' },
      { key: 'btn_p_note',     src: '/images/buttons/wall_photo_btn/btn_p_note.png',     hoverSrc: '/images/buttons/wall_photo_btn/btn_p_note_hover.png' },
      { key: 'btn_p_pavilion', src: '/images/buttons/wall_photo_btn/btn_p_pavilion.png', hoverSrc: '/images/buttons/wall_photo_btn/btn_p_pavilion_hover.png' }
    ],
    'back': [
      { key: 'btn_w_bridge', src: '/images/buttons/wall_walk_btn/btn_w_bridge.png', hoverSrc: '/images/buttons/wall_walk_btn/btn_w_bridge_hover.png' },
      { key: 'btn_w_walk',   src: '/images/buttons/wall_walk_btn/btn_w_walk.png',   hoverSrc: '/images/buttons/wall_walk_btn/btn_w_walk_hover.png' },
      { key: 'btn_w_sun',    src: '/images/buttons/wall_walk_btn/btn_w_sun.png',    hoverSrc: '/images/buttons/wall_walk_btn/btn_w_sun_hover.png' },
      { key: 'btn_w_sign',   src: '/images/buttons/wall_walk_btn/btn_w_sign.png',   hoverSrc: '/images/buttons/wall_walk_btn/btn_w_sign_hover.png' },
    ],
    'left': [
      { key: 'btn_b_busstop', src: '/images/buttons/wall_bus-stop_btn/btn_b_busstop.png', hoverSrc: '/images/buttons/wall_bus-stop_btn/btn_b_busstop_hover.png' },
      { key: 'btn_b_bus',     src: '/images/buttons/wall_bus-stop_btn/btn_b_bus.png',     hoverSrc: '/images/buttons/wall_bus-stop_btn/btn_b_bus_hover.png' },
      { key: 'btn_b_home',    src: '/images/buttons/wall_bus-stop_btn/btn_b_home.png',    hoverSrc: '/images/buttons/wall_bus-stop_btn/btn_b_home_hover.png' },
    ],
    'right': [
      { key: 'btn_h_dog',    src: '/images/buttons/wall_home_btn/btn_h_dog.png',    hoverSrc: '/images/buttons/wall_home_btn/btn_h_dog_hover.png' },
      { key: 'btn_h_ribbon', src: '/images/buttons/wall_home_btn/btn_h_ribbon.png', hoverSrc: '/images/buttons/wall_home_btn/btn_h_ribbon_hover.png' },
      { key: 'btn_h_star',   src: '/images/buttons/wall_home_btn/btn_h_star.png',   hoverSrc: '/images/buttons/wall_home_btn/btn_h_star_hover.png' },
      { key: 'btn_h_home',   src: '/images/buttons/wall_home_btn/btn_h_home.png',   hoverSrc: '/images/buttons/wall_home_btn/btn_h_home_hover.png' },
    ],
    'ceiling': [
      { key: 'btn_c_lamp',   src: '/images/buttons/wall_ceiling_btn/btn_c_lamp.png',   hoverSrc: '/images/buttons/wall_ceiling_btn/btn_c_lamp_hover.png' },
      { key: 'btn_c_heart',  src: '/images/buttons/wall_ceiling_btn/btn_c_heart.png',  hoverSrc: '/images/buttons/wall_ceiling_btn/btn_c_heart_hover.png' },
    ],
    'floor': [
      { key: 'btn_f_rug',    src: '/images/buttons/wall_floor_btn/btn_f_rug.png',    hoverSrc: '/images/buttons/wall_floor_btn/btn_f_rug_hover.png' },
      { key: 'btn_f_phone',  src: '/images/buttons/wall_floor_btn/btn_f_phone.png',  hoverSrc: '/images/buttons/wall_floor_btn/btn_f_phone_hover.png' },
    ],
  }), []);

  const buttons = useMemo(() => {
    return Object.entries(wallButtonData).flatMap(([wallType, wallButtons]) => 
      wallButtons.map((btn, index) => {
        const position = getButtonPosition(wallType, btn.key, index, wallButtons.length);
        return { ...btn, wallType, position, btnIdx: index, btnTotal: wallButtons.length };
      })
    );
  }, [wallButtonData]);

  return (
    <>
      {/* 조명 추가 */}
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[0, 100, 0]} intensity={1.0} />
      <directionalLight position={[0, -100, 0]} intensity={0.3} />
      {/* 벽과 기본 구조 */}
      <group ref={buttonRef}>
        {/* 벽들 */}
        {[
          { pos: [0, 0, -roomDepth / 2], rot: [0, 0, 0], tex: wallTextures.front, type: 'front' },
          { pos: [0, 0, roomDepth / 2], rot: [0, Math.PI, 0], tex: wallTextures.back, type: 'back' },
          { pos: [-roomWidth / 2, 0, 0], rot: [0, Math.PI / 2, 0], tex: wallTextures.left, type: 'left' },
          { pos: [roomWidth / 2, 0, 0], rot: [0, -Math.PI / 2, 0], tex: wallTextures.right, type: 'right' },
          { pos: [0, roomHeight / 2, 0], rot: [Math.PI / 2, 0, 0], tex: wallTextures.ceiling, type: 'ceiling' },
          { pos: [0, -roomHeight / 2, 0], rot: [-Math.PI / 2, 0, 0], tex: wallTextures.floor, type: 'floor' },
        ].map((wall, i) => (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh>
              <planeGeometry args={wall.type === 'ceiling' || wall.type === 'floor' ? [roomWidth, roomDepth] : [roomWidth, roomHeight]} />
              <meshStandardMaterial 
                map={wall.tex}
                color={wall.tex ? undefined : "#cccccc"}
                roughness={0.7}
                metalness={0.12}
                side={THREE.FrontSide}
              />
            </mesh>
            {/* 벽 중앙에 버튼 추가 - 천장과 바닥도 포함 */}
            {wallButtonData[wall.type]?.map((btn, idx) => {
              let z;
              let pos = [0, 0, 0];
              
              // 천장 버튼 위치 조정
              if (wall.type === 'ceiling') {
                z = -0.1 - idx * 0.05; // 천장은 아래쪽으로 더 멀리, 인덱스별로 간격
                pos = [0, 0, z];
              }
              // 바닥 버튼 위치 조정  
              else if (wall.type === 'floor') {
                z = 0.1 + idx * 0.05; // 바닥은 위쪽으로 더 멀리, 인덱스별로 간격
                pos = [0, 0, z]; // 중앙에 그대로 배치
              }
              // 기존 벽 버튼들
              else if (wall.type === 'front' && btn.src.includes('btn_p_tree')) {
                z = -0.05;
              } else if (wall.type === 'back' && btn.key === 'btn_w_sign') {
                z = 0.15; // Back 벽은 180도 회전되어 있어서 큰 숫자가 앞으로
              } else if (wall.type === 'back' && btn.key === 'btn_w_bridge') {
                z = 0.10; // 두 번째
              } else if (wall.type === 'back' && btn.key === 'btn_w_sun') {
                z = 0.05; // 세 번째
              } else if (wall.type === 'back' && btn.key === 'btn_w_walk') {
                z = 0.01; // 가장 뒤로
              } else if (wall.type === 'right' && btn.key === 'btn_h_home') {
                z = 0.01; // btn_h_home은 가장 뒤로
              } else {
                let baseZ = 0.01;
                if (wall.type === 'front' && btn.src.includes('btn_p_go')) baseZ = 0.02;
                if (wall.type === 'right' && btn.key === 'btn_h_home') {
                  z = 0.01; // btn_h_home은 가장 뒤로
                } else {
                  z = baseZ + idx * 0.01;
                }
                pos = [0, 0, z];
              }
              
              return (
                <Button
                  key={btn.key}
                  type={`${wall.type}_btn_${idx}`}
                  buttonKey={btn.key}
                  position={pos}
                  src={btn.src}
                  hoverSrc={btn.hoverSrc}
                  wallType={wall.type}
                  setHoveredObject={setHoveredObject}
                  hoveredObject={hoveredObject}
                  controlsRef={buttonRef}
                  setSelectedButton={setSelectedButton}
                  animateCamera={animateCamera}
                />
              );
            })}
          </group>
        ))}
      </group>
    </>
  );
};

export default function RoomScene({ onLoadingProgress, onLoadingComplete }) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef();
  const [hoveredObject, setHoveredObject] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const controlsRef = useRef();
  const [restoreView, setRestoreView] = useState(null);

  // 텍스처 로딩 상태 추적
  useEffect(() => {
    if (onLoadingProgress) {
      // 간단한 로딩 시뮬레이션 (실제로는 텍스처 로딩 상태를 추적해야 함)
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          if (onLoadingComplete) onLoadingComplete();
        }
        if (onLoadingProgress) onLoadingProgress(progress);
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [onLoadingProgress, onLoadingComplete]);

  // OrbitControls 기반 카메라 애니메이션
  const animateCamera = useCallback((to, duration = 1.5, onComplete) => {
    setIsAnimating(true);
    gsap.to(controlsRef.current.object.position, {
      x: to.position.x,
      y: to.position.y,
      z: to.position.z,
      duration,
      ease: "power2.inOut"
    });
    gsap.to(controlsRef.current.target, {
      x: to.target.x,
      y: to.target.y,
      z: to.target.z,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        controlsRef.current.update();
      },
      onComplete: () => {
        setIsAnimating(false);
        if (onComplete) onComplete();
      }
    });
  }, []);

  // 복귀 시 항상 restoreView로 animateCamera, 복귀 후 restoreView는 null로 초기화
  const handleRestore = useCallback(() => {
    if (!selectedButton) return;
    const view = restoreView || {
      position: controlsRef.current.object.position.clone(),
      target: controlsRef.current.target.clone()
    };

    // restoreView의 target 방향으로 maxDistance만큼 떨어진 위치 계산
    const dir = new THREE.Vector3()
      .subVectors(view.position, view.target)
      .normalize();
    const zoomedOutPos = view.target.clone().add(dir.multiplyScalar(roomDepth / 2 - 1)); // maxDistance

    animateCamera(
      {
        position: zoomedOutPos,
        target: view.target.clone()
      },
      1.5,
      () => {
        setSelectedButton(null);
        setRestoreView(null);
      }
    );
  }, [selectedButton, restoreView, animateCamera]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleRestore();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRestore]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          cursor: isHovered ? `url('/images/cursor-click.png') 16 44, auto` : `url('/images/cursor.png') 16 44, auto`,
          position: 'relative',
          zIndex: 1,
          pointerEvents: selectedButton ? 'none' : 'auto',
        }}
      >
        <Canvas
          gl={{
            antialias: true,
            powerPreference: 'high-performance'
          }}
          camera={{ 
              position: INITIAL_CAMERA_POSITION,
              fov: INITIAL_CAMERA_FOV,
            }}
          onCreated={({ camera }) => {
            camera.lookAt(INITIAL_CAMERA_LOOKAT);
            camera.layers.enable(1);
          }}
        >
          <OrbitControls
            ref={controlsRef}
            enableZoom={!isAnimating}
            enablePan={!isAnimating}
            enableRotate={!isAnimating}
            minDistance={minDistance}
            maxDistance={maxDistance}
            target={INITIAL_CAMERA_LOOKAT}
          />
          <Suspense fallback={null}>
            <Room
              isHovered={isHovered}
              setIsHovered={setIsHovered}
              buttonRef={buttonRef}
              setHoveredObject={setHoveredObject}
              hoveredObject={hoveredObject}
              setSelectedButton={setSelectedButton}
              animateCamera={animateCamera}
            />
            <EffectComposer>
              <Outline
                selection={hoveredObject && buttonRef.current ? [buttonRef.current.getObjectByName(hoveredObject)].filter(Boolean) : []}
                edgeStrength={100}
                visibleEdgeColor={0x00ff00}
                hiddenEdgeColor={0x00ff00}
                blur
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {selectedButton && (
        <ContentDisplay 
          buttonId={selectedButton}
          onClose={handleRestore}
        />
      )}
    </div>
  );
}