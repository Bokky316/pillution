// @features/consultation/ConsultationWelcomeMessage.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const ConsultationWelcomeMessage = ({ onStartChat }) => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        상담이 필요하신가요?
      </Typography>
      <Typography variant="body1" paragraph>
        저희 상담사들이 친절하게 도와드리겠습니다. 지금 바로 시작해보세요!
      </Typography>
      <Button variant="contained" color="primary" onClick={onStartChat}>
        상담 시작하기
      </Button>
    </Box>
  );
};

export default ConsultationWelcomeMessage;
