import React from 'react';
import { useLocation } from 'react-router-dom';
import './Final.css';

export default function FinalPromiseApp() {
  const { state } = useLocation();
  const { menu, activity, styleLevel, title, date } = state || {};

  const getStyleLabel = (val) => {
    if (val <= 2) return "🩳 마실룩";
    if (val <= 5) return "👟 꾸안꾸";
    if (val <= 8) return "👠 꾸꾸";
    return "👑 꾸꾸꾸";
  };

  return (
    <div className="final-wrapper">
      <div className="final-card">
        <div className="final-title">{title}의 최종약속서</div>
        <div className="final-date">약속일시: {date}</div>

        <div className="final-section">
          <div className="final-label">🍽 오늘 먹고 싶은 메뉴</div>
          <div className="final-content">{menu?.trim() || '없음'}</div>
        </div>

        <div className="final-section">
          <div className="final-label">🎲 오늘 하고 싶은 활동</div>
          <div className="final-content">{activity?.trim() || '없음'}</div>
        </div>

        <div className="final-section">
          <div className="final-label">💄 오늘의 꾸밈 정도</div>
          <div className="final-content">{getStyleLabel(styleLevel)}</div>
        </div>
      </div>
    </div>
  );
}
