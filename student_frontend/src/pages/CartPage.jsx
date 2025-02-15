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

/**
 * 장바구니 페이지 컴포넌트
 * 장바구니 아이템 목록을 표시하고 관리하는 기능을 제공합니다.
 * 사용자는 아이템을 선택, 수량 변경, 삭제할 수 있으며, 구매 유형을 선택하고 결제를 진행할 수 있습니다.
 * @returns {JSX.Element} 장바구니 페이지 컴포넌트
 */
const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Redux 스토어에서 장바구니 아이템, 상태, 오류 정보를 가져옵니다.
    const { items: cartItems, status, error } = useSelector((state) => state.cart);
    // 전체 선택 상태를 관리합니다. 초기값은 true입니다.
    const [selectAll, setSelectAll] = useState(true);
    // 선택된 구매 유형을 관리합니다. 초기값은 "subscription"입니다.
    const [selectedPurchaseType, setSelectedPurchaseType] = useState("subscription");
    // Redux 스토어에서 사용자 정보를 가져옵니다.
    const { user } = useSelector((state) => state.auth);
    // Redux 스토어에서 가맹점 ID를 가져옵니다.
    const { merchantId } = useSelector((state) => state.payment);

    /**
     * 컴포넌트 마운트 시 장바구니 아이템을 불러옵니다.
     */
    useEffect(() => {
        console.log("fetchCartItems 디스패치됨");
        dispatch(fetchCartItems());
    }, [dispatch]);

    /**
     * 컴포넌트 마운트 시 전체 선택 액션을 디스패치합니다.
     */
    useEffect(() => {
        dispatch(selectAllCartItems(true));
    }, [dispatch]);

    /**
     * 장바구니 아이템의 선택 상태에 따라 전체 선택 상태를 업데이트합니다.
     */
    useEffect(() => {
        const allSelected = cartItems.every((item) => item.selected);
        setSelectAll(allSelected);
    }, [cartItems]);

    /**
     * 전체 선택/해제 처리 함수
     * 모든 장바구니 아이템의 선택 상태를 변경합니다.
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
     * @param {number} change - 변경할 수량 (증가: 1, 감소: -1)
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

   const calculateTotal = (items, type) => {
        let totalPrice = 0;
        let shippingFee = 0;
        let discount = 0;

        items.forEach(item => {
            totalPrice += item.price * item.quantity;
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
 * 장바구니에서 선택한 상품으로 주문 페이지로 이동하는 함수
 * @async
 */
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

            if (!user || !user.name || !user.email || !user.phone || !user.address) {
                alert("사용자 정보를 확인해주세요.");
                return;
            }

            const {finalPrice} = calculateTotal(selectedCartItems, selectedPurchaseType);

            // navigate 전에 orderData 정의
            const orderData = {
                cartOrderItems: selectedCartItems.map(item => ({
                    cartItemId: item.cartItemId,
                    quantity: item.quantity,
                    price: item.price
                })),
                buyerName: user.name,
                buyerEmail: user.email,
                buyerTel: user.phone,
                buyerAddr: user.address, // 주소를 buyerAddr로 설정
                // 우편번호를 추가해야 함
            };

            console.log("CartPage - createOrder 액션 디스패치:", { orderData, purchaseType: selectedPurchaseType });
            await dispatch(createOrder({ orderData: orderData, purchaseType: selectedPurchaseType })).unwrap();
            console.log("CartPage - createOrder 액션 디스패치 완료");

            navigate('/order-detail', {
                state: {
                    selectedItems: selectedCartItems.map(item => ({
                        cartItemId: item.cartItemId,
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        imageUrl: item.imageUrl // 백엔드에서 제공하는 이미지 URL 사용
                    })),
                    purchaseType: selectedPurchaseType,
                    totalAmount: finalPrice,
                    user: {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address
                    }
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

    /**
     * 렌더링 함수
     * @returns {JSX.Element}
     */
    return (
        <>
        {/* 장바구니 페이지 전체 컨테이너 */}
        <div className="cart-page">
            {/* 페이지 제목 */}
            <h2>CART</h2>
            {/* 장바구니 내용 컨테이너 */}
            <main className="cart-container">
                {/* 장바구니 아이템 목록 섹션 */}
                <section className="cart-items">
                    {/* 전체 선택 체크박스 컨테이너 */}
                    <div className="select-all-container">
                        <input
                            type="checkbox"
                            id="select-all"
                            checked={selectAll}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="checkbox-label">전체 선택</label>
                    </div>
                    {/* 장바구니 아이템이 없는 경우 메시지 표시 */}
                    {cartItems.length === 0 ? (
                        <div className="empty-cart-message">장바구니가 비어 있습니다.</div>
                    ) : (
                        // 장바구니 아이템 목록 표시
                        cartItems.map((item) => (
                            <CartItem
                                key={item.cartItemId}
                                item={item}
                                onSelect={() => handleItemSelect(item.cartItemId)}
                                onQuantityChange={handleQuantityChange}
                                onRemove={handleRemoveItem}
                            />
                        ))
                    )}
                </section>
                {/* 총 결제 금액 요약 정보 표시 */}
                <TotalPaymentSummary
                    cartItems={cartItems}
                    purchaseType={selectedPurchaseType}
                />
                {/* 구매 유형 선택 섹션 */}
                <div className="purchase-type-selection">
                    {/* 정기 구독 구매 유형 선택 */}
                    <CartSummary
                        cartItems={cartItems}
                        purchaseType="subscription"
                        isSelected={selectedPurchaseType === "subscription"}
                        onSelect={() => handlePurchaseTypeSelect("subscription")}
                    />
                    {/* 일회성 구매 유형 선택 */}
                    <CartSummary
                        cartItems={cartItems}
                        purchaseType="oneTime"
                        isSelected={selectedPurchaseType === "oneTime"}
                        onSelect={() => handlePurchaseTypeSelect("oneTime")}
                    />
                </div>
                {/* 정기 구독 혜택 정보 표시 */}
                <div className="subscription-benefits">
                    <h4>정기 구독 혜택</h4>
                    <ul>
                        <li>3만원 이상 구매 시 3,000원 할인</li>
                        <li>1만원 이상 구매 시 무료 배송</li>
                    </ul>
                </div>
                {/* 결제하기 버튼 */}
                <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={!selectedPurchaseType}
                >
                    결제하기
                </button>
            </main>
        </div>
        </>
    );
};

export default CartPage;
