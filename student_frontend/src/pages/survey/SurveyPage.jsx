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
  filterSubCategories,
  setFilteredSubCategories,
  setSelectedSymptoms
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
    selectedSymptoms,
    relatedQuestions
  } = useSelector(state => state.survey);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0 && currentCategoryIndex !== null && currentSubCategoryIndex !== null) {
      const subCategoriesToUse = filteredSubCategories || categories[currentCategoryIndex]?.subCategories;
      const subCategoryId = subCategoriesToUse?.[currentSubCategoryIndex]?.id;
      if (subCategoryId) {
        dispatch(fetchQuestions(subCategoryId));
      }
    }
  }, [dispatch, categories, currentCategoryIndex, currentSubCategoryIndex, filteredSubCategories]);

  // SurveyPage.js의 useEffect 부분 수정
  useEffect(() => {
    if (categories[currentCategoryIndex]?.name === "2. 증상·불편" && selectedSymptoms.length > 0) {
      const currentCategory = categories[currentCategoryIndex];

      // 주요 증상 질문 찾기
      const mainSymptomQuestion = questions.find(q =>
        q.questionText.includes('주요 증상') ||
        q.questionText.includes('불편하거나 걱정되는 것')
      );

      if (mainSymptomQuestion) {
        // 선택된 증상의 옵션 텍스트 가져오기
        const selectedSymptomTexts = mainSymptomQuestion.options
          .filter(opt => selectedSymptoms.includes(opt.id.toString()))
          .map(opt => opt.optionText);

        // 관련된 하위 카테고리 필터링
        const filteredSubs = currentCategory.subCategories.filter(sub =>
          sub.name === "주요 증상" ||
          sub.name === "추가 증상" ||
          selectedSymptomTexts.includes(sub.name)
        );

        dispatch(setFilteredSubCategories(filteredSubs));
      }
    }
  }, [selectedSymptoms, categories, currentCategoryIndex, questions, dispatch]);

  useEffect(() => {
    const currentCategory = categories[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;
    const currentSubCategory = subCategoriesToUse?.[currentSubCategoryIndex];

    if (!currentCategory || !currentSubCategory || shouldSkipSubCategory(currentCategory, currentSubCategory)) {
      handleNextCategoryOrSubCategory();
    }
  }, [categories, currentCategoryIndex, currentSubCategoryIndex, gender, filteredSubCategories]);

  const handleResponseChange = (questionId, value) => {
    dispatch(updateResponse({ questionId, answer: value }));
  };

  const handleNext = () => {
    const currentCategory = categories[currentCategoryIndex];
    const subCategoriesToUse = filteredSubCategories || currentCategory?.subCategories;

    if (currentCategoryIndex === categories.length - 1 &&
        currentSubCategoryIndex === subCategoriesToUse.length - 1) {

      const allQuestions = categories.flatMap(category =>
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

      dispatch(submitSurvey({ responses: formattedResponses }))
        .unwrap()
        .then(() => {
          navigate('/survey-complete');
        })
        .catch(error => {
          alert(`제출 오류: ${error}`);
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

  const isNextButtonDisabled = () => {
    return questions.some(question => !responses[question.id]);
  };

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
        disabled={isNextButtonDisabled()}
      >
        {currentCategoryIndex === categories.length - 1 &&
         currentSubCategoryIndex === subCategoriesToDisplay.length - 1
         ? '제출' : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;