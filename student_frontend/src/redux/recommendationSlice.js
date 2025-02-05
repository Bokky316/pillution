import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@features/auth/utils/fetchWithAuth';
import { SERVER_URL } from "@/constant";

export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${SERVER_URL}api/recommendations`);
      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }
      const data = await response.json();
      console.log('Server response:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState: {
    items: {
      essential: [],
      additional: []
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recommendationSlice.reducer;
