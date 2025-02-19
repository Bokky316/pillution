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

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: cartItemsFromStore, status, error } = useSelector((state) => state.cart);
    const [cartItems, setCartItems] = useState([]);
    const [selectAll, setSelectAll] = useState(true);
    const [selectedPurchaseType, setSelectedPurchaseType] = useState("subscription");
    const { user } = useSelector((state) => state.auth);
    const { merchantId } = useSelector((state) => state.payment);

    useEffect(() => {
        dispatch(fetchCartItems());
    }, [dispatch]);

    useEffect(() => {
        const initialCartItems = cartItemsFromStore.map(item => ({
            ...item,
            selected: true
        }));
        setCartItems(initialCartItems);
    }, [cartItemsFromStore]);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setCartItems(prevItems => prevItems.map(item => ({ ...item, selected: newSelectAll })));
    };

    const handleItemSelect = (cartItemId) => {
        setCartItems(prevItems => prevItems.map(item =>
            item.cartItemId === cartItemId ? { ...item, selected: !item.selected } : item
        ));
    };

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

    const handleRemoveItem = (id) => {
        dispatch(removeCartItem(id));
    };

    const handleRemoveSelectedItems = () => {
        const selectedItemIds = cartItems.filter(item => item.selected).map(item => item.cartItemId);
        selectedItemIds.forEach(id => dispatch(removeCartItem(id)));
    };

    const handlePurchaseTypeSelect = (type) => {
        setSelectedPurchaseType(type);
    };

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

    const handleCheckout = async () => {
        if (selectedPurchaseType) {
            try {
                console.log("CartPage - handleCheckout 시작");
                await dispatch(fetchCartItems());

                const selectedCartItems = cartItems.filter((item) => item.selected);

                if (selectedCartItems.length === 0) {
                    alert("선택된 상품이 없습니다.");
                    return;
                }

                if (!user || !user.name || !user.email || !user.phone || !user.postalCode || !user.roadAddress || !user.detailAddress) {
                    alert("사용자 정보를 확인해주세요.");
                    return;
                }

                const { finalPrice } = calculateTotal(selectedCartItems, selectedPurchaseType);

                const orderData = {
                    cartOrderItems: selectedCartItems.map(item => ({
                        cartItemId: item.cartItemId,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    buyerName: user.name,
                    buyerEmail: user.email,
                    buyerTel: user.phone,
                    buyerAddr: user.roadAddress + " " + user.detailAddress,
                    buyerPostcode: user.postalCode,
                };

                console.log("CartPage - createOrder 액션 디스패치:", { orderData, purchaseType: selectedPurchaseType });

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

    return (
        <div className="cart-page">
            <h2>CART</h2>
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
                <div className="subscription-benefits">
                    <h4>정기 구독 혜택</h4>
                    <ul>
                        <li>3만원 이상 구매 시 3,000원 할인</li>
                        <li>1만원 이상 구매 시 무료 배송</li>
                    </ul>
                </div>
                <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={!selectedPurchaseType}
                >
                    결제하기
                </button>
            </main>
        </div>
    );
};

export default CartPage;
