import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress, Button, List, ListItem, ListItemText } from '@mui/material';
import ConsultationChatRoom from '@features/consultation/ConsultationChatRoom';
import { fetchChatRooms, setCurrentRoom, initializeChat } from '@/redux/consultationSlice';

const ConsultationChatPage = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { chatRooms, currentRoom, loading, error } = useSelector(state => state.consultation);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    dispatch(setCurrentRoom(room));
  };

  const handleNewChat = () => {
    dispatch(initializeChat());
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ p: 2 }}>상담 채팅</Typography>
      {!selectedRoom ? (
        <>
          <Button onClick={handleNewChat} sx={{ m: 2 }}>새 상담 시작</Button>
          <List>
            {chatRooms.map((room) => (
              <ListItem button key={room.id} onClick={() => handleRoomSelect(room)}>
                <ListItemText
                  primary={room.name || `상담 ${room.id}`}
                  secondary={`마지막 메시지: ${room.lastMessage || '없음'}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <ConsultationChatRoom room={selectedRoom} />
      )}
      <Button onClick={() => {
        setSelectedRoom(null);
        dispatch(setCurrentRoom(null));
      }} sx={{ mt: 2 }}>
        목록으로 돌아가기
      </Button>
      <Button onClick={onClose} sx={{ mt: 'auto', mb: 2 }}>닫기</Button>
    </Box>
  );
};

export default ConsultationChatPage;
