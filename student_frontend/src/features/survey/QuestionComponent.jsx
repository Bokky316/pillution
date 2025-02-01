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
     const isMainSymptomQuestion = question.questionText.includes('불편하거나 걱정되는 것을 최대 3가지 선택하세요');
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
                     if (e.target.checked) {
                       if (isMainSymptomQuestion && (response || []).length >= 3) {
                         // 이미 3개가 선택된 경우, 추가 선택을 무시
                         return;
                       }
                       newResponse = [...(response || []).filter(id => id !== question.options[question.options.length - 1].id.toString()), option.id.toString()];
                     } else {
                       newResponse = (response || []).filter((id) => id !== option.id.toString());
                     }
                   }
                   onResponseChange(question.id, newResponse);
                 }}
                 disabled={isMainSymptomQuestion && (response || []).length >= 3 && !response.includes(option.id.toString()) && index !== question.options.length - 1}
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
