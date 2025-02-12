import React from 'react';
import { Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import SurveyContent from '@/features/survey/SurveyContent';
import CategoryNavigation from '@/features/survey/CategoryNavigation';
import useSurveyData from '@hook/useSurveyData';
import useNavigation from '@hook/useNavigation';
import ProgressIndicator from '@/features/survey/ProgressIndicator';

const SurveyPage = () => {
  const navigate = useNavigate();

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
    filteredCategories,
    filteredSubCategories
  } = useSurveyData();

  const {
    handleResponseChange,
    handlePrevious,
    handleNext,
    isNextButtonDisabled
  } = useNavigation();

  // 닫기 버튼 클릭 시 메인 페이지로 이동
  const handleClose = () => {
    navigate('/'); // 메인 페이지 경로로 수정 필요
  };

  console.log("SurveyPage 렌더링");

  if (categoriesLoading || questionsLoading) {
    return <CircularProgress />;
  }

  if (categoriesError || questionsError) {
    return <Typography color="error">{categoriesError || questionsError}</Typography>;
  }

  if (!categories || categories.length === 0) {
    return <Typography>카테고리가 없습니다. 관리자에게 문의하세요.</Typography>;
  }

  if (currentCategoryIndex === null || currentSubCategoryIndex === null) {
    return <Typography>설문을 불러오는 중입니다...</Typography>;
  }

  const categoriesToUse = filteredCategories || categories;
  const currentCategory = categoriesToUse[currentCategoryIndex];
  const subCategoriesToDisplay = filteredSubCategories || currentCategory?.subCategories;
  const currentSubCategory = subCategoriesToDisplay?.[currentSubCategoryIndex];

  const isFirstCategory = currentCategoryIndex === 0 && currentSubCategoryIndex === 0;
  const isLastCategory = currentCategoryIndex === categoriesToUse.length - 1 &&
                         currentSubCategoryIndex === subCategoriesToDisplay.length - 1;

  return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* ProgressIndicator는 한 번만 렌더링 */}
        <ProgressIndicator
          categories={categoriesToUse}
          currentCategoryIndex={currentCategoryIndex}
          currentSubCategoryIndex={currentSubCategoryIndex}
          onPrevious={handlePrevious}
          onClose={handleClose}
        />



      <Box sx={{ flexGrow: 1 }}>
        <SurveyContent
          currentCategory={currentCategory}
          currentSubCategory={currentSubCategory}
          questions={questions}
          responses={responses}
          onResponseChange={handleResponseChange}
        />
      </Box>

      <Box sx={{
        marginTop: '20px',
        borderTop: '1px solid #ccc',
        paddingTop: '20px',
        position: 'sticky',
        bottom: '20px',
        backgroundColor: 'white',
        zIndex: 1
      }}>
        <CategoryNavigation
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          isNextButtonDisabled={isNextButtonDisabled()}
          isFirstCategory={isFirstCategory}
          isLastCategory={isLastCategory}
        />
      </Box>
    </Box>
  );
};

export default SurveyPage;
