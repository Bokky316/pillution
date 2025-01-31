import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Card, CardMedia, CardContent, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../features/auth/utils/fetchWithAuth';
import { API_URL } from '../../constant';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}products?page=${page}&limit=12`);
            if (!response.ok) {
                throw new Error('제품 정보를 불러오는데 실패했습니다.');
            }
            const data = await response.json();
            setProducts(prevProducts => [...prevProducts, ...data.products]);
            setHasMore(data.hasMore);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const loadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    if (loading && page === 1) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>;
    }

    if (error) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Typography color="error">{error}</Typography>
        </Box>;
    }

    return (
        <Box sx={{ padding: '20px', maxWidth: '1280px', margin: '0 auto' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '20px' }}>
                제품 목록
            </Typography>
            <Grid container spacing={4}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.imageUrl}
                                alt={product.name}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h6" component="div">
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.description}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    {product.price}원
                                </Typography>
                            </CardContent>
                            <Box sx={{ p: 2 }}>
                                <Button
                                    component={Link}
                                    to={`/products/${product.id}`}
                                    variant="contained"
                                    fullWidth
                                >
                                    상세 보기
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {hasMore && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="contained" onClick={loadMore} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : '더 보기'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ProductListPage;
