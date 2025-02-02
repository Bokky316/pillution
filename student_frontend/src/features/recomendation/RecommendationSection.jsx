import React from 'react';
import { Typography, Grid } from '@mui/material';
import ProductCard from './ProductCard';

const RecommendationSection = ({ title, products }) => (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>{title}</Typography>
    <Grid container spacing={3}>
      {products && products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  </>
);

export default RecommendationSection;
