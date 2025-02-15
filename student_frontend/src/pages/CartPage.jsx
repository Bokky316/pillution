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
    orderCartItems,
} from "@/store/cartSlice";
import "@/styles/CartPage.css";
import { useNavigate } from 'react-router-dom'; // useNavigate 추가

/**
 * 장바구니 페이지 컴포넌트
 * 장바구니 아이템 목록을 표시하고 관리하는 기능을 제공합니다.
 * @returns {JSX.Element} 장바구니 페이지 컴포넌트
 */
const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // useNavigate 훅 사용
    const { items: cartItems, status, error } = useSelector((state) => state.cart);
    const [selectAll, setSelectAll] = React.useState(true); // 초기값을 true로 변경
    const [selectedPurchaseType, setSelectedPurchaseType] = React.useState("subscription"); // 기본값을 subscription으로 설정

    /**
     * 컴포넌트 마운트 시 장바구니 아이템을 불러옵니다.
     */
    React.useEffect(() => {
        console.log("fetchCartItems 디스패치됨");
        dispatch(fetchCartItems());
    }, [dispatch]);

    /**
     * 컴포넌트 마운트 시 전체 선택 액션을 디스패치합니다.
     */
    useEffect(() => {
        dispatch(selectAllCartItems(true)); // 컴포넌트 마운트 시 전체 선택
    }, [dispatch]);

    /**
     * 장바구니 아이템의 선택 상태에 따라 전체 선택 상태를 업데이트합니다.
     */
    React.useEffect(() => {
        const allSelected = cartItems.every((item) => item.selected);
        setSelectAll(allSelected);
    }, [cartItems]);

    /**
     * 전체 선택/해제 처리 함수
     */
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        dispatch(selectAllCartItems(newSelectAll));
    };

    /**
     * 개별 아이템 선택/해제 처리 함수
     * @param {number} cartItemId - 장바구니 아이템 ID
     */
    const handleItemSelect = (cartItemId) => {
        const item = cartItems.find((item) => item.cartItemId === cartItemId);
        if (item) {
            dispatch(selectCartItem({ cartItemId, selected: !item.selected }));
        }
    };

    /**
     * 아이템 수량 변경 처리 함수
     * @param {number} cartItemId - 장바구니 아이템 ID
     * @param {number} change - 변경할 수량
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
     * 아이템 제거 처리 함수
     * @param {number} id - 장바구니 아이템 ID
     */
    const handleRemoveItem = (id) => {
        dispatch(removeCartItem(id));
    };

    /**
     * 구매 유형 선택 처리 함수
     * @param {string} type - 선택된 구매 유형 ("oneTime" 또는 "subscription")
     */
    const handlePurchaseTypeSelect = (type) => {
        setSelectedPurchaseType(type);
    };

    /**
     * 결제 처리 함수
     */
    const handleCheckout = async () => {
        if (selectedPurchaseType) {
            // 선택된 상품만 필터링
            const selectedCartItems = cartItems.filter((item) => item.selected);

            if (selectedCartItems.length === 0) {
                alert("선택된 상품이 없습니다.");
                return;
            }

            const cartOrderRequestDto = {
                cartOrderItems: selectedCartItems.map((item) => ({
                    cartItemId: item.cartItemId,
                    quantity: item.quantity,
                })),
            };

            try {
                // orderCartItems 액션을 디스패치하고 결과를 기다림
                const orderId = await dispatch(
                    orderCartItems({ cartOrderRequestDto: cartOrderRequestDto, purchaseType: selectedPurchaseType })
                ).unwrap();

                // 주문 성공 후, 결제 페이지로 리디렉션
                navigate(`/order/${orderId}`); // navigate 함수를 사용하여 페이지 이동
            } catch (error) {
                // 오류 처리
                console.error("Failed to order cart items:", error);
                // 필요에 따라 사용자에게 오류 메시지를 표시
                alert("주문 실패: " + error);
            }
        } else {
            alert("구매 유형을 선택해주세요.");
        }
    };

    if (status === "loading") return React.createElement("div", null, "Loading...");
    if (status === "failed") return React.createElement("div", null, "Error: ", error);

    return (
        React.createElement("div", { className: "cart-page" },
            React.createElement("h2", null, "CART"),
            React.createElement("main", { className: "cart-container" },
                React.createElement("section", { className: "cart-items" },
                    React.createElement("div", { className: "select-all-container" },
                        React.createElement("input", {
                            type: "checkbox",
                            id: "select-all",
                            checked: selectAll,
                            onChange: handleSelectAll,
                        }),
                        React.createElement("label", { htmlFor: "select-all", className: "checkbox-label" }, "전체 선택")
                    ),
                    cartItems.length === 0
                        ? React.createElement("div", { className: "empty-cart-message" }, "장바구니가 비어 있습니다.")
                        : cartItems.map((item) => (
                            React.createElement(CartItem, {
                                key: item.cartItemId,
                                item: item,
                                onSelect: () => handleItemSelect(item.cartItemId),
                                onQuantityChange: handleQuantityChange,
                                onRemove: handleRemoveItem,
                            })
                        ))
                ),
                React.createElement("div", { className: "purchase-type-selection" },
                    React.createElement(CartSummary, {
                        cartItems: cartItems,
                        purchaseType: "subscription",
                        isSelected: selectedPurchaseType === "subscription",
                        onSelect: () => handlePurchaseTypeSelect("subscription"),
                    }),
                    React.createElement(CartSummary, {
                        cartItems: cartItems,
                        purchaseType: "oneTime",
                        isSelected: selectedPurchaseType === "oneTime",
                        onSelect: () => handlePurchaseTypeSelect("oneTime"),
                    })
                ),
                React.createElement(TotalPaymentSummary, {
                    cartItems: cartItems,
                    purchaseType: selectedPurchaseType,
                }),
                React.createElement("div", { className: "subscription-benefits" },
                    React.createElement("h4", null, "정기 구독 혜택"),
                    React.createElement("ul", null,
                        React.createElement("li", null, "3만원 이상 구매 시 3,000원 할인"),
                        React.createElement("li", null, "1만원 이상 구매 시 무료 배송")
                    )
                ),
                React.createElement("button", {
                    className: "checkout-btn",
                    onClick: handleCheckout,
                    disabled: !selectedPurchaseType,
                }, "결제하기")
            )
        )
    );
};

export default CartPage;
