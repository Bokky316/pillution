import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import {
  fetchCategories,
  fetchQuestions,
  updateResponse,
  setCurrentCategoryIndex,
  setCurrentSubCategoryIndex,
  submitSurvey,
  clearResponses,
  setFilteredSubCategories,
  setSelectedSymptoms,
  setFilteredCategories
} from '@/redux/surveySlice';
import QuestionComponent from '@features/survey/QuestionComponent';

const SurveyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux 상태에서 필요한 데이터 추출
  const {
    categories,
    currentCategoryIndex,
    currentSubCategoryIndex,
    questions,
    responses,
    categoriesLoading,
    questionsLoading,
    categoriesError,
    questionsError,
    gender,
    filteredSubCategories,
    selectedSymptoms,
    filteredCategories
  } = useSelector(state => state.survey);

  // 초기 카테고리 로드
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 질문 로드
  useEffect(() => {
    const categoriesToUse = filteredCategories || categories;
    if (categoriesToUse.length > 0 && currentCategoryIndex !== null && currentSubCategoryIndex !== null) {
      const subCategoriesToUse = filteredSubCategories || categoriesToUse[currentCategoryIndex]?.subCategories;
      const subCategoryId = subCategoriesToUse?.[currentSubCategoryIndex]?.id;
      if (subCategoryId) {
        dispatch(fetchQuestions(subCategoryId));
      }
    }
  }, [dispatch, categories, filteredCategories, currentCategoryIndex, currentSubCategoryIndex, filteredSubCategories]);

  // 컴포넌트 언마운트 시 응답 초기화
  useEffect(() => {
    return () => {
      dispatch(clearResponses());
    };
  }, [dispatch]);

  // 증상 선택에 따른 하위 카테고리 필터링
  useEffect(() => {
    const categoriesToUse = filteredCategories || categories;
    if (categoriesToUse[currentCategoryIndex]?.name === "2. 증상·불편" && selectedSymptoms.length > 0) {
      const currentCategory = categoriesToUse[currentCategoryIndex];
      console.log("현재 카테고리:", currentCategory);
      console.log("선택된 증상들:", selectedSymptoms);

      const filteredSubs = currentCategory.subCategories.filter(sub => {
        if (sub.name === "주요 증상" || sub.name === "추가 증상") {
          return true;
        }
        return selectedSymptoms.some(symptomId => {
          const symptomOption = currentCategory.subCategories
            .find(s => s.name === "주요 증상")
            ?.questions[0]?.options
            .find(opt => opt.id.toString() === symptomId);
          return symptomOption && sub.name.toLowerCase().includes(symptomOption.optionText.toLowerCase());
        });
      });

      console.log("필터링된 하위 카테고리:", filteredSubs);
      if (filteredSubs.length > 0) {
        dispatch(setFilteredSubCategories(filteredSubs));
      } else {
        dispatch(setFilteredSubCategories(null));
      }
    } else {
      dispatch(setFilteredSubCategories(null));
    }
  }, [categories, filteredCategories, currentCategoryIndex, selectedSymptoms, dispatch]);

  // 응답 변경 핸들러
  // SurveyPage.js의 handleResponseChange 수정
  const handleResponseChange = (questionId, value) => {
    console.log('응답 변경:', { questionId, value });
    const question = questions.find(q => q.id === questionId);

    // 성별 질문 처리
    if (question && question.questionText === "성별을 알려주세요") {
      const selectedOption = question.options.find(opt => opt.id === parseInt(value, 10));
      const filteredCats = categories.filter(category => {
        if (!category.name.includes('건강')) return true;

        if (selectedOption.optionText === '여성') {
          return category.name.includes('여성');
        } else if (selectedOption.optionText === '남성') {
          return category.name.includes('남성');
        }
        return true;
      });
      dispatch(setFilteredCategories(filteredCats));
    }

    // 주요 증상 질문 처리 (기존 로직 유지)
    if (question && question.questionText.includes("불편하거나 걱정되는 것")) {
      const selectedSymptoms = Array.isArray(value) ? value : [value];
      dispatch(setSelectedSymptoms(selectedSymptoms));
    }

    dispatch(updateResponse({ questionId, answer: value }));
  };

  // 이전 버튼 핸들러
  const handlePrevious = () => {
    const categoriesToUse = filteredCategories || categories;
    if (currentSubCategoryIndex > 0) {
      dispatch(setCurrentSubCategoryIndex(currentSubCategoryIndex - 1));
    } else if (currentCategoryIndex > 0) {
      dispatch(setCurrentCategoryIndex(currentCategoryIndex - 1));
      const prevCategory = categoriesToUse[currentCategoryIndex - 1];
      dispatch(setCurrentSubCategoryIndex(prevCategory.subCategories.length - 1));
    }
  };

  // 다음/제출 버튼 핸들러
  const handleNext = () => {
    const categoriesToUse = filteredCategories || categories;
    const currentCategory = categoriesToUse[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;

    // 마지막 페이지인 경우 제출
    if (currentCategoryIndex === categoriesToUse.length - 1 &&
        currentSubCategoryIndex === subCategoriesToUse.length - 1) {

      // 응답 포맷팅
      const allQuestions = categoriesToUse.flatMap(category =>
        category.subCategories ?
          category.subCategories.flatMap(subCategory =>
            subCategory.questions || []
          )
          : []
      );
      const formattedResponses = allQuestions.map(question => {
        const answer = responses[question.id];
        return {
          questionId: Number(question.id),
          responseType: question.questionType,
          responseText: question.questionType === 'TEXT' ? String(answer) || null : null,
          selectedOptions:
            (question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE')
              ? (Array.isArray(answer) ? answer.map(Number) : (answer ? [Number(answer)] : []))
              : null
        };
      }).filter(response =>
        response.responseText !== null ||
        (response.selectedOptions && response.selectedOptions.length > 0)
      );

      if (formattedResponses.length === 0) {
        alert('제출할 응답이 없습니다.');
        return;
      }

      // 제출 요청
      dispatch(submitSurvey({ responses: formattedResponses }))
        .unwrap()
        .then(() => {
          dispatch(clearResponses()); // 제출 후 응답 초기화
          navigate('/survey-complete');
        })
        .catch(error => {
          alert(`제출 오류: ${error}`);
        });
    } else {
      handleNextCategoryOrSubCategory();
    }
  };

  // 다음 카테고리/하위카테고리로 이동
  const handleNextCategoryOrSubCategory = () => {
    const categoriesToUse = filteredCategories || categories;
    const currentCategory = categoriesToUse[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;

    if (currentSubCategoryIndex < subCategoriesToUse.length - 1) {
      dispatch(setCurrentSubCategoryIndex(currentSubCategoryIndex + 1));
    } else if (currentCategoryIndex < categoriesToUse.length - 1) {
      dispatch(setCurrentCategoryIndex(currentCategoryIndex + 1));
      dispatch(setCurrentSubCategoryIndex(0));
    }
  };

  // 다음 버튼 비활성화 여부 확인
  const isNextButtonDisabled = () => {
    return questions.some(question => !responses[question.id]);
  };

  // 로딩 상태 처리
  if (categoriesLoading || questionsLoading) {
    return <CircularProgress />;
  }

  // 에러 상태 처리
  if (categoriesError || questionsError) {
    return <Typography color="error">{categoriesError || questionsError}</Typography>;
  }

  // 카테고리 없음 처리
  if (!categories || categories.length === 0) {
    return <Typography>카테고리가 없습니다. 관리자에게 문의하세요.</Typography>;
  }

  // 초기 로딩 중 처리
  if (currentCategoryIndex === null || currentSubCategoryIndex === null) {
    return <Typography>설문을 불러오는 중입니다...</Typography>;
  }

  const categoriesToUse = filteredCategories || categories;
  const currentCategory = categoriesToUse[currentCategoryIndex];
  const subCategoriesToDisplay = filteredSubCategories || currentCategory?.subCategories;
  const currentSubCategory = subCategoriesToDisplay?.[currentSubCategoryIndex];

  // 렌더링
  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{currentCategory.name}</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>{currentSubCategory.name}</Typography>
      {questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          response={responses[question.id]}
          onResponseChange={handleResponseChange}
        />
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="contained"
          onClick={handlePrevious}
          disabled={currentCategoryIndex === 0 && currentSubCategoryIndex === 0}
        >
          이전
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isNextButtonDisabled()}
        >
          {currentCategoryIndex === categoriesToUse.length - 1 &&
           currentSubCategoryIndex === subCategoriesToDisplay.length - 1
           ? '제출' : '다음'}
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyPage;

