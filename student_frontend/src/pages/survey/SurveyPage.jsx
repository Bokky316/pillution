import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { fetchCategories, fetchQuestions, updateResponse, setCurrentCategoryIndex, setCurrentSubCategoryIndex, submitSurvey } from '@/redux/surveySlice';
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
    questionsError
  } = useSelector(state => state.survey);

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
    dispatch(updateResponse({ questionId, answer: value }));
  };

   const handleNext = () => {
     const currentCategory = categories[currentCategoryIndex];
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

  if (!currentCategory || !currentSubCategory) {
    return <Typography>현재 카테고리 또는 서브카테고리를 찾을 수 없습니다.</Typography>;
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
