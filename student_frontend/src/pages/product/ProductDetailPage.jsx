import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  CardMedia,
  Grid,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon } from "@mui/icons-material";
import { fetchWithAuth } from "../../features/auth/utils/fetchWithAuth";
import { API_URL } from "../../constant";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [isButtonFixed, setIsButtonFixed] = useState(true);
  const containerRef = useRef(null);
  const auth = useSelector((state) => state.auth);

  const userRole = auth?.user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN")
    ? "ADMIN"
    : "USER";

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerBottom = containerRect.bottom;
        const windowHeight = window.innerHeight;
        const buttonHeight = 80; // 버튼 영역의 대략적인 높이

        // 컨테이너 하단이 뷰포트 하단에 가까워지면 absolute로 전환
        setIsButtonFixed(containerBottom - buttonHeight > windowHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 설정

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`${API_URL}products/${productId}`);
        if (!response.ok) {
          throw new Error("상품 정보를 불러올 수 없습니다.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        setError(error.message || "상품 정보를 불러오는 중 오류 발생!");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const calculateTotalPrice = () => {
    return product?.price ? product.price * quantity : 0;
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Typography variant="h6" color="error">{error}</Typography></Box>;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        overflowX: "hidden",
        padding: "40px",
        paddingBottom: "80px",
        maxWidth: "1024px",
        margin: "0 auto",
        minHeight: "100vh"
      }}
    >
      <Grid container spacing={4} direction="column">
        <Grid item xs={12} sx={{ paddingLeft: "0px !important" }}>
          <CardMedia
            component="img"
            image={product?.mainImageUrl || product?.imageUrl || "/images/logo.png"}
            alt={product?.name || "상품 이미지"}
            sx={{
              borderRadius: "8px",
              boxShadow: 3,
              width: "100%",
              maxWidth: "600px",
              margin: "0 auto"
            }}
          />
        </Grid>

        {/* 나머지 상품 정보 컨텐츠 */}
        <Grid item xs={12} sx={{ paddingLeft: "0px !important" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            {product?.name || "상품 이름 없음"}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main", marginBottom: 2 }}>
            {product?.price ? `${product.price.toLocaleString()}원` : "가격 정보 없음"}
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />
          <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 3 }}>
            {product?.description || "상품 설명이 없습니다."}
          </Typography>
          <Divider sx={{ marginBottom: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center"}}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ minWidth: "60px", mt: "-40px", fontSize: 15 }}>
                배송비
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", padding: 2 }}>
              <Typography variant="body2" sx={{ mb: "10px", fontSize: 15 }}>3,000원</Typography>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }} style={{fontSize: 12}}>
                  ・ <span style={{ fontWeight: "bold" }}>정기구독</span> : 1만원 이상 무료배송
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{fontSize: 12}}>
                  ・ <span style={{ fontWeight: "bold" }}>한 번만 구매하기</span> : 배송비 3,000원
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* 구매하기 버튼 */}
      <Box
        sx={{
          position: isButtonFixed ? "fixed" : "absolute",
          bottom: isButtonFixed ? 20 : 20,
          left: isButtonFixed ? "50%" : 0,
          transform: isButtonFixed ? "translateX(-50%)" : "none",
          width: isButtonFixed ? "480px" : "100%",
          padding: isButtonFixed ? "0" : "10px 40px",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "white",
          zIndex: 1000,
          paddingLeft: "0px !important"
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            width: "100%",
            paddingY: "14px",
            backgroundColor: "#FF5722",
            "&:hover": { backgroundColor: "#E64A19" },
            borderRadius: "10px",
            fontSize: "18px"
          }}
          onClick={handleOpenModal}
        >
          구매하기
        </Button>
      </Box>

      {/* 구매 모달 (이전과 동일) */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="xs"
        sx={{
          '& .MuiPaper-root': {
            width: "100%",
            maxWidth: "480px",
            borderRadius: "16px",
            padding: "20px",
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
            overflowX: "hidden",
            margin:"0px !important"
          }
        }}
      >
        {/* 모달 내용은 동일하게 유지 */}
        <DialogTitle sx={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "20px",padding:"0px !important"}}>
          <IconButton onClick={handleCloseModal} sx={{ marginLeft: "auto" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold", fontSize: "20px",paddingY:"0px !important" }}>
          {product?.name || "상품 정보"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "16px" }}>수량</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <IconButton
                size="large"
                onClick={() => handleQuantityChange(-1)}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px"
                }}
              >
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ fontSize: "20px", fontWeight: "bold", margin: 3 }}>
                {quantity}
              </Typography>
              <IconButton
                size="large"
                onClick={() => handleQuantityChange(1)}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px"
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography sx={{ fontWeight: "bold", fontSize: "16px" }}>제품 금액</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "18px" }}>
              {calculateTotalPrice().toLocaleString()}원
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "gray", textAlign: "right", fontSize: "12px", mt: 1 }}>
            ※ 장바구니에서 할인 혜택을 적용할 수 있습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              width: "100%",
              paddingY: "14px",
              backgroundColor: "#FF5722",
              "&:hover": { backgroundColor: "#E64A19" },
              borderRadius: "10px",
              fontSize: "18px"
            }}
          >
            장바구니 담기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductDetailPage;