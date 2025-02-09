import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import ConsultationChatRoom from '@features/consultation/ConsultationChatRoom';
import ConsultationWelcomeMessage from '@features/consultation/ConsultationWelcomeMessage';
import { initializeChat, fetchConsultationRequests, acceptConsultationRequest } from '@/redux/consultationSlice';

const ConsultationChatPage = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isInitialized, currentRoom, loading, error, consultationRequests } = useSelector(state => state.consultation || {});
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (user?.role === 'CONSULTANT') {
      dispatch(fetchConsultationRequests());
    } else {
      dispatch(initializeChat());
    }
  }, [dispatch, user]);

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await dispatch(acceptConsultationRequest(requestId)).unwrap();
      // 수락 후 채팅방으로 이동하는 로직
      setShowWelcome(false);
    } catch (error) {
      console.error('상담 요청 수락 실패:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ p: 2 }}>
        {user?.role === 'CONSULTANT' ? '상담 요청 목록' : '상담 채팅'}
      </Typography>
      {user?.role === 'CONSULTANT' && !currentRoom ? (
        consultationRequests?.length > 0 ? (
          consultationRequests.map(request => (
            <Box key={request.id} sx={{ p: 2, border: '1px solid #ddd', m: 2 }}>
              <Typography>요청 ID: {request.id}</Typography>
              <Button onClick={() => handleAcceptRequest(request.id)}>수락</Button>
            </Box>
          ))
        ) : (
          <Typography sx={{ p: 2 }}>대기 중인 상담 요청이 없습니다.</Typography>
        )
      ) : (
        <>
          {showWelcome && isInitialized ? (
            <ConsultationWelcomeMessage onStartChat={handleStartChat} />
          ) : (
            <ConsultationChatRoom />
          )}
        </>
      )}
      <Button onClick={onClose} sx={{ mt: 'auto', mb: 2 }}>닫기</Button>
    </Box>
  );
};

export default ConsultationChatPage;
