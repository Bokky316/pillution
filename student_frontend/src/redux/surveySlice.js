import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/features/auth/utils/fetchWithAuth';
import { SERVER_URL } from "@/constant";

export const fetchCategories = createAsyncThunk(
  'survey/fetchCategories',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('Fetching categories...');
      const response = await fetchWithAuth(`${SERVER_URL}api/survey/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      console.log('Categories fetched successfully:', data);

      // 첫 번째 카테고리와 서브카테고리 자동 선택
      if (data.length > 0) {
        dispatch(setCurrentCategoryIndex(0));
        dispatch(setCurrentSubCategoryIndex(0));
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuestions = createAsyncThunk(
  'survey/fetchQuestions',
  async (subCategoryId, { rejectWithValue }) => {
    try {
      console.log('Fetching questions for subCategoryId:', subCategoryId);
      const response = await fetchWithAuth(`${SERVER_URL}api/survey/subcategories/${subCategoryId}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      console.log('Questions fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const submitSurvey = createAsyncThunk(
  'survey/submitSurvey',
  async (submissionData, { rejectWithValue }) => {
    try {
      console.log('Submitting survey:', submissionData);
      const response = await fetchWithAuth(`${SERVER_URL}api/survey/submit`, {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });
      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }
      const data = await response.json();
      console.log('Survey submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to submit survey:', error);
      return rejectWithValue(error.message);
    }
  }
);

const surveySlice = createSlice({
  name: 'survey',
  initialState: {
    categories: [],
    currentCategoryIndex: null,
    currentSubCategoryIndex: null,
    questions: [],
    responses: {},
    categoriesLoading: false,
    categoriesError: null,
    questionsLoading: false,
    questionsError: null,
    submitLoading: false,
    submitError: null,
  },
  reducers: {
    updateResponse: (state, action) => {
      const { questionId, answer } = action.payload;
      state.responses[questionId] = answer;
    },
    setCurrentCategoryIndex: (state, action) => {
      state.currentCategoryIndex = action.payload;
    },
    setCurrentSubCategoryIndex: (state, action) => {
      state.currentSubCategoryIndex = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
        state.categoriesError = null;
        if (state.categories.length > 0) {
          state.currentCategoryIndex = 0;
          state.currentSubCategoryIndex = 0;
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })
      // fetchQuestions
      .addCase(fetchQuestions.pending, (state) => {
        state.questionsLoading = true;
        state.questionsError = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        state.questions = action.payload;
        state.questionsError = null;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.questionsLoading = false;
        state.questionsError = action.payload;
      })
      // submitSurvey
      .addCase(submitSurvey.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitSurvey.fulfilled, (state) => {
        state.submitLoading = false;
        state.responses = {};
        state.submitError = null;
      })
      .addCase(submitSurvey.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { updateResponse, setCurrentCategoryIndex, setCurrentSubCategoryIndex } = surveySlice.actions;
export default surveySlice.reducer;
