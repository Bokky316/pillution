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
  const auth = useSelector((state) => state.auth);

  // ✅ 상태 변수 정의
  const [displayedProducts, setDisplayedProducts] = useState([]); // 현재 화면에 보이는 상품 목록
  const [remainingProducts, setRemainingProducts] = useState([]); // 아직 표시되지 않은 상품 목록
  const [hasMore, setHasMore] = useState(true); // 더 불러올 상품이 있는지 여부
  const [isFetching, setIsFetching] = useState(false); // 데이터 요청 중인지 여부
  const [selectedCategory, setSelectedCategory] = useState(null); // 선택된 카테고리
  const [allProducts, setAllProducts] = useState([]); // 전체 상품 목록 저장
  const observer = useRef(); // Intersection Observer (스크롤 감지)

  // ✅ 현재 로그인한 사용자가 관리자(admin)인지 확인
  const userRole = auth?.user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN")
    ? "ADMIN"
    : "USER";

  // ✅ 카테고리 데이터 가져오기 (한 번만 실행)
  useEffect(() => {
    dispatch(fetchCategories()); // 카테고리 목록 요청
  }, [dispatch]);

  // ✅ 초기에 전체 상품 가져오기
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const initialProducts = await dispatch(fetchProducts({ page: 0, size: 100 })).unwrap();
        setAllProducts(initialProducts);
        setDisplayedProducts(initialProducts.slice(0, 4));
        setRemainingProducts(initialProducts.slice(4));
        setHasMore(initialProducts.length > 4);
      } catch (error) {
        console.error("🚨 상품 불러오기 실패:", error);
      }
    };

    loadAllProducts();
  }, [dispatch]);

  // ✅ 카테고리별 상품 필터링 및 표시
  const filterAndDisplayProducts = (products, categoryName) => {
    let filtered = products;
    if (categoryName && categoryName !== "전체") {
      filtered = products.filter(product =>
        product.categories && product.categories.includes(categoryName)
      );
    }
    return filtered;
  };

  // ✅ 카테고리 필터링 처리
  const handleCategoryClick = (categoryName) => {
    setIsFetching(true);

    // 이전 선택과 같은 카테고리이거나 전체를 선택한 경우
    if (categoryName === "전체" || selectedCategory === categoryName) {
      setSelectedCategory(null);
      setDisplayedProducts(allProducts.slice(0, 6));
      setRemainingProducts(allProducts.slice(6));
      setHasMore(allProducts.length > 6);
    } else {
      // 새로운 카테고리 선택
      setSelectedCategory(categoryName);
      const filteredProducts = filterAndDisplayProducts(allProducts, categoryName);
      setDisplayedProducts(filteredProducts.slice(0, 6));
      setRemainingProducts(filteredProducts.slice(6));
      setHasMore(filteredProducts.length > 6);
    }

    setIsFetching(false);
  };

  // ✅ 스크롤 감지 후 3개씩 추가 로딩 (Intersection Observer 활용)
  const lastProductRef = useCallback(
    (node) => {
      if (!hasMore || isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && remainingProducts.length > 0) {
          setIsFetching(true);

          // 현재 카테고리에 맞는 추가 상품 로드
          setTimeout(() => {
            const nextProducts = remainingProducts.slice(0, 2);
            setDisplayedProducts(prev => [...prev, ...nextProducts]);
            setRemainingProducts(prev => prev.slice(2));
            setHasMore(remainingProducts.length > 2);
            setIsFetching(false);
          }, 1000);
        }
      });

      if (node) observer.current.observe(node);
    },
    [remainingProducts, hasMore, isFetching]
  );

  return (
    <Container maxWidth="lg" sx={{ padding: "20px" }}>
      {/* ✅ 카테고리 필터 UI */}
      <Box sx={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          overflowX: "auto",
          padding: "10px 0" ,
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f0f0f0",
          },
      }}>
        <Chip
          key="all"
          label="전체"
          clickable
          onClick={() => handleCategoryClick("전체")}
          color={!selectedCategory ? "primary" : "default"}
          variant={!selectedCategory ? "filled" : "outlined"}
        />
        {categories.map((category) => (
          <Chip
            key={category.name}
            label={category.name}
            clickable
            onClick={() => handleCategoryClick(category.name)}
            color={selectedCategory === category.name ? "primary" : "default"}
            variant={selectedCategory === category.name ? "filled" : "outlined"}
          />
        ))}
      </Box>

      {/* ✅ 상품 리스트 UI */}
      <Grid container spacing={3}>
        {displayedProducts.map((product, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={6}
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
              {/* ✅ 상품 이미지 */}
              <CardMedia
                component="img"
                height="200"
                image={product.image || "/placeholder.jpg"}
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              {/* ✅ 상품 정보 */}
              <CardContent sx={{ flexGrow: 1,position:"relative" }}>
                <Typography variant="h6" sx={{ fontSize:"13.5px" }} >{product.name}</Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#ff5722" }}>
                  {product.price.toLocaleString()}원
                </Typography>

                {/* ✅ 주요 성분 태그 */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "3px" }}>
                    {product.ingredients.map((ingredient, index) => (
                      <Chip
                        key={index}
                        label={ingredient}
                        sx={{
                          fontSize: "10px",
                          backgroundColor: "#f5f5f5",
                          color: "#333",
                          fontWeight: "bold",
                          borderRadius: "5px", // 둥근 정도 조정 (기본값: 16px)
                          paddingLeft: "8px",
                          paddingRight: "8px"
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* ✅ 관리자 전용 정보 */}
                {userRole === "ADMIN" && (
                  <Box sx={{ marginTop: "10px" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        width: "90%",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "4px 8px", // 내부 여백 추가
                        borderRadius: "5px", // 모서리 둥글게
                        display: "inline-block", // 내용 크기에 맞게 조정
                        border: "1px solid", // 테두리 스타일 지정
                        borderColor:
                          product.stock <= 5 ? "#EF5350" : // 빨강 (에러)
                          product.stock <= 15 ? "#FFA726" : // 주황 (경고)
                          "#4CAF50", // 초록 (성공)
                        color:
                          product.stock <= 5 ? "#EF5350" : // 빨강 (에러)
                          product.stock <= 15 ? "#FFA726" : // 주황 (경고)
                          "#4CAF50", // 초록 (성공)
                        backgroundColor: "transparent", // 배경 투명
                      }}
                    >
                      재고: {product.stock}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        position: "absolute", // 부모(CardContent)를 기준으로 절대 위치 지정
                        bottom: "0", // CardContent 바닥에 붙이기
                        left: "0", // 왼쪽 정렬
                        marginTop: "5px",
                        display: "inline-block", // 크기 조절
                        width: "100%", // 원하는 너비
                        height: "12px", // 원하는 높이
                        backgroundColor: product.active ? "#4CAF50" : "#666", // 활성화/비활성화 색상
                      }}
                    />
                  </Box>
                )}
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
      {!hasMore && displayedProducts.length > 0 && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "gray" }}>
          <Typography>모든 상품을 불러왔습니다.</Typography>
        </Box>
      )}

      {/* ✅ 상품이 없을 때 메시지 */}
      {displayedProducts.length === 0 && !isFetching && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "gray" }}>
          <Typography>해당 카테고리의 상품이 없습니다.</Typography>
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