import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  fetchCategories,
  fetchQuestions,
  submitSurvey,
  clearResponses,
} from '@/redux/surveySlice';
import SurveyContent from '@/features/survey/SurveyContent';
import CategoryNavigation from '@/features/survey/CategoryNavigation';

/**
 * 설문 페이지 컴포넌트
 * @returns {JSX.Element} SurveyPage 컴포넌트
 */
const SurveyPage = () => {
  const dispatch = useDispatch();

  // Redux 상태에서 필요한 데이터 추출
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
  } = useSelector((state) => state.survey);

  // 컴포넌트 마운트 시 카테고리 데이터 로드
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 현재 카테고리와 서브카테고리에 해당하는 질문 로드
  useEffect(() => {
    if (categories.length > 0 && currentCategoryIndex !== null && currentSubCategoryIndex !== null) {
      const subCategoryId = categories[currentCategoryIndex]?.subCategories[currentSubCategoryIndex]?.id;
      if (subCategoryId) {
        dispatch(fetchQuestions(subCategoryId));
      }
    }
  }, [dispatch, categories, currentCategoryIndex, currentSubCategoryIndex]);

  // 컴포넌트 언마운트 시 응답 초기화
  useEffect(() => {
    return () => {
      dispatch(clearResponses());
    };
  }, [dispatch]);

  // 로딩 중 표시
  if (categoriesLoading || questionsLoading) {
    return <CircularProgress />;
  }

  // 에러 표시
  if (categoriesError || questionsError) {
    return <Typography color="error">{categoriesError || questionsError}</Typography>;
  }

  // 카테고리가 없는 경우
  if (!categories || categories.length === 0) {
    return <Typography>카테고리가 없습니다. 관리자에게 문의하세요.</Typography>;
  }

  // 현재 카테고리 또는 서브카테고리 인덱스가 없는 경우
  if (currentCategoryIndex === null || currentSubCategoryIndex === null) {
    return <Typography>설문을 불러오는 중입니다...</Typography>;
  }

  const currentCategory = categories[currentCategoryIndex];
  const currentSubCategory = currentCategory?.subCategories[currentSubCategoryIndex];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* 설문 내용 */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: '80px' }}>
        <SurveyContent
          currentCategory={currentCategory}
          currentSubCategory={currentSubCategory}
          questions={questions}
          responses={responses}
        />
      </Box>

      {/* 하단 네비게이션 */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}
      >
        <CategoryNavigation />
      </Box>
    </Box>
  );
};

export default SurveyPage;
