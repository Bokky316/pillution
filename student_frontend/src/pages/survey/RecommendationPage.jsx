import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar, Button } from '@mui/material';
import {
  fetchHealthAnalysis,
  fetchRecommendedIngredients,
  fetchRecommendedProducts,
  addRecommendationsToCart
} from '@/redux/recommendationSlice';

const RecommendationPage = () => {
  const dispatch = useDispatch();
  const {
    healthAnalysis,
    recommendedIngredients,
    recommendedProducts,
    loading,
    error,
    cartAddingStatus
  } = useSelector((state) => state.recommendations);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    dispatch(fetchHealthAnalysis());
    dispatch(fetchRecommendedIngredients());
    dispatch(fetchRecommendedProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarOpen(true);
    }
  }, [error]);

  useEffect(() => {
    if (cartAddingStatus === 'succeeded') {
      setSnackbarMessage('모든 추천 상품이 장바구니에 담겼습니다.');
      setSnackbarOpen(true);
    } else if (cartAddingStatus === 'failed') {
      setSnackbarMessage('장바구니 담기에 실패했습니다.');
      setSnackbarOpen(true);
    }
  }, [cartAddingStatus]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const handleAddAllToCart = () => {
    dispatch(addRecommendationsToCart(recommendedProducts));
  };

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          {healthAnalysis?.name || '사용자'} 님의 건강검문결과표
        </Typography>

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

        {recommendedIngredients && recommendedIngredients.length > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              추천 영양 성분
            </Typography>
            {recommendedIngredients.map((ingredient) => (
              <Typography key={ingredient.id} variant="body1" gutterBottom>
                • {ingredient.ingredientName} (점수: {ingredient.score.toFixed(1)})
              </Typography>
            ))}
          </Paper>
        )}

        {recommendedProducts && recommendedProducts.length > 0 && (
          <Box mb={6}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              추천 상품
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {recommendedProducts.map((product) => (
                <Paper key={product.id} elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{product.name}</Typography>
                  <Typography variant="body2">{product.reason}</Typography>
                  <Typography variant="body2">가격: {product.price?.toLocaleString() || '가격 미상'}원</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddAllToCart}
            disabled={!recommendedProducts || recommendedProducts.length === 0 || cartAddingStatus === 'loading'}
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
};

export default RecommendationPage;
