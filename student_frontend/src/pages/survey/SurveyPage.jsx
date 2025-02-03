import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { fetchCategories, fetchQuestions, updateResponse, setCurrentCategoryIndex, setCurrentSubCategoryIndex, submitSurvey, filterSubCategories } from '@/redux/surveySlice';
import QuestionComponent from '@features/survey/QuestionComponent';

const SurveyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    filteredSubCategories
  } = useSelector(state => state.survey);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // 컴포넌트 마운트 시 카테고리 데이터 로드
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 카테고리 또는 서브카테고리 변경 시 질문 데이터 로드
  useEffect(() => {
    if (categories.length > 0 && currentCategoryIndex !== null && currentSubCategoryIndex !== null) {
      const subCategoryId = categories[currentCategoryIndex]?.subCategories?.[currentSubCategoryIndex]?.id;
      if (subCategoryId) {
        dispatch(fetchQuestions(subCategoryId));
      }
    }
  }, [dispatch, categories, currentCategoryIndex, currentSubCategoryIndex]);

  // 선택한 증상에 따른 서브카테고리 필터링
  useEffect(() => {
    if (categories[currentCategoryIndex]?.name === "2. 증상·불편" && selectedSymptoms.length > 0) {
      dispatch(filterSubCategories(selectedSymptoms));
    }
  }, [selectedSymptoms, categories, currentCategoryIndex, dispatch]);

  // 렌더링 중 상태 업데이트 오류 해결을 위한 useEffect
  useEffect(() => {
    const currentCategory = categories[currentCategoryIndex];
    const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];
    if (!currentCategory || !currentSubCategory || shouldSkipSubCategory(currentCategory, currentSubCategory)) {
      handleNext();
    }
  }, [categories, currentCategoryIndex, currentSubCategoryIndex, gender]);

  // 응답 변경 처리 함수
 const handleResponseChange = (questionId, value) => {
   dispatch(updateResponse({ questionId, answer: value }));

   const question = questions.find(q => q.id === questionId);
   if (question && (question.questionText.includes('주요 증상') || question.questionText.includes('불편하거나 걱정되는 것'))) {
     const newSelectedSymptoms = Array.isArray(value) ? value.slice(0, 3) : [value];
     setSelectedSymptoms(newSelectedSymptoms);
     dispatch(filterSubCategories(newSelectedSymptoms));
   }
 };


  // 다음 질문으로 이동 또는 설문 제출 처리 함수
  const handleNext = () => {
    const currentCategory = categories[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;

    if (currentCategoryIndex === categories.length - 1 &&
        currentSubCategoryIndex === subCategoriesToUse.length - 1) {
      // 응답 데이터를 서버 형식에 맞게 변환
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => {
        const question = questions.find(q => q.id.toString() === questionId);
        return {
          questionId: parseInt(questionId, 10),
          responseType: question.questionType,
          responseText: question.questionType === 'TEXT' ? answer : null,
          selectedOptions: ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(question.questionType) ?
            (Array.isArray(answer) ? answer : [answer]) : null
        };
      });

      console.log("Formatted Responses for Submission:", formattedResponses);

      // 설문 제출 액션 디스패치
      dispatch(submitSurvey({ responses: formattedResponses }))
        .unwrap()
        .then(() => navigate('/survey-complete'))
        .catch(error => {
          console.error('Survey submission failed:', error);
          alert('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
    } else {
      handleNextCategoryOrSubCategory();
    }
  };

  // 다음 카테고리 또는 서브카테고리로 이동
  const handleNextCategoryOrSubCategory = () => {
    const currentCategory = categories[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;

    if (currentSubCategoryIndex < subCategoriesToUse.length - 1) {
      dispatch(setCurrentSubCategoryIndex(currentSubCategoryIndex + 1));
    } else if (currentCategoryIndex < categories.length - 1) {
      dispatch(setCurrentCategoryIndex(currentCategoryIndex + 1));
      dispatch(setCurrentSubCategoryIndex(0));
    }
  };

  // 성별에 따른 서브카테고리 스킵 여부 확인 함수
  const shouldSkipSubCategory = (category, subCategory) => {
    if (category.name === "3. 생활 습관") {
      if (gender === 'female' && subCategory.name === "남성건강") return true;
      if (gender === 'male' && subCategory.name === "여성건강") return true;
    }
    return false;
  };

  // 다음 버튼 비활성화 여부 확인 함수
  const isNextButtonDisabled = () => {
    return questions.some(question => !responses[question.id]);
  };

  if (categoriesLoading || questionsLoading) {
    return <CircularProgress />;
  }

  if (categoriesError || questionsError) {
    return <Typography color="error">{categoriesError || questionsError}</Typography>;
  }

  if (!categories || categories.length === 0) {
    return <Typography>카테고리가 없습니다. 관리자에게 문의하세요.</Typography>;
  }

  if (currentCategoryIndex === null || currentSubCategoryIndex === null) {
    return <Typography>설문을 불러오는 중입니다...</Typography>;
  }

  const currentCategory = categories[currentCategoryIndex];
  const subCategoriesToDisplay = filteredSubCategories || currentCategory?.subCategories;
  const currentSubCategory = subCategoriesToDisplay?.[currentSubCategoryIndex];

  if (!currentCategory || !currentSubCategory || shouldSkipSubCategory(currentCategory, currentSubCategory)) {
    return null; // handleNext는 useEffect에서 처리됨
  }

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
      <Button
        variant="contained"
        onClick={handleNext}
        sx={{ mt: 2 }}
        disabled={isNextButtonDisabled() || categoriesLoading || questionsLoading}
      >
        {currentCategoryIndex === categories.length - 1 &&
         currentSubCategoryIndex === subCategoriesToDisplay.length - 1
         ? '제출' : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';