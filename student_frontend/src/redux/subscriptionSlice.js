import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

export const fetchSubscription = createAsyncThunk(
  "subscription/fetchSubscription",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState(); // Redux에서 로그인된 유저 정보 가져오기
      if (!auth.user) throw new Error("로그인이 필요합니다.");

      const response = await fetchWithAuth(`${API_URL}subscription?memberId=${auth.user.id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "구독 정보를 불러오지 못했습니다.");
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "subscription/updateSubscription",
  async (updatedData) => {
    const response = await fetchWithAuth(`${API_URL}subscription/update-items`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });
    return response.json();
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancelSubscription",
  async (immediately) => {
    const response = await fetchWithAuth(`${API_URL}subscription/cancel`, {
      method: "DELETE",
      body: JSON.stringify({ immediately }),
    });
    return response.json();
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
