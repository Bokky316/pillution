import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress, Box,  Grid,
  Paper // Paper 추가
} from '@mui/material';
import { API_URL } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';

const ViewProduct = ({ productId, open, onClose }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      // useEffect (기존 코드 유지)
      if (open && productId) {
            setLoading(true);
            fetch(`${API_URL}products/${productId}/dto`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('상품 상세 정보를 불러오지 못했습니다.');
                }
                return response.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('상품 상세 조회 에러:', err);
                setError(err);
                setLoading(false);
            });
        }
    }, [productId, open]);

    const handleEdit = () => {
        // handleEdit (기존 코드 유지)
        onClose();
        navigate(`/adminPage/products/${productId}/edit`);
    };

    const getAbsoluteImageUrl = (imageUrl) => {
        // getAbsoluteImageUrl (기존 코드 유지)
        if (!imageUrl) return '';
        const baseUrl = API_URL.substring(0, API_URL.indexOf('/api'));
        return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                상품 상세 정보
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" my={2}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">Error: {error}</Typography>
                ) : product ? (
                    <Paper elevation={3} sx={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}> {/* Paper 추가 */}
                        <Typography variant="h5" fontWeight="bold" gutterBottom style={{ fontSize: '1.5rem' }}>
                            {product.name}
                        </Typography>
                        {product.categories && product.categories.length > 0 && (
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom style={{ fontSize: '0.9rem' }}>
                                카테고리: {product.categories.join(', ')}
                            </Typography>
                        )}
                        {product.mainImageUrl && (
                            <img
                                src={getAbsoluteImageUrl(product.mainImageUrl)}
                                alt={product.name}
                                style={{ width: '50%', maxWidth: '300px', borderRadius: '4px', marginBottom: '16px' }}
                            />
                        )}
                        <Typography variant="body1" fontWeight="bold" style={{ fontSize: '1.1rem' }}>
                            가격: {new Intl.NumberFormat('ko-KR').format(product.price)}원
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" style={{ fontSize: '1.1rem' }}>
                            재고: {product.stock}개
                        </Typography>
                        <Typography variant="body2" mt={2} style={{ fontSize: '1rem', textAlign: 'left' }}>
                            상품 내용: {product.description}
                        </Typography>

                        {product.productImgList && product.productImgList.length > 0 && (
                            <Box mt={3}>
                                <Typography variant="h6" gutterBottom>상세 이미지</Typography>
                                <Grid container spacing={2}>
                                    {product.productImgList.filter(img => img.imageType === '상세').map((img, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <img
                                                src={getAbsoluteImageUrl(img.imageUrl)}
                                                alt={`상세 이미지 ${index + 1}`}
                                                style={{ width: '100%', borderRadius: '4px' }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                    </Paper>
                ) : (
                    <Typography>상품 정보를 불러오는 중입니다...</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleEdit} color="primary" variant="contained" sx={{ textTransform: 'none' }}>
                    수정
                </Button>
                <Button onClick={onClose} color="secondary" variant="outlined" sx={{ textTransform: 'none' }}>
                    취소
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewProduct;