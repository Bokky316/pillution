import React from "react";
import Button from "@/components/Button";
import "@/styles/CartItem.css";

const CartSummary = ({ totalPrice, shippingFee }) => {
  const totalPayment = totalPrice + shippingFee;

  return (
    <aside className="cart-summary">
      <h3>ORDER</h3>
      <div className="summary-row">
        <span>총 상품 금액</span>
        <span>{totalPrice.toLocaleString()}원</span>
      </div>
      <div className="summary-row">
        <span>배송비</span>
        <span>+ {shippingFee.toLocaleString()}원</span>
      </div>
      <div className="summary-row total">
        <span>결제 예정 금액</span>
        <span>{totalPayment.toLocaleString()}원</span>
      </div>
      <Button className="checkout-btn">결제하기</Button>
    </aside>
  );
};

export default CartSummary;
