import React from 'react';
import { Typography, Box, Grid } from '@mui/material';

const HealthAnalysisSection = ({ healthAnalysis }) => {
  // healthAnalysis가 없거나 필요한 속성이 없는 경우를 대비한 안전 장치
  if (!healthAnalysis || !healthAnalysis.bmi) {
    return <Typography>건강 분석 데이터를 불러오는 중입니다...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        건강 분석 결과
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" fontWeight="bold">이름</Typography>
          <Typography variant="body1">{healthAnalysis.name || '관리자'}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" fontWeight="bold">나이</Typography>
          <Typography variant="body1">{healthAnalysis.age || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" fontWeight="bold">성별</Typography>
          <Typography variant="body1">{healthAnalysis.gender || '정보 없음'}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" fontWeight="bold">BMI</Typography>
          <Typography variant="body1">{healthAnalysis.bmi.toFixed(1)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">총평</Typography>
          <Typography variant="body1">{healthAnalysis.overallAssessment}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthAnalysisSection;
