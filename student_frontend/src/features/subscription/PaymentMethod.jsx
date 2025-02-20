import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
    Paper,
    Snackbar
} from "@mui/material";
import { updateNextPaymentMethod, fetchSubscription } from "@/store/subscriptionSlice";
import { useDispatch, useSelector } from "react-redux";
import "@/styles/Subscription.css";  // ✅ CSS 불러오기

function PaymentMethod({ subscription }) {
    const dispatch = useDispatch();
    const nextPaymentMethod = useSelector((state) => state.subscription.data?.nextPaymentMethod || subscription?.paymentMethod);

    const [currentPaymentMethod, setCurrentPaymentMethod] = useState(subscription?.paymentMethod);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const paymentMethods = [
        { id: "kakaopay", name: "카카오페이", logo: "/src/assets/images/kakaopay.png" },
        { id: "payco", name: "페이코", logo: "/src/assets/images/payco.png" },
        { id: "tosspay", name: "토스페이", logo: "/src/assets/images/tosspay.png" },
        { id: "card", name: "신용 / 체크카드" },
        { id: "trans", name: "실시간 계좌이체" },
        { id: "vbank", name: "가상계좌" },
    ];

    useEffect(() => {
        if (nextPaymentMethod && nextPaymentMethod !== currentPaymentMethod) {
            setSnackbarMessage(`"${paymentMethods.find(m => m.id === nextPaymentMethod)?.name}" 결제수단으로 변경됨`);
            setSnackbarOpen(true);
            setCurrentPaymentMethod(nextPaymentMethod);
        }
    }, [nextPaymentMethod]);

    const handlePaymentMethodChange = async (event) => {
        const newMethod = event.target.value;
        if (newMethod === currentPaymentMethod) return;

        try {
            await dispatch(updateNextPaymentMethod({ subscriptionId: subscription.id, nextPaymentMethod: newMethod }));
            dispatch(fetchSubscription());
        } catch (error) {
            console.error("결제수단 변경 실패:", error);
            setSnackbarMessage("결제수단 변경에 실패했습니다.");
            setSnackbarOpen(true);
        }
    };

    return (
        <Box className="payment-method-container">
            <Typography variant="h6" className="payment-method-title">
                다음 회차 결제수단 변경
            </Typography>
            <Paper elevation={1} className="payment-method-paper">
                <RadioGroup
                    aria-label="payment-method"
                    name="paymentMethod"
                    value={nextPaymentMethod}
                    onChange={handlePaymentMethodChange}
                >
                    {paymentMethods.map((method) => {
                        const selected = nextPaymentMethod === method.id;
                        return (
                            <Box key={method.id} className={`payment-method-label ${selected ? "payment-method-selected" : ""}`}>
                                <FormControlLabel
                                    value={method.id}
                                    control={<Radio sx={{ '&.Mui-checked': { color: '#4CAF50' } }} />}
                                    label={
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            {method.logo && (
                                                <img src={method.logo} alt={method.name} className="payment-method-logo" />
                                            )}
                                            <Typography className="payment-method-text">
                                                {method.name}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ flexGrow: 1, ml: 1 }}
                                />
                            </Box>
                        );
                    })}
                </RadioGroup>
            </Paper>

            {/* ✅ 스낵바 추가 */}
            <Snackbar
                open={snackbarOpen}
                message={snackbarMessage}
                autoHideDuration={1500}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                ContentProps={{ className: "snackbar-success" }}
            />
        </Box>
    );
}

export default PaymentMethod;
