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





import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import KakaoAddressSearch from "@/features/auth/components/KakaoAddressSearch"; // 공통 컴포넌트 추가

import {
    fetchSubscription,
//     updateSubscription,
    cancelSubscription,
    updateNextSubscriptionItems,
//     processSubscriptionBilling,
    fetchProducts,
    setSelectedProduct,
    setSelectedQuantity,
    addNextSubscriptionItem,
    deleteNextSubscriptionItem,
//     replaceNextSubscriptionItems,
    updateBillingDate,
    updateNextPaymentMethod,
    updateDeliveryAddress,
    updateDetailAddress,
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


// console.log("🔍 Redux에서 가져온 products:", products);
    // ✅ Redux 상태에서 `subscriptionId` 가져오기 (컴포넌트 최상단에서 호출해야 함!)
    const subscriptionItems = useSelector(state => state.subscription.nextItems);
    // ✅ 초기값 설정 (nextItems가 없으면 빈 배열 반환)
    const nextItems = subscription?.nextItems || [];
    const [isModalOpen, setIsModalOpen] = useState(false); // ✅ 모달 상태


    // ✅ 카카오 주소 선택 후 Redux 상태 업데이트
    const handleAddressSelect = (data) => {
        dispatch(updateDeliveryAddress({
            subscriptionId: subscription.id,
            postalCode: data.zonecode,  // 카카오 API에서 받은 우편번호
            roadAddress: data.address, // 카카오 API에서 받은 도로명 주소
            detailAddress: detailAddress // 기존 상세주소 유지
        }));
    };

    // ✅ Redux 상태에서 주소 데이터 가져오기
    const postalCode = subscription?.postalCode || "";
    const roadAddress = subscription?.roadAddress || "";
    const detailAddress = subscription?.detailAddress || "";

//     useEffect(() => {
//         console.log("🔍 [DEBUG] Redux에서 가져온 구독 데이터:", subscription);
//     }, [subscription]); // ✅ Redux 상태가 변경될 때마다 로그 출력

//     useEffect(() => {
//         console.log("📌 Redux 업데이트 후 상태:", {
//             postalCode: subscription?.postalCode,
//             roadAddress: subscription?.roadAddress,
//             detailAddress: subscription?.detailAddress
//         });
//     }, [subscription]); // ✅ Redux 상태가 변경될 때마다 로그 출력

    // ✅ 배송지 업데이트
    const handleAddressUpdate = () => {
        if (!subscription?.id || !roadAddress || !postalCode) {
            alert("❌ 우편번호와 도로명 주소는 필수 입력값입니다!");
            return;
        }

        dispatch(updateDeliveryAddress({
            subscriptionId: subscription.id,
            postalCode,
            roadAddress,
            detailAddress,
        })).then((result) => {
            if (updateDeliveryAddress.fulfilled.match(result)) {
                alert("✅ 배송 주소가 업데이트되었습니다!");

                // ✅ Redux 상태가 정상적으로 업데이트되었는지 확인
                console.log("📌 Redux 업데이트 후 상태:", subscription);

                // ✅ 최신 데이터 다시 불러오기
                dispatch(fetchSubscription());
            } else {
                alert(result.payload || "❌ 배송 주소 변경 실패!");
            }
        });
    };



    // 정기구독 - 다음달 결제 예정 상품 수량 변경
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return; // 최소 수량 제한

        // ✅ 기존 Redux 상태 복사 후 변경된 부분만 업데이트 (UI 즉시 반영)
        const updatedItems = subscription.nextItems.map(item =>
            item.productId === productId ? { ...item, nextMonthQuantity: newQuantity } : item
        );

        // ✅ Redux 상태를 먼저 업데이트하여 UI가 즉시 반응하도록 함
        dispatch({
            type: "subscription/updateNextItemsDirectly",
            payload: updatedItems,
        });

        // ✅ 서버로 업데이트 요청 보내기
        dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }))
            .then((result) => {
                if (updateNextSubscriptionItems.fulfilled.match(result)) {
                    console.log("✅ DB 업데이트 성공:", result.payload);

                    // ✅ 서버 응답 후 Redux 상태를 다시 가져와서 동기화
                    dispatch(fetchSubscription());
                } else {
                    console.error("❌ DB 업데이트 실패:", result.error);
                }
            })
            .catch(error => console.error("❌ API 요청 중 오류 발생:", error));
    };





    // ✅ totalPrice 상태 추가 (useState 사용)
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        console.log("🔍 useEffect 실행됨");
        dispatch(fetchSubscription());
        dispatch(fetchProducts()); // ✅ 상품 리스트 불러오기
    }, [dispatch]);

