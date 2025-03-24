import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // ✅ Redux에서 제품 정보 가져오기
import {
    addNextSubscriptionItem,
    deleteNextSubscriptionItem,
    updateNextSubscriptionItems,
    fetchSubscription,
    cancelSubscription
} from "@/store/subscriptionSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Button, Box, Typography, Divider, Grid, Dialog, DialogTitle, DialogActions } from "@mui/material";
import SubscriptionProductModal from "@/features/modal/SubscriptionProductModal";
import "@/styles/Subscription.css"; // ✅ 스타일 추가

export default function NextSubscriptionItems({ subscription }) {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.subscription.products); // ✅ Redux에서 전체 제품 목록 가져오기
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nextItems, setNextItems] = useState(subscription.nextItems || []);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);

    useEffect(() => {
        setNextItems(subscription.nextItems || []);
    }, [subscription.nextItems]);

    // ✅ 상품명으로 Redux에서 제품 정보를 찾아 대표 이미지 URL 가져오기
    const getProductImageUrl = (productName) => {
        const product = products.find((p) => p.name === productName);
        if (product && product.mainImageUrl) {
            const baseUrl = import.meta.env.VITE_PUBLIC_URL || "http://localhost:8080"; // ✅ 환경변수에서 API 기본 URL 가져오기
            return `${baseUrl}${product.mainImageUrl.startsWith("/") ? product.mainImageUrl : "/" + product.mainImageUrl}`;
        }
        return "https://dummyimage.com/70x70/cccccc/ffffff&text=No+Image"; // 기본 이미지
    };

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedItems = nextItems.map(item =>
            item.productId === productId ? { ...item, nextMonthQuantity: newQuantity } : item
        );

        setNextItems(updatedItems);
        dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }))
            .then(() => dispatch(fetchSubscription()));
    };

    const handleSelectProduct = (product) => {
        const existingItem = subscription.nextItems.find(item => item.productId === product.id);

        if (existingItem) {
            handleQuantityChange(product.id, existingItem.nextMonthQuantity + 1);
        } else {
            const newItem = {
                subscriptionId: subscription.id,
                productId: product.id,
                productName: product.name,
                imageUrl: product.imageUrl,
                nextMonthQuantity: 1,
                nextMonthPrice: product.price,
            };
            dispatch(addNextSubscriptionItem(newItem))
                .then(() => dispatch(fetchSubscription()));
        }

        setIsModalOpen(false);
    };

    const handleDeleteItem = (productId) => {
        const remainingItems = nextItems.filter(item => item.productId !== productId);

        if (remainingItems.length === 0) {
            // ✅ 마지막 제품 삭제 시 구독 해지 확인 다이얼로그 표시
            setDeleteItemId(productId);
            setConfirmCancel(true);
        } else {
            // ✅ 일반 삭제 처리
            dispatch(deleteNextSubscriptionItem({ subscriptionId: subscription.id, productId }))
                .then(() => dispatch(fetchSubscription()));
        }
    };

    // ✅ 마지막 제품 삭제 후 구독 해지 진행
    const confirmCancelSubscription = () => {
        if (deleteItemId !== null) {
            dispatch(deleteNextSubscriptionItem({ subscriptionId: subscription.id, productId: deleteItemId }))
                .then(() => {
                    dispatch(cancelSubscription({ subscriptionId: subscription.id }))
                        .then(() => dispatch(fetchSubscription()));
                });
        }
        setConfirmCancel(false);
        setDeleteItemId(null);
    };

    return (
        <Box className="next-subscription-container">
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, display: "flex", justifyContent: "space-between" }}>
                다음 구독 제품 편집
                <Button variant="contained" size="small" onClick={() => setIsModalOpen(true)}>추가하기</Button>
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {nextItems.map((item, index) => {
                const imageUrl = getProductImageUrl(item.productName); // ✅ Redux에서 이미지 URL 가져오기

                return (
                    <Box key={index} className="next-subscription-item">
                        <Grid container spacing={2} alignItems="center">
                            {/* ✅ 제품 이미지 */}
                            <Grid item xs={3}>
                                <img src={imageUrl} alt={item.productName} className="next-subscription-image" />
                            </Grid>

                            <Grid item xs={5} className="next-subscription-info">
                                <Typography className="next-subscription-tag">건강기능식품</Typography>
                                <Typography className="next-subscription-name">{item.productName}</Typography>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                    {[...(item.categories || []), ...(item.ingredients || [])].map((tag, index) => (
                                        <Typography key={index} className="next-subscription-category">
                                            #{tag}
                                        </Typography>
                                    ))}
                                </Box>
                            </Grid>

                            {/* ✅ 가격 & 수량 조절 & 삭제 버튼 */}
                            <Grid item xs={4} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <Typography className="next-subscription-price">
                                    {(item.nextMonthPrice * item.nextMonthQuantity).toLocaleString()}원
                                </Typography>

                                <Box className="next-subscription-quantity">
                                    <IconButton onClick={() => handleQuantityChange(item.productId, Math.max(1, item.nextMonthQuantity - 1))}>-</IconButton>
                                    <span>{item.nextMonthQuantity}</span>
                                    <IconButton onClick={() => handleQuantityChange(item.productId, item.nextMonthQuantity + 1)}>+</IconButton>
                                    <IconButton onClick={() => handleDeleteItem(item.productId)} className="next-subscription-delete">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                );
            })}

            <SubscriptionProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} products={products} selectedItems={nextItems} onSelectProduct={handleSelectProduct} />

            <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
                <DialogTitle>마지막 구독 제품입니다. 구독을 해지하시겠습니까?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmCancel(false)}>취소</Button>
                    <Button onClick={confirmCancelSubscription} autoFocus>확인</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
