import React from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';

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