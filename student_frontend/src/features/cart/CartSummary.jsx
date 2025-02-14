import React from "react";
import "@/styles/CartItem.css";

/**
 * 장바구니 요약 컴포넌트
 * 장바구니 아이템들의 총 금액, 배송비, 할인, 최종 결제 금액을 계산하고 표시합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.cartItems - 장바구니 아이템 배열
 * @param {string} props.purchaseType - 구매 유형 ('oneTime' 또는 'subscription')
 * @param {boolean} props.isSelected - 현재 선택된 구매 유형인지 여부
 * @param {function} props.onSelect - 구매 유형 선택 핸들러
 * @returns {JSX.Element} 장바구니 요약 컴포넌트
 */
const CartSummary = ({ cartItems, purchaseType, isSelected, onSelect }) => {
  const calculateTotals = () => {
    let totalPrice = 0;
    let shippingFee = 0;
    let discount = 0;

    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;
    });

    if (purchaseType === 'oneTime') {
      shippingFee = 3000; // 일회성 구매는 항상 배송비 3000원
    } else if (purchaseType === 'subscription') {
      if (totalPrice >= 30000) {
        discount += 3000; // 3만원 이상 구독 시 3000원 할인
      }
      if (totalPrice >= 10000) {
        shippingFee = 0; // 1만원 이상 구독 시 무료 배송
      }
    }

    const finalPrice = totalPrice - discount + shippingFee;

    return { totalPrice, shippingFee, discount, finalPrice };
  };

  const { totalPrice, shippingFee, discount, finalPrice } = calculateTotals();

  return (
    <div className={`cart-summary ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      <h3>{purchaseType === 'oneTime' ? '일회성 구매' : '정기 구독'}</h3>
      <div className="summary-row">
        <span>총 상품 금액</span>
        <span>{totalPrice.toLocaleString()}원</span>
      </div>
      <div className="summary-row">
        <span>배송비</span>
        <span>{shippingFee > 0 ? `+ ${shippingFee.toLocaleString()}원` : '무료'}</span>
      </div>
      {discount > 0 && (
        <div className="summary-row discount">
          <span>할인 금액</span>
          <span>- {discount.toLocaleString()}원</span>
        </div>
      )}
      <div className="summary-row total">
        <span>결제 예정 금액</span>
        <span>{finalPrice.toLocaleString()}원</span>
      </div>
      {purchaseType === 'subscription' && (
        <div className="subscription-benefits">
          <h4>정기 구독 혜택</h4>
          <ul>
            <li>3만원 이상 구매 시 3,000원 할인</li>
            <li>1만원 이상 구매 시 무료 배송</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
