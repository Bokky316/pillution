import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../../auth/utils/fetchWithAuth";
import { API_URL } from "../../../constant";

export default function SubscriptionManagement() {
    const [subscription, setSubscription] = useState(null);
    const [items, setItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [billingDate, setBillingDate] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");

    useEffect(() => {
        fetchWithAuth(`${API_URL}/api/subscription`)
            .then(data => {
                setSubscription(data);
                setItems(data.items);
                setPaymentMethod(data.paymentMethod);
                setBillingDate(data.nextBillingDate);
                setDeliveryAddress(data.deliveryAddress);
            })
            .catch(error => console.error("구독 정보 로드 오류:", error));
    }, []);

    const updateSubscription = () => {
        fetchWithAuth(`${API_URL}/api/subscription/update-items`, {
            method: "PUT",
            body: JSON.stringify({ items }),
        }).then(() => alert("구독 정보가 업데이트되었습니다."));
    };

    const cancelSubscription = (immediately) => {
        fetchWithAuth(`${API_URL}/api/subscription/cancel`, {
            method: "DELETE",
            body: JSON.stringify({ immediately }),
        }).then(() => alert(immediately ? "즉시 구독이 해지되었습니다." : "다음 결제 전까지 유지됩니다."));
    };

    return (
        <div>
            <h2>정기구독 관리</h2>
            {subscription ? (
                <>
                    <p>최근 결제일: {subscription.lastBillingDate}</p>
                    <p>회차 정보: {subscription.currentCycle}회차</p>

                    <h3>구독중인 제품</h3>
                    {items.map((item, index) => (
                        <div key={index}>
                            <span>{item.productName} ({item.quantity}개) - {item.price}원</span>
                        </div>
                    ))}

                    <h3>결제일 관리</h3>
                    <input type="date" value={billingDate} onChange={e => setBillingDate(e.target.value)} />

                    <h3>결제수단</h3>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        <option value="naverpay">네이버페이</option>
                        <option value="bank">계좌입금</option>
                        <option value="card">카드결제</option>
                    </select>

                    <h3>배송정보</h3>
                    <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />

                    <button onClick={updateSubscription}>변경사항 저장</button>
                    <button onClick={() => cancelSubscription(false)}>계속 이용</button>
                    <button onClick={() => cancelSubscription(true)}>즉시 해지</button>
                </>
            ) : (
                <p>구독 정보가 없습니다.</p>
            )}
        </div>
    );
}