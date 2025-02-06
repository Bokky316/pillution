import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * ProductCard 컴포넌트
 * 개별 제품 정보를 카드 형태로 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {Object} props.product - 제품 정보 객체
 *
 * @example
 * return (
 *   <ProductCard product={productData} />
 * )
 */
const ProductCard = ({ product }) => {
  return (
    <Box
      sx={{
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
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
      <CardContent sx={{ padding: '8px 0' }}>
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
        <Button
          component={Link}
          to={`/products/${product.id}`}
          variant="outlined"
          color="primary"
          size="small"
          fullWidth
          sx={{
            mt: 1,
            transition: 'background-color 0.3s',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
            }
          }}
        >
          상세 보기
        </Button>
      </CardContent>
    </Box>
  );
};

export default ProductCard;