import React from "react";
import { useSelector } from "react-redux";

export default function SubscriptionManagement() {
    const { data: subscription, loading, error } = useSelector((state) => state.subscription);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러 발생: {error}</div>;
    if (!subscription || Object.keys(subscription).length === 0) {
        return <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>정기구독 내역이 없습니다.</div>;
    }

    // ✅ 회차 정보 및 가격 계산
    const totalQuantity = subscription.items.reduce((sum, item) => sum + item.quantity, 0);
    const originalTotalPrice = subscription.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountTotalPrice = subscription.discountedTotalPrice || originalTotalPrice * 0.8; // 예제: 20% 할인 적용
    const shippingFee = 3000;
    const discountAmount = originalTotalPrice - discountTotalPrice;
    const finalPrice = discountTotalPrice + shippingFee;

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
            {/* ✅ 상단 구독 정보 */}
            <div style={{ textAlign: "left", marginBottom: "10px" }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>{subscription.lastBillingDate || "없음"}</p>
                <p style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}>
                    {subscription.currentCycle}회차 <span style={{ color: "green" }}>진행중</span> {totalQuantity}건
                </p>
                <p style={{ textAlign: "right", fontSize: "16px", color: "#aaa", textDecoration: "line-through" }}>
                    {originalTotalPrice.toLocaleString()}원
                </p>
                <p style={{ textAlign: "right", fontSize: "20px", fontWeight: "bold", color: "red" }}>
                    {discountTotalPrice.toLocaleString()}원
                </p>
                <p style={{ color: "#888", fontSize: "14px" }}>
                    20%할인 #무료배송 #장기고객우대 5% 건강설문 할인 10%
                </p>
            </div>

            {/* 구분선 */}
            <hr style={{ border: "1px solid #ddd", margin: "15px 0" }} />

            {/* ✅ 구독 제품 목록 */}
            <h3 style={{ borderBottom: "2px solid #ddd", paddingBottom: "5px" }}>구독중인 제품</h3>
            {subscription.items.map((item, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                    {/* 상품 이미지 */}
                    <img
                        src={item.imageUrl || "https://via.placeholder.com/70"}
                        alt={item.productName}
                        style={{ width: "70px", height: "70px", objectFit: "cover", marginRight: "15px" }}
                    />
                    {/* 제품 정보 */}
                    <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: "12px", color: "#555", border: "1px solid #ccc", padding: "2px 5px", display: "inline-block", borderRadius: "3px" }}>
                            건강기능식품
                        </p>
                        <p style={{ fontSize: "16px", fontWeight: "bold", margin: "5px 0" }}>{item.productName}</p>
                        {/* 수량 변경 UI */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <button style={{ padding: "5px", border: "1px solid #ccc", background: "#f9f9f9", cursor: "pointer" }}>-</button>
                            <span style={{ fontSize: "16px", fontWeight: "bold" }}>{item.quantity}개</span>
                            <button style={{ padding: "5px", border: "1px solid #ccc", background: "#f9f9f9", cursor: "pointer" }}>+</button>
                        </div>
                    </div>
                     {/* 가격 정보 */}
                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                        <p style={{ fontSize: "14px", color: "#666" }}>{item.price.toLocaleString()}원 / 개</p>
                        <p style={{ fontSize: "16px", fontWeight: "bold" }}>{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                </div>
            ))}
            {/* ✅ 결제 정보 */}
            <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "5px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#666", fontWeight: "bold" }}>제품 합계 금액</span>
                    <span>{originalTotalPrice.toLocaleString()}원</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#666", fontWeight: "bold" }}>기본 배송비</span>
                    <span>{shippingFee.toLocaleString()}원</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#666", fontWeight: "bold" }}>총 할인금액</span>
                    <span>-{discountAmount.toLocaleString()}원</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #ddd", paddingTop: "10px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>총 결제금액</span>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "red" }}>{finalPrice.toLocaleString()}원</span>
                </div>
            </div>
        </div>
    );
}


