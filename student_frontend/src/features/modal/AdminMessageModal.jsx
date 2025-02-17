import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const AdminMessageModal = ({ open, onClose, onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    onSend(message);
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>관리자 메시지 전송</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="메시지"
          type="text"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSend}>전송</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminMessageModal;
