import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar, Button } from '@mui/material';
import { fetchHealthAnalysisAndRecommendations, fetchHealthHistory, addRecommendationsToCart } from '@/redux/recommendationSlice';

/**
 * RecommendationPage 컴포넌트
 *
 * 건강 분석 결과와 추천 정보를 표시하는 페이지입니다.
 */
const RecommendationPage = () => {
  const dispatch = useDispatch();
  const { healthAnalysis, recommendations, recommendedIngredients, loading, error } =
    useSelector((state) => state.recommendations);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  /**
   * 컴포넌트 마운트 시 건강 분석 데이터와 건강 기록을 가져옵니다.
   */
  useEffect(() => {
    dispatch(fetchHealthAnalysisAndRecommendations());
    dispatch(fetchHealthHistory());
  }, [dispatch]);

  /**
   * 에러 발생 시 스낵바를 표시합니다.
   */
  useEffect(() => {
    if (error) setSnackbarOpen(true);
  }, [error]);

  /**
   * 로딩 중일 때 로딩 인디케이터를 표시합니다.
   */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  /**
   * 모든 추천 상품을 장바구니에 추가하는 함수입니다.
   */
  const handleAddAllToCart = () => {
    dispatch(addRecommendationsToCart(recommendations))
      .unwrap()
      .then(() => alert('모든 추천 상품이 장바구니에 담겼습니다.'))
      .catch((err) => alert(`장바구니 담기에 실패했습니다. 오류: ${err}`));
  };

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          {healthAnalysis?.name || '사용자'} 님의 건강검문결과표
        </Typography>

        {/* 건강 분석 결과 섹션 */}
        {healthAnalysis && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6">
              이름: {healthAnalysis.name || '이름 없음'} |
              성별: {healthAnalysis.gender || '성별 미상'} |
              나이: {healthAnalysis.age || '나이 미상'}세 |
              BMI: {healthAnalysis.bmi?.toFixed(1) || 'BMI 미상'}
            </Typography>
            <Typography variant="body1" mt={2}>
              {healthAnalysis.overallAssessment}
            </Typography>
          </Paper>
        )}

        {/* 추천 영양 성분 섹션 */}
        {recommendedIngredients.length > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              추천 영양 성분
            </Typography>
            {recommendedIngredients.map((ingredient, index) => (
              <Typography key={index} variant="body1" gutterBottom>
                • {ingredient.name} (점수: {ingredient.score})
              </Typography>
            ))}
          </Paper>
        )}

        {/* 추천 상품 섹션 */}
        {recommendations.length > 0 && (
          <Box mb={6}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              추천 상품
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {recommendations.map((product) => (
                <Paper key={product.id} elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{product.name}</Typography>
                  <Typography variant="body2">{product.description}</Typography>
                  <Typography variant="body2">가격: {product.price.toLocaleString()}원</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* "추천 상품 장바구니에 담기" 버튼 */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddAllToCart}
            sx={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: 'primary.dark' },
            }}
          >
            추천 상품 장바구니에 담기
          </Button>
        </Box>

        {/* 에러 메시지 스낵바 */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={error || "오류가 발생했습니다."}
        />
      </Box>
    </Container>
  );
};

export default RecommendationPage;
