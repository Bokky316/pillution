import React, { useEffect, useState, useRef, useCallback } from "react";
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
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchCategories } from "@features/product/productApi";

export default function ProductListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Redux에서 상품 및 카테고리 정보 가져오기
  const { categories, totalRows, loading, error } = useSelector((state) => state.products);
  const auth = useSelector((state) => state.auth);

  // ✅ 상태 변수 정의
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [remainingProducts, setRemainingProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef();

  // ✅ 관리자 권한 확인
  const userRole = auth?.user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN")
    ? "ADMIN"
    : "USER";

  // ✅ 카테고리 데이터 가져오기
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ✅ 초기 상품 로딩
  useEffect(() => {
    loadInitialProducts();
  }, [dispatch, selectedCategory]);

  // ✅ 초기 상품 로딩 함수
  const loadInitialProducts = async () => {
    setIsFetching(true);
    try {
      const initialProducts = await dispatch(
        fetchProducts({ page: 0, size: 6, category: selectedCategory })
      ).unwrap();
      setDisplayedProducts(initialProducts);
      loadRemainingProducts();
    } catch (error) {
      setSnackbarMessage(error);
      setSnackbarOpen(true);
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ 나머지 상품 백그라운드 로딩
  const loadRemainingProducts = async () => {
    try {
      const remaining = await dispatch(
        fetchProducts({ page: 1, size: 100, category: selectedCategory })
      ).unwrap();
      setRemainingProducts(remaining);
      setHasMore(remaining.length > 0);
    } catch (error) {
      console.error("🚨 추가 상품 불러오기 실패:", error);
    }
  };

  // ✅ 무한 스크롤 구현
  const lastProductRef = useCallback(
    (node) => {
      if (!hasMore || isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && remainingProducts.length > 0) {
          setIsFetching(true);
          setTimeout(() => {
            setDisplayedProducts((prev) => [...prev, ...remainingProducts.slice(0, 3)]);
            setRemainingProducts((prev) => prev.slice(3));

            if (remainingProducts.length <= 3) {
              setHasMore(false);
            }
            setIsFetching(false);
          }, 800);
        }
      });

      if (node) observer.current.observe(node);
    },
    [remainingProducts, hasMore, isFetching]
  );

  // ✅ 카테고리 선택 핸들러
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setDisplayedProducts([]);
    setRemainingProducts([]);
    setHasMore(true);
  };

  // ✅ 전체 상품 보기
  const handleShowAllProducts = () => {
    setSelectedCategory(null);
    setDisplayedProducts([]);
    setRemainingProducts([]);
    setHasMore(true);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: "20px" }}>
      {/* ✅ 카테고리 필터 UI */}
      <Box sx={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", padding: "10px 0" }}>
        <Chip
          label="전체"
          clickable
          color={!selectedCategory ? "primary" : "default"}
          onClick={handleShowAllProducts}
          sx={{
            fontSize: "14px",
            padding: "10px",
            backgroundColor: !selectedCategory ? "#ffcc80" : "#f5f5f5",
          }}
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

      {/* ✅ 상품 목록 UI */}
      <Grid container spacing={3}>
        {displayedProducts.map((product, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={product.id}
            ref={index === displayedProducts.length - 1 ? lastProductRef : null}
          >
            <Card
              onClick={() => navigate(`/Products/${product.id}`)}
              sx={{
                cursor: "pointer",
                boxShadow: 3,
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                ":hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                  transition: "transform 0.2s ease-in-out",
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image || "/placeholder.jpg"}
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent
                sx={{
                  textAlign: "center",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: "#ff5722",
                    marginBottom: 1,
                  }}
                >
                  {product.price.toLocaleString()}원
                </Typography>

                {/* ✅ 주요 성분 태그 */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center", marginTop: "10px" }}>
                    {product.ingredients.map((ingredient, index) => (
                      <Chip
                        key={index}
                        label={ingredient}
                        sx={{
                          fontSize: "12px",
                          backgroundColor: "#f5f5f5",
                          color: "#333",
                          fontWeight: "bold",
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* ✅ 관리자 전용 정보 */}
                {userRole === "ADMIN" && (
                  <Box sx={{ marginTop: "10px" }}>
                    <Typography variant="body2" color="textSecondary">
                      재고: {product.stock}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: product.active ? "green" : "red",
                        marginTop: "5px",
                      }}
                    >
                      {product.active ? "활성화" : "비활성화"}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ✅ 로딩 표시 */}
      {isFetching && (
        <Box sx={{ textAlign: "center", padding: "20px" }}>
          <CircularProgress />
          <Typography sx={{ marginTop: "10px" }}>로딩 중...</Typography>
        </Box>
      )}

      {/* ✅ 모든 상품 로드 완료 메시지 */}
      {!hasMore && !isFetching && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "gray" }}>
          <Typography>모든 상품을 불러왔습니다.</Typography>
        </Box>
      )}

      {/* ✅ 에러 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}