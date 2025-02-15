// src/hooks/useSurveyData.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  fetchQuestions,
  clearResponses,
  setFilteredSubCategories,
  setFilteredCategories
} from '@/store/surveySlice';

const useSurveyData = () => {
  const dispatch = useDispatch();
  const {
    categories,
    currentCategoryIndex,
    currentSubCategoryIndex,
    questions,
    responses,
    categoriesLoading,
    questionsLoading,
    categoriesError,
    questionsError,
    gender,
    filteredSubCategories,
    selectedSymptoms,
    filteredCategories
  } = useSelector(state => state.survey);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const categoriesToUse = filteredCategories || categories;
    if (categoriesToUse.length > 0 && currentCategoryIndex !== null && currentSubCategoryIndex !== null) {
      const subCategoriesToUse = filteredSubCategories || categoriesToUse[currentCategoryIndex]?.subCategories;
      const subCategoryId = subCategoriesToUse?.[currentSubCategoryIndex]?.id;
      if (subCategoryId) {
        dispatch(fetchQuestions(subCategoryId));
      }
    }
  }, [dispatch, categories, filteredCategories, currentCategoryIndex, currentSubCategoryIndex, filteredSubCategories]);

  useEffect(() => {
    return () => {
      dispatch(clearResponses());
    };
  }, [dispatch]);

  useEffect(() => {
    const categoriesToUse = filteredCategories || categories;
    const currentCategory = categoriesToUse[currentCategoryIndex];

    if (gender) {
      const filteredCats = categoriesToUse.map(category => {
        if (category.name === "생활 습관") {
          const filteredSubCategories = category.subCategories.filter(sub => {
            if (gender === '여성' && sub.name === "여성건강") return true;
            if (gender === '남성' && sub.name === "남성건강") return true;
            return sub.name !== "여성건강" && sub.name !== "남성건강";
          });
          return { ...category, subCategories: filteredSubCategories };
        }
        return category;
      });
      dispatch(setFilteredCategories(filteredCats));
    } else {
      dispatch(setFilteredCategories(null));
    }

    if (currentCategory?.name === "증상·불편" && selectedSymptoms.length > 0) {
      const symptomQuestion = currentCategory.subCategories
        .find(sub => sub.name === "주요 증상")
        ?.questions[0];

      if (symptomQuestion) {
        const filteredSubs = currentCategory.subCategories.filter(sub => {
          if (sub.name === "주요 증상" || sub.name === "추가 증상") {
            return true;
          }
          return selectedSymptoms.some(symptomId => {
            const symptomOption = symptomQuestion.options
              .find(opt => opt.id === parseInt(symptomId, 10));
            return symptomOption && sub.name.toLowerCase().includes(symptomOption.optionText.toLowerCase());
          });
        });

        if (filteredSubs.length > 0) {
          dispatch(setFilteredSubCategories(filteredSubs));
        } else {
          dispatch(setFilteredSubCategories(null));
        }
      }
    } else {
      dispatch(setFilteredSubCategories(null));
    }
  }, [categories, currentCategoryIndex, selectedSymptoms, gender, dispatch]);

  return {
    categories,
    currentCategoryIndex,
    currentSubCategoryIndex,
    questions,
    responses,
    categoriesLoading,
    questionsLoading,
    categoriesError,
    questionsError,
    gender,
    filteredSubCategories,
    selectedSymptoms,
    filteredCategories
  };
};

export default useSurveyData;
