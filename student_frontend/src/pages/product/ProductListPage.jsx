import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Chip,
  Box,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchCategories } from "@features/product/productApi";

export default function ProductListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, categories, loading, error } = useSelector((state) => state.products);
  const auth = useSelector((state) => state.auth);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null); // null이면 전체 보기

  const userRole = auth?.user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN") ? "ADMIN" : "USER";

  useEffect(() => {
    dispatch(fetchProducts()); // 모든 상품 불러오기
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (auth?.user) {
      localStorage.setItem("auth", JSON.stringify(auth));
    }
  }, [auth]);

  // 카테고리 클릭 시 필터링
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // 전체 상품 보기 버튼 클릭
  const handleShowAllProducts = () => {
    setSelectedCategory(null);
  };

  // 선택된 카테고리에 해당하는 상품 필터링
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categories.some((category) => category.id === selectedCategory))
    : products; // 카테고리 선택 안 하면 전체 상품

  const handleCardClick = (id) => {
    navigate(`/viewProduct/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: "20px" }}>
      {/* 카테고리 버튼 영역 */}
      <Box sx={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto" }}>
        <Chip
          label="전체"
          clickable
          color={!selectedCategory ? "primary" : "default"}
          onClick={handleShowAllProducts}
          sx={{ fontSize: "14px", padding: "10px" }}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            clickable
            color={selectedCategory === category.id ? "primary" : "default"}
            onClick={() => handleCategoryClick(category.id)}
            sx={{
              fontSize: "14px",
              padding: "10px",
              backgroundColor: selectedCategory === category.id ? "#ffcc80" : "#f5f5f5",
            }}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              onClick={() => handleCardClick(product.id)}
              sx={{ cursor: "pointer", boxShadow: 3, borderRadius: 2, ":hover": { boxShadow: 6 } }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image || "placeholder.jpg"}
                alt={product.name}
              />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#ff5722" }}>
                  {product.price.toLocaleString()}원
                </Typography>
                {userRole === "ADMIN" && (
                  <>
                    <Typography variant="body2" color="textSecondary">
                      재고: {product.stock}
                    </Typography>
                    <Typography variant="body2" sx={{ color: product.active ? "green" : "red" }}>
                      {product.active ? "활성화" : "비활성화"}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {userRole === "ADMIN" && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/addProduct")}
          sx={{ marginTop: "20px" }}
        >
          상품 등록
        </Button>
      )}

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </Container>
  );
}
