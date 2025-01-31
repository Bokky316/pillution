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
    fetchCategories(setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions, setQuestions);
  }, []);

  useEffect(() => {
    console.log('Current responses:', responses);
  }, [responses]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => {
      const newResponses = { ...prev, [questionId]: value };
      console.log('Updated responses:', newResponses);

      if (questionId === 2) {
        const newGender = value === '1' ? 'female' : 'male';
        setGender(newGender);
        console.log("Gender set to:", newGender);
        fetchCategories(setCategories, setError, setIsLoading, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions, setQuestions);
      }

      const symptomsQuestion = questions.find(q => q.questionText.includes('최대 3가지'));
      if (symptomsQuestion && questionId === symptomsQuestion.id) {
        setSelectedSymptoms(Array.isArray(value) ? value : []);
      }

      return newResponses;
    });
  };

  const shouldSkipSubCategory = (category, subCategory) => {
    console.log("Checking skip for:", category.name, subCategory.name, "Gender:", gender);
    if (category.name === "3. 생활 습관") {
      if (gender === 'female' && subCategory.name === "남성건강") return true;
      if (gender === 'male' && subCategory.name === "여성건강") return true;
    }
    return false;
  };

  const handleNext = () => {
    if (!questions || questions.length === 0) {
      console.error('No questions available');
      return;
    }

    if (!validateResponses(questions, responses)) {
      alert('모든 질문에 답해주세요.');
      return;
    }

    const currentCategory = categories[currentCategoryIndex];

    if (currentCategory?.name === "2. 증상·불편") {
      const mainSymptomSubCategory = currentCategory.subCategories.find(sub => sub.name === "주요 증상");
      if (mainSymptomSubCategory && currentSubCategoryIndex === currentCategory.subCategories.indexOf(mainSymptomSubCategory)) {
        const mainSymptomQuestion = questions.find(q => q.questionText.includes('불편하거나 걱정되는 것'));
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

          console.log("Selected main symptoms:", selectedMainSymptoms);
          console.log("Filtered subcategories:", filteredSubCategories);

          setCategories(prevCategories => {
            const newCategories = [...prevCategories];
            newCategories[currentCategoryIndex].subCategories = filteredSubCategories;
            return newCategories;
          });

          setCurrentSubCategoryIndex(0);
        }
      }
    }

    let nextSubCategoryIndex = currentSubCategoryIndex + 1;
    while (nextSubCategoryIndex < currentCategory.subCategories.length) {
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

    if (nextSubCategoryIndex < currentCategory.subCategories.length) {
      setCurrentSubCategoryIndex(nextSubCategoryIndex);
      fetchQuestions(currentCategory.subCategories[nextSubCategoryIndex].id, setQuestions, setError, setIsLoading);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentSubCategoryIndex(0);
      const nextCategory = categories[currentCategoryIndex + 1];
      if (nextCategory?.subCategories?.length > 0) {
        fetchQuestions(nextCategory.subCategories[0].id, setQuestions, setError, setIsLoading);
      }
    } else {
      console.log('Submitting responses:', responses);
      if (Object.keys(responses).length === 0) {
        setError('응답이 없습니다. 모든 질문에 답해주세요.');
        return;
      }
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
