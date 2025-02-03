<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
=======
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
>>>>>>> a0b50619fbdc91cdec82c215801f385839f43d9b
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { fetchCategories, fetchQuestions, updateResponse, setCurrentCategoryIndex, setCurrentSubCategoryIndex, submitSurvey, filterSubCategories } from '@/redux/surveySlice';
import QuestionComponent from '@features/survey/QuestionComponent';
<<<<<<< HEAD
=======
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
>>>>>>> a0b50619fbdc91cdec82c215801f385839f43d9b

const SurveyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    categories,
    currentCategoryIndex,
    currentSubCategoryIndex,
    questions,
    responses,
<<<<<<< HEAD
    categoriesLoading,
    questionsLoading,
    categoriesError,
    questionsError,
    gender
  } = useSelector(state => state.survey);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
=======
    loading,
    error,
    gender,
    selectedSymptoms
  } = useSelector(state => state.survey);
>>>>>>> a0b50619fbdc91cdec82c215801f385839f43d9b

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
<<<<<<< HEAD
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
=======
    if (categories.length > 0 && categories[currentCategoryIndex]?.subCategories?.length > 0) {
      const subCategoryId = categories[currentCategoryIndex].subCategories[currentSubCategoryIndex].id;
      dispatch(fetchQuestions(subCategoryId));
    }
  }, [dispatch, categories, currentCategoryIndex, currentSubCategoryIndex]);

const handleResponseChange = (questionId, value) => {
  console.log(`Response changed for question ${questionId}:`, value);

  dispatch(updateResponse({ questionId, answer: value }));

  const currentQuestion = questions.find(q => q.id === questionId);

  if (currentQuestion?.questionText.includes('성별')) {
    const newGender = value === 1 ? 'female' : 'male';
    dispatch(setGender(newGender));
  } else if (currentQuestion?.questionText.includes('최대 3가지')) {
    dispatch(setSelectedSymptoms(Array.isArray(value) ? value : []));
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
>>>>>>> a0b50619fbdc91cdec82c215801f385839f43d9b
      }
    }

<<<<<<< HEAD
    if (currentSubCategoryIndex < currentCategory.subCategories.length - 1) {
      dispatch(setCurrentSubCategoryIndex(currentSubCategoryIndex + 1));
=======
    if (nextSubCategoryIndex < currentCategory?.subCategories?.length) {
      dispatch(setCurrentSubCategoryIndex(nextSubCategoryIndex));
>>>>>>> a0b50619fbdc91cdec82c215801f385839f43d9b
    } else if (currentCategoryIndex < categories.length - 1) {
      dispatch(setCurrentCategoryIndex(currentCategoryIndex + 1));
      dispatch(setCurrentSubCategoryIndex(0));
    } else {
<<<<<<< HEAD
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
=======
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
>>>>>>> a0b50619fbdc91cdec82c215801f385839f43d9b
  }

  if (!categories || categories.length === 0) {
    return <Typography>카테고리가 없습니다. 관리자에게 문의하세요.</Typography>;
<<<<<<< HEAD
  }

  if (currentCategoryIndex === null || currentSubCategoryIndex === null) {
    return <Typography>설문을 불러오는 중입니다...</Typography>;
  }

  const currentCategory = categories[currentCategoryIndex];
  const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];

  if (!currentCategory || !currentSubCategory || shouldSkipSubCategory(currentCategory, currentSubCategory)) {
    handleNext();
    return null;
=======
>>>>>>> a0b50619fbdc91cdec82c215801f385839f43d9b
  }

  const currentCategory = categories[currentCategoryIndex];
  const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{currentCategory.name}</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>{currentSubCategory.name}</Typography>
      {questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          response={responses[question.id]}
          onResponseChange={(value) => handleResponseChange(question.id, value)}
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
