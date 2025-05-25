import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { promiseAPI } from "../services/api";

import MeetingForm from "./MeetingForm";
import LinkModal from "./LinkModal";

function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [link, setLink] = useState("");
  const [loadingPromise, setLoadingPromise] = useState(false);
  const [promiseId, setPromiseId] = useState("");
  const [promiseData, setPromiseData] = useState(null);
  const navigate = useNavigate();

  const handleFormSubmit = async (formData) => {
    console.log("폼 데이터:", formData);

    if (!formData.title || !formData.count || !formData.date) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    setLoadingPromise(true);

    try {
      // 고유 ID 생성
      const id = uuidv4();
      console.log("생성된 ID:", id);

      // API를 통해 약속 생성
      const response = await promiseAPI.createPromise({
        ...formData,
        id,
      });

      // 응답 처리
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API 오류:", errorText);
        throw new Error("약속 생성 중 오류가 발생했습니다");
      }

      // JSON 형식으로 응답 파싱
      let responseData;
      try {
        responseData = await response.json();
        console.log("API 응답 데이터:", responseData);
      } catch (e) {
        console.error("JSON 파싱 오류:", e);
        throw new Error("서버 응답을 처리할 수 없습니다");
      }

      // API 응답에서 promiseId 추출
      const responsePromiseId = responseData.promiseId || id;

      // 링크 생성 - 항상 /promise/{id} 형식으로 통일
      const baseUrl = window.location.origin;
      const newLink = `${baseUrl}/promise/${responsePromiseId}`;

      // 상태 업데이트
      setPromiseId(responsePromiseId);
      setPromiseData({
        ...formData,
        id: responsePromiseId,
      });
      setLink(newLink);
      setModalOpen(true);
    } catch (error) {
      alert("약속 생성 중 오류가 발생했습니다: " + error.message);
      console.error("약속 생성 중 오류:", error);
    } finally {
      setLoadingPromise(false);
    }
  };

  const handleStart = () => {
    console.log("약속서 작성 시작!");
    setModalOpen(false);

    // 항상 /promise/{id} 경로로 이동하도록 통일
    if (promiseId) {
      navigate(`/promise/${promiseId}`);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div className="home-page">
      <MeetingForm onSubmit={handleFormSubmit} isLoading={loadingPromise} />

      {modalOpen && (
        <LinkModal
          link={link}
          onClose={handleModalClose}
          onStart={handleStart}
        />
      )}
    </div>
  );
}

export default HomePage;