//     useEffect(() => {
//         console.log("📌 Redux 상태 확인:", { subscription, loading, error });
//     }, [subscription, loading, error]);
//
//     useEffect(() => {
//         console.log("📌 현재 products 상태:", products);
//     }, [products]);

    useEffect(() => {
        console.log("🔍 Redux에서 가져온 nextItems 상태:", subscription.nextItems);
        subscription.nextItems.forEach(item => {
            if (!item.productId) {
                console.error("❌ [ERROR] productId 없음!", item);
            }
        });
    }, [subscription.nextItems]);

//     useEffect(() => {
//         console.log("✅ Redux 상태 변경 감지! nextItems 업데이트됨:", subscription.nextItems);
//     }, [subscription.nextItems]);

    useEffect(() => {
        if (!subscription || !subscription.nextItems) return;
        console.log("✅ Redux 상태 변경 감지! nextItems 업데이트됨:", subscription.nextItems);
    }, [subscription.nextItems]);


    // 총 가격 계산 함수 (각 상품의 수량 * 가격 합계)
    // ✅ subscription.nextItems 변경될 때마다 totalPrice 계산
    useEffect(() => {
        if (subscription?.nextItems) {
            const total = subscription.nextItems.reduce(
                (sum, item) => sum + item.nextMonthQuantity * item.nextMonthPrice, 0);
            setTotalPrice(total);  // 상태 업데이트
        }
    }, [subscription.nextItems]);


    // 정기구독 상품 추가하기
    const handleAddProduct = async () => {
        if (!selectedProduct || selectedQuantity <= 0) return;

        const subscriptionItems = subscription?.nextItems || []; // 현재 구독의 다음 결제 상품 목록

        // ✅ 이미 추가된 상품인지 확인
        const existingItem = subscriptionItems.find(item => item.productId === selectedProduct.id);

        if (existingItem) {
            // ✅ 이미 추가된 상품이면 수량 증가 요청
            const updatedQuantity = existingItem.nextMonthQuantity + selectedQuantity;

            dispatch(updateNextSubscriptionItems({
                subscriptionId: subscription.id,
                updatedItems: subscriptionItems.map(item =>
                    item.productId === selectedProduct.id
                        ? { ...item, nextMonthQuantity: updatedQuantity }
                        : item
                ),
            })).then((result) => {
                if (updateNextSubscriptionItems.fulfilled.match(result)) {
                    console.log(`✅ 상품(${selectedProduct.name}) 수량 증가: ${updatedQuantity}개`);
                    dispatch(fetchSubscription()); // 최신 데이터 반영
                } else {
                    console.error("❌ 상품 수량 변경 실패:", result.error);
                }
            });

        } else {
            // ✅ 새로운 상품 추가
            const newItem = {
                subscriptionId: subscription.id,
                productId: selectedProduct.id,
                nextMonthQuantity: selectedQuantity,
                nextMonthPrice: selectedProduct.price,
            };

            console.log("🛠️ 추가할 상품 데이터:", newItem);
            dispatch(addNextSubscriptionItem(newItem)).then((result) => {
                if (addNextSubscriptionItem.fulfilled.match(result)) {
                    console.log("✅ 상품 추가 성공:", result.payload);

                    // ✅ Redux 상태를 직접 업데이트하여 화면에서 즉시 반영
                    dispatch(fetchSubscription()); // 구독 정보 다시 불러오기
                } else {
                    console.error("❌ 상품 추가 실패:", result.error);
                }
            });
        }
    };


    // ✅ 수정된 handleDeleteItem (삭제 기능 개선)
    const handleDeleteItem = (productId) => {
        const subscriptionId = subscription?.id;

        // ✅ 방어 코드: productId와 subscriptionId가 있는지 확인
        if (!subscriptionId || !productId) {
            console.error("❌ [ERROR] 구독 ID 또는 productId가 없음! 요청 취소", { subscriptionId, productId });
            return;
        }

        console.log("📡 [API 요청] 삭제할 상품:", { subscriptionId, productId });

        // ✅ Redux 상태에서 nextItems 가져오기
        const currentItems = subscription?.nextItems || [];
        const existingItem = currentItems.find(item => item.productId === productId);

        // ✅ 해당 productId가 존재하는지 체크
        if (!existingItem) {
            console.error("❌ [ERROR] 해당 productId를 찾을 수 없음:", productId);
            return;
        }

         console.log("🛠️ 삭제할 상품 데이터:", existingItem);

        // ✅ 삭제 API 요청
        dispatch(deleteNextSubscriptionItem({ subscriptionId, productId }))
            .then((result) => {
                if (deleteNextSubscriptionItem.fulfilled.match(result)) {
                    console.log("✅ 삭제 성공:", result.payload);

                    // ✅ Redux 상태 즉시 반영
                    dispatch(fetchSubscription()); // 최신 상태 가져오기
                } else {
                    console.error("❌ 삭제 실패:", result.error);
                }
            });
    };

