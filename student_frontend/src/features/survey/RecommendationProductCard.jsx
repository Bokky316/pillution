import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * 추천 상품 카드 컴포넌트
 * 작은 파스텔톤 원형 배경 안에 상품 이미지 표시
 * 하단에 제품명 표시
 * @param {Object} product 추천 상품 정보
 * @returns {JSX.Element} RecommendationProductCard 컴포넌트
 */
const RecommendationProductCard = ({ product }) => {
    // 이미지 URL을 가져오는 함수
    const getProductImageUrl = (imageUrl) => {
        if (imageUrl) {
            const baseUrl = import.meta.env.VITE_PUBLIC_URL || "http://localhost:8080";
            return `${baseUrl}${imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl}`;
        }
        return "https://dummyimage.com/200x200/cccccc/ffffff&text=No+Image"; // 기본 이미지
    };

    // 상품별 배경색 매핑
    const getBackgroundColor = (index) => {
        const colors = ['#E6F3FF', '#E8F6E8', '#FFF3E6'];
        return colors[product.id % colors.length];
    };

    return (
        <Box
            component={Link}
            to={`/products/${product.productId}`}
            sx={{
                textDecoration: 'none',
                color: 'inherit',
                width: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)',
                },
            }}
        >
            <Card sx={{
                width: '100px',
                minHeight: '140px',
                boxShadow: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Box sx={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: getBackgroundColor(product.id),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px'
                }}>
                    <CardMedia
                        component="img"
                        image={getProductImageUrl(product.mainImageUrl)} // 이미지 URL 연결
                        alt={product.productName}
                        sx={{
                            width: '80%',
                            height: '80%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
                <CardContent sx={{
                    padding: '8px 4px 4px 4px',
                    textAlign: 'center',
                    '&:last-child': {
                        paddingBottom: '4px'
                    }
                }}>
                    <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            wordBreak: 'break-word'
                        }}
                    >
                        {product.productName || '제품명 없음'}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RecommendationProductCard;
