
import React from 'react';
import { Typography, Box } from '@mui/material';
import ProductCard from '@/features/survey/RecommendationCard';

/**
 * RecommendationSection 컴포넌트
 * 추천 제품 섹션을 표시하는 컴포넌트
 * 
 * @component
 * @param {Object} props
 * @param {string} props.title - 섹션 제목
 * @param {Array} props.products - 표시할 제품 목록
 * @param {number} props.maxItems - 최대 표시 항목 수
 * 
 * @example
 * return (
 *   <RecommendationSection 
 *     title="필수 추천 제품" 
 *     products={essentialProducts} 
 *     maxItems={3} 
 *   />
 * )
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

