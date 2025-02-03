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

      if (data.length > 0) {
        dispatch(setCurrentCategoryIndex(0));
        dispatch(setCurrentSubCategoryIndex(0));
        // 첫 번째 서브카테고리의 질문들을 가져옵니다.
        const firstSubCategoryId = data[0].subCategories[0]?.id;
        if (firstSubCategoryId) {
          dispatch(fetchQuestions(firstSubCategoryId));
        }
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
      if (answer !== undefined && answer !== null && answer !== '') {
        state.responses[questionId] = answer;
      } else {
        delete state.responses[questionId];
      }
    },
    setCurrentCategoryIndex: (state, action) => {
      state.currentCategoryIndex = action.payload;
      state.currentSubCategoryIndex = 0; // 카테고리가 변경되면 서브카테고리 인덱스를 리셋합니다.
      state.questions = []; // 질문을 초기화합니다.
      state.responses = {}; // 응답을 초기화합니다.
    },
    setCurrentSubCategoryIndex: (state, action) => {
      state.currentSubCategoryIndex = action.payload;
      state.questions = []; // 질문을 초기화합니다.
      state.responses = {}; // 응답을 초기화합니다.
    },
    clearResponses: (state) => {
      state.responses = {};
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchQuestions.pending, (state) => {
        state.questionsLoading = true;
        state.questionsError = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        state.questions = action.payload;
        state.questionsError = null;
        state.responses = {}; // 새로운 질문을 가져올 때 이전 응답 초기화
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.questionsLoading = false;
        state.questionsError = action.payload;
      })
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

export const { updateResponse, setCurrentCategoryIndex, setCurrentSubCategoryIndex, clearResponses } = surveySlice.actions;
export default surveySlice.reducer;
