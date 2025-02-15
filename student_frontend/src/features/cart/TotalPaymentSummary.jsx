import React from 'react';
import '@/styles/TotalPaymentSummary.css';

const TotalPaymentSummary = ({ cartItems, purchaseType }) => {
  const calculateTotal = () => {
    let totalPrice = 0;
    let shippingFee = 0;
    let discount = 0;

    // 선택된 상품만 계산에 포함
    cartItems.filter(item => item.selected).forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    if (purchaseType === 'oneTime') {
      shippingFee = totalPrice >= 30000 ? 0 : 3000;
    } else if (purchaseType === 'subscription') {
      if (totalPrice >= 30000) {
        discount = 3000;
      }
      shippingFee = totalPrice >= 10000 ? 0 : 3000;
    }

    const finalPrice = totalPrice - discount + shippingFee;

    return { totalPrice, shippingFee, discount, finalPrice };
  };

  const { totalPrice, shippingFee, discount, finalPrice } = calculateTotal();

  return (
    <div className="total-payment-summary">
      <h3>총 결제 금액</h3>
      <div className="summary-row">
        <span>총 상품 금액</span>
        <span>{totalPrice.toLocaleString()}원</span>
      </div>
      <div className="summary-row">
        <span>배송비</span>
        <span>{shippingFee > 0 ? `+${shippingFee.toLocaleString()}원` : '무료'}</span>
      </div>
      {discount > 0 && (
        <div className="summary-row discount">
          <span>할인 금액</span>
          <span>-{discount.toLocaleString()}원</span>
        </div>
      )}
      <div className="summary-row total">
        <span>최종 결제 금액</span>
        <span>{finalPrice.toLocaleString()}원</span>
      </div>
    </div>
  );
};

export default TotalPaymentSummary;
