import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import './styles.css';
import { useTexture } from '@react-three/drei';
import { useButtonImageData } from '../hooks/useButtonImageData';
import Popup from './Popup';
import gsap from 'gsap';

// Room dimensions
const roomHeight = 150;
const roomWidth = 166.68; // 150 * 10 / 9
const roomDepth = 166.68;
const viewerHeight = 45;

// Lighting configuration
const ambientLightIntensity = 1.5;
const ambientLightColor = "#fff0e6";
const centralLightIntensity = 1.8;
const centralLightColor = "#ffe4cc";
const wallLightIntensity = 1.2;
const wallLightColor = "#fff0e6";

const minDistance = 0.5;

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

// 텍스처 로딩 함수
const loadTexture = (path, uvTransform) => {
  return textureLoader.load(path, texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    Object.assign(texture, textureSettings);
    if (uvTransform) {
      texture.repeat.set(...uvTransform.repeat);
      texture.offset.set(...uvTransform.offset);
    }
  });
};

// 버튼 centroid 픽셀 좌표 (이미지 크기: 2000x1800)
const buttonCentroids = {
  sun:    { x: 424.06,  y: 588.15 },
  path:   { x: 1069.95, y: 1367.17 },
  sign:   { x: 1813.97, y: 945.93 },
  bridge: { x: 416.34,  y: 1056.21 },
};

// 버튼 bounding box 위치 및 크기 (픽셀)
const buttonBBoxes = {
  sun:    { min_x: 0,    min_y: 268,  width: 895,  height: 589 },
  path:   { min_x: 0,    min_y: 419,  width: 1827, height: 1381 },
  sign:   { min_x: 1580, min_y: 619,  width: 420,  height: 818 },
  bridge: { min_x: 0,    min_y: 857,  width: 964,  height: 443 },
};

// 벽별 normal 벡터 정의
const wallNormals = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  left: [1, 0, 0],
  right: [-1, 0, 0],
};

// 3D 중심 좌표 변환 함수
function bboxCenterTo3D({min_x, min_y, width, height}) {
  const center_x = min_x + width / 2;
  const center_y = min_y + height / 2;
  const left = center_x / 2000;
  const top = center_y / 1800;
  const posX = (left - 0.5) * roomWidth;
  const posY = (0.5 - top) * roomHeight;
  return [posX, posY];
}

// 3D 크기 변환 함수 (벽/천장/바닥별로 plane 크기 맞춤)
function bboxTo3DByWall({width, height}, wallType) {
  // 기준: 벽(2000x1800), 천장/바닥(2000x2000)
  if (wallType === 'ceiling' || wallType === 'floor') {
    return [width / 2000 * roomWidth, height / 2000 * roomDepth];
  }
  // 나머지 벽은 기존과 동일
  return [width / 2000 * roomWidth, height / 1800 * roomHeight];
}

// UV repeat/offset 계산 함수
function getUVTransform({min_x, min_y, width, height}) {
  const repeatX = width / 2000;
  const repeatY = height / 1800;
  const offsetX = min_x / 2000;
  const offsetY = 1 - (min_y + height) / 1800;
  return { repeat: [repeatX, repeatY], offset: [offsetX, offsetY] };
}

// 카메라가 1번 레이어도 렌더링하도록 설정
function EnableLayer1OnCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.layers.enable(1);
  }, [camera]);
  return null;
}

