import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BGMControl from './BGMControl';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import './styles.css';

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

// 이미지, 텍스처, canvas를 useMemo로 캐싱하는 훅
function useButtonImageData(src, wallType) {
  const [ready, setReady] = React.useState(false);
  const [size, setSize] = React.useState([1, 1]);
  const [texture, setTexture] = React.useState();
  const [image, setImage] = React.useState();
  const [canvas, setCanvas] = React.useState();
  React.useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      setImage(img);
      const w = wallType === 'ceiling' || wallType === 'floor' ? 2000 : 2000;
      const h = wallType === 'ceiling' || wallType === 'floor' ? 2000 : 1800;
      setSize([
        img.naturalWidth / w * roomWidth,
        img.naturalHeight / h * (wallType === 'ceiling' || wallType === 'floor' ? roomDepth : roomHeight)
      ]);
      setTexture(loadTexture(src));
      // Canvas 생성 시 willReadFrequently 속성 추가
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      const ctx = cvs.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      setCanvas(cvs);
      setReady(true);
    };
    img.onerror = () => { if (!cancelled) setReady(false); };
    img.src = src;
    return () => { cancelled = true; };
  }, [src, wallType]);
  return [size, texture, image, canvas, ready];
}

// getZoomTargetForButton 방어 코드 강화
function getZoomTargetForButton(position, wallType, distance = 0.0001) {
  let safePos = [0, 0, 0];
  if (Array.isArray(position)) {
    safePos[0] = typeof position[0] === 'number' ? position[0] : 0;
    safePos[1] = typeof position[1] === 'number' ? position[1] : 0;
    safePos[2] = typeof position[2] === 'number' ? position[2] : 0;
  }
  const normal = wallNormals[wallType] || [0, 0, 1];
  const camPos = [
    safePos[0] + normal[0] * distance,
    safePos[1] + normal[1] * distance,
    (safePos[2] || 0) + normal[2] * distance,
  ];
  return {
    position: camPos,
    lookAt: [safePos[0], safePos[1], safePos[2] || 0],
  };
}

