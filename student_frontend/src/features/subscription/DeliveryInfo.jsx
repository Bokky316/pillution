import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import KakaoAddressSearch from "@/features/auth/KakaoAddressSearch";
import { useDispatch } from "react-redux";
import { updateDeliveryAddress, updateDeliveryRequest, fetchSubscription } from "@/store/subscriptionSlice";

function DeliveryInfo({ subscription }) {
    const dispatch = useDispatch();

    // 🔹 배송 요청 옵션 리스트
    const deliveryOptions = [
        "문 앞에 놔주세요",
        "경비실에 맡겨주세요",
        "택배함에 넣어주세요",
        "전화 후 배송해주세요",
        "직접 입력"
    ];

    // 🔹 기존 배송 요청값이 옵션 리스트에 있는지 확인
    const isPresetOption = deliveryOptions.includes(subscription?.deliveryRequest);
    const [deliveryRequest, setDeliveryRequest] = useState(isPresetOption ? subscription.deliveryRequest : "직접 입력");
    const [customRequest, setCustomRequest] = useState(isPresetOption ? "" : subscription?.deliveryRequest || ""); // 🔹 기존 값이 옵션에 없으면 customRequest로 저장
    const [detailAddress, setDetailAddress] = useState(subscription?.detailAddress || "");
    const [isCustomInput, setIsCustomInput] = useState(!isPresetOption); // 🔹 직접 입력 여부 상태 관리

    // 🔹 구독 정보 변경 시, 초기값 동기화
    useEffect(() => {
        const isPreset = deliveryOptions.includes(subscription?.deliveryRequest);
        setDeliveryRequest(isPreset ? subscription.deliveryRequest : "직접 입력");
        setCustomRequest(isPreset ? "" : subscription?.deliveryRequest || "");
        setIsCustomInput(!isPreset);
    }, [subscription?.deliveryRequest]);

    // 🔹 배송 요청 옵션 변경 핸들러
    const handleDeliveryChange = (event) => {
        const selectedValue = event.target.value;
        console.log("✅ 선택한 배송 요청:", selectedValue);

        if (selectedValue === "직접 입력") {
            setIsCustomInput(true);
            setDeliveryRequest("직접 입력");
            setCustomRequest("");
        } else {
            setIsCustomInput(false);
            setDeliveryRequest(selectedValue);
            setCustomRequest("");
        }
    };

    // 🔹 직접 입력 필드 변경 핸들러
    const handleCustomRequestChange = (event) => {
        setCustomRequest(event.target.value);
    };

    // 🔹 배송 요청 저장 핸들러
    const handleUpdate = () => {
        const finalRequest = isCustomInput ? customRequest : deliveryRequest;
        console.log("✅ 업데이트 요청 - 구독 ID:", subscription?.id);
        console.log("✅ 저장할 요청 값:", finalRequest);

        dispatch(updateDeliveryRequest({
            subscriptionId: subscription.id,
            deliveryRequest: finalRequest
        }))
        .then((result) => {
            if (updateDeliveryRequest.fulfilled.match(result)) {
                console.log("✅ 배송 요청 저장 성공:", result.payload);
                dispatch(fetchSubscription()); // 🔹 Redux 상태 새로고침
            } else {
                console.error("❌ 배송 요청 저장 실패:", result.error);
            }
        });
    };

    // 🔹 주소 검색 후 저장
    const handleAddressSelect = (data) => {
        dispatch(updateDeliveryAddress({
            subscriptionId: subscription.id,
            postalCode: data.zonecode,
            roadAddress: data.address,
            detailAddress: detailAddress,
        })).then(() => dispatch(fetchSubscription()));
    };

    // 🔹 상세 주소 입력 핸들러
    const handleDetailAddressChange = (event) => {
        setDetailAddress(event.target.value);
    };

    // 🔹 배송지 변경 저장
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
                <Button variant="contained" onClick={handleAddressUpdate}>
                    배송지 변경
                </Button>
            </Paper>

            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>배송 요청사항</Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>배송 요청사항</InputLabel>
                    <Select
                        value={isCustomInput ? "직접 입력" : deliveryRequest}
                        onChange={handleDeliveryChange}
                    >
                        {deliveryOptions.map((option, index) => (
                            <MenuItem key={index} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {isCustomInput && (
                    <TextField
                        label="직접 입력"
                        value={customRequest}
                        onChange={handleCustomRequestChange}
                        fullWidth
                        sx={{ mb: 2.5 }}
                    />
                )}

                <Button variant="contained" onClick={handleUpdate}>
                    저장
                </Button>
            </Paper>
        </Box>
    );
}

export default DeliveryInfo;
