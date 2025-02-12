import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar, Button } from '@mui/material';
import { fetchHealthAnalysisAndRecommendations, fetchHealthHistory, addRecommendationsToCart } from '@/redux/recommendationSlice';
import RecommendationSection from '@/features/survey/RecommendationSection';
import HealthAnalysisSection from '@/features/survey/HealthAnalysisSection';

/**
 * 추천 페이지 컴포넌트
 * @returns {JSX.Element} RecommendationPage 컴포넌트
 */
const RecommendationPage = () => {
  const dispatch = useDispatch();
  const { healthAnalysis, recommendations, recommendedIngredients, loading, error, user } =
    useSelector((state) => state.recommendations);

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchHealthAnalysisAndRecommendations());
    dispatch(fetchHealthHistory());
  }, [dispatch]);

  useEffect(() => {
    if (error) setSnackbarOpen(true);
  }, [error]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const uniqueProducts = recommendations.reduce((acc, product) => {
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

  /**
   * BMI 정상 여부를 판단하는 함수
   * @param {number} bmi - BMI 수치
   * @returns {string} BMI 상태
   */
  const getBmiStatus = (bmi) => {
    if (bmi < 18.5) return '저체중';
    if (bmi < 23) return '정상';
    if (bmi < 25) return '과체중';
    return '비만';
  };

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          {user?.name || '사용자'} 님의 건강검문결과표
        </Typography>

        {/* 사용자 기본 정보 */}
        {healthAnalysis && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6">
              성별 {user?.gender || '미상'} | 나이 {user?.age || '미상'}세 | BMI {healthAnalysis.bmi?.toFixed(1) || '미상'} ({getBmiStatus(healthAnalysis.bmi)})
            </Typography>
          </Paper>
        )}

        {/* 추천 영양 성분 섹션 */}
        {recommendedIngredients && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              추천 영양 성분
            </Typography>
            {recommendedIngredients.map((ingredient, index) => (
              <Typography key={index} variant="body1" gutterBottom>
                • {ingredient}
              </Typography>
            ))}
          </Paper>
        )}

        {/* 건강 개선 가이드 */}
        {healthAnalysis && healthAnalysis.healthImprovementGuide && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              건강 개선 가이드
            </Typography>
            <Typography variant="body1">
              {healthAnalysis.healthImprovementGuide}
            </Typography>
          </Paper>
        )}

        {/* 추천 식품 */}
        {healthAnalysis && healthAnalysis.recommendedFoods && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              추천 식품
            </Typography>
            <Typography variant="body1">
              {healthAnalysis.recommendedFoods}
            </Typography>
          </Paper>
        )}

        {/* 추천 제품 섹션 */}
        {uniqueProducts.length > 0 && (
          <Box mb={6}>
            <RecommendationSection title="추천 상품" products={uniqueProducts} maxItems={10} />
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
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} message={error || "오류가 발생했습니다."} />
      </Box>
    </Container>
  );
};

export default RecommendationPage;
