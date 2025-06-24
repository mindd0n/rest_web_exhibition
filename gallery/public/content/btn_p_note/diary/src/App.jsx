import React, { useState } from "react";
import DiaryModal from "./DiaryModal";
import "./index.css";

function App() {
  const [showDiary, setShowDiary] = useState(false);

  const handleOpenDiary = () => setShowDiary(true);
  const handleCloseDiary = () => setShowDiary(false);

  return (
    <div className="app-container">
      {!showDiary && (
        <div className="icon-wrapper" onClick={handleOpenDiary}>
          <img src="/images/1.jpg" alt="Open Diary" className="icon-image" />
        </div>
      )}
      {showDiary && <DiaryModal onClose={handleCloseDiary} />}
    </div>
  );
}

export default App;
