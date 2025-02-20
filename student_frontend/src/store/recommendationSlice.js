import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';
import { API_URL } from "@/utils/constants";

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
                cache: 'no-cache' // 캐싱 방지
            });
            const data = await response.json();

            if (response.ok) {
                return data.healthAnalysis; // healthAnalysis만 반환
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
                cache: 'no-cache' // 캐싱 방지
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
                cache: 'no-cache' // 캐싱 방지
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
  async (cartItems, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}cart/add-multiple`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems),
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
        snackbarMessage: null, // 스낵바 메시지 상태 추가
    },

    reducers: {
        /**
         * 모든 추천 관련 상태를 초기화하는 리듀서
         */
        resetRecommendationState: (state) => {
            state.healthAnalysis = null;
            state.recommendedIngredients = [];
            state.recommendedProducts = [];
            state.loading = false;
            state.error = null;
            state.cartAddingStatus = 'idle';
            state.snackbarMessage = null;
        },
        /**
         * 스낵바 메시지를 초기화하는 리듀서
         */
        clearSnackbarMessage: (state) => {
            state.snackbarMessage = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // 건강 분석 정보 (원래 코드 그대로 유지)
            .addCase(fetchHealthAnalysis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHealthAnalysis.fulfilled, (state, action) => {
                state.loading = false;
                state.healthAnalysis = action.payload || null; // healthAnalysis 저장
            })
            .addCase(fetchHealthAnalysis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.snackbarMessage = action.payload; // 스낵바 메시지 설정
            })

            // 추천 영양 성분
            .addCase(fetchRecommendedIngredients.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.recommendedIngredients = []; // 요청 시작 시 상태를 빈 배열로 초기화
            })
            .addCase(fetchRecommendedIngredients.fulfilled, (state, action) => {
                state.loading = false;
                state.recommendedIngredients = action.payload || [];
            })
            .addCase(fetchRecommendedIngredients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.snackbarMessage = action.payload; // 스낵바 메시지 설정
            })

            // 추천 상품
            .addCase(fetchRecommendedProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.recommendedProducts = []; // 요청 시작 시 상태를 빈 배열로 초기화
            })
            .addCase(fetchRecommendedProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.recommendedProducts = action.payload || [];
            })
            .addCase(fetchRecommendedProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.snackbarMessage = action.payload; // 스낵바 메시지 설정
            })

            // 장바구니 추가
            .addCase(addRecommendationsToCart.pending, (state) => {
                state.cartAddingStatus = 'loading';
                state.error = null;
            })
            .addCase(addRecommendationsToCart.fulfilled, (state) => {
                state.cartAddingStatus = 'succeeded';
                state.snackbarMessage = '모든 추천 상품이 장바구니에 담겼습니다.'; // 스낵바 메시지 설정
            })
            .addCase(addRecommendationsToCart.rejected, (state, action) => {
                state.cartAddingStatus = 'failed';
                state.error = action.payload;
                state.snackbarMessage = action.payload; // 스낵바 메시지 설정
            });
    },
});

export const { resetRecommendationState, clearSnackbarMessage } = recommendationSlice.actions;
export default recommendationSlice.reducer;
