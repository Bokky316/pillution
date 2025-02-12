import React from 'react';
import { Box, Button } from '@mui/material';

/**
 * 카테고리 탐색 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @returns {JSX.Element} CategoryNavigation 컴포넌트
 */
const CategoryNavigation = ({ handlePrevious, handleNext }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button variant="contained" onClick={handlePrevious}>
        이전
      </Button>
      <Button variant="contained" onClick={handleNext}>
        다음
      </Button>
    </Box>
  );
};

export default CategoryNavigation;
