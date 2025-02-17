// src/slices/healthSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/utils/constants';
import { fetchWithAuth } from '@/features/auth/fetchWithAuth'; // fetchWithAuth 임포트

// 초기 상태 정의
const initialState = {
    history: [], // 건강 기록 리스트
    loading: false, // 로딩 상태
    error: null, // 에러 메시지
};

// 건강 기록 히스토리 조회를 위한 비동기 액션
export const fetchHealthHistory = createAsyncThunk(
    'health/fetchHealthHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(API_URL + 'recommendation/health-records'); // API_URL 사용, fetchWithAuth 사용
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch health history: ${response.status} - ${errorText}`);
            }
            const data = await response.json(); // 응답 데이터 파싱
            console.log('fetchHealthHistory.fulfilled payload:', data);
            return data; // 성공적으로 데이터를 반환
        } catch (error) {
            console.error('Error fetching health history:', error);
            return rejectWithValue(error.message);
        }
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
                state.loading = true; // 로딩 시작
                state.error = null; // 에러 초기화
                console.log('fetchHealthHistory.pending');
            })
            .addCase(fetchHealthHistory.fulfilled, (state, action) => {
                state.loading = false; // 로딩 종료
                state.history = action.payload; // 건강 기록 업데이트
                console.log('fetchHealthHistory.fulfilled:', action.payload);
            })
            .addCase(fetchHealthHistory.rejected, (state, action) => {
                state.loading = false; // 로딩 종료
                state.error = action.payload; // 에러 메시지 설정
                console.error('fetchHealthHistory.rejected:', action.payload);
            });
    },
});

// 기본 내보내기
export default healthSlice.reducer;
