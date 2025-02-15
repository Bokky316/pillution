import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * 결제 페이지 컴포넌트
 *
 * 이 컴포넌트는 주문 상세 페이지에서 결제하기 버튼을 클릭했을 때 렌더링됩니다.
 * 아임포트(I'mport) 결제 모듈을 사용하여 결제 프로세스를 처리합니다.
 *
 * @component
 * @example
 * return (
 *   <PaymentPage />
 * )
 */
const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, merchantId, items, totalPrice, zipCode, address1, address2, purchaseType } = location.state;
  const [isImpReady, setIsImpReady] = useState(false);

  /**
   * 아임포트 스크립트를 동적으로 로드합니다.
   */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    script.async = true;
    script.onload = () => setIsImpReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /**
   * 결제 프로세스를 시작합니다.
   * 아임포트 결제 모듈을 초기화하고 결제 데이터를 설정한 후 결제 창을 엽니다.
   *
   * @async
   * @function
   * @throws {Error} 결제 모듈 초기화 실패 시 에러를 throw합니다.
   */
  const handlePayment = async () => {
    if (!isImpReady) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const IMP = window.IMP;
    IMP.init(merchantId);

    const paymentData = {
      pg: "kakaopay",
      pay_method: "card",
      merchant_uid: `${new Date().getTime()}`,
      name: items[0].name,
      amount: totalPrice,
      buyer_email: "test@portone.io",
      buyer_name: "홍길동",
      buyer_tel: "010-1234-5678",
      buyer_addr: `${address1} ${address2}`,
      buyer_postcode: zipCode,
      m_redirect_url: "https://localhost:3000/",
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
  };

  /**
   * 결제 완료 후 백엔드로 결제 정보를 전송합니다.
   *
   * @async
   * @function
   * @param {Object} rsp - 아임포트 결제 응답 객체
   * @returns {Promise<Response>} 백엔드 API 응답
   */
  const processPayment = async (rsp) => {
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
  };

  return (
    <div>
      <h1>결제 페이지</h1>
      <p>주문 번호: {orderId}</p>
      <p>총 결제 금액: {totalPrice}원</p>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handlePayment}
        disabled={!isImpReady}
      >
        결제하기
      </Button>
    </div>
  );
};

export default PaymentPage;
