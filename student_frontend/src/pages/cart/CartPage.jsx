import React, { useState, useEffect } from "react";
import CartItem from "@features/cart/CartItem";
import CartSummary from "@features/cart/CartSummary";
import "@styles/CartPage.css";


const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    const allSelected = cartItems.every(item => item.selected);
    setSelectAll(allSelected);
  }, [cartItems]);

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const items = await getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(cartItems.map(item => ({ ...item, selected: newSelectAll })));
  };

  const handleItemSelect = async (id) => {
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    setCartItems(updatedItems);
    try {
      await updateCartItem(id, { selected: !cartItems.find(item => item.id === id).selected });
    } catch (error) {
      console.error('Failed to update item selection:', error);
    }
  };

  const handleQuantityChange = async (id, change) => {
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    );
    setCartItems(updatedItems);
    try {
      const updatedItem = updatedItems.find(item => item.id === id);
      await updateCartItem(id, { quantity: updatedItem.quantity });
    } catch (error) {
      console.error('Failed to update item quantity:', error);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeCartItem(id);
      setCartItems(cartItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 3000;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="cart-page">
      <h2>CART</h2>
      <main className="cart-container">
        <section className="cart-items">
          <div className="select-all-container">
            <input
              type="checkbox"
              id="select-all"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="checkbox-label">전체 선택</label>
          </div>
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onSelect={handleItemSelect}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
          ))}
        </section>
        <CartSummary totalPrice={totalPrice} shippingFee={shippingFee} />
      </main>
    </div>
  );
};

export default CartPage;
