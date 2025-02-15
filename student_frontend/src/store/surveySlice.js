import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@features/auth/fetchWithAuth';
import { SERVER_URL } from "@/utils/constants";

export const fetchCategories = createAsyncThunk(
  'survey/fetchCategories',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${SERVER_URL}api/survey/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();

      console.log('페치된 카테고리:', data);

      // 각 카테고리의 하위 카테고리에 질문 로드
      const categoriesWithQuestions = await Promise.all(data.map(async (category) => {
        const subCategoriesWithQuestions = await Promise.all(category.subCategories.map(async (subCategory) => {
          try {
            const questionsResponse = await fetchWithAuth(`${SERVER_URL}api/survey/subcategories/${subCategory.id}/questions`);
            const questions = await questionsResponse.json();
            return { ...subCategory, questions };
          } catch (error) {
            console.error(`질문 로드 실패 - 하위 카테고리 ID: ${subCategory.id}`, error);
            return { ...subCategory, questions: [] };
          }
        }));

        return { ...category, subCategories: subCategoriesWithQuestions };
      }));

      if (categoriesWithQuestions.length > 0) {
        dispatch(setCurrentCategoryIndex(0));
        dispatch(setCurrentSubCategoryIndex(0));
        const firstSubCategoryId = categoriesWithQuestions[0].subCategories[0]?.id;
        if (firstSubCategoryId) {
          dispatch(fetchQuestions(firstSubCategoryId));
        }
      }

      return categoriesWithQuestions;
    } catch (error) {
      console.error('카테고리 페치 에러:', error);
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
      console.log('제출 데이터:', JSON.stringify(submissionData, null, 2));

      const response = await fetchWithAuth(`${SERVER_URL}api/survey/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('제출 오류 상태:', response.status);
        console.error('제출 오류 응답:', errorText);
        throw new Error(errorText || '제출 중 알 수 없는 오류가 발생했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('제출 전체 에러:', error);
      return rejectWithValue(error.message || '제출 중 오류 발생');
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
    filteredCategories: null,
  },
  reducers: {
    updateResponse: (state, action) => {
      const { questionId, value } = action.payload;
      const question = state.questions.find(q => q.id === questionId);

      if (!question) return;

      let isValid = true; // 기본적으로 유효하다고 가정

       switch (question.questionType) {
          case 'MULTIPLE_CHOICE':
            state.responses[questionId] = state.responses[questionId] || [];
            const optionId = parseInt(value, 10);
            const lastOptionIndex = question.options.length - 1;
            const lastOptionId = question.options[lastOptionIndex].id;

            if (optionId === lastOptionId) {
              // 마지막 옵션이 선택된 경우, 다른 모든 선택을 해제하고 마지막 옵션만 선택
              state.responses[questionId] = [lastOptionId];
            } else {
              const index = state.responses[questionId].indexOf(optionId);
              if (index > -1) {
                // 이미 선택된 옵션을 제거
                state.responses[questionId] = state.responses[questionId].filter(id => id !== optionId);
              } else {
                // 마지막 옵션이 선택되어 있다면 제거
                if (state.responses[questionId].includes(lastOptionId)) {
                  state.responses[questionId] = state.responses[questionId].filter(id => id !== lastOptionId);
                }
                // 새 옵션 추가
                if (question.questionText.includes('불편하거나 걱정되는 것') && state.responses[questionId].length >= 3) {
                  return;
                }
                state.responses[questionId].push(optionId);
              }
            }
            break;

        case 'SINGLE_CHOICE':
          state.responses[questionId] = parseInt(value, 10);
          break;

        case 'TEXT':
          state.responses[questionId] = value;
          break;
      }

      // 특별 처리가 필요한 질문 처리
        if (question.questionText === "성별을 알려주세요") {
          state.gender = parseInt(value, 10) === 1 ? '여성' : '남성';
        } else if (question.questionText.includes("불편하거나 걱정되는 것")) {
          state.selectedSymptoms = state.responses[questionId];
        }
    },
    setCurrentCategoryIndex: (state, action) => {
      state.currentCategoryIndex = action.payload;
      state.currentSubCategoryIndex = 0;
      state.questions = [];
      state.filteredSubCategories = null;
    },

    setCurrentSubCategoryIndex: (state, action) => {
      state.currentSubCategoryIndex = action.payload;
      state.questions = [];
    },

    clearResponses: (state) => {
      state.responses = {};
      state.gender = null;
      state.selectedSymptoms = [];
    },

    setFilteredSubCategories: (state, action) => {
      state.filteredSubCategories = action.payload;
    },

    setFilteredCategories: (state, action) => {
      state.filteredCategories = action.payload;
    }
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
  setFilteredSubCategories,
  setFilteredCategories
} = surveySlice.actions;

export default surveySlice.reducer;

