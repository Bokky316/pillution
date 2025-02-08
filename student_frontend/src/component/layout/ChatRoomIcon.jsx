import React, { useState } from 'react';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatRoom from '@/pages/chat/ChatRoom';

/**
 * 채팅방 아이콘 컴포넌트
 * 화면 우측 하단에 고정된 채팅 아이콘을 표시하고, 클릭 시 채팅방을 열 수 있습니다.
 */
const ChatRoomIcon = () => {
    // 채팅방 열림/닫힘 상태
    const [open, setOpen] = useState(false);

    /**
     * 채팅방 열기 핸들러
     */
    const handleOpen = () => setOpen(true);

    /**
     * 채팅방 닫기 핸들러
     */
    const handleClose = () => setOpen(false);

    return (
        <>
            {/* 채팅 아이콘 */}
            <Fab
                color="primary"
                aria-label="chat"
                onClick={handleOpen}
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
                <ChatIcon />
            </Fab>
            {/* 채팅방 컴포넌트 (조건부 렌더링) */}
            {open && <ChatRoom onClose={handleClose} />}
        </>
    );
};

export default ChatRoomIcon;
