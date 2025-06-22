import React, { useState } from 'react';
import HoyaStoryModal from './components/HoyaStoryModal';

function App() {
  const [showStory, setShowStory] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowStory(true)}
        style={{
          position: 'absolute',
          top: '60%',
          left: '30%',
          padding: '10px 20px',
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        호야 스토리 보기
      </button>
      {showStory && <HoyaStoryModal onClose={() => setShowStory(false)} />}
    </>
  );
}

export default App;