// Glow Ring ShaderMaterial 생성 함수 (useRef + useFrame)
function useGlowRingMaterial() {
  const materialRef = useRef();
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.opacity.value = 0.7;
    }
  });
  if (!materialRef.current) {
    materialRef.current = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00ff00) },
        radius: { value: 0.35 },
        width: { value: 0.3 },
        opacity: { value: 1 }
      },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float radius;
        uniform float width;
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          float dist = distance(vUv, vec2(0.5, 0.5));
          float edge0 = radius;
          float edge1 = radius + width;
          float glow = smoothstep(edge1, edge0, dist);
          gl_FragColor = vec4(color, glow * opacity);
        }
      `
    });
  }
  return materialRef.current;
}

// 알파마스크 기반 Glow ShaderMaterial 생성 함수
function useAlphaGlowMaterial(texture) {
  return useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      color: { value: new THREE.Color(0x00ff00) },
      opacity: { value: 1 }
    },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec3 color;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        float a = texture2D(map, vUv).a;
        float edge = smoothstep(0.45, 0.55, a); // 알파 경계에서만 빛나게
        gl_FragColor = vec4(color, edge * opacity);
      }
    `
  }), [texture]);
}

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
  const z = position && position[2] !== undefined ? position[2] : 0.1;
  const meshRef = useRef();
  
  const handleClick = useCallback((e) => {
    // 모든 벽면 버튼 클릭 시 로그
    console.log(`벽면 버튼 클릭: ${buttonKey}`);
    const pos = Array.isArray(position) ? position : [0, 0];
    if (!image || !texture || !canvas) return;
    const uv = e.uv;
    if (!uv) return;
    const x = Math.floor(uv.x * image.naturalWidth);
    const y = Math.floor((1 - uv.y) * image.naturalHeight);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const alpha = ctx.getImageData(x, y, 1, 1).data[3] / 255;
    if (alpha > 0.05) {
      e.stopPropagation();
      const zoomTarget = getZoomTargetForButton(pos, wallType);
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
  }, [position, image, texture, canvas, buttonKey, wallType, animateCamera, setHoveredObject, setSelectedButton]);

  const handlePointerMove = useCallback((e) => {
    const pos = Array.isArray(position) ? position : [0, 0];
    if (!image || !texture || !canvas) return;
    const uv = e.uv;
    if (!uv) return;
    const x = Math.floor(uv.x * image.naturalWidth);
    const y = Math.floor((1 - uv.y) * image.naturalHeight);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const alpha = ctx.getImageData(x, y, 1, 1).data[3] / 255;
    if (alpha > 0.05 && hoveredObject !== buttonKey) {
      e.stopPropagation(); // 그림 부분만 stopPropagation
      setHoveredObject(buttonKey);
    }
  }, [position, image, texture, canvas, hoveredObject, buttonKey, setHoveredObject]);

  const handlePointerOut = useCallback(() => {
    if (hoveredObject === buttonKey) {
      setHoveredObject(null);
    }
  }, [hoveredObject, buttonKey, setHoveredObject]);

  if (!ready) return null;

  // 바닥/천장 버튼 중앙 분산 위치 보정
  let renderPos = Array.isArray(position) ? position : [0, 0, z];
  if ((wallType === 'ceiling' || wallType === 'floor') && btnTotal > 1 && size[0]) {
    const gap = 10; // 버튼 간 여백
    const totalWidth = btnTotal * size[0] + (btnTotal - 1) * gap;
    const xOffset = (btnIdx - (btnTotal - 1) / 2) * (size[0] + gap);
    renderPos = [xOffset, 0, z];
  }

  return (
    <mesh
      ref={meshRef}
      position={renderPos}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.5}
        depthWrite={false}
      />
    </mesh>
  );
});

// 각 벽별 버튼 파일명 명시적으로 관리
const wallButtonFiles = {
  front: [
    'btn_p_go.png', 'btn_p_note.png', 'btn_p_pavilion.png', 'btn_p_tree.png'
  ],
  right: [
    'btn_h_home.png', 'btn_h_star.png', 'btn_h_dog.png', 'btn_h_ribbon.png'
  ],
  back: [
    'btn_w_bridge.png', 'btn_w_sign.png', 'btn_w_sun.png', 'btn_w_walk.png'
  ],
  left: [
    'btn_b_busstop.png', 'btn_b_bus.png', 'btn_b_home.png'
  ],
  ceiling: [
    'btn_c_heart.png', 'btn_c_lamp.png'
  ],
  floor: [
    'btn_f_rug.png', 'btn_f_phone.png'
  ]
};
const wallButtonFolders = {
  front: 'wall_photo_btn',
  right: 'wall_home_btn',
  back: 'wall_walk_btn',
  left: 'wall_bus-stop_btn',
  ceiling: 'wall_ceiling_btn',
  floor: 'wall_floor_btn',
};
const wallButtonData = {};
Object.entries(wallButtonFiles).forEach(([wall, files]) => {
  wallButtonData[wall] = files.map(f => {
    const key = f.replace(/\.png$/, '');
    return { key, src: `/images/buttons/${wallButtonFolders[wall]}/${f}` };
  });
});