import React, { useState }from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchSubscription,
    updateNextSubscriptionItems,
    addNextSubscriptionItem,
    deleteNextSubscriptionItem
} from "@/redux/subscriptionSlice";

export default function SubscriptionManagement() {
    const dispatch = useDispatch();
    const { data: subscription, products, loading, error } = useSelector((state) => state.subscription);
    const [isModalOpen, setIsModalOpen] = useState(false); // ✅ 모달 상태


    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러 발생: {error}</div>;
    if (!subscription || Object.keys(subscription).length === 0) {
        return <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>정기구독 내역이 없습니다.</div>;
    }

    // ✅ 현재 구독 제품 가격 계산
    const totalQuantity = subscription.items.reduce((sum, item) => sum + item.quantity, 0);
    const originalTotalPrice = subscription.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountTotalPrice = subscription.discountedTotalPrice || originalTotalPrice * 0.8; // 예제: 20% 할인 적용

    // ✅ 다음 구독 제품 가격 계산
    const nextTotalQuantity = subscription.nextItems.reduce((sum, item) => sum + item.nextMonthQuantity, 0);
    const nextOriginalTotalPrice = subscription.nextItems.reduce((sum, item) => sum + item.nextMonthPrice * item.nextMonthQuantity, 0);
    const nextDiscountTotalPrice = nextOriginalTotalPrice * 0.8; // 20% 할인 예제
    const shippingFee = 3000;
    const nextDiscountAmount = nextOriginalTotalPrice - nextDiscountTotalPrice;
    const nextFinalPrice = nextDiscountTotalPrice + shippingFee;

    // ✅ 수량 조절 함수
    const handleQuantityChange = (productId, newQuantity) => {
        const updatedItems = subscription.nextItems.map(item =>
            item.productId === productId ? { ...item, nextMonthQuantity: newQuantity } : item
        );

        dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }));
    };

    // ✅ 상품 추가 모달에서 선택한 상품 추가
    const handleSelectProduct = (product) => {
        const existingItem = subscription.nextItems.find(item => item.productId === product.id);

        if (existingItem) {
            // ✅ 이미 있는 상품이면 수량 증가
            handleQuantityChange(product.id, existingItem.nextMonthQuantity + 1);
        } else {
            // ✅ 새 상품 추가
            const newItem = {
                subscriptionId: subscription.id,
                productId: product.id,
                nextMonthQuantity: 1,
                nextMonthPrice: product.price,
            };
            dispatch(addNextSubscriptionItem(newItem));
        }

        // ✅ 모달 닫기
        setIsModalOpen(false);
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
            {/* ✅ 상단 구독 정보 */}
            <div style={{ textAlign: "left", marginBottom: "10px" }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>{subscription.lastBillingDate || "없음"}</p>
                <p style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}>
                    {subscription.currentCycle}회차 <span style={{ color: "green" }}>진행중</span> {totalQuantity}건
                </p>
            </div>

            {/* ✅ 구독중인 제품 */}
            <h3 style={{ borderBottom: "2px solid #ddd", paddingBottom: "5px" }}>구독중인 제품</h3>
            {subscription.items.map((item, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                    <img
                        src={item.imageUrl || "https://via.placeholder.com/70"}
                        alt={item.productName}
                        style={{ width: "70px", height: "70px", objectFit: "cover", marginRight: "15px" }}
                    />
                    <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: "12px", color: "#555", border: "1px solid #ccc", padding: "2px 5px", display: "inline-block", borderRadius: "3px" }}>
                            건강기능식품
                        </p>
                        <p style={{ fontSize: "16px", fontWeight: "bold", margin: "5px 0" }}>{item.productName}</p>
                        <p style={{ fontSize: "12px", color: "#888" }}>{item.quantity}개</p>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                        <p style={{ fontSize: "14px", color: "#666" }}>{item.price.toLocaleString()}원 / 개</p>
                        <p style={{ fontSize: "16px", fontWeight: "bold" }}>{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                </div>
            ))}

            {/* ✅ 구독 중인 제품 총 결제금액 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>정기결제 제품 총 결제금액</span>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "16px", color: "#aaa", textDecoration: "line-through", marginBottom: "5px" }}>
                        {originalTotalPrice.toLocaleString()}원
                    </p>
                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "red" }}>
                        {discountTotalPrice.toLocaleString()}원
                    </p>
                </div>
            </div>

            {/* ✅ 할인 정보 */}
            <p style={{ color: "#888", fontSize: "14px", marginTop: "10px" }}>
                20%할인 #무료배송 #장기고객우대 5% 건강설문 할인 10%
            </p>

            {/* ✅ 구분선 */}
            <hr style={{ border: "1px solid #ddd", margin: "15px 0" }} />

        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
            {/* ✅ 다음 구독 제품 편집 */}
            <h3 style={{ borderBottom: "2px solid #ddd", paddingBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                다음 구독 제품 편집
                <button onClick={() => setIsModalOpen(true)}>추가하기</button>
            </h3>
            {subscription.nextItems.map((item, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                    <img src={item.imageUrl || "https://via.placeholder.com/70"} alt={item.productName}
                        style={{ width: "70px", height: "70px", objectFit: "cover", marginRight: "15px" }} />
                    <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: "16px", fontWeight: "bold", margin: "5px 0" }}>{item.productName}</p>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                        <button onClick={() => handleQuantityChange(item.productId, Math.max(1, item.nextMonthQuantity - 1))}>-</button>
                        <span style={{ margin: "0 10px" }}>{item.nextMonthQuantity}</span>
                        <button onClick={() => handleQuantityChange(item.productId, item.nextMonthQuantity + 1)}>+</button>
                        <p>{(item.nextMonthPrice * item.nextMonthQuantity).toLocaleString()}원</p>
                        <button onClick={() => dispatch(deleteNextSubscriptionItem({ subscriptionId: subscription.id, productId: item.productId }))}>
                            삭제
                        </button>
                    </div>
                </div>
            ))}

            {/* ✅ 다음 구독 제품 결제 정보 */}
            <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "5px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#666", fontWeight: "bold" }}>제품 합계 금액</span>
                    <span>{nextOriginalTotalPrice.toLocaleString()}원</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#666", fontWeight: "bold" }}>기본 배송비</span>
                    <span>{shippingFee.toLocaleString()}원</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#666", fontWeight: "bold" }}>총 할인금액</span>
                    <span>-{nextDiscountAmount.toLocaleString()}원</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #ddd", paddingTop: "10px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>총 결제금액</span>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "red" }}>{nextFinalPrice.toLocaleString()}원</span>
                </div>
            </div>
            {/* ✅ 상품 추가 모달 */}
            {isModalOpen && (
                <div style={{
                    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
                    maxHeight: "80vh", overflowY: "auto"
                }}>
                    <h2>상품 선택</h2>
                    {products.map((product) => (
                        <div key={product.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <div>
                                <p>{product.name}</p>
                                <p>{product.price.toLocaleString()}원</p>
                            </div>
                            <button onClick={() => handleSelectProduct(product)}>선택</button>
                        </div>
                    ))}
                    <button onClick={() => setIsModalOpen(false)}>닫기</button>
                </div>
            )}
        </div>






            {/* ✅ 다음 구독 제품 총 결제금액 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>다음 구독 제품 총 결제금액</span>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "16px", color: "#aaa", textDecoration: "line-through", marginBottom: "5px" }}>
                        {nextOriginalTotalPrice.toLocaleString()}원
                    </p>
                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "red" }}>
                        {nextDiscountTotalPrice.toLocaleString()}원
                    </p>
                </div>
            </div>
        </div>
    );
}

