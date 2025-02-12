import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/features/auth/utils/fetchWithAuth';
import { API_URL } from '@/constant';

/**
 * 건강 분석 및 추천 정보를 가져오는 비동기 액션 생성자
 */
export const fetchHealthAnalysisAndRecommendations = createAsyncThunk(
  'recommendations/fetchHealthAnalysisAndRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}recommendation/analysis`, {
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
 */
export const fetchHealthHistory = createAsyncThunk(
  'recommendations/fetchHealthHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}recommendation/history`, {
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
 * 추천 상품을 장바구니에 추가하는 비동기 액션 생성자
 */
export const addRecommendationsToCart = createAsyncThunk(
  'recommendations/addRecommendationsToCart',
  async (products, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}cart/add-multiple`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || '추천 상품을 장바구니에 추가하는데 실패했습니다.');
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
    recommendations: [],
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
          state.healthAnalysis = action.payload.healthAnalysis || null;
          state.recommendations = action.payload.recommendations || [];
          state.recommendedIngredients = action.payload.recommendedIngredients || [];
      })
      .addCase(fetchHealthAnalysisAndRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHealthHistory.fulfilled, (state, action) => {
        state.healthHistory = action.payload || [];
      })
      .addCase(fetchHealthHistory.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addRecommendationsToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRecommendationsToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addRecommendationsToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recommendationSlice.reducer;
