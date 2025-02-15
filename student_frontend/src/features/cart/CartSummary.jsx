import React from "react";

const CartSummary = ({ cartItems, purchaseType, onSelect }) => {
  const calculateTotals = (type) => {
    let totalPrice = 0;
    let shippingFee = 0;
    let discount = 0;

    cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    if (type === 'subscription' && totalPrice >= 30000) {
      discount = 3000;
    }

    shippingFee = totalPrice >= (type === 'subscription' ? 10000 : 30000) ? 0 : 3000;

    return {
      totalPrice,
      shippingFee,
      discount,
      finalPrice: totalPrice - discount + shippingFee
    };
  };

  const oneTimeTotals = calculateTotals('oneTime');
  const subscriptionTotals = calculateTotals('subscription');

  return (
    <div className="flex flex-col gap-4">
      {/* 구매 타입 선택 */}
      <div className="flex gap-4">
        <div
          className={`flex-1 p-4 border rounded-lg cursor-pointer ${purchaseType === 'oneTime' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
          onClick={() => onSelect('oneTime')}
        >
          <div className="text-center mb-2">일회성 구매</div>
          <div className="text-center text-lg font-bold">{oneTimeTotals.finalPrice.toLocaleString()}원</div>
        </div>

        <div
          className={`flex-1 p-4 border rounded-lg cursor-pointer ${purchaseType === 'subscription' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
          onClick={() => onSelect('subscription')}
        >
          <div className="text-center mb-2">정기 구독</div>
          <div className="text-center text-lg font-bold">{subscriptionTotals.finalPrice.toLocaleString()}원</div>
        </div>
      </div>

      {/* 선택된 옵션의 상세 정보 */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between mb-4">
          <span>총 상품 금액</span>
          <span>{purchaseType === 'oneTime' ? oneTimeTotals.totalPrice.toLocaleString() : subscriptionTotals.totalPrice.toLocaleString()}원</span>
        </div>

        {(purchaseType === 'oneTime' ? oneTimeTotals.shippingFee : subscriptionTotals.shippingFee) > 0 && (
          <div className="flex justify-between mb-4">
            <span>배송비</span>
            <span>{(purchaseType === 'oneTime' ? oneTimeTotals.shippingFee : subscriptionTotals.shippingFee).toLocaleString()}원</span>
          </div>
        )}

        {(purchaseType === 'oneTime' ? oneTimeTotals.discount : subscriptionTotals.discount) > 0 && (
          <div className="flex justify-between mb-4">
            <span>할인 금액</span>
            <span>-{(purchaseType === 'oneTime' ? oneTimeTotals.discount : subscriptionTotals.discount).toLocaleString()}원</span>
          </div>
        )}
      </div>

      {/* 결제하기 버튼 */}
      <button className="w-full bg-red-500 text-white p-4 rounded-lg">
        {(purchaseType === 'oneTime' ? oneTimeTotals.finalPrice : subscriptionTotals.finalPrice).toLocaleString()}원 | 결제하기
      </button>

      {/* 정기구독 혜택 안내 */}
      {purchaseType === 'subscription' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">정기 구독 혜택</h3>
          <ul className="list-disc pl-5">
            <li>3만원 이상 구매 시 3,000원 할인</li>
            <li>1만원 이상 구매 시 무료 배송</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CartSummary;