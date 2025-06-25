import React from 'react';

const DiaryContent = () => (
  <div style={{ width: '100%', height: '100%', padding: 32, boxSizing: 'border-box', overflowY: 'auto', background: 'white', borderRadius: 8 }}>
    <h2 style={{ textAlign: 'center', marginBottom: 24 }}>다이어리</h2>
    <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
      <img src="/content/btn_p_note/images/1.jpg" alt="다이어리 이미지" style={{ width: 240, height: 'auto', borderRadius: 8 }} />
      <div style={{ flex: 1 }}>
        <p>임실에 온 지 거의 2주간 시간이 흘렀다.<br />
        ... (여기에 다이어리 텍스트를 추가하세요) ...
        </p>
      </div>
    </div>
  </div>
);

export default DiaryContent; 