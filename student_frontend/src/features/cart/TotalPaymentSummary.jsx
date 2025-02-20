import React from 'react';
import { Box, Typography } from '@mui/material';
import '@/styles/TotalPaymentSummary.css';

const TotalPaymentSummary = ({ cartItems, purchaseType }) => {
    const calculateTotal = () => {
        let totalPrice = 0;
        let shippingFee = 0;
        let discount = 0;

        // 선택된 상품만 계산에 포함
        cartItems.filter(item => item.selected).forEach(item => {
            if (item.price && typeof item.price === 'number') { // price가 유효한 숫자인지 확인
                totalPrice += item.price * item.quantity;
            } else {
                console.error("Invalid price for item:", item);
            }
        });

        if (purchaseType === 'oneTime') {
            shippingFee = totalPrice >= 30000 ? 0 : 3000;
        } else if (purchaseType === 'subscription') {
            if (totalPrice >= 30000) {
                discount = 3000;
            }
            shippingFee = totalPrice >= 10000 ? 0 : 3000;
        }

        const finalPrice = totalPrice - discount + shippingFee;

        return { totalPrice, shippingFee, discount, finalPrice };
    };

    const { totalPrice, shippingFee, discount, finalPrice } = calculateTotal();

    return (
        <Box
            sx={{
                backgroundColor: '#f9f9f9', // 배경색
                borderRadius: '4px',
                padding: '16px',
                border: '1px solid #ddd',
                marginBottom: '16px',
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                전체 금액
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                    총 상품 금액
                </Typography>
                <Typography variant="body2">
                    {totalPrice?.toLocaleString()}원
                </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                    제품 할인 금액
                </Typography>
                <Typography variant="body2">
                    -{discount?.toLocaleString()}원
                </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                    기본 배송비
                </Typography>
                <Typography variant="body2">
                    {shippingFee > 0 ? shippingFee?.toLocaleString() + "원" : "무료"}
                </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    전체 금액
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {finalPrice?.toLocaleString()}원
                </Typography>
            </Box>
        </Box>
    );
};

export default TotalPaymentSummary;
