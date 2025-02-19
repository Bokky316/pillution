import React, { useState } from 'react';
import { Box, Typography } from "@mui/material";
import styled from '@emotion/styled';

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected', // isSelected를 DOM으로 전달하지 않음
})`
  width: 90%; /* 너비를 90%로 설정 */
  padding: 16px;
  margin-bottom: 12px;
  background-color: ${props => props.isSelected ? '#4169E1' : '#f5f5f5'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#4169E1' : '#f0f0f0'};
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

const WarningMessage = styled(Typography)`
  position: absolute;
  bottom: -24px; /* 경고 메시지를 입력 필드 아래에 표시 */
  left: 0;
  background-color: #fff3cd; /* 노란색 배경 */
  color: #856404; /* 어두운 노란색 텍스트 */
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
`;

const QuestionComponent = ({ question, response, onResponseChange }) => {
  const [warning, setWarning] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleChange = (event) => {
    let value = event.target.value;
    let newIsValid = true;

    if (question.questionType === 'TEXT') {
      value = value.trim();

      if (question.questionText.includes('키')) {
        const height = parseInt(value, 10);
        if (height < 50 || height > 250) {
          setWarning('키는 50cm에서 250cm 사이로 입력해주세요.');
          newIsValid = false;
        } else {
          setWarning('');
        }
      } else if (question.questionText.includes('몸무게')) {
        const weight = parseInt(value, 10);
        if (weight < 10 || weight > 300) {
          setWarning('몸무게는 10kg에서 300kg 사이로 입력해주세요.');
          newIsValid = false;
        } else {
          setWarning('');
        }
      } else if (question.questionText.includes('나이')) {
        const age = parseInt(value, 10);
        if (age < 1 || age > 120) {
          setWarning('나이는 만 나이 기준으로, 최소값은 "1", 최대값은 "120"입니다.');
          newIsValid = false;
        } else {
          setWarning('');
        }
      }
    }

    setIsValid(newIsValid);
    onResponseChange(value, newIsValid);
  };

  const getPlaceholder = () => {
    if (question.questionText.includes('키')) return '키를 입력하세요 (예: 최대값은 "250")';
    if (question.questionText.includes('몸무게')) return '몸무게를 입력하세요 (예시 : 최대값은 "300")';
    if (question.questionText.includes('나이')) return '나이를 입력하세요';
    return '입력하세요';
   };

  return (
    <Box sx={{ mb: 3, position: 'relative' }}> {/* position: relative로 설정하여 경고 메시지 위치 조정 */}
      {/* 질문 텍스트 */}
      <Typography sx={{ mb: 2, fontWeight: 'bold' }}>
        {question.questionText}
      </Typography>

      {/* TEXT 타입 질문 */}
      {question.questionType === 'TEXT' ? (
        <>
          <StyledInput
            value={response || ''}
            onChange={handleChange}
            placeholder={getPlaceholder()}
          />
          {warning && <WarningMessage>{warning}</WarningMessage>} {/* 경고 메시지 표시 */}
        </>
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
