import React, { useState, useEffect, useRef } from "react";
import { useParams,useNavigate  } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import {
    Box, Typography, Button,CardMedia, Grid, Divider,
    CircularProgress, IconButton, Chip, Dialog,
    DialogTitle, DialogContent, DialogActions,
    ImageList, ImageListItem
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon } from "@mui/icons-material";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";
import { addToCart,fetchCartItems } from "@/store/cartSlice";


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
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const userRole = auth?.user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN")
    ? "ADMIN"
    : "USER";

    const getImageUrl = (product) => {
        if (product?.productImgList && product.productImgList.length > 0) {
            const mainImage = product.productImgList.find(img => img.imageType === "대표");
            if (mainImage) {
                // 밑에꺼 쓰려면 .env 파일 생성 후 VITE_PUBLIC_URL=http://localhost:8080 주입
                return `http://localhost:8080${mainImage.imageUrl}`; // ✅ 절대 경로 사용
                //return `${import.meta.env.VITE_PUBLIC_URL}${mainImage.imageUrl}`;
            }
        }
        return null;
    };

    // ✅ 상세 이미지 URL들을 추출하는 함수
    const getDetailImageUrls = (product) => {
        if (product?.productImgList && product.productImgList.length > 0) {
            return product.productImgList
            .filter(img => img.imageType === "상세")
            .map(img => `http://localhost:8080${img.imageUrl}`); // ✅ 절대 경로 사용
        }
        return [];
    };

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

    const handleAddToCart = async () => {
        if (!product) {
            console.error("🚨 상품 정보가 로드되지 않음!");
            return;
        }

        // ✅ 로그인 여부 확인
        const isLoggedIn = Boolean(localStorage.getItem("token")); // 토큰이 있으면 로그인 상태

        if (!isLoggedIn) {
            console.warn("⚠️ 로그인 필요! 로그인 페이지로 이동합니다.");
            navigate("/login"); // ✅ 로그인 페이지로 이동
            return;
        }

        const cartItemDto = {
            productId: product?.productId || productId, // ✅ productId가 없으면 useParams()에서 가져오기
            quantity,
        };

        console.log("📌 추가하려는 상품 ID:", cartItemDto.productId);
        console.log("📌 보낼 데이터:", cartItemDto);

        if (!cartItemDto.productId) {
            console.error("🚨 `productId`가 `null`이므로 요청을 중단합니다.");
            return;
        }

        try {
            await dispatch(addToCart(cartItemDto)).unwrap();
            console.log("✅ 장바구니 추가 성공!");

            // Redux 상태가 업데이트될 때까지 기다림
            await dispatch(fetchCartItems()).unwrap();
            console.log("✅ 장바구니 데이터 새로 불러오기 완료!");

            // ✅ Redux 상태가 반영된 후 페이지 이동
            navigate('/cart');
        } catch (error) {
            console.error("❌ 장바구니 추가 실패:", error);
        }
    };




    return (
        <Box
            ref={containerRef}
            sx={{
                position: "relative",
                overflowX: "hidden",
                padding: "30px",
                paddingBottom: "80px",
                maxWidth: "1024px",
                margin: "0 auto",
                minHeight: "100vh"
            }}
        >
            <Grid container spacing={4} direction="column">
                <Grid item xs={12}>
                    <CardMedia
                        component="img"
                        image={getImageUrl(product)} // 수정: getImageUrl 함수 사용
                        alt={product?.name || "상품 이미지"}
                        sx={{
                            borderRadius: "8px",
                            boxShadow: 3,
                            width: "100%",
                            maxWidth: "600px",
                            margin: "0 auto",
                            display: getImageUrl(product) ? 'block' : 'none'
                        }}
                    />
                </Grid>

                {/* 나머지 상품 정보 컨텐츠 */}
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                        {product?.name || "상품 이름 없음"}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4169E1", marginBottom: 2 }}>
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
                    <Divider sx={{ marginBottom: 1 }} />

                    {/* ✅ 상세 이미지 리스트 렌더링 */}
                    <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
                        <ImageList gap={8}
                            sx={{
                                // GridList 스타일 조정 (반응형, 가로 스크롤)
                                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))!important', // 반응형 컬럼
                                overflowX: 'auto', // 가로 스크롤 활성화
                                flexWrap: 'nowrap', // ImageList 가로로 정렬
                                // 스크롤바 숨김 (선택 사항)
                                '::-webkit-scrollbar': { display: 'none' },
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                            }}
                        >
                            {getDetailImageUrls(product).map((imageUrl, index) => (
                                <ImageListItem key={index}>
                                    <CardMedia
                                        component="img"
                                        image={imageUrl}
                                        alt={`상세 이미지 ${index + 1}`}
                                        sx={{
                                            boxShadow: 2,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </Grid>
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
                /* disabled={!product?.isActive || product?.stock === 0} */
                sx={{
                    textTransform: "none",
                    width: "100%",
                    paddingY: "14px",
                    backgroundColor: !product?.active || product?.stock === 0 ? "#B0B0B0" : "#4169E1",
                    borderRadius: "10px",
                    fontSize: "18px"
                }}
                onClick={() => {
                    if (product?.active && Number(product?.stock) > 0) {
                        handleOpenModal();
                    }
                }}
            >
            구매하기
            </Button>
            </Box>

            {/* 구매 모달 (이전과 동일) */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="xs" disableScrollLock={true}
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
                            backgroundColor: "#4169E1",
                            borderRadius: "10px",
                            fontSize: "18px"
                        }}
                        onClick={handleAddToCart}
                    >
                        장바구니 담기
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductDetailPage;