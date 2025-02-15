import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import KakaoAddressSearch from "@/features/auth/KakaoAddressSearch";

import {
    fetchSubscription,
    updateSubscription,
    cancelSubscription,
    updateNextSubscriptionItems,
    processSubscriptionBilling,
    fetchProducts,
    setSelectedProduct,
    setSelectedQuantity,
    addNextSubscriptionItem,
    deleteNextSubscriptionItem,
    replaceNextSubscriptionItems,
    updateBillingDate,
    updateNextPaymentMethod,
    updateDeliveryAddress,
    updateDetailAddress,
} from "@/store/subscriptionSlice";


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

//     const [address, setAddress] = useState(subscription?.deliveryAddress || "");
//     const [detailAddress, setDetailAddress] = useState("");
//
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

    useEffect(() => {
        console.log("🔍 [DEBUG] Redux에서 가져온 구독 데이터:", subscription);
    }, [subscription]); // ✅ Redux 상태가 변경될 때마다 로그 출력

    useEffect(() => {
        console.log("📌 Redux 업데이트 후 상태:", {
            postalCode: subscription?.postalCode,
            roadAddress: subscription?.roadAddress,
            detailAddress: subscription?.detailAddress
        });
    }, [subscription]); // ✅ Redux 상태가 변경될 때마다 로그 출력

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
        const subscriptionItems = subscription?.nextItems || []; // ✅ nextItems가 없으면 빈 배열 사용

        if (!subscriptionItems.length) {
            console.error("❌ Redux 상태에서 subscriptionItems가 없음!");
            return;
        }

        const updatedItems = subscriptionItems.map(item =>
            item.productId === productId ? { ...item, nextMonthQuantity: newQuantity } : item
        );

        // ✅ Redux 상태를 먼저 업데이트 (서버 응답을 기다리지 않음)
        dispatch({
            type: "subscription/updateNextItemsDirectly",
            payload: updatedItems,
        });

        // ✅ 서버로 업데이트 요청 보내기
        dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }))
            .then((result) => {
                if (updateNextSubscriptionItems.fulfilled.match(result)) {
                    console.log("✅ [SUCCESS] 서버 업데이트 성공:", result.payload);
                    // ✅ 최신 상태 다시 가져오기 (서버 동기화)
                    dispatch(fetchSubscription());
                } else {
                    console.error("❌ [ERROR] 서버 업데이트 실패:", result.error);
                }
            });
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

    // 변경사항 저장
    const handleUpdateSubscription = () => {
        const updatedData = {
            subscriptionId: subscription.id,
            paymentMethod: subscription.paymentMethod,
            nextBillingDate: subscription.nextBillingDate,
            deliveryAddress: subscription.deliveryAddress
        };
        dispatch(updateSubscription(updatedData));
    };

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


//     const handleUpdateNextItems = () => {
//         const updatedItems = subscription.nextItems.map(item => {
//             let productId = item.productId;
//
//             // 기존 nextItems에서 productId가 없을 경우 products에서 찾아서 추가
//             if (!productId) {
//                 const product = products.find(p => p.name === item.productName);
//                 productId = product ? product.id : null;
//             }
//
//             return {
//                 productId,  // ✅ productId 반드시 포함
//                 nextMonthQuantity: item.nextMonthQuantity,
//                 nextMonthPrice: item.nextMonthPrice
//             };
//         }).filter(item => item.productId !== null); // productId가 없는 항목 제거
//
//         dispatch(updateNextSubscriptionItems({
//             subscriptionId: subscription.id,
//             updatedItems
//         }));
//     };

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





    const handleProcessBilling = () => {
        if (!subscription?.id) {
            console.error("❌ 구독 정보가 없음: processSubscriptionBilling 실행 불가");
            return;
        }
        dispatch(processSubscriptionBilling(subscription.id));
    };

    const handleReplaceNextItems = () => {
        if (!subscription?.id || !subscription.nextItems.length) {
            console.error("❌ [ERROR] 구독 ID 또는 nextItems 없음! 요청 취소");
            return;
        }

        const updatedItems = subscription.nextItems.map(item => ({
            productId: item.productId,
            nextMonthQuantity: item.nextMonthQuantity,
            nextMonthPrice: item.nextMonthPrice
        }));

        console.log("📡 [API 요청] 새로운 정기구독 상품 교체 요청:", updatedItems);

        dispatch(replaceNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems }));
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
            {(subscription?.nextItems && subscription.nextItems.length > 0) ? (
                subscription.nextItems.map((item, index) => (
                    <div key={index}>
                        <span>{item.productName} - </span>
                        <input
                            type="number"
                            min="1"
                            value={item.nextMonthQuantity}
                            onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))} // ✅ 수정된 handleQuantityChange 적용
                        />
                        <span>개 - {item.nextMonthPrice * item.nextMonthQuantity}원</span>
                        <button onClick={() => handleDeleteItem(item.productId)}>삭제</button>
                    </div>
                ))
            ) : (
                <p>다음 회차에 반영될 상품이 없습니다.</p>
            )}


            {/* ✅ 총 가격 + 버튼을 한 줄에 정렬 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <h3>총 합계: {totalPrice} 원</h3>
                <button onClick={() => dispatch(updateNextSubscriptionItems({ subscriptionId: subscription.id, updatedItems: subscription.nextItems }))}>
                    다음 결제 상품 업데이트(미사용)
                </button>
                <button onClick={handleReplaceNextItems}>
                    다음 결제 상품 교체하기(미사용)
                </button>
            </div>

            <h2>상품 추가</h2>
            <h3>상품 선택</h3>

                <select value={selectedProduct?.id || ""} onChange={(e) => {
                    const product = products.find(p => p.id === Number(e.target.value));
                    dispatch(setSelectedProduct(product));
                }}>
                    <option value="">상품 선택</option>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} - {product.price}원
                            </option>
                        ))
                    ) : (
                        <option>상품 목록이 없습니다.</option>
                    )}
                </select>
{/*             <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}> */}
                {selectedProduct && (
                    <div>
                        <h4>상품 상세 정보</h4>
                        <p>상품명: {selectedProduct.name}</p>
                        <p>가격: {selectedProduct.price}원</p>
                    </div>
                )}

                <h4>수량 선택</h4>
                <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => dispatch(setSelectedQuantity(Number(e.target.value)))}
                />
                <button onClick={handleAddProduct}>다음 정기결제에 상품 추가</button>
{/*             </div> */}

