import React from "react";
import Button from "@components/common/Button";
import "@styles/CartItem.css";


const CartItem = ({ item, onSelect, onQuantityChange, onRemove }) => (
  <div className="cart-item">
    <input
      type="checkbox"
      className="item-select"
      checked={item.selected}
      onChange={() => onSelect(item.id)}
    />
    <img src={item.image} alt={item.name} />
    <div className="item-info">
      <p className="item-name">{item.name}</p>
      <p className="item-price">{item.price.toLocaleString()}원</p>
      <p className="item-option">[옵션: {item.option}]</p>
      <div className="quantity-control">
        <Button onClick={() => onQuantityChange(item.id, -1)} className="quantity-btn minus">–</Button>
        <span className="quantity">{item.quantity}</span>
        <Button onClick={() => onQuantityChange(item.id, 1)} className="quantity-btn plus">+</Button>
      </div>
    </div>
    <Button onClick={() => onRemove(item.id)} className="remove-btn">X</Button>
  </div>
);

export default CartItem;
