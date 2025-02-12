
import React from 'react';
import { Typography, Box } from '@mui/material';
import QuestionComponent from '@/features/survey/QuestionComponent';

/**
 * 설문 내용 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.currentCategory - 현재 카테고리
 * @param {Object} props.currentSubCategory - 현재 서브 카테고리
 * @param {Array} props.questions - 질문 목록
 * @param {Object} props.responses - 응답 목록
 * @param {Function} props.onResponseChange - 응답 변경 핸들러
 * @returns {JSX.Element} SurveyContent 컴포넌트
 */
const SurveyContent = ({ currentCategory, currentSubCategory, questions, responses, onResponseChange }) => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>{currentCategory?.name}</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>{currentSubCategory?.name}</Typography>
      {questions.map((question) => (
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
