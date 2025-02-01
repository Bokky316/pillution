import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RecommendationPage = () => {
  const [surveyResult, setSurveyResult] = useState(null);
  const [recommendations, setRecommendations] = useState({ essential: [], additional: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        // 문진 결과 가져오기
        const surveyResponse = await axios.get('http://localhost:8080/api/survey/result', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSurveyResult(surveyResponse.data);

        // 추천 제품 가져오기
        const recommendationsResponse = await axios.get('http://localhost:8080/api/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRecommendations(recommendationsResponse.data);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/cart/add', { productId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('제품이 장바구니에 추가되었습니다.');
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      alert('장바구니에 추가하는데 실패했습니다.');
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>문진 결과 및 추천</Typography>

      {surveyResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>문진 결과 요약</Typography>
            <Typography>{surveyResult.summary}</Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>추천 영양성분</Typography>
          {recommendations.nutrients && recommendations.nutrients.map((nutrient, index) => (
            <Typography key={index}>{nutrient}</Typography>
          ))}
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>추천 제품</Typography>
      <Grid container spacing={2}>
        {recommendations.essential.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>가격: {product.price}원</Typography>
                <Button component={Link} to={`/product/${product.id}`} variant="outlined" sx={{ mr: 1, mt: 1 }}>
                  상세 보기
                </Button>
                <Button onClick={() => addToCart(product.id)} variant="contained" sx={{ mt: 1 }}>
                  장바구니에 담기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>추가 추천 제품</Typography>
      <Grid container spacing={2}>
        {recommendations.additional.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>가격: {product.price}원</Typography>
                <Button component={Link} to={`/product/${product.id}`} variant="outlined" sx={{ mr: 1, mt: 1 }}>
                  상세 보기
                </Button>
                <Button onClick={() => addToCart(product.id)} variant="contained" sx={{ mt: 1 }}>
                  장바구니에 담기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecommendationPage;
