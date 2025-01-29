import axios from 'axios';

const API_URL = '/api/cart'; // 실제 백엔드 API 엔드포인트로 변경

export const getCartItems = async () => {
    const response = await axios.get(API_URL);
    return response.data; // 장바구니 아이템 목록 반환
};

export const updateCartItem = async (id, updateData) => {
    const response = await axios.put(`${API_URL}/${id}`, updateData);
    return response.data; // 업데이트된 아이템 반환
};

export const removeCartItem = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data; // 삭제 결과 반환
};
