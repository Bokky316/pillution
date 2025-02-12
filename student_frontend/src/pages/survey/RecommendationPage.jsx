import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar, Button } from '@mui/material';
import { fetchHealthAnalysisAndRecommendations, fetchHealthHistory, addRecommendationsToCart } from '@/redux/recommendationSlice';
import RecommendationSection from '@/features/survey/RecommendationSection';
import HealthAnalysisSection from '@/features/survey/HealthAnalysisSection';

const RecommendationPage = () => {
  const dispatch = useDispatch();
  const { healthAnalysis, recommendations, recommendedIngredients, loading, error } =
    useSelector((state) => state.recommendations);

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchHealthAnalysisAndRecommendations());
    dispatch(fetchHealthHistory());
  }, [dispatch]);

  useEffect(() => {
    if (error) setSnackbarOpen(true);
  }, [error]);

  console.log('recommendations:', recommendations);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const allProducts = Object.values(recommendations).flat();
  const uniqueProducts = allProducts.reduce((acc, product) => {
    if (!acc.some((p) => p.id === product.id)) acc.push(product);
    return acc;
  }, []);

  /**
   * 추천 상품 전체를 장바구니에 추가하는 함수
   */
  const handleAddAllToCart = () => {
    dispatch(addRecommendationsToCart(uniqueProducts))
      .unwrap()
      .then(() => alert('모든 추천 상품이 장바구니에 담겼습니다.'))
      .catch((err) => alert(`장바구니 담기에 실패했습니다. 오류: ${err}`));
  };

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          맞춤 건강 분석 및 영양제 추천
        </Typography>

        {/* 건강 분석 결과 섹션 */}
        {healthAnalysis && (
          <Paper elevation={3} sx={{ p: 3 }}>
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
        {uniqueProducts.length > 0 && (
          <>
            <Box mb={6}>
              <RecommendationSection title="추천 제품" products={uniqueProducts} maxItems={10} />
            </Box>

            {/* "추천 상품 장바구니에 담기" 버튼 - 추천 제품 섹션 아래 */}
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
          </>
        )}

        {/* 에러 메시지 스낵바 */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} message={error || "오류가 발생했습니다."} />
      </Box>
    </Container>
  );
};

export default RecommendationPage;
