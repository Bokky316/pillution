import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, Typography, CircularProgress, Box, Grid,
  Paper, Divider, styled
} from '@mui/material';
import { API_URL } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/images/logo.png'; // 로고 import


// 이미지 hover시 살짝 확대되는 효과
const ImageHover = styled(Box)(({ theme }) => ({
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));


const ViewProduct = ({ productId, open, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    onClose();
    navigate(`/adminPage/products/${productId}/edit`);
  };

  const getAbsoluteImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    const baseUrl = API_URL.substring(0, API_URL.indexOf('/api'));
    return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogContent dividers sx={{ p: 0, bgcolor: '#fafafa' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">Error: {error}</Typography>
            ) : product ? (
                <Paper
                  elevation={0} // 그림자 제거
                  sx={{
                    p: 4,     // 내부 패딩 증가
                    borderRadius: '16px', // 둥근 모서리 유지
                    m: 3,      // 외부 여백(margin) 추가
                    bgcolor: 'background.paper', // 배경색 명시
                    border: 'none', // 테두리 제거
                  }}
                >

                  {/* 로고 */}
                  <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <img src={logo} alt="로고" style={{ maxWidth: '200px', maxHeight: '50px' }} />
                  </Box>

                   {/* "상품 상세 정보" 텍스트 + 구분선 */}
                  <Box sx={{ textAlign: 'left', mb: 2 }}>
                      <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                          fontWeight: 600,
                          color: '#333',
                          mb: 1,
                        }}
                      >
                        상품 상세 정보
                      </Typography>
                      <Divider sx={{ mb: 3, borderColor: '#ddd' }} /> {/* 구분선 수정 */}
                  </Box>


                  {/* 상품 정보 */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                          {product.name}
                      </Typography>
                      {product.categories && product.categories.length > 0 && (
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                              카테고리: {product.categories.join(', ')}
                          </Typography>
                      )}

                       {/* 대표 이미지 */}
                      {product.mainImageUrl && (
                          <Box
                              sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  borderRadius: '12px',
                                  overflow: 'hidden',
                                  maxWidth: '100%',
                              }}
                          >
                              <img
                                  src={getAbsoluteImageUrl(product.mainImageUrl)}
                                  alt={product.name}
                                  style={{
                                      width: 'auto',
                                      maxWidth: '500px',
                                      height: 'auto',
                                      maxHeight: '300px',
                                  }}
                              />
                          </Box>
                      )}

                      <Box mt={2}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#444' }}>
                            가격: <span style={{color : '#4169E1'}}>{new Intl.NumberFormat('ko-KR').format(product.price)}원</span>
                          </Typography>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#444' }}>
                              재고: {product.stock}개
                          </Typography>
                      </Box>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: '#ddd' }} /> {/* 구분선 색상 변경선 */}

                  {/* 상품 설명 */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#555', whiteSpace: 'pre-line' }}>
                      {product.description}
                    </Typography>
                  </Box>



                   {/* 상세 이미지 */}
                  {product.productImgList && product.productImgList.length > 0 && (
                      <Box mt={3}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#444', mb: 2, textAlign: 'center' }}>
                            상세 이미지
                          </Typography>
                          <Grid container spacing={2} justifyContent="center">
                              {product.productImgList.filter(img => img.imageType === '상세').map((img, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <ImageHover>
                                        <img
                                            src={getAbsoluteImageUrl(img.imageUrl)}
                                            alt={`상세 이미지 ${index + 1}`}
                                            style={{ width: '100%', borderRadius: '8px' }}
                                        />
                                    </ImageHover>
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
            <DialogActions sx={{ padding: '16px 24px' }}>
              <Button
                onClick={handleEdit}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  bgcolor: '#4169E1',
                  '&:hover': {
                    bgcolor: '#3057D1',
                  },
                }}
              >
                수정
              </Button>
              <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }}>
                취소
              </Button>
            </DialogActions>
          </Dialog>
    );
};

export default ViewProduct;