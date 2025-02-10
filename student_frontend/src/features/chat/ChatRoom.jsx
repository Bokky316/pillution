import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, TextField, Button, MenuItem, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth } from "@features/auth/utils/fetchWithAuth";
import useAuth from "@hook/useAuth";

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [topic, setTopic] = useState("");
    const [isCounselorConnected, setIsCounselorConnected] = useState(false);
    const [isChatClosed, setIsChatClosed] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const { roomId } = useParams();
    const { user } = useAuth();
    const stompClientRef = useRef(null);

    const topicOptions = {
        "PRODUCT_INQUIRY": "상품 문의",
        "ORDER_ISSUE": "주문 문제",
        "DELIVERY_TRACKING": "배송 조회",
        "OTHER": "기타"
    };

    const connectWebSocket = useCallback(() => {
        if (!roomId) {
            console.error("🚨 WebSocket 연결 실패: roomId가 없습니다.");
            return;
        }

        const socket = new SockJS(`${SERVER_URL}ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(`🔍 WebSocket Debug: ${str}`),
            reconnectDelay: 5000,
            connectHeaders: {
                userId: user?.id || "",
            },
            onConnect: () => {
                console.log("📡 WebSocket 연결 성공!");
                client.subscribe(`/topic/chat/${roomId}`, (message) => {
                    const data = JSON.parse(message.body);
                    handleNewMessage(data);
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame.headers['message']);
                console.error("Additional details:", frame.body);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client.connected) {
                client.deactivate();
                console.log("WebSocket disconnected");
            }
        };
    }, [roomId, user]);

    const handleNewMessage = useCallback((data) => {
        setMessages(prevMessages => [...prevMessages, data]);
        if (data.status === "IN_PROGRESS") {
            setIsCounselorConnected(true);
            setIsChatClosed(false);
        } else if (data.status === "CLOSED") {
            setIsChatClosed(true);
            setIsCounselorConnected(false);
        }
    }, []);

    const handleSendMessage = useCallback(() => {
        if (!messageInput.trim() || !stompClientRef.current || !roomId) {
            console.error("🚨 메시지를 전송할 수 없습니다. roomId 또는 messageInput이 비어있습니다.");
            return;
        }

        stompClientRef.current.publish({
            destination: "/app/chat/send",
            body: JSON.stringify({
                chatRoomId: roomId,
                content: messageInput,
                senderId: user?.id || null,
                sentAt: new Date().toISOString(),
                isSystemMessage: false,
                isRead: false,
            }),
        });
        setMessageInput("");
    }, [roomId, user, messageInput]);

    const handleCloseChat = async () => {
        if (!roomId) return;

        try {
            const response = await fetchWithAuth(`${API_URL}chat/rooms/${roomId}/close`, { method: "POST" });
            if (response.ok) {
                setIsChatClosed(true);
                setIsCounselorConnected(false);
            } else {
                console.error("🚨 상담 종료 실패:", response.statusText);
                alert("상담 종료 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("🚨 상담 종료 실패:", error.message);
        }
    };

    useEffect(() => {
        const cleanup = connectWebSocket();
        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    }, [roomId, user, connectWebSocket]);

    const handleSelectTopic = (selectedTopic) => {
        setTopic(selectedTopic);
    };

    const getStatusMessage = () => {
        if (isChatClosed) return "상담이 종료되었습니다.";
        if (isCounselorConnected) return "상담사가 연결되었습니다.";
        return "상담사가 아직 연결되지 않았습니다.";
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
            <Paper elevation={3} sx={{ p: 2, bgcolor: '#4a4a4a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    {topic ? `1:1 채팅 상담 - ${topicOptions[topic]}` : "1:1 채팅 상담"}
                </Typography>
                {!isChatClosed && (
                    <Button variant="contained" color="secondary" onClick={() => setIsCloseDialogOpen(true)}>
                        종료하기
                    </Button>
                )}
            </Paper>

            <Typography variant="body1" color={isChatClosed ? "error" : isCounselorConnected ? "primary" : "textSecondary"} sx={{ p: 2, textAlign: 'center' }}>
                {getStatusMessage()}
            </Typography>

            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                {messages.map((msg, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start', mb: 1 }}>
                        <Paper elevation={1} sx={{
                            p: 1,
                            maxWidth: '70%',
                            bgcolor: msg.senderId === user?.id ? '#dcf8c6' : '#ffffff',
                            borderRadius: msg.senderId === user?.id ? '20px 20px 3px 20px' : '20px 20px 20px 3px'
                        }}>
                            <Typography variant="body2">{msg.content}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>

            {!isChatClosed && (
                <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="메시지를 입력하세요"
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    />
                    <Button
                        onClick={handleSendMessage}
                        variant="contained"
                        color="primary"
                        disabled={!messageInput.trim()}
                    >
                        전송
                    </Button>
                </Paper>
            )}

            <Dialog
                open={isCloseDialogOpen}
                onClose={() => setIsCloseDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"상담을 종료하시겠습니까?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        상담을 종료하면 채팅방에서 나가게 됩니다. 정말로 종료하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsCloseDialogOpen(false)}>취소</Button>
                    <Button
                        onClick={() => {
                            handleCloseChat();
                            setIsCloseDialogOpen(false);
                        }}
                        autoFocus
                    >
                        종료
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatRoom;
