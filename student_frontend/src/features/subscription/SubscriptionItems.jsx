import React from "react";
import { Box, Typography, Divider, Grid } from "@mui/material";
import { useSelector } from "react-redux"; // ✅ Redux에서 제품 정보 가져오기
import "@/styles/subscription.css"; // ✅ CSS 파일 추가

function SubscriptionItems({ subscription }) {
    const products = useSelector((state) => state.subscription.products); // ✅ Redux에서 전체 제품 목록 가져오기

    console.log("📌 [SubscriptionItems] 구독 중인 제품 렌더링:", subscription.items);

    // ✅ 상품명으로 Redux에서 제품 정보를 찾아 대표 이미지 URL 가져오기
    const getProductImageUrl = (productName) => {
        const product = products.find((p) => p.name === productName);
        if (product && product.mainImageUrl) {
            const baseUrl = import.meta.env.VITE_PUBLIC_URL || "http://localhost:8080"; // ✅ 환경변수에서 API 기본 URL 가져오기
            return `${baseUrl}${product.mainImageUrl.startsWith("/") ? product.mainImageUrl : "/" + product.mainImageUrl}`;
        }
        return "https://dummyimage.com/70x70/cccccc/ffffff&text=No+Image"; // 기본 이미지
    };

    if (!subscription.items || subscription.items.length === 0) {
        return <Typography sx={{ textAlign: "center", color: "#888", mt: 2 }}>구독 중인 제품이 없습니다.</Typography>;
    }

    return (
        <Box className="subscription-items-container">
            {/* ✅ 섹션 제목 */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>구독 중인 제품</Typography>
            <Divider sx={{ mb: 2 }} />

            {/* ✅ 구독 아이템 리스트 */}
            {subscription.items.map((item, index) => {
                const price = item.price || 0; // ✅ 가격이 undefined일 경우 기본값 0 처리
                const totalPrice = price * item.quantity; // ✅ NaN 방지 처리
                const imageUrl = getProductImageUrl(item.productName); // ✅ Redux에서 이미지 URL 가져오기

                console.log("📌 [SubscriptionItems] 상품명:", item.productName, "| 이미지 URL:", imageUrl);

                return (
                    <Box key={index} className="subscription-item">
                        <Grid container spacing={2} alignItems="center">
                            {/* ✅ 제품 이미지 */}
                            <Grid item xs={3}>
                                <img
                                    src={imageUrl}
                                    alt={item.productName || "상품 이미지"}
                                    className="subscription-item-image"
                                />
                            </Grid>

                            {/* ✅ 제품 정보 */}
                            <Grid item xs={6} className="subscription-item-info">
                                <Typography className="subscription-item-tag">
                                    건강기능식품
                                </Typography>
                                <Typography className="subscription-item-name">
                                    {item.productName || "상품명 없음"}
                                </Typography>
                                <Typography className="subscription-item-quantity">
                                    {item.quantity}개
                                </Typography>
                            </Grid>

                            {/* ✅ 가격 정보 */}
                            <Grid item xs={3} className="subscription-item-price">
                                <Typography className="subscription-item-unit-price">
                                    {price.toLocaleString()} 원 / 개
                                </Typography>
                                <Typography className="subscription-item-total-price">
                                    {totalPrice.toLocaleString()} 원
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                );
            })}
            {/* ✅ 할인 정보 */}
            <p className="subscription-discount-info">
                #구독혜택 #무료배송 #구독할인5% #건강설문할인10% #장기고객우대(4회차부터)5%
            </p>
        </Box>
    );
}

export default SubscriptionItems;
