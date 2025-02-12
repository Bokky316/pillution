// src/features/survey/SurveyContent.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import QuestionComponent from '@/features/survey/QuestionComponent';

const SurveyContent = ({ currentCategory, currentSubCategory, questions, responses, onResponseChange }) => {
  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}> {/* 질문을 가운데 정렬 */}
      {/* 질문 리스트 */}
      {questions && questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          response={responses[question.id]}
          onResponseChange={(value) => onResponseChange(question.id, value)}
        />
      ))}
    </Box>
  );
};

export default SurveyContent;
