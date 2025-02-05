import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, TextField } from "@mui/material";

const QuestionComponent = ({ question, response, onResponseChange }) => {
  const handleChange = (event) => {
    let value;
    if (question.questionType === 'MULTIPLE_CHOICE') {
      const optionId = parseInt(event.target.value, 10);
      onResponseChange(question.id, optionId);
    } else if (question.questionType === 'SINGLE_CHOICE') {
      value = parseInt(event.target.value, 10);

      // 성별 질문 처리
      if (question.questionText === "성별을 알려주세요") {
        // relatedQuestionIds는 백엔드에서 성별에 따른 관련 질문 ID들을 전달받았다고 가정
        const option = question.options.find(opt => opt.id === value);
        onResponseChange(question.id, value, option.relatedQuestionIds);
      } else {
        onResponseChange(question.id, value);
      }
    } else {
      // TEXT 타입 처리
      if (question.questionText.includes('키') ||
          question.questionText.includes('몸무게') ||
          question.questionText.includes('나이')) {

        // 숫자만 입력 가능하도록
        const numberValue = event.target.value.replace(/[^\d]/g, '');

        // 빈 값 처리
        if (numberValue === '') {
          onResponseChange(question.id, '');
          return;
        }

        // 유효성 검사
        const num = parseInt(numberValue, 10);
        if (question.questionText.includes('키') && (num <= 0 || num > 300)) return;
        if (question.questionText.includes('몸무게') && (num <= 0 || num > 500)) return;
        if (question.questionText.includes('나이') && (num < 0 || num > 150)) return;

        value = parseInt(numberValue, 10);
      } else {
        value = event.target.value;
      }
      onResponseChange(question.id, value);
    }
  };

  switch (question.questionType) {
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
    case 'SINGLE_CHOICE':
      return (
        <Box sx={{ mb: 2 }}>
          <Typography>{question.questionText}</Typography>
          <RadioGroup
            value={response !== undefined ? response.toString() : ''}
            onChange={(event) => {
              const value = parseInt(event.target.value, 10);
              console.log('SINGLE_CHOICE 선택:', { questionId: question.id, value });

              // 성별 질문인 경우 특별 처리
              if (question.questionText === "성별을 알려주세요") {
                const selectedOption = question.options.find(opt => opt.id === value);
                onResponseChange(question.id, value, selectedOption.relatedQuestionIds);
              } else {
                onResponseChange(question.id, value);
              }
            }}
          >
            {question.options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id.toString()}
                control={<Radio />}
                label={option.optionText}
              />
            ))}
          </RadioGroup>
        </Box>
      );
    case 'MULTIPLE_CHOICE':
      return (
        <Box sx={{ mb: 2 }}>
          <Typography>{question.questionText}</Typography>
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={Array.isArray(response) && response.includes(option.id.toString())}
                  onChange={(event) => {
                    const selectedOptionId = option.id.toString();
                    if (question.questionText === "불편하거나 걱정되는 것을 최대 3가지 선택하세요") {
                      // 주요 증상 질문인 경우 특별 처리
                      onResponseChange(question.id, selectedOptionId, option.relatedQuestionIds);
                    } else {
                      onResponseChange(question.id, selectedOptionId);
                    }
                  }}
                  value={option.id.toString()}
                />
              }
              label={option.optionText}
            />
          ))}
        </Box>
      );

    default:
      return null;
  }
};

export default QuestionComponent;