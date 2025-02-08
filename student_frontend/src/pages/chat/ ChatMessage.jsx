import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

/**
 * ChatMessage 컴포넌트
 *
 * 이 컴포넌트는 개별 채팅 메시지를 표시합니다.
 *
 * @param {Object} props
 * @param {Object} props.message - 메시지 객체
 * @param {boolean} props.isCurrentUser - 현재 사용자의 메시지인지 여부
 */
const ChatMessage = ({ message, isCurrentUser }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      {!isCurrentUser && (
        <Avatar
          alt={message.senderName}
          src={message.senderAvatar}
          sx={{ width: 32, height: 32, mr: 1 }}
        />
      )}
      <Box
        sx={{
          maxWidth: '70%',
          p: 1,
          borderRadius: 2,
          bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
        }}
      >
        {!isCurrentUser && (
          <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 1 }}>
            {message.senderName}
          </Typography>
        )}
        <Typography variant="body2">{message.content}</Typography>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
