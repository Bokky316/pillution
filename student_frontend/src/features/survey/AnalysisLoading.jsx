// src/features/survey/AnalysisLoading.js
import React from 'react';
import { Box, Typography, CircularProgress } from "@mui/material";

const AnalysisLoading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h5" sx={{ mt: 2 }}>
        분석 중입니다...
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        곧 분석 결과가 나올거에요.
      </Typography>
    </Box>
  );
};

export default AnalysisLoading;
