import React from 'react';
import { Box, Typography } from "@mui/material";
import styled from '@emotion/styled';

// 스타일드 컴포넌트 정의
const StyledBox = styled(Box)`
  width: 90%; /* 너비를 90%로 설정 */
  padding: 16px;
  margin-bottom: 12px;
  background-color: ${props => props.isSelected ? '#FF5733' : '#f5f5f5'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#FF5733' : '#f0f0f0'};
  }
`;

const StyledInput = styled.input`
  width: 90%; /* 텍스트 입력 필드도 동일한 너비 */
  padding: 16px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 16px;

  &:focus {
    outline: none;
    background-color: #f0f0f0;
  }
`;

const QuestionComponent = ({ question, response, onResponseChange }) => {
  const handleChange = (event) => {
    let value;
    if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'SINGLE_CHOICE') {
      value = parseInt(event.target.value, 10);
    } else {
      value = event.target.value;
    }
    onResponseChange(value);
  };

  const getPlaceholder = () => {
    if (question.questionText.includes('키')) return '키를 입력하세요 (예: 170)';
    if (question.questionText.includes('몸무게')) return '몸무게를 입력하세요 (예: 65)';
    if (question.questionText.includes('나이')) return '나이를 입력하세요';
    return '입력하세요';
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* 질문 텍스트 */}
      <Typography sx={{ mb: 2, fontWeight: 'bold' }}>{question.questionText}</Typography>

      {/* TEXT 타입 질문 */}
      {question.questionType === 'TEXT' ? (
        <StyledInput
          value={response || ''}
          onChange={handleChange}
          placeholder={getPlaceholder()}
        />
      ) : question.questionType === 'SINGLE_CHOICE' ? (
        question.options.map((option) => (
          <StyledBox
            key={option.id}
            isSelected={response === option.id}
            onClick={() => onResponseChange(option.id)}
          >
            <Typography>{option.optionText}</Typography>
          </StyledBox>
        ))
      ) : question.questionType === 'MULTIPLE_CHOICE' ? (
        question.options.map((option) => (
          <StyledBox
            key={option.id}
            isSelected={Array.isArray(response) && response.includes(option.id)}
            onClick={() => onResponseChange(option.id)}
          >
            <Typography>{option.optionText}</Typography>
          </StyledBox>
        ))
      ) : null}
    </Box>
  );
};

export default QuestionComponent;
