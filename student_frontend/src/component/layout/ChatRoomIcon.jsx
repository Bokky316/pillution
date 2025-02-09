import React, { useState, useEffect } from 'react';
import { Fab, Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatRoom from '@/pages/chat/ChatRoom';
import { useSelector } from 'react-redux';

const ChatRoomIcon = () => {
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messages = useSelector(state => state.chat.messages);

    useEffect(() => {
        if (Array.isArray(messages)) {
            const count = messages.filter(msg => msg?.isRead === false).length;
            setUnreadCount(count);
        }
    }, [messages]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Badge
                badgeContent={unreadCount}
                color="error"
                role="status"
                aria-label={`${unreadCount}개의 읽지 않은 메시지가 있습니다`}
                sx={{
                    '& .MuiBadge-badge': {
                        right: 30,
                        top: 15
                    }
                }}
            >
                <Fab
                    color="primary"
                    aria-label="채팅 열기"
                    onClick={handleOpen}
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                >
                    <ChatIcon />
                </Fab>
            </Badge>
            {open && <ChatRoom onClose={handleClose} />}
        </>
    );
};

export default ChatRoomIcon;
