import React from 'react';
import { Typography, Box } from '@mui/material';
import QuestionComponent from '@/features/survey/QuestionComponent';

const SurveyContent = ({ currentCategory, currentSubCategory, questions, responses, onResponseChange, onAutoNext }) => {
  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      {questions && questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          response={responses[question.id]}
          onResponseChange={(value) => onResponseChange(question.id, value)}
          onAutoNext={onAutoNext}
        />
      ))}
    </Box>
  );
};

export default SurveyContent;
