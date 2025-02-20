import React, { useState } from "react";
import { Box, Typography, Button, Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import "@/styles/Subscription.css"; // ✅ 별도 CSS 파일 적용!

export default function SubscriptionProductModal({ isOpen, onClose, products, selectedItems, onSelectProduct }) {
    const allProducts = useSelector((state) => state.subscription.products);//  Redux에서 전체 상품 정보 가져오기
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    if (!isOpen) return null;

    // ✅ Redux에서 상품명으로 제품을 찾아서 대표 이미지 URL 가져오기
    const getProductImageUrl = (productName) => {
        const product = allProducts.find((p) => p.name === productName);
        if (product && product.mainImageUrl) {
            const baseUrl = import.meta.env.VITE_PUBLIC_URL || "http://localhost:8080"; // ✅ API 기본 URL 설정
            return `${baseUrl}${product.mainImageUrl.startsWith("/") ? product.mainImageUrl : "/" + product.mainImageUrl}`;
        }
        return "https://dummyimage.com/70x70/cccccc/ffffff&text=No+Image";
    };

    const handleAddProduct = (product) => {
        onSelectProduct(product);
        setSnackbarOpen(true);
    };

    return (
        <Box className="subscription-modal">
            <Box className="subscription-modal-header">
                <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", flexGrow: 1 }}>
                    정기구독 제품 추가
                </Typography>
                <button onClick={onClose} className="subscription-modal-close">✖</button>
            </Box>

            {/* 상품 리스트 */}
            {products.map((product) => {
                const isAdded = selectedItems.some(item => item.productId === product.id);
                const imageUrl = getProductImageUrl(product.name); // ✅ Redux에서 이미지 URL 가져오기

                return (
                    <Box key={product.id} className="subscription-modal-product">
                        <img src={imageUrl} alt={product.name} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                {product.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#4169E1", mb: 1 }}>
                                {product.price.toLocaleString()}원
                            </Typography>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                {[...product.categories, ...product.ingredients].map((tag, index) => (
                                    <span key={index} className="subscription-modal-tag">#{tag}</span>
                                ))}
                            </div>
                        </Box>

                        {isAdded ? (
                            <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#4169E1" }}>
                                추가됨 ✔️
                            </Typography>
                        ) : (
                            <button onClick={() => handleAddProduct(product)} className="add-button">+</button>
                        )}
                    </Box>
                );
            })}

            <Button fullWidth variant="contained" className="subscription-modal-close-button" onClick={onClose}>
                닫기
            </Button>

            {/* ✅ 스낵바 추가 */}
            <Snackbar
                open={snackbarOpen}
                message="다음 정기결제에 추가되었습니다."
                autoHideDuration={3000}
                onClose={(event, reason) => {
                    if (reason === "timeout") {
                        setSnackbarOpen(false);
                    }
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                ContentProps={{ className: "snackbar-success" }}
            />
        </Box>
    );
}
