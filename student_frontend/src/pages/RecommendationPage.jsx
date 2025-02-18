import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar, Button } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import {
    fetchHealthAnalysis,
    fetchRecommendedIngredients,
    fetchRecommendedProducts,
    addRecommendationsToCart,
} from '@/store/recommendationSlice';
import RecommendationProductCard from '@/features/survey/RecommendationProductCard';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';
import { fetchHealthRecord, setHealthAnalysis, setRecommendedIngredients, setRecommendedProducts } from '@/store/healthSlice';

/**
 * 건강 분석 및 제품 추천 페이지 컴포넌트
 * @returns {JSX.Element} RecommendationPage 컴포넌트
 */
const RecommendationPage = () => {
    // Redux dispatch 훅
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { recordId } = useParams();

    // Redux 스토어에서 상태 가져오기
    const {
        healthAnalysis,           // 건강 분석 결과
        recommendedIngredients,   // 추천 영양 성분 목록
        recommendedProducts,      // 추천 상품 목록
        loading,                  // 로딩 상태
        error,                    // 에러 메시지
        cartAddingStatus          // 장바구니 추가 상태
    } = useSelector((state) => state.recommendations);

    // 로컬 상태 관리
    const [loadingLocalData, setLoadingLocalData] = useState(false);

    // 스낵바 상태 관리
    const [snackbarOpen, setSnackbarOpen] = useState(false);    // 스낵바 표시 여부
    const [snackbarMessage, setSnackbarMessage] = useState('');  // 스낵바 메시지

    /**
     * recordId가 있을 경우 해당 HealthRecord를 가져오는 함수
     */
    const fetchHealthRecordData = async (recordId) => {
        setLoadingLocalData(true);
        try {
            const response = await fetchWithAuth(`${API_URL}recommendation/health-records`);
            if (!response.ok) {
                throw new Error('Failed to fetch health record');
            }
            const data = await response.json();
            console.log('fetchHealthRecord.fulfilled payload:', data);

            // 필터링 로직
            const record = data.find(r => r.id === parseInt(recordId));

            if (record) {
                dispatch(setHealthAnalysis(record.healthAnalysis));
                dispatch(setRecommendedIngredients(record.recommendedIngredients));
                dispatch(setRecommendedProducts(record.productRecommendations));
                setSnackbarMessage('과거 건강 기록을 불러왔습니다.');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage('해당 건강 기록을 찾을 수 없습니다.');
                setSnackbarOpen(true);
            }
        } catch (error) {
            setSnackbarMessage('데이터 로딩 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
            console.error('Error fetching health record:', error);
        } finally {
            setLoadingLocalData(false);
        }
    };

    /**
     * 컴포넌트 마운트 시 데이터 가져오기
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (recordId) {
                    // recordId가 있으면 HealthRecord를 가져옴
                    fetchHealthRecordData(recordId);
                } else {
                    // recordId가 없으면 기존 추천 데이터를 가져옴
                    await dispatch(fetchHealthAnalysis());
                    await dispatch(fetchRecommendedIngredients());
                    await dispatch(fetchRecommendedProducts());
                }
            } catch (error) {
                setSnackbarMessage('데이터 로딩 중 오류가 발생했습니다.');
                setSnackbarOpen(true);
            }
        };

        fetchData();
    }, [dispatch, recordId]); // dispatch, recordId 의존성 추가

    /**
     * 에러 발생 시 스낵바 표시
     */
    useEffect(() => {
        if (error) {
            setSnackbarMessage(error);
            setSnackbarOpen(true);
        }
    }, [error]);

    /**
     * 장바구니 추가 상태 변경 시 스낵바 표시
     */
    useEffect(() => {
        if (cartAddingStatus === 'succeeded') {
            setSnackbarMessage('모든 추천 상품이 장바구니에 담겼습니다.');
            setSnackbarOpen(true);
        } else if (cartAddingStatus === 'failed') {
            setSnackbarMessage('장바구니 담기에 실패했습니다.');
            setSnackbarOpen(true);
        }
    }, [cartAddingStatus]);

    /**
     * 추천 상품 전체를 장바구니에 추가하는 함수
     */
    const handleAddAllToCart = async () => {
        const productSource = recommendedProducts;
        if (productSource) {
            const cartItems = productSource.map(product => ({
                productId: product.productId,
                quantity: 1
            }));

            try {
                await dispatch(addRecommendationsToCart(cartItems)).unwrap();
                navigate('/cart');
            } catch (error) {
                setSnackbarMessage('장바구니 추가에 실패했습니다: ' + error.message);
                setSnackbarOpen(true);
            }
        } else {
            setSnackbarMessage('추천 상품이 없습니다.');
            setSnackbarOpen(true);
        }
    };

    /**
     * 로딩 중 화면 표시
     */
    if (loading || loadingLocalData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* 건강 분석 결과 */}
            {healthAnalysis && Object.values(healthAnalysis).some(value => value !== null && value !== 0) ? (
                <Box mb={6}>
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 700, color: '#333' }}
                    >
                        {healthAnalysis.name}님의 건강검문결과표
                    </Typography>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '16px',
                            backgroundColor: 'rgba(255, 241, 240, 0.5)',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                {healthAnalysis.name} | {healthAnalysis.gender} | {healthAnalysis.age}세 | BMI {healthAnalysis.bmi?.toFixed(1)}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {healthAnalysis.overallAssessment}
                            </Typography>
                            {healthAnalysis.warnings && (
                                <Typography variant="body2" color="error.main">
                                    {healthAnalysis.warnings}
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Box>
            ) : (
                <Typography>건강 분석 정보가 없습니다.</Typography>
            )}

            {/* 추천 영양 성분 */}
            {recommendedIngredients?.length > 0 && (
                <Box mb={6}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                        추천 영양 성분 {recommendedIngredients.length}
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 2,
                            p: 3,
                            backgroundColor: '#F8F9FA',
                            borderRadius: '16px'
                        }}
                    >
                        {recommendedIngredients.map((ingredient) => (
                            <Paper
                                key={ingredient.id}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '12px',
                                    border: '1px solid #E9ECEF',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="500">
                                        {ingredient.ingredientName}
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: '50%',
                                            backgroundColor: '#4263EB',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff'
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="bold">
                                            {ingredient.score?.toFixed(1)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {ingredient.description}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}

            {/* 추천 상품 */}
            {recommendedProducts?.length > 0 && (
                <Box mb={6}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                        추천 상품
                    </Typography>
                    <Box
                        display="flex"
                        flexWrap="nowrap"
                        gap={3}
                        sx={{
                            overflowX: 'auto',
                            pb: 2,
                            '&::-webkit-scrollbar': {
                                height: 8,
                                borderRadius: 4
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: '#f1f1f1',
                                borderRadius: 4
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888',
                                borderRadius: 4,
                                '&:hover': {
                                    backgroundColor: '#555'
                                }
                            }
                        }}
                    >
                        {recommendedProducts.map((product) => (
                            <RecommendationProductCard key={product.id} product={product} />
                        ))}
                    </Box>

                    {/* 전체 상품 장바구니 담기 버튼 */}
                    <Box display="flex" justifyContent="center" mt={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<ShoppingCart />}
                            onClick={handleAddAllToCart}
                            disabled={!recommendedProducts?.length || cartAddingStatus === 'loading'}
                            sx={{
                                py: 2,
                                px: 6,
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                                }
                            }}
                        >
                            추천 제품 장바구니 담기
                        </Button>
                    </Box>
                </Box>
            )}

            {/* 스낵바 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Container>
    );
};

export default RecommendationPage;
