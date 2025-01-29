import React, { useState, useEffect } from 'react';
import { getCartItems, removeFromCart, updateCartItemQuantity } from '../../features/auth/api/api';
import CartItem from '../../features/cart/CartItem';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const data = await getCartItems();
      setCartItems(data);
    } catch (error) {
      console.error('장바구니 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      fetchCartItems();
    } catch (error) {
      console.error('장바구니 아이템 삭제 중 오류 발생:', error);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      fetchCartItems();
    } catch (error) {
      console.error('장바구니 아이템 수량 업데이트 중 오류 발생:', error);
    }
  };

  return (
    <div className="cart-page">
      <h1>장바구니</h1>
      {cartItems.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
        />
      ))}
    </div>
  );
};

export default CartPage;
