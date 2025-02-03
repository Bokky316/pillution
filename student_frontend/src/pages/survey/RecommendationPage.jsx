import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress } from '@mui/material';
import { fetchRecommendations } from '@/redux/recommendationSlice';
import RecommendationSection from '@/features/survey/RecommendationSection';

const RecommendationPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.recommendations);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  console.log('Recommendations:', items);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    console.error('Error fetching recommendations:', error);
    return <Typography color="error">추천 항목을 불러오는 데 실패했습니다: {error}</Typography>;
  }

  if (!items || (!items.essential && !items.additional)) {
    return <Typography>추천 항목이 없습니다.</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        추천 제품
      </Typography>
      <RecommendationSection title="필수 추천 제품" products={items.essential || []} />
      <RecommendationSection title="추가 추천 제품" products={items.additional || []} />
    </Container>
  );
};

export default RecommendationPage;
