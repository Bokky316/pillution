import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CartItem from "@/features/cart/CartItem";
import CartSummary from "@/features/cart/CartSummary";
import { fetchCartItems, updateCartItem, removeCartItem } from "@/store/cartSlice";
import "@/styles/CartPage.css";

/**
 * 장바구니 페이지 컴포넌트
 * 장바구니 아이템 목록을 표시하고 관리하는 기능을 제공합니다.
 */
const CartPage = () => {
  const dispatch = useDispatch();
  const { items: cartItems, status, error } = useSelector(state => state.cart);
  const [selectAll, setSelectAll] = useState(false);

  /**
   * 컴포넌트 마운트 시 장바구니 아이템을 불러옵니다.
   */
  useEffect(() => {
    console.log('fetchCartItems 디스패치됨');
    dispatch(fetchCartItems());
  }, [dispatch]);

  /**
   * 장바구니 아이템의 선택 상태에 따라 전체 선택 상태를 업데이트합니다.
   */
  useEffect(() => {
    const allSelected = cartItems.every(item => item.selected);
    setSelectAll(allSelected);
  }, [cartItems]);

  /**
   * 전체 선택/해제 처리 함수
   */
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    // 백엔드에 전체 선택/해제 요청을 보내는 로직 추가 필요
  };

  /**
   * 개별 아이템 선택/해제 처리 함수
   * @param {number} id - 장바구니 아이템 ID
   */
  const handleItemSelect = (id) => {
    // 백엔드에 개별 아이템 선택/해제 요청을 보내는 로직 추가 필요
  };

  /**
   * 아이템 수량 변경 처리 함수
   * @param {number} id - 장바구니 아이템 ID
   * @param {number} change - 변경할 수량
   */
  const handleQuantityChange = (cartItemId, change) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      dispatch(updateCartItem({ cartItemId, count: newQuantity }));
    }
  };


  /**
   * 아이템 제거 처리 함수
   * @param {number} id - 장바구니 아이템 ID
   */
  const handleRemoveItem = (id) => {
    dispatch(removeCartItem(id));
  };

  /**
   * 총 가격 계산
   */
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 3000; // 배송비

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

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
          {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              장바구니가 비어 있습니다.
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onSelect={handleItemSelect}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))
          )}
        </section>
        <CartSummary totalPrice={totalPrice} shippingFee={shippingFee} />
      </main>
    </div>
  );
};

export default CartPage;
