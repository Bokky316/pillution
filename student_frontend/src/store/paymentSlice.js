import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';

/**
 * 가맹점 ID를 가져오는 비동기 액션
 * @returns {Promise<Object>} 가맹점 ID 정보
 */
export const fetchMerchantId = createAsyncThunk(
  'payment/fetchMerchantId',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}payments/merchant-id`);
      if (!response.ok) throw new Error('Failed to fetch merchant ID');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 결제를 처리하는 비동기 액션
 * @param {Object} payload - 결제 요청 정보와 구매 유형
 * @param {Object} payload.paymentRequestDto - 결제 요청 정보
 * @param {string} payload.purchaseType - 구매 유형 (일회성 또는 구독)
 * @returns {Promise<Object>} 결제 처리 결과
 */
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async ({ paymentRequestDto, purchaseType }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}payments/request?purchaseType=${purchaseType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequestDto),
      });
      if (!response.ok) throw new Error('Failed to process payment');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 결제 슬라이스
 * 결제 관련 상태와 액션을 관리합니다.
 */
const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    merchantId: null,
    paymentResult: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMerchantId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMerchantId.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(fetchMerchantId.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(processPayment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.paymentResult = action.payload;
      })
      .addCase(processPayment.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default paymentSlice.reducer;
