import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchSubscription,
    updateSubscription,
    cancelSubscription,
    updateNextSubscriptionItems,
    processSubscriptionBilling,
    fetchProducts,
    setSelectedProduct,
    setSelectedQuantity,
} from "@/redux/subscriptionSlice";

export default function SubscriptionManagement() {
    const dispatch = useDispatch();
    const {
        data: subscription,
        loading,
        error,
        products,
        selectedProduct,
        selectedQuantity,
    } = useSelector((state) => state.subscription);

    useEffect(() => {
        console.log("🔍 useEffect 실행됨");
        dispatch(fetchSubscription());
        dispatch(fetchProducts()); // ✅ 상품 리스트 불러오기
    }, [dispatch]);

    useEffect(() => {
        console.log("📌 Redux 상태 확인:", { subscription, loading, error });
    }, [subscription, loading, error]);

    const handleAddProduct = () => {
        if (!selectedProduct || selectedQuantity <= 0) return;

        const newItem = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            nextMonthQuantity: selectedQuantity,
            nextMonthPrice: selectedProduct.price * selectedQuantity,
        };

        const updatedItems = [...(subscription.nextItems || []), newItem]; // ✅ nextItems가 undefined일 경우 대비
        dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }));
    };

    const handleDeleteItem = (index) => {
        const updatedItems = subscription.nextItems?.filter((_, i) => i !== index) || []; // ✅ nextItems가 undefined일 경우 대비
        dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }));
    };

    const handleUpdateSubscription = () => {
        const updatedData = {
            subscriptionId: subscription.id,
            paymentMethod: subscription.paymentMethod,
            nextBillingDate: subscription.nextBillingDate,
            deliveryAddress: subscription.deliveryAddress
        };
        dispatch(updateSubscription(updatedData));
    };

    const handleCancelSubscription = () => {
        dispatch(cancelSubscription(subscription.id));
    };

    const handleUpdateNextItems = () => {
        dispatch(updateNextSubscriptionItems({
            subscriptionId: subscription.id,
            updatedItems: subscription.nextItems || [], // ✅ nextItems가 undefined일 경우 대비
        }));
    };

    const handleProcessBilling = () => {
        if (!subscription?.id) {
            console.error("❌ 구독 정보가 없음: processSubscriptionBilling 실행 불가");
            return;
        }
        dispatch(processSubscriptionBilling(subscription.id));
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러 발생: {error}</div>;
    if (!subscription || Object.keys(subscription).length === 0) {
        return <div>구독 정보가 없습니다.</div>;  // 예외 처리 추가
    }

    return (
        <div>
            <h2>정기구독 관리</h2>
            <p>최근 결제일: {subscription.lastBillingDate || "없음"}</p>
            <p>회차 정보: {subscription.currentCycle}회차</p>

            <h3>구독중인 제품</h3>
            {subscription.items.map((item, index) => (
                <div key={index}>
                    <span>{item.productName} ({item.quantity}개) - {item.price}원</span>
                </div>
            ))}

            <h3>다음 결제 상품 목록</h3>
            {subscription.nextItems?.length > 0 ? (
                subscription.nextItems.map((item, index) => (
                    <div key={index}>
                        <span>{item.productName} ({item.nextMonthQuantity}개) - {item.nextMonthPrice}원</span>
                        <button onClick={() => handleDeleteItem(index)}>삭제</button>
                    </div>
                ))
            ) : (
                <p>다음 회차에 반영될 상품이 없습니다.</p>
            )}

            <h3>상품 추가</h3>
            <select value={selectedProduct?.id || ""} onChange={(e) => {
                const product = products.find(p => p.id === Number(e.target.value));
                dispatch(setSelectedProduct(product));
            }}>
                <option value="">상품 선택</option>
                {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                        {product.name} - {product.price}원
                    </option>
                ))}
            </select>
            <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => dispatch(setSelectedQuantity(Number(e.target.value)))}
            />
            <button onClick={handleAddProduct}>상품 추가</button>

            <button onClick={handleUpdateNextItems}>
                다음 결제 상품 업데이트
            </button>

            <h3>결제일 관리</h3>
            <input
                type="date"
                value={subscription?.nextBillingDate || ""}
                onChange={(e) => dispatch(updateSubscription({ ...subscription, nextBillingDate: e.target.value }))}
            />

            <h3>결제수단</h3>
            <select
                value={subscription?.paymentMethod || ""}
                onChange={(e) => dispatch(updateSubscription({ ...subscription, paymentMethod: e.target.value }))}
            >
                <option value="naverpay">네이버페이</option>
                <option value="bank">계좌입금</option>
                <option value="card">카드결제</option>
            </select>

            <h3>배송정보</h3>
            <input
                type="text"
                value={subscription?.deliveryAddress || ""}
                onChange={(e) => dispatch(updateSubscription({ ...subscription, deliveryAddress: e.target.value }))}
            />

            <button onClick={handleUpdateSubscription}>변경사항 저장</button>
            <button onClick={handleCancelSubscription}>구독 취소</button>
            <button onClick={handleProcessBilling}>자동 결제 실행</button>
        </div>
    );
}
