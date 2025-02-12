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
  // Redux 관련
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, error } = useSelector((state) => state.products);
  const auth = useSelector((state) => state.auth);

  // 화면에 표시할 상품 목록 상태
  const [displayedProducts, setDisplayedProducts] = useState([]);
  // 아직 화면에 표시하지 않은 상품 목록 상태
  const [remainingProducts, setRemainingProducts] = useState([]);
  // 더 가져올 상품이 있는지 여부를 나타내는 상태
  const [hasMore, setHasMore] = useState(true);
  // 상품을 가져오는 중인지 여부를 나타내는 상태
  const [isFetching, setIsFetching] = useState(false);
  // 선택된 카테고리 상태
  const [selectedCategory, setSelectedCategory] = useState(null);
  // 모든 상품 목록 상태
  const [allProducts, setAllProducts] = useState([]);
  // Intersection Observer를 위한 ref
  const observer = useRef();
  // 사용자 역할을 확인 (ADMIN 또는 USER)
  const userRole = auth?.user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN")
    ? "ADMIN"
    : "USER";

  // 컴포넌트 마운트 시 카테고리 목록을 가져옴
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 컴포넌트 마운트 시 모든 상품을 가져옴
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        // 상품 목록을 가져옴 (초기 페이지: 0, 사이즈: 100)
        const initialProducts = await dispatch(fetchProducts({ page: 0, size: 100 })).unwrap();
        // 비활성화된 상품을 필터링
        const activeProducts = initialProducts.filter(product => product.active);
        // 모든 상품 목록 상태를 설정
        setAllProducts(activeProducts);
        // 처음 4개 상품을 화면에 표시
        setDisplayedProducts(activeProducts.slice(0, 4));
        // 나머지 상품을 남은 상품 목록에 저장
        setRemainingProducts(activeProducts.slice(4));
        // 더 가져올 상품이 있는지 여부 설정
        setHasMore(activeProducts.length > 4);
      } catch (error) {
        console.error("🚨 상품 불러오기 실패:", error);
      }
    };

    loadAllProducts();
  }, [dispatch]);

  // 카테고리에 따라 상품을 필터링하고 화면에 표시
  const filterAndDisplayProducts = (products, categoryName) => {
    let filtered = products;
    // "전체" 카테고리가 아니면 해당 카테고리의 상품만 필터링
    if (categoryName && categoryName !== "전체") {
      filtered = products.filter(product =>
        product.categories && product.categories.includes(categoryName)
      );
    }
    return filtered;
  };

  // 카테고리 클릭 시 호출되는 함수
  const handleCategoryClick = (categoryName) => {
    setIsFetching(true);

    // "전체" 카테고리 또는 이미 선택된 카테고리를 다시 클릭한 경우
    if (categoryName === "전체" || selectedCategory === categoryName) {
      setSelectedCategory(null);
      setDisplayedProducts(allProducts.slice(0, 6));
      setRemainingProducts(allProducts.slice(6));
      setHasMore(allProducts.length > 6);
    } else {
      // 새로운 카테고리를 선택한 경우
      setSelectedCategory(categoryName);
      const filteredProducts = filterAndDisplayProducts(allProducts, categoryName);
      setDisplayedProducts(filteredProducts.slice(0, 6));
      setRemainingProducts(filteredProducts.slice(6));
      setHasMore(filteredProducts.length > 6);
    }

    setIsFetching(false);
  };

  // Intersection Observer를 사용하여 마지막 상품이 화면에 나타나면 추가 상품을 로드
  const lastProductRef = useCallback(
    (node) => {
      if (!hasMore || isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && remainingProducts.length > 0) {
          setIsFetching(true);

          // 1초 후 추가 상품을 로드
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
      {/* 카테고리 선택 Chip */}
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
      {/* 상품 목록 Grid */}
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
              <CardMedia
                component="img"
                height="200"
                image={product.image || "/placeholder.jpg"}
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              {/* 상품 정보 */}
              <CardContent sx={{ flexGrow: 1,position:"relative" }}>
               <Typography variant="h6" sx={{ fontSize:"13.5px" }} >{product.name}</Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#ff5722" }}>
                  {product.price.toLocaleString()}원
                </Typography>

                {product.ingredients && product.ingredients.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "3px" }}>
                    {product.ingredients.map((ingredient, index) => (
                      <Chip
                        key={index}
                        label={ingredient}
                        size="small" // 🔥 태그 크기 작게 설정
                        sx={{
                          fontSize: "9px", // 🔥 글자 크기 줄임
                          backgroundColor: "#eee", // 🔥 더 연한 배경색
                          color: "#555", // 🔥 글자 색 더 연하게
                          fontWeight: "bold",
                          borderRadius: "12px", // 🔥 태그 모양 더 둥글게
                          paddingX: "6px", // 🔥 좌우 여백 줄이기
                          height: "20px" // 🔥 태그 높이 조절
                        }}
                      />
                    ))}
                  </Box>
                )}


              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 로딩 중 표시 (스크롤 후 데이터 로딩 중) */}
      {isFetching && (
        <Box sx={{ textAlign: "center", padding: "20px" }}>
          <CircularProgress />
          <Typography sx={{ marginTop: "10px" }}>로딩 중...</Typography>
        </Box>
      )}

      {/* 모든 상품이 표시되었을 때 메시지 */}
      {!hasMore && displayedProducts.length > 0 && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "gray" }}>
          <Typography>모든 상품을 불러왔습니다.</Typography>
        </Box>
      )}

      {/* 상품이 없을 때 메시지 */}
      {displayedProducts.length === 0 && !isFetching && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "gray" }}>
          <Typography>해당 카테고리의 상품이 없습니다.</Typography>
        </Box>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "error.main" }}>
          <Typography>{error}</Typography>
        </Box>
      )}
    </Container>
  );
}
