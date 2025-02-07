import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, TextField } from "@mui/material";

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
                  checked={Array.isArray(response) && response.includes(option.id)}
                  onChange={() => onResponseChange(option.id)}
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