//     // 변경사항 저장
//     const handleUpdateSubscription = () => {
//         const updatedData = {
//             subscriptionId: subscription.id,
//             paymentMethod: subscription.paymentMethod,
//             nextBillingDate: subscription.nextBillingDate,
//             deliveryAddress: subscription.deliveryAddress
//         };
//         dispatch(updateSubscription(updatedData));
//     };

    // 구독 취소
const handleCancelSubscription = () => {
    if (!subscription?.id) {
        console.error("❌ [ERROR] 구독 ID 없음! 취소 불가.");
        return;
    }

    if (window.confirm("⚠️ 정말로 구독을 취소하시겠습니까?")) {
        dispatch(cancelSubscription({ subscriptionId: subscription.id }))
            .then((result) => {
                if (cancelSubscription.fulfilled.match(result)) {
                    alert("✅ 구독이 취소되었습니다!");
                    dispatch(fetchSubscription()); // ✅ 최신 상태 반영
                } else {
                    alert(result.payload || "❌ 구독 취소 실패!");
                }
            });
    }
};


    // ✅ 기존 nextItems에서 productId 없는 경우 보완
    const handleUpdateNextItems = () => {
        const validItems = nextItems.map(item => {
            let productId = item.productId;

            // ✅ productId가 null이면 products 배열에서 찾아서 매칭
            if (!productId) {
                const matchedProduct = products.find(p => p.name === item.productName);
                productId = matchedProduct ? matchedProduct.id : null;
            }

            return {
                ...item,
                productId
            };
        }).filter(item => item.productId !== null); // productId가 있는 항목만 전송

        if (validItems.length === 0) {
            console.error("❌ [ERROR] 업데이트할 상품 목록이 비어 있음! 요청 취소");
            return;
        }

        dispatch(updateNextSubscriptionItems({ subscriptionId, updatedItems: validItems }));
    };

    // 정기 구독 결제일 변경
    const handleBillingDateChange = (event) => {
        const subscriptionId = subscription?.id;
        const newBillingDate = event.target.value; // ✅ 날짜 값 가져오기

        if (!subscriptionId || !newBillingDate) {
            console.error("❌ [ERROR] 구독 ID 또는 새 결제일 없음!", { subscriptionId, newBillingDate });
            return;
        }

        dispatch(updateBillingDate({ subscriptionId, newBillingDate }))
            .then((result) => {
                if (updateBillingDate.fulfilled.match(result)) {
                    console.log("✅ 결제일 변경 성공:", result.payload);
                    dispatch(fetchSubscription()); // ✅ 최신 상태 반영
                } else {
                    console.error("❌ 결제일 변경 실패:", result.error);
                    alert(result.payload || "결제일 변경에 실패했습니다."); // ✅ payload에서 메시지 가져오기
                }
            })
            .catch((error) => {
                console.error("❌ [ERROR] 결제일 변경 중 오류 발생:", error);
                alert(error.message || "결제일 변경에 실패했습니다.");
            });
    };


    const handlePaymentMethodChange = (event) => {
        const subscriptionId = subscription?.id;
        const newMethod = event.target.value;

        if (!subscriptionId || !newMethod) {
            console.error("❌ [ERROR] 구독 ID 또는 결제수단 없음!", { subscriptionId, newMethod });
            return;
        }

        dispatch(updatePaymentMethod({ subscriptionId, newMethod }))
            .then((result) => {
                if (updatePaymentMethod.fulfilled.match(result)) {
                    console.log("✅ 결제수단 변경 성공:", result.payload);
                    dispatch(fetchSubscription()); // ✅ 최신 상태 반영
                } else {
                    console.error("❌ 결제수단 변경 실패:", result.error);
                    alert(result.payload || "결제수단 변경에 실패했습니다.");
                }
            })
            .catch((error) => {
                console.error("❌ [ERROR] 결제수단 변경 중 오류 발생:", error);
                alert(error.message || "결제수단 변경에 실패했습니다.");
            });
    };





