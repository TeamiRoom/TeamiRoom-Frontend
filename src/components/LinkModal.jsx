import React, { useState } from "react";

export default function LinkModal({ link, onClose, onStart }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // 메시지 1.5초 후 사라짐
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 (오른쪽 위 플로팅) */}
        <button style={styles.closeX} onClick={onClose}>×</button>

        <h3 style={styles.label}>링크 공유하기</h3>
        <div style={styles.inputRow}>
          <input type="text" value={link} readOnly style={styles.input} />
          <button onClick={handleCopy} style={styles.iconBtn}>🔗</button>
        </div>

        {/* 복사 완료 메시지 */}
        {copied && <p style={styles.copiedText}>📋 복사되었습니다!</p>}

        <p style={styles.message}>약속서 링크생성이 완료되었습니다!</p>

        <button onClick={onStart} style={styles.mainBtn}>
          약속서 바로 작성하기
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    position: "relative",
    backgroundColor: "#fff",
    padding: "30px 20px", // ✅ 좌우 여백 확보
    borderRadius: "12px",
    margin: "0 16px",      // ✅ 폰에서 좌우 margin
    width: "100%",         // 전체 영역 쓰되
    maxWidth: "400px",     // 최대 너비 제한
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    boxSizing: "border-box", // ✅ padding 포함
  },
  closeX: {
    position: "absolute",
    top: "12px",
    right: "16px",
    fontSize: "22px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
  },
  label: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "12px",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  iconBtn: {
    fontSize: "20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "5px",
  },
  copiedText: {
    color: "green",
    fontSize: "14px",
    marginBottom: "10px",
  },
  message: {
    fontWeight: "bold",
    fontSize: "15px",
    marginBottom: "16px",
  },
  mainBtn: {
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "14px 20px",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
  },
};