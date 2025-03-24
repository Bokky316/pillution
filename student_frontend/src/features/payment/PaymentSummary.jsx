import React from 'react';
import { Box, Typography, Button } from "@mui/material";
import PropTypes from 'prop-types';

const PaymentSummary = ({ totalAmount, selectedPaymentMethod, onPayment, isDeliveryInfoComplete }) => {
    return (
        <Box>
            <Box sx={{
                borderTop: '1px solid #eee',
                borderBottom: '1px solid #eee',
                py: 2,
                mb: 2
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                        총 상품금액
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>
                        {totalAmount.toLocaleString()}원
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                        배송비
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>
                        무료
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>
                    총 결제금액
                </Typography>
                <Typography sx={{ fontWeight: 600, color: '#4169E1' }}>
                    {totalAmount.toLocaleString()}원
                </Typography>
            </Box>
            <Button
                fullWidth
                variant="contained"
                onClick={onPayment}
                disabled={!isDeliveryInfoComplete}
                sx={{
                    bgcolor: '#4169E1',
                    color: 'white',
                    py: 1.5,
                    borderRadius: 0,
                    '&:hover': {
                        bgcolor: '#3152a8'
                    },
                    '&:disabled': {
                        bgcolor: '#ccc'
                    }
                }}
            >
                {totalAmount.toLocaleString()}원 결제하기
            </Button>
        </Box>
    );
};

PaymentSummary.propTypes = {
    totalAmount: PropTypes.number.isRequired,
    selectedPaymentMethod: PropTypes.string.isRequired,
    onPayment: PropTypes.func.isRequired,
    isDeliveryInfoComplete: PropTypes.bool.isRequired,
};

export default PaymentSummary;