//     const handleProcessBilling = () => {
//         if (!subscription?.id) {
//             console.error("❌ 구독 정보가 없음: processSubscriptionBilling 실행 불가");
//             return;
//         }
//         dispatch(processSubscriptionBilling(subscription.id));
//     };
//
//     const handleReplaceNextItems = () => {
//         if (!subscription?.id || !subscription.nextItems.length) {
//             console.error("❌ [ERROR] 구독 ID 또는 nextItems 없음! 요청 취소");
//             return;
//         }
//
//         const updatedItems = subscription.nextItems.map(item => ({
//             productId: item.productId,
//             nextMonthQuantity: item.nextMonthQuantity,
//             nextMonthPrice: item.nextMonthPrice
//         }));
//
//         console.log("📡 [API 요청] 새로운 정기구독 상품 교체 요청:", updatedItems);
//
//         dispatch(replaceNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }));
//     };


//     if (loading) return <div>로딩 중...</div>;
//     if (error) return <div>에러 발생: {error}</div>;
//     if (!subscription || Object.keys(subscription).length === 0) {
//         return <div>구독 정보가 없습니다.</div>;  // 예외 처리 추가
//     }
    if (!subscription) return <div>로딩 중...</div>; // ✅ subscription이 없을 때만 "로딩 중..." 표시
    if (error) return <div>에러 발생: {error}</div>;
    if (!subscription.items || subscription.items.length === 0) {
        return <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>정기구독 내역이 없습니다.</div>;
    }


    // ✅ 현재 구독 제품 가격 계산
    const totalQuantity = subscription.items.reduce((sum, item) => sum + item.quantity, 0);
    const originalTotalPrice = subscription.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountTotalPrice = subscription.discountedTotalPrice || originalTotalPrice * 0.85; // 예제: 15% 할인 적용

    // ✅ 다음 구독 제품 가격 계산
    const nextTotalQuantity = subscription.nextItems.reduce((sum, item) => sum + item.nextMonthQuantity, 0);
    const nextOriginalTotalPrice = subscription.nextItems.reduce((sum, item) => sum + item.nextMonthPrice * item.nextMonthQuantity, 0);
    const nextDiscountTotalPrice = nextOriginalTotalPrice * 0.85; // 15% 할인 예제
    const shippingFee = 3000;
    const nextDiscountAmount = nextOriginalTotalPrice - nextDiscountTotalPrice;
    const nextFinalPrice = nextDiscountTotalPrice - shippingFee;

