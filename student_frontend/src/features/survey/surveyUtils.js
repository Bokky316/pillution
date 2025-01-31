import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import axios from 'axios';

const SupplementRecommendation = () => {
  const [recommendations, setRecommendations] = useState({ required: [], additional: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/supplements/recommend', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRecommendations(response.data);
      } catch (error) {
        console.error('추천 영양제 로딩 오류:', error);
        setError('추천 영양제를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>추천 영양제</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>⚡ 필수 추천</Typography>
          {recommendations.required.length > 0 ? (
            recommendations.required.map(({ supplement, count }) => (
              <Chip
                key={supplement}
                label={`${supplement} (${count}회 추천)`}
                color="primary"
                sx={{ m: 0.5 }}
              />
            ))
          ) : (
            <Typography>필수 추천 영양제가 없습니다.</Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>🔹 추가 추천</Typography>
          {recommendations.additional.length > 0 ? (
            recommendations.additional.map(({ supplement, count }) => (
              <Chip
                key={supplement}
                label={`${supplement} (${count}회 추천)`}
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            ))
          ) : (
            <Typography>추가 추천 영양제가 없습니다.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupplementRecommendation;
