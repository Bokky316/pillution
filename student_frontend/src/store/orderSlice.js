import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';

/**
 * 주문을 생성하는 비동기 액션
 * @param {Object} orderData - 주문 생성에 필요한 데이터 (cartOrderItems, buyerName, etc.)
 * @param {string} purchaseType - 구매 유형 (일회성 또는 구독)
 * @returns {Promise<Object>} 생성된 주문 정보
 */
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async ({ orderData, purchaseType }, { rejectWithValue }) =>  {
        try {
            // purchaseType을 쿼리 파라미터로 추가
             const response = await fetchWithAuth(`${API_URL}orders?purchaseType=${purchaseType}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData), // orderData 사용
                      });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create order: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('createOrder.fulfilled payload:', data);
            return data;
        } catch (error) {
            console.error('Error creating order:', error);
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
            const response = await fetchWithAuth(`${API_URL}orders?page=${page}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch order history: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('fetchOrderHistory.fulfilled payload:', data);
            return data;
        } catch (error) {
            console.error('Error fetching order history:', error);
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
            const response = await fetchWithAuth(`${API_URL}orders/${orderId}/cancel`, {
                method: 'POST',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to cancel order: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('cancelOrder.fulfilled payload:', data);
            return orderId;
        } catch (error) {
            console.error('Error cancelling order:', error);
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
                console.log('createOrder.pending');
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
                state.orders.unshift(action.payload);
                console.log('createOrder.fulfilled:', action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                console.error('createOrder.rejected:', action.payload);
            })
            .addCase(fetchOrderHistory.pending, (state) => {
                state.status = 'loading';
                console.log('fetchOrderHistory.pending');
            })
            .addCase(fetchOrderHistory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload.content;
                console.log('fetchOrderHistory.fulfilled:', action.payload);
            })
            .addCase(fetchOrderHistory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                console.error('fetchOrderHistory.rejected:', action.payload);
            })
            .addCase(cancelOrder.pending, (state) => {
                state.status = 'loading';
                console.log('cancelOrder.pending');
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.orders.findIndex(order => order.id === action.payload);
                if (index !== -1) {
                    state.orders[index].status = 'CANCELED';
                }
                console.log('cancelOrder.fulfilled:', action.payload);
            })
            .addCase(cancelOrder.rejected, (state) => {
                state.status = 'failed';
                state.error = action.payload;
                console.error('cancelOrder.rejected:', action.payload);
            });
    },
});

export default orderSlice.reducer;
