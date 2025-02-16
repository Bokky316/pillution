import React from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";

function DiscountDetails({ subscription }) {
    const shippingFee = 3000;

    // ✅ subscription 데이터 존재 여부 확인
    if (!subscription?.nextItems || !Array.isArray(subscription.nextItems)) {
        console.error("❌ [DiscountDetails] subscription.nextItems 값이 올바르지 않음:", subscription?.nextItems);
        return <Typography color="error">오류: 다음 구독 제품 정보를 불러오지 못했습니다.</Typography>;
    }

    // ✅ 제품 합계 금액 계산
    const nextOriginalTotalPrice = subscription.nextItems.reduce(
        (sum, item) => sum + (item.nextMonthPrice * item.nextMonthQuantity),
        0
    ) || 0;

    // ✅ 구독 할인 (5%)
    const subscriptionDiscount = nextOriginalTotalPrice * 0.05;

    // ✅ 건강 설문 할인 (10%)
    const healthSurveyDiscount = subscription?.hasHealthSurvey ? (nextOriginalTotalPrice * 0.10) : 0;

    // ✅ 장기 고객 우대 (4회차부터 5%)
    const longTermDiscount = subscription?.currentCycle >= 3 ? (nextOriginalTotalPrice * 0.05) : 0;

    // ✅ 총 할인 금액 (배송비 제외)
    const totalDiscountExcludingShipping = subscriptionDiscount + healthSurveyDiscount + longTermDiscount;

    // ✅ 무료배송 여부 결정 (배송비 제외한 금액이 10,000원 이상이면 적용)
    const isFreeShipping = (nextOriginalTotalPrice - totalDiscountExcludingShipping) >= 10000;
    const shippingDiscount = isFreeShipping ? shippingFee : 0;

    // ✅ 상품이 1개 이상이면 기본 배송비 추가, 없으면 0원
    const appliedShippingFee = nextOriginalTotalPrice > 0 ? shippingFee : 0;

    // ✅ 총 할인 금액 = (할인 총합) + (무료배송 적용 시 배송비)
    const totalDiscount = totalDiscountExcludingShipping + shippingDiscount;

    // ✅ 총 결제 금액 = (제품 합계 금액 + 배송비) - 총 할인 금액
    const finalPayment = (nextOriginalTotalPrice + appliedShippingFee) - totalDiscount;

    // 🔍 **디버깅 로그 추가**
    console.log("📌 [DiscountDetails] 계산된 값:");
    console.log("🔍 ✅ 다음 구독 제품 리스트:", subscription.nextItems);
    console.log("🔍 ✅ 제품 합계 금액:", nextOriginalTotalPrice);
    console.log("🔍 ✅ 기본 배송비 적용 여부:", appliedShippingFee);
    console.log("🔍 ✅ 무료배송 적용 여부:", isFreeShipping, "| 할인 금액:", shippingDiscount);
    console.log("🔍 ✅ 구독 할인 (5%):", subscriptionDiscount);
    console.log("🔍 ✅ 건강 설문 할인 (10%):", healthSurveyDiscount);
    console.log("🔍 ✅ 장기 고객 우대 (4회차부터 5%):", longTermDiscount);
    console.log("🔍 ✅ 총 할인 금액 (배송비 포함):", totalDiscount);
    console.log("🔍 ✅ 최종 결제 금액:", finalPayment);

    return (
        <Box sx={{ mb: 2 }}>
            {/* ✅ 다음 구독 제품 결제 정보 */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5", mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>제품 합계 금액</Typography>
                    <Typography>{nextOriginalTotalPrice.toLocaleString()}원</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>기본 배송비</Typography>
                    <Typography>{appliedShippingFee.toLocaleString()}원</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>총 할인 금액</Typography>
                    <Typography sx={{ color: "red" }}>
                        -{totalDiscount.toLocaleString()}원
                    </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: "bold" }}>총 결제 금액</Typography>
                    <Typography sx={{ fontWeight: "bold", color: "red" }}>
                        {finalPayment.toLocaleString()}원
                    </Typography>
                </Box>
            </Paper>

            {/* ✅ 상세 할인 내역 */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    상세 할인 내역
                </Typography>

                {isFreeShipping && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>무료배송 할인 적용됨</Typography>
                        <Typography>-{shippingDiscount.toLocaleString()}원</Typography>
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>구독 할인 (5%)</Typography>
                    <Typography>-{subscriptionDiscount.toLocaleString()}원</Typography>
                </Box>

                {subscription?.hasHealthSurvey && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>건강 설문 할인 (10%)</Typography>
                        <Typography>-{healthSurveyDiscount.toLocaleString()}원</Typography>
                    </Box>
                )}

                {subscription?.currentCycle >= 3 && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>장기 고객 우대 (4회차부터 5%)</Typography>
                        <Typography>-{longTermDiscount.toLocaleString()}원</Typography>
                    </Box>
                )}

                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: "bold" }}>정기구독 할인 합계</Typography>
                    <Typography sx={{ color: "red", fontWeight: "bold" }}>
                        -{totalDiscount.toLocaleString()}원
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default DiscountDetails;
