import React from 'react';
import { Button, Box } from '@mui/material';

/**
 * @카테고리 탐색 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.handlePrevious - 이전 버튼 클릭 핸들러
 * @param {Function} props.handleNext - 다음 버튼 클릭 핸들러
 * @param {boolean} props.isNextButtonDisabled - 다음 버튼 활성화 여부
 * @param {boolean} props.isFirstCategory - 첫 번째 카테고리 여부
 * @param {boolean} props.isLastCategory - 마지막 카테고리 여부
 * @returns {JSX.Element} CategoryNavigation 컴포넌트
 */
const CategoryNavigation = ({ handlePrevious, handleNext, isNextButtonDisabled, isFirstCategory, isLastCategory }) => {
  console.log("CategoryNavigation 렌더링"); // 이 로그가 출력되는지 확인
  console.log("isFirstCategory:", isFirstCategory);
  console.log("isLastCategory:", isLastCategory);
  console.log("isNextButtonDisabled:", isNextButtonDisabled);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Button
        variant="contained"
        onClick={handlePrevious}
        disabled={isFirstCategory}
      >
        이전
      </Button>
      <Button
        variant="contained"
        onClick={handleNext}
        disabled={isNextButtonDisabled}
      >
        {isLastCategory ? '제출' : '다음'}
      </Button>
    </Box>
  );
};

export default CategoryNavigation;
