import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function LinkGenerator({ setModalOpen, setLink }) {
  const handleClick = () => {
    const id = uuidv4();
    const baseUrl = window.location.origin; // 현재 실행 중인 페이지의 도메인 사용
    const generated = `${baseUrl}/promise/${id}`; // 올바른 경로로 수정
    setLink(generated);       // ✅ 고쳤다!
    setModalOpen(true);       // ✅ 모달 열기
  };

  return (
    <button onClick={handleClick}>
      링크 생성하기
    </button>
  );
}

