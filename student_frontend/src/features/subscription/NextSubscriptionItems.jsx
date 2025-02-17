import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    addNextSubscriptionItem,
    deleteNextSubscriptionItem,
    updateNextSubscriptionItems,
    fetchSubscription,
    cancelSubscription
} from "@/store/subscriptionSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Button, Box, Typography, Divider, Grid, Dialog, DialogTitle, DialogActions } from "@mui/material";
import SubscriptionProductModal from "@/features/modal/SubscriptionProductModal"; // ✅ 모달 컴포넌트 추가

export default function NextSubscriptionItems({ subscription, products }) {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nextItems, setNextItems] = useState(subscription.nextItems || []);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);

    useEffect(() => {
        setNextItems(subscription.nextItems || []);
    }, [subscription.nextItems]);

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
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, display: "flex", justifyContent: "space-between" }}>
                다음 구독 제품 편집
                <Button variant="contained" size="small" onClick={() => setIsModalOpen(true)}>추가하기</Button>
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {nextItems.map((item, index) => (
                <Box key={index} sx={{ mb: 2, borderBottom: "1px solid #eee", pb: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* ✅ 제품 이미지 */}
                        <Grid item xs={3}>
                            <img
                                src={item.imageUrl || "https://via.placeholder.com/70"}
                                alt={item.productName}
                                style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "5px" }}
                            />
                        </Grid>

                        {/* ✅ 제품 정보 */}
                        <Grid item xs={5}>
                            {/* ✅ 건강기능식품 태그 (제품명 위) */}
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "12px",
                                    color: "#555",
                                    border: "1px solid #ccc",
                                    padding: "2px 5px",
                                    display: "inline-block",
                                    borderRadius: "3px",
                                    mb: 0.5, // ✅ 아래 간격 조정
                                }}
                            >
                                건강기능식품
                            </Typography>

                            {/* ✅ 제품명 */}
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                {item.productName}
                            </Typography>

                            {/* ✅ 카테고리 태그 (제품명 아래) - 모달 코드 참고해서 적용 */}
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                {[...(item.categories || []), ...(item.ingredients || [])].map((tag, index) => (
                                    <Typography
                                        key={index}
                                        variant="body2"
                                        sx={{
                                            fontSize: "12px",
                                            color: "#666",
                                            background: "#f0f0f0",
                                            padding: "3px 6px",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        #{tag}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>

                        {/* ✅ 가격 & 수량 조절 & 삭제 버튼 */}
                        <Grid item xs={4} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            {/* ✅ 가격 (제품 가격 * 수량) */}
                            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                                {(item.nextMonthPrice * item.nextMonthQuantity).toLocaleString()}원
                            </Typography>

                            {/* ✅ 수량 조절 & 삭제 버튼 */}
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <IconButton onClick={() => handleQuantityChange(item.productId, Math.max(1, item.nextMonthQuantity - 1))}>
                                    -
                                </IconButton>
                                <span style={{ margin: "0 10px" }}>{item.nextMonthQuantity}</span>
                                <IconButton onClick={() => handleQuantityChange(item.productId, item.nextMonthQuantity + 1)}>
                                    +
                                </IconButton>
                                <IconButton onClick={() => handleDeleteItem(item.productId)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

            ))}

            {/* ✅ 모달 추가 */}
            <SubscriptionProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                products={products}
                selectedItems={nextItems}
                onSelectProduct={handleSelectProduct}
            />

            {/* ✅ 구독 해지 알림 다이얼로그 */}
            <Dialog
                open={confirmCancel}
                onClose={() => setConfirmCancel(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"마지막 구독 제품입니다. 구독을 해지하시겠습니까?"}</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmCancel(false)}>취소</Button>
                    <Button onClick={confirmCancelSubscription} autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
