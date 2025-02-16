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
} from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/store/orderSlice";
import { processPayment } from "@/store/paymentSlice";

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
    const [deliveryName, setDeliveryName] = useState(''); // 배송 정보 이름 상태 추가, 초기값 빈 문자열
    const [deliveryPhone, setDeliveryPhone] = useState(''); // 배송 정보 전화번호 상태 추가, 초기값 빈 문자열
    const [deliveryEmail, setDeliveryEmail] = useState(''); // 배송 정보 이메일 상태 추가, 초기값 빈 문자열
    const [merchantId, setMerchantId] = useState("");
    const [order, setOrder] = useState(null);
    const [isImpReady, setIsImpReady] = useState(false);
    const [deliveryMessage, setDeliveryMessage] = useState(""); // 배송 메시지 상태 추가, 기본값 "선택 안 함"
    const [customDeliveryMessage, setCustomDeliveryMessage] = useState(""); // 직접 입력 배송 메시지 상태 추가

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
            deliveryMessage: deliveryMessage === 'custom' ? customDeliveryMessage : deliveryMessage, // 배송 메시지 추가
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
            merchant_uid: `${order.id}_${new Date().getTime()}`, // 여기를 수정
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

                // PaymentRequestDto 객체 생성
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
                    cartOrderItems: selectedItems.map(item => ({ // cartOrderItems 추가
                        cartItemId: item.cartItemId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };

                try {
                    // processPayment 액션 호출
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
                        // PayResult 페이지로 이동
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
                setAddress2(''); // 상세 주소 초기화
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
            setCustomDeliveryMessage(""); // 직접 입력 메시지 초기화
        }
    };

    /**
     * 배송지 정보를 사용자 정보와 동일하게 설정합니다.
     */
    const handleUseUserInfoForDelivery = () => {
        setDeliveryName(name);
        setDeliveryPhone(phone);
        setDeliveryEmail(email);
        setZipCode(zipCode);
        setAddress1(address1);
        setAddress2(address2);
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

                {/* 배송 정보 - 이메일 */}
                <TextField
                    label="이메일"
                    value={deliveryEmail}
                    onChange={(e) => setDeliveryEmail(e.target.value)}
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
                {/* 배송 메모 선택 */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="delivery-message-label">배송 메모</InputLabel>
                    <Select
                        labelId="delivery-message-label"
                        id="delivery-message"
                        value={deliveryMessage}
                        onChange={handleDeliveryMessageChange}
                        label="배송 메모"
                    >
                        <MenuItem value="선택 안 함">선택 안 함</MenuItem>
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
        </Box>
    );
};

export default OrderDetail;
