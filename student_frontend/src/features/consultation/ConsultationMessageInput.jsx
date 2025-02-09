// @features/consultation/components/ConsultationMessageInput.jsx
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ConsultationMessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, backgroundColor: 'background.paper' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="메시지를 입력하세요..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        sx={{ mr: 1 }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        endIcon={<SendIcon />}
        disabled={disabled || !message.trim()}
      >
        전송
      </Button>
    </Box>
  );
};

export default ConsultationMessageInput;
