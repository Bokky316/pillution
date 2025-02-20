import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, CircularProgress, Box, Paper, Snackbar, Button } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import {
    fetchHealthAnalysis,
    fetchRecommendedIngredients,
    fetchRecommendedProducts,
    addRecommendationsToCart,
    resetRecommendationState,
    clearSnackbarMessage
} from '@/store/recommendationSlice';
import RecommendationProductCard from '@/features/survey/RecommendationProductCard';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';
import { setHealthAnalysis, setRecommendedIngredients, setRecommendedProducts } from '@/store/healthSlice';

/**
 * @component RecommendationPage
 * @description 건강 설문 결과를 기반으로 추천 정보 및 상품을 표시하는 페이지
 */
const RecommendationPage = () => {
    // Redux dispatch hook
    const dispatch = useDispatch();

    // React Router hooks
    const navigate = useNavigate();
    const { recordId } = useParams();

    // Redux store에서 상태 가져오기
    const {
        healthAnalysis,
        recommendedIngredients,
        recommendedProducts,
        loading,
        error,
        cartAddingStatus,
        snackbarMessage
    } = useSelector((state) => state.recommendations);

    // 로컬 상태 관리 hooks
    const [loadingLocalData, setLoadingLocalData] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(64); // 초기 헤더 높이 설정

    /**
     * @function useEffect
     * @description 컴포넌트 마운트 시 헤더 높이를 계산하고 Redux 액션을 디스패치하여 데이터를 가져옴
     */
    useEffect(() => {
        const calculateHeaderHeight = () => {
            // 헤더의 높이를 계산하는 로직 (Header 컴포넌트에 접근할 수 있는 경우)
            // 예시: document.querySelector('.container')?.offsetHeight || 64;
            // 또는 CSS에 정의된 높이를 직접 가져올 수도 있습니다.
            // 여기서는 임시로 64px를 사용합니다.
            return 64;
        };

        setHeaderHeight(calculateHeaderHeight()); // 초기 헤더 높이 설정
    }, []);

    useEffect(() => {
        /**
         * @async @function fetchData
         * @description API에서 건강 분석, 추천 성분 및 상품 데이터를 가져오는 함수
         */
        const fetchData = async () => {
            try {
                if (recordId) {
                    await fetchHealthRecordData(recordId);
                } else {
                    await dispatch(fetchHealthAnalysis());
                    await dispatch(fetchRecommendedIngredients());
                    await dispatch(fetchRecommendedProducts());
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setSnackbarMessage('데이터 로딩 중 오류가 발생했습니다.');
                setSnackbarOpen(true);
            }
        };

        fetchData();

        // Redux 상태 초기화 (컴포넌트가 언마운트될 때만 실행)
        return () => {
            dispatch(resetRecommendationState());
        };
    }, [dispatch, recordId]);

    /**
     * @function useEffect
     * @description snackbar 메시지가 변경될 때 snackbar를 표시
     */
    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    /**
     * @async @function fetchHealthRecordData
     * @param {string} recordId - 가져올 건강 기록의 ID
     * @description 특정 건강 기록 ID를 사용하여 건강 기록 데이터를 가져오는 함수
     */
    const fetchHealthRecordData = async (recordId) => {
        setLoadingLocalData(true);
        try {
            const response = await fetchWithAuth(`${API_URL}recommendation/health-records`);
            if (!response.ok) {
                throw new Error('Failed to fetch health record');
            }
            const data = await response.json();
            const record = data.find(r => r.id === parseInt(recordId));

            if (record) {
                dispatch(setHealthAnalysis(record.healthAnalysis));
                dispatch(setRecommendedIngredients(record.recommendedIngredients));
                dispatch(setRecommendedProducts(record.productRecommendations));
            } else {
                throw new Error('Health record not found');
            }
        } catch (error) {
            console.error('Error fetching health record:', error);
            setSnackbarMessage('건강 기록을 불러오는 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        } finally {
            setLoadingLocalData(false);
        }
    };

    /**
     * @async @function handleAddAllToCart
     * @description 추천 상품을 장바구니에 추가하는 함수
     */
    const handleAddAllToCart = async () => {
        if (recommendedProducts?.length) {
            const cartItems = recommendedProducts.map(product => ({
                productId: product.productId,
                quantity: 1
            }));

            try {
                await dispatch(addRecommendationsToCart(cartItems)).unwrap();
                navigate('/cart');
            } catch (error) {
                console.error('Failed to add items to cart:', error);
                setSnackbarMessage('장바구니에 추가하는 중 오류가 발생했습니다.');
                setSnackbarOpen(true);
            }
        } else {
            setSnackbarMessage('추천 상품이 없습니다.');
            setSnackbarOpen(true);
        }
    };

    /**
     * @function handleCloseSnackbar
     * @description snackbar를 닫는 함수
     * @param {Event} event - 이벤트 객체
     * @param {string} reason - snackbar를 닫는 이유
     */
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
        dispatch(clearSnackbarMessage());
    };

    if (loading || loadingLocalData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <>
            {/* 경고 문구 추가 */}
            <Box sx={{
                width: '100%',
                backgroundColor: '#f9f9f9',
                padding: '10px 0',
                position: 'absolute', // 변경: absolute로 설정
                top: headerHeight,
                left: 0,
                zIndex: 1000,
                border: 'none',       // 테두리 제거
                boxShadow: 'none',    // 그림자 제거
            }}>
                <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="#757575">
                        ⓘ 본 결과는 의사의 처방을 대신하지 않습니다.
                    </Typography>
                </Container>
            </Box>

            {/* 메인 컨텐츠 */}
            <Container maxWidth="xl" sx={{ pt: headerHeight + 40, py: 4 }}>
                {healthAnalysis && Object.keys(healthAnalysis).length > 0 && (
                    <Box mb={6}>
                        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                            {healthAnalysis.name}님의 건강설문 결과표
                        </Typography>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', backgroundColor: '#e9efff', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                )}

                {recommendedIngredients && recommendedIngredients.length > 0 && (
                    <Box mb={6}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                            추천 영양 성분 {recommendedIngredients.length}
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, p: 3, backgroundColor: '#F8F9FA', borderRadius: '16px' }}>
                            {recommendedIngredients.map((ingredient) => (
                                <Paper key={ingredient.id} elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid #E9ECEF', backgroundColor: '#fff' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="500">
                                            {ingredient.ingredientName}
                                        </Typography>
                                        <Box sx={{ width: 45, height: 45, borderRadius: '50%', backgroundColor: '#4263EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
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

                {recommendedProducts && recommendedProducts.length > 0 && (
                    <Box mb={6}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                            추천 상품
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'nowrap',
                                gap: 3,
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
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<ShoppingCart />}
                                onClick={handleAddAllToCart}
                                disabled={cartAddingStatus === 'loading'}
                                sx={{
                                    py: 2,
                                    px: 6,
                                    borderRadius: '12px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    backgroundColor: '#4169E1',
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

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    message={snackbarMessage}
                />
            </Container>
        </>
    );
};

export default RecommendationPage;
