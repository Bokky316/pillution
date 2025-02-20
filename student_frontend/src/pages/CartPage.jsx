import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CartItem from "@/features/cart/CartItem";
import CartSummary from "@/features/cart/CartSummary";
import TotalPaymentSummary from "@/features/cart/TotalPaymentSummary";
import {
    fetchCartItems,
    updateCartItem,
    removeCartItem,
    selectCartItem,
    selectAllCartItems,
} from "@/store/cartSlice";
import { createOrder } from "@/store/orderSlice";
import { fetchMerchantId, processPayment } from "@/store/paymentSlice";
import "@/styles/CartPage.css";
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import { API_URL } from "@/utils/constants";
import { Box, Button, Typography, Divider } from '@mui/material';
import { blue } from '@mui/material/colors';

/**
 * @component CartPage
 * @description 장바구니 페이지
 */
const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: cartItemsFromStore, status, error } = useSelector((state) => state.cart);
    const [cartItems, setCartItems] = useState([]);
    const [selectAll, setSelectAll] = useState(true);
    const [selectedPurchaseType, setSelectedPurchaseType] = useState("subscription");
    const { user } = useSelector((state) => state.auth);
    const { merchantId } = useSelector((state) => state.payment);

    /**
     * @useEffect
     * @description 컴포넌트 마운트 시 장바구니 아이템을 가져옵니다.
     */
    useEffect(() => {
        dispatch(fetchCartItems());
    }, [dispatch]);

    /**
     * @useEffect
     * @description Redux 스토어의 장바구니 아이템이 변경될 때마다 로컬 상태를 업데이트합니다.
     */
    useEffect(() => {
        const initialCartItems = cartItemsFromStore.map(item => ({
            ...item,
            selected: true
        }));
        setCartItems(initialCartItems);
    }, [cartItemsFromStore]);

    /**
     * @function handleSelectAll
     * @description 전체 선택/해제 버튼 클릭 시 호출되는 함수
     */
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setCartItems(prevItems => prevItems.map(item => ({ ...item, selected: newSelectAll })));
    };

    /**
     * @function handleItemSelect
     * @param {number} cartItemId - 선택/해제할 장바구니 아이템 ID
     * @description 개별 장바구니 아이템 선택/해제 시 호출되는 함수
     */
    const handleItemSelect = (cartItemId) => {
        setCartItems(prevItems => prevItems.map(item =>
            item.cartItemId === cartItemId ? { ...item, selected: !item.selected } : item
        ));
    };

    /**
     * @function handleQuantityChange
     * @param {number} cartItemId - 수량을 변경할 장바구니 아이템 ID
     * @param {number} change - 변경할 수량 (+1 또는 -1)
     * @description 장바구니 아이템 수량 변경 시 호출되는 함수
     */
    const handleQuantityChange = async (cartItemId, change) => {
        const item = cartItems.find((item) => item.cartItemId === cartItemId);
        if (item) {
            const newQuantity = Math.max(1, item.quantity + change);
            try {
                await dispatch(updateCartItem({ cartItemId, count: newQuantity })).unwrap();
                dispatch(fetchCartItems());
            } catch (error) {
                console.error("Failed to update cart item:", error);
            }
        }
    };

    /**
     * @function handleRemoveItem
     * @param {number} id - 삭제할 장바구니 아이템 ID
     * @description 장바구니 아이템 삭제 시 호출되는 함수
     */
    const handleRemoveItem = (id) => {
        dispatch(removeCartItem(id));
    };

    /**
     * @function handleRemoveSelectedItems
     * @description 선택된 장바구니 아이템 삭제 시 호출되는 함수
     */
    const handleRemoveSelectedItems = () => {
        const selectedItemIds = cartItems.filter(item => item.selected).map(item => item.cartItemId);
        selectedItemIds.forEach(id => dispatch(removeCartItem(id)));
    };

    /**
     * @function handlePurchaseTypeSelect
     * @param {string} type - 선택된 구매 유형 ("subscription" 또는 "oneTime")
     * @description 구매 유형 선택 시 호출되는 함수
     */
    const handlePurchaseTypeSelect = (type) => {
        setSelectedPurchaseType(type);
    };

    /**
     * @function calculateTotal
     * @param {Array} items - 장바구니 아이템 목록
     * @param {string} type - 구매 유형 ("subscription" 또는 "oneTime")
     * @returns {object} - 총 가격, 배송비, 할인, 최종 가격 정보
     * @description 총 가격을 계산하는 함수
     */
    const calculateTotal = (items, type) => {
        let totalPrice = 0;
        let shippingFee = 0;
        let discount = 0;

        items.forEach(item => {
            if (item.selected) {
                totalPrice += item.price * item.quantity;
            }
        });

        if (type === 'oneTime') {
            shippingFee = totalPrice >= 30000 ? 0 : 3000;
        } else if (type === 'subscription') {
            if (totalPrice >= 30000) {
                discount = 3000;
            }
            shippingFee = totalPrice >= 10000 ? 0 : 3000;
        }

        const finalPrice = totalPrice - discount + shippingFee;

        return { totalPrice, shippingFee, discount, finalPrice };
    };

    /**
     * @function handleCheckout
     * @description 결제하기 버튼 클릭 시 호출되는 함수
     */
    const handleCheckout = async () => {
        if (selectedPurchaseType) {
            try {
                console.log("CartPage - handleCheckout 시작");

                const selectedCartItems = cartItems.filter((item) => item.selected);

                if (selectedCartItems.length === 0) {
                    alert("선택된 상품이 없습니다.");
                    return;
                }

                // 필수 정보(name, email)만 확인
                if (!user || !user.name || !user.email) {
                    alert("사용자 이름과 이메일을 확인해주세요.");
                    return;
                }

                const { finalPrice } = calculateTotal(selectedCartItems, selectedPurchaseType);

                // 사용자 정보를 결제 페이지로 전달
                navigate('/order-detail', {
                    state: {
                        selectedItems: selectedCartItems.map(item => ({
                            cartItemId: item.cartItemId,
                            productId: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            imageUrl: item.imageUrl
                        })),
                        purchaseType: selectedPurchaseType,
                        totalAmount: finalPrice,
                        user: {
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            postalCode: user.postalCode,
                            roadAddress: user.roadAddress,
                            detailAddress: user.detailAddress
                        },
                    }
                });
            } catch (error) {
                console.error("CartPage - 주문 준비 중 오류:", error);
                alert("주문 준비 중 오류가 발생했습니다: " + error);
            }
        } else {
            alert("구매 유형을 선택해주세요.");
        }
    };

    const { finalPrice } = calculateTotal(cartItems, selectedPurchaseType);

    return (
        <div className="cart-page">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 2 }}>
                    장바구니
                </Typography>
            </Box>
            <main className="cart-container">
                <section className="cart-items">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Button
                            onClick={handleSelectAll}
                            sx={{
                                color: blue[700],
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            {selectAll ? "전체 선택 해제" : "전체 선택"}
                        </Button>
                        <Button
                            onClick={handleRemoveSelectedItems}
                            sx={{
                                color: blue[700],
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            선택 삭제
                        </Button>
                    </Box>
                    <Divider />
                    {cartItems.length === 0 ? (
                        <div className="empty-cart-message">장바구니가 비어 있습니다.</div>
                    ) : (
                        cartItems.map((item) => (
                            <CartItem
                                key={item.cartItemId}
                                item={item}
                                onSelect={handleItemSelect}
                                onQuantityChange={handleQuantityChange}
                                onRemove={handleRemoveItem}
                            />
                        ))
                    )}
                </section>
                <TotalPaymentSummary
                    cartItems={cartItems}
                    purchaseType={selectedPurchaseType}
                />
                <div className="purchase-type-selection">
                    <CartSummary
                        cartItems={cartItems}
                        purchaseType="subscription"
                        isSelected={selectedPurchaseType === "subscription"}
                        onSelect={() => handlePurchaseTypeSelect("subscription")}
                    />
                    <CartSummary
                        cartItems={cartItems}
                        purchaseType="oneTime"
                        isSelected={selectedPurchaseType === "oneTime"}
                        onSelect={() => handlePurchaseTypeSelect("oneTime")}
                    />
                </div>
                 <Box sx={{
                    position: 'sticky',
                    bottom: '20px',
                    bgcolor: 'transparent',
                    padding:0
                }}>
                    <button
                        className="checkout-btn"
                        onClick={handleCheckout}
                        disabled={!selectedPurchaseType}
                        style={{
                            backgroundColor: selectedPurchaseType === "oneTime" ? '#333' : undefined,
                        }}
                    >
                        {`${finalPrice?.toLocaleString()} 원 | ${selectedPurchaseType === "subscription" ? "정기구독 시작" : "한 번만 구매"}`}
                    </button>
                </Box>
                <div className="subscription-benefits">
                    <h4>정기 구독 혜택</h4>
                    <ul>
                        <li>3만원 이상 구매 시 3,000원 할인</li>
                        <li>1만원 이상 구매 시 무료 배송</li>
                    </ul>
                </div>
            </main>

        </div>
    );
};

export default CartPage;
