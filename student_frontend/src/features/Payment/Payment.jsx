import React, { useEffect, useCallback, useState } from "react";
import { Button, Radio, RadioGroup, FormControlLabel, FormControl, Paper, Typography, Box } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useNavigate, useLocation } from "react-router-dom";
import "@/styles/Payment.css";

const Payment = React.memo(({ orderId, merchantId, items, totalPrice, zipCode, address1, address2, purchaseType, isImpReady }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedItems, totalAmount, user: userData } = location.state || { selectedItems: [], totalAmount: 0, user: {} };

  // 결제 정보 상태 관리
  const [name, setName] = React.useState(userData?.name || '');
  const [email, setEmail] = React.useState(userData?.email || '');
  const [phone, setPhone] = React.useState(userData?.phone || '');
  const [address, setAddress] = React.useState(userData?.address || '');
  const [paymentMethod, setPaymentMethod] = React.useState("kakaopay");

  // 결제 수단 변경 핸들러
  const handlePaymentMethodChange = useCallback((event) => {
    setPaymentMethod(event.target.value);
  }, []);

  // 결제 처리 핸들러
  const handlePayment = useCallback(async () => {
    if (!isImpReady) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const IMP = window.IMP;
    IMP.init(merchantId);  // 결제 직전에 다시 한 번 초기화

    let pg = "";
    if (paymentMethod === "kakaopay") {
      pg = "kakaopay";
    } else if (paymentMethod === "payco") {
      pg = "payco";
    }

    const paymentData = {
      pg: pg,
      pay_method: "card",
      merchant_uid: orderId,
      name: items[0].name,
      amount: totalPrice,
      buyer_email: email,
      buyer_name: name,
      buyer_tel: phone,
      buyer_addr: `${address1} ${address2}`,
      buyer_postcode: zipCode,
      m_redirect_url: "http://localhost:3000/payResult"
    };

    IMP.request_pay(paymentData, async (rsp) => {
      if (rsp.success) {
        alert("결제가 완료되었습니다!");
        console.log("결제 완료 응답:", rsp);
        const response = await processPayment(rsp);
        if (response.ok) {
          const data = await response.json();
          navigate("/payResult", { state: { paymentInfo: data } });
        }
      } else {
        alert(`결제 실패: ${rsp.error_msg}`);
      }
    });
  }, [isImpReady, merchantId, paymentMethod, orderId, items, totalPrice, email, name, phone, address1, address2, zipCode, navigate]);

  // 결제 처리 함수
  const processPayment = useCallback(async (rsp) => {
    const paymentRequest = {
      impUid: rsp.imp_uid,
      merchantUid: orderId,
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
    };

    return fetchWithAuth(`${API_URL}payments/request?purchaseType=${purchaseType}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentRequest),
    });
  }, [orderId, purchaseType]);

  // 컴포넌트 렌더링
  return (
    <Paper elevation={3} className="payment-container">
      <Typography variant="h6" gutterBottom className="payment-title">
        결제 정보 입력
      </Typography>
      <Typography variant="body1" className="order-info">
        주문 번호: {orderId}
      </Typography>
      <Typography variant="body1" className="order-info">
        총 결제 금액: {totalPrice}원
      </Typography>

      <FormControl component="fieldset" className="payment-method-select">
        <Typography variant="subtitle1" gutterBottom>
          결제 수단 선택
        </Typography>
        <RadioGroup
          aria-label="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <FormControlLabel value="kakaopay" control={<Radio />} label="카카오페이" />
          <FormControlLabel value="payco" control={<Radio />} label="페이코" />
          <FormControlLabel value="card" control={<Radio />} label="신용카드" />
        </RadioGroup>
      </FormControl>

      <Box mt={2} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handlePayment}
          disabled={!isImpReady}
        >
          {isImpReady ? (paymentMethod === 'card' ? '신용카드로 결제하기' : `${paymentMethod}로 결제하기`) : '결제 모듈 로딩 중...'}
        </Button>
      </Box>
    </Paper>
  );
});

export default Payment;
