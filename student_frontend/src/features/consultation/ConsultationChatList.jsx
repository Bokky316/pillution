// @features/consultation/components/ConsultationChatList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Button, Box } from '@mui/material';
import { fetchChatRooms, setCurrentRoom } from '@/redux/consultationSlice';
import { useNavigate } from 'react-router-dom';
import ConsultationStatusBadge from './ConsultationStatusBadge';

const ConsultationChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatRooms, loading } = useSelector(state => state.consultation);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  const handleRoomClick = (room) => {
    dispatch(setCurrentRoom(room));
    navigate(`/consultation/chat/${room.id}`);
  };

  const handleNewConsultation = () => {
    navigate('/consultation/request');
  };

  if (loading) {
    return <Typography>Loading chat rooms...</Typography>;
  }

  return (
    <Box>
      <Button variant="contained" color="primary" onClick={handleNewConsultation} sx={{ mb: 2 }}>
        새 상담 요청
      </Button>
      <List>
        {chatRooms.map((room) => (
          <ListItem
            key={room.id}
            button
            onClick={() => handleRoomClick(room)}
            sx={{
              mb: 1,
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <ListItemAvatar>
              <Avatar>{room.consultant ? room.consultant.name.charAt(0) : '?'}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={room.name}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {room.lastMessage ? room.lastMessage.content : '새로운 상담'}
                  </Typography>
                  {" — " + (room.lastMessage ? new Date(room.lastMessage.timestamp).toLocaleString() : '시작되지 않음')}
                </>
              }
            />
            <ConsultationStatusBadge status={room.status} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ConsultationChatList;
