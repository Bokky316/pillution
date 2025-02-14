import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItem from "@features/cart/CartItem";
import { updateItemQuantity, removeItem, updateItemSelection, initializeCart } from "../../redux/cartSlice";
import { fetchWithAuth } from "../../features/auth/utils/fetchWithAuth";
import { API_URL } from "../../constant";
import { fetchUserInfo } from "../../redux/authSlice";

const CartPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [isAllChecked, setAllChecked] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

    const fetchCartData = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}api/cart/${user.id}`);
        if (response.ok) {
          const cartData = await response.json();
          dispatch(initializeCart(cartData));
        }
      } catch (error) {
        console.error("장바구니 데이터 로드 실패:", error);
      }
    };

    fetchCartData();
  }, [isLoggedIn, user, navigate, dispatch]);

  useEffect(() => {
    const allChecked = cartItems.every(item => item.selected);
    setAllChecked(allChecked);
    calculateTotalPrice();
  }, [cartItems]);

  useEffect(() => {
    const allChecked = cartItems.every(item => item.selected);
    setAllChecked(allChecked);
    calculateTotalPrice();
  }, [cartItems]);

  const handleAllCheck = () => {
    const newSelectedState = !isAllChecked;
    setAllChecked(newSelectedState);
    cartItems.forEach(item => {
      dispatch(updateItemSelection({ id: item.id, selected: newSelectedState }));
    });
  };

  const handleItemSelect = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      dispatch(updateItemSelection({ id: id, selected: !item.selected }));
    }
  };

  const handleQuantityChange = (id, change) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      dispatch(updateItemQuantity({ id: id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeItem(id));
  };

  const calculateTotalPrice = () => {
    const total = cartItems.reduce((sum, item) => {
      if (item.selected) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
    setTotalPrice(total);
  };

  const shippingFee = 3000;

  return (
    <div style={{ width: "100%", maxWidth: "500px", margin: "auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px" }}>CART</h2>
      <main style={{ background: "#fff", borderRadius: "8px", padding: "20px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>
          <input type="checkbox" id="select-all" checked={isAllChecked} onChange={handleAllCheck} />
          <label htmlFor="select-all">전체 선택</label>
        </div>

        <section style={{ borderBottom: "1px solid #ddd", paddingBottom: "15px" }}>
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={{
                ...item,
                totalPrice: item.price * item.quantity
              }}
              onSelect={() => handleItemSelect(item.id)}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              style={{ position: "relative" }}
            />
          ))}
        </section>

        <button
          style={{
            width: "100%",
            background: "#ff5a5f",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            marginTop: "10px"
          }}
        >
          + 제품 추가
        </button>

        {/* 전체 금액 */}
        <div style={{ marginTop: "20px", borderTop: "1px solid #ddd", paddingTop: "15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              전체 금액
              <span
                style={{ fontSize: "14px", cursor: "pointer" }}
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "▲" : "▼"}
              </span>
            </span>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>{(totalPrice + shippingFee).toLocaleString()}원</span>
          </div>

          {showDetails && (
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span>총 제품 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span>기본 배송비</span>
                <span>{shippingFee.toLocaleString()}원</span>
              </div>
              <div style={{ fontSize: "12px", color: "#777", marginTop: "5px", lineHeight: "1.4" }}>
                · 정기구독 : 1만원 이상 무료배송 <br />
                · 한 번만 구매하기 : 배송비 3,000원
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CartPage;
