/**
 * @component ProgressIndicator
 * @description 설문 진행도를 표시하는 컴포넌트. 카테고리별 진행바와 현재 카테고리의 세부 진행도를 함께 표시
 */
import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, Close } from '@mui/icons-material';
import styled from '@emotion/styled';

const HeaderContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #EEEEEE;
`;

const ProgressContainer = styled(Box)`
  margin-top: 16px;
  margin-bottom: 24px;
`;

const ProgressBar = styled(Box)`
  display: flex;
  gap: 4px;
  width: 100%;
  margin-top: 8px;
`;

const CategorySegment = styled(Box)`
  flex: 1;
  height: 4px;
  background-color: #EEEEEE;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #FF5733;
  transition: width 0.3s ease;
`;

const ProgressIndicator = ({
  categories,
  currentCategoryIndex,
  currentSubCategoryIndex,
  onPrevious,
  onClose
}) => {
  // 현재 카테고리의 진행률 계산
  const calculateSubProgress = (categoryIndex) => {
    if (categoryIndex < currentCategoryIndex) return 100;
    if (categoryIndex > currentCategoryIndex) return 0;

    const currentCategory = categories[currentCategoryIndex];
    if (!currentCategory?.subCategories) return 0;

    const subCategoriesCount = currentCategory.subCategories.length;
    return ((currentSubCategoryIndex + 1) / subCategoriesCount) * 100;
  };

  return (
    <>
      <HeaderContainer>
        <IconButton onClick={onPrevious} size="large">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {categories[currentCategoryIndex]?.name || ''}
        </Typography>
        <IconButton onClick={onClose} size="large">
          <Close />
        </IconButton>
      </HeaderContainer>

      <ProgressContainer>
        <ProgressBar>
          {categories.map((_, index) => (
            <CategorySegment key={index}>
              <ProgressFill
                sx={{
                  width: `${calculateSubProgress(index)}%`,
                  backgroundColor: index <= currentCategoryIndex ? '#FF5733' : '#EEEEEE'
                }}
              />
            </CategorySegment>
          ))}
        </ProgressBar>
      </ProgressContainer>
    </>
  );
};

export default ProgressIndicator;