import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 초기 상태 정의
const initialState = {
    history: [],
    loading: false,
    error: null,
};

// 건강 기록 히스토리 조회를 위한 비동기 액션
export const fetchHealthHistory = createAsyncThunk(
    'health/fetchHealthHistory',
    async () => {
        const response = await fetch('/api/recommendation/history');
        if (!response.ok) {
            throw new Error('건강 기록을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        return data; // 성공적으로 데이터를 반환
    }
);

// 슬라이스 생성
const healthSlice = createSlice({
    name: 'health',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHealthHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHealthHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchHealthHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

// 기본 내보내기
export default healthSlice.reducer;
