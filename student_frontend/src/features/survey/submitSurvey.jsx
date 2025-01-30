// features/survey/submitSurvey.js

import { submitSurveyResponses } from '../auth/api';

/**
 * 설문 응답 데이터를 제출합니다.
 * @param {Object} responses 사용자 응답 데이터
 * @param {Function} navigate 페이지 이동 함수
 */
const submitSurvey = async (responses, navigate) => {
  try {
    await submitSurveyResponses(responses); // API 호출을 통해 설문 제출
    alert('설문이 성공적으로 제출되었습니다.');
    navigate('/recommendations'); // 추천 결과 페이지로 이동
  } catch (err) {
    console.error('설문 제출 오류:', err);
    alert('설문 제출에 실패했습니다. 다시 시도해주세요.');
  }
};

export default submitSurvey;
