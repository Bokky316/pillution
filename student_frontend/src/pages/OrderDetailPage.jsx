import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/store/orderSlice";

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
  const [merchantId, setMerchantId] = useState("");
  const [order, setOrder] = useState(null);
  const [isImpReady, setIsImpReady] = useState(false);

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
      merchant_uid: order.id,
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
            buyerEmail: rsp.buyer_email,
            buyerName: rsp.buyer_name,
            buyTel: rsp.buyer_tel,
            buyerAddr: rsp.buyer_addr,
            buyerPostcode: rsp.buyer_postcode,
            paidAt: rsp.paid_at,
            status: "PAYMENT_COMPLETED",
            cartOrderItems: selectedItems.map(item => ({ // cartOrderItems 추가
              cartItemId: item.cartItemId,
              quantity: item.quantity,
              price: item.price
            }))
          };

          const response = await processPayment(paymentRequest); // paymentRequest 전달

          if (response.ok) {
            const data = await response.json();
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
          }
        } else {
          alert(`결제 실패: ${rsp.error_msg}`);
        }
      });
    };

  /**
   * 결제 정보를 서버로 전송하고 처리합니다.
   */
  const processPayment = async (paymentRequest) => {
    return fetchWithAuth(`${API_URL}payments/request?purchaseType=${order.purchaseType}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentRequest),
    });
  };

  /**
   * 카카오 주소 검색 API를 호출합니다.
   */
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        setZipCode(data.zonecode);
        setAddress1(data.address);
        setAddress2(''); // 상세 주소 초기화
      }
    }).open();
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

        <Typography variant="h6" mt={3} gutterBottom>
          배송지 정보
        </Typography>
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

        <Box mt={3} textAlign="center">
          <Button variant="contained" color="primary" size="large" onClick={handleCreateOrder}>
            주문 생성
          </Button>
        </Box>
      </Paper>... {order && (
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
