import React from "react";
import "@/styles/CartSummary.css";

const CartSummary = ({ cartItems, purchaseType, isSelected, onSelect }) => {
  const calculateTotals = () => {
    let totalPrice = 0;
    let shippingFee = 0;
    let discount = 0;

    // 선택된 상품만 계산에 포함
    cartItems.filter(item => item.selected).forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    if (purchaseType === 'oneTime') {
      shippingFee = 3000;
    } else if (purchaseType === 'subscription') {
      if (totalPrice >= 30000) {
        discount = 3000;
      }
      if (totalPrice >= 10000) {
        shippingFee = 0;
      } else {
        shippingFee = 3000;
      }
    }

    return {
      totalPrice,
      shippingFee,
      discount,
      finalPrice: totalPrice - discount + shippingFee
    };
  };

  const { totalPrice, shippingFee, discount, finalPrice } = calculateTotals();

  return (
    <div className={`type-button ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="total-amount-header">
        <h3>{purchaseType === 'oneTime' ? '일회성 구매' : '정기 구독'}</h3>
      </div>

      <div className="total-amount-content">
        <div className="amount-row">
          <span>총 상품 금액</span>
          <span>{totalPrice.toLocaleString()}원</span>
        </div>

        <div className="amount-row">
          <span>배송비</span>
          <span>{shippingFee > 0 ? `+${shippingFee.toLocaleString()}원` : '무료'}</span>
        </div>

        {discount > 0 && (
          <div className="amount-row discount">
            <span>할인 금액</span>
            <span>-{discount.toLocaleString()}원</span>
          </div>
        )}

        <div className="amount-row">
          <span>결제 예정 금액</span>
          <span className="price">{finalPrice.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
