// @features/consultation/ConsultationChatRoom.jsx
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';
import { sendMessage, fetchMessages } from '@/redux/consultationSlice';
import ConsultationMessageList from '@features/consultation/ConsultationMessageList';
import ConsultationMessageInput from '@features/consultation/ConsultationMessageInput';
import useWebSocket from '@/hook/useWebSocket';

const ConsultationChatRoom = () => {
  const dispatch = useDispatch();
  const { currentRoom, messages, loading } = useSelector(state => state.consultation);
  const user = useSelector(state => state.auth.user);
  const bottomRef = useRef(null);

  // 웹소켓 연결
  const { sendMessage: sendWebSocketMessage } = useWebSocket(user);

  useEffect(() => {
    if (currentRoom) {
      dispatch(fetchMessages(currentRoom.id));
    }
  }, [dispatch, currentRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content) => {
    dispatch(sendMessage({ roomId: currentRoom.id, senderId: user.id, content }));
    // 웹소켓을 통해 메시지 전송
    sendWebSocketMessage('/app/chat.sendMessage', { roomId: currentRoom.id, senderId: user.id, content });
  };

  if (loading) return <CircularProgress />;
  if (!currentRoom) return <Typography>채팅방을 찾을 수 없습니다.</Typography>;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <ConsultationMessageList messages={messages} currentUserId={user.id} />
        <div ref={bottomRef} />
      </Box>
      <ConsultationMessageInput onSendMessage={handleSendMessage} />
    </Box>
  );
};

export default ConsultationChatRoom;
