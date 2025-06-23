import React, { useState } from 'react';
import SleepNewspaperModal from './components/SleepNewspaperModal';

function App() {
  const [showPaper, setShowPaper] = useState(false);

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'flex-end', 
      alignItems: 'flex-start',
      padding: '20px'
    }}>
      <button 
        onClick={() => setShowPaper(true)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        📰 신문 보기
      </button>
      {showPaper && <SleepNewspaperModal onClose={() => setShowPaper(false)} />}
    </div>
  );
}

export default App;
