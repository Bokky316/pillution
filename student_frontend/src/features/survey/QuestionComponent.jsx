import React from 'react';
import { TextField, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup } from "@mui/material";

const QuestionComponent = ({ question, response, onResponseChange }) => {
  const handleChange = (event) => {
    let value;
    if (question.questionType === 'MULTIPLE_CHOICE') {
      // 다중 선택의 경우 선택된 모든 값을 배열로 관리
      const selectedOptions = [...(response || [])];
      if (event.target.checked) {
        selectedOptions.push(event.target.value); // 문자열로 저장
      } else {
        const index = selectedOptions.indexOf(event.target.value);
        if (index > -1) {
          selectedOptions.splice(index, 1);
        }
      }
      value = selectedOptions;
    } else {
      value = event.target.value; // 문자열로 저장
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
          value={response || ''}
          onChange={handleChange}
        >
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id.toString()} // 문자열로 변환하여 저장
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
                  checked={(response || []).includes(option.id.toString())} // 문자열로 비교
                  onChange={handleChange}
                  value={option.id.toString()} // 문자열로 저장
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
