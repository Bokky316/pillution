import React, { useState } from "react";
import { Dialog, DialogActions, DialogTitle, Box, Typography, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { cancelSubscription, fetchSubscription } from "@/store/subscriptionSlice";
import "@/styles/Subscription.css"; // ✅ CSS 파일 적용

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
        <Box className="subscription-actions-container">
            <Typography
                className="subscription-cancel-text"
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
