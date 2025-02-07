import React from 'react';
import { Typography, Box, Grid } from '@mui/material';

const HealthAnalysisSection = ({ healthAnalysis }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        건강 분석 결과
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold">BMI</Typography>
          <Typography variant="body1">{healthAnalysis.bmi.toFixed(1)}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold">위험도</Typography>
          {Object.entries(healthAnalysis.riskLevels).map(([key, value]) => (
            <Typography key={key} variant="body1">{key}: {value}</Typography>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold">총평</Typography>
          <Typography variant="body1">{healthAnalysis.overallAssessment}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthAnalysisSection;