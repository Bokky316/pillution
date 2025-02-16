import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Box, Typography, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useDispatch } from "react-redux";
import { createOrder } from "@/store/orderSlice";
import { processPayment } from "@/store/paymentSlice";
import { saveDeliveryInfo } from "@/store/deliverySlice";

import OrderItems from "@features/payment/OrderItems";
import UserInfo from "@features/payment/UserInfo";
import DeliveryInfo from "@features/payment/DeliveryInfo";
import PaymentSummary from "@features/payment/PaymentSummary";

/**
 * OrderDetail 컴포넌트
 * 주문 상세 정보를 표시하고 결제 프로세스를 처리합니다.
 * @returns {JSX.Element} OrderDetail 컴포넌트
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
    const [zipCode, setZipCode] = useState("");  // 배송지 우편번호
    const [address1, setAddress1] = useState(""); // 배송지 주소
    const [address2, setAddress2] = useState(""); // 배송지 상세주소
    const [userZipCode, setUserZipCode] = useState(""); // 사용자 우편번호
    const [userAddress1, setUserAddress1] = useState(""); // 사용자 주소
    const [userAddress2, setUserAddress2] = useState(""); // 사용자 상세주소
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
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('kakaopay'); // 기본 결제 수단을 카카오페이로 설정
    const [isDeliveryInfoComplete, setIsDeliveryInfoComplete] = useState(false);
    const [pg, setPg] = useState('kakaopay'); // 결제 PG사 상태 추가

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
                // savedAddresses의 id 값을 문자열로 변환
                const updatedSavedAddresses = data.map(address => ({
                    ...address,
                    id: String(address.id)
                }));
                setSavedAddresses(updatedSavedAddresses);
                const defaultDeliveryInfo = updatedSavedAddresses.find(info => info.isDefault === true);
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

        if (userData) {
            setUserZipCode(userData.zipCode || "");
            setUserAddress1(userData.address1 || "");
            setUserAddress2(userData.address2 || "");
        }

        return () => {
            document.body.removeChild(impScript);
            document.body.removeChild(kakaoScript);
        };
    }, []);

    /**
     * 가맹점 ID를 환경 변수에서 가져옵니다.
     * @returns {string} 가맹점 ID
     */
    const fetchMerchantId = () => {
        const merchantId = import.meta.env.VITE_PORTONE_MERCHANT_ID;
        console.log("가맹점 UID:", merchantId);
        return merchantId;
    };

    /**
     * 총 주문 금액을 계산합니다.
     * @returns {number} 총 주문 금액
     */
    const calculateTotalPrice = () => {
        return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    /**
     * 결제 프로세스를 시작합니다.
     */
    const handlePayment = useCallback(async () => {
        if (!isDeliveryInfoComplete) {
            alert("배송 정보를 모두 입력해주세요.");
            return;
        }

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
                id: String(response.id),
                items: selectedItems,
                totalAmount: totalAmount,
                purchaseType: purchaseType
            });

            if (!isImpReady) {
                alert("결제 모듈이 아직 로드되지 않았습니다.");
                return;
            }

            const IMP = window.IMP;
            IMP.init(merchantId);

            const paymentData = {
                pg: getPgProvider(selectedPaymentMethod), // 기존의 pg 상태 대신 함수 사용
                pay_method: getPayMethod(selectedPaymentMethod),
                merchant_uid: `${response.id}_${new Date().getTime()}`,
                name: selectedItems[0].name,
                amount: totalAmount,
                buyer_email: email,
                buyer_name: name,
                buyer_tel: phone,
                buyer_addr: `${address1} ${address2}`,
                buyer_postcode: zipCode,
            };

            IMP.request_pay(paymentData, async (rsp) => {
                if (rsp.success) {
                    console.log("결제 완료 응답:", rsp);

                    const paymentRequest = {
                        impUid: rsp.imp_uid,
                        merchantUid: response.id,
                        paidAmount: rsp.paid_amount,
                        name: rsp.name,
                        pgProvider: rsp.pg_provider,
                        buyerEmail: rsp.buyer_email,
                        buyerName: rsp.buyer_name,
                        buyTel: rsp.buyer_tel,
                        buyerAddr: rsp.buyer_addr,
                        buyerPostcode: rsp.buyer_postcode,
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
        } catch (error) {
            console.error("주문 생성 실패:", error);
            alert("주문 생성에 실패했습니다.");
        }
    }, [isDeliveryInfoComplete, selectedItems, name, email, phone, address1, address2, zipCode, deliveryMessage, customDeliveryMessage, selectedSavedAddressId, purchaseType, totalAmount, dispatch, isImpReady, merchantId, selectedPaymentMethod, navigate, pg]);

    /**
     * PG사 제공자를 가져옵니다.
     * @param {string} method - 결제 수단
     * @returns {string} PG사 제공자
     */
       const getPgProvider = (method) => {
              switch (method) {
                  case 'kakaopay':
                      return 'kakaopay';
                  case 'payco':
                      return 'payco';
                  case 'tosspay':
                      return 'tosspay';
                  case 'card':
                  case 'trans':
                  case 'vbank':
                      return 'html5_inicis';
                  default:
                      return 'html5_inicis';
              }
          };

    /**
     * 결제 방식을 가져옵니다.
     * @param {string} method - 결제 수단
     * @returns {string} 결제 방식
     */
    const getPayMethod = (method) => {
        switch (method) {
            case 'kakaopay':
                return 'card';
            case 'payco':
                return 'card';
            case 'tosspay':
                return 'card';
            case 'card':
                return 'card'; // 신용카드
            case 'trans':
                return 'trans'; // 실시간 계좌이체
            case 'vbank':
                return 'vbank'; // 가상계좌
            default:
                return 'card';
        }
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
        setZipCode(userZipCode);
        setAddress1(userAddress1);
        setAddress2(userAddress2);
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
        } finally {
            handleCloseDialog();
        }
    };

    /**
     * 결제 수단 변경 핸들러
     * @param {Event} event - 이벤트 객체
     */
    const handlePaymentMethodChange = (event) => {
        setSelectedPaymentMethod(event.target.value);
        setPg(getPgProvider(event.target.value)); // 선택된 결제 수단에 따라 PG사 설정
    };

    /**
     * 배송 정보가 모두 채워졌는지 확인하는 함수
     */
    const checkDeliveryInfoComplete = useCallback(() => {
        return deliveryName && deliveryPhone && zipCode && address1 && address2;
    }, [deliveryName, deliveryPhone, zipCode, address1, address2]);

    useEffect(() => {
        setIsDeliveryInfoComplete(checkDeliveryInfoComplete());
    }, [checkDeliveryInfoComplete]);

    return (
        <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                주문서
            </Typography>
            <Paper sx={{ padding: 3 }}>
                <OrderItems selectedItems={selectedItems} />
                <UserInfo
                    name={name}
                    email={email}
                    phone={phone}
                    zipCode={userZipCode}
                    address1={userAddress1}
                    address2={userAddress2}
                    handleUseUserInfo={handleUseUserInfo}
                />
                <DeliveryInfo
                    deliveryName={deliveryName}
                    deliveryPhone={deliveryPhone}
                    zipCode={zipCode}
                    address1={address1}
                    address2={address2}
                    deliveryMessage={deliveryMessage}
                    customDeliveryMessage={customDeliveryMessage}
                    savedAddresses={savedAddresses}
                    selectedSavedAddressId={selectedSavedAddressId}
                    openDialog={openDialog}
                    deliveryInfoName={deliveryInfoName}
                    handleSavedAddressChange={handleSavedAddressChange}
                    handleAddressSearch={handleAddressSearch}
                    handleDeliveryMessageChange={handleDeliveryMessageChange}
                    handleUseUserInfoForDelivery={handleUseUserInfoForDelivery}
                    handleSaveDeliveryInfo={handleSaveDeliveryInfo}
                    handleCloseDialog={handleCloseDialog}
                    handleConfirmSave={handleConfirmSave}
                    setDeliveryName={setDeliveryName}
                    setDeliveryPhone={setDeliveryPhone}
                    setAddress2={setAddress2}
                    setCustomDeliveryMessage={setCustomDeliveryMessage}
                    setIsDefault={setIsDefault}
                    setDeliveryInfoName={setDeliveryInfoName}
                />
               <PaymentSummary
                    totalAmount={totalAmount}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    onPayment={handlePayment}
                    isDeliveryInfoComplete={isDeliveryInfoComplete}
                />
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <FormLabel component="legend">결제 수단 선택</FormLabel>
                    <RadioGroup
                        aria-label="payment-method"
                        name="payment-method"
                        value={selectedPaymentMethod}
                        onChange={handlePaymentMethodChange}
                        row
                    >
                        <FormControlLabel value="kakaopay" control={<Radio />} label="카카오페이" />
                        <FormControlLabel value="payco" control={<Radio />} label="페이코" />
                        <FormControlLabel value="tosspay" control={<Radio />} label="토스페이" />
                        <FormControlLabel value="card" control={<Radio />} label="신용카드" />
                        <FormControlLabel value="trans" control={<Radio />} label="실시간계좌이체" />
                        <FormControlLabel value="vbank" control={<Radio />} label="가상계좌" />
                    </RadioGroup>
                </FormControl>
            </Paper>
        </Box>
    );
};

export default OrderDetail;
