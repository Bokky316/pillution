import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Grid, CircularProgress } from '@mui/material';
import { fetchRecommendations } from '../redux/surveySlice';
import ProductCard from './ProductCard';
import RecommendationSection from './RecommendationSection';

const RecommendationPage = () => {
  const dispatch = useDispatch();
  const { recommendations, loading, error } = useSelector(state => state.survey);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>추천 제품</Typography>
      <RecommendationSection title="필수 추천 제품" products={recommendations.essential} />
      <RecommendationSection title="추가 추천 제품" products={recommendations.additional} />
    </Container>
  );
};

export default RecommendationPage;
