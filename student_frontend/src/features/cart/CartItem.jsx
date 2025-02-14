import React from "react";
import Button from "@/components/Button";
import "@/styles/CartItem.css";

/**
 * CartItem 컴포넌트
 * 장바구니의 개별 아이템을 표시하고 관리하는 컴포넌트입니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.item - 장바구니 아이템 정보
 * @param {function} props.onSelect - 아이템 선택 핸들러
 * @param {function} props.onQuantityChange - 수량 변경 핸들러
 * @param {function} props.onRemove - 아이템 제거 핸들러
 * @returns {JSX.Element} 장바구니 아이템 컴포넌트
 */
const CartItem = ({ item, onSelect, onQuantityChange, onRemove }) => (
  <div className="cart-item">
    {/* 아이템 선택 체크박스 */}
    <input
      type="checkbox"
      className="item-select"
      checked={item.selected}
      onChange={() => onSelect(item.cartItemId)}
    />
    {/* 상품 이미지 */}
    <img src={item.image} alt={item.name} />
    <div className="item-info">
      {/* 상품명 */}
      <p className="item-name">{item.name}</p>
      {/* 상품 가격 */}
      <p className="item-price">{item.price.toLocaleString()}원</p>
      {/* 상품 옵션 */}
      <p className="item-option">[옵션: {item.option}]</p>
      {/* 수량 조절 컨트롤 */}
      <div className="quantity-control">
        {/* 수량 감소 버튼 */}
        <Button onClick={() => onQuantityChange(item.cartItemId, -1)} className="quantity-btn minus">–</Button>
        {/* 현재 수량 표시 */}
        <span className="quantity">{item.quantity}</span>
        {/* 수량 증가 버튼 */}
        <Button onClick={() => onQuantityChange(item.cartItemId, 1)} className="quantity-btn plus">+</Button>
      </div>
    </div>
    {/* 아이템 제거 버튼 */}
    <Button onClick={() => onRemove(item.cartItemId)} className="remove-btn">X</Button>
  </div>
);

export default CartItem;
