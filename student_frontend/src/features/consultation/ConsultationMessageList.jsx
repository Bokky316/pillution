import React from 'react';
import { List, ListItem, ListItemText, Typography, Avatar, Box } from '@mui/material';

const ConsultationMessageList = ({ messages, currentUserId }) => {
  if (!messages || messages.length === 0) {
    return <Typography>메시지가 없습니다.</Typography>;
  }

  return (
    <List>
      {messages.map((message) => (
        <ListItem key={message.id} sx={{ flexDirection: message.senderId === currentUserId ? 'row-reverse' : 'row' }}>
          <Avatar sx={{ bgcolor: message.senderId === currentUserId ? 'primary.main' : 'secondary.main' }}>
            {message.senderName ? message.senderName.charAt(0) : '?'}
          </Avatar>
          <Box sx={{ maxWidth: '70%', ml: 2, mr: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {message.senderName || '알 수 없는 사용자'}
            </Typography>
            <Typography variant="body1" sx={{
              bgcolor: message.senderId === currentUserId ? 'primary.light' : 'grey.200',
              p: 1,
              borderRadius: 1
            }}>
              {message.content}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {message.timestamp ? new Date(message.timestamp).toLocaleString() : '알 수 없는 시간'}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ConsultationMessageList;
