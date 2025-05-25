/**
 * API 호출을 위한 유틸리티 함수
 */

// 개발 환경에서는 프록시를 통해 요청하기 위해 상대 경로만 사용
// package.json의 "proxy" 설정과 함께 작동
const API_PATH = '/api';

/**
 * API 요청을 처리하는 기본 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise} fetch 응답
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    // 디버깅용 로그
    console.log(`API 요청: ${endpoint}`, options);

    // 헤더에 Content-Type 기본값 설정
    if (options.body && !options.headers?.['Content-Type']) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
    }

    // 프록시를 사용하기 위해 상대 경로로 요청
    const url = `${API_PATH}${endpoint}`;
    console.log(`요청 URL: ${url}`);

    const response = await fetch(url, options);

    // 응답 디버깅
    console.log(`API 응답 상태: ${response.status}`);

    return response;
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 약속 관련 API 호출 함수들
 */
export const promiseAPI = {
  // 1. 약속 생성 API
  createPromise: async (data) => {
    // 날짜에 시간이 포함되어 있지 않으면 기본 시간(18:00:00)을 추가
    let promiseDate = data.date;
    if (promiseDate && !promiseDate.includes('T')) {
      promiseDate = `${promiseDate}T18:00:00`;
    }

    const requestBody = {
      promiseId: data.id,
      promiseName: data.title,
      numberOfPeople: parseInt(data.count),
      promiseDate: promiseDate
    };

    console.log('약속 생성 요청 데이터:', requestBody);

    return apiRequest('/promises/create', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
  },

  // 2. 약속서 제출 API
  submitPromise: async (data) => {
    const requestBody = {
      promiseId: data.id,
      promiseContent: {
        food: data.menu,
        activity: data.activity,
        dressCodeLevel: data.decoration
      },
      userId: data.userId || null // 선택 사항, 없으면 null
    };

    console.log('약속서 제출 요청 데이터:', requestBody);

    return apiRequest('/promises/submit', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
  },

  // 3. 약속 정보 조회 API
  getPromiseInfo: async (promiseId) => {
    return apiRequest(`/promises/${promiseId}`);
  },

  // 4. 약속 현황 조회 API (참가자 상태 확인)
  getPromiseStatus: async (promiseId) => {
    return apiRequest(`/promises/${promiseId}/status`);
  },

  // 5. 최종 약속 조율서 조회 API (백엔드 응답 형식 변환 포함)
  getFinalResult: async (promiseId) => {
    try {
      const response = await apiRequest(`/promises/${promiseId}/results`);

      // 응답이 성공적이지 않으면 원본 응답 그대로 반환
      if (!response.ok) {
        return response;
      }

      // 원본 데이터 가져오기
      const originalData = await response.json();
      console.log("원본 API 응답:", originalData);

      // 내용 구분 처리: 정규식을 사용해 "메뉴:", "활동:", "드레스코드:" 등의 부분을 찾아 두 줄씩 띄움
      let finalCoordination = originalData.finalCoordination || originalData.result || "약속 내용이 아직 준비되지 않았습니다.";

      // 각 분야별 구분을 위한 키워드들
      const keywords = ["메뉴:", "음식:", "활동:", "할것:", "장소:", "드레스코드:", "복장:", "꾸밈:"];

      // 각 키워드 앞에 두 줄 띄우기
      keywords.forEach(keyword => {
        // 정규식으로 키워드를 찾아 앞에 두 줄 띄우기
        const regex = new RegExp(`([^\\n])${keyword}`, 'g');
        finalCoordination = finalCoordination.replace(regex, `$1\n\n${keyword}`);
      });

      // 백엔드 응답을 프론트엔드 형식으로 변환
      // 필드명이 다른 경우 매핑 처리 (실제 백엔드 응답 구조에 맞게 조정 필요)
      const transformedData = {
        promiseId: originalData.promiseId || promiseId,
        promiseName: originalData.promiseName || originalData.title || "약속",
        promiseDate: originalData.promiseDate || originalData.date || new Date().toISOString(),
        generatedAt: originalData.generatedAt || new Date().toISOString(),
        finalCoordination: finalCoordination
      };

      console.log("변환된 데이터:", transformedData);

      // 성공 응답 생성 (JSON.stringify 없이 직접 객체 반환)
      return {
        ok: true,
        status: response.status,
        json: () => Promise.resolve(transformedData)
      };
    } catch (error) {
      console.error("최종 결과 조회/변환 중 오류:", error);
      // 오류 응답 생성
      return {
        ok: false,
        status: 500,
        statusText: error.message,
        json: () => Promise.resolve({ error: error.message })
      };
    }
  }
};

export default {
  promiseAPI
};