// getZoomTargetForButton 함수를 일반 함수로 변경
const getZoomTargetForButton = (position, wallType) => {
  const [x, y, z] = position;
  const distance = minDistance; // 더욱 강한 줌인
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
      // 텍스처를 메모이제이션
      const wallTextures = useMemo(() => ({
    front: loadTexture('/images/walls/wall_photo.png', null),
    right: loadTexture('/images/walls/wall_home.png', null),
    back: loadTexture('/images/walls/wall_walk.png', null),
    left: loadTexture('/images/walls/wall_bus-stop.png', null),
    floor: loadTexture('/images/walls/wall_floor.png', null),
    ceiling: loadTexture('/images/walls/wall_ceiling.png', null),
      }), []);

      const glowTexture = useMemo(() => loadTexture('/images/btn_enter_hover.png', null), []);
      
      // Walkpath 버튼 텍스처
      const walkpathTextures = useMemo(() => ({
        sun: loadTexture('/images/buttons/btn_walkpath_sun.png', getUVTransform(buttonBBoxes.sun)),
        path: loadTexture('/images/buttons/btn_walkpath_path.png', getUVTransform(buttonBBoxes.path)),
        sign: loadTexture('/images/buttons/btn_walkpath_sign.png', getUVTransform(buttonBBoxes.sign)),
        bridge: loadTexture('/images/buttons/btn_walkpath_bridge.png', getUVTransform(buttonBBoxes.bridge)),
      }), []);

  // 버튼 텍스처 미리 useMemo로 준비
  const wallButtonTextures = useMemo(() => {
    const obj = {};
    Object.keys(wallButtonData).forEach(wall => {
      obj[wall] = wallButtonData[wall].map(btn => loadTexture(btn.src));
    });
    return obj;
  }, []);

      return (
        <>
          {/* 조명 추가 */}
      <ambientLight intensity={1.5} color="#ffffff" />
          <directionalLight position={[0, 100, 100]} intensity={1.2} />
      <directionalLight position={[0, 100, -100]} intensity={1.2} />
      <directionalLight position={[100, 100, 0]} intensity={1.2} />
      <directionalLight position={[-100, 100, 0]} intensity={1.2} />
      <directionalLight position={[0, -100, 0]} intensity={0.2} />
      <directionalLight position={[0, 100, 0]} intensity={2.0} />
          {/* 벽과 기본 구조 */}
          <group>
            {/* 바닥 */}
            <group position={[0, -roomHeight / 2, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[roomWidth, roomDepth]} />
                <meshStandardMaterial 
                  map={wallTextures.floor}
              color={wallTextures.floor ? undefined : "#777777"}
              roughness={1.0}
              metalness={0.0}
              side={THREE.DoubleSide}
            />
              </mesh>
            </group>
            {/* 천장 */}
            <group position={[0, roomHeight / 2, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[roomWidth, roomDepth]} />
                <meshStandardMaterial 
                  map={wallTextures.ceiling}
              color={wallTextures.ceiling ? undefined : "#f5f5e6"}
              roughness={0.7}
              metalness={0.12}
              side={THREE.DoubleSide}
            />
              </mesh>
            </group>
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
                  <planeGeometry args={[roomWidth, roomHeight]} />
                  <meshStandardMaterial 
                    map={wall.tex}
                    color={wall.tex ? undefined : "#cccccc"}
                    roughness={0.7}
                    metalness={0.12}
                    side={THREE.DoubleSide}
                  />
                </mesh>
            {/* 벽 중앙에 버튼 추가 */}
            {wallButtonData[wall.type]?.map((btn, idx) => {
              let z;
              let pos = [0, 0, 0];
              if (wall.type === 'front' && btn.src.includes('btn_p_tree')) {
                z = -0.05;
              } else if (wall.type === 'back' && btn.key === 'btn_w_sign') {
                z = 0.09;
              } else if (wall.type === 'back' && btn.key === 'btn_w_bridge') {
                z = 0.07;
              } else if (wall.type === 'ceiling' || wall.type === 'floor') {
                z = 0.2;
                // Button에서 size[0]을 받아서 위치 계산하도록 btnWidth, total, idx 전달
                const total = wallButtonData[wall.type].length;
                pos = [0, 0, z]; // Button에서 보정
                return (
                  <Button
                    key={btn.key}
                    type={`${wall.type}_btn_${idx}`}
                    buttonKey={btn.key}
                    position={pos}
                    src={btn.src}
                    hoverSrc={btn.src.replace(/\.png$/, '_hover.png')}
                    wallType={wall.type}
                    setHoveredObject={setHoveredObject}
                    hoveredObject={hoveredObject}
                    controlsRef={buttonRef}
                    setSelectedButton={setSelectedButton}
                    animateCamera={animateCamera}
                    btnIdx={idx}
                    btnTotal={total}
                  />
                );
              } else {
                let baseZ = 0.01;
                if (wall.type === 'ceiling') baseZ = -0.05;
                else if (wall.type === 'floor') baseZ = 0.05;
                else if (wall.type === 'front' && btn.src.includes('btn_p_go')) baseZ = 0.02;
                z = baseZ + idx * 0.01;
                pos = [0, 0, z];
              }
              return (
                <Button
                  key={btn.key}
                  type={`${wall.type}_btn_${idx}`}
                  buttonKey={btn.key}
                  position={pos}
                  src={btn.src}
                  hoverSrc={btn.src.replace(/\.png$/, '_hover.png')}
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
  const [outlineReady, setOutlineReady] = useState(false);
  const [cursor, setCursor] = useState(`url(/images/cursor.png) 16 44, auto`);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const controlsRef = useRef();
  const [restoreView, setRestoreView] = useState(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);

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
          setTexturesLoaded(true);
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

  // 버튼 클릭 시 현재 카메라 위치/target 저장 (클릭 직전에 저장!)
  const handleButtonClick = useCallback((position, wallType, buttonKey) => {
    if (selectedButton) return; // 이미 팝업이 열려 있으면 무시
    // 버튼 클릭 직전 시점 저장
    setRestoreView({
      position: controlsRef.current.object.position.clone(),
      target: controlsRef.current.target.clone()
    });
    const zoomTarget = getZoomTargetForButton(position, wallType);
    animateCamera(
      {
        position: zoomTarget.position,
        target: zoomTarget.target
      },
      1.5,
      () => setSelectedButton(buttonKey)
    );
  }, [animateCamera, selectedButton]);

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

  const handleOverlayClick = handleRestore;

  useEffect(() => {
    if (isHovered && buttonRef.current && buttonRef.current.parent) {
      setOutlineReady(true);
    } else {
      setOutlineReady(false);
    }
  }, [isHovered]);

  // 텍스처가 로딩되지 않았으면 아무것도 렌더링하지 않음
  // if (!texturesLoaded) {
  //   return null;
  // }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          cursor: cursor,
        }}
        onPointerUp={(e) => {
          if (e.button === 0) {
            setCursor(`url(/images/cursor.png) 16 44, auto`);
          }
        }}
        onPointerLeave={() => setCursor(`url(/images/cursor.png) 16 44, auto`)}
        camera={{ 
          position: [0, viewerHeight, minDistance],
          fov: 75,
          near: 0.1,
          far: 2000
        }}
        gl={{ 
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          toneMappingGamma: 0.9,
          powerPreference: "high-performance",
          antialias: true,
          stencil: false,
          depth: true,
          alpha: true,
          premultipliedAlpha: false
        }}
        shadows={false}
        dpr={[1, 1.5]}
        frameloop="demand"
      >
        <Room
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          buttonRef={buttonRef}
          setHoveredObject={setHoveredObject}
          hoveredObject={hoveredObject}
          setSelectedButton={setSelectedButton}
          animateCamera={animateCamera}
        />
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={!isAnimating}
          makeDefault
          minDistance={minDistance}
          maxDistance={roomDepth / 2 - 1}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
          target={INITIAL_CAMERA_LOOKAT}
        />
      </Canvas>
      <Popup 
        isOpen={!!selectedButton} 
        onClose={handleRestore}
        buttonType={selectedButton}
      />
    </div>
  );
}