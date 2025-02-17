import React from "react";
import {
    Box,
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
    Paper
} from "@mui/material";
import { updateNextPaymentMethod, fetchSubscription } from "@/store/subscriptionSlice";
import { useDispatch } from "react-redux";

function PaymentMethod({ subscription }) {
    const dispatch = useDispatch();

    const paymentMethods = [
        { id: "kakaopay", name: "카카오페이", logo: "/src/assets/images/kakaopay.png" },
        { id: "payco", name: "페이코", logo: "/src/assets/images/payco.png" },
        { id: "tosspay", name: "토스페이", logo: "/src/assets/images/tosspay.png" },
        { id: "card", name: "신용 / 체크카드" },
        { id: "bank_transfer", name: "실시간 계좌이체" },
        { id: "virtual_account", name: "가상계좌" },
    ];

    const handlePaymentMethodChange = (event) => {
        const newMethod = event.target.value;
        dispatch(updateNextPaymentMethod({ subscriptionId: subscription.id, newMethod }))
            .then(() => dispatch(fetchSubscription()));
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                다음 회차 결제수단 변경
            </Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <RadioGroup
                    aria-label="payment-method"
                    name="paymentMethod"
                    value={subscription?.paymentMethod || ""}
                    onChange={handlePaymentMethodChange}
                >
                    {paymentMethods.map((method) => {
                        const selected = subscription?.paymentMethod === method.id;
                        return (
                            <Box
                                key={method.id}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "5px",
                                    padding: "8px",
                                    bgcolor: selected ? "#E3F2FD" : "transparent",
                                    transition: "background 0.3s",
                                    "&:hover": { bgcolor: "#f0f0f0" }
                                }}
                            >
                                <FormControlLabel
                                    value={method.id}
                                    control={<Radio sx={{ '&.Mui-checked': { color: '#4CAF50' } }} />}
                                    label={
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            {method.logo && (
                                                <img
                                                    src={method.logo}
                                                    alt={method.name}
                                                    style={{
                                                        width: "50px", // ✅ 아이콘 크기 키움
                                                        height: "auto",
                                                        marginRight: "12px"
                                                    }}
                                                />
                                            )}
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: "bold", fontSize: "1rem" }} // ✅ 글자 굵게 & 크기 조정
                                            >
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
        </Box>
    );
}

export default PaymentMethod;
