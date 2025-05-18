import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BGMControl from './BGMControl';
import { EffectComposer, Outline } from '@react-three/postprocessing';

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

const minDistance = 30;

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

// 확대할 버튼별 위치 정의
const buttonZoomTargets = {
  sun:    { position: [-60.80, 52.5, roomWidth / 2 - 20], lookAt: [-60.80, 52.5, roomWidth / 2] },
  path:   { position: [28.34, 15, roomWidth / 2 - 20], lookAt: [28.34, 15, roomWidth / 2] },
  sign:   { position: [36.67, -12, roomWidth / 2 - 20], lookAt: [36.67, -12, roomWidth / 2] },
  bridge: { position: [56.67, -21, roomWidth / 2 - 20], lookAt: [56.67, -21, roomWidth / 2] },
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

// 3D 크기 변환 함수
function bboxTo3D({width, height}) {
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

export default function RoomScene() {
  const controlsRef = useRef();
  const [isZoomed, setIsZoomed] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [savedCamera, setSavedCamera] = useState(null); // { position: THREE.Vector3, lookAt: THREE.Vector3 }
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef();
  const [outlineReady, setOutlineReady] = useState(false);
  const [cursor, setCursor] = useState(`url(/images/cursor.png) 16 44, auto`);
  const [zoomTarget, setZoomTarget] = useState(null); // { position: [x, y, z], lookAt: [x, y, z] }

  // 메모이제이션된 이벤트 핸들러
  const handleEnterIconClick = useCallback((e) => {
    e.stopPropagation();
    // 현재 카메라 위치/방향 저장
    const camera = controlsRef.current.object;
    const position = camera.position.clone();
    const lookAt = new THREE.Vector3();
    camera.getWorldDirection(lookAt);
    lookAt.add(position); // 실제 lookAt 좌표
    setSavedCamera({ position, lookAt });
    setIsZoomed(true);
  }, []);

  // ESC 또는 오버레이 클릭 시 복귀 시작
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsReturning(true);
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  const handleOverlayClick = useCallback(() => {
    if (isZoomed) {
      setIsReturning(true);
      setIsZoomed(false);
    }
  }, [isZoomed]);

  // Controls 컴포넌트를 메모이제이션
  const Controls = useMemo(() => {
    return function Controls({ controlsRef, isZoomed, isReturning, onReturnEnd }) {
    const { camera, gl } = useThree();
    // 확대 위치
      const zoomTargetVec = useMemo(() => new THREE.Vector3(0, 0, -roomDepth / 2 + 20), []);
      const zoomLookAtVec = useMemo(() => new THREE.Vector3(0, 0, -roomDepth / 2), []);
    // 복귀 위치: 벽 중앙을 계속 바라보며 z축만 뒤로 멀어짐
      const returnTargetVec = useMemo(() => new THREE.Vector3(0, 0, minDistance), []);
      const returnLookAtVec = useMemo(() => new THREE.Vector3(0, 0, -roomDepth / 2), []);

    useFrame(() => {
      if (isZoomed) {
        camera.position.lerp(zoomTargetVec, 0.08);
        camera.lookAt(zoomLookAtVec);
      } else if (isReturning) {
        camera.position.lerp(returnTargetVec, 0.08);
        camera.lookAt(returnLookAtVec);
        if (camera.position.distanceTo(returnTargetVec) < 0.2) {
          camera.position.copy(returnTargetVec);
          camera.lookAt(returnLookAtVec);
          onReturnEnd();
        }
      }
    });

    return (
      <OrbitControls
        ref={controlsRef}
        args={[camera, gl.domElement]}
        minDistance={minDistance}
        maxDistance={roomDepth}
        enablePan={!isZoomed && !isReturning}
        enableZoom={!isZoomed && !isReturning}
        enableRotate={!isZoomed && !isReturning}
        makeDefault
      />
    );
    };
  }, []);

  // 복귀 완료 시 호출
  const handleReturnEnd = useCallback(() => {
    setIsReturning(false);
    setSavedCamera(null);
  }, []);

  useEffect(() => {
    if (isHovered && buttonRef.current && buttonRef.current.parent) {
      setOutlineReady(true);
    } else {
      setOutlineReady(false);
    }
  }, [isHovered]);

  // Room 컴포넌트를 메모이제이션
  const Room = useMemo(() => {
    return function Room({ onEnterIconClick, isHovered, setIsHovered, buttonRef }) {
      // 텍스처를 메모이제이션
      const wallTextures = useMemo(() => ({
        front: loadTexture('/images/walls/wall1.png', null),
        right: loadTexture('/images/walls/wall2.jpg', null),
        back: loadTexture('/images/walls/wall3.jpg', null),
        left: loadTexture('/images/walls/wall4.png', null),
        floor: loadTexture('/images/floor.png', null),
        ceiling: loadTexture('/images/ceiling.png', null),
      }), []);

      const glowTexture = useMemo(() => loadTexture('/images/btn_enter_hover.png', null), []);
      
      // Walkpath 버튼 텍스처
      const walkpathTextures = useMemo(() => ({
        sun: loadTexture('/images/buttons/btn_walkpath_sun.png', getUVTransform(buttonBBoxes.sun)),
        path: loadTexture('/images/buttons/btn_walkpath_path.png', getUVTransform(buttonBBoxes.path)),
        sign: loadTexture('/images/buttons/btn_walkpath_sign.png', getUVTransform(buttonBBoxes.sign)),
        bridge: loadTexture('/images/buttons/btn_walkpath_bridge.png', getUVTransform(buttonBBoxes.bridge)),
      }), []);

      // Walkpath 버튼 클릭 핸들러
      const handleWalkpathClick = useCallback((type) => {
        console.log(`Walkpath button clicked: ${type}`);
        if (buttonZoomTargets[type]) {
          setZoomTarget(buttonZoomTargets[type]);
        }
      }, []);

    useFrame(() => {
      if (buttonRef.current) {
        const targetScale = isHovered ? 1.25 : 1.0;
        buttonRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      }
    });

    // 확대 애니메이션
    useFrame(() => {
      if (zoomTarget && controlsRef.current) {
        const camera = controlsRef.current.object;
        const targetPos = new THREE.Vector3(...zoomTarget.position);
        const lookAtPos = new THREE.Vector3(...zoomTarget.lookAt);
        camera.position.lerp(targetPos, 0.08);
        camera.lookAt(lookAtPos);
        if (camera.position.distanceTo(targetPos) < 0.2) {
          camera.position.copy(targetPos);
          camera.lookAt(lookAtPos);
          setZoomTarget(null);
        }
      }
    });

    return (
      <group>
        {/* 바닥 */}
        <group position={[0, -roomHeight / 2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[roomWidth, roomDepth]} />
            <meshStandardMaterial map={wallTextures.floor} roughness={0.7} metalness={0.12} side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* 천장 */}
        <group position={[0, roomHeight / 2, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[roomWidth, roomDepth]} />
            <meshStandardMaterial map={wallTextures.ceiling} roughness={0.7} metalness={0.12} side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* 벽들 */}
        {[
          { pos: [0, 0, -roomDepth / 2], rot: [0, 0, 0], tex: wallTextures.front, type: 'front' },
          { pos: [0, 0, roomDepth / 2], rot: [0, Math.PI, 0], tex: wallTextures.back, type: 'back' },
          { pos: [-roomWidth / 2, 0, 0], rot: [0, Math.PI / 2, 0], tex: wallTextures.left, type: 'left' },
          { pos: [roomWidth / 2, 0, 0], rot: [0, -Math.PI / 2, 0], tex: wallTextures.right, type: 'right' },
        ].map((wall, i) => (
          <group key={i} position={wall.pos} rotation={wall.rot}>
            <mesh>
              <planeGeometry args={[roomWidth, roomHeight]} />
              <meshStandardMaterial 
                map={wall.tex}
                roughness={0.7}
                metalness={0.12}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* front 벽에만 버튼 추가 */}
            {wall.type === 'front' && (
              <mesh
                ref={buttonRef}
                position={[0, 0, 0.18]}
                onClick={onEnterIconClick}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
              >
                <planeGeometry args={[24, 24]} />
                <meshBasicMaterial
                  map={glowTexture}
                  transparent
                />
              </mesh>
            )}
              {/* right 벽에 walkpath 버튼들 추가 */}
              {wall.type === 'right' && (
                <>
                  {/* sun */}
                  <mesh
                    position={[...bboxCenterTo3D(buttonBBoxes.sun), 0.4]}
                    onClick={e => { e.stopPropagation(); handleWalkpathClick('sun'); }}
                  >
                    <planeGeometry args={[...bboxTo3D(buttonBBoxes.sun)]} />
                    <meshBasicMaterial
                      map={walkpathTextures.sun}
                      transparent
                      alphaTest={0.01}
                      attach="material"
                    />
                  </mesh>
                  {/* sign */}
                  <mesh
                    position={[...bboxCenterTo3D(buttonBBoxes.sign), 0.3]}
                    onClick={e => { e.stopPropagation(); handleWalkpathClick('sign'); }}
                  >
                    <planeGeometry args={[...bboxTo3D(buttonBBoxes.sign)]} />
                    <meshBasicMaterial
                      map={walkpathTextures.sign}
                      transparent
                      alphaTest={0.01}
                      attach="material"
                    />
                  </mesh>
                  {/* bridge */}
                  <mesh
                    position={[...bboxCenterTo3D(buttonBBoxes.bridge), 0.25]}
                    onClick={e => { e.stopPropagation(); handleWalkpathClick('bridge'); }}
                  >
                    <planeGeometry args={[...bboxTo3D(buttonBBoxes.bridge)]} />
                    <meshBasicMaterial
                      map={walkpathTextures.bridge}
                      transparent
                      alphaTest={0.01}
                      attach="material"
                    />
                  </mesh>
                  {/* path */}
                  <mesh
                    position={[...bboxCenterTo3D(buttonBBoxes.path), 0.2]}
                    onClick={e => { e.stopPropagation(); handleWalkpathClick('path'); }}
                  >
                    <planeGeometry args={[...bboxTo3D(buttonBBoxes.path)]} />
                    <meshBasicMaterial
                      map={walkpathTextures.path}
                      transparent
                      alphaTest={0.01}
                      attach="material"
                    />
                  </mesh>
                </>
              )}
          </group>
        ))}
      </group>
    );
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          cursor: cursor,
        }}
        onPointerDown={(e) => {
          if (e.button === 0) { // Left click only
            setCursor(`url(/images/cursor-click.png) 16 44, auto`);
          }
        }}
        onPointerUp={(e) => {
          if (e.button === 0) { // Left click only
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
          depth: true
        }}
        shadows
        dpr={[1, 2]}
      >
        {/* Lighting System */}
        <ambientLight intensity={2.2} color={ambientLightColor} />
        <pointLight
          position={[0, roomHeight/2 - 5, 0]}
          intensity={2.0}
          distance={600}
          decay={2}
          color={centralLightColor}
          castShadow
        />
        <pointLight 
          position={[0, viewerHeight, -roomDepth/2 + 20]}
          intensity={1.5}
          distance={400}
          decay={2}
          color={wallLightColor}
          castShadow
        />
        <pointLight 
          position={[0, viewerHeight, roomDepth/2 - 20]}
          intensity={1.5}
          distance={400}
          decay={2}
          color={wallLightColor}
          castShadow
        />
        <Controls 
          controlsRef={controlsRef} 
          isZoomed={isZoomed} 
          isReturning={isReturning}
          onReturnEnd={handleReturnEnd}
        />
        <Room 
          onEnterIconClick={handleEnterIconClick} 
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          buttonRef={buttonRef}
        />
        {isHovered && outlineReady && buttonRef.current && (
          <EffectComposer>
            <Outline
              selection={[buttonRef.current]}
              edgeStrength={12}
              blur={true}
              visibleEdgeColor="#00FF1A"
              hiddenEdgeColor="#00FF1A"
              width={1200}
              color="#00FF1A"
            />
          </EffectComposer>
        )}
      </Canvas>
      {isZoomed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2000,
            background: 'rgba(0,0,0,0)',
            cursor: 'pointer',
          }}
          onClick={handleOverlayClick}
        />
      )}
      <BGMControl />
    </div>
  );
} 