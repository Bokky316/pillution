import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // API 기본 URL

// 추천 데이터를 가져오는 함수
export const getRecommendations = async (memberId) => {
  const response = await axios.get(`${API_BASE_URL}/recommendations/${memberId}`);
  return response.data;
};

// 제품 상세 정보를 가져오는 함수
export const getProductDetails = async (productId) => {
  const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
  return response.data;
};

// 장바구니 아이템 목록을 가져오는 함수
export const getCartItems = async (memberId) => {
  const response = await axios.get(`${API_BASE_URL}/cart/${memberId}`);
  return response.data;
};

// 장바구니에 아이템을 추가하는 함수
export const addToCart = async (cartItem) => {
  await axios.post(`${API_BASE_URL}/cart/add`, cartItem);
};

// 장바구니에서 아이템을 삭제하는 함수
export const removeFromCart = async (itemId) => {
  const response = await axios.delete(`${API_BASE_URL}/cart/remove/${itemId}`);
  if (!response.status === 200) {
    throw new Error('Failed to remove item from cart');
  }
};

// 장바구니 아이템 수량을 업데이트하는 함수
export const updateCartItemQuantity = async (itemId, newQuantity) => {
  const response = await axios.put(`${API_BASE_URL}/cart/update/${itemId}`, { quantity: newQuantity });
  if (response.status !== 200) {
    throw new Error('Failed to update cart item quantity');
  }
  return response.data;
};

