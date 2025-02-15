import React, { useState, useEffect } from "react";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import Payment from "@/features/payment/Payment";

/**
 * 주문서 페이지
 * - 원칙은 장바구니에서 특정 상품의 주문하기 버튼 클릭시 주문데이터가 생성되고 그 데이터를 불러와야 맞음.
 * - 하지만 여기서는 결제 테스트를 위해서 임의의 상품을 불러와서 주문데이터로 사용합니다.
 */
const OrderDetail = () => {
  const itemId = 2; // 하드코딩된 상품 ID (테스트용), 실제 디비에 있는 상품 ID로 변경 필요
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [merchantId, setMerchantId] = useState("");

  useEffect(() => {
    fetchItemById(itemId);
    const id = fetchMerchantId();
    setMerchantId(id);
  }, [itemId]);

  // 상품 정보 조회
  const fetchItemById = async (itemId) => {
    try {
      const response = await fetchWithAuth(`${API_URL}items/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      } else {
        console.error("상품 정보 조회 실패:", response.status);
      }
    } catch (error) {
      console.error("상품 정보를 불러오는 중 오류 발생:", error);
    }
  };

  /**
   * 가맹점 UID 가져오기
   * - .env 리액트 환경설정 파일에 정의된 VITE_PORTONE_MERCHANT_ID=imp66240214 환경 변수를 가져와서 반환합니다.
   * - React에서 환경 변수는 import.meta.env 객체를 통해 접근할 수 있습니다.
   *   이때, import.meta.env.VITE_PORTONE_MERCHANT_ID 형태의 환경 변수를 .env 파일에서 정의하면, React가 빌드 과정에서
   *   해당 변수를 코드에 삽입해 줍니다.
   * @returns {TransformOptions | any}
   */
  const fetchMerchantId = () => {
    const merchantId = import.meta.env.VITE_PORTONE_MERCHANT_ID;
    console.log("가맹점 UID:", merchantId);
    return merchantId;
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        주문서
      </Typography>

      {item ? (
        <Paper sx={{ padding: 3 }}>
          {/* 상품 정보 */}
          <Box display="flex" alignItems="center" mb={2}>
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{ width: 100, height: 100, marginRight: 20 }}
            />
            <Box>
              <Typography variant="h6">{item.itemNm}</Typography>
              <Typography variant="body1">가격: {item.price}원</Typography>
            </Box>
          </Box>

          {/* 수량 입력 */}
          <TextField
            label="수량"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            inputProps={{ min: 1 }}
            fullWidth
            margin="normal"
          />

          {/* 배송 정보 입력 */}
          <Typography variant="h6" mt={3} gutterBottom>
            배송 정보
          </Typography>
          <TextField label="우편번호" value={zipCode} onChange={(e) => setZipCode(e.target.value)} fullWidth margin="normal" />
          <TextField label="주소 1" value={address1} onChange={(e) => setAddress1(e.target.value)} fullWidth margin="normal" />
          <TextField label="주소 2 (상세주소)" value={address2} onChange={(e) => setAddress2(e.target.value)} fullWidth margin="normal" />

          {/* 결제 버튼 */}
          <Box mt={3} textAlign="center">
            {merchantId && (
              <Payment
                merchantId={merchantId}
                item={item}
                quantity={quantity}
                zipCode={zipCode}
                address1={address1}
                address2={address2}
              />
            )}
          </Box>
        </Paper>
      ) : (
        <Typography>상품 정보를 불러오는 중...</Typography>
      )}
    </Box>
  );
};

export default OrderDetail;
