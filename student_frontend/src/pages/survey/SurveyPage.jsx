import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress,
  RadioGroup, FormControlLabel, Radio,
  Checkbox, TextField
} from "@mui/material";
import axios from "axios";
import { API_URL } from "@/constant";
import { useNavigate } from 'react-router-dom';

const QuestionComponent = React.memo(({ question, response, onResponseChange }) => {
  switch (question.questionType) {
    case 'TEXT':
      return (
        <TextField
          fullWidth
          label={question.questionText}
          value={response || ''}
          onChange={(e) => onResponseChange(question.id, e.target.value)}
          margin="normal"
        />
      );
    case 'SINGLE_CHOICE':
      return (
        <Box sx={{ mb: 2 }}>
          <Typography>{question.questionText}</Typography>
          <RadioGroup
            value={response || ''}
            onChange={(e) => onResponseChange(question.id, e.target.value)}
          >
            {question.options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id.toString()}
                control={<Radio />}
                label={option.optionText}
              />
            ))}
          </RadioGroup>
        </Box>
      );
    case 'MULTIPLE_CHOICE':
      return (
        <Box sx={{ mb: 2 }}>
          <Typography>{question.questionText}</Typography>
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={(response || []).includes(option.id.toString())}
                  onChange={(e) => {
                    const newResponse = e.target.checked
                      ? [...(response || []), option.id.toString()]
                      : (response || []).filter((id) => id !== option.id.toString());
                    onResponseChange(question.id, newResponse);
                  }}
                />
              }
              label={option.optionText}
            />
          ))}
        </Box>
      );
    default:
      return null;
  }
});

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

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}survey/categories`, { withCredentials: true });
      setCategories(response.data);
      if (response.data.length > 0 && response.data[0].subCategories?.length > 0) {
        setCurrentCategoryIndex(0);
        setCurrentSubCategoryIndex(0);
      } else {
        setError('설문 데이터가 비어있습니다.');
      }
    } catch (error) {
      setError('설문 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (subCategoryId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}survey/subcategories/${subCategoryId}/questions`, { withCredentials: true });
      setQuestions(response.data);
    } catch (error) {
      setError('질문을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0 && categories[currentCategoryIndex]?.subCategories?.length > 0) {
      const subCategoryId = categories[currentCategoryIndex].subCategories[currentSubCategoryIndex].id;
      fetchQuestions(subCategoryId);
    }
  }, [categories, currentCategoryIndex, currentSubCategoryIndex, fetchQuestions]);

  const handleResponseChange = useCallback((questionId, value) => {
    setResponses(prev => {
      const newResponses = { ...prev, [questionId]: value };
      const genderQuestion = questions.find(q => q.questionText.includes('성별'));
      if (genderQuestion && questionId === genderQuestion.id) {
        const selectedOption = genderQuestion.options.find(opt => opt.id.toString() === value);
        const newGender = selectedOption?.optionText === '남성' ? 'male' : 'female';
        setGender(newGender);
        fetchCategories();
      }
      const symptomsQuestion = questions.find(q => q.questionText.includes('최대 3가지'));
      if (symptomsQuestion && questionId === symptomsQuestion.id) {
        setSelectedSymptoms(Array.isArray(value) ? value : []);
      }
      return newResponses;
    });
  }, [questions, fetchCategories]);

  const validateResponses = useCallback(() => {
    return questions.every(question => {
      const response = responses[question.id];
      return response !== undefined && response !== null &&
             (typeof response === 'string' ? response.trim() !== '' : response.length > 0);
    });
  }, [questions, responses]);

  const handleNext = useCallback(() => {
    if (!validateResponses()) {
      alert('모든 질문에 답해주세요.');
      return;
    }

    const currentCategory = categories[currentCategoryIndex];
    if (currentCategory?.subCategories[currentSubCategoryIndex]?.name === "주요 증상") {
      const filteredSubCategories = currentCategory.subCategories.filter(sub =>
        sub.name === "주요 증상" || sub.name === "추가 증상" ||
        selectedSymptoms.some(symptomId =>
          questions.find(q => q.id === parseInt(symptomId))?.options.some(opt => sub.name.includes(opt.optionText))
        )
      );
      setCategories(prev => {
        const newCategories = [...prev];
        newCategories[currentCategoryIndex] = { ...currentCategory, subCategories: filteredSubCategories };
        return newCategories;
      });
    }

    if (currentSubCategoryIndex < currentCategory.subCategories.length - 1) {
      setCurrentSubCategoryIndex(prev => prev + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentSubCategoryIndex(0);
    } else {
      submitSurvey();
    }
  }, [categories, currentCategoryIndex, currentSubCategoryIndex, questions, responses, selectedSymptoms, validateResponses]);

  const submitSurvey = useCallback(async () => {
    try {
      const submissionData = Object.entries(responses).map(([questionId, response]) => ({
        questionId: parseInt(questionId),
        responseType: typeof response === 'string' ? 'TEXT' : 'MULTIPLE_CHOICE',
        responseText: typeof response === 'string' ? response : null,
        selectedOptions: Array.isArray(response) ? response : null,
      }));

      await axios.post(`${API_URL}survey/submit`, { responses: submissionData }, { withCredentials: true });
      alert('설문이 성공적으로 제출되었습니다.');
      navigate('/');
    } catch (error) {
      alert('설문 제출에 실패했습니다.');
    }
  }, [responses, navigate]);

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