//     // ✅ 수량 조절 함수
//     const handleQuantityChange = (productId, newQuantity) => {
//         const updatedItems = subscription.nextItems.map(item =>
//             item.productId === productId ? { ...item, nextMonthQuantity: newQuantity } : item
//         );
//
//         dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }));
//     };

    // ✅ 상품 추가 모달에서 선택한 상품 추가
    const handleSelectProduct = (product) => {
        const existingItem = subscription.nextItems.find(item => item.productId === product.id);

        if (existingItem) {
            // ✅ 이미 있는 상품이면 수량 증가
            handleQuantityChange(product.id, existingItem.nextMonthQuantity + 1);
        } else {
            // ✅ 새 상품 추가 (상품 정보 포함)
            const newItem = {
                subscriptionId: subscription.id,
                productId: product.id,
                productName: product.name,  // ✅ 상품명 추가
                imageUrl: product.imageUrl,  // ✅ 이미지 추가
                nextMonthQuantity: 1,
                nextMonthPrice: product.price,
            };
            dispatch(addNextSubscriptionItem(newItem))
                .then(() => dispatch(fetchSubscription())); // ✅ 최신 상태 다시 불러오기
        }

        setIsModalOpen(false);
    };



    return (

            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
                {/* ✅ 상단 구독 정보 */}
                <div style={{ textAlign: "left", marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                            <p style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>{subscription.lastBillingDate || "진행중인 구독상품 없음"}</p>
                            <p style={{ fontSize: "14px", color: "#888" }}> 구독번호: {subscription.id}</p> {/* ✅ subscriptionId 추가 */}
                        </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                        <p style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}>
                                                {subscription.currentCycle}회차 <span style={{ color: "green" }}>진행중</span> {subscription.items.length}건 {/* ✅ 상품 종류 갯수로 변경 */}
                                            </p>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "16px", color: "#aaa", textDecoration: "line-through", marginBottom: "5px" }}>
                                {originalTotalPrice.toLocaleString()}원
                            </p>
                            <p style={{ fontSize: "20px", fontWeight: "bold", color: "red" }}>
                                {discountTotalPrice.toLocaleString()}원
                            </p>
                        </div>
                    </div>
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

