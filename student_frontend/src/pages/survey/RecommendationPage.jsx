import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar } from '@mui/material';
import { fetchHealthAnalysisAndRecommendations, fetchHealthHistory } from '@/redux/recommendationSlice';
import RecommendationSection from '@/features/survey/RecommendationSection';
import HealthAnalysisSection from '@/features/survey/HealthAnalysisSection';
import HealthHistorySection from '@/features/survey/HealthHistorySection';

/**
 * 건강 분석 및 추천 정보를 표시하는 페이지 컴포넌트
 * @returns {JSX.Element} RecommendationPage 컴포넌트
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

  // 컴포넌트 마운트 시 데이터 fetch
  useEffect(() => {
    dispatch(fetchHealthAnalysisAndRecommendations());
    dispatch(fetchHealthHistory());
  }, [dispatch]);

  // 에러 발생 시 스낵바 표시
  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  // 데이터 확인을 위한 로그
  console.log('recommendations:', recommendations);
  console.log('recommendedIngredients:', recommendedIngredients);

  // 로딩 중일 때 표시할 내용
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
      
      {/* 건강 분석 결과 섹션 */}
      {healthAnalysis && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <HealthAnalysisSection healthAnalysis={healthAnalysis} />
        </Paper>
      )}
      
      {/* 추천 영양 성분 섹션 */}
      {recommendedIngredients && recommendedIngredients.essential && recommendedIngredients.essential.length > 0 && (
        <Box mb={6}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            추천 영양 성분
          </Typography>
          <Paper elevation={3} sx={{ p: 3 }}>
            {recommendedIngredients.essential.map((ingredient, index) => (
              <Typography key={index} variant="body1" gutterBottom>
                • {ingredient}
              </Typography>
            ))}
          </Paper>
        </Box>
      )}
      
      {/* 추천 제품 섹션 */}
      {recommendations && Object.keys(recommendations).length > 0 && (
        <>
          {Object.entries(recommendations).map(([key, products]) => (
            <Box key={key} mb={6}>
              <RecommendationSection title={`${key} 추천 제품`} products={products} maxItems={5} />
            </Box>
          ))}
        </>
      )}
      
{/*        */}{/* 건강 기록 히스토리 섹션 */}{/*
      {healthHistory && healthHistory.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <HealthHistorySection healthHistory={healthHistory} />
        </Paper>
      )}
       */}
      {/* 에러 메시지 스낵바 */}
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
