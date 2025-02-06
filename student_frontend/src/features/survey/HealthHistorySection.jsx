import React from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';

/**
 * HealthHistorySection 컴포넌트
 * 사용자의 과거 건강 기록을 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {Array} props.healthHistory - 과거 건강 기록 배열
 */
const HealthHistorySection = ({ healthHistory }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        과거 건강 기록
      </Typography>
      <List>
        {healthHistory.map((record, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={new Date(record.recordDate).toLocaleDateString()}
              secondary={`BMI: ${record.bmi.toFixed(1)}, 총평: ${record.overallAssessment}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default HealthHistorySection;