{/*             <h3>상품 추가</h3> */}
{/*             <select value={selectedProduct?.id || ""} onChange={(e) => { */}
{/*                 const product = products.find(p => p.id === Number(e.target.value)); */}
{/*                 dispatch(setSelectedProduct(product)); */}
{/*             }}> */}
{/*                 <option value="">상품 선택</option> */}
{/*                 {products?.map((product) => ( */}
{/*                     <option key={product.id} value={product.id}> */}
{/*                         {product.name} - {product.price}원 */}
{/*                     </option> */}
{/*                 ))} */}
{/*             </select> */}
{/*             <input */}
{/*                 type="number" */}
{/*                 min="1" */}
{/*                 value={selectedQuantity} */}
{/*                 onChange={(e) => dispatch(setSelectedQuantity(Number(e.target.value)))} */}
{/*             /> */}
{/*             <button onClick={handleAddProduct}>상품 추가</button> */}

{/*             <button onClick={handleUpdateNextItems}> */}
{/*                 다음 결제 상품 업데이트 */}
{/*             </button> */}

            <h3>결제일 관리</h3>
            <input
                type="date"
                value={subscription?.nextBillingDate || ""}
                onChange={handleBillingDateChange}
            />

            <h3>다음 회차 결제수단 변경</h3>
            <select
                value={subscription?.nextPaymentMethod || ""} // ✅ Redux에서 불러온 nextPaymentMethod 반영
                onChange={(e) =>
                    dispatch(updateNextPaymentMethod({
                        subscriptionId: subscription.id,
                        nextPaymentMethod: e.target.value
                    }))
                }
            >
                <option value="naverpay">네이버페이</option>
                <option value="kakaopay">카카오페이</option>
                <option value="bank">계좌입금</option>
                <option value="card">카드결제</option>
            </select>

            <div>
                <h3>배송정보</h3>
                <div>
                    <label>우편번호</label>
                    <input type="text" value={postalCode} readOnly placeholder="우편번호를 입력해주세요" />
                </div>
                <div>
                    <label>도로명 주소</label>
                    <input type="text" value={roadAddress} readOnly placeholder="도로명 주소를 검색해주세요" />
                    {/* ✅ 카카오 주소 검색 버튼 */}
                    <KakaoAddressSearch onAddressSelect={handleAddressSelect} />
                </div>
                <div>
                    {/* 상세 주소 입력 */}
                    <label>상세 주소</label>
                    <input
                        type="text"
                        value={detailAddress}
                        onChange={(e) => dispatch(updateDetailAddress(e.target.value))}
                        placeholder="상세 주소를 입력해주세요"
                    />
                    <button onClick={handleAddressUpdate}>배송지 변경</button>
                </div>
            </div>

            <button onClick={handleUpdateSubscription}>변경사항 저장</button>
            <button
                onClick={handleCancelSubscription}
                disabled={subscription.status === "CANCELLED"} // 취소된 경우 버튼 비활성화
            >
                {subscription.status === "CANCELLED" ? "구독 취소됨" : "구독 취소"}
            </button>
{/*             <button onClick={handleCancelSubscription}>구독 취소</button> */}
            <button onClick={handleProcessBilling}>자동 결제 실행</button>
        </div>
    );
}
