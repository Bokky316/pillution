/**
 * @component CategoryNavigation
 * @description 다음/제출 버튼을 포함한 하단 네비게이션 컴포넌트
 */
import React from 'react';
import { Button, Box } from '@mui/material';
import styled from '@emotion/styled';

const NavigationButton = styled(Button)`
  width: 17%;
  height: 38px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 24px;
  background-color: #333333;
  color: #FFFFFF;

  &:hover {
    background-color: #707070;
  }

  &:disabled {
    background-color: #CCCCCC;
    color: #FFFFFF;
  }
`;

const CategoryNavigation = ({
  handleNext,
  isNextButtonDisabled,
  isLastCategory
}) => {
  return (
    <Box sx={{
      position: 'sticky',
      bottom: 20,
      padding: '0 16px',
      backgroundColor: 'transparent', // 배경을 투명하게 변경
      zIndex: 10,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <NavigationButton
        variant="contained"
        onClick={handleNext}
        disabled={isNextButtonDisabled}
      >
        {isLastCategory ? '완료' : '다음'}
      </NavigationButton>
    </Box>
  );
};

export default CategoryNavigation;
