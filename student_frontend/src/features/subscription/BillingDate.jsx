import React, { useState } from "react";
import { Box, Typography, TextField, Paper, Snackbar } from "@mui/material";
import { useDispatch } from "react-redux";
import { updateBillingDate, fetchSubscription } from "@/store/subscriptionSlice";
import "@/styles/Subscription.css"; // ✅ CSS 적용

function BillingDate({ subscription }) {
    const dispatch = useDispatch();

    // ✅ 스낵바 상태 추가
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const handleBillingDateChange = (event) => {
        const newBillingDate = event.target.value;

        dispatch(updateBillingDate({ subscriptionId: subscription.id, newBillingDate }))
            .then(() => {
                dispatch(fetchSubscription());
                setSnackbarMessage(`${newBillingDate}로 결제일이 변경되었습니다.`);
                setSnackbarOpen(true); // ✅ 스낵바 표시
            })
            .catch(() => {
                setSnackbarMessage("결제일 변경에 실패했습니다.");
                setSnackbarOpen(true);
            });
    };

    return (
        <Box className="billing-date-container">
            <Typography className="billing-date-title">
                결제일 관리
            </Typography>
            <Paper className="billing-date-paper"> {/* ✅ 회색 배경 유지 */}
                <TextField
                    type="date"
                    defaultValue={subscription?.nextBillingDate}
                    onChange={handleBillingDateChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    className="billing-date-input"
                />
            </Paper>

            {/* ✅ 스낵바 추가 (왼쪽 아래, 초록색) */}
            <Snackbar
                open={snackbarOpen}
                message={snackbarMessage}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                ContentProps={{ className: "snackbar-success" }}
            />
        </Box>
    );
}

export default BillingDate;
