import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CartItem from "@/features/cart/CartItem";
import CartSummary from "@/features/cart/CartSummary";
import { fetchCartItems, updateCartItem, removeCartItem, selectCartItem, selectAllCartItems } from "@/store/cartSlice";
import "@/styles/CartPage.css";

/**
 * 장바구니 페이지 컴포넌트
 * 장바구니 아이템 목록을 표시하고 관리하는 기능을 제공합니다.
 * @returns {JSX.Element} 장바구니 페이지 컴포넌트
 */
const CartPage = () => {
  const dispatch = useDispatch();
  const { items: cartItems, status, error } = useSelector(state => state.cart);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPurchaseType, setSelectedPurchaseType] = useState(null);

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
    dispatch(selectAllCartItems(newSelectAll));
  };

  /**
   * 개별 아이템 선택/해제 처리 함수
   * @param {number} cartItemId - 장바구니 아이템 ID
   */
  const handleItemSelect = (cartItemId) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (item) {
      dispatch(selectCartItem({ cartItemId, selected: !item.selected }));
    }
  };

  /**
   * 아이템 수량 변경 처리 함수
   * @param {number} cartItemId - 장바구니 아이템 ID
   * @param {number} change - 변경할 수량
   */
  const handleQuantityChange = async (cartItemId, change) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      try {
        await dispatch(updateCartItem({ cartItemId, count: newQuantity })).unwrap();
        dispatch(fetchCartItems());
      } catch (error) {
        console.error('Failed to update cart item:', error);
      }
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
   * 구매 유형 선택 처리 함수
   * @param {string} type - 선택된 구매 유형 ('oneTime' 또는 'subscription')
   */
  const handlePurchaseTypeSelect = (type) => {
    setSelectedPurchaseType(type);
  };

  /**
   * 결제 처리 함수
   */
  const handleCheckout = () => {
    if (selectedPurchaseType) {
      console.log(`Proceeding to checkout with ${selectedPurchaseType} purchase type`);
      // 여기에 결제 로직 추가
    } else {
      alert("구매 유형을 선택해주세요.");
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div className="cart-page">
      <h2>CART</h2>
      <main className="cart-container">
        <section className="cart-items">
          {/* 전체 선택 체크박스 */}
          <div className="select-all-container">
            <input
              type="checkbox"
              id="select-all"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="checkbox-label">전체 선택</label>
          </div>
          {/* 장바구니 아이템 목록 */}
          {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              장바구니가 비어 있습니다.
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.cartItemId}
                item={item}
                onSelect={() => handleItemSelect(item.cartItemId)}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))
          )}
        </section>
        {/* 구매 유형 선택 (카트 서머리) */}
        <div className="purchase-type-selection">
          <CartSummary
            cartItems={cartItems}
            purchaseType="oneTime"
            isSelected={selectedPurchaseType === 'oneTime'}
            onSelect={() => handlePurchaseTypeSelect('oneTime')}
          />
          <CartSummary
            cartItems={cartItems}
            purchaseType="subscription"
            isSelected={selectedPurchaseType === 'subscription'}
            onSelect={() => handlePurchaseTypeSelect('subscription')}
          />
        </div>
        {/* 결제하기 버튼 */}
        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={!selectedPurchaseType}
        >
          결제하기
        </button>
      </main>
    </div>
  );
};

export default CartPage;
