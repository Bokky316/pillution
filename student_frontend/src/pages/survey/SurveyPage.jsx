import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import QuestionComponent from '@features/survey/QuestionComponent';
import { fetchCategories, fetchQuestions, submitSurvey } from '@features/survey/surveyApi';
import { validateResponses } from '@features/survey/surveyUtils';

const SurveyPage = () => {
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

  useEffect(() => {
    fetchCategories(setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions);
  }, []);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => {
      const newResponses = { ...prev, [questionId]: value };

      const genderQuestion = questions.find(q => q.questionText.includes('성별'));
      if (genderQuestion && questionId === genderQuestion.id) {
        const selectedOption = genderQuestion.options.find(opt => opt.id.toString() === value);
        const newGender = selectedOption?.optionText === '남성' ? 'male' : 'female';
        setGender(newGender);
        fetchCategories(setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions);
      }

      const symptomsQuestion = questions.find(q => q.questionText.includes('최대 3가지'));
      if (symptomsQuestion && questionId === symptomsQuestion.id) {
        setSelectedSymptoms(Array.isArray(value) ? value : []);
      }

      return newResponses;
    });
  };

  const handleNext = () => {
    if (!validateResponses(questions, responses)) {
      alert('모든 질문에 답해주세요.');
      return;
    }

    const currentCategory = categories[currentCategoryIndex];

    if (currentCategory?.subCategories[currentSubCategoryIndex]?.name === "주요 증상") {
      const filteredSubCategories = currentCategory.subCategories.filter(sub =>
        sub.name === "주요 증상" || sub.name === "추가 증상" ||
        selectedSymptoms.some(symptomId =>
          questions.find(q => q.id === parseInt(Object.keys(responses)[0]))
                   ?.options.some(opt => opt.id.toString() === symptomId && sub.name.includes(opt.optionText))
        )
      );

      currentCategory.subCategories = filteredSubCategories;
    }

    if (currentSubCategoryIndex < currentCategory.subCategories.length - 1) {
      setCurrentSubCategoryIndex(prev => prev + 1);
      fetchQuestions(currentCategory.subCategories[currentSubCategoryIndex + 1].id, setQuestions, setError, setIsLoading);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentSubCategoryIndex(0);
      const nextCategory = categories[currentCategoryIndex + 1];
      if (nextCategory?.subCategories?.length > 0) {
        fetchQuestions(nextCategory.subCategories[0].id, setQuestions, setError, setIsLoading);
      }
    } else {
      submitSurvey(responses, navigate);
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
