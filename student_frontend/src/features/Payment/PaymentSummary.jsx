import React from 'react';
import { Paper, Typography, Button } from "@mui/material";
import PropTypes from 'prop-types';

/**
 * PaymentSummary 컴포넌트
 * 결제 요약 정보를 표시하고 결제 처리를 담당합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.totalAmount - 총 결제 금액
 * @param {string} props.selectedPaymentMethod - 선택된 결제 수단
 * @param {Function} props.onPayment - 결제 처리 핸들러
 * @param {boolean} props.isDeliveryInfoComplete - 배송 정보 완료 여부
 * @returns {JSX.Element} PaymentSummary 컴포넌트
 */
const PaymentSummary = ({ totalAmount, selectedPaymentMethod, onPayment, isDeliveryInfoComplete }) => {
    return (
        <Paper sx={{ padding: 3, marginTop: 3 }}>
            <Typography variant="h5" gutterBottom>
                결제 정보
            </Typography>
            <Typography>
                총 결제 금액: {totalAmount}원
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={onPayment}
                disabled={!isDeliveryInfoComplete}
                sx={{ marginTop: 2 }}
            >
                {/* 선택된 결제 수단에 따라 다른 텍스트 표시 */}
                {selectedPaymentMethod === 'kakaopay' && '카카오페이로 결제하기'}
                {selectedPaymentMethod === 'payco' && '페이코로 결제하기'}
                {selectedPaymentMethod === 'tosspay' && '토스페이로 결제하기'}
                {selectedPaymentMethod === 'card' && '신용카드로 결제하기'}
                {selectedPaymentMethod === 'trans' && '실시간계좌이체로 결제하기'}
                {selectedPaymentMethod === 'vbank' && '가상계좌로 결제하기'}
            </Button>
        </Paper>
    );
};

PaymentSummary.propTypes = {
    totalAmount: PropTypes.number.isRequired,
    selectedPaymentMethod: PropTypes.string.isRequired,
    onPayment: PropTypes.func.isRequired,
    isDeliveryInfoComplete: PropTypes.bool.isRequired,
};

export default PaymentSummary;
