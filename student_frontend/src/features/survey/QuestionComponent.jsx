import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, TextField } from "@mui/material";

const QuestionComponent = ({ question, response, onResponseChange }) => {
  switch (question.questionType) {
    case 'TEXT':
      return (
        <TextField
          fullWidth
          label={question.questionText}
          value={response || ''}
          onChange={(e) => onResponseChange(question.id, e.target.value)}
          margin="normal"
        />
      );
    case 'SINGLE_CHOICE':
      return (
        <Box sx={{ mb: 2 }}>
          <Typography>{question.questionText}</Typography>
          <RadioGroup
            value={response || ''}
            onChange={(e) => onResponseChange(question.id, e.target.value)}
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
                  checked={(response || []).includes(option.id.toString())}
                  onChange={(e) => {
                    const newResponse = e.target.checked
                      ? [...(response || []), option.id.toString()]
                      : (response || []).filter((id) => id !== option.id.toString());
                    onResponseChange(question.id, newResponse);
                  }}
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
