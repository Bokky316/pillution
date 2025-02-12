import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, TextField, FormGroup, Paper } from '@mui/material';

/**
 * 설문 질문 컴포넌트
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.question - 질문 데이터
 * @param {string} props.question.questionText - 질문 텍스트
 * @param {string} props.question.questionType - 질문 타입 (TEXT, SINGLE_CHOICE, MULTIPLE_CHOICE)
 * @param {Array} props.question.options - 선택지 배열 (옵션이 있는 경우)
 * @param {any} props.response - 현재 질문에 대한 응답 값
 * @param {Function} props.onResponseChange - 응답 변경 핸들러 함수
 *
 * @returns {JSX.Element} QuestionComponent 컴포넌트
 */
const QuestionComponent = ({ question, response, onResponseChange }) => {
  /**
   * 응답 변경 핸들러
   *
   * @param {Object} event - 이벤트 객체
   */
  const handleChange = (event) => {
    let value;
    if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'SINGLE_CHOICE') {
      value = parseInt(event.target.value, 10);
    } else {
      value = event.target.value;
    }
    onResponseChange(value);
  };

  /**
   * 옵션 렌더링 함수
   *
   * 질문 타입에 따라 적절한 UI를 렌더링합니다.
   */
  const renderOptions = () => {
    switch (question.questionType) {
      case 'SINGLE_CHOICE':
        return (
          <RadioGroup
            value={response !== undefined ? response.toString() : ''}
            onChange={handleChange}
          >
            {question.options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id.toString()}
                control={<Radio />}
                label={option.optionText}
                sx={{
                  display: 'block', // 한 줄에 하나씩 배치
                  marginY: 1,
                  padding: 1,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 255, 0.1)' }, // Hover 시 파란색 배경
                  '& .MuiRadio-root.Mui-checked': {
                    color: 'blue', // 선택된 라디오 버튼 색상 변경
                  },
                }}
              />
            ))}
          </RadioGroup>
        );
      case 'MULTIPLE_CHOICE':
        return (
          <FormGroup>
            {question.options.map((option) => (
              <FormControlLabel
                key={option.id}
                control={
                  <Checkbox
                    checked={Array.isArray(response) && response.includes(option.id)}
                    onChange={() => onResponseChange(option.id)}
                    value={option.id.toString()}
                  />
                }
                label={option.optionText}
                sx={{
                  display: 'block', // 한 줄에 하나씩 배치
                  marginY: 1,
                  padding: 1,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 255, 0.1)' }, // Hover 시 파란색 배경
                  '& .MuiCheckbox-root.Mui-checked': {
                    color: 'blue', // 선택된 체크박스 색상 변경
                  },
                }}
              />
            ))}
          </FormGroup>
        );
      case 'TEXT':
        return (
          <TextField
            fullWidth
            label={question.questionText}
            value={response || ''}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              endAdornment: question.questionText.includes('키') ? 'cm' :
                           question.questionText.includes('몸무게') ? 'kg' : null,
              inputProps: {
                style: { textAlign: 'right' },
              }
            }}
            placeholder={
              question.questionText.includes('키') ? '키를 입력하세요 (예: 170)' :
              question.questionText.includes('몸무게') ? '몸무게를 입력하세요 (예: 65)' :
              question.questionText.includes('나이') ? '나이를 입력하세요' :
              '입력하세요'
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      {/* 질문 텍스트 */}
      <Typography variant="h6" gutterBottom>{question.questionText}</Typography>

      {/* 옵션 렌더링 */}
      <Box sx={{ mt: 2 }}>
        {renderOptions()}
      </Box>
    </Paper>
  );
};

export default QuestionComponent;
