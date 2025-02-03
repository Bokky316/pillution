import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/features/auth/utils/fetchWithAuth';
import { SERVER_URL } from "@/constant";

export const fetchCategories = createAsyncThunk(
  'survey/fetchCategories',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${SERVER_URL}api/survey/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      if (data.length > 0) {
        dispatch(setCurrentCategoryIndex(0));
        dispatch(setCurrentSubCategoryIndex(0));
        const firstSubCategoryId = data[0].subCategories[0]?.id;
        if (firstSubCategoryId) {
          dispatch(fetchQuestions(firstSubCategoryId));
        }
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuestions = createAsyncThunk(
  'survey/fetchQuestions',
  async (subCategoryId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${SERVER_URL}api/survey/subcategories/${subCategoryId}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitSurvey = createAsyncThunk(
  'survey/submitSurvey',
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${SERVER_URL}api/survey/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      return await response.json();
    } catch (error) {
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
    gender: null,
    selectedSymptoms: [],
    filteredSubCategories: null,
  },
  reducers: {
    updateResponse: (state, action) => {
      const { questionId, answer } = action.payload;
      const question = state.questions.find(q => q.id === questionId);
      if (question) {
        if (question.questionType === 'MULTIPLE_CHOICE') {
          if (!Array.isArray(state.responses[questionId])) {
            state.responses[questionId] = [];
          }
          const index = state.responses[questionId].indexOf(answer);
          if (index > -1) {
            state.responses[questionId].splice(index, 1);
          } else {
            state.responses[questionId].push(answer);
          }
        } else {
          state.responses[questionId] = answer;
        }
        if (questionId === 2) {
          state.gender = answer === '1' ? 'female' : 'male';
        }
        if (question.questionText.includes('주요 증상') || question.questionText.includes('불편하거나 걱정되는 것')) {
          state.selectedSymptoms = Array.isArray(state.responses[questionId]) ?
            state.responses[questionId].slice(0, 3) : [state.responses[questionId]];
        }
      }
    },
    setCurrentCategoryIndex: (state, action) => {
      state.currentCategoryIndex = action.payload;
      state.currentSubCategoryIndex = 0;
      state.questions = [];
      state.responses = {};
      state.filteredSubCategories = null;
    },
    setCurrentSubCategoryIndex: (state, action) => {
      state.currentSubCategoryIndex = action.payload;
      state.questions = [];
      state.responses = {};
    },
    clearResponses: (state) => {
      state.responses = {};
    },
    filterSubCategories: (state, action) => {
      const selectedSymptoms = action.payload;
      const currentCategory = state.categories[state.currentCategoryIndex];
      if (currentCategory && currentCategory.name === "2. 증상·불편") {
        state.filteredSubCategories = currentCategory.subCategories.filter(sub =>
          sub.name === "주요 증상" ||
          sub.name === "추가 증상" ||
          selectedSymptoms.includes(sub.id)
        );
      } else {
        state.filteredSubCategories = null;
      }
    },
    setSelectedSymptoms: (state, action) => {
      state.selectedSymptoms = action.payload;
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
        state.responses = {};
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

export const {
  updateResponse,
  setCurrentCategoryIndex,
  setCurrentSubCategoryIndex,
  clearResponses,
  filterSubCategories,
  setSelectedSymptoms
} = surveySlice.actions;

export default surveySlice.reducer;
