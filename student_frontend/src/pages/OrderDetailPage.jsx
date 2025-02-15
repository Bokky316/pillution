import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import PaymentPage from '@/pages/PaymentPage';
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/store/orderSlice";

/**
 * 주문서 페이지 컴포넌트
 *
 * 장바구니에서 선택한 상품들의 주문 정보를 표시하고,
 * 배송 정보를 입력받아 결제를 진행하는 페이지입니다.
 *
 * @component
 * @example
 * return (
 *   <OrderDetail />
 * )
 */
const OrderDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //const { user } = useSelector((state) => state.auth);

  //const { selectedItems, purchaseType, totalAmount, userData } = location.state || { selectedItems: [], purchaseType: 'oneTime', totalAmount: 0, userData: {} };

  // location.state가 존재할 때만 값을 할당
  const { selectedItems, purchaseType, totalAmount, user: userData } = location.state
    ? location.state
    : { selectedItems: [], purchaseType: 'oneTime', totalAmount: 0, user: {} };

  //const { name, email, phone, address } = userData || {};

  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [address, setAddress] = useState(userData?.address || '');
  // 배송 정보 상태 관리
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  // 가맹점 ID 상태 관리
  const [merchantId, setMerchantId] = useState("");

  /**
   * 컴포넌트 마운트 시 가맹점 ID를 가져옵니다.
   */
  useEffect(() => {
    const id = fetchMerchantId();
    setMerchantId(id);
  }, []);

  /**
   * 가맹점 UID를 환경 변수에서 가져옵니다.
   *
   * @returns {string} 가맹점 UID
   */
  const fetchMerchantId = () => {
    const merchantId = import.meta.env.VITE_PORTONE_MERCHANT_ID;
    console.log("가맹점 UID:", merchantId);
    return merchantId;
  };

  /**
   * 선택된 상품들의 총 가격을 계산합니다.
   *
   * @returns {number} 총 주문 금액
   */
  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCreateOrder = async () => {
    // 프론트엔드에서 백엔드로 전달할 데이터
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
    };

    try {
      // 백엔드 API 호출
      const response = await dispatch(createOrder({ orderData, purchaseType })).unwrap();

      // 성공적으로 주문 생성 후 결제 페이지로 이동
      console.log("주문 생성 성공:", response);
      //navigate("/payResult", { state: { paymentInfo: response } });

      // 결제 컴포넌트로 데이터 전달
      navigate('/payment', {
        state: {
          orderId: response.id,
          merchantId: merchantId,
          items: selectedItems,
          totalPrice: totalAmount,
          zipCode: zipCode,
          address1: address1,
          address2: address2,
          purchaseType: purchaseType
        }
      });


    } catch (error) {
      console.error("주문 생성 실패:", error);
      alert("주문 생성에 실패했습니다.");
    }
  };

  return (
     <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
         <Typography variant="h4" gutterBottom>
             주문서
         </Typography>
         <Paper sx={{ padding: 3 }}>
             {selectedItems.map((item, index) => (
                 <Box key={index} display="flex" alignItems="center" mb={2}>
                     <img
                         src={item.imageUrl} // 백엔드에서 제공하는 이미지 URL 사용
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

        {/* 사용자 정보 입력 폼 */}
        <Typography variant="h6" mt={3} gutterBottom>
          배송 정보
        </Typography>
        <TextField
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
        />
        <TextField
            label="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
        />
        <TextField
            label="전화번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
        />
        <TextField
            label="주소"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            margin="normal"
        />

        {/* 배송 정보 입력 폼 */}
        <Typography variant="h6" mt={3} gutterBottom>
          배송지 정보
        </Typography>
        <TextField
          label="우편번호"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="주소 1"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="주소 2 (상세주소)"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          fullWidth
          margin="normal"
        />

        {/* 결제 버튼 */}
        <Box mt={3} textAlign="center">
          <Button variant="contained" color="primary" size="large" onClick={handleCreateOrder}>
            결제하기
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderDetail;
