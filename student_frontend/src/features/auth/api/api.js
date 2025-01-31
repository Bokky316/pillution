// features/auth/api.js

import axios from 'axios';
import { API_URL } from '@/constant';

/**
 * Axios 인스턴스 생성
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * 에러 처리 함수
 * @param {Error} error API 호출 중 발생한 에러
 */
const handleError = (error) => {
  console.error('API 호출 오류:', error);
  if (error.response) {
    console.error('응답 코드:', error.response.status);
    console.error('응답 데이터:', error.response.data);
  }
  throw error;
};

/**
 * 설문 카테고리 데이터를 가져옵니다.
 * @returns {Promise<Array>} 설문 카테고리 배열
 */
export const getSurveyCategories = async () => {
  try {
    const response = await axiosInstance.get('survey/categories');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * 설문 응답 데이터를 제출합니다.
 * @param {Object} responses 사용자 응답 데이터
 * @returns {Promise<void>}
 */
export const submitSurveyResponses = async (responses) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('인증 토큰이 없습니다.');

    const response = await axiosInstance.post(
      'survey/submit',
      { responses },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * 추천 데이터를 가져옵니다.
 * @returns {Promise<Array>} 추천 데이터 배열
 */
export const getRecommendations = async () => {
  try {
    const response = await axiosInstance.get('recommendations');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};


// 제품 상세 정보를 가져오는 함수
export const getProductDetails = async (productId) => {
  try {
    const response = await axiosInstance.get(`products/${productId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 장바구니 아이템 목록을 가져오는 함수
export const getCartItems = async (memberId) => {
  try {
    const response = await axiosInstance.get(`cart/${memberId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 장바구니에 아이템을 추가하는 함수
export const addToCart = async (cartItem) => {
  try {
    await axiosInstance.post('cart/add', cartItem);
  } catch (error) {
    handleError(error);
  }
};

// 장바구니에서 아이템을 삭제하는 함수
export const removeFromCart = async (itemId) => {
  try {
    const response = await axiosInstance.delete(`cart/remove/${itemId}`);
    if (response.status !== 200) {
      throw new Error('Failed to remove item from cart');
    }
  } catch (error) {
    handleError(error);
  }
};

// 장바구니 아이템 수량을 업데이트하는 함수
export const updateCartItemQuantity = async (itemId, newQuantity) => {
  try {
    const response = await axiosInstance.put(`cart/update/${itemId}`, { quantity: newQuantity });
    if (response.status !== 200) {
      throw new Error('Failed to update cart item quantity');
    }
    return response.data;
  } catch (error) {
    handleError(error);
  }
};


