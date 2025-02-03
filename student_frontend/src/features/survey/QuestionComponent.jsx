import React from 'react';
import { TextField, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup } from "@mui/material";

const QuestionComponent = ({ question, response, onResponseChange }) => {
  const handleChange = (event) => {
    let value;
    if (question.questionType === 'MULTIPLE_CHOICE') {
      const selectedOptions = [...(response || [])];
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
          value={response || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      );
    case 'SINGLE_CHOICE':
      return (
        <RadioGroup
          value={response !== undefined ? response : ''}
          onChange={handleChange}
        >
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={option.optionText}
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
                  checked={(response || []).includes(option.id)}
                  onChange={handleChange}
                  value={option.id}
                />
              }
              label={option.optionText}
            />
          ))}
        </FormGroup>
      );
    default:
      return null;
  }
};

export default QuestionComponent;
