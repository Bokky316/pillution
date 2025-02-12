// src/features/survey/SurveyContent.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import QuestionComponent from '@/features/survey/QuestionComponent';

const SurveyContent = ({ currentCategory, currentSubCategory, questions, responses, onResponseChange }) => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>{currentCategory?.name}</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>{currentSubCategory?.name}</Typography>
      {questions && questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          response={responses[question.id]}
          onResponseChange={(value) => onResponseChange(question.id, value)}
        />
      ))}
    </>
  );
};

export default SurveyContent;
