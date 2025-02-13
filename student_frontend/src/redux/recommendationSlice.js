import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/features/auth/utils/fetchWithAuth';
import { API_URL } from '@/constant';

/**
 * 건강 분석 정보를 가져오는 비동기 액션 생성자
 */
export const fetchHealthAnalysis = createAsyncThunk(
  'recommendations/fetchHealthAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}recommendation/analysis`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        return data; // 전체 데이터 반환
      } else {
        return rejectWithValue(data.error || '건강 분석 정보를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 추천 영양 성분을 가져오는 비동기 액션 생성자
 */
export const fetchRecommendedIngredients = createAsyncThunk(
  'recommendations/fetchRecommendedIngredients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}recommendation/ingredients`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        return rejectWithValue(data.error || '추천 영양 성분을 가져오는데 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 추천 상품을 가져오는 비동기 액션 생성자
 */
export const fetchRecommendedProducts = createAsyncThunk(
  'recommendations/fetchRecommendedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}recommendation/products`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        return rejectWithValue(data.error || '추천 상품을 가져오는데 실패했습니다.');
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
    recommendedIngredients: [],
    recommendedProducts: [],
    loading: false,
    error: null,
    cartAddingStatus: 'idle', // 장바구니 상태 추가
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // 건강 분석 정보
      .addCase(fetchHealthAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.healthAnalysis = null; // 요청 시작 시 상태를 null로 초기화
      })
      .addCase(fetchHealthAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.healthAnalysis = action.payload;
      })
      .addCase(fetchHealthAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 추천 영양 성분
      .addCase(fetchRecommendedIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedIngredients = action.payload || [];
      })
      .addCase(fetchRecommendedIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 추천 상품
      .addCase(fetchRecommendedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedProducts = action.payload || [];
      })
      .addCase(fetchRecommendedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 장바구니 추가
      .addCase(addRecommendationsToCart.pending, (state) => {
        state.cartAddingStatus = 'loading';
        state.error = null;
      })
      .addCase(addRecommendationsToCart.fulfilled, (state) => {
        state.cartAddingStatus = 'succeeded';
      })
      .addCase(addRecommendationsToCart.rejected, (state, action) => {
        state.cartAddingStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export default recommendationSlice.reducer;
