import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Button,
    TextField,
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useDispatch } from "react-redux";
import { createOrder } from "@/store/orderSlice";
import { processPayment } from "@/store/paymentSlice";
import { saveDeliveryInfo } from "@/store/deliverySlice";

/**
 * OrderDetail 컴포넌트
 * 주문 상세 정보를 표시하고 결제 프로세스를 처리합니다.
 */
const OrderDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // location.state에서 필요한 데이터 추출
    const { selectedItems, purchaseType, totalAmount, user: userData } = location.state
        ? location.state
        : { selectedItems: [], purchaseType: 'oneTime', totalAmount: 0, user: {} };

    // 상태 관리
    const [name, setName] = useState(userData?.name || '');
    const [email, setEmail] = useState(userData?.email || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [address, setAddress] = useState(userData?.address || '');
    const [zipCode, setZipCode] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [deliveryName, setDeliveryName] = useState('');
    const [deliveryPhone, setDeliveryPhone] = useState('');
    const [merchantId, setMerchantId] = useState("");
    const [order, setOrder] = useState(null);
    const [isImpReady, setIsImpReady] = useState(false);
    const [deliveryMessage, setDeliveryMessage] = useState("");
    const [customDeliveryMessage, setCustomDeliveryMessage] = useState("");
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isDefault, setIsDefault] = useState(false);
    const [deliveryInfoName, setDeliveryInfoName] = useState("");

    /**
     * 저장된 배송지 선택 핸들러
     * @param {Event} event - 이벤트 객체
     */
    const handleSavedAddressChange = (event) => {
        setSelectedSavedAddressId(event.target.value);
        const selectedAddress = savedAddresses.find(address => address.id === event.target.value);
        if (selectedAddress) {
            setDeliveryName(selectedAddress.recipientName);
            setDeliveryPhone(selectedAddress.recipientPhone);
            setZipCode(selectedAddress.postalCode);
            setAddress1(selectedAddress.roadAddress);
            setAddress2(selectedAddress.detailAddress);
            setDeliveryMessage(selectedAddress.deliveryMemo);
        }
    };

    useEffect(() => {
        const id = fetchMerchantId();
        setMerchantId(id);

        // 아임포트 스크립트 로드
        const impScript = document.createElement("script");
        impScript.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
        impScript.async = true;
        impScript.onload = () => setIsImpReady(true);
        document.body.appendChild(impScript);

        // 카카오 주소 API 스크립트 로드
        const kakaoScript = document.createElement("script");
        kakaoScript.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        kakaoScript.async = true;
        document.body.appendChild(kakaoScript);

        // 저장된 배송지 목록 불러오기
        const fetchSavedAddresses = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}delivery-info`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch saved addresses');
                }
                const data = await response.json();
                setSavedAddresses(data);
                // 저장된 배송지 목록을 불러온 후, isDefault 값이 true인 배송지를 선택된 배송지로 설정
                const defaultDeliveryInfo = data.find(info => info.isDefault === true);
                if (defaultDeliveryInfo) {
                    setSelectedSavedAddressId(defaultDeliveryInfo.id);
                    setDeliveryName(defaultDeliveryInfo.recipientName);
                    setDeliveryPhone(defaultDeliveryInfo.recipientPhone);
                    setZipCode(defaultDeliveryInfo.postalCode);
                    setAddress1(defaultDeliveryInfo.roadAddress);
                    setAddress2(defaultDeliveryInfo.detailAddress);
                    setDeliveryMessage(defaultDeliveryInfo.deliveryMemo);
                }
            } catch (error) {
                console.error('Error fetching saved addresses:', error);
                alert('Failed to fetch saved addresses');
            }
        };
        fetchSavedAddresses();

        return () => {
            document.body.removeChild(impScript);
            document.body.removeChild(kakaoScript);
        };
    }, []);

    /**
     * 가맹점 ID를 환경 변수에서 가져옵니다.
     */
    const fetchMerchantId = () => {
        const merchantId = import.meta.env.VITE_PORTONE_MERCHANT_ID;
        console.log("가맹점 UID:", merchantId);
        return merchantId;
    };

    /**
     * 총 주문 금액을 계산합니다.
     */
    const calculateTotalPrice = () => {
        return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    /**
     * 주문을 생성하고 상태를 업데이트합니다.
     */
    const handleCreateOrder = async () => {
        const orderData = {
            cartOrderItems: selectedItems.map(item => ({
                cartItemId: item.cartItemId,
                quantity: item.quantity,
                price: item.price
            })),
            buyerName: name,
            buyerEmail: email,
            buyerTel: phone,
            buyerAddr: `${address1} ${address2}`,
            buyerPostcode: zipCode,
            deliveryMessage: deliveryMessage === 'custom' ? customDeliveryMessage : deliveryMessage,
            savedAddressId: selectedSavedAddressId,
        };

        try {
            const response = await dispatch(createOrder({ orderData, purchaseType })).unwrap();
            console.log("주문 생성 성공:", response);
            setOrder({
                ...response,
                items: selectedItems,
                totalAmount: totalAmount,
                purchaseType: purchaseType
            });
        } catch (error) {
            console.error("주문 생성 실패:", error);
            alert("주문 생성에 실패했습니다.");
        }
    };

    /**
     * 결제 프로세스를 시작합니다.
     */
    const handlePayment = async () => {
        if (!isImpReady || !order) {
            alert("결제 모듈이 아직 로드되지 않았거나 주문이 생성되지 않았습니다.");
            return;
        }

        const IMP = window.IMP;
        IMP.init(merchantId);

        const paymentData = {
            pg: "kakaopay",
            pay_method: "card",
            merchant_uid: `${order.id}_${new Date().getTime()}`,
            name: order.items[0].name,
            amount: order.totalAmount,
            buyer_email: order.buyerEmail,
            buyer_name: order.buyerName,
            buyer_tel: order.buyerTel,
            buyer_addr: order.buyerAddr,
            buyer_postcode: order.buyerPostcode,
        };

        IMP.request_pay(paymentData, async (rsp) => {
            if (rsp.success) {
                console.log("결제 완료 응답:", rsp);

                const paymentRequest = {
                    impUid: rsp.imp_uid,
                    merchantUid: order.id,
                    paidAmount: rsp.paid_amount,
                    name: rsp.name,
                    pgProvider: rsp.pg_provider,
                    buyerEmail: rsp.buyerEmail,
                    buyerName: rsp.buyerName,
                    buyTel: rsp.buyerTel,
                    buyerAddr: rsp.buyerAddr,
                    buyerPostcode: rsp.buyerPostcode,
                    paidAt: rsp.paid_at,
                    status: "PAYMENT_COMPLETED",
                    cartOrderItems: selectedItems.map(item => ({
                        cartItemId: item.cartItemId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };

                try {
                    const result = await dispatch(processPayment({ paymentRequestDto: paymentRequest, purchaseType: purchaseType })).unwrap();

                    if (result) {
                        const paymentInfo = {
                            amount: rsp.paid_amount,
                            paymentMethod: rsp.pay_method,
                            merchantUid: rsp.merchant_uid,
                            impUid: rsp.imp_uid,
                            status: rsp.status,
                            paidAt: rsp.paid_at,
                        };
                        navigate("/payResult", { state: { paymentInfo: paymentInfo } });
                    } else {
                        alert(`결제 실패: ${rsp.error_msg}`);
                    }
                } catch (error) {
                    console.error("결제 처리 중 오류:", error);
                    alert("결제 처리 중 오류가 발생했습니다.");
                }
            } else {
                alert(`결제 실패: ${rsp.error_msg}`);
            }
        });
    };

    /**
     * 카카오 주소 검색 API를 호출합니다.
     */
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setZipCode(data.zonecode);
                setAddress1(data.address);
                setAddress2('');
            }
        }).open();
    };

    /**
     * 사용자 정보 탭에서 주문 정보 탭으로 정보 복사
     */
    const handleUseUserInfo = () => {
        setName(userData?.name || '');
        setEmail(userData?.email || '');
        setPhone(userData?.phone || '');
    };

    /**
     * 배송 메시지 선택 핸들러
     * @param {Event} event - 이벤트 객체
     */
    const handleDeliveryMessageChange = (event) => {
        setDeliveryMessage(event.target.value);
        if (event.target.value !== 'custom') {
            setCustomDeliveryMessage("");
        }
    };

    /**
     * 배송지 정보를 사용자 정보와 동일하게 설정합니다.
     */
    const handleUseUserInfoForDelivery = () => {
        setDeliveryName(name);
        setDeliveryPhone(phone);
        setZipCode(zipCode);
        setAddress1(address1);
        setAddress2(address2);
    };

    /**
     * 배송 정보 저장 다이얼로그 열기
     */
    const handleSaveDeliveryInfo = () => {
        setOpenDialog(true);
    };

    /**
     * 배송 정보 저장 다이얼로그 닫기
     */
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setIsDefault(false);
        setDeliveryInfoName("");
    };

    /**
     * 배송 정보 저장 확인 핸들러
     */
    const handleConfirmSave = async () => {
        const deliveryInfo = {
            deliveryName: deliveryInfoName,
            recipientName: deliveryName,
            recipientPhone: deliveryPhone,
            postalCode: zipCode,
            roadAddress: address1,
            detailAddress: address2,
            deliveryMemo: deliveryMessage === 'custom' ? customDeliveryMessage : deliveryMessage,
            isDefault: isDefault
        };

        try {
            await dispatch(saveDeliveryInfo(deliveryInfo)).unwrap();
            alert("배송 정보가 저장되었습니다.");
            const response = await fetchWithAuth(`${API_URL}delivery-info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch saved addresses');
            }
            const data = await response.json();
            setSavedAddresses(data);
            const defaultDeliveryInfo = data.find(info => info.isDefault === true);
            if (defaultDeliveryInfo) {
                setSelectedSavedAddressId(defaultDeliveryInfo.id);
            }
        } catch (error) {
            console.error("배송 정보 저장 중 오류:", error);
            alert("배송 정보 저장 중 오류가 발생했습니다.");
        }

        handleCloseDialog();
    };

    return (
        <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                주문서
            </Typography>
            <Paper sx={{ padding: 3 }}>
                {/* 주문 정보 */}
                <Typography variant="h6" gutterBottom>
                    주문 정보
                </Typography>
                {selectedItems.map((item, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={2}>
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: 100, height: 100, marginRight: 20 }}
                        />
                        <Box>
                            <Typography variant="h6">{item.name}</Typography>
                            <Typography variant="body1">가격: {item.price}원</Typography>
                            <Typography variant="body1">수량: {item.quantity}</Typography>
                        </Box>
                    </Box>
                ))}

                <Typography variant="h6" mt={3}>
                    총 주문 금액: {calculateTotalPrice()}원
                </Typography>

                {/* 사용자 정보 */}
                <Typography variant="h6" mt={3} gutterBottom>
                    사용자 정보
                </Typography>
                <TextField
                    label="이름"
                    value={name}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="이메일"
                    value={email}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="전화번호"
                    value={phone}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="주소"
                    value={`${address1} ${address2}`}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                />

                {/* 배송 정보 */}
                <Typography variant="h6" mt={3} gutterBottom>
                    배송 정보
                </Typography>

                {/* 저장된 배송지 선택 */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="saved-address-label">저장된 배송지</InputLabel>
                    <Select
                        labelId="saved-address-label"
                        id="saved-address"
                        value={selectedSavedAddressId}
                        onChange={handleSavedAddressChange}
                        label="저장된 배송지"
                    >
                        <MenuItem value="">선택 안 함</MenuItem>
                        {savedAddresses.map(address => (
                            <MenuItem key={address.id} value={address.id}>
                                {address.deliveryName} - {address.recipientName}, {address.roadAddress}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 배송 정보 - 이름 */}
                <TextField
                    label="이름"
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                {/* 배송 정보 - 전화번호 */}
                <TextField
                    label="전화번호"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                {/* 배송 정보 - 주소 */}
                <Box display="flex" alignItems="center" mb={2}>
                    <TextField
                        label="우편번호"
                        value={zipCode}
                        readOnly
                        sx={{ width: '150px', marginRight: 2 }}
                    />
                    <Button variant="outlined" onClick={handleAddressSearch}>
                        주소 검색
                    </Button>
                </Box>
                <TextField
                    label="주소"
                    value={address1}
                    readOnly
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="상세주소"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                {/* 배송 메시지 선택 */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="delivery-message-label">배송 메시지</InputLabel>
                    <Select
                        labelId="delivery-message-label"
                        id="delivery-message"
                        value={deliveryMessage}
                        onChange={handleDeliveryMessageChange}
                        label="배송 메시지"
                    >
                        <MenuItem value="">선택 안 함</MenuItem>
                        <MenuItem value="문 앞에 놓아주세요">문 앞에 놓아주세요</MenuItem>
                        <MenuItem value="부재 시 연락 부탁드려요">부재 시 연락 부탁드려요</MenuItem>
                        <MenuItem value="배송 전 미리 연락해 주세요">배송 전 미리 연락해 주세요</MenuItem>
                        <MenuItem value="custom">직접 입력하기</MenuItem>
                    </Select>
                    {deliveryMessage === 'custom' && (
                        <TextField
                            label="배송 메시지 직접 입력"
                            value={customDeliveryMessage}
                            onChange={(e) => setCustomDeliveryMessage(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    )}
                </FormControl>

                {/* 배송 정보 - 사용자 정보 이용 버튼 */}
                <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={handleUseUserInfoForDelivery}>
                        사용자 정보와 동일하게
                    </Button>
                </Box>

                {/* 배송 정보 - 배송 정보 기억하기 버튼 */}
                <Box mt={2}>
                    <Button variant="contained" color="secondary" onClick={handleSaveDeliveryInfo}>
                        배송 정보 기억하기
                    </Button>
                </Box>

                <Box mt={3} textAlign="center">
                    <Button variant="contained" color="primary" size="large" onClick={handleCreateOrder}>
                        주문 생성
                    </Button>
                </Box>
            </Paper>

            {/* 결제 정보 */}
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

            {/* 배송 정보 저장 다이얼로그 */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>배송 정보 저장</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        이 배송 정보를 기본 배송 정보로 설정하시겠습니까?
                    </DialogContentText>
                    <Box display="flex" justifyContent="space-around">
                        <Button onClick={() => setIsDefault(true)}>예</Button>
                        <Button onClick={() => setIsDefault(false)}>아니오</Button>
                    </Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="deliveryInfoName"
                        label="배송 정보 이름"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={deliveryInfoName}
                        onChange={(e) => setDeliveryInfoName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>취소</Button>
                    <Button onClick={handleConfirmSave}>저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
    };

    export default OrderDetail;



