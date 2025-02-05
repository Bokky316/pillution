import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubscription, updateSubscription, cancelSubscription } from "@/redux/subscriptionSlice";

export default function SubscriptionManagement() {
    const dispatch = useDispatch();
    const { data: subscription, loading, error } = useSelector((state) => state.subscription);

    useEffect(() => {
        dispatch(fetchSubscription());
    }, [dispatch]);

    const handleUpdateSubscription = () => {
        const updatedData = {
            items: subscription.items,
            paymentMethod: subscription.paymentMethod,
            nextBillingDate: subscription.nextBillingDate,
            deliveryAddress: subscription.deliveryAddress
        };
        dispatch(updateSubscription(updatedData));
    };

    const handleCancelSubscription = (immediately) => {
        dispatch(cancelSubscription(immediately));
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러 발생: {error}</div>;
    if (!subscription || Object.keys(subscription).length === 0) {
        return <div>구독 정보가 없습니다.</div>;  // 예외 처리 추가
    }

    return (
        <div>
            <h2>정기구독 관리</h2>
            <p>최근 결제일: {subscription.lastBillingDate}</p>
            <p>회차 정보: {subscription.currentCycle}회차</p>

            <h3>구독중인 제품</h3>
            {subscription.items.map((item, index) => (
                <div key={index}>
                    <span>{item.productName} ({item.quantity}개) - {item.price}원</span>
                </div>
            ))}

            <h3>결제일 관리</h3>
            <input
                type="date"
                value={subscription.nextBillingDate}
                onChange={(e) => dispatch(updateSubscription({ ...subscription, nextBillingDate: e.target.value }))}
            />

            <h3>결제수단</h3>
            <select
                value={subscription.paymentMethod}
                onChange={(e) => dispatch(updateSubscription({ ...subscription, paymentMethod: e.target.value }))}
            >
                <option value="naverpay">네이버페이</option>
                <option value="bank">계좌입금</option>
                <option value="card">카드결제</option>
            </select>

            <h3>배송정보</h3>
            <input
                type="text"
                value={subscription.deliveryAddress}
                onChange={(e) => dispatch(updateSubscription({ ...subscription, deliveryAddress: e.target.value }))}
            />

            <button onClick={handleUpdateSubscription}>변경사항 저장</button>
            <button onClick={() => handleCancelSubscription(false)}>계속 이용</button>
            <button onClick={() => handleCancelSubscription(true)}>즉시 해지</button>
        </div>
    );
}
