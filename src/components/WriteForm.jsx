import React, { useRef, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./WriteForm.css";
import { promiseAPI } from "../services/api";

export default function WriteForm({ id: propId }) {
  const params = useParams();
  const location = useLocation();
  const { id: locationId, count: stateCount, title: stateTitle, date: stateDate, deadline: stateDeadline } = location.state || {};

  // URL 파라미터, props, 또는 location state에서 ID 가져오기
  const id = params.id || propId || locationId;

  const activityInputRef = useRef(null);
  const [menu, setMenu] = useState("");
  const [activity, setActivity] = useState("");
  const [decoration, setDecoration] = useState(5);
  const [loading, setLoading] = useState(false);

  const [finalResult, setFinalResult] = useState(null);
  const [promiseInfo, setPromiseInfo] = useState(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);

  // 모임 정보 상태 - API에서 가져온 정보와 location.state의 정보를 통합
  const [count, setCount] = useState(stateCount || "");
  const [title, setTitle] = useState(stateTitle || "");
  const [date, setDate] = useState(stateDate || "");
  const [deadline, setDeadline] = useState(stateDeadline || ""); // 임시 마감 기한 설정

  // 약속 현황 및 제출 상태 추적
  const [submitted, setSubmitted] = useState(false);
  const [promiseStatus, setPromiseStatus] = useState(null);
  const [allSubmitted, setAllSubmitted] = useState(false);

  // 제출 완료 팝업 상태
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (activityInputRef.current) {
      activityInputRef.current.focus();
    }
  }, []);

  // 약속 정보 및 최종 결과 조회
  useEffect(() => {
    if (!id) {
      setFetchingData(false);
      return;
    }

    setFetchingData(true);
    setError(null);

    // 약속 정보 조회
    const fetchPromiseInfo = async () => {
      try {
        const response = await promiseAPI.getPromiseInfo(id);
        if (response.ok) {
          const data = await response.json();
          console.log("약속 정보:", data);
          setPromiseInfo(data);

          // API에서 가져온 모임 정보로 상태 업데이트 (state에 없는 경우에만)
          if (!stateCount && data.numberOfPeople) {
            setCount(data.numberOfPeople.toString());
          }
          if (!stateTitle && data.promiseName) {
            setTitle(data.promiseName);
          }
          if (!stateDate && data.promiseDate) {
            // 날짜 부분만 추출 (YYYY-MM-DD)
            const dateOnly = data.promiseDate.split('T')[0];
            setDate(dateOnly);
          }

          return data;
        } else if (response.status === 404) {
          throw new Error("약속 정보를 찾을 수 없습니다.");
        } else {
          throw new Error("약속 정보 조회 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("약속 정보 조회 실패:", error);
        setError(error.message);
        return null;
      }
    };

    // 최종 결과 조회
    const fetchFinalResult = async () => {
      try {
        const response = await promiseAPI.getFinalResult(id);
        if (response.ok) {
          const data = await response.json();
          console.log("최종 결과:", data);

          // 이 시점에서는 최종 결과가 있더라도 바로 설정하지 않음
          // 모든 참가자가 제출했는지 확인 후 설정
          return data;
        } else if (response.status === 404) {
          // 404는 정상적인 경우: 아직 최종 결과가 생성되지 않음
          return null;
        } else {
          console.log("최종 결과 없음:", response.status);
          return null;
        }
      } catch (error) {
        console.error("최종 결과 조회 실패:", error);
        return null;
      }
    };

    // 약속 현황 조회 (제출 여부 확인용)
    const fetchPromiseStatus = async () => {
      try {
        const response = await promiseAPI.getPromiseStatus(id);
        if (response.ok) {
          const data = await response.json();
          console.log("약속 현황:", data);

          // 상태 저장
          setPromiseStatus(data);

          // 현재 사용자가 제출했는지 확인
          const hasSubmitted = data.participants?.some(
            participant => participant.status === "submitted"
          );

          if (hasSubmitted) {
            setSubmitted(true);
          }

          // 모든 참가자가 제출했는지 확인
          const isAllSubmitted = data.submittedCount === data.totalParticipants;
          setAllSubmitted(isAllSubmitted);

          console.log(`제출 현황: ${data.submittedCount}/${data.totalParticipants} 완료`);

          return { data, isAllSubmitted };
        }
        return { data: null, isAllSubmitted: false };
      } catch (error) {
        console.error("약속 현황 조회 실패:", error);
        return { data: null, isAllSubmitted: false };
      }
    };

    // API 호출 실행
    const fetchData = async () => {
      const infoData = await fetchPromiseInfo();
      if (!infoData) {
        setFetchingData(false);
        return;
      }

      // 약속 현황 확인 (모든 참가자가 제출했는지)
      const { isAllSubmitted } = await fetchPromiseStatus();

      // 최종 결과 가져오기
      const finalResultData = await fetchFinalResult();

      // 모든 참가자가 제출한 경우에만 최종 결과 표시
      if (isAllSubmitted && finalResultData) {
        setFinalResult(finalResultData);
      } else if (finalResultData) {
        console.log("아직 모든 참가자가 제출하지 않았습니다. 최종 결과를 표시하지 않습니다.");
      }

      setFetchingData(false);
    };

    fetchData();
  }, [id]);

  const getStyleLabel = (val) => {
    if (val <= 2) return "🩳 마실룩";
    if (val <= 5) return "👟 꾸안꾸";
    if (val <= 8) return "👠 꾸꾸";
    return "👑 꾸꾸꾸";
  };

  const handleSubmit = async () => {
    if (!menu.trim() || !activity.trim()) {
      alert("메뉴와 활동을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    console.log("작성 내용 제출:", { id, menu, activity, decoration });

    try {
      const response = await promiseAPI.submitPromise({
        id,
        menu,
        activity,
        decoration
      });

      if (!response.ok) {
        let errorMessage = "서버 오류";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("오류 응답 파싱 실패:", e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("제출 결과:", result);

      // 약속 현황 조회하여 마지막 제출자인지 확인
      let isLastSubmitter = false;

      try {
        const statusResponse = await promiseAPI.getPromiseStatus(id);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          // 제출 후 상태 업데이트
          setPromiseStatus(statusData);

          // 마지막 제출자인지 확인 (제출 완료 수 = 총 참가자 수 - 1 + 현재 제출)
          isLastSubmitter = statusData.submittedCount >= statusData.totalParticipants;
          setAllSubmitted(isLastSubmitter);

          console.log(`제출 현황: ${statusData.submittedCount}/${statusData.totalParticipants} 완료, 마지막 제출자: ${isLastSubmitter}`);
        }
      } catch (error) {
        console.error("약속 현황 조회 실패:", error);
      }

      // 팝업창 표시 (기존 alert 대체) - 마지막 제출자 여부에 따라 메시지 변경
      setShowPopup(true);
      setSubmitted(true);

      // 제출 후 정보와 최종 결과를 다시 조회
      try {
        // 약속 정보 다시 조회
        const infoResponse = await promiseAPI.getPromiseInfo(id);
        if (infoResponse.ok) {
          setPromiseInfo(await infoResponse.json());
        }

        // 마지막 제출자인 경우 최종 결과 조회
        if (isLastSubmitter) {
          const finalResponse = await promiseAPI.getFinalResult(id);
          if (finalResponse.ok) {
            setFinalResult(await finalResponse.json());
          }
        }
      } catch (refreshError) {
        console.error("데이터 새로고침 중 오류:", refreshError);
      }
    } catch (error) {
      alert("제출 중 오류가 발생했습니다: " + error.message);
      console.error("제출 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 날짜와 시간 포맷 함수
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const d = new Date(dateTimeString);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch {
      return dateTimeString;
    }
  };

  if (fetchingData) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div>오류 발생: {error}</div>;
  }

  if (finalResult) { // 아직 Fianl.css와 연결하지 않아서 임시적으로 만들어둔 최종 결과 확인서
    return (
      <div className="page-wrapper">
        <div className="form-container">
          <h2 className="form-title">✨ 약속서가 완성되었습니다! ✨</h2>
          <p><strong>약속명:</strong> {finalResult.promiseName}</p>
          <p><strong>약속 날짜:</strong> {formatDateTime(finalResult.promiseDate)}</p>
          <div className="final-result-box">
            <h3>속닥약속 조율이의 조율 제안</h3>
            <p className="final-coordination" style={{ whiteSpace: 'pre-line' }}>{finalResult.finalCoordination}</p>
            <p className="generated-time">생성 시간: {formatDateTime(finalResult.generatedAt)}</p>
          </div>
          <button className="form-button" onClick={() => window.location.reload()}>
            이미지 저장하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="form-container">
        <h2 className="form-title">약속서 작성</h2>

        <div className="form-summary">
          <p>👥 인원 수: {count}명</p>
          <p>📌 모임명: {title}</p>
          <p>📅 날짜: {date}</p>
          <p>⏰ 마감 기한: {deadline ? formatDateTime(deadline) : '없음'}</p>
        </div>

        <label className="form-label">어떤 메뉴가 마음에 끌리시나요?</label>
        <textarea
          className="form-textarea"
          placeholder="예: 마라탕, 초밥, 삼겹살..."
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
        />

        <label className="form-label">어떤 걸 하면서 즐기고 싶으세요?</label>
        <textarea
          ref={activityInputRef}
          className="form-textarea"
          placeholder="예: 보드게임, 카페에서 수다, 산책"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        />

        <label className="form-label">꾸밈 정도는?</label>
        <div className="range-wrapper" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <input
            type="range"
            min="0"
            max="10"
            className="form-range"
            value={decoration}
            onChange={(e) => setDecoration(Number(e.target.value))}
          />
          <div className="range-label" style={{ transform: "translateY(-2px)" }}>{getStyleLabel(decoration)}</div>
        </div>

        <button
          className="form-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "제출 중..." : "약속서 제출하기"}
        </button>
      </div>

      {/* 제출 완료 팝업 */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-content">
              <h3>✅ 약속서 제출 완료</h3>
              <p>약속서가 성공적으로 제출되었습니다!</p>

              {allSubmitted ? (
                <>
                  <p className="special-notice">🎉 축하합니다! 모든 참가자의 제출이 완료되었습니다.</p>
                  <p>잠시 후 화면이 새로고침되어 최종 약속 조율 결과를 확인하실 수 있습니다.</p>
                </>
              ) : (
                <p>모든 참가자가 제출하면 최종 조율 결과를 확인할 수 있습니다.</p>
              )}

              <button
                className="popup-button"
                onClick={() => {
                  setShowPopup(false);
                  // 모든 참가자가 제출했다면 3초 후 화면을 새로고침하여 최종 결과 표시
                  if (allSubmitted) {
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  }
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


