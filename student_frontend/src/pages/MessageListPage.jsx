import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Tabs, Tab } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import "@/styles/MessageList.css";
import { showSnackbar } from "@/store/snackbarSlice";
import useWebSocket from "@/hooks/useWebSocket";
import { setMessages, setSentMessages, fetchSentMessages } from "@/store/messageSlice";
import ReceivedMessages from "@/features/message/ReceivedMessages";
import SentMessages from "@/features/message/SentMessages";
import MessageDetailModal from "@/features/modal/MessageDetailModal";
import SendMessageModal from "@/features/modal/SendMessageModal";
import AdminMessageModal from "@/features/modal/AdminMessageModal";

/**
 * MessageListPage 컴포넌트
 * 메시지 목록을 관리하고 표시하는 메인 페이지 컴포넌트
 * @returns {JSX.Element} MessageListPage 컴포넌트
 */
const MessageListPage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const unreadCount = useSelector(state => state.messages.unreadMessages.length);

    const [currentTab, setCurrentTab] = useState(0);
    const [openSendMessageModal, setOpenSendMessageModal] = useState(false);
    const [openAdminMessageModal, setOpenAdminMessageModal] = useState(false);
    const [openMessageDetailModal, setOpenMessageDetailModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    useWebSocket(user);

    useEffect(() => {
        if (user) {
            fetchMessages();
            dispatch(fetchSentMessages(user.id));
        }
    }, [user, dispatch]);

    /**
     * 받은 메시지 목록을 가져오는 함수
     */
    const fetchMessages = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}messages/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setMessages(data));
            }
        } catch (error) {
            console.error("🚨 메시지 목록 조회 실패:", error.message);
        }
    };

    /**
     * 메시지 상세 보기 모달을 여는 함수
     * @param {Object} message - 선택된 메시지 객체
     */
    const handleOpenMessage = (message) => {
        setSelectedMessage(message);
        setOpenMessageDetailModal(true);
    };

    // 관리자 또는 상담사 권한 확인
    const isAdminOrCSAgent = user && (user.role === 'ADMIN' || user.role === 'CS_AGENT');

    // 관리자 권한 확인
    const isAdmin = user && user.role === 'ADMIN';

    return (
        <div className="data-grid-container">
            <Box display="flex" justifyContent="center" width="100%" mb={2}>
                <Typography variant="h4" gutterBottom>
                    메시지 ({unreadCount})
                </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" width="100%" mb={1}>
                {isAdminOrCSAgent && (
                    <Button variant="contained" color="primary" onClick={() => setOpenSendMessageModal(true)}>
                        메시지 보내기
                    </Button>
                )}

                {isAdmin && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setOpenAdminMessageModal(true)}
                        style={{ marginLeft: "10px" }}
                    >
                        관리자 공지 보내기
                    </Button>
                )}
            </Box>

            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                <Tab label="받은 메시지" />
                {isAdminOrCSAgent && <Tab label="보낸 메시지" />}
            </Tabs>

            {currentTab === 0 && (
                <ReceivedMessages onOpenMessage={handleOpenMessage} />
            )}

            {currentTab === 1 && isAdminOrCSAgent && (
                <SentMessages onOpenMessage={handleOpenMessage} />
            )}

            <MessageDetailModal
                open={openMessageDetailModal}
                onClose={() => setOpenMessageDetailModal(false)}
                message={selectedMessage}
                isAdmin={isAdmin}
                onReply={fetchMessages}
            />

            <SendMessageModal
                open={openSendMessageModal}
                onClose={() => setOpenSendMessageModal(false)}
                onSend={fetchMessages}
            />

            {isAdmin && (
                <AdminMessageModal
                    open={openAdminMessageModal}
                    onClose={() => setOpenAdminMessageModal(false)}
                    onSend={fetchMessages}
                />
            )}
        </div>
    );
};

export default MessageListPage;
