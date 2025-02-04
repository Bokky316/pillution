import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, CardMedia, Grid, Divider } from '@mui/material';
import { fetchWithAuth } from '../../features/auth/utils/fetchWithAuth';
import { API_URL } from '../../constant';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}products/${productId}`);
                if (!response.ok) {
                    throw new Error('제품 정보를 불러오는데 실패했습니다.');
                }
                const data = await response.json();
                setProduct(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="textSecondary">제품 정보를 찾을 수 없습니다.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '20px', maxWidth: '1280px', margin: '0 auto' }}>
            <Grid container spacing={4}>
                {/* Left: Product Image */}
                <Grid item xs={12} md={6}>
                    <CardMedia
                        component="img"
                        image={product.imageUrl || 'placeholder.jpg'}
                        alt={product.name}
                        sx={{ borderRadius: '8px', boxShadow: 3 }}
                    />
                </Grid>

                {/* Right: Product Info */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
                        {product.name}
                    </Typography>
                    <Typography variant="body1" sx={{ marginBottom: '10px', color: 'gray' }}>
                        {product.description}
                    </Typography>
                    <Divider sx={{ marginY: '20px' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        {product.price.toLocaleString()}원
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '20px', color: 'gray' }}>
                        배송비: {product.shippingFee.toLocaleString()}원 (정기구독: 무료)
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ textTransform: 'none', paddingY: '12px' }}
                        onClick={() => addToCart(product.id)}
                    >
                        구매하기
                    </Button>
                </Grid>
            </Grid>

            {/* Additional Details */}
            <Box sx={{ marginTop: '40px' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    제품설명
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                    {product.longDescription || '추가 제품 설명이 제공되지 않았습니다.'}
                </Typography>
            </Box>
        </Box>
    );
};

const addToCart = async (productId) => {
    try {
        const response = await fetchWithAuth(`${API_URL}cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId,
                quantity: 1,
            }),
        });

        if (!response.ok) {
            throw new Error('장바구니에 추가하는데 실패했습니다.');
        }

        alert('장바구니에 추가되었습니다!');
    } catch (error) {
        console.error('장바구니 추가 오류:', error.message);
        alert('장바구니 추가 중 오류가 발생했습니다.');
    }
};

export default ProductDetailPage;