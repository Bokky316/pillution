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
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchCategories } from "@features/product/productApi";

export default function ProductListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, categories, totalRows, loading, error } = useSelector((state) => state.products);
  const auth = useSelector((state) => state.auth);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);

  const userRole = auth?.user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN")
    ? "ADMIN"
    : "USER";

  // 초기 데이터 로딩
  useEffect(() => {
    dispatch(fetchProducts({
      page: page,
      size: pageSize
    })).unwrap()
      .catch((error) => {
        setSnackbarMessage(error);
        setSnackbarOpen(true);
      });
    dispatch(fetchCategories());
  }, [dispatch, page, pageSize]);

  // Auth 상태 저장
  useEffect(() => {
    if (auth?.user) {
      localStorage.setItem("auth", JSON.stringify(auth));
    }
  }, [auth]);

  // 페이지 변경 핸들러
  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(0);
  };

  // 전체 상품 보기 핸들러
  const handleShowAllProducts = () => {
    setSelectedCategory(null);
    setPage(0);
  };

  // 선택된 카테고리에 따른 상품 필터링
  const filteredProducts = selectedCategory
    ? products.filter((product) =>
        product.categories.includes(categories.find(cat => cat.id === selectedCategory)?.name)
      )
    : products;

  // 상품 카드 클릭 핸들러
  const handleCardClick = (id) => {
    navigate(`/Products/${id}`);
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // 현재 페이지에 표시할 상품 목록
  const currentPageProducts = filteredProducts.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  return (
    <Container maxWidth="lg" sx={{ padding: "20px" }}>
      {/* 카테고리 필터 */}
      <Box sx={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        overflowX: "auto",
        padding: "10px 0"
      }}>
        <Chip
          label="전체"
          clickable
          color={!selectedCategory ? "primary" : "default"}
          onClick={handleShowAllProducts}
          sx={{
            fontSize: "14px",
            padding: "10px",
            backgroundColor: !selectedCategory ? "#ffcc80" : "#f5f5f5"
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

      {/* 상품 그리드 */}
      <Grid container spacing={3}>
        {currentPageProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              onClick={() => handleCardClick(product.id)}
              sx={{
                cursor: "pointer",
                boxShadow: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ":hover": {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image || "/placeholder.jpg"}
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{
                textAlign: "center",
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Box>
                  <Typography variant="body1" sx={{
                    fontWeight: "bold",
                    color: "#ff5722",
                    marginBottom: 1
                  }}>
                    {product.price.toLocaleString()}원
                  </Typography>
                  {userRole === "ADMIN" && (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        재고: {product.stock}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: product.active ? "green" : "red",
                          marginTop: 1
                        }}
                      >
                        {product.active ? "활성화" : "비활성화"}
                      </Typography>
                    </>
                  )}
                  {/* 카테고리와 성분 표시 */}
                  {product.categories && product.categories.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        카테고리: {product.categories.join(', ')}
                      </Typography>
                    </Box>
                  )}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">
                        주요 성분: {product.ingredients.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          margin: '20px 0'
        }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <Box sx={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <Typography>로딩 중...</Typography>
        </Box>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Box sx={{
          textAlign: 'center',
          padding: '20px',
          color: 'error.main'
        }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      {/* 관리자 버튼 */}
      {userRole === "ADMIN" && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/addProduct")}
            sx={{
              padding: '10px 20px',
              fontSize: '16px'
            }}
          >
            상품 등록
          </Button>
        </Box>
      )}

      {/* 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}