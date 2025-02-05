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

export const setFilteredCategories = createAction('survey/setFilteredCategories');

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
    filteredCategories: null,
  },
  reducers: {
      updateResponse: (state, action) => {
        const { questionId, answer } = action.payload;
        const question = state.questions.find(q => q.id === questionId);

        if (question && question.questionText === "성별을 알려주세요") {
          state.gender = answer === '1' ? 'female' : 'male';
          console.log('선택된 성별:', state.gender);

          // 성별 선택 시 즉시 카테고리 필터링
          if (state.categories.length > 0) {
            const filteredCategories = state.categories.map(category => {
              if (category.name === "3. 생활 습관") {
                const filteredSubCategories = category.subCategories.filter(sub => {
                  if (state.gender === 'female' && sub.name === "남성건강") return false;
                  if (state.gender === 'male' && sub.name === "여성건강") return false;
                  return true;
                });
                return { ...category, subCategories: filteredSubCategories };
              }
              return category;
            });
            state.filteredCategories = filteredCategories;
          }
        }

      if (question.questionType === 'MULTIPLE_CHOICE') {
        let selectedOptions = [...(state.responses[questionId] || [])];
        const lastOptionIndex = question.options.length - 1;
        const lastOptionId = question.options[lastOptionIndex].id.toString();

        const isSymptomQuestion =
          question.questionText.includes('주요 증상') ||
          question.questionText.includes('불편하거나 걱정되는 것');

        if (answer === lastOptionId) {
          selectedOptions = selectedOptions.includes(lastOptionId) ? [] : [lastOptionId];
        } else {
          if (selectedOptions.includes(lastOptionId)) {
            selectedOptions = [];
          }

          const index = selectedOptions.indexOf(answer);
          if (index > -1) {
            selectedOptions.splice(index, 1);
          } else {
            if (isSymptomQuestion && selectedOptions.length >= 3) {
              return;
            }
            selectedOptions.push(answer);
          }
        }

        state.responses[questionId] = selectedOptions;

        if (isSymptomQuestion) {
          state.selectedSymptoms = selectedOptions;
        }
      } else if (question.questionType === 'SINGLE_CHOICE') {
        state.responses[questionId] = answer;
      } else if (question.questionType === 'TEXT') {
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

    [setFilteredCategories]: (state, action) => {
        state.filteredCategories = action.payload;
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

    setFilteredSubCategories: (state, action) => {
      state.filteredSubCategories = action.payload;
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