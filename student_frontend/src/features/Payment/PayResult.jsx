import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button } from "@mui/material";


/**
 * PayResult 컴포넌트
 * 결제 결과를 표시하고 확인 버튼을 통해 메인 페이지로 이동합니다.
 */
const PayResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentInfo, setPaymentInfo] = useState(location.state?.paymentInfo || null);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'PAYMENT_INFO') {
                setPaymentInfo(event.data.paymentInfo);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleClose = () => {
        window.close();
        if (window.opener) {
            window.opener.location.href = "/";
        } else {
            navigate("/");
        }
    };

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
                        <Button variant="contained" color="primary" fullWidth onClick={handleClose}>
                            확인
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
