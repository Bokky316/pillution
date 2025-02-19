import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, Divider } from "@mui/material";

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

    // 결제 방법을 한글로 변환하는 함수
    const getPaymentMethodKorean = (method) => {
        const methods = {
            'card': '신용카드',
            'trans': '실시간계좌이체',
            'vbank': '가상계좌',
            'phone': '휴대폰소액결제',
            'samsung': '삼성페이',
            'kpay': 'KPay',
            'kakaopay': '카카오페이',
            'payco': '페이코',
            'lpay': 'LPAY',
            'ssgpay': 'SSG페이',
            'tosspay': '토스',
            'cultureland': '문화상품권',
            'smartculture': '스마트문상',
            'happymoney': '해피머니',
            'booknlife': '도서문화상품권',
            'point': '포인트',
            'naverpay': '네이버페이',
        };
        return methods[method] || method;
    };

    return (
        <Box sx={{
            maxWidth: 600,
            margin: "auto",
            padding: 2,
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            {paymentInfo ? (
                <Box sx={{ mb: 3 }}>
                    <Paper sx={{
                        p: 2,
                        mb: 2,
                        boxShadow: 'none',
                        borderRadius: 1
                    }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>결제 완료!</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>결제 금액</Typography>
                            <Typography>{paymentInfo.amount}원</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>결제 방법</Typography>
                            <Typography>{getPaymentMethodKorean(paymentInfo.paymentMethod)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>주문 번호</Typography>
                            <Typography>{paymentInfo.merchantUid}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>승인 번호</Typography>
                            <Typography>{paymentInfo.impUid}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>결제 상태</Typography>
                            <Typography>{paymentInfo.status}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>결제 시각</Typography>
                            <Typography>{new Date(paymentInfo.paidAt * 1000).toLocaleString()}</Typography>
                        </Box>
                    </Paper>

                    <Box mt={3}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleClose}
                            sx={{
                                backgroundColor: '#4169E1',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#3a5fcf',
                                },
                                boxShadow: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            확인
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Typography>결제 정보를 불러올 수 없습니다.</Typography>
            )}
        </Box>
    );
};

export default PayResult;
