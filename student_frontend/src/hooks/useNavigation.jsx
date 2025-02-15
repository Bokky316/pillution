import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  updateResponse,
  setCurrentCategoryIndex,
  setCurrentSubCategoryIndex,
  submitSurvey,
  clearResponses,
} from '@/store/surveySlice';

/**
 * @description 설문 탐색 및 제출 훅
 * @returns {object} 탐색 및 제출 핸들러
 */
const useNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    categories,
    currentCategoryIndex,
    currentSubCategoryIndex,
    questions,
    responses,
    filteredCategories,
    filteredSubCategories,
  } = useSelector(state => state.survey);

/**
 * @description 응답 변경 핸들러
 * @param {number} questionId - 질문 ID
 * @param {any} value - 응답 값
 * @param {boolean} isValid - 응답의 유효성 여부
 */
const handleResponseChange = useCallback((questionId, value, isValid) => {
  dispatch(updateResponse({ questionId, value, isValid }));
}, [dispatch]);

  /**
   * @description 이전 버튼 핸들러
   */
  const handlePrevious = useCallback(() => {
    console.log("handlePrevious 호출"); // 이 로그가 출력되는지 확인
    const categoriesToUse = filteredCategories || categories;
    if (currentSubCategoryIndex > 0) {
      dispatch(setCurrentSubCategoryIndex(currentSubCategoryIndex - 1));
    } else if (currentCategoryIndex > 0) {
      dispatch(setCurrentCategoryIndex(currentCategoryIndex - 1));
      const prevCategory = categoriesToUse[currentCategoryIndex - 1];
      dispatch(setCurrentSubCategoryIndex(prevCategory.subCategories.length - 1));
    }
  }, [dispatch, filteredCategories, categories, currentSubCategoryIndex, currentCategoryIndex]);

  /**
   * @description 다음 버튼 핸들러
   */
  const handleNext = useCallback(() => {
    console.log("handleNext 호출"); // 이 로그가 출력되는지 확인
    const categoriesToUse = filteredCategories || categories;
    const currentCategory = categoriesToUse[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;

    if (currentCategoryIndex === categoriesToUse.length - 1 &&
      currentSubCategoryIndex === subCategoriesToUse.length - 1) {

      // responses 객체의 모든 응답을 배열로 변환
      const formattedResponses = Object.entries(responses).map(([qId, response]) => {
        // questionId를 문자열에서 숫자로 변환
        const questionId = parseInt(qId, 10);

        // 해당 질문 찾기 - 전체 questions에서 찾지 않고 categories 내의 모든 questions를 검색
        let question = null;
        for (const cat of categoriesToUse) {
          for (const subCat of cat.subCategories) {
            const foundQuestion = subCat.questions?.find(q => q.id === questionId);
            if (foundQuestion) {
              question = foundQuestion;
              break;
            }
          }
          if (question) break;
        }

        if (!question) return null;

        // 응답 타입에 따라 데이터 포맷 변환
        let formattedResponse = {
          questionId: questionId,
          responseType: question.questionType,
          responseText: null,
          selectedOptions: null
        };

        // 빈 응답 체크
        if (response === null || response === undefined ||
          (Array.isArray(response) && response.length === 0) ||
          (typeof response === 'string' && response.trim() === '')) {
          return null;
        }

        // 응답 타입에 따른 데이터 처리
        switch (question.questionType) {
          case 'TEXT':
            formattedResponse.responseText = response;
            break;
          case 'SINGLE_CHOICE':
            formattedResponse.selectedOptions = [parseInt(response, 10)];
            break;
          case 'MULTIPLE_CHOICE':
            formattedResponse.selectedOptions = Array.isArray(response)
              ? response.map(Number)
              : [Number(response)];
            break;
        }

        return formattedResponse;
      }).filter(response => response !== null);

      console.log('제출할 응답:', formattedResponses); // 디버깅용

      if (formattedResponses.length === 0) {
        alert('제출할 응답이 없습니다.');
        return;
      }

      dispatch(submitSurvey({ responses: formattedResponses }))
        .unwrap()
        .then(() => {
          dispatch(clearResponses());
          // 설문 완료 후 추천 페이지로 이동
          navigate('/recommendation');
        })
        .catch(error => {
          alert(`제출 오류: ${error}`);
        });
    } else {
      if (currentSubCategoryIndex < subCategoriesToUse.length - 1) {
        dispatch(setCurrentSubCategoryIndex(currentSubCategoryIndex + 1));
      } else if (currentCategoryIndex < categoriesToUse.length - 1) {
        dispatch(setCurrentCategoryIndex(currentCategoryIndex + 1));
        dispatch(setCurrentSubCategoryIndex(0));
      }
    }
  }, [dispatch, filteredCategories, categories, currentCategoryIndex, currentSubCategoryIndex,
    filteredSubCategories, responses, navigate]);


/**
 * @description 다음 버튼 비활성화 여부 확인
 * @returns {boolean} 다음 버튼 비활성화 여부
 */
const isNextButtonDisabled = useCallback(() => {
  return questions.some(question => {
    const response = responses[question.id];

    // 응답이 없거나, 응답이 유효하지 않은 경우 true 반환
    if (!response || response.isValid === false) {
      return true;
    }

    // 추가 유효성 검사: 특정 질문의 입력값이 범위를 벗어났는지 확인
    if (question.questionType === 'TEXT') {
      const value = response.trim();
      if (question.questionText.includes('키')) {
        const height = parseInt(value, 10);
        if (isNaN(height) || height < 50 || height > 250) {
          return true; // 키가 유효 범위를 벗어남
        }
      } else if (question.questionText.includes('몸무게')) {
        const weight = parseInt(value, 10);
        if (isNaN(weight) || weight < 10 || weight > 300) {
          return true; // 몸무게가 유효 범위를 벗어남
        }
      } else if (question.questionText.includes('나이')) {
        const age = parseInt(value, 10);
        if (isNaN(age) || age < 1 || age > 120) {
          return true; // 나이가 유효 범위를 벗어남
        }
      }
    }

    return false;
  });
}, [questions, responses]);


  return {
    handleResponseChange,
    handlePrevious,
    handleNext,
    isNextButtonDisabled,
  };
};

export default useNavigation;
