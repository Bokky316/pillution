import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import { API_URL } from "@/constant";

export const fetchCategories = createAsyncThunk(
  "survey/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}survey/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Raw categories data:", data);
      return data;
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuestions = createAsyncThunk(
  "survey/fetchQuestions",
  async (subCategoryId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}survey/subcategories/${subCategoryId}/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Raw questions data:", data);
      return data;
    } catch (error) {
      console.error('질문 조회 실패:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const submitSurvey = createAsyncThunk(
  "survey/submitSurvey",
  async (responses, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}survey/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서베이 제출 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('서베이 제출 실패:', error);
      return rejectWithValue(error.message);
    }
  }
);

const surveySlice = createSlice({
  name: "survey",
  initialState: {
    categories: [],
    questions: [],
    responses: {},
    currentCategoryIndex: 0,
    currentSubCategoryIndex: 0,
    gender: null,
    selectedSymptoms: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateResponse: (state, action) => {
      const { questionId, answer } = action.payload;
      state.responses[questionId] = answer;
    },
    setGender: (state, action) => {
      state.gender = action.payload;
    },
    setSelectedSymptoms: (state, action) => {
      state.selectedSymptoms = action.payload;
    },
    setCurrentCategoryIndex: (state, action) => {
      state.currentCategoryIndex = action.payload;
    },
    setCurrentSubCategoryIndex: (state, action) => {
      state.currentSubCategoryIndex = action.payload;
    },
    filterSubCategories: (state, action) => {
      const { categoryIndex, selectedSymptoms } = action.payload;
      state.categories[categoryIndex].subCategories = state.categories[categoryIndex].subCategories.filter(sub =>
        sub.name === "주요 증상" ||
        sub.name === "추가 증상" ||
        selectedSymptoms.includes(sub.name)
      );
    },
    clearResponses: (state) => {
      state.responses = {};
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
      });
  },
});

export const {
  updateResponse,
  setGender,
  setSelectedSymptoms,
  setCurrentCategoryIndex,
  setCurrentSubCategoryIndex,
  filterSubCategories,
  clearResponses,
  setCategories
} = surveySlice.actions;

export default surveySlice.reducer;
