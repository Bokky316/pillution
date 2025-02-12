import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const RecommendationProductCard = ({ product }) => {
  const handleAddToCart = () => {
    // 장바구니 추가 로직 구현 필요
    console.log('장바구니에 추가:', product);
  };

  return (
    <Box
      sx={{
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Card>
        <CardMedia
          component="img"
          height="140"
          image={product.mainImageUrl}
          alt={product.name}
          sx={{
            borderRadius: '8px',
            objectFit: 'cover',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        />
        <CardContent sx={{ padding: '8px' }}>
          <Typography gutterBottom variant="subtitle1" component="div" noWrap fontWeight="bold">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {product.description}
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="bold">
            {product.price.toLocaleString()}원
          </Typography>
          <Typography variant="body2" color="text.primary" noWrap>
            주요 성분: {product.mainIngredientName}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              component={Link}
              to={`/products/${product.id}`}
              variant="outlined"
              color="primary"
              size="small"
              fullWidth
              sx={{
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                }
              }}
            >
              상세 보기
            </Button>

            <Button
              onClick={handleAddToCart}
              variant="contained"
              color="secondary"
              size="small"
              fullWidth
              sx={{
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                }
              }}
            >
              장바구니 담기
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecommendationProductCard;
