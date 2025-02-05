import React from 'react';
import { Typography, Grid } from '@mui/material';
import ProductCard from '@/features/product/ProductCard';

const RecommendationSection = React.memo(({ title, products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
});

export default RecommendationSection;
