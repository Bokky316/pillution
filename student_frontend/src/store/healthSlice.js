import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth';

// 초기 상태 정의
const initialState = {
    history: [],
    selectedRecord: null,
    healthAnalysis: null,
    recommendedIngredients: [],
    recommendedProducts: [],
    loading: false,
    error: null,
};

// 건강 기록 히스토리 조회를 위한 비동기 액션
export const fetchHealthHistory = createAsyncThunk(
    'health/fetchHealthHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}recommendation/health-records`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch health history: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('fetchHealthHistory.fulfilled payload:', data);
            return data;
        } catch (error) {
            console.error('Error fetching health history:', error);
            return rejectWithValue(error.message);
        }
    }
);

// 특정 건강 기록 조회를 위한 비동기 액션
export const fetchHealthRecord = createAsyncThunk(
    'health/fetchHealthRecord',
    async (recordId, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}recommendation/health-records`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch health record: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('fetchHealthRecord.fulfilled payload:', data);
            const record = data.find(r => r.id === parseInt(recordId)); // 해당 ID의 기록 찾기

            if (record) {
                // 데이터 디스패치
                dispatch(setHealthAnalysis(record.healthAnalysis));
                dispatch(setRecommendedIngredients(record.recommendedIngredients));
                dispatch(setRecommendedProducts(record.productRecommendations));
            }
            return record; // 찾은 기록 반환
        } catch (error) {
            console.error('Error fetching health record:', error);
            return rejectWithValue(error.message);
        }
    }
);

// 슬라이스 생성
const healthSlice = createSlice({
    name: 'health',
    initialState,
    reducers: {
        // 액션 생성자 함수 정의
        setHealthAnalysis: (state, action) => {
            state.healthAnalysis = action.payload;
        },
        setRecommendedIngredients: (state, action) => {
            state.recommendedIngredients = action.payload;
        },
        setRecommendedProducts: (state, action) => {
            state.recommendedProducts = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHealthHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHealthHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
                console.log('fetchHealthHistory.fulfilled:', action.payload);
            })
            .addCase(fetchHealthHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('fetchHealthHistory.rejected:', action.payload);
            })
            .addCase(fetchHealthRecord.pending, (state) => {
                state.loading = true;
                state.error = null;
                console.log('fetchHealthRecord.pending');
            })
            .addCase(fetchHealthRecord.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRecord = action.payload;
                console.log('fetchHealthRecord.fulfilled:', action.payload);
            })
            .addCase(fetchHealthRecord.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('fetchHealthRecord.rejected:', action.payload);
            });
    },
});

// 액션 생성자 내보내기
export const { setHealthAnalysis, setRecommendedIngredients, setRecommendedProducts } = healthSlice.actions;

// 리듀서 내보내기
export default healthSlice.reducer;
