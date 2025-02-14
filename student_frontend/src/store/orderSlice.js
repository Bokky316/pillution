import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';

/**
 * 주문을 생성하는 비동기 액션
 * @param {Object} orderDto - 주문 생성에 필요한 데이터
 * @returns {Promise<Object>} 생성된 주문 정보
 */
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderDto, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDto),
      });
      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 주문 내역을 조회하는 비동기 액션
 * @param {number} page - 조회할 페이지 번호 (기본값: 0)
 * @returns {Promise<Object>} 주문 내역 정보
 */
export const fetchOrderHistory = createAsyncThunk(
  'order/fetchOrderHistory',
  async (page = 0, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch order history');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 주문을 취소하는 비동기 액션
 * @param {number} orderId - 취소할 주문 ID
 * @returns {Promise<number>} 취소된 주문 ID
 */
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to cancel order');
      return orderId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 주문 슬라이스
 * 주문 관련 상태와 액션을 관리합니다.
 */
const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchOrderHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.content;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.orders.findIndex(order => order.id === action.payload);
        if (index !== -1) {
          state.orders[index].status = 'CANCELED';
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
