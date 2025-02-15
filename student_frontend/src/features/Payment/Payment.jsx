import React from "react";
import { Button } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { useNavigate } from "react-router-dom";

/**
 * 결제 컴포넌트
 * - OrderDetail 컴포넌트에서 주문하기 버튼 클릭시 호출되는 컴포넌트입니다.
 * - 상점id, 상품정보, 수량, 우편번호, 주소1, 주소2를 전달받아 결제를 진행합니다.
 * - 포트원 결제 API를 사용하여 결제를 진행하고, 결제 완료시 백엔드에 결제 데이터를 전송합니다.
 * - 결제 성공후 결제 결과 페이지로 이동합니다.
 * @param merchantId
 * @param item
 * @param quantity
 * @param zipCode
 * @param address1
 * @param address2
 * @returns {JSX.Element}
 * @constructor
 */
const Payment = ({ merchantId, item, quantity, zipCode, address1, address2 }) => {
  const navigate = useNavigate();

  // 결제 요청 핸들러
  const handlePayment = async () => {
    const IMP = window.IMP; // 아임포트 결제 라이브러리 초기화
    IMP.init(merchantId);   // 가맹점 식별코드 초기화

    // 포트원 결제 API 호출시 필요한 결제 데이터로 "kakaopay" 방식으로 결제 진행
    // paymentData의 속성명은 포트원에서 이미 정의된 속성명을 사용해야 함
    // 오른쪽의 값들은 OrderDetail 컴포넌트에서 전달받은 값들을 사용
    const paymentData = {
      pg: "kakaopay",
      pay_method: "card",
      merchant_uid: `${new Date().getTime()}`,  // 결제 고유번호, 거래 번호는 고유해야 함
      name: item.itemNm,
      amount: item.price * quantity,
      buyer_email: "test@portone.io",
      buyer_name: "홍길동",
      buyer_tel: "010-1234-5678",
      buyer_addr: `${address1} ${address2}`,
      buyer_postcode: zipCode,
      m_redirect_url: "https://localhost:3000/", // 결제 완료 후 리다이렉트할 URL
    };

    /*
        * IMP.request_pay() 함수 호출
        * 결재 창이 열리고 결제가 진행됨
     */
    IMP.request_pay(paymentData, async (rsp) => {
      if (rsp.success) {
        alert("결제가 완료되었습니다!");
        console.log("결제 완료 응답:", rsp);
        // 결제 데이터를 백엔드로 전송
        const response = await processPayment(rsp);
        if (response.ok) {
          const data = await response.json();
          navigate("/payResult", { state: { paymentInfo: data } }); // 결제 결과 페이지로 이동
        }
      } else {
        alert(`결제 실패: ${rsp.error_msg}`);
      }
    });
  };

  // 백엔드에 결제 데이터 전송
  const processPayment = async (rsp) => {
    const paymentRequest = {
      impUid: rsp.imp_uid,
      merchantUid: 1, // 실제 주문 테이블에 있는 주문번호로 변경 필요
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

    return fetchWithAuth(`${API_URL}payments/request`, {
      method: "POST",
      body: JSON.stringify(paymentRequest),
    });
  };

  return (
      <Button variant="contained" color="primary" size="large" onClick={handlePayment}>
        결제하기
      </Button>
  );
};

export default Payment;
