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
  filterSubCategories
} from '@/redux/surveySlice';
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
    filteredSubCategories,
    selectedSymptoms
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

  useEffect(() => {
    if (categories[currentCategoryIndex]?.name === "2. 증상·불편" && selectedSymptoms.length > 0) {
      dispatch(filterSubCategories(selectedSymptoms));
    }
  }, [selectedSymptoms, categories, currentCategoryIndex, dispatch]);

  useEffect(() => {
    const currentCategory = categories[currentCategoryIndex];
    const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];
    if (!currentCategory || !currentSubCategory || shouldSkipSubCategory(currentCategory, currentSubCategory)) {
      handleNext();
    }
  }, [categories, currentCategoryIndex, currentSubCategoryIndex, gender]);

  useEffect(() => {
    console.log('Current Responses:', responses);
  }, [responses]);

  const handleResponseChange = (questionId, value) => {
    dispatch(updateResponse({ questionId, answer: value }));
    console.log(`Response updated - QuestionID: ${questionId}, Value:`, value);

    const question = questions.find(q => q.id === questionId);
    if (question && (question.questionText.includes('주요 증상') || question.questionText.includes('불편하거나 걱정되는 것'))) {
      const newSelectedSymptoms = Array.isArray(value) ? value.slice(0, 3) : [value];
      dispatch(filterSubCategories(newSelectedSymptoms));
    }
  };

  const handleNext = () => {
    const currentCategory = categories[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;

    console.log('Current responses before submission:', responses);

    if (currentCategoryIndex === categories.length - 1 &&
        currentSubCategoryIndex === subCategoriesToUse.length - 1) {
     const formattedResponses = Object.entries(responses).map(([questionId, answer]) => {
       const question = questions.find(q => q.id.toString() === questionId);
       if (!question) {
         console.warn(`Question not found for id: ${questionId}`);
         return null;
       }
       return {
         questionId: parseInt(questionId, 10),
         responseType: question.questionType,
         responseText: question.questionType === 'TEXT' ? answer : null,
         selectedOptions: ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(question.questionType) ?
           (Array.isArray(answer) ? answer : [answer]) : null
       };
     }).filter(Boolean); // 널값 제거


      console.log("Formatted Responses for Submission:", formattedResponses);

      dispatch(submitSurvey({ responses: formattedResponses }))
        .unwrap()
        .then(() => {
          console.log('Survey submitted successfully');
          navigate('/survey-complete');
        })
        .catch(error => {
          console.error('Survey submission failed:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
          }
          alert('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
    } else {
      handleNextCategoryOrSubCategory();
    }
  };

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

  const shouldSkipSubCategory = (category, subCategory) => {
    if (category.name === "3. 생활 습관") {
      if (gender === 'female' && subCategory.name === "남성건강") return true;
      if (gender === 'male' && subCategory.name === "여성건강") return true;
    }
    return false;
  };

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
        disabled={isNextButtonDisabled() || categoriesLoading || questionsLoading}
      >
        {currentCategoryIndex === categories.length - 1 &&
         currentSubCategoryIndex === subCategoriesToDisplay.length - 1
         ? '제출' : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;