{/*                  */}{/* ✅ 구독 중인 제품 총 결제금액 */}
{/*                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}> */}
{/*                     <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>정기결제 제품 총 결제금액</span> */}
{/*                     <div style={{ textAlign: "right" }}> */}
{/*                         <p style={{ fontSize: "16px", color: "#aaa", textDecoration: "line-through", marginBottom: "5px" }}> */}
{/*                             {originalTotalPrice.toLocaleString()}원 */}
{/*                         </p> */}
{/*                         <p style={{ fontSize: "20px", fontWeight: "bold", color: "red" }}> */}
{/*                             {discountTotalPrice.toLocaleString()}원 */}
{/*                         </p> */}
{/*                     </div> */}
{/*                 </div> */}

                {/* ✅ 할인 정보 */}
                <p style={{ color: "#888", fontSize: "13px", marginTop: "10px" }}>
                    25%할인 #무료배송 #구독할인10% #건강설문 할인 10% #장기고객우대 5%
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
                <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "5px", marginTop: "20px", maxWidth: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#666", fontWeight: "bold" }}>제품 합계 금액</span>
                        <span>{nextOriginalTotalPrice.toLocaleString()}원</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#666", fontWeight: "bold" }}>기본 배송비</span>
                        <span>-{shippingFee.toLocaleString()}원</span>
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
                {/* ✅ 상세 할인 내역 박스 */}
                            <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "5px", marginTop: "15px" }}>
                                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "10px", marginTop: "0px" }}>상세 할인 내역</h4>

                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                    <span style={{ color: "#666", fontWeight: "bold" }}>배송비 무료</span>
                                    <span>- {shippingFee.toLocaleString()}원</span>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                    <span style={{ color: "#666", fontWeight: "bold" }}>장기 유지 고객 5%</span>
                                    <span>- {(nextOriginalTotalPrice * 0.05).toLocaleString()}원</span>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                    <span style={{ color: "#666", fontWeight: "bold" }}>건강설문 할인 10%</span>
                                    <span>- {(nextOriginalTotalPrice * 0.1).toLocaleString()}원</span>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #ddd", paddingTop: "10px" }}>
                                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>정기구독 할인 합계</span>
                                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "red" }}>- {nextDiscountAmount.toLocaleString()}원</span>
                                </div>
                            </div>
            </div>




                {/* ✅ 다음 구독 제품 총 결제금액 */}
{/*                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}> */}
{/*                     <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>다음 구독 제품 총 결제금액</span> */}
{/*                     <div style={{ textAlign: "right" }}> */}
{/*                         <p style={{ fontSize: "16px", color: "#aaa", textDecoration: "line-through", marginBottom: "5px" }}> */}
{/*                             {nextOriginalTotalPrice.toLocaleString()}원 */}
{/*                         </p> */}
{/*                         <p style={{ fontSize: "20px", fontWeight: "bold", color: "red" }}> */}
{/*                             {nextDiscountTotalPrice.toLocaleString()}원 */}
{/*                         </p> */}
{/*                     </div> */}
{/*                 </div> */}
                {/* ✅ 구분선 */}
                <hr style={{ border: "1px solid #ddd", margin: "15px 0" }} />
            {/* ✅ 결제일 관리 추가 */}
            <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "5px", marginTop: "15px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "10px" }}>
                    결제일 관리
                </h3>
                <input
                    type="date"
                    value={subscription?.nextBillingDate || ""}
                    onChange={handleBillingDateChange}
                    style={{ width: "90%", padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "5px" }}
                />
            </div>

            {/* ✅ 배송정보 섹션 */}
            <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "5px", marginTop: "20px", maxWidth: "100%" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "10px" }}>배송정보</h3>

                <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontWeight: "bold", color: "#666", display: "block", marginBottom: "5px" }}>우편번호</label>
                    <input type="text" value={postalCode} readOnly placeholder="우편번호를 입력해주세요"
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontWeight: "bold", color: "#666", display: "block", marginBottom: "5px" }}>도로명 주소</label>
                    <input type="text" value={roadAddress} readOnly placeholder="도로명 주소를 검색해주세요"
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", marginBottom: "5px" }} />
                    {/* ✅ 카카오 주소 검색 버튼 */}
                    <KakaoAddressSearch onAddressSelect={handleAddressSelect} />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label style={{ fontWeight: "bold", color: "#666", display: "block", marginBottom: "5px" }}>상세 주소</label>
                    <input type="text" value={detailAddress} onChange={(e) => dispatch(updateDetailAddress(e.target.value))}
                        placeholder="상세 주소를 입력해주세요"
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
                    <button onClick={handleAddressUpdate}
                        style={{
                            marginTop: "10px", width: "100%", padding: "10px", background: "#007BFF",
                            color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer"
                        }}>
                        배송지 변경
                    </button>
                </div>
            </div>

            {/* ✅ 구독 취소 버튼 */}
            <button onClick={handleCancelSubscription}
                disabled={subscription.status === "CANCELLED"}
                style={{
                    width: "100%", padding: "15px", background: subscription.status === "CANCELLED" ? "#ccc" : "#FF3B30",
                    color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: subscription.status === "CANCELLED" ? "default" : "pointer",
                    marginTop: "20px"
                }}>
                {subscription.status === "CANCELLED" ? "구독 취소됨" : "구독 취소"}
            </button>








        </div>


        );
}



      {/* 다음 구독 제품 편집 */}
      <Typography variant="h6" sx={{ borderBottom: "2px solid #ddd", paddingBottom: "5px" }}>
        다음 구독 제품 편집
      </Typography>
      {subscription?.nextItems?.map((item) => (
        <Box key={item.productId} sx={{ display: "flex", alignItems: "center", margin: "15px 0" }}>
          <Typography flex={1}>{item.productName}</Typography>
          <IconButton onClick={() => handleQuantityChange(item.productId, item.nextMonthQuantity - 1)}>-</IconButton>
          <Typography>{item.nextMonthQuantity}</Typography>
          <IconButton onClick={() => handleQuantityChange(item.productId, item.nextMonthQuantity + 1)}>+</IconButton>
          <IconButton onClick={() => handleDeleteItem(item.productId)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

            {/* 구독 취소 */}
            <Button variant="contained" color="error" fullWidth sx={{ marginTop: "20px" }} onClick={handleCancelSubscription}>
              구독 취소
            </Button>

             {/* 구독 취소 확인창 */}
                  <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
                    <DialogTitle>정말 구독을 취소하시겠습니까?</DialogTitle>
                    <DialogActions>
                      <Button onClick={() => setConfirmCancel(false)}>아니오</Button>
                      <Button color="error" onClick={confirmCancelSubscription}>
                        예, 취소합니다
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>

                  );
                }

            import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Typography, TextField, IconButton, Dialog, DialogTitle, DialogActions } from "@mui/material";
  const [points, setPoints] = useState(0); // 포인트 할인 추가
