import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, TextField } from "@mui/material";

const QuestionComponent = ({ question, response, onResponseChange }) => {
  const handleChange = (event) => {
    let value;

    if (question.questionType === 'MULTIPLE_CHOICE') {
      const selectedOptions = Array.isArray(response) ? [...response] : [];
      const optionId = parseInt(event.target.value, 10);

      if (event.target.checked) {
        selectedOptions.push(optionId);
      } else {
        const index = selectedOptions.indexOf(optionId);
        if (index > -1) {
          selectedOptions.splice(index, 1);
        }
      }
      value = selectedOptions;
    } else if (question.questionType === 'SINGLE_CHOICE') {
      value = parseInt(event.target.value, 10);
    } else {
      value = event.target.value;
    }

    onResponseChange(question.id, value);
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
