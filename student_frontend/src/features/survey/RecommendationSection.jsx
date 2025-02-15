import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * 추천 섹션 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 섹션 제목
 * @param {Array} props.products - 추천 제품 목록
 * @param {number} props.maxItems - 최대 표시 제품 수
 * @returns {JSX.Element} RecommendationSection 컴포넌트
 */
const RecommendationSection = React.memo(({ title, products, maxItems }) => {
  if (!products || products.length === 0) return null;

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        {title}
      </Typography>
      <Box
        display="flex"
        flexWrap="nowrap"
        overflow="auto"
        gap={2}
        sx={{
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.2)',
            borderRadius: '4px',
          }
        }}
      >
        {products.slice(0, maxItems).map((product) => (
          <Box key={product.id} flexShrink={0} width={200}>
            <ProductCard product={product} />
          </Box>
        ))}
      </Box>
    </Box>
  );
});

export default RecommendationSection;
