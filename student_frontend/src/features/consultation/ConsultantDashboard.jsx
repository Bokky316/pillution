// @features/consultation/ConsultantDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { fetchConsultationRequests, acceptConsultationRequest } from '@/redux/consultationSlice';
import ConsultationChatRoom from './ConsultationChatRoom';

const ConsultantDashboard = () => {
  const dispatch = useDispatch();
  const { consultationRequests, currentRoom } = useSelector(state => state.consultation);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    dispatch(fetchConsultationRequests());
  }, [dispatch]);

  const handleAcceptRequest = (requestId) => {
    dispatch(acceptConsultationRequest(requestId));
    setSelectedRequest(requestId);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ width: '30%', borderRight: '1px solid #ccc', p: 2 }}>
        <Typography variant="h6">상담 요청 목록</Typography>
        <List>
          {consultationRequests.map((request) => (
            <ListItem
              key={request.id}
              button
              onClick={() => handleAcceptRequest(request.id)}
              selected={selectedRequest === request.id}
            >
              <ListItemText
                primary={request.userIssue}
                secondary={`요청 시간: ${new Date(request.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ width: '70%' }}>
        {currentRoom ? (
          <ConsultationChatRoom />
        ) : (
          <Typography sx={{ p: 2 }}>상담을 시작하려면 왼쪽에서 요청을 선택하세요.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ConsultantDashboard;
