
import React from 'react';
import { Typography, Box, Grid } from '@mui/material';

/**
 * HealthAnalysisSection 컴포넌트
 * 사용자의 건강 분석 결과를 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {Object} props.healthAnalysis - 건강 분석 결과 객체
 *
 * @example
 * const healthAnalysis = {
 *   bmi: 22.5,
 *   riskLevels: { 심혈관: '낮음', 당뇨: '중간' },
 *   overallAssessment: '전반적으로 건강한 상태입니다.'
 * };
 * return (
 *   <HealthAnalysisSection healthAnalysis={healthAnalysis} />
 * )
 */
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
