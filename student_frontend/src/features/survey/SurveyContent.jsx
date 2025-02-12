import React, { useState } from 'react';
import { Box, Typography, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';

/**
 * 설문 내용 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.currentCategory - 현재 카테고리 데이터
 * @param {Object} props.currentSubCategory - 현재 서브카테고리 데이터
 * @param {Array} props.questions - 현재 서브카테고리의 질문 목록
 * @param {Object} props.responses - 질문에 대한 응답 데이터
 * @returns {JSX.Element} SurveyContent 컴포넌트
 */
const SurveyContent = ({ currentCategory, currentSubCategory, questions, responses }) => {
  const personalInfoQuestions = [
    { id: 'name', label: '이름을 알려주세요', type: 'text' },
    { id: 'gender', label: '성별을 알려주세요', type: 'radio', options: ['남성', '여성'] },
    { id: 'age', label: '나이를 알려주세요', type: 'number' },
    { id: 'height', label: '키를 알려주세요', type: 'number', unit: 'cm' },
    { id: 'weight', label: '몸무게를 알려주세요', type: 'number', unit: 'kg' },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({});

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const renderPersonalInfoQuestion = () => {
    const question = personalInfoQuestions[currentQuestionIndex];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {question.label}
        </Typography>
        {question.type === 'text' || question.type === 'number' ? (
          <TextField
            fullWidth
            type={question.type}
            value={personalInfo[question.id] || ''}
            onChange={(e) => handlePersonalInfoChange(question.id, e.target.value)}
            placeholder={question.unit ? `${question.unit}` : ''}
            margin="normal"
          />
        ) : question.type === 'radio' ? (
          <RadioGroup
            value={personalInfo[question.id] || ''}
            onChange={(e) => handlePersonalInfoChange(question.id, e.target.value)}
          >
            {question.options.map((option) => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        ) : null}
      </Box>
    );
  };

  if (currentQuestionIndex < personalInfoQuestions.length) {
    return renderPersonalInfoQuestion();
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {currentSubCategory?.name}
      </Typography>
      {/* 설문 질문 렌더링 */}
      {/* 기존 질문 렌더링 로직 */}
    </Box>
  );
};

export default SurveyContent;
