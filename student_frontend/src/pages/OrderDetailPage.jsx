import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import Payment from "@/features/payment/Payment";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/store/orderSlice";

/**
 * 주문 상세 페이지 컴포넌트
 *
 * 사용자가 선택한 상품의 주문 정보를 표시하고, 배송 정보를 입력받아 주문을 생성합니다.
 * 주문 생성 후 결제 컴포넌트를 렌더링합니다.
 *
 * @component
 * @returns {JSX.Element}
 */
const OrderDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentOrder } = useSelector((state) => state.order);
  const { merchantId } = useSelector((state) => state.payment);

  const { selectedItems, purchaseType, totalAmount } = location.state || {
    selectedItems: [],
    purchaseType: 'oneTime',
    totalAmount: 0
  };

  const [orderId, setOrderId] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  /**
   * 컴포넌트 마운트 시 가맹점 ID를 가져옵니다.
   */
  useEffect(() => {
    const id = fetchMerchantId();
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

  /**
   * 주문을 생성하고 백엔드에 전송합니다.
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
    };

    try {
      const response = await dispatch(createOrder({ orderData, purchaseType })).unwrap();
      console.log("주문 생성 성공:", response);
      setOrderId(response.id);
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
              src={item.image}
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

        <Box mt={3} textAlign="center">
          <Button variant="contained" color="primary" size="large" onClick={handleCreateOrder}>
            주문 생성
          </Button>
        </Box>
      </Paper>
      {orderId && (
        <Payment
          orderId={orderId}
          merchantId={merchantId}
          items={selectedItems}
          totalPrice={totalAmount}
          zipCode={zipCode}
          address1={address1}
          address2={address2}
          purchaseType={purchaseType}
        />
      )}
    </Box>
  );
};

export default OrderDetail;
