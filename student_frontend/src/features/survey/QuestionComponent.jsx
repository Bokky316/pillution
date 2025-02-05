import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, TextField } from "@mui/material";

const QuestionComponent = ({ question, response, onResponseChange }) => {
  const handleChange = (event) => {
    let value;
    if (question.questionType === 'MULTIPLE_CHOICE') {
      const optionId = event.target.value;
      let selectedOptions = [...(response || [])];

      const lastOptionIndex = question.options.length - 1;
      const lastOptionId = question.options[lastOptionIndex].id.toString();

      if (optionId === lastOptionId) {
        // '해당 없음' 옵션 선택시
        selectedOptions = selectedOptions.includes(lastOptionId) ? [] : [lastOptionId];
      } else {
        if (selectedOptions.includes(lastOptionId)) {
          selectedOptions = [];
        }

        const index = selectedOptions.indexOf(optionId);
        if (index > -1) {
          selectedOptions.splice(index, 1);
        } else {
          if (question.questionText.includes('불편하거나 걱정되는 것') && selectedOptions.length >= 3) {
            return;
          }
          selectedOptions.push(optionId);
        }
      }
      onResponseChange(question.id, selectedOptions);
    } else if (question.questionType === 'SINGLE_CHOICE') {
      value = parseInt(event.target.value, 10);
      onResponseChange(question.id, value);
    } else {
      // TEXT 타입 처리
      if (question.questionText.includes('키') ||
          question.questionText.includes('몸무게') ||
          question.questionText.includes('나이')) {
        const numberValue = event.target.value.replace(/[^\d]/g, '');

        if (numberValue === '') {
          onResponseChange(question.id, '');
          return;
        }

        const num = parseInt(numberValue, 10);
        if (question.questionText.includes('키') && (num <= 0 || num > 300)) return;
        if (question.questionText.includes('몸무게') && (num <= 0 || num > 500)) return;
        if (question.questionText.includes('나이') && (num < 0 || num > 150)) return;

        value = num;
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
            onChange={handleChange}
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
                  onChange={handleChange}
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