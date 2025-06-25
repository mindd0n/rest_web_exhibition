import React, { useState, useEffect } from "react";
import DiaryModal from "./DiaryModal";
import "./index.css";

function App() {
  const [showDiary, setShowDiary] = useState(false);

  const handleOpenDiary = () => setShowDiary(true);
  const handleCloseDiary = () => setShowDiary(false);

  useEffect(() => {
    // 컴포넌트가 마운트되면 바로 다이어리 열기
    setTimeout(() => {
      setShowDiary(true);
    }, 100);
  }, []);

  return (
    <div className="App">
      {showDiary && (
        <DiaryModal onClose={handleCloseDiary} />
      )}
    </div>
  );
}

export default App;
