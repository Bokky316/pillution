import React, { useState } from "react";
import { Dialog, DialogActions, DialogTitle, Box, Typography, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { cancelSubscription, fetchSubscription } from "@/store/subscriptionSlice";

function SubscriptionActions({ subscription }) {
    const dispatch = useDispatch();
    const [confirmCancel, setConfirmCancel] = useState(false);

    const handleCancelSubscription = () => {
        setConfirmCancel(true);
    };

    const confirmCancelSubscription = () => {
        dispatch(cancelSubscription({ subscriptionId: subscription.id }))
            .then(() => dispatch(fetchSubscription()));
        setConfirmCancel(false);
    };

    const cancelCancelSubscription = () => {
        setConfirmCancel(false);
    };

    return (
        <Box sx={{ mt: 1, textAlign: "right" }}>
            {/* ✅ 더 작은 글씨 + 더 흐린 색상 + 마우스 올리면 밑줄 효과 */}
            <Typography
                variant="caption" // 더 작은 폰트 크기 적용 (기존 body2 → caption)
                sx={{
                    color: "rgba(136, 136, 136, 0.6)", // 반투명한 회색 적용
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: "12px", // 추가적으로 명확한 폰트 크기 지정
                    "&:hover": { textDecoration: "underline" }
                }}
                onClick={handleCancelSubscription}
            >
                구독 취소
            </Typography>

            {/* ✅ 구독 취소 확인 다이얼로그 */}
            <Dialog
                open={confirmCancel}
                onClose={cancelCancelSubscription}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"구독을 취소하시겠습니까?"}</DialogTitle>
                <DialogActions>
                    <Button onClick={cancelCancelSubscription}>취소</Button>
                    <Button onClick={confirmCancelSubscription} autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SubscriptionActions;
