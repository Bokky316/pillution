import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constant";
import { fetchWithAuth } from "../common/fetchWithAuth";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const data = await getCartItems(1); // 임시 멤버 ID 사용
        setCartItems(data);
      } catch (error) {
        console.error('장바구니 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchCartItems();
  }, []);

  return (
    <div>
      <h1>장바구니</h1>
      {cartItems.map((item) => (
        <div key={item.id}>
          <span>{item.product.name}</span> -
          <span>{item.quantity}개</span> -
          <span>{item.product.price * item.quantity}원</span>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
