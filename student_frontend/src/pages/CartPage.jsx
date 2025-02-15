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
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
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
     * 결제 처리 함수
     * 선택된 아이템에 대해 주문을 생성하고 결제를 진행합니다.
     */
    const handleCheckout = async () => {
        if (selectedPurchaseType) {
            const selectedCartItems = cartItems.filter((item) => item.selected);

            if (selectedCartItems.length === 0) {
                alert("선택된 상품이 없습니다.");
                return;
            }

            if (!user || !user.name || !user.email || !user.phone || !user.address) {
                alert("사용자 정보를 확인해주세요.");
                return;
            }

            const cartOrderRequestDto = {
                cartOrderItems: selectedCartItems.map((item) => ({
                    cartItemId: item.cartItemId,
                    quantity: item.quantity,
                })),
                buyerName: user.name,
                buyerEmail: user.email,
                buyerTel: user.phone,
                buyerAddr: user.address,
            };

            try {
                // fetchWithAuth를 사용하여 백엔드 API 호출
                const response = await fetchWithAuth(
                    `${API_URL}orders?purchaseType=${selectedPurchaseType}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cartOrderRequestDto),
                    }
                );

                if (!response.ok) {
                    console.error("주문 생성 실패:", response.status, response.statusText);
                    throw new Error(`주문 생성 실패: ${response.status} - ${response.statusText}`);
                }

                const order = await response.json();

                // 결제 데이터 준비
                const paymentData = {
                    amount: selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    customer_email: user.email,
                    currency: 'KRW',
                    tx_ref: order.id,
                };

                // Flutterwave 결제 처리
                handleFlutterPayment({
                    callback: (response) => {
                        console.log(response);
                        closePaymentModal();
                        navigate(`/order/${order.id}`);
                    },
                    onClose: () => {
                        console.log("결제창이 닫혔습니다.");
                    },
                });

            } catch (error) {
                console.error("Failed to order cart items:", error);
                alert("주문 실패: " + error);
            }
        } else {
            alert("구매 유형을 선택해주세요.");
        }
    };

    // Flutterwave 결제 설정
    const config = {
        public_key: 'FLWPUBK_TESTXXXXXXXXXXXXXXXXXXXXXXXXX',
        tx_ref: Date.now(),
        amount: cartItems.reduce((sum, item) => sum + (item.selected ? item.price * item.quantity : 0), 0),
        currency: 'KRW',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: user?.email || 'user@gmail.com',
            phone_number: user?.phone || '08102909304',
            name: user?.name || 'john doe',
        },
        customizations: {
            title: 'My Store',
            description: 'Payment for items in cart',
            logo: 'https://flutterwave.com/images/logo-colored.svg',
        },
    };

    const handleFlutterPayment = useFlutterwave(config);

    if (status === "loading") return <div>Loading...</div>;
    if (status === "failed") return <div>Error: {error}</div>;

    return (
        <div className="cart-page">
            <h2>CART</h2>
            <main className="cart-container">
                <section className="cart-items">
                    <div className="select-all-container">
                        <input
                            type="checkbox"
                            id="select-all"
                            checked={selectAll}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="checkbox-label">전체 선택</label>
                    </div>
                    {cartItems.length === 0 ? (
                        <div className="empty-cart-message">장바구니가 비어 있습니다.</div>
                    ) : (
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
