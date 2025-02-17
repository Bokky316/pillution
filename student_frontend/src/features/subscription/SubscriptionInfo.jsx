import React from "react";
import { Box, Typography, Grid } from "@mui/material";

function SubscriptionInfo({ subscription }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const shippingFee = 3000;

    // ✅ 원래 가격 (제품 총 가격 + 배송비 포함)
    const originalTotalPrice = subscription.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalBeforeDiscount = originalTotalPrice + shippingFee;

    // ✅ 구독 할인 (5% 적용)
    const discountSubscriptionPrice = totalBeforeDiscount * 0.95;

    // ✅ 무료배송 여부 (할인 후 금액이 10,000원 이상이면 적용)
    const isFreeShipping = discountSubscriptionPrice >= 10000;
    const shippingDiscount = isFreeShipping ? shippingFee : 0;

    // ✅ 최종 결제 금액 (할인 적용 후 + 무료배송 적용 여부 반영)
    const finalSubscriptionPrice = discountSubscriptionPrice - shippingDiscount;

    return (
        <Box>
            <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                    <Typography variant="subtitle2" color="textSecondary">
                        {subscription?.nextBillingDate ? formatDate(subscription.nextBillingDate) : "결제 정보 없음"}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body2" color="textSecondary">
                        구독번호: {subscription?.id}
                    </Typography>
                </Grid>
            </Grid>
            <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" component="div" sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                    {subscription?.currentCycle}회차 <span style={{ color: 'green' }}>진행중</span> {subscription?.items?.length}건
                </Typography>
                <Box>
                    {/* ✅ 원래 가격 (취소선, 배송비 포함) */}
                    <Typography
                        variant="body1"
                        sx={{
                            textDecoration: "line-through",
                            color: "textSecondary",
                            textAlign: "right"
                        }}
                    >
                        {(totalBeforeDiscount).toLocaleString()}원
                    </Typography>

                    {/* ✅ 최종 결제 금액 (할인 및 무료배송 적용 후) */}
                    <Typography
                        variant="h6"
                        sx={{ color: "red", fontWeight: "bold", fontSize: "1.3rem" }}
                    >
                        {finalSubscriptionPrice.toLocaleString()}원
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default SubscriptionInfo;
