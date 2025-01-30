// features/survey/RecommendationPage.jsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { getRecommendations } from '../auth/api';

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getRecommendations();
        setRecommendations(data);
      } catch (err) {
        console.error('추천 데이터 로딩 오류:', err);
        setError('추천 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        추천 영양제 목록
      </Typography>

      {recommendations.map((item) => (
        <Card key={item.id} sx={{ mb: '20px' }}>
          <CardContent>
            <Typography variant="h6">{item.name}</Typography>
            <Typography>주요 성분: {item.mainIngredient}</Typography>
            <Typography>가격: {item.price}원</Typography>
          </CardContent>
          <Button variant="contained">자세히 보기</Button>
        </Card>
      ))}
    </Box>
  );
};

export default RecommendationPage;
