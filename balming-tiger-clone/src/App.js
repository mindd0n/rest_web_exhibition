import React, { useRef, useEffect } from 'react';
import RoomScene from './components/Room';
import { Canvas } from '@react-three/fiber';

function App() {
  // 커서 동적 변경은 body에만 적용
  useEffect(() => {
    const handlePointerDown = () => {
      document.body.style.cursor = "url('/images/cursor-click.png') 16 44, auto";
    };
    const handlePointerUp = () => {
      document.body.style.cursor = "url('/images/cursor.png') 16 44, auto";
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.body.style.cursor = "url('/images/cursor.png') 16 44, auto";
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return <RoomScene />;
}

export default App;
