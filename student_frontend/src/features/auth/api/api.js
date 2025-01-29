import axios from 'axios';

const API_BASE_URL = '<http://localhost:8080/api>';

export const getRecommendations = async (memberId) => {
  const response = await axios.get(`${API_BASE_URL}/recommendations/${memberId}`);
  return response.data;
};

export const getProductDetails = async (productId) => {
  const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
  return response.data;
};

export const getCartItems = async (memberId) => {
  const response = await axios.get(`${API_BASE_URL}/cart/${memberId}`);
  return response.data;
};

export const addToCart = async (cartItem) => {
  await axios.post(`${API_BASE_URL}/cart/add`, cartItem);
};