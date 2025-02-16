import React from 'react';
import { Paper, Typography, Button, Box } from "@mui/material";
import PropTypes from 'prop-types';

/**
 * @param {Object} order - 주문 정보 객체
 * @param {boolean} isImpReady - 아임포트 준비 상태
 * @param {Function} handlePayment - 결제 핸들러
 * @returns {JSX.Element} 결제 요약 정보 컴포넌트
 * @description 결제 요약 정보를 표시하고 결제를 처리하는 컴포넌트입니다.
 */
const PaymentSummary = ({ order, isImpReady, handlePayment }) => {
    return (
        <>
            {order && (
                <Paper sx={{ padding: 3, marginTop: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        결제 정보
                    </Typography>
                    <p>주문 번호: {order.id}</p>
                    <p>총 결제 금액: {order.totalAmount}원</p>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handlePayment}
                        disabled={!isImpReady}
                    >
                        결제하기
                    </Button>
                </Paper>
            )}
        </>
    );
};

PaymentSummary.propTypes = {
    order: PropTypes.shape({
        id: PropTypes.string.isRequired,
        totalAmount: PropTypes.number.isRequired,
    }),
    isImpReady: PropTypes.bool.isRequired,
    handlePayment: PropTypes.func.isRequired,
};

export default PaymentSummary;
