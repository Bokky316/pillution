import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@features/auth/utils/fetchWithAuth';
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

export const setFilteredSubCategories = createAction(
  'survey/setFilteredSubCategories',
  (subCategories) => ({ payload: subCategories })
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
    relatedQuestions: [],
  },
  reducers: {
    // surveySlice.js의 updateResponse reducer 수정
    updateResponse: (state, action) => {
      const { questionId, answer } = action.payload;
      const question = state.questions.find(q => q.id === questionId);

      if (!question) return;

      // 성별 설정 처리 (questionId: 2)
      if (questionId === 2) {
        state.gender = answer === '1' ? 'female' : 'male';
        state.responses[questionId] = answer;
        return;
      }

      // SINGLE_CHOICE 처리
      if (question.questionType === 'SINGLE_CHOICE') {
        state.responses[questionId] = answer;
        return;
      }

      // MULTIPLE_CHOICE 처리
      if (question.questionType === 'MULTIPLE_CHOICE') {
        let selectedOptions = state.responses[questionId] || [];
        const lastOptionIndex = question.options.length - 1;
        const lastOptionId = question.options[lastOptionIndex].id.toString();
        const isLastOption = answer === lastOptionId;

        // 주요 증상 질문인지 확인
        const isMainSymptomQuestion =
          question.questionText.includes('주요 증상') ||
          question.questionText.includes('불편하거나 걱정되는 것');

        if (isLastOption) {
          // '선택할 것 없음' 옵션 처리
          state.responses[questionId] = selectedOptions.includes(lastOptionId) ? [] : [lastOptionId];
          if (isMainSymptomQuestion) {
            state.selectedSymptoms = [];
          }
        } else {
          if (selectedOptions.includes(lastOptionId)) {
            // 다른 옵션 선택 시 '선택할 것 없음' 제거
            selectedOptions = [answer];
          } else {
            const index = selectedOptions.indexOf(answer);
            if (index > -1) {
              // 이미 선택된 옵션 제거
              selectedOptions.splice(index, 1);
            } else {
              // 주요 증상 질문이면 최대 3개까지만 선택 가능
              if (isMainSymptomQuestion && selectedOptions.length >= 3) {
                return;
              }
              selectedOptions.push(answer);
            }
          }
          state.responses[questionId] = selectedOptions;

          // 주요 증상 질문인 경우 selectedSymptoms 업데이트
          if (isMainSymptomQuestion) {
            state.selectedSymptoms = selectedOptions;
          }
        }
      }

      // TEXT 타입 처리
      if (question.questionType === 'TEXT') {
        state.responses[questionId] = answer;
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
    },

    filterSubCategories: (state, action) => {
      const selectedSymptoms = action.payload;
      const currentCategory = state.categories[state.currentCategoryIndex];
      if (currentCategory && currentCategory.name === "2. 증상·불편") {
        state.filteredSubCategories = currentCategory.subCategories.filter(sub =>
          sub.name === "주요 증상" ||
          sub.name === "추가 증상" ||
          selectedSymptoms.includes(sub.id.toString())
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