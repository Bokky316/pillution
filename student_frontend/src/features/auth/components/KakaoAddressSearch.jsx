import React from "react";

export default function KakaoAddressSearch({ onAddressSelect }) {
    // ✅ 카카오 주소 API 실행
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                onAddressSelect(data.address); // ✅ 부모 컴포넌트에 선택된 주소 전달
            }
        }).open();
    };

    return (
        <button onClick={handleAddressSearch}>주소 검색</button>
    );
}
