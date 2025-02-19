import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Tabs, Tab } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { API_URL } from "@/utils/constants";
import { fetchWithAuth } from "@/features/auth/fetchWithAuth";
import "@/styles/MessageList.css";
import { showSnackbar } from "@/store/snackbarSlice";
import useWebSocket from "@/hooks/useWebSocket";
import {
    setMessages,
    setSentMessages,
    fetchSentMessages,
    fetchReceivedMessages,
    selectSentMessages,
    selectReceivedMessages,
    selectUnreadCount
} from "@/store/messageSlice";
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
    // Redux store에서 필요한 상태 가져오기
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const unreadCount = useSelector(selectUnreadCount);
    const sentMessages = useSelector(selectSentMessages);
    const receivedMessages = useSelector(selectReceivedMessages);
    const loading = useSelector(state => state.messages.loading);

    // 로컬 상태 관리
    const [currentTab, setCurrentTab] = useState(0);
    const [openSendMessageModal, setOpenSendMessageModal] = useState(false);
    const [openAdminMessageModal, setOpenAdminMessageModal] = useState(false);
    const [openMessageDetailModal, setOpenMessageDetailModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // 메시지 보내기 모달의 상태 초기화 함수
    const resetSendMessageModalState = () => {
        setOpenSendMessageModal(false); // 모달 닫기
        // 추가적으로 메시지 보내기 모달에서 필요한 상태 초기화는 SendMessageModal 내부에서 처리
    };

    // 관리자 공지 보내기 모달의 상태 초기화 함수
    const resetAdminMessageModalState = () => {
        setOpenAdminMessageModal(false); // 모달 닫기
        // 추가적으로 관리자 공지 보내기 모달에서 필요한 상태 초기화는 AdminMessageModal 내부에서 처리
    };

    // 웹소켓 훅 사용
    useWebSocket(user);

    // 컴포넌트 마운트 시 메시지 목록 가져오기
    useEffect(() => {
        if (user) {
            dispatch(fetchReceivedMessages(user.id));
            dispatch(fetchSentMessages(user.id));
        }
    }, [user, dispatch]);

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

    /**
     * 메시지 목록을 새로고침하는 함수
     */
    const refreshMessages = () => {
        dispatch(fetchReceivedMessages(user.id));
        dispatch(fetchSentMessages(user.id));
    };

    return (
            <Box sx={{ maxWidth: 800, margin: "auto", padding: 2 }}>
                <Box display="flex" justifyContent="center" width="100%" mb={2}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                        메시지 ({unreadCount})
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="flex-end" width="100%" mb={2}>
                    {isAdminOrCSAgent && (
                        <Button
                            variant="outlined"
                            onClick={() => setOpenSendMessageModal(true)}
                            sx={{
                                color: '#4169E1',
                                borderColor: '#4169E1',
                                '&:hover': {
                                    backgroundColor: 'rgba(65, 105, 225, 0.04)',
                                    borderColor: '#4169E1',
                                },
                                textTransform: 'none',
                                fontWeight: 500,
                                mr: 1
                            }}
                        >
                            메시지 보내기
                        </Button>
                    )}

                    {isAdmin && (
                        <Button
                            variant="contained"
                            onClick={() => setOpenAdminMessageModal(true)}
                            sx={{
                                backgroundColor: '#4169E1',
                                '&:hover': {
                                    backgroundColor: '#3a5fc8',
                                },
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            관리자 공지 보내기
                        </Button>
                    )}
                </Box>

                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            color: '#666',
                            '&.Mui-selected': {
                                color: '#4169E1',
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#4169E1',
                        },
                    }}
                >
                    <Tab label="받은 메시지" />
                    {isAdminOrCSAgent && <Tab label="보낸 메시지" />}
                </Tabs>

                <Box mt={2}>
                    {currentTab === 0 && (
                        <ReceivedMessages onOpenMessage={handleOpenMessage} messages={receivedMessages} />
                    )}

                    {currentTab === 1 && isAdminOrCSAgent && (
                        loading ? (
                            <Typography sx={{ textAlign: 'center', color: '#666', mt: 2 }}>로딩 중...</Typography>
                        ) : (
                            <SentMessages onOpenMessage={handleOpenMessage} sentMessages={sentMessages} />
                        )
                    )}
                </Box>

                <MessageDetailModal
                    open={openMessageDetailModal}
                    onClose={() => setOpenMessageDetailModal(false)}
                    message={selectedMessage}
                    isAdmin={isAdmin}
                    onReply={refreshMessages}
                />

                <SendMessageModal
                    open={openSendMessageModal}
                    onClose={resetSendMessageModalState}
                    onSend={refreshMessages}
                />

                {isAdmin && (
                    <AdminMessageModal
                        open={openAdminMessageModal}
                        onClose={resetAdminMessageModalState}
                        onSend={refreshMessages}
                    />
                )}
            </Box>
        );
    };

    export default MessageListPage;
