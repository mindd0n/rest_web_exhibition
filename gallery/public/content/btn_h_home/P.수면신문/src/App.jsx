import React, { useState } from 'react';
import SleepNewspaperModal from './components/SleepNewspaperModal';

function App() {
  const [showPaper, setShowPaper] = useState(false);

  return (
    <div>
      <button onClick={() => setShowPaper(true)}>📰 신문 보기</button>
      {showPaper && <SleepNewspaperModal onClose={() => setShowPaper(false)} />}
    </div>
  );
}

export default App;
