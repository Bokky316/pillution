import React from 'react';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="cart-item">
      <span>{item.product.name}</span>
      <span>{item.product.price}원</span>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value))}
        min="1"
      />
      <button onClick={() => onRemove(item.id)}>삭제</button>
    </div>
  );
};

export default CartItem;
