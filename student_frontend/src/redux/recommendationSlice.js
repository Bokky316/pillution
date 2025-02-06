import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/features/auth/utils/fetchWithAuth';
import { API_URL } from '@/constant';

/**
 * 건강 분석 및 추천 정보를 가져오는 비동기 액션 생성자
 * @type {AsyncThunk<any, void, {}>}
 */
export const fetchHealthAnalysisAndRecommendations = createAsyncThunk(
  'recommendations/fetchHealthAnalysisAndRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}health/analysis`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        return rejectWithValue(data.error || '건강 분석 및 추천을 가져오는데 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 건강 기록 히스토리를 가져오는 비동기 액션 생성자
 * @type {AsyncThunk<any, void, {}>}
 */
export const fetchHealthHistory = createAsyncThunk(
  'recommendations/fetchHealthHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}health/history`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        return rejectWithValue(data.error || '건강 기록을 가져오는데 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 추천 관련 상태를 관리하는 Redux 슬라이스
 */
const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState: {
    healthAnalysis: null,
    recommendations: { essential: [], additional: [] },
    recommendedIngredients: [],
    healthHistory: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthAnalysisAndRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthAnalysisAndRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.healthAnalysis = action.payload.healthAnalysis;
        state.recommendations = action.payload.recommendations;
        state.recommendedIngredients = action.payload.recommendedIngredients || [];
      })
      .addCase(fetchHealthHistory.fulfilled, (state, action) => {
        state.healthHistory = action.payload;
      })
      .addCase(fetchHealthAnalysisAndRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHealthHistory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default recommendationSlice.reducer;
