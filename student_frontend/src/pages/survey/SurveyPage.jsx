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
    gender
  } = useSelector(state => state.survey);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0 && currentCategoryIndex !== null && currentSubCategoryIndex !== null) {
      const subCategoryId = categories[currentCategoryIndex]?.subCategories?.[currentSubCategoryIndex]?.id;
      if (subCategoryId) {
        dispatch(fetchQuestions(subCategoryId));
      }
    }
  }, [dispatch, categories, currentCategoryIndex, currentSubCategoryIndex]);

  const handleResponseChange = (questionId, value) => {
    const question = questions.find(q => q.id === questionId);

    if (question.questionType === 'MULTIPLE_CHOICE') {
      if (!Array.isArray(value)) value = [value];

      // 주요 증상 질문에 대해서만 최대 3개 선택 제한 적용
      const isMainSymptomQuestion = question.questionText.includes('주요 증상') || question.questionText.includes('불편하거나 걱정되는 것');
      if (isMainSymptomQuestion && value.length > 3) {
        value = value.slice(0, 3);
      }

      // 마지막 선택지 처리 (모든 멀티플 선택 질문에 적용)
      const lastOptionId = question.options[question.options.length - 1].id.toString();
      if (value.includes(lastOptionId)) {
        value = [lastOptionId];
      }
    }

    dispatch(updateResponse({ questionId, answer: value }));

    // 주요 증상 설정 (최대 3개로 제한)
    if (question.questionText.includes('주요 증상') || question.questionText.includes('불편하거나 걱정되는 것')) {
      setSelectedSymptoms(Array.isArray(value) ? value.slice(0, 3) : [value]);
    }
  };

  const handleNext = () => {
    const currentCategory = categories[currentCategoryIndex];

    // 주요 증상에 따른 서브카테고리 필터링
    if (currentCategory?.name === "2. 증상·불편") {
      const mainSymptomSubCategory = currentCategory.subCategories.find(sub => sub.name === "주요 증상");
      if (mainSymptomSubCategory && currentSubCategoryIndex === currentCategory.subCategories.indexOf(mainSymptomSubCategory)) {
        dispatch(filterSubCategories(selectedSymptoms));
      }
    }

    if (currentSubCategoryIndex < currentCategory.subCategories.length - 1) {
      dispatch(setCurrentSubCategoryIndex(currentSubCategoryIndex + 1));
    } else if (currentCategoryIndex < categories.length - 1) {
      dispatch(setCurrentCategoryIndex(currentCategoryIndex + 1));
      dispatch(setCurrentSubCategoryIndex(0));
    } else {
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => {
        const question = questions.find(q => q.id.toString() === questionId);
        return {
          questionId: parseInt(questionId),
          responseType: question.questionType,
          responseText: question.questionType === 'TEXT' ? answer : null,
          selectedOptions: question.questionType === 'MULTIPLE_CHOICE' ?
            (Array.isArray(answer) ? answer : [answer]) : null
        };
      });

      dispatch(submitSurvey({ responses: formattedResponses }))
        .unwrap()
        .then(() => navigate('/survey-complete'))
        .catch(error => console.error('Survey submission failed:', error));
    }
  };

  // 성별에 따른 서브카테고리 스킵
  const shouldSkipSubCategory = (category, subCategory) => {
    if (category.name === "3. 생활 습관") {
      if (gender === 'female' && subCategory.name === "남성건강") return true;
      if (gender === 'male' && subCategory.name === "여성건강") return true;
    }
    return false;
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
  const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];

  if (!currentCategory || !currentSubCategory || shouldSkipSubCategory(currentCategory, currentSubCategory)) {
    handleNext();
    return null;
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
        disabled={categoriesLoading || questionsLoading}
      >
        {currentCategoryIndex === categories.length - 1 &&
         currentSubCategoryIndex === currentCategory.subCategories.length - 1
         ? '제출' : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;
