/**
 * @component QuestionComponent
 * @description 설문 문항을 표시하고 응답을 처리하는 컴포넌트입니다.
 * UI는 이미지의 디자인을 따르며, 기존 기능은 모두 유지합니다.
 * 
 * @param {Object} question - 질문 객체
 * @param {any} response - 현재 응답 값
 * @param {Function} onResponseChange - 응답 변경 처리 함수
 */
import React from 'react';
import { Box, Typography } from "@mui/material";
import styled from '@emotion/styled';

// 스타일드 컴포넌트 정의
const StyledBox = styled(Box)`
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
  width: 100%;
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
  // 기존 handleChange 함수 유지
  const handleChange = (event) => {
    let value;
    if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'SINGLE_CHOICE') {
      value = parseInt(event.target.value, 10);
    } else {
      value = event.target.value;
    }
    onResponseChange(value);
  };

  switch (question.questionType) {
    case 'TEXT':
      return (
        <StyledInput
          value={response || ''}
          onChange={handleChange}
          placeholder={
            question.questionText.includes('키') ? '키를 입력하세요 (예: 170)' :
            question.questionText.includes('몸무게') ? '몸무게를 입력하세요 (예: 65)' :
            question.questionText.includes('나이') ? '나이를 입력하세요' :
            '입력하세요'
          }
        />
      );
    case 'SINGLE_CHOICE':
      return (
        <Box>
          <Typography sx={{ mb: 2 }}>{question.questionText}</Typography>
          {question.options.map((option) => (
            <StyledBox
              key={option.id}
              isSelected={response === option.id}
              onClick={() => onResponseChange(option.id)}
            >
              <Typography>{option.optionText}</Typography>
            </StyledBox>
          ))}
        </Box>
      );
    case 'MULTIPLE_CHOICE':
      return (
        <Box>
          <Typography sx={{ mb: 2 }}>{question.questionText}</Typography>
          {question.options.map((option) => (
            <StyledBox
              key={option.id}
              isSelected={Array.isArray(response) && response.includes(option.id)}
              onClick={() => onResponseChange(option.id)}
            >
              <Typography>{option.optionText}</Typography>
            </StyledBox>
          ))}
        </Box>
      );

    default:
      return null;
  }
};

export default QuestionComponent;