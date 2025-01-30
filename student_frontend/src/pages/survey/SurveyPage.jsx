// features/survey/SurveyPage.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { getSurveyCategories } from '../auth/api';
import { useNavigate } from 'react-router-dom';
import QuestionList from './QuestionList';
import submitSurvey from './submitSurvey';

const SurveyPage = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentSubCategoryIndex, setCurrentSubCategoryIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getSurveyCategories();
        setCategories(data);

        if (data.length > 0) {
          setQuestions(data[0]?.subCategories[0]?.questions || []);
        }
      } catch (err) {
        console.error('설문 카테고리 로딩 오류:', err);
        setError('설문 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const currentCategory = categories[currentCategoryIndex];
    if (
      currentSubCategoryIndex < currentCategory.subCategories.length - 1
    ) {
      setCurrentSubCategoryIndex((prev) => prev + 1);
      setQuestions(
        currentCategory.subCategories[currentSubCategoryIndex + 1].questions
      );
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      setCurrentSubCategoryIndex(0);
      setQuestions(categories[currentCategoryIndex + 1].subCategories[0].questions);
    } else {
      submitSurvey(responses, navigate); // 설문 제출 호출
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {categories[currentCategoryIndex]?.name}
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {categories[currentCategoryIndex]?.subCategories[currentSubCategoryIndex]?.name}
      </Typography>

      <QuestionList
        questions={questions}
        responses={responses}
        onResponseChange={handleResponseChange}
      />

      <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
        {currentCategoryIndex === categories.length - 1 &&
        currentSubCategoryIndex ===
          categories[currentCategoryIndex].subCategories.length - 1
          ? '제출'
          : '다음'}
      </Button>
    </Box>
  );
};

export default SurveyPage;
