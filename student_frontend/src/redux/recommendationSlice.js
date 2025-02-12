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
        body: JSON.stringify({ products }), // 상품 데이터를 서버로 전송
      });

      if (response.ok) {
        return await response.json(); // 성공 시 서버 응답 데이터 반환
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
    recommendations: {}, // 백엔드 응답 구조에 맞게 빈 객체로 초기화
    recommendedIngredients: { essential: [], additional: [] },
    healthHistory: [],
    loading: false,
    error: null,
  },

  reducers: {},
  extraReducers: (builder) => {
    builder
      // 건강 분석 및 추천 정보 요청 시작
      .addCase(fetchHealthAnalysisAndRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // 건강 분석 및 추천 정보 요청 성공
      .addCase(fetchHealthAnalysisAndRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.healthAnalysis = action.payload.healthAnalysis;
        state.recommendations = action.payload.recommendations;
        state.recommendedIngredients = action.payload.recommendedIngredients || { essential: [], additional: [] };
      })
      // 건강 기록 히스토리 요청 성공
      .addCase(fetchHealthHistory.fulfilled, (state, action) => {
        state.healthHistory = action.payload;
      })
      // 건강 분석 및 추천 정보 요청 실패
      .addCase(fetchHealthAnalysisAndRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 건강 기록 히스토리 요청 실패
      .addCase(fetchHealthHistory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 추천 상품 장바구니 추가 시작
      .addCase(addRecommendationsToCart.pending, (state) => {
        state.loading = true; // 로딩 상태 활성화
        state.error = null;   // 이전 에러 초기화
      })

      // 추천 상품 장바구니 추가 성공
      .addCase(addRecommendationsToCart.fulfilled, (state) => {
        state.loading = false; // 로딩 상태 비활성화
        // 성공 시 별도 상태 변경은 필요하지 않음
      })

      // 추천 상품 장바구니 추가 실패
      .addCase(addRecommendationsToCart.rejected, (state, action) => {
        state.loading = false; // 로딩 상태 비활성화
        state.error = action.payload; // 에러 메시지 저장
      });
  },
});

export default recommendationSlice.reducer;
