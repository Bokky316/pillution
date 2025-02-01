import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress
} from '@mui/material';

const API_URL = "http://localhost:8080/api/";

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState({ essential: [], additional: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true,
        validateStatus: function (status) {
          return status < 500; // 500 이상의 상태 코드를 오류로 처리
        }
      });
      console.log('API Response:', response.data);
      setRecommendations(response.data);
    } catch (error) {
      console.error('추천 제품 로딩 오류:', error.response ? error.response.data : error.message);
      setError('추천 제품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>추천 제품</Typography>

      <Typography variant="h5" gutterBottom>필수 추천 제품</Typography>
      <Grid container spacing={3}>
        {recommendations.essential && recommendations.essential.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>추가 추천 제품</Typography>
      <Grid container spacing={3}>
        {recommendations.additional && recommendations.additional.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const ProductCard = ({ product }) => (
  <Card>
    <CardMedia
      component="img"
      height="140"
      image={product.imageUrl || 'https://via.placeholder.com/140'}
      alt={product.name}
    />
    <CardContent>
      <Typography gutterBottom variant="h6" component="div">
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {product.description}
      </Typography>
      <Typography variant="body1" color="text.primary">
        가격: {product.price}원
      </Typography>
      <Typography variant="body2" color="text.secondary">
        주요 성분: {product.mainIngredient}
      </Typography>
      <Button variant="contained" color="primary" style={{ marginTop: '1rem' }}>
        상세 보기
      </Button>
    </CardContent>
  </Card>
);

export default RecommendationPage;
