import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import SubscriptionInfo from "@features/subscription/SubscriptionInfo";
import SubscriptionItems from "@features/subscription/SubscriptionItems";
import NextSubscriptionItems from "@features/subscription/NextSubscriptionItems";
import PaymentMethod from "@features/subscription/PaymentMethod";
import BillingDate from "@features/subscription/BillingDate";
import DeliveryInfo from "@features/subscription/DeliveryInfo";
import DiscountDetails from "@features/subscription/DiscountDetails";
import SubscriptionActions from "@features/subscription/SubscriptionActions";

import { fetchSubscription, fetchProducts } from "@/store/subscriptionSlice";

function SubscriptionManagement() {
    const dispatch = useDispatch();
    const { data: subscription, loading, error: reduxError, products } = useSelector((state) => state.subscription);
    const [message, setMessage] = useState(""); // ✅ 메시지 상태 추가

    useEffect(() => {
        dispatch(fetchSubscription())
            .then((response) => {
                if (response.payload?.message) {
                    setMessage(response.payload.message); // ✅ API에서 온 메시지 저장
                } else if (!response.payload) {
                    setMessage("현재 활성화된 구독이 없습니다."); // ✅ 응답이 없을 때 메시지 설정
                } else {
                    setMessage(""); // ✅ 구독이 있으면 메시지 초기화
                }
            })
            .catch((err) => {
                console.error("구독 정보 가져오기 실패:", err);
                if (err.message.includes("404")) {
                    setMessage("현재 활성화된 구독이 없습니다."); // ✅ 404 오류면 구독 없음 메시지로 처리
                } else {
                    setMessage("구독 정보를 불러오는 중 오류가 발생했습니다."); // ✅ 기타 오류
                }
            });

        dispatch(fetchProducts());
    }, [dispatch]);

//     useEffect(() => {
//         dispatch(fetchSubscription());
//         dispatch(fetchProducts());
//     }, [dispatch]);

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ maxWidth: "600px", margin: "0 auto", padding: "16px" }}>
            {reduxError ? (
                reduxError.includes("404") ? (
                    <Typography variant="h6" color="textSecondary">
                        현재 활성화된 구독이 없습니다.
                    </Typography>
                ) : (
                    <Typography color="error">구독 정보를 불러오는 중 오류가 발생했습니다.</Typography>
                )
            ) : message ? (
                <Typography variant="h6" color="textSecondary">
                    {message} {/* ✅ 구독 없음 메시지 표시 */}
                </Typography>
            ) : (
                <>
                <SubscriptionInfo subscription={subscription} />
                <SubscriptionItems subscription={subscription} products={products} />
                <NextSubscriptionItems subscription={subscription} products={products} />
                <DiscountDetails subscription={subscription} />
                <PaymentMethod subscription={subscription} />
                <BillingDate subscription={subscription} />
                <DeliveryInfo subscription={subscription} />
                <SubscriptionActions subscription={subscription} />
                </>
            )}
        </Box>
    );
}

export default SubscriptionManagement;