// Button 컴포넌트 수정
const Button = React.memo(function Button({ 
  type, 
  position, 
  src, 
  wallType, 
  setZoomTarget, 
  setSavedCamera, 
  hoveredObject, 
  setHoveredObject, 
  buttonKey, 
  hoverSrc, 
  controlsRef,
  setSelectedButton
}) {
  const isHovered = hoveredObject === buttonKey;
  const [size, texture, image, canvas, ready] = useButtonImageData(isHovered ? hoverSrc : src, wallType);
  const z = position && position[2] !== undefined ? position[2] : 0.05;
  
  // 클릭 이벤트 처리 개선
  const handleClick = useCallback((e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    const pos = Array.isArray(position) ? position : [0, 0];
    if (!image || !texture || !canvas) return;
    const uv = e.uv;
    if (!uv) return;
    // plane 크기와 이미지 크기 비율 보정
    const [planeWidth, planeHeight] = size;
    const x = Math.floor(uv.x * image.naturalWidth);
    const y = Math.floor((1 - uv.y) * image.naturalHeight);
    // 혹시라도 plane과 이미지 비율이 다르면 아래처럼 보정
    // const x = Math.floor(uv.x * planeWidth / planeWidth * image.naturalWidth);
    // const y = Math.floor((1 - uv.y) * planeHeight / planeHeight * image.naturalHeight);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const alpha = ctx.getImageData(x, y, 1, 1).data[3] / 255;
    if (alpha > 0.1) {
      if (controlsRef && controlsRef.current && controlsRef.current.object) {
        const camera = controlsRef.current.object;
        const camPos = camera.position.clone();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const lookAt = camPos.clone().add(dir.multiplyScalar(100));
        setSavedCamera({ position: camPos, lookAt });
      }
      setZoomTarget(getZoomTargetForButton([...pos, z], wallType));
      setHoveredObject(buttonKey); // 클릭 시 hoveredObject도 설정
      setSelectedButton(buttonKey); // 클릭 시 selectedButton 설정
    }
  }, [position, image, texture, canvas, controlsRef, setSavedCamera, setZoomTarget, setHoveredObject, buttonKey, wallType, z, setSelectedButton, size]);

  // 호버 이벤트 처리 개선
  const handlePointerMove = useCallback((e) => {
    e.stopPropagation();
    const pos = Array.isArray(position) ? position : [0, 0];
    if (!image || !texture || !canvas) return;
    const uv = e.uv;
    if (!uv) return;
    // plane 크기와 이미지 크기 비율 보정
    const [planeWidth, planeHeight] = size;
    const x = Math.floor(uv.x * image.naturalWidth);
    const y = Math.floor((1 - uv.y) * image.naturalHeight);
    // const x = Math.floor(uv.x * planeWidth / planeWidth * image.naturalWidth);
    // const y = Math.floor((1 - uv.y) * planeHeight / planeHeight * image.naturalHeight);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const alpha = ctx.getImageData(x, y, 1, 1).data[3] / 255;
    if (alpha > 0.1 && hoveredObject !== buttonKey) {
      setHoveredObject(buttonKey);
    }
  }, [position, image, texture, canvas, hoveredObject, buttonKey, setHoveredObject, size]);

  const handlePointerOut = useCallback(() => {
    if (hoveredObject === buttonKey) {
      setHoveredObject(null);
    }
  }, [hoveredObject, buttonKey, setHoveredObject]);

  if (!ready) return null;

  return (
    <mesh
      position={Array.isArray(position) ? position : [0, 0, z]}
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
  wallButtonData[wall] = files.map(f => ({ src: `/images/buttons/${wallButtonFolders[wall]}/${f}` }));
});

// Popup 컴포넌트 추가
const Popup = React.memo(function Popup({ isOpen, onClose, buttonType }) {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      zIndex: 2001,
      minWidth: '300px',
      minHeight: '200px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{ margin: 0 }}>Button: {buttonType}</h2>
        <button 
          onClick={onClose}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
      <div>
        {/* 여기에 팝업 내용이 추가될 예정입니다 */}
        <p>팝업 내용이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
});

export default function RoomScene() {
  const controlsRef = useRef();
  const [zoomTarget, setZoomTarget] = useState(null);
  const [savedCamera, setSavedCamera] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef();
  const [outlineReady, setOutlineReady] = useState(false);
  const [cursor, setCursor] = useState(`url(/images/cursor.png) 16 44, auto`);
  const [zoomOutTarget, setZoomOutTarget] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const sunButtonRef = useRef();
  const pathButtonRef = useRef();
  const signButtonRef = useRef();
  const bridgeButtonRef = useRef();
  const [selectedButton, setSelectedButton] = useState(null);

  // ESC 또는 오버레이 클릭 시 복귀
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && zoomTarget) {
        setZoomTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomTarget]);

  const handleOverlayClick = useCallback(() => {
    if (zoomTarget) {
      setZoomTarget(null);
      setSelectedButton(null);
    }
  }, [zoomTarget]);

  // Controls 컴포넌트: 카메라 이동만 부드럽게 lerp
  const Controls = useMemo(() => {
    return function Controls({ controlsRef, zoomTarget, savedCamera, selectedButton }) {
      const { camera, gl } = useThree();
      const defaultPos = useMemo(() => new THREE.Vector3(0, viewerHeight, minDistance), []);
      const defaultLook = useMemo(() => new THREE.Vector3(0, 0, -roomDepth / 2), []);
      const targetPos = useMemo(() => zoomTarget ? new THREE.Vector3(...zoomTarget.position) : (savedCamera ? savedCamera.position : defaultPos), [zoomTarget, savedCamera, defaultPos]);
      const targetLook = useMemo(() => zoomTarget ? new THREE.Vector3(...zoomTarget.lookAt) : (savedCamera ? savedCamera.lookAt : defaultLook), [zoomTarget, savedCamera, defaultLook]);
      
      useFrame(() => {
        if (zoomTarget) {
          // 더 빠른 줌인 효과를 위해 lerp 계수를 0.8로 증가
          camera.position.lerp(targetPos, 0.8);
          // camera.lookAt(targetLook); // 화면이 돌아가지 않도록 주석 처리
        }
      });
      
      return (
        <OrbitControls
          ref={controlsRef}
          args={[camera, gl.domElement]}
          minDistance={minDistance}
          maxDistance={roomDepth}
          enablePan={zoomTarget ? false : true}
          enableZoom={zoomTarget ? false : true}
          enableRotate={zoomTarget ? false : true}
          enabled={!(zoomTarget || selectedButton)}
          makeDefault
        />
      );
    };
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
    return function Room({ isHovered, setIsHovered, buttonRef, setHoveredObject, hoveredObject, setZoomTarget, setSavedCamera }) {
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
                  let pos = [0, 0, 0.01];
                  if (wall.type === 'ceiling') pos = [0, 0, -0.05];
                  else if (wall.type === 'floor') pos = [0, 0, 0.05];
                  // 전면 벽에서 btn_p_go만 z=0.02로 더 앞으로
                  else if (wall.type === 'front' && btn.src.includes('btn_p_go')) pos = [0, 0, 0.02];
                  const buttonKey = `${wall.type}_btn_${idx}`;
                  const hoverSrc = btn.src.replace(/\.png$/, '_hover.png');
                  return (
                    <Button
                      key={btn.src}
                      type={`${wall.type}_btn_${idx}`}
                      buttonKey={buttonKey}
                      position={pos}
                      src={btn.src}
                      hoverSrc={hoverSrc}
                      wallType={wall.type}
                      setZoomTarget={setZoomTarget}
                      setSavedCamera={setSavedCamera}
                      setHoveredObject={setHoveredObject}
                      hoveredObject={hoveredObject}
                      controlsRef={controlsRef}
                      setSelectedButton={setSelectedButton}
                    />
                  );
                })}
              </group>
            ))}
            {/* 천장 버튼 */}
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
              {wallButtonData.ceiling.map((btn, idx) => (
                    <Button
                  key={btn.src}
                  type={`ceiling_btn_${idx}`}
                  position={[0, 0]}
                  src={btn.src}
                  wallType={'ceiling'}
                      setZoomTarget={setZoomTarget}
                  setSavedCamera={setSavedCamera}
                      setHoveredObject={setHoveredObject}
                      hoveredObject={hoveredObject}
                  controlsRef={controlsRef}
                  setSelectedButton={setSelectedButton}
                />
              ))}
            </group>
            {/* 바닥 버튼 */}
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
              {wallButtonData.floor.map((btn, idx) => (
                    <Button
                  key={btn.src}
                  type={`floor_btn_${idx}`}
                  position={[0, 0]}
                  src={btn.src}
                  wallType={'floor'}
                      setZoomTarget={setZoomTarget}
                  setSavedCamera={setSavedCamera}
                      setHoveredObject={setHoveredObject}
                      hoveredObject={hoveredObject}
                  controlsRef={controlsRef}
                  setSelectedButton={setSelectedButton}
                />
              ))}
              </group>
          </group>
        </>
      );
    };
  }, []);

  // 팝업창 표시 로직 개선
  useEffect(() => {
    if (selectedButton) {
      // 팝업창이 표시될 때 줌인 효과 적용
      const buttonType = selectedButton.split('_')[0];
      const buttonIndex = selectedButton.split('_')[2];
      const buttonData = wallButtonData[buttonType]?.[buttonIndex];
      
      if (buttonData) {
        const pos = [0, 0, 0.05]; // 기본 위치
        setZoomTarget(getZoomTargetForButton(pos, buttonType));
      }
    }
  }, [selectedButton]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          cursor: cursor,
        }}
        onPointerDown={(e) => {
          if (e.button === 0) {
            setCursor(`url(/images/cursor-click.png) 16 44, auto`);
          }
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
          antialias: false,
          stencil: false,
          depth: true,
          alpha: true,
          premultipliedAlpha: false
        }}
        shadows={false}
        dpr={[1, 1.5]}
        frameloop="demand"
      >
        <EnableLayer1OnCamera />
        <Room
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          buttonRef={buttonRef}
          setHoveredObject={setHoveredObject}
          hoveredObject={hoveredObject}
          setZoomTarget={setZoomTarget}
          setSavedCamera={setSavedCamera}
        />
        <Controls
          controlsRef={controlsRef}
          zoomTarget={zoomTarget}
          savedCamera={savedCamera}
          selectedButton={selectedButton}
        />
      </Canvas>
      {zoomTarget && (
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
      <Popup 
        isOpen={!!selectedButton} 
        onClose={() => {
          setSelectedButton(null);
          setZoomTarget(null);
        }}
        buttonType={selectedButton}
      />
      <BGMControl />
    </div>
  );
}