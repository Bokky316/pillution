import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar } from '@mui/material';
import { fetchHealthAnalysisAndRecommendations, fetchHealthHistory } from '@/redux/recommendationSlice';
import RecommendationSection from '@/features/survey/RecommendationSection';
import HealthAnalysisSection from '@/features/survey/HealthAnalysisSection';
import HealthHistorySection from '@/features/survey/HealthHistorySection';

/**
 * 건강 분석 및 추천 정보를 표시하는 페이지 컴포넌트
 */
const RecommendationPage = () => {
  const dispatch = useDispatch();
  const {
    healthAnalysis,
    recommendations,
    recommendedIngredients,
    healthHistory,
    loading,
    error
  } = useSelector((state) => state.recommendations);

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchHealthAnalysisAndRecommendations());
    dispatch(fetchHealthHistory());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          맞춤 건강 분석 및 영양제 추천
        </Typography>
      </Box>
      {healthAnalysis && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <HealthAnalysisSection healthAnalysis={healthAnalysis} />
        </Paper>
      )}
      {recommendedIngredients && recommendedIngredients.length > 0 && (
        <Box mb={6}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            추천 영양 성분
          </Typography>
          <Paper elevation={3} sx={{ p: 3 }}>
            {recommendedIngredients.map((ingredient, index) => (
              <Typography key={index} variant="body1" gutterBottom>
                • {ingredient}
              </Typography>
            ))}
          </Paper>
        </Box>
      )}
      {recommendations && (
        <>
          <Box mb={6}>
            <RecommendationSection title="필수 추천 제품" products={recommendations.essential || []} maxItems={3} />
          </Box>
          <Box mb={6}>
            <RecommendationSection title="추가 추천 제품" products={recommendations.additional || []} maxItems={5} />
          </Box>
        </>
      )}
      {healthHistory && healthHistory.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <HealthHistorySection healthHistory={healthHistory} />
        </Paper>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={error || "오류가 발생했습니다."}
      />
    </Container>
  );
};

export default RecommendationPage;
