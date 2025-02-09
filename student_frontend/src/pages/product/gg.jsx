import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
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

  // ✅ Redux에서 카테고리 데이터 및 에러 상태 가져오기
  const { categories, error } = useSelector((state) => state.products);

  // ✅ 상태 변수 정의
  const [displayedProducts, setDisplayedProducts] = useState([]); // 현재 화면에 보이는 상품 목록
  const [remainingProducts, setRemainingProducts] = useState([]); // 아직 표시되지 않은 상품 목록
  const [hasMore, setHasMore] = useState(true); // 더 불러올 상품이 있는지 여부
  const [isFetching, setIsFetching] = useState(false); // 데이터 요청 중인지 여부
  const observer = useRef(); // Intersection Observer (스크롤 감지)

  // ✅ 카테고리 데이터 가져오기 (한 번만 실행)
  useEffect(() => {
    dispatch(fetchCategories()); // 카테고리 목록 요청
  }, [dispatch]);

  // ✅ 초기에 6개 상품만 가져오기
  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 6 })) // 첫 6개만 가져옴
      .unwrap()
      .then((fetchedProducts) => {
        setDisplayedProducts(fetchedProducts); // 6개 상품을 화면에 표시
        loadRemainingProducts(); // 나머지 상품을 비동기적으로 로딩
      })
      .catch((error) => console.error("🚨 상품 불러오기 실패:", error));
  }, [dispatch]);

  // ✅ 나머지 상품을 백그라운드에서 미리 로딩
  const loadRemainingProducts = async () => {
    try {
      const remaining = await dispatch(fetchProducts({ page: 1, size: 100 })).unwrap(); // 이후 데이터를 한 번에 가져옴
      setRemainingProducts(remaining); // 나머지 상품 목록 저장
    } catch (error) {
      console.error("🚨 추가 상품 불러오기 실패:", error);
    }
  };

  // ✅ 스크롤 감지 후 3개씩 추가 로딩 (Intersection Observer 활용)
  const lastProductRef = useCallback(
    (node) => {
      if (!hasMore || isFetching) return; // 더 불러올 데이터가 없거나, 로딩 중이면 실행 안 함
      if (observer.current) observer.current.disconnect(); // 기존 감지기 제거

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && remainingProducts.length > 0) {
          setIsFetching(true); // 🔥 로딩 시작
          setTimeout(() => {
            setDisplayedProducts((prev) => [...prev, ...remainingProducts.slice(0, 3)]); // 3개 추가
            setRemainingProducts((prev) => prev.slice(3)); // 추가한 데이터 제외

            if (remainingProducts.length <= 3) {
              setHasMore(false); // 모든 상품을 다 불러왔으면 스크롤 감지 중단
            }
            setIsFetching(false); // 🔥 로딩 완료
          }, 1000); // 1초 딜레이 (UX 개선)
        }
      });

      if (node) observer.current.observe(node); // 마지막 요소를 감지하도록 설정
    },
    [remainingProducts, hasMore, isFetching]
  );

  return (
    <Container maxWidth="lg" sx={{ padding: "20px" }}>
      {/* ✅ 카테고리 필터 UI */}
      <Box sx={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", padding: "10px 0" }}>
        {categories.map((category) => (
          <Chip key={category.id} label={category.name} clickable />
        ))}
      </Box>

      {/* ✅ 상품 리스트 UI */}
      <Grid container spacing={3}>
        {displayedProducts.map((product, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={product.id}
            ref={index === displayedProducts.length - 1 ? lastProductRef : null} // 마지막 상품을 감지
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
              {/* ✅ 상품 이미지 */}
              <CardMedia
                component="img"
                height="200"
                image={product.image || "/placeholder.jpg"} // 이미지 없을 경우 기본 이미지 표시
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              {/* ✅ 상품 정보 */}
              <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#ff5722" }}>
                  {product.price.toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ✅ 로딩 중 표시 (스크롤 후 데이터 로딩 중) */}
      {isFetching && (
        <Box sx={{ textAlign: "center", padding: "20px" }}>
          <CircularProgress />
          <Typography sx={{ marginTop: "10px" }}>로딩 중...</Typography>
        </Box>
      )}

      {/* ✅ 모든 상품이 표시되었을 때 메시지 */}
      {!hasMore && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "gray" }}>
          <Typography>모든 상품을 불러왔습니다.</Typography>
        </Box>
      )}

      {/* ✅ 에러 메시지 */}
      {error && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "error.main" }}>
          <Typography>{error}</Typography>
        </Box>
      )}
    </Container>
  );
}
