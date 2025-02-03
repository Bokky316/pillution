import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import QuestionComponent from '@features/survey/QuestionComponent';
import {
  fetchCategories,
  fetchQuestions,
  submitSurvey,
  updateResponse,
  setGender,
  setSelectedSymptoms,
  setCurrentCategoryIndex,
  setCurrentSubCategoryIndex,
  setCategories
} from '@/redux/surveySlice';
import { validateResponses } from '@features/survey/surveyUtils';

const SurveyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    categories = [],
    currentCategoryIndex = 0,
    currentSubCategoryIndex = 0,
    questions = [],
    responses = {},
    loading = false,
    error = null,
    gender = null,
    selectedSymptoms = []
  } = useSelector(state => state.survey || {});

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0 && categories[currentCategoryIndex]?.subCategories?.length > 0) {
      const subCategoryId = categories[currentCategoryIndex].subCategories[currentSubCategoryIndex].id;
      dispatch(fetchQuestions(subCategoryId));
    }
  }, [dispatch, categories, currentCategoryIndex, currentSubCategoryIndex]);

  const handleResponseChange = (questionId, value) => {
    console.log(`Response changed for question ${questionId}:`, value);
    dispatch(updateResponse({ questionId, answer: value.toString() }));

    const currentQuestion = questions.find(q => q.id === questionId);
    if (currentQuestion?.questionText.includes('성별')) {
      const newGender = value === '1' ? 'female' : 'male';
      dispatch(setGender(newGender));
    }

    if (currentQuestion?.questionText.includes('최대 3가지')) {
      dispatch(setSelectedSymptoms(Array.isArray(value) ? value.map(String) : []));
    }
  };

  const handleNext = async () => {
    if (!validateResponses(questions, responses)) {
      alert('모든 질문에 답해주세요.');
      return;
    }

    const currentCategory = categories[currentCategoryIndex];

    if (currentCategory?.name === "2. 증상·불편") {
      const mainSymptomQuestion = questions.find(q => q.questionText.includes('불편하거나 걱정되는 것'));
      if (mainSymptomQuestion) {
        const selectedMainSymptomIds = responses[mainSymptomQuestion.id] || [];
        if (selectedMainSymptomIds.length > 0) {
          const selectedMainSymptoms = mainSymptomQuestion.options
            .filter(opt => selectedMainSymptomIds.includes(opt.id.toString()))
            .map(opt => opt.optionText);

          const filteredSubCategories = currentCategory.subCategories.filter(sub =>
            sub.name === "주요 증상" ||
            sub.name === "추가 증상" ||
            selectedMainSymptoms.includes(sub.name)
          );

          dispatch(setCategories(categories.map((cat, index) =>
            index === currentCategoryIndex
              ? {...cat, subCategories: filteredSubCategories}
              : cat
          )));

          dispatch(setCurrentSubCategoryIndex(0));
          return;
        }
      }
    }

    let nextSubCategoryIndex = currentSubCategoryIndex + 1;
    while (nextSubCategoryIndex < currentCategory?.subCategories?.length) {
      const nextSubCategory = currentCategory.subCategories[nextSubCategoryIndex];
      if (currentCategory.name === "3. 생활 습관") {
        if ((gender === 'female' && nextSubCategory.name === "남성건강") ||
            (gender === 'male' && nextSubCategory.name === "여성건강")) {
          nextSubCategoryIndex++;
          continue;
        }
      }
      break;
    }

    if (nextSubCategoryIndex < currentCategory?.subCategories?.length) {
      dispatch(setCurrentSubCategoryIndex(nextSubCategoryIndex));
    } else if (currentCategoryIndex < categories.length - 1) {
      dispatch(setCurrentCategoryIndex(currentCategoryIndex + 1));
      dispatch(setCurrentSubCategoryIndex(0));
    } else {
      try {
        await dispatch(submitSurvey(responses)).unwrap();
        navigate('/recommendation');
      } catch (err) {
        console.error('서베이 제출 실패:', err);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!categories || categories.length === 0) {
    return <Typography>카테고리가 없습니다. 관리자에게 문의하세요.</Typography>;
  }

  const currentCategory = categories[currentCategoryIndex];
  const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];

  return (
    <Box sx={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {currentCategory && (
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>{currentCategory.name}</Typography>
          {currentSubCategory && (
            <Typography variant="h6" sx={{ mb: 2 }}>{currentSubCategory.name}</Typography>
          )}
        </>
      )}
      {questions && questions.length > 0 ? (
        questions.map((question) => (
          <QuestionComponent
            key={question.id}
            question={question}
            response={responses[question.id]}
            onResponseChange={(value) => handleResponseChange(question.id, value)}
          />
        ))
      ) : (
        <Typography>질문을 불러오는 중입니다...</Typography>
      )}
      <Button
        variant="contained"
        onClick={handleNext}
        sx={{ mt: 2 }}
        disabled={loading || questions.length === 0}
      >
        {currentCategoryIndex === categories.length - 1 &&
         currentSubCategoryIndex === currentCategory?.subCategories?.length - 1
          ? '제출'
          : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;
