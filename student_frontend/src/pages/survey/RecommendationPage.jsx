import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Grid, CircularProgress } from '@mui/material';
import { fetchRecommendations } from '@/redux/surveySlice';
import ProductCard from '@features/product/ProductCard';
import RecommendationSection from '@features/survey/RecommendationSection';

const RecommendationPage = () => {
  const dispatch = useDispatch();
  const { recommendations, loading, error } = useSelector((state) => state.survey);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        추천 제품
      </Typography>
      {recommendations.map((section) => (
        <RecommendationSection key={section.category} section={section} />
      ))}
    </Container>
  );
};

export default RecommendationPage;
