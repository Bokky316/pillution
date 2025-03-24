// src/store/deliverySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';

export const saveDeliveryInfo = createAsyncThunk(
  'delivery/saveDeliveryInfo',
  async (deliveryInfo, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}delivery-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryInfo),
      });
      if (!response.ok) throw new Error('Failed to save delivery info');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState: {
    deliveryInfos: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveDeliveryInfo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveDeliveryInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.deliveryInfos.push(action.payload);
      })
      .addCase(saveDeliveryInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default deliverySlice.reducer;
