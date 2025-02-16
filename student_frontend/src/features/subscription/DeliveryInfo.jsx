import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper
} from "@mui/material";
import KakaoAddressSearch from "@/features/auth/KakaoAddressSearch";
import { useDispatch } from "react-redux";
import { updateDeliveryAddress, fetchSubscription } from "@/store/subscriptionSlice";

function DeliveryInfo({ subscription }) {
    const dispatch = useDispatch();
    const [detailAddress, setDetailAddress] = useState(subscription?.detailAddress || "");

    const handleAddressSelect = (data) => {
        dispatch(updateDeliveryAddress({
            subscriptionId: subscription.id,
            postalCode: data.zonecode,
            roadAddress: data.address,
            detailAddress: detailAddress,
        })).then(() => dispatch(fetchSubscription()));
    };

    const handleDetailAddressChange = (event) => {
        setDetailAddress(event.target.value);
    };

    const handleAddressUpdate = () => {
        dispatch(updateDeliveryAddress({
            subscriptionId: subscription.id,
            postalCode: subscription.postalCode,
            roadAddress: subscription.roadAddress,
            detailAddress: detailAddress,
        })).then(() => dispatch(fetchSubscription()));
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                배송정보
            </Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TextField
                        label="우편번호"
                        value={subscription?.postalCode || ""}
                        disabled
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, width: "120px", bgcolor: "#eee" }}
                    />
                    <KakaoAddressSearch onAddressSelect={handleAddressSelect} />
                </Box>
                <TextField
                    label="도로명주소"
                    value={subscription?.roadAddress || ""}
                    disabled
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mb: 2, bgcolor: "#eee" }}
                />
                <TextField
                    label="상세주소"
                    value={detailAddress}
                    onChange={handleDetailAddressChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mb: 2, bgcolor: "white" }}
                />
                <Button
                    variant="contained"
                    onClick={handleAddressUpdate}
                    sx={{
                        bgcolor: "#4CAF50",
                        color: "white",
                        '&:hover': {
                            bgcolor: "#45a049",
                        }
                    }}
                >
                    배송지 변경
                </Button>
            </Paper>
        </Box>
    );
}

export default DeliveryInfo;
