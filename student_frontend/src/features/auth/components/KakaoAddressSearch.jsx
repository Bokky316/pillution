import React from "react";

export default function KakaoAddressSearch({ onAddressSelect }) {
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                console.log("📌 [DEBUG] 카카오 주소 선택됨:", data);
                onAddressSelect(data); // 부모 컴포넌트(SubscriptionManagement.jsx)에 주소 전달
            }
        }).open();
    };

    return (
        <button onClick={handleAddressSearch}>주소 검색</button>
    );
}
