import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button } from "@mui/material";

const PayResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paymentInfo = location.state?.paymentInfo || null;

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                결제 결과
            </Typography>

            {paymentInfo ? (
                <Paper sx={{ padding: 3 }}>
                    <Typography variant="h6">결제 완료!</Typography>
                    <Typography>결제 금액: {paymentInfo.amount}원</Typography>
                    <Typography>결제 방법: {paymentInfo.paymentMethod}</Typography>
                    <Typography>주문 번호: {paymentInfo.merchantUid}</Typography>
                    <Typography>승인 번호: {paymentInfo.impUid}</Typography>
                    <Typography>결제 상태: {paymentInfo.status}</Typography>
                    <Typography>결제 시각: {new Date(paymentInfo.paidAt * 1000).toLocaleString()}</Typography>

                    <Box mt={3}>
                        <Button variant="contained" color="primary" fullWidth onClick={() => navigate("/")}>
                            홈으로 돌아가기
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <Typography>결제 정보를 불러올 수 없습니다.</Typography>
            )}
        </Box>
    );
};

export default PayResult;
