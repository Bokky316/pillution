import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Card>
      <CardMedia
        component="img"
        height="140"
        image={product.mainImageUrl}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="body2" color="text.primary">
          가격: {product.price}원
        </Typography>
        <Typography variant="body2" color="text.primary">
          주요 성분: {product.mainIngredientName}
        </Typography>
        <Button component={Link} to={`/products/${product.id}`} variant="contained" color="primary">
          상세 보기
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
