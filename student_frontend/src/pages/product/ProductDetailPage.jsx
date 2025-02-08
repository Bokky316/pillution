import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CardMedia,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import { fetchWithAuth } from "../../features/auth/utils/fetchWithAuth";
import { API_URL } from "../../constant";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`${API_URL.replace(/\/$/, "")}/products/${productId}`);
        if (!response.ok) {
          throw new Error("상품 정보를 불러올 수 없습니다.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const addToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!response.ok) throw new Error("장바구니에 추가 실패!");

      alert("장바구니에 추가되었습니다!");
    } catch (error) {
      alert(error.message || "장바구니 추가 중 오류 발생!");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "40px", maxWidth: "1024px", margin: "0 auto" }}>
      <Grid container spacing={4}>
        {/* 왼쪽 - 이미지 */}
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={product?.mainImageUrl || "/images/logo.png"}
            alt={product?.name || "상품 이미지"}
            sx={{ borderRadius: "8px", boxShadow: 3 }}
          />
        </Grid>

        {/* 오른쪽 - 상세 정보 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            {product?.name || "상품 이름 없음"}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 3 }}>
            {product?.description || "상품 설명이 없습니다."}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main", marginBottom: 2 }}>
            {product?.price ? `${product.price}원` : "가격 정보 없음"}
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />
          <Typography variant="body2" color="textSecondary">배송비: 3,000원</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            정기구독: 1만원 이상 무료배송
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: "none", borderRadius: "25px", paddingX: "20px", paddingY: "10px" }}
            onClick={addToCart}
            disabled={addingToCart}
          >
            {addingToCart ? <CircularProgress size={24} /> : "장바구니에 추가"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;
