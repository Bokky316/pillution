import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import QuestionComponent from '@features/survey/QuestionComponent';
import { fetchCategories, fetchQuestions, submitSurvey } from '@features/survey/surveyApi';
import { validateResponses } from '@features/survey/surveyUtils';

const SurveyPage = () => {
  // 상태 관리
  const [categories, setCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentSubCategoryIndex, setCurrentSubCategoryIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [gender, setGender] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 초기 데이터 로드
  useEffect(() => {
    fetchCategories(setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions, setQuestions);
  }, []);

  // 응답 변경 처리
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => {
      const newResponses = { ...prev, [questionId]: value };

      // 성별 질문 처리 (questionId가 2인 경우)
      if (questionId === 2) {
        const newGender = value === '1' ? 'female' : 'male';
        setGender(newGender);
        console.log("Gender set to:", newGender);
        // 성별 선택 후 카테고리 다시 불러오기
        fetchCategories(setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions, setQuestions);
      }

      // 증상 선택 질문 처리
      const symptomsQuestion = questions.find(q => q.questionText.includes('최대 3가지'));
      if (symptomsQuestion && questionId === symptomsQuestion.id) {
        setSelectedSymptoms(Array.isArray(value) ? value : []);
      }

      return newResponses;
    });
  };

  // 특정 서브카테고리를 건너뛰어야 하는지 확인
  const shouldSkipSubCategory = (category, subCategory) => {
    console.log("Checking skip for:", category.name, subCategory.name, "Gender:", gender);
    if (category.name === "3. 생활 습관") {
      if (gender === 'female' && subCategory.name === "남성건강") return true;
      if (gender === 'male' && subCategory.name === "여성건강") return true;
    }
    return false;
  };

  // 다음 카테고리로 이동
  const handleNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentSubCategoryIndex(0);
      const nextCategory = categories[currentCategoryIndex + 1];
      if (nextCategory?.subCategories?.length > 0) {
        let nextSubCategoryIndex = 0;
        while (nextSubCategoryIndex < nextCategory.subCategories.length) {
          if (shouldSkipSubCategory(nextCategory, nextCategory.subCategories[nextSubCategoryIndex])) {
            nextSubCategoryIndex++;
          } else {
            break;
          }
        }
        if (nextSubCategoryIndex < nextCategory.subCategories.length) {
          setCurrentSubCategoryIndex(nextSubCategoryIndex);
          const nextSubCategoryId = nextCategory.subCategories[nextSubCategoryIndex].id;
          fetchQuestions(nextSubCategoryId, setQuestions, setError, setIsLoading);
        } else {
          // 다음 카테고리의 모든 서브카테고리를 건너뛰어야 하는 경우
          handleNextCategory(); // 재귀적으로 다음 카테고리 처리
        }
      }
    } else {
      submitSurvey(responses, navigate);
    }
  };

  // 다음 질문으로 이동
  const handleNext = () => {
    if (!validateResponses(questions, responses)) {
      alert('모든 질문에 답해주세요.');
      return;
    }

    const currentCategory = categories[currentCategoryIndex];
    const currentSubCategory = currentCategory?.subCategories[currentSubCategoryIndex];

    // 주요 증상 카테고리 필터링
    if (currentSubCategory?.name === "주요 증상") {
      const filteredSubCategories = currentCategory.subCategories.filter(sub =>
        sub.name === "주요 증상" || sub.name === "추가 증상" ||
        selectedSymptoms.some(symptomId =>
          questions.find(q => q.id === parseInt(symptomId))
                   ?.options.some(opt => sub.name.includes(opt.optionText))
        )
      );
      currentCategory.subCategories = filteredSubCategories;
    }

    // 다음 서브카테고리로 이동
    if (currentSubCategoryIndex < currentCategory.subCategories.length - 1) {
      let nextSubCategoryIndex = currentSubCategoryIndex + 1;
      while (nextSubCategoryIndex < currentCategory.subCategories.length) {
        const nextSubCategory = currentCategory.subCategories[nextSubCategoryIndex];
        if (shouldSkipSubCategory(currentCategory, nextSubCategory)) {
          console.log("Skipping subcategory:", nextSubCategory.name);
          nextSubCategoryIndex++;
        } else {
          break;
        }
      }
      if (nextSubCategoryIndex < currentCategory.subCategories.length) {
        setCurrentSubCategoryIndex(nextSubCategoryIndex);
        const nextSubCategoryId = currentCategory.subCategories[nextSubCategoryIndex].id;
        fetchQuestions(nextSubCategoryId, setQuestions, setError, setIsLoading);
      } else {
        // 모든 서브카테고리를 건너뛰었다면 다음 카테고리로
        handleNextCategory();
      }
    } else {
      handleNextCategory();
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const currentCategory = categories[currentCategoryIndex];
  const currentSubCategory = currentCategory?.subCategories?.[currentSubCategoryIndex];
  const isLastPage = currentCategoryIndex === categories.length - 1 &&
                     currentSubCategoryIndex === (currentCategory?.subCategories?.length || 0) - 1;

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{currentCategory?.name}</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>{currentSubCategory?.name}</Typography>
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
        disabled={isLoading}
      >
        {isLastPage ? '제출' : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;
