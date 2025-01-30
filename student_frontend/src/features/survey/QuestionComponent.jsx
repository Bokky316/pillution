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
          {question.options.map((option, index) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={(response || []).includes(option.id.toString())}
                  onChange={(e) => {
                    let newResponse;
                    if (index === question.options.length - 1) {
                      // 마지막 선택지를 선택한 경우
                      newResponse = e.target.checked ? [option.id.toString()] : [];
                    } else {
                      // 다른 선택지를 선택한 경우
                      newResponse = e.target.checked
                        ? [...(response || []).filter(id => id !== question.options[question.options.length - 1].id.toString()), option.id.toString()]
                        : (response || []).filter((id) => id !== option.id.toString());
                    }
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
