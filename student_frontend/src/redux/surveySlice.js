import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "../constant";

// 서베이 응답 제출을 위한 비동기 액션
export const submitSurvey = createAsyncThunk(
    "survey/submitSurvey",
    async (surveyResponses, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}survey/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(surveyResponses),
            });
            if (!response.ok) {
                throw new Error("서베이 제출 실패");
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 추천 제품 조회를 위한 비동기 액션
export const fetchRecommendations = createAsyncThunk(
    "survey/fetchRecommendations",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_URL}recommendations`);
            if (!response.ok) {
                throw new Error("추천 제품 조회 실패");
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const surveySlice = createSlice({
    name: "survey",
    initialState: {
        responses: {},
        recommendations: [],
        loading: false,
        error: null,
    },
    reducers: {
        updateResponse: (state, action) => {
            const { questionId, answer } = action.payload;
            state.responses[questionId] = answer;
        },
        clearResponses: (state) => {
            state.responses = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitSurvey.pending, (state) => {
                state.loading = true;
            })
            .addCase(submitSurvey.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(submitSurvey.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchRecommendations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRecommendations.fulfilled, (state, action) => {
                state.loading = false;
                state.recommendations = action.payload;
                state.error = null;
            })
            .addCase(fetchRecommendations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { updateResponse, clearResponses } = surveySlice.actions;

export default surveySlice.reducer;
