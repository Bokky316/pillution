// @features/consultation/components/ConsultationStatusBadge.jsx
import React from 'react';
import { Chip } from '@mui/material';

const getStatusColor = (status) => {
  switch (status) {
    case 'WAITING':
      return 'warning';
    case 'ACTIVE':
      return 'success';
    case 'CLOSED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'WAITING':
      return '대기 중';
    case 'ACTIVE':
      return '상담 중';
    case 'CLOSED':
      return '종료됨';
    default:
      return '알 수 없음';
  }
};

const ConsultationStatusBadge = ({ status }) => {
  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      size="small"
    />
  );
};

export default ConsultationStatusBadge;
