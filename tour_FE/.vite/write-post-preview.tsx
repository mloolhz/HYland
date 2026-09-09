import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { WritePost } from '../src/pages/WritePost';
import { SessionProvider } from '../src/store/session';
import { MissionProgressProvider } from '../src/store/mission-progress';
import '../src/index.css';
import '../src/styles/community.css';

function Preview() {
  const [message, setMessage] = useState('');
  return <>
    <style>{`.cm-page { padding-top: 0; } .cm-header-band { display: none; }`}</style>
    <p className="cm-review-note" style={{textAlign:'center',padding:'12px 20px'}}>후기 작성 미리보기 · 입력과 태그 선택을 체험할 수 있으며 실제로 등록되지 않습니다.</p>
    {message && <p role="status" className="cm-review-note" style={{textAlign:'center'}}>{message}</p>}
    <div onSubmitCapture={(event) => {
      event.preventDefault();
      event.stopPropagation();
      setMessage('미리보기에서는 후기가 등록되지 않습니다.');
    }}>
      <WritePost />
    </div>
  </>;
}

createRoot(document.getElementById('root')!).render(
  <MemoryRouter><SessionProvider><MissionProgressProvider><Preview /></MissionProgressProvider></SessionProvider></MemoryRouter>,
);
