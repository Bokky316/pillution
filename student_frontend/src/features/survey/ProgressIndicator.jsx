/**
 * @component ProgressIndicator
 * @description 설문 카테고리별 진행도를 표시하는 컴포넌트.
 * 상단에 가로로 늘어선 진행도 바를 표시하며, 현재 카테고리까지는 주황색, 나머지는 회색으로 표시합니다.
 *
 * @param {Object} props
 * @param {Array} props.categories - 전체 카테고리 배열
 * @param {number} props.currentCategoryIndex - 현재 선택된 카테고리 인덱스
 * @returns {JSX.Element}
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';

// 진행도 바 컨테이너
const ProgressContainer = styled(Box)`
  margin-top: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 진행도 바
const ProgressBar = styled(Box)`
  width: 100%;
  display: flex;
  gap: 2px;
`;

// 진행도 세그먼트
const ProgressSegment = styled(Box)`
  flex: 1;
  height: 2px;
  background-color: ${props => props.isActive ? '#FF5733' : '#E0E0E0'};
  transition: background-color 0.3s ease;
`;

const ProgressIndicator = ({ categories, currentCategoryIndex }) => {
  return (
    <ProgressContainer>
      {/* 현재 카테고리 위치 텍스트 */}
      <Typography
        sx={{
          fontSize: '14px',
          color: '#666',
          mb: 1
        }}
      >
        {`${categories.length}개 중 ${currentCategoryIndex + 1}번째 카테고리`}
      </Typography>

      {/* 진행도 바 */}
      <ProgressBar>
        {categories.map((_, index) => (
          <ProgressSegment
            key={index}
            isActive={index <= currentCategoryIndex}
          />
        ))}
      </ProgressBar>
    </ProgressContainer>
  );
};

export default ProgressIndicator;